import timeline from "../../../projects/2026-10-viviana/timeline.json";
import { CaptionWord, chunkWords } from "../../engine/components/Captions";

export const T = timeline;
export const DURATION = timeline.duration;

const beat = (id: string) => timeline.beats.find((x) => x.id === id)!;
/** Absolute start of a display token inside a beat. */
export const at = (beatId: string, display: string, nth = 0) => beat(beatId).words.filter((w) => w.w === display)[nth].s;
export const B = (id: string) => beat(id).start;

const words: CaptionWord[] = timeline.beats
  .filter((b) => b.id !== "b9_avron") // the end card typesets the wordmark itself
  .flatMap((b) => b.words.map((w) => ({ w: w.w, s: w.s, e: w.e, tone: w.tone })));
export const CAPTIONS = chunkWords(words, 3);

// Scene windows (absolute seconds), cut on the narration beats.
export const S = {
  opener: [0, B("b1_hook")],
  hook: [B("b1_hook") - 0.05, B("b2_order")],
  weekend: [B("b2_order"), B("b3_uturn")],
  uturn: [B("b3_uturn"), B("b4_who")],
  who: [B("b4_who"), B("b5_cash")],
  cash: [B("b5_cash"), B("b6_order")],
  order: [B("b6_order"), B("b7_mgmt")],
  mgmt: [B("b7_mgmt"), B("b8_watch")],
  watch: [B("b8_watch"), B("b9_avron")],
  end: [B("b9_avron"), DURATION + 1],
} as const;

/** NSE daily closes, VIVIANA (Yahoo Finance chart API, saved in research/yahoo_viviana_3mo.json). 20 Oct: market holiday. */
export const CLOSES: [string, number][] = [
  ["25 Sep", 719.55], ["28 Sep", 710.65], ["29 Sep", 704.7], ["30 Sep", 704.35], ["1 Oct", 774.5], ["5 Oct", 815.65],
  ["6 Oct", 824.2], ["7 Oct", 817.85], ["8 Oct", 844.35], ["9 Oct", 817.85], ["12 Oct", 847.85], ["13 Oct", 811.75],
  ["14 Oct", 878.0], ["15 Oct", 903.3], ["16 Oct", 796.1], ["19 Oct", 772.75], ["21 Oct", 720.35], ["22 Oct", 697.7],
  ["23 Oct", 680.5],
];
export const PEAK = 13; // index of 15 Oct

/** Quarterly consolidated revenue, ₹ cr (Screener). */
export const QUARTERS: [string, number][] = [["Jun-25", 31.68], ["Sep-25", 58.94], ["Dec-25", 117.87], ["Mar-26", 322.75], ["Jun-26", 72.39]];
/** Annual consolidated revenue, ₹ cr (Screener). */
export const ANNUAL: [string, number][] = [["FY22", 33], ["FY23", 36], ["FY24", 66], ["FY25", 219], ["FY26", 531]];
