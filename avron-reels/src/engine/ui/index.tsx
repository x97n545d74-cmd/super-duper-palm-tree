import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, lerp } from "../anim";
import { curve, motion, shape, type, ui } from "../../brand/ui";

/*
 * AVRON UI kit (brand v2, 2026-10-28). Every AVRON reel is told as states of one product: the AVRON app.
 * Rules: brand/BRAND.md. Tokens: src/brand/ui.ts. Every component is a pure function of absolute time t and its cue a.
 * Allowed transitions: Push, ZoomThrough, and panel morphs (interpolate a Panel's box). No fades between shots.
 */

/** Eased progress across [a, a+dur]. */
export const p = (t: number, a: number, dur: number = motion.base, fn: (x: number) => number = curve.out) => fn(clamp01((t - a) / dur));

/** Indian digit grouping: 1234567 → 12,34,567. */
export const inr = (n: number, digits = 0) => n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const txt = (size: number, weight = 700, c: string = ui.ink, track: string = type.tracking.head): React.CSSProperties => ({
  fontFamily: size >= 90 ? type.display : type.text, fontWeight: weight, fontSize: size, letterSpacing: track, lineHeight: 1, color: c,
  fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
});
export const monoTxt = (size: number = type.label, c: string = ui.ink2): React.CSSProperties => ({
  fontFamily: type.mono, fontWeight: 500, fontSize: size, letterSpacing: type.tracking.mono, lineHeight: 1.2, color: c, textTransform: "uppercase",
});

/* ------------------------------------------------------------------ canvas */

/** The only background: warm near-black with a soft top light falloff and fine grain. No grids, no glows, no photos behind UI. */
export const Canvas: React.FC<{ t: number; children?: React.ReactNode }> = ({ t, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(120% 60% at 50% 0%, ${ui.canvasLift} 0%, ${ui.canvas} 62%)` }}>
    {children}
    <Img src={staticFile(`brand/grain_${Math.floor(t * 15) % 4}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.05, mixBlendMode: "screen" }} />
  </AbsoluteFill>
);

/** One camera language: a slow continuous dolly-in on the scene, origin at the subject. */
export const Dolly: React.FC<{ t: number; a: number; b: number; ox?: number; oy?: number; amount?: number; children: React.ReactNode }> = ({ t, a, b, ox = 540, oy = 960, amount = 0.04, children }) => (
  <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `scale(${1 + amount * clamp01((t - a) / (b - a))})` }}>{children}</AbsoluteFill>
);

/* ------------------------------------------------------------------ panel */

type Box = { x: number; y: number; w: number; h: number };
/** Interpolates two boxes: the panel-morph transition (one panel becomes the next layout). */
export const morph = (from: Box, to: Box, k: number): Box => ({ x: lerp(from.x, to.x, k), y: lerp(from.y, to.y, k), w: lerp(from.w, to.w, k), h: lerp(from.h, to.h, k) });

/** The AVRON panel. Enters by rising 48 px and scaling .96 → 1; exits by the in-curve. Optional 2.5D tilt for hero shots. */
export const Panel: React.FC<{
  t: number; a: number; box: Box; out?: number; tilt?: { x: number; y: number }; pad?: number; children?: React.ReactNode; style?: React.CSSProperties;
}> = ({ t, a, box, out, tilt, pad = shape.pad, children, style }) => {
  const k = p(t, a, motion.base);
  const o = out === undefined ? 0 : p(t, out, motion.micro + 0.1, curve.in);
  const rot = tilt ? `perspective(2400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : "";
  return (
    <div style={{
      position: "absolute", left: box.x, top: box.y, width: box.w, height: box.h, boxSizing: "border-box", padding: pad,
      background: ui.surface, borderRadius: shape.radius, border: `1.5px solid ${ui.hairline}`, boxShadow: shape.shadow, overflow: "hidden",
      opacity: k * (1 - o), transform: `${rot} translateY(${(1 - k) * 48 - o * 30}px) scale(${0.96 + 0.04 * k})`, ...style,
    }}>{children}</div>
  );
};

/** Masked line reveal: the text rises out of its own baseline. */
export const Reveal: React.FC<{ t: number; a: number; dur?: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, a, dur = motion.base + 0.1, out, children, style }) => {
  const k = p(t, a, dur);
  const o = out === undefined ? 0 : p(t, out, 0.28, curve.in);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - k) * 110 - o * 110}%)` }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ data */

/** Counts to a value with tabular figures. Format with fmt (default Indian grouping). */
export const Counter: React.FC<{ t: number; a: number; to: number; from?: number; dur?: number; fmt?: (n: number) => string; style?: React.CSSProperties }> = ({ t, a, to, from = 0, dur = 0.9, fmt = (n) => inr(Math.round(n)), style }) => (
  <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{fmt(lerp(from, to, p(t, a, dur)))}</span>
);

/** Small mono chip: tickers, dates, "ANUMAAN" labels. active = gold outline (the selected tab state). */
export const Chip: React.FC<{ children: React.ReactNode; active?: boolean; tone?: "up" | "down" | "est"; style?: React.CSSProperties }> = ({ children, active, tone, style }) => {
  const c = tone === "up" ? ui.up : tone === "down" ? ui.down : active ? ui.gold : ui.ink2;
  return (
    <span style={{ ...monoTxt(type.label, c), display: "inline-block", padding: "12px 20px", borderRadius: shape.radiusSm, border: `1.5px ${tone === "est" ? "dashed" : "solid"} ${active ? ui.gold : ui.hairlineStrong}`, background: active ? "rgba(226,184,92,0.08)" : ui.surface2, ...style }}>{children}</span>
  );
};

/** Change pill: ▲/▼ with the data colour. */
export const Delta: React.FC<{ v: string; dir: "up" | "down"; size?: number }> = ({ v, dir, size = 40 }) => (
  <span style={{ ...txt(size, 700, dir === "up" ? ui.up : ui.down, type.tracking.body), padding: `${size * 0.22}px ${size * 0.4}px`, borderRadius: 999, background: dir === "up" ? "rgba(61,214,140,0.12)" : "rgba(255,90,95,0.12)" }}>
    {dir === "up" ? "▲" : "▼"} {v}
  </span>
);

/** A list row inside a panel: label left, value right, hairline below. hl = cursor hover state. */
export const Row: React.FC<{ t: number; a: number; label: React.ReactNode; sub?: string; value?: React.ReactNode; hl?: number; h?: number }> = ({ t, a, label, sub, value, hl = 0, h = 150 }) => {
  const k = p(t, a);
  return (
    <div style={{ height: h, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", margin: "0 -28px", borderRadius: shape.radiusSm,
      background: `rgba(255,255,255,${0.045 * hl})`, borderBottom: `1.5px solid ${ui.hairline}`, opacity: k, transform: `translateY(${(1 - k) * 24}px)` }}>
      <div>
        <div style={txt(type.title, 700)}>{label}</div>
        {sub && <div style={{ ...monoTxt(), marginTop: 14 }}>{sub}</div>}
      </div>
      {value}
    </div>
  );
};

/** Line chart that draws itself; dashed + grey when it is a forecast. The head carries a dot and its value. */
export const LineChart: React.FC<{
  t: number; a: number; w: number; h: number; pts: number[]; dur?: number; c?: string; dashedFrom?: number; headLabel?: (i: number) => string;
}> = ({ t, a, w, h, pts, dur = 1.3, c = ui.ink, dashedFrom, headLabel }) => {
  const k = p(t, a, dur, curve.inOut);
  const min = Math.min(...pts), max = Math.max(...pts);
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * w, h - ((v - min) / (max - min || 1)) * h] as const);
  const n = (pts.length - 1) * k;
  const i0 = Math.floor(n), f = n - i0;
  const head = i0 >= pts.length - 1 ? xy[pts.length - 1] : [lerp(xy[i0][0], xy[i0 + 1][0], f), lerp(xy[i0][1], xy[i0 + 1][1], f)] as const;
  const drawn = [...xy.slice(0, i0 + 1), head];
  const solidEnd = dashedFrom === undefined ? drawn.length : Math.min(drawn.length, dashedFrom + 1);
  const path = (s: readonly (readonly [number, number])[]) => s.map(([x, y], j) => `${j ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      {[0, 0.5, 1].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={ui.hairline} strokeWidth={1.5} />)}
      <path d={`${path(drawn.slice(0, solidEnd))}L${drawn[solidEnd - 1][0]},${h}L0,${h}Z`} fill={c} opacity={0.07} />
      <path d={path(drawn.slice(0, solidEnd))} fill="none" stroke={c} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      {dashedFrom !== undefined && drawn.length > dashedFrom + 1 && (
        <path d={path(drawn.slice(dashedFrom))} fill="none" stroke={ui.estimate} strokeWidth={5} strokeDasharray="16 14" strokeLinecap="round" />
      )}
      <circle cx={head[0]} cy={head[1]} r={13 * clamp01(k * 8)} fill={c} />
      {headLabel && k > 0.05 && (
        <text x={head[0]} y={head[1] - 34} textAnchor={head[0] > w * 0.7 ? "end" : "middle"} fontFamily={type.mono} fontSize={type.label} fill={ui.ink}>{headLabel(Math.round(n))}</text>
      )}
    </svg>
  );
};

/** Horizontal bars for a then → now comparison. est = dashed outline instead of fill. */
export const Bars: React.FC<{ t: number; a: number; w: number; items: { label: string; v: number; shown: string; est?: boolean; c?: string }[] }> = ({ t, a, w, items }) => {
  const max = Math.max(...items.map((i) => i.v));
  return (
    <div>
      {items.map((it, j) => {
        const k = p(t, a + j * 0.35, motion.large);
        const bw = Math.max(8, (it.v / max) * w * k);
        return (
          <div key={it.label} style={{ marginBottom: 44 }}>
            <div style={{ ...monoTxt(), marginBottom: 16 }}>{it.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: bw, height: 72, borderRadius: 18, background: it.est ? "transparent" : it.c ?? ui.ink, border: it.est ? `3px dashed ${ui.estimate}` : undefined, boxSizing: "border-box" }} />
              <div style={{ ...txt(type.h2, 800), opacity: clamp01(k * 3 - 2) }}>{it.shown}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ trust */

/**
 * The receipt: AVRON's signature trust move. A filing or report card opens, the key line is quoted
 * word for word and a gold highlighter sweeps it. The other lines are neutral bars, never fake text.
 */
export const Receipt: React.FC<{ t: number; a: number; box: Box; source: string; date: string; quote: string; out?: number }> = ({ t, a, box, source, date, quote, out }) => {
  const sweep = p(t, a + 0.55, 0.6, curve.inOut);
  const bar = (wPct: number, i: number) => <div key={i} style={{ height: 22, width: `${wPct}%`, borderRadius: 11, background: ui.surface2, marginBottom: 26, opacity: p(t, a + 0.1 + i * motion.stagger) }} />;
  return (
    <Panel t={t} a={a} box={box} out={out}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 46 }}>
        <span style={monoTxt(type.label, ui.ink)}>{source}</span>
        <span style={monoTxt()}>{date}</span>
      </div>
      {[92, 78, 86].map(bar)}
      <div style={{ position: "relative", margin: "18px 0 44px" }}>
        <div style={{ position: "absolute", left: -10, top: -6, bottom: -6, width: `calc(${sweep * 100}% + 20px)`, background: ui.goldSoft, borderRadius: 8 }} />
        <div style={{ position: "relative", ...txt(type.body + 4, 600, ui.ink, type.tracking.body), whiteSpace: "normal", lineHeight: 1.3 }}>{quote}</div>
      </div>
      {[84, 60].map((w, i) => bar(w, i + 3))}
    </Panel>
  );
};

/** Source tag that sits under a stat. */
export const Source: React.FC<{ t: number; a: number; text: string; est?: boolean }> = ({ t, a, text, est }) => (
  <div style={{ ...monoTxt(), opacity: p(t, a) }}>{est ? "ANUMAAN · " : "SOURCE · "}{text}</div>
);

/** Top toast: the "AVRON reading" note. Slides from the top safe zone, then leaves upward. */
export const Toast: React.FC<{ t: number; a: number; out: number; text: string; y?: number }> = ({ t, a, out, text, y = 250 }) => {
  const k = p(t, a), o = p(t, out, 0.3, curve.in);
  return (
    <div style={{ position: "absolute", left: shape.gutter, right: shape.gutter, top: y, display: "flex", justifyContent: "center", transform: `translateY(${(1 - k) * -60 - o * 60}px)`, opacity: k * (1 - o) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "26px 36px", borderRadius: 999, background: ui.surface2, border: `1.5px solid ${ui.hairlineStrong}`, boxShadow: shape.shadow }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: ui.gold }} />
        <span style={txt(type.body, 600, ui.ink, type.tracking.body)}>{text}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ cursor */

export type CursorKey = { t: number; x: number; y: number; click?: boolean };
/**
 * The AVRON cursor: white arrow with a gold dot. Travels between keys on the in-out curve (never linear),
 * presses to .86 for 0.08 s on a click and leaves a thin white ring. Hidden before the first key.
 */
export const Cursor: React.FC<{ t: number; keys: CursorKey[]; out?: number }> = ({ t, keys, out }) => {
  if (t < keys[0].t - 0.25) return null;
  let x = keys[0].x, y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const A = keys[i], B = keys[i + 1];
    if (t >= A.t && t < B.t) {
      const k = curve.inOut(clamp01((t - A.t) / Math.min(B.t - A.t, 0.75)));
      x = lerp(A.x, B.x, k); y = lerp(A.y, B.y, k);
    } else if (t >= B.t) { x = B.x; y = B.y; }
  }
  const clicks = keys.filter((k) => k.click && t >= k.t && t < k.t + 0.5);
  const press = keys.some((k) => k.click && t >= k.t && t < k.t + 0.16) ? 0.86 : 1;
  const appear = p(t, keys[0].t - 0.25, 0.25);
  const leave = out === undefined ? 0 : p(t, out, 0.25, curve.in);
  return (
    <>
      {clicks.map((c) => {
        const r = p(t, c.t, 0.5);
        return <div key={c.t} style={{ position: "absolute", left: c.x - 60 * r, top: c.y - 60 * r, width: 120 * r, height: 120 * r, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", opacity: 1 - r }} />;
      })}
      <svg width={70} height={84} viewBox="0 0 70 84" style={{ position: "absolute", left: x - 6, top: y - 4, transformOrigin: "6px 4px", transform: `scale(${press})`, opacity: appear * (1 - leave), filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.55))" }}>
        <path d="M6 4 L6 64 L22 50 L33 76 L44 71 L33 46 L54 46 Z" fill={ui.ink} stroke={ui.canvas} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={56} cy={68} r={7} fill={ui.gold} />
      </svg>
    </>
  );
};

/* ------------------------------------------------------------------ transitions */

/**
 * Push cut: the outgoing shot leaves upward and the incoming rises in, both on the in-out curve, over motion.base.
 * Wrap the reel in <CameraMotionBlur> so the push carries real blur. Returns the style for the shot that is `side`.
 */
export const push = (t: number, at: number, side: "out" | "in", dist = 1920): React.CSSProperties => {
  const k = curve.inOut(clamp01((t - at) / motion.base));
  return { transform: `translateY(${side === "out" ? -k * dist : (1 - k) * dist}px)` };
};

/** Zoom-through: the camera dives into the element at (ox, oy) and the next shot starts from inside it. */
export const zoomThrough = (t: number, at: number, side: "out" | "in", ox: number, oy: number): React.CSSProperties => {
  const k = curve.inOut(clamp01((t - at) / motion.large));
  return side === "out"
    ? { transformOrigin: `${ox}px ${oy}px`, transform: `scale(${1 + 5 * k})`, opacity: 1 - clamp01((k - 0.55) / 0.3) }
    : { transformOrigin: "540px 960px", transform: `scale(${0.82 + 0.18 * clamp01((k - 0.45) / 0.55)})`, opacity: clamp01((k - 0.45) / 0.3) };
};

/* ------------------------------------------------------------------ chrome */

/** Wordmark: AVRON in Inter 800, wide tracking, gold dot. Small, bottom-left, never animated as an opener. */
export const Wordmark: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 34, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, ...style }}>
    <div style={{ width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: ui.gold }} />
    <span style={{ fontFamily: type.text, fontWeight: 800, fontSize: size, letterSpacing: "0.22em", color: ui.ink }}>AVRON</span>
  </div>
);

/** Caption pill on the seam (y≈1395 band). One phrase at a time, the spoken key word in gold. */
export const Caption: React.FC<{ text: string; key_?: string; y?: number }> = ({ text, key_, y = 1395 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "18px 30px", borderRadius: 20, background: "rgba(10,10,11,0.82)", ...txt(46, 700, ui.ink, type.tracking.body) }}>
      {key_ ? text.split(key_).flatMap((s, i, arr) => (i < arr.length - 1 ? [s, <span key={i} style={{ color: ui.gold }}>{key_}</span>] : [s])) : text}
    </div>
  </div>
);

/** End card: the poll question as an app card plus the wordmark. The CTA is a question the viewer can answer. */
export const Poll: React.FC<{ t: number; a: number; q: string; options: string[]; hover?: number }> = ({ t, a, q, options, hover = -1 }) => (
  <Panel t={t} a={a} box={{ x: shape.gutter, y: 560, w: 1080 - 2 * shape.gutter, h: 230 + options.length * 170 }}>
    <div style={{ ...txt(type.h2, 800), marginBottom: 40 }}>{q}</div>
    {options.map((o, i) => (
      <div key={o} style={{ height: 130, marginBottom: 40, borderRadius: shape.radiusSm, display: "flex", alignItems: "center", padding: "0 36px",
        border: `1.5px solid ${i === hover ? ui.gold : ui.hairlineStrong}`, background: i === hover ? "rgba(226,184,92,0.08)" : ui.surface2,
        opacity: p(t, a + 0.15 + i * motion.stagger * 2), ...txt(type.title, 700, i === hover ? ui.gold : ui.ink) }}>
        <span style={{ ...monoTxt(type.label, ui.ink3), marginRight: 28 }}>{String.fromCharCode(65 + i)}</span>{o}
      </div>
    ))}
  </Panel>
);

/** Fixed disclaimer line for every end card. */
export const Disclaimer: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...monoTxt(26, ui.ink3), opacity: p(t, a) }}>Anuman hai, guarantee nahi · not investment advice</div>
);
