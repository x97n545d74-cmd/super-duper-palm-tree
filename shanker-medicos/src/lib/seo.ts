import type { Metadata } from "next";
import { SITE_URL } from "./env";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { BusinessSettings } from "./types";
import { HOURS, seasonAt } from "./hours";
import { STOCK } from "./stock";
import { GENERIC_COMPANIES, GENERIC_OFFER_PERCENT } from "./generics";

/** Canonical + hreflang alternates for a path without the locale prefix (e.g. "/products"). */
export function alternates(locale: Locale, path: string): Metadata["alternates"] {
  const p = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[LOCALE_META[l].htmlLang] = `${SITE_URL}/${l}${p}`;
  languages["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${p}`;
  return { canonical: `${SITE_URL}/${locale}${p}`, languages };
}

export function pageMeta(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string | null;
  noindex?: boolean;
}): Metadata {
  const url = `${SITE_URL}/${opts.locale}${opts.path === "/" ? "" : opts.path}`;
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: alternates(opts.locale, opts.path),
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      url,
      title: opts.title,
      description: opts.description,
      siteName: "Shanker Medicos",
      locale: LOCALE_META[opts.locale].ogLocale,
      images: [opts.image ? { url: opts.image } : { url: "/brand/og-default.jpg", width: 1200, height: 630, alt: "Shanker Medicos, Batala" }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}

/**
 * LocalBusiness / Pharmacy schema built only from verified, filled-in settings.
 * Empty fields are omitted, never guessed. No ratings or reviews.
 */
export function pharmacySchema(s: BusinessSettings, locale: Locale) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Pharmacy",
    "@id": `${SITE_URL}/#pharmacy`,
    name: s.business_name || "Shanker Medicos",
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/brand/logo.svg`,
    image: `${SITE_URL}/brand/og-default.jpg`,
    address: {
      "@type": "PostalAddress",
      ...(s.address ? { streetAddress: s.address } : {}),
      addressLocality: s.city || "Batala",
      addressRegion: s.state || "Punjab",
      ...(s.postal_code ? { postalCode: s.postal_code } : {}),
      addressCountry: "IN",
    },
    areaServed: { "@type": "City", name: s.city || "Batala" },
  };
  // Entity details for search and AI assistants (all from the owner or the shop's own signboard)
  data.alternateName = ["Shanker Chemists & Druggists", "शंकर मेडिकोज़", "ਸ਼ੰਕਰ ਮੈਡੀਕੋਜ਼"];
  data.description =
    "Wholesale and retail chemist on Dera Road, Batala, Punjab. Medicines from 100+ companies, a wide range of generic medicines with 30% off selected generics, Ayurvedic and diabetes care. Prescriptions and orders on WhatsApp 98155 52404.";
  data.currenciesAccepted = "INR";
  data.knowsLanguage = ["en", "hi", "pa"];
  data.knowsAbout = ["Generic medicines", "Branded medicines", "Ayurvedic medicines", "Diabetes care", "Surgical and first aid supplies", "Baby and mother care", ...GENERIC_COMPANIES.slice(0, 8)];
  data.hasOfferCatalog = {
    "@type": "OfferCatalog",
    name: "What we stock",
    itemListElement: STOCK.map((k) => ({ "@type": "OfferCatalog", name: k.name.en, description: k.line.en })),
  };
  data.makesOffer = [
    { "@type": "Offer", name: `${GENERIC_OFFER_PERCENT}% off selected generic medicines`, description: "On selected generic medicines chosen by the store; ask which ones qualify." },
    ...(s.offer_enabled ? [{ "@type": "Offer", name: `${s.offer_percent}% off selected medicines on bills above ₹${s.offer_min_amount}`, description: `Show code ${s.offer_code} at the counter or in a WhatsApp order.` }] : []),
  ];
  if (s.phone) data.telephone = s.phone;
  if (s.email) data.email = s.email;
  if (s.gstin) data.taxID = s.gstin;
  // Hours for Google (current season, Monday–Saturday; src/lib/hours.ts)
  const h = HOURS[seasonAt()];
  const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  data.openingHoursSpecification = [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: hhmm(h.open), closes: hhmm(h.close) },
  ];
  if (s.maps_url) data.hasMap = s.maps_url;
  const placeLinks = [s.maps_url].filter(Boolean);
  const same = [...placeLinks, s.instagram_url, s.facebook_url].filter(Boolean);
  if (same.length) data.sameAs = same;
  return data;
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${SITE_URL}${it.url}` })),
  };
}

/** The website itself, tied to the pharmacy, in three languages. */
export function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Shanker Medicos",
    alternateName: ["Shanker Chemists & Druggists", "शंकर मेडिकोज़", "ਸ਼ੰਕਰ ਮੈਡੀਕੋਜ਼"],
    url: `${SITE_URL}/${locale}`,
    inLanguage: LOCALES.map((l) => LOCALE_META[l].htmlLang),
    publisher: { "@id": `${SITE_URL}/#pharmacy` },
  };
}

/** Safe JSON-LD serialisation (prevents </script> injection). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
