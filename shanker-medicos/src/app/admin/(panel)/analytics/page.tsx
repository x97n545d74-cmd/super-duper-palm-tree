import Link from "next/link";
import { adminRepo } from "@/lib/data";
import { buildReport, change, type Kpis } from "@/lib/analytics-report";
import { BarList, LineChart, StackedBars } from "@/components/admin/charts";
import { SERIES } from "@/lib/chart-colors";
import { clearDemoEventsAction } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Analytics" };

const RANGES = [7, 30, 90] as const;
const PLACEMENT: Record<string, string> = {
  rx_photo: "Send prescription photo",
  rx_list: "Type medicine list",
  offer_whatsapp: "Offer code on WhatsApp",
  club_save_code: "Save member code on WhatsApp",
  product_rx_photo: "Prescription photo (product page)",
  companies_ask: "Ask about a company",
};
const pageName = (p: string) => (p === "/" ? "Homepage" : p);
const pct = (v: number) => `${(v * 100).toFixed(v > 0 && v < 0.1 ? 1 : 0)}%`;

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const sp = await searchParams;
  const days = RANGES.find((r) => String(r) === sp.range) ?? 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400_000);
  const prevFrom = new Date(from.getTime() - days * 86400_000);
  const all = await adminRepo.listEvents(prevFrom.toISOString(), to.toISOString());
  const cur = all.filter((e) => e.ts >= from.toISOString());
  const prev = all.filter((e) => e.ts < from.toISOString());
  const r = buildReport(cur, prev.length ? prev : null, from.toISOString(), to.toISOString());
  const visits = r.kpis.visits;

  const tiles: { label: string; key: keyof Kpis; format?: (v: number) => string; help: string }[] = [
    { label: "Visits", key: "visits", help: "One visitor on one day" },
    { label: "WhatsApp enquiries", key: "whatsapp", help: "Taps on any WhatsApp button" },
    { label: "Calls", key: "calls", help: "Taps on a phone number" },
    { label: "Directions", key: "directions", help: "Taps on Get directions" },
    { label: "Club sign-ups", key: "signups", help: "New Shanker Club members" },
    { label: "Enquiry rate", key: "enquiryRate", format: pct, help: "Visits that WhatsApped, called or asked for directions" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Analytics</h1>
          <p className="mt-2 max-w-2xl text-ink-2">How people find the website and what they do. Anonymous: no names, numbers or IP addresses are recorded, and no cookies are used.</p>
        </div>
        <nav aria-label="Date range" className="flex gap-1 rounded-full border border-line bg-white p-1">
          {RANGES.map((n) => (
            <Link key={n} href={`/admin/analytics?range=${n}`} aria-current={n === days ? "page" : undefined} className={`rounded-full px-3.5 py-1.5 text-sm ${n === days ? "bg-forest text-ivory" : "text-ink-2 hover:text-ink"}`}>
              {n} days
            </Link>
          ))}
        </nav>
      </div>

      {r.hasDemo && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-[#F2D7A6] bg-[#FFF8EC] p-4 text-sm">
          <p>
            <strong className="text-warn">Demo data.</strong> These numbers were generated to show how the dashboard works. Clear them before launch.
          </p>
          <form action={clearDemoEventsAction}>
            <ConfirmButton message="Delete all demo analytics data?" className="btn btn-ghost h-9 min-h-0 bg-white text-sm">
              Clear demo data
            </ConfirmButton>
          </form>
        </div>
      )}

      {r.total === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-line bg-white p-10 text-center text-ink-2">No visits recorded in this period yet. Numbers appear here as soon as people use the website.</div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
            {tiles.map((t) => {
              const v = r.kpis[t.key];
              const d = change(v, r.previous?.[t.key]);
              return (
                <li key={t.key} className="min-w-0 rounded-card border border-line bg-white p-4 sm:p-5" title={t.help}>
                  <p className="text-sm text-ink-2">{t.label}</p>
                  <p className="mt-1 font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">{t.format ? t.format(v) : v.toLocaleString("en-IN")}</p>
                  <p className="mt-1 text-xs text-ink-2">
                    {d === null ? (
                      "No earlier data to compare"
                    ) : (
                      <>
                        <span className={d >= 0 ? "font-semibold text-forest" : "font-semibold text-danger"}>
                          {d >= 0 ? "▲" : "▼"} {Math.abs(Math.round(d * 100))}%
                        </span>{" "}
                        vs previous {days} days
                      </>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card title="Visits per day">
              <LineChart label="Visits" data={r.daily.map((d) => ({ date: d.date, value: d.visits }))} />
            </Card>
            <Card title="Enquiries per day">
              <StackedBars
                data={r.daily.map((d) => ({ date: d.date, whatsapp: d.whatsapp, calls: d.calls, directions: d.directions }))}
                series={[
                  { key: "whatsapp", label: "WhatsApp", color: SERIES.whatsapp },
                  { key: "calls", label: "Calls", color: SERIES.calls },
                  { key: "directions", label: "Directions", color: SERIES.directions },
                ]}
              />
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <Card title="From visit to enquiry" className="lg:col-span-2">
              <BarList items={r.funnel.map((f) => ({ name: f.label, count: f.value }))} total={visits} />
            </Card>
            <Card title="Where visitors come from" className="lg:col-span-3" note="Tag ad links with utm_source / utm_campaign to see each campaign here.">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-ink-2">
                    <tr className="border-b border-line">
                      <th className="py-2 pr-3 font-semibold">Source / campaign</th>
                      <th className="py-2 pr-3 text-right font-semibold">Visits</th>
                      <th className="py-2 pr-3 text-right font-semibold">Enquiries</th>
                      <th className="py-2 pr-3 text-right font-semibold">Sign-ups</th>
                      <th className="py-2 text-right font-semibold">Enquiry rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line tabular-nums">
                    {r.sources.map((s) => (
                      <tr key={`${s.source}|${s.medium}|${s.campaign}`}>
                        <td className="py-2 pr-3">
                          <span className="font-medium">{s.source}</span>
                          <span className="text-ink-2"> / {s.medium}</span>
                          {s.campaign && <span className="block text-xs text-ink-2">{s.campaign}</span>}
                        </td>
                        <td className="py-2 pr-3 text-right">{s.visits}</td>
                        <td className="py-2 pr-3 text-right">{s.enquiries}</td>
                        <td className="py-2 pr-3 text-right">{s.signups}</td>
                        <td className="py-2 text-right">
                          <span className="inline-flex items-center gap-2">
                            <span className="hidden h-1.5 w-14 rounded-full bg-mint sm:inline-block">
                              <span className="block h-1.5 rounded-full" style={{ width: `${Math.min(100, s.rate * 100 * 2)}%`, background: SERIES.whatsapp }} />
                            </span>
                            {pct(s.rate)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card title="Searched but not found" note="Customers looked for these and the catalogue had nothing. Stock them or add them to the catalogue.">
              <BarList items={r.zeroSearches.map((s) => ({ name: s.term, count: s.count }))} suffix="×" />
            </Card>
            <Card title="Top searches">
              <BarList items={r.searches.map((s) => ({ name: s.term, count: s.count, note: s.zero ? "no results" : undefined }))} />
            </Card>
            <Card title="Most enquired products" note="Views · WhatsApp enquiries">
              {r.products.length ? (
                <ul className="divide-y divide-line text-sm">
                  {r.products.map((p) => (
                    <li key={p.name} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate">{p.name}</span>
                      <span className="shrink-0 tabular-nums text-ink-2">
                        {p.views} · <span className="font-semibold text-forest">{p.enquiries}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-2">No data yet.</p>
              )}
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-4">
            <Card title="Which buttons get enquiries" className="lg:col-span-2">
              <BarList items={r.placements.map((x) => ({ ...x, name: PLACEMENT[x.name] ?? x.name }))} />
            </Card>
            <Card title="Devices">
              <BarList items={r.devices} total={visits} />
            </Card>
            <Card title="Language">
              <BarList items={r.languages.map((l) => ({ name: { en: "English", hi: "Hindi", pa: "Punjabi" }[l.name] ?? l.name, count: l.count }))} total={r.languages.reduce((s, l) => s + l.count, 0)} />
            </Card>
          </div>

          <div className="mt-6">
            <Card title="Most viewed pages">
              <BarList items={r.pages.map((x) => ({ ...x, name: pageName(x.name) }))} />
            </Card>
          </div>
          <p className="mt-6 text-xs text-ink-2">
            {r.total.toLocaleString("en-IN")} events · {from.toLocaleDateString("en-IN")} – {to.toLocaleDateString("en-IN")} (India time). Google Analytics and Meta Pixel, if connected, count separately and only for visitors who accept cookies.
          </p>
        </>
      )}
    </div>
  );
}

function Card({ title, note, className = "", children }: { title: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`min-w-0 rounded-card border border-line bg-white p-5 ${className}`}>
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      {note && <p className="mt-1 text-xs text-ink-2">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
