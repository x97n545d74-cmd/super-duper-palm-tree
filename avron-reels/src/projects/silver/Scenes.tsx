import React, { createContext, useContext } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { clamp01, ease, lerp, useTime } from "../../engine/anim";
import { Grain, Rise, SerifFont } from "../swiggy/look";
import { Odometer } from "../swiggy/film/kit";
import { Chart, cut, Ink, Ledger, PEAK, Person, Phone, PTS } from "./Demos";

/*
 * Six signature scenes for the silver film, built from the user's animation brief (2026-10-26) inside the
 * approved look (ledger main, phone for Rohan, paper for Gupta ji) and the house motion rules:
 * no glow, particles, shake, flashes or bounce. Each scene starts at local time 0.
 */
/** The film can re-time a scene: it provides a map from film time (local to the scene) to the scene's design time. */
export const SceneTime = createContext<((t: number) => number) | null>(null);
const useSceneTime = () => {
  const t = useTime();
  const map = useContext(SceneTime);
  return map ? map(t) : t;
};
/** Piecewise-linear map through [filmT, sceneT] keys, clamped at both ends. */
export const keys = (k: [number, number][]) => (t: number) => {
  if (t <= k[0][0]) return k[0][1] + (t - k[0][0]);
  for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return k[k.length - 1][1] + (t - k[k.length - 1][0]);
};
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const serif = "'Playfair Display', Georgia, serif";
const RED = "#FF3B30", SLATE = "#0B0B0C", INK = "#1F2A44", PAPER = "#F3EBD6";
const hand: React.CSSProperties = { fontFamily: serif, fontStyle: "italic", color: INK };

/** Masked wipe in over the previous scene, then a slow push for the whole scene. No fade out: the next scene wipes over it. */
const Frame: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const t = useSceneTime();
  const pin = ease.inOutCubic(clamp01(t / 0.6));
  return (
    <AbsoluteFill style={{ background: bg, clipPath: pin < 1 ? `inset(0 ${100 - pin * 100}% 0 0)` : undefined, transform: `scale(${1 + 0.015 * clamp01(t / dur)})` }}>
      {children}
    </AbsoluteFill>
  );
};
const Foot: React.FC<{ text: string; dark?: boolean }> = ({ text, dark }) => (
  <div style={{ position: "absolute", left: 120, bottom: 54, fontFamily: mono, fontSize: 20, color: dark ? "#5E646E" : "#8A6E4B" }}>{text}</div>
);

/* ------------------------------------------------------------------ 1 · Hook: the coin and the cut (7 s) */
export const Coin: React.FC<{ size: number; cutAt: number; t: number }> = ({ size, cutAt, t }) => {
  const split = ease.outCubic(clamp01((t - cutAt) / 0.9)) * 14;
  const half = (clip: string, dx: number, dy: number): React.ReactNode => (
    <div style={{ position: "absolute", inset: 0, clipPath: clip, transform: `translate(${dx}px, ${dy}px)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle at 34% 28%, #FBFCFD 0%, #D3D8DE 22%, #A7AEB7 48%, #7A818B 74%, #5A6069 100%)",
        boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.18), inset 0 0 0 14px rgba(0,0,0,0.18), inset 0 -18px 40px rgba(0,0,0,0.35)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: sans, fontWeight: 800, color: "#8A919B", textShadow: "0 2px 0 rgba(255,255,255,0.55), 0 -1px 0 rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: size * 0.24, letterSpacing: "-0.02em" }}>999</div>
        <div style={{ fontSize: size * 0.07, letterSpacing: "0.3em" }}>FINE SILVER · 10 G</div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {half("polygon(0 0, 100% 0, 0 100%)", -split, -split)}
      {half("polygon(100% 0, 100% 100%, 0 100%)", split, split)}
    </div>
  );
};
export const SceneHook: React.FC = () => {
  const t = useSceneTime();
  const drop = ease.outCubic(clamp01((t - 0.2) / 0.9));
  const line = ease.inOutCubic(clamp01((t - 2.2) / 1.1));
  // the cut runs top-left to bottom-right across the whole frame, through the coin, then leaves the frame
  const x1 = -100, y1 = 120, x2 = 2020, y2 = 1180;
  const head = { x: lerp(x1, x2, line), y: lerp(y1, y2, line) };
  const tail = ease.inCubic(clamp01((t - 3.1) / 0.8));
  const from = { x: lerp(x1, x2, tail), y: lerp(y1, y2, tail) };
  const push = 1 + 0.05 * clamp01(t / 7);
  return (
    <Frame dur={7} bg={`radial-gradient(80% 70% at 62% 55%, #1A1B1F, ${SLATE} 70%)`}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "62% 55%" }}>
        {/* the coin lies on slate: perspective wrapper, shadow underneath */}
        <div style={{ position: "absolute", left: 1180, top: 400, width: 560, height: 560, perspective: 1600 }}>
          <div style={{ position: "absolute", left: 40, top: 300, width: 480, height: 160, borderRadius: "50%", background: "rgba(0,0,0,0.55)", filter: "blur(30px)", opacity: drop }} />
          <div style={{ transform: `translateY(${(1 - drop) * -260}px) rotateX(52deg) rotateZ(-14deg)`, opacity: clamp01(drop * 3) }}>
            <Coin size={560} cutAt={2.75} t={t} />
          </div>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {line > 0 && tail < 1 && <line x1={from.x} y1={from.y} x2={head.x} y2={head.y} stroke={RED} strokeWidth={5} strokeLinecap="round" />}
        </svg>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 250 }}>
        <Rise t={t} at={1.0} dur={0.9}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.05em", color: "#F3F1EC", lineHeight: 1 }}>5 saal se kami</div></Rise>
        <Rise t={t} at={3.4} dur={0.9}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.05em", color: RED, lineHeight: 1.1 }}>Phir bhi 55% crash</div></Rise>
        <Rise t={t} at={4.3}><div style={{ fontFamily: mono, fontSize: 24, color: "#8A919C", marginTop: 34 }}>Deficit 2021–2025 · Silver Institute · Peak $121.67 → ~$54</div></Rise>
      </div>
    </Frame>
  );
};

/* ------------------------------------------------------------------ 2 · Teen shak: cards struck and tilted back (8 s) */
const MYTHS = [["01", "Kami nakli hai", "Metals Focus ginta hai · kami asli"], ["02", "Sab Fed ka khel hai", "Sona −11% · chandi −31% · usi din"], ["03", "Ab koi chandi nahi chahta", "Coins aur bars · +18% anuman"]];
export const SceneMyths: React.FC = () => {
  const t = useSceneTime();
  return (
    <Frame dur={8} bg={PAPER}>
      <SerifFont />
      <Ledger />
      <div style={{ position: "absolute", left: 200, top: 120, fontFamily: mono, fontSize: 24, color: "#8A6E4B", letterSpacing: "0.2em" }}>TEEN SHAK</div>
      {MYTHS.map(([n, myth, why], i) => {
        const inn = ease.outExpo(clamp01((t - 0.3 - i * 0.18) / 0.9));
        const at = 1.8 + i * 1.5;
        const strike = ease.inOutCubic(clamp01((t - at) / 0.55));
        const back = ease.inOutCubic(clamp01((t - at - 0.6) / 0.7));
        return (
          // fade lives on the wrapper; the tilted card keeps its own transform
          <div key={n} style={{ position: "absolute", left: 200 + i * 520, top: 260, width: 480, height: 470, perspective: 1400, opacity: lerp(1, 0.42, back),
            transform: `translateX(${(1 - inn) * 1400}px)` }}>
            <div style={{ position: "absolute", inset: 0, background: "#FBF8F1", borderRadius: 6, padding: "40px 36px", transformOrigin: "50% 100%",
              transform: `rotateX(${back * 22}deg) translateZ(${-back * 60}px)`, ...cut(14) }}>
              <div style={{ fontFamily: mono, fontSize: 24, color: "#8A6E4B" }}>{n}</div>
              <div style={{ position: "relative", marginTop: 40 }}>
                <div style={{ ...hand, fontWeight: 700, fontSize: 64, lineHeight: 1.15 }}>
                  <span style={{ backgroundImage: `linear-gradient(${RED}, ${RED})`, backgroundRepeat: "no-repeat", backgroundSize: `${strike * 100}% 9px`, backgroundPosition: "0 60%",
                    WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>{myth}</span>
                </div>
              </div>
              <div style={{ fontFamily: sans, fontSize: 28, color: "#5B5247", marginTop: 40, lineHeight: 1.35, opacity: clamp01((t - at - 0.4) / 0.4) }}>{why}</div>
            </div>
          </div>
        );
      })}
      <Ink t={t} at={6.5} dur={0.9} style={{ position: "absolute", left: 200, top: 800 }}><div style={{ ...hand, fontWeight: 700, fontSize: 84 }}>Kami asli · <span style={{ color: RED }}>crash bhi asli</span></div></Ink>
    </Frame>
  );
};

/* ------------------------------------------------------------------ 3 · Gupta ji vs Rohan: warm and slow vs cold and fast (10 s) */
export const SceneSplit: React.FC = () => {
  const t = useSceneTime();
  const crash = 5.6;
  const door = ease.inOutCubic(clamp01((t - 1.0) / 1.6));
  const crashed = t > crash;
  const val = crashed ? lerp(10.4, 7.3, ease.outExpo(clamp01((t - crash) / 0.5))) : lerp(8.0, 10.4, clamp01((t - 1.2) / 4.2));
  const fill = ease.inOutCubic(clamp01((t - crash) / 0.45));
  const banner = ease.outExpo(clamp01((t - crash - 0.5) / 0.6));
  return (
    <Frame dur={10} bg="#000">
      {/* left: Gupta ji, paper, warm */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, background: "radial-gradient(120% 90% at 30% 20%, #F1EBDD, #E2D8C3 70%, #D3C6AC)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 90, top: 70, fontFamily: mono, fontSize: 24, letterSpacing: "0.2em", color: "#7A6F60" }}>GUPTA JI · INDORE</div>
        <div style={{ position: "absolute", left: 590, top: 380 }}><Person kind="gupta" t={t} at={0.3} /></div>
        {/* almirah: the door swings on its left hinge */}
        <div style={{ position: "absolute", left: 170, top: 300, width: 360, height: 560, background: "#7E858C", borderRadius: 10, ...cut(16) }}>
          <div style={{ position: "absolute", left: 90, top: 210, width: 180, height: 150, background: "#5E646B", borderRadius: 8, display: "flex", flexWrap: "wrap", alignContent: "flex-end", padding: 14, gap: 6 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const k = ease.outCubic(clamp01((t - 2.4 - i * 0.28) / 0.6));
              return <div key={i} style={{ width: 34, height: 34, borderRadius: 34, background: "radial-gradient(circle at 35% 30%, #FAFBFC, #B4BAC2 60%, #80868F)", border: "2px solid #9AA0A8",
                transform: `translateY(${(1 - k) * -120}px)`, opacity: k }} />;
            })}
          </div>
          <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#8C939A,#767D84)", borderRadius: 10, transformOrigin: "0% 50%",
              transform: `rotateY(${-door * 105}deg)`, boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.12)" }}>
              <div style={{ position: "absolute", right: 30, top: 260, width: 14, height: 60, borderRadius: 7, background: "#C9CDD2" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 90, top: 940, fontFamily: sans, fontWeight: 800, fontSize: 52, color: "#2A2520", letterSpacing: "-0.03em",
          opacity: clamp01((t - crash - 0.8) / 0.4) }}>₹1 lakh → ₹70,000 · so gaye</div>
      </div>
      {/* right: Rohan, the phone, cold */}
      <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, background: "linear-gradient(160deg, #0E1016, #06070A)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 90, top: 70, fontFamily: mono, fontSize: 24, letterSpacing: "0.2em", color: "#7C828C" }}>ROHAN · PUNE</div>
        <Phone x={245}>
          <div style={{ fontFamily: sans, fontSize: 22, color: "#9AA0AA" }}>SILVER · POSITION ₹10 LAKH</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 70, color: crashed ? RED : "#3FBF7F", fontVariantNumeric: "tabular-nums", marginTop: 10 }}>
            ₹{val.toFixed(2)} L</div>
          <div style={{ fontFamily: sans, fontSize: 26, color: crashed ? RED : "#3FBF7F" }}>{crashed ? "−30% · aaj" : "+ har din naya high"}</div>
          <div style={{ marginTop: 40 }}><Chart k={clamp01(t / crash) * (PEAK / (PTS.length - 1)) + (crashed ? clamp01((t - crash) / 0.5) * (1 - PEAK / (PTS.length - 1)) : 0)} w={418} h={330} up="#3FBF7F" down={RED} width={4} /></div>
          {/* the red fills the screen as a wipe from the top, no flash */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${fill * 100}%`, background: "rgba(255,59,48,0.16)" }} />
          <div style={{ position: "absolute", left: 18, right: 18, top: 520, background: "#1B1D23", border: `1px solid ${RED}`, borderRadius: 22, padding: "18px 22px",
            transform: `translateY(${(1 - banner) * -260}px)`, opacity: clamp01(banner * 2) }}>
            <div style={{ fontFamily: sans, fontSize: 18, color: "#FF8A84", letterSpacing: "0.06em" }}>BROKER · ABHI</div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 30, color: "#F3F1EC", marginTop: 4 }}>Margin shortfall ₹2,00,000</div>
            <div style={{ fontFamily: sans, fontSize: 22, color: "#B8BDC6", marginTop: 4 }}>Funds add karo, warna square off</div>
          </div>
        </Phone>
      </div>
      <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 1080, background: "#000" }} />
      <Foot text="Illustration · kirdaar kaalpanik · udaaharan: ₹1 lakh margin, ₹10 lakh position" dark />
    </Frame>
  );
};

/* ------------------------------------------------------------------ 4 · 30 January: the dominoes on the curve (9 s) */
export const SceneDominoes: React.FC = () => {
  const t = useSceneTime();
  const W = 1500, H = 640, OX = 210, OY = 230;
  const draw = clamp01(t / 2.4) * (PEAK / (PTS.length - 1)) + clamp01((t - 3.0) / 0.6) * (1 - PEAK / (PTS.length - 1));
  const FIG = [40, 43, 46, 49, 51, 53, 55, 57, 59];
  return (
    <Frame dur={9} bg={`radial-gradient(90% 80% at 50% 40%, #16171B, ${SLATE} 75%)`}>
      <div style={{ position: "absolute", left: 120, top: 80, fontFamily: mono, fontSize: 24, color: "#7C828C", letterSpacing: "0.2em" }}>30 JANUARY 2026 · SILVER FUTURES</div>
      <div style={{ position: "absolute", left: OX, top: OY }}><Chart k={draw} w={W} h={H} up="#E9EDF2" down={RED} width={5} /></div>
      {FIG.map((idx, i) => {
        const [x, y] = PTS[idx];
        const appear = ease.outCubic(clamp01((t - 1.2 - i * 0.08) / 0.4));
        // the last trader (at the peak) falls first, each knocks the one behind it
        const order = FIG.length - 1 - i;
        const fall = ease.inCubic(clamp01((t - 3.2 - order * 0.14) / 0.28));
        const down = fall >= 1;
        return (
          <div key={idx} style={{ position: "absolute", left: OX + x * W - 9, top: OY + y * H - 64, width: 18, height: 64, transformOrigin: "100% 100%",
            transform: `rotate(${-fall * 80}deg) translateY(${(1 - appear) * 30}px)`, opacity: appear }}>
            <div style={{ position: "absolute", left: 2, top: 0, width: 14, height: 14, borderRadius: 14, background: down ? RED : "#D9D3C4" }} />
            <div style={{ position: "absolute", left: 0, top: 16, width: 18, height: 48, borderRadius: "8px 8px 2px 2px", background: down ? RED : "#D9D3C4", boxShadow: "0 6px 10px rgba(0,0,0,0.4)" }} />
            {/* each fallen trader drops his margin tag */}
            {fall > 0.6 && <div style={{ position: "absolute", left: -30, top: -40 + ease.inCubic(clamp01((t - 3.5 - order * 0.14) / 0.8)) * 600, fontFamily: mono, fontSize: 18, color: RED,
              opacity: 1 - clamp01((t - 3.9 - order * 0.14) / 0.5), whiteSpace: "nowrap" }}>−margin</div>}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1240, top: 720 }}>
        <Rise t={t} at={4.6} dur={0.8}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 170, letterSpacing: "-0.05em", color: RED, lineHeight: 1 }}>−31%</div></Rise>
        <Rise t={t} at={5.2}><div style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, color: "#F3F1EC" }}>Ek ke baad ek margin call</div></Rise>
      </div>
      <Foot text="Chart saankethik · −31% COMEX settlement · har figure ek leveraged trader" dark />
    </Frame>
  );
};

/* ------------------------------------------------------------------ 5 · ETF: the NAV rubber band (8 s) */
export const SceneRubberBand: React.FC = () => {
  const t = useSceneTime();
  const base = 640, unit = 22, NAVH = 380; // px per % of premium, NAV bar height
  const stretch = ease.inOutCubic(clamp01((t - 1.2) / 2.2)) * 12; // +12% premium (21 Jan)
  const snap = ease.inCubic(clamp01((t - 4.6) / 0.22)); // hard stop, no recoil
  const pct = snap > 0 ? lerp(12, -11.6, snap) : stretch;
  const h = NAVH + pct * unit;
  const thin = 1 - 0.45 * clamp01(pct / 12); // the band thins as it stretches
  const col = pct < 0 ? RED : "#C9A45C";
  return (
    <Frame dur={8} bg={PAPER}>
      <SerifFont />
      <Ledger />
      <div style={{ position: "absolute", left: 200, top: 120, fontFamily: mono, fontSize: 24, color: "#8A6E4B", letterSpacing: "0.2em" }}>SILVER ETF · NAV VS BAZAAR DAAM</div>
      <div style={{ position: "absolute", left: 300, top: base + 200, width: 900, height: 3, background: INK }} />
      {/* NAV: the real value of the silver behind the unit */}
      <div style={{ position: "absolute", left: 380, top: base + 200 - NAVH, width: 200, height: NAVH, background: "#3C4A66", ...cut(10) }} />
      <div style={{ position: "absolute", left: 380, top: base + 220, width: 200, textAlign: "center", ...hand, fontSize: 44 }}>NAV</div>
      {/* bazaar daam: a band pulled up from the NAV line */}
      <div style={{ position: "absolute", left: 300, top: base + 200 - NAVH, width: 900, height: 2, borderTop: `3px dashed ${INK}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", left: 780 + (200 - 200 * thin) / 2, top: base + 200 - h, width: 200 * thin, height: h, background: col, ...cut(10) }} />
      <div style={{ position: "absolute", left: 780, top: base + 220, width: 200, textAlign: "center", ...hand, fontSize: 44 }}>Bazaar daam</div>
      <div style={{ position: "absolute", left: 1040, top: base + 200 - h - 30, ...hand, fontWeight: 700, fontSize: 80, color: col, whiteSpace: "nowrap" }}>
        {pct >= 0 ? "+" : "−"}{Math.abs(pct).toFixed(1)}%</div>
      <Ink t={t} at={1.6} style={{ position: "absolute", left: 1400, top: 300 }}><div style={{ ...hand, fontSize: 44 }}>21 Jan · NAV se upar</div></Ink>
      <Ink t={t} at={5.2} style={{ position: "absolute", left: 1400, top: 380 }}><div style={{ ...hand, fontSize: 44, color: RED }}>30 Jan · NAV se neeche</div></Ink>
      <Foot text="Premium ~9–12% (21 Jan) · discount up to 11.6% (30 Jan, Value Research)" />
    </Frame>
  );
};

/* ------------------------------------------------------------------ 6 · Flow vs pile: the vault in depth (10 s) */
export const SceneVault: React.FC = () => {
  const t = useSceneTime();
  const open = ease.inOutCubic(clamp01((t - 1.6) / 1.8));
  const dolly = ease.inOutCubic(clamp01((t - 3.0) / 6));
  const layer = (depth: number) => ({ transform: `translate(${-dolly * 40 * depth}px, ${-dolly * 12 * depth}px) scale(${1 + dolly * 0.1 * depth})` });
  const Bars: React.FC<{ rows: number; w: number; top: number; left: number; shade: string }> = ({ rows, w, top, left, shade }) => (
    <div style={{ position: "absolute", left, top }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: 6, marginTop: -w * 0.18, marginLeft: (r % 2) * w * 0.5 }}>
          {Array.from({ length: 14 }).map((__, c) => <div key={c} style={{ width: w, height: w * 0.42, borderRadius: 4, background: `linear-gradient(180deg,#F1F3F5,${shade})`, boxShadow: "0 4px 8px rgba(60,40,20,0.3)" }} />)}
        </div>
      ))}
    </div>
  );
  return (
    <Frame dur={10} bg="radial-gradient(120% 90% at 30% 20%, #F1EBDD, #E2D8C3 70%, #D3C6AC)">
      {/* far: the pile, rows receding */}
      <div style={{ position: "absolute", inset: 0, ...layer(0.4), opacity: open }}>
        <Bars rows={7} w={70} top={260} left={560} shade="#9EA5AE" />
      </div>
      <div style={{ position: "absolute", inset: 0, ...layer(0.7), opacity: open }}>
        <Bars rows={5} w={110} top={420} left={380} shade="#8C939C" />
      </div>
      {/* mid: the vault door, swinging open on its hinge */}
      <div style={{ position: "absolute", inset: 0, ...layer(1) }}>
        <div style={{ position: "absolute", left: 360, top: 120, width: 820, height: 820, perspective: 2200 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#6E757D", transformOrigin: "0% 50%", transform: `rotateY(${-open * 100}deg)`, ...cut(20),
            boxShadow: "inset 0 0 0 30px #5C6269, inset 0 0 0 34px #848B93, 0 20px 40px rgba(60,40,20,0.35)" }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 400, top: 160, width: 20, height: 250, background: "#9AA1A9", borderRadius: 10, transformOrigin: "50% 100%", transform: `rotate(${i * 60 + t * 40}deg)` }} />)}
            <div style={{ position: "absolute", left: 340, top: 340, width: 140, height: 140, borderRadius: 140, background: "#A9B0B8" }} />
          </div>
        </div>
      </div>
      {/* near: the yearly deficit, a thin stream */}
      <div style={{ position: "absolute", inset: 0, ...layer(1.6) }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M1500,-20 C1480,300 1560,520 1520,1100" fill="none" stroke="#6E8FB3" strokeWidth={10} strokeLinecap="round" strokeDasharray="40 26" strokeDashoffset={-t * 120} />
        </svg>
        <div style={{ position: "absolute", left: 1300, top: 300, background: "#FBF8F1", padding: "18px 26px", ...cut(10) }}>
          <div style={{ fontFamily: mono, fontSize: 20, color: "#7A6F60" }}>HAR SAAL KI KAMI · 2026</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: "#2A2520" }}>4.6 crore oz</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, top: 70, background: "#FBF8F1", padding: "22px 30px", ...cut(12), opacity: clamp01((t - 3.6) / 0.5) }}>
        <div style={{ fontFamily: mono, fontSize: 20, color: "#7A6F60" }}>LONDON VAULTS · AUG 2026 · DEUTSCHE BANK</div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: "#2A2520", letterSpacing: "-0.03em" }}><Odometer t={t} at={3.8} text="91 crore oz" dur={1.2} /></div>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 32, color: "#2A2520", marginTop: 6, opacity: clamp01((t - 5.6) / 0.4) }}>Free: 30 crore oz+ · kami ka ~6.5 guna</div>
      </div>
      <Foot text="Illustration · bars not to scale" />
    </Frame>
  );
};

export const SCENES: [React.FC, number][] = [[SceneHook, 7], [SceneMyths, 8], [SceneSplit, 10], [SceneDominoes, 9], [SceneRubberBand, 8], [SceneVault, 10]];
export const SCENES_DUR = SCENES.reduce((n, [, d]) => n + d, 0);

/** The six scenes back to back. */
export const SilverScenes: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SCENES.map(([S, d], i) => {
        const from = at; at += d;
        // each scene wipes in over the end of the one before it, so there is never a black frame
        const lead = i ? 12 : 0;
        return <Sequence key={i} from={from * 30 - lead} durationInFrames={d * 30 + lead} layout="none"><S /></Sequence>;
      })}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};
