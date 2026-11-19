import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { IconWhatsApp } from "@/components/ui/Icons";
import { categoryName, fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { NavLinks } from "./NavLinks";

export function Header({ ctx, showMobileSearch = true }: { ctx: SiteContext; showMobileSearch?: boolean }) {
  const { t, locale, waGeneral, categories } = ctx;
  const items = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/categories`, label: t.nav.categories },
    { href: `/${locale}/products`, label: t.nav.products },
    { href: `/${locale}/companies`, label: t.mkt.navCompanies },
    { href: `/${locale}/offers`, label: t.mkt.navOffers },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/contact`, label: t.nav.contact },
  ];
  const top = categories.filter((c) => !c.parent_id);
  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-forest px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {t.nav.skip}
      </a>
      <div className="bg-forest text-ivory">
        <p className="container-x flex flex-wrap items-center justify-center gap-x-3 py-2 text-center text-[0.78rem] text-ivory/85">
          <span className={ctx.settings.offer_enabled ? "hidden md:inline" : ""}>{t.announce}</span>
          {ctx.settings.offer_enabled && (
            <>
              <span aria-hidden="true" className="hidden text-ivory/40 md:inline">
                ·
              </span>
              <Link href={`/${locale}/offers`} className="font-semibold text-ivory underline-offset-4 hover:underline">
                {fmt(t.mkt.offer.announce, { percent: ctx.settings.offer_percent, min: ctx.settings.offer_min_amount.toLocaleString("en-IN") })} →
              </Link>
            </>
          )}
        </p>
      </div>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/75">
        <div className="container-x flex h-[68px] items-center justify-between gap-6">
          <Link href={`/${locale}`} aria-label={`${ctx.settings.business_name}, ${t.nav.home}`} className="shrink-0">
            <Logo />
          </Link>
          <NavLinks items={items} />
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <LanguageSwitcher locale={locale} label={t.nav.language} />
            </div>
            {waGeneral && (
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-wa hidden h-10 min-h-0 px-4 text-sm sm:inline-flex">
                <IconWhatsApp className="h-4 w-4" /> {t.cta.whatsapp}
              </a>
            )}
            <MobileNav
              locale={locale}
              items={items}
              categories={top.map((c) => ({ slug: c.slug, name: categoryName(c, locale) }))}
              labels={{ menu: t.nav.menu, close: t.nav.close, language: t.nav.language, categories: t.nav.categories, whatsapp: t.cta.whatsappUs }}
              waHref={waGeneral}
            />
          </div>
        </div>
        {showMobileSearch && (
          <div className="container-x pb-3 xl:hidden">
            <SearchBox locale={locale} labels={{ ...t.search, placeholder: t.search.short }} />
          </div>
        )}
      </header>
    </>
  );
}
