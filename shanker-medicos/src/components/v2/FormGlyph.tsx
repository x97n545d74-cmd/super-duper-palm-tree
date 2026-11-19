import type { FormIcon } from "@/lib/stock";

/** Line icons for the kinds of products the store stocks (24px grid, 1.6 stroke). */
const PATHS: Record<FormIcon, React.ReactNode> = {
  tablet: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="8" cy="12" r="2.2" />
      <circle cx="16" cy="12" r="2.2" />
      <path d="M12 6v12" strokeDasharray="1.6 2" />
    </>
  ),
  capsule: (
    <>
      <rect x="2.8" y="8.2" width="18.4" height="7.6" rx="3.8" transform="rotate(-35 12 12)" />
      <path d="M9.6 8.6l4.8 6.8" />
    </>
  ),
  syrup: (
    <>
      <path d="M9.5 3h5v3h-5z" />
      <path d="M9 6h6l1.5 3v10a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V9z" />
      <path d="M7.5 12.5h9M7.5 17h9" />
    </>
  ),
  injection: (
    <>
      <path d="M14 4l6 6M17 7l-8.5 8.5-3-3L14 4" />
      <path d="M5.5 12.5l6 6M8.5 15.5L4 20" />
      <path d="M11 10l1.5 1.5" />
    </>
  ),
  drops: (
    <>
      <path d="M10 3h4v3l1.5 2v10a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V8L10 6z" />
      <path d="M19 13.5c0 1-.7 1.8-1.5 1.8s-1.5-.8-1.5-1.8 1.5-3 1.5-3 1.5 2 1.5 3z" />
    </>
  ),
  tube: (
    <>
      <path d="M6 9h12l-1.5 11h-9z" />
      <path d="M9 9V6h6v3M10.5 6V3.5h3V6" />
      <path d="M8.5 14h7" />
    </>
  ),
  inhaler: (
    <>
      <path d="M9 3h5v8H9z" />
      <path d="M7 11h9v6a3 3 0 0 1-3 3H7z" />
      <path d="M16 15h4v4h-4" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-14 15-15-.5 9-6 15-14 15" />
      <path d="M5 19l8-8" />
    </>
  ),
  glucose: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="3" />
      <rect x="8.5" y="6" width="7" height="5" rx="1" />
      <path d="M10 15h4M12 13v4" />
    </>
  ),
  firstaid: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M9 7V4.5h6V7M12 10.5v6M9 13.5h6" />
    </>
  ),
  baby: (
    <>
      <path d="M10 2.5h4M10.5 2.5L10 6h4l-.5-3.5" />
      <path d="M8.5 6h7l.5 3v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9z" />
      <path d="M8 12h3M8 15.5h3" />
    </>
  ),
  vitamin: (
    <>
      <path d="M7 7h10v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
      <path d="M6.5 3.5h11V7h-11z" />
      <path d="M10 13.5l1.5 1.5 3-3" />
    </>
  ),
};

export function FormGlyph({ icon, className = "h-6 w-6" }: { icon: FormIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[icon]}
    </svg>
  );
}
