"use client";

import { useState } from "react";
import { IconFilter } from "@/components/ui/Icons";

/** One filter form for all screen sizes: collapsible on mobile, always open on desktop. */
export function FiltersPanel({ label, count, children }: { label: string; count: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-card border border-line bg-white lg:sticky lg:top-28 lg:rounded-none lg:border-0 lg:bg-transparent">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filters-body"
        className="flex w-full items-center justify-between px-4 py-3.5 font-medium lg:hidden"
      >
        <span className="flex items-center gap-2">
          <IconFilter /> {label}
        </span>
        <span className="text-sm text-ink-2">{count}</span>
      </button>
      <p className="eyebrow mb-5 hidden lg:block">{label}</p>
      <div id="filters-body" className={`${open ? "block" : "hidden"} border-t border-line p-4 lg:block lg:border-0 lg:p-0`}>
        {children}
      </div>
    </div>
  );
}
