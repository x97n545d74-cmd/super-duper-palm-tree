import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export type TowerCam = { x: number; y: number; z: number; tx: number; ty: number; tz: number; fov: number };

/** Lattice transmission tower: tapered legs, X-bracing on every face, three cross-arms. Units: metres. */
const H = 46;
const legHalf = (y: number) => THREE.MathUtils.lerp(5.2, 1.1, Math.pow(y / H, 0.8));
const ARMS = [
  { y: 31, span: 9.5 },
  { y: 36, span: 8 },
  { y: 41, span: 6.5 },
];

type Seg = [THREE.Vector3, THREE.Vector3, number];

function towerSegments(): Seg[] {
  const segs: Seg[] = [];
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const levels = [0, 5, 9.5, 13.5, 17, 20.5, 24, 27.5, 31, 33.5, 36, 38.5, 41, 43.5, H];
  const corners = (y: number) => {
    const h = legHalf(y);
    return [v(-h, y, -h), v(h, y, -h), v(h, y, h), v(-h, y, h)];
  };
  for (let i = 0; i < levels.length - 1; i++) {
    const a = corners(levels[i]), b = corners(levels[i + 1]);
    for (let k = 0; k < 4; k++) {
      segs.push([a[k], b[k], 0.32]); // main legs
      const n = (k + 1) % 4;
      segs.push([a[k], b[n], 0.11]); // X bracing
      segs.push([a[n], b[k], 0.11]);
      segs.push([b[k], b[n], 0.13]); // horizontal girts
    }
  }
  // cross-arms: triangulated booms both sides
  for (const { y, span } of ARMS) {
    const h = legHalf(y);
    for (const s of [-1, 1]) {
      const tip = v(s * span, y, 0);
      segs.push([v(s * h, y, -h), tip, 0.16], [v(s * h, y, h), tip, 0.16]);
      segs.push([v(s * h, y + 2.2, 0), tip, 0.1]);
      segs.push([v(s * h, y + 2.2, -h * 0.6), v(s * h, y, -h), 0.08]);
      segs.push([v(s * h, y + 2.2, h * 0.6), v(s * h, y, h), 0.08]);
      for (let f = 0.25; f < 1; f += 0.25) {
        const p = v(s * THREE.MathUtils.lerp(h, span, f), y, 0);
        segs.push([p, v(s * THREE.MathUtils.lerp(h, span, f), y + 2.2 * (1 - f), 0), 0.07]);
      }
    }
  }
  // earth-wire peak
  segs.push([v(-1.1, H, 0), v(0, H + 3.5, 0), 0.12], [v(1.1, H, 0), v(0, H + 3.5, 0), 0.12]);
  return segs;
}

/** Points where the insulator strings hang (conductor attachment), relative to tower origin. */
export const towerAttach = () => ARMS.flatMap(({ y, span }) => [-1, 1].map((s) => new THREE.Vector3(s * (span - 0.4), y - 3.2, 0)));

const Lattice: React.FC<{ position: [number, number, number]; mat: THREE.Material; glint: number }> = ({ position, mat, glint }) => {
  const segs = useMemo(towerSegments, []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const ref = React.useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    segs.forEach(([a, b, w], i) => {
      const d = b.clone().sub(a), len = d.length();
      q.setFromUnitVectors(up, d.normalize());
      m.compose(a.clone().add(b).multiplyScalar(0.5), q, new THREE.Vector3(w, len, w));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [segs]);
  const att = useMemo(towerAttach, []);
  return (
    <group position={position}>
      <instancedMesh ref={ref} args={[geo, mat, segs.length]} />
      {att.map((p, i) => (
        <group key={i} position={[p.x, p.y, p.z]}>
          {/* insulator string: stacked glass discs */}
          {Array.from({ length: 9 }).map((_, k) => (
            <mesh key={k} position={[0, 0.33 * k, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.1, 14]} />
              <meshStandardMaterial color={"#6fa3c8"} emissive={"#7fb8ff"} emissiveIntensity={0.15 + glint * 1.2} metalness={0.2} roughness={0.15} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

/** Sagging conductor between two attachment points (catenary approximated by a parabola). */
const Wire: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; sag: number; color: string; energy: number }> = ({ a, b, sag, color, energy }) => {
  const geo = useMemo(() => {
    const pts = Array.from({ length: 40 }, (_, i) => {
      const f = i / 39;
      return a.clone().lerp(b, f).add(new THREE.Vector3(0, -sag * 4 * f * (1 - f), 0));
    });
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.07, 6, false);
  }, [a, b, sag]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={"#20252d"} emissive={color} emissiveIntensity={energy} metalness={0.8} roughness={0.35} toneMapped={false} />
    </mesh>
  );
};

const SKY_VERT = `varying vec3 vW; void main(){ vW = (modelMatrix*vec4(position,1.)).xyz; gl_Position = projectionMatrix*viewMatrix*vec4(vW,1.); }`;
const SKY_FRAG = `
uniform float uT; uniform float uNight; varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  vec3 d = normalize(vW);
  float y = clamp(d.y, -0.2, 1.0);
  vec3 horizon = mix(vec3(1.0,0.46,0.18), vec3(0.20,0.22,0.42), uNight);
  vec3 mid = mix(vec3(0.42,0.18,0.30), vec3(0.06,0.07,0.16), uNight);
  vec3 zen = mix(vec3(0.05,0.06,0.15), vec3(0.01,0.015,0.04), uNight);
  vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, y));
  c = mix(c, zen, smoothstep(0.15, 0.7, y));
  // low sun glow behind the tower
  vec3 sunDir = normalize(vec3(0.15, 0.04, -1.0));
  float s = max(dot(d, sunDir), 0.0);
  c += vec3(1.0,0.55,0.22) * (pow(s, 40.0)*1.6 + pow(s, 6.0)*0.25) * (1.0 - uNight);
  // stars at night
  vec2 g = floor(d.xz / max(d.y,0.05) * 220.0);
  c += vec3(0.8,0.85,1.0) * step(0.9975, h(g)) * smoothstep(0.2,0.6,y) * uNight;
  if (d.y < 0.0) c = mix(vec3(0.03,0.03,0.04), c, 0.25);
  gl_FragColor = vec4(c, 1.0);
}`;

const Rig: React.FC<{ cam: TowerCam }> = ({ cam }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(0x1a1420, 0.0065);
  }, [scene]);
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov;
  pc.position.set(cam.x, cam.y, cam.z);
  pc.lookAt(cam.tx, cam.ty, cam.tz);
  pc.updateProjectionMatrix();
  return null;
};

export const TowerScene: React.FC<{ t: number; cam: TowerCam; energy?: number; night?: number; width?: number; height?: number }> = ({
  t, cam, energy = 0, night = 0, width = 1080, height = 1920,
}) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b3038", metalness: 0.85, roughness: 0.45 }), []);
  const skyMat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uT: { value: 0 }, uNight: { value: 0 } } }), []);
  skyMat.uniforms.uT.value = t;
  skyMat.uniforms.uNight.value = night;
  // a line of towers receding into the distance
  const towers: [number, number, number][] = [[0, 0, 0], [-14, 0, -95], [-30, 0, -190], [-48, 0, -285]];
  const att = useMemo(towerAttach, []);
  const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }} dpr={1}
      camera={{ fov: cam.fov, position: [cam.x, cam.y, cam.z], near: 0.3, far: 2000 }}>
      <Rig cam={cam} />
      <mesh material={skyMat}><sphereGeometry args={[900, 48, 24]} /></mesh>
      <hemisphereLight args={["#ffb27a", "#0a0c12", 0.35]} />
      <directionalLight position={[20, 12, -120]} intensity={2.2} color={"#ffae6b"} />
      <directionalLight position={[-40, 30, 60]} intensity={0.35} color={"#5b8cff"} />
      {towers.map((p, i) => <Lattice key={i} position={p} mat={mat} glint={energy * (i === 0 ? 1 : 0.4)} />)}
      {towers.slice(0, -1).map((p, i) =>
        att.map((a, k) => (
          <Wire key={`${i}-${k}`} a={a.clone().add(new THREE.Vector3(...p))} b={a.clone().add(new THREE.Vector3(...towers[i + 1]))} sag={6.5}
            color={"#7fb8ff"} energy={energy * (0.6 + 0.4 * pulse)} />
        )),
      )}
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, -300]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color={"#0b0b0f"} roughness={1} />
      </mesh>
    </ThreeCanvas>
  );
};
