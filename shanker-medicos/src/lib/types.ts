// Typed data models. These mirror supabase/migrations/0001_init.sql exactly.

export const AVAILABILITY = ["unconfirmed", "in_stock", "limited", "on_order", "out_of_stock"] as const;
export type Availability = (typeof AVAILABILITY)[number];

/**
 * Prescription classification.
 * unverified = not yet confirmed by the pharmacist (default; nothing is claimed publicly)
 * otc        = can be sold without prescription
 * rx         = prescription required (Schedule H / H1 and similar)
 */
export const RX_CLASSES = ["unverified", "otc", "rx"] as const;
export type RxClass = (typeof RX_CLASSES)[number];

/** Shape used by the illustrated pack when no photo has been uploaded. */
export const PACK_STYLES = ["bottle", "box", "tube", "strip", "jar", "device", "pump", "sachet", "pack"] as const;
export type PackStyle = (typeof PACK_STYLES)[number];

export interface Category {
  id: string;
  slug: string;
  parent_id: string | null;
  name_en: string;
  name_hi: string;
  name_pa: string;
  image_url: string | null;
  sort_order: number;
  featured: boolean;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  manufacturer: string;
  generic_name: string;
  pack_size: string;
  category_id: string | null;
  description: string;
  information: string;
  image_url: string | null;
  pack_style: PackStyle;
  availability: Availability;
  rx_class: RxClass;
  published: boolean;
  featured: boolean;
  needs_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  whatsapp: string;
  email: string;
  opening_hours: string;
  maps_url: string;
  instagram_url: string;
  facebook_url: string;
  /** Store-wide bill offer, e.g. 12% off bills above ₹1,000. */
  offer_enabled: boolean;
  offer_percent: number;
  offer_min_amount: number;
  offer_code: string;
  /** Shanker Club (phone/email sign-up) and its extra member discount. 0 = not stated publicly. */
  club_enabled: boolean;
  club_extra_percent: number;
  updated_at: string;
}

export interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  locale: string;
  consent_marketing: boolean;
  consent_text: string;
  source: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  created_at: string;
}

export type MemberInput = Omit<Member, "id" | "code" | "created_at">;

export type SortKey = "relevance" | "az" | "za" | "recent";

export interface ProductQuery {
  q?: string;
  /** category slug; includes child categories */
  category?: string;
  brand?: string;
  sort?: SortKey;
  page?: number;
  perPage?: number;
  /** admin only: include unpublished */
  includeUnpublished?: boolean;
  /** admin only filter */
  needsReview?: boolean;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface Suggestion {
  type: "product" | "category" | "brand";
  label: string;
  sub?: string;
  href: string;
}

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at" | "slug"> & {
  id?: string;
  slug?: string;
};

export type CategoryInput = Omit<Category, "id" | "updated_at" | "slug"> & { id?: string; slug?: string };

export interface ImportRow {
  name: string;
  brand: string;
  manufacturer: string;
  generic_name: string;
  pack_size: string;
  category: string;
  description: string;
  information: string;
  availability: Availability;
  rx_class: RxClass;
  published: boolean;
  pack_style: PackStyle;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export interface Stats {
  activeProducts: number;
  totalProducts: number;
  categories: number;
  needsReview: number;
  recent: Product[];
  missingSettings: (keyof BusinessSettings)[];
  members: number;
  membersThisWeek: number;
}

export interface Company {
  id: string;
  slug: string;
  name: string;
  /** catalogue search term (matches product manufacturer/brand) */
  search_q: string;
  known: string;
  kind: "indian" | "multinational";
  logo_url: string | null;
  featured: boolean;
  sort_order: number;
  updated_at: string;
}

export type CompanyInput = Omit<Company, "id" | "updated_at" | "slug" | "sort_order"> & { id?: string; slug?: string };

export const EVENT_TYPES = [
  "pageview",
  "whatsapp_click",
  "call_click",
  "directions_click",
  "offer_reveal",
  "sign_up",
  "generate_lead",
  "search",
  "view_item",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** One anonymous analytics event. No names, numbers, emails or IP addresses are stored. */
export interface AnalyticsEvent {
  ts: string;
  type: EventType;
  path: string;
  locale: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  device: "mobile" | "tablet" | "desktop";
  /** daily-rotating hash, cannot be linked across days or to a person */
  visitor: string;
  props: Record<string, string | number>;
}
