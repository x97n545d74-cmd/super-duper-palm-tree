# Going live for free: step by step (for the shop owner)

The website runs in **publish-only mode**: no database, no logins, nothing to manage. It shows the catalogue, offer and shop details, and every enquiry goes to WhatsApp 98155 52404. To change something (offer, hours, products), message Claude.

It is hosted on **Netlify's free plan**, which allows business websites. You pay nothing and need no card. Time needed: about 15 minutes. You need your GitHub login.

## Step 1. Put the site online with Netlify (10 min)
> Before this step the website code must be merged into the project's **main** branch on GitHub (Claude opens a pull request; you press **Merge**).

1. Go to **netlify.com** → **Sign up** → **Sign up with GitHub**. Choose the **Free** plan if asked.
2. **Add new project → Import an existing project → GitHub**. Allow Netlify to see `super-duper-palm-tree` and pick it.
3. Leave all the build settings empty or as Netlify fills them in. The file `netlify.toml` in the repository tells Netlify to build the `shanker-medicos` folder.
4. Press **Deploy**. After 3–5 minutes you get a link like `https://random-name-123.netlify.app`: that's your website.
5. **Project configuration → Change project name** → type `shanker-medicos`. Your address becomes `https://shanker-medicos.netlify.app` (free, with the padlock/HTTPS).
6. **Deploys → Trigger deploy → Deploy project** once more, so links inside the site (Google sitemap, sharing previews) use the new name.

Every time Claude changes the website and you merge it on GitHub, Netlify updates the site by itself.

**The free plan has a monthly allowance.** A shop website with a few hundred visitors a day stays well inside it. If it were ever used up, Netlify pauses the site until the next month; it never charges you without asking.

## Step 2. Count visitors (optional, free, 5 min)
1. Go to **dash.cloudflare.com** → sign up free (no card) → **Analytics & Logs → Web Analytics → Add a site** → type your site address.
2. Choose the **JS snippet** option and copy only the **token** (the long code after `"token": "`).
3. In Netlify: **Project configuration → Environment variables → Add a variable**: name `NEXT_PUBLIC_CF_BEACON_TOKEN`, value: the token. Then **Deploys → Trigger deploy**.
4. Visitors and top pages now appear in Cloudflare. No cookies, no pop-up needed.

You also get free numbers from **Google Business Profile** (calls, direction requests, website clicks) and **WhatsApp Business** (messages). Those matter most.

## Step 3. Your own web address (optional, not free)
`shanker-medicos.netlify.app` costs nothing and works fine on posters and Google. If you later want `shankermedicos.in` (about ₹500–900 a year): Netlify → **Domain management → Add a domain** → buy it there or connect one bought elsewhere. Then add the variable `NEXT_PUBLIC_SITE_URL` = `https://shankermedicos.in` and trigger a deploy. Tell Claude so the poster QR code and posts can be updated.

## Step 4. Marketing
Follow `marketing/README.md`: WhatsApp Business setup, Google Business Profile, Instagram/Facebook, the counter poster and posts. All of it is free; the ads are optional.

## Later (optional)
If you ever want to edit products yourself, collect Shanker Club sign-ups on the website, or use the built-in analytics dashboard, connect Supabase: see `docs/DEPLOYMENT.md`. Everything is already built for it.
