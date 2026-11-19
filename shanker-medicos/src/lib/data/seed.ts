// Starter data for development mode and for supabase/seed.sql.
//
// IMPORTANT: every seeded product is marked needs_review = true and
// availability = "unconfirmed". These are common products sold by Indian
// pharmacies, entered so the catalogue can be demonstrated. Store staff must
// confirm pack sizes, prescription status and stock (or delete the entries)
// before launch. Descriptions are deliberately limited to factual identity
// (what the product is, strength, pack) with no therapeutic claims.

import type { BusinessSettings, Category, Company, PackStyle, Product, RxClass } from "../types";
import { COMPANIES, FEATURED_COMPANIES } from "../companies";

const T = "2026-11-19T00:00:00.000Z";
const cid = (n: number) => `c0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const pid = (n: number) => `a0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

type C = [slug: string, en: string, hi: string, pa: string, featured: boolean, parent?: string];

const CATS: C[] = [
  ["medicines", "Medicines", "दवाइयाँ", "ਦਵਾਈਆਂ", true],
  ["personal-care", "Personal Care", "व्यक्तिगत देखभाल", "ਨਿੱਜੀ ਦੇਖਭਾਲ", true],
  ["baby-care", "Baby Care", "शिशु देखभाल", "ਬੱਚਿਆਂ ਦੀ ਦੇਖਭਾਲ", true],
  ["vitamins-nutrition", "Vitamins & Nutrition", "विटामिन और पोषण", "ਵਿਟਾਮਿਨ ਅਤੇ ਪੋਸ਼ਣ", true],
  ["skin-care", "Skin Care", "त्वचा की देखभाल", "ਚਮੜੀ ਦੀ ਦੇਖਭਾਲ", true],
  ["hair-care", "Hair Care", "बालों की देखभाल", "ਵਾਲਾਂ ਦੀ ਦੇਖਭਾਲ", true],
  ["medical-devices", "Medical Devices", "चिकित्सा उपकरण", "ਮੈਡੀਕਲ ਉਪਕਰਣ", true],
  ["first-aid", "First Aid", "प्राथमिक चिकित्सा", "ਮੁੱਢਲੀ ਸਹਾਇਤਾ", true],
  ["hygiene", "Hygiene", "स्वच्छता", "ਸਫ਼ਾਈ", true],
  ["mother-maternity", "Mother & Maternity", "माँ और प्रसूति देखभाल", "ਮਾਂ ਅਤੇ ਜਣੇਪਾ ਦੇਖਭਾਲ", true],
  ["surgical-supplies", "Surgical Supplies", "सर्जिकल सामान", "ਸਰਜੀਕਲ ਸਮਾਨ", true],
  ["wellness", "Wellness", "वेलनेस", "ਤੰਦਰੁਸਤੀ", true],
  ["prescription-medicines", "Prescription Medicines", "प्रिस्क्रिप्शन दवाइयाँ", "ਪ੍ਰਿਸਕ੍ਰਿਪਸ਼ਨ ਦਵਾਈਆਂ", false, "medicines"],
  ["otc-products", "OTC Products", "बिना पर्चे वाले उत्पाद", "ਬਿਨਾਂ ਪਰਚੀ ਵਾਲੇ ਉਤਪਾਦ", false, "medicines"],
  ["oral-care", "Oral Care", "मुँह और दाँतों की देखभाल", "ਮੂੰਹ ਅਤੇ ਦੰਦਾਂ ਦੀ ਦੇਖਭਾਲ", false],
  ["healthcare-essentials", "Healthcare Essentials", "स्वास्थ्य ज़रूरतें", "ਸਿਹਤ ਦੀਆਂ ਜ਼ਰੂਰਤਾਂ", false],
];

export const seedCategories: Category[] = CATS.map(([slug, en, hi, pa, featured], i) => ({
  id: cid(i + 1),
  slug,
  parent_id: null,
  name_en: en,
  name_hi: hi,
  name_pa: pa,
  image_url: null,
  sort_order: i + 1,
  featured,
  updated_at: T,
}));
for (const [i, c] of CATS.entries()) {
  if (c[5]) seedCategories[i].parent_id = seedCategories.find((x) => x.slug === c[5])!.id;
}

const catId = (slug: string) => seedCategories.find((c) => c.slug === slug)!.id;

type P = [
  name: string,
  brand: string,
  manufacturer: string,
  generic: string,
  pack: string,
  category: string,
  style: PackStyle,
  rx: RxClass,
  description: string,
  featured?: boolean,
];

const MED_INFO =
  "Use only as directed by your doctor or pharmacist and read the leaflet inside the pack. Prescription status and stock are confirmed by the pharmacist when you enquire.";
const GEN_INFO = "Read the label before use. Availability and current pack are confirmed by the store when you enquire.";
const DEV_INFO = "Read the instruction manual before first use. The model and pack contents are confirmed by the store when you enquire.";

const PRODUCTS: P[] = [
  ["Dolo 650", "Dolo", "Micro Labs Ltd", "Paracetamol 650 mg", "Strip of 15 tablets", "prescription-medicines", "strip", "unverified", "Paracetamol 650 mg tablets.", true],
  ["Pan 40", "Pan", "Alkem Laboratories Ltd", "Pantoprazole 40 mg", "Strip of 15 tablets", "prescription-medicines", "strip", "unverified", "Pantoprazole 40 mg gastro-resistant tablets."],
  ["Telma 40", "Telma", "Glenmark Pharmaceuticals Ltd", "Telmisartan 40 mg", "Strip of 15 tablets", "prescription-medicines", "strip", "unverified", "Telmisartan 40 mg tablets."],
  ["Crocin Advance", "Crocin", "Haleon", "Paracetamol 500 mg", "Strip of 15 tablets", "otc-products", "strip", "unverified", "Paracetamol 500 mg tablets.", true],
  ["Vicks VapoRub", "Vicks", "Procter & Gamble", "Menthol, camphor, eucalyptus oil", "50 ml jar", "otc-products", "jar", "unverified", "Topical balm in a jar."],
  ["Volini Pain Relief Gel", "Volini", "Sun Pharmaceutical Industries Ltd", "Diclofenac, methyl salicylate, menthol, linseed oil", "30 g tube", "otc-products", "tube", "unverified", "Topical gel in a tube.", true],
  ["Electral Powder", "Electral", "FDC Ltd", "Oral rehydration salts", "21.8 g sachet", "otc-products", "sachet", "unverified", "Oral rehydration salts (WHO formula) in a single sachet."],
  ["Strepsils Honey & Lemon", "Strepsils", "Reckitt", "Amylmetacresol, 2,4-dichlorobenzyl alcohol", "Strip of 8 lozenges", "otc-products", "strip", "unverified", "Throat lozenges, honey and lemon flavour."],
  ["Digene Gel Mint", "Digene", "Abbott India Ltd", "Antacid and anti-gas gel", "200 ml bottle", "otc-products", "bottle", "unverified", "Antacid gel, mint flavour."],
  ["Shelcal 500", "Shelcal", "Torrent Pharmaceuticals Ltd", "Calcium carbonate with vitamin D3", "Strip of 15 tablets", "vitamins-nutrition", "strip", "unverified", "Calcium and vitamin D3 tablets.", true],
  ["Limcee", "Limcee", "Abbott India Ltd", "Vitamin C 500 mg", "Strip of 15 chewable tablets", "vitamins-nutrition", "strip", "unverified", "Vitamin C 500 mg chewable tablets."],
  ["Becosules Capsules", "Becosules", "Pfizer Ltd", "Vitamin B-complex with vitamin C", "Strip of 20 capsules", "vitamins-nutrition", "strip", "unverified", "B-complex and vitamin C capsules."],
  ["Ensure Vanilla", "Ensure", "Abbott India Ltd", "Nutritional powder", "400 g jar", "vitamins-nutrition", "jar", "otc", "Nutritional powder, vanilla flavour."],
  ["Dettol Original Soap", "Dettol", "Reckitt", "", "125 g bar", "personal-care", "box", "otc", "Bathing soap bar."],
  ["Nivea Soft Light Moisturising Cream", "Nivea", "Beiersdorf India", "", "100 ml jar", "personal-care", "jar", "otc", "Light moisturising cream for face, hands and body."],
  ["Johnson's Baby Powder", "Johnson's", "Kenvue", "", "200 g bottle", "baby-care", "bottle", "otc", "Baby powder.", true],
  ["Himalaya Baby Lotion", "Himalaya", "Himalaya Wellness Company", "", "200 ml bottle", "baby-care", "pump", "otc", "Baby lotion."],
  ["Nestlé Cerelac Wheat Apple", "Cerelac", "Nestlé India Ltd", "", "300 g pack", "baby-care", "box", "otc", "Infant cereal, wheat and apple, for babies from 6 months."],
  ["Mother's Horlicks", "Horlicks", "Hindustan Unilever Ltd", "", "400 g jar", "mother-maternity", "jar", "otc", "Nutrition drink powder for pregnant and breastfeeding women."],
  ["Cetaphil Gentle Skin Cleanser", "Cetaphil", "Galderma India", "", "125 ml bottle", "skin-care", "pump", "otc", "Gentle, soap-free skin cleanser.", true],
  ["Himalaya Purifying Neem Face Wash", "Himalaya", "Himalaya Wellness Company", "", "150 ml tube", "skin-care", "tube", "otc", "Face wash with neem and turmeric."],
  ["Lacto Calamine Daily Face Lotion", "Lacto Calamine", "Piramal Pharma Ltd", "", "120 ml bottle", "skin-care", "bottle", "otc", "Daily face lotion with calamine."],
  ["Indulekha Bringha Hair Oil", "Indulekha", "Hindustan Unilever Ltd", "", "100 ml bottle", "hair-care", "bottle", "otc", "Ayurvedic hair oil."],
  ["Head & Shoulders Anti-Dandruff Shampoo", "Head & Shoulders", "Procter & Gamble", "", "180 ml bottle", "hair-care", "bottle", "otc", "Anti-dandruff shampoo."],
  ["Sensodyne Fresh Mint Toothpaste", "Sensodyne", "Haleon", "", "70 g tube", "oral-care", "tube", "otc", "Toothpaste for sensitive teeth, fresh mint."],
  ["Colgate Strong Teeth Toothpaste", "Colgate", "Colgate-Palmolive (India) Ltd", "", "200 g tube", "oral-care", "tube", "otc", "Fluoride toothpaste."],
  ["Dettol Antiseptic Liquid", "Dettol", "Reckitt", "Chloroxylenol", "250 ml bottle", "hygiene", "bottle", "otc", "Antiseptic disinfectant liquid.", true],
  ["Savlon Antiseptic Liquid", "Savlon", "ITC Ltd", "Chlorhexidine gluconate, cetrimide", "200 ml bottle", "hygiene", "bottle", "otc", "Antiseptic liquid."],
  ["Whisper Ultra Clean XL+", "Whisper", "Procter & Gamble", "", "Pack of 30 pads", "hygiene", "pack", "otc", "Sanitary pads, XL+ size."],
  ["Band-Aid Washproof Bandages", "Band-Aid", "Kenvue", "", "Pack of 20 strips", "first-aid", "box", "otc", "Waterproof adhesive bandages."],
  ["Hansaplast Crepe Bandage", "Hansaplast", "Beiersdorf India", "", "1 roll, 8 cm × 4 m", "first-aid", "box", "otc", "Elastic crepe bandage roll."],
  ["Omron HEM-7120 Blood Pressure Monitor", "Omron", "Omron Healthcare India", "", "1 unit", "medical-devices", "device", "otc", "Automatic upper-arm blood pressure monitor.", true],
  ["Accu-Chek Active Glucometer Kit", "Accu-Chek", "Roche Diabetes Care India", "", "1 kit", "medical-devices", "device", "otc", "Blood glucose meter kit."],
  ["Omron MC-246 Digital Thermometer", "Omron", "Omron Healthcare India", "", "1 unit", "medical-devices", "device", "otc", "Digital thermometer."],
  ["3M Micropore Surgical Tape", "3M", "3M India Ltd", "", "1 roll, 1 inch", "surgical-supplies", "box", "otc", "Paper surgical tape."],
  ["Dabur Chyawanprash", "Dabur", "Dabur India Ltd", "", "500 g jar", "wellness", "jar", "otc", "Ayurvedic preparation."],
  ["Himalaya Liv.52", "Himalaya", "Himalaya Wellness Company", "", "Bottle of 100 tablets", "wellness", "bottle", "unverified", "Herbal tablets."],
  ["Omron NE-C101 Nebulizer", "Omron", "Omron Healthcare India", "", "1 unit", "healthcare-essentials", "device", "otc", "Compressor nebulizer."],
];

function slug(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const seedProducts: Product[] = PRODUCTS.map(
  ([name, brand, manufacturer, generic, pack, category, style, rx, description, featured], i) => ({
    id: pid(i + 1),
    slug: slug(name),
    name,
    brand,
    manufacturer,
    generic_name: generic,
    pack_size: pack,
    category_id: catId(category),
    description,
    information: style === "device" ? DEV_INFO : rx === "otc" ? GEN_INFO : MED_INFO,
    image_url: null,
    pack_style: style,
    availability: "unconfirmed",
    rx_class: rx,
    published: true,
    featured: !!featured,
    needs_review: true,
    created_at: T,
    updated_at: T,
  }),
);

/** Facts supplied by the store (WhatsApp, Maps link, offer). Everything else is left empty for the store to fill in. */
export const seedSettings: BusinessSettings = {
  business_name: "Shanker Medicos",
  tagline: "Your Health. Our Priority.",
  address: "",
  city: "Batala",
  state: "Punjab",
  postal_code: "",
  phone: "",
  whatsapp: "+91 98155 52404",
  email: "",
  opening_hours: "",
  maps_url: "https://maps.app.goo.gl/jgHwJrpiNSSzED4q9",
  instagram_url: "",
  facebook_url: "",
  offer_enabled: true,
  offer_percent: 12,
  offer_min_amount: 1000,
  offer_code: "SHANKER12",
  club_enabled: true,
  club_extra_percent: 0,
  updated_at: T,
};

const coid = (n: number) => `b0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** Pharma companies (no logos: the store uploads official logo files in admin). */
export const seedCompanies: Company[] = [...COMPANIES]
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
  .map((c, i) => ({
    id: coid(i + 1),
    slug: slug(c.name),
    name: c.name,
    search_q: c.q,
    known: c.known ?? "",
    kind: c.type,
    logo_url: null,
    featured: FEATURED_COMPANIES.includes(c.name),
    sort_order: i + 1,
    updated_at: T,
  }));
