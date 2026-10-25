import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import timeline from "../../../projects/2026-10-ep01-sasta-share/timeline.json";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Intro } from "../smartphone/Intro";
import { Character, faceCenter, Key } from "./Character";
import { Market, MARKET_GREEN } from "./Market";

/*
 * AVRON Ep 01 — "₹50 ka share sasta hai? Bhai, sabzi mandi nahi hai!"
 * Two leads from the user's reference sheet, one studio set, one bazaar, one camera language
 * (eased push-ins and push cuts). No shake, particles, glows, flashes or bouncy easing.
 */
type Line = { id: string; who: string; start: number; end: number; chunks: { t0: number; t1: number; words: { w: string; t0: number; t1: number }[] }[] };
const TL = timeline as unknown as { total: number; lines: Line[]; cues: Record<string, number> };
export const DURATION = TL.total;
const L = Object.fromEntries(TL.lines.map((l) => [l.id, l])) as Record<string, Line>;
const C = TL.cues;
const S = (id: string) => L[id].start, E = (id: string) => L[id].end;
const W = (id: string, word: string) => {
  for (const c of L[id].chunks) for (const w of c.words) if (w.w.toLowerCase().startsWith(word.toLowerCase())) return w.t0;
  return L[id].start;
};

// layout: the reference sheet at 2x, placed so both leads stand side by side as drawn
const K = 0.48;
const POS = { boy: { x: 279, y: 1680 }, girl: { x: 827, y: 1680 } };
const FACE = { boy: faceCenter("boy", POS.boy.x, POS.boy.y, K), girl: faceCenter("girl", POS.girl.x, POS.girl.y, K) };

// ---------- acting ----------
const BOY: Key[] = [
  [0, { mouth: "talk", browL: 8, browR: 8, eye: 1.1, lean: -0.5 }],
  [E("b1"), { mouth: "grin", mouthAmt: 1, browL: 6, browR: 6 }],
  [S("g1") + 0.35, { mouth: "smile", mouthAmt: 0.7, lookX: 9, eye: 1, browL: 2, browR: 2 }],
  [E("g1") - 0.25, { mouth: "frown", mouthAmt: 0.8, tilt: 0.85, browL: -4, browR: -4, lean: -2.2 }],
  [S("b2"), { mouth: "talk", tilt: 0.6 }],
  [E("b2"), { mouth: "flat", tilt: 0.3, lean: -1 }],
  [S("g2") + 0.4, { tilt: 0, browL: 0, browR: 0, lean: 0, mouth: "flat" }],
  [S("b3"), { mouth: "talk", tilt: -0.7, browL: 7, browR: -2, lean: 1.5 }],
  [E("b3"), { mouth: "smile", mouthAmt: 0.25 }],
  [C.researchHit, { mouth: "o", mouthAmt: 0.7, eye: 1.25, tilt: -1, browL: 12, browR: 12, lookX: 0, lean: 0 }],
  [C.backToSet, { mouth: "flat", eye: 1, tilt: -0.2, browL: 2, browR: 2, lookX: 2, lookY: -7 }],
  [S("b4"), { mouth: "talk", lookY: -7 }],
  [S("b4") + 1.3, { lookX: 9, lookY: 0, tilt: 0 }],
  [E("b4"), { mouth: "grin", mouthAmt: 0.6 }],
  [S("g6") + 0.3, { mouth: "smile", mouthAmt: 0.6, browL: -1, browR: -1 }],
  [S("b5") - 0.15, { mouth: "talk", eye: 0.62, browL: 11, browR: 11, lean: 2, lookX: 9 }],
  [E("b5"), { mouth: "smirk", mouthAmt: 1 }],
  [E("g7") - 0.1, { mouth: "o", mouthAmt: 0.55, eye: 1.3, tilt: -1, browL: 13, browR: 13, lookX: 0, lean: 0 }],
  [S("b6"), { mouth: "talk", eye: 1.1, tilt: -1, lookX: 9 }],
  [E("b6"), { mouth: "frown", mouthAmt: 1 }],
  [S("g8") + 0.5, { mouth: "frown", mouthAmt: 0.4, tilt: -0.5, browL: 4, browR: 4 }],
];
const GIRL: Key[] = [
  [0, { mouth: "smile", mouthAmt: 0.5, lookX: -9 }],
  [S("b1") + 1.6, { browR: 14, browL: -2, mouth: "smirk", mouthAmt: 0.8, eye: 0.9 }],
  [S("g1"), { mouth: "talk" }],
  [E("g1"), { mouth: "smirk", mouthAmt: 1, browR: 9 }],
  [S("g2"), { mouth: "talk", browL: 4, browR: 4, lean: -2.5, dx: -22, eye: 1 }],
  [E("g2"), { mouth: "smile", mouthAmt: 0.6 }],
  [S("b3") + 0.4, { mouth: "smirk", mouthAmt: 0.9, lean: -1, dx: -10 }],
  [S("g3"), { mouth: "talk", eye: 0.68, browL: -3, browR: -3 }],
  [E("g3"), { mouth: "smirk", mouthAmt: 1 }],
  [C.backToSet, { mouth: "smile", mouthAmt: 0.6, eye: 1, browL: 2, browR: 6, lean: 0, dx: 0, lookX: -9 }],
  [S("g6"), { mouth: "talk", eye: 0.78, browR: 9 }],
  [E("g6"), { mouth: "smile", mouthAmt: 0.9 }],
  [S("b5") + 0.5, { mouth: "smirk", mouthAmt: 0.7, browR: 13, browL: 0, eye: 0.9 }],
  [C.lookDown, { lookY: 16, lookX: -6, eye: 0.85 }],
  [C.lookDown + 0.3, { lookY: -6 }],
  [C.lookDown + 0.55, { lookY: 0, lookX: -9 }],
  [S("g7"), { mouth: "talk", eye: 0.7, browR: 12, lean: -1.5 }],
  [E("g7"), { mouth: "smirk", mouthAmt: 1, browR: 14 }],
  [S("g8") - 0.2, { mouth: "smile", lookX: 0, lookY: 0, lean: 0, browR: 4, browL: 4, eye: 1 }],
  [S("g8"), { mouth: "talk" }],
  [E("g8"), { mouth: "smile", mouthAmt: 1 }],
];

// ---------- camera: eased push-ins, one language ----------
type Cam = [number, number, number, number, number]; // t, x, y, scale, duration
const two: [number, number] = [540, 1060];
const CAM: Cam[] = [
  [0, FACE.boy[0] + 40, FACE.boy[1] + 140, 1.42, 0],
  [S("g1") - 0.15, two[0], two[1], 1.0, 0.55],
  [S("b2") + 0.05, FACE.boy[0] + 60, FACE.boy[1] + 160, 1.16, 0.35],
  [S("g2"), two[0] + 40, two[1], 1.06, 0.5],
  [C.researchHit, FACE.boy[0], FACE.boy[1] + 20, 2.35, 0.2],
  [C.backToSet, two[0], two[1], 1.0, 0],
  [S("b5") - 0.2, FACE.boy[0] + 60, FACE.boy[1] + 150, 1.3, 0.5],
  [C.lookDown - 0.1, FACE.girl[0] - 40, FACE.girl[1] + 170, 1.3, 0.45],
  [C.freeze, FACE.boy[0], FACE.boy[1] + 60, 1.75, 0.22],
  [S("g8") - 0.25, FACE.girl[0], FACE.girl[1] + 210, 1.62, 0.55],
];
const camAt = (t: number) => {
  let cur = CAM[0], prev = CAM[0];
  for (const c of CAM) if (c[0] <= t) { prev = cur; cur = c; }
  const p = cur[4] ? (cur[4] < 0.3 ? ease.outExpo : ease.inOutCubic)(clamp01((t - cur[0]) / cur[4])) : 1;
  return { x: lerp(prev[1], cur[1], p), y: lerp(prev[2], cur[2], p), s: lerp(prev[3], cur[3], p) };
};

// ---------- sets ----------
const Studio: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id="st-back" cx="50%" cy="52%" r="62%">
        <stop offset="0" stopColor="#3A3F49" />
        <stop offset="0.55" stopColor="#23272F" />
        <stop offset="1" stopColor="#0E1014" />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#st-back)" />
    <rect x={0} y={1600} width={1080} height={320} fill="#15171C" />
    <line x1={0} x2={1080} y1={1600} y2={1600} stroke="rgba(243,241,236,0.08)" strokeWidth={3} />
    <ellipse cx={POS.boy.x + 10} cy={1676} rx={230} ry={22} fill="#000" opacity={0.35} />
    <ellipse cx={POS.girl.x} cy={1676} rx={200} ry={20} fill="#000" opacity={0.35} />
  </svg>
);

// ---------- overlays (screen space) ----------
const Card: React.FC<{ x: number; y: number; w: number; h: number; p: number; children: React.ReactNode }> = ({ x, y, w, h, p, children }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 28, overflow: "hidden",
    background: "rgba(13,16,21,0.94)", border: "1.5px solid rgba(243,241,236,0.16)",
    clipPath: `inset(${(1 - p) * 100}% 0 0 0 round 28px)`, transform: `translateY(${(1 - p) * 40}px)`,
  }}>{children}</div>
);

const PriceCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S("b1") + 0.35, out = C.researchHit;
  const p = prog(t, a, 0.45, ease.outExpo) * (1 - prog(t, out, 0.2));
  const draw = prog(t, a + 0.2, 1.0, ease.inOutCubic);
  const strike = prog(t, W("g2", "cheap"), 0.35, ease.outExpo);
  const pts = [0, 0.18, 0.1, 0.32, 0.27, 0.48, 0.42, 0.66, 0.6, 0.88];
  const path = pts.map((v, i) => `${i ? "L" : "M"} ${20 + i * 38} ${150 - v * 120}`).join(" ");
  if (p <= 0) return null;
  return (
    <Card x={600} y={250} w={400} h={330} p={p}>
      <div style={{ position: "absolute", left: 32, top: 26, fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: color.inkDim }}>SHARE PRICE</div>
      <div style={{ position: "absolute", left: 30, top: 70, fontFamily: font.display, fontWeight: 800, fontSize: 100, letterSpacing: "-0.03em", color: color.ink }}>₹50</div>
      <svg width={400} height={170} style={{ position: "absolute", left: 0, top: 168 }}>
        <path d={path} fill="none" stroke={MARKET_GREEN} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
      <div style={{ position: "absolute", right: 30, top: 112, fontFamily: font.display, fontWeight: 800, fontSize: 36, color: color.amberHot }}>
        SASTA?
        <div style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 7, background: color.loss, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
      </div>
    </Card>
  );
};

const RedChart: React.FC<{ t: number }> = ({ t }) => {
  const a = C.freeze;
  const p = prog(t, a, 0.3, ease.outExpo) * (1 - prog(t, S("g8") - 0.3, 0.25));
  const draw = prog(t, a + 0.05, 0.7, ease.inCubic);
  if (p <= 0) return null;
  const pts = [0.9, 0.82, 0.86, 0.7, 0.74, 0.52, 0.44, 0.3, 0.18, 0.04];
  const path = pts.map((v, i) => `${i ? "L" : "M"} ${24 + i * 38} ${160 - v * 140}`).join(" ");
  return (
    <Card x={80} y={250} w={420} h={330} p={p}>
      <div style={{ position: "absolute", left: 32, top: 28, fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: color.inkDim }}>MERA BALANCE SHEET</div>
      <svg width={420} height={220} style={{ position: "absolute", left: 0, top: 90 }}>
        <path d={path} fill="none" stroke={color.loss} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      </svg>
    </Card>
  );
};

// ---------- captions (top band, masked rise; keywords in amber) ----------
const HOT = /^(₹50|₹500|value|research|business|karza|balance|sheet|samajh)/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  let chunk: Line["chunks"][number] | null = null, who = "boy";
  for (const l of TL.lines) for (const c of l.chunks) {
    if (t >= c.t0 - 0.08 && t <= c.t1 + 0.35) { chunk = c; who = l.who; }
  }
  if (!chunk || t > C.endCard) return null;
  const p = prog(t, chunk.t0 - 0.08, 0.28, ease.outExpo);
  // bottom band over the legs on set; top band in the bazaar, where the bottom holds the market-cap row
  const top = t >= C.marketCut && t < C.backToSet;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: top ? 236 : 1330, height: 210, display: "flex", alignItems: top ? "flex-start" : "center", justifyContent: "center" }}>
      <div style={{ overflow: "hidden", padding: "14px 30px", borderRadius: 26, background: "rgba(8,9,12,0.8)", opacity: Math.min(1, p * 1.6) }}>
        <div style={{
          transform: `translateY(${(1 - p) * 100}%)`, textAlign: "center", fontFamily: font.display, fontWeight: 800,
          fontSize: 64, lineHeight: 1.1, letterSpacing: "-0.015em", color: color.ink,
        }}>
          {chunk.words.map((w, i) => {
            const clean = w.w.replace(/[.,!?]/g, "");
            const hot = HOT.test(clean);
            const said = t >= w.t0;
            return (
              <span key={i} style={{ color: hot ? color.amberHot : who === "girl" ? "#F3F1EC" : "#F3F1EC", opacity: said ? 1 : 0.55 }}>
                {w.w.replace(/\.$/, "")}{i < chunk!.words.length - 1 ? " " : ""}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// ---------- end card ----------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = C.endCard;
  if (t < a) return null;
  const u = t - a;
  const tag = prog(u, 1.05, 0.5, ease.outExpo);
  const tag2 = prog(u, 1.3, 0.5, ease.outExpo);
  return (
    <AbsoluteFill style={{ opacity: prog(u, 0, 0.18) }}>
      <div style={{ position: "absolute", inset: 0, transform: "translateY(-140px)" }}>
        <Intro t={Math.min(2.2, 0.35 + u * 1.15)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 76, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
        <div style={{ overflow: "hidden" }}><div style={{ color: color.ink, transform: `translateY(${(1 - tag) * 100}%)` }}>PRICE MAT DEKH</div></div>
        <div style={{ overflow: "hidden" }}><div style={{ color: color.amber, transform: `translateY(${(1 - tag2) * 100}%)` }}>BUSINESS SAMAJH</div></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: font.text, fontWeight: 500, fontSize: 26, letterSpacing: "0.06em", color: color.inkFaint, opacity: prog(u, 1.4, 0.4) }}>
        Educational content only · Not investment advice
      </div>
    </AbsoluteFill>
  );
};

export const Ep01Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camAt(t);
  // push cut into the market and back: a quick scale-through with motion smear on the outgoing shot
  const inMarket = t >= C.marketCut && t < C.backToSet;
  const cutIn = prog(t, C.marketCut - 0.18, 0.18, ease.inCubic);
  const mIn = prog(t, C.marketCut, 0.4, ease.outExpo);
  const back = prog(t, C.backToSet, 0.4, ease.outExpo);
  const mt = t - C.marketCut;
  const afterMarket = t >= C.backToSet;
  const camT = `translate(${540 - cam.x * cam.s}px, ${960 - cam.y * cam.s}px) scale(${cam.s})`;
  const smear = !inMarket && t < C.marketCut ? cutIn : 0;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      {/* world */}
      {!inMarket && (
        <AbsoluteFill style={{
          transform: `scale(${1 + smear * 0.5 + (afterMarket ? (1 - back) * 0.12 : 0)})`, filter: smear ? `blur(${smear * 14}px)` : undefined,
          opacity: 1 - smear * 0.6,
        }}>
          <AbsoluteFill style={{ transform: `translate(${(540 - cam.x) * 0.35 * (cam.s - 1)}px, 0) scale(${1 + (cam.s - 1) * 0.35})` }}>
            {afterMarket ? (
              <AbsoluteFill style={{ filter: "blur(10px) brightness(0.55)", transform: "scale(1.08)" }}>
                <Market t={99} tagA={0} tagB={0} cap={999} labels={[999, 999, 999, 999]} dim={0} />
              </AbsoluteFill>
            ) : <Studio />}
          </AbsoluteFill>
          <AbsoluteFill style={{ transform: camT, transformOrigin: "0 0" }}>
            <Character who="boy" t={t} frame={frame} keys={BOY} x={POS.boy.x} y={POS.boy.y} k={K} />
            <Character who="girl" t={t} frame={frame} keys={GIRL} x={POS.girl.x} y={POS.girl.y} k={K} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {inMarket && (
        <AbsoluteFill style={{ transform: `scale(${1.12 - 0.12 * mIn + 0.03 * clamp01(mt / 12)})`, filter: mIn < 1 ? `blur(${(1 - mIn) * 12}px)` : undefined }}>
          <Market t={t} tagA={W("g4", "₹50")} tagB={W("g4", "₹500")} cap={W("g4", "kaunsi")} dim={0}
            labels={[W("g5", "kamaati"), W("g5", "karza"), W("g5", "grow"), W("g5", "pay")]} />
        </AbsoluteFill>
      )}
      {/* screen-space overlays */}
      <PriceCard t={t} />
      <RedChart t={t} />
      <Captions t={t} />
      <EndCard t={t} />
      <Audio src={staticFile("ep01/mix.wav")} />
    </AbsoluteFill>
  );
};
