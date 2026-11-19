import Link from "next/link";
import { siteContext } from "@/lib/site";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { COMPANIES, companiesByLetter } from "@/lib/companies";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { IconWhatsApp } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/companies">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/companies", title: t.mkt.companies.metaTitle, description: t.mkt.companies.metaDescription });
}

export default async function CompaniesPage({ params }: PageProps<"/[locale]/companies">) {
  const { t, locale, waGeneral } = await siteContext((await params).locale);
  const c = t.mkt.companies;
  const groups = companiesByLetter();
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.mkt.navCompanies, href: `/${locale}/companies` },
        ]}
      />
      <p className="eyebrow mt-8">{c.eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-h1">{c.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">{c.body}</p>
      <p className="mt-2 text-sm text-ink-2">{fmt(c.count, { n: COMPANIES.length })}</p>

      <nav aria-label={c.jump} className="sticky top-[68px] z-10 -mx-1 mt-8 overflow-x-auto bg-ivory/95 py-3 backdrop-blur lg:top-[68px]">
        <ul lang="en" className="flex gap-1 px-1">
          {groups.map(([letter]) => (
            <li key={letter}>
              <a href={`#letter-${letter}`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-sm font-semibold hover:border-forest">
                {letter}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 space-y-10">
        {groups.map(([letter, list]) => (
          <section key={letter} id={`letter-${letter}`} aria-labelledby={`h-${letter}`} className="scroll-mt-36">
            <h2 id={`h-${letter}`} lang="en" className="border-b border-line pb-2 font-display text-2xl font-semibold text-forest">
              {letter}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((co) => (
                <li key={co.name}>
                  <Link
                    href={`/${locale}/products?q=${encodeURIComponent(co.q)}`}
                    className="block h-full rounded-card border border-line bg-white p-4 transition hover:border-forest hover:shadow-lift"
                  >
                    <span lang="en" className="block font-display font-semibold tracking-tight">
                      {co.name}
                    </span>
                    {co.known && (
                      <span lang="en" className="mt-1 block text-sm text-ink-2">
                        {co.known}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-panel bg-mint p-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-forest">{c.notListed}</p>
        {waGeneral && (
          <a href={waGeneral} target="_blank" rel="noopener noreferrer" data-track-label="companies_ask" className="btn btn-wa">
            <IconWhatsApp className="h-5 w-5" /> {t.cta.whatsappUs}
          </a>
        )}
      </div>
    </div>
  );
}
