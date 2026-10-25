import data from "./beats.json";

/*
 * Beat timeline for "₹9.7 Crore a Day". Each narration line is a beat with an id (section_nn).
 * beats.json holds estimated timings until the user's voice-over arrives; then it is regenerated from
 * the real recording and every shot re-times itself, because shots only ever read times from here.
 */
export type Beat = { id: string; section: string; text: string; start: number; end: number };
export const BEATS = data.beats as Beat[];
export const DURATION = data.duration;
export const FPS = 30;

const byId = new Map(BEATS.map((b) => [b.id, b]));
export const b = (id: string) => byId.get(id)!;
export const st = (id: string) => b(id).start;
export const en = (id: string) => b(id).end;

/** Section windows: from the chapter card (a few seconds before its first line) to the next section's card. */
export const SECTIONS = ["open", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "close"] as const;
export type Section = (typeof SECTIONS)[number];
const first = (s: string) => BEATS.find((x) => x.section === s)!;
const last = (s: string) => [...BEATS].reverse().find((x) => x.section === s)!;
export const CARD = 3.0; // seconds of chapter card before a chapter's first line
export const sec = (s: Section): [number, number] => {
  const i = SECTIONS.indexOf(s);
  const a = s === "open" ? 0 : first(s).start - CARD;
  const z = i < SECTIONS.length - 1 ? first(SECTIONS[i + 1]).start - CARD : DURATION;
  return [a, z];
};
export const lastEnd = (s: Section) => last(s).end;
