import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import timeline from "../../../projects/2026-10-ep02-muhurat/timeline.json";
import mouthData from "../../../public/ep02/mouth.json";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog, rand } from "../../engine/anim";
import { Key } from "../ep01/Character";
import { faceCenter } from "../ep01/Character";
import { Backdrop, Captions, Card, Cast, camTrack, FEET, GREEN, INK, inOut, Lead, Mark, outX, Rise, ShareCTA, Shot, Texture, TickerLine, TL, timing } from "./kit";

/*
 * Ep 02 — "Muhurat mein kharida, toh pakka chadhega?"
 * Fact: NSE circular NSE/CMTR/76941 (19 Oct 2026): Muhurat session on Sunday 8 Nov 2026, normal market from 14:20, about an hour.
 */
const T = timeline as unknown as TL;
export const EP02_DURATION = T.total;
const { S, E, W, C } = timing(T);
const MOUTH = mouthData as Record<string, number[]>;

// ---------- Diwali set: swinging string lights, diyas with flat flickering flames ----------
const Diwali: React.FC<{ t: number }> = ({ t }) => {
  const swing = Math.sin(t * 1.3) * 10;
  const bulbs = Array.from({ length: 15 });
  const diyas = [90, 250, 830, 990];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[0, 1].map((row) => {
        const y0 = 460 + row * 120, sag = 110 + row * 30;
        return (
          <g key={row} opacity={row ? 0.55 : 1}>
            <path d={`M -40 ${y0} Q 540 ${y0 + sag + swing} 1120 ${y0}`} fill="none" stroke="#3A2E22" strokeWidth={4} />
            {bulbs.map((_, i) => {
              const u = i / (bulbs.length - 1), x = -40 + u * 1160, y = y0 + 4 * u * (1 - u) * (sag + swing);
              const on = 0.65 + 0.35 * Math.sin(t * 3 + i * 1.7 + row);
              return <g key={i}><line x1={x} y1={y} x2={x} y2={y + 14} stroke="#3A2E22" strokeWidth={3} />
                <ellipse cx={x} cy={y + 28} rx={11} ry={15} fill={i % 3 === 0 ? color.amberHot : i % 3 === 1 ? "#F0524F" : "#E9E2D2"} opacity={on} /></g>;
            })}
          </g>
        );
      })}
      {diyas.map((x, i) => {
        const fl = 1 + 0.12 * Math.sin(t * 9 + i * 2.3) + 0.06 * Math.sin(t * 17 + i);
        return (
          <g key={i} transform={`translate(${x} 1585)`}>
            <path d={`M -9 0 Q 0 ${-58 * fl} 9 0 Z`} fill={color.amberHot} transform={`skewX(${Math.sin(t * 5 + i) * 6})`} />
            <path d={`M -4 0 Q 0 ${-28 * fl} 4 0 Z`} fill="#FFF3D6" />
            <path d="M -52 0 Q 0 40 52 0 Z" fill="#B5652B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>
        );
      })}
    </svg>
  );
};

// ---------- acting ----------
const BOY: Key[] = [
  [0, { lookX: 9, mouth: "smile", mouthAmt: 0.5 }],
  [S("b1") - 0.1, { mouth: "talk", eye: 1.25, browL: 12, browR: 12 }],
  [E("b1"), { mouth: "grin", mouthAmt: 1 }],
  [C.calendar, { mouth: "o", mouthAmt: 0.4, lookY: -8, lookX: -4, eye: 1.1 }],
  [S("b2"), { mouth: "talk", lookX: -6, lookY: 0, browL: 8, browR: 3, tilt: -0.4 }],
  [E("b2"), { mouth: "smile", mouthAmt: 0.4 }],
  [S("g2") + 0.6, { mouth: "flat", tilt: -0.6, browL: 2, browR: 2 }],
  [C.set, { mouth: "smile", mouthAmt: 0.6, lookX: 9, tilt: 0, eye: 1 }],
  [S("b3"), { mouth: "talk", tilt: -0.5, browL: 6, browR: 6 }],
  [E("b3"), { mouth: "o", mouthAmt: 0.4 }],
  [W("g5", "mithai") + 0.3, { mouth: "grin", mouthAmt: 1, eye: 0.8 }],
];
const GIRL: Key[] = [
  [0, { mouth: "smile" }],
  [C.calendar, { mouth: "talk", lookX: 0, eye: 1 }],
  [E("g1"), { mouth: "smile", mouthAmt: 0.6 }],
  [S("g2"), { mouth: "talk", browR: 10, eye: 0.85 }],
  [E("g3"), { mouth: "smile", mouthAmt: 0.8 }],
  [C.set, { lookX: -9, mouth: "smirk", mouthAmt: 0.7, browR: 12 }],
  [S("g4"), { mouth: "talk", eye: 0.75 }],
  [E("g4"), { mouth: "smirk", mouthAmt: 1 }],
  [S("g5"), { mouth: "talk", lookX: -9, eye: 0.9, browR: 4 }],
  [E("g5"), { mouth: "smile", mouthAmt: 0.8 }],
  [C.cta, { lookX: 0, lookY: 0, browL: 6, browR: 6, eye: 1, mouth: "smile" }],
  [S("g6"), { mouth: "talk" }],
  [E("g6"), { mouth: "smile", mouthAmt: 1 }],
];
// Chacha dances on "saal bhar Lakshmi aayegi": a lean that swaps sides on the beat
const dance: Key[] = Array.from({ length: 8 }, (_, i) => [S("c2") + i * 0.29, { lean: i % 2 ? -6 : 6, dy: i % 2 ? 0 : -14 }] as Key);
const CHACHA: Key[] = [
  [0, { mouth: "talk", browL: 10, browR: 10, eye: 1.1, lookX: -6 }],
  [E("c1"), { mouth: "smile", mouthAmt: 1 }],
  [S("b1") + 0.4, { lookX: -9 }],
  [C.calendar, { mouth: "smile", lookY: -8 }],
  [C.set, { mouth: "smile", lookX: 6 }],
  [S("c2"), { mouth: "talk", eye: 1.15 }],
  ...dance,
  [E("c2"), { mouth: "smile", mouthAmt: 1, lean: 0, dy: 0 }],
  [W("g4", "forward"), { mouth: "frown", mouthAmt: 0.8, tilt: -0.8, browL: 6, browR: 6, eye: 1.2 }],
  [C.mithai, { mouth: "smile", mouthAmt: 0.5, tilt: 0, browL: 0, browR: 0, eye: 1 }],
];
const ACT = { boy: BOY, girl: GIRL, chacha: CHACHA };

// ---------- blocking ----------
const BLOCK: Record<Lead, Mark[]> = {
  boy: [[0, 270, 0.5, 0], [C.calendar, 920, 0.28, 0], [C.lucky, 900, 0.28, 0], [C.set, 190, 0.42, 0], [C.mithai, 200, 0.3, 0], [C.cta, -400, 0.5, 0]],
  chacha: [[0, 1400, 0.5, 0], [0.1, 790, 0.5, 1.5], [C.calendar, 1180, 0.28, 0], [C.set, 540, 0.42, 0], [C.mithai, 1300, 0.34, 0]],
  girl: [[0, 1500, 0.5, 0], [C.calendar, -160, 0.28, 0], [C.calendar + 0.05, 360, 0.28, 2.0], [C.lucky, 200, 0.28, 0], [C.chips, 200, 0.28, 0], [C.set, 880, 0.42, 0],
    [C.mithai, 900, 0.3, 0], [C.cta, 540, 0.5, 0]],
};

const fb = faceCenter("boy", 270, FEET, 0.5);
const CAM: [number, number, number, number, number][] = [
  [0, 700, 1080, 1.12, 0], [S("b1") - 0.2, 540, 1080, 1.0, 0.6],
  [C.set, 540, 1100, 1.0, 0], [C.cta, 540, 1100, 1.0, 0],
  [S("g6") - 0.1, faceCenter("girl", 540, FEET, 0.5)[0], faceCenter("girl", 540, FEET, 0.5)[1] + 230, 1.42, 0.6],
];
void fb;

// ---------- graphics ----------
const Calendar: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, C.calendar + 0.1, 0.45, outX);
  const land = W("g1", "8");
  const flips = Math.min(8, 1 + Math.floor(clamp01((t - (land - 0.9)) / 0.9) * 7.99));
  const day = t >= land ? 8 : flips;
  const clockP = prog(t, W("g1", "dopahar") - 0.1, 0.9, inOut);
  const ang = lerp(-90, 70, clockP); // hour hand sweeps to ~2:20
  const chip = prog(t, W("g1", "ghante"), 0.4, outX);
  const title = prog(t, W("g1", "muhurat") - 0.05, 0.45, outX);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 70, letterSpacing: "-0.02em", color: color.amber }}>
        <Rise p={title}>MUHURAT TRADING</Rise>
      </div>
      <div style={{ position: "absolute", left: 120, top: 600, width: 400, height: 420, opacity: a, transform: `translateY(${(1 - a) * 40}px)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, background: "#F3EEE3", border: `8px solid ${INK}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 110, borderRadius: "22px 22px 0 0", background: "#C8323A", borderBottom: `8px solid ${INK}`,
          fontFamily: font.display, fontWeight: 800, fontSize: 52, color: "#FFF", textAlign: "center", lineHeight: "104px" }}>NOV 2026</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 200, color: INK, lineHeight: 1 }}>{day}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 48, color: "#C8323A", opacity: t >= land ? 1 : 0 }}>SUNDAY</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(t, W("g1", "dopahar") - 0.3, 0.4) }}>
        <circle cx={780} cy={810} r={170} fill="#F3EEE3" stroke={INK} strokeWidth={10} />
        {Array.from({ length: 12 }).map((_, i) => { const q = (i / 12) * Math.PI * 2; return <line key={i} x1={780 + Math.cos(q) * 140} y1={810 + Math.sin(q) * 140} x2={780 + Math.cos(q) * 158} y2={810 + Math.sin(q) * 158} stroke={INK} strokeWidth={6} />; })}
        <line x1={780} y1={810} x2={780 + Math.cos((ang * Math.PI) / 180) * 80} y2={810 + Math.sin((ang * Math.PI) / 180) * 80} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <line x1={780} y1={810} x2={780 + Math.cos(((ang * 12 + 90) * Math.PI) / 180) * 125} y2={810 + Math.sin(((ang * 12 + 90) * Math.PI) / 180) * 125} stroke="#C8323A" strokeWidth={8} strokeLinecap="round" />
        <circle cx={780} cy={810} r={14} fill={INK} />
      </svg>
      <div style={{ position: "absolute", left: 610, width: 340, top: 1000, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 54, color: color.ink, opacity: clockP }}>2:20 PM</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1110, display: "flex", justifyContent: "center", opacity: chip, transform: `translateY(${(1 - chip) * 20}px)` }}>
        <div style={{ padding: "14px 30px", borderRadius: 40, background: color.amber, color: INK, fontFamily: font.display, fontWeight: 800, fontSize: 40 }}>≈ 1 GHANTA · SPECIAL SESSION</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1690, textAlign: "center", fontFamily: font.text, fontWeight: 600, fontSize: 22, letterSpacing: "0.14em", color: color.inkFaint }}>SOURCE: NSE CIRCULAR, 19 OCT 2026</div>
    </AbsoluteFill>
  );
};

const Lucky: React.FC<{ t: number }> = ({ t }) => {
  const card = prog(t, C.lucky + 0.1, 0.45, outX);
  const shoe = prog(t, W("b2", "lucky") - 0.35, 0.45, ease.inCubic);
  const book = prog(t, W("g2", "panchang") - 0.1, 0.45, outX);
  const shut = prog(t, W("g2", "use") - 0.25, 0.35, inOut);
  const bars = prog(t, W("g2", "kamaai") - 0.1, 0.9, outX);
  const chipA = prog(t, W("g3", "tradition"), 0.4, outX), chipB = prog(t, W("g3", "research"), 0.4, outX);
  const swapOut = prog(t, S("g2") - 0.1, 0.3, ease.inCubic);
  return (
    <AbsoluteFill>
      {/* the "lucky share" */}
      <div style={{ opacity: 1 - swapOut }}>
        <Card x={290} y={640} w={500} h={360} p={card}>
          <div style={{ position: "absolute", left: 34, top: 28, fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.16em", color: color.inkDim }}>MUHURAT WALA SHARE</div>
          <div style={{ position: "absolute", left: 30, top: 70, fontFamily: font.display, fontWeight: 800, fontSize: 110, color: color.ink }}>LUCKY?</div>
        </Card>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(700 ${lerp(300, 880, shoe)}) rotate(${lerp(-40, 12, shoe)})`} opacity={shoe > 0 ? 1 : 0}>
            <path d="M -60 60 A 70 80 0 1 1 60 60 L 36 60 A 46 56 0 1 0 -36 60 Z" fill="#C9A45C" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          </g>
        </svg>
      </div>
      {/* panchang closes, the earnings bars rise */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: book * (1 - prog(t, W("g2", "kamaai") - 0.2, 0.3)) }}>
        <g transform="translate(540 820)">
          <rect x={-10} y={-170} width={20} height={340} fill="#6A1F2A" stroke={INK} strokeWidth={6} />
          <g transform={`scale(${lerp(1, 0.04, shut)} 1)`}><rect x={0} y={-170} width={260} height={340} rx={10} fill="#F3E2BE" stroke={INK} strokeWidth={8} />
            {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={30} x2={230} y1={-110 + i * 55} y2={-110 + i * 55} stroke="#C9A45C" strokeWidth={8} />)}</g>
          <g transform={`scale(${lerp(1, 0.04, shut)} 1)`}><rect x={-260} y={-170} width={260} height={340} rx={10} fill="#F3E2BE" stroke={INK} strokeWidth={8} />
            <text x={-130} y={10} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill="#6A1F2A">PANCHANG</text></g>
        </g>
      </svg>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: prog(t, W("g2", "kamaai") - 0.1, 0.3) * (1 - prog(t, C.chips + 0.4, 0.3)) }}>
        {[0, 1, 2].map((i) => {
          const h = (180 + i * 130) * clamp01(bars * 1.3 - i * 0.15);
          return <rect key={i} x={330 + i * 150} y={1050 - h} width={110} height={h} rx={10} fill={GREEN} stroke={INK} strokeWidth={7} />;
        })}
        <text x={540} y={1120} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill={color.ink}>COMPANY KI KAMAAI</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        {[["TRADITION", chipA, color.amber], ["RESEARCH", chipB, GREEN]].map(([l, p, c]) => (
          <div key={l as string} style={{ opacity: p as number, transform: `translateX(${(1 - (p as number)) * -60}px)`, padding: "22px 46px", borderRadius: 50, background: c as string, color: INK,
            fontFamily: font.display, fontWeight: 800, fontSize: 78, display: "flex", gap: 20, alignItems: "center" }}>
            {l as string}<span style={{ fontSize: 66 }}>✓</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Forwards: React.FC<{ t: number }> = ({ t }) => {
  const msgs = ["SAAL BHAR 2X", "LAKSHMI AAYEGI", "PAKKA PROFIT", "FORWARD KARO!!", "100% SURE"];
  const popAt = W("g4", "forward");
  return (
    <AbsoluteFill>
      {msgs.map((m, i) => {
        const a = S("c2") + 0.1 + i * 0.28;
        const p = prog(t, a, 0.35, outX);
        const pop = prog(t, popAt + i * 0.12, 0.18, ease.inCubic);
        if (p <= 0 || pop >= 1) return null;
        const [x, y] = [[90, 560], [700, 610], [140, 860], [690, 900], [380, 470]][i];
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + Math.sin(t * 2 + i) * 8, padding: "12px 22px", borderRadius: "18px 18px 18px 4px", background: "#DDF5D9",
            border: `4px solid ${INK}`, fontFamily: font.display, fontWeight: 800, fontSize: 30, color: "#16301F",
            transform: `scale(${p * (1 + pop * 0.4)}) rotate(${(rand(i) - 0.5) * 8}deg)`, opacity: 1 - pop }}>{m}</div>
        );
      })}
    </AbsoluteFill>
  );
};

const Mithai: React.FC<{ t: number }> = ({ t }) => {
  const plate = prog(t, W("g5", "mithai") - 0.15, 0.5, outX);
  const sheet = prog(t, W("g5", "balance") - 0.15, 0.5, outX);
  const rows = ["KAMAAI", "KHARCHA", "KARZA"];
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${lerp(-200, 290, plate)} 760)`}>
          <ellipse cx={0} cy={60} rx={190} ry={60} fill="#E9E2D2" stroke={INK} strokeWidth={8} />
          {[[-90, 20], [0, 20], [90, 20], [-45, -45], [45, -45], [0, -105]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={48} fill="#F2A23A" stroke={INK} strokeWidth={7} />
          ))}
        </g>
      </svg>
      <Card x={590} y={640} w={400} h={470} p={sheet}>
        <div style={{ position: "absolute", left: 30, top: 26, fontFamily: font.display, fontWeight: 800, fontSize: 40, color: color.ink }}>BALANCE SHEET</div>
        {rows.map((r, i) => {
          const p = prog(t, W("g5", "balance") + 0.2 + i * 0.25, 0.4, outX);
          return (
            <div key={r} style={{ position: "absolute", left: 30, right: 30, top: 120 + i * 105, opacity: p }}>
              <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 28, letterSpacing: "0.12em", color: color.inkDim }}>{r}</div>
              <div style={{ marginTop: 10, height: 16, borderRadius: 8, background: i === 2 ? color.loss : GREEN, width: `${p * [88, 55, 30][i]}%` }} />
            </div>
          );
        })}
      </Card>
    </AbsoluteFill>
  );
};

const CUTS = [0, C.calendar, C.lucky, C.set, C.mithai, C.cta, T.total + 1];
const HOT = /^(muhurat|8|november|sunday|lakshmi|research|balance|sheet|share|lottery|panchang|kamaai)/i;

export const Ep02Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camTrack(CAM, t);
  const cast = (who: Lead[], withCam = false) => <Cast t={t} frame={frame} who={who} block={BLOCK} acting={ACT} mouth={MOUTH} cam={withCam ? cam : undefined}
    phone={["MUHURAT", "SAAL BHAR 2X", "Forward karo!!"]} />;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <AbsoluteFill>
          <Shot t={t} a={CUTS[0]} b={CUTS[1]}>
            <Backdrop t={t} tint="#241709" panel="#33210F" /><Diwali t={t} />{cast(["boy", "chacha"], true)}
          </Shot>
          <Shot t={t} a={CUTS[1]} b={CUTS[2]}>
            <Backdrop t={t} tint="#1A1410" panel="#261C14" /><TickerLine t={t} y={1380} /><Calendar t={t} />{cast(["girl", "boy", "chacha"])}
          </Shot>
          <Shot t={t} a={CUTS[2]} b={CUTS[3]}>
            <Backdrop t={t} tint="#0E151D" panel="#16202B" /><TickerLine t={t} y={1360} tint="rgba(61,203,140,0.12)" /><Lucky t={t} />{cast(["girl", "boy"])}
          </Shot>
          <Shot t={t} a={CUTS[3]} b={CUTS[4]}>
            <Backdrop t={t} tint="#241709" panel="#33210F" /><Diwali t={t} />{cast(["boy", "chacha", "girl"])}<Forwards t={t} />
          </Shot>
          <Shot t={t} a={CUTS[4]} b={CUTS[5]}>
            <Backdrop t={t} tint="#1E1410" panel="#2B1D14" /><Mithai t={t} />{cast(["boy", "girl"])}
          </Shot>
          <Shot t={t} a={CUTS[5]} b={CUTS[6]}>
            <Backdrop t={t} tint="#241709" panel="#33210F" /><Diwali t={t} />{cast(["girl"], true)}<ShareCTA t={t} a={W("g6", "share")} label="SHARE KARO" />
          </Shot>
          <Texture frame={frame} />
          <Captions t={t} tl={T} until={T.total} hot={HOT} />
        </AbsoluteFill>
      </CameraMotionBlur>
      <Audio src={staticFile("ep02/mix.wav")} />
    </AbsoluteFill>
  );
};
