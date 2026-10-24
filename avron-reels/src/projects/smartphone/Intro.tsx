import React from "react";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, rand } from "../../engine/anim";

/*
 * Slow-reveal logo transition (user prompt): draw the mark as a wireframe, fly in faceted low-poly
 * shards one by one until they assemble it, bring in the app-icon background, type out the brand name.
 * The AVRON mark here is a faceted "A" built from 9 triangles (placeholder until the user's logo exists).
 */
const V = {
  A0: [0, -170], L: [-165, 150], R: [165, 150], Li: [-75, 150], Ri: [75, 150],
  N: [0, 40], C1: [0, -60], C2: [-35, 10], C3: [35, 10],
} as const;
type K = keyof typeof V;
const FACES: [K, K, K][] = [
  ["A0", "C2", "L"], ["A0", "C1", "C2"], ["A0", "C1", "C3"], ["A0", "C3", "R"], ["C2", "C3", "N"],
  ["L", "C2", "Li"], ["C2", "N", "Li"], ["R", "C3", "Ri"], ["C3", "N", "Ri"],
];
// fly-in order: apex first, then down the legs
const ORDER = [1, 2, 0, 3, 4, 6, 8, 5, 7];
// facet shading: amber family, lit from the top left
const SHADE = ["#F2B04A", "#FFD08A", "#E9A23B", "#C98522", "#F7BF63", "#D99231", "#B87418", "#E5A043", "#A9680F"];
const EDGES = Array.from(new Set(FACES.flatMap(([a, b, c]) => [[a, b], [b, c], [a, c]].map((e) => e.sort().join("-")))));

const W0 = 0.0, SH0 = 0.42, SH_DT = 0.09, SH_DUR = 0.48, ICON = 1.42, TYPE = 1.78, OUT = 2.22;
export const INTRO = 2.5;

export const Intro: React.FC<{ t: number }> = ({ t }) => {
  const wire = ease.inOutCubic(clamp01((t - W0) / 0.55));
  const wireOut = ease.inCubic(clamp01((t - 1.25) / 0.3));
  const icon = ease.outExpo(clamp01((t - ICON) / 0.5));
  const exit = ease.inCubic(clamp01((t - OUT) / 0.28));
  const name = "AVRON";
  const typed = Math.min(name.length, Math.floor(Math.max(0, t - TYPE) / 0.09) + (t >= TYPE ? 1 : 0));
  const caret = t >= TYPE - 0.2 && t < OUT && Math.floor(t * 4) % 2 === 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: color.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 40% at 50% 44%, #15120C 0%, transparent 70%)", opacity: icon }} />
      {/* the whole lockup pushes toward camera on the way out (cut into the clip on the beat) */}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.015 * t + 0.5 * exit})`, opacity: 1 - exit, transformOrigin: "50% 44%" }}>
        {/* app-icon tile */}
        <div style={{
          position: "absolute", left: 540 - 260, top: 845 - 260, width: 520, height: 520, borderRadius: 118,
          background: "linear-gradient(160deg, #1B1D23 0%, #0D0E12 100%)", border: "1.5px solid rgba(243,241,236,0.12)",
          boxShadow: "0 60px 120px rgba(0,0,0,0.6)", opacity: icon, transform: `scale(${lerp(1.18, 1, icon)})`,
        }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(540 845) scale(1.05)">
            {FACES.map((f, i) => {
              const k = ORDER.indexOf(i);
              const p = ease.outExpo(clamp01((t - SH0 - k * SH_DT) / SH_DUR));
              const ang = rand(i * 7.3) * Math.PI * 2;
              const dist = 900 + rand(i * 3.1) * 400;
              const dx = Math.cos(ang) * dist * (1 - p), dy = Math.sin(ang) * dist * (1 - p);
              const rot = (rand(i * 5.9) - 0.5) * 240 * (1 - p);
              const [a, b, c] = f.map((v) => V[v]);
              const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
              return (
                <polygon key={i} points={[a, b, c].map((q) => q.join(",")).join(" ")} fill={SHADE[i]}
                  stroke="rgba(11,11,13,0.35)" strokeWidth={1.5} strokeLinejoin="round"
                  opacity={t >= SH0 + k * SH_DT ? Math.min(1, p * 3) : 0}
                  transform={`translate(${dx} ${dy}) rotate(${rot} ${cx} ${cy})`} />
              );
            })}
            {/* wireframe, drawn first, fades once the shards cover it */}
            <g opacity={1 - wireOut}>
              {EDGES.map((e, i) => {
                const [a, b] = e.split("-").map((k) => V[k as K]);
                const len = Math.hypot(a[0] - b[0], a[1] - b[1]);
                const p = clamp01(wire * 1.6 - i * 0.04);
                return <line key={e} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={color.ink} strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
              })}
              {(Object.keys(V) as K[]).map((k, i) => (
                <circle key={k} cx={V[k][0]} cy={V[k][1]} r={5} fill={color.ink} opacity={clamp01(wire * 2 - i * 0.08)} />
              ))}
            </g>
          </g>
        </svg>
        {/* brand name types out */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 112, letterSpacing: "0.32em", color: color.ink, paddingLeft: "0.32em" }}>
          {name.slice(0, typed)}<span style={{ display: "inline-block", width: 6, height: 96, marginLeft: 10, background: color.amber, verticalAlign: "-10%", opacity: caret ? 1 : 0 }} />
        </div>
      </div>
    </div>
  );
};
