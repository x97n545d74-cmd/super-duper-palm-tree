import React from "react";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Counter, Label, SourceTag, SweepText, WordReveal } from "../../engine/components/Kinetic";
import { DataRoom } from "../../engine/components/DataRoom";
import { TowerScene } from "../../engine/three/Tower";
import { ANNUAL, at, B, CLOSES, PEAK, QUARTERS, S } from "./config";
import { fadeWin, Figure, Filing, Mark, PriceChart } from "./ui";

const G = layout.gutter;
const RED = "#FF5A55";
const deva: React.CSSProperties = { fontFamily: font.deva, fontWeight: 800, color: color.ink, letterSpacing: "-0.015em" };

/* ------------------------------------------------------------------ 1. HOOK */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const [, end] = S.hook;
  const p903 = at("b1_hook", "₹903,"), p5 = at("b1_drop", "पाँच"), p680 = at("b1_drop", "₹680।"), files = B("b1_files");
  const upto = t < p5 ? lerp(0, PEAK, prog(t, 0, p903 - 0.05, ease.outCubic)) : lerp(PEAK, CLOSES.length - 1, prog(t, p5, p680 - p5 + 0.1, ease.inOutCubic));
  const after = upto > PEAK;
  const sessions = Math.round(clamp01((upto - PEAK) / (CLOSES.length - 1 - PEAK)) * 5);
  const lift = prog(t, files, 0.7, ease.inOutCubic);
  const push = 1 + 0.04 * prog(t, 0, end, ease.linear);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <DataRoom t={t} tint={after ? color.crimson : color.gold} drift={0.4} opacity={0.7} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push}) translateY(${-lift * 150}px)`, transformOrigin: "50% 40%" }}>
        <div style={{ position: "absolute", left: G, top: 250, opacity: 1 - lift, transform: `translateY(${lift * 40}px)` }}>
          <Label text="VIVIANA POWER TECH · NSE · DAILY CLOSE" t={t} start={0.05} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, marginTop: 18 }}>
            <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 168, letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
              color: after ? RED : color.goldHot }}>
              ₹{CLOSES[Math.min(CLOSES.length - 1, Math.round(upto))][1].toFixed(2)}
            </span>
          </div>
          <div style={{ fontFamily: font.mono, fontSize: 28, color: after ? "#FF8A80" : color.inkDim, marginTop: 6, letterSpacing: "0.08em" }}>
            {CLOSES[Math.min(CLOSES.length - 1, Math.round(upto))][0].toUpperCase()} 2026
            {t >= p680 && <span style={{ marginLeft: 22, fontWeight: 700, color: RED, opacity: prog(t, p680, 0.3) }}>▼ 24.7% FROM ₹903.30</span>}
          </div>
        </div>
        <div style={{ position: "absolute", left: G, top: 560 }}>
          <PriceChart upto={upto} peak={PEAK} h={560} focus={t > p5 ? [PEAK, CLOSES.length - 1] : undefined} glow={Math.exp(-Math.max(0, t - p680) * 3)} />
        </div>
        {t > p5 && (
          <div style={{ position: "absolute", left: G, top: 1205, display: "flex", gap: 14, alignItems: "center" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: 64, height: 64, borderRadius: 12, display: "grid", placeItems: "center", fontFamily: font.mono, fontSize: 28, fontWeight: 700,
                border: `2px solid ${i < sessions ? RED : "rgba(243,241,236,0.18)"}`, color: i < sessions ? "#FFD2CF" : color.inkFaint,
                background: i < sessions ? "rgba(240,82,79,0.18)" : "transparent" }}>{i + 1}</div>
            ))}
            <span style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim, marginLeft: 10, letterSpacing: "0.06em" }}>SESSIONS · 20 OCT HOLIDAY</span>
          </div>
        )}
      </div>
      {/* three filings preview: they become the next scene */}
      {t > files - 0.1 && [
        { s: "10 OCT · 13:07", l: "ORDER · ₹466.74 CR" },
        { s: "10 OCT · 22:48", l: "BOARD MEETING NOTICE · WARRANTS" },
        { s: "15 OCT · 18:17", l: "OUTCOME · NOT TO PROCEED" },
      ].map((f, i) => {
        const at0 = at("b1_files", "तीन") - 0.25 + i * 0.22;
        const p = prog(t, at0, 0.55, ease.outExpo);
        return (
          <div key={i} style={{ position: "absolute", left: G, right: G, top: 880 + i * 128, height: 110, borderRadius: 10,
            background: "linear-gradient(175deg,#F2EFE7,#E2DED3)", boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", gap: 26, padding: "0 30px", opacity: p, transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * (i - 1) * 3}deg)` }}>
            <span style={{ fontFamily: font.mono, fontSize: 22, background: "#1B1C1F", color: "#F2EFE7", padding: "8px 12px", borderRadius: 4 }}>{f.s}</span>
            <span style={{ fontFamily: font.text, fontWeight: 700, fontSize: 30, color: "#1B1C1F", letterSpacing: "-0.01em" }}>{f.l}</span>
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------- 2. WEEKEND */
const Clock: React.FC<{ t: number; from: string; to: string; at0: number }> = ({ t, from, to, at0 }) => {
  const p = prog(t, at0, 0.9, ease.inOutCubic);
  return (
    <div style={{ display: "flex", fontFamily: font.mono, fontWeight: 700, fontSize: 150, letterSpacing: "-0.02em", color: color.ink, lineHeight: 1 }}>
      {from.split("").map((c, i) => {
        const same = c === to[i];
        const k = same ? 0 : clamp01(p * 1.6 - i * 0.12);
        return (
          <span key={i} style={{ display: "inline-block", height: 150, overflow: "hidden", width: c === ":" ? 60 : 92, textAlign: "center" }}>
            <span style={{ display: "block", transform: `translateY(${-k * 150}px)` }}>
              <span style={{ display: "block", height: 150 }}>{c}</span>
              <span style={{ display: "block", height: 150, color: color.goldHot }}>{to[i]}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Weekend: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.weekend;
  const night = B("b2_notice");
  const n = prog(t, night - 0.2, 1.0, ease.inOutCubic);
  const pA = prog(t, a, 0.6, ease.outExpo);
  const outA = prog(t, night - 0.1, 0.6, ease.inOutCubic);
  const pB = prog(t, night + 0.15, 0.7, ease.outExpo);
  const warrants = at("b2_notice", "warrants"), meeting = at("b2_notice", "board");
  const amount = at("b2_order", "₹467");
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${n > 0.5 ? "#05070D" : "#1B2533"} 0%, ${color.bg} 75%)` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #05060B 0%, #090C18 70%)", opacity: n }} />
      <DataRoom t={t} tint={n > 0.5 ? color.blue : color.steel} drift={0.3} opacity={0.55} />
      <div style={{ position: "absolute", left: G, top: 250 }}>
        <Label text={`10 OCT 2026 · SATURDAY`} t={t} start={a} tint={color.inkDim} />
        <div style={{ marginTop: 14 }}><Clock t={t} from="13:07" to="22:48" at0={night - 0.05} /></div>
        <div style={{ ...deva, fontSize: 40, color: color.inkDim, marginTop: 4 }}>{n < 0.5 ? "दोपहर" : "रात"}</div>
      </div>
      <div style={{ position: "absolute", left: G, top: 640, perspective: 1800 }}>
        <div style={{ transform: `translateX(${-outA * 160}px) translateZ(${-outA * 500}px) rotateY(${outA * 18}deg)`, opacity: pA * (1 - outA * 0.75),
          transformOrigin: "0% 50%" }}>
          <Filing t={t} tag="NSE · REG. 30 DISCLOSURE" stamp="10.10.2026 · 13:07" title="Intimation of receiving new turnkey contracts" dim={outA}>
            …awarded new turnkey contracts aggregating to{" "}
            <Mark t={t} start={amount - 0.2}>Rs.466,73,61,738.00</Mark>{" "}
            (inclusive of taxes) from existing client Madhya Gujarat Vij Company Limited (MGVCL).
          </Filing>
          <div style={{ position: "absolute", right: 10, bottom: -120, opacity: prog(t, amount, 0.3) * (1 - outA), transform: `scale(${lerp(1.4, 1, prog(t, amount, 0.35, ease.outExpo))}) rotate(-4deg)`,
            fontFamily: font.display, fontWeight: 800, fontSize: 84, color: color.goldHot, letterSpacing: "-0.04em", textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            ₹466.74 cr
          </div>
        </div>
      </div>
      {t > night && (
        <div style={{ position: "absolute", left: G, top: 700, opacity: pB, transform: `translateY(${(1 - pB) * 140}px)` }}>
          <Filing t={t} tag="NSE · REG. 29 PRIOR INTIMATION" stamp="10.10.2026 · 22:48" title="Prior Intimation of Notice of Board Meeting">
            …meeting of the Board on <b>Thursday, 15th October, 2026</b>, to consider and approve the issuance of{" "}
            <Mark t={t} start={warrants - 0.15} dur={0.7}>fully convertible warrants/equity shares on a preferential basis</Mark>{" "}
            to one or more persons/investors/promoters…
          </Filing>
          <div style={{ marginTop: 26, opacity: prog(t, meeting, 0.4) }}>
            <SourceTag text="BOARD MEETING · THU 15 OCT" t={t} start={meeting} />
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------- 3. U-TURN */
export const UTurn: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.uturn;
  const drop = at("b3_uturn", "छोड़"), fall = B("b3_fall"), pct = at("b3_fall", "12%");
  const pC = prog(t, a, 0.6, ease.outExpo);
  const up = prog(t, fall - 0.1, 0.7, ease.inOutCubic);
  const stamp = prog(t, drop - 0.05, 0.3, ease.outExpo);
  const line = prog(t, fall + 0.2, 1.0, ease.inOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.3) }}>
      <DataRoom t={t} tint={color.crimson} drift={0.5} opacity={0.6} />
      <div style={{ position: "absolute", left: G, top: 290 - up * 30, transform: `scale(${1 - up * 0.32})`, transformOrigin: "50% 0%", opacity: pC * (1 - up * 0.45) }}>
        <Label text="15 OCT 2026 · 18:17" t={t} start={a} tint={color.inkDim} />
        <div style={{ marginTop: 22, position: "relative" }}>
          <Filing t={t} tag="NSE · REG. 30 · OUTCOME OF BOARD MEETING" stamp="15.10.2026 · 18:17" title="Disclosure regarding proposed fund-raising">
            …the Board of Directors, after due consideration and detailed deliberations,{" "}
            <Mark t={t} start={drop - 0.3} dur={0.55} tint={RED} strike>unanimously decided not to proceed</Mark>{" "}
            with the proposed issuance of fully convertible warrants on a preferential basis.
          </Filing>
          <div style={{ position: "absolute", right: 40, bottom: -50, transform: `rotate(-8deg) scale(${lerp(1.8, 1, stamp)})`, opacity: stamp,
            border: `6px solid ${RED}`, color: RED, fontFamily: font.display, fontWeight: 900, fontSize: 58, letterSpacing: "0.06em", padding: "8px 24px", borderRadius: 8,
            background: "rgba(20,6,6,0.25)" }}>
            NOT TO PROCEED
          </div>
        </div>
      </div>
      {t > fall - 0.1 && (
        <div style={{ position: "absolute", left: G, right: G, top: 720, opacity: up }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Figure value="₹903.30" label="15 OCT CLOSE" tint={color.goldHot} size={92} />
            <Figure value="₹796.10" label="16 OCT CLOSE" tint={RED} size={92} p={prog(t, pct - 0.4, 0.4)} style={{ textAlign: "right" }} />
          </div>
          <svg width={912} height={300} style={{ marginTop: 20, overflow: "visible" }}>
            <path d={`M30,30 L${30 + 852 * line},${30 + 240 * line}`} stroke={RED} strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 16px rgba(255,80,70,0.8))" }} />
            <circle cx={30} cy={30} r={14} fill={color.goldHot} />
            {line > 0.98 && <circle cx={882} cy={270} r={14} fill={RED} />}
          </svg>
          <div style={{ position: "absolute", left: 0, top: 420, fontFamily: font.display, fontWeight: 900, fontSize: 150, letterSpacing: "-0.05em", color: RED,
            opacity: prog(t, pct, 0.25), transform: `scale(${lerp(1.25, 1, prog(t, pct, 0.4, ease.outExpo))})` }}>
            −11.9%
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------- 4. WHO */
export const Who: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.who;
  const subs = at("b4_who", "substations"), grow = B("b4_growth"), r531 = at("b4_growth", "₹531");
  const k = prog(t, a, b - a, ease.inOutCubic);
  const cam = { x: lerp(26, 52, k), y: lerp(4, 30, k), z: lerp(34, 78, k), tx: lerp(0, -6, k), ty: lerp(34, 24, k), tz: lerp(0, -40, k), fov: 52 };
  const energy = prog(t, subs - 0.2, 0.8);
  const panel = prog(t, grow - 0.15, 0.6, ease.outExpo);
  const maxV = 531;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.2, 0.3) }}>
      <TowerScene t={t} cam={cam} energy={energy} night={0.15 + panel * 0.35} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.65) 0%, transparent 32%, transparent 55%, rgba(6,7,10,0.85) 100%)" }} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <WordReveal text="Viviana Power Tech" t={t} start={a} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 104, letterSpacing: "-0.045em", color: color.ink }} />
        <Label text="VADODARA · GUJARAT · EST. 2014" t={t} start={at("b4_who", "Vadodara।") - 0.1} style={{ marginTop: 14 }} />
        <div style={{ display: "flex", gap: 14, marginTop: 26, flexWrap: "wrap" }}>
          <SourceTag text="EPC · SUBSTATIONS + LINES" t={t} start={subs - 0.1} />
          <SourceTag text="UP TO 400 kV" t={t} start={subs + 0.25} />
        </div>
      </div>
      {t > grow - 0.2 && (
        <div style={{ position: "absolute", left: G, right: G, top: 760, height: 560, borderRadius: 24, padding: "30px 36px",
          background: "linear-gradient(160deg, rgba(20,22,28,0.86), rgba(8,9,12,0.92))", border: "1.5px solid rgba(243,241,236,0.14)",
          opacity: panel, transform: `translateY(${(1 - panel) * 80}px)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: font.mono, fontSize: 24, color: color.inkDim, letterSpacing: "0.1em" }}>REVENUE · ₹ CR · CONSOLIDATED</span>
            <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 64, color: color.goldHot, opacity: prog(t, r531, 0.3) }}>16×</span>
          </div>
          <div style={{ position: "absolute", left: 36, right: 36, bottom: 70, height: 330, display: "flex", alignItems: "flex-end", gap: 34 }}>
            {ANNUAL.map(([fy, v], i) => {
              const p = prog(t, grow + 0.15 + i * 0.32, 0.7, ease.outExpo);
              const last = i === ANNUAL.length - 1;
              return (
                <div key={fy} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: last ? 54 : 36, color: last ? color.goldHot : color.ink, opacity: p, marginBottom: 10 }}>
                    {last ? <Counter to={531} t={t} start={r531 - 0.6} dur={0.7} /> : v}
                  </div>
                  <div style={{ width: "100%", height: Math.max(4, (v / maxV) * 250 * p), borderRadius: "8px 8px 2px 2px",
                    background: last ? `linear-gradient(180deg, ${color.goldHot}, ${color.gold})` : "rgba(243,241,236,0.28)",
                    boxShadow: last ? `0 0 40px rgba(240,208,138,${0.45 * p})` : "none" }} />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 36, right: 36, bottom: 24, display: "flex", gap: 34 }}>
            {ANNUAL.map(([fy]) => <div key={fy} style={{ flex: 1, textAlign: "center", fontFamily: font.mono, fontSize: 22, color: color.inkDim }}>{fy}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------- 5. CASH */
const Ring: React.FC<{ value: number; total: number; p: number }> = ({ value, total, p }) => {
  const ticks = 73; // one tick per 5 days
  const lit = Math.round((value / total) * ticks * p);
  return (
    <svg width={560} height={560} viewBox="-280 -280 560 560">
      {Array.from({ length: ticks }).map((_, i) => {
        const ang = (i / ticks) * Math.PI * 2 - Math.PI / 2;
        const on = i < lit;
        return <line key={i} x1={Math.cos(ang) * 220} y1={Math.sin(ang) * 220} x2={Math.cos(ang) * (on ? 262 : 250)} y2={Math.sin(ang) * (on ? 262 : 250)}
          stroke={on ? RED : "rgba(243,241,236,0.16)"} strokeWidth={on ? 7 : 5} strokeLinecap="round" />;
      })}
    </svg>
  );
};

export const Cash: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cash;
  const cfo = B("b5_cfo"), days = B("b5_days"), debt = B("b5_debt"), d267 = at("b5_days", "267"), dbl = at("b5_debt", "double,");
  const w1 = fadeWin(t, cfo - 0.2, days + 0.1, 0.35, 0.3);
  const w2 = fadeWin(t, days - 0.1, debt + 0.1, 0.35, 0.3);
  const w3 = fadeWin(t, debt - 0.1, b + 0.2, 0.35, 0.2);
  const years: [string, number, number][] = [["FY24", 7, -3], ["FY25", 21, -14], ["FY26", 53, -4]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.crimson} drift={0.6} opacity={0.7} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <WordReveal text="पर cash नहीं आया" t={t} start={a} accent={{ cash: RED }} style={{ ...deva, fontSize: 96 }} />
      </div>
      {/* profit vs operating cash flow */}
      <div style={{ position: "absolute", left: G, right: G, top: 470, height: 780, opacity: w1 }}>
        <div style={{ display: "flex", gap: 34, fontFamily: font.mono, fontSize: 24, letterSpacing: "0.08em" }}>
          <span style={{ color: color.goldHot }}>■ NET PROFIT</span><span style={{ color: RED }}>■ OPERATING CASH FLOW</span><span style={{ color: color.inkFaint }}>₹ CR</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, height: 2, background: "rgba(243,241,236,0.35)" }} />
        <div style={{ position: "absolute", left: 30, right: 30, top: 80, height: 620, display: "flex", gap: 60 }}>
          {years.map(([fy, np, cf], i) => {
            const p = prog(t, cfo + 0.1 + i * 0.3, 0.7, ease.outExpo);
            return (
              <div key={fy} style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, width: "46%", bottom: 260, height: np * 6 * p, background: `linear-gradient(180deg, ${color.goldHot}, ${color.gold})`, borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: 0, width: "46%", bottom: 270 + np * 6 * p, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 40, color: color.goldHot, opacity: p }}>{np}</div>
                <div style={{ position: "absolute", right: 0, width: "46%", top: 360, height: -cf * 8 * p, background: `linear-gradient(0deg, #7A1E22, ${RED})`, borderRadius: "0 0 6px 6px" }} />
                <div style={{ position: "absolute", right: 0, width: "46%", top: 372 + -cf * 8 * p, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 40, color: RED, opacity: p }}>{cf}</div>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", fontFamily: font.mono, fontSize: 26, color: color.inkDim }}>{fy}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, bottom: -10 }}><SourceTag text="SCREENER · CONSOLIDATED · FY24–FY26" t={t} start={cfo + 0.6} style={{ fontSize: 20 }} /></div>
      </div>
      {/* 267 debtor days */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 780, opacity: w2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: 560, height: 560 }}>
          <Ring value={267} total={365} p={prog(t, days, d267 - days + 0.4, ease.inOutCubic)} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 190, letterSpacing: "-0.05em", color: color.ink, lineHeight: 1 }}>
              <Counter to={267} t={t} start={days} dur={d267 - days + 0.4} />
            </div>
            <div style={{ ...deva, fontSize: 48, color: "#FF8A80" }}>दिन</div>
          </div>
        </div>
        <Label text="DEBTOR DAYS · FY26" t={t} start={days + 0.2} style={{ marginTop: 10 }} />
        <div style={{ fontFamily: font.mono, fontSize: 28, color: color.inkDim, marginTop: 14, opacity: prog(t, d267 + 0.3, 0.4) }}>FY24 153 → FY25 207 → FY26 <span style={{ color: RED }}>267</span></div>
      </div>
      {/* borrowings double */}
      <div style={{ position: "absolute", left: G, right: G, top: 470, height: 780, opacity: w3 }}>
        <Label text="BORROWINGS · ₹ CR" t={t} start={debt} />
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 140, height: 560, display: "flex", alignItems: "flex-end", gap: 90 }}>
          {[["FY25", 51], ["FY26", 100]].map(([fy, v], i) => {
            const p = prog(t, debt + 0.2 + i * 0.5, 0.8, ease.outExpo);
            return (
              <div key={fy as string} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: i ? 110 : 80, color: i ? RED : color.ink, opacity: p, letterSpacing: "-0.04em" }}>₹{v}</div>
                <div style={{ width: "100%", height: (v as number) * 4.4 * p, borderRadius: "10px 10px 2px 2px", background: i ? `linear-gradient(180deg, ${RED}, #6E1A1E)` : "rgba(243,241,236,0.3)",
                  display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 900, fontSize: 130, color: "#fff", letterSpacing: "-0.04em" }}>
                  {i ? <span style={{ opacity: prog(t, dbl, 0.3), transform: `scale(${lerp(1.3, 1, prog(t, dbl, 0.4, ease.outExpo))})` }}>2×</span> : null}
                </div>
                <div style={{ fontFamily: font.mono, fontSize: 26, color: color.inkDim, marginTop: 14 }}>{fy}</div>
              </div>
            );
          })}
        </div>

        <div style={{ position: "absolute", left: 0, bottom: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <SourceTag text="SCREENER · CONSOLIDATED" t={t} start={debt + 0.6} style={{ fontSize: 20 }} />
          <SourceTag text="NCD ₹20 CR @ 12% · MAY 2026" t={t} start={debt + 1.0} style={{ fontSize: 20 }} />
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- 6. ORDER */
export const Order: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.order;
  const said = at("b6_order", "मुताबिक़"), ref = at("b6_order", "पहले");
  const p = prog(t, a, 0.6, ease.outExpo);
  const zoom = lerp(1, 1.12, prog(t, said - 0.3, 1.4, ease.inOutCubic));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.3) }}>
      <DataRoom t={t} tint={color.gold} drift={0.3} opacity={0.5} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <WordReveal text="वो ₹467 crore का order?" t={t} start={a} accent={{ "₹467": color.goldHot }} style={{ ...deva, fontSize: 80 }} />
      </div>
      <div style={{ position: "absolute", left: G, top: 520, opacity: p, transform: `translateY(${(1 - p) * 100}px) scale(${zoom})`, transformOrigin: "50% 70%" }}>
        <Filing t={t} tag="NSE · REG. 30 DISCLOSURE · SAME FILING" stamp="10.10.2026 · 13:07" title="Intimation of receiving new turnkey contracts">
          …scope of work covers the conversion of HT O/H 11 kV open line to MVCC overhead conductor and underground networking…{" "}
          <Mark t={t} start={ref - 0.5} dur={1.6}>
            The aforesaid order value has already been considered and disclosed in the Company's Investor Presentation and intimation regarding its L1 position.
          </Mark>
        </Filing>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- 7. MGMT */
const Quote: React.FC<{ text: string; who: string; role: string; p: number }> = ({ text, who, role, p }) => (
  <div style={{ borderRadius: 22, padding: "34px 40px", background: "linear-gradient(160deg, rgba(28,32,40,0.9), rgba(10,11,14,0.92))",
    border: "1.5px solid rgba(157,178,201,0.3)", opacity: p, transform: `translateY(${(1 - p) * 60}px)` }}>
    <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 48, lineHeight: 1.2, letterSpacing: "-0.02em", color: color.ink }}>“{text}”</div>
    <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 22 }}>
      <span style={{ width: 34, height: 3, background: color.steel }} />
      <span style={{ fontFamily: font.text, fontWeight: 700, fontSize: 28, color: color.steel }}>{who}</span>
      <span style={{ fontFamily: font.text, fontSize: 26, color: color.inkFaint }}>{role}</span>
    </div>
  </div>
);

export const Mgmt: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.mgmt;
  const q1 = at("b7_mgmt", "client") - 0.4, q2 = at("b7_mgmt", "July") - 0.3;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.3) }}>
      <DataRoom t={t} tint={color.steel} drift={0.3} opacity={0.5} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <Label text="Q1 FY27 CALL · 6 AUG 2026" t={t} start={a} />
        <div style={{ ...deva, fontSize: 66, marginTop: 18, opacity: prog(t, a + 0.1, 0.4) }}>Company का पक्ष</div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 520, display: "flex", flexDirection: "column", gap: 34 }}>
        <Quote text="…no delayed payments from our clients, not a single client." who="Richi Choksi" role="Whole-time Director" p={prog(t, q1, 0.6, ease.outExpo)} />
        <Quote text="…more than INR40 plus crores are received in the month of July…" who="Dipesh Patel" role="CFO" p={prog(t, q2, 0.6, ease.outExpo)} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------- 8. WATCH */
export const Watch: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.watch;
  const march = at("b8_q", "March");
  const maxV = 322.75;
  const pulse = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.3) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 250, display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ width: 210, borderRadius: 18, overflow: "hidden", border: "1.5px solid rgba(243,241,236,0.2)", opacity: prog(t, a, 0.4),
          transform: `scale(${lerp(0.85, 1, prog(t, a, 0.5, ease.outExpo))})` }}>
          <div style={{ background: RED, color: "#fff", fontFamily: font.mono, fontWeight: 700, fontSize: 30, textAlign: "center", padding: "8px 0", letterSpacing: "0.12em" }}>NOV</div>
          <div style={{ background: "#F2EFE7", color: "#1B1C1F", fontFamily: font.display, fontWeight: 800, fontSize: 120, textAlign: "center", lineHeight: 1.15 }}>14</div>
        </div>
        <div>
          <div style={{ ...deva, fontSize: 58 }}>Q2 FY27 के नतीजे</div>
          <div style={{ fontFamily: font.mono, fontSize: 24, color: color.inkDim, marginTop: 10, letterSpacing: "0.06em", opacity: prog(t, a + 0.6, 0.4) }}>DUE WITHIN 45 DAYS · SEBI LODR REG. 33</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 600, height: 700 }}>
        <Label text="QUARTERLY REVENUE · ₹ CR" t={t} start={a + 0.5} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, height: 560, display: "flex", alignItems: "flex-end", gap: 22 }}>
          {[...QUARTERS, ["Sep-26", 0] as [string, number]].map(([qq, v], i) => {
            const p = prog(t, a + 0.7 + i * 0.16, 0.7, ease.outExpo);
            const ghost = v === 0;
            const isMar = qq === "Mar-26";
            const hot = isMar ? prog(t, march - 0.1, 0.4) : 0;
            return (
              <div key={qq} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: isMar ? 46 : 34, color: ghost ? color.goldHot : isMar ? lerpColor(hot) : color.ink, opacity: p, marginBottom: 10 }}>
                  {ghost ? "?" : Math.round(v)}
                </div>
                <div style={{ width: "100%", height: ghost ? 160 * p : Math.max(6, (v / maxV) * 430 * p), borderRadius: "8px 8px 2px 2px",
                  background: ghost ? "transparent" : isMar ? `linear-gradient(180deg, ${color.goldHot}, ${color.gold})` : "rgba(243,241,236,0.28)",
                  border: ghost ? `3px dashed rgba(240,208,138,${0.4 + 0.5 * pulse})` : "none",
                  boxShadow: isMar ? `0 0 ${20 + hot * 50}px rgba(240,208,138,${0.2 + hot * 0.5})` : "none" }} />
                <div style={{ fontFamily: font.mono, fontSize: 21, color: ghost ? color.goldHot : color.inkDim, marginTop: 12 }}>{qq.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, bottom: -40, display: "flex", gap: 12 }}>
          <SourceTag text="SCREENER · CONSOLIDATED" t={t} start={a + 1.4} style={{ fontSize: 20 }} />
          <SourceTag text="MAR-26 = 61% OF FY26" t={t} start={march} style={{ fontSize: 20 }} />
        </div>
      </div>
    </div>
  );
};
const lerpColor = (k: number) => (k > 0.5 ? color.goldHot : color.ink);

/* -------------------------------------------------------------- 9. END */
export const End: React.FC<{ t: number; duration: number }> = ({ t, duration }) => {
  const [a] = S.end;
  const p = prog(t, a - 0.1, 0.6, ease.outExpo);
  const out = prog(t, duration - 0.45, 0.45, ease.inCubic);
  return (
    <div style={{ position: "absolute", inset: 0, background: color.bg, opacity: p * (1 - out) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
        <SweepText text="AVRON" t={t} start={a + 0.15} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 168, letterSpacing: "0.3em", color: color.ink, paddingLeft: "0.3em" }} />
        <div style={{ fontFamily: font.text, fontSize: 32, color: color.inkDim, letterSpacing: "0.22em", marginTop: 16, opacity: prog(t, a + 0.4, 0.5) }}>THE BUSINESS BEHIND THE STOCK</div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1020, fontFamily: font.mono, fontSize: 21, lineHeight: 1.6, color: color.inkFaint, opacity: prog(t, a + 0.6, 0.5) }}>
        Sources: NSE filings 10 Oct & 15 Oct 2026 · Q1 FY27 call (6 Aug 2026) · Screener (consolidated) · NSE daily closes.<br />
        Education only. Not investment advice. Not a recommendation to buy, sell or hold. AVRON is not SEBI-registered.
      </div>
    </div>
  );
};
