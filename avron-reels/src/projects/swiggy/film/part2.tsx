import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp } from "../../../engine/anim";
import { C, Glass, mono, Rise, sans, serif } from "../look";
import { Bars, crore, Headline, Kicker, LOGO, Note, Shot, Stat } from "./kit";
import { DayMeters } from "./part1";
import { DURATION, en, st } from "./timeline";

const ZOMATO = <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: C.zomato, letterSpacing: "-0.02em" }}>zomato</span>;
const appear = (t: number, at: number, d = 0.5) => ease.outCubic(clamp01((t - at) / d));
const Interp: React.FC<{ t: number; at: number; text: string; top: number }> = ({ t, at, text, top }) => (
  <Glass style={{ left: 140, top, width: 1640, padding: "22px 30px", opacity: appear(t, at) }} tint="rgba(201,164,92,0.14)">
    <div style={{ fontFamily: mono, fontSize: 20, color: C.blinkit, letterSpacing: "0.14em" }}>AVRON INTERPRETATION</div>
    <div style={{ fontFamily: sans, fontSize: 34, color: C.ink, marginTop: 6 }}>{text}</div>
  </Glass>
);

/* ================================================= CHAPTER 3 · KHAANA (noon) */
export const C3Section: React.FC<{ t: number }> = ({ t }) => {
  const K = <Kicker text="03 · KHAANA · FOOD DELIVERY" />;
  return (
    <>
      <Shot t={t} a={st("c3_00")} z={en("c3_00")}>
        {K}
        <Headline t={t} at={st("c3_00") + 0.2} lines={["Swiggy ki achhi khabar khaane se aati hai"]} size={76} />
        <Stat t={t} at={st("c3_00") + 2.0} label="SWIGGY FOOD DELIVERY · ADJUSTED EBITDA · Q2 FY27" value={341} fmt={(v) => `₹${Math.round(v)} Cr`} color={C.gain} size={170}
          caption="Highest ever · 3.4% of GOV · +₹101 Cr YoY" logo={LOGO.swiggy} style={{ left: 140, top: 360, width: 1000 }} tint="rgba(252,128,25,0.12)" />
        <Note t={t} at={st("c3_00") + 2} text="Adjusted EBITDA = profit from day-to-day operations, before some accounting items · Source: Swiggy press release, Q2 FY27" />
      </Shot>
      <Shot t={t} a={st("c3_01")} z={en("c3_01")}>
        {K}
        <Stat t={t} at={st("c3_01") + 0.4} label="SWIGGY FOOD · MONTHLY TRANSACTING USERS" value={1.98} fmt={(v) => `${v.toFixed(2)} crore`} size={150}
          caption="19.8 million people a month · +15.2% YoY" logo={LOGO.swiggy} style={{ left: 140, top: 220, width: 1100 }} tint="rgba(252,128,25,0.12)" />
      </Shot>
      <Shot t={t} a={st("c3_02")} z={en("c3_02")}>
        {K}
        <Headline t={t} at={st("c3_02") + 0.2} lines={["Toing · saste khaane ka alag app"]} />
        <Glass style={{ left: 140, top: 380, width: 1100, opacity: appear(t, st("c3_02") + 1.5) }} tint="rgba(252,128,25,0.10)">
          <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim }}>NEW TOING USERS · PER SWIGGY</div>
          <div style={{ display: "flex", gap: 30, marginTop: 24 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 140, height: 140, borderRadius: 140, border: `4px solid ${i < 2 ? C.swiggy : "rgba(245,241,234,0.5)"}`, background: i < 2 ? "rgba(252,128,25,0.35)" : "transparent",
                transform: `scale(${0.6 + 0.4 * appear(t, st("c3_02") + 2 + i * 0.25, 0.4)})` }} />
            ))}
          </div>
          <div style={{ fontFamily: sans, fontSize: 38, color: C.ink, marginTop: 26 }}>2 of every 3 had never ordered food online before · 50+ cities</div>
        </Glass>
        <Note t={t} at={st("c3_02") + 2} text="Company statement · Source: Swiggy press release, Q2 FY27" />
      </Shot>
      <Shot t={t} a={st("c3_03")} z={en("c3_03")}>
        {K}
        <div style={{ position: "absolute", left: 140, top: 260, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c3_03") + 0.3} label="ZOMATO FOOD · NOV GROWTH YoY" value={21.5} fmt={(v) => `+${v.toFixed(1)}%`} color={C.gain} size={140} logo={ZOMATO} style={{ position: "relative", width: 780 }} tint="rgba(226,55,68,0.12)" />
          <Stat t={t} at={st("c3_03") + 0.6} label="ADJUSTED EBITDA MARGIN" value={5.5} fmt={(v) => `${v.toFixed(1)}%`} size={140} caption="of NOV" logo={LOGO.eternal} style={{ position: "relative", width: 780 }} tint="rgba(226,55,68,0.12)" />
        </div>
        <Note t={t} at={st("c3_03") + 1} text="Source: Eternal shareholders' letter, Q2 FY27" />
      </Shot>
      <Shot t={t} a={st("c3_04")} z={en("c3_04")}>
        {K}
        <Headline t={t} at={st("c3_04") + 0.2} lines={["Chaar saal · dugna"]} size={90} />
        <TwoPointLine t={t} a={st("c3_04") + 1.0} from={{ x: "FY22", v: 18160 }} to={{ x: "FY26", v: 37993 }} color={C.zomato} />
        <Glass style={{ left: 1160, top: 400, width: 620, opacity: appear(t, st("c3_04") + 9) }} tint="rgba(248,203,70,0.12)">
          <div style={{ fontFamily: mono, fontSize: 22, color: C.blinkit }}>ETERNAL'S OWN ADMISSION</div>
          <div style={{ fontFamily: sans, fontSize: 32, color: C.ink, marginTop: 10, lineHeight: 1.4 }}>Part of FY26's slower food growth came from orders moving to quick commerce · that shift "seems to have settled"</div>
        </Glass>
        <Note t={t} at={st("c3_04") + 1} text="Zomato food NOV ₹18,160 Cr (FY22) → ₹37,993 Cr (FY26), ~20% CAGR · only the two endpoints are plotted · Source: Eternal shareholders' letter" />
      </Shot>
      <Shot t={t} a={st("c3_05")} z={en("c3_05")}>
        {K}
        <Headline t={t} at={st("c3_05") + 0.2} lines={["3.4% vs 5.5% · not like for like"]} />
        <Glass style={{ left: 140, top: 380, width: 1300, opacity: appear(t, st("c3_05") + 1) }}>
          <div style={{ fontFamily: sans, fontSize: 38, color: C.ink, lineHeight: 1.5 }}>Swiggy reports margin on <b style={{ color: C.swiggy }}>GOV</b> (before discounts)<br />Zomato reports margin on <b style={{ color: C.zomato }}>NOV</b> (after discounts)</div>
          <div style={{ fontFamily: sans, fontSize: 32, color: C.inkDim, marginTop: 20 }}>Different bases · compare the direction, not the decimals</div>
        </Glass>
      </Shot>
      <Shot t={t} a={st("c3_06")} z={en("c3_06")}>
        {K}
        <Headline t={t} at={st("c3_06") + 0.2} lines={["Swiggy · ek business kamata, doosra ganwata"]} size={72} />
        <Bars t={t} at={st("c3_06") + 1.2} max={895} top={360} rows={[
          { label: "Food delivery · adj. EBITDA", value: 341, color: C.gain, text: "+₹341 Cr" },
          { label: "Instamart · adj. EBITDA", value: 895, color: C.loss, text: "−₹895 Cr" },
        ]} />
        <div style={{ position: "absolute", left: 140, top: 680, opacity: appear(t, st("c3_06") + 5) }}>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 130, color: C.loss }}>−₹554 Cr</span>
          <span style={{ fontFamily: mono, fontSize: 28, color: C.inkDim, marginLeft: 24 }}>341 − 895 = −554</span>
        </div>
      </Shot>
      <Shot t={t} a={st("c3_07")} z={en("c3_07")}>
        {K}
        <Headline t={t} at={st("c3_07") + 0.2} lines={["Eternal · dono engine kamaate hain"]} />
        <div style={{ position: "absolute", left: 140, top: 360, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c3_07") + 0.8} label="ZOMATO FOOD · ADJ. EBITDA MARGIN" value={5.5} fmt={(v) => `+${v.toFixed(1)}%`} color={C.gain} logo={ZOMATO} style={{ position: "relative", width: 780 }} />
          <Stat t={t} at={st("c3_07") + 1.1} label="BLINKIT · ADJ. EBITDA" value={184} fmt={(v) => `+₹${Math.round(v)} Cr`} color={C.gain} logo={LOGO.blinkit} style={{ position: "relative", width: 780 }} />
        </div>
      </Shot>
    </>
  );
};

/** Only two verified points, so only two points are drawn: a dashed line between them. */
const TwoPointLine: React.FC<{ t: number; a: number; from: { x: string; v: number }; to: { x: string; v: number }; color: string }> = ({ t, a, from, to, color }) => {
  const p = ease.inOutCubic(clamp01((t - a) / 1.6));
  const X0 = 200, X1 = 960, Y = (v: number) => 860 - (v / 40000) * 440;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <rect x={60} y={330} width={1140} height={640} rx={28} fill="rgba(10,12,16,0.55)" stroke="rgba(245,241,234,0.14)" opacity={clamp01((t - a + 0.3) / 0.4)} />
      <line x1={X0} y1={Y(from.v)} x2={lerp(X0, X1, p)} y2={lerp(Y(from.v), Y(to.v), p)} stroke={color} strokeWidth={6} strokeDasharray="14 12" />
      {[from, to].map((pt, i) => {
        const x = i ? X1 : X0, y = Y(pt.v), o = i ? clamp01((t - a - 1.4) / 0.4) : clamp01((t - a) / 0.3);
        return (
          <g key={pt.x} opacity={o}>
            <circle cx={x} cy={y} r={14} fill={color} />
            <text x={x} y={y - 34} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={C.ink}>₹{pt.v.toLocaleString("en-IN")} Cr</text>
            <text x={x} y={y + 64} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={26} fill={C.inkDim}>{pt.x}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ================================================= CHAPTER 4 · RULEBOOK (dusk) */
export const C4Section: React.FC<{ t: number }> = ({ t }) => {
  const K = <Kicker text="04 · RULEBOOK" />;
  const stamp = (at: number) => { const p = clamp01((t - at) / 0.25); return { transform: `rotate(-10deg) scale(${1.8 - 0.8 * p})`, opacity: p }; };
  return (
    <>
      <Shot t={t} a={st("c4_00")} z={en("c4_01")}>
        {K}
        <Headline t={t} at={st("c4_00") + 0.2} lines={["Saamaan ka maalik kaun hai"]} size={96} />
        <Glass style={{ left: 140, top: 400, width: 760, height: 430, opacity: appear(t, st("c4_01")) }}>
          <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim, letterSpacing: "0.1em" }}>MARKETPLACE</div>
          <div style={{ fontFamily: sans, fontSize: 40, color: C.ink, marginTop: 20, lineHeight: 1.35 }}>Sellers own the goods · the app takes a cut</div>
          <div style={{ fontFamily: sans, fontSize: 30, color: C.inkDim, marginTop: 30, lineHeight: 1.4 }}>The only model allowed for online companies with foreign investment above the limit</div>
        </Glass>
        <Glass style={{ left: 1020, top: 400, width: 760, height: 430, opacity: appear(t, st("c4_01") + 4) }} tint="rgba(248,203,70,0.10)">
          <div style={{ fontFamily: mono, fontSize: 24, color: C.blinkit, letterSpacing: "0.1em" }}>INVENTORY</div>
          <div style={{ fontFamily: sans, fontSize: 40, color: C.ink, marginTop: 20, lineHeight: 1.35 }}>The app owns the goods · buys them, stocks them, sells them</div>
        </Glass>
        <Note t={t} at={st("c4_01") + 1} text="India's FDI rules (Press Note 2, 2018) · Source: MediaNama (Jul 2025)" />
      </Shot>
      <Shot t={t} a={st("c4_02")} z={en("c4_02")}>
        {K}
        <Headline t={t} at={st("c4_02") + 0.2} lines={["2025 · Eternal ka faisla"]} />
        <div style={{ position: "absolute", left: 140, top: 380, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c4_02") + 2} label="FOREIGN SHAREHOLDING · CAPPED AT" value={49.5} fmt={(v) => `${v.toFixed(1)}%`} size={150} caption="May 2025 · qualifies as an Indian-owned and controlled company" logo={LOGO.eternal} style={{ position: "relative", width: 800 }} />
          <Stat t={t} at={st("c4_02") + 6} label="BLINKIT SWITCHES TO" value={1} fmt={() => "Inventory"} size={110} caption="From September 2025" logo={LOGO.blinkit} style={{ position: "relative", width: 760 }} tint="rgba(248,203,70,0.12)" />
        </div>
        <Note t={t} at={st("c4_02") + 2} text="Source: MediaNama (Jul 2025)" />
      </Shot>
      <Shot t={t} a={st("c4_03")} z={en("c4_03")}>
        {K}
        <Headline t={t} at={st("c4_03") + 0.2} lines={["Eternal revenue · ek saal mein"]} />
        <Bars t={t} at={st("c4_03") + 1} max={24138} top={380} rows={[
          { label: "Q2 FY26", value: 13590, color: "rgba(245,241,234,0.55)", text: crore(13590) },
          { label: "Q2 FY27", value: 24138, color: C.blinkit, text: crore(24138) },
        ]} />
        <div style={{ position: "absolute", left: 1420, top: 360, opacity: appear(t, st("c4_03") + 3) }}>
          <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 150, color: C.gain }}>+77.6%</div>
        </div>
        <Note t={t} at={st("c4_03") + 1} text="24,138 ÷ 13,590 = 1.776 · revenue now includes the full price of goods Blinkit sells, not just a commission · Source: Eternal results (NSE)" />
      </Shot>
      <Shot t={t} a={st("c4_04")} z={en("c4_04")}>
        {K}
        <Headline t={t} at={st("c4_04") + 0.2} lines={["Apna saamaan · apna control"]} />
        <div style={{ position: "absolute", left: 140, top: 380, width: 1600 }}>
          {["Better buying prices", "Better margins", "Control over which product sits in which store", "Sellers asked to move to the new model, or be delisted"].map((x, i) => (
            <Rise key={x} t={t} at={st("c4_04") + 0.8 + i * 3.2}><div style={{ fontFamily: sans, fontSize: 44, color: i === 3 ? C.inkDim : C.ink, marginBottom: 30 }}>{i < 3 ? "→ " : "· "}{x}</div></Rise>
          ))}
        </div>
      </Shot>
      <Shot t={t} a={st("c4_05")} z={en("c4_07")}>
        {K}
        <Headline t={t} at={st("c4_05") + 0.2} lines={["Ab Swiggy"]} size={96} />
        <Glass style={{ left: 140, top: 360, width: 1000, opacity: appear(t, st("c4_05") + 1) }} tint="rgba(252,128,25,0.12)">
          {LOGO.swiggy}
          <div style={{ fontFamily: sans, fontSize: 38, color: C.ink, marginTop: 20, lineHeight: 1.4 }}>"Obtained necessary approvals to qualify as an Indian owned and controlled company · the transition is underway"</div>
          <div style={{ fontFamily: mono, fontSize: 22, color: C.inkDim, marginTop: 16 }}>Swiggy press release · 22 Oct 2026</div>
        </Glass>
        <div style={{ position: "absolute", left: 1240, top: 560, border: `6px solid ${C.swiggy}`, color: C.swiggy, fontFamily: sans, fontWeight: 800, fontSize: 46, letterSpacing: "0.08em",
          padding: "12px 28px", borderRadius: 12, background: "rgba(20,10,4,0.55)", ...stamp(st("c4_05") + 4) }}>APPROVED · OCT 2026</div>
        {/* the one-year gap */}
        <div style={{ position: "absolute", left: 140, top: 780, width: 1640, opacity: appear(t, st("c4_06")) }}>
          <div style={{ position: "relative", height: 6, background: "rgba(245,241,234,0.25)", borderRadius: 3 }}>
            <div style={{ position: "absolute", left: 0, top: -14, width: 34, height: 34, borderRadius: 34, background: C.blinkit }} />
            <div style={{ position: "absolute", left: `${lerp(0, 60, appear(t, st("c4_06") + 0.5, 1.4))}%`, top: -14, width: 34, height: 34, borderRadius: 34, background: C.swiggy }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", width: "64%", marginTop: 26, fontFamily: sans, fontSize: 30, color: C.ink }}>
            <span>Blinkit · Sep 2025</span><span>Instamart · Oct 2026</span>
          </div>
        </div>
        {t > st("c4_07") - 0.3 && <Interp t={t} at={st("c4_07")} top={900} text="Instamart is about a year behind on the switch · in that year Blinkit added stores, supplier ties and four profitable quarters" />}
      </Shot>
    </>
  );
};

/* ================================================= CHAPTER 5 · FRIDAY, 23 OCTOBER (storm) */
export const C5Section: React.FC<{ t: number }> = ({ t }) => {
  const K = <Kicker text="05 · FRIDAY, 23 OCTOBER" />;
  const flip = ease.inOutCubic(clamp01((t - st("c5_00") - 3.5) / 0.8));
  return (
    <>
      <Shot t={t} a={st("c5_00")} z={en("c5_00")}>
        {K}
        <div style={{ position: "absolute", left: 660, top: 220, width: 600, height: 560, perspective: 1400 }}>
          {[["THU", "22", "Results after market close"], ["FRI", "23", "Market opens · stock falls"]].map(([d, n, s], i) => (
            <div key={d} style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#F4EFE6", boxShadow: "0 40px 90px rgba(0,0,0,0.5)", textAlign: "center", color: "#1D1A16",
              transformOrigin: "50% 0", transform: i === 0 ? `rotateX(${flip * 100}deg)` : "none", opacity: i === 0 ? 1 - flip * 0.6 : 1, zIndex: i === 0 ? 2 : 1, backfaceVisibility: "hidden" }}>
              <div style={{ background: i ? C.loss : "#3A332B", color: "#fff", fontFamily: sans, fontWeight: 800, fontSize: 40, letterSpacing: "0.3em", padding: "18px 0", borderRadius: "24px 24px 0 0" }}>OCT 2026 · {d}</div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 260, lineHeight: 1.2 }}>{n}</div>
              <div style={{ fontFamily: sans, fontSize: 32, color: "#5F574C" }}>{s}</div>
            </div>
          ))}
        </div>
      </Shot>
      <Shot t={t} a={st("c5_01")} z={en("c5_01")}>
        {K}
        <Headline t={t} at={st("c5_01") + 0.2} lines={["IPO se aaj tak"]} />
        <PriceDrop t={t} a={st("c5_01") + 0.8} />
        <Note t={t} at={st("c5_01") + 1} text="IPO price ₹390 (Nov 2024) · ₹176 per Screener export · 176 ÷ 390 = −54.9% · only the two endpoints are plotted" />
      </Shot>
      <Shot t={t} a={st("c5_02")} z={en("c5_03")}>
        {K}
        <div style={{ position: "absolute", left: 140, top: 200, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c5_02") + 0.6} label="REVENUE FROM OPERATIONS · YoY" value={36.1} fmt={(v) => `+${v.toFixed(1)}%`} color={C.gain} caption="₹7,571 Cr (vs ₹5,561 Cr)" style={{ position: "relative", width: 780 }} />
          <Stat t={t} at={st("c5_02") + 3.5} label="NET LOSS · QoQ" value={922} fmt={(v) => `−₹${Math.round(v)} Cr`} color={C.loss} caption="up from ₹791 Cr last quarter" style={{ position: "relative", width: 780 }} />
        </div>
        <div style={{ position: "absolute", left: 140, top: 640, display: "flex", gap: 40, opacity: appear(t, st("c5_03")) }}>
          <Stat t={t} at={st("c5_03") + 0.3} label="INSTAMART · CONTRIBUTION MARGIN" value={1.0} fmt={(v) => `−${v.toFixed(1)}%`} color={C.loss} caption="of GOV · 82 bps weaker QoQ" style={{ position: "relative", width: 780 }} />
          <Stat t={t} at={st("c5_03") + 4} label="NEW DARK STORES THIS QUARTER" value={69} caption="= the previous three quarters combined" style={{ position: "relative", width: 780 }} />
        </div>
        <Note t={t} at={st("c5_02") + 1} text="Sources: Swiggy financial results & press release, Q2 FY27 (NSE, 22 Oct 2026)" />
      </Shot>
      <Shot t={t} a={st("c5_04")} z={en("c5_04")}>
        {K}
        <Headline t={t} at={st("c5_04") + 0.2} lines={["FY20 se ab tak ka nuksaan"]} />
        <Ledger t={t} a={st("c5_04") + 0.8} />
      </Shot>
      <Shot t={t} a={st("c5_05")} z={en("c5_05")}>
        {K}
        <Headline t={t} at={st("c5_05") + 0.2} lines={["Nuksaan ke liye paisa"]} />
        <div style={{ position: "absolute", left: 140, top: 380, display: "flex", gap: 34 }}>
          <Stat t={t} at={st("c5_05") + 3} label="FY26 · FROM FINANCING" value={9397} fmt={(v) => `+${crore(v)}`} color={C.gain} size={76} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c5_05") + 5} label="FY26 · USED BY OPERATIONS" value={2898} fmt={(v) => `−${crore(v)}`} color={C.loss} size={76} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c5_05") + 8} label="CASH + INVESTMENTS · 31 MAR 2026" value={10077} fmt={crore} size={76} style={{ position: "relative", width: 520 }} />
        </div>
        <Note t={t} at={st("c5_05") + 1} text="Screener export (cash flow, balance sheet) · 4,043 + 6,034 = 10,077" />
      </Shot>
      <Shot t={t} a={st("c5_06")} z={en("c5_06")}>
        {K}
        <Headline t={t} at={st("c5_06") + 0.2} lines={["Kab tak · aur kitna"]} size={130} top={300} />
        <div style={{ position: "absolute", left: 140, top: 560, fontFamily: sans, fontWeight: 800, fontSize: 150, color: C.loss, opacity: appear(t, st("c5_06") + 5) }}>−16% <span style={{ fontSize: 40, color: C.inkDim, fontWeight: 500 }}>intraday · 23 Oct</span></div>
        <Note t={t} at={st("c5_06") + 5} text="Fell as much as ~16–17% intraday · Source: CNBC-TV18, Bloomberg (23 Oct 2026)" />
      </Shot>
    </>
  );
};

const PriceDrop: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const p = ease.inOutCubic(clamp01((t - a) / 1.8));
  const X0 = 220, X1 = 1500, Y = (v: number) => 900 - (v / 420) * 520;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <line x1={X0} y1={Y(390)} x2={lerp(X0, X1, p)} y2={lerp(Y(390), Y(176), p)} stroke={C.loss} strokeWidth={6} strokeDasharray="14 12" />
      <circle cx={X0} cy={Y(390)} r={14} fill={C.ink} />
      <text x={X0} y={Y(390) - 34} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill={C.ink}>₹390</text>
      <text x={X0} y={Y(390) + 60} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={26} fill={C.inkDim}>IPO · NOV 2024</text>
      <g opacity={clamp01((t - a - 1.6) / 0.4)}>
        <circle cx={X1} cy={Y(176)} r={14} fill={C.loss} />
        <text x={X1} y={Y(176) - 34} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill={C.loss}>₹176</text>
        <text x={X1} y={Y(176) + 60} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={26} fill={C.inkDim}>NOW</text>
        <text x={X1 + 60} y={Y(176) + 10} fontFamily="Playfair Display" fontWeight={700} fontSize={110} fill={C.loss}>−54.9%</text>
      </g>
    </svg>
  );
};

const Ledger: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const rows: [string, number][] = [["FY20", 3920], ["FY21", 1617], ["FY22", 3629], ["FY23", 4179], ["FY24", 2350], ["FY25", 3117], ["FY26", 4154], ["H1 FY27", 1713]];
  let run = 0;
  const shown = rows.filter((_, i) => t > a + i * 0.7).length;
  const total = rows.slice(0, shown).reduce((s, r) => s + r[1], 0);
  return (
    <>
      <div style={{ position: "absolute", left: 140, top: 340, width: 900, fontFamily: mono }}>
        {rows.map(([y, v], i) => {
          run += v;
          const p = clamp01((t - a - i * 0.7) / 0.4);
          return (
            <div key={y} style={{ display: "flex", justifyContent: "space-between", fontSize: 34, color: C.ink, padding: "8px 0", borderBottom: "1px solid rgba(245,241,234,0.15)", opacity: p, transform: `translateX(${(1 - p) * -30}px)` }}>
              <span style={{ color: C.inkDim }}>{y}</span><span style={{ color: C.loss }}>−{v.toLocaleString("en-IN")}</span><span>{run.toLocaleString("en-IN")}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 1150, top: 480 }}>
        <div style={{ fontFamily: mono, fontSize: 26, color: C.inkDim }}>CUMULATIVE NET LOSS</div>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 150, color: C.loss }}>₹{total.toLocaleString("en-IN")} Cr</div>
      </div>
      <Note t={t} at={a + 5.6} text="₹ crore · Screener export (annual) + Swiggy results (H1 FY27: 791 + 922) · 22,966 + 1,713 = 24,679" />
    </>
  );
};

/* ================================================= CHAPTER 6 · BLINKIT BHI PERFECT NAHI (late night) */
export const C6Section: React.FC<{ t: number }> = ({ t }) => {
  const K = <Kicker text="06 · BLINKIT BHI PERFECT NAHI" />;
  return (
    <>
      <Shot t={t} a={st("c6_00")} z={en("c6_01")}>
        {K}
        <Headline t={t} at={st("c6_00") + 0.1} lines={["Eternal ki kamzoriyaan"]} size={96} />
        <Stat t={t} at={st("c6_01") + 0.6} label="1 · BLINKIT ADJUSTED EBITDA MARGIN" value={0.9} fmt={(v) => `${v.toFixed(1)}%`} size={190} caption="of NOV · one price war away from a loss" logo={LOGO.blinkit} style={{ left: 140, top: 360, width: 1000 }} tint="rgba(248,203,70,0.10)" />
      </Shot>
      <Shot t={t} a={st("c6_02")} z={en("c6_02")}>
        {K}
        <Stat t={t} at={st("c6_02") + 0.6} label="2 · ETERNAL · EFFECTIVE TAX RATE, Q2 FY27" value={61.3} fmt={(v) => `${v.toFixed(1)}%`} size={190} caption="Net profit ₹125 Cr · carried-forward tax losses now used up" logo={LOGO.eternal} style={{ left: 140, top: 240, width: 1100 }} />
        <Note t={t} at={st("c6_02") + 1} text="Tax ₹198 Cr ÷ profit before tax ₹323 Cr = 61.3% · Screener export; Eternal results" />
      </Shot>
      <Shot t={t} a={st("c6_03")} z={en("c6_03")}>
        {K}
        <Headline t={t} at={st("c6_03") + 0.2} lines={["Growth ab bhi tez · par pehle se dheemi"]} />
        <div style={{ position: "absolute", left: 140, top: 360, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c6_03") + 0.6} label="BLINKIT NOV GROWTH · YoY" value={79.3} fmt={(v) => `+${v.toFixed(1)}%`} size={130} caption="slower than before · a much bigger base" style={{ position: "relative", width: 780 }} />
          <Stat t={t} at={st("c6_03") + 9} label="GUIDANCE · NEXT 3 YEARS" value={60} fmt={(v) => `${Math.round(v)}% CAGR`} size={130} caption="'Tracking ahead… too early to revise'" style={{ position: "relative", width: 780 }} />
        </div>
        <Note t={t} at={st("c6_03") + 1} text="Source: Eternal shareholders' letter, Q2 FY27" />
      </Shot>
      <Shot t={t} a={st("c6_04")} z={en("c6_04")}>
        {K}
        <Headline t={t} at={st("c6_04") + 0.2} lines={["3 · Store plan"]} />
        <Bars t={t} at={st("c6_04") + 1} max={5000} top={380} rows={[
          { label: "Today (Sep 2026)", value: 2751, color: "rgba(245,241,234,0.6)", text: "2,751" },
          { label: "Target · Mar 2027", value: 3500, color: C.blinkit, text: "3,500+" },
          { label: "Plan · Mar 2028", value: 5000, color: C.blinkit, text: "~5,000" },
        ]} />
        <Note t={t} at={st("c6_04") + 1} text="New stores sell less at first and need investment · Source: Eternal shareholders' letter" />
      </Shot>
      <Shot t={t} a={st("c6_05")} z={en("c6_05")}>
        {K}
        <Headline t={t} at={st("c6_05") + 0.2} lines={["4 · Das minute ka vaada, aur bhi kar rahe hain"]} size={72} />
        <div style={{ position: "absolute", left: 140, top: 420, display: "flex", gap: 30, flexWrap: "wrap", width: 1640 }}>
          {[["Zepto", "#8B5CF6"], ["Flipkart Minutes", "#2F80ED"], ["Amazon", "#FF9900"]].map(([n, c], i) => (
            <div key={n} style={{ fontFamily: sans, fontWeight: 700, fontSize: 52, color: C.ink, padding: "22px 40px", borderRadius: 999, border: `3px solid ${c}`, background: "rgba(10,12,16,0.55)",
              opacity: appear(t, st("c6_05") + 2 + i * 0.4), transform: `translateY(${(1 - appear(t, st("c6_05") + 2 + i * 0.4)) * 30}px)` }}>{n}</div>
          ))}
        </div>
        <Note t={t} at={st("c6_05") + 6} text="Eternal: 'We have a clearer read on competition' in more contested markets (shareholders' letter, Q2 FY27)" />
      </Shot>
      <Shot t={t} a={st("c6_06")} z={en("c6_06")}>
        {K}
        <Headline t={t} at={st("c6_06") + 0.2} lines={["Phir bhi · ek number Blinkit ke paksh mein"]} size={72} />
        <div style={{ position: "absolute", left: 140, top: 380, display: "flex", gap: 34 }}>
          <Stat t={t} at={st("c6_06") + 2} label="MATURE CITIES · ADJ. EBITDA MARGIN" value={5} fmt={(v) => `>${Math.round(v)}%`} color={C.gain} size={120} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c6_06") + 5} label="NOV FROM ADJ. EBITDA-POSITIVE CITIES" value={70} fmt={(v) => `~${Math.round(v)}%`} color={C.gain} size={120} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c6_06") + 7} label="NOV FROM CONTRIBUTION-POSITIVE CITIES" value={96} fmt={(v) => `~${Math.round(v)}%`} color={C.gain} size={120} style={{ position: "relative", width: 520 }} />
        </div>
        <Note t={t} at={st("c6_06") + 1} text="Source: Eternal shareholders' letter, Q2 FY27" />
      </Shot>
    </>
  );
};

/* ================================================= CHAPTER 7 · AAGE KYA DEKHEIN (pre-dawn) */
export const C7Section: React.FC<{ t: number }> = ({ t }) => {
  const items = [
    { at: st("c7_01"), n: "1", k: "Instamart contribution margin", v: "now −1.0% of GOV · watch for 0" },
    { at: st("c7_02"), n: "2", k: "Sales per store, per day", v: "₹5.8 lakh vs ₹8.3 lakh" },
    { at: st("c7_03"), n: "3", k: "Instamart's switch to inventory", v: "approved Oct 2026 · timeline and margin impact" },
    { at: st("c7_04"), n: "+", k: "Blinkit's margin while it expands", v: "now 0.9% of NOV" },
  ];
  return (
    <Shot t={t} a={st("c7_00")} z={en("c7_04")}>
      <Kicker text="07 · AAGE KYA DEKHEIN · NEXT QUARTER" />
      <Headline t={t} at={st("c7_00") + 0.1} lines={["Teen number · aur ek bonus"]} size={90} />
      <div style={{ position: "absolute", left: 140, top: 340, width: 1640 }}>
        {items.map((it) => {
          const p = appear(t, it.at, 0.6);
          return (
            <Glass key={it.n} style={{ position: "relative", marginBottom: 22, padding: "24px 34px", display: "flex", alignItems: "center", gap: 34, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}
              tint={it.n === "+" ? "rgba(248,203,70,0.12)" : "rgba(255,255,255,0.08)"}>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 80, color: it.n === "+" ? C.blinkit : C.swiggy, width: 70 }}>{it.n}</div>
              <div>
                <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 42, color: C.ink }}>{it.k}</div>
                <div style={{ fontFamily: mono, fontSize: 26, color: C.inkDim, marginTop: 6 }}>{it.v}</div>
              </div>
            </Glass>
          );
        })}
      </div>
    </Shot>
  );
};

/* ================================================= CLOSE (English, sunrise) + END CARD */
export const CloseSection: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Shot t={t} a={st("close_00")} z={en("close_00")}>
      <div style={{ position: "absolute", left: 140, top: 300, width: 1400 }}>
        <Rise t={t} at={st("close_00") + 0.3}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 96, color: C.ink, lineHeight: 1.1 }}>Nearly 4,000 dark stores</div></Rise>
        <Rise t={t} at={st("close_00") + 1.0}><div style={{ fontFamily: sans, fontSize: 40, color: "rgba(245,241,234,0.88)", marginTop: 20 }}>restocked every night for tomorrow's ten-minute promise</div></Rise>
      </div>
      <Note t={t} at={st("close_00") + 1} text="Blinkit 2,751 + Instamart 1,240 = 3,991 (company filings, 30 Sep 2026)" />
    </Shot>
    <Shot t={t} a={st("close_01")} z={en("close_01")}>
      <div style={{ position: "absolute", left: 140, top: 200, width: 1400 }}>
        <Rise t={t} at={st("close_01") + 0.2}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 84, color: C.ink, lineHeight: 1.1 }}>Both keep the promise</div></Rise>
        <Rise t={t} at={st("close_01") + 0.8}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 84, color: C.ink, lineHeight: 1.1 }}>Only one gets paid for it</div></Rise>
      </div>
      <DayMeters t={t} a={st("close_01") + 1.2} top={520} />
    </Shot>
    <Shot t={t} a={st("close_02")} z={en("close_02")}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", gap: 90 }}>
        {["The store", "The margin", "The switch"].map((w, i) => (
          <Rise key={w} t={t} at={st("close_02") + 4 + i * 0.6}><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 104, color: C.ink }}>{w}</div></Rise>
        ))}
      </div>
    </Shot>
    <Shot t={t} a={st("close_03")} z={DURATION}>
      <EndCard t={t} a={st("close_03")} />
    </Shot>
  </>
);

const EndCard: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const credits = "Images: Vidur Malhotra (PD), bharatte, Navaneeth K N, souravdas, Manoj Kengudelu, wili_hybrid, Peter Richmond, Tracy Hunter, Dennis S. Hurd (CC0), debbietingzon, Robert Stinnett, Rk Rao, Rakesh Krishna Kumar (CC BY-SA), deshpanderohan.law, AndreasPoike, Mahin Fayaz (CC BY 2.0 unless noted), via Openverse · Map: DataMeet India (CC BY 4.0) · Font: Playfair Display (OFL)";
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 55%)", opacity: appear(t, a + 3) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
        <Rise t={t} at={a + 0.2}><div style={{ fontFamily: sans, fontWeight: 800, fontSize: 130, letterSpacing: "0.32em", color: C.ink, paddingLeft: "0.32em" }}>AVRON</div></Rise>
        <Rise t={t} at={a + 0.7}><div style={{ fontFamily: sans, fontSize: 30, letterSpacing: "0.36em", color: "rgba(245,241,234,0.85)", marginTop: 14 }}>THE STORY BEHIND THE STOCK</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 200, right: 200, top: 640, opacity: appear(t, a + 3.5), fontFamily: mono, color: C.ink }}>
        <div style={{ fontSize: 22, color: C.blinkit, letterSpacing: "0.16em", marginBottom: 12 }}>SOURCES</div>
        <div style={{ fontSize: 22, lineHeight: 1.6 }}>
          Swiggy Q2 FY27 results & press release (NSE, 22 Oct 2026) · Eternal shareholders' letter & results (NSE, 21 Oct 2026) · Screener (market cap, annual figures) · QuickCommerceMap (Jul 2026) · CNBC-TV18, Bloomberg (23 Oct 2026) · IIFL, Inc42 (Blinkit deal) · MediaNama (inventory model)
        </div>
        <div style={{ fontSize: 17, lineHeight: 1.55, color: C.inkDim, marginTop: 18 }}>{credits}</div>
        <div style={{ fontSize: 18, lineHeight: 1.55, color: C.inkDim, marginTop: 14 }}>
          Logos are trademarks of their owners, used editorially · Education only · Not investment advice · No buy, sell or hold call · AVRON is not SEBI-registered
        </div>
      </div>
    </AbsoluteFill>
  );
};

