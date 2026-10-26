import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp } from "../../../engine/anim";
import { Rise } from "../../swiggy/look";
import { cut, Ledger } from "../Demos";

/* Shot kit for the silver film: three looks (ledger, phone, paper) and the few layouts every beat is built from. */
export const sans = "'Inter Display', 'Inter', sans-serif";
export const mono = "'JetBrains Mono', monospace";
export const serif = "'Playfair Display', Georgia, serif";
export const RED = "#FF3B30", INK = "#1F2A44", PAPER = "#F3EBD6", SLATE = "#0B0B0C", GOLD = "#B88A2E", BROWN = "#8A6E4B";
export const hand: React.CSSProperties = { fontFamily: serif, fontStyle: "italic", color: INK };
export const pr = (t: number, a: number, d: number, fn = ease.outExpo) => fn(clamp01((t - a) / d));

/** Backgrounds for the three looks, plus slate for the hook, the crash and the close. */
export const BgLedger: React.FC = () => <Ledger />;
export const BgPaper: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 30% 20%, #F1EBDD, #E2D8C3 70%, #D3C6AC)" }} />;
export const BgPhone: React.FC = () => <AbsoluteFill style={{ background: "linear-gradient(160deg, #0E1016, #06070A)" }} />;
export const BgSlate: React.FC = () => <AbsoluteFill style={{ background: `radial-gradient(90% 80% at 55% 45%, #18191D, ${SLATE} 75%)` }} />;

/**
 * Every beat arrives through a masked wipe with a thin leading edge (direction alternates), pushes in slowly
 * while it holds, and stays until the next shot wipes over it. No fades to black.
 */
export const Shot: React.FC<{ t: number; a: number; z: number; k: number; children: React.ReactNode }> = ({ t, a, z, k, children }) => {
  if (t < a - 0.05 || t > z + 0.75) return null;
  const pin = ease.inOutCubic(clamp01((t - a) / 0.65));
  const push = 1 + 0.025 * ease.inOutCubic(clamp01((t - a) / Math.max(3, z - a)));
  const left = k % 2 === 0;
  const edge = pin * 100;
  return (
    <>
      <AbsoluteFill style={{ clipPath: pin < 1 ? (left ? `inset(0 ${100 - edge}% 0 0)` : `inset(0 0 0 ${100 - edge}%)`) : undefined,
        transform: `scale(${push})`, transformOrigin: left ? "30% 45%" : "70% 45%" }}>{children}</AbsoluteFill>
      {pin > 0 && pin < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, width: 2, left: `${left ? edge : 100 - edge}%`, background: "rgba(255,59,48,0.8)", opacity: Math.sin(pin * Math.PI) }} />}
    </>
  );
};

/** Top-left label on every shot. */
export const Kicker: React.FC<{ text: string; dark?: boolean; left?: number }> = ({ text, dark, left = 200 }) => (
  <div style={{ position: "absolute", left, top: 108, fontFamily: mono, fontSize: 24, letterSpacing: "0.22em", color: dark ? "#7C828C" : BROWN, whiteSpace: "nowrap" }}>{text.toUpperCase()}</div>
);
/** Source / working line along the bottom. */
export const Foot: React.FC<{ text: string; dark?: boolean; left?: number }> = ({ text, dark, left = 200 }) => (
  <div style={{ position: "absolute", left, right: 120, bottom: 52, fontFamily: mono, fontSize: 20, color: dark ? "#5E646E" : BROWN, lineHeight: 1.5 }}>{text}</div>
);

/** Ink written left to right (the ledger's voice). */
export const Ink: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, dur = 0.9, children, style }) => (
  <div style={{ clipPath: `inset(-25% ${100 - 100 * pr(t, at, dur, ease.inOutCubic)}% -25% 0)`, ...style }}>{children}</div>
);
export const InkText: React.FC<{ t: number; at: number; size?: number; color?: string; bold?: boolean; x: number; y: number; dur?: number; children: React.ReactNode }> = ({
  t, at, size = 72, color = INK, bold = true, x, y, dur, children,
}) => (
  <Ink t={t} at={at} dur={dur ?? Math.min(1.4, 0.5 + size / 120)} style={{ position: "absolute", left: x, top: y, whiteSpace: "nowrap" }}>
    <div style={{ ...hand, fontSize: size, fontWeight: bold ? 700 : 500, color, lineHeight: 1.15 }}>{children}</div>
  </Ink>
);
/** Red ink rule drawn under a line. */
export const Rule: React.FC<{ t: number; at: number; x: number; y: number; w: number; color?: string; double?: boolean }> = ({ t, at, x, y, w, color = RED, double }) => {
  const k = pr(t, at, 0.6, ease.inOutCubic);
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, height: 4, width: w * k, background: color, borderRadius: 2 }} />
      {double && <div style={{ position: "absolute", left: x, top: y + 14, height: 4, width: w * pr(t, at + 0.15, 0.6, ease.inOutCubic), background: color, borderRadius: 2 }} />}
    </>
  );
};
/** Rubber stamp: lands from 1.5× with a hard stop (no bounce). */
export const Stamp: React.FC<{ t: number; at: number; x: number; y: number; text: string; color?: string; rot?: number; size?: number }> = ({ t, at, x, y, text, color = RED, rot = -8, size = 46 }) => (
  <div style={{ position: "absolute", left: x, top: y, border: `6px double ${color}`, color, padding: "10px 26px", fontFamily: sans, fontWeight: 800, fontSize: size, letterSpacing: "0.1em",
    transform: `rotate(${rot}deg) scale(${lerp(1.5, 1, pr(t, at, 0.22, ease.outCubic))})`, opacity: 0.88 * clamp01((t - at) / 0.1), mixBlendMode: "multiply", whiteSpace: "nowrap" }}>{text}</div>
);
/** Bold sans line with a masked rise (phone and slate looks). */
export const Big: React.FC<{ t: number; at: number; x: number; y: number; size?: number; color?: string; children: React.ReactNode; weight?: number }> = ({
  t, at, x, y, size = 96, color = "#F3F1EC", children, weight = 800,
}) => (
  <Rise t={t} at={at} dur={0.8} style={{ position: "absolute", left: x, top: y }}>
    <div style={{ fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1.05, color, whiteSpace: "nowrap" }}>{children}</div>
  </Rise>
);
/** Paper tag: a cut card that drops in from above. */
export const Tag: React.FC<{ t: number; at: number; x: number; y: number; rot?: number; children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({
  t, at, x, y, rot = -1.5, children, bg = "#FBF8F1", color = "#2A2520", size = 44,
}) => {
  const k = pr(t, at, 0.8, ease.outCubic);
  return (
    <div style={{ position: "absolute", left: x, top: y, background: bg, color, padding: "16px 28px", fontFamily: sans, fontWeight: 800, fontSize: size, letterSpacing: "-0.02em",
      transform: `rotate(${rot}deg) translateY(${(1 - k) * -260}px)`, opacity: clamp01(k * 3), whiteSpace: "nowrap", ...cut(12) }}>{children}</div>
  );
};
/** Phone notification / chat bubble. */
export const Bubble: React.FC<{ t: number; at: number; who: string; text: string; red?: boolean; mine?: boolean }> = ({ t, at, who, text, red, mine }) => {
  const k = pr(t, at, 0.5);
  if (t < at) return null;
  return (
    <div style={{ alignSelf: mine ? "flex-end" : "flex-start", background: red ? "rgba(255,59,48,0.18)" : mine ? "#24406A" : "rgba(255,255,255,0.08)", border: red ? "1px solid rgba(255,59,48,0.6)" : "none",
      borderRadius: 20, padding: "12px 18px", marginBottom: 10, maxWidth: 360, transform: `translateY(${(1 - k) * 30}px)`, opacity: k }}>
      <div style={{ fontFamily: sans, fontSize: 16, color: red ? "#FF8A84" : "#6FA8FF" }}>{who}</div>
      <div style={{ fontFamily: sans, fontSize: 25, color: "#F3F1EC", lineHeight: 1.3 }}>{text}</div>
    </div>
  );
};
/** Chapter card on the ledger. */
export const Card: React.FC<{ t: number; a: number; n: string; title: string; sub: string }> = ({ t, a, n, title, sub }) => (
  <AbsoluteFill>
    <BgLedger />
    <div style={{ position: "absolute", left: 200, top: 330, fontFamily: mono, fontSize: 30, letterSpacing: "0.3em", color: BROWN, opacity: clamp01((t - a - 0.1) / 0.4) }}>{n}</div>
    <InkText t={t} at={a + 0.25} x={200} y={390} size={130} dur={1.1}>{title}</InkText>
    <Rule t={t} at={a + 1.2} x={200} y={570} w={900} double />
    <Ink t={t} at={a + 1.5} dur={0.8} style={{ position: "absolute", left: 200, top: 620 }}><div style={{ ...hand, fontSize: 44, fontWeight: 500, color: "#5B5247" }}>{sub}</div></Ink>
  </AbsoluteFill>
);
