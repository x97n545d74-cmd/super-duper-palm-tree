import { useId } from "react";

/**
 * The SHANKER MEDICOS mark: a capsule divided by an S-curve.
 * One shape carries both the pharmacy (capsule) and the name (S).
 */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <clipPath id={`cap-${id}`}>
          <rect x="11" y="2" width="18" height="36" rx="9" />
        </clipPath>
      </defs>
      <g transform="rotate(38 20 20)">
        <path clipPath={`url(#cap-${id})`} d="M0 23 C 12 11, 24 31, 40 17 L40 40 L0 40Z" fill="currentColor" />
        <rect x="12.2" y="3.2" width="15.6" height="33.6" rx="7.8" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </g>
    </svg>
  );
}

/** The mark as an SVG group (40x40 units) for embedding inside another <svg>. */
export function LogoMarkGroup({ x = 0, y = 0, size = 40, color = "currentColor" }: { x?: number; y?: number; size?: number; color?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 40})`}>
      <defs>
        <clipPath id={`capg-${id}`}>
          <rect x="11" y="2" width="18" height="36" rx="9" />
        </clipPath>
      </defs>
      <g transform="rotate(38 20 20)">
        <path clipPath={`url(#capg-${id})`} d="M0 23 C 12 11, 24 31, 40 17 L40 40 L0 40Z" fill={color} />
        <rect x="12.2" y="3.2" width="15.6" height="33.6" rx="7.8" fill="none" stroke={color} strokeWidth="2.4" />
      </g>
    </g>
  );
}

export function Logo({ className = "", tone = "dark", name = "Shanker" }: { className?: string; tone?: "dark" | "light"; name?: string }) {
  const color = tone === "dark" ? "text-forest" : "text-ivory";
  return (
    <span lang="en" className={`inline-flex items-center gap-2.5 ${color} ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.32rem] font-bold tracking-[-0.035em]">{name}</span>
        <span className={`mt-[3px] text-[0.58rem] font-semibold tracking-[0.42em] ${tone === "dark" ? "text-emerald" : "text-ivory/70"}`}>MEDICOS</span>
      </span>
    </span>
  );
}
