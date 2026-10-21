"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import {
  Btn,
  Card,
  Field,
  Figure,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  Toast,
  inputCls,
  useToast,
  type Tone,
} from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { AuditAction, AuditLog } from "@/lib/audit/store";

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    creates: 0,
    updates: 0,
    deletes: 0,
    todayCount: 0,
  });
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [page, setPage] = useState(0);
  const limit = 50;

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [toast, show] = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        limit: String(limit),
        offset: String(page * limit),
      });
      if (selectedModule !== "all") q.set("module", selectedModule);
      if (selectedAction !== "all") q.set("action", selectedAction);
      if (search.trim()) q.set("search", search.trim());

      const res = await fetch(`/api/admin/audit?${q.toString()}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load audit logs");

      setLogs(data.logs || []);
      setTotal(data.total || 0);
      if (data.stats) setStats(data.stats);
      if (data.modules) setModules(data.modules);
    } catch {
      show("Could not load audit trail records");
    } finally {
      setLoading(false);
    }
  }, [selectedModule, selectedAction, search, page, show]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportCSV = () => {
    if (!logs.length) return show("No logs to export");
    const headers = ["Timestamp", "Action", "Module", "Entity ID", "Entity Name", "Summary", "Performed By", "IP Address"];
    const rows = logs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString("en-IN")}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.entityId || ""}"`,
      `"${l.entityName || ""}"`,
      `"${l.summary.replace(/"/g, '""')}"`,
      `"${l.performedBy || ""}"`,
      `"${l.ipAddress || ""}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `qschool-audit-trail-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show("Audit trail exported successfully!");
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case "CREATE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">CREATE</span>;
      case "UPDATE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">UPDATE</span>;
      case "DELETE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">DELETE</span>;
      case "PAYOUT":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">PAYOUT</span>;
      case "STATUS_CHANGE":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">STATUS</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">{action}</span>;
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Audit Trail & Modification Logs"
          sub="Complete tracking of all creations, edits, modifications, and deletions across all modules."
        >
          <Btn variant="ghost" icon="download" onClick={handleExportCSV}>
            Export CSV
          </Btn>
          <Btn variant="ghost" icon="filter" onClick={fetchLogs}>
            Refresh
          </Btn>
        </PageHeader>

        {/* Figures / Stats */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Figure label="Total Audit Events" value={String(stats.total)} sub="All recorded operations" icon="clipboard" />
          <Figure label="Creations" value={String(stats.creates)} sub="New records created" icon="plus" />
          <Figure label="Modifications" value={String(stats.updates)} sub="Edits & updates" icon="edit" />
          <Figure label="Deletions" value={String(stats.deletes)} sub="Removed entries" icon="trash" />
          <Figure label="Today's Activity" value={String(stats.todayCount)} sub="Operations today" icon="clock" />
        </div>

        {/* Filters Card */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:max-w-sm">
              <SearchInput
                placeholder="Search audit logs (user, entity, changes)..."
                value={search}
                onChange={setSearch}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => {
                  setSelectedModule(e.target.value);
                  setPage(0);
                }}
                className="h-10 rounded-xl border border-[#DCE4E2] bg-white px-3 text-xs font-medium text-brand-ink outline-none focus:border-brand-teal"
              >
                <option value="all">All Modules</option>
                <option value="Users">Users</option>
                <option value="Students">Students</option>
                <option value="Partners & Referrals">Partners & Referrals</option>
                <option value="Fees & Payments">Fees & Payments</option>
                <option value="Courses">Courses</option>
                <option value="Leads">Leads</option>
                <option value="Staff & Payroll">Staff & Payroll</option>
                <option value="Inventory">Inventory</option>
                <option value="Expenses">Expenses</option>
                <option value="Settings">Settings</option>
                {modules.filter((m) => !["Users", "Students", "Partners & Referrals", "Fees & Payments", "Courses", "Leads", "Staff & Payroll", "Inventory", "Expenses", "Settings"].includes(m)).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Action Filter */}
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(0);
                }}
                className="h-10 rounded-xl border border-[#DCE4E2] bg-white px-3 text-xs font-medium text-brand-ink outline-none focus:border-brand-teal"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="PAYOUT">PAYOUT</option>
                <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Audit Log Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FBFA] border-b border-[#E7EFEA] text-[11px] font-semibold text-[#5A736D] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Module</th>
                  <th className="py-3.5 px-4">Activity Summary</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EFEA]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-[#7A938D]">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EBF7F4] text-brand-teal mb-3">
                        <Icon name="shield" size={24} />
                      </div>
                      <p className="text-sm font-semibold text-brand-ink">No audit logs found</p>
                      <p className="mt-1 text-xs text-[#7A938D]">
                        Modifications, edits, and deletions will automatically appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const dateObj = new Date(log.timestamp);
                    const formattedDate = dateObj.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    });

                    return (
                      <tr key={log.id} className="hover:bg-[#F9FCFA] transition">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-semibold text-brand-ink">{formattedDate}</p>
                          <p className="text-[10px] text-[#7A938D] font-mono">{formattedTime}</p>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getActionBadge(log.action)}
                        </td>

                        {/* Module */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#EBF2F0] text-[#34514A]">
                            {log.module}
                          </span>
                        </td>

                        {/* Summary */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-brand-ink truncate" title={log.summary}>
                            {log.summary}
                          </p>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.entityName ? (
                            <div>
                              <p className="font-medium text-brand-ink">{log.entityName}</p>
                              {log.entityId && <p className="text-[10px] font-mono text-[#7A938D]">{log.entityId}</p>}
                            </div>
                          ) : (
                            <span className="text-[#99AEA8]">—</span>
                          )}
                        </td>

                        {/* Performed By */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-medium text-brand-ink">{log.performedBy || "Admin"}</p>
                          {log.ipAddress && (
                            <p className="text-[10px] font-mono text-[#99AEA8]">{log.ipAddress}</p>
                          )}
                        </td>

                        {/* Action button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-brand-teal hover:bg-[#EBF7F4] transition"
                          >
                            <Icon name="eye" size={14} />
                            Diff / Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between border-t border-[#E7EFEA] px-4 py-3 bg-[#F8FBFA] text-xs text-[#5A736D]">
              <p>
                Showing <span className="font-semibold">{page * limit + 1}</span> to{" "}
                <span className="font-semibold">{Math.min((page + 1) * limit, total)}</span> of{" "}
                <span className="font-semibold">{total}</span> records
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[#DCE4E2] bg-white px-2.5 py-1 font-semibold disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={(page + 1) * limit >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[#DCE4E2] bg-white px-2.5 py-1 font-semibold disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* Detailed Diff Modal */}
        <Modal
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Details · ${selectedLog?.action} (${selectedLog?.module})`}
        >
          {selectedLog && (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="rounded-xl bg-[#F4F8F7] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#5A736D]">Log ID:</span>
                  <span className="font-mono font-medium text-brand-ink">{selectedLog.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A736D]">Timestamp:</span>
                  <span className="font-medium text-brand-ink">
                    {new Date(selectedLog.timestamp).toLocaleString("en-IN", {
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A736D]">Performed By:</span>
                  <span className="font-medium text-brand-teal">{selectedLog.performedBy}</span>
                </div>
                {selectedLog.ipAddress && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#5A736D]">IP Address:</span>
                    <span className="font-mono text-brand-ink">{selectedLog.ipAddress}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-[#DDE6E4] pt-2">
                  <span className="text-[#5A736D]">Action / Module:</span>
                  <span>{getActionBadge(selectedLog.action)} on {selectedLog.module}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#5A736D]">Summary:</span>
                  <span className="font-semibold text-brand-ink">{selectedLog.summary}</span>
                </div>
              </div>

              {/* Previous Data vs New Data Diff */}
              {(selectedLog.previousData || selectedLog.newData) && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A736D]">
                    Data Change Comparison
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {/* Previous Data */}
                    <div>
                      <p className="text-[11px] font-semibold text-rose-700 mb-1 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                        Previous Value / Snapshot
                      </p>
                      <pre className="rounded-xl bg-rose-50/70 border border-rose-200 p-3 text-[11px] font-mono text-rose-950 overflow-x-auto max-h-56">
                        {selectedLog.previousData
                          ? JSON.stringify(selectedLog.previousData, null, 2)
                          : "None (New record created)"}
                      </pre>
                    </div>

                    {/* New Data */}
                    <div>
                      <p className="text-[11px] font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        Updated / New Value
                      </p>
                      <pre className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-3 text-[11px] font-mono text-emerald-950 overflow-x-auto max-h-56">
                        {selectedLog.newData
                          ? JSON.stringify(selectedLog.newData, null, 2)
                          : "None (Record deleted)"}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Details */}
              {selectedLog.details && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A736D] mb-1">
                    Additional Context / Metadata
                  </h4>
                  <pre className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-[11px] font-mono text-gray-800 overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Btn variant="ghost" onClick={() => setSelectedLog(null)}>
                  Close
                </Btn>
              </div>
            </div>
          )}
        </Modal>

        {toast && <Toast msg={toast} />}
      </div>
    </AdminShell>
  );
}
