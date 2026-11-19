import Link from "next/link";
import { siteContext } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LogoMark } from "@/components/brand/Logo";
import { IconArrow } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/about", title: t.meta.aboutTitle, description: t.meta.aboutDescription });
}

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const { t, locale } = await siteContext((await params).locale);
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.about, href: `/${locale}/about` },
        ]}
      />
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">{t.about.eyebrow}</p>
          <h1 className="mt-4 text-display !text-[clamp(2.4rem,1.6rem+3.4vw,4.4rem)]">{t.about.title}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-2">{t.about.lead}</p>
        </div>
        <div className="flex items-center justify-center rounded-panel bg-forest p-12 text-ivory lg:col-span-5">
          <div className="text-center">
            <LogoMark className="mx-auto h-28 w-28" />
            <p className="mt-8 font-display text-2xl font-semibold tracking-tight">{t.brand.tagline}</p>
            <p className="mt-2 text-ivory/65">{t.brand.secondary}</p>
          </div>
        </div>
      </div>
      <div className="mt-section grid gap-10 border-t border-line pt-12 md:grid-cols-3">
        {t.about.sections.map((s, i) => (
          <section key={s.title}>
            <span className="font-mono text-xs text-emerald">{String(i + 1).padStart(2, "0")}</span>
            <h2 className="mt-3 text-h3">{s.title}</h2>
            <p className="mt-3 leading-relaxed text-ink-2">{s.body}</p>
          </section>
        ))}
      </div>
      <div className="mt-16 flex flex-wrap gap-3">
        <Link href={`/${locale}/products`} className="btn btn-primary h-12 px-6">
          {t.cta.explore} <IconArrow />
        </Link>
        <Link href={`/${locale}/contact`} className="btn btn-ghost h-12 px-6">
          {t.cta.contact}
        </Link>
      </div>
    </div>
  );
}
