import Link from "next/link";
import { siteContext, type SiteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { telHref } from "@/lib/settings";
import { STOCK } from "@/lib/stock";
import { IconArrow, IconWhatsApp, IconPhone } from "@/components/ui/Icons";
import { Faq, OfferAndClub, offerVars } from "@/components/marketing/Sections";
import { IntroVideo } from "@/components/v2/IntroVideo";
import { Lines } from "@/components/v2/Lines";
import { OpenStatus } from "@/components/v2/OpenStatus";
import { FormGlyph } from "@/components/v2/FormGlyph";
import { StoreVideo } from "@/components/home/StoreVideo";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/", title: t.meta.siteTitle, description: t.meta.siteDescription });
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s } = ctx;
  const v = t.v2;
  const w = t.v3;
  const companies = await catalogue.listCompanies();
  const n = Math.floor(companies.length / 10) * 10;
  const rxPhoto = waLink(s.whatsapp, t.mkt.rx.msgPhoto);
  const rxList = waLink(s.whatsapp, t.mkt.rx.msgList);
  const ordered = [...companies.filter((c) => c.featured), ...companies.filter((c) => !c.featured)];
  const half = Math.ceil(ordered.length / 2);

  return (
    <>
      <IntroVideo labels={{ skip: v.intro.skip, label: v.intro.label, words: w.intro.words, coords: w.intro.coords }} />

      {/* HERO: full-bleed storefront (the frame the entry video ends on) */}
      <section className="relative isolate -mt-px flex min-h-[calc(100svh-7rem)] flex-col justify-end overflow-hidden" aria-labelledby="hero-h">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/batala-store-poster.jpg" alt={v.hero.videoAlt} width={1280} height={720} fetchPriority="high" className="parallax absolute inset-0 -z-20 h-full w-full object-cover" style={{ filter: "contrast(1.08) saturate(.85)" }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.2)_35%,rgba(0,0,0,.92)_100%)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,.7)_100%)]" />

        <div className="container-x pointer-events-none absolute inset-x-0 top-6 flex items-start justify-between gap-6">
          <p data-rv lang="pa" className="text-[1rem] font-black text-white/70 sm:text-[1.15rem]" style={{ fontFamily: "var(--font-guru)", fontStretch: "70%" }}>
            {w.hero.sign}
          </p>
          <div data-rv style={{ ["--i" as string]: 2 }} className="shrink-0 text-right font-mono text-[0.68rem] uppercase leading-[2] tracking-[0.18em] text-white/65">
            <span className="text-emerald">
              <OpenStatus labels={v.status} />
            </span>
            <span className="hidden sm:inline">
              <br />
              {v.hero.cardSub}
              <br />
              {fmt(w.hero.stats, { n: companies.length, k: STOCK.length })}
            </span>
          </div>
        </div>

        <div className="container-x grid grid-cols-1 items-end gap-10 pb-12 pt-40 lg:grid-cols-12 lg:pb-16">
          <h1 id="hero-h" className="text-display text-white lg:col-span-9">
            <Lines lines={w.hero.lines} />
          </h1>
          <div data-rv style={{ ["--i" as string]: 6 }} className="lg:col-span-3 lg:pb-3">
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-white/70">{v.hero.body}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {rxPhoto && (
                <a href={rxPhoto} target="_blank" rel="noopener noreferrer" data-track-label="hero_rx" className="btn btn-primary h-13 px-6">
                  <IconWhatsApp className="h-5 w-5" /> {v.hero.ctaRx}
                </a>
              )}
              <Link href={`/${locale}/products`} className="btn btn-ghost h-13 px-6">
                {v.hero.ctaStock}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE STOCK: an index of kinds, each a WhatsApp question */}
      <section className="container-x pt-section" aria-labelledby="stock-h" id="stock">
        <Head eyebrow={v.stock.eyebrow} id="stock-h" lines={w.stock.lines} body={v.stock.body} link={{ href: `/${locale}/products`, label: v.stock.all }} />
        <ol className="mt-14 border-t border-line">
          {STOCK.map((f, i) => {
            const name = f.name[locale];
            const wa = waLink(s.whatsapp, fmt(v.stock.askMsg, { form: name.toLowerCase() }));
            return (
              <li key={f.id} id={`k-${f.id}`} data-rv style={{ ["--i" as string]: i % 6 }} className="border-b border-line">
                <a href={wa || "#"} target="_blank" rel="noopener noreferrer" data-track-label={`stock_${f.id}`} className="group relative grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 overflow-hidden py-5 sm:grid-cols-[4rem_1fr_1fr_auto] sm:py-6">
                  <span aria-hidden="true" className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-emerald transition-transform duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-y-100" />
                  <span className="font-mono text-xs text-ink-2 transition-colors group-hover:text-black/70">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-[clamp(1.9rem,1.2rem+3.2vw,4.4rem)] text-ink transition-[color,transform] duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-2 group-hover:text-black">{name}</span>
                  <span className="hidden text-[0.95rem] text-ink-2 transition-colors group-hover:text-black/75 sm:block">
                    {f.line[locale]}
                    {f.rx && <span className="ml-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-coral group-hover:text-black">· {v.stock.rx}</span>}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-colors group-hover:border-black group-hover:bg-black group-hover:text-emerald">
                    <FormGlyph icon={f.icon} className="h-5 w-5" />
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ORDER ON WHATSAPP */}
      <section className="container-x pt-section" aria-labelledby="order-h">
        <p data-rv className="eyebrow">
          {v.order.eyebrow}
        </p>
        <h2 id="order-h" className="scrub mt-5 text-h1">
          <Lines lines={w.order.lines} />
        </h2>
        <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-line bg-line md:grid-cols-3">
          {v.order.steps.map((st, i) => (
            <li key={st.t} data-rv style={{ ["--i" as string]: i * 2 }} className="bg-ivory p-8 sm:p-10">
              <span aria-hidden="true" className="display outline block text-[6rem] leading-none sm:text-[8rem]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-6 text-xl font-semibold">{st.t}</p>
              <p className="mt-2 text-ink-2">{st.b}</p>
            </li>
          ))}
        </ol>
        <div data-rv className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {rxPhoto && (
              <a href={rxPhoto} target="_blank" rel="noopener noreferrer" data-track-label="rx_photo" className="btn btn-wa h-13 px-6">
                <IconWhatsApp className="h-5 w-5" /> {v.order.photo}
              </a>
            )}
            {rxList && (
              <a href={rxList} target="_blank" rel="noopener noreferrer" data-track-label="rx_list" className="btn btn-ghost h-13 px-6">
                {v.order.list}
              </a>
            )}
          </div>
          <p className="max-w-md text-sm text-ink-2">{v.order.note}</p>
        </div>
      </section>

      {/* OFFER + CLUB */}
      {s.offer_enabled && (
        <section className="container-x pt-section" aria-labelledby="offer-big-h">
          <h2 id="offer-big-h" className="scrub text-h1">
            <Lines lines={w.offer.lines.map((l) => fmt(l, offerVars(ctx)))} />
          </h2>
        </section>
      )}
      <OfferAndClub ctx={ctx} source="homepage" />

      {/* COMPANIES: two rows of names in motion */}
      <section className="pt-section" aria-labelledby="co-h">
        <div className="container-x">
          <Head eyebrow={v.companies.eyebrow} id="co-h" lines={w.companies.lines.map((l) => fmt(l, { n }))} body={v.companies.body} link={{ href: `/${locale}/companies`, label: v.companies.more }} />
        </div>
        <div lang="en" className="mt-14 space-y-4" aria-label={v.companies.eyebrow}>
          {[ordered.slice(0, half), ordered.slice(half)].map((row, r) => (
            <div key={r} className={`marquee ${r ? "rev" : ""}`} style={{ ["--dur" as string]: r ? "90s" : "80s" }}>
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1 ? true : undefined}>
                  {row.map((c, i) => (
                    <span key={c.id} className={`display whitespace-nowrap text-[clamp(2.2rem,1.4rem+3vw,4.6rem)] ${(i + r) % 2 ? "outline" : "text-ink"}`}>
                      {c.name.replace(/ (Ltd|Limited|Laboratories|Pharmaceuticals|Pharma India|India|Lifesciences|Healthcare)$/i, "")}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="container-x mt-10">
          <Link data-rv href={`/${locale}/companies`} className="btn btn-ghost h-13 px-6">
            {v.companies.more} <IconArrow />
          </Link>
        </div>
      </section>

      <Visit ctx={ctx} />

      <Faq ctx={ctx} />
    </>
  );
}

function Head({ eyebrow, lines, body, id, link }: { eyebrow: string; lines: string[]; body?: string; id: string; link?: { href: string; label: string } }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-8">
        <p data-rv className="eyebrow">
          {eyebrow}
        </p>
        <h2 id={id} className="scrub mt-5 text-h1">
          <Lines lines={lines} />
        </h2>
      </div>
      <div className="lg:col-span-4">
        {body && (
          <p data-rv style={{ ["--i" as string]: 3 }} className="text-lg leading-relaxed text-ink-2">
            {body}
          </p>
        )}
        {link && (
          <Link data-rv href={link.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald hover:underline">
            {link.label} <IconArrow />
          </Link>
        )}
      </div>
    </div>
  );
}

function Visit({ ctx }: { ctx: SiteContext }) {
  const { t, settings: s } = ctx;
  const v = t.v2;
  const tel = telHref(s.phone);
  const rows = [
    { k: v.visit.summer, val: "9:00 am – 10:00 pm" },
    { k: v.visit.winter, val: "9:30 am – 9:30 pm" },
    { k: v.visit.sunday, val: v.visit.closed },
  ];
  return (
    <section className="container-x pt-section" aria-labelledby="visit-h">
      <p data-rv className="eyebrow">
        {v.visit.eyebrow}
      </p>
      <h2 id="visit-h" className="scrub mt-5 text-h1">
        <Lines lines={t.v3.visit.lines} />
      </h2>
      <div className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div data-rv className="lg:col-span-7">
          <StoreVideo caption={t.location.videoCaption} />
        </div>
        <div data-rv style={{ ["--i" as string]: 2 }} className="panel p-7 lg:col-span-5">
          <p className="text-ink-2">{v.visit.body}</p>
          <div className="mt-6 flex items-center justify-between">
            <p className="font-semibold">{t.location.hours}</p>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-emerald">
              <OpenStatus labels={v.status} />
            </span>
          </div>
          <dl className="mt-3 divide-y divide-line border-y border-line">
            {rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between py-3.5">
                <dt className="text-ink-2">{r.k}</dt>
                <dd lang="en" className="font-mono text-[0.85rem]">
                  {r.val}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-sm text-ink-2">{[s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {s.maps_url && (
              <a href={s.maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                {t.cta.directions} <IconArrow />
              </a>
            )}
            {tel && (
              <a href={tel} className="btn btn-ghost">
                <IconPhone /> {s.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
