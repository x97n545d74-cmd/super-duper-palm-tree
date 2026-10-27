import React from "react";
import { AbsoluteFill, Audio, Img, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, ease, lerp, prog, rand, useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { SerifFont, serif } from "../swiggy/look";
import MAP from "../swiggy/india_map.json";
import CREDITS_JSON from "../thali/v2/credits.json";
import { at, CAPTIONS, DURATION, S } from "../thali/config";

/*
 * AVRON anchor demo: the thali story (verified MoSPI / RBI facts, the user's Tia VO) retold with the user's
 * recurring AI anchor as a secondary narrator. Motion graphics carry the information; she is framed small,
 * in split screens or as a cutaway, and never in a talking close-up (the stills have no lip-sync).
 * Prompts applied: Motion Graphic One (finance blueprint, gold/red/green code) and Two (minimal, one idea per
 * shot, push cuts with motion blur, no glow / shake / particles / bouncy easing). Visual change every 3-5 s.
 * Anchor cutouts: public/anchor/*.png, cut from the user's character sheets.
 */

const NIGHT = "#0B0E13";
const NIGHT2 = "#151A22";
const PAPER = "#ECE6D8";
const PAPER_LINE = "rgba(20,23,28,0.08)";
const INK = "#F3F1EC";
const INK_D = "#14171C";
const DIM = "rgba(243,241,236,0.55)";
const DIM_D = "rgba(20,23,28,0.55)";
const GOLD = "#D4A03A";
const RED = "#D64533";
const GREEN = "#2E9E68";
const G = 84;
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

type Pose = "stand" | "front" | "profile" | "think" | "pen" | "tablet" | "chin_seat" | "arms";
const RATIO: Record<Pose, number> = { stand: 525 / 1435, front: 596 / 1213, profile: 498 / 1213, think: 513 / 527, pen: 457 / 576, tablet: 523 / 576, chin_seat: 447 / 576, arms: 437 / 493 };

const sx = (size: number, weight = 800, c = INK): React.CSSProperties => ({ fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1, color: c });
const sf = (size: number, c = INK, italic = false): React.CSSProperties => ({ fontFamily: serif, fontWeight: 700, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: "-0.02em", lineHeight: 1.02, color: c });
const lbl = (c = DIM): React.CSSProperties => ({ fontFamily: mono, fontWeight: 500, fontSize: 22, letterSpacing: "0.16em", color: c });
const pct = (v: number, d = 2) => `${v.toFixed(d)}%`;

/** Masked rise for type. */
export const Rise: React.FC<{ t: number; a: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, a, dur = 0.55, children, style }) => {
  const p = ease.outExpo(clamp01((t - a) / dur));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Push cut: the incoming shot lands with an eased push; CameraMotionBlur smears the first frames. */
export const push = (t: number, a: number, from = 1.08): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.5));
  return { transform: `scale(${lerp(from, 1, p)})`, opacity: clamp01((t - a) / 0.05) };
};

/** Film grain: static noise re-seeded every 2 frames keeps flat colour organic. */
export const Grain: React.FC<{ t: number; o?: number }> = ({ t, o = 0.09 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(t * 15)} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const Night: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: `radial-gradient(110% 70% at 50% ${lerp(36, 42, (Math.sin(t * 0.2) + 1) / 2)}%, ${NIGHT2} 0%, ${NIGHT} 72%)` }} />
);

/** Paper page (graph paper, as in the user's collage reference) inside the content zone. */
const Paper: React.FC<{ t: number; a: number; children?: React.ReactNode }> = ({ t, a, children }) => {
  const p = ease.outExpo(clamp01((t - a) / 0.55));
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 220, height: 1090, borderRadius: 28, overflow: "hidden", background: PAPER,
      backgroundImage: `linear-gradient(${PAPER_LINE} 1.5px, transparent 1.5px), linear-gradient(90deg, ${PAPER_LINE} 1.5px, transparent 1.5px)`, backgroundSize: "44px 44px",
      boxShadow: "0 40px 80px rgba(0,0,0,0.45)", clipPath: `inset(${(1 - p) * 50}% 0 ${(1 - p) * 50}% 0 round 28px)` }}>
      {children}
    </div>
  );
};

/** Full-bleed licensed photo with a slow pan, graded dark so type reads. */
const Photo: React.FC<{ n: string; t: number; a: number; b: number; dark?: number; from?: [number, number, number]; to?: [number, number, number]; style?: React.CSSProperties }> = ({
  n, t, a, b, dark = 0.5, from = [1.14, 0, 0], to = [1.02, 0, 0], style,
}) => {
  const k = ease.inOutCubic(clamp01((t - a) / (b - a)));
  return (
    <div style={{ position: "absolute", overflow: "hidden", ...style }}>
      <Img src={staticFile(`thali2/${n}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.06) saturate(0.92)",
        transform: `translate(${lerp(from[1], to[1], k)}px, ${lerp(from[2], to[2], k)}px) scale(${lerp(from[0], to[0], k)})` }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(11,14,19,${dark}) 0%, rgba(11,14,19,${dark * 0.55}) 45%, rgba(11,14,19,${Math.min(1, dark + 0.35)}) 100%)` }} />
    </div>
  );
};

/** The anchor as a cutout. Bottom-anchored; slides in from a side, breathes, slides out. */
export const Anchor: React.FC<{ t: number; a: number; b: number; pose: Pose; x: number; bottom: number; h: number; from?: "left" | "right" | "bottom"; flip?: boolean; shadow?: boolean }> = ({
  t, a, b, pose, x, bottom, h, from = "right", flip, shadow = true,
}) => {
  const pin = ease.outExpo(clamp01((t - a) / 0.7));
  const pout = ease.inCubic(clamp01((t - (b - 0.3)) / 0.3));
  const w = h * RATIO[pose];
  const dx = from === "left" ? -1 : from === "right" ? 1 : 0;
  const off = (1 - pin) * 220 + pout * 260;
  const breathe = 1 + 0.006 * Math.sin((t - a) * 2.2);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: bottom - h, width: w, height: h, opacity: pin * (1 - pout),
      transform: `translate(${dx * off}px, ${from === "bottom" ? off : 0}px) translateX(${(t - a) * -4}px) scale(${breathe})`, transformOrigin: "50% 100%" }}>
      <Img src={staticFile(`anchor/${pose}.png`)} style={{ width: "100%", height: "100%", transform: flip ? "scaleX(-1)" : undefined,
        filter: shadow ? "drop-shadow(0 26px 30px rgba(0,0,0,0.45))" : undefined }} />
    </div>
  );
};

/** Presenter window: a small studio frame with the anchor inside, plus a name strap. */
export const Window: React.FC<{ t: number; a: number; b: number; pose: Pose; x: number; y: number; w: number; h: number; zoom?: number; dy?: number; dx?: number; round?: boolean }> = ({
  t, a, b, pose, x, y, w, h, zoom = 1.25, dy = 0, dx = 0, round,
}) => {
  const pin = ease.outExpo(clamp01((t - a) / 0.6));
  const pout = ease.inCubic(clamp01((t - (b - 0.25)) / 0.25));
  const ih = h * zoom, iw = ih * RATIO[pose];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: (1 - pout), transform: `scale(${lerp(0.86, 1, pin)})`, transformOrigin: "50% 100%",
      clipPath: `inset(${(1 - pin) * 100}% 0 0 0 round ${round ? w / 2 : 22}px)` }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: round ? "50%" : 22, overflow: "hidden",
        background: "radial-gradient(90% 80% at 50% 30%, #8E9096 0%, #5B5E64 70%, #44474D 100%)", boxShadow: `0 24px 50px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.08)` }}>
        <Img src={staticFile(`anchor/${pose}.png`)} style={{ position: "absolute", width: iw, height: ih, left: (w - iw) / 2 + dx, top: dy + (t - a) * -1.5,
          transform: `scale(${1 + 0.01 * Math.sin((t - a) * 2)})` }} />
      </div>
      {!round && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: 4, background: GOLD }} />
          <span style={{ ...lbl(INK), fontSize: 18 }}>AVRON DESK</span>
        </div>
      )}
    </div>
  );
};

const Source: React.FC<{ t: number; a: number; text: string; est?: boolean; dark?: boolean }> = ({ t, a, text, est, dark }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1262, textAlign: "center", opacity: prog(t, a, 0.4) }}>
    <span style={{ fontFamily: mono, fontSize: 18, letterSpacing: "0.06em", color: est ? RED : dark ? DIM_D : DIM, padding: "6px 14px", borderRadius: 999,
      border: `1.5px solid ${est ? RED + "99" : dark ? "rgba(20,23,28,0.2)" : "rgba(243,241,236,0.2)"}`, background: dark ? "rgba(236,230,216,0.9)" : "rgba(11,14,19,0.6)" }}>{text}</span>
  </div>
);
const MOSPI = "MOSPI CPI · 12 OCT 2026 · SEP PROVISIONAL";
const RBI = "RBI MPC RESOLUTION · 7 OCT 2026";

/* ============================================================ 1. HOOK: number with her, then the number takes over */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.hook;
  const n1 = at("b1_hook", "4.83%"), sw = at("b1_hook", "5.54%");
  const v = t < sw ? lerp(0, 4.83, prog(t, n1 - 0.2, 1.0, ease.outExpo)) : lerp(4.83, 5.54, prog(t, sw - 0.05, 0.7, ease.outExpo));
  const sun = prog(t, a + 0.1, 1.2, ease.outExpo);
  const phaseB = prog(t, sw - 0.1, 0.55, ease.inOutCubic);
  // chart geometry (phase B)
  const X0 = 120, X1 = 640, Y = (p: number) => 1150 - (p - 3.8) * 300;
  const line = prog(t, sw, 0.8, ease.inOutCubic);
  return (
    <AbsoluteFill>
      {/* phase A: gold sun behind her (collage reference), number on the left */}
      <div style={{ position: "absolute", left: 760 - 300, top: 760, width: 600, height: 600, borderRadius: "50%", background: GOLD,
        transform: `scale(${sun * (1 - phaseB)})`, opacity: 0.95 }} />
      <Anchor t={t} a={a + 0.15} b={sw + 0.2} pose="stand" x={770} bottom={1330} h={1020} />
      <div style={{ position: "absolute", left: G, top: 330, opacity: 1 - phaseB }}>
        <Rise t={t} a={a + 0.25}><div style={sf(64)}>Ek mahine mein</div></Rise>
        <Rise t={t} a={at("b1_hook", "mehengai") - 0.05} style={{ marginTop: 10 }}><div style={sf(64, GOLD, true)}>mehengai</div></Rise>
        <div style={{ ...lbl(), marginTop: 70, opacity: prog(t, n1 - 0.2, 0.3) }}>RETAIL CPI · AUG 2026</div>
        <div style={{ ...sx(150, 800, GOLD), marginTop: 14, fontVariantNumeric: "tabular-nums", opacity: prog(t, n1 - 0.2, 0.2) }}>{pct(Math.min(v, 4.83))}</div>
      </div>
      {/* phase B: the number goes big, a chart draws, she shrinks to a window */}
      <div style={{ position: "absolute", left: G, right: G, top: 300, opacity: phaseB, transform: `translateY(${(1 - phaseB) * 40}px)` }}>
        <div style={lbl()}>RETAIL CPI · SEP 2026</div>
        <div style={{ ...sx(230, 800, RED), marginTop: 18, fontVariantNumeric: "tabular-nums" }}>{pct(v)}</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: phaseB }}>
        <line x1={X0 - 20} x2={X1 + 60} y1={Y(4)} y2={Y(4)} stroke={INK} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="8 10" />
        <text x={X0 - 20} y={Y(4) + 36} fontFamily={mono} fontSize={20} letterSpacing="2" fill={DIM}>RBI TARGET 4%</text>
        <line x1={X0} y1={Y(4.83)} x2={lerp(X0, X1, line)} y2={lerp(Y(4.83), Y(5.54), line)} stroke={RED} strokeWidth={6} strokeLinecap="round" />
        <circle cx={X0} cy={Y(4.83)} r={11} fill={GOLD} />
        <circle cx={X1} cy={Y(5.54)} r={13 * line} fill={RED} />
        <text x={X0} y={Y(4.83) - 28} textAnchor="middle" fontFamily={sans} fontWeight={700} fontSize={34} fill={INK}>4.83%</text>
        <text x={X0} y={1210} textAnchor="middle" fontFamily={mono} fontSize={20} fill={DIM}>AUG</text>
        <text x={X1} y={1210} textAnchor="middle" fontFamily={mono} fontSize={20} fill={DIM} opacity={line}>SEP</text>
      </svg>
      <Window t={t} a={sw + 0.25} b={b + 0.1} pose="front" x={756} y={880} w={240} h={290} zoom={1.7} dy={-40} />
      <Source t={t} a={n1} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 2. THALI: full-screen photo cutaway, ring draws round the plate */
const Thali: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.thali;
  const word = at("b1_thali", "thali");
  const ring = prog(t, word - 0.25, 0.8, ease.inOutCubic);
  const C = 2 * Math.PI * 330;
  return (
    <AbsoluteFill style={push(t, a)}>
      <Photo n="thali.jpg" t={t} a={a} b={b} dark={0.42} from={[1.22, 0, 30]} to={[1.06, 0, -20]} style={{ inset: 0 }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={820} r={330} fill="none" stroke={GOLD} strokeWidth={6} strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform="rotate(-90 540 820)" />
      </svg>
      <div style={{ position: "absolute", left: G, right: G, top: 300, textAlign: "center" }}>
        <Rise t={t} a={a + 0.1}><div style={sf(92)}>Sabse bada jhatka</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center" }}>
        <Rise t={t} a={word - 0.1}><div style={sf(140, GOLD, true)}>thali pe</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================ 3. CPI: paper page, India map fills with price-collection points */
const Cpi: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cpi;
  const states = Object.values((MAP as { states: Record<string, string> }).states);
  const cities = Object.values((MAP as unknown as { cities: Record<string, { x: number; y: number }> }).cities);
  const sc = 0.6, mw = MAP.w * sc, mh = MAP.h * sc, mx = 70, my = 300;
  const draw = prog(t, a + 0.2, 1.0, ease.inOutCubic);
  const dots = prog(t, at("b2_cpi", "tokri") - 0.4, 1.4, ease.outCubic);
  const N = 90;
  const k1 = Math.round(lerp(0, 1407, prog(t, a + 1.0, 1.6, ease.outCubic)));
  const k2 = Math.round(lerp(0, 1465, prog(t, a + 1.3, 1.6, ease.outCubic)));
  return (
    <AbsoluteFill style={push(t, a, 1.04)}>
      <Paper t={t} a={a}>
        <div style={{ position: "absolute", left: 48, top: 40, ...lbl(DIM_D) }}>MOSPI · CONSUMER PRICE INDEX</div>
        <div style={{ position: "absolute", left: 48, right: 48, top: 90 }}>
          <Rise t={t} a={at("b2_cpi", "aapke") - 0.1}><div style={sf(68, INK_D)}>Aapke ghar ki</div></Rise>
          <Rise t={t} a={at("b2_cpi", "tokri") - 0.1}><div style={sf(68, GOLD, true)}>tokri ka daam</div></Rise>
        </div>
        <svg width={mw} height={mh} viewBox={`0 0 ${MAP.w} ${MAP.h}`} style={{ position: "absolute", left: mx, top: my }}>
          {states.map((d, i) => <path key={i} d={d} fill="rgba(20,23,28,0.04)" stroke={INK_D} strokeOpacity={0.55} strokeWidth={1.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />)}
          {Array.from({ length: N }).map((_, i) => {
            const c = cities[i % cities.length];
            const r = 26 + rand(i) * 70, th = rand(i + 50) * Math.PI * 2;
            const show = clamp01((dots * N - i) / 6);
            return <circle key={i} cx={c.x + Math.cos(th) * r} cy={c.y + Math.sin(th) * r} r={6 * show} fill={i % 2 ? GOLD : INK_D} opacity={0.85} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 48, top: 930, display: "flex", gap: 46 }}>
          {[{ n: k1, l: "SHEHRI BAZAAR" }, { n: k2, l: "GAON" }].map((x) => (
            <div key={x.l}>
              <div style={{ ...sx(78, 800, INK_D), fontVariantNumeric: "tabular-nums" }}>{x.n.toLocaleString("en-IN")}</div>
              <div style={{ ...lbl(DIM_D), marginTop: 8, fontSize: 19 }}>{x.l}</div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 48, top: 1040, ...lbl(DIM_D), fontSize: 19, opacity: prog(t, a + 2.2, 0.4) }}>HAR HAFTE DAAM LIYE JAATE HAIN</div>
      </Paper>
      {/* she turns toward the map: profile cutout, small, bottom-right over the page edge */}
      <Anchor t={t} a={a + 0.45} b={b + 0.1} pose="profile" x={880} bottom={1310} h={560} from="right" />
    </AbsoluteFill>
  );
};

/* ============================================================ 4. FOOD: two bars, the gap measured; she reacts beside it */
const Food: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.food;
  const n1 = at("b3_food", "5.97%"), n2 = at("b3_food", "7.74%");
  const base = 1180, k = 78;
  const g1 = prog(t, n1 - 0.3, 0.9, ease.outExpo), g2 = prog(t, n2 - 0.2, 0.9, ease.outExpo);
  const br = prog(t, n2 + 0.9, 0.6, ease.inOutCubic);
  const bars = [{ x: 110, v: 5.97, g: g1, c: "rgba(212,160,58,0.55)", m: "AUG" }, { x: 320, v: 7.74, g: g2, c: RED, m: "SEP" }];
  return (
    <AbsoluteFill style={push(t, a)}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <div style={lbl()}>FOOD INFLATION · CFPI</div>
        <Rise t={t} a={a + 0.05} style={{ marginTop: 18 }}><div style={sf(76)}>Khaane ki mehengai</div></Rise>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={80} x2={620} y1={base} y2={base} stroke={INK} strokeOpacity={0.3} strokeWidth={2} />
        {bars.map((x) => (
          <g key={x.m}>
            <rect x={x.x} y={base - x.v * k * x.g} width={170} height={x.v * k * x.g} fill={x.c} />
            <text x={x.x + 85} y={base - x.v * k * x.g - 24} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={52} letterSpacing="-1.5" fill={INK} opacity={x.g}>{pct(x.v * x.g)}</text>
            <text x={x.x + 85} y={base + 40} textAnchor="middle" fontFamily={mono} fontSize={22} fill={DIM}>{x.m} 2026</text>
          </g>
        ))}
        {/* the gap */}
        <path d={`M 505 ${base - 5.97 * k} H 545 V ${base - 5.97 * k - (7.74 - 5.97) * k * br}`} fill="none" stroke={GOLD} strokeWidth={4} />
        <line x1={490} x2={545} y1={base - 7.74 * k} y2={base - 7.74 * k} stroke={GOLD} strokeWidth={4} opacity={br} />
      </svg>
      <div style={{ position: "absolute", left: 560, top: base - 7.74 * k - 30, opacity: br, transform: `translateX(${(1 - br) * -20}px)` }}>
        <div style={sx(56, 800, GOLD)}>+1.77</div>
        <div style={{ ...lbl(), fontSize: 18, marginTop: 6 }}>PERCENTAGE POINTS</div>
      </div>
      <Anchor t={t} a={a + 0.6} b={b + 0.1} pose="think" x={845} bottom={1300} h={430} from="right" />
      <Source t={t} a={n1} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 5. VEG: onion hero card, then three cards side by side */
const Veg: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.veg;
  const n = at("b4_veg", "108%"), split = at("b4_veg", "Aloo") - 0.15;
  const s = prog(t, split, 0.7, ease.inOutQuint);
  const onion = lerp(0, 108.09, prog(t, n - 0.2, 1.0, ease.outExpo));
  // onion card: hero → first of three
  const hero = { x: G, y: 300, w: 1080 - 2 * G, h: 760 };
  const small = { x: G, y: 330, w: 290, h: 600 };
  const R = (k: keyof typeof hero) => lerp(hero[k], small[k], s);
  const cards = [{ n: "potato.jpg", name: "Aloo", v: "−11.50%", x: G + 311, d: 0 }, { n: "subji.jpg", name: "Tamatar", v: "−8.62%", x: G + 622, d: 0.25 }];
  return (
    <AbsoluteFill style={push(t, a)}>
      <div style={{ position: "absolute", left: R("x"), top: R("y"), width: R("w"), height: R("h"), borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
        <Photo n="onion.jpg" t={t} a={a} b={b} dark={0.35} style={{ inset: 0 }} from={[1.2, 0, 0]} to={[1.05, 0, 0]} />
        <div style={{ position: "absolute", left: lerp(44, 22, s), bottom: lerp(44, 26, s) }}>
          <div style={sf(lerp(84, 50, s))}>Pyaaz</div>
          <div style={{ ...sx(lerp(130, 44, s), 800, RED), marginTop: 10, fontVariantNumeric: "tabular-nums" }}>+{onion.toFixed(2)}%</div>
        </div>
        <div style={{ position: "absolute", left: 44, top: 40, ...lbl(INK), opacity: 1 - s }}>SAAL BHAR MEIN · SEP 2026</div>
      </div>
      {cards.map((c) => {
        const p = prog(t, split + 0.2 + c.d, 0.6, ease.outExpo);
        return (
          <div key={c.n} style={{ position: "absolute", left: c.x, top: small.y, width: small.w, height: small.h, borderRadius: 22, overflow: "hidden",
            opacity: p, transform: `translateY(${(1 - p) * 80}px)`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
            <Photo n={c.n} t={t} a={split} b={b} dark={0.4} style={{ inset: 0 }} />
            <div style={{ position: "absolute", left: 22, bottom: 26 }}>
              <div style={sf(50)}>{c.name}</div>
              <div style={{ ...sx(44, 800, GREEN), marginTop: 10 }}>{c.v}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: G, top: 970, ...lbl(), opacity: prog(t, split + 0.6, 0.4) }}>YEAR ON YEAR · SEP 2026</div>
      <Window t={t} a={split + 0.5} b={b + 0.1} pose="pen" x={760} y={960} w={236} h={250} zoom={1.25} dy={-6} />
      <Source t={t} a={n} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 6. SPLIT: village over city, she sits on the seam */
const Split: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.split;
  const g = at("b5_split", "6.08%"), c = at("b5_split", "4.88%.");
  const top = prog(t, a, 0.55, ease.outExpo), bot = prog(t, a + 0.15, 0.55, ease.outExpo);
  const Half: React.FC<{ y: number; p: number; n: string; k: string; v: number; at: number; food: string; c: string }> = (h) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: h.y, height: 520, overflow: "hidden", clipPath: `inset(0 ${(1 - h.p) * 100}% 0 0)` }}>
      <Photo n={h.n} t={t} a={a} b={b} dark={0.66} style={{ inset: 0 }} from={[1.15, -30, 0]} to={[1.05, 30, 0]} />
      <div style={{ position: "absolute", left: G, top: 70 }}>
        <div style={lbl(INK)}>{h.k}</div>
        <div style={{ ...sx(150, 800, h.c), marginTop: 16, fontVariantNumeric: "tabular-nums" }}>{pct(lerp(0, h.v, prog(t, h.at - 0.2, 0.9, ease.outExpo)))}</div>
        <div style={{ ...lbl(), marginTop: 18, fontSize: 19, opacity: prog(t, h.at + 0.5, 0.4) }}>{h.food}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={push(t, a, 1.03)}>
      <Half y={230} p={top} n="village.jpg" k="GAON · SEP 2026" v={6.08} at={g} food="FOOD 8.06%" c={RED} />
      <Half y={770} p={bot} n="street_1.jpg" k="SHEHAR · SEP 2026" v={4.88} at={c} food="FOOD 7.18%" c={GOLD} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 766, height: 6, background: GOLD, transform: `scaleX(${top})`, transformOrigin: "0 50%" }} />
      <Window t={t} a={a + 0.5} b={b + 0.1} pose="profile" x={790} y={660} w={210} h={210} zoom={1.9} dy={-70} dx={10} round />
      <Source t={t} a={g} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 7. RBI: step chart on paper; she reads it on her tablet */
const Rbi: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.rbi;
  const r1 = at("b6_rbi", "5.25"), r2 = at("b6_rbi", "5.50%");
  const X0 = 120, X1 = 900, Xs = 640, Y = (r: number) => 640 - (r - 5.0) * 640;
  const d1 = prog(t, r1 - 0.2, 0.8, ease.inOutCubic), d2 = prog(t, r2 - 0.25, 0.7, ease.inOutCubic);
  const big = prog(t, r2, 0.6, ease.outExpo);
  return (
    <AbsoluteFill style={push(t, a, 1.04)}>
      <Paper t={t} a={a}>
        <div style={{ position: "absolute", left: 48, top: 40, ...lbl(DIM_D) }}>RBI · REPO RATE</div>
        <svg width={1000} height={800} style={{ position: "absolute", left: 0, top: 0 }}>
          {[5.0, 5.25, 5.5].map((r) => (
            <g key={r}>
              <line x1={X0} x2={X1 + 40} y1={Y(r)} y2={Y(r)} stroke={INK_D} strokeOpacity={0.15} strokeWidth={2} />
              <text x={X0 - 14} y={Y(r) + 8} textAnchor="end" fontFamily={mono} fontSize={20} fill={DIM_D}>{r.toFixed(2)}</text>
            </g>
          ))}
          <path d={`M ${X0} ${Y(5.25)} H ${lerp(X0, Xs, d1)}`} stroke={INK_D} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={`M ${Xs} ${Y(5.25)} V ${lerp(Y(5.25), Y(5.5), d2)}`} stroke={RED} strokeWidth={7} fill="none" opacity={d2 > 0 ? 1 : 0} />
          <path d={`M ${Xs} ${Y(5.5)} H ${lerp(Xs, X1, prog(t, r2 + 0.4, 0.6, ease.outCubic))}`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" opacity={d2 >= 1 ? 1 : 0} />
          <line x1={Xs} x2={Xs} y1={Y(5.0)} y2={Y(5.5) - 30} stroke={INK_D} strokeOpacity={0.35} strokeDasharray="6 8" strokeWidth={2} opacity={d2} />
          <text x={Xs} y={Y(5.0) + 40} textAnchor="middle" fontFamily={mono} fontSize={20} fill={DIM_D} opacity={d2}>7 OCT 2026</text>
        </svg>
        <div style={{ position: "absolute", right: 48, top: 760, textAlign: "right", opacity: big, transform: `translateY(${(1 - big) * 30}px)` }}>
          <div style={sx(150, 800, INK_D)}>5.50%</div>
          <div style={{ display: "inline-block", marginTop: 14, padding: "8px 18px", borderRadius: 999, background: RED, ...sx(34, 800, "#fff") }}>+25 bps</div>
          <div style={{ ...lbl(DIM_D), marginTop: 18, fontSize: 18 }}>STANCE · CALIBRATED TIGHTENING</div>
        </div>
      </Paper>
      <Anchor t={t} a={a + 0.4} b={b + 0.1} pose="tablet" x={270} bottom={1312} h={430} from="left" />
      <Source t={t} a={r1} text={RBI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 8. PROJECTION: full-screen data, the stamp lands on "Anuman" */
const Proj: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.proj;
  const n = at("b6_proj", "5.2%"), st = at("b6_proj", "Anuman");
  const qs = [{ q: "Q2", v: 4.9 }, { q: "Q3", v: 6.0 }, { q: "Q4", v: 5.7 }];
  const base = 1170, k = 75;
  const stamp = prog(t, st - 0.05, 0.35, ease.outExpo);
  return (
    <AbsoluteFill style={push(t, a)}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <div style={lbl()}>RBI PROJECTION · FY27 CPI</div>
        <div style={{ ...sx(210, 800, GOLD), marginTop: 18, fontVariantNumeric: "tabular-nums", opacity: prog(t, n - 0.3, 0.2) }}>{pct(lerp(0, 5.2, prog(t, n - 0.3, 0.9, ease.outExpo)), 1)}</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={G} x2={1080 - G} y1={base - 4 * k} y2={base - 4 * k} stroke={INK} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="8 10" />
        <text x={1080 - G} y={base - 4 * k - 14} textAnchor="end" fontFamily={mono} fontSize={19} fill={DIM}>TARGET 4%</text>
        {qs.map((q, i) => {
          const g = prog(t, a + 0.4 + i * 0.25, 0.8, ease.outExpo);
          const x = G + 40 + i * 300, h = q.v * k * g;
          return (
            <g key={q.q}>
              <rect x={x} y={base - h} width={190} height={h} fill="rgba(212,160,58,0.12)" stroke={GOLD} strokeWidth={3} strokeDasharray="10 8" />
              <text x={x + 95} y={base - h - 22} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={46} fill={INK} opacity={g}>{q.v.toFixed(1)}%</text>
              <text x={x + 95} y={base + 40} textAnchor="middle" fontFamily={mono} fontSize={22} fill={DIM}>{q.q} FY27</text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 120, top: 1000, padding: "18px 30px", border: `5px solid ${RED}`, borderRadius: 10, color: RED, fontFamily: mono, fontWeight: 700, fontSize: 40,
        letterSpacing: "0.04em", background: "rgba(11,14,19,0.85)", opacity: stamp, transform: `rotate(-7deg) scale(${lerp(1.5, 1, stamp)})` }}>
        ANUMAN HAI, GUARANTEE NAHI
      </div>
      <Source t={t} a={n} text={RBI} />
    </AbsoluteFill>
  );
};

/* ============================================================ 9. REAL RETURN: formula on paper, then inflation eats the FD bar */
const Real: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.real;
  const fd = at("b7_real", "7%") - 0.15;
  const eat = prog(t, at("b7_real", "asli") - 0.1, 0.9, ease.inOutCubic);
  const res = prog(t, at("b7_real", "1.46%.") - 0.15, 0.6, ease.outExpo);
  const terms = [{ w: "Asli return", c: GOLD, s: at("b7_real", "Asli") }, { w: "=", c: INK_D, s: at("b7_real", "matlab") }, { w: "Return", c: INK_D, s: at("b7_real", "return", 1) }, { w: "−", c: INK_D, s: at("b7_real", "minus") }, { w: "Mehengai", c: RED, s: at("b7_real", "mehengai.") }];
  const L = 1080 - 2 * G, X = G;
  return (
    <AbsoluteFill>
      {t < fd + 0.05 && (
        <AbsoluteFill style={push(t, a, 1.04)}>
          <Paper t={t} a={a}>
            <div style={{ position: "absolute", left: 48, top: 40, ...lbl(DIM_D) }}>THE ONLY FORMULA YOU NEED</div>
            <div style={{ position: "absolute", left: 48, right: 48, top: 180, display: "flex", flexDirection: "column", gap: 18 }}>
              {terms.map((x) => <Rise key={x.w} t={t} a={x.s - 0.05}><div style={sf(x.w.length > 2 ? 104 : 80, x.c, x.c === GOLD)}>{x.w}</div></Rise>)}
            </div>
          </Paper>
          <Anchor t={t} a={a + 0.5} b={fd + 0.3} pose="chin_seat" x={830} bottom={1312} h={470} from="right" />
        </AbsoluteFill>
      )}
      {t >= fd && (
        <AbsoluteFill style={push(t, fd)}>
          <div style={{ position: "absolute", left: G, top: 300 }}>
            <div style={lbl()}>EXAMPLE · 7% FD · SEP 2026 CPI</div>
            <Rise t={t} a={fd + 0.05} style={{ marginTop: 18 }}><div style={sf(78)}>7% ki FD pe</div></Rise>
          </div>
          {/* the bar: 7% of return; inflation (5.54) eats from the right, 1.46 stays */}
          <div style={{ position: "absolute", left: X, top: 600, width: L, height: 120, borderRadius: 14, overflow: "hidden", background: "rgba(243,241,236,0.06)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: L * prog(t, fd + 0.1, 0.6, ease.outExpo), background: GOLD }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: L * (5.54 / 7) * eat, background: `repeating-linear-gradient(135deg, ${RED} 0 14px, #A9362A 14px 28px)` }} />
          </div>
          <div style={{ position: "absolute", left: X, top: 740, ...lbl(), opacity: prog(t, fd + 0.4, 0.3) }}>RETURN 7.00%</div>
          <div style={{ position: "absolute", right: G, top: 740, ...lbl(RED), opacity: eat }}>− MEHENGAI 5.54%</div>
          <div style={{ position: "absolute", left: G, top: 840, opacity: res, transform: `translateY(${(1 - res) * 30}px)` }}>
            <div style={lbl()}>ASLI KAMAI</div>
            <div style={{ ...sx(200, 800, GOLD), marginTop: 12 }}>1.46%</div>
          </div>
          <Window t={t} a={fd + 0.6} b={b + 0.1} pose="arms" x={772} y={880} w={224} h={260} zoom={1.15} dy={0} />
          <Source t={t} a={fd + 0.3} text="ILLUSTRATION · HYPOTHETICAL 7% FD · PRE-TAX" est />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* ============================================================ 10. CTA: her one presenter moment, full length, question beside her */
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cta;
  const sun = prog(t, a, 0.8, ease.outExpo);
  const pill = prog(t, at("b8_cta", "Comment") - 0.1, 0.45, ease.outExpo);
  return (
    <AbsoluteFill style={push(t, a)}>
      <div style={{ position: "absolute", left: 790 - 330, top: 640, width: 660, height: 660, borderRadius: "50%", background: GOLD, transform: `scale(${sun})` }} />
      <Anchor t={t} a={a} b={b + 5} pose="stand" x={800} bottom={1340} h={1080} from="right" />
      <div style={{ position: "absolute", left: G, top: 300, width: 470 }}>
        <Rise t={t} a={a + 0.05}><div style={sf(60)}>Aapki thali mein</div></Rise>
        <Rise t={t} a={at("b8_cta", "sabse") - 0.1} style={{ marginTop: 8 }}><div style={sf(60, GOLD, true)}>sabse mehenga</div></Rise>
        <Rise t={t} a={at("b8_cta", "kya") - 0.1} style={{ marginTop: 8 }}><div style={sf(60)}>kya hua?</div></Rise>
        <div style={{ marginTop: 50, display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 30px", borderRadius: 999, background: INK, opacity: pill, transform: `translateY(${(1 - pill) * 20}px)` }}>
          <svg width={30} height={30} viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke={INK_D} strokeWidth={2.2} strokeLinejoin="round" /></svg>
          <span style={sx(40, 800, INK_D)}>Comment karo</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ============================================================ 11. END card */
const End: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.end;
  const out = prog(t, DURATION - 0.6, 0.6, ease.inCubic);
  return (
    <AbsoluteFill style={{ background: NIGHT, opacity: prog(t, a, 0.2) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", ...sx(120, 800), letterSpacing: "0.32em", paddingLeft: "0.32em",
        clipPath: `inset(0 ${100 - 100 * prog(t, a + 0.05, 0.7, ease.outExpo)}% 0 0)` }}>AVRON</div>
      <div style={{ position: "absolute", left: G, right: G, top: 900, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, opacity: prog(t, a + 0.4, 0.4) }}>
        <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>Education only · Not investment advice</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>AVRON is not SEBI-registered</div>
        <div style={{ fontFamily: mono, fontSize: 21, color: GOLD }}>Anchor is an AI-generated character</div>
        <div style={{ fontFamily: mono, fontSize: 18, color: DIM, marginTop: 14 }}>Data · MoSPI CPI 12 Oct 2026 · RBI MPC 7 Oct 2026</div>
        <div style={{ fontFamily: mono, fontSize: 16, color: DIM, lineHeight: 1.5 }}>{(CREDITS_JSON as string[]).join(" · ")} · Map: DataMeet India (CC BY 4.0)</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

const on = (t: number, w: readonly [number, number]) => t >= w[0] && t < w[1] + 0.04;

const Graphics: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill>
      <Night t={t} />
      {on(t, S.hook) && <Hook t={t} />}
      {on(t, S.thali) && <Thali t={t} />}
      {on(t, S.cpi) && <Cpi t={t} />}
      {on(t, S.food) && <Food t={t} />}
      {on(t, S.veg) && <Veg t={t} />}
      {on(t, S.split) && <Split t={t} />}
      {on(t, S.rbi) && <Rbi t={t} />}
      {on(t, S.proj) && <Proj t={t} />}
      {on(t, S.real) && <Real t={t} />}
      {on(t, S.cta) && <Cta t={t} />}
      {on(t, S.end) && <End t={t} />}
    </AbsoluteFill>
  );
};

export const AnchorDemo: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: NIGHT, overflow: "hidden" }}>
      <SerifFont />
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <Graphics />
      </CameraMotionBlur>
      <Grain t={t} />
      {t < S.cta[0] && <Captions t={t} chunks={CAPTIONS} family={sans} size={52} y={1370} />}
      {t < S.end[0] - 0.2 && (
        <>
          <div style={{ position: "absolute", left: G, top: 120, ...sx(30, 800), letterSpacing: "0.42em", opacity: 0.9 }}>AVRON</div>
          <div style={{ position: "absolute", right: G, top: 118, padding: "6px 14px", borderRadius: 999, border: "1.5px solid rgba(243,241,236,0.35)", ...lbl(INK), fontSize: 17 }}>AI ANCHOR</div>
        </>
      )}
      <Audio src={staticFile("thali/mix.wav")} />
    </AbsoluteFill>
  );
};
