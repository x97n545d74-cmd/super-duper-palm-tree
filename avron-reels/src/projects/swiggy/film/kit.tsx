import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { clamp01, ease } from "../../../engine/anim";
import { C, Glass, mono, Rise, sans, serif } from "../look";

/* Shot kit: the few layouts every beat is built from, so 63 beats read as one film. */

/**
 * Set to true once the official Instamart logo is in public/swiggy/logo_instamart.png. Until then Instamart cards
 * show Swiggy's mark with an "Instamart" label, which is how the app itself is listed (Swiggy Instamart).
 */
const HAS_INSTAMART_LOGO = false;

export const LOGO = {
  swiggy: <Img src={staticFile("swiggy/logo_swiggy.png")} style={{ height: 64 }} />,
  instamart: HAS_INSTAMART_LOGO ? <Img src={staticFile("swiggy/logo_instamart.png")} style={{ height: 64 }} /> : (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
      <Img src={staticFile("swiggy/logo_swiggy.png")} style={{ height: 52 }} />
      <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>Instamart</span>
    </div>
  ),
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

/**
 * Every beat arrives through a masked wipe with a thin leading edge (direction alternates beat to beat),
 * the frame then pushes in slowly for the whole beat, and leaves by lifting away. No fades to black.
 */
export const Shot: React.FC<{ t: number; a: number; z: number; children: React.ReactNode }> = ({ t, a, z, children }) => {
  if (t < a - 0.4 || t > z + 0.45) return null;
  const pin = ease.inOutCubic(clamp01((t - a + 0.3) / 0.75));
  const pout = ease.inCubic(clamp01((t - z) / 0.4));
  const push = 1 + 0.03 * ease.inOutCubic(clamp01((t - a) / Math.max(2, z - a)));
  const fromLeft = Math.round(a * 10) % 2 === 0;
  const edge = pin * 100;
  return (
    <>
      <AbsoluteFill style={{
        clipPath: pin < 1 ? (fromLeft ? `inset(0 ${100 - edge}% 0 0)` : `inset(0 0 0 ${100 - edge}%)`) : undefined,
        opacity: 1 - pout, transform: `scale(${push}) translateY(${-pout * 30}px)`, transformOrigin: fromLeft ? "20% 45%" : "80% 45%",
      }}>{children}</AbsoluteFill>
      {pin > 0 && pin < 1 && (
        <div style={{ position: "absolute", top: 0, bottom: 0, width: 2, left: `${fromLeft ? edge : 100 - edge}%`, background: "rgba(245,241,234,0.75)", opacity: Math.sin(pin * Math.PI) }} />
      )}
    </>
  );
};

/** Digits roll into place like a mechanical counter; separators and units fade in. */
export const Odometer: React.FC<{ t: number; at: number; text: string; dur?: number }> = ({ t, at, text, dur = 1.5 }) => {
  const chars = [...text];
  const nd = chars.filter((c) => /\d/.test(c)).length;
  let k = -1;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start" }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i} style={{ opacity: clamp01((t - at) / 0.4), whiteSpace: "pre" }}>{c}</span>;
        k++;
        const d = +c, spins = 1 + ((nd - k) % 2);
        const p = ease.outExpo(clamp01((t - at - k * 0.07) / dur));
        const pos = (d + 10 * spins) * p;
        return (
          <span key={i} style={{ display: "inline-block", height: "1.08em", overflow: "hidden" }}>
            <span style={{ display: "block", transform: `translateY(${-pos * 1.08}em)` }}>
              {Array.from({ length: 10 * (spins + 1) }, (_, j) => <span key={j} style={{ display: "block", height: "1.08em" }}>{j % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
};

/** Chapter label, top left, on every chapter shot. */
export const Kicker: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 140, top: 86, fontFamily: sans, fontSize: 24, letterSpacing: "0.32em", color: C.inkDim }}>{text}</div>
);

/** Large serif line, revealed word by word through a mask, with a short rule drawn underneath. */
export const Headline: React.FC<{ t: number; at: number; lines: string[]; size?: number; top?: number; left?: number; width?: number; color?: string; rule?: string }> = ({
  t, at, lines, size = 84, top = 170, left = 140, width = 1640, color = C.ink, rule = "rgba(245,241,234,0.55)",
}) => {
  let w = 0;
  const words = lines.reduce((n, l) => n + l.split(" ").length, 0);
  const drawn = ease.inOutCubic(clamp01((t - at - 0.25 - words * 0.06) / 0.7));
  return (
    <div style={{ position: "absolute", left, top, width }}>
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", flexWrap: "wrap", columnGap: size * 0.26 }}>
          {l.split(" ").map((word, j) => (
            <Rise key={j} t={t} at={at + 0.06 * w++ + i * 0.1} dur={0.8}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: size, color, lineHeight: 1.1 }}>{word}</div></Rise>
          ))}
        </div>
      ))}
      <div style={{ height: 3, width: 120 * drawn, background: rule, marginTop: size * 0.22, borderRadius: 2 }} />
    </div>
  );
};

/** One big number with a label and a caption, inside glass. */
export const Stat: React.FC<{
  t: number; at: number; label: string; value: number; fmt?: (v: number) => string; color?: string; caption?: string; logo?: React.ReactNode;
  style?: React.CSSProperties; tint?: string; size?: number; dur?: number;
}> = ({ t, at, label, value, fmt = (v) => Math.round(v).toLocaleString("en-IN"), color = C.ink, caption, logo, style, tint, size = 110, dur = 1.2 }) => {
  const p = ease.outExpo(clamp01((t - at) / 0.8));
  return (
    <Glass style={{ transform: `translateY(${(1 - p) * 40}px)`, opacity: clamp01(p * 3), clipPath: p < 1 ? `inset(0 0 ${(1 - p) * 100}% 0 round 28px)` : undefined, ...style }} tint={tint}>
      {logo && <div style={{ marginBottom: 26 }}>{logo}</div>}
      <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim, letterSpacing: "0.08em" }}>{label}</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: size, color, letterSpacing: "-0.04em", lineHeight: 1.05, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
        <Odometer t={t} at={at + 0.15} text={fmt(value)} dur={dur + 0.3} />
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

/** A framed, sharp photograph beside the data: masked reveal from the top, a slow push inside, credit underneath. */
export const PhotoInsert: React.FC<{ t: number; at: number; src: string; credit: string; left: number; top: number; w: number; h: number; focus?: string }> = ({
  t, at, src, credit, left, top, w, h, focus = "50% 50%",
}) => {
  const p = ease.inOutCubic(clamp01((t - at) / 1.1));
  const k = clamp01((t - at) / 16);
  return (
    <div style={{ position: "absolute", left, top, width: w }}>
      <div style={{ width: w, height: h, overflow: "hidden", borderRadius: 8, clipPath: `inset(0 0 ${(1 - p) * 100}% 0 round 8px)`, boxShadow: "0 40px 90px rgba(0,0,0,0.5)", border: "1px solid rgba(245,241,234,0.22)" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus, transform: `scale(${1.2 - 0.12 * p + 0.06 * k})`, filter: "saturate(0.88) contrast(1.04)" }} />
      </div>
      <div style={{ fontFamily: mono, fontSize: 18, color: C.inkDim, marginTop: 14, letterSpacing: "0.04em", opacity: clamp01((t - at - 0.9) / 0.4) }}>{credit}</div>
    </div>
  );
};
