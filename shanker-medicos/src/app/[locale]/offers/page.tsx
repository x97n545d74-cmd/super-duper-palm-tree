import { siteContext } from "@/lib/site";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { jsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { OfferAndClub, OfferTerms, Faq, offerVars } from "@/components/marketing/Sections";
import { Lines } from "@/components/v2/Lines";
import { GenericOfferCard } from "@/components/v2/Generics";
import { GENERIC_OFFER_PERCENT } from "@/lib/generics";

export async function generateMetadata({ params }: PageProps<"/[locale]/offers">) {
  const ctx = await siteContext((await params).locale);
  const v = offerVars(ctx);
  return pageMeta({ locale: ctx.locale, path: "/offers", title: fmt(ctx.t.mkt.offersMetaTitle, v), description: fmt(ctx.t.mkt.offersMetaDescription, v) });
}

/** Landing page for ads and social posts: offer, club sign-up, prescription on WhatsApp, FAQ. */
export default async function OffersPage({ params }: PageProps<"/[locale]/offers">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s } = ctx;
  const v = offerVars(ctx);
  const offerSchema = s.offer_enabled
    ? {
        "@context": "https://schema.org",
        "@type": "Offer",
        name: fmt(t.mkt.offer.title, v),
        description: fmt(t.mkt.offer.body, v),
        url: `${SITE_URL}/${locale}/offers`,
        offeredBy: { "@id": `${SITE_URL}/#pharmacy` },
        eligibleTransactionVolume: { "@type": "PriceSpecification", minPrice: s.offer_min_amount, priceCurrency: "INR" },
      }
    : null;
  return (
    <div className="relative isolate pb-8 pt-10">
      <div className="container-x relative z-10">
        <Breadcrumbs
          label={t.nav.breadcrumb}
          items={[
            { name: t.nav.home, href: `/${locale}` },
            { name: t.v2.nav.offers, href: `/${locale}/offers` },
          ]}
        />
        <p data-rv className="eyebrow mt-10">
          {t.mkt.offer.badge}
        </p>
        <h1 className="mt-4 max-w-5xl text-h1">
          <Lines lines={s.offer_enabled ? fmt(t.mkt.offer.title, v) : fmt(t.mkt.club.title, v)} />
        </h1>
      </div>
      <div className="container-x relative z-10 mt-10">
        <GenericOfferCard ctx={ctx} />
      </div>
      <div className="relative z-10 -mt-8">
        <OfferAndClub ctx={ctx} source="offers_page" headingId="offers-cards-h" />
      </div>
      {s.offer_enabled && (
        <div className="container-x mt-6">
          <OfferTerms ctx={ctx} />
        </div>
      )}
      <Faq ctx={ctx} />
      {offerSchema && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(offerSchema)} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "Offer",
          name: fmt(t.gen.title, { percent: GENERIC_OFFER_PERCENT }),
          description: fmt(t.gen.offerBody, { percent: GENERIC_OFFER_PERCENT }),
          url: `${SITE_URL}/${locale}/offers#generic-offer`,
          offeredBy: { "@id": `${SITE_URL}/#pharmacy` },
        })}
      />
    </div>
  );
}
