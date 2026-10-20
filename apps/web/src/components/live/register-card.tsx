"use client";

import { useState } from "react";
import Link from "next/link";

/** Inline registration for one live session. Shows the personal join link on success. */
export function RegisterButton({ sessionId, title, full }: { sessionId: string; title: string; full: boolean }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ joinPath: string; again: boolean } | null>(null);

  if (full) return <span className="rounded-xl bg-[#f1f5f4] px-4 py-2.5 text-[13px] font-semibold text-[#6b807b]">Full</span>;

  if (done)
    return (
      <div className="w-full rounded-2xl border border-brand-teal/30 bg-brand-teal100/50 p-4 text-[13.5px] text-brand-deep">
        <p className="font-semibold">{done.again ? "You're already registered." : "You're in! 🎉"}</p>
        <p className="mt-1 text-[#41564f]">Save your personal join link. It opens the live room when the host starts.</p>
        <Link href={done.joinPath} className="btn-primary btn-3d btn-3d-teal mt-3 !px-4 !py-2.5">
          Open my join page →
        </Link>
      </div>
    );

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn-primary btn-3d btn-3d-teal !px-4 !py-2.5">
        Register free
      </button>
    );

  return (
    <form
      className="grid w-full gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
      aria-label={`Register for ${title}`}
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setErr("");
        const r = await fetch("/api/live/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, name: f.get("name"), phone: f.get("phone"), email: f.get("email") }),
        });
        const d = await r.json().catch(() => ({}));
        setBusy(false);
        if (!r.ok) return setErr(d.error ?? "Could not register. Please try again.");
        setDone({ joinPath: d.joinPath, again: d.again });
      }}
    >
      <input name="name" required maxLength={80} placeholder="Student name" className="rounded-xl border border-[#dce8e4] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-teal" />
      <input name="phone" required inputMode="tel" maxLength={20} placeholder="WhatsApp number" className="rounded-xl border border-[#dce8e4] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-teal" />
      <input name="email" type="email" maxLength={160} placeholder="Email (optional)" className="rounded-xl border border-[#dce8e4] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-teal" />
      <button disabled={busy} className="btn-primary btn-3d btn-3d-teal !px-4 !py-2.5 disabled:opacity-60">
        {busy ? "…" : "Confirm"}
      </button>
      <p className="text-[12px] text-[#6b807b] sm:col-span-4">You'll get your join link and reminders on WhatsApp. Reply STOP any time to opt out.</p>
      {err && <p className="text-[12.5px] text-[#C22F33] sm:col-span-4">{err}</p>}
    </form>
  );
}
