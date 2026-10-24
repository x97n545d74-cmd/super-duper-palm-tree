import React from "react";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Label, SourceTag } from "../../../engine/components/Kinetic";
import { B, C } from "../config";

// Illustrative route (not to scale): Gulf -> India. P0 matches the Brent collapse point.
const P0: [number, number] = [250, 560], P1: [number, number] = [470, 400], P2: [number, number] = [640, 820], P3: [number, number] = [830, 680];
const bez = (u: number): [number, number] => {
  const a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, c = 3 * (1 - u) * u * u, d = u ** 3;
  return [a * P0[0] + b * P1[0] + c * P2[0] + d * P3[0], a * P0[1] + b * P1[1] + c * P2[1] + d * P3[1]];
};
const PATH = `M${P0} C${P1} ${P2} ${P3}`;
const LEN = 900;

/** Beat 4: freight x8 and its share of landed crude cost (Jefferies estimates). */
export const Freight: React.FC<{ t: number }> = ({ t }) => {
  const a = B.freight;
  const travel = prog(t, a - 0.1, 2.4, ease.inOutCubic);
  const [sx, sy] = bez(travel);
  const exitP = prog(t, B.may - 0.32, 0.32, ease.inCubic);
  const big = clamp01((t - C.freight8 + 0.12) / 0.3);
  const barP = prog(t, C.freight8 + 0.55, 0.8, ease.outExpo);
  const BAR_W = 760; // 0..30%
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: `polygon(0 0, ${100 - exitP * 140}% 0, ${100 - exitP * 140 - 40}% 100%, 0 100%)` }}>
      <Label text="Crude freight · Gulf → India" t={t} start={a + 0.1} style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }} />
      <svg width={1080} height={900} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <linearGradient id="trail" x1="0" x2="1">
            <stop offset="0" stopColor={color.amber} stopOpacity="0.1" />
            <stop offset="1" stopColor={color.amberHot} stopOpacity="1" />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <path d={PATH} fill="none" stroke={color.line} strokeWidth={2} strokeDasharray="4 10" />
        <path d={PATH} fill="none" stroke="url(#trail)" strokeWidth={5} strokeDasharray={LEN} strokeDashoffset={LEN * (1 - travel)} strokeLinecap="round" />
        <path d={PATH} fill="none" stroke={color.amber} strokeWidth={14} strokeDasharray={LEN} strokeDashoffset={LEN * (1 - travel)} opacity={0.25} filter="url(#glow)" />
        {/* flow particles along the lane */}
        {Array.from({ length: 16 }).map((_, i) => {
          const u = ((i / 16 + t * 0.22) % 1) * travel;
          const [x, y] = bez(u);
          return <circle key={i} cx={x} cy={y} r={2.4} fill={color.amberHot} opacity={0.5 * (1 - Math.abs(u - travel * 0.5) * 1.4)} />;
        })}
        {[P0, P3].map(([x, y], i) => (
          <g key={i} opacity={prog(t, a + i * 0.6, 0.4)}>
            <circle cx={x} cy={y} r={11} fill="none" stroke={color.steel} strokeWidth={2} />
            <circle cx={x} cy={y} r={4} fill={color.steel} />
          </g>
        ))}
        <circle cx={sx} cy={sy} r={13} fill={color.amberHot} filter="url(#glow)" />
        <circle cx={sx} cy={sy} r={7} fill="#fff" />
        <text x={P0[0]} y={P0[1] - 34} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={26} textAnchor="middle" opacity={prog(t, a, 0.4)}>GULF</text>
        <text x={P3[0]} y={P3[1] + 54} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={26} textAnchor="middle" opacity={prog(t, a + 0.6, 0.4)}>INDIA</text>
        <text x={540} y={880} fill={color.inkFaint} fontFamily="JetBrains Mono" fontSize={20} textAnchor="middle" opacity={prog(t, a + 0.8, 0.4)}>ILLUSTRATIVE ROUTE · NOT TO SCALE</text>
      </svg>

      <div style={{ position: "absolute", top: 905, left: 0, right: 0, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 28 }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 200, lineHeight: 1, letterSpacing: "-0.04em", color: color.amberHot,
          transform: `scale(${t < C.freight8 - 0.12 ? 0 : lerp(1.5, 1, ease.outBack(big))})`, textShadow: `0 0 60px ${color.amber}66` }}>
          ×8
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 40, lineHeight: 1.15, color: color.ink, opacity: prog(t, C.freight8 + 0.15, 0.4), width: 330 }}>
          freight rates vs pre-conflict
        </div>
      </div>

      <div style={{ position: "absolute", top: 1135, left: 160, width: BAR_W, opacity: prog(t, C.freight8 + 0.45, 0.3) }}>
        <div style={{ fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.12em", color: color.inkDim, textTransform: "uppercase", marginBottom: 16 }}>
          Freight share of landed crude cost
        </div>
        {[
          { k: "Before", v: 3, label: "~3%", tint: color.steel },
          { k: "Now", v: 25, label: "25%+", tint: color.amber },
        ].map((r, i) => (
          <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14 }}>
            <div style={{ width: 100, fontFamily: font.mono, fontSize: 24, color: color.inkDim }}>{r.k}</div>
            <div style={{ height: 34, width: (r.v / 30) * (BAR_W - 260) * prog(t, C.freight8 + 0.55 + i * 0.18, 0.8, ease.outExpo), minWidth: 6 * barP,
              background: `linear-gradient(90deg, ${r.tint}55, ${r.tint})`, borderRadius: 6, boxShadow: i ? `0 0 24px ${r.tint}66` : undefined }} />
            <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 32, color: i ? color.amberHot : color.ink, opacity: prog(t, C.freight8 + 0.9 + i * 0.18, 0.3) }}>{r.label}</div>
          </div>
        ))}
        <div style={{ marginTop: 12 }}>
          <SourceTag text="JEFFERIES VIA BUSINESS TODAY · 23 OCT 2026" t={t} start={C.freight8 + 1.0} estimate />
        </div>
      </div>
    </div>
  );
};
