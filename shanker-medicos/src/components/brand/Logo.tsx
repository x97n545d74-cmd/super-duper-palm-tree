/**
 * The SHANKER MEDICOS mark (v3, night cinematic): the pharmacy cross in
 * signal green with a knocked-out centre, set beside a condensed wordmark.
 * The cross is drawn, not typed, so it is identical everywhere.
 */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path
        fill="#19C37D"
        fillRule="evenodd"
        d="M15.5 2h9a2 2 0 0 1 2 2v9.5H36a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9.5V36a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9.5V4a2 2 0 0 1 2-2Zm4.5 14.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z"
      />
    </svg>
  );
}

/** Kept for the SVG exports in scripts/: the cross as a group. */
export function LogoMarkGroup({ x = 0, y = 0, size = 40, color = "#19C37D" }: { x?: number; y?: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 40})`}>
      <path fill={color} fillRule="evenodd" d="M15.5 2h9a2 2 0 0 1 2 2v9.5H36a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9.5V36a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9.5H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h9.5V4a2 2 0 0 1 2-2Zm4.5 14.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
    </g>
  );
}

export function Logo({ className = "", tone = "dark", name = "Shanker" }: { className?: string; tone?: "dark" | "light"; name?: string }) {
  const sub = tone === "light" ? "text-white/55" : "text-ink-2";
  return (
    <span lang="en" className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.45rem] uppercase leading-none tracking-[0.01em]" style={{ fontFamily: "var(--font-anton), Impact, sans-serif" }}>
          {name} Medicos
        </span>
        <span className={`mt-1.5 text-[0.56rem] font-semibold uppercase tracking-[0.38em] ${sub}`}>Chemists &amp; Druggists</span>
      </span>
    </span>
  );
}
