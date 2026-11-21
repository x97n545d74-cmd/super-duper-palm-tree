"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { IconGlobe } from "@/components/ui/Icons";

/** Swaps the locale segment of the current URL and keeps the query string. The proxy stores the choice in a cookie. */
export function LanguageSwitcher({ locale, label, variant = "inline" }: { locale: Locale; label: string; variant?: "inline" | "stack" }) {
  const pathname = usePathname() || `/${locale}`;
  const rest = pathname.replace(/^\/(en|hi|pa)(?=\/|$)/, "");
  const href = (l: Locale) => `/${l}${rest}`;
  const go = (e: React.MouseEvent<HTMLAnchorElement>, l: Locale) => {
    e.preventDefault();
    // Full navigation so <html lang> and fonts switch cleanly.
    window.location.assign(href(l) + window.location.search);
  };
  return (
    <nav aria-label={label} className={variant === "stack" ? "flex gap-2" : "flex items-center gap-1"}>
      {variant === "inline" && <IconGlobe className="mr-1 h-4 w-4 text-ink-2" />}
      {LOCALES.map((l) => (
        <a
          key={l}
          href={href(l)}
          hrefLang={LOCALE_META[l].htmlLang}
          lang={LOCALE_META[l].htmlLang}
          onClick={(e) => go(e, l)}
          aria-current={l === locale ? "true" : undefined}
          className={
            variant === "stack"
              ? `flex-1 rounded-control border px-3 py-2.5 text-center text-sm font-medium ${l === locale ? "border-ink bg-ink text-ivory" : "border-line text-ink"}`
              : `rounded-full px-2.5 py-1 text-[0.8rem] font-medium transition ${l === locale ? "bg-ink text-ivory" : "text-ink-2 hover:text-ink"}`
          }
        >
          {variant === "stack" ? LOCALE_META[l].label : LOCALE_META[l].short === "EN" ? "EN" : LOCALE_META[l].label}
        </a>
      ))}
    </nav>
  );
}
