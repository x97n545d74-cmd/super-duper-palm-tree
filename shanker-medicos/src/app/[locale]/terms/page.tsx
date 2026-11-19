import { siteContext } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { LegalPage, contactLine } from "@/components/site/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/terms">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/terms", title: t.meta.termsTitle, description: "Terms of use for the Shanker Medicos website." });
}

// Template prepared for the store. Have it reviewed by a lawyer before launch (docs/LAUNCH_CHECKLIST.md).
export default async function Terms({ params }: PageProps<"/[locale]/terms">) {
  const ctx = await siteContext((await params).locale);
  const name = ctx.settings.business_name || "Shanker Medicos";
  return (
    <LegalPage ctx={ctx} title={ctx.t.footer.terms} path="/terms" updated="19 November 2026">
      <p>By using this website you agree to these terms. If you do not agree, please do not use the website.</p>
      <h2>A catalogue, not a shop</h2>
      <ul>
        <li>This website is a catalogue of products that {name} deals in. You cannot buy, pay for or order medicines on this website, and we do not deliver medicines through it.</li>
        <li>Listing a product does not mean it is in stock. Availability, current pack and price are confirmed only when you contact the store.</li>
        <li>Product images may be representative illustrations. The actual pack may differ.</li>
      </ul>
      <h2>Prescription medicines</h2>
      <p>
        Prescription medicines are sold only at the store, in person, against a valid prescription from a registered medical practitioner, as required by the Drugs and Cosmetics Act, 1940 and the rules under it. We may
        refuse to sell any medicine where the law or professional judgement requires it.
      </p>
      <h2>No medical advice</h2>
      <p>
        Information on this website identifies products (name, brand, manufacturer, pack). It is not medical advice and does not replace a doctor or pharmacist. Do not use this website to decide on diagnosis,
        treatment or dosage. In an emergency, contact a doctor or the nearest hospital.
      </p>
      <h2>Accuracy</h2>
      <p>We try to keep product details correct, but manufacturers change packs and formulations. Always read the label and leaflet of the product you buy.</p>
      <h2>Brands and trademarks</h2>
      <p>Product and brand names belong to their owners and are used only to identify the products. Their use does not imply endorsement.</p>
      <h2>Acceptable use</h2>
      <p>Do not misuse the website, attempt to gain unauthorised access to it, or copy the catalogue in bulk by automated means.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, {name} is not liable for losses arising from the use of information on this website.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Courts in Gurdaspur district, Punjab, have jurisdiction.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: {contactLine(ctx)}.</p>
    </LegalPage>
  );
}
