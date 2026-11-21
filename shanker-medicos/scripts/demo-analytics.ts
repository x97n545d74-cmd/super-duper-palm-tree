// Fills the LOCAL development store with 60 days of realistic, clearly-marked
// demo analytics (props.demo = 1) so the dashboard can be shown before launch.
// Admin → Analytics shows a "Demo data" banner with a button to clear it.
// Refuses to run against Supabase. Run: npm run demo:analytics
import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { seedProducts } from "../src/lib/data/seed";
import type { AnalyticsEvent, EventType } from "../src/lib/types";

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Refusing: demo data is for development mode only (Supabase is configured).");
  process.exit(1);
}
const dir = path.resolve(process.cwd(), process.env.LOCAL_DATA_DIR || "data");
mkdirSync(dir, { recursive: true });
const file = path.join(dir, "events.ndjson");

let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(items: [T, number][]): T => {
  let r = rnd() * items.reduce((s, [, w]) => s + w, 0);
  for (const [v, w] of items) if ((r -= w) <= 0) return v;
  return items[0][0];
};

const SOURCES: [{ s: string; m: string; c: string; r: string; boost: number }, number][] = [
  [{ s: "", m: "", c: "", r: "", boost: 1 }, 32],
  [{ s: "", m: "", c: "", r: "google.com", boost: 1.2 }, 24],
  [{ s: "facebook", m: "paid", c: "diwali_12pc", r: "", boost: 1.5 }, 16],
  [{ s: "google", m: "cpc", c: "batala_pharmacy", r: "", boost: 1.8 }, 10],
  [{ s: "instagram", m: "bio", c: "profile", r: "", boost: 0.9 }, 8],
  [{ s: "", m: "", c: "", r: "wa.me", boost: 1.4 }, 6],
  [{ s: "", m: "", c: "", r: "maps.google.com", boost: 2.2 }, 4],
];
const FOUND = ["dolo", "crocin", "shelcal", "volini", "omron", "cetaphil", "dettol", "paracetamol", "pan 40", "himalaya", "sensodyne", "electral", "telma"];
const MISSING = ["ecosprin 75", "thyronorm 50", "glycomet gp 1", "rosuvas 10", "montair lc", "azithral 500", "dytor 10", "amlong 5"];
const PLACES: [string, number][] = [["Enquire", 40], ["Ask on WhatsApp", 30], ["rx_photo", 14], ["rx_list", 8], ["Chat with us on WhatsApp", 12], ["offer_whatsapp", 6]];
const PAGES = ["/", "/products", "/offers", "/categories", "/companies", "/contact", "/categories/medicines", "/categories/baby-care", "/about"];

const DAYS = 60;
const now = Date.now();
let count = 0;
const out: string[] = [];
for (let d = DAYS - 1; d >= 0; d--) {
  const dayStart = now - d * 86400_000;
  const date = new Date(dayStart);
  const growth = 1 + (DAYS - d) / DAYS; // the site grows over the period
  const weekend = [0, 6].includes(date.getUTCDay()) ? 1.25 : 1;
  const visits = Math.round((28 + rnd() * 18) * growth * weekend);
  for (let v = 0; v < visits; v++) {
    const src = pick(SOURCES);
    const visitor = Math.floor(rnd() * 1e16).toString(16).padStart(14, "0").slice(0, 16);
    const device = pick<AnalyticsEvent["device"]>([["mobile", 78], ["desktop", 15], ["tablet", 7]]);
    const locale = pick([["en", 44], ["pa", 36], ["hi", 20]] as [string, number][]);
    let t = dayStart - rnd() * 14 * 3600_000; // spread over the day
    const emit = (type: EventType, p: string, props: Record<string, string | number> = {}) => {
      t += 20_000 + rnd() * 90_000;
      const e: AnalyticsEvent = {
        ts: new Date(Math.min(t, now)).toISOString(), type, path: `/${locale}${p === "/" ? "" : p}`, locale, referrer: src.r,
        utm_source: src.s, utm_medium: src.m, utm_campaign: src.c, device, visitor, props: { ...props, demo: 1 },
      };
      out.push(JSON.stringify(e));
      count++;
    };
    const landing = src.c === "diwali_12pc" ? "/offers" : pick(PAGES.map((p, i) => [p, i === 0 ? 50 : 8] as [string, number]));
    emit("pageview", landing);
    const extra = Math.floor(rnd() * 3);
    for (let k = 0; k < extra; k++) emit("pageview", pick(PAGES.map((p) => [p, 1] as [string, number])));
    if (rnd() < 0.3) {
      const missing = rnd() < 0.22;
      const term = missing ? pick(MISSING.map((x) => [x, 1] as [string, number])) : pick(FOUND.map((x) => [x, 1] as [string, number]));
      emit("search", "/products", { search_term: term, results: missing ? 0 : 1 + Math.floor(rnd() * 4) });
    }
    let product = "";
    if (rnd() < 0.42) {
      const p = seedProducts[Math.floor(rnd() * rnd() * seedProducts.length)];
      product = p.name;
      emit("view_item", `/products/${p.slug}`, { item_name: p.name, item_brand: p.brand });
    }
    if (rnd() < 0.12 * src.boost) emit("offer_reveal", landing, { promotion_name: "SHANKER12" });
    if (rnd() < 0.13 * src.boost) emit("whatsapp_click", product ? "/products" : landing, { placement: pick(PLACES), ...(product ? { item_name: product } : {}) });
    if (rnd() < 0.035 * src.boost) emit("call_click", "/contact", { placement: "Call the store" });
    if (rnd() < 0.045 * src.boost) emit("directions_click", "/contact", { placement: "Get directions" });
    if (rnd() < 0.03 * src.boost) emit("sign_up", landing, { method: "shanker_club", source: landing === "/offers" ? "offers_page" : "homepage" });
  }
}
appendFileSync(file, out.join("\n") + "\n");
console.log(`Wrote ${count} demo events (${DAYS} days) to ${file}`);
