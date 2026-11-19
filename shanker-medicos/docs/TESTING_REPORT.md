# Testing report

Date: 19 November 2026 · Build: Next.js 16.4.6 production build · Data mode: development (local store). Supabase was **not** available (no credentials were provided), so the Supabase code path was verified at the database level only (see §3).

## Summary

| Suite | Command | Result |
|---|---|---|
| Lint | `npm run lint` | clean |
| Types | `npm run typecheck` | clean |
| Unit tests | `npm run test:unit` | **27 / 27 passed** |
| Database (migration + RLS) | `npm run db:verify` | **24 / 24 checks passed** |
| End-to-end, real browsers | `npm run test:e2e` | **52 / 52 passed** |
| Lighthouse (local, indicative) | see §5 | Accessibility, Best Practices, SEO: 100 on all pages tested; Performance 100 desktop, 89–93 mobile |

Raw e2e results: `tests/e2e/last-run.json`.

## 1. Unit tests (27)
WhatsApp links (number normalisation, URL encoding, the exact message template from the brief, Hindi/Punjabi messages keep brand names), search (case-insensitive, product/brand/generic-name, multi-word, ranking, category filter including sub-categories, brand filter, A–Z/Z–A, pagination and page clamping, unpublished items never returned), suggestions, slugs, PostgREST-safe queries, duplicate keys, zod validation of products/settings/CSV rows, dictionary completeness (every English key exists in Hindi and Punjabi, correct scripts), category names in three languages, and the seed catalogue's honesty (no stock or prescription claims).

## 2. End-to-end tests (52)
Run against a fresh production build with a throwaway data folder, in headless Chromium.

**Routing and languages**: `/` → `/en`; all 10 page types × 3 languages return 200 (30 pages); localised 404s; `<html lang>` = en-IN / hi-IN / pa-IN; Devanagari and Gurmukhi render with the Noto fonts actually loaded; the language switcher keeps the current page and query, and the choice is remembered on the next visit; brand names stay untranslated.

**Catalogue**: typeahead suggestions; keyboard selection; case-insensitive, brand and generic-name search; no-results page; category filter auto-submits and includes sub-categories; brand filter with Z–A sort; pagination (24 per page); homepage category tiles open working filtered pages.

**WhatsApp**: with no number configured there are no `wa.me` links (buttons fall back to the contact page); after the number is saved in admin, product links go to `wa.me/<number>` with the brief's message, correctly encoded, opening in a new tab; Punjabi pages produce a Punjabi message; floating button present. Nothing is sent automatically (wa.me only opens a draft).

**Admin**: login required (redirect); wrong password rejected; login works; session cookie is httpOnly, SameSite=Lax, scoped to `/admin`, and a tampered cookie is rejected; settings validation errors shown; settings save and appear on the site; create a product **with an image upload**; it is searchable by generic name and the image is served; duplicate product blocked; edit; hide/publish (hidden product returns 404 and leaves listings); categories added in three languages, reordered and deleted; a category with products cannot be deleted; **CSV import**: column auto-mapping from non-standard headers, preview counts (3 new / 1 duplicate / 2 errors), import summary, row-numbered errors, downloadable error report, quoted CSV fields; imported products live; delete product; logout.

**SEO**: every page in every language has a unique title, a description, a self-canonical URL, hreflang alternates (en-IN, hi-IN, pa-IN, x-default) and an Open Graph image; JSON-LD Pharmacy, BreadcrumbList and Product validate as JSON and contain no ratings or reviews; sitemap.xml (192 URLs with alternates); robots.txt disallows `/admin` and `/api/`; search/filter pages are `noindex`; all images have alt text; one `<h1>` per page; **no broken internal links** (183 unique links crawled across all locales).

**Security**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy on every page; no `X-Powered-By`; admin `noindex`; the media route rejects path traversal and non-image names; **no secrets in client JavaScript** (built static files scanned for the session secret and admin password); login rate limiting triggers after repeated failures.

**Responsive**: no horizontal overflow on 7 key pages at Pixel 7 (Android Chrome), iPhone 13 viewport (Safari profile, rendered with Chromium), iPad Mini, 1440 px desktop and a 320 px small phone; mobile drawer opens, navigates and closes; persistent mobile search works; primary buttons ≥ 40 px tall; no JavaScript errors in the console.

Issues found and fixed during testing: a race when two requests created the local store at once; `<dl>` markup and heading order flagged by accessibility audits; text contrast (see §5); a component defined during render and two state updates inside effects (lint); file tracing that would have bundled the whole project into the server output; ISR state from a previous run leaking into tests (the suite now always rebuilds).

## 3. Database (24 checks, real PostgreSQL via PGlite)
The migration applies cleanly and is re-runnable; `seed.sql` loads. As **anon**: sees only published products, reads categories and settings, cannot insert/update anything or list admins. As a **signed-in non-admin**: cannot insert, update or delete products/categories, cannot make themselves admin, cannot upload images. As an **admin**: sees unpublished products, can insert, update settings and upload images. Constraints: duplicate name+brand+pack rejected (case-insensitive), invalid enum values rejected, categories with children/products cannot be deleted. The trigram index serves `ILIKE` search.

Supabase's `auth` and `storage` schemas were represented by minimal stand-ins (`auth.uid()` from the JWT claim, `storage.objects` with RLS), matching how Supabase evaluates policies.

## 4. Not tested here (needs the owner's accounts or devices)
- The Supabase data path end to end (sign-in through Supabase Auth, uploads to Supabase Storage, queries through PostgREST). The code mirrors the tested local path and the database rules are verified, but it must be smoke-tested once the project exists: sign in, add a product with a photo, edit settings, import the CSV template.
- Real iPhone Safari (WebKit) and real Android devices. The iPhone test used an iPhone 13 viewport and user agent in Chromium.
- WhatsApp opening the native app on a phone.
- Lighthouse on the deployed domain over a real network.

## 5. Lighthouse (local, indicative only)
Lighthouse 12.8 against `next start` on this machine. Mobile uses Lighthouse's simulated slow 4G and 4× CPU slowdown. These are **not production results**; re-measure on the live domain.

| Page | Mobile (P / A / BP / SEO) | Desktop (P / A / BP / SEO) |
|---|---|---|
| /en | 89 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /pa | 91 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /en/products | 93 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /en/products/dolo-650 | 92 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /en/categories/medicines | 92 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| /hi/contact | 90 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Targets: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+. All targets are met on desktop. On simulated mobile, the homepage measured 89 Performance (one point under target); every other page met all four.


Fixes made from these audits: text contrast (the brief's secondary text `#6D7971` measured 4.37:1 on ivory, below WCAG AA; it is now `#626E66`, 5.1:1, visually almost identical); the decorative hero wordmark is drawn as SVG paths so it doesn't wait for the web font; CSS is inlined to remove a render-blocking request; the hero headline no longer fades in. The remaining mobile LCP time is the headline waiting for its web font under simulated throttling.
