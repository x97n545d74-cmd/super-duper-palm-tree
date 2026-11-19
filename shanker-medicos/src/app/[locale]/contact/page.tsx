import { siteContext } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { telHref } from "@/lib/settings";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { LocationDetails } from "@/components/site/LocationDetails";
import { StoreVideo } from "@/components/home/StoreVideo";
import { IconPhone, IconWhatsApp, IconInfo } from "@/components/ui/Icons";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">) {
  const { locale, t } = await siteContext((await params).locale);
  return pageMeta({ locale, path: "/contact", title: t.meta.contactTitle, description: t.meta.contactDescription });
}

export default async function Contact({ params }: PageProps<"/[locale]/contact">) {
  const ctx = await siteContext((await params).locale);
  const { t, locale, settings: s, waGeneral } = ctx;
  const tel = telHref(s.phone);
  const fullAddress = [s.business_name, s.address, s.city, s.state, s.postal_code, "India"].filter(Boolean).join(", ");
  const mapSrc = s.address ? `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed` : null;
  return (
    <div className="container-x pb-8 pt-10">
      <Breadcrumbs
        label={t.nav.breadcrumb}
        items={[
          { name: t.nav.home, href: `/${locale}` },
          { name: t.nav.contact, href: `/${locale}/contact` },
        ]}
      />
      <p className="eyebrow mt-10">{t.contact.eyebrow}</p>
      <h1 className="mt-4 text-h1">{t.contact.title}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-2">{t.contact.lead}</p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-panel bg-forest p-8 text-ivory">
          <div>
            <IconWhatsApp className="h-7 w-7" />
            <h2 className="mt-6 text-h3">{t.contact.waTitle}</h2>
            <p className="mt-2 text-ivory/70">{t.contact.waBody}</p>
          </div>
          <div className="mt-8">
            {waGeneral ? (
              <a href={waGeneral} target="_blank" rel="noopener noreferrer" className="btn btn-light">
                {t.cta.whatsappUs}
              </a>
            ) : (
              <p className="text-sm text-ivory/70">{t.cta.notConfigured}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-panel border border-line bg-white p-8">
          <div>
            <IconPhone className="h-7 w-7 text-emerald" />
            <h2 className="mt-6 text-h3">{t.contact.callTitle}</h2>
            <p className="mt-2 text-ink-2">{t.contact.callBody}</p>
          </div>
          <div className="mt-8">
            {tel ? (
              <a href={tel} className="btn btn-primary">
                {s.phone}
              </a>
            ) : (
              <p className="text-sm text-ink-2">{t.location.pending}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-h2">{t.contact.visitTitle}</h2>
          <LocationDetails ctx={ctx} className="mt-6" />
          <p className="mt-8 flex gap-3 rounded-card border border-line bg-white p-4 text-sm text-ink-2">
            <IconInfo className="mt-0.5 h-4 w-4 shrink-0 text-emerald" />
            {t.contact.noPrescriptions}
          </p>
        </div>
        <div className="space-y-6 lg:col-span-7">
          {mapSrc && (
            <iframe
              title={t.contact.mapTitle}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="aspect-[4/3] w-full rounded-panel border border-line"
            />
          )}
          <StoreVideo caption={t.location.videoCaption} />
        </div>
      </div>
    </div>
  );
}
