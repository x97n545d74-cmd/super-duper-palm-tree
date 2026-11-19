import Link from "next/link";
import { notFound } from "next/navigation";
import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { categoryName, fmt } from "@/i18n";
import { jsonLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/env";
import { productMessage, waLink } from "@/lib/whatsapp";
import { telHref } from "@/lib/settings";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductImage } from "@/components/site/ProductImage";
import { ProductCard } from "@/components/site/ProductCard";
import { WaButton } from "@/components/site/WhatsApp";
import { IconInfo, IconPhone, IconWhatsApp } from "@/components/ui/Icons";
import { TrackView } from "@/components/marketing/ClickTracker";
import { fmt as f2 } from "@/i18n";

export async function generateMetadata({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale: raw, slug } = await params;
  const { locale, t } = await siteContext(raw);
  const p = await catalogue.getProductBySlug(slug);
  if (!p) return {};
  return pageMeta({
    locale,
    path: `/products/${p.slug}`,
    title: fmt(t.meta.productTitle, { name: p.name, pack: p.pack_size }),
    description: fmt(t.meta.productDescription, { name: p.name, brand: p.brand, pack: p.pack_size }),
    image: p.image_url,
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const { locale: raw, slug } = await params;
  const ctx = await siteContext(raw);
  const { t, locale, settings, categories } = ctx;
  const product = await catalogue.getProductBySlug(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category_id);
  const parent = category?.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined;
  const related = category
    ? (await catalogue.searchProducts({ category: category.slug, perPage: 9 })).items.filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const wa = waLink(settings.whatsapp, productMessage(locale, product));
  const tel = telHref(settings.phone);
  const rxNote = t.product.rxNote[product.rx_class];
  // Medicines that need (or may need) a prescription: offer to send it on WhatsApp.
  const rxWa =
    product.rx_class !== "otc"
      ? waLink(settings.whatsapp, `${t.mkt.rx.msgPhoto}\n\n${product.name} (${product.brand}, ${product.pack_size})`)
      : null;

  const specs: [string, string][] = (
    [
      [t.product.brand, product.brand],
      [t.product.manufacturer, product.manufacturer],
      [t.product.generic, product.generic_name],
      [t.product.packSize, product.pack_size],
      [t.product.category, category ? categoryName(category, locale) : ""],
      [t.product.prescription, t.product.rx[product.rx_class]],
      [t.product.availability, t.product.stock[product.availability]],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const crumbs = [
    { name: t.nav.home, href: `/${locale}` },
    ...(parent ? [{ name: categoryName(parent, locale), href: `/${locale}/categories/${parent.slug}` }] : []),
    ...(category ? [{ name: categoryName(category, locale), href: `/${locale}/categories/${category.slug}` }] : [{ name: t.nav.products, href: `/${locale}/products` }]),
    { name: product.name, href: `/${locale}/products/${product.slug}` },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.slug,
    url: `${SITE_URL}/${locale}/products/${product.slug}`,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(product.manufacturer ? { manufacturer: { "@type": "Organization", name: product.manufacturer } } : {}),
    ...(product.image_url ? { image: product.image_url } : {}),
    ...(product.description ? { description: product.description } : {}),
    ...(category ? { category: category.name_en } : {}),
  };

  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs label={t.nav.breadcrumb} items={crumbs} />

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-28">
            <ProductImage product={product} sizes="(min-width:1024px) 600px, 100vw" priority className="rounded-panel border border-line" />
            {!product.image_url && <p className="mt-3 text-xs text-ink-2">{t.product.representative}</p>}
          </div>
        </div>

        <div className="lg:col-span-6">
          <p className="eyebrow">{product.brand}</p>
          <h1 className="mt-3 text-h1">{product.name}</h1>
          <p className="mt-3 text-lg text-ink-2">{product.pack_size}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-sm ${product.availability === "unconfirmed" ? "bg-white text-ink-2 ring-1 ring-line" : "bg-mint font-medium text-forest"}`}>
              {t.product.stock[product.availability]}
            </span>
            {product.rx_class === "rx" && <span className="rounded-full bg-[#FFF4E5] px-3 py-1 text-sm font-medium text-warn">{t.product.rx.rx}</span>}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <WaButton href={wa} label={t.cta.enquireWa} fallbackHref={`/${locale}/contact`} fallbackLabel={t.cta.notConfigured} className="h-14 flex-1 text-base" />
            {tel && (
              <a href={tel} className="btn btn-ghost h-14 px-6">
                <IconPhone /> {t.cta.call}
              </a>
            )}
          </div>
          <p className="mt-3 text-sm text-ink-2">{t.product.enquiryNote}</p>

          {rxWa && (
            <a href={rxWa} target="_blank" rel="noopener noreferrer" data-track-label="product_rx_photo" data-track-item={product.name} className="mt-4 flex items-center gap-3 rounded-card border border-line bg-white p-4 text-sm transition hover:border-forest">
              <IconWhatsApp className="h-5 w-5 shrink-0 text-emerald" />
              <span>
                <span className="block font-semibold text-forest">{t.mkt.rx.photo}</span>
                <span className="text-ink-2">{t.mkt.rx.photoBody}</span>
              </span>
            </a>
          )}

          {settings.offer_enabled && (
            <Link href={`/${locale}/offers`} className="mt-4 flex items-center justify-between gap-3 rounded-card bg-forest px-4 py-3 text-sm text-ivory">
              <span>
                <span className="font-semibold">{f2(t.mkt.offer.title, { percent: settings.offer_percent, min: settings.offer_min_amount.toLocaleString("en-IN") })}</span>
                <span className="block text-ivory/75">{t.mkt.offer.reveal}</span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          )}

          {rxNote && (
            <div className="mt-6 flex gap-3 rounded-card border border-line bg-white p-4 text-sm">
              <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
              <p>{rxNote}</p>
            </div>
          )}

          <dl className="mt-10 divide-y divide-line border-y border-line">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-3.5 text-sm sm:grid-cols-[11rem_1fr]">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>

          {product.description && (
            <section className="mt-10">
              <h2 className="text-h3">{t.product.about}</h2>
              <p className="mt-3 leading-relaxed text-ink">{product.description}</p>
            </section>
          )}
          {product.information && (
            <section className="mt-8">
              <h2 className="text-h3">{t.product.information}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{product.information}</p>
            </section>
          )}
          <p className="mt-8 border-l-2 border-emerald pl-4 text-sm text-ink-2">{t.product.noAdvice}</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-section" aria-labelledby="rel-h">
          <div className="flex items-end justify-between gap-4">
            <h2 id="rel-h" className="text-h2">{t.product.related}</h2>
            {category && (
              <Link href={`/${locale}/categories/${category.slug}`} className="link-u text-sm font-semibold text-forest">
                {t.cta.viewAll}
              </Link>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} t={t} whatsapp={settings.whatsapp} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <TrackView event="view_item" params={{ item_name: product.name, item_brand: product.brand }} />
    </div>
  );
}
