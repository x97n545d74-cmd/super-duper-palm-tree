import React from "react";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Counter, Label, SourceTag, SweepText, WordReveal } from "../../engine/components/Kinetic";
import { DataRoom } from "../../engine/components/DataRoom";
import { Rain } from "../../engine/components/Weather";
import { TowerScene } from "../../engine/three/Tower";
import { fadeWin, Filing, Mark } from "../viviana/ui";
import { at, B, ORDERS, S } from "./config";

const G = layout.gutter;
const RED = "#FF5A55";
const deva: React.CSSProperties = { fontFamily: font.deva, fontWeight: 800, color: color.ink, letterSpacing: "-0.015em" };
const glass: React.CSSProperties = {
  borderRadius: 22, padding: "28px 34px", background: "linear-gradient(160deg, rgba(24,26,32,0.88), rgba(9,10,13,0.92))",
  border: "1.5px solid rgba(243,241,236,0.14)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
};

/* ------------------------------------------------ 0. HOOK: "Every order … came from one government." */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const [, b] = S.hook;
  const one = at("p0_hook", "one"), gov = at("p0_hook", "government.");
  const slam = prog(t, 0.02, 0.45, ease.outExpo);
  const stamp = prog(t, one - 0.05, 0.35, ease.outExpo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, 0, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.gold} drift={0.5} opacity={0.6} />
      <div style={{ position: "absolute", left: G, top: 240, fontFamily: font.display, fontWeight: 900, fontSize: 210, letterSpacing: "-0.06em", lineHeight: 0.9,
        color: color.ink, opacity: slam, transform: `scale(${lerp(1.35, 1, slam)})`, transformOrigin: "0% 50%" }}>
        PART <span style={{ color: color.goldHot }}>2</span>
      </div>
      <div style={{ position: "absolute", left: G, top: 450 }}>
        <Label text="ALL ORDERS · MAR–OCT 2026" t={t} start={0.3} />
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 540, display: "flex", flexDirection: "column", gap: 14 }}>
        {ORDERS.map((o, i) => {
          const p = prog(t, 0.6 + i * 0.32, 0.5, ease.outExpo);
          return (
            <div key={i} style={{ height: 96, borderRadius: 10, background: "linear-gradient(175deg,#F2EFE7,#E2DED3)", display: "flex", alignItems: "center", gap: 22,
              padding: "0 26px", boxShadow: "0 24px 50px rgba(0,0,0,0.5)", opacity: p, transform: `translateX(${(1 - p) * 160}px)` }}>
              <span style={{ fontFamily: font.mono, fontSize: 22, background: "#1B1C1F", color: "#F2EFE7", padding: "8px 12px", borderRadius: 4, width: 120, textAlign: "center" }}>{o.d}</span>
              <span style={{ fontFamily: font.text, fontWeight: 800, fontSize: 34, color: "#1B1C1F", width: 150 }}>{o.c}</span>
              <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 36, color: "#1B1C1F", marginLeft: "auto" }}>₹{o.v.toFixed(2)} cr</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 150, top: 760, transform: `rotate(-9deg) scale(${lerp(2, 1, stamp)})`, opacity: stamp, border: `7px solid ${color.goldHot}`,
        color: color.goldHot, fontFamily: font.display, fontWeight: 900, fontSize: 64, letterSpacing: "0.04em", padding: "10px 28px", borderRadius: 10,
        background: "rgba(10,9,6,0.72)", boxShadow: `0 0 ${40 * prog(t, gov, 0.6)}px rgba(240,208,138,0.45)` }}>
        GOVT OF GUJARAT
      </div>
    </div>
  );
};

/* ------------------------------------------------ 1. ORDERS + OWNERSHIP */
export const Orders: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.orders;
  const total = at("p1_orders", "₹768"), owner = B("p1_owner"), gov = at("p1_owner", "Gujarat");
  const tree = prog(t, owner - 0.1, 0.7, ease.outExpo);
  const top = prog(t, gov - 0.1, 0.6, ease.outExpo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.55} />
      <div style={{ position: "absolute", left: G, top: 250 }}>
        <Label text="6 ORDERS · MAR–OCT 2026 · INCL. TAXES" t={t} start={a} />
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 190, letterSpacing: "-0.05em", color: color.goldHot, lineHeight: 1, marginTop: 10, opacity: prog(t, total - 0.55, 0.2) }}>
          ₹<Counter to={768} t={t} start={total - 0.5} dur={0.9} /><span style={{ fontSize: 80, color: color.inkDim }}> cr</span>
        </div>
      </div>
      {/* ownership tree */}
      <div style={{ position: "absolute", left: G, right: G, top: 600, height: 700, opacity: tree }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {["MGVCL", "PGVCL", "DGVCL", "GETCO"].map((c, i) => (
            <div key={c} style={{ ...glass, padding: "18px 0", width: 200, textAlign: "center", fontFamily: font.text, fontWeight: 800, fontSize: 34, color: color.ink,
              transform: `translateY(${(1 - prog(t, owner + i * 0.12, 0.5, ease.outExpo)) * 50}px)` }}>{c}</div>
          ))}
        </div>
        <svg width={912} height={200} style={{ position: "absolute", top: 90 }}>
          {[100, 337, 575, 812].map((x) => <path key={x} d={`M${x},0 C${x},110 456,80 456,190`} fill="none" stroke={color.goldHot} strokeOpacity={0.6} strokeWidth={4}
            strokeDasharray={400} strokeDashoffset={400 * (1 - top)} />)}
        </svg>
        <div style={{ position: "absolute", top: 300, left: 156, width: 600, ...glass, textAlign: "center", opacity: top, borderColor: "rgba(240,208,138,0.5)" }}>
          <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 44, color: color.goldHot }}>GUVNL</div>
          <div style={{ ...deva, fontSize: 40, marginTop: 8 }}>100% Gujarat सरकार</div>
        </div>
        <div style={{ position: "absolute", top: 520, left: 0 }}><SourceTag text="NSE ORDER FILINGS · GUVNL GROUP (GOVT OF GUJARAT)" t={t} start={gov + 0.3} style={{ fontSize: 19 }} /></div>
      </div>
    </div>
  );
};

/* ------------------------------------------------ 2. THE WORK: cyclone-resilient lines */
export const Work: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.work;
  const covered = at("p2_work", "covered"), under = at("p2_work", "underground"), cyc = at("p2_work", "cyclone");
  const k = prog(t, a, b - a, ease.inOutCubic);
  const cam = { x: lerp(40, 22, k), y: lerp(8, 18, k), z: lerp(70, 42, k), tx: 0, ty: lerp(30, 34, k), tz: lerp(-30, 0, k), fov: 54 };
  const dia = prog(t, covered - 0.3, 0.6, ease.outExpo);
  const ug = prog(t, under - 0.2, 0.6, ease.outExpo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.15, 0.3) }}>
      <TowerScene t={t} cam={cam} energy={0.35 + 0.65 * prog(t, cyc, 0.5)} night={0.85} />
      <Rain t={t} intensity={0.75} wind={0.32} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.7) 0%, transparent 30%, transparent 50%, rgba(6,7,10,0.9) 100%)" }} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <WordReveal text="Bhuj · Jamnagar · Bhavnagar" t={t} start={a} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 70, color: color.ink, letterSpacing: "-0.03em" }} />
        <Label text="COASTAL FEEDERS · CYCLONE RESILIENT NETWORK" t={t} start={a + 0.4} style={{ marginTop: 12 }} />
      </div>
      {/* bare → covered → underground diagram */}
      <div style={{ position: "absolute", left: G, right: G, top: 860, ...glass, opacity: dia }}>
        {[
          { label: "BARE 11 kV LINE", sub: "खुले तार", c: RED, p: 1, strike: prog(t, covered, 0.4) },
          { label: "COVERED CONDUCTOR (MVCC)", sub: "covered तार", c: color.goldHot, p: dia, strike: 0 },
          { label: "UNDERGROUND CABLE", sub: "ज़मीन के नीचे", c: color.goldHot, p: ug, strike: 0 },
        ].map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, padding: "12px 0", opacity: r.p, borderTop: i ? "1px solid rgba(243,241,236,0.1)" : "none" }}>
            <svg width={200} height={40}>
              {i === 2 ? <line x1={0} y1={30} x2={200} y2={30} stroke={r.c} strokeWidth={10} strokeLinecap="round" strokeDasharray="2 0" />
                : <path d="M0,10 Q100,40 200,10" fill="none" stroke={r.c} strokeWidth={i === 1 ? 10 : 3} />}
              {i === 2 && <line x1={0} y1={14} x2={200} y2={14} stroke="rgba(243,241,236,0.35)" strokeWidth={2} strokeDasharray="6 6" />}
            </svg>
            <div>
              <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 26, color: r.c, letterSpacing: "0.04em",
                textDecoration: r.strike > 0.5 ? "line-through" : "none" }}>{r.label}</div>
              <div style={{ ...deva, fontSize: 30, color: color.inkDim, fontWeight: 600 }}>{r.sub}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12 }}><SourceTag text="PGVCL ORDER 31 MAR 2026 · VIKSIT GUJARAT SCHEME" t={t} start={cyc} style={{ fontSize: 18 }} /></div>
      </div>
    </div>
  );
};

/* ------------------------------------------------ 3. WHY GOVERNMENT → 267 days */
export const Why: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.why;
  const sixty = at("p3_why", "60%"), pay = B("p3_pay"), insp = at("p3_pay", "जाँच"), d267 = at("p3_267", "267"), pt = B("p3_267");
  const w1 = fadeWin(t, a - 0.05, pay + 0.05, 0.3, 0.25);
  const w2 = fadeWin(t, pay - 0.05, b + 0.2, 0.3, 0.2);
  const arc = prog(t, sixty - 0.3, 0.9, ease.inOutCubic) * 0.6;
  const R = 200, C = 2 * Math.PI * R;
  const steps = ["TENDER (L1)", "WORK", "INSPECTION", "PAYMENT"];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.steel} drift={0.5} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <WordReveal text="सरकार क्यों?" t={t} start={a} style={{ ...deva, fontSize: 96 }} />
      </div>
      {/* 60% central */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", flexDirection: "column", alignItems: "center", opacity: w1 }}>
        <svg width={480} height={480} viewBox="-240 -240 480 480">
          <circle r={R} fill="none" stroke="rgba(243,241,236,0.12)" strokeWidth={46} />
          <circle r={R} fill="none" stroke={color.goldHot} strokeWidth={46} strokeDasharray={`${C * arc} ${C}`} transform="rotate(-90)" />
        </svg>
        <div style={{ position: "absolute", top: 160, textAlign: "center", opacity: prog(t, sixty - 0.35, 0.2) }}>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 130, color: color.goldHot, lineHeight: 1 }}><Counter to={60} t={t} start={sixty - 0.3} dur={0.9} />%</div>
          <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim, letterSpacing: "0.1em" }}>CENTRAL GOVERNMENT</div>
        </div>
        <div style={{ marginTop: 26 }}><SourceTag text="MANAGEMENT · EARNINGS CALL 4 DEC 2025" t={t} start={sixty + 0.3} style={{ fontSize: 20 }} /></div>
      </div>
      {/* tender → payment chain, then 267 */}
      <div style={{ position: "absolute", left: G, right: G, top: 470, opacity: w2 }}>
        {steps.map((s, i) => {
          const p = prog(t, pay + i * 0.35, 0.45, ease.outExpo);
          const hot = s === "INSPECTION" ? prog(t, insp - 0.1, 0.4) : 0;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18, opacity: p, transform: `translateX(${(1 - p) * 80}px)` }}>
              <div style={{ width: 56, height: 56, borderRadius: 28, display: "grid", placeItems: "center", fontFamily: font.mono, fontWeight: 700, fontSize: 26,
                background: hot > 0.5 ? RED : "rgba(243,241,236,0.12)", color: color.ink }}>{i + 1}</div>
              <div style={{ fontFamily: font.text, fontWeight: 800, fontSize: 44, color: hot > 0.5 ? "#FF8A80" : color.ink }}>{s}</div>
            </div>
          );
        })}
        <div style={{ marginTop: 34, ...glass, opacity: prog(t, d267 - 0.7, 0.4), display: "flex", alignItems: "center", gap: 30, borderColor: "rgba(240,82,79,0.45)" }}>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 150, color: RED, letterSpacing: "-0.05em", lineHeight: 1 }}>
            <Counter to={267} t={t} start={d267 - 0.6} dur={0.8} />
          </div>
          <div>
            <div style={{ ...deva, fontSize: 46 }}>दिन</div>
            <div style={{ fontFamily: font.mono, fontSize: 20, color: color.inkDim, letterSpacing: "0.08em", marginTop: 6 }}>DEBTOR DAYS FY26 · FROM PART 1</div>
            <div style={{ marginTop: 10 }}><SourceTag text="AVRON INTERPRETATION" t={t} start={pt} estimate style={{ fontSize: 18 }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------ 4. NEW BETS: transformers + BESS */
export const Bets: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.bets;
  const bess = B("p4_bess"), r300 = at("p4_bess", "₹300"), loan = at("p4_bess", "loan"), yrs = at("p4_bess", "10");
  const w1 = fadeWin(t, a - 0.05, bess + 0.05, 0.3, 0.25);
  const w2 = fadeWin(t, bess - 0.05, b + 0.2, 0.3, 0.2);
  const fill = prog(t, r300 - 0.3, 0.8, ease.outExpo);
  const ln = prog(t, loan - 0.1, 0.6, ease.inOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <WordReveal text="नए दांव" t={t} start={a} accent={{ "दांव": color.goldHot }} style={{ ...deva, fontSize: 96 }} />
      </div>
      <div style={{ position: "absolute", left: G, top: 470, opacity: w1, transform: `translateY(${(1 - prog(t, a + 0.2, 0.6, ease.outExpo)) * 80}px)` }}>
        <Filing t={t} tag="NSE · REG. 30 · FACTORY INAUGURATION" stamp="21.09.2026" title="Power Transformer Manufacturing Facility, Por, Vadodara">
          …power transformers up to <Mark t={t} start={at("p4_factory", "transformer")}>20 MVA rating in the 66 kV and 33 kV classes</Mark>, with an annual production capacity{" "}
          <Mark t={t} start={at("p4_factory", "1,000")}>up to 1,000 MVA</Mark>…
        </Filing>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 470, opacity: w2 }}>
        <Label text="BATTERY STORAGE · PER PROJECT (MANAGEMENT, DEC 2025)" t={t} start={bess} />
        <div style={{ marginTop: 26, height: 120, borderRadius: 14, overflow: "hidden", display: "flex", background: "rgba(243,241,236,0.08)", width: `${fill * 100}%` }}>
          <div style={{ width: "77%", background: `linear-gradient(90deg, #6E1A1E, ${RED})`, display: "grid", placeItems: "center", fontFamily: font.display, fontWeight: 800, fontSize: 36,
            color: "#fff", opacity: ln }}>LOAN 75–80%</div>
          <div style={{ flex: 1, background: color.gold, display: "grid", placeItems: "center", fontFamily: font.mono, fontSize: 20, color: "#1B1C1F" }}>REST</div>
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 96, color: color.goldHot, marginTop: 14, letterSpacing: "-0.04em", opacity: prog(t, r300 - 0.45, 0.2) }}>
          ~₹<Counter to={300} t={t} start={r300 - 0.4} dur={0.8} /> cr <span style={{ fontSize: 34, color: color.inkDim, fontWeight: 700 }}>IN · ₹59 CR SUBSIDY</span>
        </div>
        <Label text="₹40 CR+ A YEAR · AFTER AN 18-MONTH BUILD" t={t} start={yrs - 0.3} style={{ marginTop: 40 }} tint={color.goldHot} />
        <div style={{ display: "flex", gap: 8, marginTop: 18, alignItems: "flex-end", height: 150 }}>
          {Array.from({ length: 14 }).map((_, i) => {
            const p = prog(t, yrs - 0.2 + i * 0.07, 0.4, ease.outExpo);
            const build = i < 2;
            return <div key={i} style={{ flex: 1, height: build ? 20 : 110 * p, borderRadius: 4, background: build ? "rgba(243,241,236,0.2)" : color.gold, opacity: build ? p : 1 }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 20, color: color.inkDim, marginTop: 10 }}>
          <span>BUILD</span><span>YEAR 1 → 12</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------ 5. RELATED PARTY */
export const RelatedParty: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.rp;
  const r36 = at("p5_rp1", "₹36"), rp2 = B("p5_rp2"), lakh = at("p5_rp2", "₹1"), rp3 = B("p5_rp3"), r50 = at("p5_rp3", "₹50");
  const w1 = fadeWin(t, a - 0.05, rp2 + 0.05, 0.3, 0.25);
  const w2 = fadeWin(t, rp2 - 0.05, b + 0.2, 0.3, 0.2);
  const stamp = prog(t, r50 - 0.05, 0.35, ease.outExpo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.crimson} drift={0.5} opacity={0.6} />
      <div style={{ position: "absolute", left: G, top: 275 }}>
        <Label text="12TH AGM NOTICE · 5 SEP 2026 · ITEM 5" t={t} start={a} tint="#FF8A80" />
      </div>
      <div style={{ position: "absolute", left: G, top: 345, opacity: w1, transform: `translateY(${(1 - prog(t, a + 0.1, 0.6, ease.outExpo)) * 80}px)` }}>
        <Filing t={t} tag="NSE · AGM NOTICE · RELATED PARTY" stamp="05.09.2026" title="Material RPT limits with Viviana Life Spaces Pvt Ltd">
          In previous Financial Year… <Mark t={t} start={r36 - 0.6}>Rs. 22.55 Crores as Advance against Capex</Mark>. During the current financial year (April 01, 2026 till September 03, 2026)…{" "}
          <Mark t={t} start={r36 - 0.2}>Rs. 13.53 Crores as Advance against Capex</Mark>.
        </Filing>
        <div style={{ marginTop: 30, fontFamily: font.display, fontWeight: 900, fontSize: 130, color: RED, letterSpacing: "-0.05em", opacity: prog(t, r36, 0.3) }}>
          = ₹36.08 cr
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 345, opacity: w2 }}>
        <div style={{ ...glass }}>
          <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim, letterSpacing: "0.08em" }}>VIVIANA LIFE SPACES · FY26 (AUDITED)</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 10 }}>
            <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 110, color: color.ink, letterSpacing: "-0.04em" }}>₹1.05 lakh</span>
            <span style={{ ...deva, fontSize: 36, color: color.inkDim }}>turnover</span>
          </div>
          <div style={{ fontFamily: font.text, fontSize: 28, color: "#FF8A80", marginTop: 8, opacity: prog(t, at("p5_rp2", "promoter") - 0.1, 0.4) }}>
            Owner since Aug 2026: promoter Mrs. Priyanka Richi Choksi
          </div>
        </div>
        {/* scale: ₹36.08 cr advance vs ₹1.05 lakh turnover */}
        <div style={{ marginTop: 34, opacity: prog(t, lakh, 0.4) }}>
          <div style={{ height: 70, width: `${100 * prog(t, lakh, 0.8, ease.outExpo)}%`, background: `linear-gradient(90deg, #6E1A1E, ${RED})`, borderRadius: 10, display: "flex",
            alignItems: "center", paddingLeft: 20, fontFamily: font.display, fontWeight: 800, fontSize: 32, color: "#fff" }}>ADVANCES ₹36.08 CR</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14 }}>
            <div style={{ width: 4, height: 70, background: color.ink }} />
            <span style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim }}>TURNOVER ₹1.05 LAKH (~1/3,400 OF THE ADVANCES)</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 640, transform: `rotate(-7deg) scale(${lerp(1.9, 1, stamp)})`, opacity: stamp, border: `6px solid ${RED}`,
          color: RED, fontFamily: font.display, fontWeight: 900, fontSize: 44, letterSpacing: "0.04em", padding: "10px 26px", borderRadius: 10, background: "rgba(20,6,6,0.6)",
          textAlign: "center", lineHeight: 1.1, whiteSpace: "nowrap" }}>
          APPROVAL SOUGHT<br />UP TO ₹50 CR · OFFICE
        </div>
        <div style={{ position: "absolute", left: 0, top: 790 }}><SourceTag text="AGM NOTICE · VOTE RESULT NOT VERIFIED" t={t} start={r50 + 0.4} estimate style={{ fontSize: 19 }} /></div>
      </div>
      {t > rp3 - 0.1 && null}
    </div>
  );
};

/* ------------------------------------------------ 6. TARGET vs Q1 */
export const Target: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.target;
  const q1 = at("p6_target", "₹72");
  const band = prog(t, a + 0.2, 0.8, ease.outExpo);
  const fill = prog(t, q1 - 0.2, 0.8, ease.outExpo);
  const W = 912, max = 950;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 255 }}>
        <Label text="FY27 TARGET vs Q1 · ₹ CR" t={t} start={a} />
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 150, color: color.goldHot, letterSpacing: "-0.05em", marginTop: 14, lineHeight: 1 }}>875–910</div>
        <div style={{ ...deva, fontSize: 40, color: color.inkDim, marginTop: 6 }}>इस साल का target</div>
      </div>
      <div style={{ position: "absolute", left: G, top: 800, width: W }}>
        <div style={{ position: "relative", height: 110, borderRadius: 14, background: "rgba(243,241,236,0.08)" }}>
          <div style={{ position: "absolute", left: (875 / max) * W, width: ((910 - 875) / max) * W, top: -20, bottom: -20, background: color.goldHot, opacity: band, borderRadius: 6 }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (72.39 / max) * W * fill, background: RED, borderRadius: 14 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
          <div style={{ opacity: fill }}>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 110, color: RED, letterSpacing: "-0.04em" }}>₹72</div>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim }}>Q1 FY27 · CONSOLIDATED</div>
          </div>
          <div style={{ textAlign: "right", opacity: prog(t, q1 + 0.4, 0.4) }}>
            <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 80, color: color.ink, letterSpacing: "-0.04em" }}>~₹270</div>
            <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim }}>NEEDED PER QUARTER · AVRON CALC.</div>
          </div>
        </div>
        <div style={{ marginTop: 26 }}><SourceTag text="Q1 FY27 CALL · FY30 TARGET ₹2,000–2,200 CR" t={t} start={a + 0.8} style={{ fontSize: 19 }} /></div>
      </div>
    </div>
  );
};

/* ------------------------------------------------ 7. CLOSE + END */
export const Close: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.close;
  const p3 = at("p7_close", "3.");
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.5} />
      <div style={{ position: "absolute", left: G, right: G, top: 420, display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ width: 260, borderRadius: 20, overflow: "hidden", border: "1.5px solid rgba(243,241,236,0.2)", opacity: prog(t, a, 0.4),
          transform: `scale(${lerp(0.85, 1, prog(t, a, 0.5, ease.outExpo))})` }}>
          <div style={{ background: RED, color: "#fff", fontFamily: font.mono, fontWeight: 700, fontSize: 34, textAlign: "center", padding: "10px 0", letterSpacing: "0.12em" }}>NOV</div>
          <div style={{ background: "#F2EFE7", color: "#1B1C1F", fontFamily: font.display, fontWeight: 800, fontSize: 150, textAlign: "center", lineHeight: 1.15 }}>14</div>
        </div>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 64, color: color.ink, letterSpacing: "-0.03em" }}>Q2 results</div>
          <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim, marginTop: 8 }}>DUE · SEBI LODR REG. 33</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 860, fontFamily: font.display, fontWeight: 900, fontSize: 170, letterSpacing: "-0.06em", color: color.goldHot,
        opacity: prog(t, p3 - 0.3, 0.4), transform: `scale(${lerp(1.3, 1, prog(t, p3 - 0.3, 0.5, ease.outExpo))})`, transformOrigin: "0% 50%" }}>
        PART 3 →
      </div>
    </div>
  );
};

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
        Sources: NSE order filings (Mar–Oct 2026) · AGM notice (5 Sep 2026) · Factory filing (21 Sep 2026) · Earnings calls (4 Dec 2025, 6 Aug 2026) · Screener.<br />
        Education only. Not investment advice. Not a recommendation to buy, sell or hold. AVRON is not SEBI-registered.
      </div>
    </div>
  );
};

export const clampUnused = clamp01;
