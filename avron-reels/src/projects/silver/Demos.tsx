import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { clamp01, ease, lerp, rand, useTime } from "../../engine/anim";
import { fade, Grain, Rise, SerifFont } from "../swiggy/look";
import { Odometer } from "../swiggy/film/kit";

/*
 * Style demos for the silver film ("Chandi kam pad rahi hai, phir girti kyun gayi?").
 * Every option plays the same three beats so they compare like for like:
 *   1.2–5 s  hook        5 saal ki kami · phir bhi 55% crash
 *   5–9 s    30 January  the chart breaks, silver −31%, gold −11%
 *   9–13 s   leverage    Gupta ji ₹1 lakh → ₹70,000 · Rohan ₹1 lakh margin → −₹2 lakh, margin call
 * Numbers come from SCRIPT.md. The chart shape is illustrative and says so on screen.
 */
export const DEMO_DUR = 13;
const S1 = 1.2, S2 = 5, S3 = 9;

const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const serif = "'Playfair Display', Georgia, serif";

/** 0..1 progress, eased. */
const p = (t: number, a: number, d: number, fn = ease.outExpo) => fn(clamp01((t - a) / d));
/** Shot visibility with a masked wipe in and a short lift out. */
const shot = (t: number, a: number, z: number) => ({
  on: t > a - 0.05 && t < z + 0.4,
  wipe: ease.inOutCubic(clamp01((t - a) / 0.6)),
  out: ease.inCubic(clamp01((t - z) / 0.35)),
});
const Wipe: React.FC<{ t: number; a: number; z: number; children: React.ReactNode; bg?: string }> = ({ t, a, z, children, bg }) => {
  const s = shot(t, a, z);
  if (!s.on) return null;
  return (
    <AbsoluteFill style={{ background: bg, clipPath: s.wipe < 1 ? `inset(0 ${100 - s.wipe * 100}% 0 0)` : undefined, opacity: 1 - s.out,
      transform: `translateY(${-s.out * 24}px) scale(${1 + 0.025 * clamp01((t - a) / 4)})` }}>{children}</AbsoluteFill>
  );
};

/** Option label, held for the first second of each demo. */
const Slate: React.FC<{ t: number; letter: string; name: string; note: string; ink: string; bg: string }> = ({ t, letter, name, note, ink, bg }) => (
  <AbsoluteFill style={{ background: bg, opacity: fade(t, -1, S1 + 0.1, 0.01, 0.3), justifyContent: "center", paddingLeft: 160 }}>
    <Rise t={t} at={0.05}><div style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.3em", color: ink, opacity: 0.6 }}>OPTION {letter}</div></Rise>
    <Rise t={t} at={0.15}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", color: ink }}>{name}</div></Rise>
    <Rise t={t} at={0.3}><div style={{ fontFamily: sans, fontSize: 34, color: ink, opacity: 0.7, marginTop: 8 }}>{note}</div></Rise>
  </AbsoluteFill>
);

/** Illustrative price path: a long climb to the January peak, then the 30 January break. x,y in 0..1. */
const PTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const n = 60;
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * 0.8;
    const y = 0.86 - 0.74 * Math.pow(i / n, 2.2) + (rand(i) - 0.5) * 0.035;
    out.push([x, Math.min(0.9, y)]);
  }
  out.push([0.83, 0.5], [0.86, 0.56], [0.92, 0.6], [1, 0.62]);
  return out;
})();
const PEAK = 60;
const pathOf = (pts: [number, number][], w: number, h: number) => pts.map(([x, y], i) => `${i ? "L" : "M"}${(x * w).toFixed(1)},${(y * h).toFixed(1)}`).join(" ");

/** Draws the chart up to progress `k` (0..1 across all points); returns the climb and the break as two paths. */
const Chart: React.FC<{ k: number; w: number; h: number; up: string; down: string; width?: number; dash?: string }> = ({ k, w, h, up, down, width = 5, dash }) => {
  const n = PTS.length - 1;
  const upto = k * n;
  const climb = PTS.slice(0, Math.min(PEAK, Math.floor(upto)) + 1);
  const fall = upto > PEAK ? PTS.slice(PEAK, Math.floor(upto) + 1) : [];
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <path d={pathOf(climb, w, h)} fill="none" stroke={up} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />
      {fall.length > 1 && <path d={pathOf(fall, w, h)} fill="none" stroke={down} strokeWidth={width + 1} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={dash} />}
    </svg>
  );
};
const chartK = (t: number) => lerp(0, 0.985, ease.inOutCubic(clamp01((t - S2 - 0.3) / 1.4))) + 0.015 * clamp01((t - S2 - 1.7) / 0.3);

/* ======================================================================= A · Liquid chrome */
const chrome = (t: number): React.CSSProperties => ({
  backgroundImage: "linear-gradient(100deg, #8E96A3 0%, #E9EDF2 22%, #9AA3AF 40%, #F7F9FB 52%, #8C939E 70%, #D9DEE5 100%)",
  backgroundSize: "300% 100%", backgroundPosition: `${(t * 18) % 100}% 0`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
});
export const DemoA: React.FC = () => {
  const t = useTime();
  const bg = "radial-gradient(90% 80% at 50% 40%, #12151B, #050608 75%)";
  const red = "#E2463F";
  return (
    <AbsoluteFill style={{ background: "#050608" }}>
      <Wipe t={t} a={S1} z={S2} bg={bg}>
        <div style={{ position: "absolute", left: 160, top: 300 }}>
          <Rise t={t} at={S1 + 0.3} dur={0.9}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 170, letterSpacing: "-0.05em", lineHeight: 1, ...chrome(t) }}>5 saal se kami</div></Rise>
          <Rise t={t} at={S1 + 1.3} dur={0.9}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 170, letterSpacing: "-0.05em", lineHeight: 1.05, color: "#F3F1EC" }}>
            Phir bhi <span style={{ color: red }}>55%</span> crash</div></Rise>
          <Rise t={t} at={S1 + 2.2}><div style={{ fontFamily: mono, fontSize: 26, color: "#8A919C", marginTop: 40, letterSpacing: "0.06em" }}>Silver Institute · deficit 2021–2025 · Peak $121.67 (29 Jan) → ~$54</div></Rise>
        </div>
      </Wipe>
      <Wipe t={t} a={S2} z={S3} bg={bg}>
        <svg width={0} height={0}><defs><linearGradient id="chr" x1="0" x2="1"><stop offset="0" stopColor="#6E7682" /><stop offset="0.6" stopColor="#E9EDF2" /><stop offset="1" stopColor="#FFFFFF" /></linearGradient></defs></svg>
        <div style={{ position: "absolute", left: 160, top: 220 }}><Chart k={chartK(t)} w={1100} h={640} up="url(#chr)" down={red} width={6} /></div>
        <div style={{ position: "absolute", left: 1330, top: 300 }}>
          <Rise t={t} at={S2 + 1.8}><div style={{ fontFamily: mono, fontSize: 26, letterSpacing: "0.2em", color: "#8A919C" }}>30 JAN 2026</div></Rise>
          <Rise t={t} at={S2 + 2.0} dur={0.8}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 200, letterSpacing: "-0.05em", color: red, lineHeight: 1 }}>−31%</div></Rise>
          <Rise t={t} at={S2 + 2.4}><div style={{ fontFamily: sans, fontWeight: 600, fontSize: 52, ...chrome(t) }}>Chandi</div></Rise>
          <Rise t={t} at={S2 + 2.8}><div style={{ fontFamily: sans, fontSize: 40, color: "#8A919C", marginTop: 24 }}>Sona −11% · usi din</div></Rise>
        </div>
        <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 20, color: "#5E646E" }}>Chart saankethik · settlement figures, COMEX</div>
      </Wipe>
      <Wipe t={t} a={S3} z={DEMO_DUR - 0.3} bg={bg}>
        {[{ x: 160, who: "Gupta ji · sikke", to: "₹70,000", col: "#E9EDF2", note: "Chandi −30% · so gaye" }, { x: 1000, who: "Rohan · margin pe", to: "−₹2,00,000", col: red, note: "Deposit khatam · upar se ghaata" }].map((c, i) => (
          <div key={c.who} style={{ position: "absolute", left: c.x, top: 250, width: 760 }}>
            <Rise t={t} at={S3 + 0.3 + i * 0.2}><div style={{ fontFamily: mono, fontSize: 28, letterSpacing: "0.2em", color: "#8A919C" }}>{c.who.toUpperCase()}</div></Rise>
            <Rise t={t} at={S3 + 0.5 + i * 0.2}><div style={{ fontFamily: sans, fontWeight: 700, fontSize: 64, color: "#5E646E", marginTop: 20 }}>₹1,00,000</div></Rise>
            <div style={{ height: 2, width: 560 * p(t, S3 + 0.9, 0.8), background: "linear-gradient(90deg,#5E646E,#C9CED6)", margin: "26px 0" }} />
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", color: c.col, fontVariantNumeric: "tabular-nums", opacity: clamp01((t - S3 - 1.2) / 0.3) }}>
              <Odometer t={t} at={S3 + 1.2 + i * 0.3} text={c.to} dur={1.1} />
            </div>
            <Rise t={t} at={S3 + 2.2 + i * 0.2}><div style={{ fontFamily: sans, fontSize: 36, color: "#A4A9B2", marginTop: 16 }}>{c.note}</div></Rise>
          </div>
        ))}
        <div style={{ position: "absolute", left: 1000, top: 800, padding: "18px 28px", borderRadius: 16, border: `1px solid ${red}`, color: red, fontFamily: sans, fontWeight: 700, fontSize: 34,
          clipPath: `inset(0 ${100 - 100 * p(t, S3 + 2.6, 0.6)}% 0 0)` }}>MARGIN CALL · paisa daalo ya position kategi</div>
        <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 20, color: "#5E646E" }}>Udaaharan · ₹1 lakh margin se ₹10 lakh ki chandi · kirdaar kaalpanik</div>
      </Wipe>
      <Slate t={t} letter="A" name="Liquid Chrome" note="Dark, metallic silver type, one red for loss" ink="#E9EDF2" bg="#050608" />
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

/* ======================================================================= B · Paper craft */
const paperBg = "radial-gradient(120% 90% at 30% 20%, #F1EBDD, #E2D8C3 70%, #D3C6AC)";
const cut = (dy = 10): React.CSSProperties => ({ boxShadow: `0 ${dy}px ${dy * 1.6}px rgba(60,40,20,0.28), 0 1px 0 rgba(255,255,255,0.5) inset` });
const Person: React.FC<{ kind: "gupta" | "rohan"; t: number; at: number }> = ({ kind, t, at }) => {
  const k = p(t, at, 0.9, ease.outCubic);
  const kurta = kind === "gupta" ? "#E8E1D0" : "#2F4A6B";
  return (
    <div style={{ position: "relative", width: 260, height: 420, transform: `translateY(${(1 - k) * 80}px)`, opacity: clamp01(k * 2) }}>
      <div style={{ position: "absolute", left: 80, top: 0, width: 100, height: 100, borderRadius: 100, background: "#B07B52", ...cut(8) }} />
      {kind === "gupta" && <div style={{ position: "absolute", left: 96, top: 38, width: 70, height: 16, borderRadius: 8, border: "4px solid #2B2B2B" }} />}
      {kind === "gupta" && <div style={{ position: "absolute", left: 82, top: 0, width: 96, height: 30, borderRadius: "50px 50px 0 0", background: "#D9D6CF" }} />}
      {kind === "rohan" && <div style={{ position: "absolute", left: 78, top: -4, width: 104, height: 40, borderRadius: "50px 50px 10px 10px", background: "#1E1E22" }} />}
      <div style={{ position: "absolute", left: 30, top: 112, width: 200, height: 300, borderRadius: "70px 70px 14px 14px", background: kurta, ...cut(12) }} />
      {kind === "rohan" && <div style={{ position: "absolute", left: 150, top: 200, width: 60, height: 100, borderRadius: 10, background: "#111", border: "4px solid #333", ...cut(8) }}>
        <div style={{ margin: 8, height: 50, borderRadius: 4, background: t > at + 1.6 ? "#D2453D" : "#3F8F5A" }} /></div>}
    </div>
  );
};
export const DemoB: React.FC = () => {
  const t = useTime();
  const red = "#C23B32", ink = "#2A2520";
  return (
    <AbsoluteFill style={{ background: paperBg }}>
      <Wipe t={t} a={S1} z={S2} bg={paperBg}>
        {["5 saal se kami", "Phir bhi 55% crash"].map((s, i) => {
          const k = p(t, S1 + 0.3 + i * 0.9, 0.9, ease.outCubic);
          return (
            <div key={s} style={{ position: "absolute", left: 160 + (1 - k) * -900, top: 300 + i * 230, padding: "26px 46px", background: i ? red : "#FBF8F1", color: i ? "#FBF8F1" : ink,
              fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "-0.04em", transform: `rotate(${i ? 1.2 : -1.4}deg)`, ...cut(14) }}>{s}</div>
          );
        })}
        <div style={{ position: "absolute", left: 1500, top: 220, width: 200, height: 200, borderRadius: 200, background: "linear-gradient(140deg,#F4F4F2,#A9ADB3)", ...cut(16),
          transform: `rotate(${t * 20}deg) translateY(${(1 - p(t, S1 + 0.2, 1, ease.outCubic)) * -400}px)`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: serif, fontWeight: 700, fontSize: 64, color: "#6B7078" }}>Ag</div>
      </Wipe>
      <Wipe t={t} a={S2} z={S3} bg={paperBg}>
        {(() => {
          const k = chartK(t);
          const pts = PTS.slice(0, Math.max(2, Math.floor(k * (PTS.length - 1)) + 1));
          const W = 1200, Hh = 620;
          const d = pathOf(pts, W, Hh) + ` L${(pts[pts.length - 1][0] * W).toFixed(1)},${Hh} L0,${Hh} Z`;
          return (
            <svg width={W} height={Hh} style={{ position: "absolute", left: 160, top: 260, overflow: "visible", filter: "drop-shadow(0 14px 18px rgba(60,40,20,0.3))" }}>
              <path d={d} fill="#B9BEC5" />
              {k > 0.9 && <path d={pathOf(PTS.slice(PEAK), W, Hh) + ` L${W},${Hh} L${PTS[PEAK][0] * W},${Hh} Z`} fill={red} opacity={clamp01((k - 0.9) * 10)} />}
            </svg>
          );
        })()}
        <div style={{ position: "absolute", left: 1400, top: 300, background: "#FBF8F1", padding: "30px 40px", transform: `rotate(2deg) translateY(${(1 - p(t, S2 + 1.9, 0.8, ease.outCubic)) * 500}px)`, ...cut(14) }}>
          <div style={{ fontFamily: mono, fontSize: 24, color: "#7A6F60", letterSpacing: "0.15em" }}>30 JAN 2026</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 150, color: red, letterSpacing: "-0.05em", lineHeight: 1 }}>−31%</div>
          <div style={{ fontFamily: sans, fontSize: 38, color: ink }}>Chandi · Sona −11%</div>
        </div>
        <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 20, color: "#7A6F60" }}>Illustration · chart saankethik</div>
      </Wipe>
      <Wipe t={t} a={S3} z={DEMO_DUR - 0.3} bg={paperBg}>
        <div style={{ position: "absolute", left: 200, top: 380 }}><Person kind="gupta" t={t} at={S3 + 0.2} /></div>
        <div style={{ position: "absolute", left: 470, top: 420, width: 200, height: 380, background: "#8E949B", borderRadius: 8, ...cut(14), opacity: clamp01((t - S3 - 0.3) / 0.4) }}>
          <div style={{ margin: "120px auto 0", width: 120, height: 90, background: "#6E747B", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: 26, height: 26, borderRadius: 26, background: "#E7E9EC", border: "2px solid #A7ACB2" }} />)}
          </div>
        </div>
        <div style={{ position: "absolute", left: 1150, top: 380 }}><Person kind="rohan" t={t} at={S3 + 0.4} /></div>
        {[{ x: 200, a: "₹1 lakh → ₹70,000", c: ink }, { x: 1150, a: "₹1 lakh → −₹2 lakh", c: red }].map((g, i) => (
          <div key={g.x} style={{ position: "absolute", left: g.x, top: 180, background: "#FBF8F1", padding: "18px 30px", fontFamily: sans, fontWeight: 800, fontSize: 56, color: g.c,
            letterSpacing: "-0.03em", transform: `rotate(${i ? 1.5 : -1.5}deg) translateY(${(1 - p(t, S3 + 1.2 + i * 0.4, 0.8, ease.outCubic)) * -300}px)`, ...cut(12) }}>{g.a}</div>
        ))}
        <div style={{ position: "absolute", left: 1480, top: 520, background: red, color: "#FBF8F1", padding: "16px 26px", fontFamily: sans, fontWeight: 800, fontSize: 38, ...cut(10),
          transform: `rotate(-4deg) scale(${lerp(1.5, 1, p(t, S3 + 2.2, 0.3, ease.outCubic))})`, opacity: clamp01((t - S3 - 2.2) / 0.15) }}>MARGIN CALL</div>
        <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 20, color: "#7A6F60" }}>Illustration · kirdaar kaalpanik · udaaharan</div>
      </Wipe>
      <Slate t={t} letter="B" name="Paper Craft" note="Cut-paper scenes, like the Swiggy film's explainers" ink={ink} bg="#EAE2D1" />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};

/* ======================================================================= C · Swiss data room */
export const DemoC: React.FC = () => {
  const t = useTime();
  const bg = "#F2F0EB", ink = "#111214", red = "#D0342C", dim = "#8B8D92";
  const rule = (top: number, at: number) => <div style={{ position: "absolute", left: 120, top, height: 2, width: 1680 * p(t, at, 0.9, ease.inOutCubic), background: ink }} />;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <Wipe t={t} a={S1} z={S2} bg={bg}>
        {rule(170, S1 + 0.1)}
        <div style={{ position: "absolute", left: 120, top: 110, fontFamily: mono, fontSize: 24, color: dim, letterSpacing: "0.2em" }}>CHANDI · 2021–2026</div>
        <div style={{ position: "absolute", left: 100, top: 210, fontFamily: sans, fontWeight: 800, fontSize: 560, letterSpacing: "-0.07em", color: ink, lineHeight: 0.9 }}>
          <Odometer t={t} at={S1 + 0.3} text="5" dur={0.9} /></div>
        <Rise t={t} at={S1 + 0.7} style={{ position: "absolute", left: 470, top: 300 }}><div style={{ fontFamily: sans, fontWeight: 700, fontSize: 90, color: ink, letterSpacing: "-0.04em" }}>saal se kami</div></Rise>
        <Rise t={t} at={S1 + 1.5} style={{ position: "absolute", left: 470, top: 420 }}><div style={{ fontFamily: sans, fontWeight: 700, fontSize: 90, color: red, letterSpacing: "-0.04em" }}>Phir bhi 55% crash</div></Rise>
        {rule(900, S1 + 1.8)}
        <Rise t={t} at={S1 + 2.1} style={{ position: "absolute", left: 120, top: 920 }}><div style={{ fontFamily: mono, fontSize: 24, color: dim }}>Source · Silver Institute / Metals Focus · Peak $121.67 · 29 Jan 2026</div></Rise>
      </Wipe>
      <Wipe t={t} a={S2} z={S3} bg={bg}>
        <div style={{ position: "absolute", left: 120, top: 110, fontFamily: mono, fontSize: 24, color: dim, letterSpacing: "0.2em" }}>FIG. 2 · CHANDI KA DAAM</div>
        {rule(170, S2)}
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: 120, top: 260 + i * 170, width: 1200, height: 1, background: "rgba(17,18,20,0.12)" }} />)}
        <div style={{ position: "absolute", left: 120, top: 240 }}><Chart k={chartK(t)} w={1200} h={640} up={ink} down={red} width={4} /></div>
        <div style={{ position: "absolute", left: 120 + 0.8 * 1200, top: 240 + PTS[PEAK][1] * 640 - 6, width: 2, height: 300, background: red, transform: `scaleY(${p(t, S2 + 1.9, 0.6)})`, transformOrigin: "top" }} />
        <div style={{ position: "absolute", left: 1400, top: 300, width: 420 }}>
          <Rise t={t} at={S2 + 2.0}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 170, color: red, letterSpacing: "-0.06em", lineHeight: 1 }}>−31%</div></Rise>
          <Rise t={t} at={S2 + 2.3}><div style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, color: ink }}>Chandi · 30 Jan</div></Rise>
          <div style={{ height: 2, background: ink, width: 380 * p(t, S2 + 2.5, 0.6), margin: "30px 0" }} />
          <Rise t={t} at={S2 + 2.7}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 90, color: ink, letterSpacing: "-0.05em" }}>−11%</div></Rise>
          <Rise t={t} at={S2 + 2.9}><div style={{ fontFamily: sans, fontWeight: 600, fontSize: 40, color: dim }}>Sona · usi din</div></Rise>
        </div>
        <div style={{ position: "absolute", left: 120, top: 960, fontFamily: mono, fontSize: 22, color: dim }}>Chart saankethik · COMEX settlement</div>
      </Wipe>
      <Wipe t={t} a={S3} z={DEMO_DUR - 0.3} bg={bg}>
        <div style={{ position: "absolute", left: 120, top: 110, fontFamily: mono, fontSize: 24, color: dim, letterSpacing: "0.2em" }}>FIG. 3 · CHANDI 30% GIRI TO</div>
        {rule(170, S3)}
        {[{ who: "Gupta ji", how: "Sikke · apna paisa", v: 70, txt: "₹70,000", c: ink }, { who: "Rohan", how: "Futures · ₹1 lakh margin, ₹10 lakh position", v: -200, txt: "−₹2,00,000", c: red }].map((r, i) => {
          const k = p(t, S3 + 0.6 + i * 0.5, 1.1);
          const zero = 1000, scale = 3.4;
          return (
            <div key={r.who} style={{ position: "absolute", left: 120, top: 280 + i * 300, width: 1680 }}>
              <Rise t={t} at={S3 + 0.3 + i * 0.5}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: ink, letterSpacing: "-0.03em" }}>{r.who}</div></Rise>
              <Rise t={t} at={S3 + 0.4 + i * 0.5}><div style={{ fontFamily: sans, fontSize: 30, color: dim }}>{r.how}</div></Rise>
              <div style={{ position: "absolute", left: zero, top: 10, width: 2, height: 160, background: "rgba(17,18,20,0.3)" }} />
              <div style={{ position: "absolute", top: 40, height: 90, background: r.c, left: r.v < 0 ? zero + r.v * scale * k : zero, width: Math.abs(r.v) * scale * k }} />
              <div style={{ position: "absolute", top: 60, left: r.v < 0 ? zero + 30 : zero + r.v * scale + 30, width: 420, textAlign: "left", fontFamily: sans, fontWeight: 800, fontSize: 52, color: r.c, opacity: clamp01((t - S3 - 1.4 - i * 0.5) / 0.3) }}>{r.txt}</div>
            </div>
          );
        })}
        <Rise t={t} at={S3 + 2.4} style={{ position: "absolute", left: 120, top: 900 }}><div style={{ fontFamily: sans, fontWeight: 700, fontSize: 44, color: red }}>Margin call · deposit khatam, upar se ghaata</div></Rise>
        <div style={{ position: "absolute", left: 120, top: 980, fontFamily: mono, fontSize: 22, color: dim }}>Udaaharan · kirdaar kaalpanik</div>
      </Wipe>
      <Slate t={t} letter="C" name="Swiss Data Room" note="Light editorial page, huge numbers, one red" ink={ink} bg={bg} />
      <Grain opacity={0.04} />
    </AbsoluteFill>
  );
};

/* ======================================================================= D · Bahi-khata ledger */
const ledgerBg = "#F3EBD6";
const Ledger: React.FC = () => (
  <AbsoluteFill style={{ background: ledgerBg }}>
    {Array.from({ length: 17 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 120 + i * 58, height: 1, background: "rgba(60,90,150,0.22)" }} />)}
    {[150, 158, 1500, 1508].map((x) => <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 2, background: "rgba(180,40,40,0.55)" }} />)}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 50% 40%, transparent 60%, rgba(90,60,20,0.25))" }} />
  </AbsoluteFill>
);
/** Ink written left to right. */
const Ink: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, dur = 0.9, children, style }) => (
  <div style={{ clipPath: `inset(-20% ${100 - 100 * p(t, at, dur, ease.inOutCubic)}% -20% 0)`, ...style }}>{children}</div>
);
export const DemoD: React.FC = () => {
  const t = useTime();
  const ink = "#1F2A44", red = "#B3261E";
  const hand: React.CSSProperties = { fontFamily: serif, fontStyle: "italic", color: ink };
  return (
    <AbsoluteFill>
      <SerifFont />
      <Wipe t={t} a={S1} z={S2}>
        <Ledger />
        <div style={{ position: "absolute", left: 200, top: 120, fontFamily: mono, fontSize: 24, color: "#8A6E4B", letterSpacing: "0.2em" }}>KHATA · CHANDI · 2021–2026</div>
        <Ink t={t} at={S1 + 0.3} dur={1.0} style={{ position: "absolute", left: 200, top: 270 }}><div style={{ ...hand, fontSize: 150, fontWeight: 600 }}>5 saal se kami</div></Ink>
        <Ink t={t} at={S1 + 1.3} dur={1.0} style={{ position: "absolute", left: 200, top: 470 }}><div style={{ ...hand, fontSize: 150, fontWeight: 600, color: red }}>Phir bhi 55% crash</div></Ink>
        <div style={{ position: "absolute", left: 200, top: 680, height: 4, width: 1100 * p(t, S1 + 2.3, 0.6, ease.inOutCubic), background: red }} />
        <div style={{ position: "absolute", left: 200, top: 700, height: 4, width: 1100 * p(t, S1 + 2.5, 0.6, ease.inOutCubic), background: red }} />
      </Wipe>
      <Wipe t={t} a={S2} z={S3}>
        <Ledger />
        <div style={{ position: "absolute", left: 200, top: 120, fontFamily: mono, fontSize: 24, color: "#8A6E4B", letterSpacing: "0.2em" }}>PANNA 2 · 30 JANUARY</div>
        <div style={{ position: "absolute", left: 200, top: 220 }}><Chart k={chartK(t)} w={1150} h={640} up={ink} down={red} width={5} dash="1 0" /></div>
        <div style={{ position: "absolute", left: 1540, top: 300 }}>
          <Ink t={t} at={S2 + 1.9}><div style={{ ...hand, fontSize: 112, fontWeight: 700, color: red }}>−31%</div></Ink>
          <Ink t={t} at={S2 + 2.4}><div style={{ ...hand, fontSize: 52 }}>Chandi</div></Ink>
          <Ink t={t} at={S2 + 2.8}><div style={{ ...hand, fontSize: 52, marginTop: 30 }}>Sona −11%</div></Ink>
        </div>
        <div style={{ position: "absolute", left: 200, bottom: 60, fontFamily: mono, fontSize: 20, color: "#8A6E4B" }}>Chart saankethik</div>
      </Wipe>
      <Wipe t={t} a={S3} z={DEMO_DUR - 0.3}>
        <Ledger />
        <div style={{ position: "absolute", left: 200, top: 120, fontFamily: mono, fontSize: 24, color: "#8A6E4B", letterSpacing: "0.2em" }}>NAAM · LAGAYA · CHANDI −30% KE BAAD</div>
        {[{ n: "Gupta ji (sikke)", a: "₹1,00,000", b: "₹70,000", c: ink }, { n: "Rohan (margin)", a: "₹1,00,000", b: "−₹2,00,000", c: red }].map((r, i) => (
          <div key={r.n} style={{ position: "absolute", left: 200, top: 290 + i * 232, width: 1500, display: "flex" }}>
            <Ink t={t} at={S3 + 0.3 + i * 0.7} style={{ width: 640 }}><div style={{ ...hand, fontSize: 64 }}>{r.n}</div></Ink>
            <Ink t={t} at={S3 + 0.6 + i * 0.7} style={{ width: 420 }}><div style={{ ...hand, fontSize: 64 }}>{r.a}</div></Ink>
            <Ink t={t} at={S3 + 0.9 + i * 0.7}><div style={{ ...hand, fontSize: 64, fontWeight: 700, color: r.c }}>{r.b}</div></Ink>
          </div>
        ))}
        <div style={{ position: "absolute", left: 1180, top: 760, border: `6px double ${red}`, color: red, padding: "12px 30px", fontFamily: sans, fontWeight: 800, fontSize: 52, letterSpacing: "0.1em",
          transform: `rotate(-8deg) scale(${lerp(1.6, 1, p(t, S3 + 2.3, 0.25, ease.outCubic))})`, opacity: 0.85 * clamp01((t - S3 - 2.3) / 0.12), mixBlendMode: "multiply" }}>MARGIN CALL</div>
        <div style={{ position: "absolute", left: 200, bottom: 60, fontFamily: mono, fontSize: 20, color: "#8A6E4B" }}>Udaaharan · kirdaar kaalpanik</div>
      </Wipe>
      <Slate t={t} letter="D" name="Bahi-Khata" note="A seth's red-ruled ledger, numbers written in ink" ink={ink} bg={ledgerBg} />
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};

/* ======================================================================= E · Phone-first */
const Phone: React.FC<{ children: React.ReactNode; x?: number }> = ({ children, x = 1130 }) => (
  <div style={{ position: "absolute", left: x, top: 90, width: 470, height: 900, borderRadius: 64, background: "#0B0C10", border: "2px solid #2A2D35",
    boxShadow: "0 60px 120px rgba(0,0,0,0.6)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 185, top: 18, width: 100, height: 28, borderRadius: 20, background: "#000", zIndex: 5 }} />
    <div style={{ position: "absolute", inset: 0, padding: "80px 26px 26px" }}>{children}</div>
  </div>
);
const Note: React.FC<{ t: number; at: number; title: string; body: string; red?: boolean }> = ({ t, at, title, body, red }) => {
  const k = p(t, at, 0.6);
  if (t < at) return null;
  return (
    <div style={{ background: red ? "rgba(220,60,55,0.18)" : "rgba(255,255,255,0.08)", border: `1px solid ${red ? "rgba(240,82,79,0.6)" : "rgba(255,255,255,0.12)"}`, borderRadius: 22,
      padding: "18px 22px", marginBottom: 14, transform: `translateY(${(1 - k) * -40}px)`, opacity: k }}>
      <div style={{ fontFamily: sans, fontSize: 18, color: red ? "#FF8A84" : "#9AA0AA", letterSpacing: "0.04em" }}>{title}</div>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, color: "#F3F1EC", marginTop: 4, lineHeight: 1.3 }}>{body}</div>
    </div>
  );
};
export const DemoE: React.FC = () => {
  const t = useTime();
  const bg = "linear-gradient(160deg, #0E1016, #06070A)";
  const red = "#F0524F", green = "#3FBF7F";
  const side = (lines: [string, string?][], at: number) => (
    <div style={{ position: "absolute", left: 160, top: 330, width: 860 }}>
      {lines.map(([l, c], i) => <Rise key={l} t={t} at={at + i * 0.35}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 96, letterSpacing: "-0.04em", lineHeight: 1.08, color: c ?? "#F3F1EC" }}>{l}</div></Rise>)}
    </div>
  );
  const price = lerp(121.67, 78.53, p(t, S2 + 1.6, 1.0, ease.outCubic));
  return (
    <AbsoluteFill style={{ background: "#06070A" }}>
      <Wipe t={t} a={S1} z={S2} bg={bg}>
        {side([["5 saal se kami"], ["Phir bhi 55% crash", red]], S1 + 0.4)}
        <Phone>
          <div style={{ fontFamily: sans, fontWeight: 300, fontSize: 96, color: "#F3F1EC", textAlign: "center", letterSpacing: "-0.03em" }}>9:41</div>
          <div style={{ fontFamily: sans, fontSize: 22, color: "#9AA0AA", textAlign: "center", marginBottom: 40 }}>Monday, 26 October</div>
          <Note t={t} at={S1 + 0.6} title="CHANDI SQUAD · 29 Jan" body="Silver $121 · naya record" />
          <Note t={t} at={S1 + 1.4} title="NEWS" body="Silver deficit · lagaatar 5 saal" />
          <Note t={t} at={S1 + 2.2} title="PRICE ALERT · aaj" body="Silver January peak se −55%" red />
        </Phone>
      </Wipe>
      <Wipe t={t} a={S2} z={S3} bg={bg}>
        {side([["30 January"], ["Ek din mein −31%", red], ["Sona −11%", "#9AA0AA"]], S2 + 0.3)}
        <Phone>
          <div style={{ fontFamily: sans, fontSize: 22, color: "#9AA0AA" }}>SILVER · MAR FUT</div>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 64, color: t > S2 + 1.6 ? red : green, fontVariantNumeric: "tabular-nums" }}>${price.toFixed(2)}</div>
          <div style={{ fontFamily: sans, fontSize: 24, color: t > S2 + 1.6 ? red : green }}>{t > S2 + 1.6 ? `−${(((121.67 - price) / 121.67) * 100).toFixed(1)}%` : "+ record"}</div>
          <div style={{ marginTop: 50 }}><Chart k={chartK(t)} w={418} h={380} up={green} down={red} width={4} /></div>
          <div style={{ fontFamily: sans, fontSize: 16, color: "#5E646E", marginTop: 30 }}>Demo app · chart saankethik</div>
        </Phone>
      </Wipe>
      <Wipe t={t} a={S3} z={DEMO_DUR - 0.3} bg={bg}>
        {side([["Gupta ji · ₹70,000"], ["Rohan · −₹2 lakh", red]], S3 + 0.3)}
        <Rise t={t} at={S3 + 1.2} style={{ position: "absolute", left: 160, top: 600 }}><div style={{ fontFamily: sans, fontSize: 34, color: "#9AA0AA", width: 820, lineHeight: 1.4 }}>Dono ne ₹1 lakh lagaya · Rohan ne margin pe ₹10 lakh ki chandi li</div></Rise>
        <Phone>
          {[["Rohan", "bhai silver naya high"], ["Amit", "aaj double karenge"], ["Rohan", "???"]].map(([w, m], i) => (
            <Rise key={i} t={t} at={S3 + 0.3 + i * 0.4}><div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "14px 18px", marginBottom: 12, width: 320 }}>
              <div style={{ fontFamily: sans, fontSize: 16, color: "#6FA8FF" }}>{w}</div>
              <div style={{ fontFamily: sans, fontSize: 26, color: "#F3F1EC" }}>{m}</div></div></Rise>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 430, background: "#16181E", borderRadius: "36px 36px 0 0", padding: 34,
            transform: `translateY(${(1 - p(t, S3 + 1.8, 0.7)) * 460}px)`, borderTop: `2px solid ${red}` }}>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 42, color: red }}>Margin call</div>
            <div style={{ fontFamily: sans, fontSize: 26, color: "#F3F1EC", marginTop: 14, lineHeight: 1.35 }}>Margin shortfall ₹2,00,000 · funds add karo, warna position square off hogi</div>
            <div style={{ marginTop: 30, background: red, borderRadius: 18, padding: "18px 0", textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 28, color: "#fff" }}>Add funds</div>
          </div>
        </Phone>
        <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 20, color: "#5E646E" }}>Udaaharan · kirdaar kaalpanik · unbranded demo app</div>
      </Wipe>
      <Slate t={t} letter="E" name="Phone-First" note="The story told through Rohan's screen" ink="#F3F1EC" bg="#06070A" />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

/** All five back to back, for one-file review. */
export const DemoAll: React.FC = () => {
  const t = useTime();
  const i = Math.min(4, Math.floor(t / DEMO_DUR));
  const C = [DemoA, DemoB, DemoC, DemoD, DemoE][i];
  return <TimeShift by={i * DEMO_DUR}><C /></TimeShift>;
};
const TimeShift: React.FC<{ by: number; children: React.ReactNode }> = ({ by, children }) => (
  <Sequence from={Math.round(by * 30)} layout="none">{children}</Sequence>
);
