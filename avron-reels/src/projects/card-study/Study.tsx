import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, useTime } from "../../engine/anim";
import { curve, shape, type, ui } from "../../brand/ui";
import { Canvas, Chip, Disclaimer, monoTxt, p, push, Reveal, Saved, Shell, Source, txt, zoomThrough } from "../../engine/ui";
import { Cable, Card3D, CardWheel, flipAngle, Puck, swell, wheelAngle } from "../../engine/ui/cards";

/*
 * Card study (20.5 s, silent): the user's three reference clips (2026-10-28) rebuilt as AVRON brand v2 moves.
 *  1. Card wheel (ref 2, card fan): data-centre layer cards turn on an arc and land Netweb on top.
 *  2. Card flip (ref 3, Revolut card): Netweb's card arrives edge-on, then flips from question to proof.
 *  3. Cause → effect (ref 1, 3D money button): a pressed "AI" puck sends pulses down a cable, the 1.6 GW slab swells
 *     with each one, then splits into the ~6 GW (2029, JLL estimate) row.
 * Every figure is a VERIFIED row of projects/2026-10-datacenter-pharma/research/claims.md (C4, C6, C10, C11, C12).
 * Colours stay AVRON (black + gold); the reference purple and grid floor are not used.
 */

export const CARD_STUDY_DURATION = 20.5;
const G = shape.gutter;
const T_ZOOM = 5.7, T_PUSH = 11.6, T_END = 18.3;

const Head: React.FC<{ t: number; a: number; out?: number; children: React.ReactNode; sub?: string }> = ({ t, a, out, children, sub }) => (
  <div style={{ position: "absolute", left: G, right: G, top: 350 }}>
    <Reveal t={t} a={a} out={out}><div style={txt(type.h2 + 8, 800, ui.ink, type.tracking.hero)}>{children}</div></Reveal>
    {sub && <Reveal t={t} a={a + 0.12} out={out}><div style={{ ...txt(type.h2 + 8, 800, ui.ink3, type.tracking.hero), marginTop: 10 }}>{sub}</div></Reveal>}
  </div>
);

/* ---------------------------------------------------------------- 1. the wheel */
const face = (label: string, title: string, chip: string, opts: { cream?: boolean; big?: string } = {}) => (focus: number) => {
  const bg = opts.cream ? ui.ink : ui.surface;
  const fg = opts.cream ? ui.canvas : ui.ink;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 34, background: bg, border: `2px solid ${focus > 0.98 ? ui.gold : opts.cream ? "transparent" : ui.hairlineStrong}`,
      boxSizing: "border-box", padding: 34, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: shape.shadow, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 34, display: "flex", flexDirection: "column", justifyContent: "space-between", opacity: 0.25 + 0.75 * focus ** 2 }}>
      <div style={monoTxt(26, opts.cream ? "#5D5D67" : ui.ink2)}>{label}</div>
      {opts.big
        ? <div style={{ ...txt(190, 900, fg, "-0.06em"), lineHeight: 0.86, whiteSpace: "normal" }}>{opts.big}</div>
        : <div style={{ ...txt(92, 800, fg, type.tracking.hero), whiteSpace: "normal", lineHeight: 1.0 }}>{title}</div>}
      <div><Chip style={{ fontSize: 24, padding: "10px 16px" }}>{chip}</Chip></div>
      </div>
    </div>
  );
};
const WHEEL = [
  { key: "cap", node: face("Capacity · Jun 2026", "", "JLL", { big: "1.6 GW" }) },
  { key: "lodha", node: face("Layer 1 · Zameen", "Lodha", "Palava ~400 acre") },
  { key: "netweb", node: face("Layer 2 · Servers", "Netweb", "Q1 FY27") },
  { key: "bluestar", node: face("Layer 3 · Cooling", "Blue Star", "DC orders") },
  { key: "vac", node: face("Vacancy · H1 2026", "", "Record low", { cream: true, big: "2.8%" }) },
  { key: "fut", node: face("2029 · anumaan", "", "JLL", { big: "~6 GW" }) },
];
const Wheel: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Head t={t} a={0.2} sub="Kamata kaun hai?">Data centre boom</Head>
    <CardWheel cards={WHEEL} cx={540} cy={2690} R={1400} step={15} cw={460} ch={700} angle={wheelAngle(t, 0.1, 4.4, -60, 2, 15)} enter={clamp01(t / 1.4)} lift={curve.out(clamp01((t - 4.55) / 0.5))} />
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- 2. the flip */
const CW = 780, CH = 1000;
const Flip: React.FC<{ t: number }> = ({ t }) => {
  const enter = T_ZOOM + 0.35, flipAt = 8.4;
  const rotY = flipAngle(t, enter, flipAt);
  const drift = 5 * Math.sin((t - enter) * 0.9); // the card breathes like an object in a hand
  const front = (
    <div style={{ padding: 60, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={monoTxt(26)}>Layer 2 · Servers</span><span style={monoTxt(26, ui.gold)}>AVRON</span></div>
      <div>
        <div style={txt(150, 900, ui.ink, "-0.055em")}>Netweb</div>
        <div style={{ ...txt(58, 700, ui.ink2, type.tracking.head), marginTop: 26 }}>AI se kitni kamai?</div>
      </div>
      <div><Chip>Q1 FY27</Chip></div>
    </div>
  );
  const under = curve.out(clamp01((t - flipAt - 0.75) / 0.3));
  const back = (
    <div style={{ padding: 60, height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={monoTxt(26)}>Netweb · Q1 FY27 results</span><span style={monoTxt(26)}>NSE</span></div>
      <div>
        <div style={txt(260, 900, ui.ink, "-0.06em")}>62%</div>
        <div style={{ height: 6, width: `${under * 100}%`, background: ui.gold, borderRadius: 3, marginTop: 18 }} />
        <div style={{ ...txt(58, 700, ui.ink, type.tracking.head), marginTop: 34, whiteSpace: "normal", lineHeight: 1.1 }}>revenue AI systems se</div>
      </div>
      <div style={monoTxt(26)}>Source · 62.29% of Q1 FY27 revenue</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Head t={t} a={enter + 0.1} out={flipAt}>Servers ka proof</Head>
      {t > flipAt && <Head t={t} a={flipAt + 0.55}>Filing mein likha hai</Head>}
      <div style={{ position: "absolute", left: (1080 - CW) / 2, top: 520 }}>
        <Card3D w={CW} h={CH} rotY={rotY} rotX={drift * 0.6} rotZ={drift * 0.15} front={front} back={back} thickness={14} radius={48} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- 3. cause → effect */
const PULSES = [12.5, 13.4, 14.3];
const RUN = 0.6;
const SLAB = { x: 660, y: 1060, w: 420, h: 280 };
const T_SPLIT = 15.25;
const Effect: React.FC<{ t: number }> = ({ t }) => {
  const a = T_PUSH + 0.25;
  const s = swell(t, PULSES.map((x) => x + RUN));
  const split = curve.out(clamp01((t - T_SPLIT) / 0.75));
  const gone = clamp01((t - T_SPLIT) / 0.2);
  const press = Math.max(...PULSES.map((x) => (t >= x - 0.1 && t < x + 0.25 ? 1 - Math.abs(t - x - 0.05) / 0.2 : 0)), 0);
  const slabIn = curve.out(clamp01((t - a - 0.3) / 0.5));
  const iso = { rotX: 52, rotZ: -32 };
  const slabFace = (label: string, size: number) => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...txt(size, 900, ui.ink, "-0.05em") }}>{label}</div>
  );
  const GRID = [[-250, -150], [250, -150], [-250, 150], [250, 150]];
  return (
    <AbsoluteFill>
      <Head t={t} a={a} out={T_SPLIT - 0.2} sub="Capacity ka kya?">AI demand badhi</Head>
      {t > T_SPLIT - 0.2 && <Head t={t} a={T_SPLIT + 0.1} sub="JLL ka anumaan">2029 tak ~6 GW</Head>}
      <Puck x={250} y={740} r={135} press={press} label="AI" />
      <Cable t={t} a={a + 0.4} p0={{ x: 300, y: 790 }} p1={{ x: 420, y: 1060 }} p2={{ x: 420, y: 1180 }} p3={{ x: SLAB.x - 150, y: SLAB.y + 10 }} pulses={PULSES} run={RUN} />
      {/* the 1.6 GW slab: swells with each pulse (scale + rounder corners + lighter face), then splits */}
      <div style={{ position: "absolute", left: SLAB.x - SLAB.w / 2, top: SLAB.y - SLAB.h / 2, opacity: slabIn * (1 - gone), transform: `scale(${(0.9 + 0.1 * slabIn) * (1 + 0.14 * s + 0.1 * gone)})` }}>
        <Card3D w={SLAB.w} h={SLAB.h} rotX={iso.rotX} rotZ={iso.rotZ} thickness={46} radius={40 + 60 * s} frontBg={`radial-gradient(120% 120% at 30% 25%, ${s > 0.05 ? "#2A2A31" : ui.surface} 0%, ${ui.surface} 70%)`} front={slabFace("1.6 GW", 96)} edge="#2B2B32" />
      </div>
      {t > T_SPLIT && GRID.map(([dx, dy], i) => {
        const k = curve.out(clamp01((t - T_SPLIT - i * 0.06) / 0.75));
        return (
          <div key={i} style={{ position: "absolute", left: SLAB.x - 115 - 100 + dx * k * 0.75, top: SLAB.y - 75 - 40 + dy * k * 0.75, opacity: clamp01(k * 3) }}>
            <Card3D w={230} h={150} rotX={iso.rotX} rotZ={iso.rotZ} thickness={30} radius={28} border={ui.estimate} dashed front={slabFace("", 10)} frontBg={ui.surface} edge="#2B2B32" />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: G, top: 1250, opacity: split * (1 - p(t, T_END - 0.3, 0.3)) }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}><span style={txt(type.h1, 900, ui.ink, type.tracking.hero)}>~6 GW</span><Chip tone="est">2029 · anumaan</Chip></div>
        <div style={{ marginTop: 22 }}><Source t={t} a={T_SPLIT + 0.4} text="JLL via IANS · 2 Sep 2026" /></div>
      </div>
      <div style={{ position: "absolute", left: G, top: 1290, opacity: p(t, a + 0.5) * (1 - gone) }}><Chip>Jun 2026 · India DC capacity</Chip></div>
    </AbsoluteFill>
  );
};

const crumbAt = (t: number) => (t < T_ZOOM ? ["Markets", "Data centres"] : t < T_PUSH ? ["Markets", "Data centres", "Netweb"] : ["Markets", "Data centres", "Capacity"]);

export const CardStudy: React.FC = () => {
  const t = useTime();
  return (
    <Canvas t={t}>
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <AbsoluteFill>
          {t < T_ZOOM + 0.75 && <AbsoluteFill style={t >= T_ZOOM ? zoomThrough(t, T_ZOOM, "out", 540, 820) : {}}><Wheel t={t} /></AbsoluteFill>}
          {t >= T_ZOOM && t < T_PUSH + 0.45 && <AbsoluteFill style={t >= T_PUSH ? push(t, T_PUSH, "out") : {}}><Flip t={t} /></AbsoluteFill>}
          {t >= T_PUSH && <AbsoluteFill style={push(t, T_PUSH, "in")}><Effect t={t} /></AbsoluteFill>}
        </AbsoluteFill>
      </CameraMotionBlur>
      <Shell t={t} crumb={crumbAt(t)} asOf="2 Sep 2026" />
      {t > T_END && <><Saved t={t} a={T_END} /><Disclaimer t={t} a={T_END + 0.3} /></>}
      <div style={{ position: "absolute", right: G, top: 1820, ...monoTxt(22, ui.ink3) }}>Brand v2 · card study</div>
    </Canvas>
  );
};

