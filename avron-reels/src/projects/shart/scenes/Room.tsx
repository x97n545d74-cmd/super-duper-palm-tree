import React from "react";
import { color, font } from "../../../brand/tokens";
import { ease, lerp, prog } from "../../../engine/anim";
import { Label, SourceTag, WordReveal } from "../../../engine/components/Kinetic";
import { Rain } from "../../../engine/components/Weather";
import { BriefingRoom, projectRoom, RoomCam } from "../../../engine/three/BriefingRoom";
import { at, C, S } from "../config";

/** Shot 2: two roads. A data line splits; the government's branch is chosen. */
export const Choice: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.choice;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, b - 0.5, 0.5, ease.inCubic);
  const stem = prog(t, a + 0.1, 0.9, ease.inOutCubic);
  const left = prog(t, a + 0.7, 1.1, ease.inOutCubic);
  const right = prog(t, a + 1.2, 1.1, ease.inOutCubic);
  const emphL = prog(t, C.mehenga - 0.2, 0.4);
  const chosen = prog(t, C.khud + 0.25, 0.6);
  const L = "M540,1080 C540,900 300,900 250,820";
  const R = "M540,1080 C540,900 780,900 830,820";
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - prog(t, b - 0.35, 0.35)), background: "radial-gradient(80% 55% at 50% 45%, #10131a 0%, #06070a 75%)",
      transform: `scale(${1 + (t - a) * 0.012})`, transformOrigin: "50% 55%" }}>
      <Rain t={t} intensity={0.25 * (1 - prog(t, a, 3))} />
      <div style={{ position: "absolute", top: 290, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: font.devaSerif, fontWeight: 800, fontSize: 96, color: color.goldHot, opacity: prog(t, a + 0.2, 0.5) }}>दो रास्ते</div>
        <Label text="Two roads" t={t} start={a + 0.4} style={{ marginTop: 8 }} />
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><filter id="cg"><feGaussianBlur stdDeviation="8" /></filter></defs>
        <line x1={540} x2={540} y1={1240} y2={lerp(1240, 1080, stem)} stroke={color.gold} strokeWidth={5} />
        <path d={L} fill="none" stroke={color.crimson} strokeWidth={5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - left}
          opacity={1 - chosen * 0.7} />
        <path d={R} fill="none" stroke={color.goldHot} strokeWidth={5 + chosen * 3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - right} />
        <path d={R} fill="none" stroke={color.gold} strokeWidth={22} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - right} opacity={0.25 + chosen * 0.35} filter="url(#cg)" />
      </svg>
      {[
        { x: 250, p: left, k: (0.75 + 0.25 * emphL) * (1 - chosen * 0.65), c: "#FF6A6A", top: "PUMP PRICE ▲", deva: "महंगा करो", sub: "pass it to citizens" },
        { x: 830, p: right, k: 1, c: color.goldHot, top: "GOVERNMENT ABSORBS", deva: "नुकसान खुद उठाओ", sub: "take it on the books" },
      ].map((o) => (
        <div key={o.x} style={{ position: "absolute", left: o.x - 220, width: 440, top: 600, textAlign: "center", opacity: o.p * o.k,
          transform: `translateY(${(1 - o.p) * 20}px) scale(${o.x === 830 ? 1 + chosen * 0.06 : 1 - chosen * 0.04})` }}>
          <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 26, letterSpacing: "0.18em", color: o.c }}>{o.top}</div>
          <div style={{ fontFamily: font.deva, fontWeight: 800, fontSize: 50, color: color.ink, marginTop: 8 }}>{o.deva}</div>
          <div style={{ fontFamily: font.text, fontSize: 24, color: color.inkDim, marginTop: 4 }}>{o.sub}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center" }}>
        <SourceTag text="'TWO CHOICES' — PETROLEUM MINISTER, PIB 27 MAR 2026" t={t} start={C.khud + 0.2} style={{ fontSize: 20 }} />
      </div>
      {/* exit: foreground silhouette wipes across (camera passes behind it into the room) */}
      <div style={{ position: "absolute", top: 0, bottom: 0, width: 1500, left: lerp(1100, -1600, exitP),
        background: "radial-gradient(60% 70% at 50% 75%, #000 55%, rgba(0,0,0,0.0) 72%)", filter: "blur(18px)" }} />
    </div>
  );
};

const camAt = (t: number): RoomCam => {
  const p = prog(t, S.room[0], S.room[1] - S.room[0] + 0.5, ease.inOutCubic);
  return { x: lerp(-0.42, -0.12, p), y: lerp(1.62, 1.42, p), z: lerp(6.0, 4.3, p), tx: 0, ty: lerp(1.0, 0.95, p), tz: -1.2, fov: 42 };
};

/** Shot 3: the briefing room. Original anonymous figures (no likenesses), tungsten practicals, rain on the window. */
export const Room: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.room;
  const enter = prog(t, a, 0.35);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const cam = camAt(t);
  const fgX = lerp(-80, -760, prog(t, a, 1.3, ease.inOutCubic)); // foreground OTS silhouette slides out (occlusion reveal)
  const doc = projectRoom(cam, [0.0, 0.82, 0.6]);
  const ten = at("b3_excise", "₹10");
  const vahi = at("b3_excise", "वही।");
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <BriefingRoom t={t} cam={cam} lampI={0.9 + 0.1 * Math.sin(t * 0.7)} red={prog(t, b - 0.9, 0.6)} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(85% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)" }} />
      <div style={{ position: "absolute", top: 820, left: fgX, width: 820, height: 1200, borderRadius: "48% 48% 0 0",
        background: "radial-gradient(55% 40% at 50% 18%, #050505 60%, transparent 62%), radial-gradient(90% 60% at 50% 85%, #050505 60%, transparent 62%)",
        filter: "blur(14px)" }} />
      {/* document lying on the table, pinned to the 3D projection */}
      <div style={{ position: "absolute", left: doc.x - 230, top: doc.y - 150, width: 460, padding: "26px 30px", borderRadius: 6,
        background: "linear-gradient(180deg, #efe8da, #d9d0bf)", color: "#1b1a17", boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
        transform: `perspective(900px) rotateX(${lerp(58, 50, prog(t, a, 4))}deg)`, transformOrigin: "50% 100%",
        opacity: prog(t, ten - 0.5, 0.4) }}>
        <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 20, letterSpacing: "0.16em", color: "#6b5b3d" }}>MINISTRY OF PETROLEUM & NATURAL GAS</div>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 64, marginTop: 6 }}>EXCISE −₹10/L</div>
        <div style={{ fontFamily: font.text, fontSize: 22, marginTop: 2, color: "#3b372f" }}>Petrol & diesel · with immediate effect</div>
      </div>
      <div style={{ position: "absolute", top: 290, left: 80, right: 80, textAlign: "center" }}>
        <Label text="27 Mar 2026 · decision" t={t} start={a + 0.4} tint={color.tungsten} />
        <WordReveal text="सरकार ने दूसरा रास्ता चुना" t={t} start={a + 0.55}
          style={{ justifyContent: "center", marginTop: 14, fontFamily: font.deva, fontWeight: 800, fontSize: 60, color: color.ink }} />
      </div>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", opacity: prog(t, vahi - 0.1, 0.3),
        transform: `scale(${lerp(1.2, 1, prog(t, vahi - 0.1, 0.5, ease.outExpo))})` }}>
        <div style={{ display: "inline-block", padding: "14px 30px", border: `3px solid ${color.goldHot}`, borderRadius: 10, fontFamily: font.text,
          fontWeight: 800, fontSize: 40, letterSpacing: "0.12em", color: color.goldHot, background: "rgba(0,0,0,0.45)" }}>
          PUMP PRICE: UNCHANGED
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1265, display: "flex", justifyContent: "center" }}>
        <SourceTag text="PIB · MoPNG · PRID 2245970 · 27 MAR 2026" t={t} start={ten + 0.3} style={{ fontSize: 20 }} />
      </div>
    </div>
  );
};
