"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureAttribution, collect, track } from "@/lib/analytics";

/**
 * One listener for the whole site. Tracks:
 *  - any link to wa.me (whatsapp_click), tel: (call_click), Google Maps (directions_click)
 *  - any element with data-track="event_name" (+ data-track-label / data-track-item)
 * and records first-touch UTM attribution on the landing page.
 */
export function ClickTracker() {
  const pathname = usePathname();
  useEffect(() => captureAttribution(), []);
  // One pageview per route (attribution is captured first on the landing page).
  useEffect(() => {
    captureAttribution();
    collect("pageview");
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a,button,[data-track]");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      const label = el.dataset.trackLabel || el.textContent?.trim().slice(0, 60) || "";
      const item = el.dataset.trackItem;
      const base = { placement: label, page: pathname, ...(item ? { item_name: item } : {}) };
      if (el.dataset.track) track(el.dataset.track, base);
      else if (href.startsWith("https://wa.me/")) track("whatsapp_click", base);
      else if (href.startsWith("tel:")) track("call_click", base);
      else if (/^https:\/\/(maps\.app\.goo\.gl|(www\.)?google\.[a-z.]+\/maps|goo\.gl\/maps)/.test(href)) track("directions_click", base);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname]);
  return null;
}

/** Fires one event when a page renders (e.g. search results, product views). */
export function TrackView({ event, params }: { event: string; params: Record<string, string | number> }) {
  const key = JSON.stringify(params);
  useEffect(() => {
    track(event, JSON.parse(key));
  }, [event, key]);
  return null;
}
