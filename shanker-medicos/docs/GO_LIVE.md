# Going live: step by step (for the shop owner)

Time needed: about 45 minutes. You need a phone, an email address and a debit/credit card (for Vercel Pro and the domain).
**Never send passwords or the Supabase "service_role" key to anyone, including in chat.**

## Step 1. Supabase (the website's secure database) — 15 min
1. Go to **supabase.com** → **Start your project** → sign in with **GitHub** (the same GitHub account that holds this project).
2. **New project**
   - Name: `shanker-medicos`
   - Database password: press **Generate a password** and save it in your phone's notes. You won't need to share it.
   - Region: **South Asia (Mumbai)**
   - Plan: Free to start (Pro, about $25/month, adds daily backups; recommended once the site is busy)
   - Press **Create new project** and wait about 2 minutes.
3. Left menu → **SQL Editor** → **New query**.
4. Open the file `shanker-medicos/supabase/setup-all.sql` on GitHub, press **Copy raw file**, paste it into the SQL Editor and press **Run**. You should see "Success. No rows returned".
5. Left menu → **Authentication** → **Sign In / Providers** (or *Settings*) → turn **off** "Allow new users to sign up". Customers never need accounts.
6. **Authentication** → **Users** → **Add user** → **Create new user**: your email + a strong password, tick **Auto confirm user**. This is your login for Admin (analytics, offer, members).
7. **SQL Editor** → **New query** → paste this, put your email in, press **Run**:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'your-email@example.com';
   ```
8. **Project Settings** → **API** (or **Data API** / **API Keys**). Copy two things:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public key** (a long text starting with `eyJ` or `sb_publishable_`)
   These two are safe to share; the database rules decide what they can do.

## Step 2. Vercel (keeps the website online) — 15 min
> Before this step the website code must be merged into the project's **main** branch on GitHub (Claude does this through a pull request once you say yes).

1. Go to **vercel.com** → **Sign up** → **Continue with GitHub**.
2. Choose the **Pro** plan (about $20/month; the free Hobby plan is for non-commercial sites only). There is usually a free trial.
3. **Add New… → Project** → find `super-duper-palm-tree` → **Import**.
4. **Root Directory** → **Edit** → choose `shanker-medicos` → Continue. Framework: Next.js (automatic).
5. **Environment Variables** → add these four:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the Project URL from Step 1.8 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the anon/public key from Step 1.8 |
   | `NEXT_PUBLIC_SITE_URL` | for now the Vercel address, e.g. `https://shanker-medicos.vercel.app` (change after Step 3) |
   | `ANALYTICS_SALT` | any long random text, e.g. type 40 random letters and numbers |
6. Press **Deploy**. After 2–3 minutes you get a link. Open it: that's your website.
7. Open `<your link>/admin/login` and sign in with the email and password from Step 1.6.

## Step 3. Your web address (domain) — 10 min
1. In Vercel → your project → **Settings → Domains** → type the name you want (e.g. `shankermedicos.in`). If it's free, you can buy it right there; or buy it at GoDaddy/Hostinger and follow Vercel's DNS instructions.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://your-domain` (Settings → Environment Variables) and press **Redeploy**.

## Step 4. Google (free customers) — 10 min
1. **business.google.com** → find or add "Shanker Medicos, Dera Road, Batala" → verify by phone/postcard → add the website link, hours, photos.
2. **search.google.com/search-console** → add your domain → verify → **Sitemaps** → submit `sitemap.xml`.

## After launch
- Admin → Analytics: check weekly. Admin → Business details: change the offer any time.
- Test the WhatsApp buttons on your own phone.
