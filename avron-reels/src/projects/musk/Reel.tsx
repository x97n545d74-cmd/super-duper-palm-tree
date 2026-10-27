import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, staticFile } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { clamp01, ease, lerp, prog, rand, useTime } from "../../engine/anim";
import { Captions, CaptionWord, chunkWords } from "../../engine/components/Captions";
import { SerifFont, serif } from "../swiggy/look";
import TL from "../../../projects/2026-10-musk-spacex-kids/timeline.json";
import US from "./us_states.json";

/*
 * Musk SpaceX-kids reel (Hinglish, AI anchor). Structure follows the user's reference reel (split screen, number ladder,
 * ring gauge, "why" turn, debate question). Looks come from the user's references: phone notifications on a desk (Klickpin),
 * kinetic yellow type (Klickpin), blue grid glow, green tunnel, Pisa paper collage, comic burst, orbit squares and the bead
 * ring from the motion board. Prompts: Motion Graphic One (finance colour code, hook→data→twist→question, dark synth + whooshes)
 * and Two (one idea per shot, masked type, push cuts with motion blur). Facts: projects/2026-10-musk-spacex-kids/SCRIPT.md.
 */

type W = { w: string; s: number; e: number; tone?: string };
type Beat = { id: string; start: number; end: number; words: W[] };
const BEATS = (TL as { beats: Beat[] }).beats;
export const MUSK_DURATION = (TL as { duration: number }).duration + 2.6;
const B = (id: string) => BEATS.find((b) => b.id === id)!;
/** Output time of the n-th word in a beat that starts with `p` (case-insensitive). */
const at = (id: string, p: string, nth = 0) => {
  const hit = B(id).words.filter((w) => w.w.toLowerCase().startsWith(p.toLowerCase()))[nth];
  return hit ? hit.s : B(id).start;
};

const INK = "#F4F2EC";
const DIM = "rgba(244,242,236,0.58)";
const NIGHT = "#07090D";
const GREEN = "#3DDC84";
const GOLD = "#F2B83B";
const RED = "#E5484D";
const YELLOW = "#F5B82E";
const NAVY = "#141738";
const INK_D = "#16182A";
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";
const sx = (size: number, weight = 800, c = INK): React.CSSProperties => ({ fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1, color: c });
const sf = (size: number, c = INK, italic = false): React.CSSProperties => ({ fontFamily: serif, fontWeight: 700, fontStyle: italic ? "italic" : "normal", fontSize: size, letterSpacing: "-0.02em", lineHeight: 1.05, color: c });
const lbl = (c = DIM, size = 20): React.CSSProperties => ({ fontFamily: mono, fontWeight: 500, fontSize: size, letterSpacing: "0.14em", color: c });
const HALF = 960;

const Rise: React.FC<{ t: number; a: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, a, dur = 0.5, children, style }) => {
  const p = ease.outExpo(clamp01((t - a) / dur));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};
const push = (t: number, a: number, from = 1.07): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.5));
  return { transform: `scale(${lerp(from, 1, p)})`, opacity: clamp01((t - a) / 0.05) };
};
const Source: React.FC<{ t: number; a: number; text: string; top: number; est?: boolean }> = ({ t, a, text, top, est }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: prog(t, a, 0.4) }}>
    <span style={{ fontFamily: mono, fontSize: 17, letterSpacing: "0.06em", color: est ? "#FFB4B4" : DIM, padding: "6px 14px", borderRadius: 999,
      border: `1.5px solid ${est ? RED + "99" : "rgba(244,242,236,0.2)"}`, background: "rgba(7,9,13,0.7)" }}>{text}</span>
  </div>
);
const Pill: React.FC<{ text: string; bg?: string; c?: string; style?: React.CSSProperties }> = ({ text, bg = GREEN, c = NIGHT, style }) => (
  <span style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: bg, ...lbl(c, 19), ...style }}>{text}</span>
);

/* ------------------------------------------------------------------ backgrounds from the user's references */

/** Blue grid with a glow rising from the bottom (reference: black top, blue gradient grid). */
const BlueGrid: React.FC<{ t: number; h: number; tint?: string }> = ({ t, h, tint = "#1F2BBF" }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, overflow: "hidden", background: "#000" }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, #000 0%, #000 30%, ${tint}55 70%, ${tint}CC 100%)` }} />
    <div style={{ position: "absolute", inset: -60, backgroundImage: "linear-gradient(rgba(255,255,255,0.13) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
      backgroundSize: "60px 60px", transform: `translateY(${(t * 12) % 60}px)` }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #000 0%, transparent 35%)" }} />
  </div>
);

/** Green perspective tunnel (reference), lines moving toward camera. */
const GreenTunnel: React.FC<{ t: number; h: number }> = ({ t, h }) => {
  const mid = h / 2, gap = h * 0.32, N = 14;
  const rows = Array.from({ length: N }).map((_, i) => Math.max(0.35, N - ((i + t * 0.9) % N)));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, overflow: "hidden", background: "linear-gradient(180deg, #03241D, #0E6A55 50%, #03241D)" }}>
      <svg width={1080} height={h} style={{ position: "absolute", inset: 0 }}>
        {[1, -1].map((s) => {
          const y0 = mid + (s * gap) / 2, y1 = s > 0 ? h : 0;
          return (
            <g key={s}>
              {Array.from({ length: 19 }).map((_, k) => { const x = (k - 9) * 260; return <line key={k} x1={540 + x * 0.1} y1={y0} x2={540 + x * 1.5} y2={y1} stroke="#D9F27E" strokeOpacity={0.5} strokeWidth={1.6} />; })}
              {rows.map((d, k) => { const y = y0 + (s * 520) / d; return (s > 0 ? y > h : y < 0) ? null : <line key={k} x1={0} x2={1080} y1={y} y2={y} stroke="#D9F27E" strokeOpacity={clamp01(1.4 - d / N) * 0.7} strokeWidth={1.6} />; })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** Warm wooden desk with a phone lying on it (reference: Klickpin notifications). Fallback until the user's clip A arrives. */
const Desk: React.FC<{ t: number; h: number }> = ({ t, h }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: h, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #2A1D14 0%, #6B4126 38%, #8A5530 70%, #5A3520 100%)" }} />
    <div style={{ position: "absolute", inset: 0, opacity: 0.35, backgroundImage: "repeating-linear-gradient(92deg, rgba(0,0,0,0.25) 0 3px, transparent 3px 26px, rgba(255,220,180,0.10) 26px 29px, transparent 29px 61px)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * 0.32, background: "linear-gradient(180deg, rgba(10,8,6,0.95), rgba(10,8,6,0))", filter: "blur(2px)" }} />
    {/* phone, lying flat, slight drift */}
    <div style={{ position: "absolute", left: 540 - 210, top: h * 0.6, width: 420, height: 820, perspective: 1200, transform: `translateX(${Math.sin(t * 0.3) * 6}px)` }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 56, background: "linear-gradient(160deg, #1C1D21, #0B0C0E)", border: "6px solid #2A2B30",
        transform: "rotateX(62deg)", transformOrigin: "50% 0%", boxShadow: "0 60px 80px rgba(0,0,0,0.55)" }}>
        <div style={{ margin: 18, height: 760, borderRadius: 40, background: "radial-gradient(80% 60% at 50% 20%, #23283A, #0D0F16)" }} />
      </div>
    </div>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 70% at 50% 60%, transparent 40%, rgba(0,0,0,0.55) 100%)" }} />
  </div>
);

/** Glass notification bubble. */
const Notif: React.FC<{ t: number; a: number; y: number; app: string; title: string; body: string; icon: string; out?: number }> = ({ t, a, y, app, title, body, icon, out }) => {
  const p = ease.outExpo(clamp01((t - a) / 0.55));
  const o = out ? 1 - prog(t, out, 0.3) : 1;
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: y, opacity: p * o, transform: `translateY(${(1 - p) * 60}px) scale(${lerp(0.92, 1, p)})`,
      padding: "20px 24px", borderRadius: 30, background: "rgba(245,243,238,0.86)", backdropFilter: "blur(14px)", boxShadow: "0 24px 50px rgba(0,0,0,0.35)", display: "flex", gap: 18, alignItems: "flex-start" }}>
      <div style={{ width: 58, height: 58, borderRadius: 14, background: INK_D, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...sx(30, 800, "#fff"), flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ ...sx(24, 700, INK_D), letterSpacing: "-0.01em" }}>{title}</span>
          <span style={{ ...lbl("rgba(22,24,42,0.5)", 16), letterSpacing: "0.04em" }}>{app}</span>
        </div>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 25, lineHeight: 1.3, color: INK_D, marginTop: 6 }}>{body}</div>
      </div>
    </div>
  );
};

/* ================================================================== beats */

/* b1: Musk's X post lands on the phone (split, top) */
const B1: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b1_hook");
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", ...push(t, start, 1.04) }}>
      <Desk t={t} h={HALF} />
      <Notif t={t} a={at("b1_hook", "announce") - 0.1} y={250} app="X · now" title="Elon Musk" icon="𝕏" body="Next year, I will give one of my SpaceX shares to every kid in America." />
      <Notif t={t} a={at("b1_hook", "SpaceX") - 0.2} y={470} app="X · now" title="Elon Musk" icon="𝕏" body="This will be the first of many." />
      <Source t={t} a={start + 0.6} text="MUSK ON X · 19 OCT 2026" top={880} />
    </div>
  );
};

/* b2: map of the US fills up, counter to 72,000,000+ (full) */
const B2: React.FC<{ t: number }> = ({ t }) => {
  const { start, end } = B("b2_kids");
  const states = (US as { states: { id: string; d: string; c: number[] }[] }).states;
  const fill = prog(t, start + 0.1, end - start - 0.2, ease.inOutCubic);
  const n = Math.round(lerp(0, 72000000, fill));
  const sc = 1000 / 975;
  return (
    <AbsoluteFill style={push(t, start)}>
      <BlueGrid t={t} h={1920} />
      <svg width={1000} height={610 * sc} viewBox="0 0 975 610" style={{ position: "absolute", left: 40, top: 520 }}>
        {states.map((s, i) => {
          const on = clamp01((fill * states.length - rand(i + 3) * states.length * 0.9) / 3);
          return <path key={s.id} d={s.d} fill={on > 0 ? `rgba(61,220,132,${0.15 + 0.45 * on})` : "rgba(255,255,255,0.04)"} stroke="rgba(244,242,236,0.55)" strokeWidth={0.8} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center" }}>
        <div style={{ ...sx(150, 800), fontVariantNumeric: "tabular-nums" }}>{(fill >= 0.98 ? 72000000 : n).toLocaleString("en-US")}{fill >= 0.98 ? "+" : ""}</div>
        <div style={{ ...sf(54, GREEN, true), marginTop: 10 }}>bachche</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", ...lbl(INK, 22) }}>AMERICA · UNDER 18</div>
      <Source t={t} a={start + 0.3} text="~72M · US CENSUS BUREAU DATA (VIA MONEYWISE)" top={1560} />
    </AbsoluteFill>
  );
};

/* b3: share price card (full): only the two real closes we have */
const B3: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b3_price");
  const p = prog(t, at("b3_price", "$147") - 0.3, 0.9, ease.outExpo);
  const line = prog(t, start + 0.5, 1.2, ease.inOutCubic);
  const per = prog(t, at("b3_price", "Yaani") - 0.1, 0.5, ease.outExpo);
  const X0 = 180, X1 = 900, Y0 = 1060, Y1 = 900;
  return (
    <AbsoluteFill style={push(t, start)}>
      <BlueGrid t={t} h={1920} />
      <div style={{ position: "absolute", left: 90, top: 380 }}>
        <div style={lbl(INK, 22)}>SPACEX · SHARE PRICE · CLOSE</div>
        <div style={{ ...sx(190, 800), marginTop: 22, fontVariantNumeric: "tabular-nums" }}>${lerp(146, 147.49, p).toFixed(2)}</div>
        <div style={{ ...lbl(GREEN, 22), marginTop: 14 }}>23 OCT 2026</div>
      </div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} y1={Y0} x2={lerp(X0, X1, line)} y2={lerp(Y0, Y1, line)} stroke={GREEN} strokeWidth={6} strokeLinecap="round" />
        <circle cx={X0} cy={Y0} r={10} fill={INK} />
        <circle cx={X1} cy={Y1} r={14 * line} fill={GREEN} />
        <text x={X0} y={Y0 + 50} textAnchor="middle" fontFamily={mono} fontSize={20} fill={DIM}>16 OCT · $146</text>
        <text x={X1} y={Y1 - 30} textAnchor="end" fontFamily={mono} fontSize={20} fill={INK} opacity={line}>23 OCT · $147.49</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1220, textAlign: "center", opacity: per, transform: `translateY(${(1 - per) * 30}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22, padding: "20px 34px", borderRadius: 24, border: `2px solid ${GREEN}66`, background: "rgba(61,220,132,0.08)" }}>
          <span style={sf(52, INK, true)}>1 bachcha</span><span style={sx(46, 700, DIM)}>=</span><span style={sx(56, 800, GREEN)}>~$147</span>
        </div>
      </div>
      <Source t={t} a={start + 0.4} text="FOX NEWS (23 OCT CLOSE) · MONEYWISE (16 OCT CLOSE)" top={1560} />
    </AbsoluteFill>
  );
};

/* b4: number ladder over the swing, then the ₹ figure bursts in a comic cloud (full) */
const B4: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b4_total");
  const rs = at("b4_total", "₹1") - 0.12;
  const swing = Math.sin((t - start) * 2.1) * 16;
  const lines = [
    { a: start + 0.1, big: "$147", small: "/share" },
    { a: at("b4_total", "72") - 0.1, big: "72", small: "million bachche" },
    { a: at("b4_total", "$10.6") - 0.1, big: "$10.6", small: "billion" },
  ];
  const pop = ease.outExpo(clamp01((t - rs) / 0.45));
  const spikes = Array.from({ length: 22 }).map((_, i) => {
    const th = (i / 22) * Math.PI * 2, w = 0.05 + (i % 3) * 0.02;
    const pt = (r: number, d: number) => `${540 + Math.cos(th + d) * r},${900 + Math.sin(th + d) * r}`;
    return `M ${pt(380, 0)} L ${pt(1600, -w)} L ${pt(1600, w)} Z`;
  });
  const cloud = [[0, 0, 280], [-220, 40, 190], [220, 40, 195], [-130, -150, 180], [140, -160, 190], [-290, -60, 130], [300, -50, 135], [0, 180, 190]];
  return (
    <AbsoluteFill style={push(t, start)}>
      {t < rs ? (
        <AbsoluteFill style={{ background: "#111" }}>
          {/* black-and-white swing (fallback until clip B): rope, seat, child silhouette */}
          <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 35% 45%, #5A5A5A 0%, #262626 70%, #111 100%)", filter: "grayscale(1)" }} />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <rect x={60} y={160} width={760} height={40} fill="#2E2E2E" />
            <g transform={`rotate(${swing} 380 200)`}>
              <line x1={300} y1={200} x2={300} y2={1060} stroke="#8A8A8A" strokeWidth={6} />
              <line x1={460} y1={200} x2={460} y2={1060} stroke="#8A8A8A" strokeWidth={6} />
              <rect x={270} y={1050} width={220} height={26} rx={6} fill="#6A5A4A" />
              <circle cx={380} cy={890} r={62} fill="#9A9A9A" />
              <path d="M 330 950 Q 380 930 430 950 L 445 1060 L 315 1060 Z" fill="#7FA6C9" />
              <path d="M 330 1060 L 300 1180 M 430 1060 L 470 1170" stroke="#9A9A9A" strokeWidth={24} strokeLinecap="round" />
            </g>
          </svg>
          <div style={{ position: "absolute", left: 600, top: 520, display: "flex", flexDirection: "column", gap: 26 }}>
            {lines.map((l) => {
              const p = ease.outExpo(clamp01((t - l.a) / 0.5));
              return (
                <div key={l.big} style={{ opacity: p, transform: `translateX(${(1 - p) * 40}px)`, borderBottom: "2px solid rgba(255,255,255,0.35)", paddingBottom: 14 }}>
                  <span style={sx(92, 800)}>{l.big}</span><span style={{ ...sx(34, 600, DIM), marginLeft: 10 }}>{l.small}</span>
                </div>
              );
            })}
          </div>
          <Source t={t} a={at("b4_total", "$10.6")} text="TOTAL ≈ $10.5–10.6B · MONEYWISE, FOX NEWS" top={1560} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "#F7DD6A", backgroundImage: "radial-gradient(rgba(240,138,43,0.35) 3px, transparent 3.5px)", backgroundSize: "26px 26px" }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <g transform={`rotate(${(t - rs) * 6} 540 900)`}>{spikes.map((d, i) => <path key={i} d={d} fill="#F08A2B" opacity={0.9} />)}</g>
            <g transform={`translate(540 900) scale(${lerp(0.2, 1, pop)})`}>{cloud.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" />)}</g>
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", transform: `scale(${lerp(0.5, 1, pop)})` }}>
            <div style={sx(150, 900, INK_D)}>₹1 lakh</div>
            <div style={{ ...sx(150, 900, INK_D), marginTop: 4 }}>crore</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", opacity: prog(t, rs + 0.3, 0.3) }}>
            <Pill text="APPROX · AT ₹90–95 PER $ (2026)" bg={INK_D} c="#fff" />
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/* b5: net-worth ring with orbiting squares (split, top) */
const B5: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b5_networth");
  const ring = prog(t, start + 0.2, 0.9, ease.outExpo);
  const slice = prog(t, at("b5_networth", "sirf") - 0.2, 0.8, ease.outCubic);
  const cx = 540, cy = 470, R = 250, C = 2 * Math.PI * R, frac = 0.0117;
  const tip = -Math.PI / 2 + frac * 2 * Math.PI * slice;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", background: `radial-gradient(80% 70% at 50% 45%, #1C2150, ${NAVY} 60%, #0A0C1C)`, ...push(t, start) }}>
      <svg width={1080} height={HALF} style={{ position: "absolute", inset: 0 }}>
        {[{ r: 340, n: 3, sp: 0.4 }, { r: 410, n: 2, sp: -0.3 }].map((g, i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={g.r} fill="none" stroke="#7FA2E0" strokeOpacity={0.35} strokeWidth={1.5} />
            {Array.from({ length: g.n }).map((_, k) => {
              const th = t * g.sp + (k / g.n) * Math.PI * 2 + i;
              const x = cx + Math.cos(th) * g.r, y = cy + Math.sin(th) * g.r;
              return <rect key={k} x={x - 9} y={y - 9} width={18} height={18} fill="#fff" transform={`rotate(${(th * 180) / Math.PI} ${x} ${y})`} />;
            })}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(244,242,236,0.16)" strokeWidth={30} strokeDasharray={`${C * ring} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={GREEN} strokeWidth={30} strokeDasharray={`${C * frac * slice} ${C}`} transform={`rotate(-90 ${cx} ${cy})`} />
        {slice > 0.05 && <line x1={cx + Math.cos(tip) * (R - 40)} y1={cy + Math.sin(tip) * (R - 40)} x2={cx + Math.cos(tip) * (R + 70)} y2={cy + Math.sin(tip) * (R + 70)} stroke={GREEN} strokeWidth={4} />}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - 70, textAlign: "center", opacity: ring }}>
        <div style={sx(110, 800)}>$904B</div>
        <div style={{ ...lbl(DIM, 18), marginTop: 12 }}>MUSK NET WORTH</div>
      </div>
      <div style={{ position: "absolute", right: 70, top: 200, textAlign: "right", opacity: slice }}>
        <div style={sx(64, 800, GREEN)}>≈1.2%</div>
        <div style={{ ...lbl(INK, 17), marginTop: 6 }}>= THE $10.6B GIFT</div>
      </div>
      <Source t={t} a={start + 0.4} text="NET WORTH: BLOOMBERG VIA MONEYWISE · % = AVRON MATH" top={870} />
    </div>
  );
};

/* b6: paper collage, one share block is lifted off Musk's stack (split, top) */
const B6: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b6_cash");
  const lift = prog(t, at("b6_cash", "shares") - 0.3, 1.0, ease.inOutCubic);
  const stamp = prog(t, at("b6_cash", "cash") - 0.05, 0.35, ease.outExpo);
  const sun = prog(t, start, 1.0, ease.outExpo);
  const blocks = 9;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", background: "#EFEBE1",
      backgroundImage: "linear-gradient(rgba(22,24,42,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(22,24,42,0.10) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px", ...push(t, start, 1.03) }}>
      <div style={{ position: "absolute", left: 560 - 250, top: 760 - 250 + (1 - sun) * 260, width: 500, height: 500, borderRadius: "50%", background: GOLD }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, bottom: 0, background: "#127A5C" }} />
      {Array.from({ length: blocks }).map((_, i) => {
        const top = i === blocks - 1;
        const y = 760 - (i + 1) * 62 - (top ? lift * 230 : 0);
        const x = 480 + (top ? lift * 220 : 0);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: 200, height: 56, background: top ? GREEN : INK_D, borderRadius: 4,
            boxShadow: "6px 8px 0 rgba(22,24,42,0.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${top ? lift * 8 : (i % 2 ? 1 : -1) * 0.8}deg)` }}>
            <span style={lbl(top ? INK_D : "rgba(255,255,255,0.75)", 16)}>SPACEX SHARE</span>
          </div>
        );
      })}
      {/* the pendulum pin line lifting the top block (kinetic-type reference) */}
      <div style={{ position: "absolute", left: 480 + lift * 220 + 99, top: 0, width: 2, height: Math.max(0, 760 - 9 * 62 - lift * 230), background: INK_D, opacity: lift > 0 ? 1 : 0 }} />
      <div style={{ position: "absolute", left: 70, top: 210, transform: `rotate(-8deg) scale(${lerp(1.6, 1, stamp)})`, opacity: stamp, padding: "12px 24px", border: `5px solid ${RED}`, borderRadius: 8, ...sx(52, 900, RED) }}>CASH ✕</div>
      <div style={{ position: "absolute", left: 70, top: 350, opacity: lift }}>
        <div style={sf(56, INK_D, true)}>apne shares</div>
        <div style={{ ...lbl("rgba(22,24,42,0.6)", 18), marginTop: 10 }}>1 SHARE PER BACHCHA</div>
      </div>
    </div>
  );
};

/* b7: Trump Accounts notifications stack, then a red stamp (split, top) */
const B7: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b7_trump");
  const stamp = prog(t, at("b7_trump", "Plan") - 0.05, 0.35, ease.outExpo);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", ...push(t, start, 1.04) }}>
      <Desk t={t} h={HALF} />
      <Notif t={t} a={at("b7_trump", "Trump") - 0.15} y={210} app="US Treasury" title="Trump Account" icon="$" body="Bachchon ke liye naya sarkari investment account" />
      <Notif t={t} a={at("b7_trump", "bachchon") - 0.1} y={400} app="now" title="+1 SpaceX share" icon="1" body="Shayad isi raste se aayega" />
      <Notif t={t} a={at("b7_trump", "Accounts", 1) - 0.1} y={590} app="pending" title="Plan details" icon="?" body="Eligibility aur process abhi announce nahi" />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", justifyContent: "center", opacity: stamp }}>
        <div style={{ transform: `rotate(-8deg) scale(${lerp(1.6, 1, stamp)})`, padding: "16px 30px", border: `6px solid ${RED}`, borderRadius: 10, background: "rgba(255,255,255,0.85)", ...sx(66, 900, RED) }}>PLAN FINAL NAHI</div>
      </div>
      <Source t={t} a={start + 0.5} text="MONEYWISE · FOX NEWS · YAHOO FINANCE" top={880} />
    </div>
  );
};

/* b8: "KYUN?" on a pendulum line, then stacked (full, yellow kinetic type) */
const B8: React.FC<{ t: number }> = ({ t }) => {
  const { start, end } = B("b8_why");
  const k = at("b8_why", "kyun") - 0.15;
  const drop = ease.outBack(clamp01((t - start) / 0.5));
  const swing = Math.sin((t - start) * 5) * 9 * Math.exp(-(t - start) * 1.4);
  const stack = prog(t, k, 0.6, ease.outExpo);
  return (
    <AbsoluteFill style={{ background: YELLOW, ...push(t, start, 1.05) }}>
      {stack < 1 && (
        <div style={{ position: "absolute", left: 540, top: 0, transformOrigin: "0 0", transform: `rotate(${swing}deg)` }}>
          <div style={{ position: "absolute", left: -1, top: 0, width: 3, height: lerp(200, 780, drop), background: INK_D }} />
          <div style={{ position: "absolute", left: -12, top: lerp(200, 780, drop) - 12, width: 24, height: 24, borderRadius: 12, background: INK_D }} />
          <div style={{ position: "absolute", left: -400, top: lerp(200, 780, drop) + 30, width: 800, textAlign: "center", ...sx(190, 900, "#fff"), opacity: 1 - stack }}>KYUN?</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", opacity: stack }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ ...sx(120, 900, i === 4 ? INK_D : "#fff"), lineHeight: 1.0, filter: i === 4 ? undefined : `blur(${Math.abs(i - 4) * 0.6 * (1 - prog(t, end - 0.6, 0.5))}px)`,
            transform: `translateY(${(1 - stack) * (i - 4) * -60}px)` }}>KYUN?</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* b9: AI + robots over the blue grid; a geometric robot arm (full) */
const B9: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b9_ai");
  const a1 = Math.sin((t - start) * 1.3) * 18 - 30, a2 = Math.sin((t - start) * 1.7 + 1) * 25 + 50;
  const title = prog(t, at("b9_ai", "AI") - 0.2, 0.5, ease.outExpo);
  const L1 = 300, L2 = 240, bx = 540, by = 1380;
  const j1 = [bx + Math.cos(((a1 - 90) * Math.PI) / 180) * L1, by + Math.sin(((a1 - 90) * Math.PI) / 180) * L1];
  const j2 = [j1[0] + Math.cos(((a1 + a2 - 90) * Math.PI) / 180) * L2, j1[1] + Math.sin(((a1 + a2 - 90) * Math.PI) / 180) * L2];
  return (
    <AbsoluteFill style={push(t, start)}>
      <BlueGrid t={t} h={1920} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={bx - 110} y={by} width={220} height={60} rx={10} fill="#C9D2FF" opacity={0.9} />
        <line x1={bx} y1={by} x2={j1[0]} y2={j1[1]} stroke="#E8ECFF" strokeWidth={46} strokeLinecap="round" />
        <line x1={j1[0]} y1={j1[1]} x2={j2[0]} y2={j2[1]} stroke="#E8ECFF" strokeWidth={34} strokeLinecap="round" />
        <circle cx={bx} cy={by} r={34} fill="#5B6BFF" />
        <circle cx={j1[0]} cy={j1[1]} r={28} fill="#5B6BFF" />
        <circle cx={j2[0]} cy={j2[1]} r={22} fill={GREEN} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 30}px)` }}>
        <div style={sx(140, 900)}>AI + ROBOTS</div>
        <div style={{ ...sf(58, GREEN, true), marginTop: 18 }}>zyada-tar kaam?</div>
      </div>
      <Source t={t} a={start + 0.6} text="MUSK'S VIEW · NOT A FORECAST" top={1560} est />
    </AbsoluteFill>
  );
};

/* b10: salary vs shares in the green tunnel (split, top) */
const B10: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b10_salary");
  const q = prog(t, at("b10_salary", "kamai") - 0.2, 1.4, ease.inOutCubic);
  const ans = prog(t, at("b10_salary", "Ek") - 0.1, 1.2, ease.inOutCubic);
  const bar = (label: string, v: number, c: string, x: number) => (
    <div style={{ position: "absolute", left: x, bottom: 140, width: 220, textAlign: "center" }}>
      <div style={{ height: 520 * v, background: c, borderRadius: 10, boxShadow: "0 0 0 3px rgba(0,0,0,0.25)" }} />
      <div style={{ ...lbl(INK, 24), marginTop: 18 }}>{label}</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", ...push(t, start) }}>
      <GreenTunnel t={t} h={HALF} />
      {bar("SALARY", lerp(0.85, 0.35, q), INK, 230)}
      {bar("SHARES", lerp(0.25, 0.85, ans), GREEN, 630)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", ...sf(52, INK, true) }}>kamai kahan se?</div>
    </div>
  );
};

/* b11: bead ring around the question, comment pill (split, top) */
const B11: React.FC<{ t: number }> = ({ t }) => {
  const { start } = B("b11_cta");
  const pill = prog(t, at("b11_cta", "Comment") - 0.1, 0.45, ease.outExpo);
  const cols = [GOLD, "#D23A73", "#72D6C9", "#3B3A8F"];
  const N = 26;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: HALF, overflow: "hidden", background: `radial-gradient(80% 60% at 50% 50%, #1F2058, ${NAVY} 75%)`, ...push(t, start) }}>
      <svg width={1080} height={HALF} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: N }).map((_, k) => {
          const p = prog(t, start + k * 0.03, 0.5, ease.outExpo);
          const th = (k / N) * Math.PI * 2 + t * 0.25, r = lerp(600, 330, p);
          return <circle key={k} cx={540 + Math.cos(th) * r} cy={470 + Math.sin(th) * r} r={k % 3 === 0 ? 26 : 17} fill={cols[k % 4]} opacity={p} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <Rise t={t} a={at("b11_cta", "salary") - 0.1}><div style={sx(84, 900)}>SALARY</div></Rise>
        <div style={{ ...sf(48, GOLD, true), margin: "8px 0", opacity: prog(t, at("b11_cta", "ya") - 0.1, 0.3) }}>ya</div>
        <Rise t={t} a={at("b11_cta", "shares") - 0.1}><div style={sx(84, 900, GREEN)}>SHARES?</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", opacity: pill, transform: `translateY(${(1 - pill) * 20}px)` }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 28px", borderRadius: 999, background: INK }}>
          <svg width={28} height={28} viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke={INK_D} strokeWidth={2.2} strokeLinejoin="round" /></svg>
          <span style={sx(36, 800, INK_D)}>Comment karo</span>
        </span>
      </div>
    </div>
  );
};

/* end card */
const End: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const out = prog(t, MUSK_DURATION - 0.6, 0.6, ease.inCubic);
  return (
    <AbsoluteFill style={{ background: NIGHT, opacity: prog(t, a, 0.25) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 680, textAlign: "center", ...sx(120, 800), letterSpacing: "0.32em", paddingLeft: "0.32em",
        clipPath: `inset(0 ${100 - 100 * prog(t, a + 0.1, 0.7, ease.outExpo)}% 0 0)` }}>AVRON</div>
      <div style={{ position: "absolute", left: 84, right: 84, top: 890, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, opacity: prog(t, a + 0.4, 0.4) }}>
        <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>Education only · Not investment advice</div>
        <div style={{ fontFamily: mono, fontSize: 24, color: INK }}>AVRON is not SEBI-registered</div>
        <div style={{ fontFamily: mono, fontSize: 21, color: GOLD }}>Anchor is an AI-generated character</div>
        <div style={{ fontFamily: mono, fontSize: 17, color: DIM, marginTop: 14, lineHeight: 1.55 }}>
          Sources · Musk on X (19 Oct 2026) · Moneywise via Yahoo Finance · Fox News · Yahoo Finance · Map: US Census Bureau (us-atlas)
        </div>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: out }} />
    </AbsoluteFill>
  );
};

const SPLIT = new Set(["b1_hook", "b5_networth", "b6_cash", "b7_trump", "b10_salary", "b11_cta"]);
const WORDS: CaptionWord[] = BEATS.flatMap((b) => b.words.map((w) => ({ w: w.w.replace(/[.]+$/, ""), s: w.s, e: w.e, tone: w.tone ?? null })));
const CAPS = chunkWords(WORDS, 3);
const END_A = (TL as { duration: number }).duration + 0.1;
const beatAt = (t: number) => BEATS.find((b) => t >= b.start && t < b.end + 0.04);

const Graphics: React.FC = () => {
  const t = useTime();
  const id = beatAt(t)?.id;
  return (
    <AbsoluteFill style={{ background: NIGHT }}>
      {id === "b1_hook" && <B1 t={t} />}
      {id === "b2_kids" && <B2 t={t} />}
      {id === "b3_price" && <B3 t={t} />}
      {id === "b4_total" && <B4 t={t} />}
      {id === "b5_networth" && <B5 t={t} />}
      {id === "b6_cash" && <B6 t={t} />}
      {id === "b7_trump" && <B7 t={t} />}
      {id === "b8_why" && <B8 t={t} />}
      {id === "b9_ai" && <B9 t={t} />}
      {id === "b10_salary" && <B10 t={t} />}
      {id === "b11_cta" && <B11 t={t} />}
    </AbsoluteFill>
  );
};

export const MuskReel: React.FC = () => {
  const t = useTime();
  const cur = beatAt(t);
  const split = !!cur && SPLIT.has(cur.id);
  const ended = t >= END_A;
  return (
    <AbsoluteFill style={{ background: NIGHT, overflow: "hidden" }}>
      <SerifFont />
      <CameraMotionBlur shutterAngle={180} samples={5}>
        <Graphics />
      </CameraMotionBlur>
      {/* the anchor: one continuous lip-synced take, shown in the bottom half on split beats */}
      <div style={{ position: "absolute", left: 0, top: HALF, width: 1080, height: 1920 - HALF, overflow: "hidden", opacity: split && !ended ? 1 : 0 }}>
        <OffthreadVideo src={staticFile("musk/anchor.mov")} muted style={{ position: "absolute", left: 0, top: -30, width: 1080, height: 1920 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, transparent 18%, transparent 70%, rgba(0,0,0,0.35) 100%)" }} />
      </div>
      {split && !ended && <div style={{ position: "absolute", left: 0, right: 0, top: HALF - 2, height: 4, background: INK }} />}
      {!ended && <Captions t={t} chunks={CAPS} family={sans} size={52} y={split ? HALF - 34 : 1460} />}
      {!ended && (
        <>
          <div style={{ position: "absolute", left: 70, top: 110, padding: "8px 14px", borderRadius: 999, background: "rgba(7,9,13,0.72)", ...sx(26, 800), letterSpacing: "0.42em" }}>AVRON</div>
        </>
      )}
      {ended && <End t={t} a={END_A} />}
      <Audio src={staticFile("musk/mix.wav")} />
    </AbsoluteFill>
  );
};
