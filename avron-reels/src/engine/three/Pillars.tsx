import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type PillarCam = { x: number; y: number; z: number; lookY: number; fov: number };
export const PILLAR_X = [-1.9, 0, 1.9];
export const PILLAR_H = 3.4;

/** Same camera maths as the WebGL view, so DOM labels can be pinned to 3D points. */
export const projectPoint = (cam: PillarCam, p: [number, number, number], w: number, h: number) => {
  const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.1, 100);
  c.position.set(cam.x, cam.y, cam.z);
  c.lookAt(0, cam.lookY, 0);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return { x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h };
};

const Rig: React.FC<{ cam: PillarCam }> = ({ cam }) => {
  const { camera, gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    return pm.fromScene(new RoomEnvironment(), 0.04).texture;
  }, [gl]);
  useLayoutEffect(() => {
    scene.environment = env;
    scene.environmentIntensity = 0.45;
    scene.background = null;
  }, [env, scene]);
  const pc = camera as THREE.PerspectiveCamera;
  pc.fov = cam.fov;
  pc.position.set(cam.x, cam.y, cam.z);
  pc.lookAt(0, cam.lookY, 0);
  pc.updateProjectionMatrix();
  return null;
};

const Pillar: React.FC<{ x: number; lit: number; squash: number; tint: string }> = ({ x, lit, squash, tint }) => {
  const h = PILLAR_H * (1 - 0.12 * squash);
  const glow = new THREE.Color(tint);
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[1.1, h, 1.1]} />
        <meshPhysicalMaterial color={"#1a1e25"} metalness={0.92} roughness={0.26} clearcoat={0.6} clearcoatRoughness={0.2} envMapIntensity={0.28 + lit * 0.25} />
      </mesh>
      {/* emissive cap: the "load" this pillar is carrying */}
      <mesh position={[0, h + 0.04, 0]}>
        <boxGeometry args={[1.12, 0.08, 1.12]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.15 + lit * 3.5} toneMapped={false} />
      </mesh>
      {/* vertical light seam */}
      <mesh position={[0, h / 2, 0.556]}>
        <planeGeometry args={[0.035, h * 0.98]} />
        <meshBasicMaterial color={glow} transparent opacity={0.12 + lit * 0.85} toneMapped={false} />
      </mesh>
      <pointLight position={[0, h + 1.2, 1.2]} intensity={lit * 18} distance={6} color={glow} />
    </group>
  );
};

export const Pillars: React.FC<{
  cam: PillarCam; lit: [number, number, number]; squash: [number, number, number]; tint?: string; width?: number; height?: number;
}> = ({ cam, lit, squash, tint = "#E9A23B", width = 1080, height = 1920 }) => (
  <ThreeCanvas width={width} height={height} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping }} dpr={1}
    camera={{ fov: cam.fov, position: [cam.x, cam.y, cam.z], near: 0.1, far: 100 }}>
    <Rig cam={cam} />
    <ambientLight intensity={0.08} />
    <directionalLight position={[3, 8, 6]} intensity={0.9} color={"#cfd8e6"} />
    <directionalLight position={[-6, 3, -4]} intensity={0.5} color={"#5b8cff"} />
    {PILLAR_X.map((x, i) => (
      <Pillar key={i} x={x} lit={lit[i]} squash={squash[i]} tint={tint} />
    ))}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[40, 40]} />
      <meshLambertMaterial color={"#06070a"} />
    </mesh>
  </ThreeCanvas>
);
