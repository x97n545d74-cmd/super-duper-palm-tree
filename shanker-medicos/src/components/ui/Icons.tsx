// Thin-line icon set (1.6 stroke). Small by design; never oversized.
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const IconSearch = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
export const IconArrow = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconMenu = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M4 8h16M4 16h16" /></svg>
);
export const IconClose = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconPhone = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
);
export const IconPin = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
export const IconClock = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
);
export const IconMail = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></svg>
);
export const IconGlobe = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5" /></svg>
);
export const IconChevron = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconCheck = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
);
export const IconInfo = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconFilter = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}><path d="M4 7h16M7 12h10M10 17h4" /></svg>
);

/** WhatsApp glyph (solid). */
export const IconWhatsApp = ({ className = "h-5 w-5" }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.23 8.22m4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.22-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.21.89 2.39 1.01 2.55.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29" />
  </svg>
);

/** Category glyphs, keyed by slug. Fallback: capsule. */
export function CategoryGlyph({ slug, className = "h-6 w-6" }: { slug: string; className?: string }) {
  const paths: Record<string, React.ReactNode> = {
    medicines: <><rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(-35 12 12)" /><path d="M10.3 8.6l3.4 6.8" /></>,
    "prescription-medicines": <><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20z" /><path d="M10 10h2.5a1.75 1.75 0 0 1 0 3.5H10V17M12 13.5l3 3.5" /></>,
    "otc-products": <><rect x="6" y="7" width="12" height="13" rx="2" /><path d="M8.5 7V4.5h7V7M12 11v5M9.5 13.5h5" /></>,
    "personal-care": <><path d="M9 8h6v12a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" /><path d="M11 8V5h2v3M13 5h3" /></>,
    "baby-care": <><circle cx="12" cy="10" r="5.5" /><path d="M10 9.5h.01M14 9.5h.01M10.5 12.2c.9.6 2.1.6 3 0M9 18.5c1-1 5-1 6 0" /></>,
    "vitamins-nutrition": <><path d="M12 3.5c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z" /><path d="M12 9v8" /></>,
    "skin-care": <><path d="M8 10h8v10H8zM9.5 10V7h5v3M10 4h4" /></>,
    "hair-care": <><path d="M6 20c0-6 2-12 6-15M12 20c0-6 1.5-11 4.5-14M18 20c0-4-1-7-2.5-9" /></>,
    "oral-care": <><path d="M8 4c-2 0-3 1.6-3 3.5 0 3 1.5 4.2 2 7 .4 2.5.8 5 2 5s1.4-4 3-4 1.8 4 3 4 1.6-2.5 2-5c.5-2.8 2-4 2-7C19 5.6 18 4 16 4c-1.6 0-2.4 1-4 1S9.6 4 8 4z" /></>,
    hygiene: <><path d="M7 11h10l-1 9H8z" /><path d="M10 11V8h4v3M12 8V5.5h3" /><path d="M5 5h.01M7 3.5h.01M4.5 8h.01" /></>,
    "first-aid": <><rect x="3.5" y="7" width="17" height="12" rx="2" /><path d="M9 7V5h6v2M12 10v6M9 13h6" /></>,
    "medical-devices": <><rect x="5" y="4" width="14" height="16" rx="3" /><rect x="8" y="7" width="8" height="5" rx="1" /><circle cx="12" cy="16" r="1.5" /></>,
    "mother-maternity": <><circle cx="12" cy="6" r="2.5" /><path d="M9 21v-5l-1.5-3.5c1-2 2.5-3 4.5-3s3.5 1 4 2.5c.6 1.6-.2 3-1.5 3.5L15 21" /></>,
    "surgical-supplies": <><path d="M14.5 4.5l5 5L9 20l-5-5z" /><path d="M8 11l2 2M11 8l2 2" /></>,
    wellness: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></>,
    "healthcare-essentials": <><path d="M5 9h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM8.5 9V6.5a3.5 3.5 0 0 1 7 0V9" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...base}>
      {paths[slug] ?? paths.medicines}
    </svg>
  );
}
