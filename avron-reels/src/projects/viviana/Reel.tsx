import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DevanagariFonts } from "../../engine/components/Fonts";
import { Finish } from "../../engine/components/Finish";
import { B, CAPTIONS, DURATION, S } from "./config";
import { Cash, End, Hook, Mgmt, Order, UTurn, Watch, Weekend, Who } from "./scenes";

/** One camera language for the whole reel: a slow continuous push inside every scene. */
const Drift: React.FC<{ t: number; w: readonly [number, number]; children: React.ReactNode }> = ({ t, w, children }) => {
  const k = Math.max(0, t - w[0]);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.006 * k}) translateY(${-2.2 * k}px)`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

export const VivianaReel: React.FC = () => {
  const t = useTime();
  const on = (w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <DevanagariFonts />
      {on(S.hook) && <Drift t={t} w={S.hook}><Hook t={t} /></Drift>}
      {on(S.weekend) && <Drift t={t} w={S.weekend}><Weekend t={t} /></Drift>}
      {on(S.uturn) && <Drift t={t} w={S.uturn}><UTurn t={t} /></Drift>}
      {on(S.who, 0.2) && <Drift t={t} w={S.who}><Who t={t} /></Drift>}
      {on(S.cash) && <Drift t={t} w={S.cash}><Cash t={t} /></Drift>}
      {on(S.order) && <Drift t={t} w={S.order}><Order t={t} /></Drift>}
      {on(S.mgmt) && <Drift t={t} w={S.mgmt}><Mgmt t={t} /></Drift>}
      {on(S.watch) && <Drift t={t} w={S.watch}><Watch t={t} /></Drift>}
      {on(S.end, 0.1) && <Drift t={t} w={S.end}><End t={t} duration={DURATION} /></Drift>}
      {t < B("b9_avron") && <Captions t={t} chunks={CAPTIONS} family={font.devaDisplay} size={60} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t < B("b9_avron") - 0.2} />
      <Audio src={staticFile("viviana/mix.wav")} />
    </AbsoluteFill>
  );
};
