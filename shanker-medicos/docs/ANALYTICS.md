# Analytics (Admin → Analytics)

The website measures itself. It doesn't need a Google account and works from day one, alongside GA4/Meta Pixel if you add them later (docs/MARKETING.md).

## What it shows

| Block | Question it answers |
|---|---|
| **Visits, WhatsApp enquiries, Calls, Directions, Club sign-ups, Enquiry rate**, each vs the previous period | Is the website bringing customers? |
| **Visits per day** (hover for the exact day) | Did an ad, a festival or a post move traffic? |
| **Enquiries per day** by WhatsApp / call / directions | Are visits turning into contact? |
| **From visit to enquiry** funnel | Where people drop off |
| **Where visitors come from** (source / medium / campaign, with enquiries, sign-ups, enquiry rate) | Which ad or channel is worth the money |
| **Searched but not found** | Medicines people want that aren't in the catalogue: stock them or list them |
| **Top searches**, **Most enquired products** | What to feature, promote and keep in stock |
| **Which buttons get enquiries** | Which page elements work |
| **Devices**, **Language**, **Most viewed pages** | Who the customers are and what they read |

Ranges: last 7, 30 or 90 days. Every chart has **View as table** for exact numbers.

## How it works (privacy)

- Each page view and tap is sent to `/api/collect` on your own site. Nothing goes to a third party.
- **No cookies, no names, phone numbers, emails or IP addresses are stored.** A visitor is a code made from a secret, the date, the IP and the browser, which changes every day, so it can't follow anyone over time. That's why the dashboard counts **visits** (one person on one day) rather than "unique people".
- Search engines and bots, link-preview robots, Lighthouse and the admin pages are not counted.
- Set `ANALYTICS_SALT` (any long random text) in production so the daily codes can't be guessed.
- Storage: the `events` table in Supabase (only admins can read it; the public can only add events through `log_event()`), or `data/events.ndjson` in development mode. Keep about 13 months: see the comment at the end of `supabase/migrations/20261120000003_companies_analytics.sql`.

## Events

`pageview`, `whatsapp_click`, `call_click`, `directions_click`, `offer_reveal`, `sign_up`, `search` (term + number of results), `view_item` (product). Ad attribution comes from the first page of the visit: `utm_source`, `utm_medium`, `utm_campaign`, or Google/Facebook click IDs, or the referring site.

## Demo data (the prototype)

`npm run demo:analytics` fills the **development** store with 60 days of realistic, clearly labelled demo events. The dashboard shows a yellow "Demo data" banner with a **Clear demo data** button. It refuses to run when Supabase is configured.

## When traffic grows

The dashboard reads raw events and adds them up in the app, which is fine up to roughly 200,000 events per period. Beyond that, add a daily roll-up table in Supabase (one row per day × type × source) and point the dashboard at it.
