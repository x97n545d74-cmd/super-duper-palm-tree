import Link from "next/link";
import { adminRepo } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Add product" };

export default async function NewProduct() {
  const categories = await adminRepo.listCategories();
  return (
    <div className="max-w-6xl">
      <Link href="/admin/products" className="link-u text-sm text-ink-2">
        ← Products
      </Link>
      <h1 className="mt-3 text-h1">Add a product</h1>
      <p className="mb-8 mt-2 text-ink-2">Fields marked * are required.</p>
      <ProductForm product={null} categories={categories} />
    </div>
  );
}
