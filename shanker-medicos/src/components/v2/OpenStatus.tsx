"use client";

import { useEffect, useState } from "react";
import { statusAt, type ShopStatus } from "@/lib/hours";

type Labels = { open: string; opensToday: string; opensTomorrow: string; opensMonday: string; sunday: string; hours: string };

/**
 * Live open/closed sign in India time (hours and seasons in src/lib/hours.ts).
 * It re-checks every 30 seconds, so "Closed now" turns into "Open now" at
 * opening time without a reload. Before the browser runs it, it shows the
 * neutral "Opening hours".
 */
export function OpenStatus({ labels, className = "" }: { labels: Labels; className?: string }) {
  const [s, setS] = useState<ShopStatus | null>(null);
  useEffect(() => {
    const tick = () => setS(statusAt());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  let text = labels.hours;
  if (s?.state === "open") text = labels.open.replace("{t}", s.until);
  else if (s?.state === "opens-today") text = labels.opensToday.replace("{t}", s.at);
  else if (s?.state === "opens-tomorrow") text = labels.opensTomorrow.replace("{t}", s.at);
  else if (s?.state === "opens-monday") text = (s.sunday ? labels.sunday : labels.opensMonday).replace("{t}", s.at);
  const tone = s === null ? "text-ink-2" : s.state === "open" ? "text-open" : "text-coral";
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-live="polite" data-status={s?.state ?? "unknown"}>
      <span className={`live-dot ${tone}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}
