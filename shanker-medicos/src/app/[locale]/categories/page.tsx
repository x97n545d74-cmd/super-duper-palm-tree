import Link from "next/link";
import { siteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { categoryName, fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CategoryGlyph, IconArrow } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/categories">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/categories", title: `${t.nav.categories} | Shanker Medicos, Batala`, description: t.home.categoriesBody });
}

export default async function CategoriesIndex({ params }: PageProps<"/[locale]/categories">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, categories } = ctx;
  const index = await catalogue.listPublishedForIndex();
  const top = categories.filter((c) => !c.parent_id);
  const kids = (id: string) => categories.filter((c) => c.parent_id === id);
  const count = (id: string) => {
    const ids = new Set([id, ...kids(id).map((k) => k.id)]);
    return index.filter((p) => p.category_id && ids.has(p.category_id)).length;
  };
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.categories, href: `/${locale}/categories` },
        ]}
      />
      <p className="eyebrow mt-8">{t.home.categoriesEyebrow}</p>
      <h1 className="mt-3 text-h1">{t.home.categoriesTitle}</h1>
      <p className="mt-3 max-w-xl text-ink-2">{t.home.categoriesBody}</p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {top.map((c) => {
          const n = count(c.id);
          return (
            <li key={c.id}>
              <div className="grid items-center gap-4 py-5 sm:grid-cols-[3rem_1fr_auto]">
                <span className="hidden h-12 w-12 items-center justify-center rounded-full bg-mint text-forest sm:flex">
                  <CategoryGlyph slug={c.slug} className="h-5 w-5" />
                </span>
                <div>
                  <Link href={`/${locale}/categories/${c.slug}`} className="link-u font-display text-xl font-semibold tracking-tight">
                    {categoryName(c, locale)}
                  </Link>
                  {kids(c.id).length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-2">
                      {kids(c.id).map((k) => (
                        <Link key={k.id} href={`/${locale}/categories/${k.slug}`} className="link-u">
                          {categoryName(k, locale)}
                        </Link>
                      ))}
                    </p>
                  )}
                </div>
                <Link href={`/${locale}/categories/${c.slug}`} className="inline-flex items-center gap-2 text-sm text-ink-2 hover:text-forest" aria-label={categoryName(c, locale)}>
                  {n === 1 ? t.catalogue.countOne : fmt(t.catalogue.count, { n })} <IconArrow />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
