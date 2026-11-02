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

export function isCentreHeadRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[\s_-]+/g, "");
  return (
    normalized.includes("centrehead") ||
    normalized.includes("centerhead") ||
    normalized.includes("centremanager") ||
    normalized.includes("centermanager") ||
    normalized.includes("hoc")
  );
}
