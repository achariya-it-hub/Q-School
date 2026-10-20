"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fmtDate, inr, type LeaveRequest, type Staff } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Avatar } from "@/components/dashboard/art";
import { Btn, Card, DataGrid, Figure, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, useToast, type Tone } from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { setLeave, useConsole } from "@/components/admin/store";
import { useStaffMaster } from "@/components/admin/use-staff";

const ATT_TONE: Record<Staff["today"], Tone> = { Present: "good", WFH: "info", "On leave": "warning", Absent: "critical" };
type Dept = "All" | Staff["dept"];

export default function StaffPage() {
  const router = useRouter();
  const leaves = useConsole((s) => s.leaves);
  const { active: STAFF } = useStaffMaster(); // employed staff from the staff master (edited in Payroll)
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<Dept>("All");
  const [deptTable, setDeptTable] = useState(false);
  const [toast, show] = useToast();

  /** Approving leave marks Paid leave on the attendance sheet; rejecting removes it again. */
  const decide = async (l: LeaveRequest, status: "Approved" | "Rejected") => {
    setLeave(l.id, status);
    try {
      const r = await fetch("/api/payroll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "syncLeave", leaveId: l.id, name: l.staff, from: l.from, to: l.to, approved: status === "Approved" }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return show(`Leave ${status.toLowerCase()} for ${l.staff}, but attendance not updated: ${j.error ?? "error"}`);
      show(status === "Approved" ? `Leave approved for ${l.staff}: ${j.marked} day(s) marked as paid leave${j.skipped ? `, ${j.skipped} skipped (locked or already marked)` : ""}` : `Leave rejected for ${l.staff}`);
    } catch {
      show(`Leave ${status.toLowerCase()} for ${l.staff}`);
    }
  };

  const list = STAFF.filter((s) => dept === "All" || s.dept === dept).filter((s) => `${s.name} ${s.role} ${s.centre}`.toLowerCase().includes(q.toLowerCase()));
  const present = STAFF.filter((s) => s.today === "Present" || s.today === "WFH").length;
  const payroll = STAFF.reduce((a, s) => a + s.salary, 0);
  const pending = leaves.filter((l) => l.status === "Pending");
  const depts: Staff["dept"][] = ["Academics", "Sales", "Operations", "Tech", "Finance"];
  const headcount = depts.map((d) => ({ label: d, value: STAFF.filter((s) => s.dept === d).length })).sort((a, b) => b.value - a.value);

  return (
    <AdminShell>
      <PageHeader title="HR & Staff" sub="Team directory, today's attendance and leave approvals · payroll & biometric attendance in Payroll">
        <Btn icon="checkCircle" onClick={() => router.push("/admin/staff/tasks")}>
          Staff tasks
        </Btn>
        <Btn variant="ghost" icon="rupee" onClick={() => router.push("/admin/payroll")}>
          Open payroll
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Headcount" value={String(STAFF.length)} sub={`${STAFF.filter((s) => s.dept === "Academics").length} faculty`} icon="users" />
        <Figure label="Attendance today" value={`${present}/${STAFF.length}`} meter={(present / STAFF.length) * 100} sub="Present + WFH" icon="checkCircle" />
        <Figure label="Monthly payroll" value={inr(payroll, true)} sub="CTC, before deductions" icon="rupee" />
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
            </tbody>
          </DataGrid>
        </Card>

        <div className="space-y-5">
          <Card title="Leave requests">
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
          </Card>
          <Card title="Headcount by department" action={<ViewToggle table={deptTable} onChange={setDeptTable} />}>
            <HBars data={headcount} table={deptTable} valueCol="People" valueWidth={40} />
          </Card>
        </div>
      </div>
      <Toast msg={toast} />
    </AdminShell>
  );
}
