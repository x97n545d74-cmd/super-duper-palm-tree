import Link from "next/link";
import { adminRepo } from "@/lib/data";

export const metadata = { title: "Overview" };

const SETTING_LABEL: Record<string, string> = {
  address: "Shop address",
  phone: "Phone number",
  whatsapp: "WhatsApp number",
  opening_hours: "Opening hours",
  maps_url: "Google Maps link",
};

export default async function Overview() {
  const s = await adminRepo.stats();
  const cards = [
    { label: "Products on the website", value: s.activeProducts, href: "/admin/products" },
    { label: "All products (incl. hidden)", value: s.totalProducts, href: "/admin/products?status=all" },
    { label: "Categories", value: s.categories, href: "/admin/categories" },
    { label: "Need information checked", value: s.needsReview, href: "/admin/products?review=1", warn: s.needsReview > 0 },
    { label: "Shanker Club members", value: s.members, href: "/admin/members" },
    { label: "New members this week", value: s.membersThisWeek, href: "/admin/members" },
  ];
  return (
    <div className="max-w-5xl">
      <h1 className="text-h1">Overview</h1>
      <p className="mt-2 text-ink-2">What&rsquo;s on the website right now, and what needs attention.</p>

      {s.missingSettings.length > 0 && (
        <div className="mt-8 rounded-card border border-[#F2D7A6] bg-[#FFF8EC] p-5">
          <p className="font-semibold text-warn">Business details missing</p>
          <p className="mt-1 text-sm text-ink">
            The website hides these until you add them: {s.missingSettings.map((k) => SETTING_LABEL[k] ?? k).join(", ")}.
            {s.missingSettings.includes("whatsapp") && " Without a WhatsApp number, the Enquire buttons send customers to the Contact page instead."}
          </p>
          <Link href="/admin/settings" className="btn btn-primary mt-4 h-10 min-h-0 text-sm">
            Add business details
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className={`rounded-card border bg-white p-5 transition hover:shadow-lift ${c.warn ? "border-[#F2D7A6]" : "border-line"}`}>
            <p className="font-display text-4xl font-semibold tracking-tight">{c.value}</p>
            <p className={`mt-2 text-sm ${c.warn ? "text-warn" : "text-ink-2"}`}>{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn btn-primary">
          + Add a product
        </Link>
        <Link href="/admin/import" className="btn btn-ghost">
          Import from a spreadsheet
        </Link>
      </div>

      <h2 className="mt-14 text-h3">Recently updated</h2>
      <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-white">
        {s.recent.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="min-w-0">
              <Link href={`/admin/products/${p.id}`} className="link-u font-medium">
                {p.name}
              </Link>
              <p className="truncate text-sm text-ink-2">
                {p.brand} · {p.pack_size}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-xs">
              {p.needs_review && <span className="rounded-full bg-[#FFF4E5] px-2 py-0.5 text-warn">Check info</span>}
              <span className={`rounded-full px-2 py-0.5 ${p.published ? "bg-mint text-forest" : "bg-line text-ink-2"}`}>{p.published ? "Live" : "Hidden"}</span>
              <time className="hidden text-ink-2 sm:inline" dateTime={p.updated_at}>
                {new Date(p.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
