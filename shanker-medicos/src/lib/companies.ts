// Pharmaceutical companies whose medicines are sold in India, shown on
// /[locale]/companies. The store states that it deals in branded (ethical)
// and generic medicines from across India; this list names companies only
// (no logos) and does not claim any specific product is in stock.
// The store should confirm or edit this list before launch.

export interface Company {
  name: string;
  /** search term used for the catalogue link (matches the manufacturer field) */
  q: string;
  /** therapy areas the company is widely known for (general, factual) */
  known?: string;
  type: "indian" | "multinational";
}

export const COMPANIES: Company[] = [
  { name: "Abbott India", q: "Abbott", type: "multinational", known: "Gastro, women's health, vitamins" },
  { name: "Ajanta Pharma", q: "Ajanta", type: "indian", known: "Cardiology, dermatology, ophthalmology" },
  { name: "Alembic Pharmaceuticals", q: "Alembic", type: "indian", known: "Anti-infectives, cardiology" },
  { name: "Alkem Laboratories", q: "Alkem", type: "indian", known: "Anti-infectives, gastro, pain" },
  { name: "Apex Laboratories", q: "Apex", type: "indian", known: "Nutrition, diabetes" },
  { name: "Aristo Pharmaceuticals", q: "Aristo", type: "indian", known: "Anti-infectives, pain" },
  { name: "AstraZeneca Pharma India", q: "AstraZeneca", type: "multinational", known: "Diabetes, cardiology, respiratory" },
  { name: "Aurobindo Pharma", q: "Aurobindo", type: "indian", known: "Generics" },
  { name: "Bayer", q: "Bayer", type: "multinational", known: "Women's health, cardiology" },
  { name: "Bharat Biotech", q: "Bharat Biotech", type: "indian", known: "Vaccines" },
  { name: "Biocon", q: "Biocon", type: "indian", known: "Diabetes, biologics" },
  { name: "Blue Cross Laboratories", q: "Blue Cross", type: "indian", known: "Anti-infectives, pain" },
  { name: "Boehringer Ingelheim India", q: "Boehringer", type: "multinational", known: "Respiratory, diabetes" },
  { name: "Cadila Pharmaceuticals", q: "Cadila", type: "indian", known: "General medicines" },
  { name: "Centaur Pharmaceuticals", q: "Centaur", type: "indian", known: "General medicines" },
  { name: "Cipla", q: "Cipla", type: "indian", known: "Respiratory, anti-infectives" },
  { name: "Corona Remedies", q: "Corona", type: "indian", known: "Women's health, pain" },
  { name: "Dabur India", q: "Dabur", type: "indian", known: "Ayurveda, wellness" },
  { name: "Dr. Reddy's Laboratories", q: "Reddy", type: "indian", known: "Gastro, pain, cardiology" },
  { name: "East India Pharmaceutical Works", q: "East India", type: "indian", known: "Dermatology" },
  { name: "Eli Lilly and Company (India)", q: "Lilly", type: "multinational", known: "Diabetes" },
  { name: "Emcure Pharmaceuticals", q: "Emcure", type: "indian", known: "Women's health, anti-infectives" },
  { name: "Eris Lifesciences", q: "Eris", type: "indian", known: "Diabetes, cardiology" },
  { name: "FDC Ltd", q: "FDC", type: "indian", known: "Oral rehydration, anti-infectives" },
  { name: "Fourrts (India) Laboratories", q: "Fourrts", type: "indian", known: "General medicines" },
  { name: "Franco-Indian Pharmaceuticals", q: "Franco", type: "indian", known: "Nutrition, gastro" },
  { name: "Galderma India", q: "Galderma", type: "multinational", known: "Dermatology" },
  { name: "Glenmark Pharmaceuticals", q: "Glenmark", type: "indian", known: "Dermatology, respiratory, cardiology" },
  { name: "GSK Pharmaceuticals", q: "GSK", type: "multinational", known: "Anti-infectives, vaccines" },
  { name: "Haleon", q: "Haleon", type: "multinational", known: "Pain relief, oral care" },
  { name: "Hetero Healthcare", q: "Hetero", type: "indian", known: "Generics, anti-infectives" },
  { name: "Himalaya Wellness", q: "Himalaya", type: "indian", known: "Herbal, wellness" },
  { name: "Indoco Remedies", q: "Indoco", type: "indian", known: "Oral care, anti-infectives" },
  { name: "Intas Pharmaceuticals", q: "Intas", type: "indian", known: "Neurology, cardiology, diabetes" },
  { name: "Ipca Laboratories", q: "Ipca", type: "indian", known: "Pain, anti-malarials, cardiology" },
  { name: "J.B. Chemicals & Pharmaceuticals", q: "J.B. Chemicals", type: "indian", known: "Cardiology, gastro" },
  { name: "Johnson & Johnson / Kenvue", q: "Kenvue", type: "multinational", known: "Consumer health, baby care" },
  { name: "La Renon Healthcare", q: "La Renon", type: "indian", known: "Nephrology, critical care" },
  { name: "Leeford Healthcare", q: "Leeford", type: "indian", known: "General medicines" },
  { name: "Lincoln Pharmaceuticals", q: "Lincoln", type: "indian", known: "General medicines" },
  { name: "Lupin", q: "Lupin", type: "indian", known: "Respiratory, diabetes, cardiology" },
  { name: "Macleods Pharmaceuticals", q: "Macleods", type: "indian", known: "Anti-infectives, TB" },
  { name: "Mankind Pharma", q: "Mankind", type: "indian", known: "General medicines, consumer health" },
  { name: "Medley Pharmaceuticals", q: "Medley", type: "indian", known: "General medicines" },
  { name: "Micro Labs", q: "Micro Labs", type: "indian", known: "Pain, cardiology, diabetes" },
  { name: "Morepen Laboratories", q: "Morepen", type: "indian", known: "Diagnostics, OTC" },
  { name: "MSN Laboratories", q: "MSN", type: "indian", known: "Generics, oncology" },
  { name: "Natco Pharma", q: "Natco", type: "indian", known: "Oncology" },
  { name: "Novartis India", q: "Novartis", type: "multinational", known: "Cardiology, ophthalmology" },
  { name: "Novo Nordisk India", q: "Novo Nordisk", type: "multinational", known: "Diabetes, insulin" },
  { name: "Omron Healthcare India", q: "Omron", type: "multinational", known: "BP monitors, nebulizers" },
  { name: "Pfizer Ltd", q: "Pfizer", type: "multinational", known: "Anti-infectives, vitamins, vaccines" },
  { name: "Piramal Pharma", q: "Piramal", type: "indian", known: "Consumer health" },
  { name: "Procter & Gamble Health", q: "Procter", type: "multinational", known: "Vitamins, cold and cough" },
  { name: "Reckitt", q: "Reckitt", type: "multinational", known: "Antiseptics, pain relief" },
  { name: "Roche Products (India)", q: "Roche", type: "multinational", known: "Oncology, diagnostics" },
  { name: "Sanofi India", q: "Sanofi", type: "multinational", known: "Diabetes, consumer health" },
  { name: "Serum Institute of India", q: "Serum Institute", type: "indian", known: "Vaccines" },
  { name: "Strides Pharma", q: "Strides", type: "indian", known: "Generics" },
  { name: "Sun Pharmaceutical Industries", q: "Sun Pharma", type: "indian", known: "Neurology, cardiology, dermatology" },
  { name: "Torrent Pharmaceuticals", q: "Torrent", type: "indian", known: "Cardiology, neurology, gastro" },
  { name: "Unichem Laboratories", q: "Unichem", type: "indian", known: "Cardiology, pain" },
  { name: "USV", q: "USV", type: "indian", known: "Diabetes, cardiology" },
  { name: "Viatris (Mylan)", q: "Viatris", type: "multinational", known: "Generics" },
  { name: "Wockhardt", q: "Wockhardt", type: "indian", known: "Anti-infectives, diabetes" },
  { name: "Zydus Lifesciences", q: "Zydus", type: "indian", known: "Cardiology, diabetes, women's health" },
  // --- more companies whose medicines and healthcare products are sold in India
  { name: "Akumentis Healthcare", q: "Akumentis", type: "indian", known: "Pain, neurology" },
  { name: "Baidyanath", q: "Baidyanath", type: "indian", known: "Ayurveda" },
  { name: "Becton Dickinson India", q: "Becton", type: "multinational", known: "Syringes, needles, diagnostics" },
  { name: "Beiersdorf India", q: "Beiersdorf", type: "multinational", known: "Skin care, first aid (Nivea, Hansaplast)" },
  { name: "Bharat Serums and Vaccines", q: "Bharat Serums", type: "indian", known: "Women's health, critical care" },
  { name: "Biological E", q: "Biological E", type: "indian", known: "Vaccines" },
  { name: "BPL Medical Technologies", q: "BPL", type: "indian", known: "Medical devices" },
  { name: "Cachet Pharmaceuticals", q: "Cachet", type: "indian", known: "General medicines" },
  { name: "Charak Pharma", q: "Charak", type: "indian", known: "Ayurveda" },
  { name: "Colgate-Palmolive (India)", q: "Colgate", type: "multinational", known: "Oral care" },
  { name: "Dr. Willmar Schwabe India", q: "Schwabe", type: "multinational", known: "Homoeopathy" },
  { name: "Emami", q: "Emami", type: "indian", known: "Ayurveda, consumer health" },
  { name: "Entod Pharmaceuticals", q: "Entod", type: "indian", known: "Ophthalmology, ENT" },
  { name: "Hegde & Hegde Pharmaceutica", q: "Hegde", type: "indian", known: "General medicines" },
  { name: "Hindustan Unilever", q: "Hindustan Unilever", type: "indian", known: "Nutrition drinks, personal care" },
  { name: "Jagsonpal Pharmaceuticals", q: "Jagsonpal", type: "indian", known: "Women's health, pain" },
  { name: "Kopran", q: "Kopran", type: "indian", known: "Anti-infectives" },
  { name: "Laborate Pharmaceuticals India", q: "Laborate", type: "indian", known: "General medicines" },
  { name: "Marksans Pharma", q: "Marksans", type: "indian", known: "OTC, generics" },
  { name: "Medopharm", q: "Medopharm", type: "indian", known: "General medicines" },
  { name: "Meyer Organics", q: "Meyer", type: "indian", known: "Nutrition, pain" },
  { name: "Nestlé India", q: "Nestlé", type: "multinational", known: "Infant nutrition" },
  { name: "Nureca (Dr Trust)", q: "Dr Trust", type: "indian", known: "Home medical devices" },
  { name: "Overseas Healthcare", q: "Overseas", type: "indian", known: "General medicines" },
  { name: "Panacea Biotec", q: "Panacea", type: "indian", known: "Vaccines, transplant" },
  { name: "Procter & Gamble Hygiene and Health Care", q: "Procter & Gamble", type: "multinational", known: "Cold care, hygiene (Vicks, Whisper)" },
  { name: "Psychotropics India", q: "Psychotropics", type: "indian", known: "Psychiatry, neurology" },
  { name: "Raptakos, Brett & Co", q: "Raptakos", type: "indian", known: "Nutrition" },
  { name: "Romsons Scientific & Surgical", q: "Romsons", type: "indian", known: "Surgical disposables" },
  { name: "SBL", q: "SBL", type: "indian", known: "Homoeopathy" },
  { name: "Shreya Life Sciences", q: "Shreya", type: "indian", known: "General medicines" },
  { name: "Steris Healthcare", q: "Steris", type: "indian", known: "General medicines" },
  { name: "Systopic Laboratories", q: "Systopic", type: "indian", known: "Ophthalmology, dermatology" },
  { name: "Tablets (India)", q: "Tablets (India)", type: "indian", known: "Gastro, nutrition" },
  { name: "3M India", q: "3M", type: "multinational", known: "Surgical tapes, first aid" },
  { name: "Troikaa Pharmaceuticals", q: "Troikaa", type: "indian", known: "Pain, critical care" },
  { name: "Unimarck Healthcare", q: "Unimarck", type: "indian", known: "General medicines" },
  { name: "Wallace Pharmaceuticals", q: "Wallace", type: "indian", known: "General medicines" },
  { name: "Walter Bushnell", q: "Walter Bushnell", type: "indian", known: "Diabetes, cardiology" },
  { name: "Win-Medicare", q: "Win-Medicare", type: "indian", known: "Nutrition, dermatology" },
  { name: "Zuventus Healthcare", q: "Zuventus", type: "indian", known: "Respiratory, gastro" },
];

/** Shown in the homepage strip until the store chooses its own featured companies in admin. */
export const FEATURED_COMPANIES = [
  "Sun Pharmaceutical Industries", "Cipla", "Mankind Pharma", "Abbott India", "Dr. Reddy's Laboratories", "Lupin",
  "Alkem Laboratories", "Torrent Pharmaceuticals", "Zydus Lifesciences", "Intas Pharmaceuticals", "Glenmark Pharmaceuticals",
  "Pfizer Ltd", "GSK Pharmaceuticals", "Sanofi India", "Micro Labs", "Novo Nordisk India",
];

export function companiesByLetter<T extends { name: string }>(list: T[]): [string, T[]][] {
  const groups = new Map<string, T[]>();
  for (const c of [...list].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))) {
    const k = c.name[0].toUpperCase();
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return [...groups.entries()];
}

/** Initials for the logo placeholder tile, e.g. "Sun Pharmaceutical Industries" → "SP". */
export function monogram(name: string): string {
  const words = name.replace(/[^A-Za-z0-9 &.]/g, " ").split(/\s+/).filter((w) => w && !/^(and|&|of|the|ltd|pvt|india)$/i.test(w));
  return (words.length >= 2 ? words[0][0] + words[1][0] : (words[0] ?? name).slice(0, 2)).toUpperCase();
}

/** Company whose search term appears in a product's manufacturer or brand. */
export function matchCompany<T extends { search_q: string }>(companies: T[], manufacturer: string, brand = ""): T | undefined {
  const hay = ` ${manufacturer} ${brand} `.toLowerCase();
  return companies
    .filter((c) => c.search_q && hay.includes(c.search_q.toLowerCase()))
    .sort((a, b) => b.search_q.length - a.search_q.length)[0];
}

const slugish = (v: string) =>
  v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/['’]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * Match an uploaded logo file to a company by its file name, e.g.
 * "sun-pharma.png", "Sun Pharmaceutical Industries.png", "cipla_logo.webp".
 */
export function matchLogoFile<T extends { slug: string; name: string; search_q: string }>(fileName: string, companies: T[]): T | undefined {
  const base = slugish(fileName.replace(/\.[a-z0-9]+$/i, "").replace(/[-_ ]?(logo|official|png|hd)$/i, ""));
  if (!base) return undefined;
  const keys = (c: T) => [c.slug, slugish(c.name), slugish(c.search_q)].filter(Boolean);
  return (
    companies.find((c) => keys(c).includes(base)) ??
    companies
      .filter((c) => keys(c).some((k) => k.startsWith(base + "-") || base.startsWith(k + "-")))
      .sort((a, b) => b.search_q.length - a.search_q.length)[0]
  );
}
