import Link from "next/link";
import { adminRepo } from "@/lib/data";
import { deleteCompanyAction } from "../../actions";
import { CompanyLogo } from "@/components/site/CompanyLogo";
import { CompanyEditor } from "@/components/admin/CompanyEditor";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Companies & logos" };

export default async function AdminCompanies({ searchParams }: PageProps<"/admin/companies">) {
  const sp = await searchParams;
  const filter = sp.show === "missing" ? "missing" : sp.show === "featured" ? "featured" : "all";
  const all = await adminRepo.listCompanies();
  const withLogo = all.filter((c) => c.logo_url).length;
  const list = filter === "missing" ? all.filter((c) => !c.logo_url) : filter === "featured" ? all.filter((c) => c.featured) : all;
  const tab = (key: string, label: string) => (
    <Link href={key === "all" ? "/admin/companies" : `/admin/companies?show=${key}`} aria-current={filter === key ? "page" : undefined} className={`rounded-full px-3 py-1.5 text-sm ${filter === key ? "bg-forest text-ivory" : "border border-line bg-white"}`}>
      {label}
    </Link>
  );
  return (
    <div className="max-w-6xl">
      <h1 className="text-h1">Companies & logos</h1>
      <p className="mt-2 max-w-2xl text-ink-2">
        {all.length} companies · {withLogo} with a logo. Companies appear on the website&rsquo;s Companies page, the homepage strip (if “Show on the homepage” is ticked) and next to matching products. Without a logo, a neat monogram is shown.
      </p>

      <div className="mt-8">
        <LogoUploader />
      </div>

      <div className="mt-10 flex flex-wrap gap-2">
        {tab("all", `All (${all.length})`)}
        {tab("missing", `No logo yet (${all.length - withLogo})`)}
        {tab("featured", `On homepage (${all.filter((c) => c.featured).length})`)}
      </div>

      <ul className="mt-4 divide-y divide-line rounded-card border border-line bg-white">
        {list.map((c) => (
          <li key={c.id}>
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-4 py-3">
                <CompanyLogo company={c} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{c.name}</span>
                  <span className="block truncate text-xs text-ink-2">
                    {c.known || "—"} · search: {c.search_q}
                  </span>
                </span>
                {c.featured && <span className="hidden rounded-full bg-mint px-2 py-0.5 text-xs text-forest sm:inline">Homepage</span>}
                <span className="text-sm text-forest group-open:hidden">Edit</span>
                <span className="hidden text-sm text-ink-2 group-open:inline">Close</span>
              </summary>
              <div className="border-t border-line p-5">
                <CompanyEditor company={c} />
                <form action={deleteCompanyAction} className="mt-4 border-t border-line pt-4">
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmButton message={`Remove ${c.name} from the website?`} className="text-sm font-medium text-danger underline">
                    Remove this company
                  </ConfirmButton>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>

      <section className="mt-12 rounded-card border border-line bg-white p-6">
        <h2 className="text-h3">Add a company</h2>
        <div className="mt-5">
          <CompanyEditor company={null} />
        </div>
      </section>
    </div>
  );
}
