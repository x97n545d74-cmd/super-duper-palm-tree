import React from "react";
import { clamp01, lerp, useTime } from "../../engine/anim";
import { bezier } from "../../brand/ui";
import { Card, Chars, Count, L, LCursor, LightCanvas, Mono, Pill, Ring, Tabs, Tile } from "../../engine/light";

/*
 * Swiss × bright & clean (18 s, silent). The user asked (2026-10-28) to take "Swiss Motion Graphics" from the lemo-opuscar
 * style library and combine it with the bright & clean style test they liked (StyleLight).
 * From Swiss (lemo-opuscar styles/swiss-motion/STYLE.md, grammar only): a visible 6-column grid, flush-left type,
 * extreme scale contrast (giant numeral + tiny caption rows with a 1 px rule), one signal (the AVRON gradient, only on the
 * hero element of each shot), clip-reveals instead of fades, knife-cut deletions, snaps that land on a 120 BPM beat with
 * cubic-bezier(.7,0,.2,1), and a grid whose modules mean something (1 module = 0.2 GW).
 * From the liked demo: light canvas, white product cards, dashboard + cursor + shared-element expand + ring, per-character type.
 * Figures: VERIFIED rows C4, C6, C11 of projects/2026-10-datacenter-pharma/research/claims.md.
 */

export const SWISS_LIGHT_DURATION = 18;
const BEAT = 0.5; // 120 BPM: every arrival lands on a beat
const b = (n: number) => n * BEAT;
const snapE = bezier(0.7, 0, 0.2, 1);
/** Snap progress: starts one note value (`dur`) before beat time `at` and lands on it. */
const snap = (t: number, at: number, dur = BEAT / 2) => snapE(clamp01((t - (at - dur)) / dur));

// grid: 6 columns on the 1080 frame
const M = 84, GUT = 24, COLS = 6;
const COL = (1080 - 2 * M - (COLS - 1) * GUT) / COLS; // 132
const cx = (c: number) => M + c * (COL + GUT);
const span = (n: number) => n * COL + (n - 1) * GUT;
const INK = L.ink;

/* ---------------------------------------------------------------- Swiss parts */

/** Grid lines that draw themselves top to bottom (linear), then sit as a light-grey secondary voice. */
const Grid: React.FC<{ t: number; a: number; out?: number }> = ({ t, a, out }) => {
  const o = out === undefined ? 1 : 1 - clamp01((t - out) / 0.3);
  return (
    <>
      {Array.from({ length: COLS + 1 }).flatMap((_, i) => {
        const x = i === COLS ? 1080 - M : cx(i);
        const xs = i === 0 || i === COLS ? [x] : [x - GUT, x];
        return xs.map((xx, j) => {
          const g = clamp01((t - a - i * 0.05) / 0.6);
          return <div key={`${i}-${j}`} style={{ position: "absolute", left: xx, top: 0, width: 1, height: 1920 * g, background: "rgba(11,18,32,0.07)", opacity: o }} />;
        });
      })}
    </>
  );
};

/** Clip-reveal line: rises out of its own baseline on a snap; leaves upward. */
const Clip: React.FC<{ t: number; at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, at, out, children, style }) => {
  const p = snap(t, at, 0.35);
  const o = out === undefined ? 0 : snap(t, out, 0.3);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110 - o * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Caption row: a 1 px rule that grows (linear), then a small note clip-reveals under it. */
const CaptionRow: React.FC<{ t: number; at: number; x: number; y: number; w: number; label: string; text?: string; out?: number }> = ({ t, at, x, y, w, label, text, out }) => {
  const rule = clamp01((t - (at - BEAT)) / BEAT);
  const o = out === undefined ? 0 : clamp01((t - out) / 0.25);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: 1 - o }}>
      <div style={{ height: 1.5, width: `${rule * 100}%`, background: INK }} />
      <div style={{ display: "flex", gap: 18, marginTop: 14, alignItems: "baseline" }}>
        <Clip t={t} at={at}><Mono size={20} color={L.ink3}>{label}</Mono></Clip>
        {text && <Clip t={t} at={at + 0.1}><span style={{ fontFamily: L.text, fontWeight: 600, fontSize: 26, color: INK, letterSpacing: "-0.01em" }}>{text}</span></Clip>}
      </div>
    </div>
  );
};

/** Knife cut: a line crosses the element (linear), then the element collapses to its midline. Returns [lineProgress, collapse]. */
const knife = (t: number, at: number) => [clamp01((t - (at - 0.35)) / 0.3), snap(t, at + 0.25, 0.3)] as const;
const KnifeLine: React.FC<{ t: number; at: number; x: number; y: number; w: number }> = ({ t, at, x, y, w }) => {
  const [l, c] = knife(t, at);
  if (l <= 0 || c >= 1) return null;
  return <div style={{ position: "absolute", left: x, top: y, width: w * l, height: 2, background: INK, opacity: 1 - c }} />;
};

const Tech: React.FC<{ t: number; a: number; text: string; right?: boolean; y?: number }> = ({ t, a, text, right, y = 240 }) => (
  <div style={{ position: "absolute", top: y, ...(right ? { right: M } : { left: M }), opacity: clamp01((t - a) / 0.2) }}><Mono size={18} color={L.ink3}>{text}</Mono></div>
);

const gradText: React.CSSProperties = { backgroundImage: L.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };

/* ---------------------------------------------------------------- 1. headline on the grid */
const Headline: React.FC<{ t: number }> = ({ t }) => {
  const pan = snap(t, b(7), 0.45); // hard pan up by one page
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${-pan * 1200}px)` }}>
      <div style={{ position: "absolute", left: cx(0) - 6, top: 520 }}>
        <Chars t={t} a={b(1) - 0.25} text="Data centre" size={150} stagger={0.03} />
        <div style={{ marginTop: 10 }}><Chars t={t} a={b(2) - 0.25} text="boom" size={330} gradient stagger={0.06} track={-0.065} /></div>
      </div>
      <CaptionRow t={t} at={b(4)} x={cx(0)} y={1070} w={span(4)} label="Fig. 01" text="Kamata kaun hai?" />
      <CaptionRow t={t} at={b(5)} x={cx(4)} y={1070} w={span(2)} label="AVRON · India" />
    </div>
  );
};

/* ---------------------------------------------------------------- 2–3. dashboard → detail (the liked demo, set on the grid) */
const CARD = { x: cx(0), y: 560, w: span(6), h: 900 };
const ROW_Y = (i: number) => CARD.y + 330 + i * 166;
const T_TAB = b(8.25), T_CLICK = b(12), T_OPEN = b(12.5), T_CUT = b(20);
const ROWS = [
  { letter: "L", name: "Lodha", sub: "Zameen · Palava ~400 acre", pill: <Pill>Land</Pill>, c: ["#0EA5E9", "#22D3EE"] },
  { letter: "N", name: "Netweb", sub: "Servers · Q1 FY27", pill: <Pill tone="grad">62% AI</Pill>, c: ["#4F46E5", "#8B5CF6"] },
  { letter: "B", name: "Blue Star", sub: "Cooling · DC orders", pill: <Pill>Cooling</Pill>, c: ["#FF7A59", "#FBBF24"] },
];
const Dashboard: React.FC<{ t: number }> = ({ t }) => {
  const enter = snap(t, b(7.25), 0.5);
  const open = snap(t, T_OPEN + 0.35, 0.6);
  const fade = 1 - clamp01((t - T_OPEN) / 0.2);
  const tab = snap(t, T_TAB, 0.35);
  const hover = clamp01((t - (T_CLICK - 0.4)) / 0.2);
  const row = { x: CARD.x + 44, y: ROW_Y(1), w: CARD.w - 88, h: 150 };
  const box = { x: lerp(row.x, CARD.x, open), y: lerp(row.y, CARD.y, open), w: lerp(row.w, CARD.w, open), h: lerp(row.h, CARD.h, open) };
  const [, collapse] = knife(t, T_CUT);
  const detailIn = snap(t, T_OPEN + 0.95, 0.35);
  if (t < b(7.25) - 0.5 || collapse >= 1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${CARD.y + CARD.h / 2}px`, transform: `scaleY(${1 - collapse})` }}>
      {/* the card wipes up into place from its own bottom edge (clip, not fade) */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - enter) * 100}% 0 0 0)`, transform: `translateY(${(1 - enter) * 80}px)` }}>
        <Card {...CARD}>
          <div style={{ opacity: fade, padding: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Tile letter="A" from={L.indigo} to={L.cyan} size={72} />
                <div>
                  <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em", color: INK }}>AVRON Markets</div>
                  <Mono size={20}>Data as of 2 Sep 2026</Mono>
                </div>
              </div>
              <Pill size={22}>India</Pill>
            </div>
            <div style={{ marginTop: 40 }}><Tabs items={["Overview", "Layers", "Filings"]} active={tab} w={CARD.w - 88} /></div>
            <div style={{ marginTop: 44 }}><Mono>Data centre layers</Mono></div>
          </div>
          <div style={{ position: "absolute", left: 44, right: 44, bottom: 40, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${L.line}`, paddingTop: 30, opacity: fade * clamp01((t - T_TAB) / 0.3) }}>
            <Mono size={20}>Source · company filings · NSE</Mono><Pill size={22}>3 layers</Pill>
          </div>
        </Card>
        {ROWS.map((r, i) => {
          const isN = i === 1;
          if (isN && open > 0) return null;
          const rk = snap(t, T_TAB + b(0.5 + 0.5 * i), 0.3); // one row per half beat
          return (
            <div key={r.name} style={{ position: "absolute", left: row.x, top: ROW_Y(i), width: row.w, height: 150, overflow: "hidden", opacity: fade }}>
              <div style={{ width: "100%", height: "100%", borderRadius: 24, display: "flex", alignItems: "center", gap: 26, padding: "0 26px", boxSizing: "border-box", transform: `translateY(${(1 - rk) * 101}%)`,
                background: isN ? `rgba(79,70,229,${0.06 * hover})` : "transparent", border: `1.5px solid ${isN ? `rgba(79,70,229,${0.35 * hover})` : L.line}` }}>
                <Tile letter={r.letter} from={r.c[0]} to={r.c[1]} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em", color: INK }}>{r.name}</div>
                  <div style={{ fontFamily: L.text, fontWeight: 500, fontSize: 26, color: L.ink2, marginTop: 6 }}>{r.sub}</div>
                </div>
                {r.pill}
              </div>
            </div>
          );
        })}
        {open > 0 && (
          <Card x={box.x} y={box.y} w={box.w} h={box.h} r={lerp(24, 32, open)} lift>
            <div style={{ padding: 48 }}>
              <Clip t={t} at={T_OPEN + 0.95}><Mono size={20}>Fig. 02 · Netweb · Layer 2 · Servers</Mono></Clip>
              {/* extreme scale contrast: giant numeral flush left beside the ring */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 40 }}>
                <div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 215, letterSpacing: "-0.07em", lineHeight: 0.9, marginLeft: -12, ...gradText, opacity: detailIn }}>
                  <Count t={t} a={T_OPEN + 1.0} to={62} d={b(3)} />%
                </div>
                <Ring size={250} stroke={28} p={0.6229 * clamp01((t - (T_OPEN + 1.0)) / b(3))} />
              </div>
              <div style={{ marginTop: 40 }}><Clip t={t} at={T_OPEN + b(3)}><div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em", color: INK, lineHeight: 1 }}>revenue AI systems se</div></Clip></div>
              <div style={{ position: "absolute", left: 48, right: 48, bottom: 150 }}><CaptionRow t={t} at={T_OPEN + b(4)} x={0} y={0} w={span(6) - 96} label="Q1 FY27" text="62.29% of revenue" /></div>
              <div style={{ position: "absolute", left: 48, right: 48, bottom: 60 }}><CaptionRow t={t} at={T_OPEN + b(5)} x={0} y={0} w={span(6) - 96} label="Source" text="Netweb Q1 FY27 results · NSE" /></div>
            </div>
          </Card>
        )}
      </div>
      <KnifeLine t={t} at={T_CUT} x={CARD.x - 20} y={CARD.y + CARD.h / 2} w={CARD.w + 40} />
      <LCursor t={t} keys={[{ t: b(10), x: 1010, y: 1720 }, { t: T_CLICK - 0.35, x: 760, y: ROW_Y(1) + 80 }, { t: T_CLICK, x: 760, y: ROW_Y(1) + 80, click: true }, { t: T_CLICK + 0.7, x: 1120, y: 1900 }]} />
    </div>
  );
};

/* ---------------------------------------------------------------- 4. the grid means something: 1 module = 0.2 GW */
const T_MOD = b(21);
const MS = COL, MG = GUT, ROWS_N = 5, MOD_Y = 900;
const Modules: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_MOD - 0.6) return null;
  const solid = 8, total = 30;
  const solidAt = (i: number) => T_MOD + b(1) + i * 0.1; // ripple, nearest first
  const estAt = (i: number) => T_MOD + b(5) + (i - solid) * 0.045;
  const shownGW = t < T_MOD + b(5) ? "1.6" : "~6";
  const out = T_END_CUT;
  const [, collapse] = knife(t, out);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 1200px", transform: `scaleY(${1 - collapse})`, opacity: collapse >= 1 ? 0 : 1 }}>
      <Tech t={t} a={T_MOD} text="Fig. 03 · 1 module = 0.2 GW" />
      <Tech t={t} a={T_MOD} text="6 × 5 = 30" right />
      <div style={{ position: "absolute", left: cx(0) - 10, top: 330 }}>
        <Clip t={t} at={T_MOD + b(1)} key={shownGW}><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 300, letterSpacing: "-0.07em", lineHeight: 0.92, ...(shownGW === "~6" ? gradText : { color: INK }) }}>{shownGW}<span style={{ fontSize: 120, letterSpacing: "-0.04em" }}> GW</span></div></Clip>
      </div>
      <CaptionRow t={t} at={T_MOD + b(2)} x={cx(0)} y={720} w={span(3)} label="Jun 2026" text="India DC capacity" />
      <CaptionRow t={t} at={T_MOD + b(6)} x={cx(3)} y={720} w={span(3)} label="2029" text="JLL anumaan" />
      {Array.from({ length: total }).map((_, i) => {
        const c = i % COLS, r = Math.floor(i / COLS);
        const isSolid = i < solid;
        const at = isSolid ? solidAt(i) : estAt(i);
        const k = snap(t, at, 0.2);
        if (k <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: cx(c), top: MOD_Y + r * (MS + MG), width: MS, height: MS, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", transform: `translateY(${(1 - k) * 101}%)`, borderRadius: 18, boxSizing: "border-box",
              ...(isSolid ? { background: INK } : { border: `3px dashed rgba(79,70,229,0.55)`, background: "rgba(255,255,255,0.7)" }) }} />
          </div>
        );
      })}
      <CaptionRow t={t} at={T_MOD + b(8)} x={cx(0)} y={MOD_Y + ROWS_N * (MS + MG) + 6} w={span(6)} label="Source" text="JLL via IANS · 2 Sep 2026 · dashed = estimate" />
      <KnifeLine t={t} at={out} x={cx(0) - 20} y={1200} w={span(6) + 40} />
    </div>
  );
};

/* ---------------------------------------------------------------- 5. empty grid, one word flush left in the corner */
const T_END_CUT = b(30);
const End: React.FC<{ t: number }> = ({ t }) => {
  const a = T_END_CUT + 0.5;
  if (t < a - 0.4) return null;
  return (
    <>
      <div style={{ position: "absolute", left: cx(0) - 8, top: 1180 }}>
        <Chars t={t} a={a} text="AVRON" size={200} gradient stagger={0.05} track={-0.05} />
      </div>
      <CaptionRow t={t} at={a + b(2)} x={cx(0)} y={1400} w={span(6)} label="Saved" text="AVRON Watchlist · anuman hai, guarantee nahi" />
    </>
  );
};

export const SwissLight: React.FC = () => {
  const t = useTime();
  return (
    <LightCanvas t={t} intensity={0.75}>
      <Grid t={t} a={0} />
      <Tech t={t} a={0.3} text="AVRON / Markets" />
      <Tech t={t} a={0.3} text="120 bpm · 6 col" right />
      {t < b(8) && <Headline t={t} />}
      <Dashboard t={t} />
      <Modules t={t} />
      <End t={t} />
      <div style={{ position: "absolute", right: M, top: 1830 }}><Mono size={18} color={L.ink3}>Style test · Swiss × bright &amp; clean</Mono></div>
    </LightCanvas>
  );
};

