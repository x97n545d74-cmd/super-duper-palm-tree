"use client";

import { useEffect } from "react";

/** Submits a GET filter form as soon as a select changes (the form still works without JS). */
export function AutoSubmit({ formId }: { formId: string }) {
  useEffect(() => {
    const forms = document.querySelectorAll<HTMLFormElement>(`form#${formId}`);
    const onChange = (e: Event) => {
      const form = (e.target as HTMLElement).closest("form");
      if (!form) return;
      // drop empty params for clean URLs
      [...form.elements].forEach((el) => {
        const f = el as HTMLSelectElement;
        if (f.name && !f.value) f.disabled = true;
      });
      form.requestSubmit();
    };
    forms.forEach((f) => f.addEventListener("change", onChange));
    return () => forms.forEach((f) => f.removeEventListener("change", onChange));
  }, [formId]);
  return null;
}
