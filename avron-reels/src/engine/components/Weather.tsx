import React from "react";
import { Img, staticFile } from "remotion";
import { rand } from "../anim";

/** Layered rain: far hairlines, mid streaks, near out-of-focus streaks; slanted by wind. Deterministic. */
export const Rain: React.FC<{ t: number; intensity?: number; wind?: number; tint?: string; groundY?: number }> = ({
  t, intensity = 1, wind = 0.18, tint = "200,215,235", groundY = 1920,
}) => {
  const layers = [
    { n: 140, len: 38, w: 1.2, speed: 1900, a: 0.22, blur: 0 },
    { n: 70, len: 70, w: 2, speed: 2600, a: 0.28, blur: 0.6 },
    { n: 18, len: 160, w: 5, speed: 3400, a: 0.16, blur: 3 },
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: intensity }}>
      {layers.map((L, li) => (
        <g key={li} style={{ filter: L.blur ? `blur(${L.blur}px)` : undefined }}>
          {Array.from({ length: L.n }).map((_, i) => {
            const seed = li * 1000 + i;
            const x0 = rand(seed) * 1300 - 110;
            const span = groundY + 200;
            const y = ((rand(seed + 7) * span + t * L.speed) % span) - 100;
            const x = x0 + y * wind;
            return (
              <line key={i} x1={x} y1={y} x2={x - L.len * wind} y2={y - L.len} stroke={`rgba(${tint},${L.a * (0.6 + 0.4 * rand(seed + 3))})`}
                strokeWidth={L.w} strokeLinecap="round" />
            );
          })}
        </g>
      ))}
    </svg>
  );
};

/** Splash rings on a wet ground plane (in perspective: flattened ellipses). */
export const Splashes: React.FC<{ t: number; top: number; bottom: number; n?: number }> = ({ t, top, bottom, n = 40 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    {Array.from({ length: n }).map((_, i) => {
      const period = 0.55 + rand(i) * 0.5;
      const ph = ((t + rand(i + 50) * period) % period) / period;
      const depth = rand(i + 9);
      const y = top + depth * (bottom - top);
      const x = rand(i + 99 + Math.floor((t + rand(i + 50) * period) / period) * 13) * 1080;
      const r = (6 + depth * 26) * ph;
      return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.22} fill="none" stroke={`rgba(210,220,240,${0.35 * (1 - ph)})`} strokeWidth={1 + depth} />;
    })}
  </svg>
);

/**
 * Real photograph composited as a band, with a mirrored, rippled wet-ground reflection below
 * and feathered edges into the CG environment. The photo itself is never altered beyond grade.
 */
export const PhotoPlate: React.FC<{
  src: string; t: number; y: number; height: number; zoom?: number; driftX?: number; grade?: string; reflection?: boolean; flash?: number;
}> = ({ src, t, y, height, zoom = 1.08, driftX = 0, grade = "none", reflection = true, flash = 0 }) => {
  const ripple = Math.sin(t * 2.1) * 2;
  const img = (
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `${grade} brightness(${1 + flash * 0.9})` }} />
  );
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: y, height, overflow: "hidden",
        WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 14%, #000 88%, transparent 100%)" }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(${zoom}) translateX(${driftX}px)` }}>{img}</div>
      </div>
      {reflection && (
        <div style={{ position: "absolute", left: 0, right: 0, top: y + height - 8, height: height * 1.1, overflow: "hidden",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.75), transparent 80%)", filter: "blur(2.5px)" }}>
          <div style={{ width: "100%", height: height, transform: `scale(${zoom}, ${-zoom}) translateX(${driftX + ripple}px) skewX(${ripple * 0.4}deg)`,
            transformOrigin: "50% 50%", opacity: 0.55 }}>{img}</div>
        </div>
      )}
    </>
  );
};
