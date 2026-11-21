// Applies supabase/migrations/*.sql and supabase/seed.sql to an in-process
// PostgreSQL (PGlite) with minimal stand-ins for Supabase's auth and storage
// schemas, then checks the Row Level Security rules as anon, a signed-in
// non-admin and an admin. Run: npm run db:verify
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";

const ADMIN = "11111111-1111-4111-8111-111111111111";
const USER = "22222222-2222-4222-8222-222222222222";

const SUPABASE_STUBS = `
  create role anon nologin; create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant insert, select on storage.objects to authenticated;
  grant usage on schema public to anon, authenticated;
`;

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
}

async function as(db: PGlite, role: "anon" | "authenticated", sub: string | null, sql: string) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false); set role ${role};`);
  try {
    const r = await db.query(sql);
    return { rows: r.rows as Record<string, unknown>[], affected: r.affectedRows ?? 0, error: null as string | null };
  } catch (e) {
    return { rows: [], affected: 0, error: (e as Error).message };
  } finally {
    await db.exec("reset role;");
  }
}

async function main() {
  const db = new PGlite({ extensions: { pg_trgm } });
  await db.exec(SUPABASE_STUBS);
  const dir = new URL("../supabase/migrations/", import.meta.url);
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(new URL(f, dir), "utf8"));
    check(`migration ${f} applies`, true);
  }
  // Running twice must be safe (idempotent migration).
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    try {
      await db.exec(readFileSync(new URL(f, dir), "utf8"));
      check(`migration ${f} is re-runnable`, true);
    } catch (e) {
      check(`migration ${f} is re-runnable`, false, (e as Error).message);
    }
  }
  await db.exec(readFileSync(new URL("../supabase/seed.sql", import.meta.url), "utf8"));
  const wa = await db.query<{ whatsapp: string; maps_url: string; address: string; postal_code: string; phone: string; opening_hours: string; club_extra_percent: number }>("select * from business_settings");
  const w = wa.rows[0];
  check("migrations set the store WhatsApp and Maps link", w.whatsapp === "+91 98155 52404" && w.maps_url.startsWith("https://maps.app.goo.gl/"), JSON.stringify(w));
  check("migrations set address, PIN, phone, hours, 5% club discount", w.address === "Dera Road" && w.postal_code === "143505" && w.phone === "+91 98155 52404" && w.opening_hours.includes("Sunday: Closed") && w.club_extra_percent === 5, JSON.stringify(w));
  const counts = await db.query<{ c: number; p: number }>("select (select count(*) from categories)::int c, (select count(*) from products)::int p");
  check("seed.sql loads", counts.rows[0].c > 0 && counts.rows[0].p > 0, `${counts.rows[0].c} categories, ${counts.rows[0].p} products`);

  await db.exec(`insert into auth.users values ('${ADMIN}', 'admin@example.com'), ('${USER}', 'user@example.com');
                 insert into public.admin_users (user_id) values ('${ADMIN}');
                 update products set published = false where slug = 'pan-40';`);

  // anon
  let r = await as(db, "anon", null, "select count(*)::int n from products");
  check("anon sees only published products", r.rows[0]?.n === counts.rows[0].p - 1, `saw ${r.rows[0]?.n}`);
  r = await as(db, "anon", null, "select * from products where slug = 'pan-40'");
  check("anon cannot read an unpublished product", r.rows.length === 0);
  r = await as(db, "anon", null, "select count(*)::int n from categories");
  check("anon can read categories", (r.rows[0]?.n as number) > 0);
  r = await as(db, "anon", null, "select business_name from business_settings");
  check("anon can read business settings", r.rows[0]?.business_name === "Shanker Medicos");
  r = await as(db, "anon", null, "insert into products (slug,name,brand,pack_size) values ('x','X','Y','1')");
  check("anon cannot insert products", !!r.error, r.error ?? "");
  r = await as(db, "anon", null, "update business_settings set phone = '123'");
  check("anon cannot change settings", !!r.error || r.affected === 0, r.error ?? `affected ${r.affected}`);
  r = await as(db, "anon", null, "select * from admin_users");
  check("anon cannot list admins", !!r.error || r.rows.length === 0);

  // signed-in, not an admin
  r = await as(db, "authenticated", USER, "insert into products (slug,name,brand,pack_size) values ('x','X','Y','1')");
  check("non-admin cannot insert products", !!r.error, r.error ?? "");
  r = await as(db, "authenticated", USER, "update products set name = 'Hacked' where slug = 'dolo-650'");
  check("non-admin cannot update products", r.affected === 0 && !r.error, `affected ${r.affected}`);
  r = await as(db, "authenticated", USER, "delete from categories");
  check("non-admin cannot delete categories", r.affected === 0, r.error ?? `affected ${r.affected}`);
  r = await as(db, "authenticated", USER, "select * from admin_users");
  check("non-admin sees no admin rows", r.rows.length === 0);
  r = await as(db, "authenticated", USER, "insert into admin_users (user_id) values ('" + USER + "')");
  check("non-admin cannot make themselves admin", !!r.error, r.error ?? "");
  r = await as(db, "authenticated", USER, "insert into storage.objects (bucket_id, name) values ('product-images', 'a.jpg')");
  check("non-admin cannot upload images", !!r.error, r.error ?? "");

  // admin
  r = await as(db, "authenticated", ADMIN, "select count(*)::int n from products");
  check("admin sees unpublished products too", r.rows[0]?.n === counts.rows[0].p, `saw ${r.rows[0]?.n}`);
  r = await as(db, "authenticated", ADMIN, "insert into products (slug,name,brand,pack_size) values ('test-item','Test Item','Brand','1 unit') returning id");
  check("admin can insert products", !r.error && r.rows.length === 1, r.error ?? "");
  r = await as(db, "authenticated", ADMIN, "insert into products (slug,name,brand,pack_size) values ('test-item-2','TEST ITEM','brand','1 UNIT')");
  check("duplicate name+brand+pack is rejected", !!r.error && /duplicate key/.test(r.error), r.error ?? "");
  r = await as(db, "authenticated", ADMIN, "update business_settings set whatsapp = '+91 90000 00000' where id = 1");
  check("admin can update settings", !r.error && r.affected === 1, r.error ?? "");
  r = await as(db, "authenticated", ADMIN, "insert into storage.objects (bucket_id, name) values ('product-images', 'a.jpg')");
  check("admin can upload images", !r.error, r.error ?? "");
  r = await as(db, "authenticated", ADMIN, "insert into products (slug,name,brand,pack_size,availability) values ('bad','Bad','B','1','sold')");
  check("invalid availability value is rejected", !!r.error);
  r = await as(db, "authenticated", ADMIN, "delete from categories where slug = 'medicines'");
  check("category with sub-categories/products cannot be deleted", !!r.error);

  // members / Shanker Club
  const join = (phone: string) =>
    `select * from public.join_club('Asha', '${phone}', 'asha@example.com', 'pa', 'I agree to receive offers', 'homepage', 'facebook', 'paid', 'diwali')`;
  r = await as(db, "anon", null, join("9815500001"));
  const code1 = r.rows[0]?.code as string;
  check("anon can join the club and gets a member code", !r.error && /^SM-[A-Z0-9]{5}$/.test(code1) && r.rows[0]?.is_new === true, r.error ?? code1);
  r = await as(db, "anon", null, join("+919815500001".slice(3)));
  check("joining again with the same phone returns the same code", r.rows[0]?.code === code1 && r.rows[0]?.is_new === false, String(r.rows[0]?.code));
  r = await as(db, "anon", null, join("12345"));
  check("invalid phone is rejected", !!r.error);
  r = await as(db, "anon", null, "select * from public.join_club('A','9815500002','','en','','','','','')");
  check("sign-up without consent text is rejected", !!r.error);
  r = await as(db, "anon", null, "select * from members");
  check("anon cannot read members", !!r.error || r.rows.length === 0, r.error ?? `${r.rows.length} rows`);
  r = await as(db, "anon", null, "insert into members (code, phone, consent_marketing, consent_text) values ('SM-AAAAA','9815500003',true,'x')");
  check("anon cannot insert members directly", !!r.error);
  r = await as(db, "authenticated", USER, "select * from members");
  check("non-admin cannot read members", r.rows.length === 0);
  r = await as(db, "authenticated", ADMIN, "select phone, utm_source, locale from members");
  check("admin can read members with attribution", r.rows.length === 1 && r.rows[0].utm_source === "facebook" && r.rows[0].locale === "pa", JSON.stringify(r.rows[0]));
  r = await as(db, "authenticated", ADMIN, "delete from members where phone = '9815500001'");
  check("admin can delete a member (erasure request)", r.affected === 1, r.error ?? "");
  const st = await db.query<{ whatsapp: string; offer_percent: number; offer_code: string }>("select whatsapp, offer_percent, offer_code from business_settings");
  check("10% offer (SHANKER10) set from the owner details", st.rows[0].offer_percent === 10 && st.rows[0].offer_code === "SHANKER10", JSON.stringify(st.rows[0]));
  r = await as(db, "authenticated", ADMIN, "update business_settings set offer_percent = 90");
  check("offer percent above 50 is rejected", !!r.error);

  // companies + analytics events
  r = await as(db, "anon", null, "select count(*)::int n from companies");
  check("anon can read companies (100+ seeded)", (r.rows[0]?.n as number) >= 100, String(r.rows[0]?.n));
  r = await as(db, "anon", null, "update companies set logo_url = 'x'");
  check("anon cannot change company logos", !!r.error || r.affected === 0);
  r = await as(db, "authenticated", USER, "update companies set logo_url = 'https://x/y.png' where slug = 'cipla'");
  check("non-admin cannot change company logos", r.affected === 0);
  r = await as(db, "authenticated", ADMIN, "update companies set logo_url = 'https://x/y.png' where slug = 'cipla'");
  check("admin can set a company logo", r.affected === 1, r.error ?? "");
  r = await as(db, "anon", null, `select public.log_event('pageview','/en','en','google.com','google','cpc','test','mobile','abc123','{"x":1}'::jsonb)`);
  check("anon can log an analytics event through log_event()", !r.error, r.error ?? "");
  r = await as(db, "anon", null, `select public.log_event('steal_data','/en','en','','','','','mobile','v','{}'::jsonb)`);
  check("unknown event type is rejected", !!r.error);
  r = await as(db, "anon", null, "select * from events");
  check("anon cannot read analytics events", !!r.error || r.rows.length === 0);
  r = await as(db, "authenticated", USER, "select * from events");
  check("non-admin cannot read analytics events", r.rows.length === 0);
  r = await as(db, "authenticated", ADMIN, "select type, device, utm_source from events");
  check("admin can read analytics events", r.rows.length === 1 && r.rows[0].utm_source === "google", JSON.stringify(r.rows[0]));

  // search index is usable
  await db.exec("set enable_seqscan = off");
  const plan = await db.query<{ "QUERY PLAN": string }>("explain select * from products where name ilike '%dolo%'");
  const planText = plan.rows.map((x) => x["QUERY PLAN"]).join(" ");
  check("trigram index serves ILIKE search", /products_name_trgm/.test(planText), planText.slice(0, 80));

  // The one-file setup used by the owner must apply cleanly to a fresh database, twice.
  const fresh = new PGlite({ extensions: { pg_trgm } });
  await fresh.exec(SUPABASE_STUBS);
  try {
    const all = readFileSync(new URL("../supabase/setup-all.sql", import.meta.url), "utf8");
    await fresh.exec(all);
    await fresh.exec(all);
    const n = await fresh.query<{ p: number; c: number }>("select (select count(*) from products)::int p, (select count(*) from companies)::int c");
    check("setup-all.sql (one-paste setup) applies to a fresh database, re-runnable", n.rows[0].p > 0 && n.rows[0].c >= 100, JSON.stringify(n.rows[0]));
  } catch (e) {
    check("setup-all.sql (one-paste setup) applies to a fresh database, re-runnable", false, (e as Error).message);
  }

  console.log(failures ? `\n${failures} check(s) failed` : "\nAll database checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
