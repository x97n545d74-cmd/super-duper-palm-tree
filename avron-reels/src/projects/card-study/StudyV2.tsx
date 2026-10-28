import React from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { clamp01, lerp, useTime } from "../../engine/anim";
import { curve, shape, type, ui } from "../../brand/ui";
import { Chip, Disclaimer, monoTxt, p, push, Reveal, Saved, Shell, Source, txt, zoomThrough } from "../../engine/ui";
import { CableMesh, Card, Draw, face, Floor, Materials, PuckMesh, Rig, StudioLights, StudioSet, useFontsReady, useMaterials, useSlabGeometry } from "../../engine/three/Studio";

/*
 * Card study V2 (real 3D), after the user called the CSS version "very low effort" (2026-10-28).
 * Same three moves from the user's references, now physical: glossy black / brushed gold / cream cards with printed faces,
 * studio key + rim light with environment reflections and soft shadows, a gold puck, a rubber cable and glass "estimate" slabs.
 * Figures: VERIFIED rows C4, C6, C10, C11, C12 of projects/2026-10-datacenter-pharma/research/claims.md.
 */

export const CARD_STUDY_V2_DURATION = 21;
const G = shape.gutter;
const T_ZOOM = 5.8, T_PUSH = 11.8, T_END = 18.8;
const GL = { antialias: true, preserveDrawingBuffer: true } as const;
const WHEEL_GOLD = new THREE.MeshPhysicalMaterial({ color: "#B8862C", roughness: 0.42, metalness: 1, clearcoat: 0.4, clearcoatRoughness: 0.25 });
const HIDDEN = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });

const Head: React.FC<{ t: number; a: number; out?: number; children: React.ReactNode; sub?: string }> = ({ t, a, out, children, sub }) => (
  <div style={{ position: "absolute", left: G, right: G, top: 350 }}>
    <Reveal t={t} a={a} out={out}><div style={txt(type.h1, 900, ui.ink, type.tracking.hero)}>{children}</div></Reveal>
    {sub && <Reveal t={t} a={a + 0.12} out={out}><div style={{ ...txt(type.h1, 900, ui.ink3, type.tracking.hero), marginTop: 6 }}>{sub}</div></Reveal>}
  </div>
);

/* ---------------------------------------------------------------- card faces (canvas, px = 1024 per unit width) */
const INK = "#F5F4EF", DARK = "#0E0E12", GREY = "#8E8E98";
const tag = (ctx: CanvasRenderingContext2D, s: string, y: number, c: string) => face.text(ctx, s, 70, y, 40, 500, c, { mono: true });
const faces: Record<string, Draw> = {
  cap: (c, W, H) => { tag(c, "Capacity · Jun 2026", 120, GREY); face.text(c, "1.6", 60, H * 0.62, 470, 900, INK); face.text(c, "GW", 70, H * 0.8, 230, 900, INK); tag(c, "JLL", H - 80, GREY); },
  stack: (c, W, H) => {
    const words = ["DATA", "CENTRE", "DATA", "CENTRE", "DATA", "CENTRE", "DATA"];
    words.forEach((w, i) => {
      c.font = "900 215px Inter"; (c as unknown as { letterSpacing: string }).letterSpacing = "-12px";
      if (i % 2) { c.strokeStyle = INK; c.lineWidth = 4; c.strokeText(w, 40, 210 + i * 200); } else { c.fillStyle = INK; c.fillText(w, 40, 210 + i * 200); }
    });
  },
  lodha: (c, W, H) => { tag(c, "Layer 1 · Zameen", 120, "#5D5D67"); face.text(c, "Lodha", 60, H * 0.56, 250, 900, DARK); tag(c, "Palava · ~400 acre DC land", H - 80, "#5D5D67"); },
  netweb: (c, W, H) => { tag(c, "Layer 2 · Servers", 120, "#3A2C0E"); face.text(c, "Net", 60, H * 0.5, 330, 900, "#16110A"); face.text(c, "web", 60, H * 0.68, 330, 900, "#16110A"); tag(c, "Q1 FY27", H - 80, "#3A2C0E"); },
  bluestar: (c, W, H) => { tag(c, "Layer 3 · Cooling", 120, GREY); face.text(c, "Blue", 60, H * 0.5, 300, 900, INK); face.text(c, "Star", 60, H * 0.68, 300, 900, INK); tag(c, "Q1 FY27 · DC orders", H - 80, GREY); },
  vac: (c, W, H) => { tag(c, "Vacancy · H1 2026", 120, "#5D5D67"); face.text(c, "2.8", 50, H * 0.62, 470, 900, DARK); face.text(c, "%", 70, H * 0.8, 230, 900, DARK); tag(c, "Record low · JLL", H - 80, "#5D5D67"); },
  fut: (c, W, H) => {
    c.setLineDash([36, 26]); c.strokeStyle = GREY; c.lineWidth = 8; c.beginPath(); c.roundRect(40, 40, W - 80, H - 80, 60); c.stroke();
    tag(c, "2029 · anumaan", 140, GREY); face.text(c, "~6", 80, H * 0.62, 470, 900, INK); face.text(c, "GW", 90, H * 0.8, 230, 900, INK); tag(c, "JLL", H - 110, GREY);
  },
};
const WHEEL: { id: string; mat: keyof Materials }[] = [
  { id: "cap", mat: "black" }, { id: "stack", mat: "black" }, { id: "lodha", mat: "cream" }, { id: "netweb", mat: "gold" },
  { id: "bluestar", mat: "black" }, { id: "vac", mat: "cream" }, { id: "fut", mat: "black" },
];
const LAND = 3;

/* ---------------------------------------------------------------- 1. wheel */
const STEP = 0.2, R = 4.3;
const WheelScene: React.FC<{ t: number }> = ({ t }) => {
  const m = useMaterials();
  const ready = true;
  const ang = lerp(-1.25, LAND * STEP, curve.out(clamp01((t - 0.05) / 4.4))); // spins in, lands Netweb on top
  const lift = curve.out(clamp01((t - 4.6) / 0.6));
  return (
    <>
      <StudioSet fog={[11, 22]} />
      <StudioLights sweep={0.35 + 0.1 * Math.sin(t * 0.6)} key={3.3} />
      <Rig pos={[0, 0.95, 8.9]} look={[0, 0.75, 0]} fov={30} />
      <mesh position={[0, 0, -1.4]} material={m.floor} receiveShadow><planeGeometry args={[30, 30]} /></mesh>
      <group position={[0, -R, 0]} rotation={[-0.12, 0, 0]}>
        {WHEEL.map((c, i) => {
          const th = i * STEP - ang;
          if (Math.abs(th) > 1.2) return null;
          const top = Math.abs(th) < 0.02 ? lift : 0;
          const enter = curve.out(clamp01((t - i * 0.07) / 0.9));
          return (
            <group key={c.id} rotation={[0, 0, -th]}>
              <Card ready={ready} id={c.id} mat={c.mat === "gold" ? WHEEL_GOLD : m[c.mat]} front={faces[c.id]}
                position={[0, R + 0.25 * top - (1 - enter) * 3, -Math.abs(th) * 0.9 + 0.55 * top - 0.45 * lift * (top ? 0 : 1)]}
                rotation={[0, th * 0.55, 0]} scale={1 + 0.06 * top} />
            </group>
          );
        })}
      </group>
    </>
  );
};

/* ---------------------------------------------------------------- 2. flip */
const T_FLIP = 8.5;
const flipFront: Draw = (c, W, H) => {
  tag(c, "Layer 2 · Servers", 120, "#3A2C0E");
  face.text(c, "AVRON", W - 70, 120, 40, 500, "#3A2C0E", { mono: true, align: "right" });
  face.text(c, "Netweb", 60, H * 0.52, 250, 900, "#16110A");
  face.text(c, "AI se kitni", 64, H * 0.66, 110, 800, "#3A2C0E");
  face.text(c, "kamai?", 64, H * 0.75, 110, 800, "#3A2C0E");
  tag(c, "Q1 FY27", H - 80, "#3A2C0E");
};
const flipBack: Draw = (c, W, H) => {
  c.fillStyle = DARK; c.beginPath(); c.roundRect(0, 0, W, H, 87); c.fill();
  tag(c, "Netweb · Q1 FY27 results", 120, GREY);
  face.text(c, "NSE", W - 70, 120, 40, 500, GREY, { mono: true, align: "right" });
  face.text(c, "62%", 50, H * 0.56, 400, 900, INK);
  face.rule(c, 64, H * 0.6, W * 0.62, "#D9AE5B", 10);
  face.text(c, "revenue AI", 64, H * 0.71, 110, 800, INK);
  face.text(c, "systems se", 64, H * 0.8, 110, 800, INK);
  tag(c, "62.29% of Q1 FY27 revenue", H - 80, GREY);
};
const FlipScene: React.FC<{ t: number }> = ({ t }) => {
  const m = useMaterials();
  const ready = true;
  const enter = T_ZOOM + 0.3;
  const k = curve.out(clamp01((t - enter) / 0.9));
  const f = curve.inOut(clamp01((t - T_FLIP) / 0.8));
  const rotY = lerp(Math.PI / 2, 0, k) + Math.PI * f;
  const breathe = Math.sin((t - enter) * 0.8);
  return (
    <>
      <StudioSet fog={[5, 11]} />
      <StudioLights sweep={0.2 + 0.5 * f + 0.06 * breathe} key={3.6} />
      <Rig pos={[0, 0.25, 5.9 - 0.3 * clamp01((t - enter) / 5)]} look={[0, 0.12, 0]} fov={30} />
      <mesh position={[0, 0, -1.1]} material={m.floor} receiveShadow><planeGeometry args={[30, 30]} /></mesh>
      <Card ready={ready} id="flip" mat={m.gold} w={1.05} h={1.36} d={0.04} front={flipFront} back={flipBack}
        position={[0, -0.12 + 0.05 * Math.sin(f * Math.PI), lerp(-0.6, 0, k) + 0.25 * Math.sin(f * Math.PI)]}
        rotation={[0.1 + 0.05 * breathe - 0.12 * Math.sin(f * Math.PI), rotY + 0.08 * breathe, 0.02 * breathe]} />
    </>
  );
};

/* ---------------------------------------------------------------- 3. cause → effect */
const PULSES = [12.7, 13.6, 14.5];
const RUN = 0.7;
const T_SPLIT = 15.45;
const swellAt = (t: number) => {
  let s = 0;
  for (const a of PULSES.map((x) => x + RUN)) {
    if (t < a) break;
    const x = t - a;
    s += 0.33 * (1 - (1 + 12 * x) * Math.exp(-12 * x)) * (1 - 0.3 * (1 - Math.exp(-3 * x)));
  }
  return clamp01(s);
};
const slabTop: Draw = (c, W, H) => { face.text(c, "1.6 GW", W / 2, H * 0.64, 300, 900, INK, { align: "center" }); };
const Slab: React.FC<{ m: Materials; ready: boolean; s: number; gone: number }> = ({ m, ready, s, gone }) => {
  const geo = useSlabGeometry(1.5, 1.05, 0.34, 0.16, 0.06);
  const k = 1 - curve.in(gone);
  return (
    <group position={[0.3, 0.17 * (1 + 0.6 * s) * k, 0.48]} scale={[(1 + 0.1 * s) * k, (1 + 0.1 * s) * k, (1 + 0.6 * s) * k]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geo} material={m.black} castShadow receiveShadow />
      <Card ready={ready} id="slabtop" w={1.5} h={1.05} d={0.0001} mat={HIDDEN} front={slabTop} position={[0, 0, 0.171]} />
    </group>
  );
};
const dashTop: Draw = (c, W, H) => { c.setLineDash([40, 28]); c.strokeStyle = "#E2B85C"; c.lineWidth = 16; c.beginPath(); c.roundRect(30, 30, W - 60, H - 60, 70); c.stroke(); };
const GlassSlab: React.FC<{ m: Materials; pos: [number, number, number]; k: number; ready: boolean }> = ({ m, pos, k, ready }) => {
  const geo = useSlabGeometry(0.72, 0.5, 0.3, 0.1, 0.05);
  return (
    <group position={[pos[0], 0.15 * k, pos[2]]} rotation={[-Math.PI / 2, 0, 0]} scale={0.4 + 0.6 * k}>
      <mesh geometry={geo} material={m.glass} castShadow />
      <Card ready={ready} id="dash" w={0.72} h={0.5} d={0.0001} mat={HIDDEN} front={dashTop} position={[0, 0, 0.152]} />
    </group>
  );
};
const EffectScene: React.FC<{ t: number }> = ({ t }) => {
  const m = useMaterials();
  const ready = true;
  const a = T_PUSH + 0.2;
  const s = swellAt(t);
  const gone = clamp01((t - T_SPLIT) / 0.25);
  const press = Math.max(0, ...PULSES.map((x) => (t >= x - 0.12 && t < x + 0.22 ? 1 - Math.abs(t - x - 0.05) / 0.17 : 0)));
  const slugs = PULSES.map((x) => curve.inOut(clamp01((t - x) / RUN)));
  const GRID: [number, number][] = [[-0.5, -0.33], [0.5, -0.33], [-0.5, 0.33], [0.5, 0.33]];
  return (
    <>
      <StudioSet fog={[8, 16]} />
      <StudioLights sweep={0.1} />
      <Rig pos={[0.1 + 0.2 * clamp01((t - a) / 7), 7.4, 5.3]} look={[0, 0, -0.72]} fov={32} />
      <Floor m={m} />
      <PuckMesh m={m} ready={ready} position={[-0.6, 0, -1.3]} press={clamp01(press)} label="AI" />
      <CableMesh m={m} pts={[[-0.25, 0.045, -1.0], [0.3, 0.045, -0.7], [-0.2, 0.045, -0.35], [0.05, 0.045, -0.12], [0.2, 0.045, -0.05]]} slugs={slugs} draw={curve.inOut(clamp01((t - a - 0.3) / 0.7))} />
      <Slab m={m} ready={ready} s={s * clamp01((t - a) / 0.5)} gone={gone} />
      {t > T_SPLIT && GRID.map(([dx, dz], i) => {
        const k = curve.out(clamp01((t - T_SPLIT - i * 0.07) / 0.8));
        return <GlassSlab key={i} m={m} k={k} ready={ready} pos={[0.3 + dx * (0.3 + 0.75 * k), 0, 0.48 + dz * (0.3 + 0.8 * k)]} />;
      })}
    </>
  );
};

/* ---------------------------------------------------------------- the reel */
const crumbAt = (t: number) => (t < T_ZOOM ? ["Markets", "Data centres"] : t < T_PUSH ? ["Markets", "Data centres", "Netweb"] : ["Markets", "Data centres", "Capacity"]);
const Canvas3D: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThreeCanvas width={1080} height={1920} gl={GL} dpr={1} camera={{ fov: 30, position: [0, 0, 6], near: 0.1, far: 60 }} shadows>{children}</ThreeCanvas>
);

export const CardStudyV2: React.FC = () => {
  const t = useTime();
  const fontsReady = useFontsReady();
  const splitIn = curve.out(clamp01((t - T_SPLIT - 0.5) / 0.6));
  return (
    <AbsoluteFill style={{ background: ui.canvas }}>
      {fontsReady && t < T_ZOOM + 0.75 && (
        <AbsoluteFill style={t >= T_ZOOM ? zoomThrough(t, T_ZOOM, "out", 540, 1100) : {}}>
          <Canvas3D><WheelScene t={t} /></Canvas3D>
          <Head t={t} a={0.25} sub="Kamata kaun hai?">Data centre boom</Head>
        </AbsoluteFill>
      )}
      {fontsReady && t >= T_ZOOM && t < T_PUSH + 0.45 && (
        <AbsoluteFill style={t >= T_PUSH ? push(t, T_PUSH, "out") : zoomThrough(t, T_ZOOM, "in", 540, 960)}>
          <Canvas3D><FlipScene t={t} /></Canvas3D>
          <Head t={t} a={T_ZOOM + 0.45} out={T_FLIP}>Servers ka proof</Head>
          {t > T_FLIP && <Head t={t} a={T_FLIP + 0.6}>Filing mein likha hai</Head>}
        </AbsoluteFill>
      )}
      {fontsReady && t >= T_PUSH && (
        <AbsoluteFill style={push(t, T_PUSH, "in")}>
          <Canvas3D><EffectScene t={t} /></Canvas3D>
          <Head t={t} a={T_PUSH + 0.3} out={T_SPLIT - 0.2} sub="Capacity ka kya?">AI demand badhi</Head>
          {t > T_SPLIT - 0.2 && <Head t={t} a={T_SPLIT + 0.1} sub="JLL ka anumaan">2029 tak ~6 GW</Head>}
          <div style={{ position: "absolute", left: G, top: 1520, opacity: p(t, T_PUSH + 0.8) * (1 - clamp01((t - T_SPLIT) / 0.2)) }}><Chip>Jun 2026 · India DC capacity</Chip></div>
          <div style={{ position: "absolute", left: G, top: 1500, opacity: splitIn * (1 - p(t, T_END - 0.3, 0.3)) }}>
            <Chip tone="est">~6 GW · 2029 · anumaan</Chip>
            <div style={{ marginTop: 20 }}><Source t={t} a={T_SPLIT + 0.6} text="JLL via IANS · 2 Sep 2026" /></div>
          </div>
        </AbsoluteFill>
      )}
      <Shell t={t} crumb={crumbAt(t)} asOf="2 Sep 2026" />
      {t > T_END && <><Saved t={t} a={T_END} /><Disclaimer t={t} a={T_END + 0.3} /></>}
      <div style={{ position: "absolute", right: G, top: 1820, ...monoTxt(22, ui.ink3) }}>Brand v2 · card study v2 (3D)</div>
    </AbsoluteFill>
  );
};
