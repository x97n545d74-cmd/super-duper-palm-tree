import React from "react";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp } from "../anim";

/** Word-by-word masked rise with blur-to-sharp focus. */
export const WordReveal: React.FC<{
  text: string;
  t: number;
  start: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  accent?: Record<string, string>; // word -> colour
  exit?: number; // time to exit (words drop away)
}> = ({ text, t, start, stagger = 0.07, dur = 0.55, style, accent = {}, exit }) => {
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => {
        const p = ease.outExpo(clamp01((t - start - i * stagger) / dur));
        const q = exit !== undefined ? ease.inCubic(clamp01((t - exit - i * 0.03) / 0.35)) : 0;
        const key = w.replace(/[^\w₹$.%+−-]/g, "");
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${lerp(105, 0, p) + q * -110}%)`,
                filter: `blur(${(1 - p) * 8 + q * 6}px)`,
                opacity: clamp01(p * 1.4) * (1 - q),
                color: accent[key] ?? undefined,
                textShadow: "0 2px 18px rgba(0,0,0,0.85)",
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase label with letter-spacing that tightens as it appears. */
export const Label: React.FC<{ text: string; t: number; start: number; style?: React.CSSProperties; tint?: string }> = ({
  text, t, start, style, tint = color.inkDim,
}) => {
  const p = ease.outCubic(clamp01((t - start) / 0.7));
  return (
    <div
      style={{
        fontFamily: font.text, fontWeight: 600, fontSize: 30, textTransform: "uppercase",
        letterSpacing: `${lerp(0.5, 0.22, p)}em`, color: tint, opacity: p, ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Animated number roll, verified values only. */
export const Counter: React.FC<{
  to: number; from?: number; t: number; start: number; dur?: number; decimals?: number;
  prefix?: string; suffix?: string; style?: React.CSSProperties;
}> = ({ to, from = 0, t, start, dur = 1.0, decimals = 0, prefix = "", suffix = "", style }) => {
  const p = ease.outExpo(clamp01((t - start) / dur));
  const v = lerp(from, to, p);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
};

/** Source attribution chip: always on screen with the claim it supports. */
export const SourceTag: React.FC<{ text: string; t: number; start: number; style?: React.CSSProperties; estimate?: boolean }> = ({
  text, t, start, style, estimate,
}) => {
  const p = ease.outCubic(clamp01((t - start) / 0.5));
  return (
    <div
      style={{
        display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 20px",
        border: `1.5px solid ${estimate ? color.loss + "88" : color.line}`, borderRadius: 999,
        fontFamily: font.mono, fontSize: 24, letterSpacing: "0.04em", color: estimate ? "#FFB3B1" : color.inkDim,
        background: "rgba(6,7,10,0.55)", backdropFilter: "blur(6px)",
        opacity: p, transform: `translateY(${(1 - p) * 14}px)`, ...style,
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: 9, background: estimate ? color.loss : color.steel }} />
      {text}
    </div>
  );
};

/** Diagonal specular glint clipped to the glyphs (premium metal type). */
export const SweepText: React.FC<{ text: string; t: number; start: number; dur?: number; style?: React.CSSProperties }> = ({
  text, t, start, dur = 1.1, style,
}) => {
  const p = clamp01((t - start) / dur);
  const x = lerp(-30, 130, ease.inOutCubic(p));
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      {text}
      {p > 0 && p < 1 && (
        <span
          aria-hidden
          style={{
            position: "absolute", inset: 0, color: "transparent", WebkitBackgroundClip: "text", backgroundClip: "text",
            backgroundImage: `linear-gradient(105deg, transparent ${x - 14}%, rgba(255,255,255,0.95) ${x}%, transparent ${x + 14}%)`,
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
};
