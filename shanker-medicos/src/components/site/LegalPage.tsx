import type { SiteContext } from "@/lib/site";
import { fmt } from "@/i18n";
import { Breadcrumbs } from "./Breadcrumbs";

export function LegalPage({ ctx, title, path, updated, children }: { ctx: SiteContext; title: string; path: string; updated: string; children: React.ReactNode }) {
  const { t, locale } = ctx;
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: title, href: `/${locale}${path}` },
        ]}
      />
      <article className="mx-auto mt-10 max-w-3xl">
        <h1 className="text-h1">{title}</h1>
        <p className="mt-3 text-sm text-ink-2">{fmt(t.legal.updated, { date: updated })}</p>
        {t.legal.englishOnly && <p className="mt-6 rounded-card bg-mint p-4 text-sm text-forest">{t.legal.englishOnly}</p>}
        <div className="prose-legal mt-8" lang="en">
          {children}
        </div>
      </article>
    </div>
  );
}

export function contactLine(ctx: SiteContext) {
  const s = ctx.settings;
  const bits = [s.email && `email ${s.email}`, s.phone && `phone ${s.phone}`].filter(Boolean);
  return bits.length ? bits.join(" or ") : "the contact details on our Contact page";
}
