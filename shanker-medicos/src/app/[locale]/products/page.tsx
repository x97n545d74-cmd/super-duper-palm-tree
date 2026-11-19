import Link from "next/link";
import { siteContext } from "@/lib/site";
import { fmt } from "@/i18n";
import { pageMeta } from "@/lib/seo";
import { waLink } from "@/lib/whatsapp";
import { STOCK } from "@/lib/stock";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FormGlyph } from "@/components/v2/FormGlyph";
import { Split } from "@/components/v2/Split";
import { IconArrow, IconWhatsApp } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/products">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/products", title: t.v2.stock.pageTitle, description: t.v2.stock.pageDescription });
}

/** What we stock: kinds of medicine and care products, no medicine names (owner's instruction, 19 Nov 2026). */
export default async function StockPage({ params }: PageProps<"/[locale]/products">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s } = ctx;
  const v = t.v2.stock;
  const rxPhoto = waLink(s.whatsapp, t.mkt.rx.msgPhoto);
  return (
    <div className="relative isolate">
      <div className="fields" aria-hidden="true">
        <i />
      </div>
      <div className="container-x relative z-10 pb-8 pt-10">
        <Breadcrumbs
          label={t.nav.breadcrumb}
          items={[
            { name: t.nav.home, href: `/${locale}` },
            { name: t.v2.nav.stock, href: `/${locale}/products` },
          ]}
        />
        <p data-rv className="eyebrow mt-10">
          {v.eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl text-display">
          <Split text={v.title} perWord={locale !== "en"} />
        </h1>
        <p data-rv style={{ ["--i" as string]: 6 }} className="mt-6 max-w-2xl text-lg text-ink-2">
          {v.body}
        </p>
        {rxPhoto && (
          <div data-rv style={{ ["--i" as string]: 8 }} className="mt-8">
            <a href={rxPhoto} target="_blank" rel="noopener noreferrer" data-track-label="stock_rx" className="btn btn-wa h-13 px-6">
              <IconWhatsApp className="h-5 w-5" /> {t.v2.hero.ctaRx}
            </a>
          </div>
        )}

        <ul className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STOCK.map((f, i) => {
            const name = f.name[locale];
            const wa = waLink(s.whatsapp, fmt(v.askMsg, { form: name.toLowerCase() }));
            return (
              <li key={f.id} id={f.id} data-rv style={{ ["--i" as string]: i % 6 }} className="scroll-mt-28">
                <div className="panel flex h-full flex-col justify-between gap-8 p-6 sm:p-7">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="flex h-14 w-14 items-center justify-center rounded-[16px] border border-line bg-mint text-emerald">
                        <FormGlyph icon={f.icon} className="h-7 w-7" />
                      </span>
                      <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h2 className="mt-6 text-h2">{name}</h2>
                    <p className="mt-2 text-ink-2">{f.line[locale]}</p>
                    {f.rx && <p className="chip mt-4 !text-coral">{v.rx}</p>}
                  </div>
                  {wa && (
                    <a href={wa} target="_blank" rel="noopener noreferrer" data-track-label={`stock_${f.id}`} className="btn btn-ghost h-auto min-h-[46px] self-start whitespace-normal py-2.5 text-left">
                      <IconWhatsApp className="h-4 w-4 text-wa" /> {v.ask.replace("{form}", name.toLowerCase())}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div data-rv className="panel mt-10 flex flex-col items-start gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-h3">{t.v2.companies.title}</p>
            <p className="mt-1 text-ink-2">{t.v2.companies.body}</p>
          </div>
          <Link href={`/${locale}/companies`} className="btn btn-primary shrink-0">
            {t.v2.companies.more} <IconArrow />
          </Link>
        </div>
        <p className="mt-8 max-w-3xl text-xs text-ink-2">{t.mkt.rx.note}</p>
      </div>
    </div>
  );
}
