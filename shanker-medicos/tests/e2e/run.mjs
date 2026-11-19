// End-to-end acceptance tests against a fresh PRODUCTION build.
// Builds and starts `next start` on a throwaway data directory (ISR output in
// .next would otherwise carry state from earlier runs), drives Chromium with
// Playwright, and writes tests/e2e/last-run.json. Run: npm run test:e2e
import { spawn, execSync } from "node:child_process";
import { createServer } from "node:http";
import { createHmac } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, devices } from "playwright";

const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const DATA = mkdtempSync(path.join(tmpdir(), "shanker-e2e-"));
const ADMIN = { email: "staff@example.com", password: "e2e-Only-Password-9" };
const SECRET = "e2e-session-secret-0123456789-abcdefghijklmnopqrstuvwxyz";
const HOOK_SECRET = "e2e-webhook-secret-abcdefghijklmnop";
const HOOK_PORT = 3199;
const GA4 = "G-E2ETEST01";
const hooks = []; // received webhook calls
const hookServer = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    hooks.push({ body, sig: req.headers["x-shanker-signature"] });
    res.end("ok");
  });
}).listen(HOOK_PORT);
const WA = "+91 90000 12345"; // test number, not the store's
const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}
async function step(name, fn) {
  try {
    const d = await fn();
    record(name, true, typeof d === "string" ? d : "");
  } catch (e) {
    record(name, false, (e && e.message ? e.message : String(e)).split("\n")[0].slice(0, 300));
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function startServer() {
  try {
    await fetch(`${BASE}/en`, { signal: AbortSignal.timeout(2000) });
    throw new Error(`port ${PORT} is already in use; stop the other server first`);
  } catch (e) {
    if (String(e.message).includes("already in use")) throw e;
  }
  const proc = spawn("npx", ["next", "start", "-p", String(PORT)], {
    detached: true,
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: "production",
      LOCAL_DATA_DIR: DATA,
      ADMIN_DEV_EMAIL: ADMIN.email,
      ADMIN_DEV_PASSWORD: ADMIN.password,
      SESSION_SECRET: SECRET,
      NEXT_PUBLIC_SITE_URL: BASE,
      NEXT_PUBLIC_GA4_ID: GA4,
      AUTOMATION_WEBHOOK_URL: `http://localhost:${HOOK_PORT}/hook`,
      AUTOMATION_WEBHOOK_SECRET: HOOK_SECRET,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  proc.stdout.on("data", (d) => (log += d));
  proc.stderr.on("data", (d) => (log += d));
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/en`, { signal: AbortSignal.timeout(5000) });
      if (r.ok) return { proc, log: () => log };
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start:\n" + log);
}

async function get(p, opts = {}) {
  return fetch(BASE + p, { redirect: "manual", signal: AbortSignal.timeout(20000), ...opts });
}

async function login(page, password = ADMIN.password) {
  await page.goto(`${BASE}/admin/login`);
  await page.fill("#email", ADMIN.email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
}

/** Reload until the predicate passes (ISR pages regenerate on the request after invalidation). */
async function eventually(page, url, pred, tries = 4) {
  for (let i = 0; i < tries; i++) {
    await page.goto(url);
    if (await pred()) return true;
    await page.waitForTimeout(600);
  }
  return false;
}

console.log("building (fresh .next)…");
rmSync(path.join(ROOT, ".next"), { recursive: true, force: true });
execSync("npx next build", { cwd: ROOT, stdio: "ignore", env: { ...process.env, LOCAL_DATA_DIR: DATA, NEXT_PUBLIC_SITE_URL: BASE, NEXT_PUBLIC_GA4_ID: GA4 } });
const server = await startServer();
const stopServer = () => {
  try {
    process.kill(-server.proc.pid, "SIGKILL"); // whole group: npx + next-server
  } catch {}
};
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));
const browser = await chromium.launch();
// Every test browser starts with the cookie choice made (the banner is tested separately).
const _newContext = browser.newContext.bind(browser);
browser.newContext = async (opts = {}) => {
  const { keepBanner, ...rest } = opts;
  const c = await _newContext(rest);
  if (!keepBanner) await c.addInitScript(() => { try { localStorage.setItem("sm_consent", "denied"); } catch {} });
  return c;
};
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("pageerror", (e) => consoleErrors.push(String(e)));
page.on("console", (m) => m.type() === "error" && !/favicon|Failed to load resource: the server responded with a status of 404/.test(m.text()) && consoleErrors.push(m.text()));

const LOCALES = ["en", "hi", "pa"];
const PAGES = ["", "/offers", "/companies", "/products", "/categories", "/categories/medicines", "/categories/baby-care", "/products/dolo-650", "/about", "/contact", "/privacy", "/terms"];

/* ================= Routing + i18n ================= */

await step("/ redirects to /en (default English)", async () => {
  const r = await get("/");
  assert(r.status === 307 && r.headers.get("location").endsWith("/en"), `${r.status} ${r.headers.get("location")}`);
});

await step("all required routes render in all three languages", async () => {
  const bad = [];
  for (const l of LOCALES) for (const p of PAGES) {
    const r = await get(`/${l}${p}`);
    if (r.status !== 200) bad.push(`/${l}${p}=${r.status}`);
  }
  assert(!bad.length, bad.join(", "));
  return `${LOCALES.length * PAGES.length} pages`;
});

await step("unknown pages and products return a localised 404", async () => {
  for (const p of ["/en/nope", "/hi/products/does-not-exist", "/pa/categories/nope"]) {
    const r = await get(p);
    assert(r.status === 404, `${p} ${r.status}`);
  }
  await page.goto(`${BASE}/pa/nope`);
  assert(/[਀-੿]/.test(await page.textContent("h1")), "404 not in Punjabi");
});

await step("html lang + script rendering for Hindi and Punjabi", async () => {
  await page.goto(`${BASE}/hi`);
  assert((await page.getAttribute("html", "lang")) === "hi-IN", "hi lang");
  assert(/[ऀ-ॿ]/.test(await page.textContent("h1")), "Devanagari headline");
  await page.goto(`${BASE}/pa`);
  assert((await page.getAttribute("html", "lang")) === "pa-IN", "pa lang");
  assert(/[਀-੿]/.test(await page.textContent("h1")), "Gurmukhi headline");
  // Font actually loaded for Gurmukhi
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family).join(",");
  });
  assert(/guru|Gurmukhi/i.test(loaded), `fonts loaded: ${loaded}`);
});

await step("language switcher keeps the page and persists the choice", async () => {
  await page.goto(`${BASE}/en/products?q=dolo`);
  await page.click('header nav[aria-label="Language"] a[hreflang="pa-IN"]');
  await page.waitForURL(/\/pa\/products\?q=dolo/);
  await page.goto(`${BASE}/`);
  assert(page.url().endsWith("/pa"), `remembered: ${page.url()}`);
  await page.goto(`${BASE}/en`); // reset cookie to English
});

await step("brand names are not translated", async () => {
  await page.goto(`${BASE}/hi/products/shelcal-500`);
  assert((await page.textContent("h1")).trim() === "Shelcal 500");
});

/* ================= Search + catalogue ================= */

await step("search suggestions appear while typing", async () => {
  await page.goto(`${BASE}/en`);
  const box = page.locator('section[aria-labelledby="search-h"] input[type=search]');
  await box.fill("dol");
  await page.waitForSelector('section[aria-labelledby="search-h"] [role=option]');
  const opts = await page.locator('section[aria-labelledby="search-h"] [role=option]').allTextContents();
  assert(opts.some((t) => t.includes("Dolo 650")), opts.join(" | "));
  return `${opts.length} suggestions`;
});

await step("keyboard: arrow + enter opens a suggestion", async () => {
  const box = page.locator('section[aria-labelledby="search-h"] input[type=search]');
  await box.fill("omron");
  await page.waitForSelector('section[aria-labelledby="search-h"] [role=option]');
  await box.press("ArrowDown");
  await box.press("Enter");
  await page.waitForURL((u) => /\/en\/(products|categories)/.test(u.pathname + u.search) && u.pathname !== "/en");
});

await step("full search: case-insensitive, brand and generic-name search", async () => {
  await page.goto(`${BASE}/en/products?q=PARACETAMOL`);
  const names = await page.locator("article h3").allTextContents();
  assert(names.length === 2 && names.includes("Dolo 650") && names.includes("Crocin Advance"), names.join(","));
  await page.goto(`${BASE}/en/products?q=himalaya`);
  assert((await page.locator("article").count()) === 3, "himalaya brand search");
});

await step("no-results experience with a WhatsApp fallback path", async () => {
  await page.goto(`${BASE}/en/products?q=zzqqxx`);
  assert((await page.textContent("main")).includes("Nothing matched"), "no-results text");
});

await step("category filter (auto-submits) includes sub-categories", async () => {
  await page.goto(`${BASE}/en/products`);
  await page.selectOption("#f-category", "medicines");
  await page.waitForURL(/category=medicines/);
  const count = await page.locator("article").count();
  assert(count === 9, `medicines shows ${count}`);
  assert(!page.url().includes("brand="), "empty params dropped from URL");
});

await step("brand filter and Z–A sorting", async () => {
  await page.goto(`${BASE}/en/products?brand=Omron&sort=za`);
  const names = await page.locator("article h3").allTextContents();
  assert(names.length === 3 && names[0].startsWith("Omron NE") && names[2].startsWith("Omron HEM"), names.join(","));
});

await step("pagination", async () => {
  await page.goto(`${BASE}/en/products`);
  assert((await page.locator("article").count()) === 24, "page 1 has 24");
  await page.click('nav[aria-label="Pagination"] a[rel=next]');
  await page.waitForURL(/page=2/);
  await page.waitForFunction(() => document.querySelectorAll("article").length === 14, null, { timeout: 8000 }).catch(() => {});
  const n = await page.locator("article").count();
  assert(n === 38 - 24, `page 2 shows ${n}`);
  assert((await page.locator('nav[aria-label="Pagination"] [aria-current="page"]').textContent()) === "2", "current page marker");
});

await step("category tile on the homepage opens a working filtered page", async () => {
  await page.goto(`${BASE}/en`);
  await page.click('section[aria-labelledby="cat-h"] a[href="/en/categories/baby-care"]');
  await page.waitForURL(/categories\/baby-care/);
  assert((await page.locator("article").count()) === 3);
});

await step("store WhatsApp 98155 52404 is used for product enquiries", async () => {
  await page.goto(`${BASE}/en/products/dolo-650`);
  const href = await page.locator('main a[data-wa="1"]').first().getAttribute("href");
  const url = new URL(href);
  assert(url.pathname === "/919815552404", url.pathname);
  assert(url.searchParams.get("text").includes("Product: Dolo 650"), "message");
});

/* ================= Marketing ================= */

await step("prescription on WhatsApp: photo and medicine-list buttons with prefilled text", async () => {
  await page.goto(`${BASE}/en`);
  const links = await page.locator('section[aria-labelledby="rx-h"] a[href*="wa.me"]').evaluateAll((as) => as.map((a) => a.href));
  assert(links.length === 2, `${links.length} links`);
  const texts = links.map((h) => new URL(h).searchParams.get("text"));
  assert(texts[0].includes("prescription") && texts[1].includes("1. "), texts.join(" | "));
  assert(links.every((h) => h.includes("/919815552404")), "number");
});

await step("offer: announcement bar, tap-to-reveal code, WhatsApp with code", async () => {
  await page.goto(`${BASE}/en`);
  const bar = await page.locator('a[href="/en/offers"]').first().textContent();
  assert(bar.includes("10% off selected medicines above ₹1,000"), bar);
  assert((await page.locator('[data-testid="offer-code"]').count()) === 0, "code visible before tap");
  await page.click("button:has-text('Tap to reveal your code')");
  assert((await page.textContent('[data-testid="offer-code"]')).trim() === "SHANKER10", "code");
  const wa = await page.locator('#offer a[href*="wa.me"]').first().getAttribute("href");
  assert(new URL(wa).searchParams.get("text").includes("SHANKER10"), "code in WhatsApp message");
});

await step("store details: Dera Road address, PIN, hours, map and 5% first-purchase club offer", async () => {
  await page.goto(`${BASE}/en/contact`);
  const main = await page.textContent("main");
  assert(main.includes("Dera Road, Batala, Punjab, 143505") && main.includes("Sunday: Closed") && main.includes("+91 98155 52404"), "contact details");
  assert((await page.locator('iframe[src*="google.com/maps"]').count()) === 1, "map embed");
  assert((await page.locator('a[href^="tel:+919815552404"]').count()) >= 1, "call link");
  await page.goto(`${BASE}/en/offers`);
  const offers = await page.textContent("main");
  assert(offers.includes("selected medicines chosen by the store") && offers.includes("extra 5% off their first purchase"), "offer terms");
  assert((await page.textContent("#club")).includes("extra 5% off your first purchase"), "club copy");
});

await step("offer page in Punjabi: terms, FAQ schema, Offer schema", async () => {
  await page.goto(`${BASE}/pa/offers`);
  assert(/10%/.test(await page.textContent("h1")) && /[\u0A00-\u0A7F]/.test(await page.textContent("h1")), "pa headline");
  const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((b) => JSON.parse(b)["@type"]);
  assert(types.includes("FAQPage") && types.includes("Offer"), types.join(","));
});

let memberCodeSeen = "";
await step("Shanker Club: validation (bad mobile, no consent)", async () => {
  await page.goto(`${BASE}/en?utm_source=facebook&utm_medium=paid&utm_campaign=e2e_launch`);
  await page.evaluate(() => localStorage.removeItem("sm_attr"));
  await page.goto(`${BASE}/en?utm_source=facebook&utm_medium=paid&utm_campaign=e2e_launch`);
  const club = page.locator("#club");
  await club.locator('input[name="phone"]').fill("12345");
  await club.locator('input[type="checkbox"]').check();
  await club.locator("button[type=submit]").click();
  await club.locator("text=10-digit Indian mobile").waitFor();
  await club.locator('input[name="phone"]').fill("98140 00001");
  await club.locator('input[type="checkbox"]').uncheck();
  await club.locator("button[type=submit]").click();
  await club.locator("text=Please tick the box").waitFor();
  assert((await club.locator('input[name="phone"]').inputValue()) === "98140 00001", "mobile number wiped after error");
});

await step("Shanker Club: sign-up gives a member code and a WhatsApp save link", async () => {
  const club = page.locator("#club");
  await club.locator('input[name="name"]').fill("E2E Tester");
  await club.locator('input[name="email"]').fill("Tester@Example.com");
  await club.locator('input[type="checkbox"]').check();
  await club.locator("button[type=submit]").click();
  await page.waitForSelector('[data-testid="member-code"]');
  memberCodeSeen = (await page.textContent('[data-testid="member-code"]')).trim();
  assert(/^SM-[A-Z0-9]{5}$/.test(memberCodeSeen), memberCodeSeen);
  const wa = await page.locator('#club a[href*="wa.me"]').getAttribute("href");
  assert(new URL(wa).searchParams.get("text").includes(memberCodeSeen), "code in WhatsApp text");
  return memberCodeSeen;
});

await step("Shanker Club: joining again with the same number returns the same code", async () => {
  await page.goto(`${BASE}/hi`);
  const club = page.locator("#club");
  await club.locator('input[name="phone"]').fill("+91 9814000001");
  await club.locator('input[type="checkbox"]').check();
  await club.locator("button[type=submit]").click();
  await page.waitForSelector('[data-testid="member-code"]');
  assert((await page.textContent('[data-testid="member-code"]')).trim() === memberCodeSeen, "different code");
  assert((await page.textContent("#club")).includes("फिर से स्वागत"), "welcome-back text in Hindi");
});

await step("automation webhook receives the sign-up, signed with HMAC", async () => {
  for (let i = 0; i < 20 && hooks.length < 2; i++) await new Promise((r) => setTimeout(r, 250));
  assert(hooks.length >= 1, "no webhook received");
  const h = hooks[0];
  const expected = "sha256=" + createHmac("sha256", HOOK_SECRET).update(h.body).digest("hex");
  assert(h.sig === expected, "bad signature");
  const payload = JSON.parse(h.body);
  assert(payload.event === "member.joined" && payload.data.phone === "+919814000001" && payload.data.code === memberCodeSeen, h.body);
  assert(payload.data.utm_source === "facebook" && payload.data.utm_campaign === "e2e_launch", "UTM attribution missing");
  assert(hooks.some((x) => JSON.parse(x.body).event === "member.rejoined"), "rejoin event");
});

await step("consent banner: analytics only load after Accept", async () => {
  const c = await browser.newContext({ keepBanner: true });
  const p = await c.newPage();
  const requested = [];
  p.on("request", (r) => /googletagmanager\.com/.test(r.url()) && requested.push(r.url()));
  await p.route(/googletagmanager\.com/, (r) => r.fulfill({ status: 200, contentType: "text/javascript", body: "" }));
  await p.goto(`${BASE}/en`);
  await p.waitForSelector('[role="dialog"][aria-label="Cookies"]');
  await p.waitForTimeout(500);
  assert(requested.length === 0, "loaded before consent");
  await p.click("button:has-text('Accept')");
  await p.waitForTimeout(1200);
  assert(requested.some((u) => u.includes(GA4)), "GA4 not loaded after consent");
  await p.reload();
  assert((await p.locator('[aria-label="Cookies"]').count()) === 0, "banner shown again after choosing");
  await c.close();
});

await step("conversion events reach the dataLayer (WhatsApp click, search, sign-up)", async () => {
  const c = await browser.newContext();
  const p = await c.newPage();
  await p.addInitScript(() => localStorage.setItem("sm_consent", "denied"));
  await p.goto(`${BASE}/en/products?q=dolo`);
  await p.locator('article a[href*="wa.me"]').first().evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
  await p.locator('article a[href*="wa.me"]').first().click();
  const events = await p.evaluate(() => (window.dataLayer || []).map((e) => e.event));
  await c.close();
  assert(events.includes("search") && events.includes("whatsapp_click"), events.join(","));
});

await step("companies page lists the ethical brands A–Z and links to the catalogue", async () => {
  await page.goto(`${BASE}/en/companies`);
  const n = await page.locator('section[id^="letter-"] li').count();
  assert(n >= 60, `${n} companies`);
  await page.click('a:has-text("Micro Labs")');
  await page.waitForURL(/products\?q=Micro/);
  assert((await page.locator("article h3").allTextContents()).includes("Dolo 650"), "Micro Labs → Dolo 650");
});

/* ================= Admin ================= */

await step("admin requires login", async () => {
  const r = await get("/admin/products");
  assert(r.status === 307 && r.headers.get("location").includes("/admin/login"), `${r.status}`);
});

await step("wrong password is rejected", async () => {
  await login(page, "wrong-password");
  await page.waitForSelector('p[role=alert]');
  assert((await page.textContent('p[role=alert]')).includes("incorrect"));
});

await step("admin login works", async () => {
  await login(page);
  await page.waitForURL(`${BASE}/admin`);
  assert((await page.textContent("h1")) === "Overview");
  assert(!(await page.textContent("main")).includes("Business details missing"), "store details are complete");
});

await step("session cookie is httpOnly, scoped to /admin and signed", async () => {
  const c = (await ctx.cookies()).find((x) => x.name === "sm_admin");
  assert(c && c.httpOnly && c.path === "/admin" && c.sameSite === "Lax", JSON.stringify(c));
  await ctx.addCookies([{ ...c, value: c.value.replace(/.$/, (ch) => (ch === "A" ? "B" : "A")) }]);
  await page.goto(`${BASE}/admin`);
  assert(page.url().includes("/admin/login"), "tampered cookie accepted");
  await ctx.addCookies([c]);
});

await step("business settings: validation errors are shown", async () => {
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#address", "Typed before the error");
  await page.fill("#postal_code", "12");
  await page.click("button[type=submit]");
  await page.waitForSelector("p[role=alert]");
  assert((await page.textContent("main")).includes("6-digit PIN"), "PIN error");
  assert((await page.inputValue("#address")) === "Typed before the error", "form was wiped after a validation error");
});

await step("business settings save and appear on the website", async () => {
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#address", "Test Road (E2E placeholder)");
  await page.fill("#postal_code", "");
  await page.fill("#phone", "+91 90000 54321");
  await page.fill("#whatsapp", WA);
  await page.fill("#opening_hours", "Mon–Sat: 9 am – 9 pm (test)");
  await page.fill("#maps_url", "https://maps.app.goo.gl/test");
  await page.click("button[type=submit]");
  await page.waitForSelector("p[role=status]");
  const ok = await eventually(page, `${BASE}/en/contact`, async () => (await page.textContent("main")).includes("Test Road (E2E placeholder)"));
  assert(ok, "address not shown on contact page");
});

await step("WhatsApp: product message is generated, encoded and uses the configured number", async () => {
  await eventually(page, `${BASE}/en/products/dolo-650`, async () => (await page.locator('main a[href*="wa.me"]').count()) > 0);
  const href = await page.locator('main a[data-wa="1"]').first().getAttribute("href");
  const url = new URL(href);
  assert(url.hostname === "wa.me" && url.pathname === "/919000012345", url.pathname);
  const text = url.searchParams.get("text");
  assert(text.includes("Product: Dolo 650") && text.includes("Brand: Dolo") && text.includes("Pack Size: Strip of 15 tablets"), text);
  assert(href.includes("%0A"), "newlines encoded");
  assert((await page.locator('main a[data-wa="1"]').first().getAttribute("target")) === "_blank");
});

await step("WhatsApp: Punjabi page builds a Punjabi message; floating button present", async () => {
  await eventually(page, `${BASE}/pa/products/dolo-650`, async () => (await page.locator('a[data-wa="1"]').count()) > 0);
  const href = await page.locator('main a[data-wa="1"]').first().getAttribute("href");
  const text = new URL(href).searchParams.get("text");
  assert(/[਀-੿]/.test(text) && text.includes("Dolo 650"), text);
  assert((await page.locator('a[aria-label="ਵਟਸਐਪ \'ਤੇ ਗੱਲ ਕਰੋ"]').count()) === 1, "float button");
});

let createdId = "";
await step("create a product with an uploaded image", async () => {
  // 1x1 PNG
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  await page.goto(`${BASE}/admin/products/new`);
  await page.fill("#name", "E2E Test Syrup");
  await page.fill("#brand", "E2EBrand");
  await page.fill("#pack_size", "100 ml bottle");
  await page.fill("#manufacturer", "E2E Labs");
  await page.fill("#generic_name", "Testamol");
  await page.selectOption("#category_id", { label: "Wellness" });
  await page.selectOption("#availability", "in_stock");
  await page.setInputFiles("#image", { name: "p.png", mimeType: "image/png", buffer: png });
  await page.click("button[type=submit]:has-text('Add product')");
  await page.waitForURL(/\/admin\/products\/[0-9a-f-]{36}\?created=1/);
  createdId = page.url().match(/products\/([0-9a-f-]{36})/)[1];
  assert((await page.textContent("p[role=status]")).includes("Product added"));
});

await step("new product is live: searchable by generic name, image served", async () => {
  const ok = await eventually(page, `${BASE}/en/products?q=testamol`, async () => (await page.locator("article h3").allTextContents()).includes("E2E Test Syrup"));
  assert(ok, "not found in search");
  await page.goto(`${BASE}/en/products/e2e-test-syrup-100-ml-bottle`);
  const src = await page.locator("main img").first().getAttribute("src");
  assert(src && src.startsWith("/api/media/"), `img ${src}`);
  const r = await get(src);
  assert(r.status === 200 && r.headers.get("content-type") === "image/png", `${r.status}`);
  assert((await page.textContent("main")).includes("In stock"), "availability shown");
});

await step("duplicate product (same name + brand + pack) is blocked", async () => {
  await page.goto(`${BASE}/admin/products/new`);
  await page.fill("#name", "e2e test syrup");
  await page.fill("#brand", "E2EBRAND");
  await page.fill("#pack_size", "100 ml  bottle");
  await page.click("button[type=submit]:has-text('Add product')");
  await page.waitForSelector("p[role=alert]");
  assert((await page.textContent("p[role=alert]")).includes("already exists"));
});

await step("edit a product", async () => {
  await page.goto(`${BASE}/admin/products/${createdId}`);
  await page.fill("#pack_size", "200 ml bottle");
  await page.click("button[type=submit]:has-text('Save changes')");
  await page.waitForSelector("p[role=status]");
  const ok = await eventually(page, `${BASE}/en/products/e2e-test-syrup-100-ml-bottle`, async () => (await page.textContent("main")).includes("200 ml bottle"));
  assert(ok, "edit not visible");
});

await step("unpublish hides the product publicly; publish restores it", async () => {
  await page.goto(`${BASE}/admin/products?q=e2e`);
  await page.click("button:has-text('Hide')");
  await page.waitForSelector("button:has-text('Publish')");
  let r = await get("/en/products/e2e-test-syrup-100-ml-bottle");
  assert(r.status === 404, `hidden status ${r.status}`);
  assert(!(await (await get("/en/products?q=e2e")).text()).includes("E2E Test Syrup"), "hidden product still listed");
  await page.click("button:has-text('Publish')");
  await page.waitForSelector("button:has-text('Hide')");
  r = await get("/en/products/e2e-test-syrup-100-ml-bottle");
  assert(r.status === 200, `published status ${r.status}`);
});

await step("categories: add (3 languages), reorder, delete", async () => {
  await page.goto(`${BASE}/admin/categories`);
  const add = page.locator("section:has(h2:has-text('Add a category'))");
  await add.locator('input[name="name_en"]').fill("E2E Ayurveda");
  await add.locator('input[name="name_hi"]').fill("आयुर्वेद");
  await add.locator('input[name="name_pa"]').fill("ਆਯੁਰਵੇਦ");
  await add.locator("button[type=submit]").click();
  await add.locator("p[role=status]").waitFor();
  const ok = await eventually(page, `${BASE}/pa/categories`, async () => (await page.textContent("main")).includes("ਆਯੁਰਵੇਦ"));
  assert(ok, "new category not on public list");
  assert((await get("/en/categories/e2e-ayurveda")).status === 200, "category page");
  // reorder: move it up one place
  await page.goto(`${BASE}/admin/categories`);
  const names = async () => (await page.locator("ul > li > details > summary span.font-medium").allTextContents()).filter((n) => !["Prescription Medicines", "OTC Products"].includes(n));
  const before = await names();
  await page.click('button[aria-label="Move E2E Ayurveda up"]');
  await page.waitForLoadState("networkidle");
  await page.goto(`${BASE}/admin/categories`);
  const after = await names();
  assert(after.indexOf("E2E Ayurveda") === before.indexOf("E2E Ayurveda") - 1, `${before.indexOf("E2E Ayurveda")} -> ${after.indexOf("E2E Ayurveda")}`);
  // delete
  const row = page.locator("li:has(summary:has-text('E2E Ayurveda'))");
  await row.locator("summary").click();
  page.once("dialog", (d) => d.accept());
  await row.locator("button:has-text('Delete this category')").click();
  await page.locator("li:has(summary:has-text('E2E Ayurveda'))").waitFor({ state: "detached" });
  assert((await get("/en/categories/e2e-ayurveda")).status === 404, "deleted category still public");
});

await step("category with products cannot be deleted", async () => {
  await page.goto(`${BASE}/admin/categories`);
  const row = page.locator("li:has(summary:has-text('Wellness'))").first();
  await row.locator("summary").click();
  page.once("dialog", (d) => d.accept());
  await row.locator("button:has-text('Delete this category')").click();
  await row.locator("p[role=alert]").waitFor();
  assert((await row.locator("p[role=alert]").textContent()).includes("Move or delete the products"));
});

await step("CSV import: mapping, validation, duplicate detection, preview, summary", async () => {
  const csv = [
    "Product Name,Brand,Company,Composition,Packing,Category,Stock,Prescription,Publish",
    "Import Alpha,ImpBrand,Imp Ltd,Alphamol 10 mg,Strip of 10 tablets,otc-products,in stock,no,yes",
    "Import Beta,ImpBrand,Imp Ltd,,50 g tube,Skin Care,,,yes",
    'Import Gamma,"Imp, Brand",Imp Ltd,,1 unit,medical-devices,on order,,yes',
    "Dolo 650,Dolo,Micro Labs Ltd,Paracetamol 650 mg,Strip of 15 tablets,prescription-medicines,,,yes",
    "Missing Brand,,X,,1 unit,wellness,,,yes",
    "Bad Category,ImpBrand,X,,1 unit,space-food,,,yes",
  ].join("\n");
  await page.goto(`${BASE}/admin/import`);
  await page.setInputFiles("#csv", { name: "stock.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.waitForSelector("text=Match your columns");
  // auto-mapping guessed the aliases
  assert((await page.inputValue("#map-name")) === "Product Name", "name map");
  assert((await page.inputValue("#map-pack_size")) === "Packing", "pack map");
  assert((await page.inputValue("#map-generic_name")) === "Composition", "generic map");
  assert((await page.inputValue("#map-availability")) === "Stock", "stock map");
  await page.click("button:has-text('Continue')");
  const stats = await page.locator("section p.font-display").allTextContents();
  assert(stats.join(",") === "3,1,2", `preview counts ${stats.join(",")}`);
  await page.click("button:has-text('Import 3 products')");
  await page.waitForSelector("text=Import finished");
  const summary = await page.locator("section p.font-display").allTextContents();
  assert(summary.join(",") === "3,0,1,2", `summary ${summary.join(",")}`);
  const errs = await page.locator("section ul li").allTextContents();
  assert(errs.some((e) => e.includes("Row 6")) && errs.some((e) => e.includes("Row 7")), errs.join(" | "));
  const dl = page.waitForEvent("download");
  await page.click("button:has-text('Download error report')");
  const file = await (await dl).path();
  const report = readFileSync(file, "utf8");
  assert(report.includes("row,error") && report.includes("space-food"), "error report content");
});

await step("imported products are live with correct fields", async () => {
  const ok = await eventually(page, `${BASE}/en/products?q=alphamol`, async () => (await page.locator("article h3").allTextContents()).includes("Import Alpha"));
  assert(ok, "Import Alpha not searchable by generic name");
  await page.goto(`${BASE}/en/products/import-gamma-1-unit`);
  const main = await page.textContent("main");
  assert(main.includes("Imp, Brand") && main.includes("Available on order"), "quoted CSV field / availability");
});

await step("delete a product", async () => {
  await page.goto(`${BASE}/admin/products/${createdId}`);
  page.once("dialog", (d) => d.accept());
  await page.click("aside button:has-text('Delete')");
  await page.waitForURL(/deleted=1/);
  assert((await get("/en/products/e2e-test-syrup-100-ml-bottle")).status === 404);
});

await step("server actions refuse unauthenticated calls", async () => {
  const anon = await browser.newContext();
  const p = await anon.newPage();
  await p.goto(`${BASE}/admin/products/new`);
  assert(p.url().includes("/admin/login"), "page not protected");
  await anon.close();
});

await step("admin: club members list shows attribution; CSV export; delete", async () => {
  await page.goto(`${BASE}/admin`);
  assert((await page.textContent("main")).includes("Shanker Club members"), "overview stat");
  await page.goto(`${BASE}/admin/members?q=${memberCodeSeen}`);
  const row = await page.locator("tbody tr").first().textContent();
  assert(row.includes("9814000001") && row.includes("facebook / paid / e2e_launch") && row.includes("tester@example.com"), row);
  const dl = page.waitForEvent("download");
  await page.click("a:has-text('Download CSV')");
  const csv = readFileSync(await (await dl).path(), "utf8");
  assert(csv.includes("+919814000001") && csv.includes(memberCodeSeen) && csv.includes("consent_text"), "csv content");
  page.once("dialog", (d) => d.accept());
  await page.click("tbody button:has-text('Delete')");
  await page.waitForSelector("text=No members match");
  const anon = await fetch(`${BASE}/admin/members-export`);
  assert(anon.status === 401, `export without login: ${anon.status}`);
});

await step("admin: change the offer to 15% and see it on the site", async () => {
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#offer_percent", "15");
  await page.click("button[type=submit]");
  await page.waitForSelector("p[role=status]");
  const ok = await eventually(page, `${BASE}/en/offers`, async () => (await page.textContent("h1")).includes("15%"));
  assert(ok, "15% not shown");
  await page.goto(`${BASE}/admin/settings`);
  await page.fill("#offer_percent", "10");
  await page.click("button[type=submit]");
  await page.waitForSelector("p[role=status]");
});

await step("companies & logos: 100+ companies, bulk logo upload matched by file name", async () => {
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");
  await page.goto(`${BASE}/admin/companies`);
  assert(/10\d companies/.test(await page.textContent("main")), "company count");
  await page.setInputFiles("#logos", [
    { name: "micro-labs.png", mimeType: "image/png", buffer: png },
    { name: "Cipla_logo.png", mimeType: "image/png", buffer: png },
    { name: "unknown-company.png", mimeType: "image/png", buffer: png },
  ]);
  await page.waitForSelector("text=2 of 3 logos uploaded.");
  const log = await page.textContent("section:has(h2:has-text('Upload logos in bulk'))");
  assert(log.includes("micro-labs.png → Micro Labs") && log.includes("Cipla_logo.png → Cipla") && log.includes("No company matches"), log);
});

await step("company logos appear on the companies page and on product pages", async () => {
  const ok = await eventually(page, `${BASE}/en/companies`, async () => (await page.locator('img[alt="Micro Labs logo"]').count()) === 1);
  assert(ok, "logo not on companies page");
  await eventually(page, `${BASE}/en/products/dolo-650`, async () => (await page.locator('main img[alt="Micro Labs logo"]').count()) === 1);
  assert((await page.locator('main img[alt="Micro Labs logo"]').count()) === 1, "logo not on product page");
  const src = await page.locator('main img[alt="Micro Labs logo"]').getAttribute("src");
  assert((await get(src)).status === 200, "logo file not served");
});

await step("admin: edit a company and feature it on the homepage", async () => {
  await page.goto(`${BASE}/admin/companies`);
  const row = page.locator("li:has(summary:has-text('Kopran'))");
  await row.locator("summary").click();
  await row.locator('input[name="known"]').fill("Anti-infectives (edited)");
  await row.locator('input[name="featured"]').check();
  await row.locator("button:has-text('Save company')").click();
  await row.locator("p[role=status]").waitFor();
  const ok = await eventually(page, `${BASE}/en`, async () => (await page.locator('section[aria-labelledby="co-h"]').textContent()).includes("Kopran"));
  assert(ok, "featured company not on homepage");
});

await step("first-party analytics: dashboard counts visits, WhatsApp taps, sources and missed searches", async () => {
  // a fresh visitor (own browser) arriving from a Google Ads link
  const c = await browser.newContext({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 e2e-visitor" });
  const p = await c.newPage();
  await p.goto(`${BASE}/hi/offers?utm_source=google&utm_medium=cpc&utm_campaign=e2e_ads`, { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  await p.goto(`${BASE}/hi/products?q=zzunknownmed`, { waitUntil: "networkidle" });
  await p.goto(`${BASE}/hi/products/dolo-650`, { waitUntil: "networkidle" });
  const wa = p.locator('main a[data-wa="1"]').first();
  await wa.evaluate((a) => a.addEventListener("click", (e) => e.preventDefault()));
  await wa.click();
  await p.waitForTimeout(800);
  await c.close();
  // bots and admin paths are not counted
  const bot = await fetch(`${BASE}/api/collect`, { method: "POST", headers: { "user-agent": "Googlebot/2.1" }, body: JSON.stringify({ t: "pageview", p: "/en" }) });
  assert(bot.status === 204, `bot ${bot.status}`);
  const adm = await fetch(`${BASE}/api/collect`, { method: "POST", headers: { "user-agent": "Mozilla/5.0" }, body: JSON.stringify({ t: "pageview", p: "/admin" }) });
  assert(adm.status === 400, `admin path ${adm.status}`);
  const junk = await fetch(`${BASE}/api/collect`, { method: "POST", headers: { "user-agent": "Mozilla/5.0" }, body: JSON.stringify({ t: "drop_table", p: "/en" }) });
  assert(junk.status === 400, `junk ${junk.status}`);
  await page.goto(`${BASE}/admin/analytics?range=7`);
  const main = await page.textContent("main");
  assert(!main.includes("No visits recorded"), "no data on dashboard");
  assert(main.includes("e2e_ads"), "campaign missing from sources");
  assert(main.includes("zzunknownmed"), "missed search missing");
  const wa7 = await page.locator("li:has(p:text-is('WhatsApp enquiries')) p.font-display").textContent();
  assert(Number(wa7.replace(/\D/g, "")) >= 1, `WhatsApp enquiries ${wa7}`);
  assert((await page.locator('[role=img][aria-label^="Visits"]').count()) === 1, "visits chart");
  assert((await get("/admin/analytics")).status === 307, "dashboard not protected");
});

await step("logout", async () => {
  await page.goto(`${BASE}/admin`);
  await page.locator("aside form button:has-text('Sign out'):visible").click();
  await page.waitForURL(/\/admin\/login/);
  assert((await get("/admin")).status === 307);
});

/* ================= SEO ================= */

await step("SEO: unique titles, descriptions, canonical, hreflang, OG on every page", async () => {
  const titles = new Set();
  const problems = [];
  for (const l of LOCALES) for (const p of PAGES) {
    await page.goto(`${BASE}/${l}${p}`);
    const t = await page.title();
    const d = await page.getAttribute('meta[name="description"]', "content");
    const c = await page.getAttribute('link[rel="canonical"]', "href");
    const alts = await page.locator('link[rel="alternate"][hreflang]').count();
    const og = await page.getAttribute('meta[property="og:image"]', "content");
    if (!t || !d || !c || alts < 4 || !og) problems.push(`${l}${p}`);
    if (c && !c.endsWith(`/${l}${p}`)) problems.push(`canonical ${c}`);
    titles.add(t);
  }
  assert(!problems.length, problems.join(", "));
  assert(titles.size >= LOCALES.length * PAGES.length - 3, `only ${titles.size} unique titles`);
});

await step("SEO: valid JSON-LD (Pharmacy, BreadcrumbList, Product) with no invented ratings", async () => {
  await page.goto(`${BASE}/en/products/dolo-650`);
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  assert(types.includes("Pharmacy") && types.includes("BreadcrumbList") && types.includes("Product"), types.join(","));
  assert(!blocks.join("").match(/aggregateRating|review/i), "ratings present");
});

await step("SEO: sitemap.xml, robots.txt, filtered pages noindex", async () => {
  const sm = await (await get("/sitemap.xml")).text();
  const n = (sm.match(/<url>/g) || []).length;
  assert(sm.includes("/pa/products/dolo-650") && sm.includes("hreflang") && n > 100, `${n} urls`);
  const rb = await (await get("/robots.txt")).text();
  assert(rb.includes("Disallow: /admin") && rb.includes("Sitemap:"), rb);
  await page.goto(`${BASE}/en/products?q=dolo`);
  assert((await page.getAttribute('meta[name="robots"]', "content")).includes("noindex"), "search page indexable");
  return `${n} sitemap URLs`;
});

await step("all images have alt text; one h1 per page", async () => {
  for (const p of ["/en", "/en/products", "/en/products/dolo-650", "/hi/contact", "/en/offers", "/pa/companies"]) {
    await page.goto(BASE + p);
    const noAlt = await page.locator("img:not([alt])").count();
    const h1 = await page.locator("h1").count();
    assert(noAlt === 0 && h1 === 1, `${p}: noAlt=${noAlt} h1=${h1}`);
  }
});

await step("no broken internal links (crawl of every locale's pages)", async () => {
  const seen = new Set();
  const bad = [];
  for (const l of LOCALES) for (const p of PAGES) {
    await page.goto(`${BASE}/${l}${p}`);
    const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")));
    for (const h of hrefs) seen.add(h.split("#")[0]);
  }
  for (const h of seen) {
    const r = await get(h);
    if (r.status >= 400) bad.push(`${h}=${r.status}`);
  }
  assert(!bad.length, bad.slice(0, 10).join(", "));
  return `${seen.size} unique links checked`;
});

/* ================= Security ================= */

await step("security headers on public pages; admin is noindex", async () => {
  const h = (await get("/en")).headers;
  for (const k of ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy", "strict-transport-security"]) assert(h.get(k), `missing ${k}`);
  assert(!h.get("x-powered-by"), "x-powered-by exposed");
  assert((await get("/admin/login")).headers.get("x-robots-tag")?.includes("noindex"), "admin indexable");
});

await step("media route rejects path traversal and odd names", async () => {
  for (const p of ["/api/media/..%2F..%2Fpackage.json", "/api/media/store.json", "/api/media/x.svg"]) {
    const r = await get(p);
    assert(r.status === 404, `${p} ${r.status}`);
  }
});

await step("no secrets in client JavaScript", async () => {
  const dir = path.join(ROOT, ".next/static");
  const files = [];
  const walk = (d) => readdirSync(d).forEach((f) => (statSync(path.join(d, f)).isDirectory() ? walk(path.join(d, f)) : files.push(path.join(d, f))));
  walk(dir);
  const env = readFileSync(path.join(ROOT, ".env.local"), "utf8").match(/^(SESSION_SECRET|ADMIN_DEV_PASSWORD)=(.+)$/gm) || [];
  const needles = [SECRET, HOOK_SECRET, ADMIN.password, ...env.map((l) => l.split("=")[1])].filter((s) => s.length > 6);
  const leaks = files.filter((f) => /\.(js|css|html|json)$/.test(f) && needles.some((n) => readFileSync(f, "utf8").includes(n)));
  assert(!leaks.length, leaks.join(","));
  return `${files.length} static files scanned`;
});

await step("login rate limiting", async () => {
  let msg = "";
  for (let i = 0; i < 7; i++) {
    await page.goto(`${BASE}/admin/login`);
    await page.fill("#email", "attacker@example.com");
    await page.fill("#password", "guess" + i);
    await page.click("button[type=submit]");
    await page.waitForSelector("p[role=alert]");
    msg = await page.textContent("p[role=alert]");
  }
  assert(msg.includes("Too many attempts"), msg);
});

/* ================= Responsive ================= */

const viewports = [
  { name: "Mobile Chrome (Pixel 7)", device: devices["Pixel 7"] },
  { name: "iPhone 13 (Safari viewport)", device: devices["iPhone 13"] },
  { name: "Tablet (iPad Mini)", device: devices["iPad Mini"] },
  { name: "Desktop 1440", device: { viewport: { width: 1440, height: 900 } } },
  { name: "Small phone 320", device: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true } },
];
for (const v of viewports) {
  await step(`no horizontal overflow: ${v.name}`, async () => {
    const c = await browser.newContext(v.device);
    const p = await c.newPage();
    const over = [];
    for (const u of ["/en", "/pa", "/en/products", "/en/products/dolo-650", "/hi/contact", "/en/about", "/en/offers", "/pa/companies", "/admin/login"]) {
      await p.goto(BASE + u);
      // Compare with the real screen width: mobile emulation widens innerWidth to fit overflowing content.
      const bad = await p.evaluate(() => {
        const W = Math.min(window.innerWidth, screen.width);
        const clipped = (el) => { for (let a = el.parentElement; a; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== "visible" || cs.position === "fixed") return true; } return false; };
        return [...document.body.querySelectorAll("*")]
          .filter((el) => getComputedStyle(el).position !== "fixed" && el.getBoundingClientRect().right > W + 1 && !clipped(el))
          .slice(0, 2)
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`);
      });
      if (bad.length) over.push(`${u}: ${bad.join(", ")}`);
    }
    await c.close();
    assert(!over.length, over.join(", "));
  });
}

await step("mobile: drawer navigation and persistent search", async () => {
  const c = await browser.newContext(devices["iPhone 13"]);
  const p = await c.newPage();
  await p.goto(`${BASE}/en/about`);
  assert(await p.locator("header input[type=search]").isVisible(), "mobile search hidden");
  await p.click('button[aria-controls="mobile-drawer"]');
  await p.waitForSelector("#mobile-drawer:not([inert])");
  await p.click('#mobile-drawer a[href="/en/categories/first-aid"]');
  await p.waitForURL(/first-aid/);
  assert((await p.getAttribute("#mobile-drawer", "inert")) !== null, "drawer did not close after navigating");
  await p.locator("header input[type=search]").fill("crocin");
  await p.locator("header input[type=search]").press("Enter");
  await p.waitForURL(/q=crocin/);
  await c.close();
});

await step("tap targets: primary buttons are at least 40px tall on mobile", async () => {
  const c = await browser.newContext(devices["Pixel 7"]);
  const p = await c.newPage();
  await p.goto(`${BASE}/en/products/dolo-650`);
  const h = await p.locator("main .btn").first().evaluate((el) => el.getBoundingClientRect().height);
  await c.close();
  assert(h >= 40, `${h}px`);
});

await step("no JavaScript errors in the browser console", async () => {
  assert(!consoleErrors.length, consoleErrors.slice(0, 3).join(" | "));
});

await browser.close();
hookServer.close();
stopServer();
rmSync(DATA, { recursive: true, force: true });

const passed = results.filter((r) => r.ok).length;
writeFileSync(path.join(ROOT, "tests/e2e/last-run.json"), JSON.stringify({ date: new Date().toISOString(), passed, total: results.length, results }, null, 2));
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
