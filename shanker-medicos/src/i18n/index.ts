import en, { type Dictionary } from "./en";
import hi from "./hi";
import pa from "./pa";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import type { Category } from "@/lib/types";

const DICTS: Record<Locale, Dictionary> = { en, hi, pa };

export function getDictionary(locale: string): Dictionary {
  return DICTS[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/** Replace {key} placeholders. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function categoryName(c: Pick<Category, "name_en" | "name_hi" | "name_pa">, locale: string): string {
  const v = locale === "hi" ? c.name_hi : locale === "pa" ? c.name_pa : c.name_en;
  return v?.trim() || c.name_en;
}

export * from "./config";
export type { Dictionary };
