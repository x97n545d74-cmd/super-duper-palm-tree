# Shanker Medicos: digital pharmacy catalogue

The website for **Shanker Medicos**, a retail pharmacy in Batala, Punjab. Customers browse and search the catalogue in English, Hindi or Punjabi, send prescriptions or medicine lists on WhatsApp (+91 98155 52404), reveal the store offer code, and join Shanker Club for an extra discount. Staff manage everything from `/admin`.

It is a **catalogue and enquiry site, not an online pharmacy**: there is no cart, no payment, no prescription upload and no delivery.

## Quick start (development mode, no accounts needed)

```bash
npm install
cp .env.example .env.local      # then set ADMIN_DEV_EMAIL, ADMIN_DEV_PASSWORD, SESSION_SECRET
npm run dev                      # http://localhost:3000  (admin: /admin)
```

With no Supabase keys, the app runs in **development mode**: data lives in `data/store.json` (created from the starter catalogue on first run) and uploads in `data/uploads/`. `npm run reset:local` starts over.

**Publishing:** the site runs on Vercel in publish-only mode (no database, nothing to manage); the owner's steps are in **[docs/GO_LIVE.md](docs/GO_LIVE.md)** and the marketing kit is in **[marketing/](marketing/README.md)**. For the optional Supabase setup (admin, sign-ups, built-in analytics): technical details are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). The whole database setup is one file: `supabase/setup-all.sql`.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (PostgreSQL, Auth, Storage, Row Level Security) · Vercel. Fonts are self-hosted: Manrope, Inter, Noto Sans Devanagari, Noto Sans Gurmukhi.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run test:unit` | Unit tests (search, WhatsApp, validation, i18n, club, offer) |
| `npm run test:publish` | Browser tests of publish-only mode (how it runs on Vercel without a database) |
| `npm run test:e2e` | Browser tests against a fresh production build (builds first) |
| `npm run db:verify` | Applies the migrations to an in-process PostgreSQL and checks every RLS rule |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the starter catalogue |
| `npm run demo:analytics` | Development only: fills Admin → Analytics with 60 days of labelled demo data |

## Documents

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code is organised and why
- [docs/ADMIN_MANUAL.md](docs/ADMIN_MANUAL.md): guide for pharmacy staff
- [docs/ANALYTICS.md](docs/ANALYTICS.md): the built-in analytics dashboard
- [docs/MARKETING.md](docs/MARKETING.md): offer, Shanker Club, tracking (GA4/GTM/Meta), automation webhook, SEO, next steps
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Supabase, Vercel, domain, Google setup
- [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md): what was tested and the results
- [docs/COSTS.md](docs/COSTS.md): recurring costs
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): what must happen before going live
- [public/templates/shanker-products-template.csv](public/templates/shanker-products-template.csv): CSV import template
- `public/brand/`: logo (SVG, dark and light), mark, social avatar, cover, Open Graph image
