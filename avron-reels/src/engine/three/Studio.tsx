import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/*
 * AVRON 3D studio (brand v2, 2026-10-28). Real 3D for the card moves, after the user called the CSS version "low effort":
 * a dark product-studio set with soft key + rim light and environment reflections, three house materials
 * (glossy black, brushed gold, cream), physical cards with rounded edges and canvas-drawn faces, a puck, a cable and slabs.
 * Units: 1 = one card width. Every component is a pure function of the props it is given each frame.
 */

/* ------------------------------------------------------------------ fonts for canvas faces */

const FONT_SPECS = ["900 100px Inter", "800 100px Inter", "700 100px Inter", "600 100px Inter", "500 40px 'JetBrains Mono'"];
let fontsPromise: Promise<unknown> | null = null;
/** Canvas text needs the system Inter/JetBrains faces loaded before the first draw. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender("canvas fonts"));
  useEffect(() => {
    fontsPromise ??= Promise.all(FONT_SPECS.map((f) => document.fonts.load(f)));
    fontsPromise.then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  return ready;
};

/* ------------------------------------------------------------------ set */

/** Environment reflections (RoomEnvironment through PMREM) and soft shadows. Mount once per canvas. */
export const StudioSet: React.FC<{ bg?: string; fog?: [number, number] }> = ({ bg = "#0A0A0B", fog = [9, 22] }) => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.VSMShadowMap;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    scene.background = new THREE.Color(bg);
    scene.fog = new THREE.Fog(bg, fog[0], fog[1]);
    return () => { env.dispose(); pm.dispose(); };
  }, [gl, scene, bg, fog]);
  return null;
};

/** Key light (warm, upper left, soft shadows), rim light (cool, behind right) and a low fill. `sweep` moves the key across. */
export const StudioLights: React.FC<{ sweep?: number; key?: number }> = ({ sweep = 0, key = 3.2 }) => (
  <>
    <directionalLight position={[-4 + sweep * 6, 6, 5]} intensity={key} color={"#FFF1DC"} castShadow
      shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-radius={9} shadow-blurSamples={16} shadow-bias={-0.0004}
      shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
    <directionalLight position={[5, 3, -4]} intensity={1.6} color={"#CFE0FF"} />
    <ambientLight intensity={0.08} />
  </>
);

/** Camera rig: position + look-at, set every frame. */
export const Rig: React.FC<{ pos: [number, number, number]; look: [number, number, number]; fov?: number }> = ({ pos, look, fov = 30 }) => {
  const { camera } = useThree();
  const pc = camera as THREE.PerspectiveCamera;
  pc.position.set(...pos);
  pc.fov = fov;
  pc.lookAt(...look);
  pc.updateProjectionMatrix();
  return null;
};

/* ------------------------------------------------------------------ materials */

export const useMaterials = () => useMemo(() => ({
  black: new THREE.MeshPhysicalMaterial({ color: "#0E0E12", roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.06 }),
  gold: new THREE.MeshPhysicalMaterial({ color: "#D9AE5B", roughness: 0.3, metalness: 1, clearcoat: 0.6, clearcoatRoughness: 0.15 }),
  cream: new THREE.MeshPhysicalMaterial({ color: "#EFE9DC", roughness: 0.55, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.2 }),
  rubber: new THREE.MeshPhysicalMaterial({ color: "#141418", roughness: 0.55, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 }),
  // frosted cream acrylic: estimates and things not built yet ("ghost" objects)
  glass: new THREE.MeshPhysicalMaterial({ color: "#EFE9DC", roughness: 0.35, metalness: 0, transparent: true, opacity: 0.38, clearcoat: 1, clearcoatRoughness: 0.1, depthWrite: false }),
  floor: new THREE.MeshStandardMaterial({ color: "#0B0B0D", roughness: 0.85, metalness: 0 }),
}), []);
export type Materials = ReturnType<typeof useMaterials>;

/* ------------------------------------------------------------------ geometry */

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

/** A rounded slab with bevelled edges, centred on the origin, depth along z. */
export const useSlabGeometry = (w: number, h: number, d: number, r: number, bevel = Math.min(d * 0.35, 0.03)) =>
  useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel)), {
      depth: Math.max(0.001, d - bevel * 2), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 6, curveSegments: 24,
    });
    g.translate(0, 0, -(d - bevel * 2) / 2);
    g.computeVertexNormals();
    return g;
  }, [w, h, d, r, bevel]);

/* ------------------------------------------------------------------ faces */

export type Draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => void;
/** A face texture drawn once on a 2D canvas (px = 1024 per unit of width). */
export const useFaceTexture = (ready: boolean, w: number, h: number, draw: Draw, key: string) =>
  useMemo(() => {
    if (!ready) return null;
    const W = Math.round(1024 * w), H = Math.round(1024 * h);
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    draw(ctx, W, H);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, w, h, key]);

/** Canvas helpers in face pixels. */
export const face = {
  text: (ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, weight: number, color: string, opts: { align?: CanvasTextAlign; track?: number; mono?: boolean } = {}) => {
    ctx.font = `${weight} ${size}px ${opts.mono ? "'JetBrains Mono'" : "Inter"}`;
    ctx.fillStyle = color;
    ctx.textAlign = opts.align ?? "left";
    ctx.textBaseline = "alphabetic";
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${(opts.track ?? (opts.mono ? 0.04 : -0.045)) * size}px`;
    ctx.fillText(opts.mono ? s.toUpperCase() : s, x, y);
  },
  rule: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string, h = 6) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); },
};

/* ------------------------------------------------------------------ objects */

/**
 * A physical card: rounded bevelled body in a house material, printed faces on front and back (transparent canvas
 * textures laid a hair above the surface so the clearcoat body still catches the light around the print).
 */
export const Card: React.FC<{
  ready: boolean; w?: number; h?: number; d?: number; mat: THREE.Material; front?: Draw; back?: Draw; id: string;
  position?: [number, number, number]; rotation?: [number, number, number]; scale?: number;
}> = ({ ready, w = 1, h = 1.55, d = 0.035, mat, front, back, id, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) => {
  const geo = useSlabGeometry(w, h, d, 0.085);
  const ft = useFaceTexture(ready, w, h, front ?? (() => undefined), id + "f");
  const bt = useFaceTexture(ready, w, h, back ?? (() => undefined), id + "b");
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geo} material={mat} castShadow receiveShadow />
      {front && ft && (
        <mesh position={[0, 0, d / 2 + 0.0015]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial map={ft} transparent roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.1} />
        </mesh>
      )}
      {back && bt && (
        <mesh position={[0, 0, -d / 2 - 0.0015]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[w, h]} />
          <meshPhysicalMaterial map={bt} transparent roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.1} />
        </mesh>
      )}
    </group>
  );
};

/** The button: black rubber body, brushed-gold cap that sinks by `press` (0..1). Sits on y = 0. */
export const PuckMesh: React.FC<{ m: Materials; position: [number, number, number]; r?: number; press?: number; ready: boolean; label?: string }> = ({ m, position, r = 0.55, press = 0, ready, label }) => {
  const body = useMemo(() => {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(r * 0.98, 0), new THREE.Vector2(r, 0.03), new THREE.Vector2(r, 0.24), new THREE.Vector2(r * 0.97, 0.27), new THREE.Vector2(r * 0.86, 0.27), new THREE.Vector2(r * 0.86, 0.2), new THREE.Vector2(0, 0.2)];
    return new THREE.LatheGeometry(pts, 96);
  }, [r]);
  const cap = useMemo(() => {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(r * 0.8, 0), new THREE.Vector2(r * 0.82, 0.05), new THREE.Vector2(r * 0.8, 0.1), new THREE.Vector2(r * 0.6, 0.125), new THREE.Vector2(0, 0.13)];
    return new THREE.LatheGeometry(pts, 96);
  }, [r]);
  const tex = useFaceTexture(ready, 1, 1, (ctx, W, H) => face.text(ctx, label ?? "", W / 2, H * 0.62, 360, 900, "#1A1406", { align: "center" }), "puck" + label);
  return (
    <group position={position}>
      <mesh geometry={body} material={m.rubber} castShadow receiveShadow />
      <group position={[0, 0.2 - 0.06 * press, 0]}>
        <mesh geometry={cap} material={m.gold} castShadow />
        {label && tex && (
          <mesh position={[0, 0.132, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[r * 1.2, r * 1.2]} />
            <meshStandardMaterial map={tex} transparent roughness={0.4} metalness={0.3} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** A cable lying on the floor along points, plus gold slugs that run along it at the given progress values (0..1). */
export const CableMesh: React.FC<{ m: Materials; pts: [number, number, number][]; slugs: number[]; draw?: number }> = ({ m, pts, slugs, draw = 1 }) => {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)), false, "catmullrom", 0.4), [pts]);
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 160, 0.045, 16, false), [curve]);
  const slug = useMemo(() => new THREE.CapsuleGeometry(0.06, 0.16, 8, 16), []);
  useMemo(() => tube.setDrawRange(0, 0), [tube]);
  tube.setDrawRange(0, Math.floor(tube.index!.count * draw / 6) * 6);
  return (
    <>
      <mesh geometry={tube} material={m.rubber} castShadow receiveShadow />
      {slugs.map((u, i) => {
        if (u <= 0 || u >= 1) return null;
        const p = curve.getPointAt(u), tg = curve.getTangentAt(u);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
        return <mesh key={i} geometry={slug} material={m.gold} position={p} quaternion={q} castShadow />;
      })}
    </>
  );
};

/** Floor that catches the shadows and fades into the fog. */
export const Floor: React.FC<{ m: Materials; y?: number }> = ({ m, y = 0 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} material={m.floor} receiveShadow>
    <planeGeometry args={[60, 60]} />
  </mesh>
);
