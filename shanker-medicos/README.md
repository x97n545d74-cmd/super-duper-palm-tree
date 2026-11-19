# Shanker Medicos: digital pharmacy catalogue

The website for **Shanker Medicos**, a retail pharmacy in Batala, Punjab. Customers browse and search the catalogue in English, Hindi or Punjabi and ask the store about a product on WhatsApp. Staff manage everything from `/admin`.

It is a **catalogue and enquiry site, not an online pharmacy**: there is no cart, no payment, no prescription upload and no delivery.

## Quick start (development mode, no accounts needed)

```bash
npm install
cp .env.example .env.local      # then set ADMIN_DEV_EMAIL, ADMIN_DEV_PASSWORD, SESSION_SECRET
npm run dev                      # http://localhost:3000  (admin: /admin)
```

With no Supabase keys, the app runs in **development mode**: data lives in `data/store.json` (created from the starter catalogue on first run) and uploads in `data/uploads/`. `npm run reset:local` starts over.

For production (Supabase + Vercel), follow **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

## Stack

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (PostgreSQL, Auth, Storage, Row Level Security) · Vercel. Fonts are self-hosted: Manrope, Inter, Noto Sans Devanagari, Noto Sans Gurmukhi.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run test:unit` | 27 unit tests (search, WhatsApp, validation, i18n) |
| `npm run test:e2e` | 52 browser tests against the production build (run `npm run build` first) |
| `npm run db:verify` | Applies the migrations to an in-process PostgreSQL and checks every RLS rule |
| `npm run db:seed-sql` | Regenerates `supabase/seed.sql` from the starter catalogue |

## Documents

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code is organised and why
- [docs/ADMIN_MANUAL.md](docs/ADMIN_MANUAL.md): guide for pharmacy staff
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): Supabase, Vercel, domain, Google setup
- [docs/TESTING_REPORT.md](docs/TESTING_REPORT.md): what was tested and the results
- [docs/COSTS.md](docs/COSTS.md): recurring costs
- [docs/LAUNCH_CHECKLIST.md](docs/LAUNCH_CHECKLIST.md): what must happen before going live
- [public/templates/shanker-products-template.csv](public/templates/shanker-products-template.csv): CSV import template
- `public/brand/`: logo (SVG, dark and light), mark, social avatar, cover, Open Graph image
