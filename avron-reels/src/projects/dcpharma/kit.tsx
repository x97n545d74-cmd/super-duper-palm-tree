import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp, prog } from "../../engine/anim";

/*
 * Shared look for the data centre + pharma reel (ENGINE_REPORT.md Section 4).
 * Palette: black #0A0A0B, white type, grey #8A8F98, AVRON red #E5484D (falls), green #3DD68C (pharma index only),
 * cream paper #EFE6D2 for the collage. Inter at -2% tracking, JetBrains Mono source tags at 28 px / 60% white.
 * BlueGrid, Desk and Notif are adapted copies of src/projects/musk/Reel.tsx; Burst of anchor/ReelV2.tsx S2b.
 */

export const BG = "#0A0A0B";
export const INK = "#FFFFFF";
export const GREY = "#8A8F98";
export const RED = "#E5484D";
export const GREEN = "#3DD68C";
export const PAPER = "#EFE6D2";
export const INK_D = "#16182A";
export const GRASS = "#127A5C";
export const sans = "'Inter', sans-serif";
export const mono = "'JetBrains Mono', monospace";
export const G = 84; // side gutter

export const sx = (size: number, weight = 900, c = INK): React.CSSProperties => ({
  fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.02em", lineHeight: 1, color: c, whiteSpace: "nowrap",
});
export const lbl = (size = 54, c = GREY, weight = 800): React.CSSProperties => ({
  fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.01em", lineHeight: 1.08, color: c,
});

/** Masked type reveal: the line rises out of its own baseline. */
export const Rise: React.FC<{ t: number; a: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; out?: number }> = ({ t, a, dur = 0.5, children, style, out }) => {
  const p = ease.outExpo(clamp01((t - a) / dur));
  const o = out === undefined ? 0 : ease.inCubic(clamp01((t - out) / 0.3));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 115 - o * 115}%)` }}>{children}</div>
    </div>
  );
};

/** Source tag: 28 px mono, 60% white, bottom-left above the Reels caption zone. */
export const Source: React.FC<{ t: number; a: number; text: string; est?: string; dark?: boolean; out?: number }> = ({ t, a, text, est, dark, out }) => (
  <div style={{ position: "absolute", left: G, right: G, bottom: 1920 - 1405, opacity: prog(t, a, 0.4) * (out === undefined ? 1 : 1 - prog(t, out, 0.25)),
    fontFamily: mono, fontWeight: 500, fontSize: 28, lineHeight: 1.35, letterSpacing: "0.01em", color: dark ? "rgba(22,24,42,0.62)" : "rgba(255,255,255,0.6)" }}>
    {text}
    {est && <span style={{ color: RED, marginLeft: 12 }}>{est}</span>}
  </div>
);

/** Slow push (2% per second) used by every shot: one camera language. */
export const slowPush = (t: number, a: number, ox = 540, oy = 960): React.CSSProperties => ({
  transform: `scale(${1 + 0.02 * Math.max(0, t - a)})`, transformOrigin: `${ox}px ${oy}px`,
});

/** Dashed segment between two verified points, drawn on with progress p (0..1). */
export const DashedLine: React.FC<{ x1: number; y1: number; x2: number; y2: number; p: number; c: string; w?: number; dash?: string }> = ({ x1, y1, x2, y2, p, c, w = 6, dash = "22 16" }) => (
  <line x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={c} strokeWidth={w} strokeDasharray={dash} strokeLinecap="butt" />
);

/* ------------------------------------------------------------------ backgrounds (adapted from the user's references) */

/** Blue grid (ref 03/04, from musk/Reel.tsx BlueGrid), toned down so the red line owns the frame. */
export const BlueGrid: React.FC<{ t: number; tint?: string }> = ({ t, tint = "#1F2BBF" }) => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #000 0%, #000 34%, ${tint}40 72%, ${tint}99 100%)` }} />
    <div style={{ position: "absolute", inset: -60, backgroundImage: "linear-gradient(rgba(255,255,255,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)",
      backgroundSize: "60px 60px", transform: `translateY(${(t * 12) % 60}px)` }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #000 0%, transparent 38%)" }} />
  </AbsoluteFill>
);

/** Wooden desk with a phone (ref 10, from musk/Reel.tsx Desk). The phone stands at a gentle angle so the lock screen reads. */
export const Desk: React.FC<{ t: number; phone?: number; children?: React.ReactNode }> = ({ t, phone = 1, children }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #1A120C 0%, #4E301C 30%, #7A4B2A 62%, #5A3520 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: "repeating-linear-gradient(92deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 26px, rgba(255,220,180,0.10) 26px 29px, transparent 29px 61px)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, background: "linear-gradient(180deg, rgba(10,10,11,0.97) 0%, rgba(10,10,11,0.85) 55%, rgba(10,10,11,0) 100%)" }} />
    {children}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 60%, transparent 45%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
  </AbsoluteFill>
);

/** The phone on the desk with its lock screen. */
export const Phone: React.FC<{ t: number; o?: number; children?: React.ReactNode }> = ({ t, o = 1, children }) => (
  <div style={{ position: "absolute", left: 540 - 250, top: 700, width: 500, height: 980, perspective: 1600, opacity: o, transform: `translateX(${Math.sin(t * 0.3) * 4}px)` }}>
    <div style={{ width: "100%", height: "100%", borderRadius: 64, background: "linear-gradient(160deg, #1C1D21, #0B0C0E)", border: "7px solid #2A2B30",
      transform: "rotateX(24deg)", transformOrigin: "50% 100%", boxShadow: "0 50px 70px rgba(0,0,0,0.55)" }}>
      <div style={{ position: "relative", margin: 18, height: 930, borderRadius: 48, overflow: "hidden", background: "linear-gradient(180deg, #1B2030 0%, #0D0F16 100%)" }}>
        {children}
      </div>
    </div>
  </div>
);

/** Glass notification bubble (ref 10, from musk/Reel.tsx Notif). Body is optional for the short ones. */
export const Notif: React.FC<{ y: number; p: number; app: string; title: string; body?: string; icon: string; x?: number }> = ({ y, p, app, title, body, icon, x = 0 }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: y, opacity: clamp01(p * 1.6), transform: `translate(${x}px, ${(1 - p) * -50}px) scale(${lerp(0.94, 1, p)})`,
    padding: body ? "20px 26px" : "16px 26px", borderRadius: 30, background: "rgba(245,243,238,0.9)", boxShadow: "0 22px 46px rgba(0,0,0,0.35)", display: "flex", gap: 20, alignItems: body ? "flex-start" : "center" }}>
    <div style={{ width: 62, height: 62, borderRadius: 16, background: INK_D, display: "flex", alignItems: "center", justifyContent: "center", ...sx(32, 900, "#fff"), flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...sx(36, 900, INK_D) }}>{title}</span>
        <span style={{ fontFamily: mono, fontSize: 22, color: "rgba(22,24,42,0.5)" }}>{app}</span>
      </div>
      {body && <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 32, lineHeight: 1.25, letterSpacing: "-0.01em", color: INK_D, marginTop: 8 }}>{body}</div>}
    </div>
  </div>
);

/** Comic burst (ref 02, from anchor/ReelV2.tsx S2b): yellow halftone, orange spikes, white cloud. pop 0..1, k = collapse 0..1. */
export const Burst: React.FC<{ t: number; a: number; pop: number; k: number; cy?: number }> = ({ t, a, pop, k, cy = 860 }) => {
  const spikes = Array.from({ length: 22 }).map((_, i) => {
    const th = (i / 22) * Math.PI * 2 + 0.2, r1 = 380, r2 = 1600, w = 0.05 + (i % 3) * 0.02;
    const pt = (r: number, d: number) => `${540 + Math.cos(th + d) * r},${cy + Math.sin(th + d) * r}`;
    return `M ${pt(r1, 0)} L ${pt(r2, -w)} L ${pt(r2, w)} Z`;
  });
  const cloud = [[0, 0, 300], [-240, 50, 200], [240, 50, 205], [-140, -160, 190], [150, -170, 200], [-310, -70, 140], [320, -60, 145], [0, 200, 200], [-200, 190, 150], [210, 180, 150]];
  return (
    <AbsoluteFill style={{ background: "#F7DD6A", backgroundImage: "radial-gradient(rgba(240,138,43,0.35) 3px, transparent 3.5px)", backgroundSize: "26px 26px", opacity: 1 - k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g opacity={pop} transform={`rotate(${Math.max(0, t - a) * 6} 540 ${cy})`}>{spikes.map((d, i) => <path key={i} d={d} fill="#F08A2B" opacity={0.9} />)}</g>
        <g opacity={pop > 0 ? 1 : 0} transform={`translate(540 ${cy}) scale(${lerp(0.15, 1, pop)} ${lerp(0.15, 1, pop) * (1 - k * 0.96)})`}>{cloud.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}</g>
      </svg>
    </AbsoluteFill>
  );
};

/** Paper texture on graph paper (ref 01, from anchor/ReelV2.tsx Collage). No gold sun: the palette allows no gold. */
export const GraphPaper: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAPER, backgroundImage: "linear-gradient(rgba(22,24,42,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(22,24,42,0.10) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}>
    {children}
  </AbsoluteFill>
);

/** Server rack line drawing: outline + n slots. fill(i) returns 0..1 fill for slot i (0 = bottom). */
export const Rack: React.FC<{ x: number; y: number; w: number; h: number; draw?: number; n?: number; fill?: (i: number) => number; stroke?: string; slotStroke?: (i: number) => string; sw?: number }> = ({ x, y, w, h, draw = 1, n = 36, fill, stroke = INK, slotStroke, sw = 4 }) => {
  const pad = w * 0.1, top = h * 0.06, inner = h - top * 2, sh = inner / n;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray={`${draw} 1`} />
      <line x1={x + w * 0.12} y1={y + h} x2={x + w * 0.12} y2={y + h + 24} stroke={stroke} strokeWidth={sw} opacity={draw} />
      <line x1={x + w * 0.88} y1={y + h} x2={x + w * 0.88} y2={y + h + 24} stroke={stroke} strokeWidth={sw} opacity={draw} />
      {Array.from({ length: n }).map((_, i) => {
        const sy = y + h - top - (i + 1) * sh;
        const f = fill ? fill(i) : 0;
        const vis = clamp01((draw * n - i) / 2);
        return (
          <g key={i} opacity={vis}>
            <rect x={x + pad} y={sy + sh * 0.18} width={w - pad * 2} height={sh * 0.64} rx={2} fill="none" stroke={slotStroke ? slotStroke(i) : "rgba(255,255,255,0.35)"} strokeWidth={2} />
            {f > 0 && <rect x={x + pad} y={sy + sh * 0.18} width={(w - pad * 2) * f} height={sh * 0.64} rx={2} fill={stroke} />}
          </g>
        );
      })}
    </g>
  );
};

/** Pill capsule line drawing. */
export const Capsule: React.FC<{ cx: number; cy: number; L: number; r: number; rot: number; draw?: number; stroke?: string }> = ({ cx, cy, L, r, rot, draw = 1, stroke = INK }) => (
  <g transform={`rotate(${rot} ${cx} ${cy})`}>
    <rect x={cx - L / 2} y={cy - r} width={L} height={r * 2} rx={r} fill="none" stroke={stroke} strokeWidth={4} pathLength={1} strokeDasharray={`${draw} 1`} />
    <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke={stroke} strokeWidth={4} opacity={clamp01(draw * 2 - 1)} />
    <path d={`M ${cx - L / 2 + r * 0.55} ${cy - r * 0.45} Q ${cx - L / 2 + r * 0.35} ${cy} ${cx - L / 2 + r * 0.55} ${cy + r * 0.45}`} fill="none" stroke={stroke} strokeWidth={3} opacity={clamp01(draw * 2 - 1) * 0.6} />
  </g>
);
