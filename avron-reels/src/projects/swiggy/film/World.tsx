import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease } from "../../../engine/anim";
import { Hour, PhotoWorld } from "../look";
import { MapWorld } from "./MapWorld";
import { BEATS, sec, st } from "./timeline";

/*
 * The world behind the story: one day, night to sunrise. Each plate is a licensed photograph with the grade
 * for its hour. Plates cross-dissolve over XF seconds, so chapters change by light, never by a cut to black.
 */
type Plate = { at: number; src: string; hour: Hour; drift?: number; focus?: string; overlay?: { src: string; opacity: number } };
const XF = 1.4;

/**
 * During the chapters the world steps back (soft focus, dimmed) so the data reads first; the open and close stay sharp.
 * On every new beat the focus is pulled to the photograph for a moment, then racks back behind the graphics.
 */
export const BACKGROUND_FOCUS = (t: number) => {
  const inChapters = t > sec("c1")[0] && t < sec("close")[0];
  const k = inChapters ? Math.min(1, (t - sec("c1")[0]) / 2, (sec("close")[0] - t) / 2) : 0;
  const beat = [...BEATS].reverse().find((x) => x.start <= t + 0.3);
  const pull = beat ? 1 - ease.inOutCubic(clamp01((t + 0.3 - beat.start) / 1.8)) : 0;
  const f = k * (1 - 0.75 * pull);
  return { filter: `blur(${2.2 * f}px) brightness(${1 - 0.2 * f})`, transform: `scale(${1 + 0.02 * k})` };
};

export const PLATES: Plate[] = [
  { at: 0, src: "swiggy/night_skyline.jpg", hour: "night", overlay: { src: "swiggy/night_flyover.jpg", opacity: 0.35 } },
  { at: st("open_01"), src: "swiggy/night_trails.jpg", hour: "night", drift: 30 },
  { at: st("open_04"), src: "swiggy/night_rail.jpg", hour: "night", drift: 22 },
  { at: sec("c1")[0], src: "swiggy/dawn_tree.jpg", hour: "dawn", drift: 10 },
  { at: st("c1_01"), src: "swiggy/dawn_city.jpg", hour: "dawn", drift: 12 },
  { at: st("c1_02"), src: "swiggy/street_3.jpg", hour: "morning", drift: 16 },
  { at: st("c1_03"), src: "swiggy/grocery.jpg", hour: "morning", drift: 12 },
  { at: st("c1_04"), src: "swiggy/street_3.jpg", hour: "morning", drift: 20 },
  { at: sec("c2")[0], src: "swiggy/street_2.jpg", hour: "morning", drift: 24 },
  { at: st("c2_02"), src: "swiggy/traffic_1.jpg", hour: "morning", drift: 18 },
  { at: st("c2_03"), src: "swiggy/street_1.jpg", hour: "morning", drift: 8 },
  { at: st("c2_05"), src: "swiggy/traffic_2.jpg", hour: "morning", drift: 14 },
  { at: sec("c3")[0], src: "swiggy/curry.jpg", hour: "noon", drift: 10 },
  { at: st("c3_03"), src: "swiggy/kitchen.jpg", hour: "noon", drift: 14 },
  { at: sec("c4")[0], src: "swiggy/dusk_city.jpg", hour: "dusk", drift: 14 },
  { at: st("c4_00"), src: "swiggy/shelves.jpg", hour: "dusk", drift: 10 },
  { at: st("c4_02"), src: "swiggy/aisle_empty.jpg", hour: "dusk", drift: 10 },
  { at: st("c4_05"), src: "swiggy/delhi_dusk.jpg", hour: "dusk", drift: 12 },
  { at: sec("c5")[0], src: "swiggy/rain_street.jpg", hour: "storm", drift: 12 },
  { at: st("c5_02"), src: "swiggy/rain_glass.jpg", hour: "storm", drift: 6 },
  { at: st("c5_04"), src: "swiggy/stock_paper.jpg", hour: "storm", drift: 8 },
  { at: sec("c6")[0], src: "swiggy/night_flyover.jpg", hour: "late", drift: 18 },
  { at: st("c6_03"), src: "swiggy/mumbai_night.jpg", hour: "late", drift: 10 },
  { at: st("c6_05"), src: "swiggy/blr_night.jpg", hour: "late", drift: 10 },
  { at: sec("c7")[0], src: "swiggy/sunrise_city.jpg", hour: "predawn", drift: 8 },
  { at: st("c7_02"), src: "swiggy/dawn_city.jpg", hour: "predawn", drift: 12 },
  { at: sec("close")[0], src: "swiggy/sunrise_city.jpg", hour: "sunrise", drift: 10 },
];

/** Pans alternate direction plate to plate and run a little stronger than the plate's base drift. */
const pan = (i: number) => (i % 2 ? -1 : 1) * 1.5 * (PLATES[i].drift ?? 18);
const chapterAmount = (t: number) => (t > sec("c1")[0] && t < sec("close")[0] ? Math.min(1, (t - sec("c1")[0]) / 2, (sec("close")[0] - t) / 2) : 0);

export const World: React.FC<{ t: number; mode?: "photo" | "map" }> = ({ t, mode = "photo" }) => {
  // the current plate plus the one fading out
  const i = Math.max(0, PLATES.findIndex((p, k) => t >= p.at && (k === PLATES.length - 1 || t < PLATES[k + 1].at)));
  const cur = PLATES[i];
  const prev = i > 0 ? PLATES[i - 1] : null;
  const p = ease.inOutCubic(clamp01((t - cur.at) / XF));
  const onMap = mode === "map" ? chapterAmount(t) : 0;
  return (
    <AbsoluteFill>
      {onMap < 1 && (
        <AbsoluteFill style={BACKGROUND_FOCUS(t)}>
          {prev && p < 1 && <AbsoluteFill><PhotoWorld src={prev.src} t={t} t0={prev.at} hour={prev.hour} drift={pan(i - 1)} overlay={prev.overlay} /></AbsoluteFill>}
          <AbsoluteFill style={{ opacity: prev ? p : 1 }}>
            <PhotoWorld src={cur.src} t={t} t0={cur.at} hour={cur.hour} drift={pan(i)} overlay={cur.overlay} />
          </AbsoluteFill>
          {/* reading side: a soft dark falloff on the left, where headlines and cards sit */}
          <AbsoluteFill style={{ opacity: chapterAmount(t), background: "linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.18) 50%, transparent 78%)" }} />
        </AbsoluteFill>
      )}
      {/* map mode: the live map replaces the photographs for the chapters; the open and close stay photographic */}
      {onMap > 0 && <AbsoluteFill style={{ opacity: onMap }}><MapWorld t={t} /></AbsoluteFill>}
    </AbsoluteFill>
  );
};
