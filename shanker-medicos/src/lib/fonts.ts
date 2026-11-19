import localFont from "next/font/local";

// Self-hosted (no request to Google at runtime). Variable fonts, one file each.
export const manrope = localFont({
  src: "../fonts/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const inter = localFont({
  src: "../fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

export const deva = localFont({
  src: "../fonts/noto-sans-devanagari-devanagari-wght-normal.woff2",
  variable: "--font-deva",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const guru = localFont({
  src: "../fonts/noto-sans-gurmukhi-gurmukhi-wght-normal.woff2",
  variable: "--font-guru",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const fontVars = `${manrope.variable} ${inter.variable} ${deva.variable} ${guru.variable}`;
