import React from "react";
import { AbsoluteFill } from "remotion";
import { C, PhotoWorld, sans, serif, SerifFont } from "../look";
import { LOGO } from "./kit";

/** YouTube thumbnail, 1280×720: the film's one contrast, readable at phone size. Numbers from FACTS.md (C5). */
export const SwiggyThumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <SerifFont />
    <AbsoluteFill style={{ transform: "scale(0.6667)", transformOrigin: "0 0", width: 1920, height: 1080 }}>
      <PhotoWorld src="swiggy/night_trails.jpg" t={0} t0={0} hour="night" drift={0} />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.75) 100%)" }} />
    <div style={{ position: "absolute", top: 46, left: 0, right: 0, textAlign: "center", fontFamily: serif, fontWeight: 700, fontSize: 66, color: C.ink }}>
      ₹9.7 Crore a Day
    </div>
    <div style={{ position: "absolute", top: 210, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      {[
        { logo: LOGO.instamart, v: "−₹9.7 Cr", c: C.loss, cap: "lost every day" },
        { logo: LOGO.blinkit, v: "+₹2 Cr", c: C.gain, cap: "earned every day" },
      ].map((x, i) => (
        <div key={i} style={{ width: 560, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ transform: "scale(1.35)", height: 90, display: "flex", alignItems: "center" }}>{x.logo}</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 124, letterSpacing: "-0.04em", color: x.c, lineHeight: 1.05, marginTop: 18, textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{x.v}</div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 36, color: C.ink, marginTop: 6 }}>{x.cap}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 345, left: 0, right: 0, textAlign: "center", fontFamily: serif, fontStyle: "italic", fontWeight: 700, fontSize: 58, color: C.inkDim }}>vs</div>
    <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center", fontFamily: sans, fontWeight: 700, fontSize: 30, letterSpacing: "0.3em", color: C.ink }}>
      SWIGGY VS ETERNAL · Q2 FY27
    </div>
  </AbsoluteFill>
);
