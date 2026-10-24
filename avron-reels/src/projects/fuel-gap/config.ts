import timeline from "../../../projects/2026-10-fuel-gap/timeline.json";
import { CaptionWord, chunkWords } from "../../engine/components/Captions";

export const T = timeline;
export const C = timeline.cues;
export const DURATION = timeline.duration;

const beatStart = (id: string) => timeline.beats.find((b) => b.id === id)!.start;
/** Absolute time of the n-th occurrence of a word in a beat (punctuation-insensitive). */
export const wordAt = (beatId: string, text: string, nth = 0) => {
  const norm = (s: string) => s.replace(/[^\w$]/g, "").toLowerCase();
  const b = timeline.beats.find((x) => x.id === beatId)!;
  return b.words.filter((w) => norm(w.w) === norm(text))[nth].s;
};
export const B = {
  hookPrice: beatStart("hook_price"),
  hookLoss: beatStart("hook_loss"),
  brent: beatStart("brent"),
  freight: beatStart("freight"),
  may: beatStart("may_hikes"),
  frozen: beatStart("frozen"),
  estimates: beatStart("estimates"),
  who: beatStart("who_pays"),
  payoff: beatStart("payoff"),
  cta: beatStart("cta"),
};

// Display corrections to the ASR word list (index is position within the beat).
// "" hides a token but keeps timing (e.g. "34 rupees" is shown as "₹34").
type Fix = [beat: string, idx: number, text: string, tone?: "amber" | "loss"];
const fixes: Fix[] = [
  ["hook_price", 0, "95", "amber"], ["hook_price", 2, "20", "amber"], ["hook_price", 4, "That's"],
  ["hook_loss", 10, "₹34", "loss"], ["hook_loss", 11, ""],
  ["brent", 7, "$113", "amber"],
  ["freight", 6, "8", "amber"], ["freight", 8, "pre-conflict"], ["freight", 9, ""],
  ["may_hikes", 6, "4", "amber"], ["may_hikes", 9, "10", "amber"], ["may_hikes", 14, "₹7.50.", "amber"], ["may_hikes", 15, ""], ["may_hikes", 16, ""],
  ["frozen", 6, "₹95.20.", "amber"], ["frozen", 7, ""],
  ["estimates", 12, "₹9", "loss"], ["estimates", 13, ""], ["estimates", 19, "₹34.", "loss"],
  ["who_pays", 0, "An"], ["who_pays", 11, "government,"], ["who_pays", 13, "you."],
  ["payoff", 0, "Right"], ["payoff", 1, "now,"], ["payoff", 7, "next?"], ["payoff", 8, "Depends"],
];

const captionWords: CaptionWord[] = timeline.beats
  .filter((b) => b.id !== "cta") // the end card typesets the CTA line itself
  .flatMap((b) =>
    b.words.map((w, i) => {
      const f = fixes.find((x) => x[0] === b.id && x[1] === i);
      return { w: f ? f[2] : w.w, s: w.s, e: w.e, tone: f?.[3] };
    }),
  );

export const CAPTIONS = chunkWords(captionWords, 3);
