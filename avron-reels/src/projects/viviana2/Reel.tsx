import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DevanagariFonts } from "../../engine/components/Fonts";
import { Finish } from "../../engine/components/Finish";
import { B, CAPTIONS, DURATION, S } from "./config";
import { Bets, Close, End, Hook, Orders, RelatedParty, Target, Why, Work } from "./scenes";

/** Same camera language as Part 1: a slow continuous push inside every scene. */
const Drift: React.FC<{ t: number; w: readonly [number, number]; children: React.ReactNode }> = ({ t, w, children }) => {
  const k = Math.max(0, t - w[0]);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.006 * k}) translateY(${-2.2 * k}px)`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

export const Viviana2Reel: React.FC = () => {
  const t = useTime();
  const on = (w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <DevanagariFonts />
      {on(S.hook) && <Drift t={t} w={S.hook}><Hook t={t} /></Drift>}
      {on(S.orders) && <Drift t={t} w={S.orders}><Orders t={t} /></Drift>}
      {on(S.work, 0.15) && <Drift t={t} w={S.work}><Work t={t} /></Drift>}
      {on(S.why) && <Drift t={t} w={S.why}><Why t={t} /></Drift>}
      {on(S.bets) && <Drift t={t} w={S.bets}><Bets t={t} /></Drift>}
      {on(S.rp) && <Drift t={t} w={S.rp}><RelatedParty t={t} /></Drift>}
      {on(S.target) && <Drift t={t} w={S.target}><Target t={t} /></Drift>}
      {on(S.close) && <Drift t={t} w={S.close}><Close t={t} /></Drift>}
      {on(S.end, 0.1) && <Drift t={t} w={S.end}><End t={t} duration={DURATION} /></Drift>}
      {t >= B("p1_orders") - 0.05 && t < B("p8_avron") && <Captions t={t} chunks={CAPTIONS} family={font.devaDisplay} size={60} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t < B("p8_avron") - 0.2} />
      <Audio src={staticFile("viviana2/mix.wav")} />
    </AbsoluteFill>
  );
};
