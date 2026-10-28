import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, lerp, useTime } from "../../engine/anim";
import { curve, motion, shape, type, ui } from "../../brand/ui";
import {
  Bars, Canvas, Caption, Chip, Counter, Cursor, Delta, Disclaimer, Dolly, LineChart, morph, monoTxt, p, Panel, Poll, push, Receipt,
  Reveal, Row, Source, Toast, txt, Wordmark, zoomThrough,
} from "../../engine/ui";

/*
 * Brand v2 style demo (16 s, silent): the data centre + pharma story's first half retold in the "finance as product UI" look,
 * so old and new can be compared on a story the user knows. Every figure is a VERIFIED row of
 * projects/2026-10-datacenter-pharma/research/claims.md (C1, C4, C6, C10, C11, C12). Rules: brand/BRAND.md.
 * Shots: crop-in pull-out hook → cursor click → panel morph into layers → zoom-through into the receipt → push to the stat → poll.
 */

export const BRAND_DEMO_DURATION = 16;

const G = shape.gutter;
const W = 1080 - 2 * G;
const CARD = { x: G, y: 560, w: W, h: 700 };
const LIST = { x: G, y: 520, w: W, h: 760 };
const T_CLICK_TAB = 3.35, T_ZOOM = 5.4, T_PUSH1 = 8.7, T_PUSH2 = 13.2;

const Headline: React.FC<{ t: number; a: number; out?: number; children: React.ReactNode }> = ({ t, a, out, children }) => (
  <div style={{ position: "absolute", left: G, right: G, top: 270 }}>
    <Reveal t={t} a={a} out={out}><div style={txt(type.h1, 800, ui.ink, type.tracking.hero)}>{children}</div></Reveal>
  </div>
);

/* ---------------------------------------------------------------- shots 1–2: the Nifty card, then it morphs into the layer list */
const NiftyAndLayers: React.FC<{ t: number }> = ({ t }) => {
  // hook: start on an extreme crop of the delta pill, pull out to the full card
  const pull = curve.inOut(clamp01((t - 0.1) / 1.5));
  const cam = { s: lerp(2.5, 1, pull), ox: 760, oy: 700 };
  const m = curve.inOut(clamp01((t - T_CLICK_TAB - 0.05) / motion.large));
  const box = morph(CARD, LIST, m);
  const nifty = 1 - clamp01((t - T_CLICK_TAB) / 0.2); // card contents leave as the morph starts
  const layers = t > T_CLICK_TAB + 0.3;
  const hoverNetweb = clamp01((t - 4.85) / 0.15);
  return (
    <AbsoluteFill style={{ transformOrigin: `${cam.ox}px ${cam.oy}px`, transform: `scale(${cam.s})` }}>
      <Headline t={t} a={0.2} out={T_CLICK_TAB - 0.3}>Crash ka <span style={{ color: ui.down }}>wait?</span></Headline>
      {t > T_CLICK_TAB && <Headline t={t} a={T_CLICK_TAB + 0.2}>Layer dekho</Headline>}
      <Panel t={t} a={0} box={box}>
        <div style={{ display: "flex", gap: 18, marginBottom: 44 }}>
          <Chip active={!layers}>Nifty 50</Chip>
          <Chip active={layers}>Layers</Chip>
        </div>
        {!layers && (
          <div style={{ opacity: nifty }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={txt(type.hero - 40, 800, ui.ink, type.tracking.hero)}><Counter t={t} a={0.5} from={26373} to={22180} dur={1.2} /></div>
              <Delta v="16%" dir="down" size={46} />
            </div>
            <div style={{ marginTop: 60 }}>
              <LineChart t={t} a={0.5} w={W - 2 * shape.pad} h={250} pts={[26373, 22180]} dur={1.2} c={ui.down} headLabel={(i) => (i === 0 ? "26,373 · 5 JAN" : "22,180 · 8 OCT")} />
            </div>
            <div style={{ marginTop: 50 }}><Source t={t} a={1.4} text="intraday · peak 5 Jan → low 8 Oct 2026" /></div>
          </div>
        )}
        {layers && (
          <div>
            <Row t={t} a={T_CLICK_TAB + 0.45} label="Zameen · Lodha" sub="Palava · ~400 acre DC land" />
            <Row t={t} a={T_CLICK_TAB + 0.45 + motion.stagger * 2} label="Servers · Netweb" sub="Q1 FY27 · AI systems" hl={hoverNetweb} value={<Chip active={hoverNetweb > 0.5}>62%</Chip>} />
            <Row t={t} a={T_CLICK_TAB + 0.45 + motion.stagger * 4} label="Cooling · Blue Star" sub="Q1 FY27 orders · data centres" />
          </div>
        )}
      </Panel>
      <Cursor t={t} keys={[{ t: 2.7, x: 980, y: 1500 }, { t: T_CLICK_TAB - 0.6, x: 470, y: 640, click: false }, { t: T_CLICK_TAB, x: 470, y: 640, click: true }, { t: 4.3, x: 760, y: 1080 }, { t: 5.15, x: 760, y: 1080, click: true }]} />
      {t < 2.6 && <Caption text="Market girega tab khareedenge?" key_="girega" />}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- shot 3: receipt (the trust move) */
const NetwebReceipt: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Headline t={t} a={T_ZOOM + 0.45}>Netweb ka <span style={{ color: ui.gold }}>proof</span></Headline>
    <Receipt t={t} a={T_ZOOM + 0.35} box={{ x: G, y: 520, w: W, h: 560 }} source="Netweb · Q1 FY27 results" date="NSE filing" quote="AI systems · 62.29% of revenue" />
    <Panel t={t} a={T_ZOOM + 1.3} box={{ x: G, y: 1120, w: W, h: 230 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={monoTxt(type.label, ui.ink2)}>Revenue share</span>
        <span style={txt(type.h1, 800, ui.ink, type.tracking.hero)}><Counter t={t} a={T_ZOOM + 1.4} to={62.29} fmt={(n) => n.toFixed(2) + "%"} /></span>
      </div>
    </Panel>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- shot 4: vacancy stat + capacity bars */
const Capacity: React.FC<{ t: number }> = ({ t }) => {
  const a = T_PUSH1 + 0.2;
  return (
    <AbsoluteFill>
      <Headline t={t} a={a}>Jagah kam hai</Headline>
      <Panel t={t} a={a + 0.1} box={{ x: G, y: 520, w: W, h: 380 }}>
        <div style={monoTxt()}>India DC vacancy · H1 2026</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 34 }}>
          <div style={txt(type.hero, 800, ui.ink, type.tracking.hero)}><Reveal t={t} a={a + 0.3}>2.8%</Reveal></div>
          <Chip>Record low</Chip>
        </div>
      </Panel>
      <Panel t={t} a={a + 0.7} box={{ x: G, y: 940, w: W, h: 420 }}>
        <Bars t={t} a={a + 0.9} w={W - 2 * shape.pad - 300} items={[{ label: "Capacity · Jun 2026", v: 1.6, shown: "1.6 GW" }, { label: "2029 · JLL anumaan", v: 6, shown: "~6 GW", est: true }]} />
      </Panel>
      <div style={{ position: "absolute", left: G, top: 1395 }}><Source t={t} a={a + 1.2} text="JLL via IANS · 2 Sep 2026" /></div>
      <Toast t={t} a={11.0} out={12.9} y={1470} text="Strong theme bhi crash mein girta hai" />
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- shot 5: poll end card */
const End: React.FC<{ t: number }> = ({ t }) => {
  const a = T_PUSH2 + 0.25;
  return (
    <AbsoluteFill>
      <Headline t={t} a={a}>Aapka bet?</Headline>
      <Poll t={t} a={a + 0.1} q="Kaunsi layer?" options={["Zameen", "Servers", "Cooling"]} hover={t > 14.75 ? 1 : -1} />
      <Cursor t={t} keys={[{ t: 13.9, x: 960, y: 1500 }, { t: 14.6, x: 700, y: 1040 }]} />
      <Disclaimer t={t} a={a + 0.6} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, display: "flex", justifyContent: "center", opacity: p(t, a + 0.8) }}><Wordmark /></div>
    </AbsoluteFill>
  );
};

const Tag: React.FC = () => <div style={{ position: "absolute", right: G, top: 236, ...monoTxt(22, ui.ink3) }}>Brand v2 · style demo</div>;

export const BrandDemo: React.FC = () => {
  const t = useTime();
  const s12 = t < T_ZOOM + motion.large;
  const s3 = t >= T_ZOOM && t < T_PUSH1 + motion.base;
  const s4 = t >= T_PUSH1 && t < T_PUSH2 + motion.base;
  const s5 = t >= T_PUSH2;
  return (
    <Canvas t={t}>
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <AbsoluteFill>
          {s12 && <AbsoluteFill style={t >= T_ZOOM ? zoomThrough(t, T_ZOOM, "out", 540, 1010) : {}}><Dolly t={t} a={1.6} b={T_ZOOM} oy={900}><NiftyAndLayers t={t} /></Dolly></AbsoluteFill>}
          {s3 && <AbsoluteFill style={t < T_ZOOM + motion.large ? zoomThrough(t, T_ZOOM, "in", 540, 960) : push(t, T_PUSH1, "out")}><NetwebReceipt t={t} /></AbsoluteFill>}
          {s4 && <AbsoluteFill style={t < T_PUSH2 ? push(t, T_PUSH1, "in") : push(t, T_PUSH2, "out")}><Capacity t={t} /></AbsoluteFill>}
          {s5 && <AbsoluteFill style={push(t, T_PUSH2, "in")}><End t={t} /></AbsoluteFill>}
        </AbsoluteFill>
      </CameraMotionBlur>
      <Tag />
    </Canvas>
  );
};

/* ---------------------------------------------------------------- the cover template: every AVRON cover uses this layout */
export const BrandCover: React.FC<{ hero?: string; title?: string; series?: string; dir?: "up" | "down" }> = ({ hero = "−16%", title = "Crash ka wait?", series = "Layer", dir = "down" }) => (
  <Canvas t={0}>
    {/* content stays inside the 3:4 grid crop (y 240–1680) */}
    <div style={{ position: "absolute", left: G, top: 330 }}><Chip active>{series}</Chip></div>
    <div style={{ position: "absolute", left: G, right: G, top: 470, ...txt(150, 800, ui.ink, type.tracking.hero), whiteSpace: "normal", lineHeight: 0.98 }}>{title}</div>
    <Panel t={9} a={0} box={{ x: G, y: 900, w: W, h: 560 }}>
      <div style={monoTxt()}>Nifty 50 · 2026</div>
      <div style={{ ...txt(260, 800, dir === "up" ? ui.up : ui.down, type.tracking.hero), marginTop: 60 }}>{hero}</div>
    </Panel>
    <div style={{ position: "absolute", left: G, top: 1540 }}><Wordmark size={30} /></div>
  </Canvas>
);
