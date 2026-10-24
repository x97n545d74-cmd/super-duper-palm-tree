import React from "react";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Counter, Label, SourceTag, SweepText, WordReveal } from "../../../engine/components/Kinetic";
import { Pillars, PILLAR_X, PillarCam, projectPoint } from "../../../engine/three/Pillars";
import { B, C, wordAt } from "../config";

/** Beat 7: two attributed estimates, different dates and methods. */
export const Estimates: React.FC<{ t: number }> = ({ t }) => {
  const a = B.estimates;
  const enter = prog(t, a - 0.1, 0.4);
  const exitP = prog(t, B.who - 0.35, 0.45, ease.inCubic);
  const BASE = 1150, PX_PER_RS = 12.5;
  const bars = [
    { who: "ICRA", when: "SEP 2026", v: 9, approx: true, at: C.icra, x: 230 },
    { who: "JEFFERIES", when: "22 OCT 2026", v: 34, approx: false, at: C.jeff34 - 0.25, x: 590 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), transform: `translateY(${exitP * -40}px)` }}>
      <div style={{ position: "absolute", top: 290, left: 84, right: 84, textAlign: "center" }}>
        <WordReveal text="How big is the gap?" t={t} start={a + 0.05}
          style={{ justifyContent: "center", fontFamily: font.display, fontWeight: 800, fontSize: 84, color: color.ink, letterSpacing: "-0.02em" }} />
        <WordReveal text="Depends who's counting." t={t} start={wordAt("estimates", "It") - 0.05}
          style={{ justifyContent: "center", marginTop: 14, fontFamily: font.display, fontWeight: 600, fontSize: 46, color: color.inkDim }} />
      </div>
      <Label text="Est. marketing loss · diesel · ₹/litre" t={t} start={C.icra - 0.4} style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", fontSize: 26 }} />
      <div style={{ position: "absolute", left: 150, right: 150, top: BASE, height: 2, background: color.line, opacity: prog(t, a + 0.2, 0.5) }} />
      {bars.map((b) => {
        const p = prog(t, b.at, 0.9, ease.outExpo);
        const h = b.v * PX_PER_RS * p;
        return (
          <div key={b.who} style={{ position: "absolute", left: b.x, width: 260, top: BASE - h, height: h + 2 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "10px 10px 0 0",
              background: `linear-gradient(180deg, ${color.loss} 0%, ${color.loss}AA 35%, ${color.loss}33 100%)`,
              boxShadow: `0 0 50px ${color.loss}44, inset 0 2px 0 rgba(255,255,255,0.35)` }} />
            {/* glass highlight */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 18, width: 26, background: "linear-gradient(180deg, rgba(255,255,255,0.28), transparent)", borderRadius: 8 }} />
            {/* floor reflection */}
            <div style={{ position: "absolute", top: h + 6, left: 0, right: 0, height: h * 0.35, borderRadius: "0 0 10px 10px",
              background: `linear-gradient(180deg, ${color.loss}40, transparent)`, filter: "blur(4px)" }} />
            <div style={{ position: "absolute", bottom: h + 18, left: -40, right: -40, textAlign: "center", opacity: clamp01(p * 3),
              fontFamily: font.display, fontWeight: 800, fontSize: b.v > 20 ? 120 : 92, color: b.v > 20 ? color.loss : "#FF8A87", lineHeight: 1 }}>
              {b.approx ? "~" : ""}₹<Counter to={b.v} t={t} start={b.at} dur={0.9} />
            </div>
            <div style={{ position: "absolute", top: h + 26, left: -30, right: -30, textAlign: "center", opacity: clamp01(p * 2) }}>
              <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28, color: color.ink, letterSpacing: "0.08em" }}>{b.who}</div>
              <div style={{ fontFamily: font.mono, fontSize: 22, color: color.inkDim, marginTop: 6 }}>{b.when}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 1270, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <SourceTag text="ESTIMATES · DIFFERENT DATES & METHODS · VIA BUSINESS TODAY" t={t} start={C.jeff34 + 0.4} estimate style={{ fontSize: 21 }} />
      </div>
    </div>
  );
};

const W = 1080, H = 1920;
const camAt = (t: number): PillarCam => {
  const p = prog(t, B.who - 0.4, 6.5, ease.inOutCubic);
  return { x: lerp(-1.2, 0.7, p), y: lerp(4.4, 4.0, p), z: lerp(17, 16, p), lookY: 1.1, fov: 36 };
};

/** Beats 8-9a: who absorbs an oil shock. Lit pillar = the one currently carrying the load. */
export const WhoPays: React.FC<{ t: number }> = ({ t }) => {
  const enter = prog(t, B.who - 0.35, 0.6);
  const exitP = prog(t, wordAt("payoff", "What") - 0.35, 0.45, ease.inCubic);
  const cam = camAt(t);
  const keys = [C.company, C.government, C.you];
  const names = ["COMPANY", "GOVERNMENT", "YOU"];
  const now = prog(t, B.payoff, 0.5);
  const lit = keys.map((k, i) => {
    const on = prog(t, k - 0.08, 0.25);
    return i === 0 ? lerp(on, 1, now) : on * (1 - now * 0.88);
  }) as [number, number, number];
  const squash = [prog(t, C.companies - 0.2, 0.5, ease.outExpo), 0, 0] as [number, number, number];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <Pillars cam={cam} lit={lit} squash={squash} width={W} height={H} />
      </div>
      {/* floor bounce light under each loaded pillar */}
      {PILLAR_X.map((x, i) => {
        const pt = projectPoint(cam, [x, 0, 0.2], W, H);
        return (
          <div key={`g${i}`} style={{ position: "absolute", left: pt.x - 260, top: pt.y - 70, width: 520, height: 140, borderRadius: "50%",
            background: `radial-gradient(closest-side, ${color.amber}${Math.round(lit[i] * 90).toString(16).padStart(2, "0")}, transparent)`, filter: "blur(10px)" }} />
        );
      })}
      {/* labels pinned to projected 3D points */}
      {PILLAR_X.map((x, i) => {
        const pt = projectPoint(cam, [x, 0, 1.0], W, H);
        const p = prog(t, keys[i] - 0.1, 0.35);
        const dim = i === 0 ? 1 : 1 - now * 0.6;
        return (
          <div key={i} style={{ position: "absolute", left: pt.x - 200, width: 400, top: pt.y + 18, textAlign: "center", opacity: (0.25 + 0.75 * p) * dim,
            fontFamily: font.mono, fontWeight: 700, fontSize: 32, letterSpacing: "0.14em", color: lit[i] > 0.5 ? color.amberHot : color.inkDim }}>
            {names[i]}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 300, left: 84, right: 84, textAlign: "center", opacity: 1 - prog(t, B.payoff - 0.35, 0.25) }}>
        <WordReveal text="An oil shock always gets paid for." t={t} start={B.who + 0.05}
          style={{ justifyContent: "center", fontFamily: font.display, fontWeight: 800, fontSize: 70, color: color.ink, letterSpacing: "-0.02em" }} />
      </div>
      <div style={{ position: "absolute", top: 290, left: 84, right: 84, textAlign: "center", opacity: prog(t, B.payoff + 0.05, 0.35) }}>
        <Label text="Right now" t={t} start={B.payoff} style={{ fontSize: 30 }} />
        <div style={{ marginTop: 12, fontFamily: font.display, fontWeight: 800, fontSize: 92, color: color.amberHot, letterSpacing: "-0.02em" }}>
          <SweepText text="The companies" t={t} start={C.companies} />
        </div>
        <div style={{ marginTop: 10, fontFamily: font.text, fontWeight: 600, fontSize: 32, color: color.inkDim, opacity: prog(t, C.companies + 0.2, 0.4) }}>
          state oil marketing companies
        </div>
        <div style={{ marginTop: 22, display: "flex", justifyContent: "center" }}>
          <SourceTag text="AVRON INTERPRETATION" t={t} start={C.companies + 0.3} />
        </div>
      </div>
    </div>
  );
};

/** Beat 9b: what comes next depends on crude. */
export const NextCrude: React.FC<{ t: number }> = ({ t }) => {
  const a = wordAt("payoff", "What") - 0.15;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, B.cta - 0.2, 0.5, ease.inCubic);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), display: "flex", flexDirection: "column", alignItems: "center",
      transform: `scale(${1 + exitP * 0.3})`, filter: `blur(${exitP * 10}px)` }}>
      <div style={{ position: "absolute", top: 560, textAlign: "center" }}>
        <Label text="What comes next" t={t} start={a + 0.05} style={{ fontSize: 32 }} />
        <WordReveal text="depends on" t={t} start={wordAt("payoff", "Depends") - 0.05}
          style={{ justifyContent: "center", marginTop: 26, fontFamily: font.display, fontWeight: 600, fontSize: 64, color: color.inkDim }} />
        <div style={{ marginTop: 6, fontFamily: font.display, fontWeight: 800, fontSize: 210, letterSpacing: "-0.05em", lineHeight: 1, color: color.ink,
          opacity: prog(t, C.crude - 0.08, 0.25), transform: `translateY(${(1 - prog(t, C.crude - 0.08, 0.5, ease.outExpo)) * 50}px)` }}>
          <SweepText text="crude." t={t} start={C.crude + 0.2} dur={1.2} />
        </div>
      </div>
    </div>
  );
};

/** Beat 10: brand close + sources + disclaimer. */
export const EndCard: React.FC<{ t: number; duration: number }> = ({ t }) => {
  const a = B.cta;
  const letters = "AVRON".split("");
  const line = prog(t, a + 0.7, 0.9, ease.inOutCubic);
  const src = prog(t, a + 2.1, 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: prog(t, a - 0.1, 0.4) }}>
      <div style={{ position: "absolute", top: 470, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        {letters.map((ch, i) => {
          const p = prog(t, a + 0.05 + i * 0.07, 0.8, ease.outExpo);
          return (
            <span key={i} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 150, color: color.ink, letterSpacing: "0.18em",
              display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 60}px) rotateX(${(1 - p) * 70}deg)`, filter: `blur(${(1 - p) * 10}px)` }}>
              <SweepText text={ch} t={t} start={a + 0.9 + i * 0.05} dur={0.9} />
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 660, left: 540 - 260 * line, width: 520 * line, height: 3, background: `linear-gradient(90deg, transparent, ${color.amber}, transparent)` }} />
      <div style={{ position: "absolute", top: 700, left: 0, right: 0, textAlign: "center" }}>
        <WordReveal text="The story behind the numbers." t={t} start={a + 0.6} stagger={0.06}
          style={{ justifyContent: "center", fontFamily: font.display, fontWeight: 600, fontSize: 50, color: color.inkDim }} />
        <div style={{ marginTop: 40, display: "inline-flex", padding: "18px 44px", borderRadius: 999, border: `2px solid ${color.amber}`, color: color.amberHot,
          fontFamily: font.text, fontWeight: 700, fontSize: 34, letterSpacing: "0.12em", opacity: prog(t, a + 1.1, 0.5), transform: `scale(${lerp(0.9, 1, prog(t, a + 1.1, 0.6, ease.outBack))})` }}>
          FOLLOW AVRON
        </div>
      </div>
      <div style={{ position: "absolute", top: 1030, left: 110, right: 150, opacity: src, transform: `translateY(${(1 - src) * 20}px)`,
        fontFamily: font.mono, fontSize: 25, lineHeight: 1.6, color: color.inkDim, borderTop: `1.5px solid ${color.line}`, paddingTop: 22 }}>
        <div style={{ color: color.ink, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 8 }}>SOURCES</div>
        <div>PPAC — Delhi RSP, 23 Oct 2026</div>
        <div>All India Radio — May 2026 price revisions</div>
        <div>Bloomberg via Rigzone — Brent settle, 22 Oct 2026</div>
        <div>Jefferies via Business Today — 23 Oct 2026 (estimates)</div>
        <div>ICRA via Business Today — 23 Sep 2026 (estimates)</div>
        <div style={{ marginTop: 16, color: color.inkFaint }}>Educational content. Not investment advice.</div>
      </div>
    </div>
  );
};
