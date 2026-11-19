import Link from "next/link";
import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { categoryName, fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { HeroArt } from "@/components/home/HeroArt";
import { HeroWordmark } from "@/components/home/HeroWordmark";
import { StoreVideo } from "@/components/home/StoreVideo";
import { SearchBox } from "@/components/site/SearchBox";
import { ProductCard } from "@/components/site/ProductCard";
import { LocationDetails } from "@/components/site/LocationDetails";
import { IconArrow, IconWhatsApp, CategoryGlyph } from "@/components/ui/Icons";
import { CompaniesTeaser, Faq, OfferAndClub, PrescriptionBand } from "@/components/marketing/Sections";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/", title: t.meta.siteTitle, description: t.meta.siteDescription });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings, categories, waGeneral } = ctx;
  const [featuredPage, index] = await Promise.all([
    catalogue.searchProducts({ perPage: 100, sort: "az" }),
    catalogue.listPublishedForIndex(),
  ]);
  const featured = featuredPage.items.filter((p) => p.featured).slice(0, 8);
  const tiles = categories.filter((c) => c.featured).slice(0, 12);
  const countFor = (id: string) => {
    const ids = new Set([id, ...categories.filter((c) => c.parent_id === id).map((c) => c.id)]);
    return index.filter((p) => p.category_id && ids.has(p.category_id)).length;
  };
  const popular = featured.slice(0, 5).map((p) => p.name);
  const catLabel = (id: string | null) => {
    const c = categories.find((x) => x.id === id);
    return c ? categoryName(c, locale) : undefined;
  };

  return (
    <>
      {/* C. HERO */}
      <section className="container-x pt-4 lg:pt-6">
        <div className="relative isolate overflow-hidden rounded-panel bg-forest text-ivory">
          {/* giant wordmark, cropped by the panel edge */}
          <HeroWordmark className="pointer-events-none absolute bottom-0 left-1/2 z-0 w-[94%] max-w-[1180px] -translate-x-1/2 translate-y-[27%] text-ivory" />
          <div className="relative z-10 grid px-6 pt-12 sm:px-10 lg:grid-cols-12 lg:gap-6 lg:px-14 lg:pt-20">
            <div className="lg:col-span-6 lg:pb-[clamp(11rem,15vw,15rem)]">
              <p className="rise text-[0.78rem] font-medium uppercase tracking-[0.22em] text-ivory/70">{t.hero.eyebrow}</p>
              <h1 className="mt-6 font-display text-display font-medium">
                <span className="block">{t.hero.title1}</span>
                <span className="block text-[#B9DCC6]">{t.hero.title2}</span>
              </h1>
              <p className="rise-2 mt-7 max-w-[34rem] text-[1.06rem] leading-relaxed text-ivory/75">{t.hero.body}</p>
              <div className="rise-3 mt-9 flex flex-wrap gap-3">
                <Link href={`/${locale}/products`} className="btn btn-light h-12 px-6">
                  {t.cta.explore} <IconArrow />
                </Link>
                <Link href={`/${locale}/contact`} className="btn btn-ghost-dark h-12 px-6">
                  {t.cta.contact}
                </Link>
              </div>
            </div>

            <div className="relative mt-6 h-[min(92vw,400px)] lg:col-span-6 lg:mt-0 lg:h-auto">
              {/* product still life, overlapping the wordmark */}
              <HeroArt className="rise-2 absolute bottom-[-6%] left-[2%] w-[min(78%,330px)] sm:left-[10%] lg:bottom-[-3rem] lg:left-[-6%] lg:w-[min(72%,440px)]" />

              {/* enquiry card */}
              <div className="rise-3 absolute right-0 top-2 hidden w-[17.5rem] rounded-card bg-ivory p-5 text-ink shadow-float sm:block lg:top-24">
                <p className="font-display text-lg font-semibold tracking-tight">{t.hero.cardTitle}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t.hero.cardBody}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-md bg-forest px-2.5 py-1 text-xs font-semibold text-ivory">{t.cta.whatsapp}</span>
                  {waGeneral ? (
                    <a href={waGeneral} target="_blank" rel="noopener noreferrer" aria-label={t.hero.cardCta} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-ivory transition hover:bg-emerald">
                      <IconArrow />
                    </a>
                  ) : (
                    <Link href={`/${locale}/contact`} aria-label={t.cta.contact} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-ivory transition hover:bg-emerald">
                      <IconArrow />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order on WhatsApp: prescription photo or medicine list */}
      <PrescriptionBand ctx={ctx} />

      {/* D. SEARCH */}
      <section className="container-x pt-section" aria-labelledby="search-h">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t.search.label}</p>
          <h2 id="search-h" className="mt-3 text-h2">{t.search.title}</h2>
          <p className="mt-3 text-ink-2">{t.search.body}</p>
          <div className="mt-8 text-left">
            <SearchBox locale={locale} labels={t.search} size="lg" />
          </div>
          {popular.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-ink-2">{t.search.popular}:</span>
              {popular.map((p) => (
                <Link key={p} href={`/${locale}/products?q=${encodeURIComponent(p)}`} className="rounded-full border border-line bg-white px-3 py-1.5 text-ink transition hover:border-forest">
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Offer reveal + Shanker Club sign-up */}
      <OfferAndClub ctx={ctx} source="homepage" />

      {/* E. CATEGORIES */}
      <section className="container-x pt-section" aria-labelledby="cat-h">
        <SectionHead eyebrow={t.home.categoriesEyebrow} title={t.home.categoriesTitle} body={t.home.categoriesBody} id="cat-h" link={{ href: `/${locale}/categories`, label: t.cta.viewAll }} />
        <ul className="mt-10 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:grid-cols-4">
          {tiles.map((c, i) => (
            <li key={c.id} className="border-b border-r border-line">
              <Link href={`/${locale}/categories/${c.slug}`} className="group flex h-full min-h-[150px] flex-col justify-between gap-6 bg-white/40 p-5 transition-colors hover:bg-white sm:min-h-[180px] sm:p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-forest transition-colors group-hover:bg-forest group-hover:text-ivory">
                    <CategoryGlyph slug={c.slug} className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div>
                  <h3 className="font-display text-[1.05rem] font-semibold leading-tight tracking-tight sm:text-lg">{categoryName(c, locale)}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-2">
                    {countFor(c.id) === 1 ? t.catalogue.countOne : countFor(c.id) > 1 ? fmt(t.catalogue.count, { n: countFor(c.id) }) : t.cta.browseCategory}
                    <IconArrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* F. FEATURED */}
      {featured.length > 0 && (
        <section className="container-x pt-section" aria-labelledby="feat-h">
          <SectionHead eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} body={t.home.featuredBody} id="feat-h" link={{ href: `/${locale}/products`, label: t.cta.viewAll }} />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} t={t} whatsapp={settings.whatsapp} categoryLabel={catLabel(p.category_id)} />
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-2">{t.catalogue.note}</p>
        </section>
      )}

      {/* Ethical brands */}
      <CompaniesTeaser ctx={ctx} />

      {/* G. TRUST */}
      <section className="pt-section" aria-labelledby="trust-h">
        <div className="bg-mint">
          <div className="container-x grid gap-12 py-section lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow">{t.home.trustEyebrow}</p>
              <h2 id="trust-h" className="mt-4 text-h1">{t.home.trustTitle}</h2>
              <p className="mt-6 max-w-sm text-ink-2">{t.brand.secondary}</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-card border border-forest/10 bg-forest/10 sm:grid-cols-2 lg:col-span-7">
              {t.home.trust.map((item, i) => (
                <li key={item.title} className="bg-mint p-7">
                  <span className="font-mono text-xs text-emerald">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 text-h3">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* H. HOW IT WORKS */}
      <section className="container-x pt-section" aria-labelledby="how-h">
        <SectionHead eyebrow={t.home.howEyebrow} title={t.home.howTitle} id="how-h" />
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {t.home.how.map((s, i) => (
            <li key={s.title} className="relative border-t border-forest pt-6">
              <span aria-hidden="true" className="font-display text-[3.5rem] font-medium leading-none tracking-tight text-forest/60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-h3">{s.title}</h3>
              <p className="mt-2 max-w-xs text-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link href={`/${locale}/products`} className="btn btn-primary h-12 px-6">
            {t.cta.explore} <IconArrow />
          </Link>
          {waGeneral && (
            <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-12 px-6">
              <IconWhatsApp className="h-5 w-5 text-emerald" /> {t.cta.whatsappUs}
            </a>
          )}
        </div>
      </section>

      <Faq ctx={ctx} />

      {/* I. LOCATION */}
      <section className="container-x pt-section" aria-labelledby="loc-h">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow">{t.home.locationEyebrow}</p>
            <h2 id="loc-h" className="mt-4 text-h1">{t.home.locationTitle}</h2>
            <p className="mt-5 text-ink-2">{t.home.locationBody}</p>
            <LocationDetails ctx={ctx} className="mt-10" />
          </div>
          <div className="lg:col-span-7">
            <StoreVideo caption={t.location.videoCaption} />
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, body, id, link }: { eyebrow: string; title: string; body?: string; id: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-3 text-h2">{title}</h2>
        {body && <p className="mt-3 text-ink-2">{body}</p>}
      </div>
      {link && (
        <Link href={link.href} className="link-u inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-forest md:self-auto">
          {link.label} <IconArrow />
        </Link>
      )}
    </div>
  );
}
