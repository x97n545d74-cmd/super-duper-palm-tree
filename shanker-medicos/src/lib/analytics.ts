import { track as vercelTrack } from "@vercel/analytics";

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

const FIRST_PARTY = new Set(["pageview", "whatsapp_click", "call_click", "directions_click", "offer_reveal", "sign_up", "search", "view_item"]);
const PROP_KEYS = ["search_term", "results", "item_name", "item_brand", "placement", "promotion_name", "method", "source"];

/** Our own cookieless analytics (admin → Analytics). Always on; stores nothing personal. */
export function collect(event: string, params: Params = {}) {
  if (typeof window === "undefined" || !FIRST_PARTY.has(event)) return;
  try {
    const a = getAttribution();
    const d: Record<string, string | number> = {};
    for (const k of PROP_KEYS) {
      const v = params[k];
      if (v !== undefined && v !== "") d[k] = typeof v === "number" ? v : String(v).slice(0, 100);
    }
    const body = JSON.stringify({
      t: event,
      p: location.pathname.slice(0, 200),
      l: document.documentElement.lang.slice(0, 2),
      r: (a.referrer || "").slice(0, 120),
      us: a.utm_source || "",
      um: a.utm_medium || "",
      uc: a.utm_campaign || "",
      d,
    });
    if (!navigator.sendBeacon?.("/api/collect", new Blob([body], { type: "text/plain" }))) {
      fetch("/api/collect", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* analytics must never break the page */
  }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  collect(event, params);
  // Vercel Web Analytics custom events (shown in the Vercel dashboard; no-op elsewhere).
  try {
    const vp: Record<string, string | number> = {};
    for (const k of ["placement", "item_name", "search_term", "page"]) if (params[k] !== undefined) vp[k] = String(params[k]).slice(0, 100);
    if (event !== "pageview") vercelTrack(event, vp);
  } catch {}
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
