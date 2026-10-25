import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp, rand } from "../../../engine/anim";
import { C } from "../look";
import MAP from "../india_map.json";
import { Section, sec, SECTIONS } from "./timeline";

/*
 * Chapter background (user picked option B, 2026-10-25): a live map of India instead of photographs. The camera drifts from city to
 * city as the story moves; around each city, dots stand for its dark stores (one dot ≈ 4 stores, Blinkit yellow,
 * Instamart orange, QuickCommerceMap July 2026); short delivery strokes keep drawing out of each city. Dot positions
 * around a city are schematic, the counts are not. Colour still follows the hour of the day.
 * Boundaries: DataMeet India (CC BY 4.0), aligned with the Survey of India, J&K and Ladakh in full.
 */
type City = { x: number; y: number; counts: Record<string, number>; leader: string };
const CITIES = MAP.cities as unknown as Record<string, City>;
const STATES = MAP.states as Record<string, string>;

/** Where the camera looks in each chapter: it travels through these cities across the chapter. */
const ROUTE: Record<Section, string[]> = {
  open: ["Delhi"], c1: ["Gurugram", "Delhi", "Lucknow"], c2: ["Delhi", "Mumbai", "Bengaluru"], c3: ["Mumbai", "Pune"],
  c4: ["Ahmedabad", "Mumbai"], c5: ["Mumbai", "Bengaluru"], c6: ["Hyderabad", "Chennai", "Bengaluru"], c7: ["Kolkata", "Delhi"], close: ["Delhi"],
};
/** Base colours by chapter, following the day: dawn, morning, noon, dusk, storm, late night, pre-dawn. */
const SKY: Record<Section, [string, string]> = {
  open: ["#0B0F1A", "#05070C"], c1: ["#2A2232", "#141019"], c2: ["#1C2633", "#0E141C"], c3: ["#2A241C", "#14110D"],
  c4: ["#2E1E16", "#150E0B"], c5: ["#171C22", "#0B0E12"], c6: ["#0D1220", "#06080F"], c7: ["#251A2C", "#120D17"], close: ["#2B1E2A", "#140E14"],
};
const K = 2.2; // map zoom: 930 px wide map → ~2,400 px
const FOCUS_X = 1250, FOCUS_Y = 560; // the city sits right of centre; text lives on the left

const sectionAt = (t: number): Section => [...SECTIONS].reverse().find((s) => t >= sec(s)[0]) ?? "open";

const camera = (t: number) => {
  const s = sectionAt(t);
  const [a, z] = sec(s);
  const route = ROUTE[s].map((n) => CITIES[n]).filter(Boolean);
  const u = clamp01((t - a) / Math.max(1, z - a)) * (route.length - 1);
  const i = Math.min(route.length - 2, Math.floor(u));
  const p = route.length < 2 ? 0 : ease.inOutCubic(u - Math.max(0, i));
  const from = route[Math.max(0, i)], to = route[Math.min(route.length - 1, Math.max(0, i) + 1)];
  return { x: lerp(from.x, to.x, p), y: lerp(from.y, to.y, p), s };
};

const mix = (a: string, b: string, p: number) => {
  const h = (c: string) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const [x, y] = [h(a), h(b)];
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], p))).join(",")})`;
};

export const MapWorld: React.FC<{ t: number }> = ({ t }) => {
  // the camera eases between chapters too: blend the previous chapter's end view into this one over 3 s
  const cam = camera(t);
  const [a] = sec(cam.s);
  const prev = camera(a - 0.01);
  const blend = ease.inOutCubic(clamp01((t - a) / 3));
  const cx = lerp(prev.x, cam.x, blend), cy = lerp(prev.y, cam.y, blend);
  const sky = SKY[cam.s], skyPrev = SKY[prev.s];
  const top = mix(skyPrev[0], sky[0], blend), bottom = mix(skyPrev[1], sky[1], blend);
  const zoom = K * (1 + 0.04 * Math.sin(t / 9));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 100% at 65% 45%, ${top} 0%, ${bottom} 100%)` }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${FOCUS_X} ${FOCUS_Y}) scale(${zoom}) translate(${-cx} ${-cy})`}>
          {Object.entries(STATES).map(([n, d]) => (
            <path key={n} d={d} fill="rgba(245,241,234,0.07)" stroke="rgba(245,241,234,0.42)" strokeWidth={0.45} />
          ))}
          {Object.entries(CITIES).map(([name, c], ci) => {
            const dots: React.ReactNode[] = [];
            const b = Math.round((c.counts.Blinkit ?? 0) / 4), m = Math.round((c.counts.Instamart ?? 0) / 4);
            const total = b + m;
            for (let k = 0; k < total; k++) {
              // sunflower spiral around the city; Blinkit and Instamart interleaved in proportion
              const r = 2.1 * Math.sqrt(k + 1), th = k * 2.39996;
              const isB = Math.floor(((k + 1) * b) / total) > Math.floor((k * b) / total);
              dots.push(<circle key={k} cx={c.x + r * Math.cos(th)} cy={c.y + r * Math.sin(th)} r={0.8} fill={isB ? C.blinkit : C.swiggy} opacity={0.95} />);
            }
            const strokes = Array.from({ length: 7 }, (_, j) => {
              const period = 3.2 + rand(ci * 31 + j) * 2.4;
              const ph = ((t + rand(ci * 17 + j * 7) * period) % period) / period;
              const ang = rand(ci * 13 + j * 3) * Math.PI * 2, len = 9 + rand(ci + j * 11) * 14;
              const r0 = 2.1 * Math.sqrt(total + 1);
              const x0 = c.x + r0 * Math.cos(ang), y0 = c.y + r0 * Math.sin(ang);
              const x1 = c.x + (r0 + len) * Math.cos(ang + 0.25), y1 = c.y + (r0 + len) * Math.sin(ang + 0.25);
              const draw = ease.outCubic(clamp01(ph / 0.55)), fade = 1 - clamp01((ph - 0.6) / 0.4);
              const col = j % 3 === 0 ? C.swiggy : C.blinkit;
              return (
                <path key={j} d={`M ${x0} ${y0} Q ${(x0 + x1) / 2 + 3 * Math.sin(ang)} ${(y0 + y1) / 2 - 3 * Math.cos(ang)} ${x1} ${y1}`}
                  fill="none" stroke={col} strokeWidth={0.5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={0.7 * fade} />
              );
            });
            return (
              <g key={name}>
                {strokes}
                {dots}
                <text x={c.x + 2.1 * Math.sqrt(total + 1) + 3} y={c.y + 1.4} fontFamily="JetBrains Mono" fontSize={4.2} fill="rgba(245,241,234,0.8)" letterSpacing="0.06em">{name.toUpperCase()}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 42%, transparent 70%), radial-gradient(130% 100% at 60% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)" }} />
      <div style={{ position: "absolute", right: 140, bottom: 28, fontFamily: "JetBrains Mono", fontSize: 16, color: "rgba(245,241,234,0.4)" }}>
        Map: DataMeet India (CC BY 4.0) · 1 dot ≈ 4 dark stores (QuickCommerceMap, Jul 2026) · <span style={{ color: C.blinkit }}>Blinkit</span> · <span style={{ color: C.swiggy }}>Instamart</span>
      </div>
    </AbsoluteFill>
  );
};
