"use client";

import { useEffect, useState } from "react";

type Labels = { open: string; closed: string; sunday: string; check: string; hours: string };

/**
 * Live open/closed status in India time. Hours (from the owner):
 * summer 9:00 am–10:00 pm, winter 9:30 am–9:30 pm, Sunday closed.
 * The owner didn't say when summer starts, so in the two half-hours where
 * the seasons differ (9:00–9:30 and 21:30–22:00) it says "check the hours"
 * instead of guessing.
 */
function statusNow(): "open" | "closed" | "sunday" | "check" {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  if (get("weekday") === "Sun") return "sunday";
  const m = Number(get("hour")) * 60 + Number(get("minute"));
  if (m >= 9 * 60 + 30 && m < 21 * 60 + 30) return "open";
  if (m < 9 * 60 || m >= 22 * 60) return "closed";
  return "check";
}

export function OpenStatus({ labels, className = "" }: { labels: Labels; className?: string }) {
  const [s, setS] = useState<ReturnType<typeof statusNow> | null>(null);
  useEffect(() => {
    const tick = () => setS(statusNow());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  const tone = s === "open" ? "text-open" : s === null || s === "check" ? "text-ink-2" : "text-coral";
  const text = s === null ? labels.hours : labels[s];
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-live="polite">
      <span className={`live-dot ${tone}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}
