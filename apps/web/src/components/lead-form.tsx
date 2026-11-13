"use client";

import { useState } from "react";

const INTEREST_OPTIONS = [
  "Q-Vision",
  "Q-Creation",
  "Q-Way",
  "Q-Learning",
  "Q-Reading",
  "Q-Mastery",
  "Q-Maths",
  "Q-Science",
  "Not sure yet",
];

const CENTRE_OPTIONS = [
  "Chennai – Valasaravakkam",
  "Chennai – Adyar",
  "Bengaluru – Kasturi Nagar",
  "Bengaluru – Whitefield",
  "Puducherry – Moolakulam",
  "Hyderabad – Banjara Hills",
  "Trichy – Thillai Nagar",
  "Pune – Aundh",
  "Coimbatore – Saibaba Colony",
  "Live Online Cohort",
];

export function LeadForm({
  source,
  cta = "Book a BMIT Assessment",
  defaultProgram,
}: {
  source: string;
  cta?: string;
  defaultProgram?: string;
}) {
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
          childAge: form.get("childAge"),
          city: form.get("city"),
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
      <div className="rounded-2xl border border-brand-teal bg-brand-teal100/70 p-6 sm:p-8 text-center">
        <h4 className="text-xl sm:text-2xl font-extrabold text-brand-deep leading-snug">
          Thank You! Your Child&apos;s Learning Journey Starts Here!
        </h4>
        <div className="mt-4 space-y-3 text-sm sm:text-[15px] text-[#334b45] leading-relaxed">
          <p className="font-semibold text-brand-deep">Thank you for choosing Q-School!</p>
          <p>
            We have successfully received your demo class registration. Our counselling team will contact you within 24 hours to understand your child&apos;s learning needs and help you schedule your free 45-minute demo session.
          </p>
          <p>
            We look forward to welcoming your child to the Q-School learning experience!
          </p>
        </div>
        <div className="mt-6">
          <a
            href="#"
            onClick={() => setStatus("idle")}
            className="btn-primary btn-3d btn-3d-teal inline-flex items-center justify-center rounded-xl px-6 py-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider"
          >
            BACK TO HOME
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Parent's name"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
        <input
          name="phone"
          required
          type="tel"
          pattern="[0-9+ -]{8,15}"
          placeholder="Phone (WhatsApp)"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          name="childAge"
          required
          placeholder="Child's age or grade (Ages 6–14)"
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal"
        />
        <select
          name="city"
          required
          defaultValue=""
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm text-[#41564f] outline-none focus:border-brand-teal"
        >
          <option value="" disabled>
            City / preferred centre
          </option>
          {CENTRE_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <select
          name="interest"
          required
          defaultValue={defaultProgram || ""}
          className="w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm text-[#41564f] outline-none focus:border-brand-teal"
        >
          <option value="" disabled>
            Interested in…
          </option>
          {INTEREST_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
      <p className="text-[12px] text-[#6b807b] leading-relaxed">
        By submitting, you agree to be contacted by Q-School on call and WhatsApp. Reply STOP at any time to opt out.
      </p>
      <button type="submit" disabled={status === "loading"} className="btn-primary btn-3d btn-3d-teal w-full disabled:opacity-70">
        {status === "loading" ? "Submitting…" : cta}
      </button>
      {status === "error" && (
        <p className="text-center text-xs text-red-600">Something went wrong — please retry.</p>
      )}
    </form>
  );
}
