"use client";

import { useCallback, useEffect, useState } from "react";
import { STAFF, type Staff } from "@qschool/shared";

/** Staff master from the server (falls back to the demo directory until it loads). `reload` refetches after an edit. */
export function useStaffMaster() {
  const [staff, setStaff] = useState<Staff[]>(STAFF);
  const reload = useCallback(async () => {
    try {
      const r = await fetch("/api/payroll/staff", { cache: "no-store" });
      const d = await r.json();
      if (d.ok) setStaff(d.staff);
    } catch {}
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  return { staff, active: staff.filter((s) => s.active !== false), reload };
}
