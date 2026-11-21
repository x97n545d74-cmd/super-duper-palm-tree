import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import type {
  AnalyticsEvent,
  Company,
  CompanyInput,
  Member,
  MemberInput,
  BusinessSettings,
  Category,
  CategoryInput,
  ImportResult,
  ImportRow,
  Product,
  ProductInput,
  ProductQuery,
  Stats,
} from "../types";
import { brandsOf, queryProducts } from "./query";
import { memberCode, productKey, RepoError, type AdminRepo, type ClubRepo, type EventsRepo, type PublicRepo } from "./repo";
import { norm } from "../text";
import { seedCategories, seedCompanies, seedProducts, seedSettings } from "./seed";
import { slugify, uniqueSlug } from "../text";
import { readImage } from "./images";
import { missingSettings } from "../settings";
import { PUBLISH_ONLY } from "../env";

// Development mode store: one JSON file. Not for production (serverless
// file systems are read-only); production uses Supabase.

interface DB {
  categories: Category[];
  products: Product[];
  settings: BusinessSettings;
  members?: Member[];
  companies?: Company[];
}

const DATA_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.LOCAL_DATA_DIR || "data");
const DB_FILE = path.join(DATA_DIR, "store.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
const EVENTS_FILE = path.join(DATA_DIR, "events.ndjson");

let writing: Promise<unknown> = Promise.resolve();
let seeding: Promise<void> | null = null;

async function load(): Promise<DB> {
  // Publish-only: serve the built-in data, never touch the file system.
  if (PUBLISH_ONLY) return { categories: seedCategories, products: seedProducts, settings: seedSettings, companies: seedCompanies };
  try {
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    // First run: create the store from the seed exactly once.
    seeding ??= save({ categories: seedCategories, products: seedProducts, settings: seedSettings });
    await seeding;
    return JSON.parse(await fs.readFile(DB_FILE, "utf8")) as DB;
  }
}

async function save(db: DB) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, DB_FILE);
}

/** Serialise read-modify-write cycles so concurrent admin saves cannot clobber each other. */
function mutate<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  if (PUBLISH_ONLY) return Promise.reject(new RepoError("This site is in publish-only mode: changes are made in the code, not in admin.", "forbidden"));
  const run = writing.then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  writing = run.catch(() => undefined);
  return run;
}

const now = () => new Date().toISOString();

export const localPublic: PublicRepo = {
  async listCategories() {
    return (await load()).categories.slice().sort((a, b) => a.sort_order - b.sort_order);
  },
  async getSettings() {
    return { ...seedSettings, ...(await load()).settings };
  },
  async searchProducts(q) {
    const db = await load();
    return queryProducts(db.products, db.categories, { ...q, includeUnpublished: false, needsReview: false });
  },
  async getProductBySlug(slug) {
    const db = await load();
    return db.products.find((p) => p.slug === slug && p.published) ?? null;
  },
  async listBrands() {
    return brandsOf((await load()).products);
  },
  async listCompanies() {
    return ((await load()).companies ?? seedCompanies).slice().sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  },
  async listPublishedForIndex() {
    return (await load()).products.filter((p) => p.published);
  },
};

export const localAdmin: AdminRepo = {
  async stats(): Promise<Stats> {
    const db = await load();
    return {
      activeProducts: db.products.filter((p) => p.published).length,
      totalProducts: db.products.length,
      categories: db.categories.length,
      needsReview: db.products.filter((p) => p.needs_review).length,
      recent: db.products.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6),
      missingSettings: missingSettings({ ...seedSettings, ...db.settings }),
      members: (db.members ?? []).length,
      membersThisWeek: (db.members ?? []).filter((m) => Date.now() - Date.parse(m.created_at) < 7 * 86400_000).length,
    };
  },
  async searchProducts(q: ProductQuery) {
    const db = await load();
    return queryProducts(db.products, db.categories, { ...q, includeUnpublished: true });
  },
  async getProduct(id) {
    return (await load()).products.find((p) => p.id === id) ?? null;
  },
  saveProduct(input: ProductInput) {
    return mutate((db) => {
      const taken = new Set(db.products.filter((p) => p.id !== input.id).map((p) => p.slug));
      const dup = db.products.find((p) => p.id !== input.id && productKey(p) === productKey(input));
      if (dup) throw new RepoError(`A product with the same name, brand and pack size already exists ("${dup.name}").`, "conflict");
      if (input.id) {
        const i = db.products.findIndex((p) => p.id === input.id);
        if (i < 0) throw new RepoError("Product not found.", "not_found");
        const slug = input.slug ? uniqueSlug(input.slug, taken) : db.products[i].slug;
        db.products[i] = { ...db.products[i], ...input, id: db.products[i].id, slug, updated_at: now() };
        return db.products[i];
      }
      const p: Product = {
        ...input,
        id: randomUUID(),
        slug: uniqueSlug(input.slug || `${input.name} ${input.pack_size}`, taken),
        created_at: now(),
        updated_at: now(),
      };
      db.products.push(p);
      return p;
    });
  },
  deleteProduct(id) {
    return mutate((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    });
  },
  setPublished(id, published) {
    return mutate((db) => {
      const p = db.products.find((x) => x.id === id);
      if (!p) throw new RepoError("Product not found.", "not_found");
      p.published = published;
      p.updated_at = now();
    });
  },
  async listCategories() {
    return localPublic.listCategories();
  },
  async categoryCounts() {
    const out: Record<string, number> = {};
    for (const p of (await load()).products) if (p.category_id) out[p.category_id] = (out[p.category_id] ?? 0) + 1;
    return out;
  },
  saveCategory(input: CategoryInput) {
    return mutate((db) => {
      const taken = new Set(db.categories.filter((c) => c.id !== input.id).map((c) => c.slug));
      if (input.parent_id && input.parent_id === input.id) throw new RepoError("A category cannot be its own parent.", "invalid");
      if (input.id) {
        const i = db.categories.findIndex((c) => c.id === input.id);
        if (i < 0) throw new RepoError("Category not found.", "not_found");
        if (input.parent_id && db.categories.some((c) => c.parent_id === input.id))
          throw new RepoError("This category has sub-categories, so it cannot be placed inside another category.", "invalid");
        const slug = input.slug ? uniqueSlug(input.slug, taken) : db.categories[i].slug;
        db.categories[i] = { ...db.categories[i], ...input, id: db.categories[i].id, slug, updated_at: now() };
        return db.categories[i];
      }
      const c: Category = {
        ...input,
        id: randomUUID(),
        slug: uniqueSlug(input.slug || slugify(input.name_en), taken),
        sort_order: Math.max(0, ...db.categories.map((x) => x.sort_order)) + 1,
        updated_at: now(),
      };
      db.categories.push(c);
      return c;
    });
  },
  deleteCategory(id) {
    return mutate((db) => {
      if (db.products.some((p) => p.category_id === id))
        throw new RepoError("Move or delete the products in this category first.", "conflict");
      if (db.categories.some((c) => c.parent_id === id))
        throw new RepoError("Move or delete its sub-categories first.", "conflict");
      db.categories = db.categories.filter((c) => c.id !== id);
    });
  },
  reorderCategories(orderedIds) {
    return mutate((db) => {
      orderedIds.forEach((id, i) => {
        const c = db.categories.find((x) => x.id === id);
        if (c) c.sort_order = i + 1;
      });
    });
  },
  async getSettings() {
    return localPublic.getSettings();
  },
  saveSettings(s) {
    return mutate((db) => {
      db.settings = { ...s, updated_at: now() };
    });
  },
  async duplicateKeys() {
    const db = await load();
    return new Map(db.products.map((p) => [productKey(p), p.id]));
  },
  importProducts(rows: ImportRow[], mode) {
    return mutate((db) => {
      const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
      const bySlugOrName = (v: string) =>
        db.categories.find((c) => c.slug === slugify(v) || c.name_en.toLowerCase() === v.toLowerCase().trim());
      const keys = new Map(db.products.map((p) => [productKey(p), p]));
      const taken = new Set(db.products.map((p) => p.slug));
      rows.forEach((r, i) => {
        const cat = r.category ? bySlugOrName(r.category) : undefined;
        if (r.category && !cat) {
          result.errors.push({ row: i + 2, message: `Unknown category "${r.category}".` });
          return;
        }
        const existing = keys.get(productKey(r));
        const fields = { ...r, category_id: cat?.id ?? null };
        delete (fields as Partial<ImportRow>).category;
        if (existing) {
          if (mode === "skip") {
            result.skipped++;
            return;
          }
          Object.assign(existing, fields, { updated_at: now() });
          result.updated++;
          return;
        }
        const p: Product = {
          ...(fields as Omit<Product, "id" | "slug" | "created_at" | "updated_at" | "image_url" | "featured" | "needs_review">),
          id: randomUUID(),
          slug: uniqueSlug(`${r.name} ${r.pack_size}`, taken),
          image_url: null,
          featured: false,
          needs_review: false,
          created_at: now(),
          updated_at: now(),
        };
        taken.add(p.slug);
        keys.set(productKey(p), p);
        db.products.push(p);
        result.created++;
      });
      return result;
    });
  },
  async uploadImage(file) {
    const { bytes, ext } = await readImage(file);
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), bytes);
    return `/api/media/${name}`;
  },
  async listMembers({ q = "", page = 1, perPage = 50 }) {
    const all = ((await load()).members ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    const nq = norm(q);
    const list = nq ? all.filter((m) => [m.name, m.phone, m.email, m.code].some((v) => norm(v).includes(nq))) : all;
    const pageCount = Math.max(1, Math.ceil(list.length / perPage));
    const p = Math.min(Math.max(1, page), pageCount);
    return { items: list.slice((p - 1) * perPage, p * perPage), total: list.length, page: p, pageCount };
  },
  async allMembers() {
    return ((await load()).members ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  deleteMember(id) {
    return mutate((db) => {
      db.members = (db.members ?? []).filter((m) => m.id !== id);
    });
  },
  async listCompanies() {
    return localPublic.listCompanies();
  },
  saveCompany(input: CompanyInput) {
    return mutate((db) => {
      db.companies ??= structuredClone(seedCompanies);
      const others = db.companies.filter((c) => c.id !== input.id);
      if (others.some((c) => c.name.toLowerCase() === input.name.toLowerCase())) throw new RepoError("A company with this name already exists.", "conflict");
      const taken = new Set(others.map((c) => c.slug));
      if (input.id) {
        const c = db.companies.find((x) => x.id === input.id);
        if (!c) throw new RepoError("Company not found.", "not_found");
        Object.assign(c, { ...input, id: c.id, slug: input.slug ? uniqueSlug(input.slug, taken) : c.slug, updated_at: now() });
        return c;
      }
      const c: Company = {
        ...input,
        id: randomUUID(),
        slug: uniqueSlug(input.slug || input.name, taken),
        sort_order: Math.max(0, ...db.companies.map((x) => x.sort_order)) + 1,
        updated_at: now(),
      };
      db.companies.push(c);
      return c;
    });
  },
  deleteCompany(id) {
    return mutate((db) => {
      db.companies = (db.companies ?? structuredClone(seedCompanies)).filter((c) => c.id !== id);
    });
  },
  setCompanyLogo(id, logoUrl) {
    return mutate((db) => {
      db.companies ??= structuredClone(seedCompanies);
      const c = db.companies.find((x) => x.id === id);
      if (!c) throw new RepoError("Company not found.", "not_found");
      c.logo_url = logoUrl;
      c.updated_at = now();
    });
  },
  async listEvents(fromIso, toIso) {
    return readEvents((e) => e.ts >= fromIso && e.ts <= toIso);
  },
  async clearDemoEvents() {
    const all = await readEvents(() => true);
    const keep = all.filter((e) => !e.props?.demo);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(EVENTS_FILE, keep.map((e) => JSON.stringify(e)).join("\n") + (keep.length ? "\n" : ""));
    return all.length - keep.length;
  },
};

export const localClub: ClubRepo = {
  join(input: MemberInput) {
    return mutate((db) => {
      db.members ??= [];
      const existing = db.members.find((m) => m.phone === input.phone);
      if (existing) {
        // Keep the original code; fill in an email/name given later; refresh consent.
        if (input.email && !existing.email) existing.email = input.email;
        if (input.name && !existing.name) existing.name = input.name;
        existing.consent_marketing = input.consent_marketing;
        existing.consent_text = input.consent_text;
        return { code: existing.code, isNew: false };
      }
      const taken = new Set(db.members.map((m) => m.code));
      let code = memberCode(randomBytes);
      while (taken.has(code)) code = memberCode(randomBytes);
      db.members.push({ ...input, id: randomUUID(), code, created_at: now() });
      return { code, isNew: true };
    });
  },
};


async function readEvents(pred: (e: AnalyticsEvent) => boolean): Promise<AnalyticsEvent[]> {
  let raw = "";
  try {
    raw = await fs.readFile(EVENTS_FILE, "utf8");
  } catch {
    return [];
  }
  const out: AnalyticsEvent[] = [];
  for (const line of raw.split("\n")) {
    if (!line) continue;
    try {
      const e = JSON.parse(line) as AnalyticsEvent;
      if (pred(e)) out.push(e);
    } catch {
      /* skip a partially written line */
    }
  }
  return out;
}

/** Append-only log; one JSON object per line. */
export const localEvents: EventsRepo = {
  async log(e) {
    if (PUBLISH_ONLY) return; // counted by the host's cookieless analytics instead
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(EVENTS_FILE, JSON.stringify(e) + "\n");
  },
};
