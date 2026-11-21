import Link from "next/link";
import { fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { PUBLISH_ONLY } from "@/lib/env";
import { GENERIC_OFFER_PERCENT } from "@/lib/generics";
import { HOURS, fmtTime } from "@/lib/hours";
import { IconWhatsApp } from "@/components/ui/Icons";
import { OfferCard } from "./OfferCard";
import { ClubForm } from "./ClubForm";

export function offerVars(ctx: SiteContext) {
  const s = ctx.settings;
  return { percent: s.offer_percent, min: s.offer_min_amount.toLocaleString("en-IN"), code: s.offer_code, extra: s.club_extra_percent, gpercent: GENERIC_OFFER_PERCENT, winter: `${fmtTime(HOURS.winter.open)} – ${fmtTime(HOURS.winter.close)}`, summer: `${fmtTime(HOURS.summer.open)} – ${fmtTime(HOURS.summer.close)}` };
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
          <div data-rv className="panel relative overflow-hidden p-7 sm:p-9" id="club" style={{ ["--i" as string]: 1 }}>
            <p className="eyebrow">{c.eyebrow}</p>
            <p className="display mt-4 text-[clamp(1.9rem,1.2rem+1.8vw,2.8rem)] leading-[.95]">{fmt(c.title, v)}</p>
            <p className="mt-3 text-ink-2">{s.club_extra_percent > 0 ? fmt(c.bodyPercent, v) : c.body}</p>
            {PUBLISH_ONLY ? (
              <div className="mt-6">
                <p className="text-sm text-ink-2">{c.waJoinBody}</p>
                {waLink(s.whatsapp, c.waJoinMessage) && (
                  <a href={waLink(s.whatsapp, c.waJoinMessage)!} target="_blank" rel="noopener noreferrer" data-track-label="club_join_whatsapp" className="btn btn-wa mt-5 h-12 px-6">
                    <IconWhatsApp className="h-5 w-5" /> {c.waJoin}
                  </a>
                )}
              </div>
            ) : (
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
            )}
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
    <div className="panel p-6">
      <h2 className="text-h3">{o.termsTitle}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
        {o.terms
          .filter((x) => !(x.includes("{extra}") && (!ctx.settings.club_enabled || !ctx.settings.club_extra_percent)))
          .map((x) => (
            <li key={x}>{fmt(x, v)}</li>
          ))}
      </ul>
    </div>
  );
}

/** FAQ items in the visitor's language with the live values filled in (offer, club, hours). */
export function faqItems(ctx: SiteContext) {
  const v = offerVars(ctx);
  return ctx.t.mkt.faq.items
    .filter((it, i) => !(i === 2 && !ctx.settings.offer_enabled) && !(i === 3 && !ctx.settings.club_enabled))
    .map((it) => ({ q: fmt(it.q, v), a: fmt(it.a, v) }));
}

/** FAQPage structured data: published once, on /[locale]/faq. */
export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}

/** FAQ accordion (homepage, offers). The full list with structured data lives on /[locale]/faq. */
export function Faq({ ctx, limit }: { ctx: SiteContext; limit?: number }) {
  const f = ctx.t.mkt.faq;
  const all = faqItems(ctx);
  const items = limit ? all.slice(0, limit) : all;
  return (
    <section className="container-x pt-section" aria-labelledby="faq-h">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow">{f.eyebrow}</p>
          <h2 id="faq-h" className="mt-3 text-h2">{f.title}</h2>
          {limit && all.length > limit && (
            <Link href={`/${ctx.locale}/faq`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald hover:underline">
              {ctx.t.v4.seeAll} ({all.length}) →
            </Link>
          )}
        </div>
        <div className="panel divide-y divide-line px-6 lg:col-span-8">
          {items.map((it) => (
            <details key={it.q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
                {it.q}
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg text-emerald transition-transform duration-[420ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-ink-2">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
