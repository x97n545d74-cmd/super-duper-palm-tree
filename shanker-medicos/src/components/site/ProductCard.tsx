import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Product } from "@/lib/types";
import { productMessage, waLink } from "@/lib/whatsapp";
import { ProductImage } from "./ProductImage";
import { IconWhatsApp } from "@/components/ui/Icons";

export function ProductCard({
  product,
  locale,
  t,
  whatsapp,
  categoryLabel,
  priority = false,
}: {
  product: Product;
  locale: string;
  t: Dictionary;
  whatsapp: string;
  categoryLabel?: string;
  priority?: boolean;
}) {
  const href = `/${locale}/products/${product.slug}`;
  const wa = waLink(whatsapp, productMessage(locale, product));
  const stockKnown = product.availability !== "unconfirmed";
  return (
    <article className="@container group relative flex flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow duration-300 hover:shadow-lift">
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} sizes="(min-width:1280px) 300px, (min-width:768px) 33vw, 50vw" priority={priority} className="transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]" />
      </Link>
      <div className="flex flex-1 flex-col gap-1 border-t border-line p-4">
        <p lang="en" className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-emerald">
          {product.brand}
          {categoryLabel ? <span lang={locale} className="font-medium normal-case tracking-normal text-ink-2"> · {categoryLabel}</span> : null}
        </p>
        <h3 className="font-display text-[1.02rem] font-semibold leading-snug tracking-tight text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-ink-2">{product.pack_size}</p>
        <div className="mt-auto flex flex-col items-start gap-2 pt-3 @[16rem]:flex-row @[16rem]:items-center @[16rem]:justify-between">
          <span className={`text-xs ${stockKnown ? "font-medium text-forest" : "text-ink-2"}`}>{t.product.stock[product.availability]}</span>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-mint px-3.5 text-sm font-semibold text-forest transition hover:bg-emerald hover:text-white"
              aria-label={`${t.cta.enquire}: ${product.name}`}
            >
              <IconWhatsApp className="h-4 w-4" />
              {t.cta.enquire}
            </a>
          ) : (
            <span className="relative z-10 inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-mint px-3.5 text-sm font-semibold text-forest">{t.cta.viewProduct}</span>
          )}
        </div>
      </div>
    </article>
  );
}
