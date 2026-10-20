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

export function useCrmLeads(pollMs = 20000) {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [fresh, setFresh] = useState<string[]>([]);
  const known = useRef<Set<string> | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/crm/leads", { cache: "no-store" });
    if (r.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const d = await r.json();
    const list: CrmLead[] = d.leads ?? [];
    if (known.current) {
      const added = list.filter((l) => !known.current!.has(l.id)).map((l) => l.id);
      if (added.length) setFresh((f) => [...added, ...f]);
    }
    known.current = new Set(list.map((l) => l.id));
    setLeads(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = window.setInterval(load, pollMs);
    return () => window.clearInterval(t);
  }, [load, pollMs]);

  const patch = useCallback(
    async (id: string, p: { stage?: Stage; owner?: string; value?: number; activity?: string }) => {
      // optimistic update
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...(p.stage ? { stage: p.stage } : {}), ...(p.owner ? { owner: p.owner } : {}), lastActivity: "Just now", slaBreached: false } : l)));
      const r = await fetch("/api/crm/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...p }) });
      if (r.ok) {
        const { lead } = await r.json();
        setLeads((ls) => ls.map((l) => (l.id === id ? lead : l)));
      } else load();
    },
    [load],
  );

  const create = useCallback(
    async (b: { name: string; phone: string; interest?: string; source: string; owner?: string; value?: number }) => {
      const r = await fetch("/api/crm/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
      const d = await r.json();
      await load();
      return d as { result?: "created" | "duplicate"; error?: string };
    },
    [load],
  );

  return { leads, loading, fresh, clearFresh: () => setFresh([]), reload: load, patch, create };
}
