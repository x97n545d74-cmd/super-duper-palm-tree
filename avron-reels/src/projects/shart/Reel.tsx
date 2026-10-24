import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DevanagariFonts } from "../../engine/components/Fonts";
import { Finish } from "../../engine/components/Finish";
import { C, CAPTIONS, DURATION, S } from "./config";
import { Exterior, Reveal2029 } from "./scenes/Exterior";
import { Choice, Room } from "./scenes/Room";
import { Clause, Market, Omc, Promise, Shock } from "./scenes/Data";
import { Bill, End } from "./scenes/Close";

const decay = (t: number, at: number, rate: number) => (t >= at ? Math.exp(-(t - at) * rate) : 0);

export const ShartReel: React.FC = () => {
  const t = useTime();
  const on = (w: readonly [number, number]) => t >= w[0] && t < w[1];
  const impacts: [number, number][] = [[C.date, 0.9], [C.loss34, 1], [C.gos, 0.6], [C.y2029, 0.8]];
  const shake = impacts.reduce((s, [a, k]) => s + decay(t, a, 8) * k, 0);
  const flash = Math.max(decay(t, C.loss34, 12) * 0.25, decay(t, C.y2029, 6) * 0.18);
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <DevanagariFonts />
      <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 87) * shake * 7}px, ${Math.cos(t * 71) * shake * 6}px) scale(1.015)` }}>
        {on(S.exterior) && <Exterior t={t} />}
        {on(S.choice) && <Choice t={t} />}
        {on(S.room) && <Room t={t} />}
        {on(S.market) && <Market t={t} />}
        {on(S.omc) && <Omc t={t} />}
        {on(S.promise) && <Promise t={t} />}
        {on(S.clause) && <Clause t={t} />}
        {on(S.shock) && <Shock t={t} />}
        {on(S.y2029) && <Reveal2029 t={t} />}
        {on(S.bill) && <Bill t={t} />}
        {on(S.end) && <End t={t} duration={DURATION} />}
      </AbsoluteFill>
      <Captions t={t} chunks={CAPTIONS} family={font.devaDisplay} size={60} />
      <Finish progress={Math.min(1, t / DURATION)} flash={flash} showMark={t < C.cta - 0.3} />
      <Audio src={staticFile("shart/mix.wav")} />
    </AbsoluteFill>
  );
};
