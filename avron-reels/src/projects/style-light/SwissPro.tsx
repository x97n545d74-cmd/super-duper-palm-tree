import React from "react";
import { AbsoluteFill, Audio, Img, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, lerp, useTime } from "../../engine/anim";
import { bezier } from "../../brand/ui";
import { Card, Chars, Count, L, LCursor, LightCanvas, Mono, Pill, Ring, Tabs } from "../../engine/light";
import CUES from "./swisspro_cues.json";

/*
 * Swiss × bright & clean, PRO pass (19 s, 60 fps, original score). The user: "fix everything and make it look like a
 * professional has made this". Changes over SwissLight, one per critique point:
 *  1 sound: original 120 BPM score from the same cue file (scripts/score_swisspro.py ← swisspro_cues.json)
 *  2 no dead air: every transition overlaps; match cuts (headline shrinks into the page title; the ring becomes grid module 1;
 *    the modules collapse into the rule under the wordmark)
 *  3 camera: one slow continuous push + parallax (grid slower than cards slower than type)
 *  4 motion blur on everything that moves fast (CameraMotionBlur)
 *  5 rhythm: snappy UI, held hero numbers, a small anticipation dip before big moves, a critically damped land pulse
 *  6 phone-legible type scale (captions ≥ 24 px mono / 32 px text)
 *  7 real UI detail: drawn layer icons instead of letter tiles, hover lift, ticking numerals; full 9:16 composition
 *  8 finish: fine grain over the frame, 60 fps
 * Swiss grammar (lemo-opuscar styles/swiss-motion/STYLE.md): 6-col grid, flush left, scale contrast, one signal (AVRON gradient
 * on the hero element only), clip-reveals, knife cuts, snaps on the beat with cubic-bezier(.7,0,.2,1).
 * Figures: VERIFIED rows C4, C6, C11 of projects/2026-10-datacenter-pharma/research/claims.md.
 */

const C = CUES as typeof CUES;
export const SWISS_PRO_DURATION = C.duration;
const snapE = bezier(0.7, 0, 0.2, 1);
/** Snap that lands exactly on `at`, starting `dur` earlier. */
const snap = (t: number, at: number, dur = 0.28) => snapE(clamp01((t - (at - dur)) / dur));
/** Anticipation: a small dip (px) in the 0.14 s before a move starts. */
const ant = (t: number, start: number, amt = 10) => (t > start - 0.14 && t < start ? amt * Math.sin((Math.PI * (t - (start - 0.14))) / 0.14) : 0);
/** Land pulse: a critically damped 3 % swell after `at` (no undershoot, no bounce). */
const land = (t: number, at: number) => (t < at ? 1 : 1 + 0.035 * 14 * (t - at) * Math.exp(1 - 14 * (t - at)));

// grid
const M = 84, GUT = 24, COLS = 6;
const COL = (1080 - 2 * M - (COLS - 1) * GUT) / COLS;
const cx = (c: number) => M + c * (COL + GUT);
const span = (n: number) => n * COL + (n - 1) * GUT;
const INK = L.ink;
const gradText: React.CSSProperties = { backgroundImage: L.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

/* ---------------------------------------------------------------- Swiss parts */
const Grid: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: COLS + 1 }).flatMap((_, i) => {
      const x = i === COLS ? 1080 - M : cx(i);
      return (i === 0 || i === COLS ? [x] : [x - GUT, x]).map((xx, j) => {
        const g = clamp01((t - i * 0.05) / 0.7);
        return <div key={`${i}-${j}`} style={{ position: "absolute", left: xx, top: 0, width: 1, height: 1920 * g, background: "rgba(11,18,32,0.07)" }} />;
      });
    })}
  </>
);

const Clip: React.FC<{ t: number; at: number; out?: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, out, dur = 0.34, children, style }) => {
  const p = snap(t, at, dur);
  const o = out === undefined ? 0 : snap(t, out, 0.26);
  if (p <= 0 || o >= 1) return null;
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.14em", marginBottom: "-0.14em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110 - o * 110}%)` }}>{children}</div>
    </div>
  );
};

const CaptionRow: React.FC<{ t: number; at: number; x: number; y: number; w: number; label: string; text?: string; out?: number; big?: boolean }> = ({ t, at, x, y, w, label, text, out, big }) => {
  const rule = clamp01((t - (at - 0.4)) / 0.4);
  const ro = out === undefined ? 0 : clamp01((t - out) / 0.3);
  if (rule <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      <div style={{ height: 2, width: `${rule * (1 - ro) * 100}%`, marginLeft: `${ro * 100}%`, background: INK }} />
      <div style={{ display: "flex", gap: 20, marginTop: 16, alignItems: "baseline" }}>
        <Clip t={t} at={at} out={out}><Mono size={24} color={L.ink3}>{label}</Mono></Clip>
        {text && <Clip t={t} at={at + 0.08} out={out === undefined ? undefined : out + 0.04}><span style={{ fontFamily: L.text, fontWeight: 650, fontSize: big ? 40 : 32, color: INK, letterSpacing: "-0.015em" }}>{text}</span></Clip>}
      </div>
    </div>
  );
};

const knife = (t: number, at: number) => [clamp01((t - (at - 0.3)) / 0.25), snap(t, at + 0.3, 0.3)] as const;
const KnifeLine: React.FC<{ t: number; at: number; x: number; y: number; w: number }> = ({ t, at, x, y, w }) => {
  const [l, c] = knife(t, at);
  if (l <= 0 || c >= 1) return null;
  return <div style={{ position: "absolute", left: x, top: y - 1, width: w * l, height: 3, background: INK, opacity: 1 - c }} />;
};

/** Corner tags: on for the opening and the dashboard, cleared before the grid scene (whose own Fig. 03 row takes the top). */
const Tech: React.FC<{ t: number; text: string; right?: boolean }> = ({ t, text, right }) => (
  <div style={{ position: "absolute", top: 236, ...(right ? { right: M } : { left: M }), opacity: clamp01((t - 0.3) / 0.3) * (1 - clamp01((t - (C.match - 0.3)) / 0.3)) }}><Mono size={22} color={L.ink3}>{text}</Mono></div>
);

/* ---------------------------------------------------------------- layer icons (drawn, no logos) */
const ICONS: Record<string, React.ReactNode> = {
  land: <><path d="M24 42 C24 42 10 28 10 19 a14 14 0 0 1 28 0 C38 28 24 42 24 42 Z" /><circle cx={24} cy={19} r={5} /></>,
  server: <><rect x={8} y={8} width={32} height={10} rx={3} /><rect x={8} y={21} width={32} height={10} rx={3} /><rect x={8} y={34} width={32} height={8} rx={3} /><circle cx={14} cy={13} r={1.6} /><circle cx={14} cy={26} r={1.6} /></>,
  cool: <><path d="M24 6 V42 M8.4 15 L39.6 33 M8.4 33 L39.6 15" /><path d="M19 9 L24 13 L29 9 M19 39 L24 35 L29 39" /></>,
};
const IconTile: React.FC<{ icon: string; active?: number }> = ({ icon, active = 0 }) => (
  <div style={{ width: 92, height: 92, borderRadius: 28, background: active > 0 ? `rgba(79,70,229,${0.08 + 0.04 * active})` : L.fill, border: `1px solid ${L.line}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" stroke={active > 0.5 ? L.indigo : INK} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">{ICONS[icon]}</svg>
  </div>
);

/* ---------------------------------------------------------------- headline → page title (match cut 1) */
const Headline: React.FC<{ t: number }> = ({ t }) => {
  const s = snap(t, C.shrink + 0.55, 0.55);
  const lift = ant(t, C.shrink, 8);
  return (
    <>
      <div style={{ position: "absolute", left: cx(0) - 6, top: lerp(540, 300, s) + lift, transformOrigin: "0 0", transform: `scale(${lerp(1, 0.36, s)})` }}>
        <Chars t={t} a={C.headline_chars} text="Data centre" size={150} stagger={0.03} out={C.match} />
        <div style={{ marginTop: 10 }}><Chars t={t} a={C.boom} text="boom" size={330} gradient stagger={0.06} track={-0.065} out={C.match + 0.06} /></div>
      </div>
      <CaptionRow t={t} at={C.caption1} x={cx(0)} y={1110} w={span(4)} label="Fig. 01" text="Kamata kaun hai?" big out={C.shrink - 0.1} />
      <CaptionRow t={t} at={C.caption1 + 0.25} x={cx(4)} y={1110} w={span(2)} label="AVRON · India" out={C.shrink - 0.05} />
    </>
  );
};

/* ---------------------------------------------------------------- dashboard → detail */
const CARD = { x: cx(0), y: 520, w: span(6), h: 880 };
const ROW_Y = (i: number) => CARD.y + 300 + i * 168;
const RING = { x: 740, y: 700, s: 236 };
const ROWS = [
  { icon: "land", name: "Lodha", sub: "Zameen · Palava ~400 acre", pill: <Pill size={24}>Land</Pill> },
  { icon: "server", name: "Netweb", sub: "Servers · Q1 FY27", pill: <Pill size={24} tone="grad">62% AI</Pill> },
  { icon: "cool", name: "Blue Star", sub: "Cooling · DC orders", pill: <Pill size={24}>Cooling</Pill> },
];
const Dashboard: React.FC<{ t: number }> = ({ t }) => {
  const enter = snap(t, C.card + 0.45, 0.45);
  const open = snap(t, C.open + 0.6, 0.6);
  const fade = 1 - clamp01((t - C.open) / 0.18);
  const tab = snap(t, C.tab, 0.3);
  const hover = clamp01((t - (C.click - 0.45)) / 0.2);
  const row = { x: CARD.x + 44, y: ROW_Y(1), w: CARD.w - 88, h: 150 };
  const box = { x: lerp(row.x, CARD.x, open), y: lerp(row.y, CARD.y, open), w: lerp(row.w, CARD.w, open), h: lerp(row.h, CARD.h, open) };
  const [, collapse] = knife(t, C.match);
  if (t < C.card - 0.5 || collapse >= 1) return null;
  const countK = clamp01((t - C.count) / C.count_dur);
  const pulse = land(t, C.land62);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${CARD.y + CARD.h / 2}px`, transform: `scaleY(${1 - collapse})` }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - enter) * 100}% 0 0 0)`, transform: `translateY(${(1 - enter) * 90}px)` }}>
        <Card {...CARD}>
          <div style={{ opacity: fade, padding: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, background: L.grad }} />
                <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 38, letterSpacing: "-0.03em", color: INK }}>AVRON Markets</div>
              </div>
              <Mono size={24}>Data as of 2 Sep 2026</Mono>
            </div>
            <div style={{ marginTop: 36 }}><Tabs items={["Overview", "Layers", "Filings"]} active={tab} w={CARD.w - 88} h={84} /></div>
            <div style={{ marginTop: 40 }}><Mono size={24}>Data centre layers</Mono></div>
          </div>
        </Card>
        {ROWS.map((r, i) => {
          const isN = i === 1;
          if (isN && open > 0) return null;
          const at = C.rows[i];
          const rk = snap(t, at, 0.3);
          const h = isN ? hover : 0;
          return (
            <div key={r.name} style={{ position: "absolute", left: row.x, top: ROW_Y(i) - 4 * h, width: row.w, height: 150, overflow: "hidden", opacity: fade, borderRadius: 26,
              boxShadow: h > 0 ? `0 ${14 * h}px ${30 * h}px -10px rgba(79,70,229,${0.25 * h})` : undefined }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 26, display: "flex", alignItems: "center", gap: 28, padding: "0 28px", boxSizing: "border-box", transform: `translateY(${(1 - rk) * 101 + ant(t, at - 0.3, 6)}%)`,
                background: h > 0 ? `rgba(255,255,255,${h})` : "transparent", border: `1.5px solid ${h > 0 ? `rgba(79,70,229,${0.4 * h})` : L.line}` }}>
                <IconTile icon={r.icon} active={h} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 46, letterSpacing: "-0.035em", color: INK, lineHeight: 1.05 }}>{r.name}</div>
                  <div style={{ fontFamily: L.text, fontWeight: 500, fontSize: 30, color: L.ink2, marginTop: 6 }}>{r.sub}</div>
                </div>
                {r.pill}
              </div>
            </div>
          );
        })}
        {open > 0 && (
          <Card x={box.x} y={box.y} w={box.w} h={box.h} r={lerp(26, 32, open)} lift>
            <div style={{ position: "absolute", left: 48, top: 48, right: 48 }}>
              <Clip t={t} at={C.open + 0.75}><Mono size={24}>Fig. 02 · Netweb · Servers layer</Mono></Clip>
            </div>
            <div style={{ position: "absolute", left: 36, top: 150, transformOrigin: "0 100%", transform: `scale(${pulse})` }}>
              <Clip t={t} at={C.count}>
                <div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 240, letterSpacing: "-0.07em", lineHeight: 0.9, ...gradText }}>
                  <Count t={t} a={C.count} to={62} d={C.count_dur} />%
                </div>
              </Clip>
            </div>
            <div style={{ position: "absolute", left: 48, top: 450 }}>
              <Clip t={t} at={C.land62 - 0.25}><div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 68, letterSpacing: "-0.04em", color: INK, lineHeight: 1 }}>revenue AI systems se</div></Clip>
            </div>
            <div style={{ position: "absolute", left: 48, right: 48, top: 620 }}><CaptionRow t={t} at={C.caption_q1} x={0} y={0} w={CARD.w - 96} label="Q1 FY27" text="62.29% of revenue" /></div>
            <div style={{ position: "absolute", left: 48, right: 48, top: 730 }}><CaptionRow t={t} at={C.caption_src} x={0} y={0} w={CARD.w - 96} label="Source" text="Netweb Q1 FY27 results · NSE" /></div>
          </Card>
        )}
        {/* the ring lives in frame space so it can leave the card in the match cut */}
        {open > 0.9 && t < C.match && (
          <div style={{ position: "absolute", left: RING.x, top: RING.y - 140, opacity: clamp01((t - C.count) / 0.2), transform: `scale(${pulse})` }}>
            <Ring size={RING.s} stroke={26} p={0.6229 * countK} id="ringA" />
          </div>
        )}
      </div>
      <KnifeLine t={t} at={C.match} x={CARD.x - 30} y={CARD.y + CARD.h / 2} w={CARD.w + 60} />
    </div>
  );
};

/* lower statement (Swiss subtitles as layout) */
const Statement: React.FC<{ t: number }> = ({ t }) => (
  <CaptionRow t={t} at={C.statement2} x={cx(0)} y={1430} w={span(6)} label="Fig. 02" text="3 layers: zameen, servers, cooling" big out={C.open - 0.05} />
);

/* ---------------------------------------------------------------- match cut 2: the ring becomes module 1 */
const MOD_Y = 760, MS = COL;
const RingToModule: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.match || t > C.solid[0] + 0.05) return null;
  const m = snap(t, C.solid[0], C.solid[0] - C.match);
  const x = lerp(RING.x, cx(0), m), y = lerp(RING.y - 140, MOD_Y, m), s = lerp(RING.s, MS, m);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: s, height: s }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - m }}><div style={{ transform: `scale(${s / RING.s})`, transformOrigin: "0 0" }}><Ring size={RING.s} stroke={30} p={0.6229 + (1 - 0.6229) * m} id="ringB" /></div></div>
      <div style={{ position: "absolute", inset: 0, borderRadius: lerp(s / 2, 18, m), background: INK, opacity: m }} />
    </div>
  );
};

/* ---------------------------------------------------------------- the grid means something: 1 module = 0.2 GW */
const Modules: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.solid[0] - 0.05) return null;
  const total = 30, solid = C.solid.length;
  const at = (i: number) => (i < solid ? C.solid[i] : C.est_start + (i - solid) * C.est_step);
  const rowOut = (r: number) => C.collapse + (4 - r) * 0.07; // bottom row first
  const pulse = land(t, C.num6 + 0.3);
  return (
    <>
      <div style={{ position: "absolute", left: cx(0), top: 322, width: span(6), display: "flex", justifyContent: "space-between", opacity: 1 - clamp01((t - C.collapse) / 0.3) }}>
        <Clip t={t} at={C.solid[0] + 0.1}><Mono size={24} color={L.ink3}>Fig. 03 · 1 module = 0.2 GW</Mono></Clip>
        <Clip t={t} at={C.solid[0] + 0.2}><Mono size={24} color={L.ink3}>6 × 5 = 30</Mono></Clip>
      </div>
      <div style={{ position: "absolute", left: cx(0) - 12, top: 392, transformOrigin: "0 100%", transform: `scale(${pulse})` }}>
        <Clip t={t} at={C.num16} out={C.num6 - 0.05} dur={0.3}><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 250, letterSpacing: "-0.07em", lineHeight: 0.9, color: INK }}>1.6<span style={{ fontSize: 110, letterSpacing: "-0.04em" }}> GW</span></div></Clip>
      </div>
      <div style={{ position: "absolute", left: cx(0) - 12, top: 392, transformOrigin: "0 100%", transform: `scale(${pulse})` }}>
        <Clip t={t} at={C.num6 + 0.25} out={C.collapse} dur={0.3}><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 250, letterSpacing: "-0.07em", lineHeight: 0.9, ...gradText }}>~6<span style={{ fontSize: 110, letterSpacing: "-0.04em" }}> GW</span></div></Clip>
      </div>
      <CaptionRow t={t} at={C.caption_jun} x={cx(0)} y={655} w={span(3)} label="Jun 2026" text="India DC capacity" out={C.collapse} />
      <CaptionRow t={t} at={C.caption_2029} x={cx(3)} y={655} w={span(3)} label="2029" text="JLL anumaan" out={C.collapse + 0.05} />
      {Array.from({ length: total }).map((_, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const isSolid = i < solid;
        const k = i === 0 ? 1 : snap(t, at(i), 0.2);
        const col = 1 - snap(t, rowOut(r) + 0.25, 0.25);
        if (k <= 0 || col <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: cx(c), top: MOD_Y + r * (MS + GUT), width: MS, height: MS, overflow: "hidden", transform: `scaleY(${col})` }}>
            <div style={{ width: "100%", height: "100%", transform: `translateY(${(1 - k) * 101}%)`, borderRadius: 18, boxSizing: "border-box",
              ...(isSolid ? { background: INK } : { border: "3px dashed rgba(79,70,229,0.55)", background: "rgba(255,255,255,0.75)" }) }} />
          </div>
        );
      })}
      <CaptionRow t={t} at={C.caption_jll} x={cx(0)} y={MOD_Y + 5 * (MS + GUT) + 2} w={span(6)} label="Source" text="JLL via IANS · dashed = estimate" out={C.collapse} />
    </>
  );
};

/* ---------------------------------------------------------------- end: the system closes into one word */
const End: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.collapse + 0.3) return null;
  const rule = clamp01((t - (C.collapse + 0.35)) / 0.5);
  return (
    <>
      <div style={{ position: "absolute", left: cx(0) - 8, top: 1130 }}>
        <Chars t={t} a={C.avron} text="AVRON" size={210} gradient stagger={0.05} track={-0.05} />
      </div>
      <div style={{ position: "absolute", left: cx(0), top: 1372, width: span(6) * rule, height: 2, background: INK }} />
      <div style={{ position: "absolute", left: cx(0), top: 1392 }}>
        <Clip t={t} at={C.saved}><span style={{ fontFamily: L.text, fontWeight: 650, fontSize: 36, color: INK, letterSpacing: "-0.015em" }}>Saved to AVRON Watchlist</span></Clip>
      </div>
      <div style={{ position: "absolute", left: cx(0), top: 1460 }}>
        <Clip t={t} at={C.disclaimer}><Mono size={22} color={L.ink3}>Anuman hai, guarantee nahi · not investment advice</Mono></Clip>
      </div>
    </>
  );
};

export const SwissPro: React.FC = () => {
  const t = useTime();
  const push = 1 + 0.04 * (t / C.duration); // one slow continuous push for the whole film
  return (
    <AbsoluteFill>
      <LightCanvas t={t} intensity={0.7}>
        <CameraMotionBlur shutterAngle={180} samples={5}>
          <AbsoluteFill style={{ transformOrigin: "540px 960px", transform: `scale(${push})` }}>
            <AbsoluteFill style={{ transform: `translateY(${-t * 2}px)` }}><Grid t={t} /></AbsoluteFill>
            <AbsoluteFill style={{ transform: `translateY(${-t * 4}px)` }}>
              <Dashboard t={t} />
              <RingToModule t={t} />
              <Modules t={t} />
            </AbsoluteFill>
            <AbsoluteFill style={{ transform: `translateY(${-t * 6}px)` }}>
              {t < C.match + 0.6 && <Headline t={t} />}
              {t < C.open + 0.4 && <Statement t={t} />}
              <End t={t} />
            </AbsoluteFill>
            <LCursor t={t} keys={[{ t: C.cursor_in, x: 1010, y: 1720 }, { t: C.click - 0.3, x: 790, y: ROW_Y(1) + 80 }, { t: C.click, x: 790, y: ROW_Y(1) + 80, click: true }, { t: C.click + 0.7, x: 1120, y: 1900 }]} />
          </AbsoluteFill>
        </CameraMotionBlur>
        <Tech t={t} text="AVRON / Markets" />
        <Tech t={t} text="120 bpm · 6 col" right />
      </LightCanvas>
      {/* finish: fine moving grain so the gradients never band */}
      <Img src={staticFile(`brand/grain_${Math.floor(t * 24) % 4}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.07, mixBlendMode: "overlay" }} />
      <Audio src={staticFile("swisspro/score.wav")} />
    </AbsoluteFill>
  );
};
