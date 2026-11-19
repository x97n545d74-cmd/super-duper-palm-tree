"use client";

import { keepValues } from "@/lib/use-keep-form";
import { useActionState } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import type { BusinessSettings } from "@/lib/types";
import { Field, Notice, SubmitButton } from "./ui";

export function SettingsForm({ settings }: { settings: BusinessSettings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, null);
  const e = state?.errors ?? {};
  type TextKey = { [K in keyof BusinessSettings]: BusinessSettings[K] extends string ? K : never }[keyof BusinessSettings];
  const input = (name: TextKey, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input id={name} name={name} defaultValue={settings[name]} className="field" aria-invalid={!!e[name]} {...props} />
  );
  return (
    <form onSubmit={keepValues(action)} className="space-y-8">
      <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
        <legend className="px-1 font-display text-lg font-semibold">Store</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name *" name="business_name" error={e.business_name}>
            {input("business_name", { required: true })}
          </Field>
          <Field label="Tagline" name="tagline" error={e.tagline}>
            {input("tagline")}
          </Field>
        </div>
        <Field label="Shop address" name="address" error={e.address} hint="Street, landmark and area. Shown on the website and in Google search data.">
          {input("address", { placeholder: "e.g. shop number, road, landmark" })}
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="City *" name="city" error={e.city}>
            {input("city", { required: true })}
          </Field>
          <Field label="State *" name="state" error={e.state}>
            {input("state", { required: true })}
          </Field>
          <Field label="PIN code" name="postal_code" error={e.postal_code}>
            {input("postal_code", { inputMode: "numeric", maxLength: 6 })}
          </Field>
        </div>
        <Field label="Opening hours" name="opening_hours" error={e.opening_hours} hint="One line per day range, e.g. “Mon–Sat: 9:00 am – 9:30 pm”.">
          <textarea id="opening_hours" name="opening_hours" defaultValue={settings.opening_hours} rows={3} className="field" />
        </Field>
      </fieldset>

      <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
        <legend className="px-1 font-display text-lg font-semibold">Contact</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone" name="phone" error={e.phone} hint="With area code, e.g. +91 98765 43210">
            {input("phone", { type: "tel" })}
          </Field>
          <Field label="WhatsApp number" name="whatsapp" error={e.whatsapp} hint="All Enquire buttons use this number. 10-digit numbers get +91 added.">
            {input("whatsapp", { type: "tel" })}
          </Field>
          <Field label="Email" name="email" error={e.email}>
            {input("email", { type: "email" })}
          </Field>
          <Field label="Google Maps link" name="maps_url" error={e.maps_url} hint="Open the shop in Google Maps → Share → Copy link.">
            {input("maps_url", { type: "url", placeholder: "https://maps.app.goo.gl/…" })}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
        <legend className="px-1 font-display text-lg font-semibold">Social media</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram link" name="instagram_url" error={e.instagram_url}>
            {input("instagram_url", { type: "url", placeholder: "https://instagram.com/…" })}
          </Field>
          <Field label="Facebook link" name="facebook_url" error={e.facebook_url}>
            {input("facebook_url", { type: "url", placeholder: "https://facebook.com/…" })}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
        <legend className="px-1 font-display text-lg font-semibold">Store offer</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="offer_enabled" defaultChecked={settings.offer_enabled} className="mt-1 h-4 w-4 accent-forest" />
          <span>
            <span className="font-medium">Show the offer on the website</span>
            <span className="block text-sm text-ink-2">Announcement bar, homepage, product pages and the Offers page.</span>
          </span>
        </label>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Discount %" name="offer_percent" error={e.offer_percent}>
            <input id="offer_percent" name="offer_percent" type="number" min={1} max={50} defaultValue={settings.offer_percent} className="field" />
          </Field>
          <Field label="Minimum bill (₹)" name="offer_min_amount" error={e.offer_min_amount}>
            <input id="offer_min_amount" name="offer_min_amount" type="number" min={0} step={50} defaultValue={settings.offer_min_amount} className="field" />
          </Field>
          <Field label="Offer code" name="offer_code" error={e.offer_code} hint="Customers reveal this code and show it at the counter.">
            <input id="offer_code" name="offer_code" defaultValue={settings.offer_code} className="field uppercase" maxLength={20} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
        <legend className="px-1 font-display text-lg font-semibold">Shanker Club (customer sign-ups)</legend>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="club_enabled" defaultChecked={settings.club_enabled} className="mt-1 h-4 w-4 accent-forest" />
          <span>
            <span className="font-medium">Collect sign-ups (mobile + optional email)</span>
            <span className="block text-sm text-ink-2">Each member gets a personal code (e.g. SM-7KQ2P) to show at the counter.</span>
          </span>
        </label>
        <Field label="Extra member discount %" name="club_extra_percent" error={e.club_extra_percent} hint="0 = don't state a number on the website (it says “extra discount”).">
          <input id="club_extra_percent" name="club_extra_percent" type="number" min={0} max={50} defaultValue={settings.club_extra_percent} className="field max-w-[10rem]" />
        </Field>
      </fieldset>

      <Notice state={state} />
      <SubmitButton pending={pending} className="btn btn-primary h-12 px-8">Save business details</SubmitButton>
    </form>
  );
}
