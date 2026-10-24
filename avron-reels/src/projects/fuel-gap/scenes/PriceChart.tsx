import React from "react";
import { scaleLinear } from "d3-scale";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Label, SourceTag } from "../../../engine/components/Kinetic";
import { B, C } from "../config";

// Verified Delhi diesel RSP (₹/litre). Sources: sources.json C1, C2, C3; arithmetic D1.
const d = (m: number, day: number) => Date.UTC(2026, m - 1, day);
const PRE = { date: d(5, 12), v: 87.67 };
const STEPS = [
  { date: d(5, 15), v: 90.67, tick: "15 MAY" },
  { date: d(5, 19), v: 91.58, tick: "19" },
  { date: d(5, 23), v: 92.49, tick: "23" },
  { date: d(5, 25), v: 95.2, tick: "25" },
];
const OCT = { date: d(10, 23), v: 95.2 };

const X0 = 150, X1 = 900, Y0 = 1060, Y1 = 520;

/** Beats 5-6: four hikes in ten days, then five months at the same price. */
export const PriceChart: React.FC<{ t: number }> = ({ t }) => {
  const enter = prog(t, B.may - 0.2, 0.5);
  const exitP = prog(t, B.estimates - 0.3, 0.4, ease.inCubic);
  const z = prog(t, B.frozen + 0.05, 1.3, ease.inOutQuint); // pull back: May window -> May..Oct
  const xEnd = lerp(d(5, 27), d(10, 30), z);
  const x = scaleLinear().domain([d(5, 12), xEnd]).range([X0, X1]);
  const y = scaleLinear().domain([86, 97]).range([Y0, Y1]);

  // build the step path progressively
  const base = prog(t, B.may + 0.25, 0.7, ease.inOutCubic);
  let path = `M${x(PRE.date)},${y(PRE.v)}`;
  let prev = PRE.v;
  STEPS.forEach((s, k) => {
    const pk = prog(t, C.steps[k], 0.28, ease.outExpo);
    const hp = k === 0 ? base : prog(t, C.steps[k - 1] + 0.28, Math.max(0.05, C.steps[k] - C.steps[k - 1] - 0.3), ease.linear);
    const hx = lerp(x(k === 0 ? PRE.date : STEPS[k - 1].date), x(s.date), hp);
    if (k === 0 || prog(t, C.steps[k - 1], 0.28) >= 1) {
      path += ` L${hx},${y(prev)}`;
      if (pk > 0) path += ` L${hx},${y(lerp(prev, s.v, pk))}`;
    }
    if (pk >= 1) prev = s.v;
  });
  const flat = prog(t, B.frozen + 0.55, 1.0, ease.inOutCubic);
  const lastX = x(STEPS[3].date);
  const flatX = lerp(lastX, x(OCT.date), flat);
  const sameP = clamp01((t - C.same + 0.05) / 0.25);
  const sameFlash = t >= C.same ? Math.exp(-(t - C.same) * 3) : 0;
  const bracket = prog(t, C.diesel750 - 0.1, 0.5);
  const tiltX = lerp(16, 6, prog(t, B.may, 3)) + z * -4;
  const tiltY = lerp(-12, 3, prog(t, B.may, 4));

  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), filter: `blur(${exitP * 10}px)` }}>
      <Label text="Delhi diesel · ₹ per litre" t={t} start={B.may + 0.1} style={{ position: "absolute", top: 300, left: X0 }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1800, perspectiveOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(${-z * 40}px)` }}>
          <svg width={1080} height={1300} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <defs>
              <filter id="lg"><feGaussianBlur stdDeviation="7" /></filter>
              <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor={color.amber} stopOpacity="0.28" />
                <stop offset="1" stopColor={color.amber} stopOpacity="0" />
              </linearGradient>
            </defs>
            {[88, 90, 92, 94, 96].map((v) => (
              <g key={v} opacity={0.9 * enter}>
                <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke={color.line} strokeWidth={1.5} />
                <text x={X0 - 18} y={y(v) + 8} fill={color.inkFaint} fontFamily="JetBrains Mono" fontSize={22} textAnchor="end">{v}</text>
              </g>
            ))}
            {/* May ticks fade during the pull-back */}
            {STEPS.map((s, k) => (
              <text key={s.tick} x={x(s.date)} y={Y0 + 44} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={22} textAnchor="middle"
                opacity={prog(t, C.steps[k], 0.3) * (1 - z)}>{s.tick}</text>
            ))}
            <text x={x(d(5, 18))} y={Y0 + 44} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={22} textAnchor="middle" opacity={z}>MAY</text>
            <text x={x(OCT.date)} y={Y0 + 44} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={22} textAnchor="middle" opacity={flat}>23 OCT</text>

            <path d={path} fill="none" stroke={color.amber} strokeWidth={14} opacity={0.35} filter="url(#lg)" />
            <path d={path} fill="none" stroke={sameFlash > 0.05 ? "#fff" : color.amberHot} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
            {/* value labels at each step */}
            {STEPS.map((s, k) => {
              const p = prog(t, C.steps[k] + 0.12, 0.3);
              return (
                <text key={k} x={x(s.date) + (k === 3 ? 18 : -12)} y={y(s.v) - 20} fill={k === 3 ? color.amberHot : color.ink} fontFamily="JetBrains Mono" fontWeight={700}
                  fontSize={k === 3 ? 34 : 26} textAnchor={k === 3 ? "start" : "end"} opacity={p * (k === 3 ? 1 : 1 - z)}>
                  {s.v.toFixed(2)}
                </text>
              );
            })}
            <text x={x(PRE.date) + 6} y={y(PRE.v) + 44} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={26} opacity={base * (1 - z)}>87.67</text>

            {/* 25 May -> 23 Oct: same verified level at both dates (dashed: endpoints verified) */}
            {flat > 0 && (
              <>
                <line x1={lastX} x2={flatX} y1={y(95.2)} y2={y(95.2)} stroke={sameFlash > 0.05 ? "#fff" : color.amberHot} strokeWidth={5} strokeDasharray="14 10" />
                <line x1={lastX} x2={flatX} y1={y(95.2)} y2={y(95.2)} stroke={color.amber} strokeWidth={16} opacity={0.2 + sameFlash * 0.6} filter="url(#lg)" />
                <circle cx={flatX} cy={y(95.2)} r={10} fill={color.amberHot} opacity={flat >= 1 ? 1 : 0} />
                <rect x={lastX} y={y(95.2)} width={Math.max(0, flatX - lastX)} height={Y0 - y(95.2)} fill="url(#fade)" opacity={0.6} />
              </>
            )}
            {/* bracket: +₹7.53 over the May hikes */}
            <g opacity={bracket * (1 - z)}>
              <path d={`M${X1 + 10},${y(87.67)} h14 V${y(95.2)} h-14`} fill="none" stroke={color.amberHot} strokeWidth={3} />
            </g>
          </svg>
        </div>
      </div>
      <div style={{ position: "absolute", top: 400, left: X0, opacity: bracket * (1 - z), transform: `translateY(${(1 - bracket) * 16}px)` }}>
        <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 52, color: color.amberHot }}>+₹7.53</span>
        <span style={{ fontFamily: font.text, fontWeight: 600, fontSize: 32, color: color.inkDim, marginLeft: 16 }}>+8.6% in 10 days</span>
      </div>
      {/* the freeze */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: sameP,
        transform: `scale(${lerp(1.25, 1, ease.outExpo(sameP))})`, letterSpacing: `${lerp(0.3, 0.02, ease.outExpo(sameP))}em` }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 132, color: color.ink, lineHeight: 1 }}>SAME</div>
        <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 80, color: color.amberHot, marginTop: 10 }}>₹95.20</div>
        <div style={{ fontFamily: font.mono, fontSize: 28, color: color.inkDim, marginTop: 14, letterSpacing: "0.1em" }}>25 MAY · 23 OCT</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, display: "flex", justifyContent: "center", gap: 16 }}>
        <SourceTag text="PPAC · 23 OCT 2026" t={t} start={C.same + 0.3} />
        <SourceTag text="AVRON INTERPRETATION" t={t} start={C.gapLands} style={{ color: color.steel }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, display: "flex", justifyContent: "center", opacity: prog(t, B.may + 0.8, 0.4) * (1 - prog(t, C.same, 0.3)) }}>
        <SourceTag text="DELHI RSP · AIR / PPAC · MAY 2026" t={t} start={B.may + 0.8} />
      </div>
    </div>
  );
};
