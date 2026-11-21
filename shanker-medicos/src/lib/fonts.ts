import localFont from "next/font/local";

// Self-hosted (no request to Google at runtime), all SIL Open Font License.
// Night cinematic (v3): Anton for display, Inter for reading. Hindi and
// Punjabi display lines use Noto at its narrowest width and heaviest weight
// so they sit next to Anton.
export const anton = localFont({
  src: "../fonts/anton-latin-400-normal.woff2",
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});

export const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const mono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-mono-latin-500-normal.woff2", weight: "500" },
  ],
  variable: "--font-plexmono",
  display: "swap",
  preload: false,
});

export const deva = localFont({
  src: "../fonts/noto-sans-devanagari-devanagari-wdth-normal.woff2",
  variable: "--font-deva",
  weight: "100 900",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62.5% 100%" }],
});

export const guru = localFont({
  src: "../fonts/noto-sans-gurmukhi-gurmukhi-wdth-normal.woff2",
  variable: "--font-guru",
  weight: "100 900",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62.5% 100%" }],
});

export const fontVars = `${anton.variable} ${inter.variable} ${mono.variable} ${deva.variable} ${guru.variable}`;
