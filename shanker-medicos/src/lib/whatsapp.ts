import { normalizePhone } from "./settings";
import { fmt, getDictionary } from "@/i18n";

/**
 * Builds a wa.me click-to-chat link. It only opens WhatsApp with a prefilled
 * draft; the customer decides whether to send it. Returns null when no valid
 * number is configured, so callers can hide or disable the button.
 */
export function waLink(number: string, message: string): string | null {
  const n = normalizePhone(number);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function productMessage(locale: string, p: { name: string; brand: string; pack_size: string }): string {
  const t = getDictionary(locale);
  return fmt(t.whatsapp.product, { name: p.name, brand: p.brand || "-", pack: p.pack_size || "-" });
}

export function generalMessage(locale: string): string {
  return getDictionary(locale).whatsapp.general;
}

export function searchMessage(locale: string, q: string): string {
  return fmt(getDictionary(locale).whatsapp.search, { q: q.slice(0, 80) });
}
