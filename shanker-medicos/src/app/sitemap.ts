import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { LOCALES, LOCALE_META } from "@/i18n/config";

export const revalidate = 3600;

function entry(path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, `${SITE_URL}/${l}${path}`]));
  return LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency: "weekly" as const,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...entry("", undefined, 1),
    ...entry("/products", undefined, 0.9),
    ...entry("/companies", undefined, 0.7),
    ...entry("/offers", undefined, 0.8),
    ...entry("/about", undefined, 0.5),
    ...entry("/contact", undefined, 0.8),
    ...entry("/privacy", undefined, 0.2),
    ...entry("/terms", undefined, 0.2),
  ];
}
