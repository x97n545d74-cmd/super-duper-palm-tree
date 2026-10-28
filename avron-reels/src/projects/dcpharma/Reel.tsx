import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, ease, lerp, prog, useTime } from "../../engine/anim";
import TL from "./timeline.json";
import CAPS from "./captions.json";
import { BG, BlueGrid, Burst, Capsule, DashedLine, Desk, G, GRASS, GREEN, GREY, INK, INK_D, lbl, mono, Notif, Phone, Rack, RED, Rise, sans, Source, slowPush, sx } from "./kit";
import { Building } from "./Building";

/*
 * "Crash ka wait? Theme nahi, layer dekho" (AVRON, 53 s, Hinglish). FINAL CUT on the user's Tia VO (public/dcpharma/vo_raw.mp3).
 * Timing, on-screen text, visuals and transitions follow projects/2026-10-datacenter-pharma/ENGINE_REPORT.md Section 3;
 * palette, type sizes and the dashed-chart rule follow Section 4. Every scene is a pure function of absolute time t.
 * Reused looks: kinetic pendulum + stacked type (musk B8), BlueGrid / Desk / Notif (musk), comic burst S2b and paper collage
 * (anchor V2), bead ring CTA (footy Cta). Beat times live in ./timeline.json (real times from the aligned VO). Every in-scene
 * time is an offset from its beat's start a = S(id) or end E(id), keyed to the spoken word (see the comments), so a re-time
 * only needs a new timeline.json. Captions come from ./captions.json (scripts/captions_dcpharma.py).
 */

type Beat = { id: string; start: number; end: number; vo: string };
const BEATS = (TL as { beats: Beat[] }).beats;
export const DCPHARMA_DURATION = (TL as { duration: number }).duration;
const S = (id: string) => BEATS.find((b) => b.id === id)!.start;
const E = (id: string) => BEATS.find((b) => b.id === id)!.end;
const beatAt = (t: number) => BEATS.find((b) => t >= b.start && t < b.end) ?? BEATS[BEATS.length - 1];

/* Cue offsets shared with scripts/score_dcpharma.py (keep the two in step). */
/** Burst hit after the beat start: the music drops out from the beat start to here, then the low hit. */
export const BURST_HIT = 0.45;
/** Notification arrival times in the race beat: Natco on "Natco" (+1.05 s), Zydus on "Zydus" (+1.75 s), the rest every 0.4 s. */
export const raceArrivals = (a: number) => [a + 1.0, a + 1.65, a + 2.05, a + 2.45, a + 2.85, a + 3.25];

/* ================================================================== hook: kinetic pendulum type (both words set by ~0.9 s) */
const LINE_Y = 1190;
const AXIS_Y = 1260;
/** Critically damped swing: no overshoot, so the pendulum settles without a bounce. */
const settle = (t: number, a: number, k = 22) => { const x = Math.max(0, t - a); return (1 + k * x) * Math.exp(-k * x); };

const Hook: React.FC<{ t: number }> = ({ t }) => {
  const end = E("hook");
  const out = prog(t, end - 0.3, 0.28, ease.inCubic);
  const lineY = lerp(LINE_Y, AXIS_Y, prog(t, end - 0.28, 0.28, ease.inOutCubic));
  const word = (text: React.ReactNode, a: number, bottom: number, size: number, key: string) => {
    const th = 72 * settle(t, a);
    const visible = t >= a;
    return (
      <div key={key} style={{ position: "absolute", left: 540, top: 0, transformOrigin: "0 0", transform: `rotate(${th}deg)`, opacity: visible ? 1 - out : 0 }}>
        <div style={{ position: "absolute", left: -1, top: 0, width: 2, height: bottom - size * 0.92, background: "rgba(255,255,255,0.45)" }} />
        <div style={{ position: "absolute", left: -9, top: bottom - size * 0.92 - 9, width: 18, height: 18, borderRadius: 9, background: INK }} />
        <div style={{ position: "absolute", left: -540, width: 1080, top: bottom - size * 0.88, textAlign: "center", ...sx(size, 900), transform: `translateY(${-out * 160}px)` }}>{text}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: BG, ...slowPush(t, 0, 540, LINE_Y) }}>
      {word(<>KA <span style={{ color: RED }}>WAIT?</span></>, 0.6, LINE_Y - 14, 170, "w") /* swings in before "wait" (1.18 s), set by ~0.9 s */}
      {word("CRASH", 0, 990, 200, "c")}
      <div style={{ position: "absolute", left: G, right: G, top: lineY - 1.5, height: 3, background: INK }} />
    </AbsoluteFill>
  );
};

/* ================================================================== Nifty −16% on the blue grid */
const NA = { x: 170, y: 720 }, NB = { x: 910, y: 1110 };
const NiftyChart: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const draw = prog(t, a + 0.25, 1.5, ease.inOutCubic);
  const pct = prog(t, a + 1.6, 0.8, ease.outCubic); // counts up on "solah pratishat" (beat + 1.9 s)
  return (
    <AbsoluteFill>
      <BlueGrid t={t} />
      <div style={{ position: "absolute", left: G, right: G, top: AXIS_Y - 1.5, height: 3, background: INK }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <DashedLine x1={NA.x} y1={NA.y} x2={NB.x} y2={NB.y} p={draw} c={RED} w={7} />
        <circle cx={NA.x} cy={NA.y} r={14} fill={INK} opacity={prog(t, a + 0.1, 0.2)} />
        <circle cx={NB.x} cy={NB.y} r={16 * clamp01(draw * 6 - 5)} fill={RED} />
        <text x={NA.x - 30} y={NA.y - 40} fontFamily={mono} fontSize={30} fill={INK} opacity={prog(t, a + 0.2, 0.3)}>26,373 · 5 JAN</text>
        <text x={NB.x + 20} y={NB.y + 70} textAnchor="end" fontFamily={mono} fontSize={30} fill={INK} opacity={clamp01(draw * 4 - 3)}>22,180 · 8 OCT</text>
      </svg>
      <div style={{ position: "absolute", left: G, top: 262 }}>
        <Rise t={t} a={a + 0.05}><div style={sx(64, 900)}>NIFTY</div></Rise>
        <div style={{ ...sx(210, 900, RED), marginTop: 18, fontVariantNumeric: "tabular-nums", opacity: clamp01(pct * 8) }}>−{Math.max(1, Math.round(16 * pct))}%</div>
        <Rise t={t} a={a + 0.35} style={{ marginTop: 18 }}><div style={lbl(54, GREY)}>5 JAN → 8 OCT 2026</div></Rise>
      </div>
    </AbsoluteFill>
  );
};
const Nifty: React.FC<{ t: number }> = ({ t }) => <AbsoluteFill style={slowPush(t, S("nifty"))}><NiftyChart t={t} a={S("nifty")} /></AbsoluteFill>;

/* ================================================================== question over the frozen chart */
const Ask: React.FC<{ t: number }> = ({ t }) => {
  const a = S("ask");
  const dim = prog(t, a, 0.3);
  const push = ease.outExpo(clamp01((t - a) / 0.45));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: lerp(1, 0.2, dim), transform: `scale(${(1 + 0.02 * (a - S("nifty"))) * lerp(1, 1.05, push)})`, transformOrigin: "540px 960px" }}>
        <NiftyChart t={a - 0.001} a={S("nifty")} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...slowPush(t, a) }}>
        <Rise t={t} a={a + 0.08}><div style={sx(150, 900)}>AB</div></Rise>
        <Rise t={t} a={a + 0.2} style={{ marginTop: 14 }}><div style={sx(150, 900)}>KHARIDNA</div></Rise>
        <Rise t={t} a={a + 0.32} style={{ marginTop: 14 }}><div style={sx(150, 900)}>KYA HAI?</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== two themes, split screen */
const RACK_HALF = { x: 120, y: 560, w: 300, h: 600 };
const RACK_FULL = { x: 360, y: 640, w: 360, h: 690 };
const Themes: React.FC<{ t: number }> = ({ t }) => {
  const a = S("themes");
  const wipe = ease.inOutCubic(clamp01((t - a) / 0.5));
  const dl = prog(t, a + 0.15, 1.1, ease.inOutCubic), dr = prog(t, a + 0.45, 1.1, ease.inOutCubic);
  return (
    <AbsoluteFill style={{ background: BG, clipPath: `inset(0 ${50 - 50 * wipe}% 0 ${50 - 50 * wipe}%)` }}>
      <AbsoluteFill style={slowPush(t, a)}>
        <div style={{ position: "absolute", left: 539, top: 330, width: 2, height: 1000 * wipe, background: "rgba(138,143,152,0.5)" }} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <Rack {...RACK_HALF} draw={dl} />
          <Capsule cx={810} cy={860} L={380} r={92} rot={-32} draw={dr} />
        </svg>
        <div style={{ position: "absolute", left: 0, width: 540, top: 1250, textAlign: "center" }}><Rise t={t} a={a + 0.5}><div style={sx(56, 900)}>DATA CENTRES</div></Rise></div>
        <div style={{ position: "absolute", left: 540, width: 540, top: 1250, textAlign: "center" }}><Rise t={t} a={a + 0.8}><div style={sx(56, 900)}>PHARMA</div></Rise></div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== vacancy 2.8%: rack fills to 35 of 36 */
const EMPTY = 29;
const fillStep = (a: number) => [a + 0.55, a + 1.25, a + 1.95];
const VacancyBody: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const m = ease.inOutCubic(clamp01((t - a) / 0.6));
  const r = { x: lerp(RACK_HALF.x, RACK_FULL.x, m), y: lerp(RACK_HALF.y, RACK_FULL.y, m), w: lerp(RACK_HALF.w, RACK_FULL.w, m), h: lerp(RACK_HALF.h, RACK_FULL.h, m) };
  const steps = fillStep(a);
  const filled = (i: number) => {
    if (i === EMPTY) return 0;
    const group = Math.floor(i / 12);
    return prog(t, steps[group] + (i % 12) * 0.018, 0.12);
  };
  const pulse = Math.sin(Math.PI * clamp01((t - (a + 2.4)) / 0.6)); // the empty slot pulses as "2.8%" is spoken
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Rack {...r} fill={filled} slotStroke={(i) => (i === EMPTY ? `rgba(255,255,255,${0.35 + 0.65 * pulse})` : "rgba(255,255,255,0.35)")} />
        {pulse > 0 && (() => {
          const pad = r.w * 0.1, top = r.h * 0.06, sh = (r.h - top * 2) / 36, sy = r.y + r.h - top - (EMPTY + 1) * sh;
          const s = 1 + 0.06 * pulse;
          return <rect x={r.x + pad} y={sy + sh * 0.18} width={r.w - pad * 2} height={sh * 0.64} rx={2} fill="none" stroke={INK} strokeWidth={3}
            transform={`translate(${r.x + r.w / 2} ${sy + sh / 2}) scale(${s}) translate(${-(r.x + r.w / 2)} ${-(sy + sh / 2)})`} />;
        })()}
      </svg>
      <div style={{ position: "absolute", left: G, top: 262, opacity: m }}>
        <Rise t={t} a={a + 0.2}><div style={sx(64, 900)}>VACANCY</div></Rise>
        <Rise t={t} a={a + 2.3} style={{ marginTop: 14 }}><div style={sx(210, 900)}>2.8%</div></Rise>{/* on "2.8" (beat + 2.4 s) */}
      </div>
    </AbsoluteFill>
  );
};
const Vacancy: React.FC<{ t: number }> = ({ t }) => <AbsoluteFill style={slowPush(t, S("vacancy"))}><VacancyBody t={t} a={S("vacancy")} /></AbsoluteFill>;

/* ================================================================== pharma vs Nifty, direction only */
const Pharma: React.FC<{ t: number }> = ({ t }) => {
  const a = S("pharma");
  const slide = ease.outExpo(clamp01((t - a) / 0.55));
  const d = prog(t, a + 0.35, 1.4, ease.inOutCubic);
  const O = { x: 140, y: 960 }, P = { x: 930, y: 790 }, N = { x: 930, y: 1130 };
  return (
    <AbsoluteFill>
      {slide < 1 && <AbsoluteFill style={{ transform: `translateX(${-slide * 1080 * 0.35}px)` }}><Vacancy t={a - 0.001} /></AbsoluteFill>}
      <AbsoluteFill style={{ background: BG, transform: `translateX(${(1 - slide) * 1080}px)` }}>
        <AbsoluteFill style={slowPush(t, a)}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <line x1={G} y1={1250} x2={1080 - G} y2={1250} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <DashedLine x1={O.x} y1={O.y} x2={N.x} y2={N.y} p={d} c={RED} w={7} />
            <DashedLine x1={O.x} y1={O.y} x2={P.x} y2={P.y} p={d} c={GREEN} w={7} />
            <circle cx={O.x} cy={O.y} r={13} fill={INK} opacity={prog(t, a + 0.3, 0.2)} />
            <text x={P.x} y={P.y - 34} textAnchor="end" fontFamily={sans} fontWeight={900} fontSize={44} fill={GREEN} opacity={clamp01(d * 4 - 3)}>NIFTY PHARMA</text>
            <text x={N.x} y={N.y + 64} textAnchor="end" fontFamily={sans} fontWeight={900} fontSize={44} fill={RED} opacity={clamp01(d * 4 - 3)}>NIFTY</text>
            <text x={1080 - G} y={1300} textAnchor="end" fontFamily={mono} fontSize={28} fill="rgba(255,255,255,0.6)" opacity={clamp01(d * 4 - 3)}>direction, 1 saal</text>
          </svg>
          <div style={{ position: "absolute", left: G, top: 262 }}>
            <Rise t={t} a={a + 0.3}><div style={sx(60, 900)}>NIFTY PHARMA 1 SAAL:</div></Rise>
            {/* on "ek saal mein", ahead of "double digit" (beat + 2.25 s) so it holds ~1.6 s */}
            <Rise t={t} a={a + 1.25} style={{ marginTop: 18 }}><div style={sx(150, 900, GREEN)}>DOUBLE</div></Rise>
            <Rise t={t} a={a + 1.35} style={{ marginTop: 8 }}><div style={sx(150, 900, GREEN)}>DIGIT ↑</div></Rise>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== the one comic burst */
const PEAK = { x: 190, y: 760 }, LOW = { x: 900, y: 1150 };
const BurstScene: React.FC<{ t: number }> = ({ t }) => {
  const a = S("burst"), hit = a + BURST_HIT, end = E("burst"); // hit on "stock"; the score's dropout runs a → hit
  const pop = ease.outExpo(clamp01((t - hit) / 0.35));
  const k = prog(t, end - 0.3, 0.3, ease.inCubic);
  const line = prog(t, end - 0.3, 0.3, ease.outCubic);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Burst t={t} a={hit} pop={pop} k={k} cy={860} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: 1 - k, transform: `scale(${lerp(1, 0.9, k)})` }}>
        <div style={{ ...sx(130, 900, INK_D), opacity: prog(t, a + 0.05, 0.12) }}>STOCK</div>
        <div style={{ transform: `scale(${lerp(0.6, 1, pop)})`, opacity: pop > 0 ? 1 : 0, marginTop: 14 }}>
          <div style={sx(130, 900, INK_D)}>IMMUNE</div>
          <div style={{ ...sx(130, 900, INK_D), marginTop: 14 }}><span style={{ color: RED }}>NAHI</span> HOTA</div>
        </div>
      </div>
      {line > 0 && <div style={{ position: "absolute", left: lerp(540, PEAK.x, line), right: lerp(540, G, line), top: PEAK.y - 3.5, height: 7, background: RED }} />}
    </AbsoluteFill>
  );
};

/* ================================================================== Anant Raj −40% from the ₹744 peak */
const GRASS_Y = 1340; // screen y of the collage grass strip in the building overview
const AnantRaj: React.FC<{ t: number }> = ({ t }) => {
  const a = S("anantraj"), end = E("anantraj");
  const gather = prog(t, a, 0.35, ease.inOutCubic); // horizontal bar shrinks into the peak dot
  const fall = prog(t, a + 0.6, 1.2, ease.inOutCubic); // −40% reached at beat + 1.8 s, just before "chaalis" (+2.26 s)
  const flat = prog(t, end - 0.45, 0.4, ease.inOutCubic); // line flattens into the grass strip
  const fade = 1 - prog(t, end - 0.5, 0.3);
  const x2 = lerp(PEAK.x, LOW.x, fall), y2 = lerp(PEAK.y, LOW.y, fall);
  const fy1 = lerp(PEAK.y, GRASS_Y, flat), fy2 = lerp(y2, GRASS_Y, flat);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ ...slowPush(t, a), opacity: fade }}>
        <div style={{ position: "absolute", left: G, top: 262 }}>
          <Rise t={t} a={a + 0.1}><div style={sx(64, 900)}>ANANT RAJ</div></Rise>
          <div style={{ ...sx(210, 900, RED), marginTop: 18, fontVariantNumeric: "tabular-nums", opacity: clamp01(fall * 8) }}>−{Math.max(1, Math.round(40 * fall))}%</div>
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <circle cx={PEAK.x} cy={PEAK.y} r={14} fill={INK} opacity={gather} />
          <text x={PEAK.x - 40} y={PEAK.y - 40} fontFamily={sans} fontWeight={800} fontSize={54} fill={GREY} opacity={prog(t, a + 0.3, 0.3)}>₹744 PEAK SE</text>
          <circle cx={LOW.x} cy={LOW.y} r={16 * clamp01(fall * 6 - 5)} fill={RED} />
          <text x={LOW.x + 30} y={LOW.y + 80} textAnchor="end" fontFamily={sans} fontWeight={800} fontSize={54} fill={GREY} opacity={clamp01(fall * 4 - 3)}>MARCH 2026 TAK</text>
        </svg>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {t < a + 0.6 ? (
          <line x1={lerp(G, PEAK.x, gather)} y1={PEAK.y} x2={lerp(1080 - G, PEAK.x + 1, gather)} y2={PEAK.y} stroke={RED} strokeWidth={7} />
        ) : flat <= 0 ? (
          <DashedLine x1={PEAK.x} y1={PEAK.y} x2={x2} y2={y2} p={1} c={RED} w={7} />
        ) : (
          <>
            <line x1={lerp(PEAK.x, 0, flat)} y1={fy1} x2={lerp(x2, 1080, flat)} y2={fy2} stroke={flat > 0.6 ? GRASS : RED} strokeWidth={lerp(7, 12, flat)} />
            <rect x={0} y={GRASS_Y} width={1080} height={(1920 - GRASS_Y) * clamp01(flat * 2 - 1)} fill={GRASS} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ================================================================== the desk: patent date, the race, Novo's cut */
const NOTIFS = [
  { icon: "N", title: "NATCO", body: "SEMANAT VIAL ₹1,290/MAHINA" },
  { icon: "Z", title: "ZYDUS", body: "PEN ~₹2,200 · DIABETES + OBESITY" },
  { icon: "L", title: "LUPIN" },
  { icon: "T", title: "TORRENT" },
  { icon: "D", title: "DR REDDY'S" },
  { icon: "S", title: "SUN …" },
];
const NH = (n: { body?: string }) => (n.body ? 168 : 96);
const DeskScenes: React.FC<{ t: number }> = ({ t }) => {
  const a0 = S("patent"), a1 = S("race"), a2 = S("novo");
  const inP = ease.outExpo(clamp01((t - a0) / 0.6));
  const phoneOut = prog(t, a2 - 0.3, 0.5, ease.inOutCubic);
  // lock-screen header (38.1–42.3)
  const hdrOut = prog(t, a1 - 0.25, 0.25, ease.inCubic);
  // notification stack (42.3–47.3), newest on top
  const arr = raceArrivals(a1); // Natco and Zydus land on their spoken names
  const stackOut = prog(t, a2 - 0.35, 0.35, ease.inCubic);
  const ys = NOTIFS.map((_, k) => {
    let y = 470;
    for (let j = k + 1; j < NOTIFS.length; j++) y += (NH(NOTIFS[j]) + 16) * ease.outExpo(clamp01((t - arr[j]) / 0.35));
    return y - stackOut * 1500;
  });
  const more = prog(t, a1 + 2.55, 0.4, ease.outExpo); // "~10 COMPANIES" on "das companies" (beat + 2.5 s)
  // Novo price tag (47.3–50.7)
  const tagIn = ease.outExpo(clamp01((t - a2) / 0.5));
  const strike = prog(t, a2 + 0.25, 0.3, ease.outCubic);
  const cnt = prog(t, a2 + 0.45, 1.0, ease.outCubic);
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - inP) * 120}px)` }}>
      <AbsoluteFill style={slowPush(t, a0, 540, 1190)}>
      <Desk t={t}>
        <Phone t={t} o={(1 - phoneOut) * (1 - 0.85 * prog(t, a1 - 0.2, 0.4))}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center" }}>
            <div style={{ ...sx(112, 700, "rgba(255,255,255,0.92)"), letterSpacing: "-0.04em" }}>20 MAR</div>
            <svg width={60} height={60} viewBox="0 0 24 24" style={{ marginTop: 40 }}><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.6" /></svg>
          </div>
        </Phone>
        {/* Novo price tag on the desk */}
        {t >= a2 && (
          <div style={{ position: "absolute", left: 540 - 330, top: 820, width: 660, height: 380, opacity: tagIn, transform: `translateY(${(1 - tagIn) * 80}px) rotate(-5deg)` }}>
            <svg width={660} height={380} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <path d="M 120 0 L 640 0 Q 660 0 660 20 L 660 360 Q 660 380 640 380 L 120 380 L 0 190 Z" fill="#F3EEE2" />
              <circle cx={80} cy={190} r={22} fill="#5A3520" />
              <path d="M 80 190 C 40 120, -40 80, -120 40" fill="none" stroke="#D8CFBF" strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 150, top: 70, ...sx(64, 900, INK_D) }}>NOVO</div>
            <div style={{ position: "absolute", left: 150, top: 170, ...sx(120, 900, INK_D) }}>DAAM</div>
            <div style={{ position: "absolute", left: 130, top: 222, width: 470 * strike, height: 12, background: RED, transform: "rotate(-4deg)", transformOrigin: "0 50%" }} />
          </div>
        )}
      </Desk>
      </AbsoluteFill>
      {/* patent header */}
      {t < a1 && (
        <div style={{ position: "absolute", left: G, top: 262, opacity: 1 - hdrOut }}>
          <Rise t={t} a={a0 + 0.2}><div style={sx(108, 900)}>20 MARCH 2026</div></Rise>
          <Rise t={t} a={a0 + 0.45} style={{ marginTop: 22 }}><div style={lbl(56, INK)}>SEMAGLUTIDE PATENT</div></Rise>
          <Rise t={t} a={a0 + 0.55} style={{ marginTop: 6 }}><div style={lbl(56, INK)}>KHATAM <span style={{ color: GREY }}>(INDIA)</span></div></Rise>
        </div>
      )}
      {/* the race */}
      {t >= a1 && t < a2 && (
        <>
          <div style={{ position: "absolute", left: G, top: 262, display: "flex", alignItems: "baseline", gap: 22, opacity: more * (1 - stackOut) }}>
            <span style={sx(150, 900)}>~10</span><span style={sx(64, 900)}>COMPANIES</span>
          </div>
          {[0, 1, 2].map((k) => (
            <div key={k} style={{ position: "absolute", left: 90 + 24 * (k + 1), right: 90 + 24 * (k + 1), top: ys[0] + NH(NOTIFS[0]) - 8 + 14 * k, height: 26, borderRadius: "0 0 22px 22px",
              background: `rgba(245,243,238,${0.6 - k * 0.15})`, opacity: prog(t, a1 + 2.85 + k * 0.25, 0.3) * (1 - stackOut) }} />
          ))}
          {NOTIFS.map((n, k) => t >= arr[k] && (
            <Notif key={n.title} y={ys[k]} p={ease.outExpo(clamp01((t - arr[k]) / 0.4))} app="now" title={n.title} body={n.body} icon={n.icon} />
          )).reverse()}
          <div style={{ position: "absolute", left: G, top: 1308, opacity: prog(t, a1 + 2.9, 0.3) * (1 - stackOut) }}>
            <span style={{ display: "inline-block", padding: "10px 20px", borderRadius: 999, border: "2px solid rgba(255,255,255,0.4)", background: "rgba(10,10,11,0.7)", fontFamily: mono, fontSize: 28, color: INK }}>
              NATCO <span style={{ color: GREEN }}>+12%</span> · 16 FEB (APPROVAL NEWS)
            </span>
          </div>
        </>
      )}
      {/* Novo */}
      {t >= a2 && (
        <>
          <div style={{ position: "absolute", left: G, top: 262 }}>
            <Rise t={t} a={a2 + 0.1}><div style={sx(64, 900)}>NOVO: DAAM</div></Rise>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 18, opacity: clamp01(cnt * 8) }}>
              <span style={{ ...sx(210, 900, RED), fontVariantNumeric: "tabular-nums" }}>−{Math.max(1, Math.round(48 * cnt))}%</span>
              <span style={sx(64, 900)}>TAK</span>
            </div>
            <Rise t={t} a={a2 + 0.6} style={{ marginTop: 14 }}><div style={lbl(54, GREY)}>31 MAR</div></Rise>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/* ================================================================== the lesson: stacked "RACE" (musk B8) */
const CHIP_POS = [{ x: 400, y: 960 }, { x: 680, y: 960 }, { x: 400, y: 1060 }, { x: 680, y: 1060 }];
const CHIPS = ["ZAMEEN", "SERVER", "COOLING", "PHARMA"];
const Lesson: React.FC<{ t: number }> = ({ t }) => {
  const a = S("lesson"), end = E("lesson");
  const col = prog(t, end - 0.35, 0.35, ease.inOutCubic);
  const rows = 11;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={{ ...slowPush(t, a), opacity: 1 - col }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -200, transform: `translateY(${((t - a) * 60) % 196}px)` }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} style={{ ...sx(196, 900, "transparent"), WebkitTextStroke: "2px rgba(138,143,152,0.16)", textAlign: "center", lineHeight: 1,
              opacity: prog(t, a + 1.3 + Math.abs(i - 5) * 0.06, 0.3) }}>RACE</div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center" }}>
          <Rise t={t} a={a + 0.1}><div style={sx(104, 900)}>PATENT KHULA</div></Rise>
          <div style={{ ...sx(80, 900, GREY), margin: "26px 0", opacity: prog(t, a + 1.1, 0.2) }}>↓</div>
          <Rise t={t} a={a + 1.3}><div style={sx(150, 900)}>RACE SHURU</div></Rise>{/* "race shuru" at beat + 1.4 s */}
          <div style={{ ...sx(80, 900, GREY), margin: "26px 0", opacity: prog(t, a + 2.1, 0.2) }}>↓</div>
          <Rise t={t} a={a + 2.3}><div style={sx(124, 900, RED)}>DAAM NEECHE</div></Rise>{/* "aur daam" at beat + 2.4 s */}
        </div>
      </AbsoluteFill>
      {/* words collapse into the four chips */}
      {col > 0 && CHIPS.map((c, i) => (
        <div key={c} style={{ position: "absolute", left: lerp(540, CHIP_POS[i].x, col), top: lerp(760, CHIP_POS[i].y, col), transform: `translate(-50%, -50%) scale(${lerp(0.4, 1, col)})`, opacity: col }}>
          <Chip text={c} />
        </div>
      ))}
    </AbsoluteFill>
  );
};
const Chip: React.FC<{ text: string }> = ({ text }) => (
  <span style={{ display: "inline-block", padding: "16px 0", width: 250, textAlign: "center", borderRadius: 999, border: "2.5px solid rgba(255,255,255,0.85)", ...sx(40, 900) }}>{text}</span>
);

/* ================================================================== CTA: bead ring (footy Cta) */
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const a = S("cta");
  const cols = [INK, GREY, RED, INK, GREY, GREEN];
  const N = 30;
  const pill = ease.outExpo(clamp01((t - (a + 1.8)) / 0.4)); // "comment karo" at beat + 1.94 s
  return (
    <AbsoluteFill style={{ background: BG }}>
      <AbsoluteFill style={slowPush(t, a, 540, 960)}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: N }).map((_, k) => {
            const p = prog(t, a + k * 0.02, 0.6, ease.outExpo);
            const th = (k / N) * Math.PI * 2 + t * 0.25, r = lerp(900, 440, p);
            return <circle key={k} cx={540 + Math.cos(th) * r} cy={960 + Math.sin(th) * r} r={k % 3 === 0 ? 24 : 15} fill={cols[k % cols.length]} opacity={p} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center" }}>
          <Rise t={t} a={a + 0.15}><div style={sx(110, 900)}>KAUNSI</div></Rise>
          <Rise t={t} a={a + 0.3} style={{ marginTop: 8 }}><div style={sx(110, 900)}>LAYER?</div></Rise>
        </div>
        {CHIPS.map((c, i) => (
          <div key={c} style={{ position: "absolute", left: CHIP_POS[i].x, top: CHIP_POS[i].y, transform: "translate(-50%, -50%)" }}><Chip text={c} /></div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: pill, transform: `translateY(${(1 - pill) * 24}px)` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "18px 34px", borderRadius: 999, background: INK }}>
            <span style={sx(44, 900, INK_D)}>COMMENT KARO</span>
            <span style={{ fontSize: 40, fontFamily: "'Noto Color Emoji', sans-serif" }}>👇</span>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ================================================================== end card, static */
const End: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", ...sx(120, 800), letterSpacing: "0.32em", paddingLeft: "0.32em" }}>AVRON</div>
    <div style={{ position: "absolute", left: G, right: G, top: 930, textAlign: "center", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ fontFamily: mono, fontSize: 32, color: INK }}>Opinion only · not investment advice</div>
      <div style={{ fontFamily: mono, fontSize: 26, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>Sources: NSE, JLL, Netweb, Blue Star, Lodha, Natco, Zydus filings</div>
    </div>
  </AbsoluteFill>
);

/* ================================================================== source tags, screen space */
const TAGS: { id: string; d: number; text: string; outAt?: number }[] = [
  { id: "nifty", d: 0.5, text: "Source: NSE levels via Business Standard / Outlook Business" },
  { id: "vacancy", d: 0.5, text: "JLL · H1 2026" },
  { id: "pharma", d: 0.6, text: "Tickertape, 27 Oct" },
  { id: "anantraj", d: 0.6, text: "Equitymaster", outAt: E("anantraj") - 0.5 },
  { id: "patent", d: 0.6, text: "Natco NSE filing, 20 Mar 2026", outAt: E("patent") - 0.25 },
  { id: "race", d: 0.4, text: "Business Standard, ThePrint · NSE · Business Today", outAt: E("race") - 0.35 },
  { id: "novo", d: 0.6, text: "Outlook Business" },
];
const Tags: React.FC<{ t: number }> = ({ t }) => {
  const id = beatAt(t).id;
  const g = TAGS.find((x) => x.id === id);
  return g ? <Source t={t} a={S(id) + g.d} text={g.text} out={g.outAt} /> : null;
};

/* ================================================================== assembly */
const Graphics: React.FC = () => {
  const t = useTime();
  const id = beatAt(t).id;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {id === "hook" && <Hook t={t} />}
      {id === "nifty" && <Nifty t={t} />}
      {id === "ask" && <Ask t={t} />}
      {id === "themes" && t < S("themes") + 0.5 && <Ask t={S("themes") - 0.001} />}
      {id === "themes" && <Themes t={t} />}
      {id === "vacancy" && <Vacancy t={t} />}
      {id === "pharma" && <Pharma t={t} />}
      {id === "burst" && <BurstScene t={t} />}
      {id === "anantraj" && <AnantRaj t={t} />}
      {["layers", "zameen", "server", "cooling"].includes(id) && <Building t={t} S={S} E={E} />}
      {["patent", "race", "novo"].includes(id) && <DeskScenes t={t} />}
      {id === "lesson" && <Lesson t={t} />}
      {id === "cta" && <Cta t={t} />}
      {id === "end" && <End />}
      <Tags t={t} />
    </AbsoluteFill>
  );
};

/** Captions: Roman Hinglish chunks timed to the spoken words, in the old guide subtitle's slot and style. No full stops. */
type Cap = { text: string; show: number; hide: number };
const CAPTIONS = (CAPS as { captions: Cap[] }).captions;
const Caption: React.FC<{ t: number }> = ({ t }) => {
  const c = CAPTIONS.find((x) => t >= x.show && t < x.hide);
  if (!c) return null;
  // back-to-back chunks switch hard on the word boundary; a chunk after a pause fades in, one before a pause fades out
  const after = CAPTIONS.some((x) => x.hide === c.show), before = CAPTIONS.some((x) => x.show === c.hide);
  const o = (after ? 1 : prog(t, c.show, 0.08)) * (before ? 1 : 1 - prog(t, c.hide - 0.1, 0.1));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, bottom: 1920 - 1540, textAlign: "center", opacity: o }}>
      <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 14, background: "rgba(10,10,11,0.55)", fontFamily: sans, fontWeight: 600, fontSize: 40, lineHeight: 1.25,
        letterSpacing: "-0.01em", color: "rgba(255,255,255,0.7)" }}>{c.text}</span>
    </div>
  );
};

export const DcPharmaReel: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <Graphics />
      </CameraMotionBlur>
      <Caption t={t} />
      <Audio src={staticFile("dcpharma/mix.wav")} />
    </AbsoluteFill>
  );
};

