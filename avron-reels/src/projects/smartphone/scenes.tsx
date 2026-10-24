import React from "react";
import { OffthreadVideo, staticFile } from "remotion";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { SourceTag } from "../../engine/components/Kinetic";
import { at, CUE, S } from "./config";

/*
 * Direction (ideas/2026-10-product-launch-20s, plus the launch/pitch prompts as style references):
 * high-end minimal, one idea per shot, lots of empty space, one accent colour, one clean sans with tight
 * tracking, masked type reveals, match moves, one camera language, cuts on the beat, big stats on push cuts.
 * Banned: shake, particles, glows, grid floors, flashes, bouncy easing. No full stops in on-screen text.
 * Hindi is written in Roman script (user request).
 */
const G = layout.gutter;
const ACC = color.amber;
const INK = color.ink;
const DIM = "rgba(243,241,236,0.46)";
const display = (size: number, weight = 800): React.CSSProperties => ({
  fontFamily: font.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.02, color: INK,
});
const label: React.CSSProperties = { fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM };
const mono: React.CSSProperties = { fontFamily: font.mono, fontSize: 24, color: DIM, letterSpacing: "0.02em" };
const body: React.CSSProperties = { fontFamily: font.text, fontWeight: 600, fontSize: 32, lineHeight: 1.3, color: INK, letterSpacing: "-0.01em" };

/** Masked rise. No blur, no overshoot. */
const Mask: React.FC<{ t: number; start: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({
  t, start, out, children, style, dur = 0.6,
}) => {
  const p = ease.outExpo(clamp01((t - start) / dur));
  const q = out === undefined ? 0 : ease.inCubic(clamp01((t - out) / 0.28));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110 - q * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Push cut: the incoming shot arrives with a short eased push (motion blur does the rest). */
const pushIn = (t: number, a: number): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.55));
  return { transform: `scale(${lerp(1.08, 1, p)})`, opacity: clamp01((t - a) / 0.08) };
};

/** Eased 0..1 progress of a match move starting at `a`. */
const move = (t: number, a: number, d = 0.7) => ease.inOutQuint(clamp01((t - a) / d));

/** A hairline that grows or shrinks between two fractions of the content width. */
const Line: React.FC<{ from: number; to: number; p: number; top: number; accent?: boolean; ghost?: number; opacity?: number }> = ({ from, to, p, top, accent, ghost, opacity = 1 }) => {
  const W = 1080 - 2 * G;
  return (
    <div style={{ position: "absolute", left: G, top, width: W, height: 4, opacity }}>
      {ghost !== undefined && <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: W * ghost, background: "rgba(243,241,236,0.14)" }} />}
      <div style={{ position: "absolute", left: 0, top: 0, height: 4, width: W * lerp(from, to, p), background: accent ? ACC : INK }} />
    </div>
  );
};

/** Bottom source tags: one shared style for every credit in the reel. */
const TAG_Y = 1500;
const BottomTags: React.FC<{ t: number; tags: { text: string; start: number }[] }> = ({ t, tags }) => (
  <div style={{ position: "absolute", left: G, right: 120, bottom: 1920 - TAG_Y - 52, display: "flex", flexDirection: "column-reverse", alignItems: "flex-start", gap: 10 }}>
    {tags.filter((g) => t >= g.start).map((g) => (
      <SourceTag key={g.text} text={g.text} t={t} start={g.start} style={{ fontSize: 22, padding: "10px 18px" }} />
    ))}
  </div>
);

const Stage: React.FC<{ children: React.ReactNode; opacity?: number }> = ({ children, opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity, background: `radial-gradient(80% 55% at 50% 42%, #0E1014 0%, ${color.bg} 70%)` }}>{children}</div>
);

/* ------------------------------------------------ 0. OPENING CLIP (IGR, 1.5x) */
/** Kinetic keywords over the clip, each landing on Palki's word (clip-local seconds, from opening_words.json). */
const KEYWORDS: { a: number; b: number; lines: { at: number; text: string; acc?: boolean; size?: number }[] }[] = [
  { a: 1.15, b: 3.05, lines: [{ at: 1.2, text: "Festive season" }] },
  { a: 3.1, b: 4.6, lines: [{ at: 3.15, text: "Big purchases" }] },
  { a: 4.62, b: 5.74, lines: [{ at: 4.68, text: "New phone", acc: true }] },
  { a: 5.78, b: 9.0, lines: [{ at: 5.82, text: "New models", size: 80 }, { at: 6.32, text: "Big discounts", size: 80 }, { at: 6.86, text: "Exchange offers", size: 80, acc: true }] },
  { a: 9.0, b: 10.5, lines: [{ at: 9.0, text: "Upgrade?" }] },
];

/** The opening clip. `t` is clip-local time (the reel offsets it by the logo intro). */
export const Opening: React.FC<{ t: number }> = ({ t }) => {
  const turn = CUE.turn - CUE.intro, ship = CUE.ship - CUE.intro;
  const why = 17.46;
  // one camera language: slow push, a soft push on "But this year", zoom punches on "shipments have fallen sharply" and "why buy"
  const punch = 0.16 * ease.outExpo(clamp01((t - ship) / 0.3)) - 0.08 * ease.inOutCubic(clamp01((t - ship - 0.3) / 1.6));
  const s = 1 + 0.004 * t + 0.045 * ease.inOutCubic(clamp01((t - turn) / 0.9)) + punch
    + 0.03 * ease.outExpo(clamp01((t - why) / 0.3)) - 0.015 * ease.inOutCubic(clamp01((t - why - 0.3) / 1.0));
  const BAND_TOP = 610, BAND_H = 594;
  const hookOut = ship - 0.05;
  const honest = 16.4;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <OffthreadVideo src={staticFile("smartphone/bg.mp4")} muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transform: `scale(${1.08 + 0.003 * t})` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.86) 0%, rgba(6,7,10,0.4) 30%, rgba(6,7,10,0.4) 62%, rgba(6,7,10,0.92) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: BAND_TOP, width: 1080, height: BAND_H, transform: `scale(${s})`, transformOrigin: "50% 50%", boxShadow: "0 50px 120px rgba(0,0,0,0.7)" }}>
        <OffthreadVideo src={staticFile("smartphone/band.mp4")} muted style={{ width: 1080, height: BAND_H }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(110% 90% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
      </div>

      <div style={{ position: "absolute", left: G, right: G, top: 250 }}>
        <Mask t={t} start={0.1} out={hookOut}><div style={label}>India · smartphones · Q3 2026</div></Mask>
      </div>
      {KEYWORDS.map((k, i) => t >= k.a - 0.05 && t < k.b + 0.35 && (
        <div key={i} style={{ position: "absolute", left: G, right: G, top: 310 }}>
          {k.lines.map((l) => (
            <Mask key={l.text} t={t} start={l.at} out={k.b - 0.05} dur={0.45}>
              <div style={{ ...display(l.size ?? 104), color: l.acc ? ACC : INK, whiteSpace: "nowrap" }}>{l.text}</div>
            </Mask>
          ))}
        </div>
      ))}
      <div style={{ position: "absolute", left: G, right: G, top: 310 }}>
        <Mask t={t} start={turn} out={hookOut} dur={0.5}><div style={{ ...display(88), whiteSpace: "nowrap" }}>Par is saal</div></Mask>
        <Mask t={t} start={turn + 0.25} out={hookOut} dur={0.5}><div style={{ ...display(88), color: ACC, whiteSpace: "nowrap" }}>phone market thanda</div></Mask>
      </div>

      {t >= ship - 0.05 && (
        <div style={{ position: "absolute", left: G, right: G, top: 236 }}>
          <Mask t={t} start={ship}><div style={label}>Q3 2026 · shipments · YoY</div></Mask>
          <Mask t={t} start={ship + 0.05} dur={0.5} style={{ marginTop: 10 }}>
            <div style={{ ...display(124), whiteSpace: "nowrap" }}>−20% <span style={{ fontSize: 56, color: DIM }}>se</span> <span style={{ color: ACC }}>−26%</span></div>
          </Mask>
          <Mask t={t} start={ship + 0.45} style={{ marginTop: 14 }}><div style={{ ...mono, color: INK }}>Counterpoint −20% · Omdia −26%, 35.8M units</div></Mask>
          <Mask t={t} start={ship + 0.6}><div style={{ ...mono, color: INK }}>Omdia: 2016 ke baad sabse kam Q3</div></Mask>
        </div>
      )}

      {t >= honest && (
        <div style={{ position: "absolute", left: G, right: G, top: 1262 }}>
          <Mask t={t} start={honest}><div style={{ ...label, color: ACC, fontSize: 22 }}>Note</div></Mask>
          <Mask t={t} start={honest + 0.08} style={{ marginTop: 8 }}><div style={{ ...body, fontSize: 30 }}>Shipments yaani dukaanon tak bheje gaye phones, khareede gaye nahi</div></Mask>
          <Mask t={t} start={honest + 0.2}><div style={{ ...body, fontSize: 30, color: DIM }}>Dealers ne stock kam mangaaya, Diwali bhi late thi</div></Mask>
        </div>
      )}

      <BottomTags t={t} tags={[
        { text: "Source: India Global Review (YouTube)", start: 0.1 },
        { text: "Counterpoint, 23 Oct 2026 · Omdia, 19 Oct 2026", start: ship + 0.3 },
      ]} />
    </div>
  );
};

/* ------------------------------------------------ 1. BUDGET: one idea per beat; each headline match-moves into the label */
export const Budget: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.budget;
  const r10 = at("b1_budget", "₹10,000"), p32 = at("b1_budget", "32%"), p65 = at("b1_budget", "65%");
  const m1 = move(t, r10 - 0.2), m2 = move(t, p32 - 0.25), m3 = move(t, p65 - 0.25);
  const q3 = p65 + 0.9;
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...pushIn(t, a) }}>
        <div style={{ position: "absolute", left: G, right: G, top: 660, opacity: 1 - m1 }}>
          <Mask t={t} start={a + 0.05}><div style={display(118)}>Sabse zyada maar</div></Mask>
          <Mask t={t} start={a + 0.2}><div style={{ ...display(118), color: ACC }}>sasti phones par</div></Mask>
        </div>
        {t >= r10 - 0.25 && (
          <div style={{ position: "absolute", left: G, top: lerp(640, 240, m2), transformOrigin: "0 0", transform: `scale(${lerp(1, 0.26, m2)})` }}>
            <Mask t={t} start={r10 - 0.2}><div style={{ ...display(170), whiteSpace: "nowrap" }}>₹10,000</div></Mask>
            <Mask t={t} start={r10 - 0.1}><div style={{ ...display(170), color: DIM, whiteSpace: "nowrap" }}>se neeche</div></Mask>
            <div style={{ ...label, fontSize: 40, marginTop: 14, opacity: 1 - m2 }}>H1 2026</div>
          </div>
        )}
        {t >= p32 - 0.3 && (
          <div style={{ position: "absolute", left: G, top: lerp(640, 360, m3), transformOrigin: "0 0", transform: `scale(${lerp(1, 0.36, m3)})` }}>
            <Mask t={t} start={p32 - 0.25}><div style={{ ...label, fontSize: 32 }}>Average daam</div></Mask>
            <Mask t={t} start={p32 - 0.2}><div style={{ ...display(300), color: ACC }}>+32%</div></Mask>
          </div>
        )}
        {t >= p32 - 0.2 && <Line from={1 / 1.32} to={1} p={prog(t, p32 - 0.1, 0.9, ease.outExpo)} top={1010} accent ghost={1 / 1.32} opacity={1 - m3} />}
        {t >= p32 && <div style={{ position: "absolute", left: G, top: 1040, ...mono, opacity: prog(t, p32, 0.4) * (1 - m3) }}>index 100 × 1.32 = 132</div>}
        {t >= p65 - 0.3 && (
          <div style={{ position: "absolute", left: G, top: 640 }}>
            <Mask t={t} start={p65 - 0.25}><div style={{ ...label, fontSize: 32 }}>Shipments · YoY</div></Mask>
            <Mask t={t} start={p65 - 0.2}><div style={display(300)}>−65%</div></Mask>
          </div>
        )}
        {t >= p65 - 0.2 && <Line from={1} to={0.35} p={prog(t, p65, 1.4, ease.inOutCubic)} top={1010} ghost={1} />}
        {t >= p65 && <div style={{ position: "absolute", left: G, top: 1040, ...mono, opacity: prog(t, p65 + 0.3, 0.4) }}>100 − 65 = 35</div>}
        {t >= q3 && (
          <div style={{ position: "absolute", left: G, right: G, top: 1130 }}>
            <Mask t={t} start={q3}><div style={{ ...body, color: DIM }}>Q3 2026 · ₹20,000 se neeche shipments <span style={{ color: INK }}>−47%</span></div></Mask>
          </div>
        )}
      </div>
      <BottomTags t={t} tags={[
        { text: "Counterpoint, H1 2026 price analysis (29 Sep 2026)", start: r10 },
        { text: "Counterpoint, Q3 2026 (23 Oct 2026)", start: q3 },
      ]} />
    </Stage>
  );
};

/* ------------------------------------------------ 2. MEMORY: type only, one idea per beat */
export const Memory: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.memory;
  const ai = at("b2_memory", "AI"), dram = at("b2_memory", "DRAM"), rupee = at("b2_memory", "rupee"), cost = at("b2_memory", "cost");
  const lab = move(t, ai - 0.25);
  const shot = (s: number, e: number) => t >= s - 0.3 && t < e + 0.3;
  const chipDraw = prog(t, dram - 0.1, 1.1, ease.inOutCubic);
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...pushIn(t, a) }}>
        <div style={{ position: "absolute", left: G, top: lerp(700, 252, lab), transformOrigin: "0 0", transform: `scale(${lerp(1, 0.32, lab)})` }}>
          <Mask t={t} start={a + 0.05}><div style={{ ...display(170), whiteSpace: "nowrap" }}>Memory</div></Mask>
          <Mask t={t} start={a + 0.15}><div style={{ ...display(170), color: ACC, whiteSpace: "nowrap" }}>chips</div></Mask>
        </div>
        {shot(ai, dram) && (
          <div style={{ position: "absolute", left: G, right: G, top: 700 }}>
            <Mask t={t} start={ai - 0.2} out={dram - 0.3}><div style={display(124)}>AI data centres</div></Mask>
            <Mask t={t} start={ai - 0.05} out={dram - 0.3}><div style={{ ...display(124), color: DIM }}>khareed rahe hain</div></Mask>
          </div>
        )}
        {shot(dram, rupee) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 620, height: 520, opacity: 1 - prog(t, rupee - 0.3, 0.25) }}>
            <svg width={1080} height={520} style={{ position: "absolute", inset: 0 }}>
              <rect x={240} y={120} width={600} height={300} rx={18} fill="none" stroke={INK} strokeWidth={3}
                strokeDasharray={1800} strokeDashoffset={1800 * (1 - chipDraw)} />
              {Array.from({ length: 10 }).map((_, i) => {
                const p = prog(t, dram + 0.2 + i * 0.04, 0.3);
                return (
                  <g key={i} opacity={p}>
                    <line x1={285 + i * 57} y1={120} x2={285 + i * 57} y2={120 - 34 * p} stroke={INK} strokeWidth={3} />
                    <line x1={285 + i * 57} y1={420} x2={285 + i * 57} y2={420 + 34 * p} stroke={INK} strokeWidth={3} />
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center", gap: 34 }}>
              <Mask t={t} start={dram}><div style={{ ...display(96), color: ACC }}>DRAM</div></Mask>
              <Mask t={t} start={dram + 0.45}><div style={{ ...display(96), color: ACC }}>NAND</div></Mask>
            </div>
          </div>
        )}
        {shot(rupee, cost) && (
          <div style={{ position: "absolute", left: G, right: G, top: 700 }}>
            <Mask t={t} start={rupee - 0.2} out={cost - 0.3}><div style={display(150)}>Rupee <span style={{ color: ACC }}>kamzor</span></div></Mask>
            <Mask t={t} start={rupee} out={cost - 0.3}><div style={{ ...display(64, 700), color: DIM, marginTop: 10 }}>imported parts mehenge</div></Mask>
          </div>
        )}
        {t >= cost - 0.3 && (
          <div style={{ position: "absolute", left: G, right: G, top: 680 }}>
            <Mask t={t} start={cost - 0.2}><div style={display(104)}>Sasti phone ki cost</div></Mask>
            <Mask t={t} start={cost - 0.05}><div style={display(104)}>mein <span style={{ color: ACC }}>memory</span> ka</div></Mask>
            <Mask t={t} start={cost + 0.1}><div style={display(104)}>hissa zyada</div></Mask>
          </div>
        )}
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint, H1 2026 price analysis (29 Sep 2026)", start: a + 0.2 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 3. CYCLE: 3.5 → 4 years, the number rolls in place */
export const Cycle: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.cycle;
  const four = at("b3_cycle", "4");
  const roll = ease.inOutQuint(clamp01((t - four + 0.15) / 0.5));
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...pushIn(t, a) }}>
        <div style={{ position: "absolute", left: G, top: 252 }}>
          <Mask t={t} start={a + 0.05}><div style={label}>Replacement cycle · India</div></Mask>
        </div>
        <div style={{ position: "absolute", left: G, top: 600 }}>
          <Mask t={t} start={a + 0.1}><div style={{ ...display(44, 700), color: DIM }}>Ek phone ab</div></Mask>
          <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 6 }}>
            <div style={{ height: 300, overflow: "hidden" }}>
              <div style={{ transform: `translateY(${-300 * roll}px)` }}>
                <div style={{ ...display(300), height: 300, color: INK }}>3.5</div>
                <div style={{ ...display(300), height: 300, color: ACC }}>~4</div>
              </div>
            </div>
            <Mask t={t} start={a + 0.25}><div style={display(110)}>saal</div></Mask>
          </div>
        </div>
        <Line from={0} to={3.5 / 4.5} p={prog(t, a + 0.2, 0.9, ease.outExpo)} top={1000} ghost={1} />
        {t >= four - 0.1 && <Line from={3.5 / 4.5} to={4 / 4.5} p={prog(t, four - 0.1, 0.6, ease.outExpo)} top={1000} accent />}
        <div style={{ position: "absolute", left: G, top: 1030, ...mono, opacity: prog(t, four, 0.4) }}>pehle ~3.5 saal · ab ~4</div>
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint × Flipkart, Smartphone Insights Report 2026", start: a + 0.2 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 4. SURVEY: 1 in 4 */
export const Survey: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.survey;
  const one = at("b4_survey", "1");
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...pushIn(t, a) }}>
        <div style={{ position: "absolute", left: G, top: 252 }}>
          <Mask t={t} start={a + 0.05}><div style={label}>Survey · 2,095 buyers · Jul 2026</div></Mask>
        </div>
        <div style={{ position: "absolute", left: G, top: 560 }}>
          <Mask t={t} start={a + 0.1}><div style={{ ...display(176), whiteSpace: "nowrap" }}>4 mein se <span style={{ color: ACC }}>1</span></div></Mask>
          <Mask t={t} start={a + 0.3} style={{ marginTop: 10 }}><div style={{ ...display(64, 700), color: DIM }}>daam badhe toh rukega</div></Mask>
        </div>
        <div style={{ position: "absolute", left: G, top: 990, display: "flex", gap: 26 }}>
          {[0, 1, 2, 3].map((i) => {
            const p = prog(t, a + 0.35 + i * 0.08, 0.4, ease.outExpo);
            const hot = i === 3 && t >= one - 0.05;
            return <div key={i} style={{ width: 58, height: 58, borderRadius: 58, border: `3px solid ${hot ? ACC : "rgba(243,241,236,0.5)"}`, background: hot ? ACC : "transparent", opacity: p, transform: `scale(${lerp(0.6, 1, p)})` }} />;
          })}
        </div>
        <div style={{ position: "absolute", left: G, right: G, top: 1090, ...mono, opacity: prog(t, one + 0.3, 0.4) }}>
          46% stretch · 29% same budget or refurbished · 25% wait<br />stated intentions, not purchases
        </div>
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint survey, 24 Jul 2026 (n = 2,095)", start: a + 0.2 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 5. SPLIT: 2025 volume vs value */
export const Split: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.split;
  const p1 = at("b5_split", "1%"), p8 = at("b5_split", "8%");
  const head = move(t, p1 - 0.35);
  const interp = p8 + 0.45;
  return (
    <Stage>
      <div style={{ position: "absolute", inset: 0, ...pushIn(t, a) }}>
        <div style={{ position: "absolute", left: G, top: lerp(660, 240, head), transformOrigin: "0 0", transform: `scale(${lerp(1, 0.3, head)})` }}>
          <Mask t={t} start={a + 0.05}><div style={{ ...display(104), whiteSpace: "nowrap" }}>Mehenge phones ki</div></Mask>
          <Mask t={t} start={a + 0.15}><div style={{ ...display(104), color: ACC, whiteSpace: "nowrap" }}>kahani alag</div></Mask>
        </div>
        {t >= p1 - 0.35 && (
          <>
            <div style={{ position: "absolute", left: G, top: 350 }}><Mask t={t} start={p1 - 0.3}><div style={label}>2025 · India smartphones</div></Mask></div>
            <div style={{ position: "absolute", left: G, right: G, top: 450 }}>
              <Mask t={t} start={p1 - 0.25}><div style={{ ...label, fontSize: 30 }}>Volume</div></Mask>
              <Mask t={t} start={p1 - 0.2}><div style={display(200)}>+1%</div></Mask>
            </div>
            <Line from={0} to={1 / 8} p={prog(t, p1, 0.6, ease.outExpo)} top={720} ghost={1} />
          </>
        )}
        {t >= p8 - 0.35 && (
          <>
            <div style={{ position: "absolute", left: G, right: G, top: 770 }}>
              <Mask t={t} start={p8 - 0.25}><div style={{ ...label, fontSize: 30 }}>Value</div></Mask>
              <Mask t={t} start={p8 - 0.2}><div style={{ ...display(200), color: ACC }}>+8%</div></Mask>
            </div>
            <Line from={0} to={1} p={prog(t, p8, 0.7, ease.outExpo)} top={1040} accent ghost={1} />
            <div style={{ position: "absolute", left: G, top: 1066, ...mono, opacity: prog(t, p8 + 0.25, 0.4) }}>per phone 1.08 ÷ 1.01 ≈ +7% (AVRON calc)</div>
          </>
        )}
        {t >= interp && (
          <div style={{ position: "absolute", left: G, right: G, top: 1130 }}>
            <Mask t={t} start={interp}><div style={{ ...label, fontSize: 20, color: ACC }}>AVRON interpretation</div></Mask>
            <Mask t={t} start={interp + 0.08}><div style={{ ...body, fontSize: 30, whiteSpace: "nowrap" }}>Neeche dabaav, upar per phone zyada kharch</div></Mask>
          </div>
        )}
      </div>
      <BottomTags t={t} tags={[{ text: "Counterpoint, 2025 full year (2 Feb 2026)", start: a + 0.2 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 6. END CARD: all sources */
export const End: React.FC<{ t: number; duration: number }> = ({ t, duration }) => {
  const [a] = S.end;
  const out = prog(t, duration - 0.5, 0.5, ease.inCubic);
  const src = [
    "India Global Review (YouTube), opening clip",
    "Omdia, Q3 2026 India smartphones (19 Oct 2026)",
    "Counterpoint, Q3 2026 India smartphones (23 Oct 2026)",
    "Counterpoint, H1 2026 price analysis (29 Sep 2026)",
    "Counterpoint, survey of 2,095 buyers (24 Jul 2026)",
    "Counterpoint × Flipkart, Smartphone Insights Report 2026",
    "Counterpoint, 2025 full year (2 Feb 2026)",
  ];
  const p = ease.outExpo(clamp01((t - a) / 0.55));
  return (
    <Stage opacity={clamp01((t - a) / 0.08) * (1 - out)}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1.08, 1, p) + 0.01 * Math.max(0, t - a)})` }}>
        <div style={{ position: "absolute", left: G, top: 330 }}>
          <Mask t={t} start={a + 0.05}><div style={{ ...display(150), letterSpacing: "0.18em" }}>AVRON</div></Mask>
          <Mask t={t} start={a + 0.2}><div style={{ ...label, marginTop: 14 }}>The story behind the stock</div></Mask>
        </div>
        <div style={{ position: "absolute", left: G, right: G, top: 700 }}>
          <Mask t={t} start={a + 0.25}><div style={{ ...label, color: ACC, fontSize: 22, marginBottom: 16 }}>Sources</div></Mask>
          {src.map((s, i) => (
            <Mask key={s} t={t} start={a + 0.3 + i * 0.05}><div style={{ fontFamily: font.mono, fontSize: 26, lineHeight: 1.55, color: INK }}>{s}</div></Mask>
          ))}
          <Mask t={t} start={a + 0.7} style={{ marginTop: 26 }}>
            <div style={{ fontFamily: font.mono, fontSize: 21, lineHeight: 1.55, color: DIM }}>
              Shipment figures are tracker estimates, not retail sales · Education only · Not investment advice, not a recommendation to buy, sell or hold · AVRON is not SEBI-registered
            </div>
          </Mask>
        </div>
      </div>
    </Stage>
  );
};
