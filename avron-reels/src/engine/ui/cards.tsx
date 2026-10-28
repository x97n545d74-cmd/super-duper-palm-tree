import React from "react";
import { clamp01, lerp } from "../anim";
import { curve, shape, ui } from "../../brand/ui";

/*
 * AVRON card moves (brand v2 kit, 2026-10-28), rebuilt from the user's three reference clips
 * (references/motion/README.md, "Brand v2 taste references"):
 *  - Card3D: a physical card with thickness, light falloff and a sheen that sweeps as it turns (ref: card flip)
 *  - CardWheel: tall cards on a big arc that turns like a wheel and lands one card on top (ref: card fan)
 *  - Cable + Puck + Slab: a pulse travels down a cable from a pressed button, the slab swells with each pulse,
 *    then splits into pieces that settle into a row (ref: 3D money button). The cause → effect move.
 * All are pure functions of time; 3D is real CSS 3D (perspective + preserve-3d).
 */

/* ------------------------------------------------------------------ Card3D */

export type Face = React.ReactNode;
/**
 * A card in 3D. rotY/rotX in degrees; front shows for |rotY| < 90, back past it.
 * Thickness is built from stacked edge layers so the card reads as an object when it turns edge-on.
 */
export const Card3D: React.FC<{
  w: number; h: number; rotY?: number; rotX?: number; rotZ?: number; front: Face; back?: Face;
  frontBg?: string; backBg?: string; thickness?: number; radius?: number; edge?: string; border?: string; dashed?: boolean;
}> = ({ w, h, rotY = 0, rotX = 0, rotZ = 0, front, back, frontBg = ui.surface, backBg = ui.surface2, thickness = 10, radius = shape.radius, edge = "#060607", border = ui.hairlineStrong, dashed }) => {
  const n = Math.max(2, Math.round(thickness / 2));
  // light from upper-left: the face darkens as it turns away, the sheen band travels with the angle
  const yRad = (rotY * Math.PI) / 180;
  const shade = 0.42 * Math.abs(Math.sin(yRad));
  const sheenPos = 50 + 160 * Math.sin(yRad) + rotX * 2;
  const face = (bg: string, flip: boolean, content: Face): React.ReactNode => (
    <div style={{ position: "absolute", inset: 0, borderRadius: radius, background: bg, border: `${dashed ? "3px dashed" : "1.5px solid"} ${border}`, overflow: "hidden", boxSizing: "border-box",
      backfaceVisibility: "hidden", transform: `${flip ? "rotateY(180deg) " : ""}translateZ(${thickness / 2}px)` }}>
      {content}
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${shade})` }} />
      <div style={{ position: "absolute", inset: -2, background: `linear-gradient(105deg, rgba(255,255,255,0) ${sheenPos - 26}%, rgba(255,255,255,0.13) ${sheenPos}%, rgba(255,255,255,0) ${sheenPos + 26}%)` }} />
    </div>
  );
  return (
    <div style={{ width: w, height: h, perspective: 2200 }}>
      <div style={{ position: "relative", width: w, height: h, transformStyle: "preserve-3d", transform: `rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, borderRadius: radius, background: edge, transform: `translateZ(${-thickness / 2 + (i + 0.5) * (thickness / n)}px)` }} />
        ))}
        {face(frontBg, false, front)}
        {face(backBg, true, back)}
      </div>
    </div>
  );
};

/** Edge-on entrance (starts as a thin line at 90°) then an optional flip to the back. Returns rotY in degrees. */
export const flipAngle = (t: number, enter: number, flipAt?: number, enterDur = 0.7, flipDur = 0.65) => {
  const k = curve.out(clamp01((t - enter) / enterDur));
  const f = flipAt === undefined ? 0 : curve.inOut(clamp01((t - flipAt) / flipDur));
  return lerp(90, 0, k) + 180 * f;
};

/* ------------------------------------------------------------------ CardWheel */

/**
 * Cards on a big arc whose centre sits below the frame. `angle` is the wheel rotation in degrees;
 * card i sits at i*step - angle. The card at 0° is on top (closest, sharp); the rest recede in scale, blur and light.
 * `lift` (0..1) raises the top card out of the wheel and dims the others.
 */
export const CardWheel: React.FC<{
  cards: { key: string; w?: number; node: (focus: number) => React.ReactNode }[]; angle: number; cx: number; cy: number; R: number;
  step?: number; cw?: number; ch?: number; lift?: number; enter?: number;
}> = ({ cards, angle, cx, cy, R, step = 21, cw = 330, ch = 520, lift = 0, enter = 1 }) => {
  const placed = cards.map((c, i) => {
    const th = i * step - angle;
    const focus = clamp01(1 - Math.abs(th) / step);
    return { c, i, th, focus };
  }).sort((a, b) => Math.abs(b.th) - Math.abs(a.th)); // far cards first, top card last
  return (
    <>
      {placed.map(({ c, i, th, focus }) => {
        if (Math.abs(th) > 75) return null;
        const top = focus > 0.98 ? lift : 0;
        const e = curve.out(clamp01(enter * 1.6 - i * 0.08)); // staggered rise into the arc
        const r = R + 40 * focus + 170 * top;
        const dim = 1 - 0.5 * lift * (1 - top);
        return (
          <div key={c.key} style={{
            position: "absolute", left: cx - cw / 2, top: cy - ch, width: cw, height: ch, transformOrigin: `${cw / 2}px ${ch}px`,
            transform: `rotate(${th}deg) translateY(${-r + (1 - e) * 900}px) scale(${0.9 + 0.1 * focus + 0.12 * top})`,
            filter: `blur(${(1 - focus) * 2.5 + (1 - dim) * 6}px) brightness(${(0.55 + 0.45 * focus) * dim + (1 - dim) * 0.4})`,
          }}>
            {c.node(focus)}
          </div>
        );
      })}
    </>
  );
};

/** Wheel angle over time: spins in from `from`, decelerates and lands exactly on card `land` at time b. */
export const wheelAngle = (t: number, a: number, b: number, from: number, land: number, step = 21) => {
  const k = curve.out(clamp01((t - a) / (b - a)));
  return lerp(from, land * step, k);
};

/* ------------------------------------------------------------------ cause → effect */

type Pt = { x: number; y: number };
const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
  const v = 1 - u;
  return { x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x, y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y };
};

/**
 * A cable from p0 to p3 (cubic, sagging). It draws on, then each time in `pulses` a gold capsule runs down it
 * on the in-out curve (0.6 s) and lands at p3. Returns null before `a`.
 */
export const Cable: React.FC<{ t: number; a: number; p0: Pt; p1: Pt; p2: Pt; p3: Pt; pulses: number[]; run?: number }> = ({ t, a, p0, p1, p2, p3, pulses, run = 0.6 }) => {
  const draw = curve.inOut(clamp01((t - a) / 0.6));
  const steps = 48;
  const n = Math.max(2, Math.round(steps * draw));
  const pts = Array.from({ length: n }, (_, i) => bez(p0, p1, p2, p3, (i / (n - 1)) * draw));
  const d = pts.map((q, i) => `${i ? "L" : "M"}${q.x.toFixed(1)},${q.y.toFixed(1)}`).join("");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke="#1E1E23" strokeWidth={14} strokeLinecap="round" />
      <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} strokeLinecap="round" transform="translate(-2,-3)" />
      {pulses.map((s) => {
        const u = curve.inOut(clamp01((t - s) / run));
        if (t < s || t > s + run + 0.05) return null;
        const q = bez(p0, p1, p2, p3, u), q2 = bez(p0, p1, p2, p3, Math.min(1, u + 0.01));
        const ang = (Math.atan2(q2.y - q.y, q2.x - q.x) * 180) / Math.PI;
        return (
          <g key={s} transform={`translate(${q.x},${q.y}) rotate(${ang})`}>
            <rect x={-26} y={-11} width={52} height={22} rx={11} fill={ui.gold} />
            <rect x={-20} y={-8} width={18} height={5} rx={2.5} fill="rgba(255,255,255,0.55)" />
          </g>
        );
      })}
    </svg>
  );
};

/** The button the cable starts from: a chunky puck seen from above at an angle. Presses down when `press` > 0. */
export const Puck: React.FC<{ x: number; y: number; r?: number; press?: number; label?: string }> = ({ x, y, r = 110, press = 0, label }) => {
  const depth = 46, sink = 14 * press, ry = r * 0.42;
  return (
    <svg width={r * 2 + 40} height={ry * 2 + depth + 40} style={{ position: "absolute", left: x - r - 20, top: y - ry - 20, overflow: "visible" }}>
      <defs>
        <radialGradient id="puckTop" cx="40%" cy="35%" r="75%"><stop offset="0%" stopColor="#F2D697" /><stop offset="70%" stopColor={ui.gold} /><stop offset="100%" stopColor="#A9823A" /></radialGradient>
        <linearGradient id="puckSide" x1="0" x2="1"><stop offset="0%" stopColor="#1A1A1F" /><stop offset="45%" stopColor="#2A2A31" /><stop offset="100%" stopColor="#0E0E11" /></linearGradient>
      </defs>
      <g transform={`translate(${r + 20},${ry + 20})`}>
        <ellipse cx={0} cy={depth + 26} rx={r * 1.15} ry={ry * 0.9} fill="rgba(0,0,0,0.55)" filter="blur(10px)" />
        <path d={`M${-r},0 L${-r},${depth} A${r},${ry} 0 0 0 ${r},${depth} L${r},0 Z`} fill="url(#puckSide)" />
        <ellipse cx={0} cy={depth} rx={r} ry={ry} fill="none" />
        <ellipse cx={0} cy={sink} rx={r * 0.86} ry={ry * 0.86} fill="url(#puckTop)" />
        <ellipse cx={0} cy={0} rx={r} ry={ry} fill="none" stroke="#2E2E35" strokeWidth={10} />
        {label && <text x={0} y={sink + 12} textAnchor="middle" fontFamily="'Inter', sans-serif" fontWeight={800} fontSize={34} fill="#1A1406" letterSpacing="-0.02em">{label}</text>}
      </g>
    </svg>
  );
};

/** Swell amount (0..1) for a slab fed by pulses: each arrival pumps it, then it relaxes a little (critically damped). */
export const swell = (t: number, arrivals: number[], per = 0.34) => {
  let s = 0;
  for (const a of arrivals) {
    if (t < a) break;
    const x = t - a;
    s += per * (1 - (1 + 14 * x) * Math.exp(-14 * x)) * (1 - 0.35 * (1 - Math.exp(-3 * x)));
  }
  return clamp01(s);
};
