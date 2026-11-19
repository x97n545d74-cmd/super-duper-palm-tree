// Shop hours (owner, 20 Nov 2026): Monday to Saturday; summer 9:00 am – 10:00 pm,
// winter 9:30 am – 9:30 pm; Sunday closed. The owner did not give the season
// dates, so summer is April–September and winter October–March until told
// otherwise (change SUMMER_MONTHS). All times are India time (Asia/Kolkata).
// Safe for client and server.

export const SUMMER_MONTHS = [4, 5, 6, 7, 8, 9]; // April–September

export type Season = "summer" | "winter";
export const HOURS: Record<Season, { open: number; close: number }> = {
  summer: { open: 9 * 60, close: 22 * 60 },
  winter: { open: 9 * 60 + 30, close: 21 * 60 + 30 },
};

/** "9:30 am" style, used in every language (digits stay Latin, as on the shop's bills). */
export function fmtTime(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function istParts(d: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", weekday: "short", month: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return { weekday: get("weekday"), month: Number(get("month")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function seasonAt(d: Date = new Date()): Season {
  return SUMMER_MONTHS.includes(istParts(d).month) ? "summer" : "winter";
}

export type ShopStatus =
  | { state: "open"; until: string }
  | { state: "opens-today"; at: string }
  | { state: "opens-tomorrow"; at: string }
  | { state: "opens-monday"; at: string; sunday: boolean };

/** Live status in India time. */
export function statusAt(d: Date = new Date()): ShopStatus {
  const { weekday, minutes } = istParts(d);
  const h = HOURS[seasonAt(d)];
  const at = fmtTime(h.open);
  if (weekday === "Sun") return { state: "opens-monday", at, sunday: true };
  if (minutes < h.open) return { state: "opens-today", at };
  if (minutes < h.close) return { state: "open", until: fmtTime(h.close) };
  if (weekday === "Sat") return { state: "opens-monday", at, sunday: false };
  return { state: "opens-tomorrow", at };
}
