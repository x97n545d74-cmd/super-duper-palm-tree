import React from "react";
import { color, font, layout } from "../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { Counter, SourceTag } from "../../engine/components/Kinetic";
import { at, S } from "./config";

/*
 * Retail inflation thali reel (user's AVRON Pro blueprint), in the house direction
 * (ideas/2026-10-product-launch-20s): high-end minimal, one idea per shot, one clean sans with tight tracking,
 * masked type reveals, push cuts with motion blur. Blueprint colour code: gold for key metrics,
 * red for rises, green for falls. Banned: shake, particles, glows, grid floors, flashes, bouncy easing.
 * No full stops in on-screen text. Hindi in Roman script.
 */
const G = layout.gutter;
const GOLD = color.goldHot;
const RED = "#FF5A55";
const GREEN = "#4FD18B";
const INK = color.ink;
const DIM = "rgba(243,241,236,0.46)";
const NAVY = "#070B16";
const W = 1080 - 2 * G;

const display = (size: number, weight = 800): React.CSSProperties => ({
  fontFamily: font.display, fontWeight: weight, fontSize: size, letterSpacing: "-0.045em", lineHeight: 1.02, color: INK,
});
const label: React.CSSProperties = { fontFamily: font.text, fontWeight: 600, fontSize: 26, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM };
const mono: React.CSSProperties = { fontFamily: font.mono, fontSize: 24, color: DIM, letterSpacing: "0.02em" };

/** Masked rise. No blur, no overshoot. */
const Mask: React.FC<{ t: number; start: number; children: React.ReactNode; style?: React.CSSProperties; dur?: number }> = ({
  t, start, children, style, dur = 0.6,
}) => {
  const p = ease.outExpo(clamp01((t - start) / dur));
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.12em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 110}%)` }}>{children}</div>
    </div>
  );
};

/** Push cut: the incoming shot arrives with a short eased push (motion blur does the rest). */
const pushIn = (t: number, a: number): React.CSSProperties => {
  const p = ease.outExpo(clamp01((t - a) / 0.55));
  return { transform: `scale(${lerp(1.08, 1, p)})`, opacity: clamp01((t - a) / 0.08) };
};

const Stage: React.FC<{ t: number; w: readonly [number, number]; children: React.ReactNode }> = ({ t, w, children }) => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(85% 55% at 50% 40%, #0F1626 0%, ${NAVY} 72%)` }}>
    <div style={{ position: "absolute", inset: 0, ...pushIn(t, w[0]) }}>{children}</div>
  </div>
);

/** Bottom source tags: one shared style for every credit in the reel. */
const TAG_Y = 1500;
const Tags: React.FC<{ t: number; tags: { text: string; start: number; estimate?: boolean }[] }> = ({ t, tags }) => (
  <div style={{ position: "absolute", left: G, right: 120, bottom: 1920 - TAG_Y - 52, display: "flex", flexDirection: "column-reverse", alignItems: "flex-start", gap: 10 }}>
    {tags.filter((g) => t >= g.start).map((g) => (
      <SourceTag key={g.text} text={g.text} t={t} start={g.start} estimate={g.estimate} style={{ fontSize: 21, padding: "10px 18px" }} />
    ))}
  </div>
);

const MOSPI = "MOSPI · CPI BASE 2024 · 12 OCT 2026 · SEP PROVISIONAL";
const RBI = "RBI · MPC RESOLUTION · 7 OCT 2026";

/** Original top-down thali (illustration, no brand). `fill` lights the bowls one by one. */
const Thali: React.FC<{ size: number; fill: number[] }> = ({ size, fill }) => {
  const bowls: { x: number; y: number; r: number; c: string }[] = [
    { x: -150, y: -130, r: 78, c: "#D9922E" }, // dal
    { x: 30, y: -185, r: 70, c: "#B8432F" }, // sabzi (onion-tomato)
    { x: 185, y: -85, r: 64, c: "#E9E2CF" }, // dahi
    { x: 190, y: 95, r: 58, c: "#7A9E3B" }, // chutney
  ];
  return (
    <svg width={size} height={size} viewBox="-320 -320 640 640">
      <defs>
        <radialGradient id="steel" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#E6E9EE" />
          <stop offset="60%" stopColor="#A9AFB9" />
          <stop offset="100%" stopColor="#6E747E" />
        </radialGradient>
        <radialGradient id="bowl" cx="40%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#D3D7DE" />
          <stop offset="100%" stopColor="#7C838E" />
        </radialGradient>
      </defs>
      <circle r={300} fill="url(#steel)" />
      <circle r={268} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
      <circle r={262} fill="#B9BEC7" opacity={0.35} />
      {/* rice */}
      <ellipse cx={-40} cy={110} rx={130} ry={90} fill="#F4EFE3" />
      {Array.from({ length: 40 }).map((_, i) => (
        <ellipse key={i} cx={-40 + Math.cos(i * 2.4) * (20 + (i * 7) % 100)} cy={110 + Math.sin(i * 2.4) * (12 + (i * 5) % 70)} rx={7} ry={2.6}
          transform={`rotate(${(i * 47) % 180} ${-40 + Math.cos(i * 2.4) * (20 + (i * 7) % 100)} ${110 + Math.sin(i * 2.4) * (12 + (i * 5) % 70)})`} fill="#E7DFCC" />
      ))}
      {/* rotis */}
      <circle cx={-185} cy={60} r={72} fill="#D7A867" />
      <circle cx={-170} cy={40} r={72} fill="#E2B577" />
      {bowls.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill="url(#bowl)" />
          <circle cx={b.x} cy={b.y} r={b.r - 9} fill={b.c} opacity={lerp(0.25, 1, fill[i] ?? 1)} />
        </g>
      ))}
    </svg>
  );
};

/* ------------------------------------------------ 1. HOOK: 4.83% → 5.54% */
export const Hook: React.FC<{ t: number }> = ({ t }) => {
  const a = at("b1_hook", "4.83%"), b = at("b1_hook", "5.54%");
  const roll = prog(t, b - 0.05, 0.9, ease.outExpo);
  const scale = 8; // % axis
  return (
    <Stage t={t} w={S.hook}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={0.15}><div style={label}>Retail mehengai · CPI</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G - 6, top: 400, ...display(250, 900), color: roll > 0.02 ? RED : GOLD, opacity: prog(t, a - 0.1, 0.2) }}>
        <Mask t={t} start={a - 0.1} dur={0.5}>
          <Counter from={4.83} to={5.54} t={t} start={b - 0.05} dur={0.9} decimals={2} suffix="%" />
        </Mask>
      </div>
      <div style={{ position: "absolute", left: G, top: 700, display: "flex", gap: 28, alignItems: "baseline" }}>
        <Mask t={t} start={a + 0.1}><span style={{ ...display(54, 700), color: DIM }}>Aug 4.83%</span></Mask>
        <Mask t={t} start={b}><span style={{ ...display(54, 700) }}>Sep 5.54%</span></Mask>
      </div>
      {/* axis: RBI target vs Aug vs Sep */}
      <div style={{ position: "absolute", left: G, top: 860, width: W, opacity: prog(t, a + 0.2, 0.5) }}>
        <div style={{ height: 4, background: "rgba(243,241,236,0.12)" }} />
        <div style={{ position: "absolute", top: 0, height: 4, width: W * lerp(4.83, 5.54, roll) / scale, background: roll > 0.02 ? RED : GOLD }} />
        <div style={{ position: "absolute", left: W * 4 / scale, top: -22, width: 2, height: 48, background: INK }} />
        <div style={{ position: "absolute", left: W * 4 / scale - 120, top: 40, width: 240, textAlign: "center", ...mono }}>RBI target 4%</div>
      </div>
      <Tags t={t} tags={[{ text: MOSPI, start: a + 0.3 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 2. THALI */
export const ThaliShot: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.thali;
  const word = at("b1_thali", "thali");
  const k = prog(t, a, S.thali[1] - a, ease.linear);
  return (
    <Stage t={t} w={S.thali}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center",
        transform: `rotate(${lerp(-6, 4, k)}deg) scale(${lerp(0.96, 1.02, k)})` }}>
        <Thali size={700} fill={[0, 1, 2, 3].map((i) => prog(t, a + 0.2 + i * 0.18, 0.4))} />
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1010 }}>
        <Mask t={t} start={a + 0.1}><div style={display(92)}>Sabse bada jhatka</div></Mask>
        <Mask t={t} start={word - 0.1}><div style={{ ...display(92), color: GOLD }}>thali pe</div></Mask>
      </div>
      <div style={{ position: "absolute", right: G, top: 960, ...mono, fontSize: 20 }}>ILLUSTRATION</div>
    </Stage>
  );
};

/* ------------------------------------------------ 3. CPI = tokri ka daam */
export const Cpi: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.cpi;
  const tok = at("b2_cpi", "tokri");
  const facts = ["1,407 shehri bazaar", "1,465 gaon", "Har hafte daam"];
  return (
    <Stage t={t} w={S.cpi}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>MoSPI ka</div></Mask>
        <Mask t={t} start={at("b2_cpi", "CPI") - 0.1}><div style={{ ...display(300, 900), color: GOLD, letterSpacing: "-0.06em" }}>CPI</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 690 }}>
        <Mask t={t} start={at("b2_cpi", "aapke") - 0.05}><div style={display(76)}>Aapke ghar ki</div></Mask>
        <Mask t={t} start={tok - 0.05}><div style={display(76)}>tokri ka daam</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G, top: 940, display: "flex", flexDirection: "column", gap: 16 }}>
        {facts.map((f, i) => (
          <Mask key={f} t={t} start={tok + 0.25 + i * 0.2}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ width: 10, height: 10, borderRadius: 10, background: GOLD }} />
              <span style={{ ...mono, fontSize: 32, color: INK }}>{f}</span>
            </div>
          </Mask>
        ))}
      </div>
      <Tags t={t} tags={[{ text: "MOSPI · PRICE COLLECTION, SEP 2026 RELEASE", start: tok }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 4. FOOD 5.97 → 7.74 */
export const Food: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.food;
  const p1 = prog(t, at("b3_food", "5.97%") - 0.1, 0.7, ease.outExpo);
  const p2 = prog(t, at("b3_food", "7.74%") - 0.1, 0.9, ease.outExpo);
  const scale = 9;
  const Bar: React.FC<{ name: string; v: number; p: number; c: string; top: number; start: number }> = ({ name, v, p, c, top, start }) => (
    <div style={{ position: "absolute", left: G, top, width: W, opacity: clamp01(p * 3) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ ...label, color: INK }}>{name}</span>
        <span style={{ ...display(64, 800), color: c }}><Counter to={v} t={t} start={start} dur={0.9} decimals={2} suffix="%" /></span>
      </div>
      <div style={{ marginTop: 14, height: 54, background: "rgba(243,241,236,0.08)", borderRadius: 6 }}>
        <div style={{ height: "100%", width: `${(v / scale) * 100 * p}%`, background: c, borderRadius: 6 }} />
      </div>
    </div>
  );
  return (
    <Stage t={t} w={S.food}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>Khaane ki mehengai · CFPI</div></Mask>
        <Mask t={t} start={a + 0.12}><div style={{ ...display(120, 900), marginTop: 18 }}>Khaana</div></Mask>
      </div>
      <Bar name="Aug 2026" v={5.97} p={p1} c={DIM} top={760} start={at("b3_food", "5.97%") - 0.1} />
      <Bar name="Sep 2026" v={7.74} p={p2} c={RED} top={960} start={at("b3_food", "7.74%") - 0.1} />
      <div style={{ position: "absolute", left: G, top: 1180, ...mono, fontSize: 30, color: RED, opacity: prog(t, at("b3_food", "pe") - 0.2, 0.4) }}>+1.77 percentage points</div>
      <Tags t={t} tags={[{ text: MOSPI, start: a + 0.4 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 5. VEG: onion up, potato and tomato down */
export const Veg: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.veg;
  const cards = [
    { name: "Pyaaz", v: "+108.09%", c: RED, at: at("b4_veg", "108%") - 0.25 },
    { name: "Aloo", v: "−11.50%", c: GREEN, at: at("b4_veg", "Aloo") - 0.1 },
    { name: "Tamatar", v: "−8.62%", c: GREEN, at: at("b4_veg", "tamatar") - 0.1 },
  ];
  return (
    <Stage t={t} w={S.veg}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>Saal bhar mein · Sep 2026</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 400, display: "flex", flexDirection: "column", gap: 26, perspective: 1400 }}>
        {cards.map((c, i) => {
          const p = prog(t, c.at, 0.55, ease.outExpo);
          return (
            <div key={c.name} style={{ opacity: clamp01(p * 2.5) }}>
              <div style={{ height: 230, borderRadius: 18, background: "linear-gradient(170deg, #121A2C, #0B1120)", border: `1.5px solid ${c.c}55`,
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px",
                transform: `rotateX(${(1 - p) * -80}deg)`, transformOrigin: "50% 0%" }}>
                <span style={display(82, 800)}>{c.name}</span>
                <span style={{ ...display(i === 0 ? 108 : 84, 900), color: c.c }}>{c.v}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Tags t={t} tags={[{ text: "MOSPI · ITEM INFLATION, SEP 2026 VS SEP 2025", start: a + 0.4 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 6. GAON vs SHEHAR */
export const Split: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.split;
  const cols = [
    { name: "Gaon", v: 6.08, food: "Khaana 8.06%", c: RED, s: at("b5_split", "6.08%") - 0.15 },
    { name: "Shehar", v: 4.88, food: "Khaana 7.18%", c: GOLD, s: at("b5_split", "4.88%.") - 0.15 },
  ];
  const maxH = 560;
  return (
    <Stage t={t} w={S.split}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>Retail mehengai · Sep 2026</div></Mask>
      </div>
      <div style={{ position: "absolute", left: 540, top: 420, width: 2, height: 800, background: "rgba(243,241,236,0.14)", transform: `scaleY(${prog(t, a, 0.6, ease.outExpo)})`, transformOrigin: "50% 0%" }} />
      {cols.map((c, i) => {
        const p = prog(t, c.s, 0.8, ease.outExpo);
        const x = i === 0 ? G : 540 + 60;
        const h = maxH * (c.v / 7) * p;
        return (
          <div key={c.name} style={{ position: "absolute", left: x, top: 420, width: 1080 / 2 - G - 60, height: 800 }}>
            <Mask t={t} start={c.s - 0.1}><div style={display(64, 800)}>{c.name}</div></Mask>
            <div style={{ ...display(116, 900), color: c.c, marginTop: 8, opacity: clamp01(p * 3) }}>
              <Counter to={c.v} t={t} start={c.s} dur={0.8} decimals={2} suffix="%" />
            </div>
            <div style={{ position: "absolute", bottom: 60, left: 0, width: 150, height: h, background: c.c, borderRadius: "8px 8px 0 0" }} />
            <div style={{ position: "absolute", bottom: 10, left: 0, ...mono, fontSize: 24, opacity: p }}>{c.food}</div>
          </div>
        );
      })}
      <Tags t={t} tags={[{ text: MOSPI, start: a + 0.4 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 7. RBI repo 5.25 → 5.50 */
export const Rbi: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.rbi;
  const up = at("b6_rbi", "5.50%");
  const step = prog(t, up - 0.1, 0.7, ease.inOutQuint);
  const draw = prog(t, a + 0.2, 1.2, ease.outCubic);
  const y = (v: number) => 380 - (v - 5.0) * 900; // svg y for rate
  const xStep = 560;
  const lineD = `M0,${y(5.25)} L${xStep},${y(5.25)} L${xStep},${lerp(y(5.25), y(5.5), step)} L${lerp(xStep, W, step)},${lerp(y(5.25), y(5.5), step)}`;
  return (
    <Stage t={t} w={S.rbi}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>RBI repo rate · 7 Oct 2026</div></Mask>
        <div style={{ ...display(170, 900), marginTop: 16, color: step > 0.02 ? RED : INK }}>
          <Mask t={t} start={at("b6_rbi", "repo") - 0.1}><Counter from={5.25} to={5.5} t={t} start={up - 0.1} dur={0.7} decimals={2} suffix="%" /></Mask>
        </div>
      </div>
      <svg width={W} height={440} style={{ position: "absolute", left: G, top: 680 }}>
        <line x1={0} x2={W} y1={y(5.25)} y2={y(5.25)} stroke="rgba(243,241,236,0.12)" strokeWidth={2} strokeDasharray="6 10" />
        <path d={lineD} fill="none" stroke={step > 0.02 ? RED : INK} strokeWidth={6} strokeDasharray={2400} strokeDashoffset={2400 * (1 - draw)} strokeLinejoin="round" />
        <text x={0} y={y(5.25) + 54} fill={DIM} style={{ fontFamily: font.mono, fontSize: 26 }}>5.25% Aug</text>
        <text x={W} y={y(5.5) - 26} textAnchor="end" fill={RED} opacity={step} style={{ fontFamily: font.mono, fontSize: 26 }}>5.50% Oct · +25 bps</text>
      </svg>
      <div style={{ position: "absolute", left: G, right: G, top: 1180 }}>
        <Mask t={t} start={up + 0.4}><div style={{ ...display(50, 700), color: DIM }}>Stance · calibrated tightening</div></Mask>
      </div>
      <Tags t={t} tags={[{ text: RBI, start: a + 0.4 }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 8. FY27 projection 5.2% */
export const Proj: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.proj;
  const v = at("b6_proj", "5.2%");
  const warn = at("b6_proj", "Anuman");
  const qs = [{ q: "Q2", v: 4.9 }, { q: "Q3", v: 6.0 }, { q: "Q4", v: 5.7 }];
  return (
    <Stage t={t} w={S.proj}>
      <div style={{ position: "absolute", left: G, top: 300 }}>
        <Mask t={t} start={a}><div style={label}>RBI ka CPI anuman · FY27</div></Mask>
        <Mask t={t} start={v - 0.15}><div style={{ ...display(250, 900), color: GOLD, marginTop: 10 }}>5.2%</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G, top: 700, display: "flex", gap: 40, alignItems: "flex-end", height: 330 }}>
        {qs.map((q, i) => {
          const p = prog(t, v + 0.15 + i * 0.15, 0.6, ease.outExpo);
          return (
            <div key={q.q} style={{ width: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <span style={{ ...mono, fontSize: 30, color: INK, opacity: p }}>{q.v.toFixed(1)}%</span>
              <div style={{ width: 120, height: (q.v / 6.5) * 240 * p, border: `2.5px dashed ${GOLD}`, borderBottom: "none", borderRadius: "6px 6px 0 0" }} />
              <span style={{ ...label, letterSpacing: "0.12em" }}>{q.q}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: G, top: 1110, opacity: prog(t, warn - 0.1, 0.3),
        transform: `scale(${lerp(1.06, 1, prog(t, warn - 0.1, 0.45, ease.outExpo))})`, transformOrigin: "0% 50%" }}>
        <div style={{ border: `3px solid ${RED}`, borderRadius: 12, padding: "14px 26px", ...display(52, 800), color: RED, letterSpacing: "-0.02em" }}>Anuman hai, guarantee nahi</div>
      </div>
      <Tags t={t} tags={[{ text: "RBI PROJECTION · 7 OCT 2026 · NOT A GUARANTEE", start: a + 0.4, estimate: true }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 9. REAL RETURN formula */
export const Real: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.real;
  const ex = at("b7_real", "7%");
  const res = at("b7_real", "1.46%.");
  const k = prog(t, ex - 0.2, 0.6, ease.inOutQuint); // formula slides up for the example
  const row: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: 26, flexWrap: "wrap" };
  return (
    <Stage t={t} w={S.real}>
      <div style={{ position: "absolute", left: G, right: G, top: lerp(380, 300, k) }}>
        <Mask t={t} start={a}><div style={label}>Real return formula</div></Mask>
        <div style={{ ...row, marginTop: 20 }}>
          <Mask t={t} start={a + 0.1}><span style={{ ...display(lerp(96, 64, k)), color: GOLD }}>Asli return</span></Mask>
          <Mask t={t} start={a + 0.35}><span style={{ ...display(lerp(96, 64, k), 600), color: DIM }}>=</span></Mask>
        </div>
        <div style={{ ...row, marginTop: 10 }}>
          <Mask t={t} start={at("b7_real", "return", 1) - 0.05}><span style={display(lerp(96, 64, k))}>Return</span></Mask>
          <Mask t={t} start={at("b7_real", "minus") - 0.05}><span style={{ ...display(lerp(96, 64, k)), color: RED }}>−</span></Mask>
          <Mask t={t} start={at("b7_real", "mehengai.") - 0.05}><span style={display(lerp(96, 64, k))}>Mehengai</span></Mask>
        </div>
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 720, opacity: prog(t, ex - 0.1, 0.3),
        borderRadius: 20, border: "1.5px solid rgba(243,241,236,0.14)", background: "linear-gradient(170deg, #121A2C, #0B1120)", padding: "40px 44px" }}>
        <div style={{ ...label, fontSize: 22 }}>Udaharan · FD 7% maan lo</div>
        <div style={{ ...row, marginTop: 26, gap: 22 }}>
          <Mask t={t} start={ex - 0.05}><span style={display(88, 800)}>7%</span></Mask>
          <Mask t={t} start={ex + 0.25}><span style={{ ...display(88, 600), color: RED }}>−</span></Mask>
          <Mask t={t} start={ex + 0.4}><span style={{ ...display(88, 800), color: DIM }}>5.54%</span></Mask>
        </div>
        <div style={{ height: 2, background: "rgba(243,241,236,0.14)", margin: "26px 0", transform: `scaleX(${prog(t, res - 0.5, 0.5, ease.outExpo)})`, transformOrigin: "0% 50%" }} />
        <Mask t={t} start={res - 0.15}><div style={{ ...display(150, 900), color: GOLD }}>= 1.46%</div></Mask>
      </div>
      <Tags t={t} tags={[{ text: "ILLUSTRATIVE FD RATE · PRE-TAX · NOT ADVICE", start: ex, estimate: true }]} />
    </Stage>
  );
};

/* ------------------------------------------------ 10. CTA */
export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [a] = S.cta;
  const c = at("b8_cta", "Comment");
  return (
    <Stage t={t} w={S.cta}>
      <div style={{ position: "absolute", right: -180, top: 230, opacity: 0.22 * prog(t, a, 0.6) }}>
        <Thali size={620} fill={[1, 1, 1, 1]} />
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 560 }}>
        <Mask t={t} start={a}><div style={display(104)}>Aapki thali mein</div></Mask>
        <Mask t={t} start={at("b8_cta", "sabse") - 0.05}><div style={display(104)}>sabse mehenga</div></Mask>
        <Mask t={t} start={at("b8_cta", "kya") - 0.05}><div style={{ ...display(104), color: GOLD }}>kya hua?</div></Mask>
      </div>
      <div style={{ position: "absolute", left: G, top: 1000, opacity: prog(t, c - 0.1, 0.3),
        transform: `translateY(${(1 - prog(t, c - 0.1, 0.5, ease.outExpo)) * 30}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: GOLD, color: NAVY, borderRadius: 999, padding: "20px 40px", ...display(54, 800), letterSpacing: "-0.02em" }}>
          <span style={{ color: NAVY }}>Comment karo</span>
          <svg width={34} height={34} viewBox="0 0 34 34"><path d="M17 4 V28 M7 18 L17 28 L27 18" stroke={NAVY} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </Stage>
  );
};

/* ------------------------------------------------ 11. END CARD */
export const End: React.FC<{ t: number; duration: number }> = ({ t, duration }) => {
  const [a] = S.end;
  const out = 1 - prog(t, duration - 0.5, 0.5, ease.inCubic);
  return (
    <div style={{ position: "absolute", inset: 0, background: NAVY, opacity: prog(t, a, 0.25) * out }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
        <Mask t={t} start={a + 0.05}><div style={{ ...display(132, 800), letterSpacing: "0.32em", paddingLeft: "0.32em" }}>AVRON</div></Mask>
        <div style={{ width: 380, height: 2, background: GOLD, margin: "34px auto 0", transform: `scaleX(${prog(t, a + 0.25, 0.7, ease.outExpo)})` }} />
      </div>
      <div style={{ position: "absolute", left: G, right: G, top: 1000, textAlign: "center", display: "flex", flexDirection: "column", gap: 18, opacity: prog(t, a + 0.4, 0.5) }}>
        <div style={{ ...mono, fontSize: 25, color: INK }}>Education only · Not investment advice</div>
        <div style={{ ...mono, fontSize: 25, color: INK }}>AVRON is not SEBI-registered</div>
        <div style={{ ...mono, fontSize: 21, marginTop: 20 }}>Sources · MoSPI CPI release 12 Oct 2026 · RBI MPC resolution 7 Oct 2026</div>
      </div>
    </div>
  );
};

