import type { Dictionary } from "@/i18n";
import { HOURS, fmtTime, seasonAt } from "@/lib/hours";

/** Opening hours from src/lib/hours.ts, in the visitor's language; the current season is marked. */
export function HoursList({ t, compact = false }: { t: Dictionary; compact?: boolean }) {
  const v = t.v2.visit;
  const now = seasonAt();
  const rows = [
    { k: v.summer, val: `${fmtTime(HOURS.summer.open)} – ${fmtTime(HOURS.summer.close)}`, current: now === "summer" },
    { k: v.winter, val: `${fmtTime(HOURS.winter.open)} – ${fmtTime(HOURS.winter.close)}`, current: now === "winter" },
  ];
  if (compact)
    return (
      <span className="block text-sm leading-relaxed text-ink-2">
        <span className="block font-medium text-ink">{v.monSat}</span>
        {rows.map((r) => (
          <span key={r.k} className="block">
            {r.k}: <span lang="en">{r.val}</span>
          </span>
        ))}
        <span className="block">
          {v.sunday}: {v.closed}
        </span>
      </span>
    );
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{v.monSat}</p>
      <dl className="mt-2 divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between gap-4 py-3.5">
            <dt className="flex items-center gap-2 text-ink-2">
              {r.k}
              {r.current && <span className="rounded-full bg-emerald px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.06em] text-black">{v.now}</span>}
            </dt>
            <dd lang="en" className="shrink-0 font-mono text-[0.85rem] text-ink">
              {r.val}
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 py-3.5">
          <dt className="text-ink-2">{v.sunday}</dt>
          <dd className="font-mono text-[0.85rem] text-coral">{v.closed}</dd>
        </div>
      </dl>
    </div>
  );
}
