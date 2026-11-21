import "server-only";
import { unstable_cache } from "next/cache";
import { DATA_MODE } from "../env";
import type { AdminRepo, ClubRepo, EventsRepo, PublicRepo } from "./repo";
import type { ProductQuery } from "../types";
import { localAdmin, localClub, localEvents, localPublic } from "./local-repo";
import { supabaseAdmin, supabaseClub, supabaseEvents, supabasePublic } from "./supabase-repo";

/** Cache tag cleared by every admin write. */
export const CATALOGUE_TAG = "catalogue";

const raw: PublicRepo = DATA_MODE === "supabase" ? supabasePublic : localPublic;

const opts = { tags: [CATALOGUE_TAG], revalidate: 300 };

/**
 * Public reads, cached for 5 minutes and cleared immediately when an admin
 * saves anything. Only published data is reachable through this object.
 */
export const catalogue: PublicRepo = {
  listCategories: unstable_cache(() => raw.listCategories(), ["categories"], opts),
  getSettings: unstable_cache(() => raw.getSettings(), ["settings"], opts),
  searchProducts: unstable_cache((q: ProductQuery) => raw.searchProducts(q), ["search"], opts),
  getProductBySlug: unstable_cache((slug: string) => raw.getProductBySlug(slug), ["product"], opts),
  listBrands: unstable_cache(() => raw.listBrands(), ["brands"], opts),
  listCompanies: unstable_cache(() => raw.listCompanies(), ["companies"], opts),
  listPublishedForIndex: unstable_cache(() => raw.listPublishedForIndex(), ["index"], opts),
};

/** Never call without requireAdmin() first. */
export const adminRepo: AdminRepo = DATA_MODE === "supabase" ? supabaseAdmin : localAdmin;

/** Public Shanker Club sign-up (validated + rate-limited in the server action). */
export const club: ClubRepo = DATA_MODE === "supabase" ? supabaseClub : localClub;

/** Anonymous analytics events (validated + rate-limited in /api/collect). */
export const events: EventsRepo = DATA_MODE === "supabase" ? supabaseEvents : localEvents;
