import Link from "next/link";
import { categoryName, fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import type { ProductPage, SortKey } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { AutoSubmit } from "./AutoSubmit";
import { searchMessage, waLink } from "@/lib/whatsapp";
import { IconArrow, IconWhatsApp } from "@/components/ui/Icons";
import { FiltersPanel } from "./FiltersPanel";

export type CatalogueParams = { q: string; category: string; brand: string; sort: SortKey | ""; page: number };

/** Shared results view for /products and /categories/[slug]. Filters are a plain GET form (works without JS). */
export function Catalogue({
  ctx,
  params,
  result,
  brands,
  basePath,
  lockCategory = false,
}: {
  ctx: SiteContext;
  params: CatalogueParams;
  result: ProductPage;
  brands: string[];
  basePath: string;
  lockCategory?: boolean;
}) {
  const { t, locale, categories, settings } = ctx;
  const top = categories.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => categories.filter((c) => c.parent_id === id);
  const catLabel = (id: string | null) => {
    const c = categories.find((x) => x.id === id);
    return c ? categoryName(c, locale) : undefined;
  };
  const query = (over: Partial<CatalogueParams>) => {
    const merged = { ...params, ...over };
    const sp = new URLSearchParams();
    if (merged.q) sp.set("q", merged.q);
    if (merged.category && !lockCategory) sp.set("category", merged.category);
    if (merged.brand) sp.set("brand", merged.brand);
    if (merged.sort) sp.set("sort", merged.sort);
    if (merged.page > 1) sp.set("page", String(merged.page));
    const s = sp.toString();
    return `${basePath}${s ? `?${s}` : ""}`;
  };
  const activeFilters = !!(params.q || params.brand || (params.category && !lockCategory) || params.sort);
  const countText = result.total === 1 ? t.catalogue.countOne : fmt(t.catalogue.count, { n: result.total });

  const filters = (
    <form method="get" action={basePath} className="space-y-6" id="filters">
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {!lockCategory && (
        <div>
          <label htmlFor="f-category" className="label">
            {t.catalogue.category}
          </label>
          <select id="f-category" name="category" defaultValue={params.category} className="field">
            <option value="">{t.catalogue.allCategories}</option>
            {top.map((c) => (
              <optgroup key={c.id} label={categoryName(c, locale)}>
                <option value={c.slug}>{categoryName(c, locale)}</option>
                {childrenOf(c.id).map((ch) => (
                  <option key={ch.id} value={ch.slug}>
                    — {categoryName(ch, locale)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="f-brand" className="label">
          {t.catalogue.brand}
        </label>
        <select id="f-brand" name="brand" defaultValue={params.brand} className="field">
          <option value="">{t.catalogue.allBrands}</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="f-sort" className="label">
          {t.catalogue.sort}
        </label>
        <select id="f-sort" name="sort" defaultValue={params.sort || (params.q ? "relevance" : "az")} className="field">
          {params.q && <option value="relevance">{t.catalogue.sortRelevance}</option>}
          <option value="az">{t.catalogue.sortAz}</option>
          <option value="za">{t.catalogue.sortZa}</option>
          <option value="recent">{t.catalogue.sortRecent}</option>
        </select>
      </div>
      <noscript>
        <button className="btn btn-primary w-full">{t.catalogue.apply}</button>
      </noscript>
      <AutoSubmit formId="filters" />
      {activeFilters && (
        <Link href={basePath} className="link-u inline-block text-sm font-medium text-forest">
          {t.catalogue.clear}
        </Link>
      )}
    </form>
  );

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
      <aside aria-label={t.catalogue.filters}>
        <FiltersPanel label={t.catalogue.filters} count={countText}>
          {filters}
        </FiltersPanel>
      </aside>

      <section aria-live="polite" aria-labelledby="results-h">
        <h2 id="results-h" className="sr-only">
          {countText}
        </h2>
        <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <p className="text-sm text-ink-2">
            {countText}
            {params.brand && <span className="ml-2 rounded-full bg-mint px-2.5 py-0.5 text-forest">{params.brand}</span>}
          </p>
          {result.pageCount > 1 && <p className="text-sm text-ink-2">{fmt(t.catalogue.page, { page: result.page, total: result.pageCount })}</p>}
        </div>

        {result.items.length === 0 ? (
          <NoResults ctx={ctx} q={params.q} lockCategory={lockCategory} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} locale={locale} t={t} whatsapp={settings.whatsapp} categoryLabel={catLabel(p.category_id)} priority={i < 3} />
              ))}
            </div>
            {result.pageCount > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-between border-t border-line pt-6">
                {result.page > 1 ? (
                  <Link rel="prev" href={query({ page: result.page - 1 })} className="btn btn-ghost">
                    ← {t.catalogue.prev}
                  </Link>
                ) : (
                  <span />
                )}
                <ol className="hidden items-center gap-1 sm:flex">
                  {Array.from({ length: result.pageCount }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === result.pageCount || Math.abs(n - result.page) <= 2)
                    .map((n, i, arr) => (
                      <li key={n} className="flex items-center gap-1">
                        {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1 text-ink-2">…</span>}
                        <Link
                          href={query({ page: n })}
                          aria-current={n === result.page ? "page" : undefined}
                          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm ${n === result.page ? "bg-forest text-ivory" : "text-ink hover:bg-mint"}`}
                        >
                          {n}
                        </Link>
                      </li>
                    ))}
                </ol>
                {result.page < result.pageCount ? (
                  <Link rel="next" href={query({ page: result.page + 1 })} className="btn btn-ghost">
                    {t.catalogue.next} →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}
        <p className="mt-10 text-xs text-ink-2">{t.catalogue.note}</p>
      </section>
    </div>
  );
}

function NoResults({ ctx, q, lockCategory }: { ctx: SiteContext; q: string; lockCategory: boolean }) {
  const { t, locale, settings, categories } = ctx;
  const wa = q ? waLink(settings.whatsapp, searchMessage(locale, q)) : null;
  return (
    <div className="rounded-panel border border-dashed border-line bg-white px-6 py-14 text-center sm:px-12">
      <h2 className="text-h3">{q ? fmt(t.search.noResults, { q }) : t.catalogue.empty}</h2>
      {q && <p className="mx-auto mt-3 max-w-lg text-ink-2">{t.search.noResultsBody}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-wa">
            <IconWhatsApp className="h-5 w-5" /> {fmt(t.search.askInstead, { q })}
          </a>
        )}
        <Link href={`/${locale}/products`} className="btn btn-ghost">
          {t.nav.products} <IconArrow />
        </Link>
      </div>
      {!lockCategory && (
        <ul className="mt-10 flex flex-wrap justify-center gap-2">
          {categories
            .filter((c) => c.featured)
            .slice(0, 8)
            .map((c) => (
              <li key={c.id}>
                <Link href={`/${locale}/categories/${c.slug}`} className="inline-block rounded-full border border-line px-3 py-1.5 text-sm hover:border-forest">
                  {categoryName(c, locale)}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
