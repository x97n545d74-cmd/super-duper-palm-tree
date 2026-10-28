import React from "react";
import { AbsoluteFill } from "remotion";
import { useTime } from "../../engine/anim";
import { k, L, LightCanvas, Mono, Pill } from "../../engine/light";
import { KStack, useKineticFonts } from "../../engine/light/kinetic";

/*
 * Kinetic typography study (11 s, silent) in the user's reference style (references/motion/brand-v2/r4_kinetic_type.mp4),
 * coloured in the approved bright & clean palette. Phrases hard-cut between the light canvas and ink, like the reference.
 * The 62% line is VERIFIED claim C11 of projects/2026-10-datacenter-pharma/research/claims.md.
 */

export const TYPE_STUDY_DURATION = 11;
const W = 960;

type Scene = { a: number; b: number; dark: boolean; render: (t: number) => React.ReactNode };
const SCENES: Scene[] = [
  { a: 0, b: 1.5, dark: true, render: (t) => (
    <KStack t={t} cy={960} width={W} gap={22} lines={[
      { a: 0.05, text: "DATA", move: "line", color: "#fff", condensed: true, out: 1.2 },
      { a: 0.2, text: "CENTRE", move: "stretch", color: "#fff", condensed: true, echo: true, out: 1.24 },
    ]} />
  ) },
  { a: 1.5, b: 2.9, dark: false, render: (t) => (
    <KStack t={t} cy={960} width={W} lines={[{ a: 1.5, text: "BOOM", move: "bend", italic: true, gradient: true, dur: 0.75 }]} />
  ) },
  { a: 2.9, b: 4.7, dark: false, render: (t) => (
    <KStack t={t} cy={960} width={W} gap={20} lines={[
      { a: 2.9, text: "KAMATA", move: "keystone", echo: true, condensed: true, out: 4.4 },
      { a: 3.15, text: "KAUN", move: "keystone", echo: true, condensed: true, out: 4.43 },
      { a: 3.4, text: "HAI?", move: "keystone", echo: true, gradient: true, condensed: true, out: 4.46 },
    ]} />
  ) },
  { a: 4.7, b: 6.5, dark: true, render: (t) => (
    <>
      <KStack t={t} cy={930} width={W} gap={26} lines={[
        { a: 4.7, text: "ZAMEEN", move: "line", color: "#fff", condensed: true },
        { a: 5.15, text: "SERVERS", move: "stretch", color: "#fff", echo: true },
        { a: 5.5, text: "COOLING", move: "stretch", color: "#fff", echo: true },
      ]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", opacity: k(t, 5.8) }}><Mono size={24} color="rgba(255,255,255,0.55)">Data centre ki 3 layers</Mono></div>
    </>
  ) },
  { a: 6.5, b: 8.7, dark: false, render: (t) => (
    <>
      <KStack t={t} cy={900} width={W} gap={22} lines={[
        { a: 6.5, text: "NETWEB", move: "keystone", echo: true, condensed: true, out: 8.4 },
        { a: 6.8, text: "62%", move: "stretch", gradient: true, echo: true, condensed: true, out: 8.43 },
        { a: 7.15, text: "REVENUE AI SE", move: "line", out: 8.46 },
      ]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", justifyContent: "center", opacity: k(t, 7.5) * (1 - k(t, 8.4, 0.2)) }}><Pill size={24}>Source · Netweb Q1 FY27 results · NSE (62.29%)</Pill></div>
    </>
  ) },
  { a: 8.7, b: 11, dark: true, render: (t) => (
    <>
      <KStack t={t} cy={900} width={760} lines={[{ a: 8.75, text: "AVRON", move: "stretch", gradient: true, echo: true, dur: 0.7 }]} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", opacity: k(t, 9.4), transform: `translateY(${(1 - k(t, 9.4)) * 20}px)` }}>
        <Pill size={28} style={{ background: "#fff", color: L.ink }}>✓ Saved to AVRON Watchlist</Pill>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", opacity: k(t, 9.7) }}><Mono size={20} color="rgba(255,255,255,0.5)">Anuman hai, guarantee nahi · not investment advice</Mono></div>
    </>
  ) },
];

export const TypeStudy: React.FC = () => {
  const t = useTime();
  const ready = useKineticFonts();
  const s = SCENES.find((x) => t >= x.a && t < x.b) ?? SCENES[SCENES.length - 1];
  const body = ready ? s.render(t) : null;
  return s.dark ? (
    <AbsoluteFill style={{ background: L.ink }}>{body}</AbsoluteFill>
  ) : (
    <LightCanvas t={t}>{body}</LightCanvas>
  );
};
