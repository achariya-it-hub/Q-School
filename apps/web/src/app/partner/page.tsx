"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { ADMISSION_CENTRES, centreName } from "@qschool/shared";
import {
  CONCESSION_RULES,
  type ConcessionType,
  type Partner,
  type PartnerAdmission,
} from "@/lib/partners/types";

function PartnerContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code") || searchParams.get("ref") || "";

  const [partnerCode, setPartnerCode] = useState("");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [admissions, setAdmissions] = useState<PartnerAdmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "admit" | "history" | "payouts">("dashboard");
  const [toast, setToast] = useState("");

  // New Admission Form State
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
    originalFee: "25000",
    feeAmount: "25000",
    concessionType: "none" as ConcessionType,
    paymentMode: "Cash",
    paymentStatus: "Paid" as "Paid" | "Partial" | "Pending",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [admissionSuccess, setAdmissionSuccess] = useState<{
    studentId: string;
    admission: PartnerAdmission;
  } | null>(null);

  // Bank details form state
  const [bankForm, setBankForm] = useState({
    upiId: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [savingBank, setSavingBank] = useState(false);

  // Search filter for admissions history
  const [historySearch, setHistorySearch] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Login with partner code
  const loginWithCode = useCallback(async (codeToUse: string) => {
    if (!codeToUse.trim()) return;
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/partners/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToUse.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Partner login failed");

      setPartner(data.partner);
      setAdmissions(data.admissions || []);
      setPartnerCode(data.partner.code);
      if (typeof window !== "undefined") {
        localStorage.setItem("qs_partner_code", data.partner.code);
      }
      if (data.partner.bankDetails) {
        setBankForm({
          upiId: data.partner.bankDetails.upiId || "",
          accountName: data.partner.bankDetails.accountName || "",
          accountNumber: data.partner.bankDetails.accountNumber || "",
          ifscCode: data.partner.bankDetails.ifscCode || "",
        });
      }
      showToast(`Welcome back, ${data.partner.name}!`);
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check saved code or URL param on load
  useEffect(() => {
    const saved = codeParam || (typeof window !== "undefined" ? localStorage.getItem("qs_partner_code") || "" : "");
    if (saved) {
      setPartnerCode(saved);
      loginWithCode(saved);
    }
  }, [codeParam, loginWithCode]);

  const handleLogout = () => {
    setPartner(null);
    setAdmissions([]);
    setPartnerCode("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("qs_partner_code");
    }
  };

  // Concession & Fee breakdown calculation
  const concessionInfo = useMemo(() => {
    const orig = Number(form.originalFee) || Number(form.feeAmount) || 0;
    const rule = CONCESSION_RULES[form.concessionType] || CONCESSION_RULES.none;
    let disc = 0;
    let net = orig;
    if (form.concessionType === "staff_child" || form.concessionType === "sibling") {
      disc = Math.round(orig * 0.5);
      net = Math.max(0, orig - disc);
    }
    return { orig, disc, net, rule };
  }, [form.originalFee, form.feeAmount, form.concessionType]);

  // Calculate live expected commission on the admission form
  const expectedCommission = useMemo(() => {
    if (!partner) return 0;
    if (partner.category === "Trainer / HOC" || form.concessionType === "trainer_hoc") {
      return 2000; // Flat Rs. 2,000 as per Q-School Policy
    }
    const fee = concessionInfo.net;
    if (partner.commissionType === "percentage") {
      return Math.round((fee * partner.commissionValue) / 100);
    }
    return partner.commissionValue;
  }, [partner, concessionInfo.net, form.concessionType]);

  // Handle direct admission submit by partner
  const handleAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    if (!form.studentName.trim() || !form.parentName.trim() || !form.phone.trim()) {
      showToast("Please fill all required student and parent fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/partners/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          partnerCode: partner.code,
          originalFee: concessionInfo.orig,
          feeAmount: concessionInfo.net,
          concessionType: form.concessionType,
          concessionAmount: concessionInfo.disc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Admission failed");

      setAdmissionSuccess({
        studentId: data.studentId,
        admission: data.admission,
      });

      // Refresh partner and admissions state
      setAdmissions((prev) => [data.admission, ...prev]);
      loginWithCode(partner.code);
      showToast(`🎉 Admission recorded! Student ID: ${data.studentId}`);
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset admission form for another entry
  const resetAdmissionForm = () => {
    setAdmissionSuccess(null);
    setForm({
      studentName: "",
      dob: "",
      grade: "Grade 5",
      school: "",
      parentName: "",
      phone: "",
      email: "",
      address: "",
      centreId: partner?.centreId !== "all" ? (partner?.centreId || "mk") : "mk",
      course: "Comprehensive Robotics & AI Program",
      originalFee: "25000",
      feeAmount: "25000",
      concessionType: "none",
      paymentMode: "Cash",
      paymentStatus: "Paid",
      notes: "",
    });
    setActiveTab("admit");
  };

  // Save bank / UPI details
  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    setSavingBank(true);
    try {
      const res = await fetch("/api/partners/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: partner.code,
          bankDetails: bankForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update bank details");
      setPartner(data.partner);
      showToast("Bank & UPI details saved successfully!");
    } catch (err) {
      showToast((err as Error).message);
    } finally {
      setSavingBank(false);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${origin}/partner/admit?ref=${partner?.code || ""}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    showToast("Referral link copied to clipboard!");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello! Q-School admissions are now open for Robotics, AI & STEM programs for Grades 1 to 12. You can register through our official direct admission portal link: ${referralLink} to avail special curriculum benefits and guidance.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const shareAdmissionSlip = (studentId: string, studentName: string, parentPhone: string) => {
    const text = encodeURIComponent(
      `Dear Parent, we are pleased to confirm that admission for *${studentName}* has been successfully registered at Q-School Learning Centre! Student ID: *${studentId}*. Our centre manager will contact you shortly with your class schedule.`
    );
    window.open(`https://api.whatsapp.com/send?phone=${parentPhone.replace(/\D/g, "")}&text=${text}`, "_blank");
  };

  const filteredAdmissions = useMemo(() => {
    if (!historySearch.trim()) return admissions;
    const q = historySearch.toLowerCase();
    return admissions.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.parentName.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        a.studentId.toLowerCase().includes(q) ||
        a.centreName.toLowerCase().includes(q)
    );
  }, [admissions, historySearch]);

  /* ───────── SCREEN 1: PARTNER LOGIN SCREEN ───────── */
  if (!partner) {
    return (
      <div className="min-h-screen bg-[#F4F8F7] text-brand-ink flex flex-col justify-between">
        <header className="border-b border-[#E2ECE9] bg-white py-4 px-6 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#06473E] to-[#0D9488] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                Q
              </div>
              <div>
                <h1 className="text-base font-bold text-brand-deep leading-tight">Q-School Partner App</h1>
                <p className="text-[12px] text-[#7B8E89]">Admission Referrals & Marketer Portal</p>
              </div>
            </div>
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-[#0B6E5F] hover:underline"
            >
              Admin Console →
            </Link>
          </div>
        </header>

        <main className="max-w-lg mx-auto w-full px-4 py-12 flex-1 flex flex-col justify-center">
          <div className="rounded-2xl border border-[#E2ECE9] bg-white p-7 shadow-xl">
            <div className="text-center mb-6">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#E3F4F0] text-brand-teal mb-3">
                <Icon name="community" size={24} />
              </span>
              <h2 className="text-2xl font-bold text-brand-ink">Marketer & Partner Sign-In</h2>
              <p className="text-sm text-[#7B8E89] mt-1">
                Enter your unique referral code to process student admissions and track your commission payouts.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                loginWithCode(partnerCode);
              }}
              className="space-y-4"
            >
              {authError && (
                <div className="rounded-xl bg-[#FCEDED] p-3 text-[13px] font-medium text-[#B42E2E]">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#41564F] mb-1.5">
                  Partner Referral Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. MKT-BALA or ACH-PUDU"
                  value={partnerCode}
                  onChange={(e) => setPartnerCode(e.target.value.toUpperCase())}
                  required
                  className="w-full h-12 px-4 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-base font-mono font-bold tracking-wider text-brand-deep uppercase placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-brand-teal focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-brand-deep text-white font-semibold shadow hover:bg-[#04332D] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Access Marketer Portal →"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#EEF3F1]">
              <p className="text-xs font-semibold text-[#7B8E89] mb-2 text-center uppercase tracking-wider">
                Quick Demo Marketers:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { code: "MKT-BALA", name: "Bala Murugan" },
                  { code: "ACH-PUDU", name: "Achariya School" },
                  { code: "EDT-KAVI", name: "Kavitha R." },
                ].map((demo) => (
                  <button
                    key={demo.code}
                    onClick={() => {
                      setPartnerCode(demo.code);
                      loginWithCode(demo.code);
                    }}
                    className="p-2 rounded-lg border border-[#E2ECE9] bg-[#F9FBFA] hover:bg-[#E3F4F0] text-center transition"
                  >
                    <div className="text-[11px] font-bold text-brand-deep">{demo.code}</div>
                    <div className="text-[10px] text-[#7B8E89] truncate">{demo.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-[#7B8E89]">
          Q-School ERP &bull; Admissions & Partnership Network &bull; Secured System
        </footer>
      </div>
    );
  }

  /* ───────── SCREEN 2: ACTIVE PARTNER PORTAL ───────── */
  return (
    <div className="min-h-screen bg-[#F4F8F7] text-brand-ink">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#E2ECE9] bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#06473E] to-[#0D9488] flex items-center justify-center text-white font-bold text-base shadow-sm">
              Q
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-ink text-sm sm:text-base">{partner.name}</span>
                <span className="rounded-full bg-[#E3F4F0] px-2 py-0.5 text-[10px] font-bold text-brand-deep uppercase">
                  {partner.code}
                </span>
              </div>
              <p className="text-[11px] text-[#7B8E89] hidden sm:block">
                {partner.category} &bull; {partner.organization || "Direct Marketer"} &bull;{" "}
                Commission: {partner.commissionValue}
                {partner.commissionType === "percentage" ? "%" : "₹ flat"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetAdmissionForm();
                setActiveTab("admit");
              }}
              className="h-9 px-3.5 rounded-lg bg-brand-deep text-white text-xs font-semibold shadow hover:bg-[#04332D] transition flex items-center gap-1.5"
            >
              <Icon name="plus" size={14} />
              <span>+ New Admission</span>
            </button>
            <button
              onClick={handleLogout}
              className="h-9 px-2.5 rounded-lg border border-[#D5E3DF] text-xs font-medium text-[#7B8E89] hover:bg-[#F1F5F4] transition"
              title="Switch Partner Code"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="max-w-6xl mx-auto px-4 flex gap-6 overflow-x-auto text-[13px] font-medium border-t border-[#F1F5F4]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === "dashboard"
                ? "border-brand-teal text-brand-teal font-bold"
                : "border-transparent text-[#7B8E89] hover:text-brand-ink"
            }`}
          >
            Dashboard & Links
          </button>
          <button
            onClick={() => setActiveTab("admit")}
            className={`py-2.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "admit"
                ? "border-brand-teal text-brand-teal font-bold"
                : "border-transparent text-[#7B8E89] hover:text-brand-ink"
            }`}
          >
            <span>Direct Admission Form</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2">
              ERP
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === "history"
                ? "border-brand-teal text-brand-teal font-bold"
                : "border-transparent text-[#7B8E89] hover:text-brand-ink"
            }`}
          >
            My Admissions ({admissions.length})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`py-2.5 border-b-2 transition whitespace-nowrap ${
              activeTab === "payouts"
                ? "border-brand-teal text-brand-teal font-bold"
                : "border-transparent text-[#7B8E89] hover:text-brand-ink"
            }`}
          >
            Earnings & Payouts
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* TAB 1: DASHBOARD & SHARE */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-4 shadow-sm">
                <span className="text-[12px] font-semibold text-[#7B8E89] uppercase tracking-wider block">
                  Admissions Converted
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-brand-ink">
                    {partner.stats.totalAdmissions}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ERP Synced
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-4 shadow-sm">
                <span className="text-[12px] font-semibold text-[#7B8E89] uppercase tracking-wider block">
                  Total Commission Earned
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-emerald-700">
                    ₹{partner.stats.totalCommission.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-[#7B8E89]">
                    {partner.commissionValue}
                    {partner.commissionType === "percentage" ? "%" : "₹"} rate
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-4 shadow-sm">
                <span className="text-[12px] font-semibold text-[#7B8E89] uppercase tracking-wider block">
                  Pending Payout
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-amber-700">
                    ₹{partner.stats.pendingCommission.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                    Under Review
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-4 shadow-sm">
                <span className="text-[12px] font-semibold text-[#7B8E89] uppercase tracking-wider block">
                  Gross Fees Generated
                </span>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-3xl font-bold text-brand-deep">
                    ₹{partner.stats.totalRevenue.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-[#7B8E89]">{partner.stats.totalClicks} clicks</span>
                </div>
              </div>
            </div>

            {/* REFERRAL BONUS & CONCESSION POLICY CARD */}
            <div className="rounded-2xl border-2 border-[#E8D988] bg-gradient-to-r from-[#FFFBE6] via-[#FFFDEB] to-[#FFF9D6] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md bg-[#FFE600] text-black font-extrabold text-[12px] uppercase tracking-wider shadow-xs border border-[#D9C400]">
                    REFERRAL BONUS & CONCESSION
                  </span>
                  <span className="text-xs font-semibold text-[#66540B] hidden sm:inline">
                    Official Incentive & Fee Waiver Schemes
                  </span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white/90 rounded-xl p-3.5 border border-[#E8D988] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#735F12] block">Trainer / HOC Referral</span>
                  <span className="text-base font-extrabold text-black mt-0.5 block">Rs. 2,000</span>
                  <span className="text-[10.5px] text-[#8C7620] mt-0.5 block">Organic Lead Referral Bonus</span>
                </div>
                <div className="bg-white/90 rounded-xl p-3.5 border border-[#E8D988] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#735F12] block">Parent Referral</span>
                  <span className="text-base font-extrabold text-black mt-0.5 block">1 Month Fee Off</span>
                  <span className="text-[10.5px] text-[#8C7620] mt-0.5 block">Per Successful Admission</span>
                </div>
                <div className="bg-white/90 rounded-xl p-3.5 border border-[#E8D988] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#735F12] block">Staff-Child Concession</span>
                  <span className="text-base font-extrabold text-black mt-0.5 block">50% Fee Concession</span>
                  <span className="text-[10.5px] text-[#8C7620] mt-0.5 block">For active staff children</span>
                </div>
                <div className="bg-white/90 rounded-xl p-3.5 border border-[#E8D988] shadow-xs">
                  <span className="text-[11px] font-semibold text-[#735F12] block">Sibling Concession</span>
                  <span className="text-base font-extrabold text-black mt-0.5 block">50% Fee Concession</span>
                  <span className="text-[10.5px] text-[#8C7620] mt-0.5 block">For 2nd child / sibling</span>
                </div>
              </div>
            </div>

            {/* Share Referral Link Card */}
            <div className="rounded-2xl border border-[#C5E9DE] bg-gradient-to-br from-[#EAF7EA] via-[#F4FAF7] to-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Icon name="link" size={16} />
                    </span>
                    <h3 className="text-lg font-bold text-brand-ink">Your Dedicated Admission Link</h3>
                  </div>
                  <p className="text-sm text-[#41564F] mt-1 max-w-xl">
                    Share this unique link with parents via WhatsApp or QR code. Any parent who applies online
                    will be automatically attributed to your partner code <span className="font-bold">[{partner.code}]</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={shareOnWhatsApp}
                    className="h-10 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow hover:bg-[#1EBE5B] transition flex items-center gap-1.5"
                  >
                    <Icon name="message" size={16} />
                    <span>WhatsApp Invite</span>
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="h-10 px-3.5 rounded-xl border border-[#D5E3DF] bg-white text-xs font-semibold text-brand-ink hover:bg-[#F1F5F4] transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Icon name="camera" size={15} />
                    <span>Show QR</span>
                  </button>
                </div>
              </div>

              {/* URL Display Bar */}
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#D0E5DF] bg-white p-2 shadow-inner">
                <span className="font-mono text-xs text-brand-deep truncate flex-1 px-2 select-all">
                  {referralLink}
                </span>
                <button
                  onClick={copyReferralLink}
                  className="px-3 py-1.5 rounded-lg bg-[#E3F4F0] text-brand-deep hover:bg-brand-teal hover:text-white transition text-xs font-semibold shrink-0"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => {
                  resetAdmissionForm();
                  setActiveTab("admit");
                }}
                className="cursor-pointer rounded-2xl border border-[#E2ECE9] bg-white p-5 hover:border-brand-teal hover:shadow-md transition flex items-start gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon name="plus" size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-brand-ink">Make Direct Admission (On-Field)</h4>
                  <p className="text-xs text-[#7B8E89] mt-1 leading-relaxed">
                    Meeting a parent in person or at a school expo? Fill their admission directly.
                    Generates ERP Student ID immediately!
                  </p>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("history")}
                className="cursor-pointer rounded-2xl border border-[#E2ECE9] bg-white p-5 hover:border-brand-teal hover:shadow-md transition flex items-start gap-4"
              >
                <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Icon name="lessons" size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-brand-ink">View Admissions Ledger</h4>
                  <p className="text-xs text-[#7B8E89] mt-1 leading-relaxed">
                    Track all {admissions.length} admissions you have registered, verify their admission status in ERP,
                    and check payment commissions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT ADMISSION FORM (ON-FIELD BY MARKETER) */}
        {activeTab === "admit" && (
          <div className="max-w-3xl mx-auto">
            {admissionSuccess ? (
              /* Success Confirmation Card */
              <div className="rounded-2xl border border-[#BDE7D7] bg-white p-6 shadow-xl text-center space-y-5">
                <div className="inline-flex h-16 w-16 rounded-full bg-[#EAF7EA] text-[#0A7F0A] items-center justify-center">
                  <Icon name="checkCircle" size={36} />
                </div>

                <div>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    ERP Admission Registered
                  </span>
                  <h3 className="text-2xl font-bold text-brand-ink mt-2">
                    Admission Confirmed for {admissionSuccess.admission.studentName}
                  </h3>
                  <p className="text-sm text-[#7B8E89] mt-1">
                    The student has been saved directly to the Q-School ERP Student Roster.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-4 text-left grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#7B8E89] block">ERP Student ID</span>
                    <span className="font-mono font-bold text-brand-deep text-sm">
                      {admissionSuccess.studentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#7B8E89] block">Parent Name</span>
                    <span className="font-semibold text-brand-ink">{admissionSuccess.admission.parentName}</span>
                  </div>
                  <div>
                    <span className="text-[#7B8E89] block">Centre</span>
                    <span className="font-semibold text-brand-ink">{admissionSuccess.admission.centreName}</span>
                  </div>
                  <div>
                    <span className="text-[#7B8E89] block">Commission Earned</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      ₹{admissionSuccess.admission.commissionAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() =>
                      shareAdmissionSlip(
                        admissionSuccess.studentId,
                        admissionSuccess.admission.studentName,
                        admissionSuccess.admission.phone
                      )
                    }
                    className="w-full sm:w-auto h-11 px-5 rounded-xl bg-[#25D366] text-white text-xs font-bold shadow hover:bg-[#1EBE5B] transition flex items-center justify-center gap-2"
                  >
                    <Icon name="message" size={16} />
                    <span>Send Slip to Parent on WhatsApp</span>
                  </button>

                  <button
                    onClick={resetAdmissionForm}
                    className="w-full sm:w-auto h-11 px-5 rounded-xl bg-brand-deep text-white text-xs font-semibold shadow hover:bg-[#04332D] transition flex items-center justify-center gap-1.5"
                  >
                    <span>+ Admit Another Student</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Admission Entry Form */
              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#EEF3F1] mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-brand-ink">Direct Student Admission Form</h3>
                    <p className="text-xs text-[#7B8E89] mt-0.5">
                      Enter student details right here on the field. Records immediately into the central ERP!
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[11px] font-semibold text-[#7B8E89] block">Attributed Marketer</span>
                    <span className="text-xs font-bold text-brand-deep font-mono">
                      {partner.name} ({partner.code})
                    </span>
                  </div>
                </div>

                <form onSubmit={handleAdmissionSubmit} className="space-y-5">
                  {/* Section 1: Student Information */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep mb-3 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-[#E3F4F0] text-brand-deep flex items-center justify-center text-[11px]">
                        1
                      </span>
                      <span>Student Information</span>
                    </h4>
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
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">Grade / Class *</label>
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
                          placeholder="e.g. St. Joseph's Convent"
                          value={form.school}
                          onChange={(e) => setForm({ ...form, school: e.target.value })}
                          className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Parent / Guardian Information */}
                  <div className="pt-2 border-t border-[#EEF3F1]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep mb-3 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-[#E3F4F0] text-brand-deep flex items-center justify-center text-[11px]">
                        2
                      </span>
                      <span>Parent / Guardian Contact</span>
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
                          Mobile Number * (WhatsApp preferred)
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

                  {/* Section 3: Centre, Course & Financials */}
                  <div className="pt-2 border-t border-[#EEF3F1]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-deep mb-3 flex items-center gap-1.5">
                      <span className="h-5 w-5 rounded-full bg-[#E3F4F0] text-brand-deep flex items-center justify-center text-[11px]">
                        3
                      </span>
                      <span>Centre, Program & Fee Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">
                          Admitting Centre / Branch *
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
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">Course / Program</label>
                        <select
                          value={form.course}
                          onChange={(e) => setForm({ ...form, course: e.target.value })}
                          className="w-full h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                        >
                          <option value="Comprehensive Robotics & AI Program">Comprehensive Robotics & AI</option>
                          <option value="Vedic Mathematics & Speed Math">Vedic Mathematics & Speed Math</option>
                          <option value="STEM Explorers Foundation (Grades 1-5)">STEM Explorers Foundation</option>
                          <option value="Python Coding & IoT Kit">Python Coding & IoT Kit</option>
                          <option value="BMIT Assessment & Personal Counselling">BMIT Assessment & Counselling</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">
                          Standard Course Fee (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={form.originalFee}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              originalFee: e.target.value,
                              feeAmount: e.target.value,
                            })
                          }
                          className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm font-semibold focus:border-brand-teal focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Referral Bonus & Concession Scheme Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">
                          Referral Bonus / Concession Scheme
                        </label>
                        <select
                          value={form.concessionType}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              concessionType: e.target.value as ConcessionType,
                            })
                          }
                          className="w-full h-11 px-3 rounded-xl border-2 border-[#EAD766] bg-[#FFFDEB] text-xs font-bold text-brand-ink focus:border-brand-teal focus:outline-none"
                        >
                          <option value="none">Standard / None (Regular Fee)</option>
                          <option value="trainer_hoc">Trainer/HOC Referral (Organic Lead) — Rs. 2,000</option>
                          <option value="parent_referral">Parent Referral Per Admission — 1 Month Fee Off</option>
                          <option value="staff_child">Staff-Child Concession (50% Off)</option>
                          <option value="sibling">Sibling Concession (50% Off)</option>
                        </select>
                      </div>

                      {/* Live Fee Breakdown */}
                      <div className="col-span-1 sm:col-span-2 rounded-xl bg-[#F0F8F5] border border-[#C5E5D9] p-3 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-[#5A736D]">Standard Fee: </span>
                            <span className="font-semibold text-brand-ink">₹{concessionInfo.orig.toLocaleString("en-IN")}</span>
                            {concessionInfo.disc > 0 && (
                              <span className="ml-2 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                -₹{concessionInfo.disc.toLocaleString("en-IN")} (50% Concession)
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="text-[#5A736D] font-medium">Net Payable Fee: </span>
                            <span className="text-sm font-bold text-brand-deep">
                              ₹{concessionInfo.net.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {form.concessionType === "trainer_hoc" && (
                          <p className="mt-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            ★ Trainer/HOC Organic Lead: Flat ₹2,000 referral bonus will be credited to partner upon admission.
                          </p>
                        )}
                        {form.concessionType === "parent_referral" && (
                          <p className="mt-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                            ★ Parent Referral: 1 month tuition fee reduction voucher will be credited to the referring parent.
                          </p>
                        )}
                        {(form.concessionType === "staff_child" || form.concessionType === "sibling") && (
                          <p className="mt-1.5 text-[11px] font-semibold text-teal-800 bg-teal-50 p-1.5 rounded-lg border border-teal-200">
                            ★ 50% Concession Applied: Course fee reduced by half from ₹{concessionInfo.orig.toLocaleString("en-IN")} to ₹{concessionInfo.net.toLocaleString("en-IN")}.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#41564F] mb-1">Payment Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={form.paymentMode}
                            onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                            className="h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI / GPay</option>
                            <option value="Card">Card</option>
                            <option value="Net Banking">Net Banking</option>
                          </select>

                          <select
                            value={form.paymentStatus}
                            onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as any })}
                            className="h-11 px-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                          >
                            <option value="Paid">Fully Paid</option>
                            <option value="Partial">Token Advance</option>
                            <option value="Pending">Pay at Centre</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marketer Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Marketer / Event Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Met at school science expo. Interested in weekend batch."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full p-3 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  {/* Live Commission Highlight Box */}
                  <div className="rounded-xl border border-[#C5E9DE] bg-[#EAF7EA] p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#0A7F0A] font-semibold block">Your Commission for this Admission:</span>
                      <span className="text-[11px] text-[#41564F]">
                        Based on your {partner.commissionValue}
                        {partner.commissionType === "percentage" ? "%" : "₹"} rate
                      </span>
                    </div>
                    <span className="text-xl font-bold text-[#0A7F0A]">
                      +₹{expectedCommission.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-xl bg-brand-deep text-white font-bold text-sm shadow-md hover:bg-[#04332D] transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? "Writing to ERP Student Database…" : "Submit Admission to ERP →"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY ADMISSIONS LEDGER */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-brand-ink">My Referral Admissions</h3>
                <p className="text-xs text-[#7B8E89]">
                  All admissions registered using partner code <span className="font-mono font-bold">[{partner.code}]</span>
                </p>
              </div>

              <input
                type="text"
                placeholder="Search student, parent, ID…"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-[#D5E3DF] bg-white text-xs w-full sm:w-64 focus:border-brand-teal focus:outline-none"
              />
            </div>

            {filteredAdmissions.length === 0 ? (
              <div className="rounded-2xl border border-[#E2ECE9] bg-white p-12 text-center text-[#7B8E89] space-y-3">
                <span className="inline-flex h-12 w-12 rounded-full bg-[#F1F5F4] items-center justify-center text-[#7B8E89]">
                  <Icon name="community" size={24} />
                </span>
                <p className="text-sm font-semibold">No admissions found yet.</p>
                <button
                  onClick={() => setActiveTab("admit")}
                  className="px-4 py-2 rounded-xl bg-brand-deep text-white text-xs font-semibold"
                >
                  Make Your First Admission →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#E2ECE9] bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAF9] border-b border-[#EEF3F1] text-[11px] font-semibold text-[#7B8E89] uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Student / ERP ID</th>
                      <th className="p-3.5">Parent & Contact</th>
                      <th className="p-3.5">Centre & Course</th>
                      <th className="p-3.5 text-right">Fee Collected</th>
                      <th className="p-3.5 text-right">Commission</th>
                      <th className="p-3.5 text-center">ERP Status</th>
                      <th className="p-3.5 text-center">Payout</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3F1]">
                    {filteredAdmissions.map((a) => (
                      <tr key={a.id} className="hover:bg-[#F9FBFA] transition">
                        <td className="p-3.5">
                          <div className="font-bold text-brand-ink text-sm">{a.studentName}</div>
                          <div className="font-mono text-[11px] text-brand-deep font-semibold">
                            {a.studentId}
                          </div>
                          <div className="text-[10px] text-[#7B8E89]">
                            {new Date(a.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-medium text-brand-ink">{a.parentName}</div>
                          <div className="font-mono text-xs text-[#41564F]">{a.phone}</div>
                          {a.email && <div className="text-[10px] text-[#7B8E89]">{a.email}</div>}
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-brand-deep">{a.centreName}</div>
                          <div className="text-[#7B8E89] truncate max-w-[200px]">{a.course}</div>
                          <div className="text-[10px] text-[#41564F] font-medium">{a.grade}</div>
                        </td>

                        <td className="p-3.5 text-right font-semibold text-brand-ink">
                          ₹{a.feeAmount.toLocaleString("en-IN")}
                          <div className="text-[10px] text-[#7B8E89]">{a.paymentMode}</div>
                          {a.concessionType && a.concessionType !== "none" && (
                            <div className="mt-1 flex flex-col items-end gap-0.5">
                              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                {CONCESSION_RULES[a.concessionType]?.badgeText || a.concessionType}
                              </span>
                              <span
                                className={`text-[9.5px] font-bold ${
                                  a.concessionApprovalStatus === "Approved"
                                    ? "text-emerald-700"
                                    : a.concessionApprovalStatus === "Rejected"
                                    ? "text-red-700"
                                    : "text-amber-700 animate-pulse"
                                }`}
                              >
                                {a.concessionApprovalStatus === "Approved"
                                  ? "✓ Finance Approved"
                                  : a.concessionApprovalStatus === "Rejected"
                                  ? "✕ Concession Rejected"
                                  : "⏳ Finance Approval Pending"}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5 text-right font-bold text-emerald-700 text-sm">
                          +₹{a.commissionAmount.toLocaleString("en-IN")}
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              a.erpStatus === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.erpStatus}
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                              a.payoutStatus === "Paid"
                                ? "bg-emerald-100 text-emerald-800"
                                : a.payoutStatus === "Approved"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {a.payoutStatus}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => shareAdmissionSlip(a.studentId, a.studentName, a.phone)}
                            className="p-1.5 rounded-lg border border-[#D5E3DF] hover:bg-[#EAF7EA] text-emerald-700 transition"
                            title="Resend WhatsApp Confirmation Slip"
                          >
                            <Icon name="message" size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EARNINGS & BANK INFO */}
        {activeTab === "payouts" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-2xl border border-[#E2ECE9] bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-brand-ink mb-1">Commission Payout Account</h3>
              <p className="text-xs text-[#7B8E89] mb-4">
                Update your UPI or Bank details so finance can disburse your earned commissions directly.
              </p>

              <form onSubmit={handleSaveBank} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">
                    UPI ID (Instant Transfer)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@okaxis / 9876543210@paytm"
                    value={bankForm.upiId}
                    onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm font-mono focus:border-brand-teal focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bala Murugan"
                      value={bankForm.accountName}
                      onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#41564F] mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 5010023456789"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm font-mono focus:border-brand-teal focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#41564F] mb-1">IFSC Code</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#D5E3DF] bg-[#F7FAF9] text-sm font-mono uppercase focus:border-brand-teal focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingBank}
                    className="h-11 px-6 rounded-xl bg-brand-deep text-white font-semibold text-xs shadow hover:bg-[#04332D] transition flex items-center justify-center gap-2"
                  >
                    {savingBank ? "Saving…" : "Save Payout Details"}
                  </button>
                </div>
              </form>
            </div>

            {/* Payout Summary Card */}
            <div className="rounded-2xl border border-[#E2ECE9] bg-white p-6 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-brand-ink">Payout Guidelines</h4>
              <ul className="text-xs text-[#41564F] space-y-2 list-disc pl-4 leading-relaxed">
                <li>Commissions are calculated as soon as a student admission is entered.</li>
                <li>When the centre verifies and confirms student admission fees, payouts are marked as <strong>Approved</strong>.</li>
                <li>Payouts are disbursed weekly every Friday via UPI / NEFT to the bank account listed above.</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* QR Code Modal for In-Person Scans */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute right-4 top-4 text-[#7B8E89] hover:text-black"
            >
              <Icon name="x" size={20} />
            </button>

            <div>
              <h4 className="text-lg font-bold text-brand-ink">Scan for Admission</h4>
              <p className="text-xs text-[#7B8E89] mt-0.5">
                Have the parent scan this QR code with their phone camera to open the application with your code.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#E2ECE9] bg-white inline-block shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  referralLink
                )}`}
                alt="Partner Referral QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="font-mono text-xs font-bold text-brand-deep bg-[#E3F4F0] py-1.5 px-3 rounded-lg inline-block">
              Partner Code: {partner.code}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-brand-deep text-white px-4 py-3 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Icon name="checkCircle" size={16} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default function PartnerAppPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F8F7] flex items-center justify-center text-sm font-semibold text-brand-deep">
          Loading Q-School Partner App...
        </div>
      }
    >
      <PartnerContent />
    </Suspense>
  );
}
