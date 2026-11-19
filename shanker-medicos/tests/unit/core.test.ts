import { test } from "node:test";
import assert from "node:assert/strict";
import { waLink, productMessage, generalMessage, searchMessage } from "../../src/lib/whatsapp";
import { normalizePhone, missingSettings } from "../../src/lib/settings";
import { queryProducts, buildSuggestions, score, categoryScope } from "../../src/lib/data/query";
import { seedCategories, seedProducts, seedSettings } from "../../src/lib/data/seed";
import { slugify, safeQuery, uniqueSlug } from "../../src/lib/text";
import { importRowSchema, productSchema, settingsSchema, memberSchema } from "../../src/lib/validation";
import { memberCode } from "../../src/lib/data/repo";
import { randomBytes } from "node:crypto";
import { COMPANIES, companiesByLetter, matchCompany, matchLogoFile, monogram } from "../../src/lib/companies";
import { seedCompanies } from "../../src/lib/data/seed";
import { productKey } from "../../src/lib/data/repo";
import { getDictionary, fmt } from "../../src/i18n";
import en from "../../src/i18n/en";
import hi from "../../src/i18n/hi";
import pa from "../../src/i18n/pa";

/* ---------- WhatsApp ---------- */

test("waLink: builds wa.me link with encoded text and Indian country code", () => {
  const url = waLink("98765 43210", "Hello & bye?\nLine 2")!;
  assert.equal(url, "https://wa.me/919876543210?text=Hello%20%26%20bye%3F%0ALine%202");
});

test("waLink: returns null when no valid number is configured", () => {
  assert.equal(waLink("", "x"), null);
  assert.equal(waLink("12345", "x"), null);
});

test("productMessage: matches the brief's template exactly (English)", () => {
  const msg = productMessage("en", { name: "Dolo 650", brand: "Dolo", pack_size: "Strip of 15 tablets" });
  assert.equal(
    msg,
    "Hello Shanker Medicos,\n\nI found this product on your website.\n\nProduct: Dolo 650\nBrand: Dolo\nPack Size: Strip of 15 tablets\n\nCould you please confirm availability?",
  );
});

test("productMessage: keeps brand names untranslated in Hindi and Punjabi", () => {
  for (const l of ["hi", "pa"]) {
    const msg = productMessage(l, { name: "Shelcal 500", brand: "Shelcal", pack_size: "Strip of 15 tablets" });
    assert.ok(msg.includes("Shelcal 500") && msg.includes("Shelcal"), l);
  }
});

test("general and search messages exist in all locales", () => {
  for (const l of ["en", "hi", "pa"]) {
    assert.ok(generalMessage(l).length > 10);
    assert.ok(searchMessage(l, "Ecosprin").includes("Ecosprin"));
  }
});

test("normalizePhone handles common Indian formats", () => {
  assert.equal(normalizePhone("+91 98765-43210"), "919876543210");
  assert.equal(normalizePhone("098765 43210"), "919876543210");
  assert.equal(normalizePhone("9876543210"), "919876543210");
  assert.equal(normalizePhone("abc"), "");
});

test("missingSettings flags only what the store has not supplied yet", () => {
  assert.deepEqual(missingSettings(seedSettings), [], "address, phone, WhatsApp, hours and Maps link are all supplied");
  assert.equal(seedSettings.address, "Dera Road");
  assert.equal(seedSettings.postal_code, "143505");
  assert.ok(seedSettings.opening_hours.includes("Sunday: Closed"));
});

test("store WhatsApp 98155 52404 produces a valid wa.me link", () => {
  assert.equal(waLink(seedSettings.whatsapp, "hi"), "https://wa.me/919815552404?text=hi");
});

/* ---------- Search ---------- */

const all = (q: Parameters<typeof queryProducts>[2]) => queryProducts(seedProducts, seedCategories, q);

test("search is case-insensitive and finds by product name", () => {
  assert.equal(all({ q: "DOLO" }).items[0].name, "Dolo 650");
});

test("search finds by brand", () => {
  const names = all({ q: "omron" }).items.map((p) => p.name);
  assert.ok(names.length >= 3 && names.every((n) => n.startsWith("Omron")));
});

test("search finds by generic name", () => {
  const names = all({ q: "paracetamol" }).items.map((p) => p.name);
  assert.deepEqual(names.sort(), ["Crocin Advance", "Dolo 650"]);
});

test("multi-word search needs every word to match", () => {
  assert.equal(all({ q: "himalaya baby" }).items.length, 1);
  assert.equal(all({ q: "himalaya xyzzy" }).items.length, 0);
});

test("name prefix ranks above generic-name match", () => {
  const p = seedProducts.find((x) => x.name === "Dolo 650")!;
  assert.ok(score(p, "dolo") > score(p, "paracetamol"));
});

test("category filter includes sub-categories", () => {
  const med = all({ category: "medicines", perPage: 100 });
  const rx = all({ category: "prescription-medicines", perPage: 100 });
  const otc = all({ category: "otc-products", perPage: 100 });
  assert.equal(med.total, rx.total + otc.total);
  assert.ok(rx.total > 0 && otc.total > 0);
  assert.equal(categoryScope(seedCategories, "unknown").size, 0);
});

test("brand filter, alphabetical sorting and pagination", () => {
  const h = all({ brand: "himalaya", sort: "az", perPage: 100 });
  assert.ok(h.items.every((p) => p.brand === "Himalaya"));
  const az = all({ sort: "az", perPage: 100 }).items.map((p) => p.name);
  assert.deepEqual(az, [...az].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })));
  const za = all({ sort: "za", perPage: 100 }).items.map((p) => p.name);
  assert.deepEqual(za, [...az].reverse());
  const p1 = all({ perPage: 10, page: 1 });
  const p4 = all({ perPage: 10, page: 4 });
  assert.equal(p1.items.length, 10);
  assert.equal(p1.pageCount, Math.ceil(seedProducts.length / 10));
  assert.equal(p4.items.length, seedProducts.length - 30);
  assert.equal(all({ perPage: 10, page: 999 }).page, p1.pageCount, "out-of-range page is clamped");
});

test("unpublished products never appear in public queries", () => {
  const hidden = seedProducts.map((p, i) => (i === 0 ? { ...p, published: false } : p));
  const r = queryProducts(hidden, seedCategories, { q: seedProducts[0].name });
  assert.ok(!r.items.some((p) => p.id === seedProducts[0].id));
});

test("suggestions return categories, brands and products with locale links", () => {
  const s = buildSuggestions(seedProducts, seedCategories, "ba", "pa", (c) => c.name_pa);
  assert.ok(s.some((x) => x.type === "category" && x.href === "/pa/categories/baby-care"));
  assert.ok(s.every((x) => x.href.startsWith("/pa/")));
  assert.deepEqual(buildSuggestions(seedProducts, seedCategories, "a", "en", (c) => c.name_en), []);
});

/* ---------- Text + validation ---------- */

test("slugify / uniqueSlug", () => {
  assert.equal(slugify("Head & Shoulders Anti-Dandruff 180 ml"), "head-and-shoulders-anti-dandruff-180-ml");
  assert.equal(slugify("Nestlé Cerelac"), "nestle-cerelac");
  assert.equal(uniqueSlug("Dolo 650", new Set(["dolo-650", "dolo-650-2"])), "dolo-650-3");
});

test("safeQuery strips PostgREST filter syntax", () => {
  assert.equal(safeQuery("dolo),name.eq.x(%_*"), "dolo name.eq.x");
});

test("productKey ignores case and spacing", () => {
  assert.equal(productKey({ name: "Dolo  650", brand: "DOLO", pack_size: "Strip of 15" }), productKey({ name: "dolo 650", brand: "dolo", pack_size: "strip  of 15" }));
});

test("productSchema rejects missing required fields and bad enums", () => {
  const bad = productSchema.safeParse({ name: "", brand: "", pack_size: "", category_id: null, image_url: null, availability: "sold" });
  assert.equal(bad.success, false);
  const ok = productSchema.safeParse({ name: "X", brand: "Y", pack_size: "1", category_id: null, image_url: null, published: "on" });
  assert.equal(ok.success, true);
  assert.equal(ok.success && ok.data.published, true);
  assert.equal(ok.success && ok.data.availability, "unconfirmed");
});

test("settingsSchema validates phone, PIN, email and https links", () => {
  const base = { business_name: "Shanker Medicos", city: "Batala", state: "Punjab", phone: "", whatsapp: "", offer_percent: "12", offer_min_amount: "1000", offer_code: "shanker12", offer_enabled: "on" };
  const ok = settingsSchema.parse(base);
  assert.equal(ok.offer_code, "SHANKER12", "offer code upper-cased");
  assert.equal(ok.offer_enabled, true);
  assert.equal(ok.club_enabled, false, "unticked checkbox = false");
  assert.equal(settingsSchema.safeParse({ ...base, offer_percent: "80" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...base, offer_code: "12% off!" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...base, postal_code: "143505" }).success, true);
  assert.equal(settingsSchema.safeParse({ ...base, postal_code: "12345" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...base, whatsapp: "call me" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...base, email: "nope" }).success, false);
  assert.equal(settingsSchema.safeParse({ ...base, maps_url: "javascript:alert(1)" }).success, false);
});

test("importRowSchema normalises CSV values", () => {
  const r = importRowSchema.parse({ name: "A", brand: "B", pack_size: "1", availability: "In Stock", rx_class: "yes", published: "No", pack_style: "" });
  assert.equal(r.availability, "in_stock");
  assert.equal(r.rx_class, "rx");
  assert.equal(r.published, false);
  assert.equal(r.pack_style, "box");
  assert.equal(importRowSchema.safeParse({ name: "A", brand: "B", pack_size: "1", availability: "maybe", rx_class: "", published: "", pack_style: "" }).success, false);
});

/* ---------- i18n ---------- */

function keys(o: unknown, prefix = ""): string[] {
  if (typeof o !== "object" || o === null) return [prefix];
  return Object.entries(o).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

test("Hindi and Punjabi dictionaries have every English key, none empty except intended", () => {
  const ek = keys(en).sort();
  assert.deepEqual(keys(hi).sort(), ek);
  assert.deepEqual(keys(pa).sort(), ek);
  for (const [name, d] of [["hi", hi], ["pa", pa]] as const) {
    for (const k of ek) {
      const v = k.split(".").reduce<unknown>((o, p) => (o as Record<string, unknown>)[p], d);
      if (["product.rxNote.otc", "legal.englishOnly"].includes(k)) continue;
      assert.ok(typeof v === "string" && v.trim().length > 0, `${name}:${k} is empty`);
    }
  }
});

test("Hindi uses Devanagari and Punjabi uses Gurmukhi", () => {
  assert.match(getDictionary("hi").hero.title1, /[ऀ-ॿ]/);
  assert.match(getDictionary("pa").hero.title1, /[਀-੿]/);
  assert.equal(getDictionary("xx").hero.title1, en.hero.title1, "unknown locale falls back to English");
});

test("fmt fills placeholders and leaves unknown ones", () => {
  assert.equal(fmt("{a} and {b}", { a: 1 }), "1 and {b}");
});

test("every category has names in all three languages", () => {
  for (const c of seedCategories) {
    assert.ok(c.name_en && /[ऀ-ॿ]/.test(c.name_hi) && /[਀-੿]/.test(c.name_pa), c.slug);
  }
});

test("seed catalogue is honest: nothing claims stock, everything flagged for review", () => {
  assert.ok(seedProducts.every((p) => p.availability === "unconfirmed" && p.needs_review));
  assert.ok(!seedProducts.some((p) => p.rx_class === "rx"), "no prescription status asserted before pharmacist review");
});

/* ---------- Shanker Club ---------- */

test("memberSchema normalises Indian mobile numbers and requires consent", () => {
  const base = { consent_marketing: true, locale: "pa" };
  for (const raw of ["98155 52404", "+91 98155-52404", "09815552404", "919815552404"]) {
    assert.equal(memberSchema.parse({ ...base, phone: raw }).phone, "9815552404", raw);
  }
  assert.equal(memberSchema.safeParse({ ...base, phone: "12345" }).success, false);
  assert.equal(memberSchema.safeParse({ ...base, phone: "5815552404" }).success, false, "Indian mobiles start 6-9");
  assert.equal(memberSchema.safeParse({ phone: "9815552404", consent_marketing: false }).success, false, "consent must be ticked");
  assert.equal(memberSchema.safeParse({ ...base, phone: "9815552404", email: "not-an-email" }).success, false);
  assert.equal(memberSchema.parse({ ...base, phone: "9815552404", email: "A@Example.COM" }).email, "a@example.com");
});

test("member codes look like SM-XXXXX without ambiguous characters", () => {
  const codes = new Set(Array.from({ length: 500 }, () => memberCode(randomBytes)));
  for (const c of codes) assert.match(c, /^SM-[A-HJ-NP-Z2-9]{5}$/);
  assert.ok(codes.size > 490, "codes are effectively unique");
});

test("offer defaults: 10% on selected medicines above ₹1,000 (SHANKER10); club +5% first purchase", () => {
  assert.equal(seedSettings.offer_percent, 10);
  assert.equal(seedSettings.offer_min_amount, 1000);
  assert.equal(seedSettings.offer_code, "SHANKER10");
  assert.equal(seedSettings.club_extra_percent, 5);
});

test("offer, club and FAQ copy fill every placeholder in all languages", () => {
  for (const l of ["en", "hi", "pa"]) {
    const m = getDictionary(l).mkt;
    const v = { percent: 12, min: "1,000", code: "SHANKER12", extra: 5 };
    const all = [m.offer.title, m.offer.body, m.offer.announce, m.offer.waMessage, m.club.bodyPercent, ...m.offer.terms, ...m.faq.items.flatMap((i) => [i.q, i.a])].map((x) => fmt(x, v));
    for (const x of all) assert.ok(!/\{\w+\}/.test(x), `${l}: unfilled placeholder in "${x}"`);
    assert.ok(fmt(m.offer.title, v).includes("12%") && fmt(m.offer.title, v).includes("1,000"), l);
    assert.ok(fmt(m.club.waMessage, { code: "SM-ABCDE" }).includes("SM-ABCDE"), l);
  }
});

test("companies list: no duplicates, grouped A–Z", () => {
  const names = COMPANIES.map((c) => c.name.toLowerCase());
  assert.equal(new Set(names).size, names.length);
  assert.ok(COMPANIES.length >= 100, `${COMPANIES.length} companies`);
  const letters = companiesByLetter(COMPANIES).map(([l]) => l);
  assert.deepEqual(letters, [...letters].sort());
});

test("logo files are matched to companies by file name", () => {
  const m = (f: string) => matchLogoFile(f, seedCompanies)?.name;
  assert.equal(m("sun-pharma.png"), "Sun Pharmaceutical Industries");
  assert.equal(m("Cipla.PNG"), "Cipla");
  assert.equal(m("cipla_logo.webp"), "Cipla");
  assert.equal(m("Mankind Pharma.webp"), "Mankind Pharma");
  assert.equal(m("dr-reddys-laboratories.png"), "Dr. Reddy's Laboratories");
  assert.equal(m("abbott.png"), "Abbott India");
  assert.equal(m("random-file.png"), undefined);
});

test("products are linked to their company; monograms are 2 letters", () => {
  assert.equal(matchCompany(seedCompanies, "Micro Labs Ltd", "Dolo")?.name, "Micro Labs");
  assert.equal(matchCompany(seedCompanies, "Sun Pharmaceutical Industries Ltd")?.name, "Sun Pharmaceutical Industries");
  assert.equal(monogram("Sun Pharmaceutical Industries"), "SP");
  assert.equal(monogram("Cipla"), "CI");
  assert.equal(monogram("3M India"), "3M");
});

/* ---------- analytics report ---------- */
import { buildReport, change, istDay } from "../../src/lib/analytics-report";
import type { AnalyticsEvent } from "../../src/lib/types";

const ev = (over: Partial<AnalyticsEvent>): AnalyticsEvent => ({
  ts: "2026-11-10T06:00:00.000Z", type: "pageview", path: "/en", locale: "en", referrer: "", utm_source: "", utm_medium: "", utm_campaign: "",
  device: "mobile", visitor: "v1", props: {}, ...over,
});

test("analytics report: visits, enquiries, rate, sources, searches, funnel", () => {
  const events: AnalyticsEvent[] = [
    // visitor 1 from a Facebook campaign: views a product, WhatsApps, joins
    ev({ visitor: "a", utm_source: "facebook", utm_medium: "paid", utm_campaign: "diwali", path: "/pa/offers", locale: "pa" }),
    ev({ visitor: "a", type: "view_item", props: { item_name: "Dolo 650" }, utm_source: "facebook", utm_medium: "paid", utm_campaign: "diwali" }),
    ev({ visitor: "a", type: "whatsapp_click", props: { item_name: "Dolo 650", placement: "Enquire" } }),
    ev({ visitor: "a", type: "sign_up" }),
    // visitor 2 from Google search: searches (one with no results), calls
    ev({ visitor: "b", referrer: "google.com", device: "desktop" }),
    ev({ visitor: "b", type: "search", props: { search_term: "Ecosprin", results: 0 } }),
    ev({ visitor: "b", type: "search", props: { search_term: "dolo", results: 1 } }),
    ev({ visitor: "b", type: "call_click" }),
    // visitor 3 direct, next day, bounces
    ev({ visitor: "c", ts: "2026-11-11T05:00:00.000Z" }),
  ];
  const r = buildReport(events, null, "2026-11-09T18:30:00.000Z", "2026-11-11T18:29:59.000Z");
  assert.equal(r.kpis.visits, 3);
  assert.equal(r.kpis.enquiries, 2);
  assert.equal(r.kpis.signups, 1);
  assert.ok(Math.abs(r.kpis.enquiryRate - 2 / 3) < 1e-9);
  assert.equal(r.daily.length, 2, "two IST days, zero-filled");
  assert.deepEqual(r.daily.map((d) => d.visits), [2, 1]);
  const fb = r.sources.find((s) => s.source === "facebook")!;
  assert.deepEqual([fb.medium, fb.campaign, fb.visits, fb.enquiries, fb.signups, fb.rate], ["paid", "diwali", 1, 1, 1, 1]);
  assert.ok(r.sources.some((s) => s.source === "google.com" && s.medium === "referral"));
  assert.ok(r.sources.some((s) => s.source === "direct" && s.rate === 0));
  assert.deepEqual(r.zeroSearches, [{ term: "ecosprin", count: 1 }], "searches with no results = stock demand");
  assert.deepEqual(r.funnel.map((f) => f.value), [3, 1, 2, 1]);
  assert.deepEqual(r.products[0], { name: "Dolo 650", views: 1, enquiries: 1 });
  assert.deepEqual(r.languages.map((l) => l.name).sort(), ["en", "pa"]);
  assert.ok(r.pages.some((p) => p.name === "/offers"), "locale prefix stripped from pages");
  assert.equal(r.hasDemo, false);
});

test("analytics: IST day boundaries and % change", () => {
  assert.equal(istDay("2026-11-10T18:29:00.000Z"), "2026-11-10");
  assert.equal(istDay("2026-11-10T18:31:00.000Z"), "2026-11-11");
  assert.equal(change(120, 100), 0.2);
  assert.equal(change(5, 0), null);
});

test("company badges use a clean short name", async () => {
  const { shortName } = await import("../../src/lib/companies");
  assert.equal(shortName("Sun Pharmaceutical Industries"), "Sun Pharma");
  assert.equal(shortName("Abbott India"), "Abbott");
  assert.equal(shortName("Dr. Reddy's Laboratories"), "Dr. Reddy's");
  assert.equal(shortName("Cipla"), "Cipla");
  assert.equal(shortName("Colgate-Palmolive (India)"), "Colgate-Palmolive");
  assert.equal(shortName("Johnson & Johnson / Kenvue"), "Kenvue");
});
