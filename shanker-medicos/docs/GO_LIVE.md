# Going live: step by step (for the shop owner)

The website runs in **publish-only mode**: no database, no logins, nothing to manage. It shows the catalogue, offer and shop details; every enquiry goes to WhatsApp 98155 52404; visits are counted by Vercel Analytics. To change something (offer, hours, products), message Claude.

Time needed: about 20 minutes. You need your GitHub login and a debit/credit card.

## Step 1. Put the site online with Vercel (15 min)
> Before this step the website code must be merged into the project's **main** branch on GitHub (Claude opens a pull request; you press **Merge**).

1. Go to **vercel.com** → **Sign up** → **Continue with GitHub**.
2. Choose the **Pro** plan (about $20/month, ≈ ₹1,700; the free Hobby plan is for non-commercial sites only).
3. **Add New… → Project** → find `super-duper-palm-tree` → **Import**.
4. **Root Directory** → **Edit** → choose `shanker-medicos` → Continue.
5. **Environment Variables** (optional at first; Vercel fills in its own address automatically): add one:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://shanker-medicos.vercel.app` for now (change after Step 2) |
6. Press **Deploy**. After 2–3 minutes you get a link: that's your website.
7. In the project, open **Analytics** → **Enable** (Web Analytics). Visits and WhatsApp taps appear there.

## Step 2. Your web address (5 min)
1. Vercel → your project → **Settings → Domains** → type the name you want (e.g. `shankermedicos.in`) and buy it there, or connect one you bought elsewhere.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://your-domain` (Settings → Environment Variables) and press **Redeploy**.

## Step 3. Marketing
Follow `marketing/README.md`: WhatsApp Business setup, Google Business Profile, Instagram/Facebook, the counter poster and posts, and optional ads.

## Later (optional)
If you ever want to edit products yourself, collect Shanker Club sign-ups on the website, or use the built-in analytics dashboard, connect Supabase: see `docs/DEPLOYMENT.md`. Everything is already built for it.
