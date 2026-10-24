import React from "react";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease } from "../anim";

export type CaptionWord = { w: string; s: number; e: number; tone?: "amber" | "loss" };
export type CaptionChunk = { words: CaptionWord[]; s: number; e: number };

/** Group timed words into short, readable chunks (break on punctuation or max words). */
export const chunkWords = (words: CaptionWord[], maxWords = 3): CaptionChunk[] => {
  const chunks: CaptionChunk[] = [];
  let cur: CaptionWord[] = [];
  const flush = () => {
    if (cur.length) chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
    cur = [];
  };
  for (const w of words) {
    if (!w.w) continue;
    cur.push(w);
    if (cur.length >= maxWords || /[.,?!]$/.test(w.w)) flush();
  }
  flush();
  // hold each chunk until the next one starts (no flicker in short gaps)
  for (let i = 0; i < chunks.length - 1; i++) {
    const gap = chunks[i + 1].s - chunks[i].e;
    chunks[i].e = gap < 0.6 ? chunks[i + 1].s : chunks[i].e + 0.25;
  }
  return chunks;
};

/** Word-synchronised captions: active word lights up, chunk rises in. */
export const Captions: React.FC<{ t: number; chunks: CaptionChunk[]; y?: number }> = ({ t, chunks, y = layout.captionY }) => {
  const c = chunks.find((ch) => t >= ch.s - 0.05 && t < ch.e);
  if (!c) return null;
  const pIn = ease.outExpo(clamp01((t - c.s + 0.05) / 0.25));
  return (
    <div
      style={{
        position: "absolute", left: 60, right: 140, top: y, display: "flex", justifyContent: "center", flexWrap: "wrap",
        columnGap: 18, rowGap: 4, transform: `translateY(${(1 - pIn) * 24}px)`, opacity: pIn,
      }}
    >
      {c.words.map((w, i) => {
        const active = t >= w.s - 0.04;
        const tone = w.tone === "loss" ? color.loss : w.tone === "amber" ? color.amberHot : color.ink;
        return (
          <span
            key={i}
            style={{
              fontFamily: font.display, fontWeight: 800, fontSize: 66, lineHeight: 1.12, letterSpacing: "-0.01em",
              color: active ? tone : "rgba(243,241,236,0.38)",
              textShadow: "0 4px 22px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
              transform: `scale(${active ? 1 : 0.97})`,
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
