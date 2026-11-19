"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { IconWhatsApp } from "@/components/ui/Icons";

type Labels = { badge: string; title: string; body: string; reveal: string; codeLabel: string; howTo: string; copy: string; copied: string; useOnWa: string };

/**
 * The offer as a receipt (the AVRON "receipt" move): a bill from the counter,
 * neutral bars for the other lines, and the one offer line swept by a
 * highlighter. The code stays hidden behind a tap (the "clue"), so we can
 * count how many people reveal it.
 */
export function OfferCard({ code, labels, waHref, percent }: { code: string; labels: Labels; waHref: string | null; percent?: number; tone?: "dark" | "light" }) {
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div data-rv className="panel relative overflow-hidden p-0">
      <div className="border-b border-dashed border-line px-7 py-5 sm:px-9">
        <div className="flex items-center justify-between gap-4">
          <span className="chip !text-emerald">{labels.badge}</span>
          <span lang="en" className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-2">
            Shanker Medicos · Dera Road
          </span>
        </div>
      </div>
      <div className="px-7 py-7 sm:px-9">
        {/* neutral receipt lines */}
        <div aria-hidden="true" className="space-y-3">
          {[72, 54, 64].map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-6">
              <span className="h-2.5 rounded-full bg-line" style={{ width: `${w}%` }} />
              <span className="h-2.5 w-12 rounded-full bg-line" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-end justify-between gap-6 border-t border-line pt-6">
          <p className="display max-w-md text-[clamp(1.9rem,1.2rem+1.8vw,2.8rem)] leading-[.95]">
            <span className="hl">{labels.title}</span>
          </p>
          {percent ? (
            <span lang="en" aria-hidden="true" className="shrink-0 font-mono text-4xl font-medium text-coral sm:text-5xl">
              −{percent}%
            </span>
          ) : null}
        </div>
        <p className="mt-4 max-w-lg text-ink-2">{labels.body}</p>

        <div className="mt-7">
          {!shown ? (
            <button
              type="button"
              onClick={() => {
                setShown(true);
                track("offer_reveal", { promotion_name: code });
              }}
              className="group relative flex h-16 w-full max-w-sm items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed border-line font-semibold text-ink transition-colors hover:border-emerald"
            >
              <span aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0_10px,currentColor_10px_11px)] opacity-[0.07] transition-opacity group-hover:opacity-[0.12]" />
              <span className="relative">{labels.reveal}</span>
            </button>
          ) : (
            <div className="morph-in max-w-sm">
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-2">{labels.codeLabel}</p>
              <div className="mt-2 flex h-16 items-center justify-between rounded-[16px] border-2 border-dashed border-emerald bg-mint px-4">
                <span lang="en" className="font-mono text-2xl font-medium tracking-[0.12em] text-ink" data-testid="offer-code">
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
                  className="rounded-full bg-ink px-3.5 py-1.5 text-sm font-semibold text-ivory"
                >
                  {copied ? labels.copied : labels.copy}
                </button>
              </div>
              <p className="mt-3 text-sm text-ink-2">{labels.howTo}</p>
              {waHref && (
                <a href={waHref} target="_blank" rel="noopener noreferrer" data-track-label="offer_whatsapp" className="btn btn-wa mt-4">
                  <IconWhatsApp className="h-5 w-5" /> {labels.useOnWa}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      {/* torn edge */}
      <div aria-hidden="true" className="h-3 bg-[radial-gradient(circle_at_8px_12px,var(--color-ivory)_6px,transparent_6.5px)] bg-[length:16px_12px] bg-repeat-x" />
    </div>
  );
}
