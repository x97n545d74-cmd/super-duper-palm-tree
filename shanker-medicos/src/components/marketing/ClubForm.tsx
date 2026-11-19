"use client";

import { keepValues } from "@/lib/use-keep-form";
import { useActionState, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { joinClubAction } from "@/app/[locale]/actions";
import { getAttribution, track } from "@/lib/analytics";
import { IconWhatsApp } from "@/components/ui/Icons";

type Labels = {
  name: string; phone: string; email: string; consent: string; privacy: string; submit: string;
  success: string; successBack: string; codeHow: string; saveOnWa: string; waMessage: string;
};

/** Shanker Club sign-up: mobile (required), name + email (optional), explicit consent. */
export function ClubForm({
  locale,
  labels,
  whatsapp,
  source,
  privacyHref,
  policyLabel,
}: {
  locale: string;
  labels: Labels;
  whatsapp: string | null;
  source: string;
  privacyHref: string;
  policyLabel: string;
}) {
  const [state, action, pending] = useActionState(joinClubAction, null);
  const id = useId();
  const form = useRef<HTMLFormElement>(null);

  // Attribution fields filled in the browser just before submitting.
  const fillAttribution = () => {
    const a = getAttribution();
    const f = form.current;
    if (!f) return;
    for (const k of ["utm_source", "utm_medium", "utm_campaign"] as const) {
      const el = f.elements.namedItem(k) as HTMLInputElement | null;
      if (el) el.value = a[k] ?? "";
    }
  };

  useEffect(() => {
    if (state?.ok && state.isNew) {
      track("sign_up", { method: "shanker_club", source });
      track("generate_lead", { source });
    }
  }, [state, source]);

  if (state?.ok) {
    const n = whatsapp?.replace(/\D/g, "");
    const wa = n ? `https://wa.me/${n.length === 10 ? "91" + n : n}?text=${encodeURIComponent(labels.waMessage.replace("{code}", state.code))}` : null;
    return (
      <div role="status" className="rounded-card border border-emerald/30 bg-mint p-6">
        <p className="font-semibold text-emerald">{state.isNew ? labels.success : labels.successBack}</p>
        <p lang="en" className="mt-3 font-mono text-3xl font-semibold tracking-[0.12em] text-emerald" data-testid="member-code">
          {state.code}
        </p>
        <p className="mt-3 text-sm text-ink">{labels.codeHow}</p>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" data-track-label="club_save_code" className="btn btn-wa mt-5">
            <IconWhatsApp className="h-5 w-5" /> {labels.saveOnWa}
          </a>
        )}
      </div>
    );
  }

  const err = state && !state.ok ? state : null;
  return (
    <form
      ref={form}
      onSubmit={(e) => {
        fillAttribution();
        keepValues(action)(e);
      }}
      className="space-y-4"
      noValidate
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="utm_source" />
      <input type="hidden" name="utm_medium" />
      <input type="hidden" name="utm_campaign" />
      {/* honeypot */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="label">
          {labels.phone} *
        </label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-control border border-r-0 border-line bg-ivory px-3 text-ink-2">+91</span>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            required
            maxLength={14}
            aria-invalid={!!err?.errors?.phone}
            className="field rounded-l-none"
          />
        </div>
        {err?.errors?.phone && <p className="mt-1 text-sm text-danger">{err.errors.phone}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="label">
            {labels.name}
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" maxLength={80} className="field" />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="label">
            {labels.email}
          </label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" maxLength={120} aria-invalid={!!err?.errors?.email} className="field" />
          {err?.errors?.email && <p className="mt-1 text-sm text-danger">{err.errors.email}</p>}
        </div>
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-forest" />
        <span>{labels.consent}</span>
      </label>
      {err?.errors?.consent_marketing && <p className="text-sm text-danger">{err.errors.consent_marketing}</p>}
      {err && !err.errors && (
        <p role="alert" className="text-sm text-danger">
          {err.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary h-12 w-full disabled:opacity-60 sm:w-auto sm:px-8">
        {pending ? "…" : labels.submit}
      </button>
      <p className="text-xs text-ink-2">
        {labels.privacy}{" "}
        <Link href={privacyHref} className="underline">
          {policyLabel}
        </Link>
      </p>
    </form>
  );
}
