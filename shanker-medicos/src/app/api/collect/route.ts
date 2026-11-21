import { createHash } from "node:crypto";
import { after, type NextRequest } from "next/server";
import { z } from "zod";
import { events } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { EVENT_TYPES, type AnalyticsEvent } from "@/lib/types";

// First-party, cookieless analytics. Stores no IP address, name, phone or email:
// `visitor` is a hash of (secret salt + date + IP + browser) that changes daily.

const s = (max: number) => z.string().max(max).default("");
const body = z.object({
  t: z.enum(EVENT_TYPES),
  p: z.string().max(200).regex(/^\//),
  l: s(5),
  r: s(120),
  us: s(80),
  um: s(80),
  uc: s(120),
  d: z
    .partialRecord(
      z.enum(["search_term", "results", "item_name", "item_brand", "placement", "promotion_name", "method", "source"]),
      z.union([z.string().max(100), z.number().finite()]),
    )
    .default({}),
});

const BOT = /bot|crawl|spider|slurp|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp\/|curl|wget|python|node-fetch|axios/i;

function device(ua: string): AnalyticsEvent["device"] {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "mobile";
  return "desktop";
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  const ip = clientIp(req.headers);
  // Many Indian mobile users share one IP (carrier NAT), so limit per IP + browser, generously,
  // and drop quietly (204) so browsers don't log errors for a beacon.
  const key = createHash("sha1").update(`${ip}|${ua}`).digest("hex").slice(0, 16);
  if (!rateLimit(`collect:${key}`, 300, 60_000).ok) return new Response(null, { status: 204 });

  let parsed;
  try {
    parsed = body.safeParse(JSON.parse(await req.text()));
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!parsed.success || parsed.data.p.startsWith("/admin")) return new Response(null, { status: 400 });
  const b = parsed.data;

  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.ANALYTICS_SALT || process.env.SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_URL || "shanker-medicos";
  const visitor = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 16);

  const e: AnalyticsEvent = {
    ts: new Date().toISOString(),
    type: b.t,
    path: b.p,
    locale: b.l,
    referrer: b.r,
    utm_source: b.us,
    utm_medium: b.um,
    utm_campaign: b.uc,
    device: device(ua),
    visitor,
    props: b.d as Record<string, string | number>,
  };
  after(() => events.log(e).catch((err) => console.error("[collect]", err)));
  return new Response(null, { status: 204 });
}
