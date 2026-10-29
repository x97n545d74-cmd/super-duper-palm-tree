import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Palantir reel 1 (2026-10-29). Look from library prompt #10, chosen by the user for this reel:
 * black #0A0A0A, Anton, yellow #FFD60A highlight. Shot times follow Adam's VO (projects/2026-10-palantir/vo).
 */

export const PALANTIR_DURATION = 38.6;

const BG = "#0A0A0A";
const YEL = "#FFD60A";
const RED = "#FF453A";
const GRN = "#32D74B";
const DIM = "#8A8A8A";
const ANTON = "'AVRON Anton', Impact, sans-serif";
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', monospace";
const ease = Easing.bezier(0.7, 0, 0.2, 1);

const useAnton = () => {
  const [handle] = useState(() => delayRender("anton"));
  useEffect(() => {
    const f = new FontFace("AVRON Anton", `url(${staticFile("fonts/Anton-Regular.ttf")})`);
    f.load().then((l) => {
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(l);
      continueRender(handle);
    });
  }, [handle]);
};

// [start, end] in seconds for every shot
const S = {
  hook1: [0, 1.5], hook2: [1.5, 3.4], y24: [3.4, 5.4], doc24: [5.4, 7.9], doc25: [7.9, 9.2], count: [9.2, 11.5],
  icons: [11.5, 13.2], radar: [13.2, 15.0], target: [15.0, 16.9], users: [16.9, 18.0], flash: [18.0, 18.6],
  seat: [18.6, 19.3], usd: [19.3, 22.3], inr: [22.3, 24.5], rockets: [24.5, 26.6], profit: [26.6, 27.7],
  lmt: [27.7, 31.0], pltr: [31.0, 32.5], save: [32.5, 35.1], loop: [35.1, PALANTIR_DURATION],
} as const;
type Key = keyof typeof S;

/** Local time (s) inside a shot, or null when the shot is off screen. */
const useShot = (k: Key) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const [a, b] = S[k];
  return t >= a && t < b ? t - a : null;
};

const slam = (t: number, delay = 0) => {
  const x = interpolate(t - delay, [0, 0.22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { opacity: x, transform: `scale(${1.18 - 0.18 * x})` };
};
const rise = (t: number, delay = 0) => {
  const x = interpolate(t - delay, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return { opacity: x, transform: `translateY(${(1 - x) * 40}px)` };
};

const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 190, color = "#fff", style }) => (
  <div style={{ fontFamily: ANTON, fontSize: size, lineHeight: 0.95, color, textTransform: "uppercase", textAlign: "center", letterSpacing: 1, ...style }}>{children}</div>
);
const Small: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = DIM, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 30, color, letterSpacing: 2, textTransform: "uppercase", textAlign: "center", ...style }}>{children}</div>
);
const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 30 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap, padding: "0 70px" }}>{children}</AbsoluteFill>
);
const Source: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", bottom: 150, left: 0, right: 0, fontFamily: MONO, fontSize: 27, color: "#808080", textAlign: "center", letterSpacing: 1, padding: "0 60px" }}>{text}</div>
);

// ---------- shots ----------

const Hook1 = () => {
  const t = useShot("hook1"); if (t === null) return null;
  return <Center><div style={slam(t)}><Big size={210}>One<br />software<br />deal</Big></div></Center>;
};
const Hook2 = () => {
  const t = useShot("hook2"); if (t === null) return null;
  return <Center><div style={slam(t)}><Big size={230} color={YEL}>Almost<br />triple?</Big></div><div style={rise(t, 0.5)}><Small color="#fff" style={{ fontSize: 40 }}>in one year</Small></div></Center>;
};
const Year24 = () => {
  const t = useShot("y24"); if (t === null) return null;
  return <Center><div style={slam(t)}><Big size={330}>2024</Big></div><div style={rise(t, 0.6)}><Small color="#fff" style={{ fontSize: 40 }}>US Army · Maven contract</Small></div></Center>;
};

/** A document card that lists the fields of a DoD contract notice; the money line gets a yellow highlighter swipe. */
const Doc: React.FC<{ t: number; date: string; rows: [string, string][]; hi: number; hiAt: number }> = ({ t, date, rows, hi, hiAt }) => {
  const sw = interpolate(t, [hiAt, hiAt + 0.35], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const zoom = interpolate(t, [0, 2.5], [1, 1.06], { extrapolateRight: "clamp" });
  return (
    <Center>
      <div style={{ ...rise(t), width: 960, background: "#F2F0EA", color: "#111", padding: "50px 54px", fontFamily: MONO, boxShadow: "0 40px 80px rgba(0,0,0,.6)", transform: `${rise(t).transform} scale(${zoom})` }}>
        <div style={{ fontSize: 24, letterSpacing: 2, color: "#555" }}>U.S. DEPARTMENT OF DEFENSE · CONTRACTS</div>
        <div style={{ fontSize: 24, letterSpacing: 2, color: "#555", marginBottom: 30 }}>{date} · ARMY</div>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", gap: 20, fontSize: 35, padding: "12px 0", borderTop: "1px solid #CFCBC0", position: "relative" }}>
            <div style={{ width: 270, color: "#666", flexShrink: 0 }}>{k}</div>
            <div style={{ position: "relative", fontWeight: 700 }}>
              {i === hi && <div style={{ position: "absolute", left: -8, right: -8, top: 2, bottom: 2, background: YEL, transformOrigin: "left", transform: `scaleX(${sw / 100})` }} />}
              <span style={{ position: "relative" }}>{v}</span>
            </div>
          </div>
        ))}
      </div>
    </Center>
  );
};
const Doc24 = () => {
  const t = useShot("doc24"); if (t === null) return null;
  return (<>
    <Doc t={t} date="29 MAY 2024" hi={1} hiAt={0.85} rows={[["Contractor", "Palantir USG Inc."], ["Value", "$480,000,000"], ["For", "Maven Smart System"], ["Contract", "W911QX-24-D-0012"], ["Ends", "28 May 2029"]]} />
    <Source text="Fields from the DoD contract notice, 29 May 2024" />
  </>);
};
const Doc25 = () => {
  const t = useShot("doc25"); if (t === null) return null;
  return (<>
    <Doc t={t} date="MAY 2025 · MODIFICATION" hi={1} hiAt={0.35} rows={[["Contractor", "Palantir USG Inc."], ["Added", "+$795,000,000"], ["For", "Maven software licences"], ["New ceiling", "≈ $1,275,000,000"], ["Ends", "28 May 2029"]]} />
    <Source text="DoD contract modification, May 2025" />
  </>);
};
const Count = () => {
  const t = useShot("count"); if (t === null) return null;
  const v = interpolate(t, [0.1, 1.1], [480, 1280], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const label = v < 1000 ? `$${Math.round(v)}M` : `$${(v / 1000).toFixed(2)}B`;
  return (<>
    <Center gap={40}>
      <Small style={{ ...rise(t), fontSize: 36 }}>Maven contract ceiling</Small>
      <Big size={270} color={YEL}>{label}</Big>
      <div style={{ ...slam(t, 1.25), fontFamily: ANTON, fontSize: 90, color: BG, background: YEL, padding: "6px 34px" }}>2.7x</div>
    </Center>
    <Source text="$480M (2024) → ≈$1.275B (2025). Ceiling, not money paid" />
  </>);
};

const Sat: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={200 * s} height={200 * s} viewBox="0 0 100 100"><g fill="none" stroke="#fff" strokeWidth={3}><rect x="40" y="40" width="20" height="20" /><rect x="8" y="44" width="28" height="12" /><rect x="64" y="44" width="28" height="12" /><line x1="36" y1="50" x2="40" y2="50" /><line x1="60" y1="50" x2="64" y2="50" /><path d="M50 60 L50 70 M44 76 Q50 70 56 76" /></g></svg>
);
const Chip = () => (
  <svg width={200} height={200} viewBox="0 0 100 100"><g fill="none" stroke={YEL} strokeWidth={3}><rect x="28" y="28" width="44" height="44" /><text x="50" y="57" fill={YEL} stroke="none" fontFamily="Anton, Impact" fontSize="20" textAnchor="middle">AI</text>{[36, 50, 64].map((p) => <g key={p}><line x1={p} y1="18" x2={p} y2="28" /><line x1={p} y1="72" x2={p} y2="82" /><line x1="18" y1={p} x2="28" y2={p} /><line x1="72" y1={p} x2="82" y2={p} /></g>)}</g></svg>
);
const Screen = () => (
  <svg width={200} height={200} viewBox="0 0 100 100"><g fill="none" stroke="#fff" strokeWidth={3}><rect x="12" y="20" width="76" height="50" /><line x1="50" y1="70" x2="50" y2="82" /><line x1="34" y1="82" x2="66" y2="82" /><rect x="44" y="36" width="12" height="12" stroke={RED} /></g></svg>
);
const Icons = () => {
  const t = useShot("icons"); if (t === null) return null;
  const arrow = (d: number) => <div style={{ ...rise(t, d), fontFamily: ANTON, fontSize: 80, color: DIM }}>↓</div>;
  return (
    <Center gap={10}>
      <div style={slam(t, 0)}><Sat /></div><Small style={{ ...rise(t, 0.05), marginBottom: 10, fontSize: 40 }} color="#fff">drone + satellite images</Small>
      {arrow(0.5)}
      <div style={slam(t, 0.6)}><Chip /></div><Small style={{ ...rise(t, 0.65), fontSize: 40 }} color={YEL}>Maven reads them</Small>
      {arrow(1.1)}
      <div style={slam(t, 1.2)}><Screen /></div><Small style={{ ...rise(t, 1.25), fontSize: 40 }} color="#fff">commander's screen</Small>
    </Center>
  );
};
const Radar = () => {
  const t = useShot("radar"); if (t === null) return null;
  const ang = t * 200;
  return (
    <Center gap={50}>
      <svg width={760} height={760} viewBox="0 0 200 200" style={rise(t)}>
        <defs><radialGradient id="sw" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={YEL} stopOpacity=".35" /><stop offset="1" stopColor={YEL} stopOpacity="0" /></radialGradient></defs>
        {[90, 65, 40, 15].map((r) => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#2C2C2C" strokeWidth="1" />)}
        <line x1="10" y1="100" x2="190" y2="100" stroke="#2C2C2C" /><line x1="100" y1="10" x2="100" y2="190" stroke="#2C2C2C" />
        <path d="M100 100 L190 100 A90 90 0 0 0 163.6 36.4 Z" fill="url(#sw)" transform={`rotate(${ang} 100 100)`} />
        {[[60, 70], [140, 55], [128, 140], [70, 135]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#fff" opacity={interpolate(t, [0.3 + i * 0.25, 0.5 + i * 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />)}
      </svg>
      <Big size={110} style={rise(t, 0.3)}>Images in</Big>
    </Center>
  );
};
const Target = () => {
  const t = useShot("target"); if (t === null) return null;
  const s = interpolate(t, [0.15, 0.5], [2.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <Center gap={50}>
      <div style={{ position: "relative", width: 700, height: 700, background: "#141414", border: "2px solid #2C2C2C" }}>
        <svg width={700} height={700} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
          <path d="M0 70 Q30 55 50 62 T100 50" stroke="#2A2A2A" strokeWidth="0.8" fill="none" /><path d="M0 30 Q40 40 60 25 T100 35" stroke="#2A2A2A" strokeWidth="0.8" fill="none" />
          <g transform={`translate(55 48) scale(${s})`} opacity={interpolate(t, [0.15, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            <rect x="-9" y="-9" width="18" height="18" fill="none" stroke={RED} strokeWidth="1.2" /><line x1="-14" y1="0" x2="-9" y2="0" stroke={RED} /><line x1="9" y1="0" x2="14" y2="0" stroke={RED} /><line x1="0" y1="-14" x2="0" y2="-9" stroke={RED} /><line x1="0" y1="9" x2="0" y2="14" stroke={RED} />
          </g>
        </svg>
        <div style={{ position: "absolute", top: 20, left: 24, fontFamily: MONO, fontSize: 32, color: RED, letterSpacing: 2, opacity: t > 0.5 ? 1 : 0 }}>● TARGET FLAGGED</div>
      </div>
      <Big size={110} style={rise(t, 0.4)}>Targets <span style={{ color: RED }}>out</span></Big>
    </Center>
  );
};
const UserIcon: React.FC<{ c?: string }> = ({ c = "#fff" }) => (
  <svg width={90} height={90} viewBox="0 0 100 100"><g fill="none" stroke={c} strokeWidth={6}><circle cx="50" cy="34" r="16" /><path d="M20 86 Q20 58 50 58 Q80 58 80 86" /></g></svg>
);
const UserGrid: React.FC<{ t: number; n: number }> = ({ t, n }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 110px)", gap: 14, justifyContent: "center" }}>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} style={{ opacity: interpolate(t, [i * 0.03, i * 0.03 + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), display: "flex", justifyContent: "center" }}>
        <UserIcon c={i === 0 ? YEL : "#fff"} />
      </div>
    ))}
  </div>
);
const Users = () => {
  const t = useShot("users"); if (t === null) return null;
  return <Center gap={50}><Big size={150} style={slam(t)}>1 user =<br /><span style={{ color: YEL }}>1 licence</span></Big><UserGrid t={t - 0.3} n={18} /></Center>;
};
const Flash = () => {
  const t = useShot("flash"); if (t === null) return null;
  return <AbsoluteFill style={{ background: YEL, justifyContent: "center", alignItems: "center" }}><Big size={170} color={BG} style={slam(t)}>Wait for<br />profit<br />margin</Big></AbsoluteFill>;
};
const Seat = () => {
  const t = useShot("seat"); if (t === null) return null;
  return <Center gap={50}><UserGrid t={10} n={30} /><Big size={100} style={rise(t)}>Software, rented<br /><span style={{ color: YEL }}>by the seat</span></Big></Center>;
};
const Usd = () => {
  const t = useShot("usd"); if (t === null) return null;
  return (<>
    <Center gap={30}><Big size={300} color={YEL} style={slam(t)}>$1.28B</Big><Small style={rise(t, 0.6)} color="#fff">in rupees?</Small></Center>
  </>);
};
const Inr = () => {
  const t = useShot("inr"); if (t === null) return null;
  return (<>
    <Center gap={30}><Small style={rise(t)} color="#fff">about</Small><Big size={240} color={YEL} style={slam(t, 0.05)}>₹11,000<br />crore</Big></Center>
    <Source text="Estimate at ₹85–90 per US$" />
  </>);
};
const Rocket: React.FC<{ on: boolean }> = ({ on }) => (
  <svg width={80} height={110} viewBox="0 0 40 56"><g fill={on ? YEL : "none"} stroke={on ? YEL : "#333"} strokeWidth={2}><path d="M20 3 Q30 14 28 36 L12 36 Q10 14 20 3 Z" /><path d="M12 30 L5 42 L12 40 Z M28 30 L35 42 L28 40 Z" /><path d="M16 38 L20 52 L24 38" /></g></svg>
);
const Rockets = () => {
  const t = useShot("rockets"); if (t === null) return null;
  const lit = Math.floor(interpolate(t, [0.1, 1.3], [0, 18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (<>
    <Center gap={50}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 100px)", gap: 18, justifyContent: "center" }}>
        {Array.from({ length: 18 }).map((_, i) => <div key={i} style={{ display: "flex", justifyContent: "center" }}><Rocket on={i < lit} /></div>)}
      </div>
      <Big size={150} style={rise(t, 0.2)}><span style={{ color: YEL }}>18</span> Chandrayaan-3<br />missions</Big>
    </Center>
    <Source text="At ~₹615 cr per mission (reported cost)" />
  </>);
};
const Profit = () => {
  const t = useShot("profit"); if (t === null) return null;
  return <Center><Big size={250} style={slam(t)}>Now the<br /><span style={{ color: YEL }}>profit</span></Big></Center>;
};
const Bar: React.FC<{ t: number; pct: number; color: string; name: string; sub: string; delay?: number }> = ({ t, pct, color, name, sub, delay = 0 }) => {
  const g = interpolate(t - delay, [0.1, 0.8], [0, pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: 380, opacity: t - delay > 0 ? 1 : 0 }}>
      <div style={{ fontFamily: ANTON, fontSize: 150, color, lineHeight: 1 }}>₹{Math.round(g)}</div>
      <div style={{ height: 620, width: 220, background: "#1A1A1A", display: "flex", alignItems: "flex-end" }}><div style={{ width: "100%", height: `${(g / 40) * 100}%`, background: color }} /></div>
      <div style={{ fontFamily: ANTON, fontSize: 64, color: "#fff", textTransform: "uppercase" }}>{name}</div>
      <Small style={{ fontSize: 26 }}>{sub}</Small>
    </div>
  );
};
const Compare: React.FC<{ t: number; showP: boolean; pDelay: number }> = ({ t, showP, pDelay }) => (
  <>
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}><Small color="#fff" style={{ fontSize: 36 }}>kept from every ₹100 of sales</Small></AbsoluteFill>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-end", flexDirection: "row", gap: 60, paddingBottom: 300 }}>
      <Bar t={t} pct={10} color={RED} name="Lockheed" sub="sells missiles" />
      {showP ? <Bar t={t} pct={32} color={GRN} name="Palantir" sub="sells software" delay={pDelay} /> : <div style={{ width: 380 }} />}
    </AbsoluteFill>
    <Source text="FY2025 GAAP operating margin: Lockheed 10.3%, Palantir 32%" />
  </>
);
const Lmt = () => { const t = useShot("lmt"); if (t === null) return null; return <Compare t={t} showP={false} pDelay={0} />; };
const Pltr = () => {
  const t = useShot("pltr"); if (t === null) return null;
  return (<>
    <Compare t={t + 3.3} showP pDelay={3.3} />
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 290 }}>
      <div style={{ ...slam(t, 0.8), fontFamily: ANTON, fontSize: 80, color: BG, background: GRN, padding: "4px 30px" }}>3x MORE</div>
    </AbsoluteFill>
  </>);
};
const Save = () => {
  const t = useShot("save"); if (t === null) return null;
  return (
    <Center gap={40}>
      <svg width={220} height={280} viewBox="0 0 60 76" style={slam(t)}><path d="M6 4 H54 V72 L30 54 L6 72 Z" fill={YEL} /></svg>
      <Big size={190} style={slam(t, 0.1)}>Save this</Big>
      <Small color="#fff" style={{ ...rise(t, 0.5), fontSize: 40 }}>filings in the caption</Small>
    </Center>
  );
};
const Loop = () => {
  const t = useShot("loop"); if (t === null) return null;
  return (<>
    <Center><div style={slam(t)}><Big size={170}>How did this deal</Big><Big size={230} color={YEL}>almost triple?</Big></div></Center>
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
      <div style={{ fontFamily: MONO, fontSize: 22, color: "#5A5A5A", textAlign: "center", lineHeight: 1.5 }}>AVRON is not SEBI-registered. Education only, not investment advice.</div>
    </AbsoluteFill>
  </>);
};

/** Fine film grain so the flat black doesn't band on phones. */
const Grain = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.06, mixBlendMode: "screen", pointerEvents: "none" }}>
      <svg width="100%" height="100%"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 24} /></filter><rect width="100%" height="100%" filter="url(#g)" /></svg>
    </AbsoluteFill>
  );
};

const Handle = () => (
  <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", fontFamily: ANTON, fontSize: 34, letterSpacing: 8, color: "#3A3A3A" }}>AVRON</div>
);

export const PalantirReel: React.FC = () => {
  useAnton();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Handle />
      <Hook1 /><Hook2 /><Year24 /><Doc24 /><Doc25 /><Count /><Icons /><Radar /><Target /><Users />
      <Seat /><Usd /><Inr /><Rockets /><Profit /><Lmt /><Pltr /><Save /><Loop /><Flash />
      <Grain />
      <Audio src={staticFile("palantir/mix.wav")} />
    </AbsoluteFill>
  );
};
