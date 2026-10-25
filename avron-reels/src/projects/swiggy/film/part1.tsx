import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease } from "../../../engine/anim";
import { C, count, Glass, mono, Rise, sans, serif } from "../look";
import { MapEdge } from "../StyleFrames";
import { Bars, crore, Headline, Kicker, LOGO, Note, PhotoInsert, Shot, Stat, warp } from "./kit";
import { DarkStoreScene, FixedCostScene, PaperStage } from "./Paper";
import { en, st } from "./timeline";

/* ================================================= COLD OPEN (English, night) */
const Phone: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const k = t - a;
  const rise = ease.outExpo(clamp01(k / 1.2));
  const push = ease.inOutCubic(clamp01((k - 6.5) / 3.5)); // the "10" grows into the frame
  return (
    <div style={{ position: "absolute", left: 1180, top: 150, width: 380, height: 780, borderRadius: 56, background: "linear-gradient(160deg,#1a1c22,#07080b)",
      border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 80px rgba(252,128,25,0.12)",
      transform: `translateY(${(1 - rise) * 500}px) rotate(${-4 + 0.3 * k}deg) scale(${1 + 0.25 * push})`, transformOrigin: "50% 45%" }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: 44, background: "radial-gradient(80% 60% at 50% 30%, #2a2018, #0b0b0f)" }} />
      <Glass style={{ left: 30, right: 30, top: 120, padding: "22px 24px", borderRadius: 22, opacity: clamp01((k - 0.8) / 0.4) }} tint="rgba(255,255,255,0.14)">
        <div style={{ fontFamily: sans, fontSize: 20, color: C.inkDim, letterSpacing: "0.04em" }}>NOW</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 6 }}>Your order is arriving in</div>
      </Glass>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: serif, fontWeight: 700, fontSize: 230, color: C.ink, lineHeight: 1,
        textShadow: "0 0 40px rgba(252,128,25,0.35)", opacity: clamp01((k - 1.1) / 0.4) }}>10</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 570, textAlign: "center", fontFamily: sans, fontSize: 30, letterSpacing: "0.3em", color: C.inkDim, opacity: clamp01((k - 1.3) / 0.4) }}>MINUTES</div>
    </div>
  );
};

/** Per-day counters: the film's motif. Values tick up through the day like a meter. */
export const DayMeters: React.FC<{ t: number; a: number; top?: number; left?: number; scale?: number }> = ({ t, a, top = 620, left = 160, scale = 1 }) => {
  const p = ease.outExpo(clamp01((t - a) / 0.8));
  const tick = Math.max(0, t - a - 0.6);
  return (
    <div style={{ position: "absolute", left, top, display: "flex", gap: 40, transform: `scale(${scale})`, transformOrigin: "0 0", opacity: p }}>
      <Glass style={{ position: "relative", width: 640 }} tint="rgba(252,128,25,0.14)">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{LOGO.instamart}<span style={{ fontFamily: mono, fontSize: 24, color: C.inkDim }}>EVERY DAY</span></div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 110, color: C.loss, letterSpacing: "-0.04em", marginTop: 14 }}>−₹{count(t, a + 0.3, 9.7, 1.4).toFixed(1)} Cr</div>
        <div style={{ fontFamily: mono, fontSize: 22, color: C.inkDim }}>lost so far in this shot · ₹{(tick * 9.7e7 / 86400 / 1e5).toFixed(2)} lakh</div>
      </Glass>
      <Glass style={{ position: "relative", width: 640 }} tint="rgba(248,203,70,0.14)">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>{LOGO.blinkit}<span style={{ fontFamily: mono, fontSize: 24, color: C.inkDim }}>BLINKIT · EVERY DAY</span></div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 110, color: C.gain, letterSpacing: "-0.04em", marginTop: 14 }}>+₹{count(t, a + 0.45, 2.0, 1.4).toFixed(1)} Cr</div>
        <div style={{ fontFamily: mono, fontSize: 22, color: C.inkDim }}>earned so far in this shot · ₹{(tick * 2.0e7 / 86400 / 1e5).toFixed(2)} lakh</div>
      </Glass>
    </div>
  );
};

export const OpenSection: React.FC<{ t: number }> = ({ t }) => {
  const shade = <div style={{ position: "absolute", left: 0, top: 480, width: 1250, height: 600, background: "radial-gradient(70% 60% at 25% 60%, rgba(0,0,0,0.65), transparent 75%)" }} />;
  return (
    <>
      {/* 0 · establishing: the city at 2 a.m., then the phone */}
      <Shot t={t} a={1.0} z={en("open_00")}>
        <Phone t={t} a={1.5} />
        {shade}
        <Headline t={t} at={st("open_00") + 0.1} lines={["Ten minutes"]} size={110} top={640} />
        <div style={{ position: "absolute", left: 140, top: 790, width: 980, fontFamily: sans, fontSize: 34, color: "rgba(245,241,234,0.86)", opacity: clamp01((t - st("open_00") - 0.8) / 0.5) }}>
          Milk, bread, a phone charger · at your door before the kettle boils
        </div>
      </Shot>
      {/* 1 · two companies, two apps */}
      <Shot t={t} a={st("open_01")} z={en("open_01")}>
        {shade}
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 220, alignItems: "center" }}>
          {[LOGO.instamart, LOGO.blinkit].map((l, i) => {
            const p = ease.outExpo(clamp01((t - st("open_01") - 0.3 - i * 0.3) / 0.8));
            return <div key={i} style={{ transform: `translateX(${(i ? 1 : -1) * (1 - p) * 300}px) scale(${i ? 2.2 : 1.4})`, opacity: p }}>{l}</div>;
          })}
        </div>
        <Headline t={t} at={st("open_01") + 1.2} lines={["Two companies · two apps", "one expensive war"]} size={78} top={620} />
      </Shot>
      {/* 2 · the crash */}
      <Shot t={t} a={st("open_02")} z={en("open_02")}>
        <Stat t={t} at={st("open_02") + 0.6} label="NSE: SWIGGY · FRIDAY 23 OCT 2026" value={16} fmt={(v) => `−${Math.round(v)}%`} color={C.loss} size={190}
          caption="Intraday fall, its biggest one-day drop since listing" logo={LOGO.swiggy} style={{ left: 140, top: 200, width: 1000 }} tint="rgba(252,128,25,0.12)" />
        <Note t={t} at={st("open_02") + 1} text="Source: CNBC-TV18, Bloomberg (23 Oct 2026)" />
      </Shot>
      {/* 3 · the rival's profit */}
      <Shot t={t} a={st("open_03")} z={en("open_03")}>
        <Stat t={t} at={st("open_03") + 0.6} label="BLINKIT · Q2 FY27 · ADJUSTED EBITDA" value={184} fmt={(v) => `+₹${Math.round(v)} Cr`} color={C.gain} size={190}
          caption="Same cities · same customers · same ten-minute promise" logo={<div style={{ display: "flex", gap: 20, alignItems: "center" }}>{LOGO.blinkit}{LOGO.eternal}</div>}
          style={{ left: 780, top: 200, width: 1000 }} tint="rgba(248,203,70,0.12)" />
        <Note t={t} at={st("open_03") + 1} text="Source: Eternal shareholders' letter, Q2 FY27 (NSE, 21 Oct 2026)" />
      </Shot>
      {/* 4 · the motif */}
      <Shot t={t} a={st("open_04")} z={en("open_04")}>
        <Headline t={t} at={st("open_04") + 0.2} lines={["Every single day"]} size={84} top={300} />
        <DayMeters t={t} a={st("open_04") + 0.4} top={470} />
        <Note t={t} at={st("open_04") + 1} text="AVRON calc · Instamart adjusted EBITDA loss ₹895 Cr ÷ 92 days = ₹9.7 Cr · Blinkit ₹184 Cr ÷ 92 = ₹2.0 Cr" />
      </Shot>
      {/* 5 · title + language switch */}
      <Shot t={t} a={st("open_05") - 0.2} z={en("open_05") + 2.0}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, height: 380, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.55) 70%, transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}>
          <Rise t={t} at={st("open_05")}><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 168, color: C.ink }}>₹9.7 Crore a Day</div></Rise>
          <Rise t={t} at={st("open_05") + 0.4}><div style={{ fontFamily: sans, fontSize: 32, letterSpacing: "0.35em", color: C.inkDim, marginTop: 8 }}>SWIGGY VS ETERNAL · THE QUICK-COMMERCE WAR AFTER Q2</div></Rise>
          <Rise t={t} at={st("open_05") + 1.6} style={{ marginTop: 60 }}><div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 40, color: C.blinkit }}>Ab kahani, aapki zubaan mein</div></Rise>
        </div>
      </Shot>
    </>
  );
};

/* ================================================= CHAPTER 1 · DO RAASTE (dawn) */
export const C1Section: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Shot t={t} a={st("c1_00")} z={en("c1_00")}>
      <Kicker text="01 · DO RAASTE" />
      <PhotoInsert t={t} at={st("c1_00") + 1.4} src="swiggy/traffic_1.jpg" credit="Bengaluru · Peter Richmond · CC BY 2.0" left={1290} top={420} w={490} h={330} />
      <Headline t={t} at={st("c1_00") + 0.2} lines={["Kahani khaane se shuru hoti hai"]} />
      <div style={{ position: "absolute", left: 140, top: 420, display: "flex", gap: 40 }}>
        <Glass style={{ position: "relative", width: 520 }} tint="rgba(226,55,68,0.14)">
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: C.zomato }}>zomato</div>
          <div style={{ fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 10 }}>Food delivery · now part of Eternal</div>
        </Glass>
        <Glass style={{ position: "relative", width: 520 }} tint="rgba(252,128,25,0.14)">
          {LOGO.swiggy}
          <div style={{ fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 10 }}>Food delivery · the original rival</div>
        </Glass>
      </div>
      <Headline t={t} at={st("c1_00") + 2.5} lines={["Restaurant · delivery partner · discount · nuksaan"]} size={44} top={760} color={C.inkDim} />
    </Shot>
    <Shot t={t} a={st("c1_01")} z={en("c1_01")}>
      <Kicker text="01 · DO RAASTE" />
      <Headline t={t} at={st("c1_01") + 0.2} lines={["Phir ek naya darwaaza · groceries"]} />
      <Stat t={t} at={st("c1_01") + 1.8} label="2022 · ZOMATO BUYS BLINKIT (EX-GROFERS)" value={4447} fmt={(v) => `~₹${Math.round(v).toLocaleString("en-IN")} Cr`} size={120}
        caption="All-stock deal · Swiggy builds its own: Instamart" logo={LOGO.blinkit} style={{ left: 140, top: 400, width: 900 }} tint="rgba(248,203,70,0.12)" />
      <Note t={t} at={st("c1_01") + 2} text="Source: Zomato board approval, 2022 (IIFL, Inc42)" />
    </Shot>
    <Shot t={t} a={st("c1_02")} z={en("c1_02")}>
      <PaperStage t={t} a={st("c1_02")} kicker="01 · DO RAASTE" title="The dark store">
        <DarkStoreScene t={warp(t, st("c1_02"), en("c1_02"), 24)} a={st("c1_02")} />
      </PaperStage>
    </Shot>
    <Shot t={t} a={st("c1_03")} z={en("c1_03")}>
      <Kicker text="01 · DO RAASTE" />
      <Headline t={t} at={st("c1_03") + 0.2} lines={["Do shabd yaad rakhiye"]} />
      <Receipts t={t} a={st("c1_03") + 1.0} />
    </Shot>
    <Shot t={t} a={st("c1_04")} z={en("c1_05")}>
      <Kicker text="01 · DO RAASTE" />
      <Headline t={t} at={st("c1_04") + 0.2} lines={["Market value today"]} />
      <Bars t={t} at={st("c1_04") + 1.0} max={306302} top={420} rows={[
        { label: "Eternal (Zomato + Blinkit)", value: 306302, color: C.blinkit, text: "₹3,06,302 Cr" },
        { label: "Swiggy (incl. Instamart)", value: 48582, color: C.swiggy, text: "₹48,582 Cr" },
      ]} />
      <div style={{ position: "absolute", left: 1420, top: 400, textAlign: "right", opacity: clamp01((t - st("c1_05")) / 0.5) }}>
        <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 200, color: C.ink }}>6.3x</div>
        <div style={{ fontFamily: sans, fontSize: 30, color: C.inkDim }}>same business · six times the value</div>
      </div>
      <Note t={t} at={st("c1_04") + 1} text="Market cap as per Screener export (Eternal at ₹317.4, Swiggy at ₹176) · 3,06,302 ÷ 48,582 = 6.3x" />
    </Shot>
  </>
);

/** GOV vs NOV: two receipts, the discount line strikes through on the second. */
const Receipts: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const r = (x: number, title: string, sub: string, strike: boolean, at: number) => {
    const p = ease.outExpo(clamp01((t - at) / 0.8));
    const s = clamp01((t - at - 1.2) / 0.6);
    return (
      <div style={{ position: "absolute", left: x, top: 380, width: 600, padding: "40px 46px", background: "#F4EFE6", color: "#1D1A16", borderRadius: 6,
        boxShadow: "0 40px 80px rgba(0,0,0,0.45)", transform: `translateY(${(1 - p) * 120}px) rotate(${strike ? 1.5 : -1.5}deg)`, opacity: p, fontFamily: mono }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 56 }}>{title}</div>
        <div style={{ fontSize: 24, color: "#6B6256", marginTop: 6 }}>{sub}</div>
        <div style={{ borderTop: "2px dashed #B8AE9E", margin: "26px 0" }} />
        {[["Items", "₹500"], ["Delivery + fees", "₹40"], ["Discount", "−₹60"]].map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 30, marginBottom: 12, position: "relative", opacity: !strike && i === 2 ? 0.35 : 1 }}>
            <span>{k}</span><span>{v}</span>
            {strike && i === 2 && <div style={{ position: "absolute", left: 0, top: "52%", height: 3, width: `${s * 100}%`, background: C.loss }} />}
          </div>
        ))}
        <div style={{ borderTop: "2px solid #1D1A16", marginTop: 18, paddingTop: 14, display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 700 }}>
          <span>{strike ? "Value after discount" : "Value before discount"}</span>
        </div>
      </div>
    );
  };
  return (
    <>
      {r(140, "GOV", "Gross order value · before discounts", false, a)}
      {r(820, "NOV", "Net order value · after discounts", true, a + 0.4)}
      <Note t={t} at={a + 1.5} text="Illustration only (not company numbers) · Each company defines GOV/NOV slightly differently; we flag it on screen wherever it matters" />
    </>
  );
};

/* ================================================= CHAPTER 2 · SCOREBOARD (morning) */
export const C2Section: React.FC<{ t: number }> = ({ t }) => {
  const K = <Kicker text="02 · SCOREBOARD · Q2 FY27 (JUL–SEP 2026)" />;
  const two = (a: number, left: { label: string; v: number; fmt?: (v: number) => string; cap?: string }, right: { label: string; v: number; fmt?: (v: number) => string; cap?: string }) => (
    <>
      <Stat t={t} at={a} label={left.label} value={left.v} fmt={left.fmt} caption={left.cap} logo={LOGO.instamart} style={{ left: 140, top: 300, width: 760 }} tint="rgba(252,128,25,0.12)" />
      <Stat t={t} at={a + 0.25} label={right.label} value={right.v} fmt={right.fmt} caption={right.cap} logo={<div style={{ display: "flex", gap: 18, alignItems: "center" }}>{LOGO.blinkit}<span style={{ fontFamily: sans, fontSize: 28, color: C.inkDim }}>by Eternal</span></div>}
        style={{ left: 1020, top: 300, width: 760 }} tint="rgba(248,203,70,0.12)" />
    </>
  );
  return (
    <>
      <Shot t={t} a={st("c2_00")} z={en("c2_01")}>
        {K}
        {two(st("c2_00") + 0.6, { label: "INSTAMART · NOV", v: 6594, fmt: crore, cap: "+31.4% YoY · +13.4% QoQ" }, { label: "BLINKIT · NOV", v: 20940, fmt: crore, cap: "+79.3% YoY · +22.2% QoQ" })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", opacity: clamp01((t - st("c2_01")) / 0.5) }}>
          <span style={{ fontFamily: serif, fontWeight: 700, fontSize: 110, color: C.ink }}>3.2x</span>
          <span style={{ fontFamily: sans, fontSize: 34, color: C.inkDim, marginLeft: 24 }}>bigger · 20,940 ÷ 6,594</span>
        </div>
        <Note t={t} at={st("c2_00") + 1} text="Sources: Swiggy press release & Eternal shareholders' letter, Q2 FY27 (NSE) · NOV = order value after discounts" />
      </Shot>
      <Shot t={t} a={st("c2_02")} z={en("c2_02")}>
        {K}
        {two(st("c2_02") + 0.3, { label: "INSTAMART · DARK STORES", v: 1240, cap: "+69 this quarter (= previous three quarters combined)" }, { label: "BLINKIT · DARK STORES", v: 2751, cap: "+308 this quarter · target 3,500+ by Mar 2027" })}
        <Note t={t} at={st("c2_02") + 1} text="Sources: Swiggy press release; Eternal shareholders' letter (Q2 FY27)" />
      </Shot>
      {t >= st("c2_03") - 0.4 && t < en("c2_04") + 0.5 && (
        <AbsoluteFill style={{ opacity: ease.outCubic(clamp01((t - st("c2_03") + 0.4) / 0.4)) * (1 - ease.inCubic(clamp01((t - en("c2_04")) / 0.4))) }}>
          <MapEdge t={t} a={st("c2_03") - 0.3} z={en("c2_04") + 0.4} />
        </AbsoluteFill>
      )}
      <Shot t={t} a={st("c2_05")} z={en("c2_06")}>
        {K}
        <Headline t={t} at={st("c2_05") + 0.1} lines={["Har store · har din · kitna bechta hai"]} />
        {two(st("c2_06") + 0.2, { label: "INSTAMART · PER STORE PER DAY", v: 5.8, fmt: (v) => `₹${v.toFixed(1)} lakh` }, { label: "BLINKIT · PER STORE PER DAY", v: 8.3, fmt: (v) => `₹${v.toFixed(1)} lakh` })}
        <Note t={t} at={st("c2_06") + 1} text="AVRON calc · NOV ÷ stores at quarter end ÷ 92 days · Blinkit 20,940 Cr ÷ 2,751 ÷ 92 = ₹8.3 lakh · Instamart 6,594 Cr ÷ 1,240 ÷ 92 = ₹5.8 lakh" />
      </Shot>
      <Shot t={t} a={st("c2_07")} z={en("c2_07")}>
        <PaperStage t={t} a={st("c2_07")} kicker="02 · SCOREBOARD" title="Kiraya · bijli · staff · sab fixed" note="Sales per store per day: AVRON calc from company filings">
          <FixedCostScene t={warp(t, st("c2_07"), en("c2_07"), 9)} a={st("c2_07")} />
        </PaperStage>
      </Shot>
      <Shot t={t} a={st("c2_08")} z={en("c2_10")}>
        {K}
        <Headline t={t} at={st("c2_08") + 0.1} lines={["Har ₹100 ke order pe"]} />
        <Notes100 t={t} a={st("c2_08") + 0.8} />
        <div style={{ position: "absolute", left: 140, top: 820, width: 1640, opacity: clamp01((t - st("c2_09")) / 0.5), fontFamily: sans, fontSize: 34, color: C.ink }}>
          Blinkit margin up <b style={{ color: C.gain }}>6 quarters in a row</b> · a year ago: <b style={{ color: C.loss }}>−₹156 Cr</b>
        </div>
        <div style={{ position: "absolute", left: 140, top: 890, width: 1640, opacity: clamp01((t - st("c2_10")) / 0.5), fontFamily: sans, fontSize: 34, color: C.ink }}>
          88 paise × ₹20,940 Cr of orders = <b style={{ color: C.gain }}>₹184 Cr</b> · Instamart this quarter: <b style={{ color: C.loss }}>−₹895 Cr</b>
        </div>
        <Note t={t} at={st("c2_08") + 1} text="AVRON calc, NOV basis · Blinkit 184 ÷ 20,940 = +0.88% · Instamart −895 ÷ 6,594 = −13.57% · definitions differ slightly by company" />
      </Shot>
      <Shot t={t} a={st("c2_11")} z={en("c2_11")}>
        {K}
        <Headline t={t} at={st("c2_11") + 0.1} lines={["Instamart badh raha hai", "lekin har order abhi bhi nuksaan mein"]} size={78} />
        <div style={{ position: "absolute", left: 140, top: 480, display: "flex", gap: 40 }}>
          <Stat t={t} at={st("c2_11") + 1.0} label="ORDERS · YoY" value={31.4} fmt={(v) => `+${v.toFixed(1)}%`} color={C.gain} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c2_11") + 1.3} label="ORDERS · QoQ" value={13.4} fmt={(v) => `+${v.toFixed(1)}%`} color={C.gain} style={{ position: "relative", width: 520 }} />
          <Stat t={t} at={st("c2_11") + 1.6} label="ADJ. EBITDA MARGIN" value={9.7} fmt={(v) => `−${v.toFixed(1)}%`} color={C.loss} caption="of GOV" style={{ position: "relative", width: 520 }} />
        </div>
        <Note t={t} at={st("c2_11") + 1} text="Source: Swiggy press release, Q2 FY27 ('accelerated growth as guided')" />
      </Shot>
    </>
  );
};

/** Two ₹100 notes: one earns 88 paise, one loses ₹13.57 (the orange note's edge burns slowly). */
const Notes100: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const note = (x: number, col: string, label: string, value: string, vcol: string, at: number, burn: boolean) => {
    const p = ease.outExpo(clamp01((t - at) / 0.8));
    const b = burn ? clamp01((t - at - 1.2) / 6) : 0;
    return (
      <div style={{ position: "absolute", left: x, top: 330, width: 760, transform: `translateY(${(1 - p) * 80}px)`, opacity: p }}>
        <div style={{ height: 300, borderRadius: 18, background: `linear-gradient(135deg, ${col}, #1a1a1a 160%)`, border: "2px solid rgba(255,255,255,0.25)", position: "relative", overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,0.45)" }}>
          <div style={{ position: "absolute", left: 36, top: 26, fontFamily: serif, fontWeight: 700, fontSize: 120, color: "rgba(255,255,255,0.9)" }}>₹100</div>
          <div style={{ position: "absolute", left: 40, bottom: 26, fontFamily: mono, fontSize: 24, letterSpacing: "0.12em", color: "rgba(255,255,255,0.85)" }}>{label}</div>
          {burn && <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${b * 14}%`, background: "linear-gradient(90deg, rgba(255,120,40,0.9), #120a06 30%)" }} />}
        </div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 96, color: vcol, marginTop: 20, letterSpacing: "-0.03em" }}>{value}</div>
      </div>
    );
  };
  return (
    <>
      {note(140, "#8A5A1A", "INSTAMART", "−₹13.57", C.loss, a, true)}
      {note(1020, "#6E6A1E", "BLINKIT", "+₹0.88", C.gain, a + 0.3, false)}
    </>
  );
};
