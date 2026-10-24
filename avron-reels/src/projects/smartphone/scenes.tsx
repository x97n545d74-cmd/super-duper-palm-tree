import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease, lerp, prog, rand } from "../../engine/anim";
import { Counter, Label, SourceTag, SweepText, WordReveal } from "../../engine/components/Kinetic";
import { DataRoom } from "../../engine/components/DataRoom";
import { fadeWin } from "../viviana/ui";
import { at, CUE, S } from "./config";

const G = layout.gutter;
const RED = "#FF5A55";
const deva: React.CSSProperties = { fontFamily: font.deva, fontWeight: 800, color: color.ink, letterSpacing: "-0.015em" };
const glass: React.CSSProperties = {
  borderRadius: 22, padding: "26px 32px", background: "linear-gradient(160deg, rgba(24,26,32,0.88), rgba(9,10,13,0.92))",
  border: "1.5px solid rgba(243,241,236,0.14)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
};

/** Bottom source tags: one shared style for every credit in the reel, stacked upward from the safe line. */
const TAG_Y = 1500;
const BottomTags: React.FC<{ t: number; tags: { text: string; start: number; end?: number; estimate?: boolean }[] }> = ({ t, tags }) => {
  const live = tags.filter((g) => t >= g.start && (g.end === undefined || t < g.end));
  return (
    <div style={{ position: "absolute", left: G, right: 120, bottom: 1920 - TAG_Y - 52, display: "flex", flexDirection: "column-reverse", alignItems: "flex-start", gap: 10 }}>
      {live.map((g, i) => (
        <SourceTag key={g.text} text={g.text} t={t} start={g.start} estimate={g.estimate} style={{ fontSize: 22, padding: "10px 18px", opacity: g.end ? 1 - prog(t, g.end - 0.25, 0.25) : undefined }} />
      ))}
    </div>
  );
};

/* ------------------------------------------------ 0. OPENING CLIP (IGR, 1.5x) with hook text and the Q3 stat popup */
export const Opening: React.FC<{ t: number }> = ({ t }) => {
  const turn = CUE.turn, ship = CUE.ship;
  // camera: slow push, a soft push on "But this year", a zoom punch + shake on "shipments have fallen sharply",
  // and a small punch on "why buy a new phone"
  const why = 17.46;
  const punch = 0.17 * prog(t, ship, 0.22, ease.outExpo) - 0.09 * prog(t, ship + 0.25, 1.4, ease.inOutCubic);
  const s = 1 + 0.004 * t + 0.045 * prog(t, turn, 0.9, ease.inOutCubic) + punch + 0.035 * prog(t, why, 0.18, ease.outExpo) - 0.02 * prog(t, why + 0.2, 1.0, ease.inOutCubic);
  const shakeK = Math.max(0, 1 - (t - ship) / 0.45) * (t >= ship ? 1 : 0);
  const sx = (rand(Math.floor(t * 60)) - 0.5) * 22 * shakeK, sy = (rand(Math.floor(t * 60) + 7) - 0.5) * 16 * shakeK;
  const BAND_TOP = 610, BAND_H = 594;
  const hookOut = prog(t, ship - 0.25, 0.25, ease.inCubic);
  const stat = prog(t, ship, 0.35, ease.outExpo);
  const honest = 16.4;
  const out = prog(t, S.clip[1] - 0.12, 0.12);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <OffthreadVideo src={staticFile("smartphone/bg.mp4")} muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${1.08 + 0.003 * t})` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.82) 0%, rgba(6,7,10,0.35) 30%, rgba(6,7,10,0.35) 62%, rgba(6,7,10,0.9) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: BAND_TOP, width: 1080, height: BAND_H, transform: `translate(${sx}px, ${sy}px) scale(${s})`, transformOrigin: "50% 50%",
        boxShadow: "0 50px 120px rgba(0,0,0,0.75), 0 0 0 1.5px rgba(243,241,236,0.10)" }}>
        <OffthreadVideo src={staticFile("smartphone/band.mp4")} muted style={{ width: 1080, height: BAND_H }} />
        {/* cinematic grade on top of the ffmpeg grade: teal shadows, vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)", mixBlendMode: "multiply" }} />
      </div>

      {/* hook text, top band, out when the stat lands */}
      <div style={{ position: "absolute", left: G, right: G, top: 250, opacity: 1 - hookOut, transform: `translateY(${-30 * hookOut}px)` }}>
        <Label text="INDIA · SMARTPHONES · Q3 2026" t={t} start={0.15} tint={color.amber} />
        <WordReveal text="Festive season में भी" t={t} start={0.35} style={{ ...deva, fontSize: 92, lineHeight: 1.05, marginTop: 18 }} />
        <WordReveal text="phone market ठंडा।" t={t} start={0.75} style={{ ...deva, fontSize: 92, lineHeight: 1.05, color: color.amberHot }} />
      </div>

      {/* Q3 stat popup: a range, because the two trackers measure differently */}
      {t >= ship - 0.05 && (
        <div style={{ position: "absolute", left: G, right: G, top: 228, opacity: stat * (1 - out) }}>
          <Label text="Q3 2026 · SHIPMENTS · YoY" t={t} start={ship} tint={color.inkDim} />
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 116, letterSpacing: "-0.05em", color: RED, lineHeight: 1, marginTop: 6, whiteSpace: "nowrap",
            transform: `scale(${lerp(1.5, 1, stat)})`, transformOrigin: "0% 60%", textShadow: "0 8px 40px rgba(240,82,79,0.35)" }}>
            −<Counter to={20} t={t} start={ship} dur={0.5} />% <span style={{ ...deva, fontSize: 54, color: color.inkDim }}>से</span> −<Counter to={26} t={t} start={ship + 0.1} dur={0.55} />%
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexDirection: "column", alignItems: "flex-start" }}>
            {[["Counterpoint", "−20%"], ["Omdia", "−26% · 35.8M units · 2016 के बाद सबसे कम Q3"]].map(([k, v], i) => {
              const p = prog(t, ship + 0.35 + i * 0.22, 0.4, ease.outExpo);
              return (
                <div key={k} style={{ fontFamily: font.deva, fontSize: 25, fontWeight: 600, color: color.ink, background: "rgba(13,16,21,0.82)", border: `1.5px solid ${color.line}`,
                  borderRadius: 12, padding: "9px 16px", opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
                  <b style={{ color: color.amberHot }}>{k}</b> {v}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* the honest line: shipments are not purchases */}
      {t >= honest && (
        <div style={{ position: "absolute", left: G, right: G, top: 1252, ...glass, padding: "16px 24px", opacity: prog(t, honest, 0.4) * (1 - out),
          transform: `translateY(${(1 - prog(t, honest, 0.5, ease.outExpo)) * 30}px)` }}>
          <div style={{ fontFamily: font.mono, fontSize: 20, color: color.amber, letterSpacing: "0.12em", marginBottom: 8 }}>NOTE</div>
          <div style={{ ...deva, fontWeight: 600, fontSize: 28, lineHeight: 1.3, color: color.ink }}>
            Shipments यानी दुकानों तक भेजे गए phones, ख़रीदे गए नहीं। Dealers ने stock कम मँगाया, और Diwali भी late थी।
          </div>
        </div>
      )}

      <BottomTags t={t} tags={[
        { text: "Source: India Global Review (YouTube)", start: 0.1 },
        { text: "Counterpoint, 23 Oct 2026 · Omdia, 19 Oct 2026", start: ship + 0.3 },
      ]} />
    </div>
  );
};

/* ------------------------------------------------ 1. BUDGET: sub-₹10k price jump and shipment crash */
export const Budget: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.budget;
  const r10 = at("b1_budget", "₹10,000"), p32 = at("b1_budget", "32%"), p65 = at("b1_budget", "65%");
  const priceP = prog(t, p32 - 0.4, 0.9, ease.outExpo);
  const shipP = prog(t, p65 - 0.3, 1.3, ease.inOutCubic);
  const q3 = p65 + 0.7;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.amber} drift={0.5} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Label text="H1 2026 · INDIA" t={t} start={a} tint={color.amber} />
        <div style={{ ...deva, fontSize: 84, lineHeight: 1.05, marginTop: 14, opacity: prog(t, a + 0.1, 0.4) }}>
          <span style={{ color: color.amberHot }}>₹10,000</span> से नीचे वाले phones
        </div>
      </div>

      {/* price: index 100 → 132 */}
      <div style={{ position: "absolute", left: G, right: G, top: 520, ...glass, opacity: prog(t, r10, 0.4), transform: `translateY(${(1 - prog(t, r10, 0.5, ease.outExpo)) * 40}px)` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ ...deva, fontSize: 40, color: color.inkDim }}>औसत दाम</div>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 120, color: color.amberHot, letterSpacing: "-0.04em", lineHeight: 1 }}>
            +<Counter to={32} t={t} start={p32 - 0.45} dur={0.8} />%
          </div>
        </div>
        <div style={{ position: "relative", height: 26, marginTop: 18, borderRadius: 13, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(100 / 132) * 100}%`, borderRadius: 13, background: "rgba(243,241,236,0.28)" }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${lerp(100 / 132, 1, priceP) * 100}%`, borderRadius: 13,
            background: `linear-gradient(90deg, rgba(243,241,236,0.0) ${(100 / 132) * 100 - 2}%, ${color.amber} ${(100 / 132) * 100}%)` }} />
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkFaint, marginTop: 12, opacity: priceP }}>index: 100 × 1.32 = 132 (लगभग)</div>
      </div>

      {/* shipments: 100 → 35 */}
      <div style={{ position: "absolute", left: G, right: G, top: 860, ...glass, opacity: prog(t, p32 + 0.5, 0.4) }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 40, color: color.inkDim }}>Shipments</div>
          <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 120, color: RED, letterSpacing: "-0.04em", lineHeight: 1, opacity: prog(t, p65 - 0.1, 0.3) }}>
            −<Counter to={65} t={t} start={p65 - 0.2} dur={1.2} />%
          </div>
        </div>
        <div style={{ position: "relative", height: 26, marginTop: 18, borderRadius: 13, background: "rgba(255,255,255,0.06)", border: "1.5px dashed rgba(243,241,236,0.18)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${lerp(100, 35, shipP)}%`, borderRadius: 13, background: lerp(0, 1, shipP) > 0.5 ? RED : color.steel }} />
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkFaint, marginTop: 12, opacity: shipP }}>100 − 65 = 35 · H1 2025 के मुक़ाबले</div>
      </div>

      {/* Q3 follow-up: below ₹20k */}
      <div style={{ position: "absolute", left: G, right: G, top: 1180, ...deva, fontWeight: 600, fontSize: 34, color: color.inkDim, opacity: prog(t, q3, 0.4) * (1 - prog(t, b - 0.3, 0.3)) }}>
        Q3 2026: ₹20,000 से नीचे shipments <span style={{ color: RED, fontWeight: 800 }}>−47%</span>
      </div>

      <BottomTags t={t} tags={[
        { text: "Counterpoint, H1 2026 price analysis (29 Sep 2026)", start: r10 },
        { text: "Counterpoint, Q3 2026 (23 Oct 2026)", start: q3 },
      ]} />
    </div>
  );
};

/* ------------------------------------------------ 2. MEMORY: AI data centres soak up DRAM/NAND; weaker rupee */
export const Memory: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.memory;
  const ai = at("b2_memory", "AI"), dram = at("b2_memory", "DRAM"), rupee = at("b2_memory", "rupee"), cost = at("b2_memory", "cost");
  const chipP = prog(t, a + 0.1, 0.6, ease.outExpo);
  const rackP = prog(t, ai - 0.1, 0.6, ease.outExpo);
  const flow = clamp01((t - dram) / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.blue} drift={0.6} opacity={0.6} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Label text="दाम क्यों बढ़े" t={t} start={a} tint={color.steel} />
        <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 104, color: color.ink, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 12, opacity: chipP }}>
          <SweepText text="MEMORY CHIPS" t={t} start={a + 0.3} />
        </div>
      </div>

      {/* AI data-centre racks pulling memory upward */}
      <div style={{ position: "absolute", left: G, right: G, top: 470, display: "flex", justifyContent: "center", gap: 26, opacity: rackP, transform: `translateY(${(1 - rackP) * -30}px)` }}>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} style={{ width: 150, height: 200, borderRadius: 10, background: "linear-gradient(180deg,#151922,#0B0D12)", border: "1.5px solid rgba(157,178,201,0.25)", padding: 12, display: "flex", flexDirection: "column", gap: 9 }}>
            {[0, 1, 2, 3, 4, 5].map((u) => (
              <div key={u} style={{ height: 19, borderRadius: 4, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 6, paddingLeft: 8 }}>
                {[0, 1, 2].map((l) => <span key={l} style={{ width: 6, height: 6, borderRadius: 6, background: rand(r * 31 + u * 7 + l + Math.floor(t * 8)) > 0.45 ? color.blue : "rgba(91,140,255,0.2)" }} />)}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: font.mono, fontSize: 26, letterSpacing: "0.18em", color: color.steel, opacity: rackP }}>AI DATA CENTRES</div>

      {/* streams of memory flowing up */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = 200 + rand(i * 3.3) * 680;
        const ph = (t * (0.9 + rand(i) * 0.8) + rand(i * 9.1)) % 1;
        return <div key={i} style={{ position: "absolute", left: x, top: lerp(1010, 720, ph), width: 14, height: 9, borderRadius: 2, background: color.goldHot, opacity: flow * Math.sin(Math.PI * ph) * 0.8 }} />;
      })}

      {/* the chip */}
      <div style={{ position: "absolute", left: 540 - 230, top: 790, width: 460, height: 250, opacity: chipP, transform: `scale(${lerp(0.85, 1, chipP)})` }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 36 + i * 47, top: -16, width: 16, height: 18, background: color.gold, borderRadius: 2 }} />
            <div style={{ position: "absolute", left: 36 + i * 47, bottom: -16, width: 16, height: 18, background: color.gold, borderRadius: 2 }} />
          </React.Fragment>
        ))}
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "linear-gradient(160deg,#1E2129,#0C0E12)", border: "2px solid rgba(201,164,92,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 30, fontFamily: font.display, fontWeight: 900, fontSize: 62, letterSpacing: "0.04em" }}>
          <span style={{ color: prog(t, dram, 0.3) > 0.5 ? color.goldHot : color.inkFaint }}>DRAM</span>
          <span style={{ color: color.inkFaint, fontSize: 40 }}>+</span>
          <span style={{ color: prog(t, dram + 0.5, 0.3) > 0.5 ? color.goldHot : color.inkFaint }}>NAND</span>
        </div>
      </div>

      {/* rupee + cost share, qualitative only (no verified share number on Counterpoint's page) */}
      <div style={{ position: "absolute", left: G, right: G, top: 1090, display: "flex", gap: 18 }}>
        <div style={{ ...glass, flex: 1, padding: "18px 22px", opacity: prog(t, rupee - 0.1, 0.4), transform: `translateY(${(1 - prog(t, rupee - 0.1, 0.5, ease.outExpo)) * 30}px)` }}>
          <div style={{ ...deva, fontSize: 34, lineHeight: 1.25 }}><span style={{ color: RED }}>₹ कमज़ोर</span><br /><span style={{ fontWeight: 600, fontSize: 27, color: color.inkDim }}>imported parts महँगे</span></div>
        </div>
        <div style={{ ...glass, flex: 1.25, padding: "18px 22px", opacity: prog(t, cost - 0.1, 0.4), transform: `translateY(${(1 - prog(t, cost - 0.1, 0.5, ease.outExpo)) * 30}px)` }}>
          <div style={{ ...deva, fontSize: 34, lineHeight: 1.25 }}><span style={{ color: color.goldHot }}>सस्ता phone</span><br /><span style={{ fontWeight: 600, fontSize: 27, color: color.inkDim }}>cost में memory का हिस्सा ज़्यादा</span></div>
        </div>
      </div>

      <BottomTags t={t} tags={[{ text: "Counterpoint, H1 2026 price analysis (29 Sep 2026)", start: a + 0.2 }]} />
    </div>
  );
};

/* ------------------------------------------------ 3. CYCLE: 3.5 → ~4 years */
export const Cycle: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.cycle;
  const four = at("b3_cycle", "4"), before = at("b3_cycle", "3.5");
  const W = 912, yr = W / 4.5;
  const p35 = prog(t, a + 0.2, 0.8, ease.outExpo);
  const p4 = prog(t, four - 0.1, 0.6, ease.outExpo);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.amber} drift={0.4} opacity={0.5} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Label text="REPLACEMENT CYCLE · INDIA" t={t} start={a} tint={color.amber} />
        <div style={{ ...deva, fontSize: 84, lineHeight: 1.05, marginTop: 14 }}>
          एक phone, <span style={{ color: color.amberHot }}>~4 साल</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, top: 640, width: W }}>
        {/* ruler */}
        <div style={{ position: "relative", height: 60 }}>
          {[0, 1, 2, 3, 4].map((y) => (
            <div key={y} style={{ position: "absolute", left: y * yr, top: 0, fontFamily: font.mono, fontSize: 24, color: color.inkFaint, transform: "translateX(-50%)" }}>{y}y</div>
          ))}
        </div>
        <div style={{ position: "relative", height: 70, borderRadius: 14, background: "rgba(255,255,255,0.05)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3.5 * yr * p35, borderRadius: 14, background: "rgba(243,241,236,0.30)" }} />
          <div style={{ position: "absolute", left: 3.5 * yr, top: 0, bottom: 0, width: 0.5 * yr * p4, borderRadius: "0 14px 14px 0", background: color.amber, boxShadow: `0 0 30px ${color.amber}88` }} />
        </div>
        <div style={{ position: "relative", height: 120, marginTop: 18 }}>
          <div style={{ position: "absolute", left: 3.5 * yr, transform: "translateX(-100%)", textAlign: "right", opacity: prog(t, before - 0.2, 0.4) || p35 }}>
            <div style={{ ...deva, fontSize: 30, color: color.inkDim }}>पहले</div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 56, color: color.ink, whiteSpace: "nowrap" }}>~3.5 साल</div>
          </div>
          <div style={{ position: "absolute", left: 4 * yr + 14, opacity: p4 }}>
            <div style={{ ...deva, fontSize: 30, color: color.amber }}>अब</div>
            <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 56, color: color.amberHot }}>~4</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 960, ...deva, fontWeight: 600, fontSize: 34, color: color.inkDim, opacity: prog(t, four + 0.6, 0.5) }}>
        Phone चल रहा है, तो नया लेने की जल्दी नहीं।
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint × Flipkart, Smartphone Insights Report 2026", start: a + 0.2 }]} />
    </div>
  );
};

/* ------------------------------------------------ 4. SURVEY: 2,095 buyers, stated intentions */
export const Survey: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.survey;
  const one = at("b4_survey", "1");
  const rows: [string, number, string][] = [
    ["Budget stretch करेंगे", 46, color.steel],
    ["Budget में रहेंगे या refurbished", 29, color.steel],
    ["Purchase रोकेंगे", 25, RED],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.25) }}>
      <DataRoom t={t} tint={color.steel} drift={0.4} opacity={0.5} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Label text="SURVEY · 2,095 BUYERS · JUL 2026" t={t} start={a} tint={color.steel} />
        <div style={{ ...deva, fontSize: 80, lineHeight: 1.05, marginTop: 14 }}>दाम बढ़े, तो?</div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 540, display: "flex", flexDirection: "column", gap: 34 }}>
        {rows.map(([label, v, c], i) => {
          const p = prog(t, a + 0.3 + i * 0.35, 0.8, ease.outExpo);
          const hot = i === 2 && t >= one - 0.1;
          return (
            <div key={label} style={{ opacity: i === 2 || !hot ? 1 : 0.55 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ ...deva, fontWeight: 600, fontSize: 36, color: hot ? color.ink : color.inkDim }}>{label}</div>
                <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: hot ? 92 : 64, color: hot ? RED : color.ink, lineHeight: 1 }}>
                  <Counter to={v} t={t} start={a + 0.3 + i * 0.35} dur={0.8} />%
                </div>
              </div>
              <div style={{ height: 22, marginTop: 12, borderRadius: 11, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ width: `${(v / 46) * 100 * p}%`, height: "100%", borderRadius: 11, background: c, boxShadow: hot ? `0 0 26px ${RED}99` : undefined }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1090, fontFamily: font.mono, fontSize: 24, color: color.inkFaint, opacity: prog(t, a + 1.2, 0.5) }}>
        46 + 29 + 25 = 100 · stated intentions, असली purchases नहीं
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint survey, 24 Jul 2026 (n = 2,095)", start: a + 0.2 }]} />
    </div>
  );
};

/* ------------------------------------------------ 5. SPLIT: 2025 volume +1%, value +8% */
export const Split: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.split;
  const p8 = at("b5_split", "8%"), p1 = at("b5_split", "1%");
  const H = 520;
  const vol = prog(t, p1 - 0.2, 0.8, ease.outExpo), val = prog(t, p8 - 0.3, 0.9, ease.outExpo);
  const interp = p8 + 0.35;
  const bar = (label: string, v: number, p: number, c: string, x: number) => (
    <div style={{ position: "absolute", left: x, bottom: 0, width: 300, textAlign: "center" }}>
      <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 100, color: c, lineHeight: 1, opacity: p }}>+<Counter to={v} t={t} start={label === "Volume" ? p1 - 0.2 : p8 - 0.3} dur={0.8} />%</div>
      <div style={{ height: (H - 150) * (v / 8) * p + 6, marginTop: 14, borderRadius: "14px 14px 0 0", background: `linear-gradient(180deg, ${c}, ${c}55)`, boxShadow: `0 0 40px ${c}44` }} />
      <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 36, color: color.inkDim, marginTop: 16 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeWin(t, a, b, 0.01, 0.2) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} opacity={0.55} />
      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Label text="2025 · INDIA SMARTPHONE MARKET" t={t} start={a} tint={color.gold} />
        <div style={{ ...deva, fontSize: 80, lineHeight: 1.05, marginTop: 14 }}>महँगे phones की <span style={{ color: color.goldHot }}>कहानी अलग</span></div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 470, height: H + 70 }}>
        {bar("Volume", 1, vol, color.steel, 90)}
        {bar("Value", 8, val, color.gold, 520)}
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1080, fontFamily: font.mono, fontSize: 23, color: color.inkFaint, opacity: prog(t, p8 + 0.2, 0.4) }}>
        per phone: 1.08 ÷ 1.01 ≈ +7% (AVRON calc)
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1130, ...glass, padding: "16px 22px", opacity: prog(t, interp, 0.4) }}>
        <div style={{ fontFamily: font.mono, fontSize: 19, color: color.gold, letterSpacing: "0.12em" }}>AVRON INTERPRETATION</div>
        <div style={{ ...deva, fontWeight: 600, fontSize: 30, lineHeight: 1.3, marginTop: 6 }}>Market बँट रहा है। सस्ते phones दब रहे हैं, ऊपर per phone ख़र्च बढ़ रहा है।</div>
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint, 2025 full year (2 Feb 2026)", start: a + 0.2 }]} />
    </div>
  );
};

/* ------------------------------------------------ 6. END CARD: all sources */
export const End: React.FC<{ t: number; duration: number }> = ({ t, duration }) => {
  const [a] = S.end;
  const p = prog(t, a - 0.1, 0.5, ease.outExpo);
  const out = prog(t, duration - 0.35, 0.35, ease.inCubic);
  const src = [
    "India Global Review (YouTube): opening clip",
    "Omdia, Q3 2026 India smartphones (19 Oct 2026)",
    "Counterpoint, Q3 2026 India smartphones (23 Oct 2026)",
    "Counterpoint, H1 2026 price analysis (29 Sep 2026)",
    "Counterpoint, survey of 2,095 buyers (24 Jul 2026)",
    "Counterpoint × Flipkart, Smartphone Insights Report 2026",
    "Counterpoint, 2025 full year (2 Feb 2026)",
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: color.bg, opacity: p * (1 - out) }}>
      <DataRoom t={t} tint={color.amber} drift={1.2} opacity={0.35} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.012 * Math.max(0, t - a)})`, transformOrigin: "50% 40%" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
        <SweepText text="AVRON" t={t} start={a + 0.1} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 150, letterSpacing: "0.3em", color: color.ink, paddingLeft: "0.3em" }} />
        <div style={{ fontFamily: font.text, fontSize: 30, color: color.inkDim, letterSpacing: "0.22em", marginTop: 12, opacity: prog(t, a + 0.25, 0.4) }}>THE STORY BEHIND THE STOCK</div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 690 }}>
        <div style={{ fontFamily: font.mono, fontSize: 24, color: color.amber, letterSpacing: "0.16em", marginBottom: 18, opacity: prog(t, a + 0.2, 0.3) }}>SOURCES</div>
        {src.map((s, i) => (
          <div key={s} style={{ fontFamily: font.mono, fontSize: 27, lineHeight: 1.5, color: color.ink, opacity: prog(t, a + 0.25 + i * 0.06, 0.3) }}>· {s}</div>
        ))}
        <div style={{ fontFamily: font.mono, fontSize: 21, lineHeight: 1.55, color: color.inkFaint, marginTop: 28, opacity: prog(t, a + 0.7, 0.4) }}>
          Shipment figures are tracker estimates, not retail sales. Education only. Not investment advice, not a recommendation to buy, sell or hold. AVRON is not SEBI-registered.
        </div>
      </div>
    </div>
    </div>
  );
};
