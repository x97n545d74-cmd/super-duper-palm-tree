import { spring as motionSpring, cubicBezier, interpolate, mix, stagger } from "motion";

/*
 * Motion (motion.dev, `npm install motion`, user request 2026-10-28) inside Remotion.
 * Remotion renders frame by frame, so Motion's real-time APIs (<motion.div animate>, animate()) must NOT be used in
 * compositions: they run on the browser clock and render wrong or blank frames. Use only its pure, time-based maths below,
 * driven by Remotion's time (useTime() / useCurrentFrame()).
 */

type SpringOpts = { stiffness?: number; damping?: number; mass?: number; bounce?: number; duration?: number; visualDuration?: number };

/** Motion spring evaluated at Remotion time t (seconds) for a move that starts at `a`. Returns `from`→`to`. */
export const mspring = (t: number, a: number, from = 0, to = 1, opts: SpringOpts = { stiffness: 247, damping: 31.4, mass: 1 }) => {
  if (t <= a) return from;
  const gen = motionSpring({ keyframes: [from, to], ...opts });
  return gen.next((t - a) * 1000).value as number;
};

export { cubicBezier, interpolate, mix, stagger };
