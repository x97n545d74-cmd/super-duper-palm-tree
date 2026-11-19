// Generic medicines (owner, 19 Nov 2026): "a wide variety of generic medicines
// including Cipla generic, Leeford generic, Alkem, RP Biotech, and the other
// leading generic companies", with 30% off selected generic items.
// The owner's four come first; the rest are India's leading generic makers
// (all listed in src/lib/companies.ts). The store chooses which items qualify.

export const GENERIC_OFFER_PERCENT = 30;

/** Named by the owner. */
export const GENERIC_HIGHLIGHT = ["Cipla", "Leeford Healthcare", "Alkem Laboratories", "RP Biotech"];

/** Company names exactly as in COMPANIES. */
export const GENERIC_COMPANIES = [
  ...GENERIC_HIGHLIGHT,
  "Sun Pharmaceutical Industries",
  "Dr. Reddy's Laboratories",
  "Lupin",
  "Aurobindo Pharma",
  "Zydus Lifesciences",
  "Torrent Pharmaceuticals",
  "Mankind Pharma",
  "Intas Pharmaceuticals",
  "Glenmark Pharmaceuticals",
  "Macleods Pharmaceuticals",
  "Micro Labs",
  "Ipca Laboratories",
  "Emcure Pharmaceuticals",
  "Ajanta Pharma",
  "Alembic Pharmaceuticals",
  "Unichem Laboratories",
  "Medley Pharmaceuticals",
  "Aristo Pharmaceuticals",
  "Cadila Pharmaceuticals",
  "FDC Ltd",
];

export const isGenericMaker = (name: string) => GENERIC_COMPANIES.includes(name);

/** Short display name ("Leeford Healthcare" → "Leeford"). */
export const shortCo = (name: string) =>
  name.replace(/ (Ltd|Limited|Laboratories|Pharmaceuticals|Pharmaceutical Industries|Pharma India|Pharma|India|Lifesciences|Healthcare)$/i, "");
