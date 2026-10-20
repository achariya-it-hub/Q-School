"use client";

import { useMemo, useState } from "react";
import { fmtDate, inr, type PaymentTxn } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Card, DataGrid, Modal, PageHeader, SearchInput, StatusBadge, Td, Th, Toast, useToast } from "@/components/admin/ui";
import { PrintBar, ReceiptView, TXN_TONE, useFinance } from "@/components/admin/finance";
import { waNotify } from "@/components/admin/whatsapp";

export default function ReceiptsPage() {
  const f = useFinance();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<PaymentTxn | null>(null);
  const [toast, show] = useToast();
  const [sending, setSending] = useState(false);

  const list = useMemo(
    () => f.receipts.filter((r) => `${r.receiptNo} ${r.student} ${r.item}`.toLowerCase().includes(q.toLowerCase())),
    [f.receipts, q],
  );
  const account = open ? f.accounts.find((a) => a.id === open.accountId) : undefined;

  return (
    <AdminShell>
      <PageHeader title="Receipts" sub={`${f.receipts.length} fee receipts · issued automatically for every successful payment`} />

      <Card>
        <div className="mb-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search receipt no., student…" />
        </div>
        <DataGrid minWidth={760}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Receipt</Th>
              <Th>Date</Th>
              <Th>Student</Th>
              <Th>Towards</Th>
              <Th>Mode</Th>
              <Th right>Amount</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.receiptNo} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                <Td>
                  <button onClick={() => setOpen(r)} className="font-mono text-[12px] font-semibold text-brand-teal hover:underline">
                    {r.receiptNo}
                  </button>
                </Td>
                <Td className="whitespace-nowrap text-[#41564f]">{fmtDate(r.date)}</Td>
                <Td className="font-medium text-brand-ink">{r.student}</Td>
                <Td>
                  <span className="block max-w-[240px] truncate text-[#41564f]">{r.item}</span>
                </Td>
                <Td className="text-[#41564f]">{r.method}</Td>
                <Td right className="font-semibold text-brand-ink">{inr(r.amount)}</Td>
                <Td>
                  <StatusBadge tone={TXN_TONE[r.status]}>{r.status === "Success" ? "Issued" : r.status}</StatusBadge>
                </Td>
                <Td right>
                  <button onClick={() => setOpen(r)} className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal">
                    View
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </DataGrid>
      </Card>

      <Modal open={!!open} title={open ? `Receipt ${open.receiptNo}` : ""} onClose={() => setOpen(null)} wide>
        {open && (
          <>
            <ReceiptView p={open} account={account} />
            <div className="flex items-center justify-between">
              <button
                disabled={sending || !account?.phone}
                onClick={async () => {
                  setSending(true);
                  const r = await waNotify({ event: "receipt", to: account?.phone, name: open.student, p: open, account });
                  setSending(false);
                  show(r.ok ? `Receipt ${open.receiptNo} sent on WhatsApp to ${account?.phone}` : r.msg);
                }}
                className="mt-4 text-[13px] font-semibold text-brand-teal hover:underline disabled:opacity-50 print:hidden"
              >
                {sending ? "Sending…" : "Send on WhatsApp"}
              </button>
              <PrintBar onClose={() => setOpen(null)} />
            </div>
          </>
        )}
      </Modal>
      <Toast msg={toast} />
    </AdminShell>
  );
}
