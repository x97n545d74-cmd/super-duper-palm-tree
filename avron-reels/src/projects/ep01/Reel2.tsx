import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import timeline from "../../../projects/2026-10-ep01-v2/timeline.json";
import mouthData from "../../../public/ep01v2/mouth.json";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Character, faceCenter, Key, Who } from "./Character";

/*
 * Ep 01 v2 — "₹50 ka share, chhota hai par…" (posts on a separate account: no AVRON branding)
 * One idea: share price doesn't tell you company size; market cap = price × total shares.
 * House motion rules: masked type reveals, one amber accent, push cuts with real motion blur,
 * no shake, particles, glows, flashes or bouncy easing. The two leads walk between the graphics.
 */
type Word = { w: string; t0: number; t1: number };
type Line = { id: string; who: Who; start: number; end: number; chunks: { t0: number; t1: number; words: Word[] }[] };
const TL = timeline as unknown as { total: number; lines: Line[]; cues: Record<string, number> };
export const DURATION_V2 = TL.total;
const MOUTH = mouthData as Record<Who, number[]>;
const L = Object.fromEntries(TL.lines.map((l) => [l.id, l])) as Record<string, Line>;
const C = TL.cues;
const S = (id: string) => L[id].start, E = (id: string) => L[id].end;
const W = (id: string, word: string) => {
  for (const c of L[id].chunks) for (const w of c.words) if (w.w.toLowerCase().replace(/[^\w₹,]/g, "").startsWith(word.toLowerCase())) return w.t0;
  return L[id].start;
};
const GREEN = "#3DCB8C", INK = "#0B0C0F";
const inOut = ease.inOutCubic, outX = ease.outExpo;

// ---------- blocking: where each lead stands, and when they walk ----------
type Mark = [number, number, number, number]; // t, x, scale k, seconds to get there (0 = cut)
const FEET = 1650;
const BLOCK: Record<Who, Mark[]> = {
  boy: [
    [0, -260, 0.5, 0], [0.05, 300, 0.5, 1.7],                     // walks in, talking
    [C.wall, 250, 0.3, 0], [C.wall + 0.6, 330, 0.3, 1.2],         // small under the word wall
    [C.pizza, -150, 0.34, 0], [C.pizza + 0.1, 190, 0.34, 0.9],    // hurries in for the pizza
    [C.companies, 960, 0.24, 0], [C.double, 960, 0.24, 0], [C.double + 0.2, 880, 0.24, 0.7],
    [C.set, 300, 0.5, 0], [S("b3") - 0.1, 420, 0.5, 0.8],         // sidles up to her
  ],
  girl: [
    [0, 1360, 0.5, 0], [2.25, 1360, 0.5, 0], [2.3, 800, 0.5, 1.25], // strolls in
    [C.wall, 760, 0.3, 0], [S("g2") + 0.4, 640, 0.3, 1.6],
    [C.pizza, 880, 0.34, 0],
    [C.companies, 300, 0.24, 0], [S("g5") - 0.1, 300, 0.24, 0], [S("g5"), 760, 0.24, 1.5], // walks from A to B
    [S("g6") + 0.4, 540, 0.24, 1.1],
    [C.set, 800, 0.5, 0],
  ],
};
const posAt = (who: Who, t: number) => {
  const m = BLOCK[who];
  let cur = m[0], prev = m[0];
  for (const k of m) if (k[0] <= t) { prev = cur; cur = k; }
  const p = cur[3] ? inOut(clamp01((t - cur[0]) / cur[3])) : 1;
  const moving = cur[3] > 0 && t - cur[0] < cur[3] && Math.abs(cur[1] - prev[1]) > 20;
  const walk = moving ? Math.min(1, (t - cur[0]) / 0.15, (cur[0] + cur[3] - t) / 0.2) : 0;
  return { x: lerp(prev[1], cur[1], p), k: cur[3] ? lerp(prev[2], cur[2], p) : cur[2], walk: Math.max(0, walk) };
};

// ---------- acting ----------
const BOY: Key[] = [
  [0, { mouth: "talk", browL: 9, browR: 9, eye: 1.1 }],
  [E("b1"), { mouth: "grin", mouthAmt: 1 }],
  [S("g1") + 0.2, { lookX: 9, mouth: "smile", mouthAmt: 0.5 }],
  [E("g1") - 0.3, { mouth: "frown", mouthAmt: 0.7, tilt: -0.6, browL: 4, browR: 4 }],
  [C.wall, { lookY: -9, lookX: 4, mouth: "o", mouthAmt: 0.4, tilt: 0, eye: 1.15, browL: 8, browR: 8 }],
  [C.pizza, { lookX: 9, lookY: -4, mouth: "o", mouthAmt: 0.8, eye: 1.2 }],
  [W("g3", "pizza") + 0.6, { mouth: "grin", mouthAmt: 0.8 }],
  [C.companies, { lookX: -9, lookY: -6, mouth: "flat", eye: 1, browL: 2, browR: 2 }],
  [C.double, { mouth: "o", mouthAmt: 0.6, eye: 1.2, browL: 10, browR: 10 }],
  [C.set, { lookX: 9, lookY: 0, mouth: "flat", tilt: -0.4, browL: 3, browR: 3, eye: 1 }],
  [S("b2"), { mouth: "talk", tilt: -0.6, browL: 6, browR: 0 }],
  [E("b2"), { mouth: "smile", mouthAmt: 0.4, tilt: 0 }],
  [S("b3") - 0.15, { mouth: "talk", eye: 0.6, browL: 11, browR: 11, lean: 2.5 }],
  [E("b3"), { mouth: "smirk", mouthAmt: 1 }],
  [C.freeze - 0.1, { mouth: "o", mouthAmt: 0.6, eye: 1.3, tilt: -1, browL: 13, browR: 13, lookX: 0, lean: 0 }],
];
const GIRL: Key[] = [
  [0, { lookX: -9, mouth: "smile", mouthAmt: 0.5 }],
  [S("b1") + 2.3, { browR: 14, browL: -2, mouth: "smirk", mouthAmt: 0.8, eye: 0.9 }],
  [S("g1"), { mouth: "talk", eye: 0.8 }],
  [E("g1"), { mouth: "smirk", mouthAmt: 1 }],
  [C.wall, { mouth: "smile", lookX: -6, lookY: -6, browR: 4, browL: 4, eye: 1 }],
  [S("g2"), { mouth: "talk" }],
  [E("g2"), { mouth: "smile", mouthAmt: 0.8 }],
  [C.pizza, { lookX: -9, lookY: -4 }],
  [S("g3"), { mouth: "talk" }],
  [E("g3"), { mouth: "smile" }],
  [C.companies, { lookX: 0, lookY: -9 }],
  [S("g4"), { mouth: "talk" }],
  [S("g5") + 0.1, { lookX: 6 }],
  [S("g6") + 0.5, { lookX: 0, lookY: 0, browL: 6, browR: 6 }],
  [E("g6"), { mouth: "smile", mouthAmt: 0.8 }],
  [C.set, { lookX: -9, browL: 2, browR: 6, mouth: "smirk", mouthAmt: 0.7 }],
  [S("b3") + 0.3, { browR: 13, eye: 0.85 }],
  [C.phone, { lookY: -12, lookX: -4, eye: 1 }],
  [S("g7"), { mouth: "talk", lookY: 0, lookX: -9, eye: 0.7, browR: 12 }],
  [E("g7"), { mouth: "smirk", mouthAmt: 1, browR: 14 }],
];

// ---------- backgrounds: layered panels with parallax, a different tint per scene ----------
const Backdrop: React.FC<{ t: number; tint: string; panel: string; floor?: boolean }> = ({ t, tint, panel, floor = true }) => {
  const drift = t * 14;
  const slab = (x: number, w: number, top: number, depth: number, op: number) => (
    <rect x={x - drift * depth} y={top} width={w} height={2200} rx={w / 2} fill={panel} opacity={op} />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`bg-${tint}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080B" />
          <stop offset="0.55" stopColor={tint} />
          <stop offset="1" stopColor="#07080B" />
        </linearGradient>
        <radialGradient id="bg-vig" cx="50%" cy="48%" r="70%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#bg-${tint})`} />
      {slab(-120, 420, 380, 0.4, 0.55)}
      {slab(380, 360, 250, 0.7, 0.4)}
      {slab(820, 460, 420, 0.25, 0.5)}
      {slab(1280, 380, 300, 0.7, 0.4)}
      {floor && <rect x={0} y={1600} width={1080} height={320} fill="#0A0B0F" opacity={0.85} />}
      {floor && <line x1={0} x2={1080} y1={1600} y2={1600} stroke="rgba(243,241,236,0.07)" strokeWidth={3} />}
      <rect width={1080} height={1920} fill="url(#bg-vig)" />
    </svg>
  );
};

const Shadow: React.FC<{ x: number; k: number }> = ({ x, k }) => (
  <div style={{ position: "absolute", left: x - 420 * k, top: FEET - 26 * k, width: 840 * k, height: 52 * k, borderRadius: "50%", background: "rgba(0,0,0,0.45)" }} />
);

const Leads: React.FC<{ t: number; frame: number; cam?: { x: number; y: number; s: number } }> = ({ t, frame, cam }) => {
  const b = posAt("boy", t), g = posAt("girl", t);
  const tr = cam ? `translate(${540 - cam.x * cam.s}px, ${960 - cam.y * cam.s}px) scale(${cam.s})` : undefined;
  return (
    <AbsoluteFill style={{ transform: tr, transformOrigin: "0 0" }}>
      <Shadow x={b.x} k={b.k} />
      <Shadow x={g.x} k={g.k} />
      <Character who="boy" t={t} frame={frame} keys={BOY} x={b.x} y={FEET} k={b.k} mouth={MOUTH.boy} walk={b.walk} />
      <Character who="girl" t={t} frame={frame} keys={GIRL} x={g.x} y={FEET} k={g.k} mouth={MOUTH.girl} walk={g.walk} body="ep01/chars/girl_body_plain.png" />
    </AbsoluteFill>
  );
};

// masked rise for any type block
const Rise: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div style={{ transform: `translateY(${(1 - p) * 105}%)` }}>{children}</div>
  </div>
);
const crore = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")} cr`;

// ---------- scene 1: the hook card ----------
const HookCard: React.FC<{ t: number }> = ({ t }) => {
  const a = W("b1", "₹50") - 0.1;
  const p = prog(t, a, 0.45, outX);
  const up = prog(t, W("b1", "jaldi"), 0.9, inOut);
  const flat = prog(t, W("g1", "badi"), 0.6, inOut);
  const tip = up * (1 - flat);
  const pts = Array.from({ length: 9 }, (_, i) => [24 + i * 44, 190 - (i / 8) * 150 * tip - Math.sin(i * 1.7) * 10 * tip]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 600, top: 456, width: 420, height: 236, borderRadius: 28, background: "rgba(12,14,19,0.94)", border: "1.5px solid rgba(243,241,236,0.16)",
      clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 28px)`, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ position: "absolute", left: 28, top: 22, fontFamily: font.text, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: color.inkDim }}>SHARE PRICE</div>
      <div style={{ position: "absolute", left: 26, top: 52, fontFamily: font.display, fontWeight: 800, fontSize: 96, letterSpacing: "-0.03em", color: color.ink }}>₹50</div>
      <svg width={420} height={236} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(200 18) scale(0.55)">
          <path d={d} fill="none" stroke={flat > 0.5 ? color.inkDim : GREEN} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <div style={{ position: "absolute", right: 26, bottom: 18, fontFamily: font.display, fontWeight: 800, fontSize: 30, color: color.amberHot, opacity: prog(t, W("b1", "jaldi"), 0.3) }}>
        {flat > 0.5 ? "BADA? HMM" : "JALDI BADA?"}
      </div>
    </div>
  );
};

// ---------- scene 2: the word wall ----------
const Wall: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, W("g2", "size") - 0.05, 0.45, outX);
  const b = prog(t, W("g2", "karta"), 0.45, outX);
  const c = prog(t, W("g2", "company"), 0.45, outX);
  const swap = prog(t, W("g2", "market") - 0.45, 0.3, ease.inCubic);
  const mc = prog(t, W("g2", "market") - 0.12, 0.55, outX);
  const ul = prog(t, W("g2", "cap") + 0.1, 0.5, inOut);
  const big = { fontFamily: font.display, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.95 } as const;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, opacity: 1 - swap, transform: `translateY(${-swap * 60}px)` }}>
        <Rise p={a}><div style={{ ...big, fontSize: 150, color: color.ink }}>SIZE</div></Rise>
        <Rise p={a}><div style={{ ...big, fontSize: 150, color: color.ink }}>MATTER</div></Rise>
        <Rise p={b}><div style={{ ...big, fontSize: 150, color: color.inkDim }}>KARTA HAI</div></Rise>
        <Rise p={c} style={{ marginTop: 30 }}><div style={{ ...big, fontSize: 64, letterSpacing: "-0.01em", color: color.amberHot }}>par company ka</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: swap >= 1 ? 1 : 0 }}>
        <Rise p={mc}><div style={{ ...big, fontSize: 196, color: color.amber }}>MARKET</div></Rise>
        <Rise p={mc}><div style={{ ...big, fontSize: 196, color: color.amber }}>CAP</div></Rise>
        <div style={{ margin: "26px auto 0", width: 620, height: 8, background: color.ink, transformOrigin: "0 50%", transform: `scaleX(${ul})` }} />
        <div style={{ marginTop: 26, fontFamily: font.text, fontWeight: 600, fontSize: 40, color: color.inkDim, opacity: ul }}>company ka poora size</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- pizza (shared by scenes 3 and 4) ----------
const Pizza: React.FC<{ cx: number; cy: number; r: number; cuts: number; cutP: number; gap?: number; id: string }> = ({ cx, cy, r, cuts, cutP, gap = 0, id }) => {
  const tops = [[0.42, 0.3], [-0.35, 0.45], [0.1, -0.5], [-0.55, -0.15], [0.55, -0.35], [-0.1, 0.12], [0.28, 0.62], [-0.48, 0.62 - 1]];
  const n = Math.max(1, cuts);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
        const mid = (a0 + a1) / 2, ox = Math.cos(mid) * gap, oy = Math.sin(mid) * gap;
        const big = n === 1 ? "" : `M ${cx} ${cy} L ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z`;
        return (
          <g key={i} transform={`translate(${ox} ${oy})`}>
            <clipPath id={`${id}-s${i}`}>{n === 1 ? <circle cx={cx} cy={cy} r={r} /> : <path d={big} />}</clipPath>
            <g clipPath={`url(#${id}-s${i})`}>
              <circle cx={cx} cy={cy} r={r} fill="#D9963F" />
              <circle cx={cx} cy={cy} r={r * 0.86} fill="#F2C14E" />
              {tops.map(([x, y], j) => <circle key={j} cx={cx + x * r * 0.8} cy={cy + y * r * 0.8} r={r * 0.09} fill="#C8323A" stroke={INK} strokeWidth={r * 0.018} />)}
              {tops.map(([x, y], j) => <circle key={`o${j}`} cx={cx - y * r * 0.62} cy={cy + x * r * 0.55} r={r * 0.035} fill="#2A3A2A" />)}
            </g>
            {n > 1 && <path d={big} fill="none" stroke={INK} strokeWidth={Math.max(3, r * 0.025)} strokeLinejoin="round" />}
          </g>
        );
      })}
      {n === 1 && <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={Math.max(3, r * 0.025)} />}
      {/* knife lines drawing in */}
      {cutP < 1 && n > 1 && Array.from({ length: n / 2 }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, q = clamp01(cutP * (n / 2) - i);
        return <line key={i} x1={cx - Math.cos(a) * r * q} y1={cy - Math.sin(a) * r * q} x2={cx + Math.cos(a) * r * q} y2={cy + Math.sin(a) * r * q} stroke={color.ink} strokeWidth={6} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ---------- scene 3: 8 slices or 2, same pizza ----------
const PizzaScene: React.FC<{ t: number }> = ({ t }) => {
  const enter = prog(t, C.pizza, 0.5, outX);
  const eight = W("g3", "8"), two = W("g3", "2");
  const is2 = t >= two + 0.15;
  const cutP = is2 ? prog(t, two + 0.15, 0.35, inOut) : prog(t, eight, 0.6, inOut);
  const gap = is2 ? 10 * prog(t, two + 0.4, 0.4, outX) : 8 * prog(t, eight + 0.55, 0.4, outX);
  const same = prog(t, W("g3", "utna") - 0.1, 0.5, outX);
  const legend = prog(t, W("g3", "rehta"), 0.45, outX);
  const r = 300;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 64, letterSpacing: "-0.02em", color: color.ink }}>
        <Rise p={prog(t, eight - 0.1, 0.4, outX)}><span style={{ color: is2 ? color.inkFaint : color.ink }}>8 SLICE</span><span style={{ color: color.inkFaint }}> · </span><span style={{ color: is2 ? color.amberHot : color.inkFaint }}>2 SLICE</span></Rise>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 880) scale(${lerp(0.7, 1, enter)}) translate(-540 -880)`} opacity={enter}>
          <Pizza id="pz" cx={540} cy={880} r={r} cuts={is2 ? 2 : t >= eight ? 8 : 1} cutP={cutP} gap={gap} />
          {/* same-size callout */}
          <g opacity={same}>
            <line x1={540 - r} x2={540 + r} y1={880 + r + 50} y2={880 + r + 50} stroke={color.amber} strokeWidth={5} />
            <line x1={540 - r} x2={540 - r} y1={880 + r + 34} y2={880 + r + 66} stroke={color.amber} strokeWidth={5} />
            <line x1={540 + r} x2={540 + r} y1={880 + r + 34} y2={880 + r + 66} stroke={color.amber} strokeWidth={5} />
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880 + r + 78, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 46, color: color.amberHot }}>
        <Rise p={same}>PIZZA UTNA HI</Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1350, display: "flex", justifyContent: "center", gap: 22, opacity: legend, transform: `translateY(${(1 - legend) * 24}px)` }}>
        {["SLICE = SHARE", "PIZZA = COMPANY"].map((s) => (
          <div key={s} style={{ padding: "14px 26px", borderRadius: 40, border: "2px solid rgba(243,241,236,0.25)", background: "rgba(8,9,12,0.8)", fontFamily: font.display, fontWeight: 800, fontSize: 34, letterSpacing: "0.02em", color: color.ink }}>{s}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- scene 4: two companies, two pizzas sized by market cap ----------
const Company: React.FC<{ t: number; cx: number; name: string; price: string; price2: string; shares: string; cap: number; cuts: number; a: number; dbl: number; id: string }> = ({ t, cx, name, price, price2, shares, cap, cuts, a, dbl, id }) => {
  const head = prog(t, a - 0.2, 0.45, outX);
  const pz = prog(t, a + 0.3, 0.6, outX);
  const sh = prog(t, a + 0.9, 0.45, outX);
  const res = prog(t, a + 1.6, 0.9, ease.outCubic);
  const g = prog(t, dbl, 0.9, inOut);
  const r0 = Math.sqrt(cap / 5000) * 165;
  const r = r0 * lerp(1, Math.SQRT2, g) * lerp(0.6, 1, pz);
  const cy = 812;
  const capNow = cap * (1 + g) * res;
  return (
    <>
      <div style={{ position: "absolute", left: cx - 260, width: 520, top: 440, textAlign: "center" }}>
        <Rise p={head}><div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 28, letterSpacing: "0.18em", color: color.inkDim }}>{name}</div></Rise>
        <Rise p={head}><div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 76, letterSpacing: "-0.03em", color: color.ink, marginTop: 4 }}>
          {g > 0.5 ? price2 : price}<span style={{ fontSize: 34, color: color.inkDim, fontWeight: 700 }}> /share</span>
        </div></Rise>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: pz }}>
        <Pizza id={id} cx={cx} cy={cy} r={r} cuts={cuts} cutP={1} gap={2} />
      </svg>
      <div style={{ position: "absolute", left: cx + r * 0.62, top: cy - r * 0.95 - 30, padding: "8px 18px", borderRadius: 30, background: GREEN, color: INK,
        fontFamily: font.display, fontWeight: 800, fontSize: 40, opacity: g, transform: `translateY(${(1 - g) * 20}px)` }}>×2</div>
      <div style={{ position: "absolute", left: cx - 270, width: 540, top: 1052, textAlign: "center" }}>
        <Rise p={sh}><div style={{ fontFamily: font.text, fontWeight: 600, fontSize: 30, color: color.inkDim }}>× {shares} shares</div></Rise>
        <Rise p={res} style={{ marginTop: 6 }}><div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 62, letterSpacing: "-0.03em", color: g > 0.05 ? GREEN : color.amberHot, fontVariantNumeric: "tabular-nums" }}>= {crore(capNow)}</div></Rise>
        <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", color: color.inkFaint, marginTop: 6, opacity: res }}>MARKET CAP</div>
      </div>
    </>
  );
};

const Companies: React.FC<{ t: number }> = ({ t }) => {
  return (
    <AbsoluteFill>
      <Company t={t} cx={290} id="ca" name="COMPANY A" price="₹50" price2="₹100" shares="100 cr" cap={5000} cuts={16} a={S("g4")} dbl={C.double} />
      <Company t={t} cx={800} id="cb" name="COMPANY B" price="₹500" price2="₹1,000" shares="2 cr" cap={1000} cuts={2} a={S("g5")} dbl={C.double} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1690, textAlign: "center", fontFamily: font.text, fontWeight: 600, fontSize: 22, letterSpacing: "0.16em", color: color.inkFaint, opacity: prog(t, S("g4") + 1, 0.4) }}>ILLUSTRATIVE NUMBERS</div>
    </AbsoluteFill>
  );
};

// ---------- scene 5: the phone gag ----------
const PhoneCard: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, C.phone, 0.4, outX) * (1 - prog(t, C.endCard - 0.2, 0.2));
  if (p <= 0) return null;
  const crumbs = prog(t, W("g7", "slice"), 0.4, outX);
  return (
    <div style={{ position: "absolute", left: 330, top: 452, width: 420, height: 240, borderRadius: 32, background: "rgba(12,14,19,0.95)", border: "1.5px solid rgba(243,241,236,0.16)",
      clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 32px)`, transform: `translateY(${(1 - p) * 30}px)` }}>
      <div style={{ position: "absolute", left: 30, top: 24, fontFamily: font.text, fontWeight: 600, fontSize: 24, letterSpacing: "0.16em", color: color.inkDim }}>MERA PORTFOLIO</div>
      <svg width={420} height={240} style={{ position: "absolute", inset: 0 }}><g transform="translate(-20 -22)">
        <ellipse cx={170} cy={185} rx={118} ry={64} fill="#E9E2D2" stroke={INK} strokeWidth={6} />
        <ellipse cx={170} cy={185} rx={82} ry={42} fill="none" stroke="#C9C1AF" strokeWidth={4} />
        {[[140, 178], [196, 192], [168, 200], [210, 172]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#D9963F" opacity={crumbs} />)}
      </g></svg>
      <div style={{ position: "absolute", right: 34, top: 80, textAlign: "right", fontFamily: font.display, fontWeight: 800, fontSize: 64, color: color.loss, opacity: crumbs }}>0<div style={{ fontSize: 28, color: color.inkDim }}>SLICE</div></div>
    </div>
  );
};

// ---------- captions: top band, masked rise, said words full, keywords amber ----------
const HOT = /^(₹50|₹500|₹5,000|₹1,000|market|cap|size|double|pizza|slice)/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  let chunk: Line["chunks"][number] | null = null;
  for (const l of TL.lines) for (const c of l.chunks) if (t >= c.t0 - 0.08 && t <= c.t1 + 0.3) chunk = c;
  if (!chunk || t >= C.endCard) return null;
  const p = prog(t, chunk.t0 - 0.08, 0.26, outX);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 236, height: 200, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ overflow: "hidden", padding: "14px 30px", borderRadius: 26, background: "rgba(8,9,12,0.82)", opacity: Math.min(1, p * 1.6) }}>
        <div style={{ transform: `translateY(${(1 - p) * 100}%)`, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 62, lineHeight: 1.1, letterSpacing: "-0.015em", color: color.ink }}>
          {chunk.words.map((w, i) => (
            <span key={i} style={{ color: HOT.test(w.w.replace(/[.,!?]$/g, "")) ? color.amberHot : color.ink, opacity: t >= w.t0 ? 1 : 0.5 }}>
              {w.w.replace(/\.$/, "")}{i < chunk!.words.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------- end card: the takeaway, no logo ----------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.endCard) return null;
  const u = t - C.endCard;
  const a = prog(u, 0.2, 0.5, outX), b = prog(u, 0.45, 0.5, outX), ul = prog(u, 0.8, 0.5, inOut);
  return (
    <AbsoluteFill style={{ opacity: prog(u, 0, 0.2), background: color.bg }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 104, letterSpacing: "-0.03em", lineHeight: 1.02 }}>
        <Rise p={a}><span style={{ color: color.ink }}>SHARE PRICE</span></Rise>
        <Rise p={a}><span style={{ color: color.ink }}>NAHI</span></Rise>
        <Rise p={b} style={{ marginTop: 18 }}><span style={{ color: color.amber }}>MARKET CAP</span></Rise>
        <Rise p={b}><span style={{ color: color.amber }}>DEKH</span></Rise>
        <div style={{ margin: "34px auto 0", width: 520, height: 8, background: color.amber, transformOrigin: "50% 50%", transform: `scaleX(${ul})` }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1470, textAlign: "center", fontFamily: font.text, fontWeight: 500, fontSize: 25, letterSpacing: "0.05em", color: color.inkFaint, opacity: prog(u, 1.0, 0.4) }}>
        Illustrative numbers · Educational content only · Not investment advice
      </div>
    </AbsoluteFill>
  );
};

// ---------- camera for the two-person scenes ----------
type Cam = [number, number, number, number, number];
const camFor = (t: number) => {
  const fb = (x: number, k: number) => faceCenter("boy", x, FEET, k), fg = (x: number, k: number) => faceCenter("girl", x, FEET, k);
  const CAM: Cam[] = [
    [0, fb(300, 0.5)[0] + 120, fb(300, 0.5)[1] + 230, 1.22, 0],
    [2.2, 540, 1080, 1.0, 0.9],
    [C.set, 540, 1080, 1.0, 0],
    [S("b3") - 0.2, fb(420, 0.5)[0] + 120, fb(420, 0.5)[1] + 220, 1.18, 0.6],
    [C.phone, 560, 860, 1.0, 0.5],
    [C.freeze, fb(420, 0.5)[0], fb(420, 0.5)[1] + 80, 1.7, 0.22],
  ];
  void fg;
  let cur = CAM[0], prev = CAM[0];
  for (const c of CAM) if (c[0] <= t) { prev = cur; cur = c; }
  const p = cur[4] ? (cur[4] < 0.3 ? outX : inOut)(clamp01((t - cur[0]) / cur[4])) : 1;
  return { x: lerp(prev[1], cur[1], p), y: lerp(prev[2], cur[2], p), s: lerp(prev[3], cur[3], p) };
};

// ---------- push cuts ----------
const CUTS = [0, C.wall, C.pizza, C.companies, C.set, C.endCard, TL.total + 1];
const Shot: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  if (t < a || t >= b) return null;
  const inP = a === 0 ? 1 : prog(t, a, 0.38, outX);
  const outP = prog(t, b - 0.16, 0.16, ease.inCubic);
  const s = lerp(1.14, 1, inP) * (1 + outP * 0.3);
  return <AbsoluteFill style={{ transform: `scale(${s})`, opacity: 1 - outP * 0.5 }}>{children}</AbsoluteFill>;
};

export const Ep01v2Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camFor(t);
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <AbsoluteFill>
          <Shot t={t} a={CUTS[0]} b={CUTS[1]}>
            <Backdrop t={t} tint="#141A26" panel="#1B2232" />
            <Leads t={t} frame={frame} cam={cam} />
            <HookCard t={t} />
          </Shot>
          <Shot t={t} a={CUTS[1]} b={CUTS[2]}>
            <Backdrop t={t} tint="#16130E" panel="#211C14" />
            <Wall t={t} />
            <Leads t={t} frame={frame} />
          </Shot>
          <Shot t={t} a={CUTS[2]} b={CUTS[3]}>
            <Backdrop t={t} tint="#1A120E" panel="#261A13" />
            <PizzaScene t={t} />
            <Leads t={t} frame={frame} />
          </Shot>
          <Shot t={t} a={CUTS[3]} b={CUTS[4]}>
            <Backdrop t={t} tint="#0E151D" panel="#16202B" />
            <Companies t={t} />
            <Leads t={t} frame={frame} />
          </Shot>
          <Shot t={t} a={CUTS[4]} b={CUTS[5]}>
            <Backdrop t={t} tint="#141A26" panel="#1B2232" />
            <Leads t={t} frame={frame} cam={cam} />
            <PhoneCard t={t} />
          </Shot>
          <Captions t={t} />
          <EndCard t={t} />
        </AbsoluteFill>
      </CameraMotionBlur>
      <Audio src={staticFile("ep01v2/mix.wav")} />
    </AbsoluteFill>
  );
};
