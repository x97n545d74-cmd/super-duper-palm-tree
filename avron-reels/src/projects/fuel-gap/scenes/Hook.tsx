import React from "react";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Odometer } from "../../../engine/components/Odometer";
import { Counter, Label, SourceTag, SweepText, WordReveal } from "../../../engine/components/Kinetic";
import { B, C, wordAt } from "../config";

/** Beats 1-2: the pump price, then the estimated loss slams in. */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const lift = prog(t, B.hookLoss + 0.05, 0.7, ease.inOutCubic); // price card moves up to make room
  const exitP = prog(t, B.brent - 0.42, 0.42, ease.inCubic); // push-through into the oil
  const slam = clamp01((t - C.loss34) / 0.32);
  const slamScale = t < C.loss34 ? 0 : lerp(1.9, 1, ease.outBack(slam));
  const split = t >= C.loss34 ? Math.exp(-(t - C.loss34) * 9) * 14 : 0; // chromatic split decays
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        transform: `scale(${1 + exitP * 1.6})`, filter: `blur(${exitP * 14}px)`, opacity: 1 - exitP,
      }}
    >
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", flexDirection: "column", alignItems: "center",
        transform: `translateY(${-lift * 120}px) scale(${1 - lift * 0.34})`, opacity: 1 - lift * 0.35 }}>
        <Label text="Diesel · Delhi · per litre" t={t} start={0.35} />
        <div style={{ display: "flex", alignItems: "center", marginTop: 36 }}>
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 150, color: color.amber, marginRight: 14, opacity: prog(t, 0.2, 0.5) }}>₹</div>
          <Odometer value="95.20" t={t} start={0.15} duration={1.8} size={230} />
        </div>
        <div style={{ marginTop: 40 }}>
          <SourceTag text="PPAC · IOCL OUTLET RSP · 23 OCT 2026" t={t} start={1.5} />
        </div>
      </div>

      {/* "the company selling it may be losing" */}
      <div style={{ position: "absolute", left: 84, right: 84, top: 790, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <WordReveal
          text="The company selling it may be losing"
          t={t} start={wordAt("hook_loss", "company") - 0.15} stagger={0.06}
          style={{ justifyContent: "center", fontFamily: font.display, fontWeight: 600, fontSize: 52, color: color.inkDim }}
        />
        <div
          style={{
            marginTop: 18, fontFamily: font.display, fontWeight: 800, fontSize: 270, lineHeight: 1, letterSpacing: "-0.04em",
            color: color.loss, transform: `scale(${slamScale})`, opacity: slam > 0 ? 1 : 0,
            textShadow: `${split}px 0 0 rgba(0,220,255,0.55), ${-split}px 0 0 rgba(255,40,40,0.75), 0 0 80px rgba(240,82,79,0.45)`,
          }}
        >
          −₹<Counter to={34} from={30} t={t} start={C.loss34} dur={0.4} />
        </div>
        <div style={{ fontFamily: font.display, fontWeight: 600, fontSize: 46, color: color.ink, opacity: prog(t, C.loss34 + 0.35, 0.4), marginTop: 6 }}>
          <SweepText text="on every litre" t={t} start={C.loss34 + 0.6} />
        </div>
        <div style={{ marginTop: 30 }}>
          <SourceTag text="JEFFERIES ESTIMATE · 22 OCT 2026" t={t} start={C.loss34 + 0.5} estimate />
        </div>
      </div>
    </div>
  );
};

/** Beat 3: Brent settles above $113 after attacks in Saudi Arabia. */
export const Brent: React.FC<{ t: number }> = ({ t }) => {
  const a = B.brent;
  const enter = prog(t, a - 0.1, 0.6, ease.outExpo);
  const exitP = prog(t, B.freight - 0.38, 0.38, ease.inCubic); // collapses into the tanker dot (match cut)
  return (
    <div
      style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center",
        opacity: enter, transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center",
        transformOrigin: "50% 420px", transform: `translate(${-exitP * 290}px, ${-exitP * 290}px) scale(${1 - exitP * 0.985})`, opacity: 1 - exitP * 0.5 }}>
        <Label text="Brent crude · settle" t={t} start={a + 0.15} />
        <Label text="22 Oct 2026" t={t} start={a + 0.35} tint={color.inkFaint} style={{ marginTop: 10, fontSize: 26 }} />
        <div style={{ marginTop: 40, fontFamily: font.display, fontWeight: 800, fontSize: 220, lineHeight: 1, letterSpacing: "-0.045em", color: color.ink, opacity: prog(t, C.brent113 - 1.15, 0.2),
          textShadow: "0 10px 60px rgba(0,0,0,0.6)" }}>
          $<Counter to={113.17} from={80} t={t} start={C.brent113 - 1.15} dur={1.3} decimals={2} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 30, opacity: prog(t, C.brent113 + 0.45, 0.4),
          transform: `translateY(${(1 - prog(t, C.brent113 + 0.45, 0.4)) * 20}px)` }}>
          <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 44, color: color.amberHot, padding: "8px 22px", borderRadius: 12, background: "rgba(233,162,59,0.14)", border: `1.5px solid ${color.amber}66` }}>
            ▲ 4% on the day
          </div>
        </div>
        <WordReveal
          text="after attacks in Saudi Arabia"
          t={t} start={wordAt("brent", "after") - 0.1}
          style={{ marginTop: 56, justifyContent: "center", fontFamily: font.display, fontWeight: 600, fontSize: 50, color: color.inkDim }}
        />
        <div style={{ marginTop: 40 }}>
          <SourceTag text="BLOOMBERG VIA RIGZONE · 22 OCT 2026" t={t} start={wordAt("brent", "after") + 0.4} />
        </div>
      </div>
    </div>
  );
};
