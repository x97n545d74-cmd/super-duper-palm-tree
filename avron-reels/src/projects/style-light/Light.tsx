import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, lerp, useTime } from "../../engine/anim";
import { curve } from "../../brand/ui";
import { Card, Chars, Count, k, L, LCursor, LightCanvas, Mono, Pill, Ring, RollWord, Tabs, Tile } from "../../engine/light";

/*
 * Style test: "bright & clean" (12.8 s, silent). The user's pick after rejecting the dark and 3D studies (2026-10-28).
 * Kinetic hook → the headline shrinks into a product dashboard → cursor opens Netweb → row expands into a detail card
 * with a gradient ring → push to a 2.5D card stack (1.6 GW → ~6 GW) → end.
 * Figures: VERIFIED rows C4, C6, C10, C11, C12 of projects/2026-10-datacenter-pharma/research/claims.md.
 */

export const STYLE_LIGHT_DURATION = 12.8;
const X = 84, W = 912;
const CARD = { x: X, y: 540, w: W, h: 930 };
const ROW_Y = (i: number) => CARD.y + 330 + i * 168;
const T_SHRINK = 2.2, T_CARD = 2.5, T_TAB = 3.3, T_CLICK = 4.75, T_OPEN = 4.95, T_PUSH = 8.3, T_ROLL = 9.9, T_END = 11.2;

/* ---------------------------------------------------------------- hook → title */
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const s = k(t, T_SHRINK, 0.8, curve.inOut);
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 470, opacity: 1 - k(t, T_SHRINK, 0.3) }}><Mono size={24}>AVRON · Markets · Data centres</Mono></div>
      <div style={{ position: "absolute", left: X, top: lerp(560, 300, s), transformOrigin: "0 0", transform: `scale(${lerp(1, 0.4, s)})` }}>
        <Chars t={t} a={0.15} text="Data centre" size={150} />
        <div style={{ marginTop: 6 }}><Chars t={t} a={0.42} text="boom" size={310} gradient stagger={0.06} track={-0.065} /></div>
      </div>
      <div style={{ position: "absolute", left: X, top: 1040 }}>
        <Chars t={t} a={0.95} text="Kamata kaun hai?" size={96} weight={800} color={L.ink2} out={T_SHRINK - 0.15} stagger={0.02} />
      </div>
    </>
  );
};

/* ---------------------------------------------------------------- dashboard → detail */
const ROWS = [
  { letter: "L", name: "Lodha", sub: "Zameen · Palava ~400 acre", pill: <Pill>Land</Pill>, c: ["#0EA5E9", "#22D3EE"] },
  { letter: "N", name: "Netweb", sub: "Servers · Q1 FY27", pill: <Pill tone="grad">62% AI</Pill>, c: ["#4F46E5", "#8B5CF6"] },
  { letter: "B", name: "Blue Star", sub: "Cooling · DC orders", pill: <Pill>Cooling</Pill>, c: ["#FF7A59", "#FBBF24"] },
];
const Dashboard: React.FC<{ t: number }> = ({ t }) => {
  const enter = k(t, T_CARD, 0.95);
  const open = k(t, T_OPEN, 0.75, curve.inOut);
  const fade = 1 - k(t, T_OPEN, 0.25);
  const tab = lerp(0, 1, k(t, T_TAB, 0.45, curve.inOut));
  const hover = k(t, 4.35, 0.2);
  // the Netweb row's box grows into the whole card (shared element)
  const row = { x: CARD.x + 44, y: ROW_Y(1), w: CARD.w - 88, h: 150 };
  const box = { x: lerp(row.x, CARD.x, open), y: lerp(row.y, CARD.y, open), w: lerp(row.w, CARD.w, open), h: lerp(row.h, CARD.h, open) };
  const detail = k(t, T_OPEN + 0.55, 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 2200 }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 1000px", transform: `translateY(${(1 - enter) * 420}px) rotateX(${(1 - enter) * 28}deg)`, opacity: clamp01(enter * 2) }}>
        <Card {...CARD}>
          <div style={{ opacity: fade, padding: 44 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Tile letter="A" from={L.indigo} to={L.cyan} size={72} />
                <div>
                  <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 36, letterSpacing: "-0.03em", color: L.ink }}>AVRON Markets</div>
                  <Mono size={20}>Data as of 2 Sep 2026</Mono>
                </div>
              </div>
              <Pill size={22}>India</Pill>
            </div>
            <div style={{ marginTop: 40 }}><Tabs items={["Overview", "Layers", "Filings"]} active={tab} w={CARD.w - 88} /></div>
            <div style={{ marginTop: 44 }}><Mono>Data centre layers</Mono></div>
          </div>
          <div style={{ position: "absolute", left: 44, right: 44, bottom: 40, display: "flex", alignItems: "center", justifyContent: "space-between", opacity: fade * k(t, T_TAB + 0.6), borderTop: `1px solid ${L.line}`, paddingTop: 30 }}>
            <Mono size={20}>Source · company filings · NSE</Mono>
            <Pill size={22}>3 layers</Pill>
          </div>
        </Card>
        {ROWS.map((r, i) => {
          const rk = k(t, T_TAB + 0.25 + i * 0.09, 0.6);
          const isN = i === 1;
          if (isN && open > 0) return null;
          return (
            <div key={r.name} style={{ position: "absolute", left: row.x, top: ROW_Y(i), width: row.w, height: 150, borderRadius: 24, display: "flex", alignItems: "center", gap: 26, padding: "0 26px", boxSizing: "border-box",
              background: isN ? `rgba(79,70,229,${0.06 * hover})` : "transparent", border: `1.5px solid ${isN ? `rgba(79,70,229,${0.35 * hover})` : L.line}`,
              opacity: rk * fade, transform: `translateY(${(1 - rk) * 30}px)` }}>
              <Tile letter={r.letter} from={r.c[0]} to={r.c[1]} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em", color: L.ink }}>{r.name}</div>
                <div style={{ fontFamily: L.text, fontWeight: 500, fontSize: 26, color: L.ink2, marginTop: 6 }}>{r.sub}</div>
              </div>
              {r.pill}
            </div>
          );
        })}
        {open > 0 && (
          <Card x={box.x} y={box.y} w={box.w} h={box.h} r={lerp(24, 32, open)} lift style={{ border: `1.5px solid rgba(79,70,229,${0.3 * (1 - open)})` }}>
            <div style={{ opacity: 1 - k(t, T_OPEN, 0.2), position: "absolute", left: 26, top: 33, display: "flex", alignItems: "center", gap: 26 }}>
              <Tile letter="N" from={L.indigo} to={L.violet} />
              <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 44, letterSpacing: "-0.035em", color: L.ink }}>Netweb</div>
            </div>
            <div style={{ opacity: detail, padding: 48 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <Tile letter="N" from={L.indigo} to={L.violet} size={76} />
                <div>
                  <div style={{ fontFamily: L.sans, fontWeight: 800, fontSize: 48, letterSpacing: "-0.035em", color: L.ink }}>Netweb</div>
                  <Mono size={20}>Layer 2 · Servers · Q1 FY27</Mono>
                </div>
              </div>
              <div style={{ position: "relative", width: 500, height: 500, margin: "46px auto 0" }}>
                <Ring size={500} p={0.6229 * k(t, T_OPEN + 0.75, 1.4)} />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 150, letterSpacing: "-0.06em", color: L.ink, lineHeight: 1 }}><Count t={t} a={T_OPEN + 0.75} to={62} d={1.4} />%</div>
                  <Mono size={20} style={{ marginTop: 10 }}>62.29% of revenue</Mono>
                </div>
              </div>
              <div style={{ textAlign: "center", marginTop: 34, fontFamily: L.sans, fontWeight: 800, fontSize: 46, letterSpacing: "-0.035em", color: L.ink }}>revenue AI systems se</div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}><Pill size={22}>Source · Netweb Q1 FY27 results · NSE</Pill></div>
            </div>
          </Card>
        )}
      </div>
      <LCursor t={t} keys={[{ t: 3.7, x: 1010, y: 1720 }, { t: 4.45, x: 760, y: ROW_Y(1) + 80 }, { t: T_CLICK, x: 760, y: ROW_Y(1) + 80, click: true }, { t: 5.3, x: 1100, y: 1900 }]} />
    </div>
  );
};

/* ---------------------------------------------------------------- 2.5D stack */
const Stack: React.FC<{ t: number }> = ({ t }) => {
  const a = T_PUSH + 0.25;
  const rise = k(t, T_ROLL, 0.8, curve.inOut);
  const layer = (i: number, z: number, child: React.ReactNode, style: React.CSSProperties = {}) => {
    const e = k(t, a + 0.15 + i * 0.12, 0.8);
    return (
      <div style={{ position: "absolute", inset: 0, borderRadius: 40, background: "#fff", boxShadow: L.shadowLift, transform: `translateZ(${z + (1 - e) * 500}px)`, opacity: clamp01(e * 2), padding: 44, boxSizing: "border-box", ...style }}>{child}</div>
    );
  };
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 330 }}><Chars t={t} a={a} text="Capacity" size={130} /></div>
      <div style={{ position: "absolute", left: X, top: 470 }}>
        <RollWord t={t} size={210} gradient words={[{ w: "1.6 GW", at: a + 0.3 }, { w: "~6 GW", at: T_ROLL }]} />
      </div>
      <div style={{ position: "absolute", left: X, top: 760, opacity: k(t, a + 0.6) }}><Mono size={24}>India DC capacity · Jun 2026 → 2029 (JLL anumaan)</Mono></div>
      <div style={{ position: "absolute", left: 540 - 380, top: 1060, width: 760, height: 470, transformStyle: "preserve-3d", transform: "rotateX(56deg) rotateZ(-36deg)" }}>
        {layer(0, 0, <><Mono>Vacancy · H1 2026</Mono><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 130, letterSpacing: "-0.06em", color: L.ink, marginTop: 20 }}>2.8%</div></>)}
        {layer(1, 90, <><Mono>Capacity · Jun 2026</Mono><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 130, letterSpacing: "-0.06em", color: L.ink, marginTop: 20 }}>1.6 GW</div></>)}
        {layer(2, 180 + 90 * rise, <><Mono color={L.indigo}>2029 · JLL anumaan</Mono><div style={{ fontFamily: L.sans, fontWeight: 900, fontSize: 130, letterSpacing: "-0.06em", marginTop: 20, backgroundImage: L.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>~6 GW</div></>,
          { border: "3px dashed rgba(79,70,229,0.55)", background: "rgba(255,255,255,0.92)", opacity: clamp01(rise * 3) })}
      </div>
      <div style={{ position: "absolute", left: X, top: 1500, opacity: k(t, T_ROLL + 0.5) }}><Pill tone="est" size={24}>Estimate · JLL via IANS · 2 Sep 2026</Pill></div>
    </>
  );
};

/* ---------------------------------------------------------------- end */
const End: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <Chars t={t} a={T_END + 0.2} text="AVRON" size={220} gradient stagger={0.05} track={-0.04} />
    <div style={{ marginTop: 40, opacity: k(t, T_END + 0.7), transform: `translateY(${(1 - k(t, T_END + 0.7)) * 20}px)` }}><Pill tone="ink" size={28}>✓ Saved to AVRON Watchlist</Pill></div>
    <div style={{ position: "absolute", top: 1330, opacity: k(t, T_END + 0.9) }}><Mono size={20}>Anuman hai, guarantee nahi · not investment advice</Mono></div>
  </AbsoluteFill>
);

export const StyleLight: React.FC = () => {
  const t = useTime();
  const up = k(t, T_PUSH, 0.6, curve.inOut);
  const endK = k(t, T_END, 0.6, curve.inOut);
  return (
    <LightCanvas t={t}>
      {t < T_PUSH + 0.65 && (
        <AbsoluteFill style={{ transform: `translateY(${-up * 1920}px)` }}>
          <Hook t={t} />
          {t > T_CARD - 0.1 && <Dashboard t={t} />}
        </AbsoluteFill>
      )}
      {t >= T_PUSH && t < T_END + 0.65 && (
        <AbsoluteFill style={{ transform: `translateY(${(1 - up) * 1920}px) scale(${1 - 0.08 * endK})`, opacity: 1 - endK }}>
          <Stack t={t} />
        </AbsoluteFill>
      )}
      {t >= T_END && <End t={t} />}
      <div style={{ position: "absolute", right: X, top: 1830 }}><Mono size={20}>Style test · bright &amp; clean</Mono></div>
    </LightCanvas>
  );
};
