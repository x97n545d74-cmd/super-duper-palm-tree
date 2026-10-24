import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { Finish } from "../../engine/components/Finish";
import { CAPTIONS, DURATION, S, SHOW_CAPTIONS } from "./config";
import { Intro } from "./Intro";
import { Budget, Cycle, End, Memory, Opening, Split, Survey } from "./scenes";

const on = (t: number, w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;

/** One camera language for the graphics: a slow continuous push across every shot. */
const SHOTS = [S.budget[0], S.memory[0], S.cycle[0], S.survey[0], S.split[0], S.end[0]];
const Push: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const a = Math.max(...SHOTS.filter((x) => x <= t));
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.004 * (t - a)})`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

/** Graphics section. Reads time itself so CameraMotionBlur can sample it at sub-frame offsets. */
const Graphics: React.FC = () => {
  const t = useTime();
  if (t < S.budget[0]) return null;
  return (
    <Push t={t}>
      {on(t, S.budget) && <Budget t={t} />}
      {on(t, S.memory) && <Memory t={t} />}
      {on(t, S.cycle) && <Cycle t={t} />}
      {on(t, S.survey) && <Survey t={t} />}
      {on(t, S.split) && <Split t={t} />}
      {on(t, S.end) && <End t={t} duration={DURATION} />}
    </Push>
  );
};

export const SmartphoneReel: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      {on(t, S.intro) && <Intro t={t} />}
      {on(t, S.clip) && (
        <Sequence from={Math.round(S.clip[0] * 30)}>
          <Opening t={t - S.clip[0]} />
        </Sequence>
      )}
      {t >= S.budget[0] - 0.05 && (
        <CameraMotionBlur shutterAngle={180} samples={6}>
          <Graphics />
        </CameraMotionBlur>
      )}
      {SHOW_CAPTIONS && t >= S.budget[0] && t < S.end[0] && <Captions t={t} chunks={CAPTIONS} family={font.display} size={56} y={1330} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t >= S.clip[0] && t < S.end[0] - 0.2} />
      <Audio src={staticFile("smartphone/mix.wav")} />
    </AbsoluteFill>
  );
};
