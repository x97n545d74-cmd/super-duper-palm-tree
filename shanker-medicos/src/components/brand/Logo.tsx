/**
 * The SHANKER MEDICOS mark (v2): a small signboard tile carrying "ਸ਼",
 * the first letter of Shanker in Gurmukhi, as painted on the shop's own
 * boards on Dera Road. The wordmark is set in Archivo, slightly condensed.
 */
export function LogoMark({ className = "", title }: { className?: string; title?: string }) {
  return (
    <span
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-[10px] bg-emerald text-white ${className}`}
      style={{ boxShadow: "inset 0 -2px 0 rgba(0,0,0,.18), 0 6px 14px -8px rgba(20,94,140,.8)" }}
    >
      <span lang="pa" className="translate-y-[-1px] text-[1.15em] font-bold leading-none" style={{ fontFamily: "var(--font-guru)" }}>
        ਸ਼
      </span>
    </span>
  );
}

/** Kept for the SVG exports in scripts/: a plain tile. */
export function LogoMarkGroup({ x = 0, y = 0, size = 40, color = "currentColor" }: { x?: number; y?: number; size?: number; color?: string }) {
  return <rect x={x} y={y} width={size} height={size} rx={size / 4} fill={color} />;
}

export function Logo({ className = "", tone = "dark", name = "Shanker" }: { className?: string; tone?: "dark" | "light"; name?: string }) {
  const dark = tone === "dark";
  return (
    <span lang="en" className={`inline-flex items-center gap-2.5 ${dark ? "text-forest" : "text-white"} ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0 text-[1.25rem]" />
      <span className="flex flex-col leading-none">
        <span className="text-[1.3rem] font-extrabold tracking-[-0.03em]" style={{ fontStretch: "85%" }}>
          {name} <span className={dark ? "text-emerald" : "text-white/70"}>Medicos</span>
        </span>
        <span className={`mt-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] ${dark ? "text-ink-2" : "text-white/60"}`}>Dera Road · Batala</span>
      </span>
    </span>
  );
}
