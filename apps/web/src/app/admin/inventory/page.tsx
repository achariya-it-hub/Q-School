"use client";

import { useState } from "react";
import { ADMISSION_CENTRES, inr, type StockItem } from "@qschool/shared";
import { AdminShell } from "@/components/admin/shell";
import { Btn, Card, DataGrid, Field, Figure, Modal, PageHeader, StatusBadge, Td, Th, Toast, inputCls, useToast } from "@/components/admin/ui";
import { addStockItem, restock, useConsole } from "@/components/admin/store";

function level(i: StockItem) {
  if (i.onHand === 0) return { tone: "critical" as const, label: "Out of stock" };
  if (i.onHand < i.reorderAt) return { tone: "serious" as const, label: "Reorder" };
  return { tone: "good" as const, label: "In stock" };
}

export default function InventoryPage() {
  const stock = useConsole((s) => s.stock);
  const [po, setPo] = useState<StockItem | null>(null);
  const [qty, setQty] = useState(0);
  const [adding, setAdding] = useState(false);
  const [toast, show] = useToast();

  const value = stock.reduce((a, i) => a + i.onHand * i.unitCost, 0);
  const low = stock.filter((i) => i.onHand < i.reorderAt);

  return (
    <AdminShell>
      <PageHeader title="Inventory" sub="Study kits, books and merchandise across centres">
        <Btn icon="plus" onClick={() => setAdding(true)}>
          Add item
        </Btn>
      </PageHeader>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Figure label="Stock value" value={inr(value)} sub={`${stock.length} SKUs`} icon="box" />
        <Figure label="Below reorder level" value={String(low.length)} sub={low.map((i) => i.name).slice(0, 2).join(", ") || "All good"} icon="alert" />
        <Figure label="Out of stock" value={String(stock.filter((i) => i.onHand === 0).length)} sub="Raise a purchase order" icon="xCircle" />
      </section>

      <Card className="mt-5">
        <DataGrid minWidth={820}>
          <thead>
            <tr className="border-b border-[#EEF3F1]">
              <Th>Item</Th>
              <Th>Centre</Th>
              <Th>Stock level</Th>
              <Th right>Unit cost</Th>
              <Th>Vendor</Th>
              <Th>Status</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {stock.map((i) => {
              const l = level(i);
              const pct = i.reorderAt > 0 ? Math.min(100, (i.onHand / (i.reorderAt * 2)) * 100) : 100;
              return (
                <tr key={i.sku + i.centre} className="border-b border-[#F4F7F6] hover:bg-[#FAFCFB]">
                  <Td>
                    <p className="font-semibold text-brand-ink">{i.name}</p>
                    <p className="font-mono text-[11px] text-[#7B8E89]">{i.sku}</p>
                  </Td>
                  <Td className="text-[#41564f]">{i.centre}</Td>
                  <Td>
                    <div className="w-[170px]">
                      <div className="flex justify-between text-[11.5px]">
                        <span className="font-semibold tabular-nums text-brand-ink">{i.onHand} on hand</span>
                        <span className="text-[#7B8E89]">reorder at {i.reorderAt}</span>
                      </div>
                      <div className="relative mt-1 h-1.5 rounded-full bg-[#D7F0EB]">
                        <div className="h-full rounded-full bg-[#0E937E]" style={{ width: `${pct}%` }} />
                        <span className="absolute top-[-3px] h-3 w-[2px] bg-[#41564f]" style={{ left: "50%" }} title="Reorder level" />
                      </div>
                    </div>
                  </Td>
                  <Td right className="text-brand-ink">{inr(i.unitCost)}</Td>
                  <Td className="text-[#41564f]">{i.vendor}</Td>
                  <Td>
                    <StatusBadge tone={l.tone}>{l.label}</StatusBadge>
                  </Td>
                  <Td right>
                    <button
                      onClick={() => {
                        setPo(i);
                        setQty(Math.max(i.reorderAt * 2 - i.onHand, 10));
                      }}
                      className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${
                        l.tone === "good" ? "border border-[#E2ECE9] text-[#41564f] hover:border-brand-teal" : "bg-brand-deep text-white hover:bg-brand-teal"
                      }`}
                    >
                      {l.tone === "good" ? "Restock" : "Raise PO"}
                    </button>
                  </Td>
                </tr>
              );
            })}
            {stock.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[13px] text-[#7B8E89]">
                  No inventory items tracked yet. Click &ldquo;Add item&rdquo; to register study kits, workbooks, or merchandise.
                </td>
              </tr>
            )}
          </tbody>
        </DataGrid>
      </Card>

      <Modal open={!!po} title="Purchase order" onClose={() => setPo(null)}>
        {po && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              restock(po.sku, qty);
              show(`PO raised to ${po.vendor} for ${qty} × ${po.name} — stock updated on receipt`);
              setPo(null);
            }}
          >
            <div className="rounded-xl bg-[#F3F8F6] p-3 text-[13px]">
              <p className="font-semibold text-brand-ink">{po.name}</p>
              <p className="text-[#5C716C]">
                {po.vendor} · {po.centre} · {po.onHand} on hand
              </p>
            </div>
            <Field label="Quantity">
              <input type="number" min={1} className={inputCls} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </Field>
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[#5C716C]">
                PO value <span className="text-[17px] font-bold text-brand-ink">{inr(qty * po.unitCost)}</span>
              </p>
              <Btn type="submit" icon="check">
                Raise PO &amp; receive
              </Btn>
            </div>
          </form>
        )}
      </Modal>

      <AddStockModal
        open={adding}
        count={stock.length}
        onClose={() => setAdding(false)}
        onDone={(msg) => {
          setAdding(false);
          show(msg);
        }}
      />
      <Toast msg={toast} />
    </AdminShell>
  );
}

function AddStockModal({
  open,
  count,
  onClose,
  onDone,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [centre, setCentre] = useState(ADMISSION_CENTRES[0]?.name || "HQ");
  const [onHand, setOnHand] = useState(25);
  const [reorderAt, setReorderAt] = useState(10);
  const [unitCost, setUnitCost] = useState(500);
  const [vendor, setVendor] = useState("");

  return (
    <Modal open={open} title="Add inventory item" onClose={onClose}>
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !vendor.trim()) return;
          const finalSku = sku.trim().toUpperCase() || `QS-KIT-${String(count + 1).padStart(3, "0")}`;
          addStockItem({
            sku: finalSku,
            name: name.trim(),
            centre,
            onHand: Math.max(0, Number(onHand) || 0),
            reorderAt: Math.max(1, Number(reorderAt) || 5),
            unitCost: Math.max(1, Number(unitCost) || 0),
            vendor: vendor.trim(),
          });
          setName("");
          setSku("");
          setVendor("");
          onDone(`${name.trim()} (${finalSku}) added to inventory`);
        }}
      >
        <div className="col-span-2">
          <Field label="Item name">
            <input
              required
              className={inputCls}
              placeholder="e.g. Q-Vision Sensory Kit & Workbook"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
        </div>
        <Field label="SKU (optional)">
          <input
            className={inputCls}
            placeholder="Auto-generated if blank"
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Centre">
          <select className={inputCls} value={centre} onChange={(e) => setCentre(e.target.value)}>
            {["HQ", ...ADMISSION_CENTRES.map((c) => c.name)].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity on hand">
          <input type="number" min={0} className={inputCls} value={onHand} onChange={(e) => setOnHand(Number(e.target.value))} />
        </Field>
        <Field label="Reorder threshold">
          <input type="number" min={1} className={inputCls} value={reorderAt} onChange={(e) => setReorderAt(Number(e.target.value))} />
        </Field>
        <Field label="Unit cost (₹)">
          <input required type="number" min={1} className={inputCls} value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} />
        </Field>
        <Field label="Vendor / supplier">
          <input required className={inputCls} placeholder="e.g. Quantum Print & Learning Supplies" value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </Field>
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" icon="check">
            Add item
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
