import Link from "next/link";
import { IconChevron } from "@/components/ui/Icons";
import { breadcrumbSchema, jsonLd } from "@/lib/seo";

export function Breadcrumbs({ items, label }: { items: { name: string; href: string }[]; label: string }) {
  return (
    <>
      <nav aria-label={label} className="text-sm text-ink-2">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((it, i) => (
            <li key={it.href} className="flex items-center gap-1.5">
              {i > 0 && <IconChevron className="h-3.5 w-3.5 opacity-50" />}
              {i === items.length - 1 ? (
                <span aria-current="page" className="text-ink">
                  {it.name}
                </span>
              ) : (
                <Link href={it.href} className="link-u hover:text-ink">
                  {it.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema(items.map((i) => ({ name: i.name, url: i.href }))))} />
    </>
  );
}
