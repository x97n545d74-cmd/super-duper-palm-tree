import { adminRepo } from "@/lib/data";
import { ImportWizard } from "@/components/admin/ImportWizard";

export const metadata = { title: "Bulk import" };

export default async function ImportPage() {
  const [keys, categories] = await Promise.all([adminRepo.duplicateKeys(), adminRepo.listCategories()]);
  return (
    <div className="max-w-6xl">
      <h1 className="text-h1">Bulk import</h1>
      <p className="mb-8 mt-2 max-w-2xl text-ink-2">
        Add many products at once from a spreadsheet. Nothing is saved until you check the preview and press Import. New products are published straight away unless the “published” column says no.
      </p>
      <ImportWizard existingKeys={[...keys.keys()]} categories={categories.map((c) => ({ slug: c.slug, name: c.name_en }))} />
    </div>
  );
}
