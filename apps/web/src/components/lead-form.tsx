"use client";

import { useState } from "react";

export function LeadForm({ source, cta = "Register free" }: { source: string; cta?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          interest: form.get("interest"),
          source,
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-brand-teal bg-brand-teal100/60 p-6 text-center">
        <p className="text-lg font-semibold text-brand-deep">✅ You're in!</p>
        <p className="mt-1 text-sm text-[#41564f]">
          Our counsellor will reach out on WhatsApp within an hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Student name"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
        <input
          name="phone"
          required
          type="tel"
          pattern="[0-9+ -]{8,15}"
          placeholder="WhatsApp number"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="email"
          type="email"
          placeholder="Email (optional)"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
        <select
          name="interest"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm text-[#41564f] outline-none focus:border-brand-teal"
        >
          <option value="">Interested in…</option>
          <option>Design Thinking</option>
          <option>Coding for Beginners</option>
          <option>Creative Writing</option>
          <option>Robotics Workshop</option>
          <option>Communication / Public Speaking</option>
          <option>JEE / NEET</option>
          <option>Other</option>
        </select>
      </div>
      <p className="text-[12px] text-[#6b807b]">By submitting, you agree to receive course updates on WhatsApp. Reply STOP any time to opt out.</p>
      <button type="submit" disabled={status === "loading"} className="btn-primary btn-3d btn-3d-teal w-full disabled:opacity-70">
        {status === "loading" ? "Registering…" : cta}
      </button>
      {status === "error" && (
        <p className="text-center text-xs text-red-600">Something went wrong — please retry.</p>
      )}
      <p className="text-center text-[11px] text-[#8aa39c]">
        By registering you agree to be contacted about Q-School programs.
      </p>
    </form>
  );
}
