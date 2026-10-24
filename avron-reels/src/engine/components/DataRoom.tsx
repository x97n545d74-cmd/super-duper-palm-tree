import React from "react";
import { color } from "../../brand/tokens";
import { rand } from "../anim";

/**
 * "Data room" environment: a perspective grid floor (real CSS 3D), haze,
 * and depth-sorted dust motes with parallax. Deterministic from time.
 */
export const DataRoom: React.FC<{ t: number; opacity?: number; tint?: string; drift?: number }> = ({
  t, opacity = 1, tint = color.steel, drift = 1,
}) => {
  const motes = Array.from({ length: 70 }).map((_, i) => {
    const z = rand(i * 3.1); // 0 far .. 1 near
    const speed = (0.15 + z * 0.9) * drift;
    const x = ((rand(i * 7.7) * 1300 - 110 + t * 18 * speed) % 1300) - 110;
    const y = (rand(i * 1.3) * 2100 - t * 22 * speed + 4000) % 2100 - 90;
    const size = 1.5 + z * 5;
    const blur = Math.abs(z - 0.55) * 7;
    return (
      <div
        key={i}
        style={{
          position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size,
          background: tint, opacity: 0.12 + z * 0.35, filter: `blur(${blur}px)`,
        }}
      />
    );
  });
  return (
    <div style={{ position: "absolute", inset: 0, opacity, background: `radial-gradient(90% 60% at 50% 38%, ${color.bgLift} 0%, ${color.bg} 70%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "-60%", right: "-60%", top: "52%", height: 2600, perspective: 900, perspectiveOrigin: "50% 0%" }}>
        <div
          style={{
            position: "absolute", inset: 0, transformOrigin: "50% 0%", transform: "rotateX(76deg)",
            backgroundImage: `linear-gradient(${color.line} 1.5px, transparent 1.5px), linear-gradient(90deg, ${color.line} 1.5px, transparent 1.5px)`,
            backgroundSize: "120px 120px", backgroundPosition: `0px ${(t * 40) % 120}px`,
            WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent 70%)",
          }}
        />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: "40%", height: 500, background: `radial-gradient(60% 50% at 50% 50%, ${tint}22, transparent 70%)` }} />
      {motes}
    </div>
  );
};
