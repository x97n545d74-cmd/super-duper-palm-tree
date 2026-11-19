// Central environment access. Server-only values never use the NEXT_PUBLIC_ prefix.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase mode when both public Supabase values exist; otherwise development mode (local JSON store). */
export const DATA_MODE: "supabase" | "local" = SUPABASE_URL && SUPABASE_ANON_KEY ? "supabase" : "local";

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
