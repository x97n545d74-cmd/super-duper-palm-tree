# Marketing setup: SEO, performance marketing and automation

What the site already does, what you switch on with IDs, and what's ready for the next strategy session.

## 1. What customers see

| Element | Where | Purpose |
|---|---|---|
| **Offer bar** "12% off bills above ₹1,000. Tap for your code →" | Top of every page | Drives traffic to the offer page |
| **Tap-to-reveal code** (`SHANKER12`) | Homepage, `/offers` | The "clue": customers reveal it, show it at the counter or send it on WhatsApp. Reveals are tracked. |
| **Shanker Club** sign-up | Homepage, `/offers` | Collects mobile number (required), name and email (optional), with explicit consent. Gives a personal member code (e.g. `SM-7KQ2P`) for the extra discount. |
| **Send prescription / medicine list on WhatsApp** | Homepage, product pages for medicines, `/offers` | Opens WhatsApp to **+91 98155 52404** with a ready-written message; the customer attaches the photo |
| **Companies page** `/companies` | Nav, footer, homepage strip, product pages | 107 Indian and multinational pharma companies with logo slots (bulk upload in admin), each linked to a catalogue search. Strong for "<company> medicine Batala" searches. |
| **FAQ** with FAQPage schema | Homepage, `/offers` | Answers common questions; can appear as rich results in Google |
| **Get directions** | Homepage, contact, footer | Opens your Google Maps listing (`maps.app.goo.gl/jgHwJrpiNSSzED4q9`) |

Change the offer (%, minimum bill, code, on/off) and the extra member % in **Admin → Business details**. With the extra member % at 0, the site says "extra discount" without a number.

## 2. Ad campaign landing page

Send ads to **`/en/offers`**, **`/hi/offers`** or **`/pa/offers`** (match the ad's language), with UTM tags:

```
https://your-domain/pa/offers?utm_source=facebook&utm_medium=paid&utm_campaign=diwali_12pc
https://your-domain/hi/offers?utm_source=google&utm_medium=cpc&utm_campaign=batala_pharmacy
https://your-domain/en?utm_source=instagram&utm_medium=bio&utm_campaign=profile
```

The site remembers the **first** source of each visitor (UTM tags, or Google/Facebook click IDs, or the referring site) and saves it with their Shanker Club sign-up. **Admin → Club members** shows which campaign each member came from.

## 3. Built-in analytics

**Admin → Analytics** works without any accounts: visits, enquiries by type, sources and campaigns with enquiry rates, missed searches, top products and buttons. Cookieless and anonymous. Details: docs/ANALYTICS.md.

## 3b. Tracking for ad platforms (GA4, Google Tag Manager, Meta Pixel)

Set any of these in Vercel → Environment Variables and redeploy:

| Variable | Example | Get it from |
|---|---|---|
| `NEXT_PUBLIC_GA4_ID` | `G-ABC123XYZ` | Google Analytics → Admin → Data streams |
| `NEXT_PUBLIC_GTM_ID` | `GTM-ABC1234` | Google Tag Manager → container ID (use GTM *or* GA4 directly, not both for the same property) |
| `NEXT_PUBLIC_META_PIXEL_ID` | `1234567890` | Meta Events Manager → Data sources |

Nothing loads until the visitor taps **Accept** on the cookie banner. If no IDs are set, there is no banner.

**Events sent** (GA4 name → Meta standard event):

| Event | When | Meta |
|---|---|---|
| `whatsapp_click` | Any WhatsApp button (`placement` = which button, `item_name` = product) | Contact |
| `call_click` | Any phone link | Contact |
| `directions_click` | Google Maps link | FindLocation |
| `offer_reveal` | Offer code revealed | (custom) |
| `sign_up` + `generate_lead` | New Shanker Club member | CompleteRegistration + Lead |
| `search` | Catalogue search (`search_term`, `results`) | Search |
| `view_item` | Product page | ViewContent |

In GA4, mark `whatsapp_click`, `call_click`, `directions_click` and `generate_lead` as **key events (conversions)**. In Meta, optimise ads for **Lead** or **Contact**.

## 4. Automation (sign-ups → WhatsApp / email / CRM)

Set `AUTOMATION_WEBHOOK_URL` (https) and `AUTOMATION_WEBHOOK_SECRET`. Every sign-up is POSTed as:

```json
{
  "event": "member.joined",            // or "member.rejoined"
  "sent_at": "2026-11-20T10:15:00.000Z",
  "data": {
    "code": "SM-7KQ2P", "name": "Asha", "phone": "+919815500001", "email": "asha@example.com",
    "locale": "pa", "source": "offers_page",
    "utm_source": "facebook", "utm_medium": "paid", "utm_campaign": "diwali_12pc",
    "club_extra_percent": 0
  }
}
```

Header `X-Shanker-Signature: sha256=<HMAC-SHA256 of the raw body with the secret>`: check it on the receiving side.

**Suggested first flow (n8n, Zapier or Make):** webhook → add row to Google Sheet → send welcome email with the member code (Gmail) → notify the store's phone. Automated WhatsApp messages need the **WhatsApp Business Platform** (Meta-approved message templates; per-conversation fees). Until then, members can tap "Save my code on WhatsApp", which starts a chat with the store, and staff can label them in the WhatsApp Business app.

**Consent rules (DPDP Act 2023):** only message people who ticked the consent box (everyone in Club members did), honour STOP immediately, and delete a member from **Admin → Club members** when they ask. Each record stores the exact consent wording and time.

## 5. SEO elements in place

- Unique, localised titles and descriptions; canonical URLs; `hreflang` for English, Hindi, Punjabi
- Sitemap with all pages, categories, products, `/companies` and `/offers` in three languages; robots.txt
- Structured data: Pharmacy (LocalBusiness), BreadcrumbList, Product, FAQPage, Offer. No invented ratings.
- Local keywords in natural copy ("pharmacy in Batala", "medical store in Batala"), company pages for brand searches, fast pages (Lighthouse 100 desktop)
- Open Graph images for WhatsApp/Facebook link previews

## 6. Next steps to strategise

1. **Google Business Profile**: claim it, add photos, hours, products and posts; link the website and the `/offers` page. This is the biggest local lever.
2. **Reviews**: ask happy customers for Google reviews (never buy or fake them).
3. **Content**: short health-literacy articles in Punjabi/Hindi (e.g. "how to read a medicine label") — no treatment claims.
4. **Ads**: Meta lead ads in Punjabi to `/pa/offers`, radius ~10 km around Batala; Google Search on "medical store Batala".
5. **Retention**: monthly WhatsApp/email offer to Club members; refill reminders only with explicit opt-in.
6. **Measure**: weekly look at GA4 key events and Club sign-ups by `utm_campaign`.

## Legal notes

Advertising rules apply to medicines in India: don't promote specific prescription (Schedule H/H1/X) drugs to the public or make cure claims (Drugs and Magic Remedies Act). A store-wide bill discount is fine; keep offers on the bill, not on named prescription medicines. Keep claims like "we have every medicine" out of ads unless the store can always fulfil them.
