"use client";

/* Form building blocks for the website editor (Admin Console › Website). */

import { useEffect, useRef, useState } from "react";
import { ICON_NAMES, Icon, type IconName } from "@/components/icons";
import type { Cta } from "@/lib/site/home-content";

export const fieldInput =
  "w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3.5 py-2.5 text-sm text-brand-ink outline-none transition focus:border-brand-teal focus:bg-white";

function Label({ label, hint, count }: { label: string; hint?: string; count?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline justify-between gap-2">
      <span className="text-[12px] font-semibold text-[#41564f]">
        {label}
        {hint && <span className="ml-1.5 font-normal text-[#8aa39c]">{hint}</span>}
      </span>
      {count && <span className="text-[11px] tabular-nums text-[#93a5a0]">{count}</span>}
    </span>
  );
}

export function TextField({
  label,
  value,
  onChange,
  max = 120,
  multiline = false,
  rows = 3,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  max?: number;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label label={label} hint={hint} count={value.length > max * 0.7 ? `${value.length}/${max}` : undefined} />
      {multiline ? (
        <textarea value={value} maxLength={max} rows={rows} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`${fieldInput} resize-y leading-relaxed`} />
      ) : (
        <input value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={fieldInput} />
      )}
    </label>
  );
}

export function NumberField({ label, value, onChange, min = 0, max = 9999, hint }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; hint?: string }) {
  return (
    <label className="block">
      <Label label={label} hint={hint} />
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
        className={fieldInput}
      />
    </label>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3.5 py-2.5">
      <span>
        <span className="block text-[13px] font-semibold text-brand-ink">{label}</span>
        {hint && <span className="block text-[12px] text-[#6b807b]">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand-teal" : "bg-[#C9D8D4]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

const LINK_SUGGESTIONS = ["#demo", "#programs", "#live", "#centres", "#pricing", "#faq", "/courses", "/live", "/login", "/dashboard"];

export function LinkField({ label, value, onChange }: { label: string; value: Cta; onChange: (v: Cta) => void }) {
  const id = useRef(`l${Math.random().toString(36).slice(2, 8)}`).current;
  const bad = value.href && !/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(value.href);
  return (
    <div>
      <Label label={label} hint="leave the text empty to hide the button" />
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_0.8fr]">
        <input value={value.label} maxLength={60} placeholder="Button text" onChange={(e) => onChange({ ...value, label: e.target.value })} className={fieldInput} />
        <input
          value={value.href}
          list={id}
          placeholder="#demo or /courses"
          onChange={(e) => onChange({ ...value, href: e.target.value })}
          className={`${fieldInput} font-mono text-[13px] ${bad ? "!border-[#E5484D]" : ""}`}
        />
        <datalist id={id}>
          {LINK_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {bad && <p className="mt-1 text-[12px] text-[#C22F33]">Use a page path (/courses), a section (#demo) or a full https:// link.</p>}
    </div>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const presets = ["#0E937E", "#054038", "#2BD6B4", "#5B6CF0", "#F29A2E", "#E2557A", "#2563EB", "#E2445C", "#FFC845"];
  return (
    <div>
      <Label label={label} />
      <div className="flex flex-wrap items-center gap-1.5">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            aria-label={`Use colour ${p}`}
            onClick={() => onChange(p)}
            className={`h-7 w-7 rounded-lg border-2 transition ${value.toLowerCase() === p.toLowerCase() ? "border-brand-ink scale-110" : "border-white shadow"}`}
            style={{ background: p }}
          />
        ))}
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-7 w-9 cursor-pointer rounded-lg border border-[#E2ECE9] bg-white p-0.5" aria-label="Custom colour" />
      </div>
    </div>
  );
}

export function IconPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <Label label={label} />
      <button type="button" onClick={() => setOpen((v) => !v)} className={`${fieldInput} flex items-center gap-2 text-left`} aria-expanded={open}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-teal100 text-brand-deep">
          <Icon name={value as IconName} size={16} />
        </span>
        <span className="flex-1 truncate text-[13px]">{value}</span>
        <Icon name="more" size={16} className="text-[#8aa39c]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 grid max-h-64 w-[280px] grid-cols-7 gap-1 overflow-y-auto rounded-xl border border-[#E2ECE9] bg-white p-2 shadow-xl">
          {ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              title={n}
              aria-label={n}
              onClick={() => {
                onChange(n);
                setOpen(false);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-brand-teal100 ${n === value ? "bg-brand-teal text-white hover:bg-brand-teal" : "text-brand-deep"}`}
            >
              <Icon name={n} size={17} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Image: URL, upload, or pick from previously uploaded images. */
export function ImageField({
  label,
  value,
  onChange,
  alt,
  onAlt,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  alt?: string;
  onAlt?: (v: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [lib, setLib] = useState<{ url: string }[] | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [value]);

  const upload = async (f: File) => {
    setErr("");
    if (f.size > 4 * 1024 * 1024) return setErr("Image is larger than 4 MB. Please resize it first.");
    setBusy(true);
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/admin/site/media", { method: "POST", body: fd });
    const d = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setErr(d.error ?? "Upload failed");
    onChange(d.url);
    setLib(null);
  };

  const openLib = async () => {
    if (lib) return setLib(null);
    const d = await fetch("/api/admin/site/media").then((r) => r.json());
    setLib(d.media ?? []);
  };

  return (
    <div>
      <Label label={label} hint={hint} />
      <div className="flex gap-3">
        <div className="relative h-[84px] w-[128px] shrink-0 overflow-hidden rounded-xl border border-[#E2ECE9] bg-[#EEF5F3]">
          {value && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" onError={() => setBroken(true)} className="h-full w-full object-cover" />
          ) : value ? (
            <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-[#8A5A00]">Can&apos;t load this image here</span>
          ) : (
            <span className="flex h-full items-center justify-center text-[11px] text-[#8aa39c]">No image</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input value={value} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} className={`${fieldInput} font-mono text-[12px]`} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => file.current?.click()} disabled={busy} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-deep px-3 text-[12.5px] font-semibold text-white disabled:opacity-60">
              <Icon name="download" size={14} className="rotate-180" /> {busy ? "Uploading…" : "Upload"}
            </button>
            <button type="button" onClick={openLib} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#D9E6E2] bg-white px-3 text-[12.5px] font-semibold text-brand-deep">
              <Icon name="grid" size={14} /> Library
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="inline-flex h-9 items-center rounded-lg px-2 text-[12.5px] font-medium text-[#C22F33] hover:bg-[#FDF2F2]">
                Remove
              </button>
            )}
          </div>
          <input
            ref={file}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {err && <p className="mt-1.5 text-[12px] text-[#C22F33]">{err}</p>}
      {lib && (
        <div className="mt-2 rounded-xl border border-[#E2ECE9] bg-white p-2">
          {lib.length ? (
            <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto sm:grid-cols-6">
              {lib.map((m) => (
                <button key={m.url} type="button" onClick={() => (onChange(m.url), setLib(null))} className="aspect-[4/3] overflow-hidden rounded-lg border border-[#E2ECE9] hover:ring-2 hover:ring-brand-teal">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : (
            <p className="p-2 text-[12.5px] text-[#6b807b]">No uploads yet. Use Upload to add your first image.</p>
          )}
        </div>
      )}
      {onAlt && (
        <div className="mt-2">
          <TextField label="Image description" hint="for screen readers and search engines" value={alt ?? ""} onChange={onAlt} max={160} />
        </div>
      )}
    </div>
  );
}

/** A list of simple strings (features, points, tags). */
export function StringList({ label, items, onChange, max = 10, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; max?: number; placeholder?: string }) {
  return (
    <div>
      <Label label={label} count={`${items.length}/${max}`} />
      <div className="space-y-2">
        {items.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input value={s} placeholder={placeholder} onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} className={fieldInput} />
            <IconBtn label="Move up" icon="arrowUp" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} />
            <IconBtn label="Remove" icon="trash" danger onClick={() => onChange(items.filter((_, k) => k !== i))} />
          </div>
        ))}
        {items.length < max && (
          <button type="button" onClick={() => onChange([...items, ""])} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-semibold text-brand-teal hover:bg-brand-teal100/60">
            <Icon name="plus" size={15} /> Add
          </button>
        )}
      </div>
    </div>
  );
}

export function move<T>(arr: T[], i: number, d: number) {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
}

function IconBtn({ label, icon, onClick, disabled, danger }: { label: string; icon: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  const glyph =
    icon === "arrowUp" ? (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    ) : icon === "arrowDown" ? (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>
    ) : (
      <Icon name={icon as IconName} size={15} />
    );
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E2ECE9] bg-white transition disabled:opacity-30 ${
        danger ? "text-[#C22F33] hover:bg-[#FDF2F2]" : "text-brand-deep hover:border-brand-teal"
      }`}
    >
      {glyph}
    </button>
  );
}

/** Repeating group (slides, cards, plans…): collapsible rows with reorder, duplicate and delete. */
export function ListEditor<T>({
  label,
  items,
  onChange,
  render,
  title,
  create,
  max = 12,
  addLabel = "Add item",
  defaultOpen = 0,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  render: (item: T, set: (v: T) => void, index: number) => React.ReactNode;
  title: (item: T, index: number) => React.ReactNode;
  create: () => T;
  max?: number;
  addLabel?: string;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div>
      <Label label={label} count={`${items.length}/${max}`} />
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className={`overflow-hidden rounded-2xl border transition ${open === i ? "border-brand-teal/50 bg-white shadow-sm" : "border-[#E2ECE9] bg-[#FAFCFB]"}`}>
            <div className="flex items-center gap-2 px-3 py-2">
              <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left" aria-expanded={open === i}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-teal100 text-[11px] font-bold text-brand-deep">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-brand-ink">{title(it, i)}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`shrink-0 text-[#8aa39c] transition ${open === i ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="flex shrink-0 gap-1">
                <SmallBtn label="Move up" disabled={i === 0} onClick={() => (onChange(move(items, i, -1)), open === i && setOpen(i - 1))}>
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </SmallBtn>
                <SmallBtn label="Move down" disabled={i === items.length - 1} onClick={() => (onChange(move(items, i, 1)), open === i && setOpen(i + 1))}>
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </SmallBtn>
                <SmallBtn label="Duplicate" disabled={items.length >= max} onClick={() => onChange([...items.slice(0, i + 1), structuredClone(it), ...items.slice(i + 1)])}>
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </SmallBtn>
                <SmallBtn
                  label="Delete"
                  danger
                  onClick={() => {
                    if (window.confirm("Delete this item?")) {
                      onChange(items.filter((_, k) => k !== i));
                      setOpen(null);
                    }
                  }}
                >
                  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                </SmallBtn>
              </div>
            </div>
            {open === i && <div className="space-y-4 border-t border-[#EEF3F1] p-4">{render(it, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}</div>}
          </div>
        ))}
      </div>
      {items.length < max && (
        <button
          type="button"
          onClick={() => {
            onChange([...items, create()]);
            setOpen(items.length);
          }}
          className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-brand-teal/50 px-3.5 py-2 text-[13px] font-semibold text-brand-teal hover:bg-brand-teal100/50"
        >
          <Icon name="plus" size={15} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function SmallBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-25 ${danger ? "text-[#C22F33] hover:bg-[#FDF2F2]" : "text-[#41564f] hover:bg-[#EEF6F3]"}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

export function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-[#E2ECE9] p-4">
      <legend className="px-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b807b]">{title}</legend>
      {children}
    </fieldset>
  );
}

export function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) {
  return <div className={`grid grid-cols-1 gap-4 ${cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}
