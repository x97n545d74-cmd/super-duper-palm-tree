# Architecture

## Shape of the app

```
src/
  proxy.ts                 locale redirects + language cookie; refreshes the Supabase session on /admin
  app/
    [locale]/              public site (root layout per language: <html lang>, header, footer, JSON-LD)
      page.tsx             homepage sections A–J
      products/            catalogue + search (?q, category, brand, sort, page) and product pages
      categories/          category index and category pages (include sub-categories)
      about, contact, privacy, terms, not-found, [...rest] (localised 404)
    admin/                 separate root layout, noindex
      login/               sign-in
      (panel)/             protected by requireAdmin(): overview, products, categories, import, settings
      actions.ts           every write: assertAdmin() → zod validation → repository → cache invalidation
    api/search/suggest     typeahead suggestions (rate-limited)
    api/media/[name]       serves development-mode uploads
    sitemap.ts, robots.ts, manifest.ts, icon.svg, apple-icon.png
  i18n/                    en.ts (source), hi.ts, pa.ts: same keys, enforced by TypeScript and a unit test
  lib/
    data/                  repository interfaces + two implementations (local JSON / Supabase), shared query logic
    validation.ts          zod schemas used by server actions and the CSV preview
    auth.ts                admin sessions (Supabase Auth, or signed cookie in development mode)
    whatsapp.ts            wa.me link + message builders
    seo.ts                 metadata, hreflang alternates, Pharmacy/Breadcrumb JSON-LD
  components/              brand (logo, illustrations), site (public UI), admin (forms, import wizard)
supabase/migrations/       schema, indexes, RLS, storage bucket + policies
supabase/seed.sql          starter catalogue (generated)
```

## Key decisions

**Two data modes, one interface.** `lib/data/repo.ts` defines `PublicRepo` (read-only, published data only) and `AdminRepo`. With Supabase env vars set, the Supabase implementation is used; otherwise a JSON file store. The search ranking (`lib/data/query.ts`) is shared, so results are the same in both. Development mode exists so the site can be run and reviewed before any accounts exist; it is not for production (Vercel's filesystem is read-only).

**Security is enforced in the database.** The browser and server only ever use the public anon key. Row Level Security lets anyone read categories, settings and *published* products; writes require the user's id to be in `admin_users`. A non-admin who signs in to Supabase can do nothing. `npm run db:verify` proves each rule against real PostgreSQL. Server actions also call `assertAdmin()` and validate with zod before touching data.

**Caching.** Public reads go through `unstable_cache` with the tag `catalogue` and a 5-minute lifetime. Every admin write calls `updateTag("catalogue")` and `revalidatePath("/", "layout")`, so staff see their change on the next page load. Cache Components (`cacheComponents`) is switched off on purpose: the classic model is simpler for a site where most pages read search params or cookies, and it is fully supported in Next.js 16.

**Internationalisation.** Locale is the first URL segment (`/en`, `/hi`, `/pa`). The proxy redirects `/` and locale-less paths to the remembered language (cookie `NEXT_LOCALE`) or English. Each locale has its own `<html lang>`, canonical URL and `hreflang` alternates. Interface strings are translated; product names and brands never are. Product descriptions are entered by staff in English. Category names have English, Hindi and Punjabi fields in the database.

**Honest by default.** Nothing on the site states a fact the store hasn't entered: empty business details show "To be added" and are omitted from structured data; availability defaults to "Ask for availability"; prescription status defaults to "Ask the pharmacist"; there are no ratings, reviews, awards or years in business. Product images default to unbranded illustrations labelled as representative.

**WhatsApp.** `wa.me/<number>?text=<encoded message>` opens a draft; the customer chooses to send. Without a configured number, enquiry buttons fall back to the contact page instead of producing a broken link.

**Rate limiting.** In-memory, per server instance (login: 10 per IP and 5 per email per 15 minutes; suggestions: 90 per minute). Good enough for a small site; for strict limits across Vercel instances, swap `lib/rate-limit.ts` to Upstash Redis.

## Design system

Tokens live only in `src/app/globals.css` (`@theme`): colours (forest `#123F2B`, emerald `#087A4B`, ivory `#FAFBF8`, mint `#EAF3EC`, ink `#1C2721`/`#6D7971`, line `#E5EBE6`), a fluid type scale (`text-display`, `text-h1`–`h3`, `eyebrow`), radii (control 10, card 14, panel 22, chip), shadows (hair, lift, float), spacing (`gutter`, `section`) and breakpoints. Components use these utilities only. Indic scripts get extra line height and no letter-spacing.

The logo mark is a capsule split by an S-curve (pharmacy + the S of Shanker). `public/brand/logo.svg` has the wordmark converted to outlines, so it renders the same everywhere.

## Marketing layer (added 20 Nov 2026)

- **Offer and Shanker Club settings** live in `business_settings` (migration `…0002_marketing.sql`) and are edited in Admin → Business details.
- **Members** (`members` table): the public can only add themselves through the `join_club()` SECURITY DEFINER function (validated phone, consent text required, same phone → same code). Only admins can read, export or delete. The server action `src/app/[locale]/actions.ts` adds a honeypot and rate limit, stores the exact consent wording with a timestamp, and fires the webhook after the response (`after()`), so a slow automation never delays the visitor.
- **Automation**: `src/lib/automation.ts` POSTs signed JSON (`X-Shanker-Signature`, HMAC-SHA256) to `AUTOMATION_WEBHOOK_URL`.
- **Tracking**: `src/components/marketing/ClickTracker.tsx` records clicks on WhatsApp/phone/Maps links and `data-track` elements, plus first-touch UTM attribution in `localStorage`. `Analytics.tsx` shows the cookie banner and loads GTM/GA4/Meta Pixel only after consent. Event names are listed in docs/MARKETING.md.
- **Forms keep their values on errors**: React 19 resets `<form action>` after every submission, so all forms submit through `keepValues()` (`src/lib/use-keep-form.ts`) instead.
