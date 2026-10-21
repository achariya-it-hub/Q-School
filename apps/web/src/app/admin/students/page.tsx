"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { accountTotals, inr } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Avatar } from "@/components/dashboard/art";
import { Btn, Card, DataGrid, Field, Figure, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { ACCOUNT_TONE } from "@/components/admin/finance";
import { downloadCsv, useConsole } from "@/components/admin/store";

type Role = "Admin" | "Faculty" | "Student";
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "Active" | "Suspended";
  joined: string;
  phone?: string;
  password?: string;
}

/** Users come from /api/admin/users (users.json); fee status is joined from the fee ledger by name. */
export default function UsersPage() {
  const accounts = useConsole((s) => s.accounts);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<"All" | Role>("All");
  const [edit, setEdit] = useState<Partial<User> | null>(null);
  const [toast, show] = useToast();

  const load = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  // Students on the fee ledger who don't have a login yet are listed too (enrolled offline / via counsellor).
  const rows = useMemo(() => {
    const ledgerOnly: User[] = accounts
      .filter((a) => !users.some((u) => u.name.toLowerCase() === a.student.toLowerCase()))
      .map((a) => ({ id: a.id, name: a.student, email: a.email, role: "Student", status: "Active", joined: a.installments[0].due, phone: a.phone }));
    return [...users, ...ledgerOnly]
      .filter((u) => role === "All" || u.role === role)
      .filter((u) => `${u.name} ${u.email} ${u.phone ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  }, [users, accounts, role, q]);

  const fee = (name: string) => {
    const a = accounts.find((x) => x.student.toLowerCase() === name.toLowerCase());
    return a ? { a, t: accountTotals(a) } : null;
  };
  const count = (r: Role) => rows.filter((u) => u.role === r).length;

  const save = async (u: Partial<User>) => {
    const res = await fetch("/api/admin/users", {
      method: u.id && users.some((x) => x.id === u.id) ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    const d = await res.json();
    if (!res.ok) return show(d.error ?? "Could not save");
    setEdit(null);
    show(u.id ? `${u.name} updated` : `${u.name} added`);
    load();
  };

  const toggle = async (u: User) => {
    await save({ id: u.id, status: u.status === "Active" ? "Suspended" : "Active", name: u.name });
  };

  return (
    <AdminShell>
      <PageHeader title="Users" sub="Students, faculty and admins · with each student's fee status">
        <Link
          href="/admin/settings/privileges"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E6E2] bg-white px-4 text-[13px] font-semibold text-brand-deep hover:border-brand-teal transition"
        >
          <Icon name="shield" size={16} /> User Privileges
        </Link>
        <Btn
          variant="ghost"
          icon="download"
          onClick={() => downloadCsv("qschool-users.csv", ["Name", "Email", "Phone", "Role", "Status", "Joined"], rows.map((u) => [u.name, u.email, u.phone ?? "", u.role, u.status, u.joined]))}
        >
          Export CSV
        </Btn>
        <Btn icon="plus" onClick={() => setEdit({ role: "Student", status: "Active" })}>
          Add user
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Students" value={String(count("Student"))} sub="With login or on the fee ledger" icon="users" />
        <Figure label="Faculty" value={String(count("Faculty"))} sub="Instructors & mentors" icon="lessons" />
        <Figure label="Admins" value={String(count("Admin"))} sub="Console access" icon="shield" />
      </section>

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email, phone…" />
          <Segmented<"All" | Role>
            label="Role"
            value={role}
            onChange={setRole}
            options={[
              { value: "All", label: "All" },
              { value: "Student", label: "Students" },
              { value: "Faculty", label: "Faculty" },
              { value: "Admin", label: "Admins" },
            ]}
          />
        </div>
        <DataGrid minWidth={880}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>User</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>Course</Th>
              <Th>Fees</Th>
              <Th>Account</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[#7B8E89]">
                  Loading…
                </td>
              </tr>
            )}
            {rows.map((u) => {
              const f = u.role === "Student" ? fee(u.name) : null;
              const hasLogin = users.some((x) => x.id === u.id);
              return (
                <tr key={u.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} size={34} />
                      <div>
                        <p className="font-semibold text-brand-ink">{u.name}</p>
                        <p className="text-[11.5px] text-[#6b807b]">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-[#41564f]">{u.phone || "—"}</Td>
                  <Td className="text-brand-ink">{u.role}</Td>
                  <Td>
                    <span className="block max-w-[200px] truncate text-[#41564f]">{f ? f.a.course : "—"}</span>
                  </Td>
                  <Td>
                    {f ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge tone={ACCOUNT_TONE[f.t.status]}>{f.t.status}</StatusBadge>
                        {f.t.outstanding > 0 && <span className="text-[12px] font-semibold tabular-nums text-brand-ink">{inr(f.t.outstanding)}</span>}
                      </div>
                    ) : (
                      <span className="text-[#93a5a0]">—</span>
                    )}
                  </Td>
                  <Td>
                    {hasLogin ? (
                      <StatusBadge tone={u.status === "Active" ? "good" : "critical"}>{u.status}</StatusBadge>
                    ) : (
                      <StatusBadge tone="neutral">No login</StatusBadge>
                    )}
                  </Td>
                  <Td right>
                    {hasLogin ? (
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/admin/settings/privileges?user=${u.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-brand-deep hover:border-brand-teal"
                          title="Manage Module Privileges"
                        >
                          <Icon name="shield" size={13} /> Privileges
                        </Link>
                        <button onClick={() => setEdit(u)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                          Edit
                        </button>
                        <button onClick={() => toggle(u)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                          {u.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEdit({ name: u.name, email: u.email, phone: u.phone, role: "Student", status: "Active" })}
                        className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                      >
                        Invite
                      </button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </DataGrid>
      </Card>

      <Modal open={!!edit} title={edit?.id ? "Edit user" : "Add user"} onClose={() => setEdit(null)}>
        {edit && (
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              save(edit);
            }}
          >
            <div className="col-span-2">
              <Field label="Full name">
                <input required className={inputCls} value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Email">
                <input required type="email" className={inputCls} value={edit.email ?? ""} onChange={(e) => setEdit({ ...edit, email: e.target.value })} />
              </Field>
            </div>
            <Field label="Phone">
              <input className={inputCls} value={edit.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
            </Field>
            <Field label="Role">
              <select className={inputCls} value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as Role })}>
                <option>Student</option>
                <option>Faculty</option>
                <option>Admin</option>
              </select>
            </Field>
            <div className="col-span-2">
              <Field label={edit.id ? "Password (leave blank to keep current)" : "Password"}>
                <input
                  type="password"
                  placeholder={edit.id ? "Leave empty to keep unchanged" : "Enter password for login"}
                  className={inputCls}
                  value={edit.password ?? ""}
                  onChange={(e) => setEdit({ ...edit, password: e.target.value })}
                  required={!edit.id}
                />
              </Field>
            </div>
            <div className="col-span-2 flex justify-end gap-2 pt-1">
              <Btn variant="ghost" onClick={() => setEdit(null)}>
                Cancel
              </Btn>
              <Btn type="submit" icon="check">
                Save
              </Btn>
            </div>
          </form>
        )}
      </Modal>
      <Toast msg={toast} />
    </AdminShell>
  );
}
