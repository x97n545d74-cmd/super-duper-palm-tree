import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { telHref } from "@/lib/settings";
import { STOCK } from "@/lib/stock";
import { navItems } from "./Header";
import { HoursList } from "@/components/v2/HoursList";

export function Footer({ ctx }: { ctx: SiteContext }) {
  const { t, locale, settings: s, waGeneral } = ctx;
  const tel = telHref(s.phone);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-section overflow-hidden border-t border-line">
      <div className="container-x grid grid-cols-1 gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-2">{t.footer.blurb}</p>
          {waGeneral && (
            <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-wa mt-6">
              {t.cta.whatsappUs}
            </a>
          )}
        </div>
        <FooterCol title={t.footer.explore} className="md:col-span-2">
          {navItems(ctx).map((it) => (
            <FLink key={it.href} href={it.href}>
              {it.label}
            </FLink>
          ))}
          <FLink href={`/${locale}/faq`}>{t.v4.faqNav}</FLink>
        </FooterCol>
        <FooterCol title={t.v2.stock.eyebrow} className="md:col-span-3">
          {STOCK.slice(0, 8).map((f) => (
            <FLink key={f.id} href={`/${locale}/products#${f.id}`}>
              {f.name[locale]}
            </FLink>
          ))}
        </FooterCol>
        <FooterCol title={t.footer.contact} className="md:col-span-3">
          <li className="text-sm text-ink-2">{[s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ")}</li>
          {tel && (
            <li>
              <a href={tel} className="link-u text-sm text-ink">
                {s.phone}
              </a>
            </li>
          )}
          <li>
            <HoursList t={t} compact />
          </li>
          <li className="pt-3">
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-2">{t.footer.legal}</span>
          </li>
          <FLink href={`/${locale}/privacy`}>{t.footer.privacy}</FLink>
          <FLink href={`/${locale}/terms`}>{t.footer.terms}</FLink>
        </FooterCol>
      </div>
      {/* giant wordmark, cropped by the page edge */}
      <p aria-hidden="true" lang="en" className="display outline pointer-events-none select-none whitespace-nowrap px-2 text-center text-[13.6vw] leading-[0.8]">
        Shanker Medicos
      </p>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-4 py-8 text-xs leading-relaxed text-ink-2 md:flex-row md:justify-between">
          <p className="max-w-3xl">{t.footer.disclaimer}</p>
          <p className="shrink-0">
            {s.gstin && <span lang="en" className="mr-4 font-mono">GSTIN {s.gstin}</span>}
            {fmt(t.footer.rights, { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-ink-2">{title}</p>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-ink transition-colors hover:text-emerald">
        {children}
      </Link>
    </li>
  );
}
