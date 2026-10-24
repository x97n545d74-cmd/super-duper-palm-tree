// AVRON brand system: one source of truth for colour, type and layout.
export const color = {
  bg: "#06070A",
  bgLift: "#0D1015",
  ink: "#F3F1EC", // warm white for primary type
  inkDim: "#A4A9B2",
  inkFaint: "#5E646E",
  line: "rgba(243,241,236,0.14)",
  amber: "#E9A23B", // fuel / price
  amberHot: "#FFC46B",
  loss: "#F0524F", // losses / estimates of loss
  steel: "#9DB2C9",
  blue: "#5B8CFF", // AVRON accent, used sparingly
  gold: "#C9A45C", // metallic gold (restrained)
  goldHot: "#F0D08A",
  steelCold: "#7F93AD", // exterior unrest
  tungsten: "#FFB46A", // briefing-room practicals
  crimson: "#C8323A", // market stress
} as const;

export const font = {
  display: "'Inter Display', 'Inter', sans-serif",
  text: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  // Hinglish: Latin glyphs from Inter, Devanagari from Noto (unicode-range split)
  deva: "'Inter', 'AVRON Deva', sans-serif",
  devaDisplay: "'Inter Display', 'AVRON Deva', sans-serif",
  devaSerif: "'AVRON Deva Serif', serif",
} as const;

// 1080x1920 canvas with Instagram Reels UI-safe zones.
export const layout = {
  width: 1080,
  height: 1920,
  fps: 30,
  gutter: 84,
  safeTop: 230, // below IG top bar
  captionY: 1395, // caption baseline band
  safeBottom: 1560, // IG caption/CTA overlay starts below this
  safeRight: 940,
} as const;
