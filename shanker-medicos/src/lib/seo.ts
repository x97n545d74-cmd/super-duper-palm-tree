import type { Metadata } from "next";
import { SITE_URL } from "./env";
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import type { BusinessSettings } from "./types";
import { HOURS, seasonAt } from "./hours";

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
  const same = [s.instagram_url, s.facebook_url].filter(Boolean);
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

/** Safe JSON-LD serialisation (prevents </script> injection). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
