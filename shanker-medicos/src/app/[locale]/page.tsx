import Link from "next/link";
import { siteContext, type SiteContext } from "@/lib/site";
import { catalogue } from "@/lib/data";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { telHref } from "@/lib/settings";
import { STOCK } from "@/lib/stock";
import { IconArrow, IconWhatsApp, IconPhone } from "@/components/ui/Icons";
import { Faq, OfferAndClub } from "@/components/marketing/Sections";
import { IntroVideo } from "@/components/v2/IntroVideo";
import { HeroVideo } from "@/components/v2/HeroVideo";
import { Split, splitLength } from "@/components/v2/Split";
import { OpenStatus } from "@/components/v2/OpenStatus";
import { StockPanel } from "@/components/v2/StockPanel";
import { CompanyFinder } from "@/components/v2/CompanyFinder";
import { StoreVideo } from "@/components/home/StoreVideo";

export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/", title: t.meta.siteTitle, description: t.meta.siteDescription });
}

const indic = (l: string) => l !== "en";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s } = ctx;
  const v = t.v2;
  const companies = await catalogue.listCompanies();
  const nCompanies = Math.floor(companies.length / 10) * 10;
  const rxPhoto = waLink(s.whatsapp, t.mkt.rx.msgPhoto);
  const rxList = waLink(s.whatsapp, t.mkt.rx.msgList);
  const per = indic(locale);
  const l1 = v.hero.line1;
  const l2 = v.hero.word;
  const status = v.status;

  return (
    <>
      <IntroVideo labels={v.intro} />

      {/* HERO */}
      <section className="relative isolate overflow-hidden" aria-labelledby="hero-h">
        <div className="fields" aria-hidden="true">
          <i />
        </div>
        <div className="container-x relative z-10 grid grid-cols-1 gap-12 pb-8 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-16 lg:pt-20">
          <div className="lg:col-span-7 lg:pt-6">
            <div data-rv className="flex flex-wrap items-center gap-2">
              <span className="chip">{v.hero.chip}</span>
              <span className="chip !text-ink">
                <OpenStatus labels={status} />
              </span>
            </div>
            <h1 id="hero-h" className="mt-7 text-display">
              <span className="block">
                <Split text={l1} perWord={per} />
              </span>
              <span className="block text-emerald">
                <Split text={l2} perWord={per} start={splitLength(l1, per)} />
              </span>
              <span className="block">
                <Split text={v.hero.line2} perWord={per} start={splitLength(l1, per) + splitLength(l2, per)} />
              </span>
            </h1>
            <p data-rv style={{ ["--i" as string]: 8 }} className="mt-7 max-w-[34rem] text-[1.1rem] leading-relaxed text-ink-2">
              {v.hero.body}
            </p>
            <div data-rv style={{ ["--i" as string]: 10 }} className="mt-9 flex flex-wrap gap-3">
              {rxPhoto && (
                <a href={rxPhoto} target="_blank" rel="noopener noreferrer" data-track-label="hero_rx" className="btn btn-wa h-13 px-6 text-[1rem]">
                  <IconWhatsApp className="h-5 w-5" /> {v.hero.ctaRx}
                </a>
              )}
              <Link href={`/${locale}/products`} className="btn btn-ghost h-13 px-6 text-[1rem]">
                {v.hero.ctaStock} <IconArrow />
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:pt-10">
            {/* No entrance here: the entry video morphs onto this frame, so it must already be in place. */}
            <HeroVideo alt={v.hero.videoAlt} replay={v.hero.replay} />
            <HeroCard ctx={ctx} n={nCompanies} />
          </div>
        </div>
      </section>

      {/* WHAT WE STOCK */}
      <section className="container-x pt-section" aria-labelledby="stock-h" id="stock">
        <Head eyebrow={v.stock.eyebrow} title={v.stock.title} body={v.stock.body} id="stock-h" per={per} link={{ href: `/${locale}/products`, label: v.stock.all }} />
        <div data-rv className="mt-10">
          <StockPanel
            labels={{ ask: v.stock.ask, rx: v.stock.rx, pick: v.stock.pick, of: v.stock.of }}
            items={STOCK.map((f) => ({ id: f.id, icon: f.icon, rx: f.rx, name: f.name[locale], line: f.line[locale], wa: waLink(s.whatsapp, fmt(v.stock.askMsg, { form: f.name[locale].toLowerCase() })) }))}
          />
        </div>
      </section>

      {/* ORDER ON WHATSAPP */}
      <section className="container-x pt-section" aria-labelledby="order-h">
        <Head eyebrow={v.order.eyebrow} title={v.order.title} id="order-h" per={per} />
        <ol className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-3">
          {v.order.steps.map((st, i) => (
            <li key={st.t} data-rv style={{ ["--i" as string]: i * 2 }} className="panel relative overflow-hidden p-7">
              <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")} / 03</span>
              <p className="mt-10 text-h2 font-bold" style={{ fontStretch: "88%" }}>
                {st.t}
              </p>
              <p className="mt-2 text-ink-2">{st.b}</p>
              {i < 2 && <span aria-hidden="true" className="absolute right-6 top-7 hidden text-ink-2 md:block">→</span>}
            </li>
          ))}
        </ol>
        <div data-rv style={{ ["--i" as string]: 6 }} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {rxPhoto && (
              <a href={rxPhoto} target="_blank" rel="noopener noreferrer" data-track-label="rx_photo" className="btn btn-wa">
                <IconWhatsApp className="h-5 w-5" /> {v.order.photo}
              </a>
            )}
            {rxList && (
              <a href={rxList} target="_blank" rel="noopener noreferrer" data-track-label="rx_list" className="btn btn-ghost">
                {v.order.list}
              </a>
            )}
          </div>
          <p className="max-w-md text-sm text-ink-2">{v.order.note}</p>
        </div>
      </section>

      {/* OFFER (receipt) + CLUB */}
      <OfferAndClub ctx={ctx} source="homepage" />

      {/* COMPANIES */}
      <section className="container-x pt-section" aria-labelledby="co-h">
        <Head eyebrow={v.companies.eyebrow} title={v.companies.title} body={v.companies.body} id="co-h" per={per} link={{ href: `/${locale}/companies`, label: v.companies.more }} />
        <div data-rv className="mt-10">
          <CompanyFinder
            limit={12}
            askHref={ctx.waGeneral}
            labels={{ search: v.companies.search, none: v.companies.none, indian: v.companies.indian, mnc: v.companies.mnc, ask: v.companies.ask, count: v.companies.count, all: v.companies.all }}
            companies={[...companies.filter((c) => c.featured), ...companies.filter((c) => !c.featured)].map((c) => ({ id: c.id, name: c.name, known: c.known, kind: c.kind, logo: c.logo_url, wa: waLink(s.whatsapp, fmt(v.companies.askMsg, { name: c.name })) }))}
          />
        </div>
        <div data-rv className="mt-6">
          <Link href={`/${locale}/companies`} className="btn btn-ghost">
            {v.companies.more} <IconArrow />
          </Link>
        </div>
      </section>

      {/* VISIT */}
      <Visit ctx={ctx} per={per} />

      <Faq ctx={ctx} />
    </>
  );
}

/** Hero stats card: crop-in pull-out on "100+", then the cursor presses the WhatsApp pill and a toast lands. */
function HeroCard({ ctx, n }: { ctx: SiteContext; n: number }) {
  const { t, settings: s } = ctx;
  const v = t.v2;
  const wa = waLink(s.whatsapp, t.mkt.rx.msgPhoto);
  return (
    <div data-rv-group className="relative z-10 mx-3 -mt-14 sm:mx-8 lg:-ml-10 lg:mr-10 lg:-mt-20">
      <div className="panel overflow-hidden">
        <div className="croppull p-5 sm:p-6" style={{ ["--cx" as string]: "16%", ["--cy" as string]: "52%" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.95rem] font-bold">{v.hero.cardTitle}</p>
              <p className="text-xs text-ink-2">{v.hero.cardSub}</p>
            </div>
            <span className="chip !h-7 !text-[0.66rem]">
              <OpenStatus labels={v.status} />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-5">
            <Stat value={`${n}+`} label={v.hero.companies} hero />
            <Stat value={String(STOCK.length)} label={v.hero.kinds} />
            {s.offer_enabled && <Stat value={`${s.offer_percent}%`} label={fmt(v.hero.offer, { min: s.offer_min_amount.toLocaleString("en-IN") })} />}
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" data-track-label="hero_card_rx" className="relative mt-5 flex h-11 items-center justify-between rounded-[12px] bg-mint px-4 text-sm font-semibold text-forest transition-colors hover:bg-[#d8e6ef]">
              <span className="flex items-center gap-2">
                <IconWhatsApp className="h-4 w-4 text-wa" /> {v.hero.ctaRx}
              </span>
              <IconArrow className="h-4 w-4" />
              {/* the AVRON cursor lands here */}
              <span className="cursor left-[38%] top-[55%]" style={{ ["--fx" as string]: "140px", ["--fy" as string]: "-120px" }} aria-hidden="true">
                <span className="ring" />
                <svg viewBox="0 0 24 24">
                  <path d="M4 2.5l15 8.2-6.6 1.6 3.9 6.9-2.7 1.5-3.9-6.9L5 18.6z" fill="#fff" stroke="#0b1220" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <span className="dot" />
              </span>
            </a>
          )}
        </div>
      </div>
      <div className="toast absolute -bottom-6 right-4 flex items-center gap-2 rounded-[14px] border border-line bg-white px-4 py-2.5 text-sm font-medium shadow-lift" style={{ ["--td" as string]: "3.3s" }}>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-open text-[0.7rem] text-white" aria-hidden="true">
          ✓
        </span>
        {v.hero.toast}
      </div>
    </div>
  );
}

function Stat({ value, label, hero = false }: { value: string; label: string; hero?: boolean }) {
  return (
    <div className="min-w-0">
      <p lang="en" className={`font-bold leading-none tracking-[-0.04em] ${hero ? "text-[2.4rem] text-emerald sm:text-[2.8rem]" : "text-[1.9rem] sm:text-[2.2rem]"}`} style={{ fontStretch: "80%" }}>
        {value}
      </p>
      <p className="mt-1.5 text-[0.75rem] leading-snug text-ink-2">{label}</p>
    </div>
  );
}

function Head({ eyebrow, title, body, id, link, per }: { eyebrow: string; title: string; body?: string; id: string; link?: { href: string; label: string }; per: boolean }) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p data-rv className="eyebrow">
          {eyebrow}
        </p>
        <h2 id={id} className="mt-4 text-h1">
          <Split text={title} perWord={per} />
        </h2>
        {body && (
          <p data-rv style={{ ["--i" as string]: 4 }} className="mt-4 max-w-2xl text-lg text-ink-2">
            {body}
          </p>
        )}
      </div>
      {link && (
        <Link data-rv href={link.href} className="link-u inline-flex shrink-0 items-center gap-2 self-start text-sm font-semibold text-emerald md:self-auto">
          {link.label} <IconArrow />
        </Link>
      )}
    </div>
  );
}

function Visit({ ctx, per }: { ctx: SiteContext; per: boolean }) {
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
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-rv className="eyebrow">
            {v.visit.eyebrow}
          </p>
          <h2 id="visit-h" className="mt-4 text-h1">
            <Split text={v.visit.title} perWord={per} />
          </h2>
          <p data-rv style={{ ["--i" as string]: 3 }} className="mt-4 text-lg text-ink-2">
            {v.visit.body}
          </p>
          <div data-rv style={{ ["--i" as string]: 5 }} className="panel mt-8 p-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{t.location.hours}</p>
              <span className="chip !text-ink">
                <OpenStatus labels={v.status} />
              </span>
            </div>
            <dl className="mt-4 divide-y divide-line border-t border-line">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between py-3 text-[0.95rem]">
                  <dt className="text-ink-2">{r.k}</dt>
                  <dd lang="en" className="font-mono text-[0.85rem]">
                    {r.val}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-ink-2">{[s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
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
        <div data-rv style={{ ["--i" as string]: 2 }} className="lg:col-span-7">
          <StoreVideo caption={t.location.videoCaption} />
        </div>
      </div>
    </section>
  );
}
