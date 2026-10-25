import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character, Key } from "../ep01/Character";
import { Chacha } from "./Chacha";
import { color, font } from "../../brand/tokens";

/** Cast line-up still, used to approve the new character next to the original two. */
const IDLE: Key[] = [[0, { mouth: "smile", mouthAmt: 0.7 }]];
const CH: Key[] = [[0, { mouth: "talk", browL: 8, browR: 8, eye: 1 }]];
export const LineUp: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const fake = Array.from({ length: 200 }, (_, i) => 0.5 + 0.4 * Math.sin(i));
  return (
    <AbsoluteFill style={{ background: color.bg }}>
      <div style={{ position: "absolute", top: 260, left: 0, right: 0, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 64, color: color.ink }}>The cast</div>
      <Character who="boy" t={t} frame={frame} keys={IDLE} x={200} y={1500} k={0.36} />
      <Chacha t={t} frame={frame} keys={CH} x={540} y={1500} k={0.36} mouth={fake} />
      <Character who="girl" t={t} frame={frame} keys={IDLE} x={880} y={1500} k={0.36} body="ep01/chars/girl_body_plain.png" />
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", justifyContent: "space-around", fontFamily: font.display, fontWeight: 800, fontSize: 34, color: color.inkDim }}>
        <span>Boy</span><span style={{ color: color.amberHot }}>Tips wale Chacha</span><span>Girl</span>
      </div>
    </AbsoluteFill>
  );
};
