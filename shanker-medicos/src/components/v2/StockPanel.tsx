"use client";

import { useState } from "react";
import type { FormIcon } from "@/lib/stock";
import { FormGlyph } from "./FormGlyph";
import { IconWhatsApp } from "@/components/ui/Icons";

export type StockItem = { id: string; icon: FormIcon; name: string; line: string; rx?: boolean; wa: string | null };
type Labels = { ask: string; rx: string; pick: string; of: string };

/**
 * "What we stock" as one product-UI panel (AVRON panel morph): the list of
 * kinds on the left, one detail card on the right that changes state.
 * On phones the list becomes a scrolling row of chips above the card.
 */
export function StockPanel({ items, labels }: { items: StockItem[]; labels: Labels }) {
  const [active, setActive] = useState(0);
  const cur = items[active];
  return (
    <div className="panel grid grid-cols-1 overflow-hidden lg:grid-cols-12">
      <div role="tablist" aria-label={labels.pick} className="flex min-w-0 gap-2 overflow-x-auto border-b border-line p-3 lg:col-span-5 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-b-0 lg:border-r lg:p-3">
        {items.map((it, i) => {
          const on = i === active;
          return (
            <button
              key={it.id}
              type="button"
              role="tab"
              id={`tab-${it.id}`}
              aria-selected={on}
              aria-controls="stock-detail"
              onClick={() => setActive(i)}
              className={`group flex shrink-0 items-center gap-3 rounded-[14px] px-3 py-2.5 text-left transition-colors duration-200 lg:w-full ${on ? "bg-forest text-white" : "text-ink hover:bg-mint"}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] transition-colors ${on ? "bg-white/12 text-white" : "bg-mint text-emerald group-hover:bg-white"}`}>
                <FormGlyph icon={it.icon} className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className="whitespace-nowrap text-[0.95rem] font-semibold lg:whitespace-normal">{it.name}</span>
              <span className={`ml-auto hidden font-mono text-[0.7rem] lg:inline ${on ? "text-white/60" : "text-ink-2"}`}>{String(i + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </div>
      <div id="stock-detail" role="tabpanel" aria-labelledby={`tab-${cur.id}`} className="relative flex min-h-[22rem] flex-col justify-between overflow-hidden p-6 sm:p-9 lg:col-span-7">
        <div className="fields opacity-70" aria-hidden="true">
          <i />
        </div>
        <div key={cur.id} className="morph-in relative">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-2">
            {String(active + 1).padStart(2, "0")} {labels.of} {String(items.length).padStart(2, "0")}
          </p>
          <span className="mt-6 flex h-20 w-20 items-center justify-center rounded-[22px] border border-line bg-white text-emerald shadow-lift">
            <FormGlyph icon={cur.icon} className="h-10 w-10" />
          </span>
          <h3 className="mt-7 text-h1">{cur.name}</h3>
          <p className="mt-3 max-w-md text-lg text-ink-2">{cur.line}</p>
          {cur.rx && <p className="chip mt-5 !text-coral">{labels.rx}</p>}
        </div>
        {cur.wa && (
          <a key={`wa-${cur.id}`} href={cur.wa} target="_blank" rel="noopener noreferrer" data-track-label={`stock_${cur.id}`} className="btn btn-wa morph-in relative mt-10 h-auto min-h-[46px] self-start whitespace-normal py-2.5 text-left">
            <IconWhatsApp className="h-5 w-5" /> {labels.ask.replace("{form}", cur.name.toLowerCase())}
          </a>
        )}
      </div>
    </div>
  );
}
