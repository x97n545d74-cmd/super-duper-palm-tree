# Deployment guide

Target: **Supabase** (database, auth, image storage) + **Vercel** (hosting). About an hour. Steps that need the owner's accounts are marked 👤.

## 1. Supabase 👤
1. Create a project at supabase.com, region **Mumbai (ap-south-1)**. Save the database password somewhere safe.
2. **SQL Editor → New query**: paste and run `supabase/migrations/20261119000001_init.sql`, then `supabase/migrations/20261119000002_marketing.sql`. They create the tables, indexes, Row Level Security policies, the public `product-images` bucket, the offer settings and the `members` table (Shanker Club) with its sign-up function. Both are safe to run again.
3. Optional starter catalogue: run `supabase/seed.sql` (about 40 products, all flagged *needs checking*). Skip it to start empty and use CSV import.
4. **Authentication → Providers → Email**: keep it enabled. **Authentication → Settings**: turn **off** "Allow new users to sign up" (only staff you invite should have accounts).
5. **Authentication → Users → Add user**: create each staff account (email + strong password; tick "Auto confirm").
6. Make them admins in the SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'staff@example.com';
   ```
   To remove access: `delete from public.admin_users where user_id = (select id from auth.users where email = '…');`
7. **Project Settings → API**: copy the *Project URL* and the *anon public* key. You do **not** need the service-role key; never put it in the app.

With the CLI instead: `supabase link --project-ref <ref>` then `supabase db push` applies `supabase/migrations/`.

## 2. Vercel 👤
1. Import the repository in Vercel. **Root directory: `shanker-medicos`**. Framework: Next.js (auto-detected).
2. Environment variables (Production and Preview):
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (no trailing slash) |
   | `NEXT_PUBLIC_SUPABASE_URL` | from step 1.7 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 1.7 |
   | `GOOGLE_SITE_VERIFICATION` | optional, see step 4 |
   | `NEXT_PUBLIC_GA4_ID` / `NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_META_PIXEL_ID` | optional, see docs/MARKETING.md |
   | `AUTOMATION_WEBHOOK_URL` / `AUTOMATION_WEBHOOK_SECRET` | optional, sign-up automation (docs/MARKETING.md) |
   Do **not** set `ADMIN_DEV_*` or `SESSION_SECRET` in production; they are only for development mode.
3. Deploy. Open `/admin/login`, sign in with a staff account, and fill **Business details**.

Node 20.9+ is required (Vercel's default is fine).

## 3. Domain 👤
Buy a domain (e.g. a `.in` or `.com`), add it in Vercel → Project → Domains, and set the DNS records Vercel shows. HTTPS certificates are automatic. Then update `NEXT_PUBLIC_SITE_URL` and redeploy.

## 4. Google 👤
- **Search Console**: add the domain property (DNS verification recommended) or a URL-prefix property with the HTML-tag method: put the `content` value in `GOOGLE_SITE_VERIFICATION` and redeploy. Submit `https://your-domain/sitemap.xml`.
- **Google Business Profile**: create or claim the Shanker Medicos listing in Batala with the *same* name, address and phone as the website (consistency helps local ranking). Add the website URL, opening hours, category *Pharmacy*, and real photos of the shop. Copy the profile's Maps share link into **Business details → Google Maps link**.

## 5. After launch
- Hindi and Punjabi copy: have a native speaker review `src/i18n/hi.ts` and `src/i18n/pa.ts`.
- Legal pages: have a lawyer review `/privacy` and `/terms` (`src/app/[locale]/privacy|terms/page.tsx`).
- Run Lighthouse on the live domain (Chrome DevTools → Lighthouse) and record the scores.

## Operations
- **Backups**: Supabase Pro includes daily backups. On the free plan, export regularly (Database → Backups, or `pg_dump`).
- **Free-plan pause**: Supabase pauses free projects after a period of inactivity. A live site normally keeps it active, but check the dashboard if the catalogue stops loading.
- **Rate limits** are per server instance. For strict limits, replace `src/lib/rate-limit.ts` with Upstash Redis (`@upstash/ratelimit`).
- **Updates**: `npm outdated`, update, then `npm run lint && npm run typecheck && npm run test:unit && npm run build && npm run test:e2e && npm run db:verify`.

## Development mode (no Supabase)
Leave the Supabase variables empty and set `ADMIN_DEV_EMAIL`, `ADMIN_DEV_PASSWORD` and `SESSION_SECRET` (32+ characters). Data is stored in `data/` (git-ignored). Use this only on a computer or server with a writable disk, never on Vercel.
