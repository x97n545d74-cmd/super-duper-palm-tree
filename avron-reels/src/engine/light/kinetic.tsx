import React, { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { clamp01, lerp } from "../anim";
import { curve } from "../../brand/ui";
import { L } from "./index";

/*
 * AVRON kinetic typography (2026-10-28), rebuilt from the user's typography reference
 * (references/motion/brand-v2/r4_kinetic_type.mp4): heavy wide uppercase Montserrat, lines fitted to one width (justified stacks),
 * and five moves:
 *   stretch  — arrives tall and squeezed, settles to its true shape
 *   line     — opens from a flat line while its tracking closes
 *   keystone — arrives tilted back (trapezoid), lies down flat
 *   bend     — arrives italic and bent on an arc, straightens
 *   squash   — exit: flattens to a line and smears out
 * plus a two-colour echo (indigo + coral copies) that trails only while a line moves.
 */

export const KFONT = "'AVRON Montserrat', 'Inter Display', sans-serif";

/** Loads Montserrat (variable, SIL OFL, public/fonts) for both CSS and canvas measuring. */
export const useKineticFonts = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("montserrat"));
  useEffect(() => {
    const faces = [
      new FontFace("AVRON Montserrat", `url(${staticFile("fonts/Montserrat-var.ttf")})`, { weight: "100 900", style: "normal" }),
      new FontFace("AVRON Montserrat", `url(${staticFile("fonts/Montserrat-Italic-var.ttf")})`, { weight: "100 900", style: "italic" }),
    ];
    Promise.all(faces.map((f) => f.load())).then((loaded) => {
      loaded.forEach((f) => (document.fonts as unknown as { add: (f: FontFace) => void }).add(f));
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);
  return ready;
};

let ctx: CanvasRenderingContext2D | null = null;
/** Width of `text` at 100 px in the kinetic font (used to fit lines to a width). */
export const measure100 = (text: string, weight = 900, italic = false, track = -0.02) => {
  ctx ??= document.createElement("canvas").getContext("2d");
  ctx!.font = `${italic ? "italic " : ""}${weight} 100px 'AVRON Montserrat'`;
  return ctx!.measureText(text).width + track * 100 * (text.length - 1);
};

export type Move = "stretch" | "line" | "keystone" | "bend" | "none";

type Props = {
  t: number; a: number; text: string; width: number; move?: Move; out?: number; weight?: number; italic?: boolean;
  color?: string; gradient?: boolean; echo?: boolean; dur?: number; track?: number; condensed?: boolean;
};

/** One line of kinetic type, fitted to `width`, centred. Height = font size × 0.86 (caps). */
export const KLine: React.FC<Props> = ({ t, a, text, width, move = "stretch", out, weight = 900, italic, color = L.ink, gradient, echo, dur = 0.6, track = -0.02, condensed }) => {
  const sx0 = condensed ? 0.72 : 1; // condensed lines are drawn narrower, then fitted (taller glyphs, like the reference)
  const size = width / (measure100(text, weight, italic, track) / 100) / sx0;
  const p = curve.out(clamp01((t - a) / dur));
  const o = out === undefined ? 0 : curve.in(clamp01((t - out) / 0.32));
  if (t < a - 0.01) return <div style={{ height: size * 0.86 }} />;

  // transforms per move, eased from the entry state to rest
  let tf = "", origin = "50% 50%", ls = track;
  if (move === "stretch") tf = `scale(${lerp(0.3, 1, p) * sx0}, ${lerp(2.3, 1, p)})`;
  if (move === "line") { tf = `scale(${sx0}, ${lerp(0.03, 1, p)})`; ls = lerp(0.45, track, curve.out(clamp01((t - a) / (dur * 1.3)))); }
  if (move === "keystone") { tf = `perspective(${size * 6}px) rotateX(${lerp(64, 0, p)}deg) scale(${sx0}, ${lerp(2.1, 1, p)})`; origin = "50% 100%"; }
  if (move === "bend") tf = `skewX(${lerp(-24, 0, p)}deg) scale(${lerp(0.8, 1, p) * sx0}, ${lerp(1.5, 1, p)})`;
  if (move === "none") tf = `scale(${sx0}, 1)`;
  const exit = o > 0 ? ` scale(${lerp(1, 1.18, o)}, ${lerp(1, 0.03, o)})` : "";
  const blur = o > 0 ? o * 5 : move === "line" ? (1 - p) * 4 : 0;
  const bend = move === "bend" ? 1 - p : 0;

  const glyphs = (c: string | undefined, grad: boolean) => {
    const base: React.CSSProperties = grad
      ? { backgroundImage: L.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
      : { color: c };
    if (!bend) return <span style={base}>{text}</span>;
    const n = text.length, mid = (n - 1) / 2;
    return text.split("").map((ch, i) => {
      const u = (i - mid) / Math.max(1, mid); // -1..1
      return (
        <span key={i} style={{ ...base, display: "inline-block", whiteSpace: "pre", transform: `translateY(${bend * size * 0.28 * u * u}px) rotate(${bend * 14 * u}deg)` }}>{ch}</span>
      );
    });
  };
  const layer = (c: string | undefined, grad: boolean, dx: number, dy: number, op = 1) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center", transform: `translate(${dx}px, ${dy}px)`, opacity: op }}>
      <div style={{ fontFamily: KFONT, fontWeight: weight, fontStyle: italic ? "italic" : "normal", fontSize: size, lineHeight: 0.86, letterSpacing: `${ls}em`, whiteSpace: "nowrap",
        transform: tf + exit, transformOrigin: origin, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>{glyphs(c, grad)}</div>
    </div>
  );
  // echo: offset grows with remaining motion, vanishes at rest
  const e = echo ? Math.max(1 - p, o) : 0;
  return (
    <div style={{ position: "relative", width, height: size * 0.86 }}>
      {e > 0.02 && layer(L.indigo, false, -e * size * 0.08, e * size * 0.05, 0.95)}
      {e > 0.02 && layer(L.coral, false, e * size * 0.08, -e * size * 0.04, 0.95)}
      {layer(color, !!gradient, 0, 0)}
    </div>
  );
};

/** A justified stack: every line fitted to the same width, `gap` px between lines, centred on (cx, cy). */
export const KStack: React.FC<{ cx?: number; cy: number; width: number; gap?: number; lines: (Omit<Props, "width" | "t"> & { key?: string })[]; t: number }> = ({ cx = 540, cy, width, gap = 18, lines, t }) => {
  const heights = lines.map((l) => (width / (measure100(l.text, l.weight ?? 900, l.italic, l.track ?? -0.02) / 100) / (l.condensed ? 0.72 : 1)) * 0.86);
  const total = heights.reduce((s, h) => s + h, 0) + gap * (lines.length - 1);
  return (
    <div style={{ position: "absolute", left: cx - width / 2, top: cy - total / 2, width, display: "flex", flexDirection: "column", gap }}>
      {lines.map((l, i) => <KLine key={l.key ?? l.text + i} t={t} width={width} {...l} />)}
    </div>
  );
};
