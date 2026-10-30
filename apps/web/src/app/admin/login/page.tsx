"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";

const DEMO = process.env.NODE_ENV !== "production";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return setError("Enter your email and password.");
    setLoading(true);
    setError("");
    // Server session (httpOnly cookie) — replaced by Better Auth (RBAC: superadmin > admin > crm_agent > instructor) later.
    fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Sign-in failed");
        const data = await r.json().catch(() => ({}));
        try {
          const userObj = data.user || { email: email.trim().toLowerCase(), name: "Faculty", role: "Faculty" };
          localStorage.setItem("qschool_admin_session", JSON.stringify(userObj));
        } catch {}
        router.push("/admin/dashboard");
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#06473E] via-[#043A33] to-[#02231F] p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#0E937E66_0%,transparent_65%)]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-light.png" alt="Q-School" className="relative h-14 w-auto self-start" />
        <div className="relative mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#7FE3CF]">Q-School Console</p>
          <h1 className="mt-3 text-[40px] font-bold leading-tight">
            Run admissions, fees
            <br />
            and classes in <span className="text-[#2BD6B4]">one place</span>
          </h1>
          <ul className="mt-6 space-y-2.5 text-[14px] text-white/85">
            {["CRM pipeline & follow-ups", "Fees, invoices, receipts & GST", "Live schedule, staff & inventory"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[#2BD6B4]">
                  <Icon name="check" size={14} strokeWidth={2.4} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-[380px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Q-School" className="mb-8 h-12 w-auto lg:hidden" />
          <h2 className="text-[26px] font-bold text-brand-ink">Sign in to Console</h2>
          <p className="mt-1 text-sm text-[#6b807b]">Staff and admin access only.</p>

          <label className="mt-8 block">
            <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Work email</span>
            <span className="flex h-12 items-center gap-3 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-4 focus-within:border-brand-teal focus-within:bg-white">
              <Icon name="message" size={18} className="text-[#7b908b]" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@theqschool.com or admin@qschool.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">Password</span>
            <span className="flex h-12 items-center gap-3 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-4 focus-within:border-brand-teal focus-within:bg-white">
              <Icon name="shield" size={18} className="text-[#7b908b]" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="text-[#7b908b]" aria-label={show ? "Hide password" : "Show password"}>
                <Icon name="eye" size={18} />
              </button>
            </span>
          </label>

          {error && <p className="mt-3 text-[13px] font-medium text-[#B42E2E]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#0B6E5F] to-[#054038] text-[15px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(5,64,56,.7)] transition hover:from-[#0E937E] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"} {!loading && <Icon name="arrowRight" size={17} />}
          </button>

          <p className="mt-4 rounded-xl bg-[#F3F8F6] px-3 py-2.5 text-[12px] text-[#41564f]">
            Admin credentials: <span className="font-mono font-medium">admin@theqschool.com</span> / <span className="font-mono font-medium">admin123</span>
          </p>
          <Link href="/" className="mt-6 inline-flex items-center gap-1 text-[13px] font-semibold text-brand-teal hover:underline">
            <Icon name="chevLeft" size={15} /> Back to website
          </Link>
        </form>
      </section>
    </main>
  );
}
