import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { fmt } from "@/i18n";
import { pageMeta, jsonLd } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CompanyFinder } from "@/components/v2/CompanyFinder";
import { Split } from "@/components/v2/Split";
import { SITE_URL } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/companies">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/companies", title: t.mkt.companies.metaTitle, description: t.mkt.companies.metaDescription });
}

export default async function CompaniesPage({ params }: PageProps<"/[locale]/companies">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s, waGeneral } = ctx;
  const v = t.v2.companies;
  const companies = await catalogue.listCompanies();
  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: v.title,
    url: `${SITE_URL}/${locale}/companies`,
    numberOfItems: companies.length,
    itemListElement: companies.map((c, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Organization", name: c.name } })),
  };
  return (
    <div className="relative isolate">
      <div className="fields" aria-hidden="true">
        <i />
      </div>
      <div className="container-x relative z-10 pb-8 pt-10">
        <Breadcrumbs
          label={t.nav.breadcrumb}
          items={[
            { name: t.nav.home, href: `/${locale}` },
            { name: t.v2.nav.companies, href: `/${locale}/companies` },
          ]}
        />
        <p data-rv className="eyebrow mt-10">
          {v.eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-display">
          <Split text={v.title} perWord={locale !== "en"} />
        </h1>
        <p data-rv style={{ ["--i" as string]: 6 }} className="mt-6 max-w-2xl text-lg text-ink-2">
          {v.body}
        </p>
        <div data-rv style={{ ["--i" as string]: 8 }} className="mt-12">
          <CompanyFinder
            askHref={waGeneral}
            labels={{ search: v.search, none: v.none, indian: v.indian, mnc: v.mnc, ask: v.ask, count: v.count, all: v.all }}
            companies={companies.map((c) => ({ id: c.id, name: c.name, known: c.known, kind: c.kind, logo: c.logo_url, wa: waLink(s.whatsapp, fmt(v.askMsg, { name: c.name })) }))}
          />
        </div>
        <p className="mt-10 max-w-3xl text-xs text-ink-2">{v.trademark}</p>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(list)} />
    </div>
  );
}
