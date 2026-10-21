"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/shell";
import {
  Btn,
  Card,
  Field,
  Figure,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  Toast,
  inputCls,
  useToast,
  type Tone,
} from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { ADMISSION_CENTRES, centreName } from "@qschool/shared";
import {
  CONCESSION_RULES,
  PARTNER_CATEGORIES,
  type NewPartnerInput,
  type Partner,
  type PartnerAdmission,
  type PartnerCategory,
  type PayoutStatus,
} from "@/lib/partners/types";

function PartnersContent() {
  const [tab, setTab] = useState<"partners" | "admissions" | "weekly_payouts">("partners");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [admissions, setAdmissions] = useState<PartnerAdmission[]>([]);
  const [stats, setStats] = useState({
    totalPartners: 0,
    activePartners: 0,
    totalAdmissions: 0,
    totalRevenue: 0,
    totalCommission: 0,
    paidCommission: 0,
    pendingCommission: 0,
  });

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [payoutFilter, setPayoutFilter] = useState<string>("all");
  const [concessionFilter, setConcessionFilter] = useState<string>("all");
  const [referralFilter, setReferralFilter] = useState<string>("all");

  // Weekly Payout Report State
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = last week
  const [expandedPartners, setExpandedPartners] = useState<Record<string, boolean>>({});
  const toggleExpand = (id: string) =>
    setExpandedPartners((prev) => ({ ...prev, [id]: !prev[id] }));

  // Edit Partner Bank / UPI Details Modal State
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editBankForm, setEditBankForm] = useState({
    payoutMethod: "upi" as "upi" | "bank",
    upiId: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();

  // Create Partner Form State
  const [newPartner, setNewPartner] = useState<NewPartnerInput>({
    name: "",
    code: "",
    email: "",
    phone: "",
    organization: "",
    category: "Marketing Team",
    commissionType: "percentage",
    commissionValue: 10,
    centreId: "all",
    notes: "",
    bankDetails: {
      payoutMethod: "upi",
      upiId: "",
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/partners");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load partners");

      setPartners(data.partners || []);
      setAdmissions(data.admissions || []);
      if (data.stats) setStats(data.stats);
    } catch {
      show("Could not load partners data");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Partner Submit
  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name.trim() || !newPartner.phone.trim() || !newPartner.email.trim()) {
      show("Please fill in name, phone and email.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create partner");

      show(`Created partner ${data.partner.name} [${data.partner.code}]`);
      setModalOpen(false);
      setNewPartner({
        name: "",
        code: "",
        email: "",
        phone: "",
        organization: "",
        category: "Marketing Team",
        commissionType: "percentage",
        commissionValue: 10,
        centreId: "all",
        notes: "",
        bankDetails: { upiId: "", accountName: "" },
      });
      loadData();
    } catch (err) {
      show((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Toggle partner active/inactive
  const togglePartnerStatus = async (partner: Partner) => {
    const nextStatus = partner.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/admin/partners/${partner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error();
      show(`Partner ${partner.name} is now ${nextStatus}`);
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, status: nextStatus } : p))
      );
    } catch {
      show("Could not update partner status");
    }
  };

  // Update commission payout status
  const handleUpdatePayout = async (admissionId: string, status: PayoutStatus) => {
    try {
      const res = await fetch("/api/admin/partners/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId,
          status,
          reference: status === "Paid" ? `PAY-${Date.now().toString(36).toUpperCase()}` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update payout");

      show(`Payout updated to ${status}`);
      setAdmissions((prev) =>
        prev.map((a) => (a.id === admissionId ? data.admission : a))
      );
      loadData();
    } catch (err) {
      show((err as Error).message);
    }
  };

  // Finance Head Concession Approval Handler
  const handleUpdateConcession = async (admissionId: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/admin/partners/concession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update concession approval");

      show(`Concession ${status.toLowerCase()} by Finance Head`);
      setAdmissions((prev) =>
        prev.map((a) => (a.id === admissionId ? data.admission : a))
      );
      loadData();
    } catch (err) {
      show((err as Error).message);
    }
  };

  // Admin Referral Approval Handler
  const handleUpdateReferral = async (admissionId: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch("/api/admin/partners/referral-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionId,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update referral approval");

      show(`Referral ${status.toLowerCase()} by Admin`);
      setAdmissions((prev) =>
        prev.map((a) => (a.id === admissionId ? data.admission : a))
      );
      loadData();
    } catch (err) {
      show((err as Error).message);
    }
  };

  // Copy partner marketer app link
  const copyPartnerPortalLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/partner?code=${code}`;
    navigator.clipboard.writeText(url);
    show(`Marketer portal link copied: ${url}`);
  };

  // Export CSV of Partner Admissions
  const handleExportCsv = () => {
    if (!admissions.length) {
      show("No admissions data to export");
      return;
    }
    const headers = [
      "Student ID",
      "Student Name",
      "Grade",
      "Parent Name",
      "Phone",
      "Partner Name",
      "Partner Code",
      "Centre",
      "Course",
      "Fee Amount (INR)",
      "Commission Amount (INR)",
      "ERP Status",
      "Payout Status",
      "Date",
    ];
    const rows = admissions.map((a) => [
      `"${a.studentId}"`,
      `"${a.studentName}"`,
      `"${a.grade}"`,
      `"${a.parentName}"`,
      `"'${a.phone}"`,
      `"${a.partnerName}"`,
      `"${a.partnerCode}"`,
      `"${a.centreName}"`,
      `"${a.course}"`,
      a.feeAmount,
      a.commissionAmount,
      `"${a.erpStatus}"`,
      `"${a.payoutStatus}"`,
      `"${new Date(a.createdAt).toLocaleDateString("en-IN")}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `qschool-partner-admissions-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("CSV report downloaded successfully");
  };

  // Filtered partners list
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.organization || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [partners, categoryFilter, search]);

  // Pending Finance Head Concession Approvals
  const pendingConcessions = useMemo(
    () => admissions.filter((a) => a.concessionApprovalStatus === "Pending Approval"),
    [admissions]
  );

  // Pending Admin Referral Approvals (Parent referred by Trainer / Centre Head or Partner)
  const pendingReferrals = useMemo(
    () => admissions.filter((a) => a.partnerCode !== "DIRECT" && a.referralApprovalStatus === "Pending"),
    [admissions]
  );

  // Filtered admissions list
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      if (payoutFilter !== "all" && a.payoutStatus !== payoutFilter) return false;
      if (referralFilter === "pending" && a.referralApprovalStatus !== "Pending") return false;
      if (referralFilter === "approved" && a.referralApprovalStatus !== "Approved") return false;
      if (referralFilter === "rejected" && a.referralApprovalStatus !== "Rejected") return false;
      if (concessionFilter === "pending" && a.concessionApprovalStatus !== "Pending Approval") return false;
      if (concessionFilter === "approved" && a.concessionApprovalStatus !== "Approved") return false;
      if (concessionFilter === "rejected" && a.concessionApprovalStatus !== "Rejected") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.studentName.toLowerCase().includes(q) ||
          a.studentId.toLowerCase().includes(q) ||
          a.parentName.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          a.partnerName.toLowerCase().includes(q) ||
          a.partnerCode.toLowerCase().includes(q) ||
          a.centreName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [admissions, payoutFilter, referralFilter, concessionFilter, search]);

  // Weekly Payout Calculations (Monday to Sunday)
  const weekInfo = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun, 1 = Mon...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const startStr = monday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const endStr = sunday.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    return {
      start: monday,
      end: sunday,
      label: `${startStr} – ${endStr}`,
      isCurrentWeek: weekOffset === 0,
    };
  }, [weekOffset]);

  // Aggregate weekly payouts grouped by partner
  const weeklyPayouts = useMemo(() => {
    const weekAdmissions = admissions.filter((a) => {
      if (a.partnerCode === "DIRECT") return false;
      const d = new Date(a.createdAt);
      return d >= weekInfo.start && d <= weekInfo.end;
    });

    const groups: Record<
      string,
      {
        partner: Partner | undefined;
        admissions: PartnerAdmission[];
        totalCommission: number;
        totalFees: number;
        pendingReferralsCount: number;
        allPaid: boolean;
        anyPaid: boolean;
      }
    > = {};

    for (const a of weekAdmissions) {
      const pid = a.partnerId || a.partnerCode;
      if (!groups[pid]) {
        const p = partners.find((x) => x.id === a.partnerId || x.code === a.partnerCode);
        groups[pid] = {
          partner: p,
          admissions: [],
          totalCommission: 0,
          totalFees: 0,
          pendingReferralsCount: 0,
          allPaid: true,
          anyPaid: false,
        };
      }
      groups[pid].admissions.push(a);
      groups[pid].totalCommission += a.commissionAmount;
      groups[pid].totalFees += a.feeAmount;
      if (a.referralApprovalStatus === "Pending") {
        groups[pid].pendingReferralsCount += 1;
      }
      if (a.payoutStatus !== "Paid") {
        groups[pid].allPaid = false;
      } else {
        groups[pid].anyPaid = true;
      }
    }

    return Object.entries(groups).map(([partnerId, g]) => ({
      partnerId,
      ...g,
    }));
  }, [admissions, partners, weekInfo]);

  const weeklyStats = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    let totalAdmissions = 0;

    for (const wp of weeklyPayouts) {
      for (const a of wp.admissions) {
        totalAdmissions += 1;
        if (a.payoutStatus === "Paid") {
          totalPaid += a.commissionAmount;
        } else {
          totalDue += a.commissionAmount;
        }
      }
    }

    return {
      totalDue,
      totalPaid,
      totalPending: totalDue,
      totalAdmissions,
      partnerCount: weeklyPayouts.length,
    };
  }, [weeklyPayouts]);

  // Mark all admissions of a partner for this week as Paid
  const handleDisbursePartnerWeek = async (item: (typeof weeklyPayouts)[number]) => {
    const pendingAdmissions = item.admissions.filter((a) => a.payoutStatus !== "Paid");
    if (!pendingAdmissions.length) {
      show("All admissions for this partner this week are already marked as Paid.");
      return;
    }

    const ref = `WEEK-PAY-${Date.now().toString(36).toUpperCase()}`;
    setBusy(true);
    try {
      for (const adm of pendingAdmissions) {
        await fetch("/api/admin/partners/payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            admissionId: adm.id,
            status: "Paid",
            reference: ref,
          }),
        });
      }
      show(`Disbursed ₹${item.totalCommission.toLocaleString("en-IN")} to ${item.partner?.name || "Partner"} (Ref: ${ref})`);
      loadData();
    } catch {
      show("Failed to update weekly payouts");
    } finally {
      setBusy(false);
    }
  };

  // Export Weekly Payout CSV formatted for Bank Bulk Disbursal
  const handleExportWeeklyPayoutCsv = () => {
    if (!weeklyPayouts.length) {
      show("No partner payouts recorded for this week");
      return;
    }

    const headers = [
      "Week Period",
      "Partner Code",
      "Partner Name",
      "Category",
      "Mobile Phone",
      "Email",
      "Payout Method",
      "UPI ID",
      "Account Holder Name",
      "Bank Account Number",
      "Bank IFSC Code",
      "Bank Name",
      "Branch",
      "Weekly Admissions Count",
      "Weekly Tuition Fee Generated (INR)",
      "Weekly Commission / Bonus Due (INR)",
      "Referral Approvals",
      "Payout Status",
    ];

    const rows = weeklyPayouts.map((wp) => {
      const p = wp.partner;
      const b = p?.bankDetails;
      const method = b?.payoutMethod || (b?.upiId ? "upi" : b?.accountNumber ? "bank" : "not_specified");
      const approvalState =
        wp.pendingReferralsCount > 0
          ? `${wp.pendingReferralsCount} Pending Approval`
          : "All Referrals Approved";
      const status = wp.allPaid ? "Paid" : wp.anyPaid ? "Partially Paid" : "Pending Disbursal";

      return [
        `"${weekInfo.label}"`,
        `"${p?.code || wp.partnerId}"`,
        `"${p?.name || "Unknown"}"`,
        `"${p?.category || "Marketer"}"`,
        `"'${p?.phone || ""}"`,
        `"${p?.email || ""}"`,
        `"${method.toUpperCase()}"`,
        `"${b?.upiId || ""}"`,
        `"${b?.accountName || p?.name || ""}"`,
        `"'${b?.accountNumber || ""}"`,
        `"${b?.ifscCode || ""}"`,
        `"${b?.bankName || ""}"`,
        `"${b?.branchName || ""}"`,
        wp.admissions.length,
        wp.totalFees,
        wp.totalCommission,
        `"${approvalState}"`,
        `"${status}"`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const weekFileLabel = weekInfo.label.replace(/[^a-zA-Z0-9]/g, "-");
    link.setAttribute("download", `qschool-weekly-payouts-${weekFileLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("Weekly Payout Report CSV exported successfully!");
  };

  // Open Edit Bank Details Modal
  const openEditBank = (partner: Partner) => {
    setEditingPartner(partner);
    setEditBankForm({
      payoutMethod:
        partner.bankDetails?.payoutMethod || (partner.bankDetails?.accountNumber ? "bank" : "upi"),
      upiId: partner.bankDetails?.upiId || "",
      accountName: partner.bankDetails?.accountName || partner.name,
      accountNumber: partner.bankDetails?.accountNumber || "",
      ifscCode: partner.bankDetails?.ifscCode || "",
      bankName: partner.bankDetails?.bankName || "",
      branchName: partner.bankDetails?.branchName || "",
    });
    setBankModalOpen(true);
  };

  // Save Partner Bank Details (Admin)
  const handleSavePartnerBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/partners/${editingPartner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankDetails: editBankForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update bank details");

      show(`Payout details updated for ${editingPartner.name}`);
      setBankModalOpen(false);
      loadData();
    } catch (err) {
      show((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell>
      <PageHeader
        title="Partners & Referrals"
        sub="Manage marketing promoters, referral codes, admission attribution, and commission payouts"
      >
        <Btn variant="primary" icon="plus" onClick={() => setModalOpen(true)}>
          Create Partner Code
        </Btn>
        {tab === "weekly_payouts" ? (
          <Btn variant="ghost" icon="download" onClick={handleExportWeeklyPayoutCsv}>
            Export Weekly Payout CSV
          </Btn>
        ) : (
          <Btn variant="ghost" icon="download" onClick={handleExportCsv}>
            Export CSV
          </Btn>
        )}
      </PageHeader>

      {/* KPI Figures */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Figure
          label="Active Marketers / Partners"
          value={`${stats.activePartners} / ${stats.totalPartners}`}
          icon="community"
        />
        <Figure
          label="Admissions via Referrals"
          value={stats.totalAdmissions.toString()}
          icon="users"
        />
        <Figure
          label="Gross Referral Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          icon="rupee"
        />
        <Figure
          label="Pending Payouts"
          value={`₹${stats.pendingCommission.toLocaleString("en-IN")}`}
          icon="card"
        />
      </div>

      {/* Referral Bonus & Concession Policy Banner matching official document */}
      <div className="mb-5 rounded-2xl border-2 border-black overflow-hidden bg-white shadow-sm max-w-2xl">
        <div className="bg-[#FFFF00] px-4 py-2.5 text-center border-b-2 border-black">
          <h3 className="font-black text-black tracking-wide text-sm sm:text-base uppercase">
            REFERRAL BONUS &amp; CONCESSION
          </h3>
        </div>
        <div className="p-4 space-y-2.5 text-sm text-black">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div>
              <span className="font-medium text-gray-900">Trainer or Centre Head (HOC) referral bonus (Organic Lead)</span>
              <span className="block text-[11px] text-amber-900 font-semibold mt-0.5">
                ★ Rs. 2,000 credited to Trainer/Centre Head upon Admin Approval
              </span>
            </div>
            <span className="font-extrabold text-base whitespace-nowrap ml-2 text-black">- Rs. 2,000</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <span className="font-medium text-gray-900">Parent Referral Per Admission</span>
            <span className="font-extrabold text-sm whitespace-nowrap ml-2 text-black">- 1 month fee reduction</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <span className="font-medium text-gray-900">Staff-child concession</span>
            <span className="font-extrabold text-base whitespace-nowrap ml-2 text-black">(50%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Sibling concession</span>
            <span className="font-extrabold text-base whitespace-nowrap ml-2 text-black">(50%)</span>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <Card>
        {/* Top Controls Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Partner Tabs"
              value={tab}
              onChange={(v) => setTab(v as any)}
              options={[
                { value: "partners", label: `Partners Directory (${partners.length})` },
                { value: "admissions", label: `Admissions Ledger (${admissions.length})` },
                { value: "weekly_payouts", label: `Weekly Payouts (${weeklyPayouts.length})` },
              ]}
            />

            {tab === "weekly_payouts" ? (
              <div className="flex items-center gap-1 bg-[#F7FAF9] border border-[#E2ECE9] p-1 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o - 1)}
                  className="px-2.5 py-1 text-xs font-bold text-[#41564F] hover:bg-white hover:text-black rounded-lg transition"
                  title="Previous Week"
                >
                  ← Prev Week
                </button>
                <div className="px-2.5 py-0.5 text-xs font-bold text-brand-ink flex items-center gap-1.5 border-x border-[#E2ECE9]">
                  <Icon name="calendar" size={13} />
                  <span>{weekInfo.label}</span>
                  {weekInfo.isCurrentWeek && (
                    <span className="text-[10px] bg-brand-deep text-white px-1.5 py-0.2 rounded-full font-bold">
                      Current
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setWeekOffset((o) => o + 1)}
                  className="px-2.5 py-1 text-xs font-bold text-[#41564F] hover:bg-white hover:text-black rounded-lg transition"
                  title="Next Week"
                >
                  Next Week →
                </button>
                {weekOffset !== 0 && (
                  <button
                    type="button"
                    onClick={() => setWeekOffset(0)}
                    className="ml-1 px-2 py-0.5 text-[11px] font-bold text-brand-teal hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
            ) : tab === "partners" ? (
              <select
                aria-label="Filter by Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#41564F] outline-none"
              >
                <option value="all">All Categories</option>
                {PARTNER_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter by Payout Status"
                  value={payoutFilter}
                  onChange={(e) => setPayoutFilter(e.target.value)}
                  className="h-9 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#41564F] outline-none"
                >
                  <option value="all">All Payout Statuses</option>
                  <option value="Pending">Pending Payout</option>
                  <option value="Approved">Approved Payout</option>
                  <option value="Paid">Paid Payout</option>
                </select>

                <select
                  aria-label="Filter by Admin Referral Approval"
                  value={referralFilter}
                  onChange={(e) => setReferralFilter(e.target.value)}
                  className="h-9 rounded-xl border border-emerald-300 bg-emerald-50/70 px-3 text-xs font-semibold text-emerald-900 outline-none"
                >
                  <option value="all">All Referral States</option>
                  <option value="pending">⏳ Pending Admin Referral Approval ({pendingReferrals.length})</option>
                  <option value="approved">✓ Referral Approved</option>
                  <option value="rejected">✕ Referral Rejected</option>
                </select>

                <select
                  aria-label="Filter by Finance Concession Approval"
                  value={concessionFilter}
                  onChange={(e) => setConcessionFilter(e.target.value)}
                  className="h-9 rounded-xl border border-amber-300 bg-amber-50/70 px-3 text-xs font-semibold text-amber-900 outline-none"
                >
                  <option value="all">All Concessions</option>
                  <option value="pending">⏳ Pending Finance Head Approval ({pendingConcessions.length})</option>
                  <option value="approved">✓ Concessions Approved</option>
                  <option value="rejected">✕ Concessions Rejected</option>
                </select>
              </div>
            )}
          </div>

          <SearchInput
            placeholder={tab === "partners" ? "Search partners, code, phone…" : "Search students, parent, partner…"}
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Pending Admin Referral Approvals Alert Banner */}
        {tab === "admissions" && pendingReferrals.length > 0 && (
          <div className="mb-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👥</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Admin Referral Approval Required
                </div>
                <div className="text-[12px] text-emerald-800">
                  {pendingReferrals.length} admission{pendingReferrals.length > 1 ? "s" : ""} referred by Trainer or Centre Head (HOC) / Marketers awaiting Admin sign-off to credit Rs. 2,000 bonus / commission.
                </div>
              </div>
            </div>
            <button
              onClick={() => setReferralFilter(referralFilter === "pending" ? "all" : "pending")}
              className="px-3 py-1.5 rounded-lg bg-brand-deep hover:bg-[#04332D] text-white text-xs font-bold self-start sm:self-auto shadow-sm transition"
            >
              {referralFilter === "pending" ? "Show All Admissions" : `Review ${pendingReferrals.length} Pending`}
            </button>
          </div>
        )}

        {/* Pending Finance Head Concessions Alert Banner */}
        {tab === "admissions" && pendingConcessions.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Finance Head Action Required
                </div>
                <div className="text-[12px] text-amber-800">
                  {pendingConcessions.length} fee concession{pendingConcessions.length > 1 ? "s" : ""} awaiting official approval. Review and approve or reject below.
                </div>
              </div>
            </div>
            <button
              onClick={() => setConcessionFilter(concessionFilter === "pending" ? "all" : "pending")}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold self-start sm:self-auto shadow-sm transition"
            >
              {concessionFilter === "pending" ? "Show All Admissions" : `Filter ${pendingConcessions.length} Pending`}
            </button>
          </div>
        )}

        {/* TAB 1: PARTNERS DIRECTORY */}
        {tab === "partners" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7FAF9] border-b border-[#EEF3F1] text-[11px] font-semibold text-[#7B8E89] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Partner / Marketer</th>
                  <th className="p-3">Referral Code</th>
                  <th className="p-3">Category & Org</th>
                  <th className="p-3">Commission Rate</th>
                  <th className="p-3 text-center">Admissions</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                  <th className="p-3 text-right">Pending (₹)</th>
                  <th className="p-3">Payout Details (Bank / UPI)</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F1]">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#7B8E89]">
                      No partners matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((p) => {
                    const statusTone: Tone = p.status === "active" ? "good" : "neutral";
                    return (
                      <tr key={p.id} className="hover:bg-[#F9FBFA] transition">
                        <td className="p-3">
                          <div className="font-bold text-brand-ink">{p.name}</div>
                          <div className="text-[11px] text-[#7B8E89]">{p.phone}</div>
                          <div className="text-[11px] text-[#7B8E89]">{p.email}</div>
                        </td>

                        <td className="p-3">
                          <span className="font-mono text-xs font-bold text-brand-deep bg-[#E3F4F0] px-2 py-1 rounded-lg">
                            {p.code}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="inline-block text-xs font-semibold text-[#41564F]">
                            {p.category}
                          </span>
                          {p.organization && (
                            <div className="text-[11px] text-[#7B8E89] truncate max-w-[180px]">
                              {p.organization}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-brand-ink">
                            {p.commissionValue}
                            {p.commissionType === "percentage" ? "% of fee" : "₹ flat"}
                          </span>
                          <div className="text-[10px] text-[#7B8E89]">
                            {p.centreId === "all" ? "All Centres" : centreName(p.centreId)}
                          </div>
                        </td>

                        <td className="p-3 text-center font-bold text-brand-ink">
                          {p.stats.totalAdmissions}
                        </td>

                        <td className="p-3 text-right font-semibold text-brand-ink">
                          ₹{p.stats.totalRevenue.toLocaleString("en-IN")}
                        </td>

                        <td className="p-3 text-right font-bold text-amber-700">
                          ₹{p.stats.pendingCommission.toLocaleString("en-IN")}
                        </td>

                        <td className="p-3">
                          {p.bankDetails?.payoutMethod === "bank" || p.bankDetails?.accountNumber ? (
                            <div className="text-xs">
                              <div className="font-semibold text-brand-ink">{p.bankDetails.bankName || "Bank Account"}</div>
                              <div className="font-mono text-[11px] text-[#41564F]">A/C: {p.bankDetails.accountNumber}</div>
                              <div className="font-mono text-[10px] text-[#7B8E89]">IFSC: {p.bankDetails.ifscCode}</div>
                            </div>
                          ) : p.bankDetails?.upiId ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                              <span className="text-[9.5px] font-extrabold uppercase text-emerald-800 bg-emerald-200 px-1 rounded">UPI</span>
                              <span className="font-mono text-xs font-bold text-emerald-950">{p.bankDetails.upiId}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => openEditBank(p)}
                              className="inline-flex items-center gap-1 text-[10.5px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-semibold transition"
                            >
                              + Add Bank / UPI
                            </button>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <StatusBadge tone={statusTone}>
                            {p.status === "active" ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditBank(p)}
                              className="p-1.5 rounded-lg border border-[#E2ECE9] hover:bg-[#E3F4F0] text-[#41564F] transition"
                              title="Update Payout Bank / UPI Details"
                            >
                              <Icon name="card" size={14} />
                            </button>

                            <button
                              onClick={() => copyPartnerPortalLink(p.code)}
                              className="p-1.5 rounded-lg border border-[#E2ECE9] hover:bg-[#E3F4F0] text-brand-teal transition"
                              title="Copy Partner Marketer Portal Link"
                            >
                              <Icon name="link" size={14} />
                            </button>

                            <button
                              onClick={() => togglePartnerStatus(p)}
                              className={`p-1.5 rounded-lg border transition text-xs font-semibold ${
                                p.status === "active"
                                  ? "border-red-200 text-red-700 hover:bg-red-50"
                                  : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              }`}
                              title={p.status === "active" ? "Deactivate" : "Activate"}
                            >
                              {p.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ADMISSIONS LEDGER */}
        {tab === "admissions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F7FAF9] border-b border-[#EEF3F1] text-[11px] font-semibold text-[#7B8E89] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Student / ERP ID</th>
                  <th className="p-3">Parent & Contact</th>
                  <th className="p-3">Partner Attributed</th>
                  <th className="p-3">Centre & Program</th>
                  <th className="p-3 text-right">Fee (₹)</th>
                  <th className="p-3 text-right">Referral Bonus / Comm. (₹)</th>
                  <th className="p-3 text-center">ERP Status</th>
                  <th className="p-3 text-center">Finance Concession</th>
                  <th className="p-3 text-center">Payout</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F1]">
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-[#7B8E89]">
                      No partner-referred admissions found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((a) => (
                    <tr key={a.id} className="hover:bg-[#F9FBFA] transition">
                      <td className="p-3">
                        <div className="font-bold text-brand-ink">{a.studentName}</div>
                        <div className="font-mono text-xs text-brand-deep font-bold">
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

                      <td className="p-3">
                        <div className="font-medium text-brand-ink">{a.parentName}</div>
                        <div className="font-mono text-xs text-[#41564F]">{a.phone}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-semibold text-brand-ink">{a.partnerName}</div>
                        <span className="font-mono text-[11px] font-bold text-brand-deep bg-[#E3F4F0] px-1.5 py-0.5 rounded">
                          {a.partnerCode}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-brand-deep">{a.centreName}</div>
                        <div className="text-xs text-[#7B8E89] truncate max-w-[180px]">{a.course}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-[#41564F]">{a.grade}</span>
                          {a.concessionType && a.concessionType !== "none" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-[#FFF2B2] text-[#7A5A00] border border-[#FFE082]">
                              {CONCESSION_RULES[a.concessionType]?.badgeText || a.concessionType}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right font-semibold text-brand-ink">
                        <div>₹{a.feeAmount.toLocaleString("en-IN")}</div>
                        {a.concessionAmount ? (
                          <div className="text-[10px] text-emerald-800 font-medium">
                            Saved ₹{a.concessionAmount.toLocaleString("en-IN")}
                          </div>
                        ) : null}
                      </td>

                      <td className="p-3 text-right">
                        <div className="font-bold text-emerald-700">
                          +₹{a.commissionAmount.toLocaleString("en-IN")}
                        </div>
                        {a.concessionType === "trainer_hoc" && (
                          <div className="text-[10px] text-amber-800 font-semibold">
                            Trainer/Centre Head Bonus
                          </div>
                        )}
                        {a.partnerCode !== "DIRECT" && (
                          a.referralApprovalStatus === "Pending" ? (
                            <div className="mt-1 inline-flex flex-col items-end gap-1 bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                              <span className="text-[9.5px] font-bold text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded animate-pulse">
                                ⏳ Admin Approval Pending
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateReferral(a.id, "Approved")}
                                  className="px-2 py-0.5 rounded bg-brand-deep hover:bg-[#04332D] text-white text-[10px] font-bold shadow-sm"
                                  title="Approve referral and credit Rs. 2,000 / commission"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateReferral(a.id, "Rejected")}
                                  className="px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold"
                                  title="Reject referral"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : a.referralApprovalStatus === "Approved" ? (
                            <div className="mt-1 flex flex-col items-end">
                              <span className="text-[9.5px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                ✓ Admin Approved
                              </span>
                              {a.referralApprovedBy && (
                                <span className="text-[9px] text-[#7B8E89]">by {a.referralApprovedBy.split("@")[0]}</span>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 flex flex-col items-end">
                              <span className="text-[9.5px] font-bold text-red-800 bg-red-100 px-1.5 py-0.5 rounded">
                                ✕ Referral Rejected
                              </span>
                            </div>
                          )
                        )}
                      </td>

                      <td className="p-3 text-center">
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

                      <td className="p-3 text-center">
                        {a.concessionType && a.concessionType !== "none" ? (
                          a.concessionApprovalStatus === "Pending Approval" ? (
                            <div className="inline-flex flex-col items-center gap-1.5 bg-amber-50 border border-amber-200 p-1.5 rounded-xl">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 animate-pulse">
                                ⏳ Pending Finance
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleUpdateConcession(a.id, "Approved")}
                                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm"
                                  title="Approve 50% concession / referral bonus as Finance Head"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateConcession(a.id, "Rejected")}
                                  className="px-1.5 py-0.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold"
                                  title="Reject concession (revert to full fee)"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : a.concessionApprovalStatus === "Approved" ? (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                ✓ Approved
                              </span>
                              <span className="text-[9px] text-[#7B8E89] mt-0.5">
                                {a.concessionApprovedBy ? a.concessionApprovedBy.split("@")[0] : "Finance Head"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                                ✕ Rejected
                              </span>
                              <span className="text-[9px] text-red-600 mt-0.5">Full fee</span>
                            </div>
                          )
                        ) : (
                          <span className="text-[11px] text-[#A0B0AB] italic">—</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
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

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct link to view student in ERP */}
                          <Link
                            href={`/admin/students`}
                            className="p-1.5 rounded-lg border border-[#E2ECE9] hover:bg-[#F1F5F4] text-xs font-semibold text-[#41564F]"
                            title="View Student in ERP Users Directory"
                          >
                            ERP
                          </Link>

                          {/* Payout status actions */}
                          {a.payoutStatus === "Pending" && (
                            <button
                              onClick={() => handleUpdatePayout(a.id, "Approved")}
                              className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold"
                            >
                              Approve
                            </button>
                          )}
                          {a.payoutStatus === "Approved" && (
                            <button
                              onClick={() => handleUpdatePayout(a.id, "Paid")}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold"
                            >
                              Mark Paid
                            </button>
                          )}
                          {a.payoutStatus === "Paid" && (
                            <span className="text-[11px] text-emerald-800 font-semibold px-2 py-1">
                              ✓ Paid
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: WEEKLY PAYOUTS REPORT */}
        {tab === "weekly_payouts" && (
          <div className="space-y-4">
            {/* Weekly KPI Highlights */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8E89]">
                  Total Commission Due
                </span>
                <div className="text-xl font-extrabold text-brand-ink mt-1">
                  ₹{weeklyStats.totalDue.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-[#7B8E89] mt-0.5">
                  {weeklyStats.totalAdmissions} admissions this week
                </div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Paid / Disbursed
                </span>
                <div className="text-xl font-extrabold text-emerald-700 mt-1">
                  ₹{weeklyStats.totalPaid.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-emerald-800 mt-0.5">Settled to partners</div>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Pending Disbursal
                </span>
                <div className="text-xl font-extrabold text-amber-700 mt-1">
                  ₹{weeklyStats.totalPending.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">Awaiting transfer</div>
              </div>
              <div className="rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7B8E89]">
                  Promoters Due
                </span>
                <div className="text-xl font-extrabold text-brand-deep mt-1">
                  {weeklyStats.partnerCount}
                </div>
                <div className="text-[11px] text-[#7B8E89] mt-0.5">Settlement recipients</div>
              </div>
            </div>

            {/* Policy & Settlement Notice */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 flex items-start gap-2.5 text-xs text-blue-950">
              <span className="text-base">ℹ️</span>
              <div className="leading-relaxed">
                <strong className="font-bold">Weekly Settlement Cycle ({weekInfo.label}):</strong> Aggregates
                all partner admissions and organic referrals recorded this week. Referrals by{" "}
                <strong>Trainers or Centre Heads (HOC)</strong> receive flat <strong>Rs. 2,000</strong> organic lead bonus upon
                Admin approval. Use <em>Export Weekly Payout CSV</em> for bulk bank transfer.
              </div>
            </div>

            {/* Weekly Payouts Table */}
            {weeklyPayouts.length === 0 ? (
              <div className="p-12 text-center text-[#7B8E89] border border-dashed border-[#D5E3DF] rounded-2xl">
                <div className="text-2xl mb-1">📅</div>
                <div className="text-sm font-bold text-brand-ink">No Referral Admissions for This Week</div>
                <div className="text-xs text-[#7B8E89] mt-1 max-w-md mx-auto">
                  There were no referral admissions recorded between {weekInfo.label}. Use the week navigation
                  buttons above to view past or upcoming settlement cycles.
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F7FAF9] border-b border-[#EEF3F1] text-[11px] font-semibold text-[#7B8E89] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Partner / Referrer</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">Week Admissions</th>
                      <th className="p-3 text-right">Gross Fees (₹)</th>
                      <th className="p-3 text-right">Payout Due (₹)</th>
                      <th className="p-3">Payout Destination (Bank / UPI)</th>
                      <th className="p-3 text-center">Approvals &amp; Status</th>
                      <th className="p-3 text-right">Disburse Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3F1]">
                    {weeklyPayouts.map((wp) => {
                      const isExpanded = !!expandedPartners[wp.partnerId];
                      const p = wp.partner;
                      const isReadyToDisburse = wp.pendingReferralsCount === 0 && !wp.allPaid;

                      return (
                        <tr key={wp.partnerId} className="hover:bg-[#F9FBFA] transition">
                          <td className="p-3 align-top">
                            <div className="font-bold text-brand-ink">{p?.name || "Partner"}</div>
                            <div className="font-mono text-xs font-semibold text-brand-deep">
                              {p?.code || wp.partnerId}
                            </div>
                            <div className="text-[11px] text-[#7B8E89]">{p?.phone}</div>
                          </td>

                          <td className="p-3 align-top">
                            <span className="inline-block text-xs font-semibold text-[#41564F]">
                              {p?.category || "Promoter"}
                            </span>
                            {p?.category?.includes("Trainer") && (
                              <div className="text-[10px] text-amber-800 font-bold mt-0.5">
                                ★ Rs. 2,000 / Referral
                              </div>
                            )}
                          </td>

                          <td className="p-3 align-top text-center">
                            <button
                              type="button"
                              onClick={() => toggleExpand(wp.partnerId)}
                              className="inline-flex items-center gap-1 font-bold text-brand-deep hover:underline text-xs"
                            >
                              <span>
                                {wp.admissions.length} admission{wp.admissions.length > 1 ? "s" : ""}
                              </span>
                              <span className="text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                            </button>
                            <div className="text-[10px] text-[#7B8E89]">Click to view students</div>

                            {/* Collapsible Admissions Drawer */}
                            {isExpanded && (
                              <div className="mt-2 text-left bg-white border border-[#E2ECE9] rounded-xl p-2.5 shadow-sm max-w-sm">
                                <div className="text-[10px] font-bold text-[#7B8E89] uppercase mb-1.5 pb-1 border-b border-[#EEF3F1]">
                                  Admissions this week:
                                </div>
                                <div className="space-y-1.5">
                                  {wp.admissions.map((adm) => (
                                    <div key={adm.id} className="text-xs flex items-center justify-between gap-2">
                                      <div>
                                        <div className="font-semibold text-brand-ink">{adm.studentName}</div>
                                        <div className="font-mono text-[10px] text-[#7B8E89]">{adm.studentId} • {adm.centreName}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-emerald-700">+₹{adm.commissionAmount.toLocaleString("en-IN")}</div>
                                        <div className="text-[9.5px]">
                                          {adm.referralApprovalStatus === "Approved" ? (
                                            <span className="text-emerald-700 font-semibold">✓ Approved</span>
                                          ) : (
                                            <span className="text-amber-700 font-semibold">⏳ Pending</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-3 align-top text-right font-semibold text-brand-ink">
                            ₹{wp.totalFees.toLocaleString("en-IN")}
                          </td>

                          <td className="p-3 align-top text-right">
                            <div className="text-base font-extrabold text-emerald-700">
                              ₹{wp.totalCommission.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-[#7B8E89]">
                              {p?.commissionType === "flat" ? "Flat bonus" : `${p?.commissionValue || ""}% rate`}
                            </div>
                          </td>

                          <td className="p-3 align-top">
                            {p?.bankDetails?.payoutMethod === "bank" || p?.bankDetails?.accountNumber ? (
                              <div className="text-xs space-y-0.5">
                                <div className="font-bold text-brand-ink flex items-center justify-between">
                                  <span>{p.bankDetails.bankName || "Bank Account"}</span>
                                  {p && (
                                    <button
                                      type="button"
                                      onClick={() => openEditBank(p)}
                                      className="text-[10px] text-brand-teal hover:underline ml-1"
                                      title="Edit Bank Details"
                                    >
                                      Edit
                                    </button>
                                  )}
                                </div>
                                <div className="font-mono text-[11px] text-[#41564F] flex items-center gap-1">
                                  <span>A/C: {p.bankDetails.accountNumber}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.bankDetails?.accountNumber || "");
                                      show("Copied account number!");
                                    }}
                                    className="text-[10px] text-[#7B8E89] hover:text-black"
                                    title="Copy A/C No"
                                  >
                                    📋
                                  </button>
                                </div>
                                <div className="font-mono text-[10px] text-[#7B8E89]">
                                  IFSC: {p.bankDetails.ifscCode}
                                  {p.bankDetails.accountName && ` • ${p.bankDetails.accountName}`}
                                </div>
                              </div>
                            ) : p?.bankDetails?.upiId ? (
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-200 px-1 rounded">
                                    UPI
                                  </span>
                                  <span className="font-mono text-xs font-bold text-emerald-950">
                                    {p.bankDetails.upiId}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.bankDetails?.upiId || "");
                                      show("Copied UPI ID!");
                                    }}
                                    className="text-[10px] text-emerald-800 hover:text-black ml-0.5"
                                    title="Copy UPI ID"
                                  >
                                    📋
                                  </button>
                                </div>
                                {p && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => openEditBank(p)}
                                      className="text-[10px] text-brand-teal hover:underline"
                                    >
                                      Edit Details
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1 text-[10.5px] text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold">
                                  ⚠️ Missing Bank / UPI
                                </span>
                                {p && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => openEditBank(p)}
                                      className="text-[10.5px] text-brand-teal font-bold hover:underline"
                                    >
                                      + Add Details Now
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="p-3 align-top text-center">
                            <div className="flex flex-col items-center gap-1">
                              {wp.pendingReferralsCount > 0 ? (
                                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                  ⏳ {wp.pendingReferralsCount} Pending Approval
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  ✓ All Approved
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  wp.allPaid
                                    ? "bg-emerald-100 text-emerald-800"
                                    : wp.anyPaid
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {wp.allPaid ? "Paid" : wp.anyPaid ? "Partially Paid" : "Pending Disbursal"}
                              </span>
                            </div>
                          </td>

                          <td className="p-3 align-top text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              {wp.allPaid ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                                  ✓ Disbursed
                                </span>
                              ) : isReadyToDisburse ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisbursePartnerWeek(wp)}
                                  disabled={busy}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                                  title="Mark all admissions for this week as Paid and record reference"
                                >
                                  {busy ? "Disbursing…" : "Disburse / Mark Paid"}
                                </button>
                              ) : (
                                <span
                                  className="text-[10.5px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-1 rounded text-right font-medium"
                                  title="Admin approval required on all referrals before disbursal"
                                >
                                  Requires Referral Sign-off
                                </span>
                              )}

                              {p && (
                                <button
                                  type="button"
                                  onClick={() => openEditBank(p)}
                                  className="text-[11px] text-[#41564F] hover:text-black hover:underline flex items-center gap-1"
                                >
                                  <Icon name="card" size={12} />
                                  <span>Edit Bank</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* CREATE PARTNER MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Partner & Referral Code" ratio169>
        <form onSubmit={handleCreatePartner} className="flex flex-col justify-between h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            {/* Left Column */}
            <div className="space-y-3">
              <Field label="Partner / Marketer Full Name *">
                <input
                  className={inputCls}
                  placeholder="e.g. Ramesh Kumar"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Referral Code (Optional)">
                  <input
                    className={inputCls}
                    placeholder="Leave blank to auto-generate"
                    value={newPartner.code || ""}
                    onChange={(e) => setNewPartner({ ...newPartner, code: e.target.value.toUpperCase() })}
                  />
                </Field>

                <Field label="Partner Category">
                  <select
                    className={inputCls}
                    value={newPartner.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      if (cat === "Trainer / Centre Head (HOC)" || cat === "Trainer / HOC") {
                        setNewPartner({
                          ...newPartner,
                          category: cat,
                          commissionType: "flat",
                          commissionValue: 2000,
                        });
                      } else {
                        setNewPartner({ ...newPartner, category: cat });
                      }
                    }}
                  >
                    {PARTNER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Mobile Phone *">
                  <input
                    type="tel"
                    className={inputCls}
                    placeholder="e.g. 9876543210"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Email Address *">
                  <input
                    type="email"
                    className={inputCls}
                    placeholder="marketer@example.com"
                    value={newPartner.email}
                    onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    required
                  />
                </Field>
              </div>

              <Field label="Organization / School / Campus">
                <input
                  className={inputCls}
                  placeholder="e.g. Achariya Campus Promoters"
                  value={newPartner.organization || ""}
                  onChange={(e) => setNewPartner({ ...newPartner, organization: e.target.value })}
                />
              </Field>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Commission Type">
                  <select
                    className={inputCls}
                    value={newPartner.commissionType}
                    onChange={(e) => setNewPartner({ ...newPartner, commissionType: e.target.value as any })}
                  >
                    <option value="percentage">Percentage (% of fee)</option>
                    <option value="flat">Flat Amount (₹ per admission)</option>
                  </select>
                </Field>

                <Field label="Commission Value">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g. 10 (%) or 2000 (₹)"
                    value={newPartner.commissionValue}
                    onChange={(e) => setNewPartner({ ...newPartner, commissionValue: Number(e.target.value) || 0 })}
                    required
                  />
                </Field>
              </div>

              <Field label="Assigned Centre">
                <select
                  className={inputCls}
                  value={newPartner.centreId}
                  onChange={(e) => setNewPartner({ ...newPartner, centreId: e.target.value })}
                >
                  <option value="all">All Centres (Pan India / Virtual)</option>
                  {ADMISSION_CENTRES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Payout UPI ID (Optional)">
                <input
                  className={inputCls}
                  placeholder="e.g. name@okaxis"
                  value={newPartner.bankDetails?.upiId || ""}
                  onChange={(e) =>
                    setNewPartner({
                      ...newPartner,
                      bankDetails: { ...newPartner.bankDetails, upiId: e.target.value },
                    })
                  }
                />
              </Field>

              <Field label="Internal Notes">
                <textarea
                  className="w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-2.5 text-sm outline-none focus:border-brand-teal resize-none"
                  rows={2}
                  placeholder="Partnership agreements, contract terms…"
                  value={newPartner.notes || ""}
                  onChange={(e) => setNewPartner({ ...newPartner, notes: e.target.value })}
                />
              </Field>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#EEF3F1] pt-3 mt-4">
            <span className="text-[12px] text-[#7B8E89]">
              Partner will get an instant referral code and dedicated app link.
            </span>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={busy}>
                Cancel
              </Btn>
              <Btn variant="primary" type="submit" disabled={busy}>
                {busy ? "Creating…" : "Save & Generate Code"}
              </Btn>
            </div>
          </div>
        </form>
      </Modal>

      {/* EDIT PARTNER BANK / UPI DETAILS MODAL */}
      <Modal
        open={bankModalOpen && !!editingPartner}
        onClose={() => setBankModalOpen(false)}
        title={`Payout Details — ${editingPartner?.name || ""} [${editingPartner?.code || ""}]`}
      >
        <form onSubmit={handleSavePartnerBank} className="space-y-4 pt-1">
          <div className="bg-[#F7FAF9] p-3 rounded-xl border border-[#E2ECE9] flex flex-wrap items-center gap-4">
            <span className="text-xs font-bold text-[#41564F]">Preferred Payout Method:</span>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="adminPayoutMethod"
                value="upi"
                checked={editBankForm.payoutMethod === "upi"}
                onChange={() => setEditBankForm({ ...editBankForm, payoutMethod: "upi" })}
              />
              <span>UPI ID (Instant Transfer)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="adminPayoutMethod"
                value="bank"
                checked={editBankForm.payoutMethod === "bank"}
                onChange={() => setEditBankForm({ ...editBankForm, payoutMethod: "bank" })}
              />
              <span>Bank Account (NEFT / IMPS)</span>
            </label>
          </div>

          {editBankForm.payoutMethod === "upi" ? (
            <Field label="UPI ID (VPA) *">
              <input
                className={inputCls}
                placeholder="e.g. 9876543210@paytm or name@okaxis"
                value={editBankForm.upiId}
                onChange={(e) => setEditBankForm({ ...editBankForm, upiId: e.target.value.trim() })}
                required={editBankForm.payoutMethod === "upi"}
              />
            </Field>
          ) : (
            <div className="space-y-3">
              <Field label="Account Holder Name *">
                <input
                  className={inputCls}
                  placeholder="e.g. Ramesh Kumar"
                  value={editBankForm.accountName}
                  onChange={(e) => setEditBankForm({ ...editBankForm, accountName: e.target.value })}
                  required={editBankForm.payoutMethod === "bank"}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Bank Account Number *">
                  <input
                    className={inputCls}
                    placeholder="e.g. 5010023456789"
                    value={editBankForm.accountNumber}
                    onChange={(e) => setEditBankForm({ ...editBankForm, accountNumber: e.target.value.trim() })}
                    required={editBankForm.payoutMethod === "bank"}
                  />
                </Field>

                <Field label="Bank IFSC Code *">
                  <input
                    className={inputCls}
                    placeholder="e.g. HDFC0001234"
                    value={editBankForm.ifscCode}
                    onChange={(e) =>
                      setEditBankForm({ ...editBankForm, ifscCode: e.target.value.trim().toUpperCase() })
                    }
                    required={editBankForm.payoutMethod === "bank"}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Bank Name">
                  <input
                    className={inputCls}
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    value={editBankForm.bankName}
                    onChange={(e) => setEditBankForm({ ...editBankForm, bankName: e.target.value })}
                  />
                </Field>

                <Field label="Branch Name">
                  <input
                    className={inputCls}
                    placeholder="e.g. Puducherry Main Branch"
                    value={editBankForm.branchName}
                    onChange={(e) => setEditBankForm({ ...editBankForm, branchName: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#EEF3F1] pt-3 mt-4">
            <span className="text-[11px] text-[#7B8E89]">
              Used directly for weekly payouts and NEFT/UPI settlement exports.
            </span>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" onClick={() => setBankModalOpen(false)} disabled={busy}>
                Cancel
              </Btn>
              <Btn variant="primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save Payout Details"}
              </Btn>
            </div>
          </div>
        </form>
      </Modal>

      <Toast msg={toast} />
    </AdminShell>
  );
}

export default function AdminPartnersPage() {
  return (
    <Suspense
      fallback={
        <AdminShell>
          <PageHeader
            title="Partners & Referrals"
            sub="Manage marketing promoters, referral codes, admission attribution, and commission payouts"
          />
          <div className="p-8 text-center text-[#7B8E89]">Loading partners...</div>
        </AdminShell>
      }
    >
      <PartnersContent />
    </Suspense>
  );
}
