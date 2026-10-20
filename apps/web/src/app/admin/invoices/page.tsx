"use client";

import { useMemo, useState } from "react";
import { fmtDate, inr, type InvoiceDoc } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Figure, Modal, PageHeader, SearchInput, Segmented, StatusBadge, Td, Th, Toast, useToast } from "@/components/admin/ui";
import { CollectModal, INVOICE_TONE, InvoiceView, PrintBar, useFinance } from "@/components/admin/finance";
import { downloadCsv } from "@/components/admin/store";
import { waNotify } from "@/components/admin/whatsapp";

type F = "All" | "Paid" | "Pending" | "Overdue" | "Refunded";

export default function InvoicesPage() {
  const f = useFinance();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<F>("All");
  const [open, setOpen] = useState<InvoiceDoc | null>(null);
  const [collectId, setCollectId] = useState<string | null>(null);
  const [toast, show] = useToast();
  const [sending, setSending] = useState(false);

  const list = useMemo(
    () =>
      f.invoices
        .filter((i) => status === "All" || i.status === status)
        .filter((i) => `${i.id} ${i.student} ${i.item}`.toLowerCase().includes(q.toLowerCase())),
    [f.invoices, status, q],
  );
  const sum = (s: string) => f.invoices.filter((i) => i.status === s).reduce((a, i) => a + i.amount, 0);
  const gst = f.invoices.filter((i) => i.status === "Paid").reduce((a, i) => a + i.gst, 0);
  const collectAcc = f.accounts.find((a) => a.id === collectId) ?? null;

  return (
    <AdminShell>
      <PageHeader title="Invoices" sub="GST tax invoices, one per installment billed">
        <Btn
          variant="ghost"
          icon="download"
          onClick={() =>
            downloadCsv(
              "qschool-invoices.csv",
              ["Invoice", "Date", "Student", "Item", "Taxable", "GST", "Total", "Due", "Status"],
              f.invoices.map((i) => [i.id, i.date, i.student, i.item, (i.amount - i.gst).toFixed(2), i.gst.toFixed(2), i.amount, i.due, i.status]),
            )
          }
        >
          Export CSV (GSTR-1)
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Figure label="Invoices issued" value={String(f.invoices.length)} sub="Last 4 months" icon="lessons" />
        <Figure label="Paid" value={inr(sum("Paid"))} sub={`GST collected ${inr(gst)}`} icon="checkCircle" />
        <Figure label="Pending" value={inr(sum("Pending"))} sub="Not yet due" icon="clock" />
        <Figure label="Overdue" value={inr(sum("Overdue"))} sub="Past due date" icon="alert" />
      </section>

      <Card className="mt-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput value={q} onChange={setQ} placeholder="Search invoice no., student…" />
          <Segmented<F>
            label="Status"
            value={status}
            onChange={setStatus}
            options={(["All", "Paid", "Pending", "Overdue", "Refunded"] as F[]).map((v) => ({ value: v, label: v }))}
          />
        </div>
        <DataGrid minWidth={900}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Invoice</Th>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Item</Th>
              <Th right>GST</Th>
              <Th right>Total</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                <Td>
                  <button onClick={() => setOpen(i)} className="font-mono text-[12px] font-semibold text-brand-teal hover:underline">
                    {i.id}
                  </button>
                </Td>
                <Td className="whitespace-nowrap text-[#41564f]">{fmtDate(i.date)}</Td>
                <Td className="font-medium text-brand-ink">{i.student}</Td>
                <Td>
                  <span className="block max-w-[260px] truncate text-[#41564f]">{i.item}</span>
                </Td>
                <Td right className="text-[#41564f]">{inr(i.gst)}</Td>
                <Td right className="font-semibold text-brand-ink">{inr(i.amount)}</Td>
                <Td>
                  <StatusBadge tone={INVOICE_TONE[i.status]}>{i.status}</StatusBadge>
                </Td>
                <Td right>
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => setOpen(i)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                      View
                    </button>
                    {(i.status === "Pending" || i.status === "Overdue") && (
                      <button
                        onClick={() => setCollectId(i.accountId)}
                        className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                      >
                        Collect
                      </button>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataGrid>
      </Card>

      <Modal open={!!open} title={open ? `Invoice ${open.id}` : ""} onClose={() => setOpen(null)} wide>
        {open && (
          <>
            <InvoiceView inv={open} />
            <div className="flex items-center justify-between">
              <div className="mt-4 flex gap-4 print:hidden">
                <button
                  disabled={sending || !open.phone}
                  onClick={async () => {
                    setSending(true);
                    const r = await waNotify({ event: "invoice", to: open.phone, name: open.student, inv: open });
                    setSending(false);
                    show(r.ok ? `Invoice ${open.id} sent on WhatsApp to ${open.phone}` : r.msg);
                  }}
                  className="text-[13px] font-semibold text-brand-teal hover:underline disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send on WhatsApp"}
                </button>
                <button onClick={() => show(`Invoice ${open.id} emailed to ${open.email}`)} className="text-[13px] font-semibold text-[#41564f] hover:underline">
                  Email to student
                </button>
              </div>
              <PrintBar onClose={() => setOpen(null)} />
            </div>
          </>
        )}
      </Modal>

      <CollectModal account={collectAcc} onClose={() => setCollectId(null)} onDone={(m) => (setCollectId(null), show(m))} />
      <Toast msg={toast} />
    </AdminShell>
  );
}
