import { catalogue } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { STOCK } from "@/lib/stock";
import { GENERIC_COMPANIES, GENERIC_OFFER_PERCENT } from "@/lib/generics";
import { HOURS, fmtTime } from "@/lib/hours";
import { LOCALES } from "@/i18n/config";

export const revalidate = 3600;

/**
 * /llms.txt: a plain-language fact sheet for AI assistants and answer
 * engines (ChatGPT, Gemini, Perplexity, Google AI Overviews), built from the
 * same data as the website so it never drifts. Facts only, as given by the
 * owner or shown on the shop's signboard.
 */
export async function GET() {
  const [s, companies] = await Promise.all([catalogue.getSettings(), catalogue.listCompanies()]);
  const addr = [s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ");
  const w = `${fmtTime(HOURS.winter.open)} – ${fmtTime(HOURS.winter.close)}`;
  const su = `${fmtTime(HOURS.summer.open)} – ${fmtTime(HOURS.summer.close)}`;
  const page = (p: string) => LOCALES.map((l) => `${SITE_URL}/${l}${p}`).join(" · ");
  const lines = [
    "# Shanker Medicos",
    "",
    `> Wholesale and retail chemist (pharmacy) on Dera Road, Batala, Punjab ${s.postal_code}, India. Also known as Shanker Chemists & Druggists (the name on the signboard), शंकर मेडिकोज़ (Hindi) and ਸ਼ੰਕਰ ਮੈਡੀਕੋਜ਼ (Punjabi).`,
    "",
    "## Key facts",
    `- Address: ${addr}, India`,
    `- Phone and WhatsApp: ${s.phone} (the only number for the shop)`,
    `- Opening hours: Monday to Saturday, ${w} in winter (October to March) and ${su} in summer (April to September). Closed on Sunday.`,
    "- Languages spoken: English, Hindi, Punjabi",
    s.gstin ? `- GSTIN: ${s.gstin}` : "",
    `- Website: ${SITE_URL}`,
    s.maps_url ? `- Google Maps: ${s.maps_url}` : "",
    "",
    "## How to order",
    `- Send a photo of the prescription, or type the medicine names, on WhatsApp to ${s.phone}. The shop replies with availability and price; the customer collects at the counter on Dera Road.`,
    "- The website does not take payments or online orders.",
    "- Prescription medicines are given only against a valid prescription from a registered doctor; a pharmacist checks every prescription.",
    "- The shop does not give dosage or medical advice online.",
    "",
    "## What the shop stocks",
    ...STOCK.map((k) => `- ${k.name.en}: ${k.line.en}`),
    "",
    "## Generic medicines",
    `- A wide range of generic medicines. ${GENERIC_OFFER_PERCENT}% off selected generic medicines chosen by the store (ask which items qualify).`,
    `- Generic makers: ${GENERIC_COMPANIES.join(", ")}.`,
    "",
    "## Offers",
    `- ${GENERIC_OFFER_PERCENT}% off selected generic medicines.`,
    s.offer_enabled ? `- ${s.offer_percent}% off selected medicines on bills above ₹${s.offer_min_amount.toLocaleString("en-IN")} (code ${s.offer_code}), at the counter and on WhatsApp orders.` : "",
    s.club_enabled && s.club_extra_percent ? `- Shanker Club: free to join on WhatsApp; an extra ${s.club_extra_percent}% off the first purchase.` : "",
    "- The store may change or end offers at any time.",
    "",
    `## Companies (${companies.length})`,
    `Medicines from these companies: ${companies.map((c) => c.name).join(", ")}.`,
    "",
    "## Pages (English · Hindi · Punjabi)",
    `- Home: ${page("")}`,
    `- What we stock: ${page("/products")}`,
    `- Companies: ${page("/companies")}`,
    `- Offers: ${page("/offers")}`,
    `- Questions and answers: ${page("/faq")}`,
    `- About: ${page("/about")}`,
    `- Visit / contact: ${page("/contact")}`,
    "",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === ""));
  return new Response(lines.filter((l) => l !== null).join("\n"), {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
