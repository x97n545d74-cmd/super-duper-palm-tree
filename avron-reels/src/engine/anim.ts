import { useCurrentFrame, useVideoConfig } from "remotion";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const ease = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuint: (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
  inCubic: (t: number) => t * t * t,
  outBack: (t: number) => {
    const c1 = 1.4, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/** Progress 0..1 of time `t` across [a, a+dur], eased. */
export const prog = (t: number, a: number, dur: number, fn: (x: number) => number = ease.outCubic) =>
  fn(clamp01((t - a) / dur));

/** Absolute timeline seconds (the reel uses absolute cue times, so scenes read global time). */
export const useTime = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

/** Visible window helper: fades in over `fi`, out over `fo`. */
export const windowAlpha = (t: number, a: number, b: number, fi = 0.3, fo = 0.3) =>
  clamp01((t - a) / fi) * clamp01((b - t) / fo);

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const sec = (s: number, fps = 30) => Math.round(s * fps);
