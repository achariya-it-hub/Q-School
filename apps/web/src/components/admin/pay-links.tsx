"use client";

import { useState } from "react";
import { inr, type PayLink, type StudentRecord } from "@qschool/shared";
import { Btn, Field, Modal, StatusBadge, inputCls } from "@/components/admin/ui";

const TONE = { Created: "warning", Paid: "good", Expired: "neutral", Cancelled: "neutral" } as const;
const PROVIDER = { razorpay: "Razorpay", grayquest: "GrayQuest" } as const;

const waLink = (s: StudentRecord, l: PayLink) => {
  const d = s.phone.replace(/\D/g, "");
  const to = d.length === 10 ? `91${d}` : d;
  const msg = `Dear ${s.parentName}, please pay ${inr(l.amount)} for ${s.studentName}'s admission at Q-School using this secure link: ${l.url}`;
  return `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
};

/** Payment links for one admission: create (Razorpay via API, or paste a GrayQuest link), share on WhatsApp, check status. */
export function PayLinks({ student, onChanged }: { student: StudentRecord; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const links = student.payLinks ?? [];

  const check = async (l: PayLink) => {
    setMsg("");
    const r = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: student.id, action: "checkLink", linkId: l.id }) });
    const j = await r.json().catch(() => ({}));
    setMsg(!r.ok ? j.error ?? "Could not check" : j.status === "paid" ? "Paid. The student is now Active." : `Link status: ${String(j.status).replace("_", " ")}`);
    onChanged();
  };
  const copy = (t: string) => navigator.clipboard?.writeText(t).then(() => setMsg("Link copied"));

  return (
    <div className="rounded-xl border border-[#E2ECE9] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-brand-ink">Payment links</p>
        {!(student.status === "Active" && student.payment) && <Btn variant="ghost" icon="plus" onClick={() => setOpen(true)}>Send payment link</Btn>}
      </div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.id} className="rounded-lg bg-[#F7FAF9] p-2.5 text-[12.5px]">
            <div className="flex flex-wrap items-center gap-2">
              <b className="text-brand-ink">{inr(l.amount)}</b>
              <span className="text-[#6b807b]">{PROVIDER[l.provider]} · {new Date(l.createdAt).toLocaleDateString("en-IN")} · {l.createdBy}</span>
              <span className="ml-auto"><StatusBadge tone={TONE[l.status]}>{l.status}</StatusBadge></span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-3 text-[12px] font-semibold text-brand-teal">
              <button onClick={() => copy(l.url)} className="hover:underline">Copy link</button>
              <a href={waLink(student, l)} target="_blank" rel="noreferrer" className="hover:underline">WhatsApp</a>
              {l.status === "Created" && l.provider === "razorpay" && <button onClick={() => check(l)} className="hover:underline">Check payment status</button>}
              {l.status === "Paid" && l.method && <span className="font-normal text-[#6b807b]">paid by {l.method}</span>}
            </div>
          </li>
        ))}
        {links.length === 0 && <li className="text-[12.5px] text-[#6b807b]">No links sent yet. The parent can pay by UPI, card, net banking or card EMI, and the student is activated automatically when the payment lands.</li>}
      </ul>
      {msg && <p className="mt-2 text-[12.5px] font-semibold text-brand-deep">{msg}</p>}
      <NewLink student={student} open={open} onClose={() => setOpen(false)} onDone={(m) => { setOpen(false); setMsg(m); onChanged(); }} />
    </div>
  );
}

function NewLink({ student, open, onClose, onDone }: { student: StudentRecord; open: boolean; onClose: () => void; onDone: (m: string) => void }) {
  const [provider, setProvider] = useState<"razorpay" | "grayquest">("razorpay");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/students", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: student.id, action: "payLink", provider, amount: Number(amount), description: desc, url, ref }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(j.error ?? "Could not create the link");
    navigator.clipboard?.writeText(j.link.url).catch(() => {});
    onDone(provider === "razorpay" ? "Link created and copied. Razorpay also texts it to the parent." : "GrayQuest link saved and copied.");
    setAmount("");
    setDesc("");
    setUrl("");
    setRef("");
  };

  return (
    <Modal open={open} title="Send payment link" onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <p className="text-[12.5px] text-[#6b807b]">For <b>{student.studentName}</b> · parent {student.parentName} ({student.phone})</p>
        <Field label="Collect through">
          <select className={inputCls} value={provider} onChange={(e) => setProvider(e.target.value as "razorpay" | "grayquest")}>
            <option value="razorpay">Razorpay: UPI, cards, net banking, card EMI (auto-confirms)</option>
            <option value="grayquest">GrayQuest: education EMI (paste the link you generated there)</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount (₹)"><input required type="number" min="1" step="0.01" className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="For (shown to parent)"><input className={inputCls} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Admission fee" /></Field>
        </div>
        {provider === "grayquest" && (
          <>
            <Field label="GrayQuest payment link"><input required type="url" className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></Field>
            <Field label="GrayQuest reference (optional)"><input className={inputCls} value={ref} onChange={(e) => setRef(e.target.value)} /></Field>
            <p className="text-[12px] text-[#6b807b]">GrayQuest EMI is approved and paid on their side. When the money reaches you, press <b>Confirm payment &amp; activate</b> on this student.</p>
          </>
        )}
        {provider === "razorpay" && <p className="text-[12px] text-[#6b807b]">Parents with eligible cards see EMI options on the checkout page (enable EMI in your Razorpay Dashboard). Link is valid for 14 days.</p>}
        {err && <p className="text-[12.5px] font-semibold text-[#B42E2E]">{err}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" icon="check" disabled={busy}>{busy ? "Creating…" : "Create link"}</Btn>
        </div>
      </form>
    </Modal>
  );
}
