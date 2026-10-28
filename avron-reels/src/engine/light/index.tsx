import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, lerp } from "../anim";
import { curve } from "../../brand/ui";

/*
 * AVRON light kit (style test, 2026-10-28): the user chose "bright & clean (Stripe/Apple)" after rejecting the dark CSS and 3D studies.
 * Light canvas with a slow multi-colour gradient field, white product cards with layered soft shadows, detailed UI parts,
 * and kinetic typography (per-character masked reveals with blur, gradient words, rolling words).
 * Brand colours are AVRON's own (indigo / cyan / coral), not any other company's.
 */

export const L = {
  bg: "#F5F6FA",
  card: "#FFFFFF",
  ink: "#0B1220",
  ink2: "#5B6475",
  ink3: "#98A1B2",
  line: "rgba(11,18,32,0.07)",
  fill: "#F1F3F8",
  indigo: "#4F46E5",
  violet: "#8B5CF6",
  cyan: "#06B6D4",
  coral: "#FF7A59",
  up: "#12B76A",
  down: "#F04438",
  shadow: "0 1px 1px rgba(11,18,32,0.04), 0 10px 20px -6px rgba(11,18,32,0.08), 0 40px 80px -20px rgba(11,18,32,0.18)",
  shadowLift: "0 2px 2px rgba(11,18,32,0.05), 0 18px 36px -8px rgba(11,18,32,0.14), 0 70px 120px -30px rgba(11,18,32,0.28)",
  grad: "linear-gradient(100deg, #4F46E5 0%, #8B5CF6 35%, #06B6D4 70%, #FF7A59 100%)",
  sans: "'Inter Display', 'Inter', sans-serif",
  text: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const k = (t: number, a: number, d = 0.6, fn: (x: number) => number = curve.out) => fn(clamp01((t - a) / d));

/* ------------------------------------------------------------------ canvas */

/** Light canvas with three soft colour fields drifting slowly (the gradient never stops moving). */
export const LightCanvas: React.FC<{ t: number; intensity?: number; children?: React.ReactNode }> = ({ t, intensity = 1, children }) => {
  const blob = (c: string, x: number, y: number, r: number, o: number) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, rgba(255,255,255,0) 68%)`, opacity: o * intensity }} />
  );
  return (
    <AbsoluteFill style={{ background: L.bg, overflow: "hidden" }}>
      {blob("#C7C3FF", 180 + 120 * Math.sin(t * 0.35), 300 + 80 * Math.cos(t * 0.3), 640, 0.85)}
      {blob("#B6F0FA", 950 + 90 * Math.cos(t * 0.28), 820 + 140 * Math.sin(t * 0.33), 620, 0.8)}
      {blob("#FFD6C8", 300 + 140 * Math.cos(t * 0.31), 1650 + 90 * Math.sin(t * 0.27), 600, 0.75)}
      {children}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ kinetic type */

/**
 * Per-character reveal: every word is a mask, each character rises from below with a slight rotation and a blur that clears.
 * `out` sends the characters up and out with the same stagger.
 */
export const Chars: React.FC<{ t: number; a: number; text: string; size: number; weight?: number; color?: string; gradient?: boolean; stagger?: number; out?: number; track?: number; style?: React.CSSProperties }> = ({
  t, a, text, size, weight = 900, color = L.ink, gradient, stagger = 0.028, out, track = -0.055, style,
}) => {
  let i = 0;
  return (
    <div style={{ fontFamily: L.sans, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: `${track}em`, color, whiteSpace: "nowrap", ...style }}>
      {text.split(" ").map((w, wi) => (
        <span key={wi} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.16em", marginBottom: "-0.16em", paddingRight: "0.04em", marginRight: wi < text.split(" ").length - 1 ? "0.22em" : 0, verticalAlign: "top" }}>
          {w.split("").map((ch) => {
            const j = i++;
            const p = k(t, a + j * stagger, 0.7);
            const o = out === undefined ? 0 : k(t, out + j * stagger * 0.6, 0.4, curve.in);
            return (
              <span key={j} style={{
                display: "inline-block", transform: `translateY(${(1 - p) * 105 - o * 105}%) rotate(${(1 - p) * 7}deg)`, filter: p < 1 || o > 0 ? `blur(${(1 - p) * 10 + o * 8}px)` : undefined,
                ...(gradient ? { backgroundImage: L.grad, backgroundSize: `${text.length * 0.62}em 100%`, backgroundPosition: `${-j * 0.6}em 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : {}),
              }}>{ch}</span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

/** A word slot that rolls through words (each lands at its time), like a slot machine with blur on the move. */
export const RollWord: React.FC<{ t: number; words: { w: string; at: number }[]; size: number; weight?: number; color?: string; gradient?: boolean }> = ({ t, words, size, weight = 900, color = L.ink, gradient }) => (
  <span style={{ display: "inline-block", position: "relative", overflow: "hidden", height: size * 1.3, verticalAlign: "top", minWidth: size * 3 }}>
    {words.map((wd, i) => {
      const inK = k(t, wd.at, 0.55);
      const next = words[i + 1];
      const outK = next ? k(t, next.at, 0.55) : 0;
      if (t < wd.at - 0.05 || outK >= 1) return null;
      return (
        <span key={wd.w} style={{
          position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", fontFamily: L.sans, fontWeight: weight, fontSize: size, lineHeight: 1.22, letterSpacing: "-0.055em",
          transform: `translateY(${(1 - inK) * 100 - outK * 100}%)`, filter: `blur(${(1 - inK) * 6 + outK * 6}px)`,
          ...(gradient ? { backgroundImage: L.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color }),
        }}>{wd.w}</span>
      );
    })}
  </span>
);

/** Number that counts with tabular figures. */
export const Count: React.FC<{ t: number; a: number; to: number; from?: number; d?: number; fmt?: (n: number) => string }> = ({ t, a, to, from = 0, d = 1.1, fmt = (n) => Math.round(n).toString() }) => (
  <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(lerp(from, to, k(t, a, d)))}</span>
);

/* ------------------------------------------------------------------ UI parts */

export const Card: React.FC<{ x: number; y: number; w: number; h: number; r?: number; lift?: boolean; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, r = 32, lift, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: L.card, borderRadius: r, border: `1px solid ${L.line}`, boxShadow: lift ? L.shadowLift : L.shadow, overflow: "hidden", boxSizing: "border-box", ...style }}>{children}</div>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: "ink" | "soft" | "grad" | "est"; size?: number; style?: React.CSSProperties }> = ({ children, tone = "soft", size = 26, style }) => {
  const s: React.CSSProperties = tone === "ink" ? { background: L.ink, color: "#fff" } : tone === "grad" ? { background: L.grad, color: "#fff" } : tone === "est" ? { background: "transparent", color: L.ink2, border: `2px dashed ${L.ink3}` } : { background: L.fill, color: L.ink2 };
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: L.text, fontWeight: 600, fontSize: size, letterSpacing: "-0.01em", padding: `${size * 0.42}px ${size * 0.8}px`, borderRadius: 999, whiteSpace: "nowrap", ...s, ...style }}>{children}</span>;
};

export const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 22, color = L.ink3, style }) => (
  <span style={{ fontFamily: L.mono, fontWeight: 500, fontSize: size, letterSpacing: "0.04em", textTransform: "uppercase", color, ...style }}>{children}</span>
);

/** Round logo tile with a letter on a gradient (no real logos needed for a style test). */
export const Tile: React.FC<{ letter: string; from: string; to: string; size?: number }> = ({ letter, from, to, size = 84 }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.3, background: `linear-gradient(135deg, ${from}, ${to})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: L.sans, fontWeight: 800, fontSize: size * 0.46, letterSpacing: "-0.04em", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}>{letter}</div>
);

/** Segmented tabs with a sliding white thumb. `active` may be fractional while it slides. */
export const Tabs: React.FC<{ items: string[]; active: number; w: number; h?: number }> = ({ items, active, w, h = 76 }) => {
  const cw = (w - 12) / items.length;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: h / 2, background: L.fill, padding: 6, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 6 + active * cw, top: 6, width: cw, height: h - 12, borderRadius: (h - 12) / 2, background: "#fff", boxShadow: "0 1px 2px rgba(11,18,32,0.08), 0 4px 10px rgba(11,18,32,0.06)" }} />
      <div style={{ position: "relative", display: "flex" }}>
        {items.map((it, i) => (
          <div key={it} style={{ width: cw, height: h - 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: L.text, fontWeight: 600, fontSize: 26, color: Math.abs(active - i) < 0.5 ? L.ink : L.ink3 }}>{it}</div>
        ))}
      </div>
    </div>
  );
};

/** Progress ring with a gradient stroke that fills to `p` (0..1). */
export const Ring: React.FC<{ size: number; stroke?: number; p: number; id?: string }> = ({ size, stroke = 34, p, id = "ring" }) => {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={L.indigo} /><stop offset="50%" stopColor={L.violet} /><stop offset="100%" stopColor={L.cyan} /></linearGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={L.fill} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${C * p} ${C}`} />
    </svg>
  );
};

/** Light-theme cursor: dark arrow with a white outline. Curved travel, press on click, soft ring. */
export const LCursor: React.FC<{ t: number; keys: { t: number; x: number; y: number; click?: boolean }[] }> = ({ t, keys }) => {
  if (t < keys[0].t - 0.2) return null;
  let x = keys[0].x, y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const A = keys[i], B = keys[i + 1];
    if (t >= B.t) { x = B.x; y = B.y; continue; }
    if (t >= A.t) {
      const q = curve.inOut(clamp01((t - A.t) / Math.max(0.2, Math.min(B.t - A.t - 0.12, 0.8))));
      const cx = (A.x + B.x) / 2 - (B.y - A.y) * 0.18, cy = (A.y + B.y) / 2 + (B.x - A.x) * 0.18;
      x = (1 - q) ** 2 * A.x + 2 * (1 - q) * q * cx + q * q * B.x;
      y = (1 - q) ** 2 * A.y + 2 * (1 - q) * q * cy + q * q * B.y;
    }
  }
  const press = keys.some((c) => c.click && t >= c.t && t < c.t + 0.14) ? 0.85 : 1;
  return (
    <>
      {keys.filter((c) => c.click && t >= c.t && t < c.t + 0.55).map((c) => {
        const r = k(t, c.t, 0.55);
        return <div key={c.t} style={{ position: "absolute", left: c.x - 70 * r, top: c.y - 70 * r, width: 140 * r, height: 140 * r, borderRadius: "50%", background: "rgba(79,70,229,0.16)", opacity: 1 - r }} />;
      })}
      <svg width={64} height={78} viewBox="0 0 64 78" style={{ position: "absolute", left: x - 6, top: y - 4, transformOrigin: "6px 4px", transform: `scale(${press})`, opacity: k(t, keys[0].t - 0.2, 0.2), filter: "drop-shadow(0 6px 10px rgba(11,18,32,0.25))" }}>
        <path d="M6 4 L6 60 L21 47 L31 71 L41 66 L31 43 L51 43 Z" fill={L.ink} stroke="#fff" strokeWidth={3.5} strokeLinejoin="round" />
      </svg>
    </>
  );
};
