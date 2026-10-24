import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { rand } from "../anim";

export type RoomCam = { x: number; y: number; z: number; tx: number; ty: number; tz: number; fov: number };

/** Same projection as the WebGL camera, for pinning DOM overlays to 3D points. */
export const projectRoom = (cam: RoomCam, p: [number, number, number], w = 1080, h = 1920) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.05, 100);
  c.position.set(cam.x, cam.y, cam.z);
  c.lookAt(cam.tx, cam.ty, cam.tz);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, z: v.z };
};

const Rig: React.FC<{ cam: RoomCam }> = ({ cam }) => {
  const { camera, scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2(0x07060a, 0.085);
    scene.background = new THREE.Color(0x050407);
  }, [scene]);
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov;
  pc.near = 0.05;
  pc.position.set(cam.x, cam.y, cam.z);
  pc.lookAt(cam.tx, cam.ty, cam.tz);
  pc.updateProjectionMatrix();
  return null;
};

// Volumetric light cone: additive, soft at the edges (view-angle falloff) and fading with distance from the lamp.
const coneVert = /* glsl */ `
varying float vH; varying vec3 vN; varying vec3 vV;
uniform float uH;
void main(){
  vH = (position.y + uH*0.5) / uH;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const coneFrag = /* glsl */ `
varying float vH; varying vec3 vN; varying vec3 vV;
uniform vec3 uColor; uniform float uI;
void main(){
  float edge = pow(abs(dot(vN, vV)), 2.2);
  float fall = pow(vH, 1.6);
  gl_FragColor = vec4(uColor * edge * fall * uI, 1.0);
}`;

const Cone: React.FC<{ pos: [number, number, number]; h: number; r: number; i: number }> = ({ pos, h, r, i }) => {
  const u = useMemo(() => ({ uH: { value: h }, uColor: { value: new THREE.Color("#ffb46a") }, uI: { value: i } }), [h, i]);
  u.uI.value = i;
  return (
    <mesh position={[pos[0], pos[1] - h / 2, pos[2]]}>
      <coneGeometry args={[r, h, 48, 1, true]} />
      <shaderMaterial vertexShader={coneVert} fragmentShader={coneFrag} uniforms={u} transparent depthWrite={false}
        blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Anonymous seated figure: original silhouette (no likeness), with subtle breathing.
const Figure: React.FC<{ p: [number, number, number]; facing: number; t: number; seed: number; standing?: boolean }> = ({ p, facing, t, seed, standing }) => {
  const breathe = 1 + 0.012 * Math.sin(t * (1.6 + rand(seed) * 0.4) + seed);
  const head = 0.03 * Math.sin(t * 0.35 + seed * 2);
  const mat = <meshStandardMaterial color={"#0b0b0e"} roughness={0.85} metalness={0.05} />;
  const base = standing ? 0.0 : 0.45;
  return (
    <group position={p} rotation={[0, facing, 0]}>
      <mesh position={[0, base + 0.42, 0]} scale={[1, breathe, 1]}>
        <capsuleGeometry args={[0.2, 0.42, 8, 16]} />
        {mat}
      </mesh>
      <mesh position={[0, base + 0.78, 0]} scale={[1.55, 0.5, 1]}>
        <sphereGeometry args={[0.17, 16, 12]} />
        {mat}
      </mesh>
      <mesh position={[0, base + 1.0, 0]} rotation={[0, head, 0]}>
        <sphereGeometry args={[0.115, 24, 16]} />
        {mat}
      </mesh>
      {standing && (
        <mesh position={[0, 0.3, 0]}>
          <capsuleGeometry args={[0.14, 0.6, 6, 12]} />
          {mat}
        </mesh>
      )}
    </group>
  );
};

// Window: rain streaks over blurred city light (cold exterior seen from the warm room).
const winFrag = /* glsl */ `
varying vec2 vUv; uniform float uTime; uniform float uRed;
float h(float x){ return fract(sin(x*91.7)*43758.5); }
void main(){
  vec2 uv = vUv;
  vec3 col = mix(vec3(0.02,0.03,0.06), vec3(0.06,0.09,0.16), uv.y);
  for (int i=0;i<7;i++){ float fi=float(i); vec2 c=vec2(h(fi+1.0), 0.15+0.35*h(fi+7.0));
    float d=length((uv-c)*vec2(3.0,6.0)); col += mix(vec3(0.9,0.55,0.25), vec3(0.95,0.15,0.12), uRed*step(0.5,h(fi+3.0))) * exp(-d*d*3.0)*0.35; }
  float x = uv.x*60.0; float id=floor(x); float sp = 0.3+0.7*h(id);
  float y = fract(uv.y*1.5 + uTime*sp*0.6 + h(id+2.0));
  float streak = smoothstep(0.08,0.0,abs(fract(x)-0.5)) * smoothstep(0.0,0.25,y)*smoothstep(1.0,0.6,y);
  col += vec3(0.5,0.6,0.75)*streak*0.25;
  gl_FragColor = vec4(col,1.0);
}`;
const winVert = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

const Window: React.FC<{ t: number; red: number }> = ({ t, red }) => {
  const u = useMemo(() => ({ uTime: { value: 0 }, uRed: { value: 0 } }), []);
  u.uTime.value = t;
  u.uRed.value = red;
  return (
    <mesh position={[0, 1.7, -4.2]}>
      <planeGeometry args={[3.6, 2.2]} />
      <shaderMaterial vertexShader={winVert} fragmentShader={winFrag} uniforms={u} />
    </mesh>
  );
};

const Dust: React.FC<{ t: number }> = ({ t }) => {
  const geo = useMemo(() => {
    const n = 500, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { a[i * 3] = (rand(i) - 0.5) * 2.4; a[i * 3 + 1] = 0.8 + rand(i + 1) * 1.7; a[i * 3 + 2] = -3 + rand(i + 2) * 5; }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);
  return (
    <points geometry={geo} position={[Math.sin(t * 0.2) * 0.05, -((t * 0.03) % 0.3), 0]}>
      <pointsMaterial size={0.012} color={"#ffd9a8"} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
};

// Downward tungsten spotlight with its target registered in the scene (so it actually points down).
const Lamp: React.FC<{ p: [number, number, number]; i: number }> = ({ p, i }) => {
  const light = useMemo(() => {
    const l = new THREE.SpotLight("#ffa75a", 0, 6, 0.5, 0.65, 1.8);
    l.position.set(...p);
    l.target.position.set(p[0], 0, p[2]);
    return l;
  }, [p[0], p[1], p[2]]);
  light.intensity = i;
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
    </>
  );
};

export const BriefingRoom: React.FC<{ t: number; cam: RoomCam; lampI?: number; red?: number; width?: number; height?: number }> = ({
  t, cam, lampI = 1, red = 0, width = 1080, height = 1920,
}) => {
  const lamps: [number, number, number][] = [[0, 2.55, 1.2], [0, 2.55, -0.6], [0, 2.55, -2.4]];
  const seats: [number, number, number, number][] = [
    [-1.05, 0, 1.5, Math.PI / 2], [-1.05, 0, 0.2, Math.PI / 2], [-1.05, 0, -1.1, Math.PI / 2],
    [1.05, 0, 1.0, -Math.PI / 2], [1.05, 0, -0.3, -Math.PI / 2], [1.05, 0, -1.6, -Math.PI / 2],
  ];
  return (
    <ThreeCanvas width={width} height={height} dpr={1}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      camera={{ fov: cam.fov, position: [cam.x, cam.y, cam.z], near: 0.05, far: 60 }}>
      <Rig cam={cam} />
      <ambientLight intensity={0.03} />
      <hemisphereLight args={["#1a2233", "#1a0f07", 0.04]} />
      {/* cold backlight from the window: rim-lights the silhouettes */}
      <directionalLight position={[0, 7, -6]} intensity={0.35} color={"#7d9cc8"} />
      {lamps.map((p, i) => (
        <group key={i}>
          <Lamp p={p} i={6.5 * lampI} />
          <mesh position={p}>
            <cylinderGeometry args={[0.07, 0.24, 0.16, 32, 1, true]} />
            <meshStandardMaterial color={"#1b1510"} metalness={0.6} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[p[0], p[1] - 0.05, p[2]]}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshBasicMaterial color={new THREE.Color(1.0, 0.75, 0.45).multiplyScalar(2.5 * lampI)} toneMapped={false} />
          </mesh>
          <mesh position={[p[0], p[1] + 0.6, p[2]]}>
            <cylinderGeometry args={[0.005, 0.005, 1.2, 6]} />
            <meshBasicMaterial color={"#222"} />
          </mesh>
          <Cone pos={[p[0], p[1] - 0.06, p[2]]} h={2.4} r={1.15} i={0.11 * lampI} />
        </group>
      ))}
      {/* table: dark polished wood */}
      <mesh position={[0, 0.76, -0.4]}>
        <boxGeometry args={[1.35, 0.07, 5.4]} />
        <meshStandardMaterial color={"#5a3018"} roughness={0.72} metalness={0} />
      </mesh>
      <mesh position={[0, 0.38, -0.9]}>
        <boxGeometry args={[0.9, 0.7, 3.6]} />
        <meshStandardMaterial color={"#120a06"} roughness={0.7} />
      </mesh>
      {/* papers + folders on the table (catch the lamp light) */}
      {[[-0.35, 1.25, 0.08], [0.33, 0.05, -0.1], [-0.3, -0.75, 0.2], [0.35, -1.6, -0.15]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.8, z]} rotation={[-Math.PI / 2, 0, r]}>
          <planeGeometry args={[0.24, 0.32]} />
          <meshStandardMaterial color={i % 2 ? "#e9e3d6" : "#7a1418"} roughness={0.9} />
        </mesh>
      ))}
      {seats.map(([x, y, z, f], i) => (
        <Figure key={i} p={[x, y, z]} facing={f} t={t} seed={i + 1} />
      ))}
      <Figure p={[0.0, 0, -3.55]} facing={0} t={t} seed={11} standing />
      {/* room shell */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={"#0a0705"} roughness={0.85} />
      </mesh>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.8, -0.5]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[9, 3.6]} />
          <meshStandardMaterial color={"#1f130b"} roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 1.8, -4.25]}>
        <planeGeometry args={[6, 3.6]} />
        <meshStandardMaterial color={"#140d08"} roughness={0.7} />
      </mesh>
      <Window t={t} red={red} />
      <Dust t={t} />
    </ThreeCanvas>
  );
};
