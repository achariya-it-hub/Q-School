"use client";

/** Client hooks for the server-backed CRM (leads come from Meta, Google Ads, WhatsApp, website, webhooks). */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PipelineLead, Stage } from "@qschool/shared";

export interface CrmLead extends PipelineLead {
  email?: string;
  externalId?: string;
  sourceKey?: "meta" | "google" | "whatsapp" | "website" | "webhook";
  campaign?: string;
  formName?: string;
  extra?: Record<string, string>;
  isTest?: boolean;
  _clientModifiedAt?: number;
}

const CRM_CACHE_KEY = "qs_crm_leads_cache_v2";
const LEGACY_CACHE_KEYS = ["qs_crm_leads_cache"];

const CLIENT_DEMO_NAMES = new Set([
  "aarav sharma",
  "diya patel",
  "rohan iyer",
  "meera nair",
  "rohan verma",
  "kavya menon",
  "ananya r",
]);

export function isClientTestLead(lead: CrmLead): boolean {
  if (!lead) return false;
  if (lead.isTest) return true;
  const name = (lead.name || "").trim().toLowerCase();
  if (CLIENT_DEMO_NAMES.has(name)) return true;
  if (/\b(test|testing|demo|sample|dummy|fake)\b/i.test(name)) return true;
  const email = (lead.email || "").trim().toLowerCase();
  if (email && /@(example|test)\.com$/i.test(email)) return true;
  const ext = (lead.externalId || "").trim();
  if (/^(meta:TEST|google:TeSter-|justdial:JD|wamid\.TEST)/i.test(ext)) return true;
  return false;
}

function getCachedLeads(): CrmLead[] {
  if (typeof window === "undefined") return [];
  try {
    for (const k of LEGACY_CACHE_KEYS) {
      localStorage.removeItem(k);
    }
    const raw = localStorage.getItem(CRM_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((l: CrmLead) => !isClientTestLead(l))
          .map((l: CrmLead) => ({
            ...l,
            stage: (l.stage as string) === "Demo" ? "BMIT" : l.stage,
            timeline: Array.isArray(l.timeline) ? l.timeline : [],
          }));
      }
    }
  } catch {}
  return [];
}

function saveCachedLeads(leads: CrmLead[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CRM_CACHE_KEY, JSON.stringify(leads));
  } catch {}
}

export function useCrmLeads(pollMs = 20000) {
  const [leads, setLeads] = useState<CrmLead[]>(getCachedLeads);
  const [loading, setLoading] = useState(true);
  const [fresh, setFresh] = useState<string[]>([]);
  const known = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/crm/leads", { cache: "no-store" });
      if (r.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      if (!r.ok) {
        // Guard: NEVER clear existing leads on HTTP failure or temporary 500 error!
        console.warn(`[crm] fetch leads returned HTTP ${r.status}`);
        setLoading(false);
        return;
      }
      const d = await r.json().catch(() => null);
      if (!d || !Array.isArray(d.leads)) {
        // Guard: NEVER clear existing leads on missing/corrupted response!
        console.warn("[crm] invalid payload from /api/crm/leads", d);
        setLoading(false);
        return;
      }

      const list: CrmLead[] = d.leads
        .filter((l: CrmLead) => !isClientTestLead(l))
        .map((l: CrmLead) => ({
          ...l,
          stage: (l.stage as string) === "Demo" ? "BMIT" : l.stage,
          timeline: Array.isArray(l.timeline) ? l.timeline : [],
        }));

      if (known.current) {
        const added = list.filter((l) => !known.current!.has(l.id)).map((l) => l.id);
        if (added.length) setFresh((f) => [...added, ...f]);
      }
      known.current = new Set(list.map((l) => l.id));

      setLeads((prev) => {
        if (!list || list.length === 0) {
          saveCachedLeads([]);
          return [];
        }
        // Merge strategy: map by ID, protecting recent local user edits from being overwritten by stale server polls
        const now = Date.now();
        const serverIds = new Set(list.map((l) => l.id));
        const map = new Map<string, CrmLead>();
        for (const l of prev) {
          if (serverIds.has(l.id)) {
            map.set(l.id, l);
          }
        }
        for (const serverLead of list) {
          const existing = map.get(serverLead.id);
          // If the user modified this lead locally within the last 60 seconds, keep their edited fields
          if (existing && existing._clientModifiedAt && now - existing._clientModifiedAt < 60000) {
            map.set(serverLead.id, {
              ...serverLead,
              stage: existing.stage,
              owner: existing.owner,
              value: existing.value !== undefined ? existing.value : serverLead.value,
              extra: { ...(serverLead.extra || {}), ...(existing.extra || {}) },
              timeline: (existing.timeline && existing.timeline.length > (serverLead.timeline?.length || 0))
                ? existing.timeline
                : (serverLead.timeline || []),
              _clientModifiedAt: existing._clientModifiedAt,
            });
          } else {
            map.set(serverLead.id, serverLead);
          }
        }
        const merged = Array.from(map.values());
        saveCachedLeads(merged);
        return merged;
      });
      setLoading(false);
    } catch (err) {
      console.warn("[crm] error loading leads:", err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, pollMs);
    return () => window.clearInterval(t);
  }, [load, pollMs]);

  const patch = useCallback(
    async (
      id: string,
      p: {
        stage?: Stage;
        owner?: string;
        value?: number;
        activity?: string;
        extra?: Record<string, any>;
      },
    ) => {
      const now = Date.now();
      // optimistic update
      setLeads((ls) => {
        const updated = ls.map((l) =>
          l.id === id
            ? {
                ...l,
                ...(p.stage ? { stage: p.stage } : {}),
                ...(p.owner ? { owner: p.owner } : {}),
                ...(p.value !== undefined ? { value: p.value } : {}),
                ...(p.extra ? { extra: { ...(l.extra || {}), ...p.extra } } : {}),
                ...(p.activity
                  ? {
                      timeline: [
                        ...(Array.isArray(l.timeline) ? l.timeline : []),
                        {
                          when: new Date().toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                          what: p.activity,
                        },
                      ],
                    }
                  : {}),
                lastActivity: "Just now",
                slaBreached: false,
                _clientModifiedAt: now,
              }
            : l,
        );
        saveCachedLeads(updated);
        return updated;
      });

      try {
        const r = await fetch("/api/crm/leads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, ...p }),
        });
        if (r.ok) {
          const { lead } = await r.json();
          if (lead) {
            const formatted: CrmLead = {
              ...lead,
              stage: (lead.stage as string) === "Demo" ? "BMIT" : lead.stage,
              timeline: Array.isArray(lead.timeline) ? lead.timeline : [],
              _clientModifiedAt: now,
            };
            setLeads((ls) => {
              const updated = ls.map((l) => (l.id === id ? formatted : l));
              saveCachedLeads(updated);
              return updated;
            });
          }
        }
      } catch (e) {
        console.warn("[crm] patch failed, keeping optimistic state:", e);
      }
    },
    [],
  );

  const create = useCallback(
    async (b: { name: string; phone: string; interest?: string; source: string; owner?: string; value?: number; location?: string; centreId?: string }) => {
      const now = Date.now();
      try {
        const r = await fetch("/api/crm/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(b),
        });
        const d = await r.json().catch(() => ({}));
        if (d.ok && d.lead) {
          const newLead: CrmLead = {
            ...d.lead,
            stage: (d.lead.stage as string) === "Demo" ? "BMIT" : d.lead.stage,
            timeline: Array.isArray(d.lead.timeline) ? d.lead.timeline : [],
            _clientModifiedAt: now,
          };
          setLeads((prev) => {
            const exists = prev.some((l) => l.id === newLead.id);
            const updated = exists ? prev.map((l) => (l.id === newLead.id ? newLead : l)) : [newLead, ...prev];
            saveCachedLeads(updated);
            return updated;
          });
        }
        await load();
        return d as { result?: "created" | "duplicate"; lead?: CrmLead; error?: string };
      } catch (err) {
        return { error: (err as Error).message };
      }
    },
    [load],
  );

  const remove = useCallback(async (id: string) => {
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveCachedLeads(next);
      return next;
    });
    try {
      await fetch(`/api/crm/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      console.warn("[crm] delete failed:", e);
    }
  }, []);

  const removeTestLeads = useCallback(async () => {
    setLeads((prev) => {
      const next = prev.filter((l) => !isClientTestLead(l));
      saveCachedLeads(next);
      return next;
    });
    try {
      const r = await fetch("/api/crm/leads?mode=test", { method: "DELETE" });
      if (r.ok) {
        await load();
      }
    } catch (e) {
      console.warn("[crm] removeTestLeads failed:", e);
    }
  }, [load]);

  const clearAll = useCallback(async () => {
    setLeads([]);
    saveCachedLeads([]);
    try {
      await fetch("/api/crm/leads?mode=all", { method: "DELETE" });
    } catch (e) {
      console.warn("[crm] clearAll failed:", e);
    }
  }, []);

  return {
    leads,
    loading,
    fresh,
    clearFresh: () => setFresh([]),
    reload: load,
    patch,
    create,
    remove,
    removeTestLeads,
    clearAll,
  };
}
