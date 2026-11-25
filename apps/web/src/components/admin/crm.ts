"use client";

/** Client hooks for the server-backed CRM (leads come from Meta, Google Ads, WhatsApp, website, webhooks). */
import { useCallback, useEffect, useRef, useState } from "react";
import { STAGES, type PipelineLead, type Stage } from "@qschool/shared";

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

const CRM_CACHE_KEY = "qs_crm_leads_cache_v3";
const LEGACY_CACHE_KEYS = ["qs_crm_leads_cache", "qs_crm_leads_cache_v2"];

const CLIENT_DEMO_NAMES = new Set([
  "aarav sharma",
  "diya patel",
  "rohan iyer",
  "meera nair",
  "rohan verma",
  "kavya menon",
  "ananya r",
]);

/** True for leads that look like tests. Used to badge / optionally hide them — never to drop them silently. */
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
    if (raw) return normaliseAll(JSON.parse(raw));
  } catch {}
  return [];
}

function saveCachedLeads(leads: CrmLead[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CRM_CACHE_KEY, JSON.stringify(leads));
  } catch {}
}

const VALID_STAGES = new Set<string>(STAGES);

/**
 * Make every lead safe to render: a missing/unknown stage, non-string name/phone, non-numeric value or
 * non-array timeline (old cached data, partial API replies) used to crash the Leads page with
 * "Application error: a client-side exception has occurred".
 */
export function normaliseLead(l: any): CrmLead | null {
  if (!l || typeof l !== "object" || !l.id) return null;
  const stage = l.stage === "Demo" ? "BMIT" : l.stage;
  return {
    ...l,
    id: String(l.id),
    name: typeof l.name === "string" && l.name ? l.name : "Unnamed lead",
    phone: typeof l.phone === "string" ? l.phone : String(l.phone ?? ""),
    interest: typeof l.interest === "string" ? l.interest : "General enquiry",
    source: typeof l.source === "string" ? l.source : "Other",
    owner: typeof l.owner === "string" ? l.owner : "",
    stage: (VALID_STAGES.has(stage) ? stage : "Enquiry") as Stage,
    value: Number.isFinite(Number(l.value)) ? Number(l.value) : 0,
    lastActivity: typeof l.lastActivity === "string" ? l.lastActivity : "",
    createdAt: typeof l.createdAt === "string" ? l.createdAt : new Date().toISOString(),
    extra: l.extra && typeof l.extra === "object" ? l.extra : undefined,
    timeline: Array.isArray(l.timeline) ? l.timeline.filter((t: any) => t && typeof t === "object") : [],
  };
}

const normaliseAll = (arr: unknown): CrmLead[] =>
  Array.isArray(arr) ? (arr.map(normaliseLead).filter(Boolean) as CrmLead[]) : [];

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

      // De-duplicate by id as well (two leads with one id made React keys collide).
      const list: CrmLead[] = Array.from(new Map(normaliseAll(d.leads).map((l) => [l.id, l])).values());

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
              ...(normaliseLead(lead) ?? lead),
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
        // `hidden` = the phone already belongs to a lead in another centre; the reply is only a stub, don't list it.
        if (d.ok && d.lead && !d.hidden && normaliseLead(d.lead)) {
          const newLead: CrmLead = {
            ...normaliseLead(d.lead)!,
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
        return d as { result?: "created" | "duplicate"; lead?: CrmLead; hidden?: boolean; error?: string };
      } catch (err) {
        return { error: (err as Error).message };
      }
    },
    [load],
  );

  /** Delete one lead. The list updates only after the server confirms (non-admins get a 403). */
  const remove = useCallback(async (id: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const r = await fetch(`/api/crm/leads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, error: d.error || `Delete failed (HTTP ${r.status})` };
      setLeads((prev) => {
        const next = prev.filter((l) => l.id !== id);
        saveCachedLeads(next);
        return next;
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, []);

  /** Delete several leads in one request. */
  const removeMany = useCallback(async (ids: string[]): Promise<{ ok: boolean; removed?: number; error?: string }> => {
    try {
      const r = await fetch(`/api/crm/leads?ids=${encodeURIComponent(ids.join(","))}`, { method: "DELETE" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) return { ok: false, error: d.error || `Delete failed (HTTP ${r.status})` };
      const gone = new Set(ids);
      setLeads((prev) => {
        const next = prev.filter((l) => !gone.has(l.id));
        saveCachedLeads(next);
        return next;
      });
      return { ok: true, removed: d.removed };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
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
    removeMany,
    removeTestLeads,
    clearAll,
  };
}
