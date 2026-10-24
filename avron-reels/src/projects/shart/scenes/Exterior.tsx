import React from "react";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Label, SourceTag, SweepText } from "../../../engine/components/Kinetic";
import { PhotoPlate, Rain, Splashes } from "../../../engine/components/Weather";
import { ShaderPlane, STORM_FRAG } from "../../../engine/three/ShaderPlane";
import { at, C, S } from "../config";

/** Lightning envelope: a double flicker. */
const strike = (t: number, t0: number) => {
  const d = t - t0;
  if (d < 0 || d > 0.6) return 0;
  return Math.exp(-d * 18) + 0.7 * Math.exp(-Math.max(0, d - 0.14) * 22) * (d > 0.14 ? 1 : 0);
};

/** Shot 1: Raisina Hill under a storm. Real photograph composited into CG sky, wet ground and rain. */
export const Exterior: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.exterior;
  const flash = Math.min(1, strike(t, 0.02) + strike(t, C.crude122 + 0.05) * 0.8);
  const push = prog(t, a, b - a + 1.5, ease.inOutCubic);
  const exitP = prog(t, b - 0.55, 0.55, ease.inCubic);
  const grade = "hue-rotate(-52deg) saturate(0.55) contrast(1.18) brightness(0.78)";
  const y70 = at("b1_date", "$70"), y122 = at("b1_date", "$122.");
  const v = t < y122 ? 70 : lerp(70, 122, ease.outExpo(clamp01((t - y122) / 0.7)));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exitP, background: "#05070b" }}>
      {/* camera: slow push-in and slight tilt up, the real plate leads */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1.02 + push * 0.09}) translateY(${push * 22}px)`, transformOrigin: "50% 48%" }}>
        <ShaderPlane frag={STORM_FRAG} scale={0.4}
          u={{ uTime: t, uFlash: flash, uHorizon: 0.47, uCity: [0.32, 0.27, 0.42], uSky: [0.05, 0.065, 0.09] }} />
        <PhotoPlate src="shart/raisina_storm.jpg" t={t} y={600} height={563} zoom={1.12} driftX={-push * 24} grade={grade} flash={flash * 0.5} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "linear-gradient(180deg, rgba(5,7,11,0) 0%, rgba(5,7,11,0.85) 55%)" }} />
        <Splashes t={t} top={1180} bottom={1880} n={46} />
      </div>
      <Rain t={t} intensity={0.9} wind={0.16} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(190,210,255,${flash * 0.18})`, mixBlendMode: "screen" }} />

      {/* typography: date stamp, then the crude move */}
      <div style={{ position: "absolute", top: 280, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: font.devaSerif, fontWeight: 800, fontSize: 92, color: color.goldHot, letterSpacing: "0.02em",
          opacity: prog(t, C.date - 0.1, 0.35), transform: `translateY(${(1 - prog(t, C.date - 0.1, 0.6, ease.outExpo)) * 30}px)`,
          textShadow: "0 6px 40px rgba(0,0,0,0.8)" }}>
          27 मार्च 2026
        </div>
        <Label text="Crude oil · one month" t={t} start={y70 - 0.6} style={{ marginTop: 26 }} tint={color.steel} />
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26, opacity: prog(t, y70 - 0.1, 0.3) }}>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 84, color: color.inkDim }}>$70</span>
          <span style={{ fontFamily: font.display, fontSize: 64, color: color.inkFaint, opacity: prog(t, y122 - 0.3, 0.3) }}>→</span>
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em", color: t >= y122 ? "#FF5E57" : color.ink,
            opacity: prog(t, y122 - 0.15, 0.2), textShadow: t >= y122 ? "0 0 50px rgba(255,80,70,0.45)" : "none" }}>
            ${Math.round(v)}
          </span>
        </div>
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <SourceTag text="PIB · MoPNG · 27 MAR 2026" t={t} start={y122 + 0.3} />
        </div>
      </div>
    </div>
  );
};

/** Shot 9: 2029. North Block at night, near-black grade, gold timeline and the reveal. */
export const Reveal2029: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.y2029;
  const enter = prog(t, a, 0.8, ease.inOutCubic);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const land = prog(t, C.y2029 - 0.1, 0.9, ease.outExpo);
  const dim = 1 - 0.55 * prog(t, C.y2029 - 0.2, 0.8);
  const flash = strike(t, a + 0.45) * 0.6;
  const line = prog(t, a + 0.3, 1.6, ease.inOutCubic);
  const marks = [
    { x: 170, label: "MAR 2026", sub: "Global Oil Shock", c: "#FF5E57", t0: a + 0.6 },
    { x: 540, label: "2029", sub: "Lok Sabha due", c: color.goldHot, t0: C.y2029 - 0.1 },
    { x: 910, label: "31 MAR 2031", sub: "Debt target", c: color.gold, t0: C.y2029 + 0.7 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), background: "#030305" }}>
      <div style={{ position: "absolute", inset: 0, opacity: dim, transform: `scale(${1.04 + (t - a) * 0.012})`, transformOrigin: "50% 40%" }}>
        <ShaderPlane frag={STORM_FRAG} scale={0.4} u={{ uTime: t + 20, uFlash: flash, uHorizon: 0.5, uCity: [0.35, 0.24, 0.1], uSky: [0.03, 0.035, 0.05] }} />
        <PhotoPlate src="shart/north_block.jpg" t={t} y={560} height={635} zoom={1.1} driftX={(t - a) * -6}
          grade="saturate(0.85) contrast(1.15) brightness(0.62) sepia(0.15)" flash={flash * 0.3} />
      </div>
      <Rain t={t} intensity={0.45} wind={0.12} />
      {/* gold "2029" */}
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center", opacity: land,
        transform: `translateY(${(1 - land) * 40}px) scale(${lerp(1.12, 1, land)})`, letterSpacing: `${lerp(0.2, -0.02, land)}em` }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 280, lineHeight: 1,
          background: "linear-gradient(180deg, #FFF1C9 0%, #E8C27A 45%, #A57B32 100%)", WebkitBackgroundClip: "text", color: "transparent",
          filter: "drop-shadow(0 10px 40px rgba(201,164,92,0.35))" }}>
          <SweepText text="2029" t={t} start={C.y2029 + 0.45} dur={1.2} />
        </div>
        <div style={{ fontFamily: font.deva, fontWeight: 600, fontSize: 40, color: color.inkDim, marginTop: 10, opacity: prog(t, C.y2029 + 0.3, 0.5) }}>
          अगला Lok Sabha चुनाव · due
        </div>
      </div>
      {/* timeline */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1215 }}>
        <svg width={1080} height={160} style={{ overflow: "visible" }}>
          <line x1={110} x2={110 + 860 * line} y1={40} y2={40} stroke={color.gold} strokeWidth={3} />
          <line x1={110} x2={110 + 860 * line} y1={40} y2={40} stroke={color.gold} strokeWidth={12} opacity={0.18} />
          {marks.map((m) => {
            const p = prog(t, m.t0, 0.4);
            return (
              <g key={m.label} opacity={p}>
                <circle cx={m.x} cy={40} r={9 + p * 3} fill={m.c} />
                <text x={m.x} y={92} fill={m.c} fontFamily="Inter" fontWeight={700} fontSize={26} textAnchor="middle" letterSpacing="2">{m.label}</text>
                <text x={m.x} y={124} fill={color.inkDim} fontFamily="Inter" fontSize={22} textAnchor="middle">{m.sub}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center" }}>
        <SourceTag text="ART. 83(2) · 18TH LOK SABHA FROM 24 JUN 2024" t={t} start={C.y2029 + 0.9} style={{ fontSize: 20 }} />
      </div>
    </div>
  );
};
