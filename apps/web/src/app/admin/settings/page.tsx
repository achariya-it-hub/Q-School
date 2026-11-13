"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/shell";
import { SettingsNav } from "@/components/admin/settings-nav";
import { Btn, Card, Toast, useToast } from "@/components/admin/ui";
import { Row, TextField } from "@/components/admin/site-fields";
import { useSettings } from "@/components/admin/use-settings";
import { resetAllConsoleData } from "@/components/admin/store";
import type { GeneralSettings } from "@/lib/settings/store";

export default function GeneralSettingsPage() {
  const { data, save } = useSettings();
  const [g, setG] = useState<GeneralSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, show] = useToast();
  useEffect(() => {
    if (data) setG(data.general);
  }, [data]);
  const dirty = !!g && !!data && JSON.stringify(g) !== JSON.stringify(data.general);
  const u = <K extends keyof GeneralSettings>(k: K) => (v: GeneralSettings[K]) => g && setG({ ...g, [k]: v });

  const handleResetDemoData = async () => {
    if (
      !window.confirm(
        "Reset all demo and test data across CRM Leads, Admissions, Progress Tracker, Finance, Partners, Campaigns, Payroll, Tasks, Inventory, and Live Sessions? Official courses and staff logins will be preserved."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const r = await fetch("/api/admin/reset", { method: "POST" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Failed to reset demo data");
      resetAllConsoleData();
      show("All demo data has been reset across server and local cache.");
    } catch (err) {
      show((err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminShell>
      <SettingsNav />
      {!g ? (
        <p className="p-4 text-sm text-[#6b807b]">Loading…</p>
      ) : (
        <div className="space-y-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await save({ general: g });
                show("Settings saved");
              } catch (err) {
                show((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Card title="Organisation">
              <div className="space-y-4">
                <Row>
                  <TextField label="Brand name" value={g.orgName} onChange={u("orgName")} max={80} />
                  <TextField label="Legal name" hint="on invoices" value={g.legalName} onChange={u("legalName")} max={160} />
                </Row>
                <TextField label="Registered address" value={g.address} onChange={u("address")} max={400} multiline rows={2} />
                <Row>
                  <TextField label="GSTIN" value={g.gstin} onChange={u("gstin")} max={20} placeholder="33AABCQ1234F1Z5" />
                  <TextField label="Currency" value={g.currency} onChange={u("currency")} max={3} />
                </Row>
              </div>
            </Card>
            <Card title="Contact & support">
              <div className="space-y-4">
                <TextField label="Support email" value={g.supportEmail} onChange={u("supportEmail")} max={160} />
                <Row>
                  <TextField label="Support phone" value={g.supportPhone} onChange={u("supportPhone")} max={30} />
                  <TextField label="WhatsApp number" value={g.whatsapp} onChange={u("whatsapp")} max={30} />
                </Row>
                <TextField label="Time zone" hint="IANA name" value={g.timezone} onChange={u("timezone")} max={60} />
              </div>
            </Card>
            <div className="flex justify-end gap-2 xl:col-span-2">
              {dirty && <span className="mr-auto self-center text-[12.5px] font-medium text-[#8A5A00]">Unsaved changes</span>}
              <Btn type="submit" icon="check" disabled={!dirty || busy}>
                {busy ? "Saving…" : "Save settings"}
              </Btn>
            </div>
          </form>

          <Card title="System data & demo reset">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-[13.5px] font-semibold text-brand-ink">Reset all ERP demo &amp; test data</p>
                <p className="mt-0.5 text-[12.5px] text-[#5C716C]">
                  Clears all test leads, student admissions, progress tracker entries, fee accounts, invoices, payments, expenses, partner referrals, campaign items, payroll runs, tasks, and live sessions while preserving official courses and staff login credentials.
                </p>
              </div>
              <Btn variant="danger" icon="trash" onClick={handleResetDemoData} disabled={resetting}>
                {resetting ? "Resetting…" : "Reset all demo data"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
      <Toast msg={toast} />
    </AdminShell>
  );
}
