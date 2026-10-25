import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { useTime } from "../../engine/anim";
import { Grain } from "./look";
import MAP from "./india_map.json";
import { C, count, fade, Glass, mono, PhotoWorld, Rise, sans, serif, SerifFont } from "./look";

/** Style frames for approval: one shot per hour of the film's day. 3 s each. */
const A = [0, 3, 6, 9, 12] as const;

const Night: React.FC<{ t: number }> = ({ t }) => {
  const a = A[0];
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 3, 0.01, 0.3) }}>
      <PhotoWorld src="swiggy/night_skyline.jpg" t={t} t0={a} hour="night" overlay={{ src: "swiggy/night_flyover.jpg", opacity: 0.35 }} />
      {/* phone with the ten-minute promise */}
      <div style={{ position: "absolute", left: 1180, top: 150, width: 380, height: 780, borderRadius: 56, background: "linear-gradient(160deg,#1a1c22,#07080b)",
        border: "2px solid rgba(255,255,255,0.18)", boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 80px rgba(252,128,25,0.12)", transform: `rotate(${-4 + 0.4 * (t - a)}deg)` }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 44, background: "radial-gradient(80% 60% at 50% 30%, #2a2018, #0b0b0f)" }} />
        <Glass style={{ left: 30, right: 30, top: 120, padding: "22px 24px", borderRadius: 22 }} tint="rgba(255,255,255,0.14)">
          <div style={{ fontFamily: sans, fontSize: 20, color: C.inkDim, letterSpacing: "0.04em" }}>NOW</div>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 6 }}>Your order is arriving in</div>
        </Glass>
        <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: serif, fontWeight: 700, fontSize: 230, color: C.ink, lineHeight: 1,
          textShadow: "0 0 40px rgba(252,128,25,0.35)" }}>10</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 570, textAlign: "center", fontFamily: sans, fontSize: 30, letterSpacing: "0.3em", color: C.inkDim }}>MINUTES</div>
      </div>
      <div style={{ position: "absolute", left: 0, top: 520, width: 1200, height: 560, background: "radial-gradient(70% 60% at 25% 60%, rgba(0,0,0,0.65), transparent 75%)" }} />
      <div style={{ position: "absolute", left: 140, top: 640, width: 980 }}>
        <Rise t={t} at={a + 0.2}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 92, color: C.ink, lineHeight: 1.05 }}>Ten minutes</div></Rise>
        <Rise t={t} at={a + 0.5}><div style={{ fontFamily: sans, fontSize: 34, color: "rgba(245,241,234,0.86)", marginTop: 18, lineHeight: 1.4 }}>Milk, bread, a phone charger · at your door before the kettle boils</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

const Title: React.FC<{ t: number }> = ({ t }) => {
  const a = A[1];
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 3, 0.3, 0.3) }}>
      <PhotoWorld src="swiggy/night_trails.jpg" t={t} t0={a} hour="night" drift={30} />
      {/* the two logos on dark glass, the ticker beneath */}
      <Glass style={{ left: 160, top: 170, width: 640, height: 330, display: "flex", flexDirection: "column", justifyContent: "space-between" }} tint="rgba(252,128,25,0.10)">
        <Img src={staticFile("swiggy/logo_swiggy.png")} style={{ height: 96, objectFit: "contain", alignSelf: "flex-start" }} />
        <div style={{ fontFamily: mono, fontSize: 30, color: C.inkDim }}>NSE: SWIGGY · 23 OCT 2026</div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 88, color: C.loss, letterSpacing: "-0.03em" }}>−16% <span style={{ fontSize: 34, color: C.inkDim, fontWeight: 500 }}>intraday</span></div>
      </Glass>
      <Glass style={{ left: 1120, top: 170, width: 640, height: 330, display: "flex", flexDirection: "column", justifyContent: "space-between" }} tint="rgba(248,203,70,0.10)">
        <Img src={staticFile("swiggy/logo_blinkit.svg")} style={{ height: 96, width: 96, borderRadius: 20 }} />
        <div style={{ fontFamily: mono, fontSize: 30, color: C.inkDim }}>BLINKIT · Q2 FY27 · ADJ. EBITDA</div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 88, color: C.gain, letterSpacing: "-0.03em" }}>+₹184 Cr</div>
      </Glass>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 420, background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.55) 70%, transparent)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center" }}>
        <Rise t={t} at={a + 0.3}><div style={{ fontFamily: serif, fontWeight: 700, fontSize: 150, color: C.ink, letterSpacing: "-0.01em" }}>₹9.7 Crore a Day</div></Rise>
        <Rise t={t} at={a + 0.6}><div style={{ fontFamily: sans, fontSize: 32, letterSpacing: "0.35em", color: C.inkDim, marginTop: 10 }}>SWIGGY VS ETERNAL · THE QUICK-COMMERCE WAR AFTER Q2</div></Rise>
      </div>
    </AbsoluteFill>
  );
};

const Scoreboard: React.FC<{ t: number }> = ({ t }) => {
  const a = A[2];
  const col = (x: number, logo: React.ReactNode, tint: string, nov: number, stores: number, perDay: string, accent: string, at: number) => (
    <Glass style={{ left: x, top: 230, width: 700, height: 640 }} tint={tint}>
      {logo}
      <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim, marginTop: 36, letterSpacing: "0.08em" }}>NOV · JUL–SEP 2026</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 104, color: C.ink, letterSpacing: "-0.04em" }}>₹{Math.round(count(t, at, nov)).toLocaleString("en-IN")} Cr</div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "26px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 34, color: C.ink }}>
        <span style={{ color: C.inkDim }}>Dark stores</span><b>{Math.round(count(t, at + 0.2, stores)).toLocaleString("en-IN")}</b>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: sans, fontSize: 34, color: C.ink, marginTop: 18 }}>
        <span style={{ color: C.inkDim }}>Sales per store, per day</span><b style={{ color: accent }}>{perDay}</b>
      </div>
    </Glass>
  );
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 3, 0.3, 0.3) }}>
      <PhotoWorld src="swiggy/street_2.jpg" t={t} t0={a} hour="morning" drift={24} />
      <div style={{ position: "absolute", left: 160, top: 90, fontFamily: sans, fontSize: 28, letterSpacing: "0.3em", color: C.inkDim }}>02 · SCOREBOARD · Q2 FY27</div>
      {col(160, <Img src={staticFile("swiggy/logo_swiggy.png")} style={{ height: 70 }} />, "rgba(252,128,25,0.12)", 6594, 1240, "₹5.8 lakh", C.swiggy, a + 0.3)}
      {col(1060, <div style={{ display: "flex", alignItems: "center", gap: 20 }}><Img src={staticFile("swiggy/logo_blinkit.svg")} style={{ height: 70, width: 70, borderRadius: 14 }} /><span style={{ fontFamily: sans, fontSize: 30, color: C.inkDim }}>by Eternal</span></div>, "rgba(248,203,70,0.12)", 20940, 2751, "₹8.3 lakh", C.blinkit, a + 0.45)}
      <div style={{ position: "absolute", left: 160, bottom: 70, fontFamily: mono, fontSize: 22, color: C.inkDim }}>Instamart = Swiggy's quick commerce · AVRON calc: NOV ÷ stores ÷ 92 days · Sources: company filings, NSE</div>
    </AbsoluteFill>
  );
};

const Rulebook: React.FC<{ t: number }> = ({ t }) => {
  const a = A[3];
  const stamp = clampScale(t, a + 1.0);
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 3, 0.3, 0.3) }}>
      <PhotoWorld src="swiggy/dusk_city.jpg" t={t} t0={a} hour="dusk" drift={14} />
      <div style={{ position: "absolute", left: 160, top: 90, fontFamily: sans, fontSize: 28, letterSpacing: "0.3em", color: C.inkDim }}>04 · RULEBOOK</div>
      <div style={{ position: "absolute", left: 160, top: 170, width: 1600 }}>
        <Rise t={t} at={a + 0.2}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 84, color: C.ink, lineHeight: 1.08 }}>Saamaan ka maalik kaun hai</div></Rise>
      </div>
      <Glass style={{ left: 160, top: 400, width: 760, height: 470 }}>
        <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim, letterSpacing: "0.1em" }}>MARKETPLACE</div>
        <div style={{ fontFamily: sans, fontSize: 40, color: C.ink, marginTop: 20, lineHeight: 1.35 }}>Sellers own the goods. The app takes a cut</div>
        <div style={{ fontFamily: sans, fontSize: 30, color: C.inkDim, marginTop: 30 }}>Rule for companies with high foreign ownership</div>
      </Glass>
      <Glass style={{ left: 1000, top: 400, width: 760, height: 470 }} tint="rgba(248,203,70,0.10)">
        <div style={{ fontFamily: mono, fontSize: 24, color: C.blinkit, letterSpacing: "0.1em" }}>INVENTORY</div>
        <div style={{ fontFamily: sans, fontSize: 40, color: C.ink, marginTop: 20, lineHeight: 1.35 }}>The app owns the goods. Better buying, better margin</div>
        <div style={{ fontFamily: sans, fontSize: 30, color: C.inkDim, marginTop: 30 }}>Blinkit since Sep 2025 · Swiggy approved this quarter</div>
      </Glass>
      <div style={{ position: "absolute", left: 1330, top: 760, transform: `rotate(-10deg) scale(${stamp.s})`, opacity: stamp.o, border: `6px solid ${C.swiggy}`, color: C.swiggy,
        fontFamily: sans, fontWeight: 800, fontSize: 40, letterSpacing: "0.08em", padding: "10px 24px", borderRadius: 10, background: "rgba(20,10,4,0.55)" }}>APPROVED · OCT 2026</div>
    </AbsoluteFill>
  );
};
const clampScale = (t: number, at: number) => { const p = Math.min(1, Math.max(0, (t - at) / 0.25)); return { s: 1.8 - 0.8 * p, o: p }; };

const Sunrise: React.FC<{ t: number }> = ({ t }) => {
  const a = A[4];
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 3, 0.3, 0.3) }}>
      <PhotoWorld src="swiggy/sunrise_city.jpg" t={t} t0={a} hour="sunrise" drift={10} />
      <div style={{ position: "absolute", left: 160, top: 230, width: 1100 }}>
        <Rise t={t} at={a + 0.2}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 80, color: C.ink, lineHeight: 1.1 }}>Both keep the promise</div></Rise>
        <Rise t={t} at={a + 0.5}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 80, color: C.ink, lineHeight: 1.1 }}>Only one gets paid for it</div></Rise>
      </div>
      <div style={{ position: "absolute", left: 160, top: 560, display: "flex", gap: 40 }}>
        <Glass style={{ position: "relative", width: 520 }} tint="rgba(252,128,25,0.12)">
          <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim }}>INSTAMART · PER DAY</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 84, color: C.loss }}>−₹9.7 Cr</div>
        </Glass>
        <Glass style={{ position: "relative", width: 520 }} tint="rgba(248,203,70,0.12)">
          <div style={{ fontFamily: mono, fontSize: 24, color: C.inkDim }}>BLINKIT · PER DAY</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 84, color: C.gain }}>+₹2.0 Cr</div>
        </Glass>
      </div>
      <div style={{ position: "absolute", right: 160, bottom: 120, textAlign: "right" }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, letterSpacing: "0.32em", color: C.ink }}>AVRON</div>
        <div style={{ fontFamily: sans, fontSize: 22, letterSpacing: "0.3em", color: C.inkDim, marginTop: 8 }}>THE STORY BEHIND THE STOCK</div>
      </div>
    </AbsoluteFill>
  );
};

export const SwiggyStyleFrames: React.FC = () => {
  const t = useTime();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SerifFont />
      {t < 3.05 && <Night t={t} />}
      {t >= 2.7 && t < 6.05 && <Title t={t} />}
      {t >= 5.7 && t < 9.05 && <Scoreboard t={t} />}
      {t >= 8.7 && t < 12.05 && <Rulebook t={t} />}
      {t >= 11.7 && t < 15.05 && <Sunrise t={t} />}
      {t >= 14.7 && <MapEdge t={t} a={15} />}
      <Grain />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------ India map: who has the edge where (QuickCommerceMap, July 2026) */
type City = { x: number; y: number; state: string; counts: Record<string, number>; total: number; leader: string; h2h: string };
const CITIES = MAP.cities as Record<string, City>;
const STATE_EDGE: Record<string, string> = {};
// each tracked state has one tracked city, except Maharashtra (Mumbai and Pune, both Blinkit-ahead)
Object.values(CITIES).forEach((c) => { STATE_EDGE[c.state] = c.h2h; });
const EDGE_COL: Record<string, string> = { Blinkit: C.blinkit, Instamart: C.swiggy };
const LEADER_COL: Record<string, string> = { Blinkit: C.blinkit, Zepto: "#8B5CF6", Instamart: C.swiggy, "Flipkart Minutes": "#2F80ED", BigBasket: "#84C225" };

export const MapEdge: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const S = 0.94, OX = 110, OY = 40;
  const order = ["Delhi", "Haryana", "Uttar Pradesh", "Gujarat", "Maharashtra", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal"];
  return (
    <AbsoluteFill style={{ opacity: fade(t, a, a + 6, 0.3, 0.01) }}>
      <PhotoWorld src="swiggy/street_1.jpg" t={t} t0={a} hour="morning" drift={8} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(8,10,14,0.55)", backdropFilter: "blur(6px)" }} />
      <svg width={MAP.w * S} height={MAP.h * S} viewBox={`0 0 ${MAP.w} ${MAP.h}`} style={{ position: "absolute", left: OX, top: OY, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}>
        {Object.entries(MAP.states as Record<string, string>).map(([name, d]) => {
          const edge = STATE_EDGE[name];
          const k = edge ? order.indexOf(name) : -1;
          const p = k >= 0 ? Math.min(1, Math.max(0, (t - a - 0.6 - k * 0.12) / 0.4)) : 0;
          return <path key={name} d={d} fill={edge ? EDGE_COL[edge] : "rgba(245,241,234,0.08)"} fillOpacity={edge ? 0.12 + 0.6 * p : 1}
            stroke="rgba(245,241,234,0.55)" strokeWidth={1.1} strokeLinejoin="round" />;
        })}
        {Object.entries(CITIES).map(([name, c], i) => {
          const p = Math.min(1, Math.max(0, (t - a - 1.8 - i * 0.08) / 0.35));
          const r = 6 + Math.sqrt(c.total) * 0.9;
          return (
            <g key={name} opacity={p} transform={`translate(${c.x} ${c.y}) scale(${0.6 + 0.4 * p})`}>
              <circle r={r} fill={LEADER_COL[c.leader]} fillOpacity={0.35} stroke={LEADER_COL[c.leader]} strokeWidth={2.5} />
              <circle r={4} fill="#fff" />
            </g>
          );
        })}
      </svg>
      {/* labels for the cities that matter in the head-to-head */}
      {(["Delhi", "Chennai", "Bengaluru", "Mumbai", "Kolkata", "Hyderabad"] as const).map((n, i) => {
        const c = CITIES[n]; const p = Math.min(1, Math.max(0, (t - a - 2.4 - i * 0.1) / 0.4));
        const right = ["Chennai", "Kolkata", "Hyderabad", "Delhi"].includes(n);
        return (
          <div key={n} style={{ position: "absolute", left: OX + c.x * S + (right ? 26 : n === "Bengaluru" ? -64 : -26), top: OY + c.y * S - (n === "Bengaluru" ? 70 : 22), transform: right ? "none" : "translateX(-100%)", opacity: p,
            fontFamily: sans, fontSize: 22, color: C.ink, whiteSpace: "nowrap", background: "rgba(8,10,14,0.72)", padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.14)" }}>
            <b>{n}</b> <span style={{ color: C.blinkit }}>B {c.counts.Blinkit}</span> · <span style={{ color: C.swiggy }}>I {c.counts.Instamart}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 1060, top: 110, width: 760 }}>
        <div style={{ fontFamily: sans, fontSize: 24, letterSpacing: "0.24em", color: C.inkDim, whiteSpace: "nowrap" }}>DARK STORES · TOP 10 CITIES · JUL 2026</div>
        <Rise t={t} at={a + 0.2} style={{ marginTop: 18 }}><div style={{ fontFamily: serif, fontWeight: 600, fontSize: 64, color: C.ink, lineHeight: 1.1 }}>Kis shehar mein kiska zor</div></Rise>
        <Glass style={{ position: "relative", marginTop: 40 }} tint="rgba(248,203,70,0.10)">
          <div style={{ fontFamily: mono, fontSize: 22, color: C.inkDim, letterSpacing: "0.08em" }}>BLINKIT vs INSTAMART · HEAD TO HEAD</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: C.blinkit, marginTop: 10 }}>9 of 10 cities</div>
          <div style={{ fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 6 }}>Instamart ahead only in Chennai · 67 vs 62</div>
          <div style={{ fontFamily: sans, fontSize: 30, color: C.ink, marginTop: 6 }}>Biggest gap: Delhi · 171 vs 63</div>
        </Glass>
        <Glass style={{ position: "relative", marginTop: 26 }}>
          <div style={{ fontFamily: mono, fontSize: 22, color: C.inkDim, letterSpacing: "0.08em" }}>WHOLE MARKET · LARGEST NETWORK (dot colour)</div>
          <div style={{ display: "flex", gap: 26, marginTop: 14, fontFamily: sans, fontSize: 28, color: C.ink, flexWrap: "wrap" }}>
            {[["Blinkit", "7 cities"], ["Zepto", "Hyderabad, Chennai"], ["Flipkart Minutes", "Kolkata"]].map(([k, v]) => (
              <span key={k}><span style={{ display: "inline-block", width: 16, height: 16, borderRadius: 16, background: LEADER_COL[k], marginRight: 10 }} />{k} · <span style={{ color: C.inkDim }}>{v}</span></span>
            ))}
          </div>
        </Glass>
        <div style={{ fontFamily: mono, fontSize: 18, color: C.inkDim, marginTop: 24, lineHeight: 1.5 }}>
          Source: QuickCommerceMap, July 2026 (public store-locator data; counts are a lower bound) · State shading = that state's tracked city · Map: India boundaries by DataMeet (CC BY 4.0), as per Survey of India
        </div>
      </div>
    </AbsoluteFill>
  );
};
