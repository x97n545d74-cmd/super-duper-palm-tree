"use client";

import { useMemo, useState } from "react";
import { IconWhatsApp } from "@/components/ui/Icons";

export type FinderCompany = { id: string; name: string; known: string; kind: "indian" | "multinational"; wa: string | null; logo?: string | null };
type Labels = { search: string; none: string; indian: string; mnc: string; ask: string; count: string; all: string };

/** Instant company search with a filter by type. No medicine names anywhere. */
export function CompanyFinder({ companies, labels, limit, askHref }: { companies: FinderCompany[]; labels: Labels; limit?: number; askHref: string | null }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "indian" | "multinational">("all");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return companies.filter((c) => (kind === "all" || c.kind === kind) && (!s || c.name.toLowerCase().includes(s) || c.known.toLowerCase().includes(s)));
  }, [q, kind, companies]);
  const shown = limit && !q ? list.slice(0, limit) : list;
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">{labels.search}</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-2" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={labels.search} className="field h-14 rounded-[16px] pl-12 text-[1.02rem] shadow-hair" type="search" enterKeyHint="search" />
        </label>
        <div className="flex gap-1 rounded-[16px] border border-line bg-surface p-1" role="group" aria-label={labels.search}>
          {(["all", "indian", "multinational"] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              onClick={() => setKind(k)}
              className={`h-11 rounded-[12px] px-3.5 text-sm font-semibold transition-colors ${kind === k ? "bg-ink text-ivory" : "text-ink-2 hover:text-ink"}`}
            >
              {k === "all" ? labels.all : k === "indian" ? labels.indian : labels.mnc}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-ink-2" aria-live="polite">
        {labels.count.replace("{n}", String(list.length))}
      </p>
      {shown.length ? (
        <ul lang="en" className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <li key={c.id}>
              <a
                href={c.wa || "#"}
                target="_blank"
                rel="noopener noreferrer"
                data-track-label="company_ask"
                aria-label={`${labels.ask}: ${c.name}`}
                className="card group flex h-full items-center gap-4 p-4"
              >
                {c.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.logo} alt={`${c.name} logo`} width={44} height={44} loading="lazy" className="h-11 w-11 shrink-0 rounded-[12px] border border-line bg-white object-contain p-1" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-mint font-mono text-[0.8rem] font-medium text-emerald" aria-hidden="true">
                    {initials(c.name)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{c.name}</span>
                  {c.known && <span className="mt-0.5 block truncate text-sm text-ink-2">{c.known}</span>}
                </span>
                <IconWhatsApp className="h-4 w-4 shrink-0 text-ink-2 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel mt-4 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink">{labels.none.replace("{q}", q)}</p>
          {askHref && (
            <a href={askHref} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
              <IconWhatsApp className="h-5 w-5" /> WhatsApp
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function initials(name: string) {
  const w = name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter((x) => x && !/^(Ltd|India|and|of|the|Pvt|Limited)$/i.test(x));
  return ((w[0]?.[0] || "") + (w[1]?.[0] || w[0]?.[1] || "")).toUpperCase();
}
