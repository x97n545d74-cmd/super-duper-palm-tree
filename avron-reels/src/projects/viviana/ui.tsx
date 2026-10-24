import React from "react";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { CLOSES } from "./config";

/** Exchange filing rendered as a paper document: real excerpt, real timestamp. */
export const Filing: React.FC<{
  t: number; title: string; stamp: string; tag: string; children: React.ReactNode;
  style?: React.CSSProperties; dim?: number;
}> = ({ title, stamp, tag, children, style, dim = 0 }) => (
  <div style={{
    width: 912, borderRadius: 10, background: "linear-gradient(175deg, #F2EFE7, #E4E0D5)", color: "#1B1C1F",
    boxShadow: "0 50px 90px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.6) inset", padding: "34px 40px 38px",
    filter: `brightness(${1 - dim * 0.55})`, ...style,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: font.mono, fontSize: 21, letterSpacing: "0.06em", color: "#5B5D63" }}>
      <span>{tag}</span>
      <span style={{ background: "#1B1C1F", color: "#F2EFE7", padding: "6px 12px", borderRadius: 4 }}>{stamp}</span>
    </div>
    <div style={{ height: 1.5, background: "#1B1C1F22", margin: "18px 0 20px" }} />
    <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 34, lineHeight: 1.2, letterSpacing: "-0.01em" }}>{title}</div>
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 31, lineHeight: 1.45, marginTop: 18, color: "#2A2B2F" }}>{children}</div>
  </div>
);

/** Marker highlight that sweeps across inline text. */
export const Mark: React.FC<{ t: number; start: number; dur?: number; tint?: string; children: React.ReactNode; strike?: boolean }> = ({
  t, start, dur = 0.6, tint = "rgba(240,190,70,0.75)", children, strike,
}) => {
  const p = ease.inOutCubic(clamp01((t - start) / dur));
  return (
    <span style={{
      backgroundImage: strike ? `linear-gradient(${tint}, ${tint})` : `linear-gradient(transparent 12%, ${tint} 12%, ${tint} 92%, transparent 92%)`,
      backgroundSize: `${p * 100}% ${strike ? "4px" : "100%"}`, backgroundRepeat: "no-repeat",
      backgroundPosition: strike ? "0 58%" : "0 0", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", padding: "0 2px",
    }}>{children}</span>
  );
};

/** Price line from the real closes; draws up to fractional index `upto`, gold before the peak and red after. */
export const PriceChart: React.FC<{ upto: number; peak: number; w?: number; h?: number; from?: number; focus?: [number, number]; glow?: number }> = ({
  upto, peak, w = 912, h = 560, from = 0, focus, glow = 0,
}) => {
  const data = CLOSES.slice(from);
  const lo = 650, hi = 930;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - lo) / (hi - lo)) * h;
  const pt = (f: number) => {
    const i = Math.min(data.length - 1, Math.floor(f)), k = f - i;
    const v = i + 1 < data.length ? lerp(data[i][1], data[i + 1][1], k) : data[i][1];
    return [lerp(x(i), x(Math.min(i + 1, data.length - 1)), k), y(v)] as const;
  };
  const path = (a: number, b: number) => {
    if (b <= a) return "";
    const pts: (readonly [number, number])[] = [pt(a)];
    for (let i = Math.ceil(a); i < b; i++) pts.push(pt(i));
    pts.push(pt(b));
    return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  };
  const pk = peak - from;
  const gold = path(0, Math.min(upto, pk));
  const red = upto > pk ? path(pk, upto) : "";
  const head = pt(Math.max(0, upto));
  const area = gold ? `${gold} L${pt(Math.min(upto, pk))[0]},${h} L0,${h} Z` : "";
  return (
    <svg width={w} height={h + 60} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color.goldHot} stopOpacity="0.28" />
          <stop offset="1" stopColor={color.goldHot} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[700, 800, 900].map((v) => (
        <g key={v}>
          <line x1={0} x2={w} y1={y(v)} y2={y(v)} stroke="rgba(243,241,236,0.10)" strokeDasharray="4 8" />
          <text x={w} y={y(v) - 10} textAnchor="end" fontFamily="JetBrains Mono" fontSize={20} fill={color.inkFaint}>₹{v}</text>
        </g>
      ))}
      {focus && (
        <rect x={x(focus[0] - from) - 14} y={0} width={x(focus[1] - from) - x(focus[0] - from) + 28} height={h} fill="rgba(240,82,79,0.08)" rx={8} />
      )}
      {area && <path d={area} fill="url(#ga)" />}
      <path d={gold} fill="none" stroke={color.goldHot} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      {red && <path d={red} fill="none" stroke="#FF5A55" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 ${8 + glow * 18}px rgba(255,80,70,0.7))` }} />}
      <circle cx={head[0]} cy={head[1]} r={11} fill={upto > pk ? "#FF5A55" : color.goldHot} />
      <circle cx={head[0]} cy={head[1]} r={24} fill="none" stroke={upto > pk ? "#FF5A55" : color.goldHot} strokeOpacity={0.4} strokeWidth={3} />
      {data.map(([d], i) => ([0, 4, 8].includes(i) || i === data.length - 1 || i === pk) && (
        <text key={d} x={x(i)} y={h + 44} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={19}
          fill={i === pk ? color.goldHot : color.inkFaint}>{d.toUpperCase()}</text>
      ))}
    </svg>
  );
};

/** Big tabular figure with a label underneath. */
export const Figure: React.FC<{ value: React.ReactNode; label: string; tint?: string; size?: number; p?: number; style?: React.CSSProperties }> = ({
  value, label, tint = color.ink, size = 150, p = 1, style,
}) => (
  <div style={{ opacity: p, transform: `translateY(${(1 - p) * 30}px)`, ...style }}>
    <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.95, color: tint, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    <div style={{ fontFamily: font.mono, fontSize: 24, letterSpacing: "0.14em", color: color.inkDim, marginTop: 14, textTransform: "uppercase" }}>{label}</div>
  </div>
);

export const fadeWin = (t: number, a: number, b: number, fi = 0.35, fo = 0.3) =>
  prog(t, a, fi) * (1 - prog(t, b - fo, fo, ease.inCubic));
