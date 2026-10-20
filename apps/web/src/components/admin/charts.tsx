"use client";

/**
 * Console charts — single brand hue (teal), thin marks, hairline grid, hover layer, table view.
 * Text always uses text tokens; colour only on marks.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { inr, type Kpi } from "@qschool/shared";
import { Icon } from "@/components/icons";

const T = {
  series: "#0E937E",
  wash: "rgba(14,147,126,0.10)",
  grid: "#EDF2F0",
  axis: "#7B8E89",
  ink: "#0F1F1C",
  sub: "#5C716C",
  muted: "#A9B8B4",
  good: "#0A7F0A",
  critical: "#B42E2E",
};

export function fmt(v: number, f: Kpi["format"], compact = true) {
  if (f === "inr") return inr(v, compact);
  if (f === "pct") return `${v}%`;
  return compact && v >= 10000 ? `${(v / 1000).toFixed(1).replace(/\.0$/, "")}K` : v.toLocaleString("en-IN");
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ───────────── Stat tile ───────────── */

function Sparkline({ data, label }: { data: number[]; label: string }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const x = (i: number) => 4 + (i * (w - 8)) / (data.length - 1);
  const y = (v: number) => h - 4 - ((v - min) / (max - min || 1)) * (h - 8);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = data.length - 1;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${label}, 12-month trend`}>
      <polyline points={pts} fill="none" stroke={T.muted} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(data[last])} r={4} fill={T.series} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

export function StatTile({ k }: { k: Kpi }) {
  const up = k.delta >= 0;
  const good = up === k.upIsGood;
  return (
    <div className="rounded-[18px] border border-[#E2ECE9] bg-white p-4">
      <p className="text-[12.5px] font-medium text-[#5C716C]">{k.label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="text-[26px] font-semibold leading-none text-brand-ink">{fmt(k.value, k.format)}</p>
        <Sparkline data={k.trend} label={k.label} />
      </div>
      <p className="mt-2 flex items-center gap-1 text-[12px]">
        <span className="inline-flex items-center gap-0.5 font-semibold" style={{ color: good ? T.good : T.critical }}>
          <Icon name={up ? "arrowUp" : "arrowDown"} size={13} strokeWidth={2.4} />
          {up ? "+" : "−"}
          {Math.abs(k.delta)}%
        </span>
        <span className="text-[#7B8E89]">vs last month</span>
      </p>
    </div>
  );
}

/* ───────────── Table view (accessible fallback for every chart) ───────────── */

function DataTable({ rows, cols }: { rows: (string | number)[][]; cols: string[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#EEF3F1] text-[#5C716C]">
            {cols.map((c, i) => (
              <th key={c} className={`py-2 font-medium ${i > 0 ? "text-right" : ""}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[#F4F7F6]">
              {r.map((c, j) => (
                <td key={j} className={`py-2 ${j > 0 ? "text-right text-brand-ink" : "text-[#41564f]"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ViewToggle({ table, onChange }: { table: boolean; onChange: (t: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!table)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2ECE9] px-2.5 py-1.5 text-[12px] font-medium text-[#41564f] transition hover:border-brand-teal"
      aria-pressed={table}
    >
      <Icon name={table ? "chart" : "table"} size={14} />
      {table ? "Chart" : "Table"}
    </button>
  );
}

/* ───────────── Area trend (single series) ───────────── */

function niceStep(max: number, ticks = 4) {
  const raw = max / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}

export function AreaTrend({
  data,
  table,
  height = 260,
  valueLabel = "Revenue",
}: {
  data: { month: string; value: number }[];
  table: boolean;
  height?: number;
  valueLabel?: string;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  if (table)
    return <DataTable cols={["Month", valueLabel]} rows={data.map((d) => [d.month, inr(d.value)])} />;

  const pad = { l: 52, r: 56, t: 14, b: 28 };
  const iw = Math.max(0, w - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const step = niceStep(Math.max(...data.map((d) => d.value)));
  const top = Math.ceil(Math.max(...data.map((d) => d.value)) / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const x = (i: number) => pad.l + (data.length === 1 ? iw / 2 : (i * iw) / (data.length - 1));
  const y = (v: number) => pad.t + ih - (v / top) * ih;
  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join("");
  const area = `${line}L${x(data.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const last = data.length - 1;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const i = Math.round(((px - pad.l) / (iw || 1)) * (data.length - 1));
    setHover(Math.max(0, Math.min(last, i)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setHover((h) => Math.min(last, (h ?? -1) + 1));
    if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? last + 1) - 1));
    if (e.key === "Escape") setHover(null);
  };

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {w > 0 && (
        <svg
          width={w}
          height={height}
          role="img"
          aria-label={`${valueLabel} by month, ${data[0].month} to ${data[last].month}. Latest ${inr(data[last].value)}. Use arrow keys to inspect.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40 rounded-lg"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={w - pad.r} y1={y(t)} y2={y(t)} stroke={T.grid} strokeWidth={1} />
              <text x={pad.l - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill={T.axis} className="tabular-nums">
                {inr(t, true)}
              </text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={d.month} x={x(i)} y={height - 8} textAnchor="middle" fontSize={11} fill={hover === i ? T.ink : T.axis}>
              {d.month}
            </text>
          ))}
          <path d={area} fill={T.wash} />
          <path d={line} fill="none" stroke={T.series} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {/* end label */}
          <circle cx={x(last)} cy={y(data[last].value)} r={4.5} fill={T.series} stroke="#fff" strokeWidth={2} />
          <text x={x(last) + 9} y={y(data[last].value)} dy="0.32em" fontSize={12} fontWeight={600} fill={T.ink}>
            {inr(data[last].value, true)}
          </text>
          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} stroke="#B8C7C3" strokeWidth={1} />
              <circle cx={x(hover)} cy={y(data[hover].value)} r={5} fill={T.series} stroke="#fff" strokeWidth={2} />
            </g>
          )}
        </svg>
      )}
      {hover !== null && w > 0 && (
        <div
          className="pointer-events-none absolute z-10 rounded-xl border border-[#E2ECE9] bg-white px-3 py-2 shadow-lg"
          style={{
            left: Math.min(Math.max(x(hover) - 70, 0), w - 140),
            top: Math.max(y(data[hover].value) - 64, 0),
            width: 140,
          }}
        >
          <p className="text-[15px] font-semibold text-brand-ink">{inr(data[hover].value)}</p>
          <p className="flex items-center gap-1.5 text-[11.5px] text-[#5C716C]">
            <span className="inline-block h-[2px] w-3 rounded" style={{ background: T.series }} />
            {valueLabel} · {data[hover].month}
          </p>
        </div>
      )}
    </div>
  );
}

/* ───────────── Horizontal bars (single series) ───────────── */

export function HBars({
  data,
  table,
  valueCol,
  note,
  format = (v: number) => v.toLocaleString("en-IN"),
  valueWidth = 86,
}: {
  data: { label: string; value: number }[];
  table: boolean;
  valueCol: string;
  format?: (v: number) => string;
  valueWidth?: number;
  /** Optional per-row secondary text (e.g. conversion from previous stage). */
  note?: (i: number) => string | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  useEffect(() => setHover(null), [table]);

  if (table)
    return (
      <DataTable
        cols={note ? ["", valueCol, "Note"] : ["", valueCol]}
        rows={data.map((d, i) => (note ? [d.label, format(d.value), note(i) ?? "—"] : [d.label, format(d.value)]))}
      />
    );

  return (
    <ul className="space-y-3" role="list">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const n = note?.(i);
        return (
          <li
            key={d.label}
            tabIndex={0}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`${d.label}: ${format(d.value)}${n ? `, ${n}` : ""}`}
            className="group relative grid grid-cols-[110px_1fr] items-center gap-3 rounded-lg py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/40"
          >
            <span className="truncate text-[12.5px] text-[#41564f]">{d.label}</span>
            <span className="flex items-center gap-2">
              <span className="relative h-5 flex-1">
                <span
                  className="absolute inset-y-0 left-0 rounded-r-[4px] transition-opacity"
                  style={{ width: `${pct}%`, background: T.series, opacity: hover === null || hover === i ? 1 : 0.45 }}
                />
              </span>
              <span className="shrink-0 text-[12.5px] font-semibold tabular-nums text-brand-ink" style={{ width: valueWidth }}>
                {format(d.value)}
                {n && <span className="ml-1 font-normal text-[#7B8E89]">{n}</span>}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
