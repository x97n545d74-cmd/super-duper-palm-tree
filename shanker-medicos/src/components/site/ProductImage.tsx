import Image from "next/image";
import { ProductArt } from "@/components/brand/ProductArt";
import type { Product } from "@/lib/types";

/** Uploaded photo if there is one, else the representative illustration. */
export function ProductImage({
  product,
  sizes,
  priority = false,
  className = "",
}: {
  product: Pick<Product, "image_url" | "name" | "brand" | "pack_size" | "pack_style" | "slug">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const alt = `${product.name}${product.pack_size ? `, ${product.pack_size}` : ""}`;
  if (product.image_url) {
    const local = product.image_url.startsWith("/api/media/");
    return (
      <div className={`relative aspect-square overflow-hidden bg-white ${className}`}>
        <Image src={product.image_url} alt={alt} fill sizes={sizes} priority={priority} unoptimized={local} className="object-contain p-[8%]" />
      </div>
    );
  }
  return (
    <div className={`relative aspect-square overflow-hidden ${className}`} role="img" aria-label={alt}>
      <ProductArt style={product.pack_style} seed={product.brand || product.name} className="h-full w-full" />
    </div>
  );
}
