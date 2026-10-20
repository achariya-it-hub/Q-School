"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AGENTS, STAGES, inr, type Stage } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Drawer, Field, Modal, PageHeader, SearchInput, StatusBadge, Toast, inputCls, useToast } from "@/components/admin/ui";
import { useCrmLeads, type CrmLead } from "@/components/admin/crm";
import { Icon } from "@/components/icons";
import { WaChat } from "@/components/admin/whatsapp";

const SOURCE_FILTERS = [
  { key: "all", label: "All sources" },
  { key: "meta", label: "Meta (FB/IG)" },
  { key: "google", label: "Google Ads" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "website", label: "Website" },
  { key: "webhook", label: "Other" },
];

type ViewMode = "kanban" | "table" | "funnel" | "list";

interface StageTheme {
  name: Stage;
  dotBg: string;
  badgeBg: string;
  badgeText: string;
  colBg: string;
  colBorder: string;
  headerGradient: string;
  headerText: string;
  cardBorderLeft: string;
  barColor: string;
}

const STAGE_THEME: Record<Stage, StageTheme> = {
  Enquiry: {
    name: "Enquiry",
    dotBg: "bg-blue-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    colBg: "bg-[#F3F7FF]",
    colBorder: "border-blue-200",
    headerGradient: "from-blue-600 to-indigo-600",
    headerText: "text-blue-900",
    cardBorderLeft: "border-l-blue-500",
    barColor: "#3B82F6",
  },
  Contacted: {
    name: "Contacted",
    dotBg: "bg-amber-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
    colBg: "bg-[#FFFBF2]",
    colBorder: "border-amber-200",
    headerGradient: "from-amber-500 to-orange-500",
    headerText: "text-amber-900",
    cardBorderLeft: "border-l-amber-500",
    barColor: "#F59E0B",
  },
  Demo: {
    name: "Demo",
    dotBg: "bg-purple-500",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-800",
    colBg: "bg-[#FAF5FF]",
    colBorder: "border-purple-200",
    headerGradient: "from-purple-600 to-violet-600",
    headerText: "text-purple-900",
    cardBorderLeft: "border-l-purple-500",
    barColor: "#8B5CF6",
  },
  Negotiation: {
    name: "Negotiation",
    dotBg: "bg-teal-500",
    badgeBg: "bg-teal-100",
    badgeText: "text-teal-800",
    colBg: "bg-[#F0FDFB]",
    colBorder: "border-teal-200",
    headerGradient: "from-teal-600 to-cyan-600",
    headerText: "text-teal-900",
    cardBorderLeft: "border-l-teal-500",
    barColor: "#14B8A6",
  },
  Admitted: {
    name: "Admitted",
    dotBg: "bg-emerald-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    colBg: "bg-[#F0FDF4]",
    colBorder: "border-emerald-200",
    headerGradient: "from-emerald-600 to-green-600",
    headerText: "text-emerald-900",
    cardBorderLeft: "border-l-emerald-500",
    barColor: "#10B981",
  },
  Dropped: {
    name: "Dropped",
    dotBg: "bg-rose-500",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-800",
    colBg: "bg-[#FFF1F2]",
    colBorder: "border-rose-200",
    headerGradient: "from-rose-600 to-pink-600",
    headerText: "text-rose-900",
    cardBorderLeft: "border-l-rose-500",
    barColor: "#F43F5E",
  },
};

export default function LeadsPage() {
  const { leads, loading, fresh, clearFresh, patch, create } = useCrmLeads();
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("All");
  const [src, setSrc] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, show] = useToast();

  // Telephony 1-Click Calling State
  const [callingLead, setCallingLead] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [callDuration, setCallDuration] = useState(0);
  const [callChannel, setCallChannel] = useState("Option 1: Cloud SIP Trunk");

  useEffect(() => {
    if (callStatus !== "connected") return;
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  const initiateCall = async (
    target: { id: string; name: string; phone: string },
    channelOverride?: string
  ) => {
    setCallingLead(target);
    setCallStatus("connecting");
    setCallDuration(0);
    show(`Initiating call bridge to ${target.name}…`);

    try {
      const res = await fetch("/api/telephony/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: target.id,
          leadName: target.name,
          leadPhone: target.phone,
          ...(channelOverride ? { channel: channelOverride } : {}),
        }),
      });

      const d = await res.json().catch(() => ({}));
      if (d.channelLabel) {
        setCallChannel(d.channelLabel);
      }

      // Progressively simulate ringing to connected state
      setTimeout(() => setCallStatus("ringing"), 1200);
      setTimeout(() => setCallStatus("connected"), 3200);
    } catch {
      show("Could not reach telephony service");
      setCallingLead(null);
    }
  };

  const endCall = () => {
    if (!callingLead) return;
    const min = Math.floor(callDuration / 60);
    const sec = callDuration % 60;
    const durStr = `${min}m ${sec}s`;
    const target = leads.find((x) => x.id === callingLead.id);

    patch(callingLead.id, {
      activity: `📞 Outbound Call completed (Duration: ${durStr}) via ${callChannel}`,
      stage: target && target.stage === "Enquiry" ? "Contacted" : undefined,
    });

    show(`Call ended with ${callingLead.name} (${durStr})`);
    setCallStatus("ended");
    setTimeout(() => {
      setCallingLead(null);
      setCallDuration(0);
    }, 500);
  };

  const shown = leads
    .filter((l) => owner === "All" || l.owner === owner)
    .filter((l) => src === "all" || l.sourceKey === src)
    .filter((l) =>
      `${l.name} ${l.phone} ${l.interest} ${l.source} ${l.campaign ?? ""}`.toLowerCase().includes(q.toLowerCase())
    );
  const lead = leads.find((l) => l.id === open) ?? null;
  const pipelineValue = shown.filter((l) => !["Admitted", "Dropped"].includes(l.stage)).reduce((a, l) => a + l.value, 0);

  const drop = (stage: Stage) => {
    const l = leads.find((x) => x.id === drag);
    if (l && l.stage !== stage) {
      patch(l.id, { stage });
      show(`${l.name} moved to ${stage}`);
    }
    setDrag(null);
    setOver(null);
  };

  return (
    <AdminShell>
      <PageHeader
        title="Leads & Pipeline"
        sub={`${shown.length} leads · open pipeline ${inr(pipelineValue)} · new leads from ads arrive automatically`}
      >
        <Link
          href="/admin/lead-sources"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D9E6E2] bg-white px-4 text-[13px] font-semibold text-brand-deep hover:border-brand-teal"
        >
          <Icon name="globe" size={16} /> Lead sources
        </Link>
        <Btn icon="plus" onClick={() => setAdding(true)}>
          New lead
        </Btn>
      </PageHeader>

      {fresh.length > 0 && (
        <button
          onClick={clearFresh}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-[#BFE6DC] bg-[#E9F6F2] px-4 py-2.5 text-left text-[13px] font-medium text-brand-deep"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-teal" />
          {fresh.length} new lead{fresh.length > 1 ? "s" : ""} just arrived — highlighted below. Dismiss
        </button>
      )}

      {/* Control Bar: Filters & View Switcher */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2ECE9] bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, phone, course, campaign…" />
          <select
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            className="h-10 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-[13px] font-medium text-brand-ink outline-none focus:border-brand-teal"
            aria-label="Source"
          >
            {SOURCE_FILTERS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="h-10 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3 text-[13px] font-medium text-brand-ink outline-none focus:border-brand-teal"
            aria-label="Owner"
          >
            <option value="All">All owners</option>
            {AGENTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 rounded-xl bg-[#F0F5F4] p-1 border border-[#E2ECE9]">
          {(
            [
              { key: "kanban", label: "Kanban", icon: "clipboard" },
              { key: "table", label: "Table", icon: "more" },
              { key: "funnel", label: "Funnel", icon: "award" },
              { key: "list", label: "List", icon: "book" },
            ] as const
          ).map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === v.key
                  ? "bg-[#054038] text-white shadow-sm"
                  : "text-[#41564f] hover:text-[#054038] hover:bg-white/60"
              }`}
            >
              <Icon name={v.icon as any} size={14} />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* ───────────────── 1. KANBAN VIEW ───────────────── */}
      {viewMode === "kanban" && (
        <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5">
          <div className="grid min-w-[1240px] grid-cols-6 gap-3.5">
            {STAGES.map((stage) => {
              const theme = STAGE_THEME[stage];
              const col = shown.filter((l) => l.stage === stage);
              const val = col.reduce((a, l) => a + l.value, 0);

              return (
                <section
                  key={stage}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(stage);
                  }}
                  onDragLeave={() => setOver((o) => (o === stage ? null : o))}
                  onDrop={() => drop(stage)}
                  className={`flex min-h-[560px] flex-col rounded-2xl border p-3 transition-all duration-200 shadow-sm ${
                    over === stage ? "border-brand-teal bg-[#E9F6F2] ring-2 ring-brand-teal/30 scale-[1.01]" : `${theme.colBorder} ${theme.colBg}`
                  }`}
                  aria-label={`${stage} column`}
                >
                  <header className="mb-3 flex items-center justify-between border-b border-black/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${theme.dotBg}`} />
                      <span className={`text-[13.5px] font-extrabold ${theme.headerText}`}>{stage}</span>
                    </div>
                    <span className={`rounded-full ${theme.badgeBg} ${theme.badgeText} px-2.5 py-0.5 text-[11px] font-black`}>
                      {col.length}
                    </span>
                  </header>

                  {val > 0 && (
                    <div className="mb-3 rounded-xl bg-white/70 px-2.5 py-1.5 border border-black/5 flex items-center justify-between">
                      <span className="text-[10.5px] font-semibold text-[#5C716C]">Column Value</span>
                      <span className="text-[11.5px] font-bold text-brand-ink">{inr(val)}</span>
                    </div>
                  )}

                  <div className="space-y-2.5 flex-1">
                    {loading && stage === "Enquiry" && (
                      <p className="px-1 py-8 text-center text-[12px] text-[#93a5a0]">Loading pipeline…</p>
                    )}
                    {col.map((l) => (
                      <LeadCard
                        key={l.id}
                        l={l}
                        theme={theme}
                        isNew={fresh.includes(l.id)}
                        dragging={drag === l.id}
                        onDragStart={() => setDrag(l.id)}
                        onDragEnd={() => {
                          setDrag(null);
                          setOver(null);
                        }}
                        onOpen={() => setOpen(l.id)}
                        onCall={() => initiateCall(l)}
                      />
                    ))}
                    {!loading && !col.length && (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-black/10 bg-white/40">
                        <p className="text-[11.5px] font-medium text-[#93a5a0]">Drop lead here</p>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* ───────────────── 2. TABLE VIEW ───────────────── */}
      {viewMode === "table" && (
        <div className="rounded-2xl border border-[#E2ECE9] bg-white overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#EEF3F1] bg-[#F7FAF9] text-[12px] font-bold text-[#41564f]">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Name & Course</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4 text-right">Value (₹)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F3]">
                {shown.map((l) => {
                  const theme = STAGE_THEME[l.stage];
                  return (
                    <tr key={l.id} className="hover:bg-[#F9FBFB] transition">
                      <td className="py-3 px-4 font-mono text-[12px] text-[#5C716C]">{l.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-brand-ink hover:text-brand-teal cursor-pointer" onClick={() => setOpen(l.id)}>
                          {l.name}
                        </p>
                        <p className="text-[11px] text-[#6b807b] truncate max-w-[200px]">{l.interest}</p>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#41564f]">{l.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${SRC_STYLE[l.sourceKey ?? "webhook"]}`}>
                          {l.source}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#41564f] font-medium">{l.owner}</td>
                      <td className="py-3 px-4">
                        <select
                          value={l.stage}
                          onChange={(e) => {
                            const newStage = e.target.value as Stage;
                            patch(l.id, { stage: newStage });
                            show(`${l.name} moved to ${newStage}`);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border ${theme.colBorder} ${theme.badgeBg} ${theme.badgeText} outline-none cursor-pointer`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-brand-ink">{inr(l.value)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => initiateCall(l)}
                            className="flex items-center gap-1 rounded-lg bg-[#E9F6F2] px-2.5 py-1 text-[11px] font-bold text-[#0E937E] hover:bg-[#0E937E] hover:text-white transition"
                            title="1-Click Cloud SIP Call"
                          >
                            <Icon name="phone" size={12} /> Call
                          </button>
                          <button
                            onClick={() => setOpen(l.id)}
                            className="rounded-lg bg-[#F0F5F4] px-2.5 py-1 text-[11px] font-bold text-[#054038] hover:bg-[#054038] hover:text-white transition"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────── 3. FUNNEL VIEW ───────────────── */}
      {viewMode === "funnel" && (
        <div className="space-y-6">
          {/* Conversion Funnel Visualization */}
          <div className="rounded-3xl border border-[#E2ECE9] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-brand-ink mb-2">Admissions Pipeline Funnel</h3>
            <p className="text-xs text-[#6b807b] mb-6">Stage conversion rates and drop-off analytics across all active leads.</p>

            <div className="space-y-4 max-w-4xl mx-auto">
              {STAGES.map((stage, idx) => {
                const theme = STAGE_THEME[stage];
                const stageLeads = shown.filter((l) => l.stage === stage);
                const prevStageCount = idx === 0 ? shown.length : shown.filter((l) => l.stage === STAGES[idx - 1]).length;
                const conversionPct = idx === 0 ? 100 : prevStageCount > 0 ? Math.round((stageLeads.length / prevStageCount) * 100) : 0;
                const totalVal = stageLeads.reduce((a, l) => a + l.value, 0);
                const widthPct = Math.max(25, 100 - idx * 12);

                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div
                      className={`w-full max-w-[${widthPct}%] rounded-2xl border ${theme.colBorder} p-4 transition shadow-sm`}
                      style={{ background: `linear-gradient(90deg, ${theme.barColor}15, #FFFFFF)` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold text-xs ${theme.dotBg}`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-extrabold text-brand-ink">{stage}</p>
                            <p className="text-[11px] text-[#6b807b]">
                              {stageLeads.length} leads ({conversionPct}% conversion)
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-ink">{inr(totalVal)}</p>
                          <span className={`inline-block rounded-full ${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 text-[10.5px] font-bold`}>
                            {stageLeads.length} People
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(10, (stageLeads.length / (shown.length || 1)) * 100))}%`, backgroundColor: theme.barColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────── 4. LIST VIEW ───────────────── */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {STAGES.map((stage) => {
            const theme = STAGE_THEME[stage];
            const col = shown.filter((l) => l.stage === stage);
            const val = col.reduce((a, l) => a + l.value, 0);

            return (
              <div key={stage} className={`rounded-2xl border ${theme.colBorder} bg-white p-4 shadow-sm`}>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3.5 w-3.5 rounded-full ${theme.dotBg}`} />
                    <h4 className="text-sm font-black text-brand-ink">{stage}</h4>
                    <span className={`rounded-full ${theme.badgeBg} ${theme.badgeText} px-2.5 py-0.5 text-[11px] font-extrabold`}>
                      {col.length} leads
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-ink">{inr(val)}</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {col.map((l) => (
                    <div key={l.id} className="flex items-center justify-between py-2.5 hover:bg-[#F9FBFB] px-2 rounded-xl transition">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-1 rounded-full ${theme.dotBg}`} />
                        <div>
                          <p className="text-xs font-bold text-brand-ink cursor-pointer hover:text-brand-teal" onClick={() => setOpen(l.id)}>
                            {l.name}
                          </p>
                          <p className="text-[11px] text-[#6b807b]">{l.interest} • {l.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${SRC_STYLE[l.sourceKey ?? "webhook"]}`}>
                          {l.source}
                        </span>
                        <span className="text-xs font-bold text-brand-ink">{inr(l.value)}</span>
                        <button
                          onClick={() => initiateCall(l)}
                          className="flex items-center gap-1 rounded-lg bg-[#E9F6F2] px-2.5 py-1 text-[11px] font-bold text-[#0E937E] hover:bg-[#0E937E] hover:text-white transition"
                          title="1-Click Cloud SIP Call"
                        >
                          <Icon name="phone" size={12} /> Call
                        </button>
                        <button
                          onClick={() => setOpen(l.id)}
                          className="rounded-lg bg-[#F0F5F4] px-2.5 py-1 text-[11px] font-bold text-[#054038] hover:bg-[#054038] hover:text-white transition"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {!col.length && <p className="py-4 text-center text-xs text-gray-400">No leads in this stage.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Drawer & Modals */}
      <Drawer open={!!lead} title={lead ? lead.name : ""} onClose={() => setOpen(null)}>
        {lead && <LeadDetail lead={lead} onPatch={(p) => patch(lead.id, p)} onToast={show} onCall={initiateCall} />}
      </Drawer>

      {/* Floating 1-Click Call HUD */}
      {callingLead && (
        <CallHUD
          lead={callingLead}
          status={callStatus}
          duration={callDuration}
          channelLabel={callChannel}
          onEndCall={endCall}
        />
      )}

      <NewLead
        open={adding}
        onClose={() => setAdding(false)}
        onCreate={async (b) => {
          const r = await create(b);
          setAdding(false);
          show(
            r.error
              ? r.error
              : r.result === "duplicate"
              ? `${b.name} already exists — enquiry added to timeline`
              : `${b.name} added to Enquiry`
          );
        }}
      />

      <Toast msg={toast} />
    </AdminShell>
  );
}

const SRC_STYLE: Record<string, string> = {
  meta: "bg-[#EEF2FF] text-[#3B4CB8]",
  google: "bg-[#FEF3E2] text-[#9A5B00]",
  whatsapp: "bg-[#E7F7EC] text-[#1C7A3E]",
  website: "bg-[#E3F4F0] text-brand-deep",
  webhook: "bg-[#F1F5F4] text-[#41564f]",
};

function LeadCard({
  l,
  theme,
  isNew,
  dragging,
  onDragStart,
  onDragEnd,
  onOpen,
  onCall,
}: {
  l: CrmLead;
  theme: StageTheme;
  isNew: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onOpen: () => void;
  onCall: () => void;
}) {
  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      tabIndex={0}
      className={`cursor-grab rounded-xl border border-[#E6EEEB] border-l-4 ${theme.cardBorderLeft} bg-white p-3 shadow-[0_2px_4px_rgba(5,64,56,.05)] transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
        dragging ? "opacity-50" : ""
      } ${isNew ? "ring-2 ring-brand-teal" : l.slaBreached ? "border-r-[#F2C9B6] border-r-2" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-extrabold leading-snug text-brand-ink">{l.name}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCall();
            }}
            title={`1-Click Call ${l.name}`}
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#E9F6F2] text-[#0E937E] hover:bg-[#0E937E] hover:text-white transition"
          >
            <Icon name="phone" size={12} />
          </button>
          {l.slaBreached && (
            <span title="No follow-up within SLA" className="text-[#A9471F]">
              <Icon name="alert" size={15} />
            </span>
          )}
        </div>
      </div>
      <p className="mt-0.5 line-clamp-2 text-[11.5px] text-[#5C716C]">{l.interest}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${SRC_STYLE[l.sourceKey ?? "webhook"]}`}>
          {l.source}
        </span>
        {l.isTest && <span className="rounded-md bg-[#FFF6E0] px-1.5 py-0.5 text-[10.5px] font-semibold text-[#8A5A00]">Test</span>}
        {l.value > 0 && <span className="text-[11px] font-bold text-brand-ink">{inr(l.value)}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[10.5px] text-[#7B8E89] border-t border-gray-100 pt-1.5">
        <span className="truncate font-medium">{l.owner}</span>
        <span className="shrink-0">{l.lastActivity}</span>
      </div>
    </article>
  );
}

function LeadDetail({
  lead,
  onPatch,
  onToast,
  onCall,
}: {
  lead: CrmLead;
  onPatch: (p: { stage?: Stage; owner?: string; value?: number; activity?: string }) => void;
  onToast: (m: string) => void;
  onCall: (l: { id: string; name: string; phone: string }, channelOverride?: string) => void;
}) {
  const [selectedRoute, setSelectedRoute] = useState("auto");
  const [note, setNote] = useState("");
  const act = (what: string) => {
    onPatch({ activity: what });
    onToast(what);
  };
  const wa = lead.phone.replace(/\D/g, "");
  return (
    <div className="space-y-5 text-[13px]">
      <div className="flex flex-wrap gap-2">
        <StatusBadge tone="info">{lead.stage}</StatusBadge>
        {lead.slaBreached && <StatusBadge tone="serious">SLA breached</StatusBadge>}
        {lead.isTest && <StatusBadge tone="warning">Test lead</StatusBadge>}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        {[
          ["Phone", lead.phone],
          ["Email", lead.email || "—"],
          ["Source", lead.source],
          ["Interested in", lead.interest],
          ["Campaign", lead.campaign || "—"],
          ["Form", lead.formName || "—"],
          ...Object.entries(lead.extra ?? {}).map(([k, v]) => [k.replace(/_/g, " "), v]),
          ["Lead ID", lead.id],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] capitalize text-[#7B8E89]">{k}</dt>
            <dd className="break-words font-medium text-brand-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {/* 1-Click Call with Failover & Channel Selector */}
      <div className="rounded-2xl border border-[#D9E6E2] bg-[#F7FAF9] p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11.5px] font-bold text-[#41564f] flex items-center gap-1.5">
            <Icon name="phone" size={13} className="text-[#0E937E]" /> Outbound Route:
          </span>
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="rounded-lg border border-[#D0DFDB] bg-white px-2 py-1 text-[11px] font-semibold text-brand-ink focus:border-[#0E937E] focus:outline-none cursor-pointer"
          >
            <option value="auto">⚡ Auto Failover (SIP ➔ Android ➔ Dongle)</option>
            <option value="sip">Option 1: Cloud SIP Trunk (Primary)</option>
            <option value="android_gateway">Option 2: Android Phone Gateway (Wi-Fi SIM)</option>
            <option value="usb_dongle">Option 4: 4G USB Dongle Modem</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              onCall(lead, selectedRoute === "auto" ? undefined : selectedRoute);
              act(`1-Click Call originated to ${lead.name} via ${selectedRoute === "auto" ? "Auto-Failover" : selectedRoute}`);
            }}
            className="col-span-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-brand-teal bg-[#E9F6F2] text-[12.5px] font-bold text-[#054038] hover:bg-brand-teal hover:text-white transition shadow-sm"
          >
            <Icon name="phone" size={15} /> 1-Click Call 📞
          </button>
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            onClick={() => act("WhatsApp chat opened")}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D9E6E2] bg-white text-[12.5px] font-semibold text-brand-deep hover:border-brand-teal transition"
          >
            <Icon name="message" size={15} /> WhatsApp
          </a>
          <Btn variant="ghost" icon="calendar" onClick={() => act("Demo class booked")}>
            Demo
          </Btn>
        </div>
      </div>

      <WaChat phone={lead.phone} name={lead.name} leadId={lead.id} onSent={onToast} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Stage">
          <select className={inputCls} value={lead.stage} onChange={(e) => (onPatch({ stage: e.target.value as Stage }), onToast(`Moved to ${e.target.value}`))}>
            {STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Owner">
          <select className={inputCls} value={lead.owner} onChange={(e) => (onPatch({ owner: e.target.value }), onToast(`Reassigned to ${e.target.value}`))}>
            {[...AGENTS, ...(AGENTS.includes(lead.owner) ? [] : [lead.owner])].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>
      <div>
        <p className="mb-2 text-[12px] font-semibold text-[#41564f]">Activity</p>
        <ol className="relative space-y-3 border-l border-[#D7E6E1] pl-4">
          {[...lead.timeline].reverse().map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-teal" />
              <p className="text-brand-ink">{t.what}</p>
              <p className="text-[11px] text-[#7B8E89]">{t.when}</p>
            </li>
          ))}
        </ol>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          act(`Note: ${note.trim()}`);
          setNote("");
        }}
        className="flex gap-2"
      >
        <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
        <Btn type="submit">Add</Btn>
      </form>
    </div>
  );
}

function NewLead({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (b: { name: string; phone: string; interest: string; source: string; owner: string; value: number }) => void;
}) {
  const [f, setF] = useState({ name: "", phone: "", interest: "", source: "Walk-in", owner: AGENTS[0], value: 0 });
  return (
    <Modal open={open} title="New lead" onClose={onClose}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.name.trim() || !f.phone.trim()) return;
          onCreate({ ...f, interest: f.interest || "General enquiry" });
          setF({ ...f, name: "", phone: "", interest: "", value: 0 });
        }}
      >
        <div className="col-span-2">
          <Field label="Name">
            <input required className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
        </div>
        <Field label="Phone">
          <input required className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+91" />
        </Field>
        <Field label="Source">
          <select className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}>
            {["Walk-in", "Phone call", "Referral", "Event", "School visit"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Interested in">
            <input className={inputCls} value={f.interest} onChange={(e) => setF({ ...f, interest: e.target.value })} placeholder="Course / workshop" />
          </Field>
        </div>
        <Field label="Owner">
          <select className={inputCls} value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })}>
            {AGENTS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </Field>
        <Field label="Expected fee (₹)">
          <input type="number" min={0} className={inputCls} value={f.value || ""} onChange={(e) => setF({ ...f, value: Number(e.target.value) })} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" icon="check">
            Add lead
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

function CallHUD({
  lead,
  status,
  duration,
  channelLabel,
  onEndCall,
}: {
  lead: { id: string; name: string; phone: string };
  status: "connecting" | "ringing" | "connected" | "ended";
  duration: number;
  channelLabel?: string;
  onEndCall: () => void;
}) {
  const min = Math.floor(duration / 60);
  const sec = duration % 60;
  const timeStr = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

  const isAndroid = channelLabel?.includes("Option 2");
  const isDongle = channelLabel?.includes("Option 4");

  return (
    <aside
      aria-label="Active Call HUD"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-4 rounded-3xl border border-[#2BD6B4]/40 bg-[#054038] p-4 text-white shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-6"
    >
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0E937E] text-[#2BD6B4] shadow-inner">
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2BD6B4] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2BD6B4]" />
        </span>
        <Icon name="phone" size={24} />
      </div>

      <div className="leading-tight">
        <div className="flex items-center gap-2">
          <p className="text-sm font-extrabold text-white">{lead.name}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isAndroid
                ? "bg-amber-400/25 text-amber-200 border border-amber-400/40"
                : isDongle
                ? "bg-purple-400/25 text-purple-200 border border-purple-400/40"
                : "bg-white/15 text-[#2BD6B4]"
            }`}
          >
            {channelLabel || "Cloud SIP Live"}
          </span>
        </div>
        <p className="text-xs text-white/70 font-mono mt-0.5">{lead.phone}</p>
        <p className="text-[11.5px] text-[#A3E5D8] font-bold mt-1">
          {status === "connecting" && "Dialing Counselor first…"}
          {status === "ringing" && "Counselor answered · Ringing Parent…"}
          {status === "connected" && `🟢 Voice Connected · ${timeStr}`}
          {status === "ended" && "Call Ended"}
        </p>
      </div>

      <button
        onClick={onEndCall}
        className="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-[#E5484D] px-4 text-xs font-black text-white hover:bg-[#C93B40] transition active:scale-95 shadow-md"
      >
        End Call 🔴
      </button>
    </aside>
  );
}
