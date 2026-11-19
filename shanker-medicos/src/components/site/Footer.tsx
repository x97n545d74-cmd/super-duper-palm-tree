import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { telHref } from "@/lib/settings";
import { STOCK } from "@/lib/stock";
import { navItems } from "./Header";

export function Footer({ ctx }: { ctx: SiteContext }) {
  const { t, locale, settings: s, waGeneral } = ctx;
  const tel = telHref(s.phone);
  const year = new Date().getFullYear();
  return (
    <footer className="mt-section px-3 pb-3 sm:px-4 sm:pb-4">
      <div className="overflow-hidden rounded-[28px] bg-forest text-white">
        <div className="container-x grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo tone="light" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/70">{t.footer.blurb}</p>
            <p className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/50">{t.v2.hero.chip}</p>
          </div>
          <FooterCol title={t.footer.explore} className="md:col-span-2">
            {navItems(ctx).map((it) => (
              <FLink key={it.href} href={it.href}>
                {it.label}
              </FLink>
            ))}
          </FooterCol>
          <FooterCol title={t.v2.stock.eyebrow} className="md:col-span-3">
            {STOCK.slice(0, 8).map((f) => (
              <FLink key={f.id} href={`/${locale}/products#${f.id}`}>
                {f.name[locale]}
              </FLink>
            ))}
          </FooterCol>
          <FooterCol title={t.footer.contact} className="md:col-span-3">
            <li className="text-sm text-white/75">{[s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ")}</li>
            {tel && (
              <li>
                <a href={tel} className="link-u text-sm text-white/90">
                  {s.phone}
                </a>
              </li>
            )}
            {waGeneral && (
              <li>
                <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="link-u text-sm text-white/90">
                  {t.cta.whatsappUs}
                </a>
              </li>
            )}
            {s.opening_hours && <li className="whitespace-pre-line text-sm text-white/75">{s.opening_hours}</li>}
            <li className="pt-3">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/50">{t.footer.legal}</span>
            </li>
            <FLink href={`/${locale}/privacy`}>{t.footer.privacy}</FLink>
            <FLink href={`/${locale}/terms`}>{t.footer.terms}</FLink>
          </FooterCol>
        </div>
        <div className="border-t border-white/10">
          <div className="container-x flex flex-col gap-4 py-8 text-xs leading-relaxed text-white/60 md:flex-row md:justify-between">
            <p className="max-w-3xl">{t.footer.disclaimer}</p>
            <p className="shrink-0">{fmt(t.footer.rights, { year })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/50">{title}</p>
      <ul className="mt-5 space-y-2.5">{children}</ul>
    </div>
  );
}

function FLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="link-u text-sm text-white/85 hover:text-white">
        {children}
      </Link>
    </li>
  );
}
