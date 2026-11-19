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
    <LegalPage ctx={ctx} title={ctx.t.footer.privacy} path="/privacy" updated="20 November 2026">
      <p>
        This policy explains what information {name} (&ldquo;we&rdquo;), a pharmacy in {ctx.settings.city || "Batala"}, {ctx.settings.state || "Punjab"}, India, handles when you use this website. We
        collect as little as possible and process personal data in line with India&rsquo;s Digital Personal Data Protection Act, 2023.
      </p>
      <h2>What this website does not collect</h2>
      <ul>
        <li>There are no customer accounts, payments or online orders on this website.</li>
        <li>The website does not collect prescriptions, medical reports or health information. Prescriptions are sent only on WhatsApp (see below).</li>
        <li>We do not sell personal data.</li>
      </ul>
      <h2>Shanker Club (offers sign-up)</h2>
      <p>
        If you join Shanker Club, we collect your mobile number and, if you choose, your name and email, together with the wording of the consent you gave, the date, your
        language and how you found us (for example a Facebook or Google ad). We use this only to give you your member code and discounts and to send you offers and reminders
        about {name} on WhatsApp, SMS or email. You can stop messages at any time by replying STOP, and ask us to delete your details using the contact details below. We
        may use an automation or messaging service to send these messages on our behalf; it receives only what is needed to do so.
      </p>
      <h2>Cookies and advertising measurement</h2>
      <p>
        With your permission (the cookie banner), we use Google Analytics, Google Tag Manager and the Meta (Facebook) Pixel to count visits and measure which ads bring
        customers, for example when someone taps a WhatsApp button. These services set their own cookies and process data under their own policies. If you say no, they are
        not loaded. Your choice is stored in your browser (key <code>sm_consent</code>), as is the first page and ad source of your visit (key <code>sm_attr</code>).
      </p>
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
      <h2>WhatsApp, prescriptions and phone enquiries</h2>
      <p>
        When you tap a WhatsApp button, WhatsApp opens with a message draft. Nothing is sent unless you press send. If you send a photo of a prescription or a medicine
        list on WhatsApp, our pharmacist uses it only to check and prepare your order, as pharmacy law requires. Messages you send are handled by WhatsApp (Meta) under its own privacy policy, and we see them in our
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
