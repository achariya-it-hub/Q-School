"use client";

import Image from "next/image";
import { InvoiceView, ReceiptView } from "@/components/admin/finance";
import type { SharedDoc } from "@/lib/docs/store";

export function SharedDocView({ doc, org, support }: { doc: SharedDoc; org: string; support: string }) {
  return (
    <main className="min-h-screen bg-[#F3F8F6] px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-[760px]">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <Image src="/logo.png" alt={org} width={120} height={36} className="h-9 w-auto" />
          <button
            onClick={() => window.print()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-teal px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-brand-deep"
          >
            Download PDF
          </button>
        </div>
        {doc.type === "invoice" ? <InvoiceView inv={doc.inv} /> : <ReceiptView p={doc.p} account={doc.account} />}
        <p className="mt-4 text-center text-[12px] text-[#5C716C] print:hidden">
          Questions about this {doc.type}? Call or WhatsApp {org} on {support}.
        </p>
      </div>
    </main>
  );
}
