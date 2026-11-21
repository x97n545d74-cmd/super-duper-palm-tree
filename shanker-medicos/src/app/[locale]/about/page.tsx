import Link from "next/link";
import { siteContext } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { IconArrow } from "@/components/ui/Icons";
import { catalogue } from "@/lib/data";
import { fmt } from "@/i18n";
import { STOCK } from "@/lib/stock";
import { GENERIC_COMPANIES, GENERIC_OFFER_PERCENT } from "@/lib/generics";
import { HOURS, fmtTime } from "@/lib/hours";
import { SITE_URL } from "@/lib/env";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/about", title: t.meta.aboutTitle, description: t.meta.aboutDescription });
}

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { t, locale, settings: s } = await siteContext((await params).locale);
  const companies = await catalogue.listCompanies();
  const f = t.v4.facts;
  const hours = fmt(f.hoursVal, { winter: `${fmtTime(HOURS.winter.open)} – ${fmtTime(HOURS.winter.close)}`, summer: `${fmtTime(HOURS.summer.open)} – ${fmtTime(HOURS.summer.close)}` });
  const facts: [string, string][] = [
    [f.name, "Shanker Medicos"],
    [f.aka, "Shanker Chemists & Druggists · शंकर मेडिकोज़ · ਸ਼ੰਕਰ ਮੈਡੀਕੋਜ਼"],
    [f.type, f.typeVal],
    [f.address, [s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ")],
    [f.phone, s.phone],
    [f.hours, hours],
    [f.languages, f.languagesVal],
    [f.range, fmt(f.rangeVal, { n: companies.length, k: STOCK.length })],
    [f.generics, fmt(f.genericsVal, { g: GENERIC_COMPANIES.length, percent: GENERIC_OFFER_PERCENT })],
    ...(s.gstin ? [[f.gstin, s.gstin] as [string, string]] : []),
    [f.website, SITE_URL.replace(/^https?:\/\//, "")],
  ];
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.about, href: `/${locale}/about` },
        ]}
      />
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-rv className="eyebrow">{t.about.eyebrow}</p>
          <h1 className="mt-4 text-display !text-[clamp(2.4rem,1.6rem+3.4vw,4.4rem)]">{t.about.title}</h1>
          <p data-rv style={{ ["--i" as string]: 2 }} className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">{t.about.lead}</p>
        </div>
        <figure data-rv style={{ ["--i" as string]: 3 }} className="lg:col-span-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/batala-store-poster.jpg" alt={t.v2.hero.videoAlt} width={1280} height={720} className="aspect-[4/3] w-full rounded-panel border border-line object-cover shadow-float" />
          <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-ink-2">{t.v2.hero.chip}</figcaption>
        </figure>
      </div>
      {/* Facts in one place, in plain words (for people, Google and AI assistants) */}
      <section className="mt-section" aria-labelledby="facts-h">
        <h2 id="facts-h" className="text-h2">
          {t.v4.factsTitle}
        </h2>
        <dl data-rv className="panel mt-8 divide-y divide-line px-6 sm:px-8">
          {facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-6">
              <dt className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-ink-2">{k}</dt>
              <dd className="text-ink sm:col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <div className="mt-section grid grid-cols-1 gap-3 md:grid-cols-3">
        {t.about.sections.map((s, i) => (
          <section key={s.title} data-rv style={{ ["--i" as string]: i * 2 }} className="panel p-7">
            <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")} / 03</span>
            <h2 className="mt-3 text-h3">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-16 flex flex-wrap gap-3">
        <Link href={`/${locale}/products`} className="btn btn-primary h-12 px-6">
          {t.cta.explore} <IconArrow />
        </Link>
        <Link href={`/${locale}/contact`} className="btn btn-ghost h-12 px-6">
          {t.cta.contact}
        </Link>
      </div>
    </div>
  );
}
