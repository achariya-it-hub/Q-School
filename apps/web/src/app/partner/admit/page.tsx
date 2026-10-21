"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ADMISSION_CENTRES } from "@qschool/shared";
import { CONCESSION_RULES, type ConcessionType, type Partner } from "@/lib/partners/types";

function PartnerAdmitContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || searchParams.get("code") || "";

  const [partner, setPartner] = useState<Partner | null>(null);
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{
    studentId: string;
    studentName: string;
    fee: number;
    concessionLabel?: string;
  } | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    dob: "",
    grade: "Grade 5",
    school: "",
    parentName: "",
    phone: "",
    email: "",
    address: "",
    centreId: "mk",
    course: "Comprehensive Robotics & AI Program",
    feeAmount: "25000",
    concessionType: "none" as ConcessionType,
  });

  useEffect(() => {
    if (!refCode) {
      setLoadingPartner(false);
      return;
    }
    fetch(`/api/partners/auth?code=${encodeURIComponent(refCode)}&trackClick=1`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && data.partner) {
          setPartner(data.partner);
          if (data.partner.centreId && data.partner.centreId !== "all") {
            setForm((f) => ({ ...f, centreId: data.partner.centreId }));
          }
          if (data.partner.category === "Trainer / HOC") {
            setForm((f) => ({ ...f, concessionType: "trainer_hoc" }));
          } else if (data.partner.category === "Parent Ambassador") {
            setForm((f) => ({ ...f, concessionType: "parent_referral" }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPartner(false));
  }, [refCode]);

  const baseFee = Number(form.feeAmount) || 25000;
  const is50Percent = form.concessionType === "staff_child" || form.concessionType === "sibling";
  const finalPayableFee = is50Percent ? baseFee * 0.5 : baseFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName.trim() || !form.parentName.trim() || !form.phone.trim()) {
      return setError("Please fill all required student and parent fields.");
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/partners/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          feeAmount: finalPayableFee,
          originalFee: baseFee,
          concessionType: form.concessionType,
          partnerCode: refCode || partner?.code || "DIRECT",
          paymentMode: "Pending",
          paymentStatus: "Pending",
          notes: `Parent online submission via referral link (${CONCESSION_RULES[form.concessionType]?.label || "Standard"})`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Admission failed");

      setSuccess({
        studentId: data.studentId,
        studentName: form.studentName,
        fee: finalPayableFee,
        concessionLabel: CONCESSION_RULES[form.concessionType]?.badgeText,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F4F8F7] text-brand-ink flex flex-col justify-between">
      {/* Top Banner */}
      <header className="border-b border-[#E2ECE9] bg-white py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#06473E] to-[#0D9488] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              Q
            </div>
            <div>
              <h1 className="text-base font-bold text-brand-deep leading-tight">Q-School Student Admissions</h1>
              <p className="text-[12px] text-[#7B8E89]">Official Direct Enrolment Portal</p>
            </div>
          </div>
          {partner && (
            <div className="rounded-full bg-[#E3F4F0] px-3 py-1 text-xs font-semibold text-brand-deep hidden sm:flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Partner: {partner.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        {success ? (
          <div className="rounded-2xl border border-[#BDE7D7] bg-white p-8 text-center space-y-5 shadow-xl">
            <div className="inline-flex h-16 w-16 rounded-full bg-[#EAF7EA] text-[#0A7F0A] items-center justify-center">
              <Icon name="checkCircle" size={36} />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Application Received
              </span>
              <h2 className="text-2xl font-bold text-brand-ink mt-2">
                Thank You, {form.parentName}!
              </h2>
              <p className="text-sm text-[#7B8E89] mt-1">
                Admission application for <span className="font-semibold text-brand-ink">{success.studentName}</span> has been successfully registered in our academic system.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-4 text-center max-w-sm mx-auto">
              <span className="text-xs text-[#7B8E89] block">Your Permanent Student ID</span>
              <span className="text-2xl font-mono font-bold text-brand-deep mt-1 block">
                {success.studentId}
              </span>
            </div>

            <p className="text-xs text-[#41564F] max-w-md mx-auto leading-relaxed">
              Our centre coordinator will contact you at <span className="font-semibold">{form.phone}</span> within 24 hours to confirm your student kit, batch timings, and orientation details.
            </p>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex h-11 items-center px-6 rounded-xl bg-brand-deep text-white text-xs font-semibold shadow hover:bg-[#04332D] transition"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#E2ECE9] bg-white p-6 sm:p-8 shadow-sm">
            {partner && (
              <div className="mb-6 rounded-xl border border-[#C5E9DE] bg-[#EAF7EA] p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0A7F0A] block">
                    Special Referral Application
                  </span>
                  <span className="text-[12px] text-[#41564F]">
                    Referred by partner <span className="font-semibold">{partner.name}</span> &bull; Code: <span className="font-mono font-bold">[{partner.code}]</span>
                  </span>
                </div>
                <span className="h-7 px-2.5 rounded-lg bg-white border border-[#BDE7D7] text-xs font-bold text-[#0A7F0A] flex items-center">
                  Verified Code
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-brand-ink">Student Admission Form</h2>
              <p className="text-xs text-[#7B8E89] mt-1">
                Fill in the details below to enrol for Q-School learning programs.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-[#FCEDED] p-3 text-xs font-medium text-[#B42E2E]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav S"
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">Grade / Standard *</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="w-full h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                  >
                    {[
                      "Kindergarten",
                      "Grade 1",
                      "Grade 2",
                      "Grade 3",
                      "Grade 4",
                      "Grade 5",
                      "Grade 6",
                      "Grade 7",
                      "Grade 8",
                      "Grade 9",
                      "Grade 10",
                      "Grade 11",
                      "Grade 12",
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">Current School</label>
                  <input
                    type="text"
                    placeholder="e.g. St. Joseph's"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#EEF3F1]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep mb-3">
                  Parent / Guardian Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={form.parentName}
                      onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Mobile Number * (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">Email ID</label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">Address / Town</label>
                    <input
                      type="text"
                      placeholder="e.g. Moolakulam, Puducherry"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EEF3F1]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep mb-3">
                  Centre & Course Choice
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Preferred Learning Centre *
                    </label>
                    <select
                      value={form.centreId}
                      onChange={(e) => setForm({ ...form, centreId: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    >
                      {ADMISSION_CENTRES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">Program of Interest</label>
                    <select
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    >
                      <option value="Comprehensive Robotics & AI Program">Comprehensive Robotics & AI Program</option>
                      <option value="Vedic Mathematics & Speed Math">Vedic Mathematics & Speed Math</option>
                      <option value="STEM Explorers Foundation">STEM Explorers Foundation</option>
                      <option value="Python Coding & IoT Kit">Python Coding & IoT Kit</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Concession & Referral Policy Selection */}
              <div className="pt-2 border-t border-[#EEF3F1]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep">
                    Concession & Referral Policy
                  </h4>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Official Policy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Concession / Referral Scheme
                    </label>
                    <select
                      value={form.concessionType}
                      onChange={(e) => setForm({ ...form, concessionType: e.target.value as ConcessionType })}
                      className="w-full h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-xs font-semibold focus:border-brand-teal focus:bg-white focus:outline-none"
                    >
                      <option value="none">Standard Admission (No Concession)</option>
                      <option value="staff_child">Staff-Child Concession (50% Fee Waiver)</option>
                      <option value="sibling">Sibling Concession (50% Fee Waiver)</option>
                      <option value="trainer_hoc">Trainer or Centre Head (HOC) Referral (Rs. 2,000 Bonus)</option>
                      <option value="parent_referral">Parent Referral (1-Month Fee Reduction)</option>
                    </select>
                    <p className="text-[11px] text-[#7B8E89] mt-1">
                      {CONCESSION_RULES[form.concessionType]?.description}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">Course Tuition Fee</label>
                    <div className="rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] p-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#7B8E89]">Standard Program Fee:</span>
                        <span className="font-semibold text-brand-ink">₹{baseFee.toLocaleString("en-IN")}</span>
                      </div>
                      {is50Percent && (
                        <div className="flex justify-between items-center text-xs text-emerald-800 font-semibold mt-1">
                          <span>50% Concession Discount:</span>
                          <span>-₹{(baseFee * 0.5).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs font-bold text-brand-deep pt-1.5 mt-1.5 border-t border-[#E2ECE9]">
                        <span>Payable Fee:</span>
                        <span className="text-base text-brand-deep">₹{finalPayableFee.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Policy Highlights Note */}
                <div className="mt-3 rounded-xl border border-[#FFE8A3] bg-[#FFFBEA] p-2.5 text-[11px] text-[#7A5A00] flex items-center justify-between">
                  <span>
                    ⚡ <strong>Policy:</strong> Staff-child & Sibling = 50% concession &bull; Trainer/Centre Head (HOC) = Rs. 2,000 bonus &bull; Parent Referral = 1 mo. fee off (Subject to approval)
                  </span>
                  <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 rounded-xl bg-brand-deep text-white font-bold text-sm shadow-md hover:bg-[#04332D] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? "Submitting Application…" : "Submit Admission Application →"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <footer className="py-4 text-center text-xs text-[#7B8E89]">
        Q-School Educational Systems &bull; All Rights Reserved
      </footer>
    </div>
  );
}

export default function PartnerAdmitPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F8F7] flex items-center justify-center text-sm font-semibold text-brand-deep">
          Loading admission portal...
        </div>
      }
    >
      <PartnerAdmitContent />
    </Suspense>
  );
}
