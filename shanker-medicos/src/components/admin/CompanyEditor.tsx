"use client";

import { useActionState } from "react";
import { saveCompanyAction } from "@/app/admin/actions";
import type { Company } from "@/lib/types";
import { keepValues } from "@/lib/use-keep-form";
import { Field, Notice, SubmitButton } from "./ui";

export function CompanyEditor({ company }: { company: Company | null }) {
  const [state, action, pending] = useActionState(saveCompanyAction, null);
  const e = state?.errors ?? {};
  const id = company?.id ?? "new";
  return (
    <form onSubmit={keepValues(action)} className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="id" value={company?.id ?? ""} />
      <input type="hidden" name="logo_url" value={company?.logo_url ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company name *" name={`name-${id}`} error={e.name}>
          <input id={`name-${id}`} name="name" defaultValue={company?.name} required maxLength={120} className="field" />
        </Field>
        <Field label="Search word" name={`q-${id}`} hint="Matches the manufacturer on products, e.g. “Sun Pharma”." error={e.search_q}>
          <input id={`q-${id}`} name="search_q" defaultValue={company?.search_q} maxLength={80} className="field" />
        </Field>
        <Field label="Known for" name={`known-${id}`} error={e.known}>
          <input id={`known-${id}`} name="known" defaultValue={company?.known} maxLength={200} className="field" />
        </Field>
        <Field label="Logo" name={`logo-${id}`} hint="PNG, JPG or WebP, up to 4 MB.">
          <input id={`logo-${id}`} name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-mint file:px-3 file:py-1.5 file:text-forest" />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2">
          <select name="kind" defaultValue={company?.kind ?? "indian"} className="field h-9 min-h-0 w-auto py-0">
            <option value="indian">Indian</option>
            <option value="multinational">Multinational</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={company?.featured ?? false} className="h-4 w-4 accent-forest" /> Show on the homepage
        </label>
        {company?.logo_url && (
          <label className="flex items-center gap-2">
            <input type="checkbox" name="remove_logo" className="h-4 w-4 accent-forest" /> Remove logo
          </label>
        )}
      </div>
      <Notice state={state} />
      <SubmitButton pending={pending} className="btn btn-primary h-10 min-h-0 text-sm">
        {company ? "Save company" : "Add company"}
      </SubmitButton>
    </form>
  );
}
