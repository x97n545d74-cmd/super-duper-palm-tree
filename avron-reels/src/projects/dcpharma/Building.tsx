import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp, prog } from "../../engine/anim";
import { G, GRASS, GREY, INK_D, lbl, mono, PAPER, RED, Rack, Rise, sx } from "./kit";

/*
 * layers → cooling: one data centre built as a paper collage on graph paper (ref 01, look from anchor/ReelV2.tsx Collage).
 * Ground (ZAMEEN) → server hall (SERVER) → roof chiller (COOLING). The camera tilts through the building:
 * the reel's one vertical move. World units are px at scale 1; the grass strip continues the Anant Raj line.
 */

type Cam = { s: number; cy: number; fy: number };
const OVER: Cam = { s: 0.55, cy: 2400, fy: 1340 }; // grass top lands on screen y 1340 (the flattened red line)
const GROUND: Cam = { s: 1.0, cy: 2275, fy: 1050 };
const HALL: Cam = { s: 0.85, cy: 1825, fy: 1010 };
const ROOF: Cam = { s: 1.0, cy: 1310, fy: 1060 };
const mix = (a: Cam, b: Cam, p: number): Cam => ({ s: lerp(a.s, b.s, p), cy: lerp(a.cy, b.cy, p), fy: lerp(a.fy, b.fy, p) });

const PAPER_W = "#FAF7F0";
const shadow = "8px 10px 0 rgba(22,24,42,0.18)";

const Card: React.FC<{ t: number; a: number; out: number; top: number; rot: number; name: string; lines: string[] }> = ({ t, a, out, top, rot, name, lines }) => {
  const p = ease.outExpo(clamp01((t - a) / 0.45));
  const o = 1 - prog(t, out, 0.25);
  return (
    <div style={{ position: "absolute", left: G, right: G, top, opacity: clamp01(p * 2) * o, transform: `translateY(${(1 - p) * -60}px) rotate(${rot * p}deg)`,
      padding: "26px 30px", background: PAPER_W, boxShadow: shadow }}>
      <div style={{ position: "absolute", left: "50%", top: -11, width: 22, height: 22, marginLeft: -11, borderRadius: 11, background: RED }} />
      <div style={sx(64, 900, INK_D)}>{name}</div>
      {lines.map((l) => <div key={l} style={{ ...lbl(54, INK_D, 800), marginTop: 10, whiteSpace: "nowrap" }}>{l}</div>)}
    </div>
  );
};

const Tag: React.FC<{ t: number; a: number; out: number; text: string; est?: string }> = ({ t, a, out, text, est }) => (
  <div style={{ position: "absolute", left: G, right: G, bottom: 1920 - 1405, opacity: prog(t, a, 0.4) * (1 - prog(t, out, 0.25)) }}>
    <span style={{ display: "inline-block", padding: "6px 12px", background: "rgba(239,230,210,0.92)", fontFamily: mono, fontWeight: 500, fontSize: 28, lineHeight: 1.35, color: "rgba(22,24,42,0.7)" }}>
      {text}{est && <span style={{ color: RED, marginLeft: 12 }}>{est}</span>}
    </span>
  </div>
);

export const Building: React.FC<{ t: number; S: (id: string) => number; E: (id: string) => number }> = ({ t, S, E }) => {
  const aL = S("layers"), aZ = S("zameen"), aS = S("server"), aC = S("cooling"), end = E("cooling");
  // camera: overview → tilt down to the ground → up one storey → up to the roof → zoom out to the whole building
  let cam = OVER;
  cam = mix(cam, GROUND, prog(t, aZ - 0.25, 0.6, ease.inOutCubic));
  cam = mix(cam, HALL, prog(t, aS - 0.2, 0.6, ease.inOutCubic));
  cam = mix(cam, ROOF, prog(t, aC - 0.2, 0.6, ease.inOutCubic));
  cam = mix(cam, OVER, prog(t, end - 0.7, 0.6, ease.inOutCubic));
  const push = 1 + 0.02 * (t - aL);
  const tx = 540 - 540 * cam.s, ty = cam.fy - cam.cy * cam.s;

  const outline = prog(t, aL + 0.25, 1.3, ease.inOutCubic);
  const slab = prog(t, aZ, 0.7, ease.outExpo);
  const hall = prog(t, aS - 0.1, 0.5, ease.outExpo);
  const rackIn = prog(t, aS + 0.2, 0.6, ease.outExpo);
  const bar = prog(t, aS + 0.8, 1.1, ease.inOutCubic);
  const drop = prog(t, aC + 0.15, 0.7, ease.outExpo);
  const fan = Math.max(0, t - (aC + 0.6)) * 120; // degrees, linear (no easing, no bounce)

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "540px 960px" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${cam.s})` }}>
          {/* graph paper */}
          <div style={{ position: "absolute", left: -1000, top: -200, width: 3080, height: 4600, background: PAPER,
            backgroundImage: "linear-gradient(rgba(22,24,42,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(22,24,42,0.10) 1.5px, transparent 1.5px)", backgroundSize: "40px 40px" }} />
          {/* planned cross-section, drawn as a dashed pencil outline */}
          <svg width={1080} height={2500} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            {[[330, 1200, 420, 240], [200, 1440, 680, 60], [220, 1500, 640, 650], [180, 2150, 720, 250]].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke={INK_D} strokeOpacity={0.55} strokeWidth={4} strokeDasharray="14 12"
                opacity={clamp01(outline * 1.6 - i * 0.2) * (1 - 0.7 * prog(t, aZ, 0.5))} />
            ))}
          </svg>
          {/* ZAMEEN: ground slab rises out of the grass */}
          <div style={{ position: "absolute", left: 180, top: 2150 + (1 - slab) * 260, width: 720, height: 250, background: INK_D, boxShadow: shadow, opacity: slab > 0 ? 1 : 0 }}>
            <div style={{ position: "absolute", left: 40, right: 40, top: 40, bottom: 40, border: "3px dashed rgba(239,230,210,0.45)" }} />
          </div>
          {/* SERVER: hall walls + roof, a rack slides in from the right, 62% fills inside it */}
          <div style={{ position: "absolute", left: 220, top: 1500, width: 640, height: 650, background: PAPER_W, border: `6px solid ${INK_D}`, boxSizing: "border-box", boxShadow: shadow,
            opacity: hall, transform: `translateY(${(1 - hall) * 60}px)` }} />
          <div style={{ position: "absolute", left: 200, top: 1440, width: 680, height: 60, background: INK_D, boxShadow: shadow, opacity: hall, transform: `translateY(${(1 - hall) * 40}px)` }} />
          <svg width={1080} height={2500} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: rackIn > 0 ? 1 : 0 }}>
            <g transform={`translate(${(1 - rackIn) * 900} 0)`}>
              <rect x={300} y={1600} width={240} height={510} rx={8} fill={INK_D} />
              <Rack x={300} y={1600} w={240} h={510} n={24} stroke={PAPER} slotStroke={() => "rgba(239,230,210,0.35)"} />
              <rect x={324} y={1600 + 510 - 30 - 450 * 0.62 * bar} width={192} height={450 * 0.62 * bar} fill={PAPER} opacity={0.92} />
              <line x1={290} x2={560} y1={1600 + 510 - 30 - 450 * 0.62} y2={1600 + 510 - 30 - 450 * 0.62} stroke={RED} strokeWidth={4} strokeDasharray="10 8" opacity={clamp01(bar * 4 - 3)} />
              <text x={590} y={1600 + 510 - 30 - 450 * 0.62 + 34} fontFamily="'Inter', sans-serif" fontWeight={900} fontSize={100} fill={INK_D} opacity={clamp01(bar * 3) * (1 - prog(t, aC - 0.1, 0.35))}>{Math.round(62 * bar)}%</text>
            </g>
          </svg>
          {/* COOLING: a paper chiller drops onto the roof, fans turn slowly */}
          <div style={{ position: "absolute", left: 330, top: 1200 - (1 - drop) * 700, width: 420, height: 240, background: "#C9C2B0", border: `5px solid ${INK_D}`, boxSizing: "border-box", boxShadow: shadow, opacity: drop > 0 ? 1 : 0 }}>
            {[110, 310].map((cx) => (
              <svg key={cx} width={170} height={170} style={{ position: "absolute", left: cx - 85 - 5, top: 30 }}>
                <circle cx={85} cy={85} r={78} fill={PAPER_W} stroke={INK_D} strokeWidth={5} />
                <g transform={`rotate(${fan} 85 85)`}>
                  {[0, 120, 240].map((r) => <path key={r} d="M85 85 C 70 50, 80 22, 98 18 C 104 45, 98 70, 85 85 Z" fill={INK_D} transform={`rotate(${r} 85 85)`} />)}
                </g>
                <circle cx={85} cy={85} r={9} fill={GREY} />
              </svg>
            ))}
          </div>
          {/* grass strip in front of the slab's lower edge */}
          <div style={{ position: "absolute", left: -1000, top: 2400, width: 3080, height: 2000, background: GRASS }} />
          <div style={{ position: "absolute", left: -1000, top: 2400, width: 3080, height: 10, background: "#0B5E46" }} />
        </div>
      </AbsoluteFill>

      {/* type, screen space */}
      {t < aZ && (
        <div style={{ position: "absolute", left: G, top: 262, opacity: 1 - prog(t, aZ - 0.2, 0.2) }}>
          {/* the layers beat is 2.4 s, so all four lines are in by beat + 0.5 s and hold ~1.7 s */}
          <Rise t={t} a={aL + 0.05}><div style={sx(96, 900, INK_D)}>1 DATA CENTRE</div></Rise>
          <Rise t={t} a={aL + 0.15} style={{ marginTop: 8 }}><div style={sx(96, 900, INK_D)}>= 3 LAYERS</div></Rise>
          <Rise t={t} a={aL + 0.35} style={{ marginTop: 26 }}><div style={lbl(54, INK_D, 800)}>INDIA 1.6 GW → ~6 GW</div></Rise>
          <Rise t={t} a={aL + 0.45} style={{ marginTop: 8 }}><div style={{ ...lbl(44, RED, 800) }}>(2029, JLL ANUMAAN)</div></Rise>
        </div>
      )}

      {t >= aZ - 0.05 && t < aS && (
        <>
          {/* zameen is only 1.9 s: cards land on "Anant Raj" (beat + 0.7 s) and "Lodha" (+1.6 s) would leave no hold, so both are in by +0.4 s */}
          <div style={{ position: "absolute", left: G, top: 262 }}><Rise t={t} a={aZ + 0.02} out={aS - 0.15}><div style={sx(64, 900, INK_D)}>ZAMEEN</div></Rise></div>
          <Card t={t} a={aZ + 0.12} out={aS - 0.12} top={370} rot={-1.5} name="ANANT RAJ" lines={["~28 MW LIVE, 63 MW TARGET", "(DEC 2026)"]} />
          <Card t={t} a={aZ + 0.3} out={aS - 0.12} top={650} rot={1.2} name="LODHA" lines={["PALAVA ~400 ACRE, AWS + STT"]} />
          <Tag t={t} a={aZ + 0.3} out={aS - 0.12} text="Anant Raj: company guidance · Lodha release + deck" />
        </>
      )}
      {t >= aS - 0.05 && t < aC && (
        <>
          <div style={{ position: "absolute", left: G, top: 262 }}><Rise t={t} a={aS + 0.05} out={aC - 0.25}><div style={sx(64, 900, INK_D)}>SERVER</div></Rise></div>
          <Card t={t} a={aS + 0.3} out={aC - 0.25} top={370} rot={-1.2} name="NETWEB" lines={["Q1 FY27: 62% REVENUE", "AI SYSTEMS SE"]} />
          <Tag t={t} a={aS + 0.5} out={aC - 0.25} text="Netweb Q1 FY27 results" />
        </>
      )}
      {t >= aC - 0.05 && (
        <>
          <div style={{ position: "absolute", left: G, top: 262 }}><Rise t={t} a={aC + 0.05} out={end - 0.6}><div style={sx(64, 900, INK_D)}>COOLING</div></Rise></div>
          <Card t={t} a={aC + 0.3} out={end - 0.6} top={370} rot={1.2} name="BLUE STAR" lines={["Q1 FY27 ORDERS:", "ZYADA TAR DATA CENTRES"]} />
          <Tag t={t} a={aC + 0.5} out={end - 0.6} text="Blue Star deck + release, Aug 2026" />
        </>
      )}
    </AbsoluteFill>
  );
};
