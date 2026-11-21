import Link from "next/link";
import { fmt } from "@/i18n";
import type { SiteContext } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { GENERIC_COMPANIES, GENERIC_HIGHLIGHT, GENERIC_OFFER_PERCENT, shortCo } from "@/lib/generics";
import { IconArrow, IconWhatsApp } from "@/components/ui/Icons";
import { Lines } from "./Lines";

/** Generic medicines: the 30% offer on selected generics and the generic makers (night cinematic). */
export function Generics({ ctx, id = "generics" }: { ctx: SiteContext; id?: string }) {
  const { t, locale, settings: s } = ctx;
  const g = t.gen;
  const percent = GENERIC_OFFER_PERCENT;
  const ask = waLink(s.whatsapp, fmt(g.askMsg, { percent }));
  return (
    <section id={id} className="container-x scroll-mt-28 pt-section" aria-labelledby={`${id}-h`}>
      <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p data-rv className="eyebrow">
            {g.eyebrow}
          </p>
          <h2 id={`${id}-h`} className="scrub mt-5 text-h1">
            <Lines lines={g.lines.map((l) => fmt(l, { percent }))} />
          </h2>
          <p data-rv style={{ ["--i" as string]: 3 }} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            {fmt(g.body, { percent })}
          </p>
          <div data-rv style={{ ["--i" as string]: 5 }} className="mt-8 flex flex-wrap gap-3">
            {ask && (
              <a href={ask} target="_blank" rel="noopener noreferrer" data-track-label="generics_ask" className="btn btn-wa h-13 px-6">
                <IconWhatsApp className="h-5 w-5" /> {g.ask}
              </a>
            )}
            <Link href={`/${locale}/offers#generic-offer`} className="btn btn-ghost h-13 px-6">
              {t.mkt.offer.termsTitle} <IconArrow />
            </Link>
          </div>
        </div>
        <div data-rv style={{ ["--i" as string]: 2 }} aria-hidden="true" className="relative select-none lg:col-span-5 lg:text-right">
          <span lang="en" className="display outline block text-[clamp(8rem,4rem+14vw,17rem)] leading-[.8]">
            {percent}%
          </span>
          <span className="display mt-2 block text-[clamp(2rem,1rem+3vw,3.6rem)] text-emerald">{g.bigLabel}</span>
        </div>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p data-rv className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ink-2">
          {g.makers}
        </p>
        <ul lang="en" className="mt-5 flex flex-wrap gap-2.5">
          {GENERIC_COMPANIES.map((name, i) => {
            const hot = GENERIC_HIGHLIGHT.includes(name);
            const wa = waLink(s.whatsapp, fmt(t.v2.companies.askMsg, { name: `${name} (generic)` }));
            return (
              <li key={name} data-rv style={{ ["--i" as string]: i % 8 }}>
                <a
                  href={wa || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track-label="generic_company"
                  className={`display inline-flex h-14 items-center rounded-full px-6 text-[1.35rem] transition-colors duration-200 sm:h-16 sm:text-[1.6rem] ${hot ? "bg-emerald text-black hover:bg-[#2ad68f]" : "border border-line text-ink hover:border-ink"}`}
                >
                  {shortCo(name)}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The generic offer as a card for /offers, with its terms. */
export function GenericOfferCard({ ctx }: { ctx: SiteContext }) {
  const { t, settings: s } = ctx;
  const g = t.gen;
  const percent = GENERIC_OFFER_PERCENT;
  const ask = waLink(s.whatsapp, fmt(g.askMsg, { percent }));
  return (
    <div id="generic-offer" data-rv className="panel relative scroll-mt-28 overflow-hidden p-7 sm:p-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <span className="chip !text-emerald">{g.eyebrow}</span>
          <p className="display mt-5 text-[clamp(2rem,1.2rem+2.4vw,3.4rem)] leading-[.95]">
            <span className="hl">{fmt(g.title, { percent })}</span>
          </p>
          <p className="mt-4 max-w-lg text-ink-2">{fmt(g.offerBody, { percent })}</p>
          {ask && (
            <a href={ask} target="_blank" rel="noopener noreferrer" data-track-label="generic_offer_whatsapp" className="btn btn-wa mt-6">
              <IconWhatsApp className="h-5 w-5" /> {g.ask}
            </a>
          )}
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm text-ink-2 md:col-span-5">
          {g.terms.map((x) => (
            <li key={x}>{fmt(x, { percent })}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
