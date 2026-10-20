"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ADMISSION_CENTRES, PAYMENT_MODES, centreName, inr, type StudentRecord, type StudentStatus } from "@qschool/shared";
import { Btn, Card, DataGrid, Drawer, Field, Figure, Modal, SearchInput, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { downloadCsv } from "@/components/admin/store";
import { Icon } from "@/components/icons";
import { PayLinks } from "@/components/admin/pay-links";

const TONE = { Pending: "warning", Active: "good" } as const;

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
const photoUrl = (s: StudentRecord) => `/api/students/photo/${s.photo}`;

/** Loads the students this login may see (admin: all, centre login: own centre) and refreshes every 30s. */
export function useStudents() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const load = useCallback(async () => {
    const r = await fetch("/api/students", { cache: "no-store" });
    if (r.status === 401) return setState("denied");
    const j = await r.json();
    setStudents(j.students ?? []);
    setState("ok");
  }, []);
  useEffect(() => {
    load().catch(() => setState("denied"));
    const t = window.setInterval(() => load().catch(() => {}), 30000);
    return () => window.clearInterval(t);
  }, [load]);
  return { students, state, reload: load, setStudents };
}

function Photo({ s, size }: { s: StudentRecord; size: number }) {
  if (!s.photo) {
    return (
      <span className="flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#D7F0EB] font-semibold text-brand-deep shadow" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {s.studentName.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photoUrl(s)} alt={s.studentName} width={size} height={size} className="shrink-0 rounded-full border-2 border-white bg-[#D7F0EB] object-cover shadow" style={{ width: size, height: size }} />
  );
}

/** Pending / Active admissions with 'Confirm payment & activate'. mode="centre" is the centre login's view of its own students. */
export function StudentsManager({ mode }: { mode: "admin" | "centre" }) {
  const { students, state, reload } = useStudents();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | StudentStatus>("All");
  const [centre, setCentre] = useState("all");
  const [view, setView] = useState<StudentRecord | null>(null);
  const [pay, setPay] = useState<StudentRecord | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [toast, show] = useToast();

  const rows = useMemo(
    () =>
      students
        .filter((s) => status === "All" || s.status === status)
        .filter((s) => centre === "all" || s.centreId === centre)
        .filter((s) => `${s.studentName} ${s.parentName} ${s.phone} ${s.email} ${s.school} ${s.id} ${s.ref}`.toLowerCase().includes(q.toLowerCase())),
    [students, status, centre, q],
  );
  const pending = students.filter((s) => s.status === "Pending").length;
  const active = students.length - pending;

  // keep the open drawer in sync after an update
  useEffect(() => {
    if (view) setView(students.find((s) => s.id === view.id) ?? null);
  }, [students]); // eslint-disable-line react-hooks/exhaustive-deps

  const changeCentre = async (s: StudentRecord, centreId: string) => {
    const r = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id, action: "setCentre", centreId }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return show(j.error ?? "Could not change centre");
    show(`${s.studentName} moved to ${centreName(centreId)}`);
    reload();
  };

  if (state === "loading") return <p className="py-10 text-center text-[#7B8E89]">Loading…</p>;
  if (state === "denied") return <p className="py-10 text-center text-[#B42E2E]">Please sign in again.</p>;

  return (
    <>
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Pending" value={String(pending)} sub="Waiting for payment confirmation" icon="clock" />
        <Figure label="Active" value={String(active)} sub="Paid and confirmed by the centre" icon="checkCircle" />
        <Figure label="Total admissions" value={String(students.length)} sub={mode === "centre" ? "At your centre" : "Across all centres"} icon="users" />
      </section>

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search student, parent, phone, ID…" />
          <Segmented<"All" | StudentStatus>
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "All", label: "All" },
              { value: "Pending", label: `Pending (${pending})` },
              { value: "Active", label: "Active" },
            ]}
          />
          {mode === "admin" && (
            <select aria-label="Centre" value={centre} onChange={(e) => setCentre(e.target.value)} className="h-10 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[13px] text-brand-ink outline-none focus:border-brand-teal">
              <option value="all">All centres</option>
              {ADMISSION_CENTRES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <div className="ml-auto flex flex-wrap gap-2">
            <Btn icon="plus" onClick={() => setAdding(true)}>Add student</Btn>
            <Btn variant="ghost" onClick={() => setImporting(true)}>Import CSV</Btn>
            <Btn
              variant="ghost"
              icon="download"
              onClick={() =>
                downloadCsv(
                  "qschool-students.csv",
                  ["ID", "Student", "DOB", "Grade", "School", "Parent", "Phone", "Email", "Aadhaar (masked)", "Address", "Centre", "Shared by", "Status", "Applied", "Paid", "Mode", "Receipt", "Confirmed by"],
                  rows.map((s) => [s.id, s.studentName, s.dob, s.grade, s.school, s.parentName, s.phone, s.email, s.aadhaar ? `XXXX XXXX ${s.aadhaar.slice(-4)}` : "", s.address, centreName(s.centreId), s.ref, s.status, fmt(s.createdAt), s.payment?.amount ?? "", s.payment?.mode ?? "", s.payment?.receiptNo ?? "", s.payment?.confirmedBy ?? ""]),
                )
              }
            >
              Export CSV
            </Btn>
          </div>
        </div>

        <DataGrid minWidth={900}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Student</Th>
              <Th>Grade · School</Th>
              <Th>Parent</Th>
              {mode === "admin" && <Th>Centre</Th>}
              <Th>Applied</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                <Td>
                  <button onClick={() => setView(s)} className="flex items-center gap-3 text-left">
                    <Photo s={s} size={40} />
                    <span>
                      <span className="block font-semibold text-brand-ink">{s.studentName}</span>
                      <span className="block text-[11.5px] text-[#6b807b]">{s.id}</span>
                    </span>
                  </button>
                </Td>
                <Td>
                  <span className="block text-brand-ink">{s.grade}</span>
                  <span className="block max-w-[200px] truncate text-[11.5px] text-[#6b807b]">{s.school}</span>
                </Td>
                <Td>
                  <span className="block text-brand-ink">{s.parentName}</span>
                  <a href={`tel:${s.phone}`} className="text-[11.5px] text-brand-teal hover:underline">{s.phone}</a>
                </Td>
                {mode === "admin" && <Td className="text-[#41564f]">{centreName(s.centreId)}</Td>}
                <Td className="whitespace-nowrap text-[#41564f]">{fmt(s.createdAt)}</Td>
                <Td><StatusBadge tone={TONE[s.status]}>{s.status}</StatusBadge></Td>
                <Td right>
                  {s.status === "Pending" ? (
                    <button onClick={() => setPay(s)} className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal">
                      Confirm payment
                    </button>
                  ) : (
                    <button onClick={() => setView(s)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                      View
                    </button>
                  )}
                </Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#7B8E89]">
                  {students.length === 0 ? "No admissions yet. They appear here as soon as a parent submits the admission form." : "No students match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </DataGrid>
      </Card>

      <Drawer open={!!view} title={view?.studentName ?? ""} onClose={() => setView(null)}>
        {view && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Photo s={view} size={84} />
              <div>
                <p className="text-[12px] font-semibold text-[#6b807b]">{view.id}</p>
                <p className="text-[17px] font-semibold text-brand-ink">{view.studentName}</p>
                <StatusBadge tone={TONE[view.status]}>{view.status}</StatusBadge>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13px]">
              {([
                ["Date of birth", fmt(view.dob)],
                ["Grade", view.grade],
                ["School", view.school],
                ["Centre", centreName(view.centreId)],
                ["Parent", view.parentName],
                ["Phone", view.phone],
                ["Email", view.email],
                ["Aadhaar no.", view.aadhaar ? view.aadhaar.replace(/(\d{4})(?=\d)/g, "$1 ") : "Not provided"],
                ["Applied on", fmt(view.createdAt)],
                ["Shared by", view.ref || "Direct"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className={k === "Email" || k === "School" ? "col-span-2" : ""}>
                  <dt className="text-[11.5px] font-medium text-[#6b807b]">{k}</dt>
                  <dd className="break-words font-medium text-brand-ink">{v}</dd>
                </div>
              ))}
              <div className="col-span-2">
                <dt className="text-[11.5px] font-medium text-[#6b807b]">Address</dt>
                <dd className="whitespace-pre-line font-medium text-brand-ink">{view.address}</dd>
              </div>
            </dl>

            {view.payment ? (
              <div className="rounded-xl border border-[#CFE8D0] bg-[#F3FAF3] p-4 text-[13px]">
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-[#0A7F0A]"><Icon name="checkCircle" size={16} /> Payment confirmed</p>
                <p className="text-brand-ink"><b>{inr(view.payment.amount)}</b> via {view.payment.mode} · Receipt {view.payment.receiptNo}</p>
                <p className="mt-1 text-[12px] text-[#41564f]">Confirmed by {view.payment.confirmedBy} on {fmt(view.payment.confirmedAt)}</p>
                {view.payment.note && <p className="mt-1 text-[12px] text-[#41564f]">Note: {view.payment.note}</p>}
              </div>
            ) : (
              <Btn icon="check" onClick={() => setPay(view)}>Confirm payment &amp; activate</Btn>
            )}

            <PayLinks student={view} onChanged={reload} />

            {mode === "admin" && (
              <Field label="Move to another centre">
                <select className={inputCls} value={view.centreId} onChange={(e) => changeCentre(view, e.target.value)}>
                  {ADMISSION_CENTRES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
            )}
          </div>
        )}
      </Drawer>

      <ConfirmPayment
        student={pay}
        onClose={() => setPay(null)}
        onDone={(s) => {
          setPay(null);
          show(`${s.studentName} is now Active`);
          reload();
        }}
      />
      <AddStudent
        open={adding}
        mode={mode}
        onClose={() => setAdding(false)}
        onDone={(msg) => {
          setAdding(false);
          show(msg);
          reload();
        }}
      />
      <ImportCsv
        open={importing}
        mode={mode}
        onClose={() => setImporting(false)}
        onDone={(msg) => {
          show(msg);
          reload();
        }}
      />
      <Toast msg={toast} />
    </>
  );
}

const EMPTY = { studentName: "", dob: "", grade: "", school: "", parentName: "", phone: "", email: "", address: "", aadhaar: "", centreId: ADMISSION_CENTRES[0].id };

/** Shrinks a picked photo to an 800px JPEG data URL so uploads stay small. */
function compress(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, 800 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = url;
  });
}

/** Manual entry. The student is created as Pending, same as a parent's form submission. */
function AddStudent({ open, mode, onClose, onDone }: { open: boolean; mode: "admin" | "centre"; onClose: () => void; onDone: (msg: string) => void }) {
  const [f, setF] = useState(EMPTY);
  const [photo, setPhoto] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setF(EMPTY);
      setPhoto("");
      setErr("");
    }
  }, [open]);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student: f, photo }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Could not add student");
    onDone(j.duplicate ? `${j.student.studentName} already exists (${j.student.id})` : `${j.student.studentName} added as Pending (${j.student.id})`);
  };

  return (
    <Modal open={open} title="Add student" onClose={onClose} ratio169>
      <form className="space-y-3" onSubmit={submit}>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Student name"><input required className={inputCls} value={f.studentName} onChange={set("studentName")} /></Field>
          <Field label="Date of birth"><input required type="date" className={inputCls} value={f.dob} onChange={set("dob")} /></Field>
          <Field label="Grade"><input required className={inputCls} value={f.grade} onChange={set("grade")} placeholder="e.g. Grade 6" /></Field>
          <Field label="School"><input className={inputCls} value={f.school} onChange={set("school")} /></Field>
          <Field label="Parent name"><input required className={inputCls} value={f.parentName} onChange={set("parentName")} /></Field>
          <Field label="Phone"><input required type="tel" className={inputCls} value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><input type="email" className={inputCls} value={f.email} onChange={set("email")} /></Field>
          {mode === "admin" ? (
            <Field label="Centre">
              <select className={inputCls} value={f.centreId} onChange={set("centreId")}>
                {ADMISSION_CENTRES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          ) : (
            <p className="self-end pb-3 text-[12px] text-[#6b807b]">Added to your centre.</p>
          )}
          <Field label="Student photo (optional)">
            <input
              type="file"
              accept="image/*"
              className="w-full pt-2 text-[12px]"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return setPhoto("");
                try {
                  setPhoto(await compress(file));
                } catch (x) {
                  setErr(x instanceof Error ? x.message : "Bad image");
                }
              }}
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Aadhaar no. (optional)">
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={14}
              placeholder="1234 5678 9012"
              value={f.aadhaar}
              onChange={(e) => setF({ ...f, aadhaar: e.target.value.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ") })}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Address"><textarea rows={2} className={inputCls + " h-auto py-2"} value={f.address} onChange={set("address")} /></Field>
          </div>
        </div>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="plus" disabled={busy}>{busy ? "Saving…" : "Add as Pending"}</Btn>
        </div>
      </form>
    </Modal>
  );
}

const CSV_COLUMNS = ["Student Name", "Date of Birth", "Grade", "School", "Parent Name", "Phone", "Email", "Address", "Centre", "Aadhaar No"];
const CSV_KEYS: Record<string, string> = { aadhaarno: "aadhaar", aadhaar: "aadhaar", aadhar: "aadhaar", aadharno: "aadhaar", studentname: "studentName", name: "studentName", dateofbirth: "dob", dob: "dob", grade: "grade", class: "grade", school: "school", parentname: "parentName", parent: "parentName", phone: "phone", phoneno: "phone", mobile: "phone", email: "email", mailid: "email", address: "address", centre: "centre", center: "centre" };

/** Minimal RFC-4180 parser: quoted fields, escaped quotes, commas/newlines inside quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let q = false;
  const t = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) {
      if (ch === '"' && t[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      row.push(cur); cur = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else cur += ch;
  }
  row.push(cur);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

/** Accepts YYYY-MM-DD or DD/MM/YYYY (also - or .) and returns YYYY-MM-DD; anything else is passed through for the server to reject. */
function isoDate(v: string) {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(v.trim());
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : v.trim();
}

function ImportCsv({ open, mode, onClose, onDone }: { open: boolean; mode: "admin" | "centre"; onClose: () => void; onDone: (msg: string) => void }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ added: number; duplicates: number; errors: { row: number; error: string }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setRows([]);
      setFileName("");
      setErr("");
      setResult(null);
    }
  }, [open]);

  const pick = async (file?: File) => {
    setResult(null);
    setErr("");
    if (!file) return setRows([]);
    setFileName(file.name);
    const table = parseCsv(await file.text());
    if (table.length < 2) return setErr("The file has no data rows.");
    const keys = table[0].map((h) => CSV_KEYS[h.toLowerCase().replace(/[^a-z]/g, "")] ?? "");
    if (!keys.includes("studentName")) return setErr("Header row must include a 'Student Name' column. Download the template to see the layout.");
    setRows(
      table.slice(1).map((r) => {
        const o: Record<string, string> = {};
        keys.forEach((k, i) => { if (k) o[k] = (r[i] ?? "").trim(); });
        if (o.dob) o.dob = isoDate(o.dob);
        return o;
      }),
    );
  };

  const upload = async () => {
    setBusy(true);
    setErr("");
    const r = await fetch("/api/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Upload failed");
    setResult(j);
    setRows([]);
    onDone(`Imported ${j.added} student(s) as Pending`);
  };

  return (
    <Modal open={open} title="Import students from CSV" onClose={onClose}>
      <div className="space-y-3 text-[13px]">
        <p className="text-[#41564f]">
          Columns: <b>{CSV_COLUMNS.join(", ")}</b>. Dates as YYYY-MM-DD or DD/MM/YYYY.
          {mode === "admin" ? ` Branch must be one of: ${ADMISSION_CENTRES.map((c) => c.name).join("; ")}.` : " Everyone is added to your branch."} Students are created as <b>Pending</b>; existing child + phone matches are skipped.
        </p>
        <Btn
          variant="ghost"
          icon="download"
          onClick={() => downloadCsv("qschool-students-template.csv", CSV_COLUMNS, [["Aarav Kumar", "2014-06-21", "Grade 6", "Greenfield School", "Priya Kumar", "9876543210", "priya@example.com", "12 Lake Road, Chennai", "Adyar, Chennai", "123456789012"]])}
        >
          Download template
        </Btn>
        <input type="file" accept=".csv,text/csv" className="block text-[13px]" onChange={(e) => pick(e.target.files?.[0])} />
        {rows.length > 0 && <p className="font-semibold text-brand-ink">{fileName}: {rows.length} row(s) ready to import</p>}
        {err && <p className="font-semibold text-[#B42E2E]">{err}</p>}
        {result && (
          <div className="rounded-xl bg-[#F3F8F6] p-3">
            <p className="font-semibold text-brand-ink">{result.added} added · {result.duplicates} duplicate(s) skipped · {result.errors.length} row(s) with errors</p>
            {result.errors.length > 0 && (
              <ul className="mt-2 max-h-40 list-disc space-y-0.5 overflow-auto pl-5 text-[12px] text-[#B42E2E]">
                {result.errors.map((x) => <li key={x.row}>Row {x.row}: {x.error}</li>)}
              </ul>
            )}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>{result ? "Close" : "Cancel"}</Btn>
          <Btn onClick={upload} disabled={busy || rows.length === 0}>{busy ? "Importing…" : `Import ${rows.length || ""} student(s)`}</Btn>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmPayment({ student, onClose, onDone }: { student: StudentRecord | null; onClose: () => void; onDone: (s: StudentRecord) => void }) {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<string>(PAYMENT_MODES[0]);
  const [receiptNo, setReceiptNo] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (student) {
      setAmount("");
      setReceiptNo("");
      setNote("");
      setErr("");
      setMode(PAYMENT_MODES[0]);
    }
  }, [student]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setBusy(true);
    setErr("");
    const r = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: student.id, action: "activate", amount: Number(amount), mode, receiptNo, note }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Could not activate");
    onDone(j.student);
  };

  return (
    <Modal open={!!student} title="Confirm payment & activate" onClose={onClose}>
      {student && (
        <form className="space-y-3" onSubmit={submit}>
          <div className="flex items-center gap-3 rounded-xl bg-[#F3F8F6] p-3">
            <Photo s={student} size={44} />
            <div className="text-[13px]">
              <p className="font-semibold text-brand-ink">{student.studentName}</p>
              <p className="text-[#6b807b]">{student.grade} · {student.parentName} · {centreName(student.centreId)}</p>
            </div>
          </div>
          <p className="text-[12.5px] text-[#6b807b]">Only confirm after the fee has actually been received. The student becomes <b>Active</b> once you save.</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount paid (₹)"><input required type="number" min="1" step="0.01" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Payment mode">
              <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value)}>
                {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Receipt no."><input required className={inputCls} value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} /></Field>
          <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" icon="check" disabled={busy}>{busy ? "Saving…" : "Activate student"}</Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}

/** Dashboard card: admissions waiting for payment confirmation. */
export function PendingStudentsCard() {
  const { students, state } = useStudents();
  const pending = students.filter((s) => s.status === "Pending");
  return (
    <Card
      title="Student admissions"
      action={
        <Link href="/admin/enrolments" className="flex items-center gap-1 text-[12.5px] font-semibold text-brand-teal hover:underline">
          Students <Icon name="arrowRight" size={14} />
        </Link>
      }
    >
      {state !== "ok" ? (
        <p className="text-[13px] text-[#6b807b]">{state === "loading" ? "Loading…" : "Sign in to the Console to see admissions."}</p>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["Pending", pending.length, "#8A5A00", "#FFF6E0"],
              ["Active", students.length - pending.length, "#0A7F0A", "#EAF7EA"],
              ["Total", students.length, "#41564F", "#F1F5F4"],
            ].map(([l, n, fg, bg]) => (
              <div key={l as string} className="rounded-xl px-2 py-2.5" style={{ background: bg as string }}>
                <p className="text-[20px] font-semibold leading-none" style={{ color: fg as string }}>{n}</p>
                <p className="mt-1 text-[11.5px] text-[#5C716C]">{l}</p>
              </div>
            ))}
          </div>
          <ul className="divide-y divide-[#F0F4F3]">
            {pending.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <Photo s={s} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-brand-ink">{s.studentName}</p>
                  <p className="text-[11.5px] text-[#6b807b]">{s.grade} · {centreName(s.centreId)}</p>
                </div>
                <StatusBadge tone="warning">Pending</StatusBadge>
              </li>
            ))}
            {pending.length === 0 && <li className="py-3 text-[13px] text-[#6b807b]">No admissions waiting for payment confirmation.</li>}
          </ul>
        </>
      )}
    </Card>
  );
}
