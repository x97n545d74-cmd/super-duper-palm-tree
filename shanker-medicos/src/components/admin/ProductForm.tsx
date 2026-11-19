"use client";

import { keepValues } from "@/lib/use-keep-form";
import { useActionState, useState } from "react";
import { saveProductAction, deleteProductAction } from "@/app/admin/actions";
import type { Category, Product } from "@/lib/types";
import { AVAILABILITY, PACK_STYLES } from "@/lib/types";
import { Field, Notice, SubmitButton } from "./ui";
import { ProductArt } from "@/components/brand/ProductArt";

const AVAIL_LABEL: Record<string, string> = {
  unconfirmed: "Not confirmed (shows “Ask for availability”)",
  in_stock: "In stock",
  limited: "Limited stock",
  on_order: "Available on order",
  out_of_stock: "Currently unavailable",
};

export function ProductForm({ product, categories, created }: { product: Product | null; categories: Category[]; created?: boolean }) {
  const [state, action, pending] = useActionState(saveProductAction, created ? { ok: true, message: "Product added. It is live on the website if “Show on website” is ticked." } : null);
  const [style, setStyle] = useState(product?.pack_style ?? "box");
  const [preview, setPreview] = useState<string | null>(product?.image_url ?? null);
  const e = state?.errors ?? {};
  const top = categories.filter((c) => !c.parent_id);
  const kids = (id: string) => categories.filter((c) => c.parent_id === id);

  return (
    <div className="grid gap-10 xl:grid-cols-[1fr_300px]">
      <form onSubmit={keepValues(action)} className="space-y-8" encType="multipart/form-data">
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="image_url" value={product?.image_url ?? ""} />
        <Notice state={state} />

        <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
          <legend className="px-1 font-display text-lg font-semibold">Basic details</legend>
          <Field label="Product name *" name="name" error={e.name} hint="Exactly as on the pack, e.g. “Dolo 650”.">
            <input id="name" name="name" defaultValue={product?.name} required maxLength={140} className="field" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand *" name="brand" error={e.brand}>
              <input id="brand" name="brand" defaultValue={product?.brand} required maxLength={80} className="field" />
            </Field>
            <Field label="Pack size *" name="pack_size" error={e.pack_size} hint="e.g. Strip of 15 tablets, 100 ml bottle">
              <input id="pack_size" name="pack_size" defaultValue={product?.pack_size} required maxLength={80} className="field" />
            </Field>
            <Field label="Manufacturer" name="manufacturer" error={e.manufacturer}>
              <input id="manufacturer" name="manufacturer" defaultValue={product?.manufacturer} maxLength={140} className="field" />
            </Field>
            <Field label="Generic name / composition" name="generic_name" error={e.generic_name} hint="Helps customers search by salt name.">
              <input id="generic_name" name="generic_name" defaultValue={product?.generic_name} maxLength={240} className="field" />
            </Field>
          </div>
          <Field label="Category" name="category_id" error={e.category_id}>
            <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="field">
              <option value="">— No category —</option>
              {top.map((c) => (
                <optgroup key={c.id} label={c.name_en}>
                  <option value={c.id}>{c.name_en}</option>
                  {kids(c.id).map((k) => (
                    <option key={k.id} value={k.id}>
                      {c.name_en} › {k.name_en}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </fieldset>

        <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
          <legend className="px-1 font-display text-lg font-semibold">Availability and prescription</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Availability" name="availability" error={e.availability} hint="Only choose “In stock” if you have checked.">
              <select id="availability" name="availability" defaultValue={product?.availability ?? "unconfirmed"} className="field">
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {AVAIL_LABEL[a]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Prescription" name="rx_class" error={e.rx_class} hint="Set by the pharmacist.">
              <select id="rx_class" name="rx_class" defaultValue={product?.rx_class ?? "unverified"} className="field">
                <option value="unverified">Not checked yet (shows “Ask the pharmacist”)</option>
                <option value="otc">Not required (OTC)</option>
                <option value="rx">Prescription required</option>
              </select>
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
          <legend className="px-1 font-display text-lg font-semibold">Description</legend>
          <Field label="Short description" name="description" error={e.description} hint="Factual only: what it is. No claims about what it treats.">
            <textarea id="description" name="description" defaultValue={product?.description} rows={3} maxLength={1200} className="field" />
          </Field>
          <Field label="Product information" name="information" error={e.information} hint="Storage, pack contents, warnings printed on the pack. Do not add dosage advice.">
            <textarea id="information" name="information" defaultValue={product?.information} rows={4} maxLength={2400} className="field" />
          </Field>
        </fieldset>

        <fieldset className="space-y-5 rounded-card border border-line bg-white p-6">
          <legend className="px-1 font-display text-lg font-semibold">Image</legend>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="h-36 w-36 shrink-0 overflow-hidden rounded-card border border-line bg-white">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Product image preview" className="h-full w-full object-contain" />
              ) : (
                <ProductArt style={style} seed={product?.brand || product?.name || "new"} className="h-full w-full" />
              )}
            </div>
            <div className="flex-1 space-y-4">
              <Field label="Upload a photo" name="image" hint="JPG, PNG or WebP, up to 4 MB. A plain white background looks best.">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-4 file:py-2 file:font-semibold file:text-forest"
                  onChange={(ev) => {
                    const f = ev.target.files?.[0];
                    setPreview(f ? URL.createObjectURL(f) : product?.image_url ?? null);
                  }}
                />
              </Field>
              {product?.image_url && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="remove_image" className="h-4 w-4 accent-forest" onChange={(ev) => setPreview(ev.target.checked ? null : product.image_url)} /> Remove the current photo
                </label>
              )}
              <Field label="Illustration (used when there is no photo)" name="pack_style">
                <select id="pack_style" name="pack_style" value={style} onChange={(ev) => setStyle(ev.target.value as typeof style)} className="field max-w-xs">
                  {PACK_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-card border border-line bg-white p-6">
          <legend className="px-1 font-display text-lg font-semibold">Visibility</legend>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="published" defaultChecked={product?.published ?? true} className="mt-1 h-4 w-4 accent-forest" />
            <span>
              <span className="font-medium">Show on website</span>
              <span className="block text-sm text-ink-2">Untick to hide it without deleting.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="mt-1 h-4 w-4 accent-forest" />
            <span>
              <span className="font-medium">Feature on the homepage</span>
              <span className="block text-sm text-ink-2">Up to 8 featured products are shown.</span>
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" name="needs_review" defaultChecked={product?.needs_review ?? false} className="mt-1 h-4 w-4 accent-forest" />
            <span>
              <span className="font-medium">Information needs checking</span>
              <span className="block text-sm text-ink-2">Untick once the pharmacist has checked the details.</span>
            </span>
          </label>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton pending={pending} className="btn btn-primary h-12 px-8">{product ? "Save changes" : "Add product"}</SubmitButton>
          {product && (
            <a href={`/en/products/${product.slug}`} target="_blank" rel="noopener" className="btn btn-ghost h-12">
              View on website ↗
            </a>
          )}
        </div>
      </form>

      {product && (
        <aside className="h-fit rounded-card border border-line bg-white p-6 xl:sticky xl:top-8">
          <p className="font-semibold">Delete product</p>
          <p className="mt-1 text-sm text-ink-2">This removes it permanently. To hide it for now, untick “Show on website” instead.</p>
          <form
            action={deleteProductAction}
            onSubmit={(ev) => {
              if (!confirm(`Delete “${product.name}” permanently?`)) ev.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={product.id} />
            <button className="btn mt-4 border border-danger/30 text-danger hover:bg-[#FDECEC]">Delete</button>
          </form>
        </aside>
      )}
    </div>
  );
}
