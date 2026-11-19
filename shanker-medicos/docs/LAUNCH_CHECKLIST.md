# Outstanding launch checklist

Items the build could not complete because they need the owner's information, accounts or a professional review. Nothing here was guessed.

## Business information (enter in /admin → Business details)
- [ ] **Confirm the trading name.** The brief says "Shanker Medicos"; the shop sign in the supplied video reads "Shanker Chemists & Druggists". Use the name on the drug licence and Google Business Profile everywhere. The name can be changed in Business details; the logo wordmark files in `public/brand/` would need regenerating for a different name.
- [ ] Shop address (the video shows a "Dera Road" label but this was **not** used as the address)
- [ ] PIN code
- [ ] Phone number
- [ ] WhatsApp number (until set, Enquire buttons go to the contact page)
- [ ] Opening hours
- [ ] Google Maps share link
- [ ] Email, Instagram, Facebook (optional)

## Catalogue
- [ ] Review the ~40 starter products (`needs checking` filter in admin): confirm pack sizes, set prescription status (pharmacist), set availability only where checked, or delete.
- [ ] Import the store's real product list with the CSV template.
- [ ] Replace illustrations with real product photos where possible.
- [ ] Confirm the homepage "featured" products.

## Content reviews
- [ ] Native-speaker review of Hindi (`src/i18n/hi.ts`) and Punjabi (`src/i18n/pa.ts`) interface text and category names.
- [ ] Lawyer review of the Privacy Policy and Terms of Use (Digital Personal Data Protection Act 2023; Drugs and Cosmetics Act 1940/Rules; jurisdiction).
- [ ] Confirm the store is comfortable with the trust statements on the homepage (none claim awards, years, certifications or credentials).
- [ ] Confirm permission to use the storefront video on the website (it is the file supplied for this project).

## Accounts and deployment (see docs/DEPLOYMENT.md)
- [ ] Supabase project, migration run, sign-ups disabled, staff accounts created and added to `admin_users`
- [ ] Vercel project with environment variables
- [ ] Domain and DNS; `NEXT_PUBLIC_SITE_URL` updated
- [ ] Search Console verified, sitemap submitted
- [ ] Google Business Profile claimed with identical name, address and phone

## Verification on the live site
- [ ] Lighthouse (mobile and desktop): targets Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+. Record the real scores.
- [ ] Test on a real iPhone (Safari) and Android phone: WhatsApp buttons open the app with the message.
- [ ] Rich Results Test on the homepage and a product page.
- [ ] Sign in to admin from the shop computer; staff walkthrough of the admin manual.
