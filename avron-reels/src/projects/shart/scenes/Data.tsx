import React from "react";
import { scaleLinear } from "d3-scale";
import { color, font } from "../../../brand/tokens";
import { clamp01, ease, lerp, prog } from "../../../engine/anim";
import { Counter, Label, SourceTag, WordReveal } from "../../../engine/components/Kinetic";
import { DataRoom } from "../../../engine/components/DataRoom";
import { OilSurface } from "../../../engine/three/OilSurface";
import { at, C, S } from "../config";

const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; alert?: number }> = ({ children, style, alert = 0 }) => (
  <div style={{ borderRadius: 22, padding: "30px 36px", background: "linear-gradient(160deg, rgba(28,30,36,0.82), rgba(10,11,14,0.86))",
    border: `1.5px solid rgba(${alert > 0 ? "220,70,70" : "243,241,236"},${0.14 + alert * 0.5})`,
    boxShadow: `0 40px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 ${alert * 60}px rgba(200,50,58,${alert * 0.35})`, ...style }}>
    {children}
  </div>
);

/** Shot 4: market stress dashboard (verified values only). */
export const Market: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.market;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const brent = at("b4_market", "$113"), rbi = at("b4_market", "RBI"), pehli = at("b4_market", "पहली");
  const pulse = (t0: number) => (t >= t0 ? Math.exp(-(t - t0) * 2.5) : 0);
  const tilt = lerp(10, 3, prog(t, a, 6));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <DataRoom t={t} tint={color.crimson} drift={0.6} />
      <div style={{ position: "absolute", top: 285, left: 84, right: 84 }}>
        <WordReveal text="लेकिन crude रुका नहीं" t={t} start={a + 0.15}
          style={{ fontFamily: font.deva, fontWeight: 800, fontSize: 62, color: color.ink }} />
      </div>
      <div style={{ position: "absolute", left: 84, right: 84, top: 430, perspective: 1600 }}>
        <div style={{ transform: `rotateX(${tilt}deg)`, transformOrigin: "50% 0%", display: "flex", flexDirection: "column", gap: 34 }}>
          <Glass alert={pulse(brent)} style={{ opacity: prog(t, brent - 0.6, 0.4), transform: `translateY(${(1 - prog(t, brent - 0.6, 0.6, ease.outExpo)) * 40}px)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 24, color: color.inkDim, letterSpacing: "0.08em" }}>
              <span>BRENT · DEC CONTRACT</span><span>SETTLE · 22 OCT 2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginTop: 10 }}>
              <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 150, letterSpacing: "-0.04em", color: color.ink }}>
                $<Counter to={113.17} t={t} start={brent - 0.5} dur={0.9} decimals={2} />
              </span>
              <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 38, color: "#FF6A6A" }}>▲ 4%</span>
            </div>
            <div style={{ marginTop: 6 }}><SourceTag text="BLOOMBERG VIA RIGZONE" t={t} start={brent + 0.2} style={{ fontSize: 19 }} /></div>
          </Glass>
          <Glass alert={pulse(rbi)} style={{ opacity: prog(t, rbi - 0.5, 0.4), transform: `translateY(${(1 - prog(t, rbi - 0.5, 0.6, ease.outExpo)) * 40}px)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: font.mono, fontSize: 24, color: color.inkDim, letterSpacing: "0.08em" }}>
              <span>RBI · POLICY REPO RATE</span><span>MPC · 7 OCT 2026</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginTop: 10 }}>
              <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 70, color: color.inkFaint }}>5.25%</span>
              <span style={{ fontFamily: font.display, fontSize: 56, color: color.inkFaint }}>→</span>
              <span style={{ fontFamily: font.display, fontWeight: 800, fontSize: 120, letterSpacing: "-0.03em", color: color.ink,
                opacity: prog(t, rbi + 0.3, 0.3) }}>5.50%</span>
            </div>
            <div style={{ marginTop: 8, fontFamily: font.deva, fontWeight: 700, fontSize: 34, color: "#FF8A80", opacity: prog(t, pehli - 0.1, 0.35) }}>
              February 2023 के बाद पहली बढ़ोतरी
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
              <SourceTag text="RBI MONETARY POLICY STATEMENT" t={t} start={rbi + 0.5} style={{ fontSize: 19 }} />
              <SourceTag text="'FIRST SINCE FEB 2023': BUSINESS STANDARD" t={t} start={pehli + 0.3} style={{ fontSize: 19 }} />
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
};

/** Shot 5: the estimated loss per litre, over a dark oil surface under red light. */
export const Omc: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.omc;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const slam = clamp01((t - C.loss34) / 0.3);
  const split = t >= C.loss34 ? Math.exp(-(t - C.loss34) * 9) * 12 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <OilSurface t={t} cam={{ h: lerp(0.9, 0.6, prog(t, a, 7)), pitch: 0.16, yaw: lerp(-0.06, 0.05, prog(t, a, 7)) }} exposure={1.4}
        glow={[1.0, 0.22, 0.12]} glowEl={0.1} ripple={t >= C.loss34 ? 1 : 0} rippleT={C.loss34} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,7,10,0.75) 0%, rgba(6,7,10,0.3) 35%, rgba(6,7,10,0) 55%)" }} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <Label text="Brokerage estimate · 22 Oct 2026" t={t} start={a + 0.1} tint="#FF9A94" />
        <WordReveal text="Oil companies का घाटा" t={t} start={a + 0.4}
          style={{ justifyContent: "center", marginTop: 16, fontFamily: font.deva, fontWeight: 800, fontSize: 64, color: color.ink }} />
        <div style={{ marginTop: 40, fontFamily: font.display, fontWeight: 800, fontSize: 290, lineHeight: 1, letterSpacing: "-0.05em", color: color.loss,
          opacity: slam > 0 ? 1 : 0, transform: `scale(${t < C.loss34 ? 0 : lerp(1.8, 1, ease.outBack(slam))})`,
          textShadow: `${split}px 0 0 rgba(0,220,255,0.5), ${-split}px 0 0 rgba(255,40,40,0.7), 0 0 90px rgba(240,82,79,0.45)` }}>
          −₹34
        </div>
        <div style={{ fontFamily: font.deva, fontWeight: 700, fontSize: 46, color: color.ink, marginTop: 6, opacity: prog(t, C.loss34 + 0.3, 0.4) }}>
          हर litre diesel पर
        </div>
        <div style={{ marginTop: 26, display: "flex", justifyContent: "center" }}>
          <SourceTag text="JEFFERIES ESTIMATE · VIA BUSINESS TODAY" t={t} start={C.loss34 + 0.5} estimate />
        </div>
      </div>
    </div>
  );
};

/** Shot 6: the promise: FY27 fiscal deficit + the debt glide path (actual/estimate points solid, target dashed). */
export const Promise: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.promise;
  const enter = prog(t, a, 0.5);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const x = scaleLinear().domain([0, 5]).range([150, 930]); // FY26..FY31
  const y = scaleLinear().domain([47, 58]).range([1230, 830]);
  const draw = prog(t, C.debt - 0.9, 1.6, ease.inOutCubic);
  const targetX = lerp(x(1), x(5), draw);
  const targetY = lerp(y(55.6), y(50), draw);
  const pushIn = prog(t, b - 1.1, 1.1, ease.inCubic); // camera dives into the footnote marker
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP) }}>
      <DataRoom t={t} tint={color.gold} drift={0.4} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + pushIn * 1.6})`, transformOrigin: `${(x(5) / 1080) * 100}% ${(y(50) / 1920) * 100}%` }}>
        <div style={{ position: "absolute", top: 285, left: 84, right: 84 }}>
          <div style={{ fontFamily: font.devaSerif, fontWeight: 800, fontSize: 84, color: color.goldHot, opacity: prog(t, a + 0.1, 0.5) }}>सरकार का वादा</div>
          <Label text="Union Budget 2026-27 · 1 Feb 2026" t={t} start={a + 0.4} style={{ marginTop: 6 }} />
        </div>
        <div style={{ position: "absolute", top: 520, left: 84, opacity: prog(t, C.fd - 0.6, 0.4) }}>
          <div style={{ fontFamily: font.mono, fontSize: 24, color: color.inkDim, letterSpacing: "0.1em" }}>FISCAL DEFICIT · FY27 (BE)</div>
          <div style={{ fontFamily: font.display, fontWeight: 800, fontSize: 170, letterSpacing: "-0.04em", color: color.ink, lineHeight: 1.05 }}>
            <Counter to={4.3} from={0} t={t} start={C.fd - 0.5} dur={0.9} decimals={1} />%
            <span style={{ fontSize: 40, fontWeight: 600, color: color.inkDim, marginLeft: 16 }}>of GDP</span>
          </div>
        </div>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: prog(t, C.fd + 0.6, 0.5) }}>
          <text x={150} y={800} fill={color.inkDim} fontFamily="JetBrains Mono" fontSize={22} letterSpacing="2">CENTRAL GOVT DEBT · % OF GDP</text>
          {[50, 52, 54, 56].map((v) => (
            <g key={v}>
              <line x1={150} x2={930} y1={y(v)} y2={y(v)} stroke={color.line} />
              <text x={136} y={y(v) + 7} fill={color.inkFaint} fontFamily="JetBrains Mono" fontSize={20} textAnchor="end">{v}</text>
            </g>
          ))}
          {["FY26", "FY27", "FY28", "FY29", "FY30", "FY31"].map((l, i) => (
            <text key={l} x={x(i)} y={1268} fill={color.inkFaint} fontFamily="JetBrains Mono" fontSize={20} textAnchor="middle">{l}</text>
          ))}
          {/* ±1 target band at FY31 */}
          <rect x={x(5) - 26} y={y(51)} width={52} height={y(49) - y(51)} rx={6} fill={color.gold} opacity={0.18 * draw} />
          <line x1={x(0)} x2={x(1)} y1={y(56.1)} y2={y(55.6)} stroke={color.goldHot} strokeWidth={5} />
          <line x1={x(1)} x2={targetX} y1={y(55.6)} y2={targetY} stroke={color.gold} strokeWidth={4} strokeDasharray="12 10" />
          <circle cx={x(0)} cy={y(56.1)} r={9} fill={color.goldHot} />
          <circle cx={x(1)} cy={y(55.6)} r={9} fill={color.goldHot} />
          <text x={x(0)} y={y(56.1) - 22} fill={color.ink} fontFamily="Inter" fontWeight={700} fontSize={26} textAnchor="middle">56.1 RE</text>
          <text x={x(1) + 6} y={y(55.6) - 22} fill={color.ink} fontFamily="Inter" fontWeight={700} fontSize={26} textAnchor="start">55.6 BE</text>
          <g opacity={prog(t, C.debt + 0.3, 0.5)}>
            <circle cx={x(5)} cy={y(50)} r={10} fill="none" stroke={color.goldHot} strokeWidth={3} />
            <text x={x(5)} y={y(51) - 18} fill={color.goldHot} fontFamily="Inter" fontWeight={800} fontSize={30} textAnchor="end">50±1% target*</text>
            <text x={x(5)} y={y(49) + 34} fill={color.inkDim} fontFamily="Inter" fontSize={20} textAnchor="end">by 31 Mar 2031 · glide path, not data</text>
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center" }}>
          <SourceTag text="PIB · BUDGET SPEECH 2026-27 ¶92–93" t={t} start={C.debt + 0.5} style={{ fontSize: 19 }} />
        </div>
      </div>
    </div>
  );
};

const CLAUSE = "Sans any major macro-economic disruptive exogenous shock(s),";
const CLAUSE_REST = "and while keeping in mind potential growth trends and emergent development needs, the Government would endeavour to keep fiscal deficit in each year (from FY 2026-27 till FY 2030-31) such that the Central Government debt is on declining path to attain a debt to GDP level of about 50±1 per cent by 31st March 2031.";

/** Shot 7: the fine print: macro on the real clause, lit word by word in a single gold light. */
export const Clause: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.clause;
  const enter = prog(t, a, 0.6);
  const exitP = prog(t, b - 0.4, 0.4, ease.inCubic);
  const words = CLAUSE.split(" ");
  const litStart = C.bina - 0.2, litEnd = C.extshock + 0.3;
  const push = prog(t, a, b - a, ease.linear);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), background: "#020203" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(42% 26% at 52% 52%, rgba(240,208,138,${0.16 + 0.08 * push}), transparent 70%)` }} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: font.devaSerif, fontWeight: 800, fontSize: 120, color: color.goldHot, opacity: prog(t, C.shart - 0.15, 0.35),
          letterSpacing: `${lerp(0.25, 0.04, prog(t, C.shart - 0.15, 0.9, ease.outExpo))}em` }}>शर्त</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 640, perspective: 1400 }}>
        <div style={{ transform: `rotateX(${lerp(26, 18, push)}deg) rotateZ(${lerp(-3, -1.5, push)}deg) scale(${lerp(1.0, 1.12, push)})`, transformOrigin: "50% 40%",
          padding: "44px 46px", background: "linear-gradient(180deg, #ece5d6, #d8cfbd)", borderRadius: 4, boxShadow: "0 50px 90px rgba(0,0,0,0.7)",
          WebkitMaskImage: "radial-gradient(75% 70% at 50% 45%, #000 55%, rgba(0,0,0,0.25) 100%)" }}>
          <div style={{ fontFamily: font.text, fontWeight: 700, fontSize: 19, letterSpacing: "0.14em", color: "#6b5b3d" }}>
            MEDIUM-TERM FISCAL POLICY CUM FISCAL POLICY STRATEGY STATEMENT · BUDGET 2025-26
          </div>
          <div style={{ fontFamily: "'Charter', 'Bitstream Charter', serif", fontSize: 40, lineHeight: 1.42, color: "#2a2620", marginTop: 20 }}>
            {words.map((wd, i) => {
              const lit = clamp01((t - (litStart + (i / words.length) * (litEnd - litStart))) / 0.25);
              return (
                <span key={i} style={{ background: `rgba(201,164,92,${0.55 * lit})`, boxShadow: lit ? `0 0 ${18 * lit}px rgba(240,208,138,${0.5 * lit})` : undefined,
                  color: lit > 0.5 ? "#120f08" : "#2a2620", fontWeight: lit > 0.5 ? 700 : 400, padding: "0 3px", marginRight: 6 }}>{wd}</span>
              );
            })}
            <span style={{ opacity: 0.55 }}>{CLAUSE_REST}</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1265, display: "flex", justifyContent: "center" }}>
        <SourceTag text="MINISTRY OF FINANCE · indiabudget.gov.in · FRBM STATEMENT 2025-26" t={t} start={C.bina} style={{ fontSize: 19 }} />
      </div>
    </div>
  );
};

/** Shot 8: the government's own words (verbatim PIB headline), "Global Oil Shock" lit red. */
export const Shock: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = S.shock;
  const enter = prog(t, a, 0.4);
  const exitP = prog(t, b - 0.45, 0.45, ease.inCubic);
  const hit = prog(t, C.gos - 0.05, 0.35, ease.outExpo);
  const sweep = prog(t, a + 0.1, 1.4, ease.inOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - exitP), background: "radial-gradient(70% 50% at 50% 50%, #170708 0%, #040203 75%)" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, width: 260, left: lerp(-300, 1200, sweep),
        background: "linear-gradient(90deg, transparent, rgba(255,90,80,0.12), transparent)" }} />
      <div style={{ position: "absolute", top: 300, left: 84, right: 84 }}>
        <Label text="Press Information Bureau · 27 Mar 2026" t={t} start={a + 0.1} tint="#FF9A94" />
        <WordReveal text="March में सरकार ने खुद इसे कहा" t={t} start={a + 0.25}
          style={{ marginTop: 16, fontFamily: font.deva, fontWeight: 800, fontSize: 58, color: color.ink }} />
      </div>
      <div style={{ position: "absolute", left: 84, right: 84, top: 640, padding: "40px 40px", borderLeft: `6px solid ${color.crimson}`,
        background: "rgba(255,255,255,0.03)", opacity: prog(t, a + 0.5, 0.4) }}>
        <div style={{ fontFamily: font.display, fontWeight: 700, fontSize: 52, lineHeight: 1.25, color: color.inkDim }}>
          “Government Slashes Excise Duty on Petrol and Diesel to Shield Consumers and OMCs from{" "}
          <span style={{ color: hit > 0 ? "#FF5E57" : color.inkDim, fontWeight: 800, textShadow: `0 0 ${40 * hit}px rgba(255,80,70,0.6)`,
            display: "inline-block", transform: `scale(${lerp(1, 1.06, hit * (1 - prog(t, C.gos + 0.4, 0.6)))})` }}>Global Oil Shock</span>”
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1265, display: "flex", justifyContent: "center" }}>
        <SourceTag text="PIB HEADLINE, VERBATIM · PRID 2245970" t={t} start={a + 0.8} style={{ fontSize: 19 }} />
      </div>
    </div>
  );
};

