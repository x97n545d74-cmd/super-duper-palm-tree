import Link from "next/link";
import { notFound } from "next/navigation";
import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { categoryName, fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { parseCatalogueParams } from "@/lib/params";
import { Catalogue } from "@/components/site/Catalogue";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryGlyph } from "@/components/ui/Icons";

export async function generateMetadata({ params, searchParams }: PageProps<"/[locale]/categories/[slug]">) {
  const { locale: raw, slug } = await params;
  const { locale, t, categories } = await siteContext(raw);
  const c = categories.find((x) => x.slug === slug);
  if (!c) return {};
  const name = categoryName(c, locale);
  const sp = parseCatalogueParams(await searchParams);
  return pageMeta({
    locale,
    path: `/categories/${c.slug}`,
    title: fmt(t.meta.categoryTitle, { name }),
    description: fmt(t.meta.categoryDescription, { name }),
    noindex: !!(sp.q || sp.brand || sp.sort || sp.page > 1),
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/[locale]/categories/[slug]">) {
  const { locale: raw, slug } = await params;
  const ctx = await siteContext(raw);
  const { t, locale, categories } = ctx;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const parent = category.parent_id ? categories.find((c) => c.id === category.parent_id) : undefined;
  const children = categories.filter((c) => c.parent_id === category.id);
  const p = { ...parseCatalogueParams(await searchParams), category: category.slug };
  const [result, brands] = await Promise.all([
    catalogue.searchProducts({ q: p.q, category: category.slug, brand: p.brand || undefined, sort: p.sort || undefined, page: p.page }),
    catalogue.listBrands(),
  ]);
  const name = categoryName(category, locale);

  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.categories, href: `/${locale}/categories` },
          ...(parent ? [{ name: categoryName(parent, locale), href: `/${locale}/categories/${parent.slug}` }] : []),
          { name, href: `/${locale}/categories/${category.slug}` },
        ]}
      />
      <div className="mt-8 flex items-center gap-5">
        <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-mint text-forest sm:flex">
          <CategoryGlyph slug={category.slug} className="h-7 w-7" />
        </span>
        <div>
          <p className="eyebrow">{t.catalogue.category}</p>
          <h1 className="mt-2 text-h1">{name}</h1>
        </div>
      </div>
      {children.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm text-ink-2">{t.catalogue.subcategories}</p>
          <ul className="flex flex-wrap gap-2">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={`/${locale}/categories/${c.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm hover:border-forest">
                  <CategoryGlyph slug={c.slug} className="h-4 w-4 text-emerald" />
                  {categoryName(c, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Catalogue ctx={ctx} params={p} result={result} brands={brands} basePath={`/${locale}/categories/${category.slug}`} lockCategory />
    </div>
  );
}
