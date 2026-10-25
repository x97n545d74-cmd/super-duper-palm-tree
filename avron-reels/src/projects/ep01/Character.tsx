import React from "react";
import { Img, staticFile } from "remotion";
import rig from "../../../public/ep01/chars/rig.json";
import mouthData from "../../../public/ep01/mouth.json";
import { clamp01, ease, lerp, rand } from "../../engine/anim";

/*
 * Cut-out puppet of one of the two leads, drawn from the user's reference sheet.
 * The body PNG is the original drawing with only the eyes, brows and mouth painted out; the eyes and
 * brows are the original sprites (moved, tilted, blinked), and the mouth is redrawn in the same ink so
 * it can lip-sync. Nothing else about the characters is changed.
 */
export type Who = "boy" | "girl";
export type MouthMode = "talk" | "smile" | "smirk" | "grin" | "o" | "frown" | "flat";
export type Face = {
  browL: number; browR: number; // raise: + up, - down (in sprite px at 2x)
  tilt: number; // + angry (inner ends down), - worried (inner ends up)
  eye: number; // 1 open, 0 closed, 0.55 smug
  lookX: number; lookY: number;
  mouth: MouthMode; mouthAmt: number; // amount for non-talk shapes
  lean: number; // body rotation, degrees
  dx: number; dy: number; // body offset in canvas px
};
export const NEUTRAL: Face = { browL: 0, browR: 0, tilt: 0, eye: 1, lookX: 0, lookY: 0, mouth: "smile", mouthAmt: 0.6, lean: 0, dx: 0, dy: 0 };
export type Key = [number, Partial<Face>];

type R = { origin: [number, number]; size: [number, number]; features: Record<string, { x: number; y: number; w: number; h: number; cx: number; cy: number }> };
const RIG = rig as unknown as Record<Who, R>;
const MOUTH = mouthData as Record<Who, number[]>;
const INK = "#151113", LIP_IN = "#9C3A4C", TONGUE = "#E8737D";

const NUM: (keyof Face)[] = ["browL", "browR", "tilt", "eye", "lookX", "lookY", "mouthAmt", "lean", "dx", "dy"];
/** Expression at time t: each key eases in from the previous state over `blend` seconds. */
export const faceAt = (keys: Key[], t: number, blend = 0.16): Face => {
  let cur: Face = { ...NEUTRAL };
  let prev: Face = { ...NEUTRAL };
  let since = Infinity;
  for (const [kt, f] of keys) {
    if (kt > t) break;
    prev = cur;
    cur = { ...cur, ...f };
    since = t - kt;
  }
  const p = ease.inOutCubic(clamp01(since / blend));
  const out = { ...cur };
  for (const k of NUM) (out[k] as number) = lerp(prev[k] as number, cur[k] as number, p);
  return out;
};

const blinkAt = (t: number, seed: number) => {
  // a blink every ~2.6–4.4 s, 0.13 s long
  let s = 0.8 + rand(seed) * 1.5, n = 0;
  while (s < t - 0.2) s += 2.6 + rand(seed + ++n * 3.7) * 1.8;
  const d = Math.abs(t - s);
  return d < 0.065 ? 1 - d / 0.065 : 0;
};

const Mouth: React.FC<{ who: Who; open: number; mode: MouthMode; amt: number }> = ({ who, open, mode, amt }) => {
  const m = RIG[who].features.mouth;
  const cx = m.cx, ty = m.y + m.h * 0.2;
  const W = m.w * 0.5, D = m.h * 0.78;
  const sw = who === "boy" ? 10 : 8.5;
  let o = open, hw = W * (0.62 + 0.3 * open);
  if (mode === "grin") { o = 0.55 * amt + 0.1; hw = W * 0.92; }
  if (mode === "o") { o = 0.45 * amt; hw = W * 0.42; }
  const line = (curve: number, w = W * 0.62, skew = 0) => (
    <path d={`M ${cx - w} ${ty + 8 - skew} Q ${cx} ${ty + 8 + curve} ${cx + w} ${ty + 8 + skew}`} fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
  );
  if (mode !== "talk" && mode !== "grin" && mode !== "o") {
    if (mode === "smile") return line(W * 0.42 * amt);
    if (mode === "smirk") return line(W * 0.28 * amt, W * 0.5, W * 0.22 * amt);
    if (mode === "frown") return line(-W * 0.3 * amt, W * 0.5);
    return line(2, W * 0.45);
  }
  if (o < 0.07) return line(W * 0.3);
  const d = D * o;
  const path = mode === "o"
    ? `M ${cx - hw} ${ty + d * 0.5} C ${cx - hw} ${ty - d * 0.15} ${cx + hw} ${ty - d * 0.15} ${cx + hw} ${ty + d * 0.5} C ${cx + hw} ${ty + d * 1.15} ${cx - hw} ${ty + d * 1.15} ${cx - hw} ${ty + d * 0.5} Z`
    : `M ${cx - hw} ${ty} Q ${cx} ${ty + d * 0.12} ${cx + hw} ${ty} C ${cx + hw * 1.02} ${ty + d * 1.05} ${cx - hw * 1.02} ${ty + d * 1.05} ${cx - hw} ${ty} Z`;
  const id = `m-${who}`;
  return (
    <g>
      <clipPath id={id}><path d={path} /></clipPath>
      <path d={path} fill={LIP_IN} />
      <ellipse cx={cx + hw * 0.08} cy={ty + d * 0.95} rx={hw * 0.72} ry={d * 0.42} fill={TONGUE} clipPath={`url(#${id})`} />
      <path d={path} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
    </g>
  );
};

/** One character. `x`,`y` = where the feet centre lands on the canvas; `k` = scale from the 2x sheet. */
export const Character: React.FC<{ who: Who; t: number; frame: number; keys: Key[]; x: number; y: number; k: number; mouth?: number[]; walk?: number }> = ({ who, t, frame, keys, x, y, k, mouth, walk = 0 }) => {
  const r = RIG[who];
  const [w, h] = r.size;
  const f = faceAt(keys, t);
  const mt = mouth ?? MOUTH[who];
  const open = f.mouth === "talk" ? mt[Math.min(frame, mt.length - 1)] ?? 0 : 0;
  // walking: a two-beat bob and rock while `walk` (0..1) is on
  const step = Math.sin(t * Math.PI * 2 * 2.3);
  const hop = -Math.abs(step) * 26 * walk, rock = step * 3 * walk;
  const ph = who === "boy" ? 0 : 1.7;
  const sway = 0.55 * Math.sin((t / 3.1) * Math.PI * 2 + ph);
  const breath = 1 + 0.006 * Math.sin((t / 2.4) * Math.PI * 2 + ph);
  const bob = -6 * open;
  const blink = blinkAt(t, who === "boy" ? 3 : 11);
  const eyeS = Math.max(0.08, f.eye * (1 - blink));
  const sprite = (role: string, extra: string) => {
    const s = r.features[role];
    return (
      <Img src={staticFile(`ep01/chars/${who}_${role}.png`)} style={{
        position: "absolute", left: s.x - 6, top: s.y - 6, transformOrigin: `${s.cx - s.x + 6}px ${s.cy - s.y + 6}px`, transform: extra,
      }} />
    );
  };
  const eyeT = `translate(${f.lookX}px, ${f.lookY}px) scaleY(${eyeS})`;
  const browT = (side: "L" | "R", raise: number) => {
    // brow L is on screen-left; "angry" tilts the inner ends (towards the nose) down
    const rot = (side === "L" ? 1 : -1) * f.tilt * 9;
    return `translate(${f.lookX * 0.5}px, ${-raise * 1 + f.lookY * 0.4 + (1 - Math.min(1, f.eye)) * 6}px) rotate(${rot}deg)`;
  };
  return (
    <div style={{
      position: "absolute", left: x - (w * k) / 2, top: y - h * k, width: w * k, height: h * k,
      transformOrigin: "50% 100%", transform: `translate(${f.dx}px, ${f.dy + bob * k + hop}px) rotate(${sway + f.lean + rock}deg) scaleY(${breath})`,
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transform: `scale(${k})`, transformOrigin: "0 0" }}>
        <Img src={staticFile(`ep01/chars/${who}_body.png`)} style={{ position: "absolute", left: 0, top: 0 }} />
        {sprite("eyeL", eyeT)}
        {sprite("eyeR", eyeT)}
        {sprite("browL", browT("L", f.browL))}
        {sprite("browR", browT("R", f.browR))}
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <g transform={`translate(${f.lookX * 0.6} ${f.lookY * 0.3})`}>
            <Mouth who={who} open={open} mode={f.mouth} amt={f.mouthAmt} />
          </g>
        </svg>
      </div>
    </div>
  );
};

export const charSize = (who: Who) => RIG[who].size;
/** Face centre of a character in canvas px, for camera framing. */
export const faceCenter = (who: Who, x: number, y: number, k: number): [number, number] => {
  const r = RIG[who];
  const e = r.features.eyeL, e2 = r.features.eyeR, m = r.features.mouth;
  const fx = (e.cx + e2.cx + m.cx) / 3, fy = (e.cy + e2.cy + m.cy) / 3;
  return [x - (r.size[0] * k) / 2 + fx * k, y - r.size[1] * k + fy * k];
};
