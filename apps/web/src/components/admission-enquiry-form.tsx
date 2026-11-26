"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMISSION_CENTRES, getProgramForAge } from "@qschool/shared";

const AGES = ["6", "7", "8", "9", "10", "11", "12", "13", "14"];
const TIMES = ["Morning (9am – 12pm)", "Afternoon (12pm – 4pm)", "Evening (4pm – 8pm)", "Any time"];
const ONLINE = "online";

const field =
  "w-full rounded-xl border border-[#dce8e4] bg-white px-4 py-3 text-sm text-brand-ink outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20";

/**
 * Admission enquiry form for the /admissions landing page.
 * Posts to /api/leads, which creates the lead in the CRM pipeline (stage Enquiry), assigns an owner,
 * pins it to the chosen centre and keeps the campaign (UTM) it came from.
 */
export function AdmissionEnquiryForm({ id = "enquire" }: { id?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [age, setAge] = useState("");
  const [track, setTrack] = useState<Record<string, string>>({});

  // Campaign tracking: ?utm_source=…&utm_medium=…&utm_campaign=…&ref=… (kept on the lead for reports).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const t: Record<string, string> = {};
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "ref"]) {
      const v = q.get(k);
      if (v) t[k] = v;
    }
    setTrack(t);
  }, []);

  const program = useMemo(() => (age ? getProgramForAge(age) : null), [age]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const f = new FormData(e.currentTarget);
    const centre = String(f.get("centre") || "");
    const centreName = centre === ONLINE ? "Live online cohort" : ADMISSION_CENTRES.find((c) => c.id === centre)?.name || "";
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landing: "admission",
          name: f.get("parentName"),
          phone: f.get("phone"),
          email: f.get("email"),
          childName: f.get("childName"),
          childAge: f.get("childAge"),
          interest: program ? program.name : "Admission enquiry",
          centreId: centre === ONLINE ? undefined : centre,
          city: centreName,
          preferredTime: f.get("time"),
          message: f.get("message"),
          website: f.get("website"), // honeypot
          ...track,
        }),
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Something went wrong. Please try again or call us.");
      setStatus("error");
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div id={id} className="rounded-3xl border border-brand-teal bg-white p-7 text-center shadow-2xl sm:p-9">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal100 text-3xl text-brand-deep">✓</span>
        <h3 className="mt-4 text-2xl font-extrabold text-brand-deep">Thank you! We have your enquiry.</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-[#334b45]">
          A Q-School counsellor will call you within <b>24 hours</b> to understand your child&apos;s needs and book the next step, a BMIT assessment at your preferred centre.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href="/admission" className="btn-3d btn-3d-teal inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-extrabold">
            Fill the full admission form
          </a>
          <a
            href="https://wa.me/919944454840?text=Hi%20Q-School%2C%20I%20just%20enquired%20about%20admission."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-brand-teal px-4 py-3 text-sm font-extrabold text-brand-deep hover:bg-brand-teal100"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={onSubmit} className="space-y-3.5 rounded-3xl border border-white/30 bg-white p-6 text-brand-ink shadow-2xl sm:p-8">
      <div>
        <h2 className="text-xl font-extrabold text-brand-deep sm:text-2xl">Start your child&apos;s admission</h2>
        <p className="mt-1 text-[13px] text-[#5d716b]">Takes a minute. A counsellor calls you within 24 hours.</p>
      </div>

      {/* Honeypot: hidden from people, bots fill it */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="parentName" required maxLength={120} placeholder="Parent's name *" autoComplete="name" className={field} />
        <input
          name="phone"
          required
          type="tel"
          inputMode="tel"
          pattern="[0-9+ \-]{10,16}"
          title="Enter a 10-digit mobile number"
          placeholder="Mobile / WhatsApp *"
          autoComplete="tel"
          className={field}
        />
      </div>
      <input name="email" type="email" maxLength={160} placeholder="Email (optional)" autoComplete="email" className={field} />

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="childName" required maxLength={120} placeholder="Child's name *" className={field} />
        <select name="childAge" required value={age} onChange={(e) => setAge(e.target.value)} className={`${field} ${age ? "" : "text-[#6b807b]"}`}>
          <option value="" disabled>
            Child&apos;s age *
          </option>
          {AGES.map((a) => (
            <option key={a} value={a}>
              {a} years
            </option>
          ))}
        </select>
      </div>
      {program && (
        <p className="rounded-xl bg-brand-teal100/70 px-3.5 py-2 text-[13px] font-semibold text-brand-deep">
          Recommended programme for age {age}: {program.name}
        </p>
      )}

      <select name="centre" required defaultValue="" className={`${field} text-[#41564f]`}>
        <option value="" disabled>
          Preferred centre *
        </option>
        {ADMISSION_CENTRES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value={ONLINE}>Live online cohort</option>
      </select>

      <select name="time" defaultValue="" className={`${field} text-[#41564f]`}>
        <option value="">Best time to call (optional)</option>
        {TIMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <textarea name="message" rows={2} maxLength={500} placeholder="Anything we should know? (optional)" className={`${field} resize-none`} />

      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-[#5d716b]">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E937E]" />
        <span>I agree to be contacted by Q-School on call and WhatsApp about this admission.</span>
      </label>

      <button type="submit" disabled={status === "loading"} className="btn-3d btn-3d-teal w-full rounded-xl py-3.5 text-[15px] font-extrabold disabled:opacity-70">
        {status === "loading" ? "Sending…" : "Request admission call-back"}
      </button>
      {status === "error" && <p role="alert" className="text-center text-[13px] font-semibold text-red-600">{error}</p>}
    </form>
  );
}
