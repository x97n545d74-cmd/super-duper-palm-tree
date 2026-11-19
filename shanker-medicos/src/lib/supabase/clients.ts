import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../env";

// Only the public anon key is used. Row Level Security decides what each
// caller may read or write. No service-role key is needed by the app.

let anon: SupabaseClient | null = null;

/** Cookie-less client for public catalogue reads (cacheable). */
export function publicClient(): SupabaseClient {
  anon ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return anon;
}

/** Client bound to the signed-in admin's session cookies. RLS enforces admin rights. */
export async function sessionClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes the session instead.
        }
      },
    },
  });
}
