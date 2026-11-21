import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { IconWhatsApp } from "@/components/ui/Icons";
import { fmt } from "@/i18n";
import { GENERIC_OFFER_PERCENT } from "@/lib/generics";
import type { SiteContext } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { NavLinks } from "./NavLinks";

export function navItems(ctx: SiteContext) {
  const { t, locale } = ctx;
  return [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/products`, label: t.v2.nav.stock },
    { href: `/${locale}/companies`, label: t.v2.nav.companies },
    { href: `/${locale}/offers`, label: t.v2.nav.offers },
    { href: `/${locale}/about`, label: t.v2.nav.about },
    { href: `/${locale}/contact`, label: t.v2.nav.visit },
  ];
}

export function Header({ ctx }: { ctx: SiteContext; showMobileSearch?: boolean }) {
  const { t, locale, waGeneral, settings: s } = ctx;
  const items = navItems(ctx);
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-forest px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t.nav.skip}
      </a>
      {s.offer_enabled && (
        <div className="border-b border-line bg-black text-ink">
          <p className="container-x flex items-center justify-center gap-3 py-2 text-center text-[0.78rem]">
            <span className="hidden font-mono text-[0.66rem] uppercase tracking-[0.14em] text-emerald sm:inline">{t.mkt.offer.badge}</span>
            <Link href={`/${locale}/offers`} className="font-medium text-ink underline-offset-4 hover:underline">
              <span className="text-emerald">{fmt(t.gen.announce, { percent: GENERIC_OFFER_PERCENT })}</span>
              <span className="hidden sm:inline"> · {fmt(t.mkt.offer.announce, { percent: s.offer_percent, min: s.offer_min_amount.toLocaleString("en-IN") })}</span> →
            </Link>
          </p>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line/70">
        {/* Blur lives on its own layer: backdrop-filter on the header itself would trap the fixed mobile menu inside it. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/70 backdrop-blur-xl" />
        <div className="container-x flex h-[72px] items-center justify-between gap-6">
          <Link href={`/${locale}`} aria-label={`${s.business_name}, ${t.nav.home}`} className="shrink-0">
            <Logo />
          </Link>
          <NavLinks items={items} />
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <LanguageSwitcher locale={locale} label={t.nav.language} />
            </div>
            {waGeneral && (
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-wa hidden h-10 min-h-0 px-5 text-sm font-semibold sm:inline-flex">
                <IconWhatsApp className="h-4 w-4" /> {t.cta.whatsapp}
              </a>
            )}
            <MobileNav locale={locale} items={items} labels={{ menu: t.nav.menu, close: t.nav.close, language: t.nav.language, whatsapp: t.cta.whatsappUs }} waHref={waGeneral} />
          </div>
        </div>
      </header>
    </>
  );
}
