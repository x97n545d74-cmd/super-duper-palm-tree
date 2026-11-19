"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/import", label: "Bulk import" },
  { href: "/admin/members", label: "Club members" },
  { href: "/admin/settings", label: "Business details" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:px-3 lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {ITEMS.map((it) => {
          const active = it.href === "/admin" ? pathname === "/admin" : pathname.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-control px-3 py-2.5 text-[0.95rem] font-medium ${active ? "bg-mint text-forest" : "text-ink-2 hover:bg-ivory hover:text-ink"}`}
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
