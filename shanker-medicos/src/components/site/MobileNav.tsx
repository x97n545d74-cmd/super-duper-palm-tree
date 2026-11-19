"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconClose, IconMenu, IconWhatsApp, CategoryGlyph } from "@/components/ui/Icons";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "@/components/brand/Logo";
import type { Locale } from "@/i18n/config";

type NavItem = { href: string; label: string };

export function MobileNav({
  locale,
  items,
  categories,
  labels,
  waHref,
}: {
  locale: Locale;
  items: NavItem[];
  categories: { slug: string; name: string }[];
  labels: { menu: string; close: string; language: string; categories: string; whatsapp: string };
  waHref: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Close the drawer after navigation (state adjustment during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink xl:hidden"
      >
        <IconMenu />
        <span className="sr-only">{labels.menu}</span>
      </button>
      <div
        className={`fixed inset-0 z-[60] bg-forest-deep/40 backdrop-blur-[2px] transition-opacity xl:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-[70] flex w-[min(92vw,380px)] flex-col bg-ivory shadow-float transition-transform duration-300 ease-out-soft xl:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <Logo />
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line">
            <IconClose />
            <span className="sr-only">{labels.close}</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <ul className="space-y-1">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="block py-2.5 font-display text-2xl font-semibold tracking-tight text-ink">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8 mb-3">{labels.categories}</p>
          <ul className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${locale}/categories/${c.slug}`} className="flex items-center gap-2 rounded-control border border-line bg-white px-3 py-2.5 text-sm text-ink">
                  <CategoryGlyph slug={c.slug} className="h-4 w-4 shrink-0 text-emerald" />
                  <span className="truncate">{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="eyebrow mt-8 mb-3">{labels.language}</p>
          <LanguageSwitcher locale={locale} label={labels.language} variant="stack" />
        </div>
        {waHref && (
          <div className="border-t border-line p-5">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-wa w-full">
              <IconWhatsApp className="h-5 w-5" /> {labels.whatsapp}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
