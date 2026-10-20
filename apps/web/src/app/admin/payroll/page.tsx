"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ATT_LABEL,
  PAYROLL_RULES,
  ADMISSION_CENTRES,
  fmtDate,
  inr,
  isWeeklyOff,
  monthDates,
  monthLabel,
  runTotals,
  shiftMonth,
  todayIST,
  type AttRecord,
  type AttStatus,
  type Holiday,
  type PayLine,
  type PayRun,
  type PayrollSettings,
  type SalarySetup,
  type Staff,
} from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Avatar } from "@/components/dashboard/art";
import { Btn, Card, DataGrid, Field, Figure, Modal, PageHeader, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { downloadCsv } from "@/components/admin/store";

interface Data {
  month: string;
  today: string;
  staff: Staff[];
  setup: Record<string, SalarySetup>;
  settings: PayrollSettings;
  holidays: Holiday[];
  attendance: Record<string, Record<string, AttRecord>>;
  run: PayRun | null;
  recent: { staffId: string; at: string; source: string; device?: string }[];
  unmatched: { userId: string; at: string; device?: string }[];
}

type Tab = "attendance" | "run" | "setup" | "punches" | "holidays";

const CYCLE: (AttStatus | null)[] = [null, "P", "WFH", "HD", "PL", "A"];
const CODE: Record<AttStatus, string> = { P: "P", WFH: "W", HD: "½", PL: "L", A: "A" };
const CELL: Record<AttStatus, string> = {
  P: "bg-[#E4F5E4] text-[#0A7F0A]",
  WFH: "bg-[#E3EEFB] text-[#1F5FA8]",
  HD: "bg-[#FFF3D6] text-[#8A5A00]",
  PL: "bg-[#EDE6F8] text-[#5B3FA0]",
  A: "bg-[#FBE5E5] text-[#B42E2E]",
};
const RUN_TONE = { Draft: "warning", Locked: "info", Paid: "good" } as const;

export default function PayrollPage() {
  const [month, setMonth] = useState(todayIST().slice(0, 7));
  const [tab, setTab] = useState<Tab>("attendance");
  const [d, setD] = useState<Data | null>(null);
  const [toast, show] = useToast();

  const load = useCallback(async () => {
    const r = await fetch(`/api/payroll?month=${month}`, { cache: "no-store" });
    if (r.ok) setD(await r.json());
  }, [month]);
  useEffect(() => {
    setD(null);
    load();
  }, [load]);

  const act = useCallback(
    async (body: Record<string, unknown>, ok?: string) => {
      const r = await fetch("/api/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month, ...body }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        show(j.error ?? "Something went wrong");
        return null;
      }
      if (ok) show(ok.replace("{n}", String(j.marked ?? "")));
      await load();
      return j;
    },
    [month, load, show],
  );

  const run = d?.run ?? null;
  const locked = !!run && run.status !== "Draft";

  return (
    <AdminShell>
      <PageHeader title="Payroll & Attendance" sub="Mark attendance, run monthly payroll, publish payslips and export the bank transfer file">
        <div className="flex items-center gap-1 rounded-xl border border-[#E2ECE9] bg-white p-1">
          <button className="rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[#F1F7F5]" onClick={() => setMonth(shiftMonth(month, -1))} aria-label="Previous month">‹</button>
          <span className="min-w-[130px] text-center text-[13.5px] font-semibold text-brand-ink">{monthLabel(month)}</span>
          <button className="rounded-lg px-2.5 py-1.5 text-[13px] hover:bg-[#F1F7F5]" onClick={() => setMonth(shiftMonth(month, 1))} aria-label="Next month">›</button>
        </div>
      </PageHeader>

      <div className="mb-4">
        <Segmented<Tab>
          label="Section"
          value={tab}
          onChange={setTab}
          options={[
            { value: "attendance", label: "Attendance" },
            { value: "run", label: `Payroll run${run ? ` · ${run.status}` : ""}` },
            { value: "setup", label: "Salary setup" },
            { value: "punches", label: "Biometric & punches" },
            { value: "holidays", label: "Holidays" },
          ]}
        />
      </div>

      {!d ? (
        <p className="py-10 text-center text-[#7B8E89]">Loading…</p>
      ) : tab === "attendance" ? (
        <AttendanceTab d={d} month={month} locked={locked} act={act} />
      ) : tab === "run" ? (
        <RunTab d={d} month={month} act={act} />
      ) : tab === "setup" ? (
        <SetupTab d={d} act={act} />
      ) : tab === "punches" ? (
        <PunchesTab d={d} act={act} />
      ) : (
        <HolidaysTab d={d} month={month} locked={locked} act={act} />
      )}
      <Toast msg={toast} />
    </AdminShell>
  );
}

type Act = (body: Record<string, unknown>, ok?: string) => Promise<{ ok?: boolean; marked?: number } | null>;

/* ───────────── Attendance ───────────── */

function AttendanceTab({ d, month, locked, act }: { d: Data; month: string; locked: boolean; act: Act }) {
  const dates = useMemo(() => monthDates(month), [month]);
  const hol = useMemo(() => new Map(d.holidays.map((h) => [h.date, h.name])), [d.holidays]);
  const [bulk, setBulk] = useState(d.today.startsWith(month) ? d.today : dates[0]);

  const cycle = (staffId: string, date: string) => {
    const cur = d.attendance[staffId]?.[date]?.status ?? null;
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    act({ action: "attendance", entries: [{ staffId, date, status: next }] });
  };

  const today = new Date().toISOString().slice(0, 10);
  void today;

  return (
    <>
      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[12.5px]">
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(CODE) as AttStatus[]).map((s) => (
              <span key={s} className={`rounded-md px-2 py-1 font-semibold ${CELL[s]}`}>{CODE[s]} {ATT_LABEL[s]}</span>
            ))}
            <span className="rounded-md bg-[#F1F5F4] px-2 py-1 text-[#6b807b]">– Weekly off / holiday (paid)</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <input type="date" className={inputCls + " !h-9 !w-auto"} value={bulk} min={dates[0]} max={dates[dates.length - 1]} onChange={(e) => setBulk(e.target.value)} />
            <Btn variant="ghost" icon="check" disabled={locked} onClick={() => act({ action: "markAllPresent", date: bulk }, "Marked {n} unmarked staff present")}>Mark all present</Btn>
          </div>
        </div>
        <p className="mb-3 text-[12px] text-[#6b807b]">
          Click a cell to cycle Present → WFH → Half day → Paid leave → Absent → clear. Days punched on the Matrix biometric device fill in automatically (hover a cell to see the punch times); a dot on a cell means punch-in with no punch-out yet. Past working days left unmarked are treated as <b>absent (loss of pay)</b> when payroll is generated.
          {locked && <b className="text-[#B42E2E]"> This month&apos;s payroll is locked; re-open it to edit attendance.</b>}
        </p>
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-0 text-[12px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 min-w-[190px] bg-white px-2 py-2 text-left font-semibold text-[#6b807b]">Employee</th>
                {dates.map((dt) => (
                  <th key={dt} className={`min-w-[30px] px-0.5 py-1 text-center font-medium ${isWeeklyOff(dt) || hol.has(dt) ? "text-[#a9b8b4]" : "text-[#41564f]"}`} title={hol.get(dt)}>
                    <span className="block">{Number(dt.slice(8))}</span>
                    <span className="block text-[9.5px]">{["S", "M", "T", "W", "T", "F", "S"][new Date(`${dt}T00:00:00Z`).getUTCDay()]}</span>
                  </th>
                ))}
                <th className="px-2 text-right font-semibold text-[#6b807b]">Present</th>
                <th className="px-2 text-right font-semibold text-[#6b807b]">Absent</th>
              </tr>
            </thead>
            <tbody>
              {d.staff.filter((s) => s.active !== false).map((s) => {
                const rec = d.attendance[s.id] ?? {};
                const vals = Object.values(rec);
                const pres = vals.filter((r) => r.status === "P" || r.status === "WFH").length + vals.filter((r) => r.status === "HD").length * 0.5;
                const abs = vals.filter((r) => r.status === "A").length;
                return (
                  <tr key={s.id} className="hover:bg-[#FAFCFB]">
                    <td className="sticky left-0 z-10 bg-white px-2 py-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={s.name} size={26} />
                        <span><span className="block font-semibold text-brand-ink">{s.name}</span><span className="block text-[10.5px] text-[#6b807b]">{s.id}</span></span>
                      </div>
                    </td>
                    {dates.map((dt) => {
                      const off = isWeeklyOff(dt) || hol.has(dt);
                      const before = dt < s.joined;
                      const r = rec[dt];
                      if (off || before) return <td key={dt} className="px-0.5 py-0.5 text-center text-[#c4d0cc]">{before ? "·" : "–"}</td>;
                      const tip = r ? `${ATT_LABEL[r.status]}${r.in ? ` · in ${new Date(r.in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}${r.out ? ` · out ${new Date(r.out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}${r.by.startsWith("punch") ? ` · biometric/punch (${r.by.slice(6) || "device"})` : r.by ? ` · marked by ${r.by}` : ""}${r.open ? " · no punch-out" : ""}` : "Unmarked";
                      return (
                        <td key={dt} className="px-0.5 py-0.5 text-center">
                          <button
                            title={tip}
                            disabled={locked}
                            onClick={() => cycle(s.id, dt)}
                            className={`h-7 w-7 rounded-md font-semibold transition disabled:cursor-not-allowed ${r ? CELL[r.status] : "border border-dashed border-[#d5e2de] text-transparent hover:border-brand-teal"}`}
                          >
                            {r ? CODE[r.status] : "·"}{r?.open && <span className="ml-px align-top text-[8px] text-[#B42E2E]">●</span>}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 text-right font-semibold text-brand-ink">{pres}</td>
                    <td className="px-2 text-right font-semibold text-[#B42E2E]">{abs}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

/* ───────────── Payroll run ───────────── */

function RunTab({ d, month, act }: { d: Data; month: string; act: Act }) {
  const run = d.run;
  const [adj, setAdj] = useState<PayLine | null>(null);
  const [paying, setPaying] = useState(false);

  if (!run)
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-[15px] font-semibold text-brand-ink">No payroll generated for {monthLabel(month)} yet</p>
          <p className="mx-auto mt-1 max-w-md text-[13px] text-[#6b807b]">It calculates pay from the attendance you marked: loss of pay for absent and unmarked days, PF, ESI and professional tax. You can review and add bonuses or deductions before locking.</p>
          <div className="mt-4 flex justify-center"><Btn icon="check" onClick={() => act({ action: "generate" }, "Payroll generated")}>Generate payroll</Btn></div>
        </div>
      </Card>
    );

  const t = runTotals(run.lines);
  const unmarked = run.lines.reduce((a, l) => a + l.unmarked, 0);
  const draft = run.status === "Draft";

  const register = () =>
    downloadCsv(
      `payroll-${month}.csv`,
      ["Emp ID", "Name", "Dept", "Monthly gross", "Payable days", "LOP days", "Basic", "HRA", "Special", "Bonus", "Gross earned", "PF", "ESI", "PT", "TDS", "Other deduction", "Net pay", "Note"],
      run.lines.map((l) => [l.staffId, l.name, l.dept, l.ctc, l.payableDays, l.lopDays, l.basic, l.hra, l.special, l.bonus, l.gross, l.pf, l.esi, l.pt, l.tds, l.otherDeduction, l.net, l.note]),
    );
  const bank = () => {
    const missing = run.lines.filter((l) => l.net > 0 && (!l.account || !l.ifsc)).map((l) => l.name);
    if (missing.length && !window.confirm(`Bank details are missing for: ${missing.join(", ")}.\nThey will be exported with blank account numbers. Continue?`)) return;
    downloadCsv(`bank-transfer-${month}.csv`, ["Beneficiary name", "Account number", "IFSC", "Bank", "Amount", "Narration"], run.lines.filter((l) => l.net > 0).map((l) => [l.name, l.account ?? "", l.ifsc ?? "", l.bank ?? "", l.net, `Salary ${monthLabel(month)}`]));
  };

  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Employees" value={String(t.people)} sub={`${run.status} · ${monthLabel(month)}`} icon="users" />
        <Figure label="Gross earned" value={inr(t.gross)} sub="After loss of pay, with bonuses" icon="rupee" />
        <Figure label="Deductions" value={inr(t.deductions)} sub={`PF ${inr(t.pf)} + ESI, PT, TDS, others`} icon="card" />
        <Figure label="Net payable" value={inr(t.net)} sub={run.status === "Paid" && run.paidOn ? `Paid on ${fmtDate(run.paidOn)}` : "To transfer to staff"} icon="checkCircle" />
      </section>

      {unmarked > 0 && draft && (
        <p className="mt-4 rounded-xl border border-[#F3D9A4] bg-[#FFF8E8] px-4 py-3 text-[13px] text-[#7A4F00]">
          <b>{unmarked} unmarked working day{unmarked > 1 ? "s" : ""}</b> are counted as absent (loss of pay). Fix them in the Attendance tab, then click Re-calculate.
        </p>
      )}

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <StatusBadge tone={RUN_TONE[run.status]}>{run.status}</StatusBadge>
          {run.lockedAt && <span className="text-[12px] text-[#6b807b]">Locked {fmtDate(run.lockedAt)} by {run.lockedBy}</span>}
          <div className="ml-auto flex flex-wrap gap-2">
            {draft && <Btn variant="ghost" onClick={() => act({ action: "generate" }, "Recalculated from latest attendance")}>Re-calculate</Btn>}
            {draft && <Btn icon="check" onClick={() => window.confirm("Lock this payroll? Amounts become final and staff can see their payslips.") && act({ action: "lock" }, "Payroll locked, payslips published")}>Lock payroll</Btn>}
            {run.status === "Locked" && <Btn icon="rupee" onClick={() => setPaying(true)}>Mark as paid</Btn>}
            {run.status === "Locked" && <Btn variant="ghost" onClick={() => act({ action: "reopen" }, "Payroll re-opened")}>Re-open</Btn>}
            {!draft && <Btn variant="ghost" icon="download" onClick={bank}>Bank transfer file</Btn>}
            <Btn variant="ghost" icon="download" onClick={register}>Payroll register</Btn>
          </div>
        </div>

        <DataGrid minWidth={980}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Employee</Th>
              <Th right>Payable days</Th>
              <Th right>Gross earned</Th>
              <Th right>PF</Th>
              <Th right>ESI / PT / TDS</Th>
              <Th right>Other</Th>
              <Th right>Net pay</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {run.lines.map((l) => (
              <tr key={l.staffId} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={l.name} size={32} />
                    <span><span className="block font-semibold text-brand-ink">{l.name}</span><span className="block text-[11.5px] text-[#6b807b]">{l.staffId} · {l.role}</span></span>
                  </div>
                </Td>
                <Td right>
                  <span className="font-medium text-brand-ink">{l.payableDays}/{l.daysInMonth}</span>
                  {l.lopDays > 0 && <span className="block text-[11px] text-[#B42E2E]">{l.lopDays} LOP{l.unmarked ? ` (${l.unmarked} unmarked)` : ""}</span>}
                </Td>
                <Td right>{inr(l.gross)}{l.bonus > 0 && <span className="block text-[11px] text-[#0A7F0A]">incl. bonus {inr(l.bonus)}</span>}</Td>
                <Td right>{inr(l.pf)}</Td>
                <Td right>{inr(l.esi + l.pt + l.tds)}</Td>
                <Td right>{l.otherDeduction ? <span title={l.note}>{inr(l.otherDeduction)}</span> : "—"}</Td>
                <Td right className="font-semibold text-brand-ink">{inr(l.net)}</Td>
                <Td right>
                  <div className="flex justify-end gap-1.5">
                    {draft && <button onClick={() => setAdj(l)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">Bonus / deduct</button>}
                    <a href={`/payslip?month=${month}&id=${l.staffId}`} target="_blank" rel="noreferrer" className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal">Payslip</a>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataGrid>
        <p className="mt-3 text-[11.5px] text-[#6b807b]">
          Basic = {PAYROLL_RULES.basicPct * 100}% of gross, HRA = {PAYROLL_RULES.hraPctOfBasic * 100}% of basic, rest is special allowance, all pro-rated by payable days. PF {PAYROLL_RULES.pfRate * 100}% of basic (up to ₹{PAYROLL_RULES.pfCeiling.toLocaleString("en-IN")}); ESI {PAYROLL_RULES.esiRate * 100}% if monthly gross ≤ ₹{PAYROLL_RULES.esiLimit.toLocaleString("en-IN")}; professional tax {inr(d.settings.ptAmount)} above ₹{PAYROLL_RULES.ptThreshold.toLocaleString("en-IN")}.
        </p>
      </Card>

      <AdjustModal line={adj} onClose={() => setAdj(null)} act={act} run={run} />
      <PaidModal open={paying} onClose={() => setPaying(false)} act={act} />
    </>
  );
}

function AdjustModal({ line, run, onClose, act }: { line: PayLine | null; run: PayRun; onClose: () => void; act: Act }) {
  const [bonus, setBonus] = useState("");
  const [ded, setDed] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => {
    if (line) {
      const a = run.adjust[line.staffId];
      setBonus(a?.bonus ? String(a.bonus) : "");
      setDed(a?.deduction ? String(a.deduction) : "");
      setNote(a?.note ?? "");
    }
  }, [line]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Modal open={!!line} title={line ? `Bonus / deduction · ${line.name}` : ""} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (line && (await act({ action: "adjust", staffId: line.staffId, patch: { bonus: Number(bonus) || 0, deduction: Number(ded) || 0, note } }, "Updated"))) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bonus / incentive (₹)"><input type="number" min="0" className={inputCls} value={bonus} onChange={(e) => setBonus(e.target.value)} /></Field>
          <Field label="Other deduction (₹)"><input type="number" min="0" className={inputCls} value={ded} onChange={(e) => setDed(e.target.value)} placeholder="advance recovery, fines…" /></Field>
        </div>
        <Field label="Note (shown on the payslip)"><input maxLength={120} className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check">Save</Btn>
        </div>
      </form>
    </Modal>
  );
}

function PaidModal({ open, onClose, act }: { open: boolean; onClose: () => void; act: Act }) {
  const [on, setOn] = useState(todayIST());
  return (
    <Modal open={open} title="Mark payroll as paid" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await act({ action: "markPaid", paidOn: on }, "Payroll marked as paid")) onClose();
        }}
      >
        <p className="text-[13px] text-[#41564f]">Do this after the bank transfer is done. Paid payroll can no longer be re-opened.</p>
        <Field label="Date salaries were transferred"><input required type="date" className={inputCls} value={on} onChange={(e) => setOn(e.target.value)} /></Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check">Confirm paid</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────── Salary setup ───────────── */

function SetupTab({ d, act }: { d: Data; act: Act }) {
  const [edit, setEdit] = useState<Staff | null>(null);
  const [prof, setProf] = useState<Staff | "new" | null>(null);
  const [pt, setPt] = useState(String(d.settings.ptAmount));
  return (
    <>
      <Card>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <p className="max-w-xl text-[13px] text-[#41564f]">Add or edit employees, then set PF, TDS and the bank details used for the transfer file. Monthly gross can be overridden per person.</p>
          <Btn icon="plus" onClick={() => setProf("new")}>Add employee</Btn>
          <form className="ml-auto flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); act({ action: "settings", patch: { ptAmount: Number(pt) } }, "Professional tax updated"); }}>
            <Field label="Professional tax / month (₹)"><input type="number" min="0" className={inputCls + " !w-[170px]"} value={pt} onChange={(e) => setPt(e.target.value)} /></Field>
            <Btn type="submit" variant="ghost">Save</Btn>
          </form>
        </div>
        <DataGrid minWidth={860}>
          <thead>
            <tr className="border-b border-[#EEF3F1]"><Th>Employee</Th><Th right>Monthly gross</Th><Th>PF</Th><Th right>TDS / month</Th><Th>Bank account</Th><Th /></tr>
          </thead>
          <tbody>
            {d.staff.map((s) => {
              const u = d.setup[s.id];
              return (
                <tr key={s.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td><div className="flex items-center gap-3"><Avatar name={s.name} size={32} /><span><span className="block font-semibold text-brand-ink">{s.name}</span><span className="block text-[11.5px] text-[#6b807b]">{s.id} · joined {fmtDate(s.joined)}{s.active === false ? " · left" : ""}</span></span></div></Td>
                  <Td right>{inr(u?.ctc ?? s.salary)}{u?.ctc ? <span className="block text-[11px] text-[#6b807b]">override</span> : null}</Td>
                  <Td>{(u?.pf ?? true) ? "Yes" : "No"}</Td>
                  <Td right>{u?.tds ? inr(u.tds) : "—"}</Td>
                  <Td>{u?.account ? <span>{u.bank ?? "Bank"} · ••••{u.account.slice(-4)} <span className="text-[11px] text-[#6b807b]">{u.ifsc}</span></span> : <span className="text-[#B42E2E]">Missing</span>}</Td>
                  <Td right><div className="flex justify-end gap-1.5"><button onClick={() => setProf(s)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">Profile</button><button onClick={() => setEdit(s)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">Salary</button></div></Td>
                </tr>
              );
            })}
          </tbody>
        </DataGrid>
      </Card>
      <SetupModal staff={edit} setup={edit ? d.setup[edit.id] : undefined} onClose={() => setEdit(null)} act={act} />
      <StaffModal staff={prof} onClose={() => setProf(null)} act={act} />
    </>
  );
}

/** Add a new employee or edit an existing one (name, role, branch, joining date, salary, left the company). */
function StaffModal({ staff, onClose, act }: { staff: Staff | "new" | null; onClose: () => void; act: Act }) {
  const blank = { name: "", role: "", dept: "Operations", centre: "HQ", joined: todayIST(), salary: "", active: true };
  const [f, setF] = useState(blank);
  const isNew = staff === "new";
  useEffect(() => {
    if (staff === "new") setF(blank);
    else if (staff) setF({ name: staff.name, role: staff.role, dept: staff.dept, centre: staff.centre, joined: staff.joined, salary: String(staff.salary), active: staff.active !== false });
  }, [staff]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const branches = ["HQ", "Online", ...ADMISSION_CENTRES.map((c) => c.name)];
  if (staff && staff !== "new" && !branches.includes(staff.centre)) branches.push(staff.centre);
  return (
    <Modal open={!!staff} title={isNew ? "Add employee" : staff ? `Edit ${staff.name}` : ""} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!staff) return;
          const body = { name: f.name, role: f.role, dept: f.dept, centre: f.centre, joined: f.joined, salary: Number(f.salary) };
          const ok = isNew ? await act({ action: "addStaff", staff: body }, "Employee added") : await act({ action: "updateStaff", staffId: staff.id, patch: { ...body, active: f.active } }, "Saved");
          if (ok) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name"><input required className={inputCls} value={f.name} onChange={set("name")} /></Field>
          <Field label="Role / designation"><input required className={inputCls} value={f.role} onChange={set("role")} /></Field>
          <Field label="Department"><select className={inputCls} value={f.dept} onChange={set("dept")}>{["Academics", "Sales", "Operations", "Tech", "Finance"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Branch"><select className={inputCls} value={f.centre} onChange={set("centre")}>{branches.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Joining date"><input required type="date" className={inputCls} value={f.joined} onChange={set("joined")} /></Field>
          <Field label="Monthly gross salary (₹)"><input required type="number" min="1" className={inputCls} value={f.salary} onChange={set("salary")} /></Field>
        </div>
        {!isNew && <label className="flex items-center gap-2 text-[13px] text-brand-ink"><input type="checkbox" className="h-4 w-4 accent-[#0E937E]" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Currently employed (untick when they leave: excluded from new payroll runs)</label>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check">{isNew ? "Add employee" : "Save"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

function SetupModal({ staff, setup, onClose, act }: { staff: Staff | null; setup?: SalarySetup; onClose: () => void; act: Act }) {
  const [f, setF] = useState({ ctc: "", pf: true, tds: "", bank: "", account: "", ifsc: "", biometricId: "" });
  useEffect(() => {
    if (staff) setF({ ctc: setup?.ctc ? String(setup.ctc) : "", pf: setup?.pf ?? true, tds: setup?.tds ? String(setup.tds) : "", bank: setup?.bank ?? "", account: setup?.account ?? "", ifsc: setup?.ifsc ?? "", biometricId: setup?.biometricId ?? "" });
  }, [staff]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={!!staff} title={staff ? `Salary setup · ${staff.name}` : ""} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (staff && (await act({ action: "setup", staffId: staff.id, patch: { ctc: Number(f.ctc) || 0, pf: f.pf, tds: Number(f.tds) || 0, bank: f.bank, account: f.account, ifsc: f.ifsc, biometricId: f.biometricId } }, "Saved"))) onClose();
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label={`Monthly gross (₹) · directory: ${staff ? inr(staff.salary) : ""}`}><input type="number" min="0" className={inputCls} value={f.ctc} onChange={set("ctc")} placeholder="leave blank to use directory" /></Field>
          <Field label="TDS per month (₹)"><input type="number" min="0" className={inputCls} value={f.tds} onChange={set("tds")} /></Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-brand-ink"><input type="checkbox" className="h-4 w-4 accent-[#0E937E]" checked={f.pf} onChange={(e) => setF({ ...f, pf: e.target.checked })} /> Deduct employee PF</label>
        <Field label={`Biometric device User ID (blank = employee number, e.g. ${staff ? String(Number(staff.id.replace(/\D/g, ""))) : "4"})`}><input className={inputCls} value={f.biometricId} onChange={set("biometricId")} placeholder="ID enrolled on the Matrix device" /></Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Bank"><input className={inputCls} value={f.bank} onChange={set("bank")} /></Field>
          <Field label="Account no."><input inputMode="numeric" className={inputCls} value={f.account} onChange={set("account")} /></Field>
          <Field label="IFSC"><input className={inputCls} value={f.ifsc} onChange={set("ifsc")} /></Field>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check">Save</Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────── Holidays ───────────── */

/** DD/MM/YYYY, DD-MM-YYYY or YYYY-MM-DD plus HH:MM[:SS] (India local time) -> ISO instant. */
function istIso(date: string, time: string) {
  const d = date.trim().replace(/\//g, "-");
  const iso = /^\d{1,2}-\d{1,2}-\d{4}$/.test(d) ? d.split("-").reverse().map((x, i) => (i ? x.padStart(2, "0") : x)).join("-") : d;
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(time.trim());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso) || !m) return "";
  const t = new Date(`${iso}T${m[1].padStart(2, "0")}:${m[2]}:${m[3] ?? "00"}+05:30`);
  return Number.isNaN(t.getTime()) ? "" : t.toISOString();
}

function csvRows(text: string): string[][] {
  const out: string[][] = [];
  for (const line of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) c === '"' ? (line[i + 1] === '"' ? ((cur += '"'), i++) : (q = false)) : (cur += c);
      else if (c === '"') q = true;
      else if (c === ",") (cells.push(cur), (cur = ""));
      else cur += c;
    }
    cells.push(cur);
    out.push(cells.map((x) => x.trim()));
  }
  return out;
}

function PunchesTab({ d, act }: { d: Data; act: Act }) {
  const [show, setShow] = useState(false);
  const [full, setFull] = useState(String(d.settings.fullDayHours));
  const [half, setHalf] = useState(String(d.settings.halfDayHours));
  const [csvErr, setCsvErr] = useState("");
  const [result, setResult] = useState("");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const key = d.settings.punchKey;
  const url = `${origin}/api/punch?key=${show ? key : "••••••••••••••••••"}`;
  const realUrl = `${origin}/api/punch?key=${key}`;
  const name = (id: string) => d.staff.find((s) => s.id === id)?.name ?? id;
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => setResult("Copied"));

  const upload = async (file?: File) => {
    setCsvErr("");
    setResult("");
    if (!file) return;
    const t = csvRows(await file.text());
    if (t.length < 2) return setCsvErr("The file has no rows.");
    const h = t[0].map((x) => x.toLowerCase().replace(/[^a-z]/g, ""));
    const col = (names: string[]) => h.findIndex((x) => names.includes(x));
    const iu = col(["userid", "empid", "employeeid", "employeecode", "id", "empcode"]);
    const idt = col(["datetime", "punchtime", "timestamp", "punchdatetime"]);
    const id = col(["date", "punchdate"]);
    const it = col(["time", "punchtime"]);
    if (iu < 0 || (idt < 0 && (id < 0 || it < 0))) return setCsvErr("Need a User ID column plus Date & Time (or a Date-Time column). Matrix COSEC punch exports have these.");
    const rows = t.slice(1).map((r) => {
      let at = "";
      if (id >= 0 && it >= 0 && it !== idt) at = istIso(r[id] ?? "", r[it] ?? "");
      if (!at && idt >= 0) {
        const [a, ...b] = (r[idt] ?? "").trim().split(/\s+/);
        at = istIso(a ?? "", b.join(" "));
      }
      return { userId: r[iu] ?? "", at };
    }).filter((r) => r.userId && r.at);
    if (!rows.length) return setCsvErr("No valid punch rows found (check the date and time formats).");
    const j = await act({ action: "importPunches", rows });
    if (j) setResult(`Imported ${(j as { added?: number }).added ?? 0} punches · ${(j as { duplicates?: number }).duplicates ?? 0} duplicates skipped · ${(j as { unmatched?: number }).unmatched ?? 0} unmatched IDs · ${(j as { frozen?: number }).frozen ?? 0} days in a locked month left unchanged`);
  };

  return (
    <div className="space-y-5">
      <Card title="Matrix biometric device: connection">
        <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-[13px] text-[#41564f]">
          <li>Make sure the Q-School server address is reachable from the device network (a public https address, or this PC&apos;s LAN address on the same network).</li>
          <li>On the Matrix COSEC server or device, configure <b>event push to an HTTP server</b> and enter the URL below. The device sends <code>user-id</code>, <code>date</code>, <code>time</code> and its <code>serial-no</code>.</li>
          <li>Enrol each person on the device with their <b>User ID</b>: the employee number (4 for EMP-004), or any ID you set in Salary setup, then Edit, then Biometric ID.</li>
          <li>Direction is not needed: the first punch of the day is the in-time and the last one (at least 1 hour later) is the out-time.</li>
        </ol>
        <div className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-3">
          <p className="mb-1 text-[11.5px] font-semibold uppercase tracking-wide text-[#6b807b]">Punch receiver URL</p>
          <p className="break-all font-mono text-[12.5px] text-brand-ink">{url}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => setShow(!show)}>{show ? "Hide key" : "Show key"}</Btn>
            <Btn variant="ghost" onClick={() => copy(realUrl)}>Copy URL</Btn>
            <Btn variant="ghost" onClick={() => window.confirm("Generate a new key? The device must be updated with the new URL or its punches will be rejected.") && act({ action: "newPunchKey" }, "New key created. Update the device URL")}>New key</Btn>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-[#6b807b]">
          Test from any browser: <span className="font-mono">{origin}/api/punch?key=…&amp;user-id=4&amp;date=2026-10-18&amp;time=09:05:00</span>. Treat the key like a password. For a device inside your office LAN with no internet, use the CSV import below each day instead.
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Attendance rules for punches">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              act({ action: "settings", patch: { fullDayHours: Number(full), halfDayHours: Number(half) } }, "Rules saved");
            }}
          >
            <Field label="Full day (hours)"><input type="number" step="0.5" min="1" className={inputCls + " !w-[120px]"} value={full} onChange={(e) => setFull(e.target.value)} /></Field>
            <Field label="Half day (hours)"><input type="number" step="0.5" min="0.5" className={inputCls + " !w-[120px]"} value={half} onChange={(e) => setHalf(e.target.value)} /></Field>
            <Btn type="submit" variant="ghost">Save</Btn>
          </form>
          <p className="mt-3 text-[12.5px] text-[#41564f]">First-to-last punch of at least the full-day hours = Present; at least the half-day hours = Half day; less = Absent. A single punch counts as Present and shows a dot so HR can check it. Anything HR marks by hand is never overwritten by a punch.</p>
        </Card>

        <Card title="Import punches from CSV">
          <p className="mb-3 text-[12.5px] text-[#41564f]">Export the punch / attendance log from Matrix COSEC and upload it. Needs a <b>User ID</b> column and <b>Date</b> + <b>Time</b> (or one Date-Time column). Re-uploading the same file is safe: duplicates are skipped.</p>
          <input type="file" accept=".csv,text/csv" className="block text-[13px]" onChange={(e) => upload(e.target.files?.[0])} />
          {csvErr && <p className="mt-2 text-[12.5px] font-semibold text-[#B42E2E]">{csvErr}</p>}
          {result && <p className="mt-2 text-[12.5px] font-semibold text-brand-deep">{result}</p>}
        </Card>
      </div>

      {d.unmatched.length > 0 && (
        <Card title="Punches that matched nobody">
          <p className="mb-2 text-[12.5px] text-[#41564f]">These User IDs are not linked to any employee. Set the matching Biometric ID in Salary setup; later punches will then be picked up (re-import the CSV for old ones).</p>
          <ul className="grid grid-cols-1 gap-1 text-[12.5px] sm:grid-cols-2">
            {d.unmatched.map((u, i) => (
              <li key={i} className="rounded-lg bg-[#FFF8E8] px-3 py-1.5 text-[#7A4F00]">User ID <b>{u.userId}</b> · {new Date(u.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}{u.device ? ` · ${u.device}` : ""}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Recent punches">
        <DataGrid minWidth={560}>
          <thead><tr className="border-b border-[#EEF3F1]"><Th>Employee</Th><Th>Time (IST)</Th><Th>Source</Th><Th>Device</Th></tr></thead>
          <tbody>
            {d.recent.map((p, i) => (
              <tr key={i} className="border-b border-[#F4F7F6]">
                <Td className="font-medium text-brand-ink">{name(p.staffId)}</Td>
                <Td>{new Date(p.at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</Td>
                <Td className="capitalize">{p.source === "matrix" ? "Matrix biometric" : p.source}</Td>
                <Td className="text-[#6b807b]">{p.device ?? "—"}</Td>
              </tr>
            ))}
            {d.recent.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-[#7B8E89]">No punches received yet. Once the device is connected they appear here live.</td></tr>}
          </tbody>
        </DataGrid>
      </Card>
    </div>
  );
}

function HolidaysTab({ d, month, locked, act }: { d: Data; month: string; locked: boolean; act: Act }) {
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const list = d.holidays.filter((h) => h.date.slice(0, 4) === month.slice(0, 4));
  return (
    <Card title={`Paid holidays ${month.slice(0, 4)}`}>
      <p className="mb-3 text-[13px] text-[#41564f]">Sundays are weekly offs automatically. Add public or centre holidays here; they are paid and never count as absent.</p>
      <form
        className="mb-4 flex flex-wrap items-end gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await act({ action: "addHoliday", date, name }, "Holiday added")) {
            setDate("");
            setName("");
          }
        }}
      >
        <Field label="Date"><input required type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Holiday"><input required className={inputCls + " !w-[240px]"} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali" /></Field>
        <Btn type="submit" icon="plus" disabled={locked && date.startsWith(month)}>Add</Btn>
      </form>
      <ul className="divide-y divide-[#F0F4F3]">
        {list.map((h) => (
          <li key={h.date} className="flex items-center justify-between py-2.5 text-[13px]">
            <span><b className="text-brand-ink">{h.name}</b> <span className="text-[#6b807b]">· {fmtDate(h.date)}</span></span>
            <button onClick={() => act({ action: "removeHoliday", date: h.date }, "Removed")} className="text-[12px] text-[#B42E2E] hover:underline">Remove</button>
          </li>
        ))}
        {list.length === 0 && <li className="py-3 text-[13px] text-[#6b807b]">No holidays added for this year.</li>}
      </ul>
    </Card>
  );
}
