"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Primary navigation: plain text links, the current page underlined in green. */
export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden xl:block">
      <ul className="flex items-center gap-8">
        {items.map((it, i) => {
          const active = i === 0 ? pathname === it.href : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-2 text-[0.88rem] font-medium transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:origin-left after:bg-emerald after:transition-transform after:duration-[420ms] after:ease-[cubic-bezier(0.23,1,0.32,1)] ${active ? "text-ink after:scale-x-100" : "text-ink-2 after:scale-x-0 hover:text-ink hover:after:scale-x-100"}`}
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
