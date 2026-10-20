"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";

export function PageHeader({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-bold leading-tight text-brand-ink">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-[#6b807b]">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[20px] border border-[#E2ECE9] bg-white p-4 sm:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[16px] font-semibold text-brand-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  icon,
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  icon?: IconName;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls =
    variant === "primary"
      ? "bg-gradient-to-b from-[#0B6E5F] to-[#054038] text-white hover:from-[#0E937E] hover:to-[#065247]"
      : variant === "danger"
        ? "border border-[#F3C9CA] bg-white text-[#C22F33] hover:bg-[#FDF2F2]"
        : "border border-[#D9E6E2] bg-white text-brand-deep hover:border-brand-teal";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[13px] font-semibold transition disabled:opacity-50 ${cls}`}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

/** Segmented control — used for date range and view toggles. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full overflow-x-auto rounded-xl border border-[#E2ECE9] bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition ${
            o.value === value ? "bg-brand-deep text-white" : "text-[#41564f] hover:bg-[#F1F7F5]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Status colours are fixed (good / warning / serious / critical) and always paired with an icon + label. */
const STATUS: Record<string, { fg: string; bg: string; icon: IconName }> = {
  good: { fg: "#0A7F0A", bg: "#EAF7EA", icon: "checkCircle" },
  warning: { fg: "#8A5A00", bg: "#FFF6E0", icon: "clock" },
  serious: { fg: "#A9471F", bg: "#FDEFE8", icon: "alert" },
  critical: { fg: "#B42E2E", bg: "#FCEDED", icon: "xCircle" },
  neutral: { fg: "#41564F", bg: "#F1F5F4", icon: "undo" },
  info: { fg: "#0B6E5F", bg: "#E3F4F0", icon: "live" },
};

export type Tone = keyof typeof STATUS;

export function StatusBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const s = STATUS[tone];
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
      style={{ color: s.fg, background: s.bg }}
    >
      <Icon name={s.icon} size={13} strokeWidth={2.2} />
      {children}
    </span>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
  wide,
  ratio169,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  /** Fixed 16:9 landscape box (scrolls inside if content is taller). */
  ratio169?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#021c18]/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={ratio169 ? { width: "min(1040px, 95vw, calc(88vh * 16 / 9))", aspectRatio: "16 / 9" } : undefined}
        className={`relative w-full overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl ${ratio169 ? "max-h-[88vh]" : `max-h-[90vh] ${wide ? "max-w-2xl" : "max-w-md"}`}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6b807b] hover:bg-[#F1F5F4]" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Right-side drawer for record details (lead 360, invoice). */
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-[#021c18]/40" onClick={onClose} />
      <aside
        role="dialog"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl animate-[slideIn_.2s_ease]"
      >
        <div className="flex items-center justify-between border-b border-[#EEF3F1] px-5 py-4">
          <h3 className="text-[16px] font-semibold text-brand-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#6b807b] hover:bg-[#F1F5F4]" aria-label="Close">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-semibold text-[#41564f]">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "h-11 w-full rounded-xl border border-[#E2ECE9] bg-[#F7FAF9] px-3.5 text-sm text-brand-ink outline-none transition focus:border-brand-teal focus:bg-white";

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-10 w-full min-w-0 items-center sm:w-auto sm:min-w-[220px] gap-2 rounded-xl border border-[#E2ECE9] bg-white px-3 text-[#7b908b] focus-within:border-brand-teal">
      <Icon name="search" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-brand-ink outline-none placeholder:text-[#93a5a0]"
      />
    </label>
  );
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-brand-deep px-4 py-3 text-sm font-medium text-white shadow-xl">
      {msg}
    </div>
  );
}

/** Simple figure tile: label · value · optional sub-line (with an optional meter). */
export function Figure({
  label,
  value,
  sub,
  meter,
  icon,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  meter?: number;
  icon?: IconName;
}) {
  return (
    <div className="rounded-[18px] border border-[#E2ECE9] bg-white p-4">
      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#5C716C]">
        {icon && <Icon name={icon} size={15} />}
        {label}
      </p>
      <p className="mt-1.5 text-[24px] font-semibold leading-none text-brand-ink">{value}</p>
      {meter !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#D7F0EB]">
          <div className="h-full rounded-full bg-[#0E937E]" style={{ width: `${Math.min(100, meter)}%` }} />
        </div>
      )}
      {sub && <p className="mt-2 text-[12px] text-[#6b807b]">{sub}</p>}
    </div>
  );
}

export function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th className={`whitespace-nowrap px-3 py-2.5 text-[12px] font-medium text-[#5C716C] ${right ? "text-right" : ""}`}>{children}</th>;
}

export function Td({ children, right, className = "" }: { children?: React.ReactNode; right?: boolean; className?: string }) {
  return <td className={`px-3 py-3 align-middle ${right ? "whitespace-nowrap text-right tabular-nums" : ""} ${className}`}>{children}</td>;
}

/** Table wrapper with horizontal scroll and consistent styling. */
export function DataGrid({ children, minWidth = 720 }: { children: React.ReactNode; minWidth?: number }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full text-left text-[13px]" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState("");
  const show = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(""), 3200);
  }, []);
  return [msg, show] as const;
}
