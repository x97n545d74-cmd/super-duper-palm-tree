// Browser-side conversion tracking. Sends each event to Google Tag Manager's
// dataLayer, GA4 (gtag) and Meta Pixel (fbq) when those are loaded, which only
// happens after the visitor accepts the cookie banner. Without consent, or with
// no IDs configured, track() is a no-op apart from the dataLayer push.

type Params = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/** Our event names → Meta standard events. */
const META: Record<string, string> = {
  whatsapp_click: "Contact",
  call_click: "Contact",
  directions_click: "FindLocation",
  sign_up: "CompleteRegistration",
  generate_lead: "Lead",
  search: "Search",
  view_item: "ViewContent",
};

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const attr = getAttribution();
  const payload = { ...params, ...(attr.utm_source ? { utm_source: attr.utm_source, utm_campaign: attr.utm_campaign } : {}) };
  (window.dataLayer ??= []).push({ event, ...payload });
  window.gtag?.("event", event, payload);
  if (window.fbq) {
    if (META[event]) window.fbq("track", META[event], payload);
    else window.fbq("trackCustom", event, payload);
  }
}

/* ---------------- first-touch attribution (UTM) ---------------- */

const ATTR_KEY = "sm_attr";
export interface Attribution {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  landing: string;
  referrer: string;
}

export function captureAttribution() {
  try {
    if (localStorage.getItem(ATTR_KEY)) return;
    const sp = new URLSearchParams(location.search);
    const ref = document.referrer && !document.referrer.startsWith(location.origin) ? new URL(document.referrer).hostname : "";
    const a: Attribution = {
      utm_source: (sp.get("utm_source") || (sp.get("gclid") ? "google" : sp.get("fbclid") ? "facebook" : ref) || "direct").slice(0, 80),
      utm_medium: (sp.get("utm_medium") || (sp.get("gclid") || sp.get("fbclid") ? "cpc" : ref ? "referral" : "none")).slice(0, 80),
      utm_campaign: (sp.get("utm_campaign") || "").slice(0, 120),
      landing: location.pathname.slice(0, 120),
      referrer: ref.slice(0, 120),
    };
    localStorage.setItem(ATTR_KEY, JSON.stringify(a));
  } catch {
    /* storage blocked: attribution is best-effort */
  }
}

export function getAttribution(): Partial<Attribution> {
  try {
    return JSON.parse(localStorage.getItem(ATTR_KEY) || "{}");
  } catch {
    return {};
  }
}

/* ---------------- consent ---------------- */

export const CONSENT_KEY = "sm_consent";
export type Consent = "granted" | "denied" | null;

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}
