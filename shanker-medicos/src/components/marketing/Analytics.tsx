"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { CONSENT_KEY, readConsent, type Consent } from "@/lib/analytics";

const GTM = process.env.NEXT_PUBLIC_GTM_ID || "";
const GA4 = process.env.NEXT_PUBLIC_GA4_ID || "";
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";
const ID = /^[A-Za-z0-9-]+$/;
const noop = () => () => {};

/**
 * Loads Google Tag Manager, GA4 and Meta Pixel only after the visitor accepts.
 * If no IDs are configured, nothing is shown or loaded.
 */
export function Analytics({ labels, privacyHref }: { labels: { text: string; accept: string; decline: string; policy: string }; privacyHref: string }) {
  const configured = [GTM, GA4, PIXEL].some((v) => v && ID.test(v));
  // Stored choice (read after hydration) unless the visitor just chose in this session.
  const stored = useSyncExternalStore<Consent | "unknown">(noop, readConsent, () => "unknown");
  const [choice, setConsent] = useState<Consent>(null);
  const consent = choice ?? stored;
  if (!configured || consent === "unknown") return null;

  const choose = (c: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(CONSENT_KEY, c);
    } catch {}
    setConsent(c);
  };

  if (consent === null)
    return (
      <div role="dialog" aria-label="Cookies" className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-xl rounded-card border border-line bg-white p-4 shadow-float sm:bottom-6">
        <p className="text-sm text-ink">
          {labels.text}{" "}
          <Link href={privacyHref} className="link-u text-emerald underline">
            {labels.policy}
          </Link>
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => choose("granted")} className="btn btn-primary h-10 min-h-0 text-sm">
            {labels.accept}
          </button>
          <button type="button" onClick={() => choose("denied")} className="btn btn-ghost h-10 min-h-0 text-sm">
            {labels.decline}
          </button>
        </div>
      </div>
    );

  if (consent !== "granted") return null;
  return (
    <>
      {GTM && ID.test(GTM) && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM}');`}
        </Script>
      )}
      {GA4 && ID.test(GA4) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA4}');`}
          </Script>
        </>
      )}
      {PIXEL && ID.test(PIXEL) && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
