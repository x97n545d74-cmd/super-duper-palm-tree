import timeline from "../../../projects/2026-10-viviana-p2/timeline.json";
import { CaptionWord, chunkWords } from "../../engine/components/Captions";

export const T = timeline;
export const DURATION = timeline.duration;

const beat = (id: string) => timeline.beats.find((x) => x.id === id)!;
/** Absolute start of a display token inside a beat (falls back to the beat start if the word is missing). */
export const at = (beatId: string, display: string, nth = 0) => {
  const hit = beat(beatId).words.filter((w) => w.w === display)[nth];
  return hit ? hit.s : beat(beatId).start;
};
export const B = (id: string) => beat(id).start;

const words: CaptionWord[] = timeline.beats
  .filter((b) => b.id !== "p0_hook" && b.id !== "p8_avron")
  .flatMap((b) => b.words.filter((w) => !("mute" in w && w.mute)).map((w) => ({ w: w.w, s: w.s, e: w.e, tone: w.tone })));
export const CAPTIONS = chunkWords(words, 3);

export const S = {
  hook: [0, B("p1_orders")],
  orders: [B("p1_orders"), B("p2_work")],
  work: [B("p2_work"), B("p3_why")],
  why: [B("p3_why"), B("p4_factory")],
  bets: [B("p4_factory"), B("p5_rp1")],
  rp: [B("p5_rp1"), B("p6_target")],
  target: [B("p6_target"), B("p7_close")],
  close: [B("p7_close"), B("p8_avron")],
  end: [B("p8_avron"), DURATION + 1],
} as const;

/** All six order filings, Mar–Oct 2026 (NSE). ₹ cr incl. taxes. */
export const ORDERS: { d: string; c: string; v: number }[] = [
  { d: "31 MAR", c: "PGVCL", v: 50.61 },
  { d: "7 JUL", c: "DGVCL", v: 41.5 },
  { d: "9 JUL", c: "PGVCL", v: 71.39 },
  { d: "22 JUL", c: "PGVCL", v: 128.35 },
  { d: "27 AUG", c: "GETCO", v: 9.74 },
  { d: "10 OCT", c: "MGVCL", v: 466.74 },
];
