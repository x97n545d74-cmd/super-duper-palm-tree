"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/i18n";
import { LogoMark } from "@/components/brand/Logo";

// not-found receives no params, so the locale is read from the URL.
export default function NotFound() {
  const pathname = usePathname() || "/en";
  const locale = pathname.split("/")[1] || "en";
  const t = getDictionary(locale);
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <LogoMark className="h-14 w-14 text-forest" />
      <p className="mt-8 font-mono text-sm text-ink-2">404</p>
      <h1 className="mt-3 text-h1">{t.notFound.title}</h1>
      <p className="mt-4 max-w-md text-ink-2">{t.notFound.body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/${locale}`} className="btn btn-primary">
          {t.notFound.home}
        </Link>
        <Link href={`/${locale}/products`} className="btn btn-ghost">
          {t.notFound.search}
        </Link>
      </div>
    </div>
  );
}
