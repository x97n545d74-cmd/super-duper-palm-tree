import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

export type Uniforms = Record<string, number | [number, number, number]>;

const Plane: React.FC<{ frag: string; u: Uniforms }> = ({ frag, u }) => {
  const uniforms = useMemo(() => {
    const o: Record<string, { value: number | THREE.Vector3 }> = {};
    for (const [k, v] of Object.entries(u)) o[k] = { value: Array.isArray(v) ? new THREE.Vector3(...v) : v };
    return o;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  for (const [k, v] of Object.entries(u)) {
    if (Array.isArray(v)) (uniforms[k].value as THREE.Vector3).set(...v);
    else uniforms[k].value = v;
  }
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} depthTest={false} />
    </mesh>
  );
};

/** Full-frame fragment-shader layer, rendered at `scale` of the output size and upscaled (soft content only). */
export const ShaderPlane: React.FC<{ frag: string; u: Uniforms; width?: number; height?: number; scale?: number; style?: React.CSSProperties }> = ({
  frag, u, width = 1080, height = 1920, scale = 0.5, style,
}) => {
  const w = Math.round(width * scale), h = Math.round(height * scale);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${1 / scale})`, transformOrigin: "0 0", ...style }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: false, alpha: true, preserveDrawingBuffer: true }} dpr={1}>
        <Plane frag={frag} u={{ ...u, uAspect: w / h }} />
      </ThreeCanvas>
    </div>
  );
};

/** Storm sky: drifting fbm clouds, under-lit by city glow, with lightning illumination. */
export const STORM_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uFlash, uHorizon;
uniform vec3 uCity, uSky;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<6;i++){ s+=a*noise(p); p=p*2.02+vec2(3.1,1.7); a*=0.5; } return s; }
void main(){
  vec2 uv = vUv; uv.x *= uAspect;
  float y = vUv.y;                          // 0 bottom .. 1 top
  vec2 q = vec2(uv.x*1.6, y*2.4) + vec2(uTime*0.025, 0.0);
  float c = fbm(q + fbm(q*1.3 + uTime*0.02)*1.2);
  float billow = smoothstep(0.35, 0.85, c);
  float nearH = 1.0 - smoothstep(uHorizon, uHorizon + 0.35, y);     // glow near horizon
  vec3 col = uSky * (0.25 + 0.75*billow);
  col += uCity * nearH * (0.35 + 0.65*billow) * 0.9;
  // lightning: bright cloud underside, brightest where clouds are thick
  col += vec3(0.75, 0.8, 1.0) * uFlash * (0.25 + 1.4*billow) * (0.4 + 0.6*smoothstep(0.2, 1.0, y));
  col *= smoothstep(uHorizon - 0.06, uHorizon + 0.02, y);            // below horizon: transparent (photo shows)
  float a = smoothstep(uHorizon - 0.06, uHorizon + 0.04, y);
  gl_FragColor = vec4(col, a);
}
`;
