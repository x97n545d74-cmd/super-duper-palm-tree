export const LOCALES = ["en", "hi", "pa"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_META: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  en: { label: "English", short: "EN", htmlLang: "en-IN", ogLocale: "en_IN" },
  hi: { label: "हिन्दी", short: "हि", htmlLang: "hi-IN", ogLocale: "hi_IN" },
  pa: { label: "ਪੰਜਾਬੀ", short: "ਪੰ", htmlLang: "pa-IN", ogLocale: "pa_IN" },
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}
