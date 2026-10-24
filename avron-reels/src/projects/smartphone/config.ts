import timeline from "../../../projects/2026-10-smartphone/timeline.json";
import cues from "../../../projects/2026-10-smartphone/cues.json";
import { CaptionWord, chunkWords } from "../../engine/components/Captions";

export const T = timeline;
export const DURATION = timeline.duration;
export const CUE = cues;

const beat = (id: string) => timeline.beats.find((x) => x.id === id)!;
/** Absolute start of a display token inside a beat (falls back to the beat start if the word is missing). */
export const at = (beatId: string, display: string, nth = 0) => {
  const hit = beat(beatId).words.filter((w) => w.w === display)[nth];
  return hit ? hit.s : beat(beatId).start;
};
export const B = (id: string) => beat(id).start;

const words: CaptionWord[] = timeline.beats.flatMap((b) => b.words.map((w) => ({ w: w.w, s: w.s, e: w.e, tone: w.tone })));
// chunk on punctuation, then drop it: no full stops in on-screen text
export const CAPTIONS = chunkWords(words, 3).map((c) => ({ ...c, words: c.words.map((w) => ({ ...w, w: w.w.replace(/[.,।]+$/, "") })) }));

/** The opening clip: IGR screen recording, bars cropped, 1.5x (setpts=PTS/1.5, atempo=1.5) = 20.37 s, after the logo intro. */
export const CLIP_END = cues.clipEnd;

/** Captions follow the VO. Off while the user records their own TTS for the post-clip section. */
export const SHOW_CAPTIONS = true;

export const S = {
  intro: [0, cues.intro],
  clip: [cues.intro, CLIP_END],
  budget: [CLIP_END, B("b2_memory")],
  memory: [B("b2_memory"), B("b3_cycle")],
  cycle: [B("b3_cycle"), B("b4_survey")],
  survey: [B("b4_survey"), B("b5_split")],
  split: [B("b5_split"), cues.end],
  end: [cues.end, DURATION + 1],
} as const;
