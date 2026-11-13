"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDate, inr, TODAY_ISO, type LeaveRequest, type Staff } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Avatar } from "@/components/dashboard/art";
import {
  Btn,
  Card,
  DataGrid,
  Field,
  Figure,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  Td,
  Th,
  Toast,
  inputCls,
  useToast,
  type Tone,
} from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { addLeaveRequest, setLeave, useConsole } from "@/components/admin/store";
import { useStaffMaster } from "@/components/admin/use-staff";
import { useAdminRole } from "@/lib/centre-head";

const ATT_TONE: Record<Staff["today"], Tone> = { Present: "good", WFH: "info", "On leave": "warning", Absent: "critical" };
type Dept = "All" | Staff["dept"];

export default function StaffPage() {
  const router = useRouter();
  const { isHead } = useAdminRole();
  const leaves = useConsole((s) => s.leaves);
  const { active: STAFF } = useStaffMaster(); // employed staff from the staff master (edited in Payroll)
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<Dept>("All");
  const [deptTable, setDeptTable] = useState(false);
  const [addingLeave, setAddingLeave] = useState(false);
  const [toast, show] = useToast();

  /** Approving leave marks Paid leave on the attendance sheet; rejecting removes it again. */
  const decide = async (l: LeaveRequest, status: "Approved" | "Rejected") => {
    setLeave(l.id, status);
    try {
      const r = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncLeave", leaveId: l.id, name: l.staff, from: l.from, to: l.to, approved: status === "Approved" }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return show(`Leave ${status.toLowerCase()} for ${l.staff}, but attendance not updated: ${j.error ?? "error"}`);
      show(
        status === "Approved"
          ? `Leave approved for ${l.staff}: ${j.marked} day(s) marked as paid leave${j.skipped ? `, ${j.skipped} skipped (locked or already marked)` : ""}`
          : `Leave rejected for ${l.staff}`
      );
    } catch {
      show(`Leave ${status.toLowerCase()} for ${l.staff}`);
    }
  };

  const list = STAFF.filter((s) => dept === "All" || s.dept === dept).filter((s) =>
    `${s.name} ${s.role} ${s.centre}`.toLowerCase().includes(q.toLowerCase())
  );
  const present = STAFF.filter((s) => s.today === "Present" || s.today === "WFH").length;
  const attPct = STAFF.length > 0 ? Math.round((present / STAFF.length) * 100) : 0;
  const payroll = STAFF.reduce((a, s) => a + s.salary, 0);
  const pending = leaves.filter((l) => l.status === "Pending");
  const depts: Staff["dept"][] = ["Academics", "Sales", "Operations", "Tech", "Finance"];
  const headcount = depts.map((d) => ({ label: d, value: STAFF.filter((s) => s.dept === d).length })).sort((a, b) => b.value - a.value);

  return (
    <AdminShell>
      <PageHeader
        title="HR & Staff"
        sub={
          isHead
            ? "Team directory, today's attendance and leave approvals for learning centres"
            : "Team directory, today's attendance and leave approvals · payroll & biometric attendance in Payroll"
        }
      >
        <Btn variant="ghost" icon="plus" onClick={() => setAddingLeave(true)}>
          Log leave request
        </Btn>
        {!isHead && (
          <>
            <Btn icon="checkCircle" onClick={() => router.push("/admin/staff/tasks")}>
              Staff tasks
            </Btn>
            <Btn variant="ghost" icon="rupee" onClick={() => router.push("/admin/payroll")}>
              Open payroll
            </Btn>
          </>
        )}
      </PageHeader>

      <section className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${isHead ? "xl:grid-cols-3" : "xl:grid-cols-4"}`}>
        <Figure label="Headcount" value={String(STAFF.length)} sub={`${STAFF.filter((s) => s.dept === "Academics").length} faculty`} icon="users" />
        <Figure label="Attendance today" value={`${present}/${STAFF.length}`} meter={attPct} sub="Present + WFH" icon="checkCircle" />
        {!isHead && <Figure label="Monthly payroll" value={inr(payroll, true)} sub="CTC, before deductions" icon="rupee" />}
        <Figure label="Leave requests" value={String(pending.length)} sub="Awaiting approval" icon="calendar" />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput value={q} onChange={setQ} placeholder="Search staff…" />
            <Segmented<Dept> label="Department" value={dept} onChange={setDept} options={(["All", ...depts] as Dept[]).map((v) => ({ value: v, label: v }))} />
          </div>
          <DataGrid minWidth={760}>
            <thead>
              <tr className="border-b border-[#EEF3F1]">
                <Th>Employee</Th>
                <Th>Department</Th>
                <Th>Centre</Th>
                <Th>Joined</Th>
                <Th right>Monthly CTC</Th>
                <Th>Today</Th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={34} />
                      <div>
                        <p className="font-semibold text-brand-ink">{s.name}</p>
                        <p className="text-[11.5px] text-[#6b807b]">
                          {s.role} · {s.id}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-[#41564f]">{s.dept}</Td>
                  <Td className="text-[#41564f]">{s.centre}</Td>
                  <Td className="whitespace-nowrap text-[#41564f]">{fmtDate(s.joined)}</Td>
                  <Td right className="text-brand-ink">{inr(s.salary)}</Td>
                  <Td>
                    <StatusBadge tone={ATT_TONE[s.today]}>{s.today}</StatusBadge>
                  </Td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13px] text-[#7B8E89]">
                    {STAFF.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <p>No employees in the staff master yet.</p>
                        {!isHead && (
                          <button
                            type="button"
                            onClick={() => router.push("/admin/payroll")}
                            className="rounded-lg bg-brand-deep px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                          >
                            Add employees in Payroll → Salary setup
                          </button>
                        )}
                      </div>
                    ) : (
                      "No staff match your search."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </DataGrid>
        </Card>

        <div className="space-y-5">
          <Card
            title="Leave requests"
            action={
              <button
                type="button"
                onClick={() => setAddingLeave(true)}
                className="text-[12px] font-semibold text-brand-teal hover:underline"
              >
                + Add request
              </button>
            }
          >
            {leaves.length === 0 ? (
              <p className="py-4 text-[13px] text-[#6b807b]">No leave requests submitted.</p>
            ) : (
              <ul className="space-y-3">
                {leaves.map((l) => (
                  <li key={l.id} className="rounded-xl border border-[#EEF3F1] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-brand-ink">{l.staff}</p>
                        <p className="text-[11.5px] text-[#6b807b]">
                          {l.type} · {l.days} day{l.days > 1 ? "s" : ""} · {fmtDate(l.from)}
                          {l.to !== l.from ? ` – ${fmtDate(l.to)}` : ""}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#41564f]">{l.reason}</p>
                      </div>
                      <StatusBadge tone={l.status === "Approved" ? "good" : l.status === "Rejected" ? "critical" : "warning"}>{l.status}</StatusBadge>
                    </div>
                    {l.status === "Pending" && (
                      <div className="mt-2.5 flex gap-2">
                        <button
                          onClick={() => decide(l, "Approved")}
                          className="rounded-lg bg-brand-deep px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => decide(l, "Rejected")}
                          className="rounded-lg border border-[#E2ECE9] px-3 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Headcount by department" action={<ViewToggle table={deptTable} onChange={setDeptTable} />}>
            <HBars data={headcount} table={deptTable} valueCol="People" valueWidth={40} />
          </Card>
        </div>
      </div>

      <AddLeaveModal
        open={addingLeave}
        staffList={STAFF}
        onClose={() => setAddingLeave(false)}
        onDone={(msg) => {
          setAddingLeave(false);
          show(msg);
        }}
      />
      <Toast msg={toast} />
    </AdminShell>
  );
}

function AddLeaveModal({
  open,
  staffList,
  onClose,
  onDone,
}: {
  open: boolean;
  staffList: Staff[];
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [staff, setStaff] = useState("");
  const [type, setType] = useState<LeaveRequest["type"]>("Casual");
  const [from, setFrom] = useState(TODAY_ISO);
  const [to, setTo] = useState(TODAY_ISO);
  const [reason, setReason] = useState("");

  const calcDays = (a: string, b: string) => {
    const diff = Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
    return Math.max(1, Number.isFinite(diff) ? diff : 1);
  };

  return (
    <Modal open={open} title="Log leave request" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const name = staff.trim() || staffList[0]?.name || "";
          if (!name) return;
          const days = calcDays(from, to);
          addLeaveRequest({
            staff: name,
            type,
            from,
            to: to < from ? from : to,
            days,
            reason: reason.trim() || `${type} leave`,
          });
          setStaff("");
          setReason("");
          onDone(`Leave request logged for ${name}`);
        }}
      >
        <Field label="Employee name">
          {staffList.length > 0 ? (
            <select
              className={inputCls}
              value={staff || staffList[0].name}
              onChange={(e) => setStaff(e.target.value)}
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.dept})
                </option>
              ))}
            </select>
          ) : (
            <input
              required
              className={inputCls}
              placeholder="Employee full name"
              value={staff}
              onChange={(e) => setStaff(e.target.value)}
            />
          )}
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Leave type">
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as LeaveRequest["type"])}>
              <option value="Casual">Casual</option>
              <option value="Sick">Sick</option>
              <option value="Earned">Earned</option>
            </select>
          </Field>
          <Field label="From">
            <input
              required
              type="date"
              className={inputCls}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (to < e.target.value) setTo(e.target.value);
              }}
            />
          </Field>
          <Field label="To">
            <input required type="date" min={from} className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <Field label="Reason">
          <input
            required
            className={inputCls}
            placeholder="e.g. Family function or medical check-up"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" icon="check">
            Submit request
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
