import React from "react";
import { AbsoluteFill } from "remotion";
import { C, PhotoWorld, sans, serif, SerifFont } from "../look";
import { LOGO } from "./kit";
import { Rider } from "./Paper";

/*
 * YouTube thumbnails, 1280×720, three directions for the user to pick from. Numbers from FACTS.md:
 * Instamart −₹9.7 Cr a day and Blinkit +₹2 Cr a day (C5, AVRON calc from Q2 FY27 adjusted EBITDA ÷ 92 days),
 * Swiggy as much as −16% intraday on 23 Oct (S11).
 */
const Num: React.FC<{ v: string; c: string; size: number }> = ({ v, c, size }) => (
  <div style={{ fontFamily: sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.05em", color: c, lineHeight: 0.95, textShadow: "0 8px 40px rgba(0,0,0,0.55)" }}>{v}</div>
);

/** A · split screen: red loss half, green profit half, one diagonal seam. */
const Split: React.FC = () => (
  <AbsoluteFill style={{ background: "#0A0A0C" }}>
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #4A0F0C 0%, #1C0605 100%)", clipPath: "polygon(0 0, 58% 0, 42% 100%, 0 100%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(135deg, #0B2A16 0%, #04120A 100%)", clipPath: "polygon(58% 0, 100% 0, 100% 100%, 42% 100%)" }} />
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}><line x1={742} y1={0} x2={538} y2={720} stroke="#F5F1EA" strokeWidth={6} /></svg>
    <div style={{ position: "absolute", left: 56, top: 70 }}>
      <div style={{ transform: "scale(1.25)", transformOrigin: "0 0" }}>{LOGO.instamart}</div>
      <div style={{ marginTop: 70 }}><Num v="−₹9.7Cr" c="#FF6B5E" size={150} /></div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: "#F5F1EA", marginTop: 10, letterSpacing: "0.02em" }}>EVERY DAY</div>
    </div>
    <div style={{ position: "absolute", right: 56, bottom: 70, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ width: 104, height: 104, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}><div style={{ transform: "scale(1.6)" }}>{LOGO.blinkit}</div></div>
      <Num v="+₹2Cr" c="#7BE08F" size={170} />
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: "#F5F1EA", marginTop: 10, letterSpacing: "0.02em" }}>EVERY DAY</div>
    </div>
  </AbsoluteFill>
);

/** B · the film's character: the rider on a sagging 0.9% plank over "NUKSAAN", Instamart's daily loss above. */
const RiderThumb: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(90% 80% at 35% 30%, #F6EFE3 0%, #EFE6D6 45%, #CDBFA6 100%)" }}>
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
      <path d="M -10 470 L 330 470 L 360 730 L -10 730 Z" fill="#A28E77" />
      <path d="M 950 470 L 1290 470 L 1290 730 L 920 730 Z" fill="#A28E77" />
      <rect x={350} y={560} width={580} height={170} fill="rgba(194,91,74,0.28)" />
      <text x={640} y={680} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} letterSpacing="0.2em" fill="#C25B4A">NUKSAAN</text>
      <path d="M 330 470 Q 640 560 950 470" fill="none" stroke="#6F6152" strokeWidth={10} />
      <Rider t={0} x={600} y={512} s={1.15} ride={0} box={C.swiggy} tilt={-6} moving={false} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center" }}>
      <Num v="−₹9.7 Cr / day" c="#C0392B" size={118} />
    </div>
    <div style={{ position: "absolute", right: 60, top: 220, display: "flex", alignItems: "center", gap: 16, background: "#2B241C", padding: "14px 22px", borderRadius: 14 }}>
      {LOGO.instamart}
    </div>
    <div style={{ position: "absolute", left: 60, top: 220, fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 52, color: "#2B241C" }}>Blinkit: +₹2 Cr</div>
  </AbsoluteFill>
);

/** C · the crash: Swiggy's −16% day over a night city, Blinkit's profit as the counterpoint. */
const Crash: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <PhotoWorld src="swiggy/night_trails.jpg" t={0} t0={0} hour="night" drift={0} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)" }} />
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}>
      <polyline points="720,150 820,230 880,200 980,360 1040,330 1180,560" fill="none" stroke="#FF5B4D" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 1180 560 l -60 -6 l 44 -46 z" fill="#FF5B4D" />
    </svg>
    <div style={{ position: "absolute", left: 60, top: 70 }}>
      <div style={{ transform: "scale(1.4)", transformOrigin: "0 0" }}>{LOGO.swiggy}</div>
      <div style={{ marginTop: 60 }}><Num v="−16%" c="#FF5B4D" size={230} /></div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 44, color: "#F5F1EA", marginTop: 4 }}>INTRADAY · 23 OCT</div>
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 54, display: "flex", alignItems: "center", gap: 18, background: "rgba(10,12,16,0.75)", padding: "14px 24px", borderRadius: 16, border: "2px solid rgba(123,216,143,0.6)" }}>
      {LOGO.blinkit}
      <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 56, color: "#7BE08F", letterSpacing: "-0.03em" }}>+₹184 Cr Q2 profit</span>
    </div>
  </AbsoluteFill>
);

export const SwiggyThumbnail: React.FC<{ v?: "split" | "rider" | "crash" }> = ({ v = "split" }) => (
  <AbsoluteFill>
    <SerifFont />
    {v === "split" && <Split />}
    {v === "rider" && <RiderThumb />}
    {v === "crash" && <Crash />}
  </AbsoluteFill>
);
