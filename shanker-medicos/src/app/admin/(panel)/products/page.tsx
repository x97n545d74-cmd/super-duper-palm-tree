import Link from "next/link";
import { adminRepo } from "@/lib/data";
import { togglePublishAction } from "../../actions";
import { ProductArt } from "@/components/brand/ProductArt";

export const metadata = { title: "Products" };

export default async function AdminProducts({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const review = sp.review === "1";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const [result, categories] = await Promise.all([
    adminRepo.searchProducts({ q, includeUnpublished: true, needsReview: review, sort: q ? "relevance" : "az", page, perPage: 30 }),
    adminRepo.listCategories(),
  ]);
  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name_en ?? "—";
  const qs = (over: Record<string, string>) => {
    const p = new URLSearchParams({ ...(q ? { q } : {}), ...(review ? { review: "1" } : {}), ...over });
    return `/admin/products?${p}`;
  };
  const back = qs(page > 1 ? { page: String(page) } : {});

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Products</h1>
          <p className="mt-2 text-ink-2">{result.total} products{review ? " need information checked" : ""}.</p>
        </div>
        <Link href="/admin/products/new" className="btn btn-primary">
          + Add a product
        </Link>
      </div>
      {sp.deleted === "1" && <p className="mt-6 rounded-control bg-mint px-4 py-3 text-sm text-forest">Product deleted.</p>}

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <label htmlFor="q" className="sr-only">
          Search products
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by name, brand or generic name" className="field max-w-md flex-1" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="review" value="1" defaultChecked={review} className="h-4 w-4 accent-forest" /> Only products that need checking
        </label>
        <button className="btn btn-ghost">Search</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-ink-2">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {result.items.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <ProductArt style={p.pack_style} seed={p.brand || p.name} className="h-full w-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="link-u font-medium">
                        {p.name}
                      </Link>
                      <p className="text-ink-2">
                        {p.brand} · {p.pack_size}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-2">{catName(p.category_id)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className={`rounded-full px-2 py-0.5 ${p.published ? "bg-mint text-forest" : "bg-line text-ink-2"}`}>{p.published ? "Live" : "Hidden"}</span>
                    {p.needs_review && <span className="rounded-full bg-[#FFF4E5] px-2 py-0.5 text-warn">Check info</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <form action={togglePublishAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="published" value={String(!p.published)} />
                      <input type="hidden" name="back" value={back} />
                      <button className="rounded-full border border-line px-3 py-1.5 text-xs font-medium hover:border-forest">{p.published ? "Hide" : "Publish"}</button>
                    </form>
                    <Link href={`/admin/products/${p.id}`} className="rounded-full bg-forest px-3 py-1.5 text-xs font-medium text-ivory">
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {result.items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-ink-2">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {result.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link className="btn btn-ghost" href={qs({ page: String(page - 1) })}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-ink-2">
            Page {result.page} of {result.pageCount}
          </span>
          {page < result.pageCount ? (
            <Link className="btn btn-ghost" href={qs({ page: String(page + 1) })}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
