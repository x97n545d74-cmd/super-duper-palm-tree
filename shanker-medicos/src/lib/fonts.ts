import localFont from "next/font/local";

// Self-hosted (no request to Google at runtime), all SIL Open Font License.
// Archivo has a width axis (62–125): condensed for signboard headlines,
// normal for reading. The Noto scripts carry the same axis so Hindi and
// Punjabi headlines condense the same way.
export const archivo = localFont({
  src: "../fonts/archivo-latin-wdth-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
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

export const fontVars = `${archivo.variable} ${mono.variable} ${deva.variable} ${guru.variable}`;
