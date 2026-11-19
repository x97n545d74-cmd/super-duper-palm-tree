import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { categoryName, fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { telHref } from "@/lib/settings";

export function Footer({ ctx }: { ctx: SiteContext }) {
  const { t, locale, settings: s, categories, waGeneral } = ctx;
  const top = categories.filter((c) => !c.parent_id).slice(0, 8);
  const tel = telHref(s.phone);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-section bg-forest text-ivory">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/70">{t.footer.blurb}</p>
          <p className="mt-6 font-display text-lg font-semibold tracking-tight">{t.brand.tagline}</p>
          <p className="text-sm text-ivory/70">{t.brand.secondary}</p>
        </div>
        <FooterCol title={t.footer.explore} className="md:col-span-2">
          <FLink href={`/${locale}`}>{t.nav.home}</FLink>
          <FLink href={`/${locale}/products`}>{t.nav.products}</FLink>
          <FLink href={`/${locale}/categories`}>{t.nav.categories}</FLink>
          <FLink href={`/${locale}/about`}>{t.nav.about}</FLink>
          <FLink href={`/${locale}/contact`}>{t.nav.contact}</FLink>
        </FooterCol>
        <FooterCol title={t.footer.categories} className="md:col-span-3">
          {top.map((c) => (
            <FLink key={c.id} href={`/${locale}/categories/${c.slug}`}>
              {categoryName(c, locale)}
            </FLink>
          ))}
        </FooterCol>
        <FooterCol title={t.footer.contact} className="md:col-span-3">
          <li className="text-sm text-ivory/70">
            {[s.address, s.city, s.state].filter(Boolean).join(", ")}
          </li>
          {tel && (
            <li>
              <a href={tel} className="link-u text-sm text-ivory/85">
                {s.phone}
              </a>
            </li>
          )}
          {waGeneral && (
            <li>
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="link-u text-sm text-ivory/85">
                {t.cta.whatsappUs}
              </a>
            </li>
          )}
          {s.email && (
            <li>
              <a href={`mailto:${s.email}`} className="link-u text-sm text-ivory/85">
                {s.email}
              </a>
            </li>
          )}
          {s.opening_hours && <li className="whitespace-pre-line text-sm text-ivory/70">{s.opening_hours}</li>}
          <li className="pt-3">
            <span className="eyebrow !text-ivory/70">{t.footer.legal}</span>
          </li>
          <FLink href={`/${locale}/privacy`}>{t.footer.privacy}</FLink>
          <FLink href={`/${locale}/terms`}>{t.footer.terms}</FLink>
        </FooterCol>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-x flex flex-col gap-4 py-8 text-xs leading-relaxed text-ivory/70 md:flex-row md:justify-between">
          <p className="max-w-3xl">{t.footer.disclaimer}</p>
          <p className="shrink-0">{fmt(t.footer.rights, { year })}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="eyebrow !text-ivory/70">{title}</p>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link-u text-sm text-ivory/85 hover:text-ivory">
        {children}
      </Link>
    </li>
  );
}
