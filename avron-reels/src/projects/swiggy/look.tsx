import React, { useEffect, useState } from "react";
import { continueRender, delayRender, Img, staticFile, useCurrentFrame } from "remotion";
import { clamp01, ease, lerp, rand } from "../../engine/anim";

/*
 * Visual language for "₹9.7 Crore a Day" (Swiggy vs Eternal, 1920×1080).
 * The film moves through one day: every section sits in a real, licensed photograph with a natural
 * grade for its hour, slow parallax, grain and vignette. Data lives on glass panels lit for that hour.
 */
export const W = 1920, H = 1080;
export const C = {
  swiggy: "#FC8019", // Swiggy orange
  blinkit: "#F8CB46", // Blinkit yellow
  zomato: "#E23744", // Zomato red
  ink: "#F5F1EA",
  inkDim: "rgba(245,241,234,0.62)",
  loss: "#FF5B4D",
  gain: "#7BD88F",
};
export const serif = "'Playfair Display', Georgia, serif";
export const sans = "'Inter Display', 'Inter', sans-serif";
export const mono = "'JetBrains Mono', monospace";

/** Loads the vendored Playfair Display (SIL OFL) and blocks rendering until it is ready. */
export const SerifFont: React.FC = () => {
  const [h] = useState(() => delayRender("playfair"));
  useEffect(() => {
    const f = new FontFace("Playfair Display", `url(${staticFile("fonts/PlayfairDisplay-var.ttf")})`, { weight: "400 900" });
    (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
    f.load().then(() => continueRender(h));
  }, [h]);
  return null;
};

/** The hour of the day sets the grade: a colour wash, contrast and saturation, matched to the photo. */
export type Hour = "night" | "dawn" | "morning" | "noon" | "dusk" | "storm" | "late" | "predawn" | "sunrise";
const GRADE: Record<Hour, { filter: string; wash: string; blend: React.CSSProperties["mixBlendMode"]; top: string }> = {
  night: { filter: "contrast(1.12) saturate(1.15) brightness(0.82)", wash: "linear-gradient(180deg, rgba(10,22,60,0.55), rgba(255,140,40,0.18))", blend: "soft-light", top: "rgba(4,8,20,0.55)" },
  dawn: { filter: "contrast(1.02) saturate(1.05) brightness(1.0)", wash: "linear-gradient(180deg, rgba(255,196,120,0.30), rgba(90,70,120,0.20))", blend: "soft-light", top: "rgba(20,14,10,0.35)" },
  morning: { filter: "contrast(1.05) saturate(1.0) brightness(0.95)", wash: "linear-gradient(180deg, rgba(200,225,255,0.18), rgba(255,230,190,0.12))", blend: "soft-light", top: "rgba(8,10,14,0.50)" },
  noon: { filter: "contrast(1.06) saturate(1.1) brightness(0.92)", wash: "linear-gradient(180deg, rgba(255,200,120,0.25), rgba(120,60,20,0.18))", blend: "soft-light", top: "rgba(14,8,4,0.45)" },
  dusk: { filter: "contrast(1.08) saturate(1.15) brightness(0.86)", wash: "linear-gradient(180deg, rgba(120,60,160,0.40), rgba(255,120,60,0.30))", blend: "soft-light", top: "rgba(16,8,20,0.45)" },
  storm: { filter: "contrast(1.1) saturate(0.45) brightness(0.78)", wash: "linear-gradient(180deg, rgba(60,80,100,0.45), rgba(20,30,40,0.35))", blend: "multiply", top: "rgba(6,10,14,0.40)" },
  late: { filter: "contrast(1.1) saturate(0.9) brightness(0.72)", wash: "linear-gradient(180deg, rgba(20,40,90,0.55), rgba(10,20,40,0.35))", blend: "soft-light", top: "rgba(4,6,14,0.55)" },
  predawn: { filter: "contrast(1.0) saturate(0.95) brightness(0.88)", wash: "linear-gradient(180deg, rgba(110,80,170,0.40), rgba(255,150,170,0.25))", blend: "soft-light", top: "rgba(14,10,24,0.40)" },
  sunrise: { filter: "contrast(1.04) saturate(1.12) brightness(1.02)", wash: "linear-gradient(180deg, rgba(255,170,120,0.30), rgba(255,220,150,0.25))", blend: "soft-light", top: "rgba(20,10,10,0.25)" },
};

/** A real photograph as the world: slow push and drift (parallax), graded for the hour, with vignette. */
export const PhotoWorld: React.FC<{
  src: string; t: number; t0: number; hour: Hour; drift?: number; push?: number; focus?: string; overlay?: { src: string; opacity: number; blend?: React.CSSProperties["mixBlendMode"] };
}> = ({ src, t, t0, hour, drift = 18, push = 0.035, focus = "50% 50%", overlay }) => {
  const g = GRADE[hour];
  // drift eases out towards ~14 s of motion, so long plates never over-zoom
  const k = 14 * (1 - Math.exp(-Math.max(0, t - t0) / 14));
  const s = 1.14 + push * k * 0.25;
  const room = (W * (s - 1)) / 2 - 6;
  const tx = Math.max(-room, Math.min(room, -drift * k * 0.25));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", objectPosition: focus,
        transform: `translateX(${tx}px) scale(${s})`, filter: g.filter }} />
      {overlay && (
        <Img src={staticFile(overlay.src)} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", opacity: overlay.opacity,
          mixBlendMode: overlay.blend ?? "screen", transform: `scale(${s * 1.05}) translateX(${drift * k * 0.4}px)`, filter: g.filter }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: g.wash, mixBlendMode: g.blend }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${g.top} 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.55) 100%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </div>
  );
};

/** Frosted glass panel, lit to sit inside the photograph. */
export const Glass: React.FC<{ style?: React.CSSProperties; tint?: string; children: React.ReactNode }> = ({ style, tint = "rgba(255,255,255,0.08)", children }) => (
  <div style={{ position: "absolute", borderRadius: 28, background: `linear-gradient(160deg, ${tint}, rgba(0,0,0,0.30))`, backdropFilter: "blur(18px) saturate(1.2)",
    border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 40px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)", padding: "36px 44px", ...style }}>
    {children}
  </div>
);

/** Masked rise (no blur, no overshoot). */
export const Rise: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, dur = 0.7, children, style }) => {
  const p = ease.outExpo(clamp01((t - at) / dur));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.1em", marginBottom: "-0.1em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)`, opacity: clamp01(p * 2) }}>{children}</div>
    </div>
  );
};

export const fade = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) => clamp01((t - a) / fi) * clamp01((b - t) / fo);
export const count = (t: number, at: number, to: number, dur = 1.2, from = 0) => lerp(from, to, ease.outExpo(clamp01((t - at) / dur)));

/** Film grain (vendored brand grain tiles), re-seeded every frame. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  const ox = Math.floor(rand(f) * 512), oy = Math.floor(rand(f + 99) * 512);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      {Array.from({ length: 15 }).map((_, i) => (
        <Img key={i} src={staticFile(`brand/grain_${f % 4}.png`)} style={{ position: "absolute", width: 512, height: 512, left: (i % 5) * 512 - ox, top: Math.floor(i / 5) * 512 - oy }} />
      ))}
    </div>
  );
};
