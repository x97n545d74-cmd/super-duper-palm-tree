import { adminRepo } from "@/lib/data";
import { moveCategoryAction } from "../../actions";
import { CategoryEditor } from "@/components/admin/CategoryEditor";
import { CategoryGlyph } from "@/components/ui/Icons";

export const metadata = { title: "Categories" };

export default async function AdminCategories() {
  const [categories, counts] = await Promise.all([adminRepo.listCategories(), adminRepo.categoryCounts()]);
  const top = categories.filter((c) => !c.parent_id);
  const kids = (id: string) => categories.filter((c) => c.parent_id === id);
  const count = (id: string) => counts[id] ?? 0;
  const ordered = top.flatMap((c) => [c, ...kids(c.id)]);

  return (
    <div className="max-w-5xl">
      <h1 className="text-h1">Categories</h1>
      <p className="mt-2 text-ink-2">Use the arrows to change the order on the website. Click a category to edit its names in all three languages.</p>

      <ul className="mt-8 divide-y divide-line rounded-card border border-line bg-white">
        {ordered.map((c) => {
          const siblings = c.parent_id ? kids(c.parent_id) : top;
          const i = siblings.findIndex((s) => s.id === c.id);
          return (
            <li key={c.id} className={c.parent_id ? "bg-ivory/60" : ""}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <span className={`flex items-center gap-3 ${c.parent_id ? "pl-8" : ""} min-w-0 flex-1`}>
                    <CategoryGlyph slug={c.slug} className="h-5 w-5 shrink-0 text-emerald" />
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{c.name_en}</span>
                      <span className="block truncate text-xs text-ink-2">
                        <span lang="hi">{c.name_hi || "—"}</span> · <span lang="pa">{c.name_pa || "—"}</span> · /{c.slug} · {count(c.id)} products
                      </span>
                    </span>
                  </span>
                  {c.featured && <span className="hidden rounded-full bg-mint px-2 py-0.5 text-xs text-forest sm:inline">Homepage tile</span>}
                  <span className="flex shrink-0 gap-1">
                    {(["up", "down"] as const).map((dir) => (
                      <form key={dir} action={moveCategoryAction}>
                        <input type="hidden" name="id" value={c.id} />
                        <input type="hidden" name="dir" value={dir} />
                        <button
                          disabled={dir === "up" ? i === 0 : i === siblings.length - 1}
                          aria-label={`Move ${c.name_en} ${dir}`}
                          className="h-9 w-9 rounded-full border border-line text-sm disabled:opacity-30"
                        >
                          {dir === "up" ? "↑" : "↓"}
                        </button>
                      </form>
                    ))}
                  </span>
                  <span className="text-sm text-forest group-open:hidden">Edit</span>
                  <span className="hidden text-sm text-ink-2 group-open:inline">Close</span>
                </summary>
                <div className="border-t border-line bg-white p-5">
                  <CategoryEditor category={c} parents={top} />
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <section className="mt-12 rounded-card border border-line bg-white p-6">
        <h2 className="text-h3">Add a category</h2>
        <div className="mt-5">
          <CategoryEditor category={null} parents={top} />
        </div>
      </section>
    </div>
  );
}
