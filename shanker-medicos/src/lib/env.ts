// Central environment access. Server-only values never use the NEXT_PUBLIC_ prefix.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  // On Vercel, fall back to the project's production address (system variable).
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "http://localhost:3000"
).replace(/\/$/, "");

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase mode when both public Supabase values exist; otherwise development mode (local JSON store). */
export const DATA_MODE: "supabase" | "local" = SUPABASE_URL && SUPABASE_ANON_KEY ? "supabase" : "local";

export function isProduction() {
  return process.env.NODE_ENV === "production";
}

/**
 * Publish-only mode: no database at all. The site is served from the built-in
 * catalogue and settings (src/lib/data/seed.ts); nothing is written, admin is
 * off, Shanker Club joins happen on WhatsApp and visits are counted by Vercel
 * Web Analytics. On by default on Vercel when Supabase isn't configured.
 */
export const PUBLISH_ONLY = DATA_MODE === "local" && (process.env.VERCEL === "1" || process.env.PUBLISH_ONLY === "1");
