// AVRON brand v2 (2026-10-28): "finance as product UI". Every AVRON reel uses these tokens and src/engine/ui.
// The written rules behind each value are in brand/BRAND.md. Change a value here, never inside a project.

export const ui = {
  // Canvas and surfaces: warm near-black, panels lift by luminance, never by glow
  canvas: "#0A0A0B",
  canvasLift: "#121215", // top-centre light falloff of the canvas
  surface: "#141417", // panel
  surface2: "#1B1B20", // row hover, inset fields
  hairline: "rgba(255,255,255,0.08)",
  hairlineStrong: "rgba(255,255,255,0.14)",
  // Type
  ink: "#F5F4EF",
  ink2: "#9C9CA5",
  ink3: "#5D5D67",
  // The one accent: AVRON gold. Chrome only (cursor dot, active tab, highlighter, wordmark dot), never a data colour
  gold: "#E2B85C",
  goldSoft: "rgba(226,184,92,0.30)",
  // Data direction only
  up: "#3DD68C",
  down: "#FF5A5F",
  estimate: "#9C9CA5", // forecasts and estimates are drawn dashed in this grey
} as const;

export const type = {
  display: "'Inter Display', 'Inter', sans-serif",
  text: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  // px sizes on the 1080×1920 canvas
  hero: 168, // one number or two words per shot
  h1: 112,
  h2: 76,
  title: 56,
  body: 40,
  label: 30, // mono source tags, ticker chips
  tracking: { hero: "-0.045em", head: "-0.03em", body: "-0.01em", mono: "0.02em" },
} as const;

export const shape = {
  radius: 40, // panels
  radiusSm: 22, // rows, chips
  pad: 52,
  shadow: "0 50px 90px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.05) inset",
  gutter: 84,
} as const;

// Motion: one curve family and three durations. Seconds.
export const motion = {
  micro: 0.18, // presses, chip state changes
  base: 0.42, // panel enter, row stagger item, push cut
  large: 0.72, // camera moves, zoom-through, morph
  stagger: 0.06,
  // cubic-bezier control points (sources: research/brand-2026-10/UI_MOTION_TASTE.md §2.2)
  out: [0.23, 1, 0.32, 1] as const, // every enter (Emil Kowalski strong ease-out). Never ease-in on an entrance
  inOut: [0.77, 0, 0.175, 1] as const, // camera, cursor travel, things already on screen
  sheet: [0.32, 0.72, 0, 1] as const, // bottom-sheet chapter transition
  standard: [0.2, 0, 0.38, 0.9] as const, // state morphs (IBM Carbon productive standard)
  in: [0.2, 0, 1, 0.9] as const, // every exit, shorter than its entrance (Carbon productive exit)
  // entrances start here, never from scale 0
  enterFrom: { scale: 0.96, blur: 6, y: 24 },
  // critically damped springs (no bounce). Remotion's default spring (damping 10) is bouncy: never use it
  springs: { settle: { mass: 1, stiffness: 247, damping: 31.4 }, snap: { mass: 1, stiffness: 439, damping: 41.9 } },
  // holds, seconds
  hold: { heroNumberMin: 1.2, headline: (words: number) => Math.max(1.5, words * 0.3 + 1.0), body: (chars: number) => chars / 15 + 0.5 },
} as const;

/** Cubic-bezier easing (same maths as CSS). Returns a function t∈[0,1] → eased. */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - t;
      const d = dx(u);
      if (Math.abs(e) < 1e-6 || Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    return sy(Math.min(1, Math.max(0, u)));
  };
};

export const curve = {
  out: bezier(...motion.out),
  inOut: bezier(...motion.inOut),
  sheet: bezier(...motion.sheet),
  standard: bezier(...motion.standard),
  in: bezier(...motion.in),
};
