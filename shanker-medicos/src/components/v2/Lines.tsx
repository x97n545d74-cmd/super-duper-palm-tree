/**
 * Kinetic display type (night cinematic): each line rises out of its own
 * mask, staggered. Works for every script because lines are never split
 * into letters. Pass explicit lines, or one string (it wraps inside one mask).
 * The parent (or this element) gets "in" from MotionRoot when it scrolls into view.
 */
export function Lines({ lines, delay = 0, className = "" }: { lines: string | string[]; delay?: number; className?: string }) {
  const list = Array.isArray(lines) ? lines : [lines];
  // *word* marks the accent (green) part of a line
  const parts = (l: string) => l.split("*").map((t, k) => (k % 2 ? <span key={k} className="text-emerald">{t}</span> : t));
  return (
    <span data-rv-group className={`block ${className}`} style={{ ["--d0" as string]: `${delay}s` }}>
      {list.map((l, i) => (
        <span key={i} className="ln">
          <span style={{ ["--li" as string]: i }}>{parts(l)}</span>
        </span>
      ))}
    </span>
  );
}
