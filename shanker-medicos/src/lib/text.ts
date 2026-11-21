// Small, dependency-free text helpers shared by server and client.

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

/** Lowercase, strip accents and punctuation for matching. */
export function norm(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Remove characters that could alter a PostgREST filter expression. */
export function safeQuery(q: string): string {
  return q.replace(/[^\p{L}\p{N} .+\-/]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = slugify(base);
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  slug = `${slug}-${i}`;
  return slug;
}
