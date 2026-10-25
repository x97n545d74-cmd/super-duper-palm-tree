import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import timeline from "../../../projects/2026-10-ep03-tips-chacha/timeline.json";
import mouthData from "../../../public/ep03/mouth.json";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, lerp, prog, rand } from "../../engine/anim";
import { faceCenter, Key } from "../ep01/Character";
import { Backdrop, Captions, Card, Cast, camTrack, FEET, GREEN, INK, inOut, Lead, Mark, outX, Rise, ShareCTA, Shot, Texture, TickerLine, TL, timing } from "./kit";

/*
 * Ep 03 — "Tips wale Chacha": how a pump & dump works.
 * Facts: SEBI has passed orders against Telegram stock-tip channels (e.g. "Safebulls", order of 30 Apr 2024).
 * SEBI's site lists registered investment advisers / research analysts. The group name here is made up.
 */
const T = timeline as unknown as TL;
export const EP03_DURATION = T.total;
const { S, E, W, C } = timing(T);
const MOUTH = mouthData as Record<string, number[]>;
const RED = color.loss;

// ---------- acting ----------
const BOY: Key[] = [
  [0, { lookX: 9, mouth: "smile", mouthAmt: 0.4 }],
  [S("b1") - 0.1, { mouth: "talk", eye: 1.25, browL: 13, browR: 13, lean: 3 }],
  [E("b1"), { mouth: "grin", mouthAmt: 1 }],
  [C.title, { mouth: "o", mouthAmt: 0.6, eye: 1.2, lean: 0, lookX: -9 }],
  [C.steps, { mouth: "flat", lookY: -8, lookX: -6, eye: 1, browL: 2, browR: 2 }],
  [W("g3", "bech"), { mouth: "o", mouthAmt: 0.7, eye: 1.25, tilt: -0.8, browL: 10, browR: 10 }],
  [C.rain, { mouth: "smirk", mouthAmt: 0.6, lookX: 9, tilt: 0, eye: 0.9 }],
  [S("b2"), { mouth: "talk", eye: 0.85, browL: 4, browR: 10 }],
  [E("b2"), { mouth: "frown", mouthAmt: 0.7 }],
  [C.exit, { mouth: "smile", mouthAmt: 0.5, lookX: 9, eye: 1, browL: 0, browR: 0 }],
];
const GIRL: Key[] = [
  [0, { mouth: "smile" }],
  [C.title, { mouth: "talk", browL: -3, browR: -3, eye: 0.8, lean: -2 }],
  [E("g1"), { mouth: "flat", lean: 0 }],
  [S("g2"), { mouth: "talk", eye: 1, browL: 2, browR: 6, lookY: -6 }],
  [E("g3"), { mouth: "flat" }],
  [C.sebi, { mouth: "talk", lookY: 0, lookX: 0, eye: 0.9 }],
  [E("g6"), { mouth: "smile", mouthAmt: 0.8 }],
  [C.exit, { lookX: -9, mouth: "smirk", mouthAmt: 0.7 }],
  [S("g7"), { mouth: "talk", eye: 0.8, browR: 10 }],
  [W("g7", "aur") - 0.1, { lookX: 0, eye: 1, browR: 4, browL: 4 }],
  [E("g7"), { mouth: "smile", mouthAmt: 1 }],
];
const CHACHA: Key[] = [
  [0, { mouth: "talk", browL: 12, browR: 12, eye: 1.15, lookX: -6, lean: 2 }],
  [E("c1"), { mouth: "smile", mouthAmt: 1, lean: 0 }],
  [C.title, { mouth: "o", mouthAmt: 0.5, browL: 6, browR: 6 }],
  [W("g3", "bech"), { mouth: "frown", mouthAmt: 0.9, tilt: -0.9, eye: 1.25 }],
  [C.exit, { mouth: "flat", tilt: -0.5, browL: 4, browR: 4, lookX: 6, eye: 1 }],
  [S("c2"), { mouth: "talk", tilt: -0.7 }],
  [E("c2"), { mouth: "frown", mouthAmt: 0.5 }],
  [W("g7", "chhod") + 0.2, { mouth: "smile", mouthAmt: 0.8, tilt: 0, browL: 8, browR: 8 }],
];
const ACT = { boy: BOY, girl: GIRL, chacha: CHACHA };

// ---------- blocking ----------
const BLOCK: Record<Lead, Mark[]> = {
  chacha: [[0, 830, 0.5, 0], [C.title, 930, 0.28, 0], [C.steps, 980, 0.26, 0], [C.rain, 1400, 0.3, 0], [C.exit, 560, 0.45, 0]],
  boy: [[0, -150, 0.5, 0], [S("b1") - 0.2, -150, 0.5, 0], [S("b1"), 330, 0.5, 1.4], [C.title, 700, 0.28, 0], [C.steps, 840, 0.26, 0],
    [C.rain, 280, 0.46, 0], [C.sebi, 1400, 0.3, 0], [C.exit, 180, 0.45, 0]],
  girl: [[0, 1500, 0.5, 0], [C.title, -150, 0.28, 0], [C.title + 0.02, 300, 0.28, 0.9], [C.steps, 140, 0.26, 0], [S("g2") + 0.3, 560, 0.26, 6.2],
    [C.rain, 1500, 0.3, 0], [C.sebi, 540, 0.3, 0], [C.exit, 900, 0.45, 0]],
};
const CAM: [number, number, number, number, number][] = [
  [0, 600, 1080, 1.0, 0], [S("b1"), 560, 1080, 1.0, 0.7],
  [C.exit, 540, 1080, 1.0, 0],
  [S("g7") + 1.0, faceCenter("girl", 900, FEET, 0.45)[0] - 60, faceCenter("girl", 900, FEET, 0.45)[1] + 200, 1.35, 0.6],
];

// ---------- graphics ----------
const Rocket: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 -40 Q 22 -10 18 26 L -18 26 Q -22 -10 0 -40 Z" fill="#E9E2D2" stroke={INK} strokeWidth={5} />
    <circle cx={0} cy={-6} r={7} fill="#5B8CFF" stroke={INK} strokeWidth={4} />
    <path d="M -18 14 L -30 32 L -16 28 Z M 18 14 L 30 32 L 16 28 Z" fill={RED} stroke={INK} strokeWidth={4} />
    <path d="M -9 28 Q 0 52 9 28 Z" fill={color.amberHot} />
  </g>
);

const GroupChat: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, 0.25, 0.5, outX) * (1 - prog(t, S("b1") + 0.5, 0.3, ease.inCubic));
  const msgs = ["₹3 wala share", "KAL 5X PAKKA", "Jaldi lo, seats full!"];
  return (
    <Card x={50} y={450} w={470} h={430} p={p}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, background: "#1F3A2C", display: "flex", alignItems: "center", gap: 18, padding: "0 24px" }}>
        <svg width={56} height={56} viewBox="-30 -45 60 100"><Rocket /></svg>
        <div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 32, color: "#E8F5EC" }}>ROCKET PROFIT VIP</div>
          <div style={{ fontFamily: font.text, fontWeight: 600, fontSize: 22, color: "#9FC7AE" }}>50,000 members</div>
        </div>
      </div>
      {msgs.map((m, i) => {
        const q = prog(t, 0.6 + i * 0.55, 0.35, outX);
        return (
          <div key={i} style={{ position: "absolute", left: 24, top: 120 + i * 96, padding: "14px 22px", borderRadius: "18px 18px 18px 4px", background: i === 1 ? "#D5F2DA" : "#F3F1EC",
            fontFamily: font.display, fontWeight: 800, fontSize: 34, color: "#16301F", opacity: q, transform: `translateX(${(1 - q) * -40}px)` }}>{m}</div>
        );
      })}
    </Card>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const a = prog(t, W("g1", "pump") - 0.05, 0.4, outX), b = prog(t, W("g1", "dump"), 0.4, outX);
  const big = { fontFamily: font.display, fontWeight: 800, fontSize: 210, letterSpacing: "-0.05em", lineHeight: 0.9 } as const;
  const ruko = prog(t, C.title + 0.15, 0.3, outX) * (1 - prog(t, W("g1", "ise") - 0.1, 0.25));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: font.display, fontWeight: 800, fontSize: 120, color: color.ink, opacity: ruko, transform: `scale(${lerp(1.3, 1, ruko)})` }}>RUKO ✋</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center" }}>
        <Rise p={a}><div style={{ ...big, color: GREEN }}>PUMP</div></Rise>
        <Rise p={a}><div style={{ ...big, fontSize: 90, color: color.inkDim }}>&amp;</div></Rise>
        <Rise p={b}><div style={{ ...big, color: RED }}>DUMP</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

// the live chart: admins buy low, tip goes out, crowd buys, admins sell at the top, price crashes
const Steps: React.FC<{ t: number }> = ({ t }) => {
  const s1 = W("g2", "pehle"), s2 = W("g2", "phir"), s3 = W("g3", "sab"), s4 = W("g3", "aur");
  const X0 = 110, X1 = 970, Y0 = 1120;
  const path: [number, number][] = [[0, 0], [0.18, 0.03], [0.3, 0.05], [0.42, 0.25], [0.55, 0.62], [0.66, 0.86], [0.72, 0.9], [0.8, 0.45], [0.9, 0.12], [1, 0.02]];
  const reach = t < s2 ? lerp(0, 0.3, prog(t, s1, s2 - s1, inOut)) : t < s3 ? 0.3 + 0.08 * prog(t, s2, s3 - s2, inOut)
    : t < s4 ? lerp(0.38, 0.72, prog(t, s3, s4 - s3, inOut)) : lerp(0.72, 1, prog(t, s4 + 0.3, 1.2, ease.inCubic));
  const pt = (u: number, v: number): [number, number] => [X0 + u * (X1 - X0), Y0 - v * 440];
  const vis: [number, number][] = [];
  for (let i = 0; i < path.length; i++) {
    if (path[i][0] <= reach) vis.push(path[i]);
    else { const [u0, v0] = path[i - 1], [u1, v1] = path[i]; const k = (reach - u0) / (u1 - u0); vis.push([reach, lerp(v0, v1, k)]); break; }
  }
  const d = vis.map(([u, v], i) => `${i ? "L" : "M"} ${pt(u, v).join(" ")}`).join(" ");
  const crashed = reach > 0.74;
  const chips: [string, number, string][] = [["1 · CHUPKE SE KHAREEDA", s1, GREEN], ["2 · TIP BHEJI", s2, color.amber], ["3 · SABNE KHAREEDA", s3, GREEN], ["4 · UNHONE BECHA", s4, RED]];
  const tag = (u: number, v: number, label: string, c: string, at: number) => {
    const q = prog(t, at, 0.4, outX); const [x, y] = pt(u, v);
    return q > 0 && <g opacity={q}><circle cx={x} cy={y} r={18} fill={c} stroke={INK} strokeWidth={6} />
      <text x={x} y={y - 34} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} fill={c}>{label}</text></g>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 70, right: 70, top: 450, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {chips.map(([l, a, c]) => { const q = prog(t, a, 0.35, outX); return (
          <div key={l} style={{ opacity: q, transform: `translateY(${(1 - q) * 20}px)`, padding: "12px 18px", borderRadius: 18, border: `3px solid ${c}`, background: "rgba(8,9,12,0.8)",
            fontFamily: font.display, fontWeight: 800, fontSize: 28, color: c }}>{l}</div>); })}
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} x2={X1} y1={Y0 + 20} y2={Y0 + 20} stroke="rgba(243,241,236,0.15)" strokeWidth={3} />
        <text x={X0} y={Y0 + 64} fontFamily="Inter" fontWeight={700} fontSize={24} fill={color.inkFaint}>SHARE PRICE</text>
        <path d={d} fill="none" stroke={crashed ? RED : GREEN} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        {tag(0.18, 0.03, "ADMIN", GREEN, s1 + 0.3)}
        {prog(t, s2, 0.3) > 0 && <g transform={`translate(${pt(0.3, 0.05)[0]} ${pt(0.3, 0.05)[1] - 120}) scale(${prog(t, s2, 0.4, outX)})`}>
          <rect x={-70} y={-30} width={140} height={60} rx={14} fill="#D5F2DA" stroke={INK} strokeWidth={5} />
          <text x={0} y={12} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} fill="#16301F">TIP!</text></g>}
        {/* the crowd: little heads piling in while the line climbs */}
        {Array.from({ length: 14 }).map((_, i) => {
          const q = prog(t, s3 + 0.1 + i * 0.09, 0.3, outX);
          const [x, y] = pt(0.42 + (i % 7) * 0.035, 0);
          return q > 0 && <circle key={i} cx={x} cy={y + 60 - Math.floor(i / 7) * 34 - (1 - q) * 40} r={14} fill={SKIN[i % 3]} stroke={INK} strokeWidth={4} opacity={q} />;
        })}
        {tag(0.72, 0.9, "ADMIN SELL", RED, s4 + 0.1)}
      </svg>
    </AbsoluteFill>
  );
};
const SKIN = ["#FECDA4", "#E8B38A", "#F3D2B3"];

const Rain: React.FC<{ t: number }> = ({ t }) => {
  const a = C.rain + 0.2;
  const card = prog(t, a, 0.45, outX);
  const bag = clamp01((t - W("b2", "tiptip")) / 1.6);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g opacity={card} transform={`translate(760 ${lerp(1000, 960, card)})`}>
          <circle cx={0} cy={-150} r={70} fill="#2B3340" stroke={INK} strokeWidth={8} />
          <path d="M -90 60 Q -90 -60 0 -60 Q 90 -60 90 60 Z" fill="#2B3340" stroke={INK} strokeWidth={8} />
          <rect x={-40} y={-175} width={80} height={22} rx={8} fill={INK} />
          <text x={0} y={120} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill={color.ink}>GROUP ADMIN</text>
          {/* money bag fills */}
          <g transform={`translate(150 20) scale(${0.7 + bag * 0.5})`}>
            <path d="M -60 60 Q -80 -10 -30 -40 L 30 -40 Q 80 -10 60 60 Z" fill="#C9A45C" stroke={INK} strokeWidth={7} />
            <text x={0} y={30} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={INK}>₹</text>
          </g>
        </g>
        {/* notes fall only over the admin, on a tip-tip rhythm */}
        {Array.from({ length: 16 }).map((_, i) => {
          const t0 = W("b2", "tiptip") - 0.4 + i * 0.17;
          const u = clamp01((t - t0) / 1.1);
          if (u <= 0 || u >= 1) return null;
          const x = 620 + rand(i * 3.1) * 300, y = lerp(380, 1000, u);
          return <g key={i} transform={`translate(${x + Math.sin(u * 7 + i) * 22} ${y}) rotate(${Math.sin(u * 5 + i) * 30})`}>
            <rect x={-38} y={-18} width={76} height={36} rx={4} fill="#8FCB8A" stroke={INK} strokeWidth={4} />
            <text x={0} y={10} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={24} fill="#1E3B1C">₹</text></g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Sebi: React.FC<{ t: number }> = ({ t }) => {
  const paper = prog(t, C.sebi + 0.15, 0.45, outX) * (1 - prog(t, S("g5") - 0.2, 0.25));
  const stamp = prog(t, W("g4", "order") - 0.05, 0.25, ease.inCubic);
  const big = prog(t, S("g5") - 0.05, 0.45, outX) * (1 - prog(t, S("g6") - 0.2, 0.25));
  const big2 = prog(t, W("g5", "probably"), 0.45, outX);
  const query = "SEBI registered adviser";
  const typed = Math.floor(clamp01((t - W("g6", "check")) / 1.1) * query.length);
  const tick = prog(t, W("g6", "sebi"), 0.4, outX);
  const bar = prog(t, S("g6") - 0.1, 0.4, outX);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 210, top: 520, width: 660, height: 560, opacity: paper, transform: `translateY(${(1 - paper) * 40}px) rotate(-2deg)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 14, background: "#F3EEE3", border: `7px solid ${INK}` }} />
        <div style={{ position: "absolute", left: 40, top: 40, fontFamily: font.display, fontWeight: 800, fontSize: 40, color: INK }}>ORDER</div>
        <div style={{ position: "absolute", left: 40, top: 100, fontFamily: font.text, fontWeight: 600, fontSize: 28, color: "#444" }}>In the matter of a Telegram channel</div>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ position: "absolute", left: 40, right: 40 + (i % 2) * 120, top: 170 + i * 50, height: 14, borderRadius: 7, background: "#D8D0BE" }} />)}
        <div style={{ position: "absolute", right: 40, bottom: 50, padding: "16px 26px", border: `7px solid ${RED}`, borderRadius: 14, color: RED, fontFamily: font.display, fontWeight: 800, fontSize: 64,
          opacity: stamp > 0 ? 1 : 0, transform: `rotate(-12deg) scale(${lerp(1.8, 1, stamp)})` }}>SEBI ORDER</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: big, fontFamily: font.display, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
        <Rise p={big}><div style={{ fontSize: 120, color: color.ink }}>TOO GOOD</div></Rise>
        <Rise p={big}><div style={{ fontSize: 120, color: color.ink }}>TO BE TRUE?</div></Rise>
        <Rise p={big2} style={{ marginTop: 24 }}><div style={{ fontSize: 64, color: color.amber }}>probably is</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 760, opacity: bar, transform: `translateY(${(1 - bar) * 30}px)` }}>
        <div style={{ padding: "26px 30px", borderRadius: 50, background: "#F3F1EC", border: `6px solid ${INK}`, display: "flex", alignItems: "center", gap: 20 }}>
          <svg width={44} height={44} viewBox="0 0 24 24"><circle cx={10} cy={10} r={7} fill="none" stroke={INK} strokeWidth={3} /><line x1={15} y1={15} x2={22} y2={22} stroke={INK} strokeWidth={3} strokeLinecap="round" /></svg>
          <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 42, color: INK }}>{query.slice(0, typed)}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0 }}>|</span></span>
        </div>
        <div style={{ marginTop: 34, display: "flex", justifyContent: "center", opacity: tick, transform: `scale(${lerp(0.7, 1, tick)})` }}>
          <div style={{ padding: "18px 40px", borderRadius: 50, background: GREEN, color: INK, fontFamily: font.display, fontWeight: 800, fontSize: 52 }}>✓ PEHLE CHECK KARO</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const ExitDialog: React.FC<{ t: number }> = ({ t }) => {
  const p = prog(t, S("c2") + 0.4, 0.4, outX);
  const tap = prog(t, W("g7", "chhod"), 0.2, ease.inCubic);
  const gone = prog(t, W("g7", "chhod") + 0.25, 0.35, ease.inCubic);
  if (p <= 0 || gone >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 250, top: 470, width: 580, opacity: 1 - gone, transform: `translateY(${(1 - p) * 30}px) scale(${1 - gone * 0.2})` }}>
      <div style={{ borderRadius: 30, background: "#F3F1EC", border: `6px solid ${INK}`, padding: "30px 34px" }}>
        <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 44, color: INK }}>Exit "ROCKET PROFIT VIP"?</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 30 }}>
          <div style={{ padding: "14px 28px", fontFamily: font.display, fontWeight: 800, fontSize: 36, color: "#666" }}>CANCEL</div>
          <div style={{ padding: "14px 34px", borderRadius: 40, background: RED, color: "#FFF", fontFamily: font.display, fontWeight: 800, fontSize: 36, transform: `scale(${1 - tap * 0.12})` }}>EXIT</div>
        </div>
      </div>
    </div>
  );
};

const CUTS = [0, C.title, C.steps, C.rain, C.sebi, C.exit, T.total + 1];
const HOT = /^(₹3|paanch|pump|dump|tip|bech|sebi|telegram|registered|order|true|das)/i;

export const Ep03Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const cam = camTrack(CAM, t);
  const cast = (who: Lead[], withCam = false) => <Cast t={t} frame={frame} who={who} block={BLOCK} acting={ACT} mouth={MOUTH} cam={withCam ? cam : undefined}
    phone={["ROCKET VIP", "₹3 → 5X", "Forward!!"]} />;
  return (
    <AbsoluteFill style={{ background: color.bg, overflow: "hidden" }}>
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <AbsoluteFill>
          <Shot t={t} a={CUTS[0]} b={CUTS[1]}>
            <Backdrop t={t} tint="#12192A" panel="#1B2438" /><TickerLine t={t} y={1300} tint="rgba(61,203,140,0.12)" />{cast(["chacha", "boy"], true)}<GroupChat t={t} />
          </Shot>
          <Shot t={t} a={CUTS[1]} b={CUTS[2]}>
            <Backdrop t={t} tint="#1D0F12" panel="#2A1519" /><Title t={t} />{cast(["girl", "boy", "chacha"])}
          </Shot>
          <Shot t={t} a={CUTS[2]} b={CUTS[3]}>
            <Backdrop t={t} tint="#0E151D" panel="#16202B" /><Steps t={t} />{cast(["girl", "boy", "chacha"])}
          </Shot>
          <Shot t={t} a={CUTS[3]} b={CUTS[4]}>
            <Backdrop t={t} tint="#12192A" panel="#1B2438" /><Rain t={t} />{cast(["boy"])}
          </Shot>
          <Shot t={t} a={CUTS[4]} b={CUTS[5]}>
            <Backdrop t={t} tint="#101318" panel="#191E27" /><TickerLine t={t} y={1320} /><Sebi t={t} />{cast(["girl"])}
          </Shot>
          <Shot t={t} a={CUTS[5]} b={CUTS[6]}>
            <Backdrop t={t} tint="#12192A" panel="#1B2438" />{cast(["boy", "chacha", "girl"], true)}<ExitDialog t={t} />
            <ShareCTA t={t} a={W("g7", "bhejo")} label="SHARE KARO" />
          </Shot>
          <Texture frame={frame} />
          <Captions t={t} tl={T} until={T.total} hot={HOT} />
        </AbsoluteFill>
      </CameraMotionBlur>
      <Audio src={staticFile("ep03/mix.wav")} />
    </AbsoluteFill>
  );
};
