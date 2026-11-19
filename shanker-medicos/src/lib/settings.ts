import type { BusinessSettings } from "./types";

/** Settings the public site needs before launch. Empty ones are flagged in admin and hidden on the site. */
export const REQUIRED_SETTINGS: (keyof BusinessSettings)[] = ["address", "phone", "whatsapp", "opening_hours", "maps_url"];

export function missingSettings(s: BusinessSettings): (keyof BusinessSettings)[] {
  return REQUIRED_SETTINGS.filter((k) => !String(s[k] ?? "").trim());
}

/** Digits only, with India country code added to 10-digit numbers. Returns "" if unusable. */
export function normalizePhone(raw: string): string {
  const digits = (raw || "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return "";
}

export function telHref(raw: string): string | null {
  const n = normalizePhone(raw);
  return n ? `tel:+${n}` : null;
}
