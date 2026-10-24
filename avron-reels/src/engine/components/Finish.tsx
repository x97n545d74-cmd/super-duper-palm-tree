import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { color, font, layout } from "../../brand/tokens";
import { rand } from "../anim";

/** Film grain + vignette + top progress hairline + small brand mark. */
export const Finish: React.FC<{ progress: number; showMark?: boolean; flash?: number }> = ({ progress, showMark = true, flash = 0 }) => {
  const frame = useCurrentFrame();
  const g = frame % 4;
  const ox = Math.floor(rand(frame) * 512);
  const oy = Math.floor(rand(frame + 99) * 512);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(120% 85% at 50% 42%, transparent 55%, rgba(0,0,0,0.72) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.075, mixBlendMode: "overlay", pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Img
            key={i}
            src={staticFile(`brand/grain_${g}.png`)}
            style={{ position: "absolute", width: 512, height: 512, left: (i % 4) * 512 - ox, top: Math.floor(i / 4) * 512 - oy }}
          />
        ))}
      </div>
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#FFF6E6", opacity: flash, mixBlendMode: "screen" }} />}
      {/* progress hairline */}
      <div style={{ position: "absolute", left: layout.gutter, right: layout.gutter, top: 168, height: 3, background: "rgba(255,255,255,0.10)", borderRadius: 3 }}>
        <div style={{ width: `${progress * 100}%`, height: "100%", background: color.amber, borderRadius: 3, boxShadow: `0 0 12px ${color.amber}` }} />
      </div>
      {showMark && (
        <div style={{ position: "absolute", left: layout.gutter, top: 112, fontFamily: font.display, fontWeight: 800, fontSize: 30, letterSpacing: "0.42em", color: color.ink, opacity: 0.85 }}>
          AVRON
        </div>
      )}
    </>
  );
};
