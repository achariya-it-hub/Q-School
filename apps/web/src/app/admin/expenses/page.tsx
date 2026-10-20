"use client";

import { useMemo, useState } from "react";
import { ADMISSION_CENTRES, fmtDate, inr, TODAY_ISO, type Expense } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Field, Figure, Modal, PageHeader, StatusBadge, Td, Th, Toast, inputCls, useToast, type Tone } from "@/components/admin/ui";
import { HBars, ViewToggle } from "@/components/admin/charts";
import { addExpense, downloadCsv, setExpenseStatus, useConsole } from "@/components/admin/store";
import { useFinance } from "@/components/admin/finance";

const TONE: Record<Expense["status"], Tone> = { Paid: "good", Approved: "info", "Pending approval": "warning" };
const CATS: Expense["category"][] = ["Salaries", "Rent", "Marketing", "Software", "Study material", "Utilities", "Travel"];

export default function ExpensesPage() {
  const expenses = useConsole((s) => s.expenses);
  const fin = useFinance();
  const [catTable, setCatTable] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toast, show] = useToast();

  const total = expenses.reduce((a, e) => a + e.amount, 0);
  const byCat = useMemo(
    () =>
      CATS.map((c) => ({ label: c, value: expenses.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0) }))
        .filter((c) => c.value > 0)
        .sort((a, b) => b.value - a.value),
    [expenses],
  );
  const pending = expenses.filter((e) => e.status === "Pending approval");

  return (
    <AdminShell>
      <PageHeader title="Expenses" sub="Spend by category and centre · approvals">
        <Btn
          variant="ghost"
          icon="download"
          onClick={() =>
            downloadCsv("qschool-expenses.csv", ["ID", "Date", "Category", "Vendor", "Note", "Centre", "Amount", "Status"], expenses.map((e) => [e.id, e.date, e.category, e.vendor, e.note, e.centre, e.amount, e.status]))
          }
        >
          Export (Tally CSV)
        </Btn>
        <Btn icon="plus" onClick={() => setAdding(true)}>
          Add expense
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Spend · last 30 days" value={inr(total)} sub={`${expenses.length} entries`} icon="download" />
        <Figure label="Fee collections" value={inr(fin.collected)} sub="All payments on the fee ledger" icon="rupee" />
        <Figure label="Awaiting approval" value={String(pending.length)} sub={pending.length ? inr(pending.reduce((a, e) => a + e.amount, 0)) : "All clear"} icon="clock" />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <DataGrid minWidth={820}>
            <thead>
              <tr className="border-b border-[#EEF3F1]">
                <Th>Date</Th>
                <Th>Category</Th>
                <Th>Vendor · note</Th>
                <Th>Centre</Th>
                <Th right>Amount</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td className="whitespace-nowrap text-[#41564f]">{fmtDate(e.date)}</Td>
                  <Td className="text-brand-ink">{e.category}</Td>
                  <Td>
                    <span className="block font-medium text-brand-ink">{e.vendor}</span>
                    <span className="block max-w-[240px] truncate text-[11.5px] text-[#6b807b]">{e.note}</span>
                  </Td>
                  <Td className="text-[#41564f]">{e.centre}</Td>
                  <Td right className="font-semibold text-brand-ink">{inr(e.amount)}</Td>
                  <Td>
                    <StatusBadge tone={TONE[e.status]}>{e.status}</StatusBadge>
                  </Td>
                  <Td right>
                    {e.status === "Pending approval" && (
                      <button
                        onClick={() => {
                          setExpenseStatus(e.id, "Approved");
                          show(`${e.id} approved`);
                        }}
                        className="rounded-lg bg-brand-deep px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-brand-teal"
                      >
                        Approve
                      </button>
                    )}
                    {e.status === "Approved" && (
                      <button
                        onClick={() => {
                          setExpenseStatus(e.id, "Paid");
                          show(`${e.id} marked paid`);
                        }}
                        className="rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] hover:border-brand-teal"
                      >
                        Mark paid
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </DataGrid>
        </Card>
        <Card title="Spend by category" action={<ViewToggle table={catTable} onChange={setCatTable} />}>
          <HBars data={byCat} table={catTable} valueCol="Spend" format={(v) => inr(v, true)} valueWidth={64} />
        </Card>
      </div>

      <AddExpense open={adding} onClose={() => setAdding(false)} onDone={(m) => (setAdding(false), show(m))} />
      <Toast msg={toast} />
    </AdminShell>
  );
}

function AddExpense({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const [f, setF] = useState({ category: "Marketing" as Expense["category"], vendor: "", note: "", amount: 0, centre: "HQ" });
  return (
    <Modal open={open} title="Add expense" onClose={onClose}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.vendor || !f.amount) return;
          addExpense({ ...f, date: TODAY_ISO, status: "Pending approval" });
          onDone(`Expense of ${inr(f.amount)} submitted for approval`);
          setF((x) => ({ ...x, vendor: "", note: "", amount: 0 }));
        }}
      >
        <Field label="Category">
          <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Expense["category"] })}>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Centre">
          <select className={inputCls} value={f.centre} onChange={(e) => setF({ ...f, centre: e.target.value })}>
            {["HQ", "Online", ...ADMISSION_CENTRES.map((b) => b.name)].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="col-span-2">
          <Field label="Vendor">
            <input required className={inputCls} value={f.vendor} onChange={(e) => setF({ ...f, vendor: e.target.value })} />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Note">
            <input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
          </Field>
        </div>
        <Field label="Amount (₹)">
          <input required type="number" min={1} className={inputCls} value={f.amount || ""} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} />
        </Field>
        <div className="flex items-end justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" icon="check">
            Submit
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
