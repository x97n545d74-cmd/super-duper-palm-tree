import { NextResponse, type NextRequest } from "next/server";
import { catalogue } from "@/lib/data";
import { buildSuggestions } from "@/lib/data/query";
import { categoryName, isLocale, DEFAULT_LOCALE } from "@/i18n";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import type { Product } from "@/lib/types";

export async function GET(req: NextRequest) {
  const rl = rateLimit(`suggest:${clientIp(req.headers)}`, 90, 60_000);
  if (!rl.ok) return NextResponse.json({ items: [] }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });

  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const raw = req.nextUrl.searchParams.get("locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  if (q.trim().length < 2) return NextResponse.json({ items: [] });

  const [products, categories] = await Promise.all([catalogue.listPublishedForIndex(), catalogue.listCategories()]);
  const items = buildSuggestions(products as Product[], categories, q, locale, (c) => categoryName(c, locale));
  return NextResponse.json({ items }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
