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

  // search index is usable
  await db.exec("set enable_seqscan = off");
  const plan = await db.query<{ "QUERY PLAN": string }>("explain select * from products where name ilike '%dolo%'");
  const planText = plan.rows.map((x) => x["QUERY PLAN"]).join(" ");
  check("trigram index serves ILIKE search", /products_name_trgm/.test(planText), planText.slice(0, 80));

  console.log(failures ? `\n${failures} check(s) failed` : "\nAll database checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
