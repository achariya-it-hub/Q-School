"use client";

import { useCallback, useEffect, useState } from "react";
import { centreName } from "@qschool/shared";
import { Btn, Field, inputCls } from "@/components/admin/ui";
import { StudentsManager } from "@/components/admin/students-view";

/** Centre login: sees only its own centre's admissions and confirms payment to activate them. */
export default function CentreStudentsPortal() {
  const [me, setMe] = useState<{ name: string; centre: string | null } | null | undefined>(undefined); // undefined = checking

  const check = useCallback(async () => {
    const r = await fetch("/api/staff/session", { cache: "no-store" });
    if (!r.ok) return setMe(null);
    const j = await r.json();
    setMe({ name: j.name, centre: j.centre });
  }, []);
  useEffect(() => {
    check().catch(() => setMe(null));
  }, [check]);

  const logout = async () => {
    await fetch("/api/staff/session", { method: "DELETE" });
    setMe(null);
  };

  if (me === undefined) return <main className="min-h-screen bg-[#F3F8F6]" />;
  if (me === null) return <Login onDone={check} />;
  if (!me.centre)
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F3F8F6] p-4">
        <div className="max-w-sm rounded-[20px] border border-[#E2ECE9] bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-bold text-brand-ink">No centre linked</h1>
          <p className="mt-2 text-[13px] text-[#6b807b]">This login is not linked to a learning centre. Ask an admin to create a centre login for you.</p>
          <div className="mt-4 flex justify-center"><Btn variant="ghost" onClick={logout}>Sign out</Btn></div>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-[#F3F8F6] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold text-brand-ink">{centreName(me.centre)} centre · Students</h1>
            <p className="text-sm text-[#6b807b]">Hi {me.name} — confirm the fee payment to move a new admission from Pending to Active.</p>
          </div>
          <Btn variant="ghost" onClick={logout}>Sign out</Btn>
        </div>
        <StudentsManager mode="centre" />
      </div>
    </main>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F8F6] p-4">
      <form
        className="w-full max-w-sm space-y-4 rounded-[20px] border border-[#E2ECE9] bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const r = await fetch("/api/staff/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
          setBusy(false);
          if (r.ok) onDone();
          else setErr((await r.json().catch(() => ({}))).error ?? "Sign-in failed");
        }}
      >
        <h1 className="text-xl font-bold text-brand-ink">Centre sign in</h1>
        <p className="text-[13px] text-[#6b807b]">Use the centre login created by the Q-School admin.</p>
        <Field label="Email"><input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Field>
        <Field label="Password"><input type="password" required className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></Field>
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <Btn type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Btn>
      </form>
    </main>
  );
}
