import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Ray-traced viscous liquid: camera ray hits a plane displaced by an fbm heightfield;
// normals from finite differences; Fresnel reflection of a studio softbox strip.
const frag = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime, uAspect, uCamH, uPitch, uYaw, uGlowEl, uExposure, uRipple, uRippleT, uFade;
uniform vec3 uGlow;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=0.5, s=0.0; for(int i=0;i<4;i++){ s+=a*noise(p); p=p*2.07+vec2(1.7,9.2); a*=0.5; } return s; }

float height(vec2 p){
  float t = uTime;
  float h = fbm(p*0.32 + vec2(t*0.035, t*0.02));
  h += 0.35*fbm(p*1.1 - vec2(t*0.05, 0.0));
  // impact ripple (rings spreading from a point ahead of the camera)
  float d = length(p - vec2(0.0, 7.0));
  float rt = max(uTime - uRippleT, 0.0);
  h += uRipple * 0.22 * sin(d*3.2 - rt*7.0) * exp(-abs(d - rt*2.2)*1.2) * exp(-rt*0.5) * step(0.0, uTime - uRippleT);
  return h*0.32;
}

vec3 env(vec3 d){
  float el = d.y;
  vec3 c = mix(vec3(0.0015,0.0017,0.0022), vec3(0.006,0.007,0.010), smoothstep(-0.2, 0.6, el));
  // narrow studio softbox: only wave faces angled toward it catch light -> crisp highlights
  float strip = exp(-pow((el-uGlowEl)*30.0, 2.0)) * smoothstep(1.1, 0.0, abs(d.x + 0.1));
  c += uGlow * strip * 5.0;
  float strip2 = exp(-pow((el-uGlowEl-0.14)*60.0, 2.0)) * smoothstep(0.55, 0.0, abs(d.x - 0.35));
  c += vec3(0.55,0.66,0.85) * strip2 * 1.2;
  return c;
}

void main(){
  vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0) * 2.0;
  vec3 ro = vec3(0.0, uCamH, 0.0);
  vec3 fw = normalize(vec3(sin(uYaw), -sin(uPitch), cos(uYaw)*cos(uPitch)));
  vec3 rt = normalize(cross(vec3(0.0,1.0,0.0), fw));
  vec3 up = cross(fw, rt);
  vec3 rd = normalize(fw*1.7 + uv.x*rt + uv.y*up);
  vec3 col;
  if (rd.y < -0.002) {
    float tt = -ro.y / rd.y;
    vec3 p = ro + rd*tt;
    vec2 q = p.xz;
    float e = 0.03;
    vec3 n = normalize(vec3(height(q-vec2(e,0.0)) - height(q+vec2(e,0.0)), 2.0*e, height(q-vec2(0.0,e)) - height(q+vec2(0.0,e))));
    vec3 r = reflect(rd, n);
    float fres = 0.04 + 0.96*pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
    col = vec3(0.0012,0.0011,0.0010) + env(r)*fres;
    vec3 haze = vec3(0.006,0.005,0.004) + uGlow*0.025;
    col = mix(col, haze, 1.0 - exp(-tt*0.03));
  } else {
    col = env(rd) * 0.1 + (vec3(0.006,0.005,0.004) + uGlow*0.025) * exp(-rd.y*14.0);
  }
  col = 1.0 - exp(-col * uExposure);
  col = pow(col, vec3(1.0/2.2));
  gl_FragColor = vec4(col * uFade, 1.0);
}
`;

export type OilCam = { h: number; pitch: number; yaw: number };

const Surface: React.FC<{ t: number; cam: OilCam; glow: [number, number, number]; glowEl: number; exposure: number; ripple: number; rippleT: number; fade: number; aspect: number }> = (p) => {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 }, uAspect: { value: 1 }, uCamH: { value: 1 }, uPitch: { value: 0.2 }, uYaw: { value: 0 },
      uGlowEl: { value: 0.08 }, uExposure: { value: 1.4 }, uGlow: { value: new THREE.Vector3(1, 0.6, 0.2) },
      uRipple: { value: 0 }, uRippleT: { value: 0 }, uFade: { value: 1 },
    }),
    [],
  );
  uniforms.uTime.value = p.t;
  uniforms.uAspect.value = p.aspect;
  uniforms.uCamH.value = p.cam.h;
  uniforms.uPitch.value = p.cam.pitch;
  uniforms.uYaw.value = p.cam.yaw;
  uniforms.uGlowEl.value = p.glowEl;
  uniforms.uExposure.value = p.exposure;
  uniforms.uGlow.value.set(...p.glow);
  uniforms.uRipple.value = p.ripple;
  uniforms.uRippleT.value = p.rippleT;
  uniforms.uFade.value = p.fade;
  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  );
};

/** Full-frame oil surface. Rendered at half resolution and upscaled: the surface is soft by design. */
export const OilSurface: React.FC<{
  t: number; cam: OilCam; glow?: [number, number, number]; glowEl?: number; exposure?: number;
  ripple?: number; rippleT?: number; fade?: number; width?: number; height?: number;
}> = ({ t, cam, glow = [1.0, 0.55, 0.16], glowEl = 0.1, exposure = 1.3, ripple = 0, rippleT = 0, fade = 1, width = 1080, height = 1920 }) => {
  const w = width / 2, h = height / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: "scale(2)", transformOrigin: "0 0" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: false, preserveDrawingBuffer: true }} dpr={1}>
        <Surface t={t} cam={cam} glow={glow} glowEl={glowEl} exposure={exposure} ripple={ripple} rippleT={rippleT} fade={fade} aspect={w / h} />
      </ThreeCanvas>
    </div>
  );
};
