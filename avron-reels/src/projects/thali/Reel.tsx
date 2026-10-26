import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { Finish } from "../../engine/components/Finish";
import { CAPTIONS, DURATION, S } from "./config";
import { Cpi, Cta, End, Food, Hook, Proj, Rbi, Real, Split, ThaliShot, Veg } from "./scenes";

const on = (t: number, w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;

/** One camera language: a slow continuous push inside every shot, reset on each push cut. */
const SHOTS = [S.hook, S.thali, S.cpi, S.food, S.veg, S.split, S.rbi, S.proj, S.real, S.cta, S.end].map((w) => w[0]);
const Push: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const a = Math.max(...SHOTS.filter((x) => x <= t));
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.004 * (t - a)})`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

/** Reads time itself so CameraMotionBlur can sample it at sub-frame offsets. */
const Graphics: React.FC = () => {
  const t = useTime();
  return (
    <Push t={t}>
      {on(t, S.hook) && <Hook t={t} />}
      {on(t, S.thali) && <ThaliShot t={t} />}
      {on(t, S.cpi) && <Cpi t={t} />}
      {on(t, S.food) && <Food t={t} />}
      {on(t, S.veg) && <Veg t={t} />}
      {on(t, S.split) && <Split t={t} />}
      {on(t, S.rbi) && <Rbi t={t} />}
      {on(t, S.proj) && <Proj t={t} />}
      {on(t, S.real) && <Real t={t} />}
      {on(t, S.cta) && <Cta t={t} />}
      {on(t, S.end) && <End t={t} duration={DURATION} />}
    </Push>
  );
};

export const ThaliReel: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: "#070B16", overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <Graphics />
      </CameraMotionBlur>
      {t < S.cta[0] && <Captions t={t} chunks={CAPTIONS} family={font.display} size={56} y={1330} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t < S.end[0] - 0.2} />
      <Audio src={staticFile("thali/mix.wav")} />
    </AbsoluteFill>
  );
};
