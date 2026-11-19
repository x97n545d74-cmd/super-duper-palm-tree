import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { LOCALES, LOCALE_META, isLocale } from "@/i18n/config";
import { siteContext } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsApp";
import { SITE_URL } from "@/lib/env";
import { jsonLd, pharmacySchema } from "@/lib/seo";
import { ClickTracker } from "@/components/marketing/ClickTracker";
import { Analytics } from "@/components/marketing/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Shanker Medicos",
  formatDetection: { telephone: false },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#123F2B",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const ctx = await siteContext(locale);
  const lang = isLocale(locale) ? LOCALE_META[locale].htmlLang : "en-IN";
  return (
    <html lang={lang} className={fontVars}>
      <body className="min-h-dvh">
        <Header ctx={ctx} />
        <main id="main">{children}</main>
        <Footer ctx={ctx} />
        <WhatsAppFloat href={ctx.waGeneral} label={ctx.t.whatsapp.float} />
        <ClickTracker />
        <Analytics labels={ctx.t.mkt.consent} privacyHref={`/${ctx.locale}/privacy`} />
        {/* Vercel Web Analytics: cookieless visit counts in the Vercel dashboard (only on Vercel). */}
        {process.env.VERCEL === "1" && <VercelAnalytics />}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pharmacySchema(ctx.settings, ctx.locale))} />
      </body>
    </html>
  );
}
