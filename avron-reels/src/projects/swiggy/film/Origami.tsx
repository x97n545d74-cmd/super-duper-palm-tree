import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp } from "../../../engine/anim";
import { sans, serif } from "../look";

/*
 * Chapter card in a warm paper-craft style: a square of folded paper opens its four flaps one by one
 * (CSS 3D, no bounce), revealing the chapter number and title; a doodle icon and an underline draw in
 * with a pen stroke; then the paper lifts towards camera and dissolves into the next chapter's world.
 */
const PAPER = "#EFE6D6", PAPER_DARK = "#D9CDB8", INK = "#2B241C";
const SIZE = 380;

const DOODLES: Record<string, string> = {
  roads: "M -90 80 C -40 20 -10 0 0 -20 M 90 80 C 40 20 10 0 0 -20 M 0 -20 L 0 -80",
  board: "M -90 -60 H 90 V 60 H -90 Z M 0 -60 V 60 M -70 -20 H -20 M 20 -20 H 70 M -70 20 H -30 M 20 20 H 60",
  plate: "M -80 10 A 80 30 0 0 0 80 10 M -60 10 A 60 22 0 0 1 60 10 M 100 -60 L 100 40 M 92 -60 V -20 M 108 -60 V -20",
  book: "M 0 -50 C -40 -70 -80 -60 -90 -50 V 60 C -60 50 -30 50 0 65 C 30 50 60 50 90 60 V -50 C 80 -60 40 -70 0 -50 Z M 0 -50 V 65",
  calendar: "M -80 -60 H 80 V 70 H -80 Z M -80 -25 H 80 M -45 -80 V -45 M 45 -80 V -45 M -40 10 H -10 M 10 10 H 40 M -40 40 H -10",
  crown: "M -80 50 L -90 -40 L -40 0 L 0 -60 L 40 0 L 90 -40 L 80 50 Z M 10 -10 L -5 20 L 12 35",
  scope: "M -90 40 L 50 -40 L 70 -5 L -70 75 Z M 50 -40 L 90 -60 L 100 -40 L 70 -5 M -20 50 L -50 110 M 0 40 L 30 110",
};

export const OrigamiCard: React.FC<{ t: number; a: number; num: string; title: string; doodle: keyof typeof DOODLES; dur?: number }> = ({
  t, a, num, title, doodle, dur = 3.0,
}) => {
  const k = t - a;
  if (k < -0.05 || k > dur + 0.05) return null;
  const enter = ease.outCubic(clamp01(k / 0.35));
  const exit = ease.inCubic(clamp01((k - (dur - 0.55)) / 0.55));
  const flap = (i: number) => ease.inOutCubic(clamp01((k - 0.3 - i * 0.16) / 0.5)); // 0 folded → 1 open
  const draw = ease.inOutCubic(clamp01((k - 1.2) / 0.9));
  const fold = (p: number) => 180 * (1 - p);
  const shade = (p: number) => `brightness(${lerp(0.82, 1, p)})`;
  const tri = (style: React.CSSProperties, clip: string, p: number) => (
    <div style={{ position: "absolute", background: `linear-gradient(135deg, ${PAPER}, ${PAPER_DARK})`, clipPath: clip, filter: shade(p), backfaceVisibility: "visible", ...style }} />
  );
  return (
    <AbsoluteFill style={{ opacity: enter * (1 - exit) }}>
      {/* paper desk: warm light, fibre texture */}
      <AbsoluteFill style={{ background: `radial-gradient(90% 80% at 35% 30%, #F6EFE3 0%, ${PAPER} 45%, #CDBFA6 100%)` }} />
      <AbsoluteFill style={{ opacity: 0.25, backgroundImage: "repeating-linear-gradient(17deg, rgba(120,100,70,0.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(-23deg, rgba(120,100,70,0.05) 0 1px, transparent 1px 5px)" }} />
      <AbsoluteFill style={{ perspective: 1600, transform: `scale(${lerp(1, 1.6, exit)})` }}>
        <div style={{ position: "absolute", left: 960 - SIZE / 2, top: 430 - SIZE / 2, width: SIZE, height: SIZE, transformStyle: "preserve-3d",
          transform: `rotateX(${lerp(14, 6, enter)}deg) rotateZ(${lerp(-4, -1.5, enter)}deg)` }}>
          {/* inside of the sheet, with the chapter printed on it */}
          <div style={{ position: "absolute", inset: 0, background: PAPER, boxShadow: "0 40px 80px rgba(60,40,20,0.35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <svg width={260} height={200} viewBox="-130 -100 260 220" style={{ marginBottom: 10 }}>
              <path d={DOODLES[doodle]} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
            </svg>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.4em", color: "#8A7860", paddingLeft: "0.4em" }}>{num}</div>
          </div>
          {/* four flaps, folded over the centre, opening one by one */}
          {tri({ left: 0, top: -SIZE / 2, width: SIZE, height: SIZE / 2, transformOrigin: "50% 100%", transform: `rotateX(${-fold(flap(0))}deg)` }, "polygon(0 100%, 100% 100%, 50% 0)", flap(0))}
          {tri({ left: SIZE, top: 0, width: SIZE / 2, height: SIZE, transformOrigin: "0 50%", transform: `rotateY(${-fold(flap(1))}deg)` }, "polygon(0 0, 0 100%, 100% 50%)", flap(1))}
          {tri({ left: 0, top: SIZE, width: SIZE, height: SIZE / 2, transformOrigin: "50% 0", transform: `rotateX(${fold(flap(2))}deg)` }, "polygon(0 0, 100% 0, 50% 100%)", flap(2))}
          {tri({ left: -SIZE / 2, top: 0, width: SIZE / 2, height: SIZE, transformOrigin: "100% 50%", transform: `rotateY(${fold(flap(3))}deg)` }, "polygon(100% 0, 100% 100%, 0 50%)", flap(3))}
        </div>
      </AbsoluteFill>
      {/* the title, hand-underlined, below the paper */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", opacity: clamp01((k - 1.0) / 0.4) * (1 - exit) }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 92, color: INK }}>{title}</div>
        <svg width={520} height={30} viewBox="0 0 520 30" style={{ display: "block", margin: "6px auto 0" }}>
          <path d="M 10 18 C 120 6 260 26 510 12" fill="none" stroke="#C0612B" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
