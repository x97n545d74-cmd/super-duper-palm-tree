import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVars } from "@/lib/fonts";
import { LOCALES, LOCALE_META, isLocale } from "@/i18n/config";
import { siteContext } from "@/lib/site";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsApp";
import { SITE_URL } from "@/lib/env";
import { jsonLd, pharmacySchema, websiteSchema } from "@/lib/seo";
import { ClickTracker } from "@/components/marketing/ClickTracker";
import { Analytics } from "@/components/marketing/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { MotionRoot } from "@/components/v2/Motion";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Shanker Medicos",
  formatDetection: { telephone: false },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const INTRO_SCRIPT = `(function(){var d=document.documentElement;d.classList.remove('no-js');try{var p=location.pathname.replace(/\\/$/,'');var home=/^\\/(en|hi|pa)$/.test(p);var seen=sessionStorage.getItem('sm_intro');var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;var bot=/bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(navigator.userAgent);d.dataset.intro=(home&&!seen&&!rm&&!bot)?'on':'off';if(rm)d.dataset.motion='off'}catch(e){d.dataset.intro='off'}})()`;

const CF_BEACON = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN || "";

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  const ctx = await siteContext(locale);
  const lang = isLocale(locale) ? LOCALE_META[locale].htmlLang : "en-IN";
  return (
    <html lang={lang} className={`${fontVars} no-js`} suppressHydrationWarning>
      <body className="night min-h-dvh">
        {/* Before first paint: JS on, and whether the entry video plays (homepage, first visit this session, motion allowed, not a crawler). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <Header ctx={ctx} />
        <main id="main">{children}</main>
        <Footer ctx={ctx} />
        <WhatsAppFloat href={ctx.waGeneral} label={ctx.t.whatsapp.float} />
        <ClickTracker />
        <MotionRoot />
        <Analytics labels={ctx.t.mkt.consent} privacyHref={`/${ctx.locale}/privacy`} />
        {/* Vercel Web Analytics: cookieless visit counts in the Vercel dashboard (only on Vercel). */}
        {process.env.VERCEL === "1" && <VercelAnalytics />}
        {/* Cloudflare Web Analytics: free cookieless visit counts on any host, when a token is set. */}
        {CF_BEACON && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={JSON.stringify({ token: CF_BEACON })} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(pharmacySchema(ctx.settings, ctx.locale))} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(websiteSchema(ctx.locale))} />
      </body>
    </html>
  );
}
