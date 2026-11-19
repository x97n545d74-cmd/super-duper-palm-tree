import Link from "next/link";
import { siteContext } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { LegalPage, contactLine } from "@/components/site/LegalPage";

export async function generateMetadata({ params }: PageProps<"/[locale]/privacy">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/privacy", title: t.meta.privacyTitle, description: "How Shanker Medicos handles information on this website." });
}

// Template prepared for the store. Have it reviewed by a lawyer before launch (docs/LAUNCH_CHECKLIST.md).
export default async function Privacy({ params }: PageProps<"/[locale]/privacy">) {
  const ctx = await siteContext((await params).locale);
  const name = ctx.settings.business_name || "Shanker Medicos";
  return (
    <LegalPage ctx={ctx} title={ctx.t.footer.privacy} path="/privacy" updated="19 November 2026">
      <p>
        This policy explains what information {name} (&ldquo;we&rdquo;), a pharmacy in {ctx.settings.city || "Batala"}, {ctx.settings.state || "Punjab"}, India, handles when you use this website. We
        collect as little as possible and process personal data in line with India&rsquo;s Digital Personal Data Protection Act, 2023.
      </p>
      <h2>What this website does not collect</h2>
      <ul>
        <li>There are no customer accounts, sign-up forms, payments or orders on this website.</li>
        <li>We do not accept prescriptions, medical reports or health information through this website. Please do not send them here.</li>
        <li>We do not use advertising or tracking cookies, and we do not sell personal data.</li>
      </ul>
      <h2>What is processed</h2>
      <ul>
        <li>
          <strong>Language preference.</strong> A cookie named NEXT_LOCALE remembers the language you chose (English, Hindi or Punjabi) for up to one year. It contains only the language code.
        </li>
        <li>
          <strong>Technical logs.</strong> Our hosting provider records standard server logs (such as IP address, browser type and the page requested) to keep the site secure and working. These are kept for a limited period by the provider.
        </li>
        <li>
          <strong>Search.</strong> Words you type in the catalogue search are used to show results and are not linked to you.
        </li>
        <li>
          <strong>Staff sign-in.</strong> Pharmacy staff who manage the catalogue sign in with an account; session cookies are used only for that.
        </li>
      </ul>
      <h2>WhatsApp and phone enquiries</h2>
      <p>
        When you tap a WhatsApp button, WhatsApp opens with a message draft. Nothing is sent unless you press send. Messages you send are handled by WhatsApp (Meta) under its own privacy policy, and we see them in our
        WhatsApp account. We use your number and messages only to answer your enquiry and do not add you to marketing lists without asking.
      </p>
      <h2>Maps and video</h2>
      <p>The contact page may show an embedded Google Map. Loading it lets Google receive technical information under Google&rsquo;s privacy policy. The store video is hosted on this website.</p>
      <h2>Your rights</h2>
      <p>
        You can ask us to tell you what personal data we hold about you, correct it or delete it, and you can withdraw consent at any time. To do so, or to raise a grievance, contact us via {contactLine(ctx)}. See our{" "}
        <Link href={`/${ctx.locale}/contact`}>Contact page</Link>.
      </p>
      <h2>Changes</h2>
      <p>We will update this page if our practices change. The date at the top shows the latest version.</p>
    </LegalPage>
  );
}
