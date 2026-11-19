import type {
  Member,
  MemberInput,
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

/** Public, read-only catalogue access. Only published products are ever returned. */
export interface PublicRepo {
  listCategories(): Promise<Category[]>;
  getSettings(): Promise<BusinessSettings>;
  searchProducts(q: ProductQuery): Promise<ProductPage>;
  getProductBySlug(slug: string): Promise<Product | null>;
  listBrands(): Promise<string[]>;
  /** all published products, light fields, for suggestions + sitemap */
  listPublishedForIndex(): Promise<Pick<Product, "id" | "slug" | "name" | "brand" | "generic_name" | "manufacturer" | "pack_size" | "category_id" | "published" | "updated_at">[]>;
}

/** Admin access. Every implementation must be called only after requireAdmin(). */
export interface AdminRepo {
  stats(): Promise<Stats>;
  searchProducts(q: ProductQuery): Promise<ProductPage>;
  getProduct(id: string): Promise<Product | null>;
  saveProduct(input: ProductInput): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  setPublished(id: string, published: boolean): Promise<void>;
  listCategories(): Promise<Category[]>;
  /** product count per category id (all products, published or not) */
  categoryCounts(): Promise<Record<string, number>>;
  saveCategory(input: CategoryInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  reorderCategories(orderedIds: string[]): Promise<void>;
  getSettings(): Promise<BusinessSettings>;
  saveSettings(s: Omit<BusinessSettings, "updated_at">): Promise<void>;
  /** existing products keyed for duplicate detection */
  duplicateKeys(): Promise<Map<string, string>>;
  importProducts(rows: ImportRow[], mode: "skip" | "update"): Promise<ImportResult>;
  uploadImage(file: File): Promise<string>;
  listMembers(q: { q?: string; page?: number; perPage?: number }): Promise<MemberPage>;
  allMembers(): Promise<Member[]>;
  deleteMember(id: string): Promise<void>;
}

/** Public sign-up for Shanker Club. Signing up again with the same phone returns the same code. */
export interface ClubRepo {
  join(input: MemberInput): Promise<{ code: string; isNew: boolean }>;
}

export interface MemberPage {
  items: Member[];
  total: number;
  page: number;
  pageCount: number;
}

export class RepoError extends Error {
  constructor(message: string, public code: "not_found" | "conflict" | "invalid" | "forbidden" | "internal" = "internal") {
    super(message);
  }
}

/** Duplicate key: same name + brand + pack size (case and spacing insensitive). */
export function productKey(p: { name: string; brand: string; pack_size: string }) {
  return [p.name, p.brand, p.pack_size].map((s) => s.toLowerCase().replace(/\s+/g, " ").trim()).join("|");
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

/** Member code shown at the counter, e.g. SM-7KQ2P. */
export function memberCode(random: (n: number) => Uint8Array): string {
  const bytes = random(5);
  return "SM-" + [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}
