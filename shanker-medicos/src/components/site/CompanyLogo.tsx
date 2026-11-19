import Image from "next/image";
import { monogram } from "@/lib/companies";
import type { Company } from "@/lib/types";

/**
 * Company logo uploaded by the store, or a neutral monogram tile until one is.
 * Logos are shown at a fixed height inside a white tile so different marks sit evenly.
 */
export function CompanyLogo({ company, size = "md", className = "" }: { company: Pick<Company, "name" | "logo_url">; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "sm" ? "h-10 w-16" : size === "lg" ? "h-20 w-32" : "h-14 w-24";
  if (company.logo_url) {
    const local = company.logo_url.startsWith("/api/media/");
    return (
      <span className={`relative inline-block shrink-0 ${box} ${className}`}>
        <Image src={company.logo_url} alt={`${company.name} logo`} fill sizes="128px" unoptimized={local} className="object-contain" />
      </span>
    );
  }
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-base";
  return (
    <span aria-hidden="true" lang="en" className={`inline-flex shrink-0 items-center justify-center rounded-control bg-mint font-display font-semibold tracking-tight text-forest ${box} ${text} ${className}`}>
      {monogram(company.name)}
    </span>
  );
}
