"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
  Toast,
  inputCls,
  useToast,
} from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { downloadCsvFile, parseCsvRows } from "@/lib/csv-helper";
import {
  CAMPAIGN_PLATFORMS,
  CONTENT_FORMATS,
  CONTENT_PILLARS,
  DESIGNERS,
  WRITERS,
  type ApprovalStatus,
  type CampaignItem,
  type CampaignPlatform,
  type ContentFormat,
  type ContentPillar,
  type NewCampaignInput,
  type PublishingStatus,
  type TargetAudience,
  type WorkflowStatus,
} from "@/lib/crm/campaign-types";

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "calendar" | "kanban" | "sales_ads">("table");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [pillarFilter, setPillarFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Calendar view month state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 10, 1)); // Nov 2026 matching user's sheet

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CampaignItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, show] = useToast();

  // Form State for Create / Edit
  const [form, setForm] = useState<NewCampaignInput>({
    postDate: new Date().toISOString().split("T")[0],
    writer: "Srikeha",
    contentPillar: "Brand & Category Awareness",
    format: "Static Image",
    platforms: "Meta (FB/IG)",
    audience: "B2C",
    postConcept: "",
    postContent: "",
    sheetLink: "",
    workedOn: "",
    status: "Work in Progress",
    approvalStatus: "Pending",
    designer: "Hari",
    assignedOn: "",
    completedOn: "",
    driveLink: "",
    creativeApprovalStatus: "Pending",
    postStatus: "Draft",
    postUrl: "",
    publishedBy: "",
    publishedOn: "",
    budget: 0,
    notes: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load campaigns");
      setCampaigns(data.campaigns || []);
    } catch {
      show("Could not load campaign calendar");
    } finally {
      setLoading(false);
    }
  }, [show]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const openCreateModal = (dateStr?: string) => {
    setEditingItem(null);
    setForm({
      postDate: dateStr || new Date().toISOString().split("T")[0],
      writer: "Srikeha",
      contentPillar: "Brand & Category Awareness",
      format: "Static Image",
      platforms: "Meta (FB/IG)",
      audience: "B2C",
      postConcept: "",
      postContent: "",
      sheetLink: "",
      workedOn: "",
      status: "Work in Progress",
      approvalStatus: "Pending",
      designer: "Hari",
      assignedOn: "",
      completedOn: "",
      driveLink: "",
      creativeApprovalStatus: "Pending",
      postStatus: "Draft",
      postUrl: "",
      publishedBy: "",
      publishedOn: "",
      budget: 0,
      notes: "",
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: CampaignItem) => {
    setEditingItem(item);
    setForm({
      postDate: item.postDate,
      writer: item.writer,
      contentPillar: item.contentPillar,
      format: item.format,
      platforms: item.platforms,
      audience: item.audience,
      postConcept: item.postConcept,
      postContent: item.postContent || "",
      sheetLink: item.sheetLink || "",
      workedOn: item.workedOn || "",
      status: item.status,
      approvalStatus: item.approvalStatus,
      approvedOn: item.approvedOn || "",
      designer: item.designer || "Hari",
      assignedOn: item.assignedOn || "",
      completedOn: item.completedOn || "",
      driveLink: item.driveLink || "",
      creativeApprovalStatus: item.creativeApprovalStatus || "Pending",
      creativeApprovedOn: item.creativeApprovedOn || "",
      postStatus: item.postStatus,
      postUrl: item.postUrl || "",
      publishedBy: item.publishedBy || "",
      publishedOn: item.publishedOn || "",
      budget: item.budget || 0,
      notes: item.notes || "",
    });
    setModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.postConcept.trim()) {
      show("Please enter a Post Concept / Campaign Name.");
      return;
    }
    setBusy(true);
    try {
      if (editingItem) {
        const res = await fetch(`/api/admin/campaigns/${editingItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        show(`Updated campaign "${data.campaign.postConcept}"`);
      } else {
        const res = await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");
        show(`Added campaign "${data.campaign.postConcept}"`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      show((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Quick Inline Status Update
  const handleQuickUpdate = async (id: string, updates: Partial<CampaignItem>) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setCampaigns((prev) => prev.map((c) => (c.id === id ? data.campaign : c)));
      show("Updated campaign status");
    } catch {
      show("Could not update campaign");
    }
  };

  // Delete Campaign
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this campaign entry?")) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      show("Campaign deleted");
      if (editingItem?.id === id) setModalOpen(false);
    } catch {
      show("Could not delete campaign");
    }
  };

  // Export Full CSV matching User's Google Sheet
  const handleExportCsv = () => {
    if (!campaigns.length) {
      show("No campaign data to export");
      return;
    }
    const headers = [
      "Post Date",
      "Writer",
      "Content Pillar",
      "Format",
      "Platforms",
      "Audience",
      "Post Concept",
      "Post Content",
      "Sheet Link",
      "Worked on",
      "Status",
      "Approval Status",
      "Approved On",
      "Designer",
      "Assigned On",
      "Completed on",
      "Drive Link",
      "Design Approval Status",
      "Design Approved On",
      "Post Status",
      "Post URL",
      "Published by",
      "Published on",
      "Budget (INR)",
    ];

    const rows = campaigns.map((c) => [
      `"${c.postDate}"`,
      `"${c.writer}"`,
      `"${c.contentPillar}"`,
      `"${c.format}"`,
      `"${c.platforms}"`,
      `"${c.audience}"`,
      `"${c.postConcept.replace(/"/g, '""')}"`,
      `"${(c.postContent || "").replace(/"/g, '""')}"`,
      `"${c.sheetLink || ""}"`,
      `"${c.workedOn || ""}"`,
      `"${c.status}"`,
      `"${c.approvalStatus}"`,
      `"${c.approvedOn || ""}"`,
      `"${c.designer || ""}"`,
      `"${c.assignedOn || ""}"`,
      `"${c.completedOn || ""}"`,
      `"${c.driveLink || ""}"`,
      `"${c.creativeApprovalStatus || ""}"`,
      `"${c.creativeApprovedOn || ""}"`,
      `"${c.postStatus}"`,
      `"${c.postUrl || ""}"`,
      `"${c.publishedBy || ""}"`,
      `"${c.publishedOn || ""}"`,
      c.budget || 0,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `qschool-campaign-calendar-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("Campaign calendar CSV downloaded successfully!");
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (platformFilter !== "all") {
        if (platformFilter === "meta" && !c.platforms.includes("Meta")) return false;
        if (platformFilter === "google" && !c.platforms.includes("Google")) return false;
        if (platformFilter === "linkedin" && !c.platforms.includes("LinkedIn")) return false;
      }
      if (pillarFilter !== "all" && c.contentPillar !== pillarFilter) return false;
      if (statusFilter !== "all" && c.postStatus !== statusFilter) return false;
      if (view === "sales_ads" && c.contentPillar !== "Sales & Admission Ad" && c.contentPillar !== "SMT & Enrolment" && !c.platforms.includes("Google") && !c.platforms.includes("Meta")) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          c.postConcept.toLowerCase().includes(q) ||
          c.writer.toLowerCase().includes(q) ||
          (c.designer || "").toLowerCase().includes(q) ||
          c.contentPillar.toLowerCase().includes(q) ||
          c.platforms.toLowerCase().includes(q) ||
          (c.postContent || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [campaigns, platformFilter, pillarFilter, statusFilter, view, search]);

  // Statistics
  const stats = useMemo(() => {
    const total = campaigns.length;
    const metaCount = campaigns.filter((c) => c.platforms.includes("Meta")).length;
    const googleCount = campaigns.filter((c) => c.platforms.includes("Google")).length;
    const liveCount = campaigns.filter((c) => c.postStatus === "Live" || c.postStatus === "Published").length;
    const pendingApprovalCount = campaigns.filter(
      (c) => c.approvalStatus === "Pending" || c.creativeApprovalStatus === "Pending"
    ).length;

    return { total, metaCount, googleCount, liveCount, pendingApprovalCount };
  }, [campaigns]);

  // Calendar Days Computation
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading padding from prev month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Trailing padding
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      days.push({
        dateStr: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonthDate]);

  return (
    <AdminShell>
      <PageHeader
        title="Campaign Calendar"
        sub="Marketing content planner and paid ad schedule for Meta (Facebook & Instagram), Google Ads, and social channels"
      >
        <Btn variant="primary" icon="plus" onClick={() => openCreateModal()}>
          New Campaign Post
        </Btn>
        <Btn variant="ghost" icon="upload" onClick={() => setBulkModalOpen(true)}>
          Bulk Upload
        </Btn>
        <Btn variant="ghost" icon="download" onClick={handleExportCsv}>
          Export Calendar CSV
        </Btn>
      </PageHeader>

      {/* KPI Figures */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Figure
          label="Total Scheduled"
          value={stats.total.toString()}
          icon="calendar"
        />
        <Figure
          label="Meta (FB & IG) Posts"
          value={stats.metaCount.toString()}
          icon="users"
        />
        <Figure
          label="Google Ads & Search"
          value={stats.googleCount.toString()}
          icon="search"
        />
        <Figure
          label="Live / Published"
          value={stats.liveCount.toString()}
          icon="checkCircle"
        />
        <Figure
          label="Pending Approvals"
          value={stats.pendingApprovalCount.toString()}
          icon="alert"
        />
      </div>

      {/* Main Container Card */}
      <Card>
        {/* Top Controls Bar */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              label="Calendar Views"
              value={view}
              onChange={(v) => setView(v as any)}
              options={[
                { value: "table", label: "Campaigns Table" },
                { value: "calendar", label: "Monthly Calendar" },
                { value: "kanban", label: "Workflow Pipeline" },
                { value: "sales_ads", label: "Sales & Paid Ads" },
              ]}
            />

            {/* Platform Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#F7FAF9] border border-[#E2ECE9] p-1 rounded-xl shadow-xs">
              <button
                type="button"
                onClick={() => setPlatformFilter("all")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                  platformFilter === "all"
                    ? "bg-white text-brand-ink shadow-xs"
                    : "text-[#7B8E89] hover:text-black"
                }`}
              >
                All Platforms
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter("meta")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                  platformFilter === "meta"
                    ? "bg-[#1877F2] text-white shadow-xs"
                    : "text-[#1877F2] hover:bg-blue-50"
                }`}
              >
                <span>Meta (FB/IG)</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter("google")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                  platformFilter === "google"
                    ? "bg-[#EA4335] text-white shadow-xs"
                    : "text-[#EA4335] hover:bg-red-50"
                }`}
              >
                <span>Google Ads</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter("linkedin")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
                  platformFilter === "linkedin"
                    ? "bg-[#0A66C2] text-white shadow-xs"
                    : "text-[#0A66C2] hover:bg-blue-50"
                }`}
              >
                <span>LinkedIn</span>
              </button>
            </div>

            {/* Content Pillar Filter */}
            <select
              aria-label="Filter by Content Pillar"
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="h-9 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-xs font-semibold text-[#41564F] outline-none"
            >
              <option value="all">All Content Pillars</option>
              {CONTENT_PILLARS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <SearchInput
            placeholder="Search concept, writer, copy, designer…"
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* ───────── VIEW 1: CAMPAIGNS TABLE (Standard Q-School Clean Design) ───────── */}
        {view === "table" && (
          <div className="rounded-2xl border border-[#E2ECE9] bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12.5px] whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#EEF3F1] bg-[#F7FAF9] text-[11px] font-bold text-[#41564F] uppercase tracking-wider select-none">
                    <th className="py-3 px-3.5">Post Date</th>
                    <th className="py-3 px-3.5">Campaign &amp; Concept</th>
                    <th className="py-3 px-3.5">Platform</th>
                    <th className="py-3 px-3.5">Pillar &amp; Format</th>
                    <th className="py-3 px-3.5">Audience</th>
                    <th className="py-3 px-3.5">Copywriter</th>
                    <th className="py-3 px-3.5 text-center">Copy Review</th>
                    <th className="py-3 px-3.5">Designer</th>
                    <th className="py-3 px-3.5 text-center">Creative Review</th>
                    <th className="py-3 px-3.5 text-center">Publishing</th>
                    <th className="py-3 px-3.5 text-center">Assets &amp; Links</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F3] font-medium text-brand-ink">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center text-[#7B8E89]">
                        No campaigns matching the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F9FBFB] transition">
                        {/* Post Date */}
                        <td className="py-3 px-3.5 font-bold font-mono text-brand-ink">
                          {c.postDate}
                        </td>

                        {/* Campaign & Concept */}
                        <td className="py-3 px-3.5 max-w-xs">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="font-bold text-brand-ink hover:text-brand-teal text-left truncate block max-w-xs"
                            title={c.postConcept}
                          >
                            {c.postConcept}
                          </button>
                          {c.postContent && (
                            <div className="text-[11px] text-[#7B8E89] truncate max-w-xs" title={c.postContent}>
                              {c.postContent}
                            </div>
                          )}
                        </td>

                        {/* Platform */}
                        <td className="py-3 px-3.5">
                          {c.platforms.includes("Meta") ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {c.platforms}
                            </span>
                          ) : c.platforms.includes("Google") ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[11px] border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              {c.platforms}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                              {c.platforms}
                            </span>
                          )}
                        </td>

                        {/* Pillar & Format */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-gray-800 text-[11.5px]">{c.contentPillar}</div>
                          <div className="text-[10.5px] text-[#7B8E89]">{c.format}</div>
                        </td>

                        {/* Audience */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.audience === "B2B"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {c.audience}
                          </span>
                        </td>

                        {/* Writer */}
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F2F6F5] text-[#2C4A43] text-[11px] font-semibold">
                            {c.writer}
                          </span>
                        </td>

                        {/* Copy Review */}
                        <td className="py-3 px-3.5 text-center">
                          <select
                            aria-label="Copy Approval Status"
                            value={c.approvalStatus}
                            onChange={(e) =>
                              handleQuickUpdate(c.id, {
                                approvalStatus: e.target.value as any,
                                approvedOn: e.target.value === "Approved" ? new Date().toISOString().split("T")[0] : undefined,
                              })
                            }
                            className={`h-7 px-2 rounded-lg border text-[10.5px] font-bold outline-none cursor-pointer ${
                              c.approvalStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : c.approvalStatus === "Changes Requested"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Changes Requested">Changes</option>
                            <option value="Not Required">N/A</option>
                          </select>
                        </td>

                        {/* Designer */}
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F2F6F5] text-[#2C4A43] text-[11px] font-semibold">
                            {c.designer || "Unassigned"}
                          </span>
                        </td>

                        {/* Creative Review */}
                        <td className="py-3 px-3.5 text-center">
                          <select
                            aria-label="Creative Approval Status"
                            value={c.creativeApprovalStatus}
                            onChange={(e) =>
                              handleQuickUpdate(c.id, {
                                creativeApprovalStatus: e.target.value as any,
                                creativeApprovedOn: e.target.value === "Approved" ? new Date().toISOString().split("T")[0] : undefined,
                              })
                            }
                            className={`h-7 px-2 rounded-lg border text-[10.5px] font-bold outline-none cursor-pointer ${
                              c.creativeApprovalStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : c.creativeApprovalStatus === "Revision Needed"
                                ? "bg-red-50 text-red-800 border-red-300"
                                : "bg-amber-50 text-amber-800 border-amber-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Revision Needed">Revision</option>
                            <option value="Not Required">N/A</option>
                          </select>
                        </td>

                        {/* Post Status */}
                        <td className="py-3 px-3.5 text-center">
                          <select
                            aria-label="Publishing Status"
                            value={c.postStatus}
                            onChange={(e) =>
                              handleQuickUpdate(c.id, {
                                postStatus: e.target.value as any,
                                publishedOn: e.target.value === "Live" || e.target.value === "Published" ? new Date().toISOString().split("T")[0] : undefined,
                              })
                            }
                            className={`h-7 px-2 rounded-lg border text-[10.5px] font-bold outline-none cursor-pointer ${
                              c.postStatus === "Live" || c.postStatus === "Published"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : c.postStatus === "Scheduled"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : "bg-slate-50 text-slate-800 border-slate-300"
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Published">Published</option>
                            <option value="Live">Live</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>

                        {/* Assets & Links */}
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {c.sheetLink ? (
                              <a
                                href={c.sheetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                                title="Open Copy Sheet / Doc"
                              >
                                <Icon name="link" size={13} />
                              </a>
                            ) : (
                              <span className="p-1.5 text-gray-300" title="No copy doc link">
                                <Icon name="link" size={13} />
                              </span>
                            )}
                            {c.driveLink ? (
                              <a
                                href={c.driveLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                title="Open Creative Drive Asset"
                              >
                                <Icon name="external" size={13} />
                              </a>
                            ) : (
                              <span className="p-1.5 text-gray-300" title="No drive link">
                                <Icon name="external" size={13} />
                              </span>
                            )}
                            {c.postUrl && (
                              <a
                                href={c.postUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                                title="Open Live Post"
                              >
                                <Icon name="share" size={13} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="p-1.5 rounded-lg border border-[#E2ECE9] hover:bg-[#F2F6F5] text-[#41564F] transition"
                              title="Edit Campaign Details"
                            >
                              <Icon name="edit" size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 transition"
                              title="Delete Campaign"
                            >
                              <Icon name="trash" size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ───────── VIEW 2: INTERACTIVE MONTHLY CALENDAR ───────── */}
        {view === "calendar" && (
          <div className="space-y-3">
            {/* Month Navigator */}
            <div className="flex items-center justify-between bg-[#F7FAF9] border border-[#E2ECE9] p-3 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#D5E3DF] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Previous Month
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentMonthDate(
                      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
                    )
                  }
                  className="px-3 py-1.5 rounded-xl border border-[#D5E3DF] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                >
                  Next Month →
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date())}
                  className="px-3 py-1.5 text-xs font-bold text-brand-teal hover:underline"
                >
                  Jump to Today
                </button>
              </div>

              <div className="text-base font-extrabold text-brand-ink">
                {currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-[#E2ECE9] border border-[#E2ECE9] rounded-2xl overflow-hidden shadow-xs">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="bg-[#F7FAF9] py-2.5 text-center text-xs font-bold text-[#7B8E89] uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((cell) => {
                const dayPosts = filteredCampaigns.filter((c) => c.postDate === cell.dateStr);

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => openCreateModal(cell.dateStr)}
                    className={`min-h-[110px] p-2 bg-white transition hover:bg-amber-50/30 cursor-pointer flex flex-col justify-between ${
                      !cell.isCurrentMonth ? "bg-[#FAFCFB] opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          cell.isCurrentMonth ? "text-brand-ink" : "text-[#A0B0AB]"
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {dayPosts.length > 0 && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-brand-deep text-white">
                          {dayPosts.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(post);
                          }}
                          className={`p-1.5 rounded-lg text-[10.5px] font-semibold border truncate cursor-pointer shadow-xs ${
                            post.platforms.includes("Meta")
                              ? "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100"
                              : post.platforms.includes("Google")
                              ? "bg-red-50 text-red-900 border-red-200 hover:bg-red-100"
                              : "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
                          }`}
                          title={`${post.postConcept} (${post.platforms})`}
                        >
                          <div className="flex items-center gap-1 font-bold truncate">
                            <span>{post.platforms.includes("Meta") ? "📘" : post.platforms.includes("Google") ? "🔍" : "💼"}</span>
                            <span className="truncate">{post.postConcept}</span>
                          </div>
                          <div className="text-[9.5px] text-[#7B8E89] flex items-center justify-between mt-0.5">
                            <span>{post.format}</span>
                            <span className="font-bold text-gray-700">{post.postStatus}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-[#A0B0AB] text-right mt-1 opacity-0 hover:opacity-100">
                      + Add
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ───────── VIEW 3: KANBAN WORKFLOW PIPELINE ───────── */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { title: "Planning & Concepts", statuses: ["Draft"] },
              { title: "Copywriting & Review", statuses: ["Work in Progress", "Ready for Review"] },
              { title: "Creative & Design", statuses: ["Completed"] },
              { title: "Scheduled & Live", statuses: ["Scheduled", "Live", "Published"] },
            ].map((col) => {
              const colPosts = filteredCampaigns.filter((c) =>
                col.title === "Scheduled & Live"
                  ? col.statuses.includes(c.postStatus)
                  : col.statuses.includes(c.status)
              );

              return (
                <div key={col.title} className="bg-[#F7FAF9] border border-[#E2ECE9] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2ECE9]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-ink">
                      {col.title}
                    </h3>
                    <span className="text-xs font-extrabold text-brand-deep bg-[#E3F4F0] px-2 py-0.5 rounded-full">
                      {colPosts.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 min-h-[300px]">
                    {colPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => openEditModal(post)}
                        className="p-3 bg-white border border-[#E2ECE9] rounded-xl shadow-xs hover:shadow-md transition cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10.5px] font-bold text-[#7B8E89]">
                            {post.postDate}
                          </span>
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                              post.platforms.includes("Meta")
                                ? "bg-blue-100 text-blue-800"
                                : post.platforms.includes("Google")
                                ? "bg-red-100 text-red-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {post.platforms}
                          </span>
                        </div>

                        <div className="font-bold text-sm text-brand-ink leading-snug">
                          {post.postConcept}
                        </div>

                        <div className="text-xs text-[#555] line-clamp-2">
                          {post.postContent || "No copy entered yet"}
                        </div>

                        <div className="pt-2 border-t border-[#EEF3F1] flex items-center justify-between text-[11px] text-[#7B8E89]">
                          <span>✍️ {post.writer}</span>
                          <span>🎨 {post.designer || "Unassigned"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ───────── VIEW 4: SALES & PAID ADS FOCUS (Screenshot 2 view) ───────── */}
        {view === "sales_ads" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-900">
              <span className="text-base">🎯</span>
              <span>
                <strong>Sales &amp; Admission Ad Pipeline:</strong> High-priority paid advertising campaigns
                dedicated to student lead generation and centre admissions via Meta Ads and Google Performance Max.
              </span>
            </div>

            <div className="rounded-2xl border border-[#E2ECE9] bg-white overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px] whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#EEF3F1] bg-[#F7FAF9] text-[11px] font-bold text-[#41564F] uppercase tracking-wider select-none">
                      <th className="py-3 px-3.5">Writer</th>
                      <th className="py-3 px-3.5">Sales Ad Content / Concept</th>
                      <th className="py-3 px-3.5 text-center">Sheet Link</th>
                      <th className="py-3 px-3.5">Assigned On</th>
                      <th className="py-3 px-3.5">Completed On</th>
                      <th className="py-3 px-3.5 text-center">Workflow</th>
                      <th className="py-3 px-3.5 text-center">Approval</th>
                      <th className="py-3 px-3.5">Approved On</th>
                      <th className="py-3 px-3.5">Platform</th>
                      <th className="py-3 px-3.5">Budget (₹)</th>
                      <th className="py-3 px-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F4F3] font-medium text-brand-ink">
                    {filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F9FBFB] transition">
                        <td className="py-3 px-3.5 font-semibold text-gray-800">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F2F6F5] text-[#2C4A43] text-[11px] font-semibold">
                            {c.writer}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 max-w-sm">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="font-bold text-brand-ink hover:text-brand-teal text-left truncate block max-w-sm"
                          >
                            {c.postConcept}
                          </button>
                          <div className="text-[11px] text-[#7B8E89] max-w-sm truncate">{c.postContent || "—"}</div>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          {c.sheetLink ? (
                            <a
                              href={c.sheetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition text-xs"
                            >
                              <Icon name="link" size={13} />
                              <span>Link</span>
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-[11px]">
                          {c.assignedOn || c.postDate}
                        </td>

                        <td className="py-3 px-3.5 font-mono text-[11px]">
                          {c.completedOn || <span className="text-gray-400 italic">In progress</span>}
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                              c.approvalStatus === "Approved"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {c.approvalStatus}
                          </span>
                        </td>

                        <td className="py-3 px-3.5 font-mono text-[11px]">
                          {c.approvedOn || "—"}
                        </td>

                        <td className="py-3 px-3.5">
                          {c.platforms.includes("Meta") ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {c.platforms}
                            </span>
                          ) : c.platforms.includes("Google") ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[11px] border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              {c.platforms}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                              {c.platforms}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3.5 font-bold text-emerald-700">
                          ₹{(c.budget || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="px-2.5 py-1 rounded-lg border border-[#E2ECE9] hover:bg-[#F2F6F5] text-xs font-semibold text-brand-ink transition"
                          >
                            Edit Ad
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ───────── CREATE / EDIT CAMPAIGN MODAL ───────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit Campaign — ${editingItem.postConcept}` : "New Campaign Post / Ad"}
        ratio169
      >
        <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3.5">
            {/* Left Column: Planning & Copywriting */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Post Date *">
                  <input
                    type="date"
                    className={inputCls}
                    value={form.postDate}
                    onChange={(e) => setForm({ ...form, postDate: e.target.value })}
                    required
                  />
                </Field>

                <Field label="Writer *">
                  <select
                    className={inputCls}
                    value={form.writer}
                    onChange={(e) => setForm({ ...form, writer: e.target.value })}
                  >
                    {WRITERS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Post Concept / Headline *">
                <input
                  className={inputCls}
                  placeholder="e.g. Diwali STEM Workshop, National Education Day"
                  value={form.postConcept}
                  onChange={(e) => setForm({ ...form, postConcept: e.target.value })}
                  required
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Platforms *">
                  <select
                    className={inputCls}
                    value={form.platforms}
                    onChange={(e) => setForm({ ...form, platforms: e.target.value as any })}
                  >
                    {CAMPAIGN_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Content Pillar *">
                  <select
                    className={inputCls}
                    value={form.contentPillar}
                    onChange={(e) => setForm({ ...form, contentPillar: e.target.value as any })}
                  >
                    {CONTENT_PILLARS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Format">
                  <select
                    className={inputCls}
                    value={form.format}
                    onChange={(e) => setForm({ ...form, format: e.target.value as any })}
                  >
                    {CONTENT_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Audience">
                  <select
                    className={inputCls}
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value as any })}
                  >
                    <option value="B2C">B2C (Parents & Students)</option>
                    <option value="B2B">B2B (Schools & Partners)</option>
                    <option value="B2C & B2B">Both (Omnichannel)</option>
                  </select>
                </Field>
              </div>

              <Field label="Post Content / Caption / Ad Copy">
                <textarea
                  className="w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] p-2.5 text-xs outline-none focus:border-brand-teal resize-none"
                  rows={3}
                  placeholder="Primary caption, hook, hashtags or Google Ad description…"
                  value={form.postContent}
                  onChange={(e) => setForm({ ...form, postContent: e.target.value })}
                />
              </Field>

              <Field label="Google Sheet / Copy Doc Link">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://docs.google.com/document/…"
                  value={form.sheetLink}
                  onChange={(e) => setForm({ ...form, sheetLink: e.target.value })}
                />
              </Field>
            </div>

            {/* Right Column: Workflow, Creative, Ad Ops */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Copywriting Status">
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Ready for Review">Ready for Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </Field>

                <Field label="Copy Approval Status">
                  <select
                    className={inputCls}
                    value={form.approvalStatus}
                    onChange={(e) => setForm({ ...form, approvalStatus: e.target.value as any })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Changes Requested">Changes Requested</option>
                    <option value="Not Required">Not Required</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Assigned Designer">
                  <select
                    className={inputCls}
                    value={form.designer}
                    onChange={(e) => setForm({ ...form, designer: e.target.value })}
                  >
                    {DESIGNERS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Design Approval Status">
                  <select
                    className={inputCls}
                    value={form.creativeApprovalStatus}
                    onChange={(e) => setForm({ ...form, creativeApprovalStatus: e.target.value as any })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Revision Needed">Revision Needed</option>
                    <option value="Not Required">Not Required</option>
                  </select>
                </Field>
              </div>

              <Field label="Google Drive / Creative Assets Link">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://drive.google.com/drive/folders/…"
                  value={form.driveLink}
                  onChange={(e) => setForm({ ...form, driveLink: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Publishing Status">
                  <select
                    className={inputCls}
                    value={form.postStatus}
                    onChange={(e) => setForm({ ...form, postStatus: e.target.value as any })}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Published">Published</option>
                    <option value="Live">Live</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                </Field>

                <Field label="Ad Budget (INR, if paid)">
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="e.g. 5000"
                    value={form.budget || ""}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) || 0 })}
                  />
                </Field>
              </div>

              <Field label="Live Post / Ad URL">
                <input
                  type="url"
                  className={inputCls}
                  placeholder="https://facebook.com/… or https://instagram.com/…"
                  value={form.postUrl}
                  onChange={(e) => setForm({ ...form, postUrl: e.target.value })}
                />
              </Field>

              <Field label="Internal Workflow Notes">
                <input
                  className={inputCls}
                  placeholder="Targeting notes, hashtags, campaign objectives…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#EEF3F1] pt-3 mt-4">
            {editingItem ? (
              <button
                type="button"
                onClick={() => handleDelete(editingItem.id)}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Delete Post
              </button>
            ) : (
              <span className="text-[12px] text-[#7B8E89]">
                Post will appear in the schedule, calendar, and Kanban pipeline.
              </span>
            )}
            <div className="flex items-center gap-2">
              <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={busy}>
                Cancel
              </Btn>
              <Btn variant="primary" type="submit" disabled={busy}>
                {busy ? "Saving…" : editingItem ? "Update Campaign" : "Save to Calendar"}
              </Btn>
            </div>
          </div>
        </form>
      </Modal>

      <BulkUploadCampaignsModal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={async (summary) => {
          setBulkModalOpen(false);
          show(summary);
          await loadData();
        }}
      />

      <Toast msg={toast} />
    </AdminShell>
  );
}

function BulkUploadCampaignsModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: (summary: string) => void;
}) {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleTemplate = () => {
    const csv =
      "Post Date,Writer,Content Pillar,Format,Platforms,Audience,Post Concept,Post Content,Sheet Link,Copy Status,Designer,Drive Link,Post Status,Budget\n" +
      "2026-10-25,Srikeha,Sales & Admission Ad,Lead Form Ad,Meta (FB/IG),B2C,Weekend STEM Trial Classes,Join our fun weekend coding & robotics sessions. Free kit demonstration.,https://docs.google.com/document/d/demo-1,Work in Progress,Hari,https://drive.google.com/drive/demo-1,Draft,5000\n" +
      "2026-10-26,Srikeha,Program & Framework,Carousel,LinkedIn,B2B,School STEM Lab Partnerships,Empower your school with world-class robotics curriculum.,https://docs.google.com/document/d/demo-2,Ready for Review,Hari,https://drive.google.com/drive/demo-2,Scheduled,8000";
    downloadCsvFile("campaigns_import_template.csv", csv);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || "");
      setCsvText(text);
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const parsedRecords = parseCsvRows(csvText);
  const campaignRows = parsedRecords.map((r) => ({
    postDate: r.postdate || r.date || r.scheduleddate || new Date().toISOString().split("T")[0],
    writer: r.writer || r.copywriter || "Srikeha",
    contentPillar: (r.contentpillar || r.pillar || "Brand & Category Awareness") as ContentPillar,
    format: (r.format || r.adformat || "Static Image") as ContentFormat,
    platforms: (r.platforms || r.platform || "Meta (FB/IG)") as CampaignPlatform,
    audience: (r.audience?.toUpperCase() === "B2B" ? "B2B" : "B2C") as any,
    postConcept: r.postconcept || r.concept || r.campaignname || r.title || "",
    postContent: r.postcontent || r.content || r.copy || "",
    sheetLink: r.sheetlink || r.doclink || r.doc || "",
    status: (r.copystatus || r.status || "Work in Progress") as any,
    designer: r.designer || "Hari",
    driveLink: r.drivelink || r.drive || r.assetlink || "",
    postStatus: (r.poststatus || "Draft") as any,
    budget: Number(r.budget || 0) || 0,
  }));

  const validRows = campaignRows.filter((r) => r.postConcept.trim());

  const handleUpload = async () => {
    if (!validRows.length) {
      setError("Please upload or paste CSV data with at least a Post Concept / Campaign Name.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import campaigns");

      onSuccess(`Successfully imported ${data.created} campaign posts into Campaign Calendar.`);
      setCsvText("");
      setFileName("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} title="Bulk Upload Campaigns" onClose={onClose} ratio169>
      <div className="space-y-4 text-xs">
        {/* Helper bar & Download Template */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 rounded-xl bg-[#F0F5F4] p-3 border border-[#E2ECE9]">
          <div className="text-[#41564f]">
            <p className="font-bold text-brand-ink">Upload CSV file or paste campaign calendar sheet</p>
            <p className="text-[11px] text-[#7B8E89]">
              Columns: Post Date, Writer, Content Pillar, Format, Platforms, Audience, Post Concept, Budget
            </p>
          </div>
          <button
            type="button"
            onClick={sampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D9E6E2] bg-white text-brand-deep font-bold text-xs hover:border-brand-teal transition shadow-2xs self-start sm:self-auto"
          >
            <Icon name="download" size={13} />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Dropzone / File Picker */}
        <div className="border-2 border-dashed border-[#D9E6E2] hover:border-brand-teal/60 rounded-2xl p-4 text-center transition bg-[#FBFDFD]">
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleFileChange}
            id="campaigns-csv-input"
            className="hidden"
          />
          <label htmlFor="campaigns-csv-input" className="cursor-pointer flex flex-col items-center gap-1.5">
            <span className="p-2.5 rounded-full bg-[#E9F6F2] text-brand-deep">
              <Icon name="upload" size={18} />
            </span>
            <span className="font-bold text-brand-ink">
              {fileName ? fileName : "Click to select .CSV file or drag & drop"}
            </span>
            <span className="text-[11px] text-[#7B8E89]">Supports standard UTF-8 CSV exports from Google Sheets or Excel</span>
          </label>
        </div>

        {/* Paste CSV Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-[#41564f] uppercase tracking-wider mb-1">
            Or paste CSV text directly:
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setError(null);
            }}
            placeholder="Post Date,Platforms,Content Pillar,Post Concept,Budget&#10;2026-10-25,Meta (FB/IG),Sales & Admission Ad,Trial Class Campaign,5000"
            className="w-full font-mono text-[11px] p-2.5 rounded-xl border border-[#D9E6E2] bg-white text-brand-ink outline-none focus:border-brand-teal"
          />
        </div>

        {/* Real-time Preview Table */}
        {validRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-brand-ink">
                Preview: {validRows.length} {validRows.length === 1 ? "campaign" : "campaigns"} ready to import
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ Valid formatting detected
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#E2ECE9] bg-white">
              <table className="w-full text-left text-[11.5px] whitespace-nowrap">
                <thead className="bg-[#F7FAF9] border-b border-[#EEF3F1] text-[10.5px] font-bold text-[#41564f] uppercase">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Concept / Campaign</th>
                    <th className="p-2">Platform</th>
                    <th className="p-2">Pillar</th>
                    <th className="p-2">Format</th>
                    <th className="p-2">Audience</th>
                    <th className="p-2">Writer</th>
                    <th className="p-2 text-right">Budget (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4F3]">
                  {validRows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="hover:bg-[#F9FBFB]">
                      <td className="p-2 font-mono font-bold text-brand-ink">{r.postDate}</td>
                      <td className="p-2 font-bold text-brand-ink max-w-xs truncate">{r.postConcept}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                          {r.platforms}
                        </span>
                      </td>
                      <td className="p-2 text-gray-700">{r.contentPillar}</td>
                      <td className="p-2 text-[#7B8E89]">{r.format}</td>
                      <td className="p-2 font-bold text-[10px]">{r.audience}</td>
                      <td className="p-2">{r.writer}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-700">
                        {r.budget ? `₹${r.budget.toLocaleString("en-IN")}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validRows.length > 5 && (
                <div className="p-2 text-center text-[10.5px] text-[#7B8E89] bg-[#F7FAF9] border-t border-[#EEF3F1]">
                  ...and {validRows.length - 5} more campaigns
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEF3F1]">
          <Btn variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            icon="upload"
            onClick={handleUpload}
            disabled={uploading || validRows.length === 0}
          >
            {uploading ? "Importing campaigns…" : `Confirm & Import ${validRows.length} Campaigns`}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminCampaignsPage() {
  return (
    <Suspense
      fallback={
        <AdminShell>
          <PageHeader
            title="Campaign Calendar"
            sub="Marketing content planner and paid ad schedule for Meta and Google Ads"
          />
          <div className="p-8 text-center text-[#7B8E89]">Loading campaign calendar...</div>
        </AdminShell>
      }
    >
      <CampaignsContent />
    </Suspense>
  );
}
