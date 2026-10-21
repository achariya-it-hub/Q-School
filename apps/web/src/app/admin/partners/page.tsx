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
  const [tab, setTab] = useState<"partners" | "admissions">("partners");
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
      upiId: "",
      accountName: "",
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

  // Filtered admissions list
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((a) => {
      if (payoutFilter !== "all" && a.payoutStatus !== payoutFilter) return false;
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
  }, [admissions, payoutFilter, search]);

  return (
    <AdminShell>
      <PageHeader
        title="Partners & Referrals"
        sub="Manage marketing promoters, referral codes, admission attribution, and commission payouts"
      >
        <Btn variant="primary" icon="plus" onClick={() => setModalOpen(true)}>
          Create Partner Code
        </Btn>
        <Btn variant="ghost" icon="download" onClick={handleExportCsv}>
          Export CSV
        </Btn>
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
            <span className="font-medium text-gray-900">Trainer/HOC referral bonus (Organic Lead)</span>
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
              ]}
            />

            {tab === "partners" ? (
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
              <select
                aria-label="Filter by Payout Status"
                value={payoutFilter}
                onChange={(e) => setPayoutFilter(e.target.value)}
                className="h-9 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#41564F] outline-none"
              >
                <option value="all">All Payout Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
              </select>
            )}
          </div>

          <SearchInput
            placeholder={tab === "partners" ? "Search partners, code, phone…" : "Search students, parent, partner…"}
            value={search}
            onChange={setSearch}
          />
        </div>

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
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F1]">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#7B8E89]">
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

                        <td className="p-3 text-center">
                          <StatusBadge tone={statusTone}>
                            {p.status === "active" ? "Active" : "Inactive"}
                          </StatusBadge>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
                  <th className="p-3 text-right">Commission (₹)</th>
                  <th className="p-3 text-center">ERP Status</th>
                  <th className="p-3 text-center">Payout</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF3F1]">
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-[#7B8E89]">
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

                      <td className="p-3 text-right font-bold text-emerald-700">
                        +₹{a.commissionAmount.toLocaleString("en-IN")}
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
                      if (cat === "Trainer / HOC") {
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
