import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color } from "../../brand/tokens";
import { ease, lerp, useTime, windowAlpha } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DataRoom } from "../../engine/components/DataRoom";
import { Finish } from "../../engine/components/Finish";
import { OilCam, OilSurface } from "../../engine/three/OilSurface";
import { B, C, CAPTIONS, DURATION, wordAt } from "./config";
import { Brent, Hook } from "./scenes/Hook";
import { Freight } from "./scenes/Freight";
import { PriceChart } from "./scenes/PriceChart";
import { EndCard, Estimates, NextCrude, WhoPays } from "./scenes/Consequence";

const NEXT = wordAt("payoff", "What") - 0.15;

// Oil-surface camera keyframes: [time, height, pitch, yaw, exposure]
const OIL_KEYS: [number, number, number, number, number][] = [
  [0, 1.5, 0.24, -0.08, 0.4],
  [1.0, 1.3, 0.22, -0.05, 1.45],
  [B.hookLoss, 1.15, 0.2, 0.0, 1.45],
  [B.brent, 0.55, 0.09, -0.12, 1.8],
  [B.freight + 0.4, 0.42, 0.07, 0.08, 1.7],
  [NEXT, 0.95, 0.15, -0.05, 1.7],
  [B.cta + 0.8, 1.5, 0.26, 0.04, 1.2],
];
const oilAt = (t: number): { cam: OilCam; exposure: number } => {
  let i = 0;
  while (i < OIL_KEYS.length - 2 && t > OIL_KEYS[i + 1][0]) i++;
  const [t0, h0, p0, y0, e0] = OIL_KEYS[i];
  const [t1, h1, p1, y1, e1] = OIL_KEYS[i + 1];
  const u = ease.inOutCubic(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
  return { cam: { h: lerp(h0, h1, u), pitch: lerp(p0, p1, u), yaw: lerp(y0, y1, u) }, exposure: lerp(e0, e1, u) };
};

const decay = (t: number, at: number, rate: number) => (t >= at ? Math.exp(-(t - at) * rate) : 0);

export const FuelGapReel: React.FC = () => {
  const t = useTime();
  const oilA = Math.max(windowAlpha(t, -1, B.freight + 0.35, 0.01, 0.5), windowAlpha(t, NEXT - 0.1, B.cta + 0.7, 0.6, 0.6));
  const oil = oilAt(t);
  const redShift = Math.min(1, decay(t, C.loss34, 0) * (t < B.brent ? 1 : 0)) * Math.min(1, (t - C.loss34) * 4);
  const glow: [number, number, number] = [1.0, lerp(0.55, 0.22, redShift), lerp(0.16, 0.1, redShift)];
  const rippleT = t >= B.brent ? B.brent : C.loss34;
  const roomA = Math.max(windowAlpha(t, B.freight - 0.3, NEXT + 0.2, 0.5, 0.4), windowAlpha(t, B.cta - 0.1, DURATION + 1, 0.6, 0.1));

  const impacts: [number, number][] = [[C.open, 1], [C.loss34, 1], [C.same, 0.7], [C.jeff34, 0.5], [B.cta + 0.05, 0.5]];
  const shake = impacts.reduce((s, [at, k]) => s + decay(t, at, 9) * k, 0);
  const sx = Math.sin(t * 91) * shake * 9, sy = Math.cos(t * 73) * shake * 7;
  const flash = Math.max(decay(t, C.open, 7) * 0.5, decay(t, C.loss34, 10) * 0.45, decay(t, C.same, 9) * 0.3, decay(t, B.cta + 0.05, 8) * 0.2);

  const vis = (a: number, b: number) => t >= a && t < b;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(1.02)` }}>
        {oilA > 0.001 && (
          <OilSurface t={t} cam={oil.cam} exposure={oil.exposure} glow={glow} glowEl={0.1} ripple={t >= C.loss34 ? 1 : 0} rippleT={rippleT} fade={oilA} />
        )}
        {oilA > 0.001 && (
          <AbsoluteFill style={{ opacity: oilA, background: "linear-gradient(180deg, rgba(6,7,10,0.7) 0%, rgba(6,7,10,0.35) 30%, rgba(6,7,10,0) 52%)" }} />
        )}
        {roomA > 0.001 && <DataRoom t={t} opacity={roomA} tint={t > B.estimates - 0.3 && t < B.who ? color.loss : color.steel} />}

        {vis(0, B.brent + 0.05) && <Hook t={t} />}
        {vis(B.brent - 0.15, B.freight + 0.05) && <Brent t={t} />}
        {vis(B.freight - 0.1, B.may + 0.05) && <Freight t={t} />}
        {vis(B.may - 0.25, B.estimates + 0.15) && <PriceChart t={t} />}
        {vis(B.estimates - 0.15, B.who + 0.15) && <Estimates t={t} />}
        {vis(B.who - 0.4, NEXT + 0.35) && <WhoPays t={t} />}
        {vis(NEXT, B.cta + 0.35) && <NextCrude t={t} />}
        {vis(B.cta - 0.15, DURATION + 1) && <EndCard t={t} duration={DURATION} />}
      </AbsoluteFill>
      <Captions t={t} chunks={CAPTIONS} />
      <Finish progress={Math.min(1, t / DURATION)} flash={flash} showMark={t < B.cta - 0.2} />
      <Audio src={staticFile("fuel-gap/mix.wav")} />
    </AbsoluteFill>
  );
};
