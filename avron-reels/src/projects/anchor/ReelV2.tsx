import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, ease, lerp, prog, useTime } from "../../engine/anim";
import { Captions } from "../../engine/components/Captions";
import { SerifFont, serif } from "../swiggy/look";
import { B, CAPTIONS, DURATION, wordAt as W } from "../fuel-gap/config";
import { Anchor, Grain, push, Rise, Window } from "./Reel";

/*
 * AVRON anchor demo V2: the Fuel Gap story (verified / attributed facts in projects/2026-10-fuel-gap/research/sources.json,
 * the user's Tia Mirza VO) in a look taken from the user's five reference videos:
 *  - paper collage: graph paper, a gold sun rising out of a grass strip, a cut-out object that leans (the Pisa reference)
 *  - perspective grid tunnels in green and blue
 *  - orbit rings with square nodes, nested hexagons, a bead ring (the motion-design board)
 *  - one comic burst (yellow halftone, orange spikes, white cloud) for the −₹34 hit
 * The anchor stays secondary: cutouts beside the data, small windows, one presenter moment at the end.
 */

const NIGHT = "#0B0E13";
const PAPER = "#EFEBE1";
const INK = "#F5F1EA";
const INK_D = "#16182A";
const DIM = "rgba(245,241,234,0.6)";
const DIM_D = "rgba(22,24,42,0.55)";
const GOLD = "#E2A72E";
const MAG = "#D23A73";
const TEAL = "#72D6C9";
const PURP = "#2B2A6B";
const NAVYP = "#15173D";
const RED = "#E0483A";
const G = 84;
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

const sx = (size: number, weight = 800, c = INK): React.CSSProperties => ({ fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1, color: c });
const sf = (size: number, c = INK, italic = false): React.CSSProperties => ({ fontFamily: serif, fontWeight: 700, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: "-0.02em", lineHeight: 1.04, color: c });
const lbl = (c = DIM, size = 21): React.CSSProperties => ({ fontFamily: mono, fontWeight: 500, fontSize: size, letterSpacing: "0.14em", color: c });
const Pill: React.FC<{ text: string; c?: string; bg?: string; style?: React.CSSProperties }> = ({ text, c = "#fff", bg = MAG, style }) => (
  <span style={{ display: "inline-block", padding: "8px 16px", borderRadius: 999, background: bg, ...lbl(c, 18), ...style }}>{text}</span>
);
const on = (t: number, a: number, b: number) => t >= a && t < b + 0.04;

/* ------------------------------------------------------------------ backgrounds from the references */

/** Graph paper + grass strip + gold sun (the collage reference). */
const Collage: React.FC<{ t: number; a: number; sun?: number; sunX?: number; grassY?: number; children?: React.ReactNode }> = ({ t, a, sun = 1, sunX = 540, grassY = 1120, children }) => {
  const rise = ease.outExpo(clamp01((t - a - 0.1) / 1.1));
  return (
    <AbsoluteFill style={{ background: PAPER, backgroundImage: "linear-gradient(rgba(22,24,42,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(22,24,42,0.10) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }}>
      <div style={{ position: "absolute", left: sunX - 270, top: grassY - 270 + (1 - rise) * 300, width: 540, height: 540, borderRadius: "50%", background: GOLD, opacity: sun }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="grass" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.30 0.018" numOctaves={3} seed={7} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 1.8 -0.25" />
        </filter>
        <rect x={0} y={grassY} width={1080} height={1920 - grassY} fill="#127A5C" />
        <rect x={0} y={grassY} width={1080} height={1920 - grassY} filter="url(#grass)" opacity={0.9} />
        <rect x={0} y={grassY} width={1080} height={10} fill="#0B5E46" />
      </svg>
      {children}
    </AbsoluteFill>
  );
};

/** Perspective grid tunnel (the green and blue references). Lines travel toward camera. */
const Tunnel: React.FC<{ t: number; bgTop: string; bgBot: string; line: string; mid?: number; gap?: number; speed?: number }> = ({ t, bgTop, bgBot, line, mid = 760, gap = 260, speed = 0.9 }) => {
  const yF = mid + gap / 2, yC = mid - gap / 2, N = 16;
  const rows = Array.from({ length: N }).map((_, i) => {
    const d = N - ((i + t * speed) % N); // distance: N → 0
    return Math.max(0.35, d);
  });
  const rays = Array.from({ length: 23 }).map((_, i) => (i - 11) * 260);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${bgTop} 0%, ${bgBot} 50%, ${bgTop} 100%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[1, -1].map((s) => {
          const y0 = s > 0 ? yF : yC, y1 = s > 0 ? 1920 : 0;
          return (
            <g key={s}>
              {rays.map((x, k) => <line key={k} x1={540 + x * 0.08} y1={y0} x2={540 + x * 1.6} y2={y1} stroke={line} strokeWidth={k % 3 === 2 ? 3 : 1.5} strokeOpacity={k % 3 === 2 ? 0.9 : 0.4} />)}
              {rows.map((d, k) => {
                const y = y0 + s * (900 / d) * 0.9;
                if (s > 0 ? y > 1920 : y < 0) return null;
                return <line key={k} x1={0} x2={1080} y1={y} y2={y} stroke={line} strokeWidth={1.6} strokeOpacity={clamp01(1.4 - d / N) * 0.75} />;
              })}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: yC - 120, height: gap + 240, background: `linear-gradient(180deg, transparent, ${bgBot} 35%, ${bgBot} 65%, transparent)` }} />
    </AbsoluteFill>
  );
};

/** Orbit rings with square nodes (the navy reference + the motion board). */
const Orbits: React.FC<{ t: number; cx: number; cy: number; rings: { r: number; n: number; sp: number; c?: string }[]; o?: number }> = ({ t, cx, cy, rings, o = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {rings.map((g, i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r={g.r} fill="none" stroke={g.c ?? "#7FA2E0"} strokeOpacity={0.55} strokeWidth={2} />
        {Array.from({ length: g.n }).map((_, k) => {
          const th = t * g.sp + (k / g.n) * Math.PI * 2 + i;
          const x = cx + Math.cos(th) * g.r, y = cy + Math.sin(th) * g.r;
          return <rect key={k} x={x - 11} y={y - 11} width={22} height={22} fill="#fff" transform={`rotate(${(th * 180) / Math.PI} ${x} ${y})`} />;
        })}
      </g>
    ))}
  </svg>
);

const hexPts = (cx: number, cy: number, r: number) => Array.from({ length: 6 }).map((_, i) => {
  const a = (Math.PI / 3) * i;
  return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
}).join(" ");

/** The fuel pump as a paper cut-out. Leans around its base like the tower in the reference. */
const Pump: React.FC<{ x: number; base: number; lean: number; price: string; scale?: number; crack?: number }> = ({ x, base, lean, price, scale = 1, crack = 0 }) => (
  <div style={{ position: "absolute", left: x - 170 * scale, top: base - 560 * scale, width: 340 * scale, height: 560 * scale, transform: `rotate(${lean}deg)`, transformOrigin: "50% 100%",
    filter: "drop-shadow(10px 18px 0 rgba(22,24,42,0.18))" }}>
    <svg width="100%" height="100%" viewBox="0 0 340 560">
      <rect x={30} y={20} width={230} height={540} rx={18} fill="#F7F4EC" stroke={INK_D} strokeWidth={5} />
      <rect x={30} y={20} width={230} height={70} rx={18} fill={RED} stroke={INK_D} strokeWidth={5} />
      <text x={145} y={68} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={30} fill="#fff" letterSpacing="4">DIESEL</text>
      <rect x={58} y={120} width={174} height={92} rx={8} fill={INK_D} />
      <text x={145} y={184} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={50} fill={GOLD}>{price}</text>
      <rect x={58} y={240} width={174} height={20} rx={4} fill="rgba(22,24,42,0.12)" />
      <rect x={58} y={276} width={120} height={20} rx={4} fill="rgba(22,24,42,0.12)" />
      <path d="M260 180 h40 a14 14 0 0 1 14 14 v230 a28 28 0 0 1 -56 0 v-40" fill="none" stroke={INK_D} strokeWidth={10} strokeLinecap="round" />
      <rect x={244} y={330} width={30} height={64} rx={6} fill={INK_D} />
      <rect x={30} y={500} width={230} height={60} fill="rgba(22,24,42,0.12)" />
      <path d={`M 120 90 l 22 60 l -18 50 l 26 70 l -14 60 l 20 90`} fill="none" stroke={INK_D} strokeWidth={4} strokeDasharray={420} strokeDashoffset={420 * (1 - crack)} />
    </svg>
  </div>
);

/* ================================================================== scenes */

/* 1. ₹95.20: pump on the collage set, the anchor stands beside it */
const S1: React.FC<{ t: number }> = ({ t }) => {
  const a = 0, d = W("hook_price", "Delhi");
  const ticks = prog(t, 0.3, 1.9, ease.outCubic);
  return (
    <AbsoluteFill>
      <Collage t={t} a={a} sunX={360}>
        <Pump x={360} base={1130} lean={0} price={(87 + 8.2 * ticks).toFixed(2)} />
        <Anchor t={t} a={0.25} b={B.hookLoss + 0.3} pose="stand" x={810} bottom={1200} h={900} from="right" />
        <div style={{ position: "absolute", left: G, top: 260 }}>
          <div style={lbl(DIM_D)}>DIESEL · DELHI · 23 OCT 2026</div>
          <Rise t={t} a={0.3} style={{ marginTop: 14 }}><div style={sx(150, 800, INK_D)}>₹95.20</div></Rise>
          <Rise t={t} a={d - 0.3} style={{ marginTop: 10 }}><div style={sf(56, INK_D, true)}>a litre</div></Rise>
        </div>
      </Collage>
    </AbsoluteFill>
  );
};

/* 2a. The pump starts to lean as the loss is mentioned */
const S2a: React.FC<{ t: number }> = ({ t }) => {
  const a = B.hookLoss, lose = W("hook_loss", "losing");
  const lean = lerp(0, 11, prog(t, a + 0.4, lose - a, ease.inOutCubic));
  return (
    <AbsoluteFill>
      <Collage t={t} a={-5} sunX={360}>
        <Pump x={360} base={1130} lean={lean} price="95.20" crack={prog(t, lose - 0.2, 0.6)} />
        <div style={{ position: "absolute", left: G, right: G, top: 260 }}>
          <Rise t={t} a={a + 0.3}><div style={sf(70, INK_D)}>One brokerage</div></Rise>
          <Rise t={t} a={W("hook_loss", "estimates") - 0.1}><div style={sf(70, MAG, true)}>estimates</div></Rise>
          <Rise t={t} a={W("hook_loss", "company") - 0.1} style={{ marginTop: 22 }}><div style={{ ...lbl(DIM_D), fontSize: 24 }}>THE SELLER IS LOSING…</div></Rise>
        </div>
        <Window t={t} a={a + 0.3} b={W("hook_loss", "34")} pose="profile" x={760} y={760} w={230} h={230} zoom={1.9} dy={-70} dx={10} round />
      </Collage>
    </AbsoluteFill>
  );
};

/* 2b. −₹34: the one comic burst */
const S2b: React.FC<{ t: number }> = ({ t }) => {
  const a = W("hook_loss", "34") - 0.1;
  const pop = ease.outExpo(clamp01((t - a) / 0.45));
  const spikes = Array.from({ length: 22 }).map((_, i) => {
    const th = (i / 22) * Math.PI * 2 + 0.2, r1 = 380, r2 = 1500, w = 0.05 + (i % 3) * 0.02;
    const p = (r: number, d: number) => `${540 + Math.cos(th + d) * r},${780 + Math.sin(th + d) * r}`;
    return `M ${p(r1, 0)} L ${p(r2, -w)} L ${p(r2, w)} Z`;
  });
  const cloud = [[0, 0, 250], [-200, 40, 170], [200, 40, 175], [-120, -130, 160], [130, -140, 170], [-260, -60, 120], [270, -50, 125], [0, 160, 170]];
  return (
    <AbsoluteFill style={{ background: "#F7DD6A", backgroundImage: "radial-gradient(rgba(240,138,43,0.35) 3px, transparent 3.5px)", backgroundSize: "26px 26px" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${(t - a) * 6} 540 780)`}>{spikes.map((d, i) => <path key={i} d={d} fill="#F08A2B" opacity={0.9} />)}</g>
        <g transform={`translate(540 780) scale(${lerp(0.2, 1, pop)})`}>{cloud.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}</g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, textAlign: "center", transform: `scale(${lerp(0.5, 1, pop)})` }}>
        <div style={sx(230, 900, INK_D)}>−₹34</div>
        <div style={{ ...sf(48, INK_D, true), marginTop: 14 }}>on every litre</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: prog(t, a + 0.4, 0.3) }}>
        <Pill text="JEFFERIES ESTIMATE · 15-DAY AVG PRICING" bg={INK_D} />
      </div>
    </AbsoluteFill>
  );
};

/* 3. Brent: blue tunnel, the date then the number */
const S3: React.FC<{ t: number }> = ({ t }) => {
  const a = B.brent, n = W("brent", "$113"), sa = W("brent", "attacks");
  const big = prog(t, n - 0.15, 0.6, ease.outExpo);
  const dateOut = prog(t, n - 0.3, 0.4, ease.inCubic);
  return (
    <AbsoluteFill style={push(t, a)}>
      <Tunnel t={t} bgTop="#000" bgBot="#1A2490" line="#C9D2FF" mid={760} gap={420} speed={1.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", opacity: prog(t, a + 0.1, 0.3) * (1 - dateOut), transform: `scale(${lerp(0.3, 1, prog(t, a, 0.9, ease.outExpo)) + dateOut * 2})` }}>
        <div style={lbl(INK, 26)}>22 OCTOBER 2026</div>
        <div style={{ ...sf(110), marginTop: 18 }}>Brent crude</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", opacity: big, transform: `scale(${lerp(1.3, 1, big)})` }}>
        <div style={lbl(INK, 24)}>BRENT · SETTLED · PER BARREL</div>
        <div style={{ ...sx(200, 800), marginTop: 18 }}>$113.17</div>
        <Pill text="+4% IN A DAY" bg={RED} style={{ marginTop: 22 }} />
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 980, textAlign: "center", opacity: prog(t, sa - 0.2, 0.4) }}>
        <div style={sf(52, INK, true)}>after attacks in Saudi Arabia</div>
      </div>
      <Window t={t} a={a + 0.6} b={B.freight + 0.1} pose="front" x={1080 - G - 180} y={1060} w={180} h={200} zoom={1.7} dy={-30} />
    </AbsoluteFill>
  );
};

/* 4. Freight ×8: orbit system, the freight share arc grows from ~3% to 25%+ */
const S4: React.FC<{ t: number }> = ({ t }) => {
  const a = B.freight, eight = W("freight", "8");
  const share = lerp(0.03, 0.25, prog(t, eight, 1.2, ease.inOutCubic));
  const R = 250, C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ ...push(t, a), background: `linear-gradient(180deg, #070B18 0%, #0E2350 100%)` }}>
      <Orbits t={t} cx={540} cy={760} rings={[{ r: 390, n: 3, sp: 0.5 }, { r: 470, n: 2, sp: -0.35 }]} o={prog(t, a, 0.6)} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={760} r={R} fill="none" stroke="rgba(245,241,234,0.12)" strokeWidth={46} />
        <circle cx={540} cy={760} r={R} fill="none" stroke={MAG} strokeWidth={46} strokeDasharray={`${C * share} ${C}`} transform="rotate(-90 540 760)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center" }}>
        <div style={sx(150, 800)}>×{t < eight ? "?" : "8"}</div>
        <div style={{ ...lbl(INK), marginTop: 14 }}>FREIGHT VS PRE-CONFLICT</div>
      </div>
      <div style={{ position: "absolute", left: G, top: 290 }}>
        <div style={lbl()}>CRUDE FREIGHT · SHARE OF LANDED COST</div>
        <div style={{ ...sx(64, 800, MAG), marginTop: 14 }}>~3% → 25%+</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center" }}><Pill text="JEFFERIES ESTIMATE" /></div>
    </AbsoluteFill>
  );
};

/* 5. May: green tunnel, the real four-step diesel path */
const STEPS = [{ d: "BEFORE", v: 87.67 }, { d: "15 MAY", v: 90.67 }, { d: "19 MAY", v: 91.58 }, { d: "23 MAY", v: 92.49 }, { d: "25 MAY", v: 95.2 }];
const S5: React.FC<{ t: number }> = ({ t }) => {
  const a = B.may, sev = W("may_hikes", "7");
  const X = (i: number) => 120 + i * 205, Y = (v: number) => 1080 - (v - 86) * 52;
  const k = (i: number) => (i === 0 ? prog(t, a + 0.2, 0.4) : prog(t, W("may_hikes", "four") - 0.2 + (i - 1) * 0.55, 0.45, ease.outExpo));
  const tot = prog(t, sev - 0.2, 0.5, ease.outExpo);
  let path = `M ${X(0) - 40} ${Y(STEPS[0].v)}`;
  STEPS.forEach((s, i) => { if (i > 0 && k(i) > 0) path += ` H ${X(i)} V ${lerp(Y(STEPS[i - 1].v), Y(s.v), k(i))}`; });
  return (
    <AbsoluteFill style={push(t, a)}>
      <Tunnel t={t} bgTop="#03241D" bgBot="#0F6A56" line="#D9F27E" mid={820} gap={640} speed={0.8} />
      <div style={{ position: "absolute", left: G, top: 270 }}>
        <div style={lbl(INK)}>DIESEL · DELHI · MAY 2026</div>
        <Rise t={t} a={a + 0.1} style={{ marginTop: 14 }}><div style={sf(72)}>4 hikes in 10 days</div></Rise>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill="none" stroke="#D9F27E" strokeWidth={7} strokeLinejoin="round" />
        {STEPS.map((s, i) => (
          <g key={s.d} opacity={k(i)}>
            <circle cx={X(i)} cy={Y(s.v)} r={10} fill={i === 4 ? GOLD : "#fff"} />
            <text x={X(i)} y={Y(s.v) - 24} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={30} fill="#fff">{s.v.toFixed(2)}</text>
            <text x={X(i)} y={1140} textAnchor="middle" fontFamily={mono} fontSize={18} fill={DIM}>{s.d}</text>
          </g>
        ))}
      </svg>
      <div style={{ position: "absolute", right: G, top: 470, textAlign: "right", opacity: tot, transform: `translateY(${(1 - tot) * 20}px)` }}>
        <div style={sx(84, 800, GOLD)}>+₹7.53</div>
        <div style={{ ...lbl(INK), marginTop: 8 }}>+8.6% · ABOUT ₹7.50</div>
      </div>
    </AbsoluteFill>
  );
};

/* 6. Five months later, the same price; the weight lands on the oil companies */
const S6: React.FC<{ t: number }> = ({ t }) => {
  const a = B.frozen, same = W("frozen", "same"), gap = W("frozen", "gap");
  const c2 = prog(t, same - 0.3, 0.5, ease.outExpo);
  const drop = prog(t, gap - 0.1, 0.55, ease.inCubic);
  const squash = drop >= 1 ? 1 - 0.18 * Math.exp(-(t - gap - 0.45) * 5) : 1;
  const card = (x: number, d: string, o: number, rot: number) => (
    <div style={{ position: "absolute", left: x, top: 300, width: 400, padding: "26px 28px", background: "#fff", borderRadius: 6, boxShadow: "8px 12px 0 rgba(22,24,42,0.2)", opacity: o, transform: `rotate(${rot}deg) translateY(${(1 - o) * -60}px)` }}>
      <div style={lbl(DIM_D)}>{d}</div>
      <div style={{ ...sx(92, 800, INK_D), marginTop: 12 }}>₹95.20</div>
    </div>
  );
  return (
    <AbsoluteFill style={push(t, a, 1.04)}>
      <Collage t={t} a={-5} sun={0} grassY={1180}>
        {card(G, "25 MAY 2026", prog(t, a + 0.1, 0.45, ease.outExpo), -3)}
        {card(560, "23 OCT 2026", c2, 2.5)}
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", opacity: c2 }}><Pill text="FIVE MONTHS LATER · SAME PRICE" bg={INK_D} /></div>
        {/* the oil companies' block takes the weight */}
        <div style={{ position: "absolute", left: 140, top: 1180 - 210 * squash, width: 420, height: 210 * squash, background: PURP, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: prog(t, gap - 0.6, 0.3) }}>
          <span style={{ ...lbl("#fff", 24), textAlign: "center" }}>OIL MARKETING<br />COMPANIES</span>
        </div>
        <div style={{ position: "absolute", left: 350 - 140, top: lerp(-300, 1180 - 210 * squash - 280, drop), width: 280, height: 280, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", opacity: prog(t, gap - 0.4, 0.2) }}>
          <span style={sx(54, 800, INK_D)}>THE GAP</span>
        </div>
        <Anchor t={t} a={a + 1.0} b={B.estimates + 0.1} pose="think" x={850} bottom={1190} h={440} from="right" />
      </Collage>
    </AbsoluteFill>
  );
};

/* 7. Who's counting: two orbit dials, ICRA (Sep) vs Jefferies (22 Oct) */
const S7: React.FC<{ t: number }> = ({ t }) => {
  const a = B.estimates, icra = W("estimates", "ICRA"), jef = W("estimates", "Jefferies");
  const q = 1 - prog(t, icra - 0.4, 0.4, ease.inCubic);
  const d1 = prog(t, icra, 0.7, ease.outExpo), d2 = prog(t, jef, 0.7, ease.outExpo);
  const dial = (cx: number, r: number, p: number, c: string, who: string, when: string, v: string, n: number) => (
    <g opacity={p} transform={`translate(${cx} 800) scale(${lerp(0.6, 1, p)})`}>
      <circle r={r} fill="none" stroke={c} strokeWidth={3} />
      <circle r={r + 40} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={2} strokeDasharray="4 10" />
      {Array.from({ length: n }).map((_, k) => {
        const th = t * 0.6 + (k / n) * Math.PI * 2;
        return <circle key={k} cx={Math.cos(th) * (r + 40)} cy={Math.sin(th) * (r + 40)} r={9} fill={c} />;
      })}
      <text y={-r - 80} textAnchor="middle" fontFamily={mono} fontSize={22} letterSpacing="3" fill={INK}>{who}</text>
      <text y={20} textAnchor="middle" fontFamily={sans} fontWeight={800} fontSize={r * 0.62} letterSpacing="-3" fill={INK}>{v}</text>
      <text y={r * 0.62} textAnchor="middle" fontFamily={mono} fontSize={20} letterSpacing="2" fill={DIM}>{when}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ ...push(t, a), background: `radial-gradient(90% 60% at 50% 45%, #232464 0%, ${NAVYP} 70%)` }}>
      <div style={{ position: "absolute", left: G, right: G, top: 330, opacity: q }}>
        <Rise t={t} a={a + 0.1}><div style={sf(96)}>How big is</div></Rise>
        <Rise t={t} a={a + 0.4}><div style={sf(96, GOLD, true)}>that gap?</div></Rise>
        <div style={{ ...lbl(), marginTop: 40, opacity: prog(t, W("estimates", "depends"), 0.3) }}>DEPENDS WHO'S COUNTING</div>
      </div>
      <Window t={t} a={a + 0.5} b={icra - 0.1} pose="arms" x={700} y={800} w={250} h={290} zoom={1.15} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {dial(290, 130, d1, TEAL, "ICRA", "SEP 2026", "~₹9", 4)}
        {dial(740, 210, d2, MAG, "JEFFERIES", "22 OCT 2026", "₹34", 9)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, textAlign: "center", opacity: d2 }}>
        <Pill text="BOTH ESTIMATES · DIFFERENT DATES & METHODS" bg="rgba(245,241,234,0.14)" />
      </div>
    </AbsoluteFill>
  );
};

/* 8. Who pays: nested hexagons on the honeycomb panel */
const S8: React.FC<{ t: number }> = ({ t }) => {
  const a = B.who;
  const L = [
    { k: "COMPANY", w: W("who_pays", "company"), r: 400, c: PURP, tc: "#fff" },
    { k: "GOVERNMENT", w: W("who_pays", "government"), r: 280, c: TEAL, tc: INK_D },
    { k: "YOU", w: W("who_pays", "you"), r: 160, c: MAG, tc: "#fff" },
  ];
  const zoom = 1 + 0.06 * prog(t, a, B.payoff - a, ease.inOutCubic);
  return (
    <AbsoluteFill style={{ ...push(t, a), background: GOLD }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.25 }}>
        <defs><pattern id="hc" width="60" height="104" patternUnits="userSpaceOnUse"><polygon points={hexPts(30, 34, 30)} fill="none" stroke="#fff" strokeWidth={2} /><polygon points={hexPts(60, 86, 30)} fill="none" stroke="#fff" strokeWidth={2} /><polygon points={hexPts(0, 86, 30)} fill="none" stroke="#fff" strokeWidth={2} /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#hc)" />
      </svg>
      <div style={{ position: "absolute", left: G, right: G, top: 260 }}>
        <Rise t={t} a={a + 0.1}><div style={sf(68, INK_D)}>An oil shock always</div></Rise>
        <Rise t={t} a={W("who_pays", "paid") - 0.1}><div style={sf(68, INK_D, true)}>gets paid for</div></Rise>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "540px 860px" }}>
        {L.map((h, i) => {
          const p = prog(t, h.w - 0.15, 0.5, ease.outExpo);
          return (
            <g key={h.k} opacity={p} transform={`translate(540 880) rotate(${(1 - p) * -30}) scale(${lerp(0.7, 1, p)}) translate(-540 -880)`}>
              <polygon points={hexPts(540, 880, h.r)} fill={h.c} stroke={INK_D} strokeOpacity={0.25} strokeWidth={4} />
              <text x={540} y={i === 2 ? 892 : 880 - h.r * 0.866 + 62} textAnchor="middle" fontFamily={mono} fontWeight={700} fontSize={i === 2 ? 40 : 28} letterSpacing="4" fill={h.tc}>{h.k}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* 9. Right now: the companies. Next: crude. Bead ring (the board's final frame). */
const S9: React.FC<{ t: number }> = ({ t }) => {
  const a = B.payoff, nx = W("payoff", "What");
  const sw = prog(t, nx - 0.2, 0.4, ease.inOutCubic);
  const N = 28, cols = [GOLD, MAG, TEAL, "#3B3A8F"];
  return (
    <AbsoluteFill style={{ ...push(t, a), background: `radial-gradient(80% 55% at 50% 45%, #1F2058 0%, ${NAVYP} 75%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }).map((_, k) => {
          const p = prog(t, a + k * 0.03, 0.5, ease.outExpo);
          const th = (k / N) * Math.PI * 2 + t * 0.25;
          const r = lerp(700, 330, p);
          return <circle key={k} cx={540 + Math.cos(th) * r} cy={800 + Math.sin(th) * r} r={k % 3 === 0 ? 30 : 20} fill={cols[k % 4]} opacity={p} />;
        })}
        <circle cx={540} cy={800} r={250} fill={GOLD} opacity={sw} transform={`translate(540 800) scale(${lerp(0.2, 1, sw)}) translate(-540 -800)`} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: 1 - sw }}>
        <div style={lbl(INK, 24)}>RIGHT NOW</div>
        <div style={{ ...sf(80), marginTop: 18 }}>the companies</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 710, textAlign: "center", opacity: sw }}>
        <div style={lbl(INK_D, 24)}>WHAT'S NEXT DEPENDS ON</div>
        <div style={{ ...sf(104, INK_D, true), marginTop: 16 }}>crude</div>
      </div>
    </AbsoluteFill>
  );
};

/* 10. CTA: her presenter moment on the collage set, then the end card */
const S10: React.FC<{ t: number }> = ({ t }) => {
  const a = B.cta, endA = DURATION - 2.9;
  const end = prog(t, endA, 0.35);
  const out = prog(t, DURATION - 0.6, 0.6, ease.inCubic);
  return (
    <AbsoluteFill>
      <Collage t={t} a={a} sunX={720} grassY={1180}>
        <Anchor t={t} a={a} b={DURATION + 5} pose="stand" x={740} bottom={1250} h={1000} from="right" />
        <div style={{ position: "absolute", left: G, top: 300, width: 470 }}>
          <Rise t={t} a={W("cta", "Follow") - 0.1}><div style={sx(84, 900, INK_D)}>Follow AVRON</div></Rise>
          <Rise t={t} a={W("cta", "story") - 0.1} style={{ marginTop: 16 }}><div style={sf(58, INK_D)}>for the story</div></Rise>
          <Rise t={t} a={W("cta", "behind") - 0.1}><div style={sf(58, MAG, true)}>behind the</div></Rise>
          <Rise t={t} a={W("cta", "numbers") - 0.1}><div style={sf(58, MAG, true)}>numbers</div></Rise>
        </div>
      </Collage>
      <AbsoluteFill style={{ background: NIGHT, opacity: end }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...sx(120, 800), letterSpacing: "0.32em", paddingLeft: "0.32em",
          clipPath: `inset(0 ${100 - 100 * prog(t, endA + 0.1, 0.7, ease.outExpo)}% 0 0)` }}>AVRON</div>
        <div style={{ position: "absolute", left: G, right: G, top: 850, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, opacity: prog(t, endA + 0.4, 0.4) }}>
          <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>Education only · Not investment advice</div>
          <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>AVRON is not SEBI-registered</div>
          <div style={{ fontFamily: mono, fontSize: 21, color: GOLD }}>Anchor is an AI-generated character</div>
          <div style={{ fontFamily: mono, fontSize: 17, color: DIM, marginTop: 14, lineHeight: 1.55 }}>
            Sources · PPAC 23 Oct 2026 · AIR, ETV Bharat, Procurement Resource (May 2026) · Bloomberg via Rigzone 22 Oct · Jefferies via Business Today 23 Oct (estimate) · ICRA via Business Today 23 Sep (estimate)
          </div>
        </div>
        <AbsoluteFill style={{ background: "#000", opacity: out }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Graphics: React.FC = () => {
  const t = useTime();
  const cut34 = W("hook_loss", "34") - 0.1;
  return (
    <AbsoluteFill>
      {on(t, 0, B.hookLoss) && <S1 t={t} />}
      {on(t, B.hookLoss, cut34) && <S2a t={t} />}
      {on(t, cut34, B.brent) && <S2b t={t} />}
      {on(t, B.brent, B.freight) && <S3 t={t} />}
      {on(t, B.freight, B.may) && <S4 t={t} />}
      {on(t, B.may, B.frozen) && <S5 t={t} />}
      {on(t, B.frozen, B.estimates) && <S6 t={t} />}
      {on(t, B.estimates, B.who) && <S7 t={t} />}
      {on(t, B.who, B.payoff) && <S8 t={t} />}
      {on(t, B.payoff, B.cta) && <S9 t={t} />}
      {t >= B.cta && <S10 t={t} />}
    </AbsoluteFill>
  );
};

export const AnchorDemoV2: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: NIGHT, overflow: "hidden" }}>
      <SerifFont />
      <CameraMotionBlur shutterAngle={180} samples={6}>
        <Graphics />
      </CameraMotionBlur>
      <Grain t={t} o={0.08} />
      {/* caption band: the light sets (paper, comic, honeycomb) fade to ink under the captions */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1290, bottom: 0, background: `linear-gradient(180deg, transparent 0%, ${NIGHT}E6 22%, ${NIGHT} 100%)` }} />
      {t < B.cta && <Captions t={t} chunks={CAPTIONS} family={sans} size={52} y={1385} />}
      {t < DURATION - 2.9 && (
        <>
          <div style={{ position: "absolute", left: G - 14, top: 110, padding: "8px 14px", borderRadius: 999, background: "rgba(11,14,19,0.72)", ...sx(26, 800), letterSpacing: "0.42em" }}>AVRON</div>
          <div style={{ position: "absolute", right: G, top: 112, padding: "7px 14px", borderRadius: 999, background: "rgba(11,14,19,0.72)", ...lbl(INK, 17) }}>AI ANCHOR</div>
        </>
      )}
      <Audio src={staticFile("fuel-gap/mix.wav")} />
    </AbsoluteFill>
  );
};
