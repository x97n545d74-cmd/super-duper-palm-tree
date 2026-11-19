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
];

export function companiesByLetter(list: Company[] = COMPANIES) {
  const groups = new Map<string, Company[]>();
  for (const c of [...list].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))) {
    const k = c.name[0].toUpperCase();
    groups.set(k, [...(groups.get(k) ?? []), c]);
  }
  return [...groups.entries()];
}
