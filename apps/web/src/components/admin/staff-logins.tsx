"use client";

import { useEffect, useState } from "react";
import { ADMISSION_CENTRES, centreName } from "@qschool/shared";
import { useStaffMaster } from "@/components/admin/use-staff";
import { Btn, Field, Modal, inputCls } from "@/components/admin/ui";

/** Admin dialog: give a staff member a login (or reset their password) for /staff/tasks, or create a centre login for /staff/students. */
export function StaffLogins({ open, onClose, show }: { open: boolean; onClose: () => void; show: (m: string) => void }) {
  const { active: STAFF } = useStaffMaster();
  const [name, setName] = useState("");
  const [centre, setCentre] = useState(""); // "" = a normal staff login (tasks); otherwise a centre login (students)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [existing, setExisting] = useState<{ name: string; email: string; centre?: string }[]>([]);
  const [err, setErr] = useState("");

  const load = () =>
    fetch("/api/admin/staff-logins", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { logins: [] }))
      .then((j) => setExisting(j.logins ?? []))
      .catch(() => {});

  useEffect(() => {
    if (open) load();
  }, [open]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/staff-logins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name || STAFF[0]?.name || "", email, password, centre }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return setErr(j.error ?? "Could not save");
    setPassword("");
    setEmail("");
    show(`Login saved for ${name}`);
    load();
  };

  return (
    <Modal open={open} title="Staff logins" onClose={onClose}>
      <p className="mb-3 text-[12.5px] text-[#6b807b]">
        Staff sign in at <b>/staff/tasks</b> with these details and can update only their own tasks. Choose a <b>centre</b> to make a centre login: it signs in at <b>/staff/students</b> and sees only that centre&apos;s students. Saving again for the same person resets the password.
      </p>
      <form className="space-y-3" onSubmit={save}>
        <Field label="Login for">
          <select
            className={inputCls}
            value={centre}
            onChange={(e) => {
              setCentre(e.target.value);
              setName(e.target.value ? "" : STAFF[0]?.name ?? "");
            }}
          >
            <option value="">Staff member (tasks)</option>
            {ADMISSION_CENTRES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} centre (students)
              </option>
            ))}
          </select>
        </Field>
        {centre ? (
          <Field label="Centre login name">
            <input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${centreName(centre)} Centre Manager`} />
          </Field>
        ) : (
          <Field label="Staff member">
            <select className={inputCls} value={name || STAFF[0]?.name || ""} onChange={(e) => setName(e.target.value)}>
              {STAFF.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </Field>
        )}
        <Field label="Login email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password (min 8 characters)"><input type="password" required minLength={8} className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <Btn type="submit">Save login</Btn>
      </form>
      {existing.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-[#EEF3F1] pt-3 text-[12.5px] text-[#41564f]">
          {existing.map((l) => (
            <li key={l.email}><b>{l.name}</b> · {l.email}{l.centre ? ` · ${centreName(l.centre)} centre` : ""}</li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
