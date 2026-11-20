import { siteContext } from "@/lib/site";
import { pageMeta, jsonLd } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Lines } from "@/components/v2/Lines";
import { faqItems, faqSchema } from "@/components/marketing/Sections";
import { IconWhatsApp } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/faq">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/faq", title: t.v4.faqTitle, description: t.v4.faqDescription });
}

/**
 * Questions page (answer-engine friendly): each question is a heading and
 * its answer is visible text right under it, short and direct. The same
 * items carry the FAQPage structured data (published only here).
 */
export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s } = ctx;
  const items = faqItems(ctx);
  const wa = waLink(s.whatsapp, t.whatsapp.general);
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.v4.faqNav, href: `/${locale}/faq` },
        ]}
      />
      <p data-rv className="eyebrow mt-10">
        {t.mkt.faq.eyebrow}
      </p>
      <h1 className="mt-4 text-h1">
        <Lines lines={t.v4.faqLines} />
      </h1>
      <p data-rv style={{ ["--i" as string]: 4 }} className="mt-5 max-w-2xl text-lg text-ink-2">
        {t.v4.faqLead}
      </p>
      <ol className="mt-14 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((it, i) => (
          <li key={it.q} data-rv style={{ ["--i" as string]: i % 4 }} className="panel p-7">
            <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="qa-q mt-3">{it.q}</h2>
            <p className="mt-3 leading-relaxed text-ink-2">{it.a}</p>
          </li>
        ))}
      </ol>
      {wa && (
        <div data-rv className="mt-10">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa h-13 px-6">
            <IconWhatsApp className="h-5 w-5" /> {t.cta.whatsappUs}
          </a>
        </div>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema(items))} />
    </div>
  );
}
