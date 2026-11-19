import Link from "next/link";
import { fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { jsonLd } from "@/lib/seo";
import { COMPANIES } from "@/lib/companies";
import { IconArrow, IconWhatsApp, IconInfo } from "@/components/ui/Icons";
import { OfferCard } from "./OfferCard";
import { ClubForm } from "./ClubForm";

export function offerVars(ctx: SiteContext) {
  const s = ctx.settings;
  return { percent: s.offer_percent, min: s.offer_min_amount.toLocaleString("en-IN"), code: s.offer_code, extra: s.club_extra_percent };
}

/** "Send your prescription / medicine list on WhatsApp" band. */
export function PrescriptionBand({ ctx }: { ctx: SiteContext }) {
  const { t, settings, locale } = ctx;
  const r = t.mkt.rx;
  const photo = waLink(settings.whatsapp, r.msgPhoto);
  const list = waLink(settings.whatsapp, r.msgList);
  if (!photo || !list) return null;
  return (
    <section className="container-x pt-section" aria-labelledby="rx-h">
      <div className="grid gap-8 rounded-panel border border-line bg-white p-6 sm:p-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <p className="eyebrow">{r.eyebrow}</p>
          <h2 id="rx-h" className="mt-3 text-h2">{r.title}</h2>
          <p className="mt-3 text-ink-2">{r.body}</p>
          <p className="mt-5 flex gap-2 text-sm text-ink-2">
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-emerald" /> {r.note}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
          {[
            { href: photo, title: r.photo, body: r.photoBody, track: "rx_photo" },
            { href: list, title: r.list, body: r.listBody, track: "rx_list" },
          ].map((c) => (
            <a key={c.track} href={c.href} target="_blank" rel="noopener noreferrer" data-track-label={c.track} className="group flex flex-col justify-between gap-6 rounded-card bg-forest p-6 text-ivory transition hover:bg-forest-deep">
              <IconWhatsApp className="h-7 w-7" />
              <span>
                <span className="block font-display text-lg font-semibold">{c.title}</span>
                <span className="mt-1 block text-sm text-ivory/75">{c.body}</span>
              </span>
              <IconArrow className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
          ))}
          <div className="rounded-card bg-mint p-5 sm:col-span-2">
            <p className="font-semibold text-forest">{r.rangeTitle}</p>
            <p className="mt-1 text-sm text-ink">{r.rangeBody}</p>
            <Link href={`/${locale}/companies`} className="link-u mt-2 inline-flex items-center gap-1 text-sm font-semibold text-forest">
              {fmt(t.mkt.companies.teaser, { n: COMPANIES.length })} <IconArrow />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Offer reveal + Shanker Club sign-up, side by side. */
export function OfferAndClub({ ctx, source, headingId = "offer-h" }: { ctx: SiteContext; source: string; headingId?: string }) {
  const { t, settings: s, locale } = ctx;
  if (!s.offer_enabled && !s.club_enabled) return null;
  const v = offerVars(ctx);
  const o = t.mkt.offer;
  const c = t.mkt.club;
  const offerWa = waLink(s.whatsapp, fmt(o.waMessage, v));
  return (
    <section className="container-x pt-section" aria-labelledby={headingId} id="offer">
      <h2 id={headingId} className="sr-only">
        {fmt(o.title, v)}
      </h2>
      <div className={`grid gap-4 ${s.offer_enabled && s.club_enabled ? "lg:grid-cols-2" : ""}`}>
        {s.offer_enabled && (
          <OfferCard
            code={s.offer_code}
            percent={s.offer_percent}
            waHref={offerWa}
            labels={{ ...o, title: fmt(o.title, v), body: fmt(o.body, v) }}
          />
        )}
        {s.club_enabled && (
          <div className="rounded-panel border border-line bg-white p-7 sm:p-9" id="club">
            <p className="eyebrow">{c.eyebrow}</p>
            <p className="mt-4 font-display text-h2 font-semibold">{c.title}</p>
            <p className="mt-3 text-ink-2">{s.club_extra_percent > 0 ? fmt(c.bodyPercent, v) : c.body}</p>
            <div className="mt-6">
              <ClubForm
                locale={locale}
                labels={c}
                whatsapp={s.whatsapp || null}
                source={source}
                privacyHref={`/${locale}/privacy`}
                policyLabel={t.footer.privacy}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function OfferTerms({ ctx }: { ctx: SiteContext }) {
  const v = offerVars(ctx);
  const o = ctx.t.mkt.offer;
  return (
    <div className="rounded-card border border-line bg-white p-6">
      <h2 className="text-h3">{o.termsTitle}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
        {o.terms.map((x) => (
          <li key={x}>{fmt(x, v)}</li>
        ))}
      </ul>
    </div>
  );
}

/** FAQ with FAQPage structured data. */
export function Faq({ ctx }: { ctx: SiteContext }) {
  const v = offerVars(ctx);
  const f = ctx.t.mkt.faq;
  const items = f.items
    .filter((it, i) => !(i === 2 && !ctx.settings.offer_enabled) && !(i === 3 && !ctx.settings.club_enabled))
    .map((it) => ({ q: fmt(it.q, v), a: fmt(it.a, v) }));
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
  return (
    <section className="container-x pt-section" aria-labelledby="faq-h">
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{f.eyebrow}</p>
          <h2 id="faq-h" className="mt-3 text-h2">{f.title}</h2>
        </div>
        <div className="divide-y divide-line border-y border-line lg:col-span-8">
          {items.map((it) => (
            <details key={it.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                {it.q}
                <span aria-hidden="true" className="text-xl text-emerald transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-ink-2">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </section>
  );
}

/** Strip of company names linking to the companies page. */
export function CompaniesTeaser({ ctx }: { ctx: SiteContext }) {
  const { t, locale } = ctx;
  const names = ["Sun Pharmaceutical Industries", "Cipla", "Mankind Pharma", "Abbott India", "Dr. Reddy's Laboratories", "Lupin", "Alkem Laboratories", "Torrent Pharmaceuticals", "Zydus Lifesciences", "Intas Pharmaceuticals", "Glenmark Pharmaceuticals", "Pfizer Ltd", "GSK Pharmaceuticals", "Sanofi India", "Micro Labs", "Novo Nordisk India"];
  return (
    <section className="container-x pt-section" aria-labelledby="co-h">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow">{t.mkt.companies.eyebrow}</p>
          <h2 id="co-h" className="mt-3 text-h2">{fmt(t.mkt.companies.teaser, { n: COMPANIES.length })}</h2>
          <p className="mt-3 text-ink-2">{t.mkt.rx.rangeBody}</p>
        </div>
        <Link href={`/${locale}/companies`} className="link-u inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-forest">
          {t.mkt.companies.viewAll} <IconArrow />
        </Link>
      </div>
      <ul lang="en" className="mt-8 flex flex-wrap gap-2">
        {names.map((n) => {
          const c = COMPANIES.find((x) => x.name === n)!;
          return (
            <li key={n}>
              <Link href={`/${locale}/products?q=${encodeURIComponent(c.q)}`} className="inline-block rounded-full border border-line bg-white px-4 py-2 text-sm text-ink transition hover:border-forest">
                {n}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
