import Link from "next/link";
import { IconWhatsApp } from "@/components/ui/Icons";

/** Floating chat button. Hidden entirely when no WhatsApp number is configured. */
export function WhatsAppFloat({ href, label }: { href: string | null; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2 rounded-full bg-wa pl-4 pr-4 text-white shadow-float transition hover:bg-[#156640] md:bottom-7 md:right-7"
    >
      <IconWhatsApp className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-300 group-hover:max-w-[16rem] md:inline">
        {label}
      </span>
    </a>
  );
}

/**
 * Product / general enquiry button. If the store has not added a WhatsApp
 * number yet, it falls back to the contact page instead of a broken link.
 */
export function WaButton({
  href,
  label,
  fallbackHref,
  fallbackLabel,
  className = "",
  size = "md",
}: {
  href: string | null;
  label: string;
  fallbackHref: string;
  fallbackLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const sz = size === "sm" ? "h-10 min-h-0 px-4 text-sm" : "";
  if (!href)
    return (
      <Link href={fallbackHref} className={`btn btn-ghost ${sz} ${className}`} title={fallbackLabel}>
        {label}
      </Link>
    );
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`btn btn-wa ${sz} ${className}`} data-wa="1">
      <IconWhatsApp className="h-[1.1em] w-[1.1em]" />
      {label}
    </a>
  );
}
