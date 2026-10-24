import React from "react";
import { color, font } from "../../../brand/tokens";
import { ease, lerp, prog } from "../../../engine/anim";
import { SourceTag, SweepText, WordReveal } from "../../../engine/components/Kinetic";
import { DataRoom } from "../../../engine/components/DataRoom";
import { Pillars, PILLAR_X, PillarCam, projectPoint } from "../../../engine/three/Pillars";
import { C, S } from "../config";

const camAt = (t: number): PillarCam => {
  const p = prog(t, S.bill[0], S.bill[1] - S.bill[0], ease.inOutCubic);
  return { x: lerp(-1.0, 0.6, p), y: lerp(4.4, 4.0, p), z: lerp(17.5, 16.2, p), lookY: 1.1, fov: 36 };
};

/** Shot 10: who pays. The load lands on each pillar as it is named (AVRON interpretation). */
export const Bill: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.bill;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const cam = camAt(t);
  const keys = [C.company, C.sarkar, C.aap];
  const names = ["COMPANY", "सरकार", "आप"];
  const lit = keys.map((k) => prog(t, k - 0.08, 0.25)) as [number, number, number];
  const squash = keys.map((k) => prog(t, k, 0.6, ease.outExpo) * 0.6) as [number, number, number];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <DataRoom t={t} tint={color.gold} drift={0.3} />
      <div style={{ position: "absolute", inset: 0 }}>
        <Pillars cam={cam} lit={lit} squash={squash} tint={color.goldHot} />
      </div>
      {PILLAR_X.map((x, i) => {
        const pt = projectPoint(cam, [x, 0, 1.0], 1080, 1920);
        return (
          <div key={i} style={{ position: "absolute", left: pt.x - 200, width: 400, top: pt.y + 18, textAlign: "center",
            opacity: 0.3 + 0.7 * lit[i], fontFamily: font.deva, fontWeight: 800, fontSize: 40, letterSpacing: "0.08em",
            color: lit[i] > 0.5 ? color.goldHot : color.inkDim }}>
            {names[i]}
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 290, left: 84, right: 84, textAlign: "center" }}>
        <WordReveal text="Bill भरा जाएगा" t={t} start={a + 0.35}
          style={{ justifyContent: "center", fontFamily: font.devaDisplay, fontWeight: 800, fontSize: 84, color: color.ink }} />
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <SourceTag text="AVRON INTERPRETATION" t={t} start={a + 0.8} />
        </div>
      </div>
    </div>
  );
};

/** Shot 11: AVRON identity: charcoal and gold, light-sweep wordmark, sources, disclaimer. */
export const End: React.FC<{ t: number; duration: number }> = ({ t }) => {
  const a = C.cta;
  const line = prog(t, a + 0.5, 0.9, ease.inOutCubic);
  const src = prog(t, a + 1.6, 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(70% 45% at 50% 35%, #15140f 0%, #070707 70%)",
      opacity: prog(t, a - 0.2, 0.4), transform: `scale(${1 + (t - a) * 0.005})` }}>
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        {"AVRON".split("").map((ch, i) => {
          const p = prog(t, a + 0.05 + i * 0.07, 0.8, ease.outExpo);
          return (
            <span key={i} style={{ fontFamily: font.display, fontWeight: 800, fontSize: 160, letterSpacing: "0.2em", display: "inline-block",
              background: "linear-gradient(180deg, #FFF1C9 0%, #E8C27A 50%, #9C7430 100%)", WebkitBackgroundClip: "text", color: "transparent",
              opacity: p, transform: `translateY(${(1 - p) * 50}px)`, filter: `blur(${(1 - p) * 8}px)` }}>
              <SweepText text={ch} t={t} start={a + 0.8 + i * 0.06} dur={0.9} />
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 640, left: 540 - 270 * line, width: 540 * line, height: 2, background: `linear-gradient(90deg, transparent, ${color.gold}, transparent)` }} />
      <div style={{ position: "absolute", top: 680, left: 0, right: 0, textAlign: "center" }}>
        <WordReveal text="Numbers के पीछे की कहानी" t={t} start={a + 0.6}
          style={{ justifyContent: "center", fontFamily: font.deva, fontWeight: 600, fontSize: 52, color: color.inkDim }} />
        <div style={{ marginTop: 34, display: "inline-flex", padding: "16px 42px", borderRadius: 999, border: `2px solid ${color.gold}`,
          color: color.goldHot, fontFamily: font.text, fontWeight: 700, fontSize: 32, letterSpacing: "0.14em", opacity: prog(t, a + 1.0, 0.5) }}>
          FOLLOW AVRON
        </div>
      </div>
      <div style={{ position: "absolute", top: 1000, left: 100, right: 150, opacity: src, fontFamily: font.mono, fontSize: 22, lineHeight: 1.62,
        color: color.inkDim, borderTop: `1.5px solid ${color.line}`, paddingTop: 20 }}>
        <div style={{ color: color.ink, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 6 }}>SOURCES</div>
        <div>PIB/MoPNG PRID 2245970, 27 Mar 2026 — excise cut, crude, "Global Oil Shock"</div>
        <div>MoF FRBM statement, Budget 2025-26 — debt target + condition</div>
        <div>PIB PRID 2221395 / Budget speech 2026-27 — 4.3%, 55.6%</div>
        <div>RBI MPS 7 Oct 2026 — repo 5.50% · Business Standard — first since Feb 2023</div>
        <div>Bloomberg via Rigzone 22 Oct — Brent · Jefferies via Business Today — ₹34 (estimate)</div>
        <div style={{ marginTop: 12, color: color.inkFaint }}>Educational content. Not investment advice. No AI likeness of real people used.</div>
      </div>
    </div>
  );
};
