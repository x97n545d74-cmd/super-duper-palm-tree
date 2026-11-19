// What the store stocks, by kind of medicine or care product.
// The owner's instruction (19 Nov 2026): no medicine names on the website,
// only the companies and the kinds of products. Hindi and Punjabi need a
// native-speaker check (docs/LAUNCH_CHECKLIST.md).
import type { Locale } from "@/i18n/config";

export type FormIcon =
  | "tablet" | "capsule" | "syrup" | "injection" | "drops" | "tube"
  | "inhaler" | "leaf" | "glucose" | "firstaid" | "baby" | "vitamin";

export interface StockForm {
  id: string;
  icon: FormIcon;
  name: Record<Locale, string>;
  line: Record<Locale, string>;
}

export const STOCK: StockForm[] = [
  {
    id: "tablets", icon: "tablet",
    name: { en: "Tablets", hi: "टैबलेट", pa: "ਗੋਲੀਆਂ" },
    line: { en: "Branded and generic, by the strip or the box.", hi: "ब्रांडेड और जेनेरिक, पत्ता या पूरा डिब्बा।", pa: "ਬ੍ਰਾਂਡਿਡ ਅਤੇ ਜੈਨਰਿਕ, ਪੱਤਾ ਜਾਂ ਪੂਰਾ ਡੱਬਾ।" },
  },
  {
    id: "capsules", icon: "capsule",
    name: { en: "Capsules", hi: "कैप्सूल", pa: "ਕੈਪਸੂਲ" },
    line: { en: "Hard and soft-gel capsules.", hi: "हार्ड और सॉफ्ट-जेल कैप्सूल।", pa: "ਹਾਰਡ ਅਤੇ ਸਾਫ਼ਟ-ਜੈੱਲ ਕੈਪਸੂਲ।" },
  },
  {
    id: "syrups", icon: "syrup",
    name: { en: "Syrups & suspensions", hi: "सिरप और सस्पेंशन", pa: "ਸਿਰਪ ਅਤੇ ਸਸਪੈਂਸ਼ਨ" },
    line: { en: "For children and adults, including dry syrups.", hi: "बच्चों और बड़ों के लिए, ड्राई सिरप भी।", pa: "ਬੱਚਿਆਂ ਅਤੇ ਵੱਡਿਆਂ ਲਈ, ਡਰਾਈ ਸਿਰਪ ਵੀ।" },
  },
  {
    id: "injectables", icon: "injection",
    name: { en: "Injectables", hi: "इंजेक्शन", pa: "ਟੀਕੇ (ਇੰਜੈਕਸ਼ਨ)" },
    line: { en: "Vials, ampoules and insulin.", hi: "वायल, एम्प्यूल और इंसुलिन।", pa: "ਵਾਇਲ, ਐਂਪਿਊਲ ਅਤੇ ਇਨਸੁਲਿਨ।" },
  },
  {
    id: "drops", icon: "drops",
    name: { en: "Eye & ear drops", hi: "आँख और कान की बूँदें", pa: "ਅੱਖਾਂ ਅਤੇ ਕੰਨਾਂ ਦੀਆਂ ਬੂੰਦਾਂ" },
    line: { en: "Drops, eye ointments and lubricants.", hi: "ड्रॉप्स, आँख का मलहम और लुब्रिकेंट।", pa: "ਡ੍ਰਾਪਸ, ਅੱਖਾਂ ਦੀ ਮੱਲ੍ਹਮ ਅਤੇ ਲੁਬਰੀਕੈਂਟ।" },
  },
  {
    id: "topical", icon: "tube",
    name: { en: "Creams & ointments", hi: "क्रीम और मलहम", pa: "ਕ੍ਰੀਮ ਅਤੇ ਮੱਲ੍ਹਮ" },
    line: { en: "Skin creams, gels, ointments and lotions.", hi: "त्वचा की क्रीम, जेल, मलहम और लोशन।", pa: "ਚਮੜੀ ਦੀਆਂ ਕ੍ਰੀਮਾਂ, ਜੈੱਲ, ਮੱਲ੍ਹਮ ਅਤੇ ਲੋਸ਼ਨ।" },
  },
  {
    id: "inhalers", icon: "inhaler",
    name: { en: "Inhalers & respules", hi: "इनहेलर और रेस्प्यूल", pa: "ਇਨਹੇਲਰ ਅਤੇ ਰੈਸਪਿਊਲ" },
    line: { en: "Inhalers, rotacaps, respules and spacers.", hi: "इनहेलर, रोटाकैप, रेस्प्यूल और स्पेसर।", pa: "ਇਨਹੇਲਰ, ਰੋਟਾਕੈਪ, ਰੈਸਪਿਊਲ ਅਤੇ ਸਪੇਸਰ।" },
  },
  {
    id: "ayurvedic", icon: "leaf",
    name: { en: "Ayurvedic & herbal", hi: "आयुर्वेदिक और हर्बल", pa: "ਆਯੁਰਵੈਦਿਕ ਅਤੇ ਹਰਬਲ" },
    line: { en: "Ayurvedic medicines, churan, tonics and herbal care.", hi: "आयुर्वेदिक दवाइयाँ, चूर्ण, टॉनिक और हर्बल देखभाल।", pa: "ਆਯੁਰਵੈਦਿਕ ਦਵਾਈਆਂ, ਚੂਰਨ, ਟੌਨਿਕ ਅਤੇ ਹਰਬਲ ਦੇਖਭਾਲ।" },
  },
  {
    id: "diabetes", icon: "glucose",
    name: { en: "Diabetes care", hi: "डायबिटीज़ केयर", pa: "ਸ਼ੂਗਰ ਦੀ ਦੇਖਭਾਲ" },
    line: { en: "Insulin, test strips, glucometers and lancets.", hi: "इंसुलिन, टेस्ट स्ट्रिप, ग्लूकोमीटर और लैंसेट।", pa: "ਇਨਸੁਲਿਨ, ਟੈਸਟ ਸਟ੍ਰਿਪ, ਗਲੂਕੋਮੀਟਰ ਅਤੇ ਲੈਂਸੈੱਟ।" },
  },
  {
    id: "surgical", icon: "firstaid",
    name: { en: "Surgical & first aid", hi: "सर्जिकल और फ़र्स्ट एड", pa: "ਸਰਜੀਕਲ ਅਤੇ ਫ਼ਸਟ ਏਡ" },
    line: { en: "Dressings, bandages, syringes, gloves and BP monitors.", hi: "ड्रेसिंग, पट्टी, सिरिंज, दस्ताने और बीपी मशीन।", pa: "ਡ੍ਰੈਸਿੰਗ, ਪੱਟੀਆਂ, ਸਰਿੰਜਾਂ, ਦਸਤਾਨੇ ਅਤੇ ਬੀਪੀ ਮਸ਼ੀਨ।" },
  },
  {
    id: "baby", icon: "baby",
    name: { en: "Baby & mother care", hi: "बच्चे और माँ की देखभाल", pa: "ਬੱਚੇ ਅਤੇ ਮਾਂ ਦੀ ਦੇਖਭਾਲ" },
    line: { en: "Baby food, diapers, feeding bottles and maternity care.", hi: "बेबी फ़ूड, डायपर, दूध की बोतल और मैटरनिटी केयर।", pa: "ਬੇਬੀ ਫ਼ੂਡ, ਡਾਇਪਰ, ਦੁੱਧ ਦੀਆਂ ਬੋਤਲਾਂ ਅਤੇ ਮੈਟਰਨਿਟੀ ਕੇਅਰ।" },
  },
  {
    id: "vitamins", icon: "vitamin",
    name: { en: "Vitamins & supplements", hi: "विटामिन और सप्लीमेंट", pa: "ਵਿਟਾਮਿਨ ਅਤੇ ਸਪਲੀਮੈਂਟ" },
    line: { en: "Multivitamins, protein and nutrition drinks.", hi: "मल्टीविटामिन, प्रोटीन और न्यूट्रिशन ड्रिंक।", pa: "ਮਲਟੀਵਿਟਾਮਿਨ, ਪ੍ਰੋਟੀਨ ਅਤੇ ਨਿਊਟ੍ਰੀਸ਼ਨ ਡ੍ਰਿੰਕ।" },
  },
];
