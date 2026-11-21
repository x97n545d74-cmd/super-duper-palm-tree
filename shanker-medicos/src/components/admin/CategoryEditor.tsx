"use client";

import { keepValues } from "@/lib/use-keep-form";
import { useActionState, useEffect, useRef } from "react";
import { saveCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { Field, Notice, SubmitButton } from "./ui";

/** Add/edit form for one category. With `category` = null it adds a new one. */
export function CategoryEditor({ category, parents }: { category: Category | null; parents: Category[] }) {
  const [state, action, pending] = useActionState(saveCategoryAction, null);
  const [delState, delAction] = useActionState(deleteCategoryAction, null);
  const form = useRef<HTMLFormElement>(null);
  const e = state?.errors ?? {};
  const id = category?.id ?? "new";
  useEffect(() => {
    if (state?.ok && !category) form.current?.reset();
  }, [state, category]);

  return (
    <div className="space-y-4">
      <form ref={form} onSubmit={keepValues(action)} className="space-y-4" encType="multipart/form-data">
        <input type="hidden" name="id" value={category?.id ?? ""} />
        <input type="hidden" name="image_url" value={category?.image_url ?? ""} />
        <input type="hidden" name="sort_order" value={category?.sort_order ?? 0} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Name (English) *" name={`name_en-${id}`} error={e.name_en}>
            <input id={`name_en-${id}`} name="name_en" defaultValue={category?.name_en} required className="field" />
          </Field>
          <Field label="Name (Hindi)" name={`name_hi-${id}`} error={e.name_hi}>
            <input id={`name_hi-${id}`} name="name_hi" lang="hi" defaultValue={category?.name_hi} className="field" />
          </Field>
          <Field label="Name (Punjabi)" name={`name_pa-${id}`} error={e.name_pa}>
            <input id={`name_pa-${id}`} name="name_pa" lang="pa" defaultValue={category?.name_pa} className="field" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Web address (slug)" name={`slug-${id}`} error={e.slug} hint="Leave empty to create from the English name.">
            <input id={`slug-${id}`} name="slug" defaultValue={category?.slug} pattern="[a-z0-9-]*" className="field" />
          </Field>
          <Field label="Inside another category?" name={`parent-${id}`} error={e.parent_id}>
            <select id={`parent-${id}`} name="parent_id" defaultValue={category?.parent_id ?? ""} className="field">
              <option value="">No, top level</option>
              {parents
                .filter((p) => p.id !== category?.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name_en}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Category image" name={`image-${id}`} hint="Optional. JPG/PNG/WebP up to 4 MB.">
            <input id={`image-${id}`} name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-3 file:py-1.5 file:text-forest" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={category?.featured ?? false} className="h-4 w-4 accent-forest" /> Show as a tile on the homepage
          </label>
          {category?.image_url && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remove_image" className="h-4 w-4 accent-forest" /> Remove image
            </label>
          )}
        </div>
        <Notice state={state} />
        <SubmitButton pending={pending} className="btn btn-primary h-10 min-h-0 text-sm">{category ? "Save category" : "Add category"}</SubmitButton>
      </form>
      {category && (
        <form
          action={delAction}
          onSubmit={(ev) => {
            if (!confirm(`Delete the category “${category.name_en}”?`)) ev.preventDefault();
          }}
          className="border-t border-line pt-4"
        >
          <input type="hidden" name="id" value={category.id} />
          <Notice state={delState} />
          <button className="mt-2 text-sm font-medium text-danger underline">Delete this category</button>
        </form>
      )}
    </div>
  );
}
