"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Primary navigation as one segmented control (product UI). */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-0.5 rounded-[14px] border border-line bg-white/70 p-1 shadow-hair backdrop-blur">
        {items.map((it, i) => {
          const active = i === 0 ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-[10px] px-3.5 py-2 text-[0.9rem] font-medium transition-colors duration-200 ${active ? "bg-forest text-white" : "text-ink-2 hover:bg-mint hover:text-ink"}`}
              >
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
