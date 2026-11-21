import Image from "next/image";
import { badgeAccent, monogram, shortName } from "@/lib/companies";
import type { Company } from "@/lib/types";

/**
 * A company's official logo when the store has uploaded one (with permission).
 * Otherwise our own house-style mark: never an imitation of the company's logo.
 *  - "badge": the company's short name typeset in the site's font, with an accent rule
 *  - "mark":  two-letter monogram for compact rows
 */
export function CompanyLogo({
  company,
  size = "md",
  variant = "mark",
  className = "",
}: {
  company: Pick<Company, "name" | "logo_url">;
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "badge";
  className?: string;
}) {
  if (company.logo_url) {
    const box = variant === "badge" ? "h-12 w-full" : size === "sm" ? "h-10 w-16" : size === "lg" ? "h-20 w-32" : "h-14 w-24";
    const local = company.logo_url.startsWith("/api/media/");
    return (
      <span className={`relative inline-block shrink-0 ${box} ${className}`}>
        <Image src={company.logo_url} alt={`${company.name} logo`} fill sizes="160px" unoptimized={local} className="object-contain" />
      </span>
    );
  }
  if (variant === "badge") {
    const name = shortName(company.name);
    return (
      <span lang="en" className={`flex w-full flex-col items-center gap-2 ${className}`}>
        <span aria-hidden="true" className="h-[3px] w-8 rounded-full" style={{ background: badgeAccent(company.name) }} />
        <span className={`text-balance text-center font-display font-bold leading-tight tracking-[-0.02em] text-ink ${name.length > 16 ? "text-[0.95rem]" : "text-[1.15rem]"}`}>{name}</span>
      </span>
    );
  }
  const box = size === "sm" ? "h-10 w-16" : size === "lg" ? "h-20 w-32" : "h-14 w-24";
  const text = size === "sm" ? "text-xs" : size === "lg" ? "text-xl" : "text-base";
  return (
    <span aria-hidden="true" lang="en" className={`inline-flex shrink-0 items-center justify-center rounded-control bg-mint font-display font-semibold tracking-tight text-forest ${box} ${text} ${className}`}>
      {monogram(company.name)}
    </span>
  );
}
