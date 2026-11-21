import { promises as fs } from "node:fs";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/data/local-repo";

// Serves images uploaded in development mode (data/uploads). In Supabase mode
// images come from Supabase Storage and this route is unused.

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

export async function GET(_: Request, ctx: RouteContext<"/api/media/[name]">) {
  const { name } = await ctx.params;
  const m = /^([0-9a-f-]{36})\.(jpg|png|webp|avif)$/.exec(name);
  if (!m) return new Response("Not found", { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(bytes, {
      headers: {
        "Content-Type": TYPES[m[2]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
