// Pure, in-memory catalogue querying. Used by the local data store and by unit tests.
// The Supabase store pushes the same filters down to PostgreSQL.

import type { Category, Product, ProductPage, ProductQuery, Suggestion } from "../types";
import { norm } from "../text";

export const DEFAULT_PER_PAGE = 24;

/** The category itself plus its direct children (one level of nesting is supported). */
export function categoryScope(categories: Category[], slug: string): Set<string> {
  const root = categories.find((c) => c.slug === slug);
  if (!root) return new Set();
  const ids = new Set([root.id]);
  for (const c of categories) if (c.parent_id === root.id) ids.add(c.id);
  return ids;
}

/**
 * Relevance score: 0 means no match. Every query word must match somewhere
 * (name, brand, generic name, manufacturer). Name prefix beats name contains
 * beats brand beats generic name.
 */
export function score(p: Product, q: string): number {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return 1;
  const name = norm(p.name);
  const brand = norm(p.brand);
  const generic = norm(p.generic_name);
  const maker = norm(p.manufacturer);
  let total = 0;
  for (const w of words) {
    let s = 0;
    if (name.startsWith(w)) s = 10;
    else if (name.split(" ").some((t) => t.startsWith(w))) s = 8;
    else if (name.includes(w)) s = 6;
    else if (brand.startsWith(w)) s = 5;
    else if (brand.includes(w)) s = 4;
    else if (generic.includes(w)) s = 3;
    else if (maker.includes(w)) s = 2;
    if (!s) return 0;
    total += s;
  }
  return total;
}

export function queryProducts(products: Product[], categories: Category[], query: ProductQuery): ProductPage {
  const perPage = clampInt(query.perPage ?? DEFAULT_PER_PAGE, 1, 100);
  let list = query.includeUnpublished ? products : products.filter((p) => p.published);

  if (query.needsReview) list = list.filter((p) => p.needs_review);

  if (query.category) {
    const scope = categoryScope(categories, query.category);
    list = list.filter((p) => p.category_id && scope.has(p.category_id));
  }
  if (query.brand) {
    const b = norm(query.brand);
    list = list.filter((p) => norm(p.brand) === b);
  }

  const q = (query.q ?? "").trim();
  let ranked = list.map((p) => ({ p, s: q ? score(p, q) : 1 })).filter((x) => x.s > 0);

  const sort = query.sort ?? (q ? "relevance" : "az");
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  if (sort === "relevance") ranked.sort((a, b) => b.s - a.s || byName(a.p, b.p));
  else if (sort === "az") ranked.sort((a, b) => byName(a.p, b.p));
  else if (sort === "za") ranked.sort((a, b) => byName(b.p, a.p));
  else if (sort === "recent") ranked.sort((a, b) => b.p.updated_at.localeCompare(a.p.updated_at));

  const total = ranked.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = clampInt(query.page ?? 1, 1, pageCount);
  ranked = ranked.slice((page - 1) * perPage, page * perPage);
  return { items: ranked.map((x) => x.p), total, page, perPage, pageCount };
}

export function brandsOf(products: Product[]): string[] {
  const set = new Map<string, string>();
  for (const p of products) if (p.published && p.brand) set.set(norm(p.brand), p.brand);
  return [...set.values()].sort((a, b) => a.localeCompare(b));
}

export function buildSuggestions(
  products: Product[],
  categories: Category[],
  q: string,
  locale: string,
  catName: (c: Category) => string,
  limit = 7,
): Suggestion[] {
  const nq = norm(q);
  if (nq.length < 2) return [];
  const out: Suggestion[] = [];
  for (const c of categories) {
    if ([c.name_en, c.name_hi, c.name_pa].some((n) => norm(n).includes(nq))) {
      out.push({ type: "category", label: catName(c), href: `/${locale}/categories/${c.slug}` });
    }
    if (out.length >= 2) break;
  }
  const brands = brandsOf(products).filter((b) => norm(b).startsWith(nq)).slice(0, 2);
  for (const b of brands) {
    out.push({ type: "brand", label: b, href: `/${locale}/products?brand=${encodeURIComponent(b)}` });
  }
  const page = queryProducts(products, categories, { q, sort: "relevance", perPage: limit });
  for (const p of page.items) {
    if (out.length >= limit) break;
    out.push({ type: "product", label: p.name, sub: [p.brand, p.pack_size].filter(Boolean).join(" · "), href: `/${locale}/products/${p.slug}` });
  }
  return out.slice(0, limit);
}

function clampInt(n: number, min: number, max: number) {
  const v = Number.isFinite(n) ? Math.floor(n) : min;
  return Math.min(max, Math.max(min, v));
}
