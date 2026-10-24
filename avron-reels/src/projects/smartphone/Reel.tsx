import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DevanagariFonts } from "../../engine/components/Fonts";
import { Finish } from "../../engine/components/Finish";
import { CAPTIONS, CUE, DURATION, S } from "./config";
import { Budget, Cycle, End, Memory, Opening, Split, Survey } from "./scenes";

/** Slow continuous push inside every graphics scene (same camera language as earlier reels). */
const Drift: React.FC<{ t: number; w: readonly [number, number]; children: React.ReactNode }> = ({ t, w, children }) => {
  const k = Math.max(0, t - w[0]);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.006 * k}) translateY(${-2.2 * k}px)`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

export const SmartphoneReel: React.FC = () => {
  const t = useTime();
  const on = (w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;
  // white flash on the hard cut from the clip into graphics, and on the end card
  const flash = Math.max(0, 1 - Math.abs(t - CUE.clipEnd) / 0.12) * 0.35 + Math.max(0, 1 - Math.abs(t - CUE.ship) / 0.1) * 0.25;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <DevanagariFonts />
      {on(S.clip) && <Opening t={t} />}
      {on(S.budget) && <Drift t={t} w={S.budget}><Budget t={t} /></Drift>}
      {on(S.memory) && <Drift t={t} w={S.memory}><Memory t={t} /></Drift>}
      {on(S.cycle) && <Drift t={t} w={S.cycle}><Cycle t={t} /></Drift>}
      {on(S.survey) && <Drift t={t} w={S.survey}><Survey t={t} /></Drift>}
      {on(S.split) && <Drift t={t} w={S.split}><Split t={t} /></Drift>}
      {on(S.end, 0.1) && <End t={t} duration={DURATION} />}
      {t >= S.budget[0] && t < S.end[0] && <Captions t={t} chunks={CAPTIONS} family={font.devaDisplay} size={60} y={1300} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t < S.end[0] - 0.2} flash={flash} />
      <Audio src={staticFile("smartphone/mix.wav")} />
    </AbsoluteFill>
  );
};
