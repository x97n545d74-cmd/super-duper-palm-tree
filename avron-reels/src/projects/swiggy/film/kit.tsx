import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, ease } from "../../../engine/anim";
import { C, count, Glass, mono, Rise, sans, serif } from "../look";

/* Shot kit: the few layouts every beat is built from, so 63 beats read as one film. */

export const LOGO = {
  swiggy: <Img src={staticFile("swiggy/logo_swiggy.png")} style={{ height: 64 }} />,
  blinkit: <Img src={staticFile("swiggy/logo_blinkit.svg")} style={{ height: 64, width: 64, borderRadius: 14 }} />,
  eternal: (
    <div style={{ background: "rgba(245,241,234,0.92)", borderRadius: 12, padding: "10px 16px", display: "inline-flex" }}>
      <Img src={staticFile("swiggy/logo_eternal.svg")} style={{ height: 36 }} />
    </div>
  ),
};

/** A beat's shot is visible from its start to its end, with short fades; `pre` lets it arrive slightly early. */
export const vis = (t: number, a: number, z: number, pre = 0.25, post = 0.35) =>
  ease.outCubic(clamp01((t - a + pre) / 0.35)) * (1 - ease.inCubic(clamp01((t - z) / post)));

export const Shot: React.FC<{ t: number; a: number; z: number; children: React.ReactNode }> = ({ t, a, z, children }) => {
  if (t < a - 0.4 || t > z + 0.45) return null;
  return <AbsoluteFill style={{ opacity: vis(t, a, z) }}>{children}</AbsoluteFill>;
};

/** Chapter label, top left, on every chapter shot. */
export const Kicker: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 140, top: 86, fontFamily: sans, fontSize: 24, letterSpacing: "0.32em", color: C.inkDim }}>{text}</div>
);

/** Large serif line, masked rise, optional second line. */
export const Headline: React.FC<{ t: number; at: number; lines: string[]; size?: number; top?: number; left?: number; width?: number; color?: string }> = ({
  t, at, lines, size = 84, top = 170, left = 140, width = 1640, color = C.ink,
}) => (
  <div style={{ position: "absolute", left, top, width }}>
    {lines.map((l, i) => (
      <Rise key={i} t={t} at={at + i * 0.18}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: size, color, lineHeight: 1.1 }}>{l}</div></Rise>
    ))}
  </div>
);

/** One big number with a label and a caption, inside glass. */
export const Stat: React.FC<{
  t: number; at: number; label: string; value: number; fmt?: (v: number) => string; color?: string; caption?: string; logo?: React.ReactNode;
  style?: React.CSSProperties; tint?: string; size?: number; dur?: number;
}> = ({ t, at, label, value, fmt = (v) => Math.round(v).toLocaleString("en-IN"), color = C.ink, caption, logo, style, tint, size = 110, dur = 1.2 }) => {
  const p = ease.outExpo(clamp01((t - at) / 0.6));
  return (
    <Glass style={{ transform: `translateY(${(1 - p) * 40}px)`, opacity: p, ...style }} tint={tint}>
      {logo && <div style={{ marginBottom: 26 }}>{logo}</div>}
      <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim, letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: size, color, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
        {fmt(count(t, at, value, dur))}
      </div>
      {caption && <div style={{ fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 14, lineHeight: 1.35 }}>{caption}</div>}
    </Glass>
  );
};

/** Arithmetic / source line along the bottom: every derived number shows its working. */
export const Note: React.FC<{ t: number; at: number; text: string; bottom?: number }> = ({ t, at, text, bottom = 64 }) => (
  <div style={{ position: "absolute", left: 140, right: 140, bottom, fontFamily: mono, fontSize: 22, color: C.inkDim, opacity: clamp01((t - at) / 0.5), lineHeight: 1.5 }}>{text}</div>
);

/** Horizontal bar pair for comparisons. */
export const Bars: React.FC<{ t: number; at: number; rows: { label: string; value: number; color: string; text: string }[]; max: number; top: number; left?: number; width?: number }> = ({
  t, at, rows, max, top, left = 140, width = 1200,
}) => (
  <div style={{ position: "absolute", left, top, width }}>
    {rows.map((r, i) => {
      const p = ease.outExpo(clamp01((t - at - i * 0.25) / 1.0));
      return (
        <div key={r.label} style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 32, color: C.ink, marginBottom: 10 }}>
            <span>{r.label}</span><b style={{ color: r.color }}>{r.text}</b>
          </div>
          <div style={{ height: 22, borderRadius: 11, background: "rgba(255,255,255,0.10)" }}>
            <div style={{ width: `${(r.value / max) * 100 * p}%`, height: "100%", borderRadius: 11, background: r.color }} />
          </div>
        </div>
      );
    })}
  </div>
);

export const crore = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")} Cr`;
