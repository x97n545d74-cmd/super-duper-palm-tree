import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, ease, lerp, prog, useTime } from "../../engine/anim";
import { Captions, CaptionWord, chunkWords } from "../../engine/components/Captions";
import { SerifFont, serif } from "../swiggy/look";
import TL from "../../../projects/2026-10-footballer-stocks/timeline.json";

/*
 * "Agar footballers stocks hote" (Hinglish, ~41 s, graphics only, Tia VO). Old gen → mid gen → new gen, each on its own
 * background from the user's references: red/cream retro sunburst (hook + old gen), green tunnel (mid gen, reads as a pitch),
 * yellow comic burst (new gen), and the motion board's hexagons + bead ring (stock cards, CTA). Players appear as jersey cards
 * (team colours, number, name; no crests, no photos). Prompts: Motion Graphic One + Two. Facts: projects/2026-10-footballer-stocks/SCRIPT.md.
 */

type W = { w: string; s: number; e: number; tone?: string | null };
type Beat = { id: string; start: number; end: number; words: W[] };
const BEATS = (TL as { beats: Beat[] }).beats;
export const FOOTY_DURATION = (TL as { duration: number }).duration + 2.5;
const B = (id: string) => BEATS.find((b) => b.id === id)!;
const at = (id: string, p: string, nth = 0) => {
  const hit = B(id).words.filter((w) => w.w.toLowerCase().startsWith(p.toLowerCase()))[nth];
  return hit ? hit.s : B(id).start;
};

const INK = "#F6F2E8";
const INK_D = "#17181F";
const RED = "#9E2B2F";
const CREAM = "#E8DCC0";
const GREEN = "#3DDC84";
const YELLOW = "#F7DD6A";
const ORANGE = "#F08A2B";
const NAVY = "#141738";
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const sx = (size: number, weight = 900, c = INK): React.CSSProperties => ({ fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1, color: c });
const sf = (size: number, c = INK, italic = true): React.CSSProperties => ({ fontFamily: serif, fontWeight: 700, fontStyle: italic ? "italic" : "normal", fontSize: size, lineHeight: 1.05, color: c });
const lbl = (c = INK, size = 20): React.CSSProperties => ({ fontFamily: mono, fontWeight: 600, fontSize: size, letterSpacing: "0.14em", color: c });
const push = (t: number, a: number, from = 1.08): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.45));
  return { transform: `scale(${lerp(from, 1, p)})`, opacity: clamp01((t - a) / 0.05) };
};
const pop = (t: number, a: number, d = 0.45) => ease.outBack(clamp01((t - a) / d));

/* ------------------------------------------------------------ backgrounds (user references) */
const Sunburst: React.FC<{ t: number; a?: string; b?: string }> = ({ t, a = RED, b = CREAM }) => {
  const N = 28;
  return (
    <AbsoluteFill style={{ background: b, overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${t * 8} 540 960)`}>
          {Array.from({ length: N }).map((_, i) => {
            const a0 = (i / N) * Math.PI * 2, a1 = ((i + 0.5) / N) * Math.PI * 2, R = 2400;
            return <path key={i} d={`M540 960 L${540 + Math.cos(a0) * R} ${960 + Math.sin(a0) * R} L${540 + Math.cos(a1) * R} ${960 + Math.sin(a1) * R} Z`} fill={a} />;
          })}
        </g>
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 50%, transparent 40%, rgba(0,0,0,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};
const Tunnel: React.FC<{ t: number }> = ({ t }) => {
  const h = 1920, mid = 960, gap = 620, N = 16;
  const rows = Array.from({ length: N }).map((_, i) => Math.max(0.35, N - ((i + t * 0.9) % N)));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #0E5A49, #0F6A56 50%, #0E5A49)" }}>
      <svg width={1080} height={h} style={{ position: "absolute", inset: 0 }}>
        {[1, -1].map((s) => {
          const y0 = mid + (s * gap) / 2, y1 = s > 0 ? h : 0;
          return (
            <g key={s}>
              {Array.from({ length: 21 }).map((_, k) => { const x = (k - 10) * 240; return <line key={k} x1={540 + x * 0.12} y1={y0} x2={540 + x * 1.6} y2={y1} stroke="#D9F27E" strokeOpacity={0.55} strokeWidth={2} />; })}
              {rows.map((d, k) => { const y = y0 + (s * 900) / d; return (s > 0 ? y > h : y < 0) ? null : <line key={k} x1={0} x2={1080} y1={y} y2={y} stroke="#D9F27E" strokeOpacity={clamp01(1.4 - d / N) * 0.75} strokeWidth={2} />; })}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
const Comic: React.FC<{ t: number }> = ({ t }) => {
  const spikes = Array.from({ length: 24 }).map((_, i) => {
    const th = (i / 24) * Math.PI * 2, w = 0.04 + (i % 3) * 0.02;
    const p = (r: number, d: number) => `${540 + Math.cos(th + d) * r},${960 + Math.sin(th + d) * r}`;
    return `M ${p(620, 0)} L ${p(1700, -w)} L ${p(1700, w)} Z`;
  });
  return (
    <AbsoluteFill style={{ background: YELLOW, backgroundImage: "radial-gradient(rgba(240,138,43,0.35) 3px, transparent 3.5px)", backgroundSize: "26px 26px" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${t * 3} 540 960)`}>{spikes.map((d, i) => <path key={i} d={d} fill={ORANGE} opacity={0.85} />)}</g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ jersey card (back of shirt: name + number) */
type Kit = { base: string; stripe?: string; trim: string; num: string; name: string; no: string };
const KITS: Record<string, Kit> = {
  pele: { base: "#F2C200", trim: "#1E8B3A", num: "#1E8B3A", name: "PELÉ", no: "10" },
  messi: { base: "#FFFFFF", stripe: "#75B6E6", trim: "#1F2F5C", num: "#1F2F5C", name: "MESSI", no: "10" },
  ronaldo: { base: "#C8102E", trim: "#0F6B3A", num: "#FFFFFF", name: "RONALDO", no: "7" },
  mbappe: { base: "#1F2F6B", trim: "#FFFFFF", num: "#FFFFFF", name: "MBAPPÉ", no: "10" },
  yamal: { base: "#C8102E", trim: "#F2C200", num: "#F2C200", name: "LAMINE YAMAL", no: "19" },
};
const SHIRT = "M150 20 Q250 60 350 20 L480 90 L430 210 L380 185 L380 520 L120 520 L120 185 L70 210 L20 90 Z";
const Jersey: React.FC<{ k: Kit; size?: number; tilt?: number }> = ({ k, size = 520, tilt = 0 }) => {
  const id = k.name.replace(/\W/g, "");
  return (
    <svg width={size} height={size * 1.08} viewBox="0 0 500 540" style={{ transform: `rotate(${tilt}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.35))" }}>
      <defs><clipPath id={`c${id}`}><path d={SHIRT} /></clipPath></defs>
      <g clipPath={`url(#c${id})`}>
        <rect width={500} height={540} fill={k.base} />
        {k.stripe && [0, 1, 2, 3, 4].map((i) => <rect key={i} x={40 + i * 100} y={0} width={50} height={540} fill={k.stripe} />)}
      </g>
      <path d="M150 20 Q250 60 350 20" fill="none" stroke={k.trim} strokeWidth={14} />
      <path d={SHIRT} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={4} />
      <text x={250} y={175} textAnchor="middle" fontFamily={sans} fontWeight={900} fontSize={k.name.length > 8 ? 34 : 46} letterSpacing="3" fill={k.num}>{k.name}</text>
      <text x={250} y={430} textAnchor="middle" fontFamily={sans} fontWeight={900} fontSize={230} letterSpacing="-8" fill={k.num}>{k.no}</text>
    </svg>
  );
};

/* ------------------------------------------------------------ stock hexagon (motion-board reference) */
const hex = (cx: number, cy: number, r: number) => Array.from({ length: 6 }).map((_, i) => { const a = (Math.PI / 3) * i; return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`; }).join(" ");
const StockHex: React.FC<{ t: number; a: number; ticker: string; sub?: string; fill: string; tc?: string; size?: number }> = ({ t, a, ticker, sub, fill, tc = INK, size = 400 }) => {
  const p = pop(t, a, 0.5);
  return (
    <div style={{ position: "relative", width: size, height: size * 0.9, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, opacity: clamp01((t - a) / 0.1) }}>
      <svg width={size} height={size * 0.9} viewBox="0 0 400 360" style={{ position: "absolute", inset: 0 }}>
        <polygon points={hex(200, 180, 178)} fill={INK_D} />
        <polygon points={hex(200, 180, 150)} fill={fill} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", textAlign: "center" }}>
        <div style={sx(ticker.length > 6 ? size * 0.13 : size * 0.18, 900, tc)}>{ticker}</div>
        {sub && <div style={{ ...lbl(tc, size * 0.045), marginTop: 10 }}>{sub}</div>}
      </div>
    </div>
  );
};
const Arrow: React.FC<{ t: number; a: number; c?: string }> = ({ t, a, c = INK_D }) => {
  const p = prog(t, a, 0.35, ease.outExpo);
  return <div style={{ ...sx(110, 900, c), opacity: p, transform: `translateY(${(1 - p) * -30}px)` }}>↓</div>;
};
const Chip: React.FC<{ t: number; a: number; text: string; bg?: string; c?: string; rot?: number }> = ({ t, a, text, bg = INK_D, c = INK, rot = 0 }) => {
  const p = pop(t, a, 0.4);
  return <span style={{ display: "inline-block", padding: "12px 22px", borderRadius: 14, background: bg, ...lbl(c, 26), transform: `scale(${p}) rotate(${rot}deg)`, opacity: clamp01((t - a) / 0.08) }}>{text}</span>;
};
const GenTag: React.FC<{ t: number; a: number; text: string; bg: string; c?: string }> = ({ t, a, text, bg, c = INK }) => {
  const p = prog(t, a, 0.4, ease.outExpo);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", opacity: p, transform: `translateY(${(1 - p) * -40}px)` }}>
      <span style={{ display: "inline-block", padding: "12px 30px", borderRadius: 999, background: bg, ...sx(56, 900, c), letterSpacing: "0.02em" }}>{text}</span>
    </div>
  );
};

/* ================================================================== beats */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("hook");
  const ron = at("hook", "Ronaldo") - 0.1;
  const cards = [{ k: KITS.pele, g: "OLD GEN", bg: RED }, { k: KITS.messi, g: "MID GEN", bg: "#0F6A56" }, { k: KITS.yamal, g: "NEW GEN", bg: ORANGE }];
  const q = pop(t, ron, 0.45);
  return (
    <AbsoluteFill>
      <Sunburst t={t} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <div style={sf(76, INK_D)}>Agar footballers</div>
        <div style={{ ...sx(120, 900, INK_D), marginTop: 6 }}>STOCKS HOTE…</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 20 }}>
        {cards.map((c, i) => {
          const p = t < 0.04 ? 1 : pop(t, start + 0.15 + i * 0.12, 0.4);
          return (
            <div key={c.g} style={{ width: 310, padding: "18px 0 24px", borderRadius: 26, background: c.bg, textAlign: "center", transform: `translateY(${(1 - p) * 300}px) rotate(${(i - 1) * 4}deg)`, opacity: clamp01(p * 3), boxShadow: "0 20px 40px rgba(0,0,0,0.35)" }}>
              <div style={lbl(INK, 22)}>{c.g}</div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}><Jersey k={c.k} size={250} /></div>
              <div style={{ margin: "10px 26px 0", padding: "10px 0", borderRadius: 10, background: "rgba(0,0,0,0.35)", ...sx(40, 900), filter: "blur(9px)" }}>TICKER</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", transform: `scale(${q})`, opacity: clamp01((t - ron) / 0.1) }}>
        <span style={{ display: "inline-block", padding: "16px 34px", borderRadius: 20, background: INK_D, ...sx(80, 900) }}>RONALDO = <span style={{ color: GREEN }}>?</span></span>
      </div>
    </AbsoluteFill>
  );
};

const Old: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("old");
  return (
    <AbsoluteFill style={push(t, start)}>
      <Sunburst t={t} />
      <GenTag t={t} a={start} text="OLD GEN" bg={RED} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ transform: `scale(${pop(t, at("old", "Pelé") - 0.15)})` }}><Jersey k={KITS.pele} size={360} tilt={-4} /></div>
        <Arrow t={t} a={at("old", "matlab")} c={INK_D} />
        <StockHex t={t} a={at("old", "HUL") - 0.1} ticker="HUL" sub="HINDUSTAN UNILEVER" fill={RED} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 560 }}><Chip t={t} a={at("old", "90") - 0.1} text="SINCE 1933" bg={INK_D} rot={-6} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center" }}><Chip t={t} a={at("old", "har") - 0.1} text="HAR GHAR KA NAAM" bg={CREAM} c={INK_D} rot={3} /></div>
    </AbsoluteFill>
  );
};

const Messi: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("messi");
  const ipo = prog(t, at("messi", "2004") - 0.1, 0.45, ease.outExpo);
  return (
    <AbsoluteFill style={push(t, start)}>
      <Tunnel t={t} />
      <GenTag t={t} a={start} text="MID GEN" bg="#0A3F33" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ transform: `scale(${pop(t, at("messi", "Messi") - 0.15)})` }}><Jersey k={KITS.messi} size={360} tilt={3} /></div>
        <Arrow t={t} a={at("messi", "matlab")} c={INK} />
        <StockHex t={t} a={at("messi", "TCS") - 0.1} ticker="TCS" sub="TATA CONSULTANCY" fill="#2F6FB0" />
      </div>
      <div style={{ position: "absolute", left: 24, top: 770 }}><Chip t={t} a={at("messi", "Shor") - 0.1} text="SHOR KAM · KAAM ZYADA" bg={INK} c={INK_D} rot={-4} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1280, textAlign: "center", opacity: ipo, transform: `translateY(${(1 - ipo) * 30}px)` }}>
        <span style={{ display: "inline-block", padding: "14px 26px", borderRadius: 16, background: INK_D, ...sx(50, 900) }}>IPO <span style={{ color: GREEN }}>₹850</span> · 2004</span>
      </div>
    </AbsoluteFill>
  );
};

const Ronaldo: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("ronaldo");
  const steps = [{ w: "Textile", tx: "TEXTILE" }, { w: "petro", tx: "PETROCHEM" }, { w: "Jio", tx: "JIO · 2016" }];
  const big = pop(t, at("ronaldo", "Ronaldo") - 0.1, 0.5);
  return (
    <AbsoluteFill style={push(t, start)}>
      <Tunnel t={t} />
      <GenTag t={t} a={start} text="MID GEN" bg="#0A3F33" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ transform: `scale(${big})` }}><Jersey k={KITS.ronaldo} size={350} tilt={-3} /></div>
        <Arrow t={t} a={at("ronaldo", "Reliance") - 0.25} c={INK} />
        <StockHex t={t} a={at("ronaldo", "Reliance") - 0.1} ticker="RELIANCE" sub="RELIANCE INDUSTRIES" fill="#1F4EA0" />
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1290, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s.tx}>
            {i > 0 && <span style={{ ...sx(40, 900), opacity: prog(t, at("ronaldo", s.w) - 0.1, 0.2) }}>→</span>}
            <Chip t={t} a={at("ronaldo", s.w) - 0.1} text={s.tx} bg={i === 2 ? GREEN : INK} c={INK_D} />
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Mbappe: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("mbappe");
  const l = at("mbappe", "Listing") - 0.1, low = at("mbappe", "₹41") - 0.1;
  const drop = prog(t, low - 0.2, 0.6, ease.inOutCubic);
  const X0 = 150, X1 = 930, Y0 = 1110, Y1 = 1290;
  return (
    <AbsoluteFill style={push(t, start)}>
      <Comic t={t} />
      <GenTag t={t} a={start} text="NEW GEN" bg={INK_D} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 340, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
        <div style={{ transform: `scale(${pop(t, at("mbappe", "Mbappé") - 0.15)})` }}><Jersey k={KITS.mbappe} size={380} tilt={-4} /></div>
        <StockHex t={t} a={at("mbappe", "Eternal") - 0.1} ticker="ETERNAL" sub="ZOMATO" fill="#E23744" size={380} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(t, l, 0.3) }}>
        <rect x={110} y={1030} width={860} height={330} rx={26} fill="rgba(23,24,31,0.92)" />
        <line x1={X0} y1={Y0} x2={lerp(X0, X1, drop)} y2={lerp(Y0, Y1, drop)} stroke="#FF5A5F" strokeWidth={8} strokeLinecap="round" />
        <circle cx={X0} cy={Y0} r={12} fill={GREEN} />
        <text x={X0} y={Y0 - 26} fontFamily={sans} fontWeight={900} fontSize={52} fill={INK}>₹116</text>
        <text x={X0} y={Y0 + 50} fontFamily={mono} fontSize={20} fill="rgba(246,242,232,0.6)">LISTING · JUL 2021</text>
        <circle cx={X1} cy={Y1} r={12 * drop} fill="#FF5A5F" />
        <text x={X1} y={Y1 - 30} textAnchor="end" fontFamily={sans} fontWeight={900} fontSize={52} fill="#FF5A5F" opacity={drop}>₹41</text>
        <text x={X1} y={Y1 + 44} textAnchor="end" fontFamily={mono} fontSize={20} fill="rgba(246,242,232,0.6)" opacity={drop}>LOW · JUL 2022</text>
      </svg>
      <div style={{ position: "absolute", right: 70, top: 1390 }}><Chip t={t} a={at("mbappe", "Speed") - 0.1} text="SPEED BHI · JHATKE BHI" bg={INK_D} rot={-4} /></div>
    </AbsoluteFill>
  );
};

const Yamal: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("yamal");
  return (
    <AbsoluteFill style={push(t, start)}>
      <Comic t={t} />
      <GenTag t={t} a={start} text="NEW GEN" bg={INK_D} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ transform: `scale(${pop(t, at("yamal", "Lamine") - 0.15)})` }}><Jersey k={KITS.yamal} size={350} tilt={4} /></div>
        <Arrow t={t} a={at("yamal", "Swiggy") - 0.25} />
        <StockHex t={t} a={at("yamal", "Swiggy") - 0.1} ticker="SWIGGY" sub="LISTED 13 NOV 2024" fill={ORANGE} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center" }}><Chip t={t} a={at("yamal", "Career") - 0.1} text="CAREER ABHI SHURU" bg={INK_D} rot={-5} /></div>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("cta");
  const pill = pop(t, at("cta", "Comment") - 0.1, 0.4);
  const cols = ["#F2B83B", "#D23A73", "#72D6C9", "#3B3A8F"];
  const cards = [{ g: "OLD", s: "HUL", bg: RED }, { g: "MID", s: "TCS · RELIANCE", bg: "#0F6A56" }, { g: "NEW", s: "ETERNAL · SWIGGY", bg: ORANGE }];
  return (
    <AbsoluteFill style={{ ...push(t, start), background: `radial-gradient(80% 55% at 50% 50%, #1F2058, ${NAVY} 75%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 30 }).map((_, k) => {
          const p = prog(t, start + k * 0.02, 0.5, ease.outExpo);
          const th = (k / 30) * Math.PI * 2 + t * 0.3, r = lerp(900, 470, p);
          return <circle key={k} cx={540 + Math.cos(th) * r} cy={900 + Math.sin(th) * r} r={k % 3 === 0 ? 26 : 17} fill={cols[k % 4]} opacity={p} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center" }}>
        <div style={sf(70)}>Tumhara portfolio</div>
        <div style={{ ...sx(92, 900), marginTop: 6 }}>KIS GEN KA?</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 18 }}>
        {cards.map((c, i) => {
          const p = pop(t, start + 0.3 + i * 0.15, 0.4);
          return (
            <div key={c.g} style={{ width: 270, padding: "22px 10px", borderRadius: 20, background: c.bg, textAlign: "center", transform: `scale(${p})` }}>
              <div style={sx(56, 900)}>{c.g}</div>
              <div style={{ ...lbl(INK, 18), marginTop: 10 }}>{c.s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", transform: `scale(${pill})`, opacity: clamp01((t - at("cta", "Comment") + 0.1) / 0.1) }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: INK }}>
          <svg width={30} height={30} viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke={INK_D} strokeWidth={2.2} strokeLinejoin="round" /></svg>
          <span style={sx(40, 900, INK_D)}>Comment karo</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

const End: React.FC<{ t: number; a: number }> = ({ t, a }) => (
  <AbsoluteFill style={{ background: "#07090D", opacity: prog(t, a, 0.25) }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", ...sx(120, 800), letterSpacing: "0.32em", paddingLeft: "0.32em",
      clipPath: `inset(0 ${100 - 100 * prog(t, a + 0.1, 0.7, ease.outExpo)}% 0 0)` }}>AVRON</div>
    <div style={{ position: "absolute", left: 84, right: 84, top: 900, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, opacity: prog(t, a + 0.4, 0.4) }}>
      <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>Player ↔ stock match is our opinion</div>
      <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>Not investment advice · AVRON is not SEBI-registered</div>
      <div style={{ fontFamily: mono, fontSize: 17, color: "rgba(246,242,232,0.6)", marginTop: 14, lineHeight: 1.55 }}>
        Sources · HUL company history · TCS IPO (Business Standard) · Reliance history · Zomato listing (Business Standard), 2022 low (TechCrunch) · Swiggy listing (Angel One)
      </div>
    </div>
    <AbsoluteFill style={{ background: "#000", opacity: prog(t, FOOTY_DURATION - 0.5, 0.5, ease.inCubic) }} />
  </AbsoluteFill>
);

const WORDS: CaptionWord[] = BEATS.flatMap((b) => b.words.map((w) => ({ w: w.w.replace(/[.]+$/, ""), s: w.s, e: w.e, tone: w.tone ?? null })));
const CAPS = chunkWords(WORDS, 3);
const END_A = (TL as { duration: number }).duration;
const beatAt = (t: number) => BEATS.find((b) => t >= b.start && t < b.end + 0.04);

const Graphics: React.FC = () => {
  const t = useTime();
  const id = beatAt(t)?.id;
  return (
    <AbsoluteFill style={{ background: CREAM }}>
      {id === "hook" && <Hook t={t} />}
      {id === "old" && <Old t={t} />}
      {id === "messi" && <Messi t={t} />}
      {id === "ronaldo" && <Ronaldo t={t} />}
      {id === "mbappe" && <Mbappe t={t} />}
      {id === "yamal" && <Yamal t={t} />}
      {id === "cta" && <Cta t={t} />}
    </AbsoluteFill>
  );
};

export const FootyReel: React.FC = () => {
  const t = useTime();
  const ended = t >= END_A;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <SerifFont />
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <Graphics />
      </CameraMotionBlur>
      {!ended && CAPS.some((c) => t >= c.s - 0.05 && t < c.e) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1460, height: 160 }}>
          <div style={{ position: "absolute", inset: "10px 60px", borderRadius: 24, background: "rgba(23,24,31,0.72)" }} />
          <Captions t={t} chunks={CAPS} family={sans} size={54} y={40} />
        </div>
      )}
      {!ended && <div style={{ position: "absolute", left: 70, top: 110, padding: "8px 14px", borderRadius: 999, background: "rgba(7,9,13,0.72)", ...sx(26, 800), letterSpacing: "0.42em" }}>AVRON</div>}
      {ended && <End t={t} a={END_A} />}
      <Audio src={staticFile("footy/mix.wav")} />
    </AbsoluteFill>
  );
};
