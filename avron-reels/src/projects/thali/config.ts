import timeline from "../../../projects/2026-10-thali/timeline.json";
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
export const END = beat("b8_cta").voEnd + 0.15;

const words: CaptionWord[] = timeline.beats.flatMap((b) => b.words.map((w) => ({ w: w.w, s: w.s, e: w.e, tone: w.tone })));
// Chunk on the punctuation, then drop full stops from what is shown (house rule: no full stops on screen).
export const CAPTIONS = chunkWords(words, 3).map((c) => ({ ...c, words: c.words.map((w) => ({ ...w, w: w.w.replace(/[.।]+$/, "") })) }));

/** Shot windows (absolute seconds). */
export const S = {
  hook: [0, B("b1_thali")],
  thali: [B("b1_thali"), B("b2_cpi")],
  cpi: [B("b2_cpi"), B("b3_food")],
  food: [B("b3_food"), B("b4_veg")],
  veg: [B("b4_veg"), B("b5_split")],
  split: [B("b5_split"), B("b6_rbi")],
  rbi: [B("b6_rbi"), B("b6_proj")],
  proj: [B("b6_proj"), B("b7_real")],
  real: [B("b7_real"), B("b8_cta")],
  cta: [B("b8_cta"), END],
  end: [END, DURATION + 1],
} as const;
