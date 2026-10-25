import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Character, Key, Who } from "../ep01/Character";
import { Chacha } from "./Chacha";

/*
 * Shared kit for the finance-comedy series (Ep 02 onward, no AVRON branding).
 * House motion rules: masked type reveals, one amber accent, push cuts with camera motion blur,
 * no shake, particles, glows, flashes or bouncy easing. Leads walk between the graphics.
 */
export type Lead = Who | "chacha";
export type Word = { w: string; t0: number; t1: number };
export type Line = { id: string; who: Lead; start: number; end: number; chunks: { t0: number; t1: number; words: Word[] }[] };
export type TL = { total: number; lines: Line[]; cues: Record<string, number> };
export const GREEN = "#3DCB8C", INK = "#0B0C0F";
export const outX = ease.outExpo, inOut = ease.inOutCubic;
export const FEET = 1650;

export const timing = (tl: TL) => {
  const L = Object.fromEntries(tl.lines.map((l) => [l.id, l])) as Record<string, Line>;
  return {
    L, C: tl.cues,
    S: (id: string) => L[id].start,
    E: (id: string) => L[id].end,
    W: (id: string, word: string) => {
      for (const c of L[id].chunks) for (const w of c.words) if (w.w.toLowerCase().replace(/[^\w₹,]/g, "").startsWith(word.toLowerCase())) return w.t0;
      return L[id].start;
    },
  };
};

// blocking: [t, x, k, seconds to get there (0 = cut)]
export type Mark = [number, number, number, number];
export const posAt = (m: Mark[], t: number) => {
  let cur = m[0], prev = m[0];
  for (const k of m) if (k[0] <= t) { prev = cur; cur = k; }
  const p = cur[3] ? inOut(clamp01((t - cur[0]) / cur[3])) : 1;
  const moving = cur[3] > 0 && t - cur[0] < cur[3] && Math.abs(cur[1] - prev[1]) > 20;
  const walk = moving ? Math.min(1, (t - cur[0]) / 0.15, (cur[0] + cur[3] - t) / 0.2) : 0;
  return { x: lerp(prev[1], cur[1], p), k: cur[3] ? lerp(prev[2], cur[2], p) : cur[2], walk: Math.max(0, walk) };
};

export type Cam = { x: number; y: number; s: number };
export const camTrack = (keys: [number, number, number, number, number][], t: number): Cam => {
  let cur = keys[0], prev = keys[0];
  for (const c of keys) if (c[0] <= t) { prev = cur; cur = c; }
  const p = cur[4] ? (cur[4] < 0.3 ? outX : inOut)(clamp01((t - cur[0]) / cur[4])) : 1;
  return { x: lerp(prev[1], cur[1], p), y: lerp(prev[2], cur[2], p), s: lerp(prev[3], cur[3], p) };
};

export const Backdrop: React.FC<{ t: number; tint: string; panel: string; floor?: boolean }> = ({ t, tint, panel, floor = true }) => {
  const drift = t * 14;
  const slab = (x: number, w: number, top: number, depth: number, op: number) => (
    <rect x={x - drift * depth} y={top} width={w} height={2200} rx={w / 2} fill={panel} opacity={op} />
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`bg-${tint}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080B" /><stop offset="0.55" stopColor={tint} /><stop offset="1" stopColor="#07080B" />
        </linearGradient>
        <radialGradient id="bg-vig" cx="50%" cy="48%" r="70%">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#bg-${tint})`} />
      {slab(-120, 420, 380, 0.4, 0.55)}{slab(380, 360, 250, 0.7, 0.4)}{slab(820, 460, 420, 0.25, 0.5)}{slab(1280, 380, 300, 0.7, 0.4)}
      {floor && <rect x={0} y={1600} width={1080} height={320} fill="#0A0B0F" opacity={0.85} />}
      {floor && <line x1={0} x2={1080} y1={1600} y2={1600} stroke="rgba(243,241,236,0.07)" strokeWidth={3} />}
      <rect width={1080} height={1920} fill="url(#bg-vig)" />
    </svg>
  );
};

export const Rise: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}><div style={{ transform: `translateY(${(1 - p) * 105}%)` }}>{children}</div></div>
);

export const Card: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode }> = ({ x, y, w, h, p, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 28, overflow: "hidden", background: "rgba(12,14,19,0.94)",
    border: "1.5px solid rgba(243,241,236,0.16)", clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 28px)`, transform: `translateY(${(1 - p) * 30}px)` }}>{children}</div>
);

const Shadow: React.FC<{ x: number; k: number }> = ({ x, k }) => (
  <div style={{ position: "absolute", left: x - 420 * k, top: FEET - 26 * k, width: 840 * k, height: 52 * k, borderRadius: "50%", background: "rgba(0,0,0,0.45)" }} />
);

/** Any subset of the three leads, with blocking, acting keys and lip-sync. */
export const Cast: React.FC<{ t: number; frame: number; cam?: Cam; who: Lead[]; block: Record<Lead, Mark[]>; acting: Record<Lead, Key[]>; mouth: Record<string, number[]>; phone?: string[] }> = ({ t, frame, cam, who, block, acting, mouth, phone }) => {
  const tr = cam ? `translate(${540 - cam.x * cam.s}px, ${960 - cam.y * cam.s}px) scale(${cam.s})` : undefined;
  return (
    <AbsoluteFill style={{ transform: tr, transformOrigin: "0 0" }}>
      {who.map((w) => { const p = posAt(block[w], t); return <Shadow key={`s${w}`} x={p.x} k={p.k} />; })}
      {who.map((w) => {
        const p = posAt(block[w], t);
        if (w === "chacha") return <Chacha key={w} t={t} frame={frame} keys={acting[w]} x={p.x} y={FEET} k={p.k} mouth={mouth[w]} walk={p.walk} phone={phone} />;
        return <Character key={w} who={w} t={t} frame={frame} keys={acting[w]} x={p.x} y={FEET} k={p.k} mouth={mouth[w]} walk={p.walk}
          body={w === "girl" ? "ep01/chars/girl_body_plain.png" : undefined} />;
      })}
    </AbsoluteFill>
  );
};

const HOT_DEFAULT = /^(₹\d|market|cap|research|share|sebi|profit)/i;
export const Captions: React.FC<{ t: number; tl: TL; until: number; hot?: RegExp; top?: number }> = ({ t, tl, until, hot = HOT_DEFAULT, top = 236 }) => {
  let chunk: Line["chunks"][number] | null = null;
  for (const l of tl.lines) for (const c of l.chunks) if (t >= c.t0 - 0.08 && t <= c.t1 + 0.3) chunk = c;
  if (!chunk || t >= until) return null;
  const p = prog(t, chunk.t0 - 0.08, 0.26, outX);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, height: 200, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
      <div style={{ overflow: "hidden", padding: "14px 30px", borderRadius: 26, background: "rgba(8,9,12,0.82)", opacity: Math.min(1, p * 1.6) }}>
        <div style={{ transform: `translateY(${(1 - p) * 100}%)`, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 62, lineHeight: 1.1, letterSpacing: "-0.015em", color: color.ink }}>
          {chunk.words.map((w, i) => (
            <span key={i} style={{ color: hot.test(w.w.replace(/[.,!?]$/g, "")) ? color.amberHot : color.ink, opacity: t >= w.t0 ? 1 : 0.5 }}>
              {w.w.replace(/\.$/, "")}{i < chunk!.words.length - 1 ? " " : ""}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Push cut wrapper: incoming scales down from 1.14 with outExpo, outgoing pushes in over 0.16 s. */
export const Shot: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) => {
  if (t < a || t >= b) return null;
  const inP = a === 0 ? 1 : prog(t, a, 0.38, outX);
  const outP = prog(t, b - 0.16, 0.16, ease.inCubic);
  return <AbsoluteFill style={{ transform: `scale(${lerp(1.14, 1, inP) * (1 + outP * 0.3)})`, opacity: 1 - outP * 0.5 }}>{children}</AbsoluteFill>;
};

/** Closing share prompt: an arrow that sends a card off-screen. */
export const ShareCTA: React.FC<{ t: number; a: number; label: string }> = ({ t, a, label }) => {
  const p = prog(t, a, 0.5, outX), fly = prog(t, a + 1.4, 0.6, ease.inCubic);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", opacity: p }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "22px 34px", borderRadius: 40, background: color.amber, color: INK,
        fontFamily: font.display, fontWeight: 800, fontSize: 44, transform: `translate(${fly * 700}px, ${(1 - p) * 30 - fly * 160}px) rotate(${-fly * 12}deg)` }}>
        <svg width={52} height={52} viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
        {label}
      </div>
    </div>
  );
};

/** Texture pass over every shot: drifting halftone dots, live film grain, vignette. No brand mark. */
export const Texture: React.FC<{ frame: number; dots?: string }> = ({ frame, dots = "rgba(243,241,236,0.05)" }) => {
  const g = frame % 4, ox = (frame * 37) % 512, oy = (frame * 53) % 512;
  const drift = (frame * 0.6) % 28;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <pattern id="tx-dots" width={28} height={28} patternUnits="userSpaceOnUse" patternTransform={`translate(${drift} ${drift * 0.5}) rotate(20)`}>
            <circle cx={14} cy={14} r={2.2} fill={dots} />
          </pattern>
        </defs>
        <rect width={1080} height={1920} fill="url(#tx-dots)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 85% at 50% 42%, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Img key={i} src={staticFile(`brand/grain_${g}.png`)} style={{ position: "absolute", width: 512, height: 512, left: (i % 4) * 512 - ox, top: Math.floor(i / 4) * 512 - oy }} />
        ))}
      </div>
    </>
  );
};

/** Faint market line running behind a set, always moving left. */
export const TickerLine: React.FC<{ t: number; y: number; tint?: string; amp?: number }> = ({ t, y, tint = "rgba(243,241,236,0.08)", amp = 60 }) => {
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = i * 40 - ((t * 90) % 40);
    const u = i + Math.floor(t * 90 / 40);
    return `${i ? "L" : "M"} ${x} ${y - Math.sin(u * 0.7) * amp * 0.4 - Math.sin(u * 0.23) * amp - u * 0.4 % 30}`;
  }).join(" ");
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}><path d={pts} fill="none" stroke={tint} strokeWidth={5} strokeLinejoin="round" /></svg>;
};
