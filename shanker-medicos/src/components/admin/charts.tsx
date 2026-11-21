"use client";

import { useRef, useState } from "react";

// Small, dependency-free charts for Admin → Analytics.
// Rules followed: one y-axis per chart, 2px lines, bars with 4px rounded tops
// anchored to the baseline and 2px gaps, recessive grid, hover tooltip on
// every chart, legend for multi-series, and a table view under each chart.

import { SERIES } from "@/lib/chart-colors";

const fmtDay = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function niceMax(v: number) {
  if (v <= 5) return 5;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

function useHover(n: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [i, setI] = useState<number | null>(null);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !n) return;
    const x = Math.min(Math.max(e.clientX - r.left, 0), r.width - 1);
    setI(Math.floor((x / r.width) * n));
  };
  return { ref, i, onMove, onLeave: () => setI(null) };
}

function Axis({ max }: { max: number }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {[1, 0.5, 0].map((f) => (
        <div key={f} className="absolute inset-x-0 border-t border-line" style={{ top: `${(1 - f) * 100}%` }}>
          <span className="absolute -top-2.5 left-0 -translate-x-full pr-2 text-[11px] tabular-nums text-ink-2">{Math.round(max * f)}</span>
        </div>
      ))}
    </div>
  );
}

function XLabels({ dates }: { dates: string[] }) {
  const idx = dates.length <= 8 ? dates.map((_, i) => i) : [0, Math.floor(dates.length / 3), Math.floor((2 * dates.length) / 3), dates.length - 1];
  return (
    <div className="relative mt-2 h-4 text-[11px] text-ink-2" aria-hidden="true">
      {idx.map((i) => (
        <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${((i + 0.5) / dates.length) * 100}%` }}>
          {fmtDay(dates[i])}
        </span>
      ))}
    </div>
  );
}

function Tooltip({ x, children }: { x: number; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className="pointer-events-none absolute -top-2 z-10 min-w-36 -translate-y-full rounded-control border border-line bg-white px-3 py-2 text-xs shadow-lift"
      style={{ left: `${x * 100}%`, transform: `translate(${x > 0.7 ? "-100%" : x < 0.3 ? "0" : "-50%"}, -100%)` }}
    >
      {children}
    </div>
  );
}

/** Single series over time (e.g. visits per day). */
export function LineChart({ data, label }: { data: { date: string; value: number }[]; label: string }) {
  const n = data.length;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const { ref, i, onMove, onLeave } = useHover(n);
  const pts = data.map((d, k) => [((k + 0.5) / n) * 1000, 300 - (d.value / max) * 300] as const);
  const line = pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts.at(-1)?.[0] ?? 0},300 L${pts[0]?.[0] ?? 0},300 Z`;
  return (
    <figure>
      <div className="pl-8">
        <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative h-56 touch-none" role="img" aria-label={`${label}, ${n} days`}>
          <Axis max={max} />
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
            <path d={area} fill={SERIES.whatsapp} opacity={0.08} />
            <path d={line} fill="none" stroke={SERIES.whatsapp} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          </svg>
          {i !== null && data[i] && (
            <>
              <div className="pointer-events-none absolute inset-y-0 w-px bg-ink/30" style={{ left: `${((i + 0.5) / n) * 100}%` }} />
              <div
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
                style={{ left: `${((i + 0.5) / n) * 100}%`, top: `${(1 - data[i].value / max) * 100}%`, background: SERIES.whatsapp }}
              />
              <Tooltip x={(i + 0.5) / n}>
                <p className="font-semibold text-ink">{fmtDay(data[i].date)}</p>
                <p className="mt-0.5 text-ink-2">
                  {label}: <span className="font-semibold text-ink">{data[i].value}</span>
                </p>
              </Tooltip>
            </>
          )}
        </div>
        <XLabels dates={data.map((d) => d.date)} />
      </div>
      <TableView headers={["Date", label]} rows={data.map((d) => [fmtDay(d.date), d.value])} />
    </figure>
  );
}

/** Stacked daily bars, e.g. enquiries by type. */
export function StackedBars({ data, series }: { data: ({ date: string } & Record<string, number | string>)[]; series: { key: string; label: string; color: string }[] }) {
  const n = data.length;
  const totals = data.map((d) => series.reduce((s, x) => s + Number(d[x.key] || 0), 0));
  const max = niceMax(Math.max(1, ...totals));
  const { ref, i, onMove, onLeave } = useHover(n);
  return (
    <figure>
      <ul className="mb-4 flex flex-wrap gap-4 text-xs text-ink" aria-label="Legend">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} aria-hidden="true" /> {s.label}
          </li>
        ))}
      </ul>
      <div className="pl-8">
        <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative h-48 touch-none" role="img" aria-label={`Enquiries per day, ${n} days`}>
          <Axis max={max} />
          <div className="absolute inset-0 flex items-end">
            {data.map((d, k) => (
              <div key={d.date} className={`flex h-full min-w-0 flex-1 flex-col-reverse items-center justify-start ${i === k ? "opacity-100" : i === null ? "" : "opacity-60"}`}>
                {series.map((s, si) => {
                  const v = Number(d[s.key] || 0);
                  if (!v) return null;
                  const isTop = series.slice(si + 1).every((x) => !Number(d[x.key] || 0));
                  return (
                    <div
                      key={s.key}
                      style={{ height: `calc(${(v / max) * 100}% - 2px)`, background: s.color, marginTop: 2 }}
                      className={`w-[64%] max-w-6 ${isTop ? "rounded-t-[4px]" : ""}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          {i !== null && data[i] && (
            <Tooltip x={(i + 0.5) / n}>
              <p className="font-semibold text-ink">
                {fmtDay(String(data[i].date))} · {totals[i]}
              </p>
              {series.map((s) => (
                <p key={s.key} className="mt-0.5 flex items-center gap-1.5 text-ink-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} /> {s.label}: <span className="font-semibold text-ink">{Number(data[i][s.key] || 0)}</span>
                </p>
              ))}
            </Tooltip>
          )}
        </div>
        <XLabels dates={data.map((d) => String(d.date))} />
      </div>
      <TableView headers={["Date", ...series.map((s) => s.label), "Total"]} rows={data.map((d, k) => [fmtDay(String(d.date)), ...series.map((s) => Number(d[s.key] || 0)), totals[k]])} />
    </figure>
  );
}

function TableView({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-ink-2 hover:text-ink">View as table</summary>
      <div className="mt-2 max-h-64 overflow-auto rounded-control border border-line">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-ivory">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {rows.map((r) => (
              <tr key={String(r[0])}>
                {r.map((c, k) => (
                  <td key={k} className="px-3 py-1.5">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Horizontal bars for ranked lists (single hue: magnitude only). Value is always printed. */
export function BarList({ items, total, suffix = "" }: { items: { name: string; count: number; note?: string }[]; total?: number; suffix?: string }) {
  const max = Math.max(1, ...items.map((x) => x.count));
  if (!items.length) return <p className="text-sm text-ink-2">No data yet.</p>;
  return (
    <ul className="space-y-2.5">
      {items.map((x) => (
        <li key={x.name} className="group" title={`${x.name}: ${x.count}${suffix}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink">
              {x.name}
              {x.note && <span className="ml-2 text-xs text-ink-2">{x.note}</span>}
            </span>
            <span className="shrink-0 tabular-nums text-ink">
              {x.count}
              {suffix}
              {total ? <span className="ml-1.5 text-xs text-ink-2">{Math.round((x.count / total) * 100)}%</span> : null}
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-mint">
            <div className="h-2 rounded-full transition-[filter] group-hover:brightness-110" style={{ width: `${(x.count / max) * 100}%`, background: SERIES.whatsapp }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
