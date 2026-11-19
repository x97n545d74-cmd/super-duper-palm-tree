# Outstanding launch checklist

**Current plan (owner, 20 Nov 2026):** publish only, no database, focus on digital marketing. See docs/GO_LIVE.md and marketing/README.md. Supabase items below are optional.

Items the build could not complete because they need the owner's information, accounts or a professional review. Nothing here was guessed.

## Business information (enter in /admin → Business details)
- [x] **Trading name: Shanker Medicos** (owner confirmed "Medicos"; wrote "Shankar" in chat, spelling kept as "Shanker" to match the sign, brief and logo; confirm). Earlier note: The brief says "Shanker Medicos"; the shop sign in the supplied video reads "Shanker Chemists & Druggists". Use the name on the drug licence and Google Business Profile everywhere. The name can be changed in Business details; the logo wordmark files in `public/brand/` would need regenerating for a different name.
- [x] Shop address: Dera Road, Batala (supplied 20 Nov 2026)
- [x] PIN code: 143505
- [x] Phone number: +91 98155 52404 (same as WhatsApp)
- [x] WhatsApp number: +91 98155 52404 (supplied 20 Nov 2026)
- [x] Opening hours: summer 9 am–10 pm, winter 9:30 am–9:30 pm, Sunday closed (summer closing time read as 10 pm; confirm)
- [x] Google Maps link: maps.app.goo.gl/jgHwJrpiNSSzED4q9 (supplied 20 Nov 2026)
- [x] Email, Instagram, Facebook: none for now

## Marketing (see docs/MARKETING.md)
- [x] Shanker Club: extra 5% on the first purchase
- [x] Offer: 10% off selected medicines (store's choice) on bills above ₹1,000, code SHANKER10, also on WhatsApp orders
- [ ] Confirm the companies list on `/companies` (107 companies) and the claim "branded and generic medicines from India's leading companies"
- [ ] Create GA4 / Meta Pixel (and optionally GTM) and add the IDs
- [ ] Set up the sign-up automation (webhook → Sheet / email / WhatsApp Business Platform)

- [x] Logos: the owner chose house-style name badges instead of collecting official logos (official logos can still be uploaded later with permission)
- [ ] Clear the demo analytics data (Admin → Analytics → Clear demo data) if it was loaded; set `ANALYTICS_SALT` in production

## Catalogue
- [x] Medicine names: removed from the public site by the owner (19 Nov 2026). The starter products stay in admin only.
- [ ] Real product list: not now (billing software export not available). The starter catalogue stays; "Searched but not found" in Analytics shows what to add.
- [x] Product images: unlabelled illustrations by the owner's choice
- [ ] Confirm the 12 kinds on "What we stock" (`src/lib/stock.ts`) match what the shop carries.

## Content reviews
- [ ] Native-speaker review of Hindi (`src/i18n/hi.ts`) and Punjabi (`src/i18n/pa.ts`) interface text, including the v2 block and the kind names in `src/lib/stock.ts`.
- [ ] Lawyer review of the Privacy Policy and Terms of Use (Digital Personal Data Protection Act 2023; Drugs and Cosmetics Act 1940/Rules; jurisdiction).
- [ ] Confirm the store is comfortable with the trust statements on the homepage (none claim awards, years, certifications or credentials).
- [x] Storefront video: approved by the owner

## Accounts and deployment (see docs/DEPLOYMENT.md)
- [ ] Supabase project, migration run, sign-ups disabled, staff accounts created and added to `admin_users`
- [ ] Netlify project (free plan; root `netlify.toml` points it at `shanker-medicos`); optional `NEXT_PUBLIC_CF_BEACON_TOKEN` for visit counts
- [ ] Domain and DNS; `NEXT_PUBLIC_SITE_URL` updated
- [ ] Search Console verified, sitemap submitted
- [ ] Google Business Profile claimed with identical name, address and phone

## Verification on the live site
- [ ] Lighthouse (mobile and desktop): targets Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+. Record the real scores.
- [ ] Test on a real iPhone (Safari) and Android phone: WhatsApp buttons open the app with the message.
- [ ] Rich Results Test on the homepage and a product page.
- [ ] Sign in to admin from the shop computer; staff walkthrough of the admin manual.
