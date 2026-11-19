"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { adminRepo, CATALOGUE_TAG } from "@/lib/data";
import { RepoError } from "@/lib/data/repo";
import { assertAdmin, signIn, signOut } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { categorySchema, fieldErrors, firstError, importRowSchema, MAX_IMPORT_ROWS, productSchema, settingsSchema } from "@/lib/validation";
import type { ImportResult, ImportRow } from "@/lib/types";

export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string> } | null;

function invalidate() {
  updateTag(CATALOGUE_TAG);
  revalidatePath("/", "layout");
}

function fail(e: unknown): ActionState {
  if (e instanceof RepoError) return { ok: false, message: e.message };
  if (e instanceof Error && e.message === "Not signed in.") return { ok: false, message: "Your session has ended. Please sign in again." };
  console.error("[admin action]", e);
  return { ok: false, message: "Something went wrong. Please try again." };
}

const str = (fd: FormData, k: string) => (fd.get(k) ?? "").toString();

/* ---------------- auth ---------------- */

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const ip = clientIp(await headers());
  const email = str(fd, "email").trim().toLowerCase().slice(0, 200);
  const rl1 = rateLimit(`login-ip:${ip}`, 10, 15 * 60_000);
  const rl2 = rateLimit(`login-email:${email}`, 5, 15 * 60_000);
  if (!rl1.ok || !rl2.ok) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(Math.max(rl1.retryAfter, rl2.retryAfter) / 60)} minutes.` };
  const err = await signIn(email, str(fd, "password").slice(0, 200));
  if (err) return { ok: false, message: err };
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

/* ---------------- products ---------------- */

export async function saveProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  let savedId: string;
  let isNew = false;
  try {
    await assertAdmin();
    let image_url: string | null = str(fd, "image_url") || null;
    if (str(fd, "remove_image") === "on") image_url = null;
    const file = fd.get("image");
    if (file instanceof File && file.size > 0) image_url = await adminRepo.uploadImage(file);

    const parsed = productSchema.safeParse({
      id: str(fd, "id"),
      name: str(fd, "name"),
      brand: str(fd, "brand"),
      manufacturer: str(fd, "manufacturer"),
      generic_name: str(fd, "generic_name"),
      pack_size: str(fd, "pack_size"),
      category_id: str(fd, "category_id") || null,
      description: str(fd, "description"),
      information: str(fd, "information"),
      pack_style: str(fd, "pack_style"),
      availability: str(fd, "availability"),
      rx_class: str(fd, "rx_class"),
      published: str(fd, "published"),
      featured: str(fd, "featured"),
      needs_review: str(fd, "needs_review"),
      image_url,
    });
    if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
    isNew = !parsed.data.id;
    const saved = await adminRepo.saveProduct(parsed.data);
    savedId = saved.id;
    invalidate();
  } catch (e) {
    return fail(e);
  }
  if (isNew) redirect(`/admin/products/${savedId}?created=1`);
  return { ok: true, message: "Saved. The website is updated." };
}

export async function deleteProductAction(fd: FormData) {
  await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  await adminRepo.deleteProduct(id);
  invalidate();
  redirect("/admin/products?deleted=1");
}

export async function togglePublishAction(fd: FormData) {
  await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  await adminRepo.setPublished(id, str(fd, "published") === "true");
  invalidate();
  const back = str(fd, "back");
  redirect(back.startsWith("/admin/") ? back : "/admin/products");
}

/* ---------------- categories ---------------- */

export async function saveCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    let image_url: string | null = str(fd, "image_url") || null;
    if (str(fd, "remove_image") === "on") image_url = null;
    const file = fd.get("image");
    if (file instanceof File && file.size > 0) image_url = await adminRepo.uploadImage(file);
    const parsed = categorySchema.safeParse({
      id: str(fd, "id"),
      slug: str(fd, "slug"),
      name_en: str(fd, "name_en"),
      name_hi: str(fd, "name_hi"),
      name_pa: str(fd, "name_pa"),
      parent_id: str(fd, "parent_id") || null,
      featured: str(fd, "featured"),
      image_url,
      sort_order: str(fd, "sort_order") || 0,
    });
    if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
    await adminRepo.saveCategory(parsed.data);
    invalidate();
    return { ok: true, message: parsed.data.id ? "Category saved." : "Category added." };
  } catch (e) {
    return fail(e);
  }
}

export async function deleteCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    await adminRepo.deleteCategory(z.string().uuid().parse(str(fd, "id")));
    invalidate();
    return { ok: true, message: "Category deleted." };
  } catch (e) {
    return fail(e);
  }
}

export async function moveCategoryAction(fd: FormData) {
  await assertAdmin();
  const id = z.string().uuid().parse(str(fd, "id"));
  const dir = str(fd, "dir") === "up" ? -1 : 1;
  const all = await adminRepo.listCategories();
  const me = all.find((c) => c.id === id);
  if (!me) return;
  // Swap with the neighbouring sibling (same parent); other categories keep their slots.
  const slots = all.map((c, k) => (c.parent_id === me.parent_id ? k : -1)).filter((k) => k >= 0);
  const i = slots.findIndex((k) => all[k].id === id);
  const j = i + dir;
  if (j < 0 || j >= slots.length) return;
  const result = [...all];
  [result[slots[i]], result[slots[j]]] = [all[slots[j]], all[slots[i]]];
  await adminRepo.reorderCategories(result.map((c) => c.id));
  invalidate();
  revalidatePath("/admin/categories");
}

/* ---------------- settings ---------------- */

export async function saveSettingsAction(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const raw = Object.fromEntries(settingsSchema.keyof().options.map((k) => [k, str(fd, k)]));
    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) return { ok: false, message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error) };
    await adminRepo.saveSettings(parsed.data);
    invalidate();
    return { ok: true, message: "Business details saved. The website is updated." };
  } catch (e) {
    return fail(e);
  }
}

/* ---------------- bulk import ---------------- */

export async function importAction(rows: unknown, mode: "skip" | "update"): Promise<ImportResult | { error: string }> {
  try {
    await assertAdmin();
  } catch {
    return { error: "Your session has ended. Please sign in again." };
  }
  if (!Array.isArray(rows)) return { error: "No rows received." };
  if (rows.length > MAX_IMPORT_ROWS) return { error: `Import at most ${MAX_IMPORT_ROWS} rows at a time.` };
  const valid: ImportRow[] = [];
  const validRowNumbers: number[] = [];
  const errors: ImportResult["errors"] = [];
  rows.forEach((r, i) => {
    const parsed = importRowSchema.safeParse(r);
    if (parsed.success) {
      valid.push(parsed.data);
      validRowNumbers.push(i + 2);
    } else errors.push({ row: i + 2, message: firstError(parsed.error) });
  });
  try {
    const result = await adminRepo.importProducts(valid, mode === "update" ? "update" : "skip");
    // Map row numbers from the "valid" list back to the original file.
    result.errors = [...errors, ...result.errors.map((e) => ({ ...e, row: validRowNumbers[e.row - 2] ?? e.row }))].sort((a, b) => a.row - b.row);
    invalidate();
    return result;
  } catch (e) {
    const s = fail(e);
    return { error: s?.message ?? "Import failed." };
  }
}

/* ---------------- members ---------------- */

export async function deleteMemberAction(fd: FormData) {
  await assertAdmin();
  await adminRepo.deleteMember(z.string().uuid().parse(str(fd, "id")));
  revalidatePath("/admin/members");
  const back = str(fd, "back");
  redirect(back.startsWith("/admin/members") ? back : "/admin/members");
}
