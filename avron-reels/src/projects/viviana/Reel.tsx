import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { DevanagariFonts } from "../../engine/components/Fonts";
import { Finish } from "../../engine/components/Finish";
import { B, CAPTIONS, DURATION, S } from "./config";
import { Cash, End, Hook, Mgmt, Order, UTurn, Watch, Weekend, Who } from "./scenes";

export const VivianaReel: React.FC = () => {
  const t = useTime();
  const on = (w: readonly [number, number], pre = 0) => t >= w[0] - pre && t < w[1] + 0.05;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <DevanagariFonts />
      {on(S.hook) && <Hook t={t} />}
      {on(S.weekend) && <Weekend t={t} />}
      {on(S.uturn) && <UTurn t={t} />}
      {on(S.who, 0.2) && <Who t={t} />}
      {on(S.cash) && <Cash t={t} />}
      {on(S.order) && <Order t={t} />}
      {on(S.mgmt) && <Mgmt t={t} />}
      {on(S.watch) && <Watch t={t} />}
      {on(S.end, 0.1) && <End t={t} duration={DURATION} />}
      {t < B("b9_avron") && <Captions t={t} chunks={CAPTIONS} family={font.devaDisplay} size={60} />}
      <Finish progress={Math.min(1, t / DURATION)} showMark={t < B("b9_avron") - 0.2} />
      <Audio src={staticFile("viviana/mix.wav")} />
    </AbsoluteFill>
  );
};
