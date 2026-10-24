import timeline from "../../../projects/2026-10-oil-2029/timeline.json";
import { CaptionWord, chunkWords } from "../../engine/components/Captions";

export const T = timeline;
export const C = timeline.cues as Record<string, number>;
export const DURATION = timeline.duration;

/** Absolute start of a display token inside a beat. */
export const at = (beatId: string, display: string, nth = 0) => {
  const b = timeline.beats.find((x) => x.id === beatId)!;
  return b.words.filter((w) => w.w === display)[nth].s;
};

const words: CaptionWord[] = timeline.beats
  .filter((b) => b.id !== "b11_cta") // the end card typesets the sign-off itself
  .flatMap((b) => b.words.map((w) => ({ w: w.w, s: w.s, e: w.e, tone: w.tone })));
export const CAPTIONS = chunkWords(words, 3);

// Scene windows (absolute seconds), derived from the narration cue sheet.
export const S = {
  exterior: [0, C.choice + 0.35],
  choice: [C.choice - 0.25, C.excise + 0.45],
  room: [C.excise - 0.35, C.market + 0.3],
  market: [C.market - 0.2, C.omc + 0.25],
  omc: [C.omc - 0.25, C.promise + 0.25],
  promise: [C.promise - 0.25, C.clause + 0.3],
  clause: [C.clause - 0.25, C.shock + 0.25],
  shock: [C.shock - 0.25, C.y2029s + 0.3],
  y2029: [C.y2029s - 0.3, C.bill + 0.3],
  bill: [C.bill - 0.3, C.cta + 0.3],
  end: [C.cta - 0.25, DURATION + 1],
} as const;
