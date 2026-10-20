"use client";

import { useCallback, useEffect, useState } from "react";
import type { PublicSettings } from "@/lib/settings/store";

/** Load + save Console settings (secrets come back masked). */
export function useSettings() {
  const [data, setData] = useState<PublicSettings | null>(null);
  useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, []);
  const save = useCallback(async (patch: Record<string, unknown>) => {
    const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error ?? "Could not save");
    setData(d);
    return d as PublicSettings;
  }, []);
  return { data, save };
}
