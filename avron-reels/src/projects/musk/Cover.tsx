import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SerifFont, serif } from "../swiggy/look";

/* Reel cover for the Musk SpaceX-kids reel. Key text sits inside the centre 4:5 crop (y ≈ 285–1635) so the profile grid keeps it. */
const INK = "#F4F2EC";
const GREEN = "#3DDC84";
const INK_D = "#16182A";
const sans = "'Inter Display', 'Inter', sans-serif";
const mono = "'JetBrains Mono', monospace";

export const MuskCover: React.FC = () => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <SerifFont />
    {/* blue grid glow (reference) */}
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #000 0%, #000 20%, #1F2BBF66 45%, #000 60%)" }} />
    <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)", backgroundSize: "60px 60px",
      maskImage: "linear-gradient(180deg, transparent 0%, #000 25%, #000 50%, transparent 62%)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 25%, #000 50%, transparent 62%)" }} />
    {/* the anchor */}
    <Img src={staticFile("musk/cover_her.jpg")} style={{ position: "absolute", left: 0, top: 640, width: 1080, height: 1920, objectFit: "cover",
      maskImage: "linear-gradient(180deg, transparent 0%, #000 18%)", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 18%)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 75%, rgba(0,0,0,0.6) 100%)" }} />
    {/* X post card */}
    <div style={{ position: "absolute", left: 110, right: 110, top: 300, padding: "18px 22px", borderRadius: 26, background: "rgba(245,243,238,0.92)", display: "flex", gap: 16, alignItems: "center",
      transform: "rotate(-2deg)", boxShadow: "0 20px 40px rgba(0,0,0,0.45)" }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: INK_D, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 800, fontSize: 28, flexShrink: 0 }}>𝕏</div>
      <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 25, lineHeight: 1.3, color: INK_D }}>
        <b>Elon Musk</b> · "Next year, I will give one of my SpaceX shares to every kid in America."
      </div>
    </div>
    {/* title */}
    <div style={{ position: "absolute", left: 70, right: 70, top: 470, textAlign: "center" }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 112, letterSpacing: "-0.045em", lineHeight: 0.98, color: INK, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>SpaceX share gift</div>
      <div style={{ fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 70, color: INK, marginTop: 14, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>har bachche ko</div>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 150, letterSpacing: "-0.05em", lineHeight: 1, color: GREEN, marginTop: 4, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>$147</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center" }}>
      <span style={{ display: "inline-block", padding: "12px 26px", borderRadius: 999, background: GREEN, fontFamily: sans, fontWeight: 900, fontSize: 44, letterSpacing: "-0.02em", color: INK_D }}>₹1 lakh crore ka gift?</span>
    </div>
    <div style={{ position: "absolute", left: 70, top: 110, padding: "8px 14px", borderRadius: 999, background: "rgba(7,9,13,0.72)", fontFamily: sans, fontWeight: 800, fontSize: 26, letterSpacing: "0.42em", color: INK }}>AVRON</div>
    <div style={{ position: "absolute", right: 70, top: 116, fontFamily: mono, fontSize: 18, letterSpacing: "0.12em", color: "rgba(244,242,236,0.7)" }}>19 OCT 2026</div>
  </AbsoluteFill>
);
