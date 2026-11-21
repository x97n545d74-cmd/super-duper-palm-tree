import type { SiteContext } from "@/lib/site";
import { HoursList } from "@/components/v2/HoursList";
import { telHref } from "@/lib/settings";
import { IconClock, IconMail, IconPhone, IconPin, IconWhatsApp, IconArrow } from "@/components/ui/Icons";

/** Store details from admin settings. Missing values show a neutral "to be added" line, never invented data. */
export function LocationDetails({ ctx, className = "" }: { ctx: SiteContext; className?: string }) {
  const { t, settings: s, waGeneral } = ctx;
  const tel = telHref(s.phone);
  const address = [s.address, s.city, s.state, s.postal_code].filter(Boolean).join(", ");
  const anyMissing = !s.address || !s.phone || !s.opening_hours;
  const pending = <span className="text-ink-2">{t.location.pending}</span>;
  return (
    <div className={className}>
      <dl className="border-b border-line">
        <Row icon={<IconPin />} label={t.location.address}>
          {s.address ? address : <>{address}<br />{pending}</>}
        </Row>
        <Row icon={<IconPhone />} label={t.location.phone}>
          {tel ? <a className="link-u" href={tel}>{s.phone}</a> : pending}
        </Row>
        <Row icon={<IconWhatsApp className="h-4 w-4" />} label={t.location.whatsapp}>
          {waGeneral ? (
            <a className="link-u" href={waGeneral} target="_blank" rel="noopener noreferrer">{s.whatsapp}</a>
          ) : (
            pending
          )}
        </Row>
        <Row icon={<IconClock />} label={t.location.hours}>
          <HoursList t={t} compact />
        </Row>
        {s.email && (
          <Row icon={<IconMail />} label={t.location.email}>
            <a className="link-u" href={`mailto:${s.email}`}>{s.email}</a>
          </Row>
        )}
      </dl>
      {anyMissing && <p className="mt-4 text-sm text-ink-2">{t.location.pendingNote}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {s.maps_url && (
          <a href={s.maps_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {t.cta.directions} <IconArrow />
          </a>
        )}
        {tel && (
          <a href={tel} className="btn btn-ghost">
            <IconPhone /> {t.cta.call}
          </a>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="relative border-t border-line py-4 pl-11">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-2">
        <span className="absolute left-0 top-[1.05rem] text-emerald" aria-hidden="true">
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-1 text-ink">{children}</dd>
    </div>
  );
}
