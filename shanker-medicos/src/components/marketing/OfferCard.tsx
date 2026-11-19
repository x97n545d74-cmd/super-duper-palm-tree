"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { IconWhatsApp } from "@/components/ui/Icons";

type Labels = { badge: string; title: string; body: string; reveal: string; codeLabel: string; howTo: string; copy: string; copied: string; useOnWa: string };

/** The "clue": the offer code is hidden behind a tap so customers engage with it (and we can measure it). */
export function OfferCard({ code, labels, waHref, percent, tone = "dark" }: { code: string; labels: Labels; waHref: string | null; percent?: number; tone?: "dark" | "light" }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dark = tone === "dark";
  return (
    <div className={`relative overflow-hidden rounded-panel p-7 sm:p-9 ${dark ? "bg-forest text-ivory" : "border border-line bg-white text-ink"}`}>
      {percent ? (
        <span
          aria-hidden="true"
          lang="en"
          data-pct={`${percent}%`}
          className={`pointer-events-none absolute -bottom-8 -right-3 select-none font-display text-[9rem] font-semibold leading-none tracking-[-0.06em] after:content-[attr(data-pct)] sm:text-[12rem] ${dark ? "text-ivory/[0.07]" : "text-forest/[0.06]"}`}
        />
      ) : null}
      <span className={`relative inline-block rounded-full px-3 py-1 text-xs font-semibold ${dark ? "bg-ivory/15 text-ivory" : "bg-mint text-forest"}`}>{labels.badge}</span>
      <p className="relative mt-5 font-display text-h2 font-semibold">{labels.title}</p>
      <p className={`relative mt-3 max-w-md ${dark ? "text-ivory/80" : "text-ink-2"}`}>{labels.body}</p>

      <div className="relative mt-7">
        {!shown ? (
          <button
            type="button"
            onClick={() => {
              setShown(true);
              track("offer_reveal", { promotion_name: code });
            }}
            className={`group relative flex h-16 w-full max-w-sm items-center justify-center overflow-hidden rounded-card border-2 border-dashed font-semibold ${dark ? "border-ivory/50 text-ivory" : "border-emerald text-forest"}`}
          >
            <span aria-hidden="true" className={`absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_10px,currentColor_10px_11px)] opacity-10 transition-opacity group-hover:opacity-20`} />
            <span className="relative">{labels.reveal}</span>
          </button>
        ) : (
          <div className="max-w-sm">
            <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-ivory/70" : "text-ink-2"}`}>{labels.codeLabel}</p>
            <div className={`mt-2 flex h-16 items-center justify-between rounded-card border-2 border-dashed px-4 ${dark ? "border-ivory/60 bg-ivory/10" : "border-emerald bg-mint"}`}>
              <span lang="en" className="font-mono text-2xl font-semibold tracking-[0.12em]" data-testid="offer-code">
                {code}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(code);
                    setCopied(true);
                  } catch {}
                }}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${dark ? "bg-ivory text-forest" : "bg-forest text-ivory"}`}
              >
                {copied ? labels.copied : labels.copy}
              </button>
            </div>
            <p className={`mt-3 text-sm ${dark ? "text-ivory/80" : "text-ink-2"}`}>{labels.howTo}</p>
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" data-track-label="offer_whatsapp" className={`btn mt-4 ${dark ? "btn-light" : "btn-wa"}`}>
                <IconWhatsApp className="h-5 w-5" /> {labels.useOnWa}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
