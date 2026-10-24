import React from "react";
import { color, font } from "../../brand/tokens";
import { clamp01, ease } from "../anim";

/**
 * Mechanical fuel-pump style digit drums rendered in real CSS 3D:
 * every digit column is a 10-face cylinder rotated about X.
 */
export const Odometer: React.FC<{
  value: string; // e.g. "95.20"
  t: number;
  start: number;
  duration?: number;
  size?: number;
  tint?: string;
  stagger?: number;
}> = ({ value, t, start, duration = 1.6, size = 220, tint = color.amberHot, stagger = 0.12 }) => {
  const faceH = size * 1.06;
  const radius = (faceH / 2) / Math.tan(Math.PI / 10);
  let digitIdx = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: `${size * 0.1}px ${size * 0.16}px`, borderRadius: size * 0.12,
      background: "linear-gradient(180deg, rgba(4,5,7,0.92), rgba(10,11,14,0.92))", border: "1.5px solid rgba(243,241,236,0.16)",
      boxShadow: `inset 0 0 ${size * 0.3}px rgba(0,0,0,0.9), 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.6)` }}>
      {value.split("").map((ch, i) => {
        if (!/\d/.test(ch)) {
          return (
            <div key={i} style={{ fontFamily: font.mono, fontSize: size, color: tint, fontWeight: 700, width: size * 0.36, textAlign: "center", lineHeight: 1 }}>
              {ch}
            </div>
          );
        }
        const target = Number(ch);
        const k = digitIdx++;
        const p = ease.outExpo(clamp01((t - start - k * stagger) / duration));
        const spins = 2 + k; // later digits spin more, like a meter settling
        const angle = (spins * 10 + target) * 36 * p; // degrees of rotation
        // motion blur proportional to angular velocity
        const vel = (1 - p) * 30;
        return (
          <div key={i} style={{ width: size * 0.66, height: faceH, position: "relative", overflow: "hidden", perspective: size * 5 }}>
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `translateZ(${-radius}px) rotateX(${angle}deg)` }}>
              {Array.from({ length: 10 }).map((_, d) => (
                <div
                  key={d}
                  style={{
                    position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: font.mono, fontSize: size, fontWeight: 700, color: tint, lineHeight: 1,
                    backfaceVisibility: "hidden",
                    transform: `rotateX(${-d * 36}deg) translateZ(${radius}px)`,
                    filter: vel > 0.5 ? `blur(${Math.min(vel, 10) * 0.5}px)` : undefined,
                    textShadow: `0 0 ${size * 0.18}px ${tint}55`,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
            {/* drum shading: dark top/bottom to sell the cylinder */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,5,7,0.95) 0%, rgba(4,5,7,0) 30%, rgba(4,5,7,0) 70%, rgba(4,5,7,0.95) 100%)", pointerEvents: "none" }} />
          </div>
        );
      })}
    </div>
  );
};
