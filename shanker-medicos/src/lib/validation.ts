import { z } from "zod";
import { AVAILABILITY, PACK_STYLES, RX_CLASSES } from "./types";

// Server-side validation for every admin write. Also used by the CSV import
// preview in the browser, so staff see the same errors before uploading.

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const required = (max: number, label: string) => text(max).min(1, `${label} is required.`);
const bool = z.preprocess((v) => v === true || v === "true" || v === "on" || v === "1" || v === "yes", z.boolean());

export const productSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  name: required(140, "Product name"),
  brand: required(80, "Brand"),
  manufacturer: text(140).default(""),
  generic_name: text(240).default(""),
  pack_size: required(80, "Pack size"),
  category_id: z.string().uuid("Choose a category.").nullable(),
  description: text(1200).default(""),
  information: text(2400).default(""),
  pack_style: z.enum(PACK_STYLES).default("box"),
  availability: z.enum(AVAILABILITY).default("unconfirmed"),
  rx_class: z.enum(RX_CLASSES).default("unverified"),
  published: bool,
  featured: bool,
  needs_review: bool,
  image_url: z.string().max(600).nullable(),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  slug: text(80)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens only.")
    .default("")
    .transform((v) => v || undefined),
  name_en: required(80, "English name"),
  name_hi: text(80).default(""),
  name_pa: text(80).default(""),
  parent_id: z.string().uuid().nullable(),
  featured: bool,
  image_url: z.string().max(600).nullable(),
  sort_order: z.coerce.number().int().min(0).max(10000).default(0),
});

const optionalUrl = text(500).refine((v) => !v || /^https:\/\/[^\s]+$/i.test(v), "Use a full link starting with https://");
const phone = text(20).refine((v) => !v || /^\+?[0-9 ()-]{10,20}$/.test(v), "Use digits only, e.g. +91 98765 43210");

export const settingsSchema = z.object({
  business_name: required(80, "Business name"),
  tagline: text(120).default(""),
  address: text(240).default(""),
  city: required(60, "City"),
  state: required(60, "State"),
  postal_code: text(10).refine((v) => !v || /^[1-9][0-9]{5}$/.test(v), "Use a 6-digit PIN code.").default(""),
  phone,
  whatsapp: phone,
  email: text(120).refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address.").default(""),
  opening_hours: text(400).default(""),
  maps_url: optionalUrl.default(""),
  instagram_url: optionalUrl.default(""),
  facebook_url: optionalUrl.default(""),
});

/** One CSV row after column mapping. Category is matched by slug or English name on the server. */
export const importRowSchema = z.object({
  name: required(140, "name"),
  brand: required(80, "brand"),
  manufacturer: text(140).default(""),
  generic_name: text(240).default(""),
  pack_size: required(80, "pack_size"),
  category: text(80).default(""),
  description: text(1200).default(""),
  information: text(2400).default(""),
  availability: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v.replace(/[\s-]+/g, "_") || "unconfirmed")
    .pipe(z.enum(AVAILABILITY, { message: `availability must be one of: ${AVAILABILITY.join(", ")}` })),
  rx_class: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => ({ "": "unverified", yes: "rx", no: "otc", prescription: "rx" })[v] ?? v)
    .pipe(z.enum(RX_CLASSES, { message: `rx_class must be one of: ${RX_CLASSES.join(", ")} (or yes/no)` })),
  published: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => !["no", "false", "0", "n"].includes(v)),
  pack_style: z
    .string()
    .trim()
    .toLowerCase()
    .transform((v) => v || "box")
    .pipe(z.enum(PACK_STYLES, { message: `pack_style must be one of: ${PACK_STYLES.join(", ")}` })),
});

export const IMPORT_FIELDS = [
  { key: "name", label: "Product name", required: true, aliases: ["product", "product name", "item", "item name", "title"] },
  { key: "brand", label: "Brand", required: true, aliases: ["brand name", "make"] },
  { key: "manufacturer", label: "Manufacturer", required: false, aliases: ["company", "mfr", "mfg", "marketer"] },
  { key: "generic_name", label: "Generic name / composition", required: false, aliases: ["generic", "composition", "salt", "molecule"] },
  { key: "pack_size", label: "Pack size", required: true, aliases: ["pack", "packing", "size", "pack size"] },
  { key: "category", label: "Category (slug or name)", required: false, aliases: ["category name", "department"] },
  { key: "description", label: "Description", required: false, aliases: ["details", "about"] },
  { key: "information", label: "Product information", required: false, aliases: ["info", "notes"] },
  { key: "availability", label: "Availability", required: false, aliases: ["stock", "status"] },
  { key: "rx_class", label: "Prescription (rx / otc / unverified)", required: false, aliases: ["rx", "prescription", "schedule"] },
  { key: "published", label: "Published (yes/no)", required: false, aliases: ["publish", "visible", "active"] },
  { key: "pack_style", label: "Illustration style", required: false, aliases: ["style", "pack type"] },
] as const;

export const MAX_IMPORT_ROWS = 5000;

export function firstError(err: z.ZodError): string {
  const i = err.issues[0];
  return i ? (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message) : "Invalid input.";
}

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const k = String(i.path[0] ?? "_");
    out[k] ??= i.message;
  }
  return out;
}
