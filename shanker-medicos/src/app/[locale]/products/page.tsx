import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { parseCatalogueParams } from "@/lib/params";
import { Catalogue } from "@/components/site/Catalogue";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SearchBox } from "@/components/site/SearchBox";
import { TrackView } from "@/components/marketing/ClickTracker";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/products">) {
  const { locale, t } = await siteContext((await params).locale);
  const p = parseCatalogueParams(await searchParams);
  const filtered = !!(p.q || p.brand || p.category || p.page > 1 || p.sort);
  return pageMeta({
    locale,
    path: "/products",
    title: p.q ? fmt(t.meta.searchTitle, { q: p.q }) : t.meta.productsTitle,
    description: t.meta.productsDescription,
    // Search and filter combinations are not indexed; the canonical stays /products.
    noindex: filtered,
  });
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[locale]/products">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale } = ctx;
  const p = parseCatalogueParams(await searchParams);
  const [result, brands] = await Promise.all([
    catalogue.searchProducts({ q: p.q, category: p.category || undefined, brand: p.brand || undefined, sort: p.sort || undefined, page: p.page }),
    catalogue.listBrands(),
  ]);
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.products, href: `/${locale}/products` },
        ]}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-end">
        <div>
          <p className="eyebrow">{t.catalogue.eyebrow}</p>
          <h1 className="mt-3 text-h1">{p.q ? fmt(t.catalogue.resultsFor, { q: p.q }) : t.catalogue.title}</h1>
        </div>
        <div className="hidden lg:block">
          <SearchBox locale={locale} labels={t.search} defaultValue={p.q} />
        </div>
      </div>
      <Catalogue ctx={ctx} params={p} result={result} brands={brands} basePath={`/${locale}/products`} />
      {p.q && <TrackView event="search" params={{ search_term: p.q, results: result.total }} />}
    </div>
  );
}
