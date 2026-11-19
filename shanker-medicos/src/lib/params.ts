import type { SortKey } from "./types";
import type { CatalogueParams } from "@/components/site/Catalogue";

const SORTS: SortKey[] = ["relevance", "az", "za", "recent"];

function one(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v ?? "").toString().slice(0, 100).trim();
}

/** Parse and sanitise catalogue search params. Never trust the URL. */
export function parseCatalogueParams(sp: Record<string, string | string[] | undefined>): CatalogueParams {
  const sort = one(sp.sort) as SortKey;
  const page = parseInt(one(sp.page), 10);
  return {
    q: one(sp.q),
    category: one(sp.category).replace(/[^a-z0-9-]/g, ""),
    brand: one(sp.brand),
    sort: SORTS.includes(sort) ? sort : "",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1,
  };
}
