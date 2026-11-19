// Publish-only mode (how the site runs on Netlify/Vercel without a database).
// Builds and starts the site with PUBLISH_ONLY=1, then checks that every page
// works, the club is joined on WhatsApp, admin is off, and nothing is written
// to disk. Run: npm run test:publish
import { spawn, execSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, devices } from "playwright";

const ROOT = path.resolve(new URL("../..", import.meta.url).pathname);
const PORT = 3150;
const BASE = `http://localhost:${PORT}`;
const DATA = mkdtempSync(path.join(tmpdir(), "shanker-publish-"));
const env = { ...process.env, PUBLISH_ONLY: "1", LOCAL_DATA_DIR: DATA, NEXT_PUBLIC_SITE_URL: BASE, NODE_ENV: "production" };
delete env.ADMIN_DEV_EMAIL;
delete env.ADMIN_DEV_PASSWORD;
delete env.SESSION_SECRET;
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const results = [];
async function step(name, fn) {
  try {
    const d = await fn();
    results.push(true);
    console.log(`PASS  ${name}${d ? `  (${d})` : ""}`);
  } catch (e) {
    results.push(false);
    console.log(`FAIL  ${name}  (${String(e.message || e).split("\n")[0].slice(0, 240)})`);
  }
}
const assert = (c, m) => {
  if (!c) throw new Error(m);
};

console.log("building (publish-only)…");
rmSync(path.join(ROOT, ".next"), { recursive: true, force: true });
execSync("npx next build", { cwd: ROOT, stdio: "ignore", env });
const proc = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, env, detached: true, stdio: "ignore" });
const stop = () => {
  try {
    process.kill(-proc.pid, "SIGKILL");
  } catch {}
};
process.on("exit", stop);
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(`${BASE}/en`, { signal: AbortSignal.timeout(3000) })).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}
const get = (p, o = {}) => fetch(BASE + p, { redirect: "manual", signal: AbortSignal.timeout(20000), ...o });

await step("all pages render in all three languages; old medicine pages redirect", async () => {
  const bad = [];
  for (const l of ["en", "hi", "pa"]) {
    for (const p of ["", "/offers", "/companies", "/products", "/about", "/contact", "/privacy", "/terms"]) {
      const r = await get(`/${l}${p}`);
      if (r.status !== 200) bad.push(`/${l}${p}=${r.status}`);
    }
    for (const p of ["/products/dolo-650", "/categories", "/categories/medicines"]) {
      const r = await get(`/${l}${p}`);
      if (r.status !== 308 || !r.headers.get("location").endsWith(`/${l}/products`)) bad.push(`${l}${p}=${r.status}`);
    }
  }
  assert(!bad.length, bad.join(", "));
  return "24 pages + 9 redirects";
});

await step("no medicine names on any public page (owner's rule)", async () => {
  // every starter product name from src/lib/data/seed.ts (first field of each PRODUCTS row)
  const seed = readFileSync(path.join(ROOT, "src/lib/data/seed.ts"), "utf8");
  const block = seed.slice(seed.indexOf("const PRODUCTS"), seed.indexOf("];", seed.indexOf("const PRODUCTS")));
  const names = [...block.matchAll(/^\s*\["([^"]+)"/gm)].map((m) => m[1]);
  assert(names.length > 30, `parsed ${names.length} names`);
  const hits = [];
  for (const l of ["en", "hi", "pa"])
    for (const p of ["", "/products", "/companies", "/offers", "/about", "/contact"]) {
      const html = await (await get(`/${l}${p}`)).text();
      for (const n of names) if (html.includes(n)) hits.push(`${l}${p}:${n}`);
    }
  const sm = await (await get("/sitemap.xml")).text();
  assert(!hits.length, hits.slice(0, 5).join(", "));
  assert(!sm.includes("/products/") && !sm.includes("/categories"), "sitemap still lists medicine pages");
  return `${names.length} names checked`;
});

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { try { localStorage.setItem("sm_consent", "denied"); } catch {} });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await step("Shanker Club is joined on WhatsApp (no form, no data stored)", async () => {
  await page.goto(`${BASE}/pa`);
  assert((await page.locator('#club input[name="phone"]').count()) === 0, "sign-up form still shown");
  const href = await page.locator('#club a[href*="wa.me"]').getAttribute("href");
  const u = new URL(href);
  assert(u.pathname === "/919815552404" && /[਀-੿]/.test(u.searchParams.get("text")), href);
  assert((await page.textContent("#club")).includes("5%"), "5% first purchase missing");
});

await step("offer, prescription buttons and store details are live", async () => {
  await page.goto(`${BASE}/en`);
  await page.click("button:has-text('Tap to reveal your code')");
  assert((await page.textContent('[data-testid="offer-code"]')).trim() === "SHANKER10", "code");
  assert((await page.locator('section[aria-labelledby="order-h"] a[href*="wa.me/919815552404"]').count()) === 2, "prescription buttons");
  await page.goto(`${BASE}/en/contact`);
  const t = await page.textContent("main");
  assert(t.includes("Dera Road, Batala, Punjab, 143505") && t.includes("Sunday: Closed"), "contact details");
});

await step("what we stock and the company finder work", async () => {
  await page.goto(`${BASE}/en/products`);
  assert((await page.locator("main li[id] a[href*='wa.me/919815552404']").count()) === 12, "12 kinds with WhatsApp asks");
  const inj = new URL(await page.locator("#injectables a[href*='wa.me']").getAttribute("href")).searchParams.get("text");
  assert(inj.includes("injectables"), inj);
  await page.goto(`${BASE}/en/companies`);
  const cards = page.locator("main ul[lang=en] li");
  const all = await cards.count();
  assert(all >= 100, `companies ${all}`);
  await page.fill("input[type=search]", "cipla");
  assert((await cards.count()) === 1, "search cipla");
  const msg = new URL(await cards.first().locator("a").getAttribute("href")).searchParams.get("text");
  assert(msg.includes("Cipla"), msg);
  await page.fill("input[type=search]", "");
  await page.click("button[aria-pressed]:has-text('Multinational')");
  const mnc = await cards.count();
  assert(mnc > 5 && mnc < all, `multinational ${mnc}`);
  await page.goto(`${BASE}/en`);
  assert((await page.locator("section#stock ol li a[href*='wa.me/919815552404']").count()) === 12, "homepage stock index");
  return `${all} companies, ${mnc} multinational`;
});

await step("admin is switched off", async () => {
  const r = await get("/admin");
  assert(r.status === 307 && r.headers.get("location").includes("/admin/login"), `admin ${r.status}`);
  await page.goto(`${BASE}/admin/login`);
  assert((await page.textContent("main, body")).includes("publish-only mode"), "message");
  assert((await page.locator("#password").count()) === 0, "login form shown");
});

await step("privacy policy describes WhatsApp joining and cookieless stats", async () => {
  await page.goto(`${BASE}/en/privacy`);
  const t = await page.textContent("main");
  assert(t.includes("You join Shanker Club by sending us a message on WhatsApp") && t.includes("Vercel Web Analytics"), "privacy text");
});

await step("nothing is written to disk (no database, no files)", async () => {
  await fetch(`${BASE}/api/collect`, { method: "POST", headers: { "user-agent": "Mozilla/5.0" }, body: JSON.stringify({ t: "pageview", p: "/en" }) });
  await new Promise((r) => setTimeout(r, 500));
  const files = readdirSync(DATA);
  assert(files.length === 0, files.join(","));
});

await step("phones: no horizontal overflow", async () => {
  const c = await browser.newContext(devices["iPhone 13"]);
  await c.addInitScript(() => { try { localStorage.setItem("sm_consent", "denied"); } catch {} });
  const p = await c.newPage();
  const over = [];
  for (const u of ["/pa", "/en", "/en/offers", "/hi/companies", "/pa/products", "/hi/contact"]) {
    await p.goto(BASE + u);
    const bad = await p.evaluate(() => {
      const W = screen.width;
      const clipped = (el) => {
        for (let a = el.parentElement; a; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.overflowX !== "visible" || cs.position === "fixed") return true;
        }
        return false;
      };
      return [...document.body.querySelectorAll("*")].filter((el) => getComputedStyle(el).position !== "fixed" && el.getBoundingClientRect().right > W + 1 && !clipped(el)).length;
    });
    if (bad) over.push(u);
  }
  await c.close();
  assert(!over.length, over.join(","));
});

await step("no JavaScript errors", async () => {
  assert(!errors.length, errors.slice(0, 2).join(" | "));
});

await browser.close();
stop();
rmSync(DATA, { recursive: true, force: true });
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
