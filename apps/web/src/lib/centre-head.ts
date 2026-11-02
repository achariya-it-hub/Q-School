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
 * Hook to read and toggle active admin role between Super Admin and Centre Head.
 * Synchronizes with localStorage and dispatches change events across components.
 */
export function useAdminRole() {
  const [role, setRoleState] = useState<string>("Super Admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Priority 1: explicitly selected active role in localStorage
    const active = localStorage.getItem("qs_active_role");
    if (active) {
      setRoleState(active);
    } else {
      // Priority 2: logged-in user profile from session
      try {
        const raw = localStorage.getItem("qschool_admin_session");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.role) {
            setRoleState(parsed.role);
          }
        }
      } catch {}
    }

    const onRoleChanged = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setRoleState(customEvent.detail);
      } else {
        const a = localStorage.getItem("qs_active_role");
        if (a) setRoleState(a);
      }
    };

    window.addEventListener("qs_role_changed", onRoleChanged);
    return () => window.removeEventListener("qs_role_changed", onRoleChanged);
  }, []);

  const setRole = (newRole: string) => {
    setRoleState(newRole);
    localStorage.setItem("qs_active_role", newRole);
    try {
      const raw = localStorage.getItem("qschool_admin_session");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.role = newRole;
      localStorage.setItem("qschool_admin_session", JSON.stringify(parsed));
    } catch {}
    window.dispatchEvent(new CustomEvent("qs_role_changed", { detail: newRole }));
  };

  const isHead = mounted && isCentreHeadRole(role);

  return {
    role,
    setRole,
    isHead,
    mounted,
  };
}
