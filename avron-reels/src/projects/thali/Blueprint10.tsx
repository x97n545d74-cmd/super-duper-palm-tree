import React from "react";
import { AbsoluteFill } from "remotion";
import { font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog, rand, useTime } from "../../engine/anim";

/*
 * 10 s silent graphics test: the user's blueprint visual cues taken literally (0–10 s).
 *   0–3 s  "Dark navy background with glowing gold animated count-up", text 4.83% -> 5.54%, glitch pop on the change
 *   3–10 s "MoSPI logo drops in with spinning icons (food, housing, transport)", text "CPI = Ek Basket Ki Keemat"
 * Glow, spin and glitch are the blueprint's asks (they are outside the house look on purpose).
 * MoSPI is set as a typographic badge, not the official emblem.
 */
export const BLUEPRINT10_DUR = 10;

const NAVY = "#060B1C";
const NAVY2 = "#0E1A3A";
const GOLD = "#FFC94D";
const GOLD_SOFT = "#F5D58A";
const RED = "#FF4D4D";
const INK = "#F3F1EC";
const DIM = "rgba(243,241,236,0.5)";
const G = 84;

const glow = (c: string, k = 1) =>
  `0 0 ${18 * k}px ${c}AA, 0 0 ${48 * k}px ${c}66, 0 0 ${110 * k}px ${c}33`;

const display = (size: number, weight = 900): React.CSSProperties => ({
  fontFamily: font.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1, color: INK,
});

/** Masked rise. */
const Mask: React.FC<{ t: number; start: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({ t, start, children, style, dur = 0.55 }) => {
  const p = ease.outExpo(clamp01((t - start) / dur));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Navy stage: deep gradient, slow light pool, faint vertical scan of gold dust lines. */
const Backdrop: React.FC<{ t: number; heat: number }> = ({ t, heat }) => (
  <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% ${lerp(44, 40, clamp01(t / 10))}%, ${NAVY2} 0%, ${NAVY} 70%)` }}>
    <div style={{ position: "absolute", left: "50%", top: "38%", width: 1300, height: 1300, marginLeft: -650, marginTop: -650, borderRadius: "50%",
      background: `radial-gradient(circle, ${GOLD}${Math.round(lerp(0x10, 0x26, heat)).toString(16).padStart(2, "0")} 0%, transparent 60%)`,
      transform: `scale(${1 + 0.04 * Math.sin(t * 1.3)})` }} />
    {Array.from({ length: 14 }).map((_, i) => {
      const x = rand(i + 3) * 1080, sp = 30 + rand(i + 11) * 60;
      const y = ((rand(i + 7) * 1920 - t * sp) % 1920 + 1920) % 1920;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: 2, height: 90 + rand(i) * 120,
        background: `linear-gradient(180deg, transparent, ${GOLD}55, transparent)`, opacity: 0.35 }} />;
    })}
  </AbsoluteFill>
);

/** Glitch layer: RGB-split + horizontal slice offsets for a short burst. */
const Glitch: React.FC<{ t: number; at: number; dur?: number; children: React.ReactNode }> = ({ t, at, dur = 0.22, children }) => {
  const k = clamp01(1 - Math.abs(t - at) / (dur / 2));
  if (k <= 0) return <>{children}</>;
  const f = Math.floor(t * 30);
  const off = 26 * k * (rand(f) - 0.5) * 2;
  const slices = [0, 1, 2, 3, 4, 5];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-14 * k}px)`, mixBlendMode: "screen", filter: "url(#none)", opacity: 0.8, color: "#FF2E63" }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${14 * k}px)`, mixBlendMode: "screen", opacity: 0.8, color: "#2EE6FF" }}>{children}</div>
      {slices.map((s) => {
        const top = (s / slices.length) * 100;
        const dx = (rand(f * 7 + s) - 0.5) * 70 * k;
        return (
          <div key={s} style={{ position: "absolute", inset: 0, clipPath: `inset(${top}% 0 ${100 - top - 100 / slices.length}% 0)`, transform: `translateX(${dx}px)` }}>
            {children}
          </div>
        );
      })}
      <div style={{ visibility: "hidden", transform: `translateX(${off}px)` }}>{children}</div>
    </div>
  );
};

/* ------------------------------------------------ icons (original line art) */
const IconFood: React.FC<{ c: string }> = ({ c }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <ellipse cx={50} cy={60} rx={38} ry={14} fill="none" stroke={c} strokeWidth={6} />
    <path d="M14 58 Q50 100 86 58" fill={`${c}33`} stroke={c} strokeWidth={6} strokeLinejoin="round" />
    <path d="M36 40 q6 -10 0 -20 M50 42 q6 -12 0 -24 M64 40 q6 -10 0 -20" stroke={c} strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);
const IconHouse: React.FC<{ c: string }> = ({ c }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <path d="M12 50 L50 16 L88 50" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 44 V86 H78 V44" fill={`${c}22`} stroke={c} strokeWidth={6} strokeLinejoin="round" />
    <rect x={42} y={60} width={16} height={26} fill="none" stroke={c} strokeWidth={5} />
  </svg>
);
const IconBus: React.FC<{ c: string }> = ({ c }) => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <rect x={14} y={18} width={72} height={56} rx={10} fill={`${c}22`} stroke={c} strokeWidth={6} />
    <path d="M14 46 H86" stroke={c} strokeWidth={5} />
    <rect x={24} y={26} width={22} height={14} rx={3} fill="none" stroke={c} strokeWidth={4} />
    <rect x={54} y={26} width={22} height={14} rx={3} fill="none" stroke={c} strokeWidth={4} />
    <circle cx={30} cy={80} r={8} fill={NAVY} stroke={c} strokeWidth={5} />
    <circle cx={70} cy={80} r={8} fill={NAVY} stroke={c} strokeWidth={5} />
  </svg>
);

/* ------------------------------------------------ 0–3 s: count-up hook */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const SW = 1.45; // switch to September on this beat
  const up1 = prog(t, 0.15, 1.1, ease.outExpo);
  const up2 = prog(t, SW, 0.8, ease.outExpo);
  const v = t < SW ? lerp(0, 4.83, up1) : lerp(4.83, 5.54, up2);
  const hot = up2;
  const col = t < SW ? GOLD : `rgb(${Math.round(lerp(255, 255, hot))},${Math.round(lerp(201, 77, hot))},${Math.round(lerp(77, 77, hot))})`;
  const pulse = 1 + 0.06 * Math.exp(-Math.pow((t - SW) / 0.12, 2));
  const out = prog(t, 2.55, 0.45, ease.inCubic); // push into the % for the match cut
  return (
    <AbsoluteFill style={{ opacity: 1 - clamp01((t - 2.9) / 0.1) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: font.text, fontWeight: 700, fontSize: 30,
        letterSpacing: "0.32em", color: DIM, opacity: prog(t, 0.05, 0.4) }}>
        RETAIL MEHENGAI · CPI
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center",
        transform: `scale(${pulse * lerp(1, 9, out)})`, transformOrigin: "78% 50%" }}>
        <Glitch t={t} at={SW} dur={0.26}>
          <div style={{ ...display(250), color: col, textShadow: glow(t < SW ? GOLD : RED, lerp(0.8, 1.2, hot)), fontVariantNumeric: "tabular-nums" }}>
            {v.toFixed(2)}%
          </div>
        </Glitch>
      </div>
      {/* month chips */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 26, opacity: 1 - out }}>
        {[{ m: "AUG 2026", v: "4.83%", on: prog(t, 0.6, 0.4), c: GOLD_SOFT }, { m: "SEP 2026", v: "5.54%", on: prog(t, SW + 0.1, 0.4), c: RED }].map((x) => (
          <div key={x.m} style={{ opacity: x.on, transform: `translateY(${(1 - x.on) * 20}px)`, padding: "14px 26px", borderRadius: 14,
            border: `2px solid ${x.c}88`, background: "rgba(255,255,255,0.04)", textAlign: "center" }}>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: DIM, letterSpacing: "0.1em" }}>{x.m}</div>
            <div style={{ ...display(54, 800), color: x.c, marginTop: 6 }}>{x.v}</div>
          </div>
        ))}
      </div>
      {/* on-screen text overlay: 4.83% -> 5.54% */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, display: "flex", justifyContent: "center", opacity: prog(t, SW + 0.25, 0.35) * (1 - out) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 36px", borderRadius: 999, background: GOLD, boxShadow: glow(GOLD, 0.6) }}>
          <span style={{ ...display(58, 900), color: NAVY }}>4.83%</span>
          <svg width={70} height={30} viewBox="0 0 70 30"><path d="M2 15 H60 M46 3 L62 15 L46 27" stroke={NAVY} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ ...display(58, 900), color: NAVY }}>5.54%</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: font.mono, fontSize: 30, color: RED,
        opacity: prog(t, SW + 0.45, 0.3) * (1 - out), textShadow: glow(RED, 0.4) }}>
        ▲ +0.71 percentage points in 1 month
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ 3–10 s: MoSPI drop + spinning icons + basket */
const Mospi: React.FC<{ t: number }> = ({ t }) => {
  const a = 3.0;
  const drop = prog(t, a, 0.7, ease.outBack);
  const flashIn = clamp01(1 - (t - a) / 0.25);
  const cx = 540, cy = 760;
  const icons = [
    { key: "Food", C: IconFood, ph: 0 },
    { key: "Housing", C: IconHouse, ph: (2 * Math.PI) / 3 },
    { key: "Transport", C: IconBus, ph: (4 * Math.PI) / 3 },
  ];
  const into = prog(t, 7.4, 0.9, ease.inOutQuint); // icons fly into the basket
  const spin = (t - a) * 1.1 + 0.6 * ease.outExpo(clamp01((t - a - 0.4) / 1.2)) * 2;
  const basketIn = prog(t, 7.85, 0.6, ease.outExpo);
  return (
    <AbsoluteFill style={{ opacity: prog(t, a - 0.05, 0.12) }}>
      {/* match-cut flash from the % zoom */}
      <AbsoluteFill style={{ background: GOLD, opacity: 0.28 * flashIn }} />
      {/* orbit ring */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(t, a + 0.5, 0.6) * (1 - into) }}>
        <ellipse cx={cx} cy={cy} rx={360} ry={150} fill="none" stroke={`${GOLD}55`} strokeWidth={2.5} strokeDasharray="10 14"
          strokeDashoffset={-t * 60} transform={`rotate(-8 ${cx} ${cy})`} />
      </svg>
      {/* icons behind the badge (back half of the orbit) */}
      {icons.map(({ key, C, ph }, i) => {
        const pop = prog(t, a + 0.6 + i * 0.22, 0.5, ease.outBack);
        const ang = spin + ph;
        const ox = cx + Math.cos(ang) * 360, oy = cy + Math.sin(ang) * 150 - Math.cos(ang) * 50;
        const bx = 540 + (i - 1) * 120, by = 1250;
        const x = lerp(ox, bx, into), y = lerp(oy, by, into);
        const depth = (Math.sin(ang) + 1) / 2; // 1 = front
        const sz = lerp(lerp(120, 190, depth), 120, into) * pop;
        const front = Math.sin(ang) > 0 || into > 0.5;
        return (
          <div key={key} style={{ position: "absolute", left: x - sz / 2, top: y - sz / 2, width: sz, height: sz, zIndex: front ? 3 : 1,
            transform: `rotate(${(1 - into) * Math.sin(t * 2 + i) * 14}deg)`, opacity: lerp(0.55, 1, front ? 1 : depth) * clamp01(pop * 2) }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${NAVY2} 55%, transparent 72%)`,
              boxShadow: `0 0 40px ${GOLD}44`, border: `2px solid ${GOLD}66` }} />
            <div style={{ position: "absolute", inset: "20%" }}><C c={GOLD} /></div>
            <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: 8, fontFamily: font.mono,
              fontSize: 22, color: GOLD_SOFT, letterSpacing: "0.1em", opacity: (1 - into) * clamp01(pop) }}>{key.toUpperCase()}</div>
          </div>
        );
      })}
      {/* MoSPI badge (typographic, not the official emblem) */}
      <div style={{ position: "absolute", left: cx - 190, top: lerp(-420, cy - 190, drop), width: 380, height: 380, zIndex: 2,
        transform: `translateY(${-into * 400}px) scale(${lerp(1, 0.62, into)})` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #1A2A55, ${NAVY} 75%)`,
          border: `4px solid ${GOLD}`, boxShadow: glow(GOLD, 0.9) }} />
        <svg viewBox="0 0 380 380" style={{ position: "absolute", inset: 0, transform: `rotate(${t * 22}deg)` }}>
          <defs><path id="ring" d="M190,190 m-166,0 a166,166 0 1,1 332,0 a166,166 0 1,1 -332,0" /></defs>
          <text fill={`${GOLD_SOFT}`} style={{ fontFamily: font.mono, fontSize: 19, letterSpacing: "0.3em" }}>
            <textPath href="#ring">NATIONAL STATISTICS OFFICE · CONSUMER PRICE INDEX · </textPath>
          </text>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...display(76, 900), color: GOLD, textShadow: glow(GOLD, 0.5), letterSpacing: "-0.03em" }}>MoSPI</div>
          <div style={{ fontFamily: font.mono, fontSize: 17, color: DIM, marginTop: 8, letterSpacing: "0.16em" }}>CPI · BASE 2024</div>
        </div>
      </div>
      {/* text overlay: CPI = Ek Basket Ki Keemat */}
      <div style={{ position: "absolute", left: G, right: G, top: 1010, textAlign: "center", transform: `translateY(${-into * 430}px)`, zIndex: 4 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 26, alignItems: "baseline" }}>
          <Mask t={t} start={4.6}><span style={{ ...display(150), color: GOLD, textShadow: glow(GOLD, 0.6) }}>CPI</span></Mask>
          <Mask t={t} start={4.85}><span style={{ ...display(150, 600), color: INK }}>=</span></Mask>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 6 }}>
          {["Ek", "Basket", "Ki", "Keemat"].map((w, i) => (
            <Mask key={w} t={t} start={5.15 + i * 0.16}><span style={{ ...display(96, 800), color: w === "Basket" ? GOLD : INK }}>{w}</span></Mask>
          ))}
        </div>
      </div>
      {/* basket that collects the icons */}
      <div style={{ position: "absolute", left: 540 - 270, top: 1150, width: 540, height: 300, opacity: basketIn, transform: `translateY(${(1 - basketIn) * 80}px)`, zIndex: 2 }}>
        <svg viewBox="0 0 540 300" width={540} height={300}>
          <path d="M40 90 H500 L452 270 H88 Z" fill={`${GOLD}14`} stroke={GOLD} strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2, 3, 4].map((k) => <path key={k} d={`M${120 + k * 75} 100 L${130 + k * 70} 262`} stroke={`${GOLD}66`} strokeWidth={3} />)}
          <path d="M70 160 H470" stroke={`${GOLD}55`} strokeWidth={3} />
          <path d="M140 90 Q270 -40 400 90" fill="none" stroke={GOLD} strokeWidth={7} strokeLinecap="round" />
        </svg>
      </div>
      {/* price tag on the basket */}
      <div style={{ position: "absolute", left: 640, top: 1180, zIndex: 5, opacity: prog(t, 8.5, 0.35),
        transform: `rotate(${lerp(-24, -8, prog(t, 8.5, 0.6, ease.outBack))}deg)`, transformOrigin: "0% 50%" }}>
        <div style={{ padding: "14px 28px 14px 40px", background: RED, borderRadius: "8px 14px 14px 8px", clipPath: "polygon(18px 0, 100% 0, 100% 100%, 18px 100%, 0 50%)",
          boxShadow: glow(RED, 0.5) }}>
          <div style={{ fontFamily: font.mono, fontSize: 18, color: "#fff", letterSpacing: "0.12em" }}>SEP 2026</div>
          <div style={{ ...display(60, 900), color: "#fff" }}>+5.54%</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", fontFamily: font.mono, fontSize: 22, color: DIM,
        opacity: prog(t, 5.6, 0.5), letterSpacing: "0.06em" }}>
        SOURCE · MOSPI CPI RELEASE · 12 OCT 2026
      </div>
    </AbsoluteFill>
  );
};

export const ThaliBlueprint10: React.FC = () => {
  const t = useTime();
  const heat = clamp01((t - 1.45) / 0.6);
  return (
    <AbsoluteFill style={{ background: NAVY, overflow: "hidden" }}>
      <Backdrop t={t} heat={heat} />
      {t < 3.0 && <Hook t={t} />}
      {t >= 2.95 && <Mospi t={t} />}
      <div style={{ position: "absolute", left: G, top: 112, fontFamily: font.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.42em", color: INK, opacity: 0.85 }}>AVRON</div>
    </AbsoluteFill>
  );
};
