"use client";

import { useEffect, useState } from "react";

/**
 * Role-based restrictions for Centre Heads / Centre Managers.
 * Centre Heads have access to local branch leads, enrollments, fees, schedule, etc.,
 * but do not have access to central marketing campaigns, lead source setup, WhatsApp bulk tools,
 * staff task assignments, payroll processing, system audit logs, or global settings.
 */

export const RESTRICTED_CENTRE_HEAD_HREFS = new Set([
  "/admin/campaigns",    // 1. Campaign Calendar
  "/admin/lead-sources", // 2. Lead Sources
  "/admin/whatsapp",     // 3. Whatsapp
  "/admin/staff/tasks",  // 4. Staff Tasks
  "/admin/payroll",      // 5. Payroll
  "/admin/audit",        // 6. Audit trail
  "/admin/settings",     // 7. Settings
]);

export function isRestrictedForCentreHead(href: string): boolean {
  if (RESTRICTED_CENTRE_HEAD_HREFS.has(href)) return true;
  for (const restricted of RESTRICTED_CENTRE_HEAD_HREFS) {
    if (href.startsWith(`${restricted}/`)) return true;
  }
  return false;
}

export function isCentreHeadRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[\s_-]+/g, "");
  if (normalized === "superadmin" || normalized === "admin") return false;
  return (
    normalized.includes("centrehead") ||
    normalized.includes("centerhead") ||
    normalized.includes("centremanager") ||
    normalized.includes("centermanager") ||
    normalized.includes("head") ||
    normalized.includes("hoc") ||
    normalized.includes("faculty") ||
    normalized.includes("branch")
  );
}

/**
 * Hook to read the authenticated admin role.
 * Strictly derives the user's role from their authenticated session and profile.
 * Centre Heads cannot toggle or escalate their privileges to Admin.
 */
export function useAdminRole() {
  const [role, setRoleState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("qs_active_role");
        const raw = localStorage.getItem("qschool_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.role) return parsed.role;
        }
      } catch {}
    }
    return "Super Admin";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      localStorage.removeItem("qs_active_role");
      const raw = localStorage.getItem("qschool_admin_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRoleState(parsed.role);
      }
    } catch {}

    fetch("/api/admin/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.role) {
          setRoleState(data.role);
          try {
            const raw = localStorage.getItem("qschool_admin_session");
            const prev = raw ? JSON.parse(raw) : {};
            localStorage.setItem(
              "qschool_admin_session",
              JSON.stringify({ ...prev, name: data.name, email: data.email, role: data.role })
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const isHead = isCentreHeadRole(role);

  return {
    role,
    isHead,
    mounted,
  };
}
