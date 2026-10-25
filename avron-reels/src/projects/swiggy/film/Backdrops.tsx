import React from "react";
import { AbsoluteFill } from "remotion";
import { rand } from "../../../engine/anim";
import { sec, Section, SECTIONS } from "./timeline";

/*
 * Two more chapter backgrounds for the user to choose from, beside photographs (A) and the live map (B).
 * C · Paper city: three layers of cut-paper skyline drifting at different speeds, coloured by the hour.
 * D · Type wall: the chapter's key word or number set huge in outline, drifting slowly behind the data.
 * Both stay dark so the cream headlines and glass cards read on top.
 */
export const SKY: Record<Section, [string, string]> = {
  open: ["#0B0F1A", "#05070C"], c1: ["#2A2232", "#141019"], c2: ["#1C2633", "#0E141C"], c3: ["#2A241C", "#14110D"],
  c4: ["#2E1E16", "#150E0B"], c5: ["#171C22", "#0B0E12"], c6: ["#0D1220", "#06080F"], c7: ["#251A2C", "#120D17"], close: ["#2B1E2A", "#140E14"],
};
export const sectionAt = (t: number): Section => [...SECTIONS].reverse().find((s) => t >= sec(s)[0]) ?? "open";

/* ------------------------------------------------------------------ C · paper city */

/** Layer colours by chapter: far, middle, near (darker as they come forward), plus the paper sun/moon. */
const LAYERS: Record<Section, [string, string, string, string]> = {
  open: ["#1B2233", "#121826", "#0A0E17", "#E9E2D3"], c1: ["#4A3B4E", "#33283A", "#1E1724", "#F2B880"], c2: ["#34465A", "#243243", "#151E29", "#F4EFE6"],
  c3: ["#4D4232", "#363024", "#211C15", "#F6D27A"], c4: ["#5A3826", "#3E271B", "#241710", "#F08A4B"], c5: ["#2C343E", "#1F252D", "#12161B", "#9AA6B2"],
  c6: ["#1E2738", "#151C29", "#0B101A", "#E9E2D3"], c7: ["#45324F", "#2F2238", "#1B1421", "#F3B6A0"], close: ["#4F3448", "#372436", "#201520", "#F6C28B"],
};

const skyline = (seed: number, base: number, minH: number, maxH: number, width = 5200) => {
  let x = 0, d = `M 0 ${base}`, k = 0;
  while (x < width) {
    const w = 60 + rand(seed + k) * 140, h = minH + rand(seed + k * 7 + 1) * (maxH - minH);
    const roof = rand(seed + k * 3 + 2);
    d += ` L ${x} ${base - h}`;
    if (roof > 0.82) d += ` L ${x + w / 2} ${base - h - 40} L ${x + w} ${base - h}`; // a pitched roof now and then
    else if (roof > 0.7) d += ` L ${x + w * 0.4} ${base - h} L ${x + w * 0.4} ${base - h - 60} L ${x + w * 0.46} ${base - h - 60} L ${x + w * 0.46} ${base - h} L ${x + w} ${base - h}`; // a mast
    else d += ` L ${x + w} ${base - h}`;
    x += w; k++;
  }
  return d + ` L ${width} 1200 L 0 1200 Z`;
};
const FAR = skyline(11, 760, 120, 340), MID = skyline(47, 860, 90, 280), NEAR = skyline(83, 980, 60, 200);

export const PaperCity: React.FC<{ t: number }> = ({ t }) => {
  const s = sectionAt(t);
  const [top, bottom] = SKY[s];
  const [far, mid, near, sun] = LAYERS[s];
  const layer = (d: string, fill: string, speed: number) => (
    <path d={d} fill={fill} transform={`translate(${-((t * speed) % 2600)} 0)`} style={{ filter: "drop-shadow(0 -6px 0 rgba(0,0,0,0.18))" }} />
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <circle cx={1760} cy={205 + Math.sin(t / 20) * 6} r={46} fill={sun} opacity={0.7} style={{ filter: "drop-shadow(0 8px 0 rgba(0,0,0,0.2))" }} />
        {layer(FAR, far, 4)}
        {layer(MID, mid, 9)}
        {layer(NEAR, near, 18)}
      </svg>
      {/* paper fibre */}
      <AbsoluteFill style={{ opacity: 0.18, backgroundImage: "repeating-linear-gradient(17deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px), repeating-linear-gradient(-23deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 5px)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.12) 45%, transparent 70%)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ D · type wall */

const WORDS: Record<Section, [string, string]> = {
  open: ["TEN MINUTES", "₹9.7 CR A DAY"], c1: ["DO RAASTE", "DARK STORE"], c2: ["2,751 vs 1,240", "₹8.3 vs ₹5.8 LAKH"],
  c3: ["KHAANA", "₹341 CR"], c4: ["INVENTORY", "49.5%"], c5: ["−₹922 CR", "₹390 → ₹176"], c6: ["0.9%", "PRICE WAR"],
  c7: ["NEXT QUARTER", "WATCH THE STORE"], close: ["THE STORE", "THE MARGIN"],
};

export const TypeWall: React.FC<{ t: number }> = ({ t }) => {
  const s = sectionAt(t);
  const [top, bottom] = SKY[s];
  const [w1, w2] = WORDS[s];
  const row = (text: string, y: number, dir: 1 | -1, speed: number, size: number, o: number) => {
    const line = `${text}   ·   ${text}   ·   ${text}   ·   ${text}`;
    return (
      <text x={dir > 0 ? -((t * speed) % 2400) : -2400 + ((t * speed) % 2400)} y={y} fontFamily="Playfair Display" fontWeight={700} fontSize={size}
        fill="none" stroke={`rgba(245,241,234,${o})`} strokeWidth={2} letterSpacing="0.02em">{line}</text>
    );
  };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 100% at 70% 40%, ${top} 0%, ${bottom} 100%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {row(w1, 520, 1, 22, 420, 0.13)}
        {row(w2, 1010, -1, 14, 300, 0.09)}
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, transparent 60%)" }} />
    </AbsoluteFill>
  );
};
