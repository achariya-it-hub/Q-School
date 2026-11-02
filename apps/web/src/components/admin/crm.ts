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
}

const CRM_CACHE_KEY = "qs_crm_leads_cache";

function getCachedLeads(): CrmLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CRM_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((l: CrmLead) => ({
          ...l,
          stage: (l.stage as string) === "Demo" ? "BMIT" : l.stage,
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

      const list: CrmLead[] = d.leads.map((l: CrmLead) => ({
        ...l,
        stage: (l.stage as string) === "Demo" ? "BMIT" : l.stage,
      }));

      if (known.current) {
        const added = list.filter((l) => !known.current!.has(l.id)).map((l) => l.id);
        if (added.length) setFresh((f) => [...added, ...f]);
      }
      known.current = new Set(list.map((l) => l.id));

      setLeads((prev) => {
        // If server returns empty list but local state has recently created leads, preserve them
        if (list.length === 0 && prev.length > 0) {
          saveCachedLeads(prev);
          return prev;
        }
        saveCachedLeads(list);
        return list;
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
    async (id: string, p: { stage?: Stage; owner?: string; value?: number; activity?: string }) => {
      // optimistic update
      setLeads((ls) => {
        const updated = ls.map((l) =>
          l.id === id
            ? {
                ...l,
                ...(p.stage ? { stage: p.stage } : {}),
                ...(p.owner ? { owner: p.owner } : {}),
                ...(p.value !== undefined ? { value: p.value } : {}),
                lastActivity: "Just now",
                slaBreached: false,
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
            };
            setLeads((ls) => {
              const updated = ls.map((l) => (l.id === id ? formatted : l));
              saveCachedLeads(updated);
              return updated;
            });
          }
        } else {
          load();
        }
      } catch {
        load();
      }
    },
    [load],
  );

  const create = useCallback(
    async (b: { name: string; phone: string; interest?: string; source: string; owner?: string; value?: number; location?: string; centreId?: string }) => {
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

  return { leads, loading, fresh, clearFresh: () => setFresh([]), reload: load, patch, create };
}
