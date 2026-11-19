"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrow, IconSearch } from "@/components/ui/Icons";
import type { Suggestion } from "@/lib/types";

type Labels = { label: string; placeholder: string; button: string; suggestions: string; product: string; category: string; brand: string };

/**
 * Accessible combobox: type, get suggestions (products, brands, categories),
 * arrow keys to move, Enter to open a suggestion or run a full search.
 * Works without JavaScript too: it is a plain GET form to /[locale]/products.
 */
export function SearchBox({
  locale,
  labels,
  defaultValue = "",
  size = "md",
  autoFocus = false,
}: {
  locale: string;
  labels: Labels;
  defaultValue?: string;
  size?: "md" | "lg";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?locale=${locale}&q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data = (await res.json()) as { items: Suggestion[] };
        setItems(data.items);
        setActive(-1);
      } catch {
        /* aborted or offline: keep the form usable */
      }
    }, 140);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q, locale]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const showList = open && q.trim().length >= 2 && items.length > 0;
  const typeLabel = (s: Suggestion) => (s.type === "product" ? labels.product : s.type === "brand" ? labels.brand : labels.category);
  const big = size === "lg";

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        action={`/${locale}/products`}
        method="get"
        onSubmit={(e) => {
          if (active >= 0 && items[active]) {
            e.preventDefault();
            setOpen(false);
            router.push(items[active].href);
          }
        }}
        className={`flex items-center rounded-full border border-line bg-white shadow-hair transition focus-within:border-emerald ${big ? "h-16 pl-6 pr-2" : "h-12 pl-4 pr-1.5"}`}
      >
        <label htmlFor={`${id}-input`} className="sr-only">
          {labels.label}
        </label>
        <IconSearch className={`${big ? "h-5 w-5" : "h-4 w-4"} shrink-0 text-ink-2`} />
        <input
          id={`${id}-input`}
          name="q"
          type="search"
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          value={q}
          placeholder={labels.placeholder}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            }
          }}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className={`min-w-0 flex-1 bg-transparent px-3 text-ink outline-none placeholder:text-ink-2 [&::-webkit-search-cancel-button]:hidden ${big ? "text-[1.05rem]" : "text-[0.95rem]"}`}
        />
        <button type="submit" className={`btn btn-primary ${big ? "h-12 px-6" : "h-9 min-h-0 px-4 text-sm"}`}>
          <span className={big ? "" : "sr-only sm:not-sr-only"}>{labels.button}</span>
          <IconArrow className={big ? "hidden" : "h-4 w-4 sm:hidden"} />
        </button>
      </form>
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={labels.suggestions}
          className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-card border border-line bg-white py-1.5 shadow-lift"
        >
          {items.map((s, i) => (
            <li
              key={s.href}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                setOpen(false);
                router.push(s.href);
              }}
              className={`flex cursor-pointer items-center justify-between gap-4 px-4 py-2.5 ${i === active ? "bg-mint" : ""}`}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{s.label}</span>
                {s.sub && <span className="block truncate text-xs text-ink-2">{s.sub}</span>}
              </span>
              <span className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-wider text-ink-2">{typeLabel(s)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
