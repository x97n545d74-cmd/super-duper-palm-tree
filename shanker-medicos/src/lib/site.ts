import "server-only";
import { notFound } from "next/navigation";
import { catalogue } from "./data";
import { getDictionary, isLocale, type Locale } from "@/i18n";
import { generalMessage, waLink } from "./whatsapp";

/** Validates the [locale] param and loads what every public page needs. */
export async function siteContext(rawLocale: string) {
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const [settings, categories] = await Promise.all([catalogue.getSettings(), catalogue.listCategories()]);
  const t = getDictionary(locale);
  return {
    locale,
    t,
    settings,
    categories,
    waGeneral: waLink(settings.whatsapp, generalMessage(locale)),
  };
}

export type SiteContext = Awaited<ReturnType<typeof siteContext>>;
