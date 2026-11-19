import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { adminRepo } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const [product, categories] = await Promise.all([adminRepo.getProduct(id), adminRepo.listCategories()]);
  if (!product) notFound();
  const created = (await searchParams).created === "1";
  return (
    <div className="max-w-6xl">
      <Link href="/admin/products" className="link-u text-sm text-ink-2">
        ← Products
      </Link>
      <h1 className="mt-3 text-h1">{product.name}</h1>
      <p className="mb-8 mt-2 text-ink-2">
        Last updated {new Date(product.updated_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
      </p>
      <ProductForm product={product} categories={categories} created={created} />
    </div>
  );
}
