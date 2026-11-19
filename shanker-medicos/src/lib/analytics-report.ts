// Turns raw anonymous events into the numbers shown on Admin → Analytics.
// Pure function (no I/O) so it is unit-tested and works the same for both data modes.
//
// Definitions
//  - Visit: one visitor on one day (the visitor hash rotates daily, so this is
//    the most precise "unique" count the privacy design allows).
//  - Enquiry: a tap on WhatsApp, Call or Directions.
//  - Source of a visit: UTM source of its first event, else the referring site, else "direct".

import type { AnalyticsEvent } from "./types";

export interface DayPoint {
  date: string; // YYYY-MM-DD (IST)
  visits: number;
  pageviews: number;
  whatsapp: number;
  calls: number;
  directions: number;
  signups: number;
}

export interface Kpis {
  visits: number;
  pageviews: number;
  enquiries: number;
  whatsapp: number;
  calls: number;
  directions: number;
  signups: number;
  offerReveals: number;
  searches: number;
  /** share of visits with at least one enquiry */
  enquiryRate: number;
}

export interface SourceRow {
  source: string;
  medium: string;
  campaign: string;
  visits: number;
  enquiries: number;
  signups: number;
  rate: number;
}

export interface Report {
  from: string;
  to: string;
  kpis: Kpis;
  previous: Kpis | null;
  daily: DayPoint[];
  funnel: { label: string; value: number }[];
  sources: SourceRow[];
  searches: { term: string; count: number; zero: boolean }[];
  zeroSearches: { term: string; count: number }[];
  products: { name: string; views: number; enquiries: number }[];
  placements: { name: string; count: number }[];
  devices: { name: string; count: number }[];
  languages: { name: string; count: number }[];
  pages: { name: string; count: number }[];
  hasDemo: boolean;
  total: number;
}

const ENQUIRY = new Set(["whatsapp_click", "call_click", "directions_click"]);
const IST_MS = 5.5 * 3600_000;

/** Calendar day in India Standard Time. */
export function istDay(iso: string): string {
  return new Date(Date.parse(iso) + IST_MS).toISOString().slice(0, 10);
}

function kpisOf(events: AnalyticsEvent[]): Kpis {
  const visits = new Set<string>();
  const enquiringVisits = new Set<string>();
  const k: Kpis = { visits: 0, pageviews: 0, enquiries: 0, whatsapp: 0, calls: 0, directions: 0, signups: 0, offerReveals: 0, searches: 0, enquiryRate: 0 };
  for (const e of events) {
    const v = `${istDay(e.ts)}|${e.visitor}`;
    visits.add(v);
    if (e.type === "pageview") k.pageviews++;
    else if (e.type === "whatsapp_click") k.whatsapp++;
    else if (e.type === "call_click") k.calls++;
    else if (e.type === "directions_click") k.directions++;
    else if (e.type === "sign_up") k.signups++;
    else if (e.type === "offer_reveal") k.offerReveals++;
    else if (e.type === "search") k.searches++;
    if (ENQUIRY.has(e.type)) enquiringVisits.add(v);
  }
  k.visits = visits.size;
  k.enquiries = k.whatsapp + k.calls + k.directions;
  k.enquiryRate = k.visits ? enquiringVisits.size / k.visits : 0;
  return k;
}

function top(map: Map<string, number>, n: number) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}

const inc = (m: Map<string, number>, k: string, by = 1) => m.set(k, (m.get(k) ?? 0) + by);

/**
 * @param current events in [from, to]
 * @param previous events in the equal-length period before `from` (for % change), or null
 */
export function buildReport(current: AnalyticsEvent[], previous: AnalyticsEvent[] | null, from: string, to: string): Report {
  const events = [...current].sort((a, b) => a.ts.localeCompare(b.ts));

  // ----- daily series (every day in range, zero-filled)
  const days = new Map<string, DayPoint>();
  for (let d = istDay(from); d <= istDay(to); d = new Date(Date.parse(d) + 86400_000).toISOString().slice(0, 10)) {
    days.set(d, { date: d, visits: 0, pageviews: 0, whatsapp: 0, calls: 0, directions: 0, signups: 0 });
  }
  const dayVisitors = new Map<string, Set<string>>();

  // ----- per-visit facts
  type Visit = { source: string; medium: string; campaign: string; device: string; viewed: boolean; enquired: boolean; signedUp: boolean; enquiries: number };
  const visits = new Map<string, Visit>();

  const searches = new Map<string, { count: number; zero: number }>();
  const productViews = new Map<string, number>();
  const productEnq = new Map<string, number>();
  const placements = new Map<string, number>();
  const languages = new Map<string, number>();
  const pages = new Map<string, number>();
  let hasDemo = false;

  for (const e of events) {
    if (e.props?.demo) hasDemo = true;
    const day = istDay(e.ts);
    const key = `${day}|${e.visitor}`;
    const point = days.get(day);
    if (point) {
      const set = dayVisitors.get(day) ?? new Set<string>();
      set.add(e.visitor);
      dayVisitors.set(day, set);
      if (e.type === "pageview") point.pageviews++;
      if (e.type === "whatsapp_click") point.whatsapp++;
      if (e.type === "call_click") point.calls++;
      if (e.type === "directions_click") point.directions++;
      if (e.type === "sign_up") point.signups++;
    }
    let v = visits.get(key);
    if (!v) {
      v = {
        source: (e.utm_source || e.referrer || "direct").toLowerCase(),
        medium: (e.utm_medium || (e.referrer ? "referral" : "none")).toLowerCase(),
        campaign: e.utm_campaign || "",
        device: e.device,
        viewed: false,
        enquired: false,
        signedUp: false,
        enquiries: 0,
      };
      visits.set(key, v);
    }
    if (e.type === "view_item") {
      v.viewed = true;
      if (e.props.item_name) inc(productViews, String(e.props.item_name));
    }
    if (ENQUIRY.has(e.type)) {
      v.enquired = true;
      v.enquiries++;
      if (e.props.placement) inc(placements, String(e.props.placement));
      if (e.type === "whatsapp_click" && e.props.item_name) inc(productEnq, String(e.props.item_name));
    }
    if (e.type === "sign_up") v.signedUp = true;
    if (e.type === "search" && e.props.search_term) {
      const term = String(e.props.search_term).trim().toLowerCase();
      const s = searches.get(term) ?? { count: 0, zero: 0 };
      s.count++;
      if (Number(e.props.results) === 0) s.zero++;
      searches.set(term, s);
    }
    if (e.type === "pageview") {
      inc(pages, e.path.replace(/^\/(en|hi|pa)(?=\/|$)/, "") || "/");
      if (e.locale) inc(languages, e.locale);
    }
  }
  for (const [day, set] of dayVisitors) days.get(day)!.visits = set.size;

  // ----- sources
  const src = new Map<string, SourceRow>();
  const devices = new Map<string, number>();
  for (const v of visits.values()) {
    inc(devices, v.device);
    const k = `${v.source}|${v.medium}|${v.campaign}`;
    const row = src.get(k) ?? { source: v.source, medium: v.medium, campaign: v.campaign, visits: 0, enquiries: 0, signups: 0, rate: 0 };
    row.visits++;
    row.enquiries += v.enquiries;
    if (v.signedUp) row.signups++;
    src.set(k, row);
  }
  const enquiringBySource = new Map<string, number>();
  for (const v of visits.values()) if (v.enquired) inc(enquiringBySource, `${v.source}|${v.medium}|${v.campaign}`);
  const sources = [...src.entries()]
    .map(([k, r]) => ({ ...r, rate: r.visits ? (enquiringBySource.get(k) ?? 0) / r.visits : 0 }))
    .sort((a, b) => b.visits - a.visits || b.enquiries - a.enquiries)
    .slice(0, 12);

  const all = [...visits.values()];
  const kpis = kpisOf(events);
  const productNames = new Set([...productViews.keys(), ...productEnq.keys()]);

  return {
    from,
    to,
    kpis,
    previous: previous ? kpisOf(previous) : null,
    daily: [...days.values()],
    funnel: [
      { label: "Visits", value: all.length },
      { label: "Viewed a product", value: all.filter((v) => v.viewed).length },
      { label: "Enquired (WhatsApp, call, directions)", value: all.filter((v) => v.enquired).length },
      { label: "Joined Shanker Club", value: all.filter((v) => v.signedUp).length },
    ],
    sources,
    searches: [...searches.entries()]
      .map(([term, s]) => ({ term, count: s.count, zero: s.zero === s.count }))
      .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
      .slice(0, 15),
    zeroSearches: [...searches.entries()]
      .filter(([, s]) => s.zero > 0)
      .map(([term, s]) => ({ term, count: s.zero }))
      .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
      .slice(0, 15),
    products: [...productNames]
      .map((name) => ({ name, views: productViews.get(name) ?? 0, enquiries: productEnq.get(name) ?? 0 }))
      .sort((a, b) => b.enquiries - a.enquiries || b.views - a.views)
      .slice(0, 12),
    placements: top(placements, 10),
    devices: top(devices, 3),
    languages: top(languages, 3),
    pages: top(pages, 10),
    hasDemo,
    total: events.length,
  };
}

/** % change, or null when there is no previous data to compare with. */
export function change(now: number, before: number | undefined): number | null {
  if (before === undefined || before === 0) return null;
  return (now - before) / before;
}
