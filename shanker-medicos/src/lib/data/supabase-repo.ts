import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BusinessSettings,
  Category,
  CategoryInput,
  ImportResult,
  ImportRow,
  Product,
  ProductInput,
  ProductPage,
  ProductQuery,
  Stats,
} from "../types";
import { publicClient, sessionClient } from "../supabase/clients";
import { categoryScope, DEFAULT_PER_PAGE, queryProducts } from "./query";
import { productKey, RepoError, type AdminRepo, type PublicRepo } from "./repo";
import { safeQuery, slugify, uniqueSlug } from "../text";
import { readImage } from "./images";
import { seedSettings } from "./seed";
import { missingSettings } from "../settings";

const BUCKET = "product-images";

function check<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
  if (res.error) {
    if (res.error.code === "42501") throw new RepoError("You do not have permission to do this.", "forbidden");
    if (res.error.code === "23505") throw new RepoError("That entry already exists.", "conflict");
    console.error("[supabase]", res.error);
    throw new RepoError("The database request failed. Please try again.", "internal");
  }
  return res.data;
}

async function categories(sb: SupabaseClient): Promise<Category[]> {
  return check(await sb.from("categories").select("*").order("sort_order")) as Category[];
}

async function settings(sb: SupabaseClient): Promise<BusinessSettings> {
  const row = check(await sb.from("business_settings").select("*").eq("id", 1).maybeSingle());
  return { ...seedSettings, ...(row ?? {}) } as BusinessSettings;
}

async function search(sb: SupabaseClient, q: ProductQuery, admin: boolean): Promise<ProductPage> {
  const cats = await categories(sb);
  const perPage = Math.min(100, Math.max(1, q.perPage ?? DEFAULT_PER_PAGE));
  const text = safeQuery(q.q ?? "");
  let req = sb.from("products").select("*", { count: "exact" });
  if (!admin || !q.includeUnpublished) req = req.eq("published", true);
  if (q.needsReview) req = req.eq("needs_review", true);
  if (q.category) {
    const ids = [...categoryScope(cats, q.category)];
    if (!ids.length) return { items: [], total: 0, page: 1, perPage, pageCount: 1 };
    req = req.in("category_id", ids);
  }
  if (q.brand) req = req.ilike("brand", safeQuery(q.brand));
  if (text) {
    for (const w of text.split(" ").filter(Boolean)) {
      req = req.or(`name.ilike.%${w}%,brand.ilike.%${w}%,generic_name.ilike.%${w}%,manufacturer.ilike.%${w}%`);
    }
    // Rank text matches in memory so relevance is identical in both data modes.
    const rows = check(await req.limit(500)) as Product[];
    return queryProducts(rows, cats, { ...q, q: text, includeUnpublished: true, category: undefined, brand: undefined, needsReview: false });
  }
  const sort = q.sort ?? "az";
  req =
    sort === "za"
      ? req.order("name", { ascending: false })
      : sort === "recent"
        ? req.order("updated_at", { ascending: false })
        : req.order("name", { ascending: true });
  const page = Math.max(1, Math.floor(q.page ?? 1));
  const res = await req.range((page - 1) * perPage, page * perPage - 1);
  const items = check(res) as Product[];
  const total = res.count ?? items.length;
  return { items, total, page, perPage, pageCount: Math.max(1, Math.ceil(total / perPage)) };
}

export const supabasePublic: PublicRepo = {
  listCategories: () => categories(publicClient()),
  getSettings: () => settings(publicClient()),
  searchProducts: (q) => search(publicClient(), q, false),
  async getProductBySlug(slug) {
    return (check(await publicClient().from("products").select("*").eq("slug", slug).eq("published", true).maybeSingle()) as Product) ?? null;
  },
  async listBrands() {
    const rows = check(await publicClient().from("products").select("brand").eq("published", true)) as { brand: string }[];
    const m = new Map(rows.filter((r) => r.brand).map((r) => [r.brand.toLowerCase(), r.brand]));
    return [...m.values()].sort((a, b) => a.localeCompare(b));
  },
  async listPublishedForIndex() {
    return check(
      await publicClient()
        .from("products")
        .select("id,slug,name,brand,generic_name,manufacturer,pack_size,category_id,published,updated_at")
        .eq("published", true)
        .limit(5000),
    ) as Awaited<ReturnType<PublicRepo["listPublishedForIndex"]>>;
  },
};

const now = () => new Date().toISOString();

export const supabaseAdmin: AdminRepo = {
  async stats(): Promise<Stats> {
    const sb = await sessionClient();
    const count = async (f: (r: ReturnType<typeof base>) => ReturnType<typeof base>) => (await f(base())).count ?? 0;
    const base = () => sb.from("products").select("id", { count: "exact", head: true });
    const [active, total, review, cats, recent, s] = await Promise.all([
      count((r) => r.eq("published", true)),
      count((r) => r),
      count((r) => r.eq("needs_review", true)),
      sb.from("categories").select("id", { count: "exact", head: true }),
      sb.from("products").select("*").order("updated_at", { ascending: false }).limit(6),
      settings(sb),
    ]);
    return {
      activeProducts: active,
      totalProducts: total,
      needsReview: review,
      categories: cats.count ?? 0,
      recent: check(recent) as Product[],
      missingSettings: missingSettings(s),
    };
  },
  async searchProducts(q) {
    return search(await sessionClient(), q, true);
  },
  async getProduct(id) {
    const sb = await sessionClient();
    return (check(await sb.from("products").select("*").eq("id", id).maybeSingle()) as Product) ?? null;
  },
  async saveProduct(input: ProductInput) {
    const sb = await sessionClient();
    const all = check(await sb.from("products").select("id,slug,name,brand,pack_size")) as Product[];
    const others = all.filter((p) => p.id !== input.id);
    const dup = others.find((p) => productKey(p) === productKey(input));
    if (dup) throw new RepoError(`A product with the same name, brand and pack size already exists ("${dup.name}").`, "conflict");
    const taken = new Set(others.map((p) => p.slug));
    if (input.id) {
      const current = all.find((p) => p.id === input.id);
      if (!current) throw new RepoError("Product not found.", "not_found");
      const slug = input.slug ? uniqueSlug(input.slug, taken) : current.slug;
      const { id, ...rest } = input;
      return check(await sb.from("products").update({ ...rest, slug, updated_at: now() }).eq("id", id).select().single()) as Product;
    }
    const slug = uniqueSlug(input.slug || `${input.name} ${input.pack_size}`, taken);
    return check(await sb.from("products").insert({ ...input, slug }).select().single()) as Product;
  },
  async deleteProduct(id) {
    const sb = await sessionClient();
    check(await sb.from("products").delete().eq("id", id));
  },
  async setPublished(id, published) {
    const sb = await sessionClient();
    check(await sb.from("products").update({ published, updated_at: now() }).eq("id", id));
  },
  async listCategories() {
    return categories(await sessionClient());
  },
  async categoryCounts() {
    const sb = await sessionClient();
    const rows = check(await sb.from("products").select("category_id").limit(20000)) as { category_id: string | null }[];
    const out: Record<string, number> = {};
    for (const r of rows) if (r.category_id) out[r.category_id] = (out[r.category_id] ?? 0) + 1;
    return out;
  },
  async saveCategory(input: CategoryInput) {
    const sb = await sessionClient();
    const all = await categories(sb);
    if (input.id && input.parent_id === input.id) throw new RepoError("A category cannot be its own parent.", "invalid");
    if (input.id && input.parent_id && all.some((c) => c.parent_id === input.id))
      throw new RepoError("This category has sub-categories, so it cannot be placed inside another category.", "invalid");
    const taken = new Set(all.filter((c) => c.id !== input.id).map((c) => c.slug));
    if (input.id) {
      const current = all.find((c) => c.id === input.id);
      if (!current) throw new RepoError("Category not found.", "not_found");
      const { id, ...rest } = input;
      const slug = input.slug ? uniqueSlug(input.slug, taken) : current.slug;
      return check(await sb.from("categories").update({ ...rest, slug, updated_at: now() }).eq("id", id).select().single()) as Category;
    }
    const slug = uniqueSlug(input.slug || slugify(input.name_en), taken);
    const sort_order = Math.max(0, ...all.map((c) => c.sort_order)) + 1;
    return check(await sb.from("categories").insert({ ...input, slug, sort_order }).select().single()) as Category;
  },
  async deleteCategory(id) {
    const sb = await sessionClient();
    const used = await sb.from("products").select("id", { count: "exact", head: true }).eq("category_id", id);
    if ((used.count ?? 0) > 0) throw new RepoError("Move or delete the products in this category first.", "conflict");
    const kids = await sb.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id);
    if ((kids.count ?? 0) > 0) throw new RepoError("Move or delete its sub-categories first.", "conflict");
    check(await sb.from("categories").delete().eq("id", id));
  },
  async reorderCategories(orderedIds) {
    const sb = await sessionClient();
    await Promise.all(orderedIds.map((id, i) => sb.from("categories").update({ sort_order: i + 1 }).eq("id", id).then(check)));
  },
  async getSettings() {
    return settings(await sessionClient());
  },
  async saveSettings(s) {
    const sb = await sessionClient();
    check(await sb.from("business_settings").upsert({ id: 1, ...s, updated_at: now() }));
  },
  async duplicateKeys() {
    const sb = await sessionClient();
    const rows = check(await sb.from("products").select("id,name,brand,pack_size").limit(20000)) as Product[];
    return new Map(rows.map((p) => [productKey(p), p.id]));
  },
  async importProducts(rows: ImportRow[], mode) {
    const sb = await sessionClient();
    const cats = await categories(sb);
    const existing = check(await sb.from("products").select("id,slug,name,brand,pack_size").limit(20000)) as Product[];
    const keys = new Map(existing.map((p) => [productKey(p), p]));
    const taken = new Set(existing.map((p) => p.slug));
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
    const inserts: Record<string, unknown>[] = [];
    for (const [i, r] of rows.entries()) {
      const cat = r.category ? cats.find((c) => c.slug === slugify(r.category) || c.name_en.toLowerCase() === r.category.toLowerCase().trim()) : undefined;
      if (r.category && !cat) {
        result.errors.push({ row: i + 2, message: `Unknown category "${r.category}".` });
        continue;
      }
      const { category: _c, ...fields } = r;
      void _c;
      const row = { ...fields, category_id: cat?.id ?? null };
      const found = keys.get(productKey(r));
      if (found) {
        if (mode === "skip") {
          result.skipped++;
          continue;
        }
        const res = await sb.from("products").update({ ...row, updated_at: now() }).eq("id", found.id);
        if (res.error) result.errors.push({ row: i + 2, message: res.error.message });
        else result.updated++;
        continue;
      }
      const slug = uniqueSlug(`${r.name} ${r.pack_size}`, taken);
      taken.add(slug);
      keys.set(productKey(r), { ...(row as unknown as Product), id: "pending", slug });
      inserts.push({ ...row, id: randomUUID(), slug, needs_review: false, featured: false, _row: i + 2 });
    }
    for (let i = 0; i < inserts.length; i += 200) {
      const chunk = inserts.slice(i, i + 200);
      const res = await sb.from("products").insert(chunk.map(({ _row, ...r }) => (void _row, r)));
      if (res.error) chunk.forEach((r) => result.errors.push({ row: r._row as number, message: res.error!.message }));
      else result.created += chunk.length;
    }
    return result;
  },
  async uploadImage(file) {
    const { bytes, ext, type } = await readImage(file);
    const sb = await sessionClient();
    const key = `products/${randomUUID()}.${ext}`;
    const up = await sb.storage.from(BUCKET).upload(key, bytes, { contentType: type, upsert: false, cacheControl: "31536000" });
    if (up.error) throw new RepoError(`Image upload failed: ${up.error.message}`, "internal");
    return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  },
};
