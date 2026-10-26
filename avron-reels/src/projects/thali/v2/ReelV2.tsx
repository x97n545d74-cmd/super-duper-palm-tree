import React from "react";
import { AbsoluteFill, Audio, Img, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog, useTime } from "../../../engine/anim";
import { Captions } from "../../../engine/components/Captions";
import MAP from "../../swiggy/india_map.json";
import HAS from "./photos.json";
import CREDITS_JSON from "./credits.json";
import { at, CAPTIONS, DURATION, S } from "../config";
import { Backdrop, DIM, display, GOLD, GOLD_SOFT, Glitch, glow, IconBus, IconFood, IconHouse, INK, Mask, NAVY, NAVY2, RED } from "../Blueprint10";

/*
 * Thali reel v2: every saved prompt applied to the same story and the user's Tia VO.
 *  - Motion Graphic One (user chose its full look): glowing gold count-up, glitch pops, MoSPI drop with spinning
 *    icons, flipping cards, India map split, RBI corridor, formula card, beat drop on the CTA. Gold/red/green code.
 *  - Product launch 20s: hook words on the beat, match cut through a circle, real footage, wall of tiles with a scan
 *    line and 3 winners, 3D carousel with floor reflection and a motion-blurred whip, big stat on a push cut,
 *    phone + flipping panel, cursor click, 3-word ticker, logo reveal, fade to black.
 *  - Ultracode: a terminal that types the formula. Portfolio: trend check + frame-by-frame review.
 * Stock photos: CC0 / public domain / CC BY only, logged in projects/2026-10-thali/assets/LICENSES.md.
 */
const GREEN = "#3EE08F";
const G = 84;
const W = 1080 - 2 * G;
const has = (n: string) => (HAS as string[]).includes(n);
const photo = (n: string) => staticFile(`thali2/${n}`);

/** Push cut: incoming shot lands with an eased push (CameraMotionBlur smears it). */
const pushIn = (t: number, a: number, from = 1.12): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.5));
  return { transform: `scale(${lerp(from, 1, p)})`, opacity: clamp01((t - a) / 0.06) };
};

/** Full-bleed photo with a slow pan, darkened and tinted navy so type stays readable. */
const Photo: React.FC<{ n: string; t: number; a: number; b: number; dark?: number; blur?: number; from?: [number, number, number]; to?: [number, number, number]; style?: React.CSSProperties }> = ({
  n, t, a, b, dark = 0.55, blur = 0, from = [1.12, 0, 0], to = [1.0, 0, 0], style,
}) => {
  if (!has(n)) return null;
  const k = ease.inOutCubic(clamp01((t - a) / (b - a)));
  const s = lerp(from[0], to[0], k), x = lerp(from[1], to[1], k), y = lerp(from[2], to[2], k);
  return (
    <AbsoluteFill style={{ overflow: "hidden", ...style }}>
      <Img src={photo(n)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translate(${x}px, ${y}px) scale(${s})`, filter: `blur(${blur}px) saturate(1.1)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${NAVY}${hex(dark)} 0%, ${NAVY}${hex(dark * 0.7)} 45%, ${NAVY}${hex(Math.min(1, dark + 0.3))} 100%)` }} />
    </AbsoluteFill>
  );
};
const hex = (a: number) => Math.round(clamp01(a) * 255).toString(16).padStart(2, "0");

const Label: React.FC<{ t: number; a: number; text: string; top?: number; c?: string }> = ({ t, a, text, top = 300, c = DIM }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: font.text, fontWeight: 700, fontSize: 28, letterSpacing: "0.3em", color: c, opacity: prog(t, a, 0.4) }}>{text}</div>
);
const Source: React.FC<{ t: number; a: number; text: string; est?: boolean }> = ({ t, a, text, est }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1468, textAlign: "center", opacity: prog(t, a, 0.4) }}>
    <span style={{ fontFamily: font.mono, fontSize: 20, letterSpacing: "0.06em", color: est ? "#FFB0B0" : DIM, padding: "8px 16px", borderRadius: 999,
      border: `1.5px solid ${est ? RED + "88" : "rgba(243,241,236,0.18)"}`, background: "rgba(6,11,28,0.6)" }}>{text}</span>
  </div>
);
const MOSPI = "SOURCE · MOSPI CPI RELEASE · 12 OCT 2026 · SEP PROVISIONAL";

/* ================================================ 1. HOOK  (0 → b1_thali) */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a1 = at("b1_hook", "4.83%"), sw = at("b1_hook", "5.54%"), end = S.thali[0];
  const words = [["Ek", "b1_hook", "Ek"], ["mahine", "b1_hook", "mahine"], ["mein", "b1_hook", "mein"]] as const;
  const up1 = prog(t, a1 - 0.35, 1.0, ease.outExpo), up2 = prog(t, sw - 0.05, 0.8, ease.outExpo);
  const v = t < sw - 0.05 ? lerp(0, 4.83, up1) : lerp(4.83, 5.54, up2);
  const pulse = 1 + 0.07 * Math.exp(-Math.pow((t - sw) / 0.12, 2));
  const zoom = prog(t, end - 0.55, 0.55, ease.inCubic); // push into the % → circle match cut
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, display: "flex", justifyContent: "center", gap: 18, opacity: 1 - zoom }}>
        {words.map(([w, b, d]) => <Mask key={w} t={t} start={at(b, d) - 0.05} dur={0.4}><span style={{ ...display(70, 800) }}>{w}</span></Mask>)}
        <Mask t={t} start={at("b1_hook", "mehengai") - 0.05} dur={0.4}><span style={{ ...display(70, 900), color: GOLD, textShadow: glow(GOLD, 0.5) }}>mehengai</span></Mask>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", opacity: prog(t, a1 - 0.4, 0.15),
        transform: `scale(${pulse * lerp(1, 14, zoom)})`, transformOrigin: "80% 52%" }}>
        <Glitch t={t} at={sw} dur={0.28}>
          <div style={{ ...display(260), color: t < sw ? GOLD : RED, textShadow: glow(t < sw ? GOLD : RED, 1.1), fontVariantNumeric: "tabular-nums" }}>{v.toFixed(2)}%</div>
        </Glitch>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", gap: 26, opacity: 1 - zoom }}>
        {[{ m: "AUG 2026", v: "4.83%", s: a1 + 0.3, c: GOLD_SOFT }, { m: "SEP 2026", v: "5.54%", s: sw + 0.15, c: RED }].map((x) => {
          const o = prog(t, x.s, 0.35);
          return (
            <div key={x.m} style={{ opacity: o, transform: `translateY(${(1 - o) * 20}px)`, padding: "14px 26px", borderRadius: 14, border: `2px solid ${x.c}88`, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
              <div style={{ fontFamily: font.mono, fontSize: 22, color: DIM, letterSpacing: "0.1em" }}>{x.m}</div>
              <div style={{ ...display(54, 800), color: x.c, marginTop: 6 }}>{x.v}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1120, display: "flex", justifyContent: "center", opacity: prog(t, sw + 0.35, 0.3) * (1 - zoom) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "16px 34px", borderRadius: 999, background: GOLD, boxShadow: glow(GOLD, 0.6) }}>
          <span style={{ ...display(54), color: NAVY }}>4.83%</span>
          <svg width={64} height={28} viewBox="0 0 70 30"><path d="M2 15 H60 M46 3 L62 15 L46 27" stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ ...display(54), color: NAVY }}>5.54%</span>
        </div>
      </div>
      <Source t={t} a={a1} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ================================================ 2. THALI  (circle opens out of the % into real footage) */
const Thali: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.thali;
  const iris = prog(t, a, 0.6, ease.outExpo);
  const word = at("b1_thali", "thali");
  const ring = prog(t, word - 0.1, 0.5, ease.outExpo);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${lerp(4, 120, iris)}% at 50% 42%)` }}>
      <AbsoluteFill style={{ background: NAVY }} />
      <Photo n="thali.jpg" t={t} a={a} b={b} dark={0.35} from={[1.25, 0, 40]} to={[1.08, 0, -10]} />
      <div style={{ position: "absolute", left: 540 - 330, top: 806 - 330, width: 660, height: 660, borderRadius: "50%", border: `5px solid ${GOLD}`,
        boxShadow: glow(GOLD, 1.2), opacity: ring, transform: `scale(${lerp(1.3, 1, ring)}) rotate(${t * 20}deg)`, borderStyle: "dashed" }} />
      <div style={{ position: "absolute", left: G, right: G, top: 290, textAlign: "center" }}>
        <Mask t={t} start={a + 0.05}><div style={{ ...display(96, 900), textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>Sabse bada jhatka</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center" }}>
        <Mask t={t} start={word - 0.1}><div style={{ ...display(150, 900), color: GOLD, textShadow: glow(GOLD, 1) }}>THALI PE</div></Mask>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================ 3. MoSPI drop + spinning icons + basket */
const Mospi: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cpi;
  const drop = prog(t, a, 0.6, ease.outBack);
  const cx = 540, cy = 720;
  const into = prog(t, b - 1.15, 0.8, ease.inOutQuint);
  const basketIn = prog(t, b - 0.95, 0.5, ease.outExpo);
  const spin = (t - a) * 1.4;
  const icons = [{ k: "FOOD", C: IconFood, ph: 0 }, { k: "HOUSING", C: IconHouse, ph: 2.094 }, { k: "TRANSPORT", C: IconBus, ph: 4.189 }];
  const cpi = at("b2_cpi", "CPI"), tok = at("b2_cpi", "tokri");
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(t, a + 0.3, 0.4) * (1 - into) }}>
        <ellipse cx={cx} cy={cy} rx={360} ry={150} fill="none" stroke={`${GOLD}66`} strokeWidth={2.5} strokeDasharray="10 14" strokeDashoffset={-t * 60} transform={`rotate(-8 ${cx} ${cy})`} />
      </svg>
      {icons.map(({ k, C, ph }, i) => {
        const pop = prog(t, a + 0.3 + i * 0.15, 0.45, ease.outBack);
        const ang = spin + ph;
        const ox = cx + Math.cos(ang) * 360, oy = cy + Math.sin(ang) * 150 - Math.cos(ang) * 50;
        const x = lerp(ox, 540 + (i - 1) * 120, into), y = lerp(oy, 1180, into);
        const depth = (Math.sin(ang) + 1) / 2;
        const sz = lerp(lerp(120, 180, depth), 110, into) * pop;
        return (
          <div key={k} style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, zIndex: Math.sin(ang) > 0 || into > 0.5 ? 3 : 1,
            opacity: clamp01(pop * 2) * lerp(0.6, 1, depth) }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${NAVY2} 55%, transparent 72%)`, boxShadow: `0 0 40px ${GOLD}55`, border: `2px solid ${GOLD}77` }} />
            <div style={{ position: "absolute", inset: "20%" }}><C c={GOLD} /></div>
            <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 6, fontFamily: font.mono, fontSize: 20, color: GOLD_SOFT, letterSpacing: "0.1em", opacity: 1 - into }}>{k}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: cx - 180, top: lerp(-400, cy - 180, drop), width: 360, height: 360, zIndex: 2, transform: `translateY(${-into * 330}px) scale(${lerp(1, 0.6, into)})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #1A2A55, ${NAVY} 75%)`, border: `4px solid ${GOLD}`, boxShadow: glow(GOLD, 0.9) }} />
        <svg viewBox="0 0 380 380" style={{ position: "absolute", inset: 0, transform: `rotate(${t * 26}deg)` }}>
          <defs><path id="ringv2" d="M190,190 m-166,0 a166,166 0 1,1 332,0 a166,166 0 1,1 -332,0" /></defs>
          <text fill={GOLD_SOFT} style={{ fontFamily: font.mono, fontSize: 19, letterSpacing: "0.3em" }}><textPath href="#ringv2">NATIONAL STATISTICS OFFICE · CONSUMER PRICE INDEX · </textPath></text>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...display(74), color: GOLD, textShadow: glow(GOLD, 0.5), letterSpacing: "-0.03em" }}>MoSPI</div>
          <div style={{ fontFamily: font.mono, fontSize: 16, color: DIM, marginTop: 8, letterSpacing: "0.16em" }}>CPI · BASE 2024</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 980, textAlign: "center", transform: `translateY(${-into * 380}px)`, zIndex: 4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, alignItems: "baseline" }}>
          <Mask t={t} start={cpi - 0.1}><span style={{ ...display(140), color: GOLD, textShadow: glow(GOLD, 0.6) }}>CPI</span></Mask>
          <Mask t={t} start={cpi + 0.15}><span style={{ ...display(140, 600) }}>=</span></Mask>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginTop: 4 }}>
          {["Ghar", "ki", "tokri", "ka", "daam"].map((w, i) => (
            <Mask key={w} t={t} start={at("b2_cpi", "aapke") + i * 0.14}><span style={{ ...display(86, 800), color: w === "tokri" ? GOLD : INK }}>{w}</span></Mask>
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 270, top: 1090, width: 540, height: 280, opacity: basketIn, transform: `translateY(${(1 - basketIn) * 80}px)`, zIndex: 2 }}>
        <svg viewBox="0 0 540 300" width={540} height={280}>
          <path d="M40 90 H500 L452 270 H88 Z" fill={`${GOLD}14`} stroke={GOLD} strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${120 + k * 75} 100 L${130 + k * 70} 262`} stroke={`${GOLD}66`} strokeWidth={3} />)}
          <path d="M140 90 Q270 -40 400 90" fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
        </svg>
      </div>
      <Source t={t} a={tok} text="SOURCE · MOSPI · 1,407 URBAN MARKETS + 1,465 VILLAGES" />
    </AbsoluteFill>
  );
};

/* ================================================ 4. FOOD: wall of tiles, glowing 5.97 → 7.74, scan line picks 3 winners */
const TILES = ["thali.jpg", "market.jpg", "subji.jpg", "grocery.jpg", "onion.jpg", "sacks.jpg", "potato.jpg", "thali_b.jpg", "market.jpg", "street_1.jpg", "grocery.jpg", "market.jpg"];
const WIN: Record<number, { name: string; c: string }> = { 4: { name: "PYAAZ", c: RED }, 6: { name: "ALOO", c: GREEN }, 8: { name: "TAMATAR", c: GREEN } };
const Food: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.food;
  const n1 = at("b3_food", "5.97%"), n2 = at("b3_food", "7.74%");
  const scan = prog(t, b - 1.6, 1.0, ease.inOutCubic);
  const pick = prog(t, b - 0.7, 0.4, ease.outExpo);
  const v = t < n2 - 0.05 ? lerp(0, 5.97, prog(t, n1 - 0.2, 0.8, ease.outExpo)) : lerp(5.97, 7.74, prog(t, n2 - 0.05, 0.8, ease.outExpo));
  const tw = 290, th = 300, gap = 14;
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      {/* the wall */}
      <div style={{ position: "absolute", left: (1080 - (3 * tw + 2 * gap)) / 2, top: 250, width: 3 * tw + 2 * gap, display: "flex", flexWrap: "wrap", gap,
        transform: `translateY(${-prog(t, a, b - a, ease.linear) * 40}px)` }}>
        {TILES.map((n, i) => {
          const tin = prog(t, a + 0.04 * i, 0.5, ease.outExpo);
          const row = Math.floor(i / 3);
          const lit = scan > 0 && scan * 4 > row && scan * 4 < row + 1.2;
          const win = WIN[i];
          const dim = pick > 0 ? (win ? 1 : 0.18) : 0.42 + (lit ? 0.4 : 0);
          return (
            <div key={i} style={{ width: tw, height: th, borderRadius: 14, overflow: "hidden", position: "relative", background: NAVY2, opacity: tin * dim,
              transform: `scale(${lerp(0.85, 1, tin) * (win ? lerp(1, 1.06, pick) : 1)})`, border: win && pick > 0 ? `3px solid ${win.c}` : "1px solid rgba(255,255,255,0.08)",
              boxShadow: win && pick > 0 ? glow(win.c, 0.6) : "none" }}>
              {has(n) ? <Img src={photo(n)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ position: "absolute", inset: "28%" }}><IconFood c={`${GOLD}88`} /></div>}
              {win && <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: font.mono, fontSize: 24, fontWeight: 700, color: "#fff", opacity: pick, textShadow: "0 2px 10px #000" }}>{win.name}</div>}
            </div>
          );
        })}
      </div>
      {/* scan line */}
      {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 60, right: 60, top: 250 + scan * 1300, height: 4, background: GOLD, boxShadow: glow(GOLD, 1) }} />}
      {/* hero number */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", flexDirection: "column", alignItems: "center", opacity: prog(t, n1 - 0.3, 0.2) * (1 - pick) }}>
        <div style={{ padding: "26px 44px", borderRadius: 26, background: "rgba(6,11,28,0.82)", border: `2px solid ${t < n2 ? GOLD : RED}88` }}>
          <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 26, letterSpacing: "0.3em", color: DIM, textAlign: "center" }}>KHAANE KI MEHENGAI</div>
          <Glitch t={t} at={n2} dur={0.24}>
            <div style={{ ...display(190), color: t < n2 ? GOLD : RED, textShadow: glow(t < n2 ? GOLD : RED, 1), textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{v.toFixed(2)}%</div>
          </Glitch>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", fontFamily: font.mono, fontSize: 26 }}>
            <span style={{ color: GOLD_SOFT }}>AUG 5.97%</span><span style={{ color: DIM }}>→</span><span style={{ color: RED, opacity: prog(t, n2, 0.3) }}>SEP 7.74%</span>
          </div>
        </div>
      </div>
      <Source t={t} a={n1} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ================================================ 5. VEG: 3D carousel + floor reflection + whip + flipping value cards */
const VEG = [
  { name: "Pyaaz", v: "+108.09%", c: RED, img: "onion.jpg", w: "108%" },
  { name: "Aloo", v: "−11.50%", c: GREEN, img: "potato.jpg", w: "Aloo" },
  { name: "Tamatar", v: "−8.62%", c: GREEN, img: "market.jpg", w: "tamatar" },
];
const CARDS = [VEG[0], { name: "Dal", v: "", c: GOLD, img: "sacks.jpg", w: "" }, VEG[1], { name: "Bazaar", v: "", c: GOLD, img: "market.jpg", w: "" }, VEG[2], { name: "Sabzi", v: "", c: GOLD, img: "subji.jpg", w: "" }];
const Veg: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.veg;
  const hits = VEG.map((x) => at("b4_veg", x.w));
  // carousel angle: idle spin, then whips to card 0 / 2 / 4 on the words
  const step = (360 / CARDS.length);
  const targets = [0, 2, 4].map((k) => -k * step);
  let ang = lerp(140, 0, prog(t, a, hits[0] - a - 0.05, ease.inOutQuint)) + targets[0];
  if (t > hits[1] - 0.35) ang = lerp(targets[0], targets[1], prog(t, hits[1] - 0.35, 0.45, ease.inOutQuint));
  if (t > hits[2] - 0.3) ang = lerp(targets[1], targets[2], prog(t, hits[2] - 0.3, 0.4, ease.inOutQuint));
  const R = 430, cw = 400, ch = 520;
  const cur = t < hits[1] - 0.1 ? 0 : t < hits[2] - 0.1 ? 1 : 2;
  const flip = prog(t, hits[cur] - 0.05, 0.5, ease.outExpo);
  const Ring = (mirror: boolean) => (
    <div style={{ position: "absolute", left: 540 - cw / 2, top: mirror ? 560 + ch + 30 : 560, width: cw, height: ch, transformStyle: "preserve-3d",
      transform: `${mirror ? "scaleY(-1) " : ""}translateZ(-${R}px) rotateY(${ang}deg)` }}>
      {CARDS.map((c, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, transform: `rotateY(${i * step}deg) translateZ(${R}px)`, borderRadius: 22, overflow: "hidden",
          border: `2px solid ${c.c}88`, background: NAVY2, backfaceVisibility: "hidden" }}>
          {has(c.img) ? <Img src={photo(c.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ position: "absolute", inset: "30%" }}><IconFood c={c.c} /></div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 45%, rgba(6,11,28,0.92))" }} />
          <div style={{ position: "absolute", left: 26, bottom: 22, ...display(62, 900) }}>{c.name}</div>
        </div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      <Label t={t} a={a} text="SAAL BHAR MEIN · SEP 2026" top={300} />
      <div style={{ position: "absolute", inset: 0, perspective: 1500, perspectiveOrigin: "50% 40%" }}>
        {Ring(false)}
        {/* floor reflection: mirrored ring fading into the floor (fade lives on this wrapper, not on the 3D element) */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.22, WebkitMaskImage: "linear-gradient(180deg, transparent 58%, #000 60%, transparent 76%)", maskImage: "linear-gradient(180deg, transparent 58%, #000 60%, transparent 76%)" }}>
          {Ring(true)}
        </div>
      </div>
      {/* flipping value card under the hero */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", perspective: 1000 }}>
        <div style={{ transform: `rotateX(${(1 - flip) * 90}deg)`, transformOrigin: "50% 0%", padding: "14px 40px", borderRadius: 18, background: "rgba(6,11,28,0.9)",
          border: `3px solid ${VEG[cur].c}`, boxShadow: glow(VEG[cur].c, 0.8) }}>
          <Glitch t={t} at={hits[0]} dur={0.22}>
            <span style={{ ...display(cur === 0 ? 120 : 104, 900), color: VEG[cur].c, textShadow: glow(VEG[cur].c, 0.8) }}>{VEG[cur].v}</span>
          </Glitch>
        </div>
      </div>
      <Source t={t} a={a + 0.3} text="SOURCE · MOSPI · ITEM INFLATION, SEP 2026 VS SEP 2025" />
    </AbsoluteFill>
  );
};

/* ================================================ 6. GAON vs SHEHAR: India map split screen + counters */
const Split: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.split;
  const g = at("b5_split", "6.08%"), s = at("b5_split", "4.88%.");
  const draw = prog(t, a, 1.0, ease.outCubic);
  const states = Object.values((MAP as { states: Record<string, string> }).states);
  const sc = 0.78, mw = MAP.w * sc, mh = MAP.h * sc;
  const col = (x: { n: string; v: number; at: number; c: string; img: string; left: boolean }) => {
    const p = prog(t, x.at - 0.15, 0.8, ease.outExpo);
    return (
      <div style={{ position: "absolute", top: 0, bottom: 0, left: x.left ? 0 : 540, width: 540, overflow: "hidden" }}>
        {has(x.img) && <Photo n={x.img} t={t} a={a} b={b} dark={0.72} blur={2} from={[1.2, x.left ? 30 : -30, 0]} to={[1.1, 0, 0]} />}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center" }}>
          <Mask t={t} start={x.at - 0.2}><div style={{ ...display(64, 800) }}>{x.n}</div></Mask>
          <div style={{ ...display(132, 900), color: x.c, textShadow: glow(x.c, 0.9), opacity: clamp01(p * 3), fontVariantNumeric: "tabular-nums" }}>{lerp(0, x.v, p).toFixed(2)}%</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      {col({ n: "Gaon", v: 6.08, at: g, c: RED, img: "village.jpg", left: true })}
      {col({ n: "Shehar", v: 4.88, at: s, c: GOLD, img: "night_skyline.jpg", left: false })}
      <div style={{ position: "absolute", left: 539, top: 230, width: 2, height: 1180, background: `linear-gradient(180deg, transparent, ${GOLD}, transparent)`, transform: `scaleY(${draw})` }} />
      <svg width={mw} height={mh} viewBox={`0 0 ${MAP.w} ${MAP.h}`} style={{ position: "absolute", left: 540 - mw / 2, top: 250 }}>
        {states.map((d, i) => <path key={i} d={d} fill={`${GOLD}10`} stroke={GOLD} strokeWidth={1.6} strokeOpacity={0.85} strokeDasharray={4000} strokeDashoffset={4000 * (1 - draw)} />)}
      </svg>
      <Label t={t} a={a} text="RETAIL MEHENGAI · SEP 2026" top={240} />
      <Source t={t} a={g} text={MOSPI} />
    </AbsoluteFill>
  );
};

/* ================================================ 7. RBI corridor: SDF / repo / MSF lines step up 25 bps */
const Rbi: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.rbi;
  const up = at("b6_rbi", "5.50%");
  const k = prog(t, up - 0.15, 0.7, ease.inOutQuint);
  const y = (v: number) => 1250 - (v - 4.9) * 700;
  const lines = [{ n: "MSF", v: 5.5 }, { n: "REPO", v: 5.25 }, { n: "SDF", v: 5.0 }];
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      <div style={{ position: "absolute", left: 540 - 150, top: 250, width: 300, height: 300, opacity: prog(t, a, 0.4), transform: `scale(${lerp(0.6, 1, prog(t, a, 0.6, ease.outBack))})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `4px solid ${GOLD}`, boxShadow: glow(GOLD, 0.8), background: `radial-gradient(circle at 40% 35%, #1A2A55, ${NAVY} 75%)` }} />
        <svg viewBox="0 0 300 300" style={{ position: "absolute", inset: 0, transform: `rotate(${-t * 24}deg)` }}>
          <defs><path id="rbiring" d="M150,150 m-128,0 a128,128 0 1,1 256,0 a128,128 0 1,1 -256,0" /></defs>
          <text fill={GOLD_SOFT} style={{ fontFamily: font.mono, fontSize: 17, letterSpacing: "0.32em" }}><textPath href="#rbiring">MONETARY POLICY COMMITTEE · 7 OCT 2026 · </textPath></text>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...display(92), color: GOLD, textShadow: glow(GOLD, 0.5) }}>RBI</div>
      </div>
      {/* corridor band */}
      <div style={{ position: "absolute", left: G, width: W, top: y(5.5 + 0.25 * k), height: y(5.0 + 0.25 * k) - y(5.5 + 0.25 * k), background: `linear-gradient(180deg, ${RED}22, ${GOLD}10)`, opacity: prog(t, a + 0.3, 0.5) }} />
      {lines.map((l, i) => {
        const v = l.v + 0.25 * k;
        const isRepo = l.n === "REPO";
        const c = isRepo ? (k > 0.02 ? RED : GOLD) : GOLD_SOFT;
        return (
          <div key={l.n} style={{ position: "absolute", left: G, width: W, top: y(v) - 2, opacity: prog(t, a + 0.2 + i * 0.12, 0.4) }}>
            <div style={{ height: isRepo ? 6 : 3, background: c, boxShadow: isRepo ? glow(c, 0.6) : "none", borderRadius: 3 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: font.mono, fontSize: isRepo ? 34 : 26, color: c }}>
              <span>{l.n}</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{v.toFixed(2)}%</span>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", right: G, top: 420, opacity: prog(t, up, 0.3), transform: `scale(${lerp(1.4, 1, prog(t, up, 0.4, ease.outBack))})`, transformOrigin: "100% 50%" }}>
        <div style={{ padding: "12px 26px", borderRadius: 12, background: RED, ...display(50, 900), color: "#fff", boxShadow: glow(RED, 0.7) }}>▲ +25 BPS</div>
      </div>
      <Source t={t} a={a + 0.4} text="SOURCE · RBI MPC RESOLUTION · 7 OCT 2026" />
    </AbsoluteFill>
  );
};

/* ================================================ 8. FY27 projection: big stat on a push cut + stamp */
const Proj: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.proj;
  const v = at("b6_proj", "5.2%"), warn = at("b6_proj", "Anuman");
  const qs = [{ q: "Q2", v: 4.9 }, { q: "Q3", v: 6.0 }, { q: "Q4", v: 5.7 }];
  const stamp = prog(t, warn - 0.1, 0.35, ease.outExpo);
  return (
    <AbsoluteFill style={pushIn(t, v - 0.1, 1.25)}>
      <Label t={t} a={a} text="RBI KA CPI ANUMAN · FY27" top={300} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", ...display(330), color: GOLD, textShadow: glow(GOLD, 1.3), opacity: prog(t, v - 0.12, 0.15) }}>5.2%</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, display: "flex", justifyContent: "center", gap: 50, alignItems: "flex-end", height: 300 }}>
        {qs.map((q, i) => {
          const p = prog(t, v + 0.3 + i * 0.15, 0.6, ease.outExpo);
          return (
            <div key={q.q} style={{ width: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: font.mono, fontSize: 30, color: INK, opacity: p }}>{q.v.toFixed(1)}%</span>
              <div style={{ width: 110, height: (q.v / 6.5) * 220 * p, border: `3px dashed ${GOLD}`, borderBottom: "none", borderRadius: "6px 6px 0 0", boxShadow: `0 0 24px ${GOLD}44` }} />
              <span style={{ fontFamily: font.text, fontWeight: 700, fontSize: 26, letterSpacing: "0.15em", color: DIM }}>{q.q}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", opacity: stamp }}>
        <Glitch t={t} at={warn} dur={0.22}>
          <div style={{ transform: `rotate(-4deg) scale(${lerp(1.8, 1, stamp)})`, border: `5px solid ${RED}`, borderRadius: 14, padding: "14px 30px", ...display(58, 900), color: RED, textShadow: glow(RED, 0.5), boxShadow: glow(RED, 0.4) }}>
            ANUMAN HAI, GUARANTEE NAHI
          </div>
        </Glitch>
      </div>
      <Source t={t} a={a + 0.3} text="RBI PROJECTION · 7 OCT 2026 · NOT A GUARANTEE" est />
    </AbsoluteFill>
  );
};

/* ================================================ 9. REAL RETURN: terminal types the formula, phone panel flips to the result */
const Real: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.real;
  const ex = at("b7_real", "7%"), res = at("b7_real", "1.46%.");
  const L1 = "$ asli_return = return - mehengai";
  const L2 = "$ asli_return(7, 5.54)";
  const L3 = "> 1.46";
  const typed = (s: string, t0: number, cps = 26) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
  const toPhone = prog(t, ex - 0.25, 0.6, ease.inOutQuint);
  const flip = prog(t, res - 0.2, 0.55, ease.inOutCubic);
  const caret = Math.floor(t * 2.5) % 2 === 0;
  return (
    <AbsoluteFill style={pushIn(t, a)}>
      {/* terminal */}
      <div style={{ position: "absolute", left: G - 10, right: G - 10, top: lerp(420, 250, toPhone), borderRadius: 18, overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.14)",
        background: "rgba(8,12,24,0.94)", boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${GOLD}22`, transform: `scale(${lerp(1, 0.86, toPhone)})`, transformOrigin: "50% 0%" }}>
        <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: "rgba(255,255,255,0.05)" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: 14, background: c }} />)}
          <span style={{ marginLeft: 14, fontFamily: font.mono, fontSize: 20, color: DIM }}>avron — real-return</span>
        </div>
        <div style={{ padding: "26px 28px", fontFamily: font.mono, fontSize: 34, lineHeight: 1.6, color: INK, minHeight: 230 }}>
          <div><span style={{ color: GOLD }}>{typed(L1, a + 0.1, 30)}</span>{t < ex - 0.3 && caret ? "▌" : ""}</div>
          <div>{typed(L2, ex - 0.1, 30)}{t >= ex - 0.3 && t < res && caret ? "▌" : ""}</div>
          <div style={{ color: GOLD, textShadow: glow(GOLD, 0.4) }}>{t > res - 0.15 ? L3 : ""}</div>
        </div>
      </div>
      {/* phone with FD card → flips to the real return */}
      <div style={{ position: "absolute", left: 540 - 220, top: lerp(1960, 690, toPhone), width: 440, height: 620, borderRadius: 56, background: "#05070D",
        border: "8px solid #20283A", boxShadow: `0 40px 90px rgba(0,0,0,0.7), 0 0 50px ${GOLD}22`, perspective: 1200 }}>
        <div style={{ position: "absolute", left: "50%", top: 16, width: 110, height: 26, marginLeft: -55, borderRadius: 20, background: "#000" }} />
        <div style={{ position: "absolute", left: 26, right: 26, top: 80, bottom: 40, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 26, background: "linear-gradient(160deg, #18244A, #0B1226)", border: `2px solid ${GOLD_SOFT}55`, padding: 30 }}>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: DIM, letterSpacing: "0.12em" }}>FD · UDAHARAN</div>
            <div style={{ ...display(110, 900), color: INK, marginTop: 20 }}>7%</div>
            <div style={{ fontFamily: font.mono, fontSize: 26, color: RED, marginTop: 30 }}>− mehengai 5.54%</div>
            <div style={{ height: 2, background: "rgba(255,255,255,0.15)", margin: "26px 0" }} />
            <div style={{ fontFamily: font.mono, fontSize: 22, color: DIM }}>asli return = ?</div>
          </div>
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 26, background: `linear-gradient(160deg, ${GOLD}, #C9932A)`, padding: 30,
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: glow(GOLD, 0.8) }}>
            <div style={{ fontFamily: font.mono, fontSize: 24, color: NAVY, letterSpacing: "0.12em" }}>ASLI KAMAI</div>
            <div style={{ ...display(150, 900), color: NAVY }}>1.46%</div>
            <div style={{ fontFamily: font.mono, fontSize: 20, color: NAVY, opacity: 0.75 }}>tax se pehle</div>
          </div>
        </div>
      </div>
      <Source t={t} a={ex} text="ILLUSTRATIVE FD RATE · PRE-TAX · NOT ADVICE" est />
    </AbsoluteFill>
  );
};

/* ================================================ 10. CTA: beat drop, words on beats, cursor clicks the button, 3-word ticker */
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cta;
  const c = at("b8_cta", "Comment");
  const drop = Math.exp(-Math.pow((t - a) / 0.09, 2));
  const cur = prog(t, c - 0.7, 0.6, ease.inOutCubic);
  const click = prog(t, c - 0.05, 0.4, ease.outCubic);
  const press = 1 - 0.08 * Math.exp(-Math.pow((t - c) / 0.07, 2));
  const tick = ["MEHENGAI", "THALI", "COMMENT"];
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.05 * drop})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${GOLD}55, transparent 60%)`, opacity: drop }} />
      {has("thali.jpg") && <Photo n="thali.jpg" t={t} a={a} b={b} dark={0.82} blur={6} from={[1.3, 0, 0]} to={[1.2, 0, 0]} />}
      <div style={{ position: "absolute", left: G, right: G, top: 420, textAlign: "center" }}>
        {[["Aapki thali mein", "Aapki"], ["sabse mehenga", "sabse"], ["kya hua?", "kya"]].map(([line, w], i) => (
          <Mask key={line} t={t} start={at("b8_cta", w) - 0.08} dur={0.35}>
            <div style={{ ...display(108, 900), color: i === 2 ? GOLD : INK, textShadow: i === 2 ? glow(GOLD, 0.9) : "0 6px 30px rgba(0,0,0,0.8)" }}>{line}</div>
          </Mask>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", opacity: prog(t, c - 0.8, 0.3) }}>
        <div style={{ position: "relative", transform: `scale(${press})`, display: "inline-flex", alignItems: "center", gap: 18, background: GOLD, borderRadius: 999, padding: "24px 50px", boxShadow: glow(GOLD, 0.9) }}>
          <span style={{ ...display(62, 900), color: NAVY }}>Comment karo</span>
          <svg width={40} height={40} viewBox="0 0 34 34"><path d="M17 4 V28 M7 18 L17 28 L27 18" stroke={NAVY} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {click > 0 && click < 1 && <div style={{ position: "absolute", left: "62%", top: "60%", width: 40, height: 40, marginLeft: -20, marginTop: -20, borderRadius: "50%", border: `4px solid ${INK}`, transform: `scale(${lerp(0.4, 4, click)})`, opacity: 1 - click }} />}
        </div>
      </div>
      {/* cursor */}
      <svg width={60} height={60} viewBox="0 0 24 24" style={{ position: "absolute", left: lerp(900, 640, cur), top: lerp(1250, 950, cur), opacity: prog(t, c - 0.75, 0.15), filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.6))" }}>
        <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.8 L11.6 14 L18 14 Z" fill="#fff" stroke="#000" strokeWidth={1.2} />
      </svg>
      {/* 3-word ticker */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, height: 80, overflow: "hidden", borderTop: `2px solid ${GOLD}55`, borderBottom: `2px solid ${GOLD}55`, background: "rgba(6,11,28,0.7)" }}>
        <div style={{ display: "flex", gap: 60, whiteSpace: "nowrap", transform: `translateX(${-((t - a) * 260) % 1200}px)`, paddingTop: 12 }}>
          {Array.from({ length: 4 }).flatMap((_, k) => tick.map((w, i) => <span key={`${k}${i}`} style={{ ...display(50, 900), color: i === 2 ? GOLD : INK }}>{w} <span style={{ color: GOLD }}>•</span></span>))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================ 11. END: logo reveal, disclaimer, photo credits, fade to black */
const End: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.end;
  const sweep = prog(t, a + 0.2, 0.9, ease.inOutCubic);
  const out = prog(t, DURATION - 0.6, 0.6, ease.inCubic);
  return (
    <AbsoluteFill style={{ background: NAVY, opacity: prog(t, a, 0.2) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 680, textAlign: "center" }}>
        <div style={{ display: "inline-block", position: "relative", ...display(140, 900), letterSpacing: "0.3em", paddingLeft: "0.3em", color: GOLD, textShadow: glow(GOLD, 1),
          clipPath: `inset(0 ${100 - lerp(0, 100, prog(t, a + 0.05, 0.6, ease.outExpo))}% 0 0)` }}>
          AVRON
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${lerp(-20, 110, sweep)}%`, width: "18%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)", mixBlendMode: "overlay" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 960, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, opacity: prog(t, a + 0.5, 0.4) }}>
        <div style={{ fontFamily: font.mono, fontSize: 25, color: INK }}>Education only · Not investment advice</div>
        <div style={{ fontFamily: font.mono, fontSize: 25, color: INK }}>AVRON is not SEBI-registered</div>
        <div style={{ fontFamily: font.mono, fontSize: 19, color: DIM, marginTop: 16 }}>Data · MoSPI CPI 12 Oct 2026 · RBI MPC 7 Oct 2026</div>
        <div style={{ fontFamily: font.mono, fontSize: 17, color: DIM, lineHeight: 1.5 }}>{CREDITS}</div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};
const CREDITS = (CREDITS_JSON as string[]).join(" · ");

const SHOTS = [S.hook, S.thali, S.cpi, S.food, S.veg, S.split, S.rbi, S.proj, S.real, S.cta, S.end].map((w) => w[0]);
const on = (t: number, w: readonly [number, number]) => t >= w[0] && t < w[1] + 0.04;

const Graphics: React.FC = () => {
  const t = useTime();
  const a = Math.max(...SHOTS.filter((x) => x <= t));
  const heat = clamp01((t - at("b1_hook", "5.54%")) / 0.6);
  return (
    <AbsoluteFill style={{ transform: `scale(${1 + 0.005 * (t - a)})`, transformOrigin: "50% 45%" }}>
      <Backdrop t={t} heat={heat} />
      {on(t, S.hook) && <Hook t={t} />}
      {on(t, S.thali) && <Thali t={t} />}
      {on(t, S.cpi) && <Mospi t={t} />}
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

export const ThaliReelV2: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <Graphics />
      </CameraMotionBlur>
      {t < S.cta[0] && <Captions t={t} chunks={CAPTIONS} family={font.display} size={54} y={1340} />}
      {t < S.end[0] - 0.2 && <div style={{ position: "absolute", left: G, top: 112, fontFamily: font.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.42em", color: INK, opacity: 0.85 }}>AVRON</div>}
      <Audio src={staticFile("thali/mix.wav")} />
    </AbsoluteFill>
  );
};

