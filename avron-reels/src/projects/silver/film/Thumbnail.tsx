import React from "react";
import { AbsoluteFill } from "remotion";
import { Coin } from "../Scenes";
import { Ledger } from "../Demos";
import { SerifFont } from "../../swiggy/look";

/* YouTube thumbnails for the silver film, 1280×720. Three words or fewer, readable at phone size. */
const sans = "'Inter Display', 'Inter', sans-serif";
const serif = "'Playfair Display', Georgia, serif";
const RED = "#FF3B30";

/** A: the hook. The Dhanteras coin on a brass thali, cut by a red price line. */
const CoinCut: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(80% 90% at 70% 55%, #23242A, #0B0B0C 70%)" }}>
    <div style={{ position: "absolute", left: 640, top: 210, width: 600, height: 600, perspective: 1500 }}>
      <div style={{ position: "absolute", left: 0, top: 120, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #E8BE62, #B8862F 55%, #6E4A14)", transform: "rotateX(58deg)", boxShadow: "0 40px 60px rgba(0,0,0,0.7)" }} />
      <div style={{ position: "absolute", left: 110, top: 70, transform: "rotateX(48deg) rotateZ(-12deg)" }}><Coin size={380} cutAt={0} t={1} /></div>
    </div>
    <svg width={1280} height={720} style={{ position: "absolute", inset: 0 }}><line x1={560} y1={60} x2={1280} y2={700} stroke={RED} strokeWidth={10} strokeLinecap="round" /></svg>
    <div style={{ position: "absolute", left: 60, top: 150, fontFamily: sans, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95 }}>
      <div style={{ fontSize: 150, color: "#F3F1EC" }}>KAMI</div>
      <div style={{ fontSize: 96, color: "#C9CED6" }}>phir bhi</div>
      <div style={{ fontSize: 150, color: RED }}>CRASH</div>
    </div>
    <div style={{ position: "absolute", left: 64, bottom: 54, fontFamily: sans, fontWeight: 800, fontSize: 34, letterSpacing: "0.3em", color: "#8A919C" }}>CHANDI</div>
  </AbsoluteFill>
);

/** B: the number. −55% in the ledger, with a red stamp. */
const LedgerCrash: React.FC = () => (
  <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
    <SerifFont />
    <Ledger />
    <div style={{ position: "absolute", left: 210, top: 140, fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 120, color: "#1F2A44" }}>Chandi · 5 saal kami</div>
    <div style={{ position: "absolute", left: 200, top: 300, fontFamily: sans, fontWeight: 900, fontSize: 470, letterSpacing: "-0.07em", color: RED, lineHeight: 1 }}>−55%</div>
    <div style={{ position: "absolute", left: 1150, top: 820, border: `12px double ${RED}`, color: RED, padding: "14px 40px", fontFamily: sans, fontWeight: 900, fontSize: 92, letterSpacing: "0.1em", transform: "rotate(-8deg)", mixBlendMode: "multiply" }}>CRASH</div>
  </AbsoluteFill>
);

/** C: the trap. Rohan's phone with the margin call, the coin beside it. */
const MarginCall: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(160deg, #15171D, #06070A)" }}>
    <div style={{ position: "absolute", left: 760, top: 40, width: 400, height: 760, borderRadius: 56, background: "#0B0C10", border: "3px solid #2A2D35", boxShadow: "0 50px 100px rgba(0,0,0,0.7)", overflow: "hidden", transform: "rotate(6deg)" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,59,48,0.22)" }} />
      <div style={{ position: "absolute", left: 30, top: 90, fontFamily: sans, fontWeight: 900, fontSize: 64, color: RED }}>−31%</div>
      <div style={{ position: "absolute", left: 22, right: 22, top: 240, background: "#1B1D23", border: `2px solid ${RED}`, borderRadius: 26, padding: "22px 24px" }}>
        <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 46, color: "#F3F1EC", lineHeight: 1.05 }}>MARGIN CALL</div>
        <div style={{ fontFamily: sans, fontSize: 26, color: "#B8BDC6", marginTop: 8 }}>Shortfall ₹2,00,000</div>
      </div>
    </div>
    <div style={{ position: "absolute", left: 60, top: 170, fontFamily: sans, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.95 }}>
      <div style={{ fontSize: 120, color: "#F3F1EC" }}>Chandi ka</div>
      <div style={{ fontSize: 170, color: RED }}>TRAP</div>
    </div>
    <div style={{ position: "absolute", left: 70, top: 520, transform: "rotateX(50deg) rotateZ(-10deg)" }}><Coin size={220} cutAt={999} t={0} /></div>
  </AbsoluteFill>
);

export const SilverThumbnail: React.FC<{ v: "A" | "B" | "C" }> = ({ v }) => (v === "A" ? <CoinCut /> : v === "B" ? <LedgerCrash /> : <MarginCall />);
