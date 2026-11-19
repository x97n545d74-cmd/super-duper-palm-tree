"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-5 xl:gap-7">
        {items.map((it, i) => {
          const active = i === 0 ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`link-u text-[0.92rem] font-medium transition-colors ${active ? "text-forest" : "text-ink-2 hover:text-ink"}`}
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
