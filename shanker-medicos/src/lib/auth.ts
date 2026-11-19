import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DATA_MODE, isProduction } from "./env";
import { sessionClient } from "./supabase/clients";

// Two modes:
//  - supabase: Supabase Auth (email + password). A user is an admin only if
//    their id is in public.admin_users. RLS enforces the same rule in the DB.
//  - local (development only): one account from ADMIN_DEV_EMAIL /
//    ADMIN_DEV_PASSWORD, kept in an HMAC-signed, httpOnly cookie.

const COOKIE = "sm_admin";
const SESSION_HOURS = 8;

export interface AdminUser {
  email: string;
}

function secret() {
  const s = process.env.SESSION_SECRET || "";
  if (s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters (see .env.example).");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function localAdminConfigured() {
  return !!(process.env.ADMIN_DEV_EMAIL && process.env.ADMIN_DEV_PASSWORD && (process.env.SESSION_SECRET || "").length >= 32);
}

/** Returns an error message, or null on success. */
export async function signIn(email: string, password: string): Promise<string | null> {
  if (DATA_MODE === "supabase") {
    const sb = await sessionClient();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) return "Email or password is incorrect.";
    const { data: row } = await sb.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    if (!row) {
      await sb.auth.signOut();
      return "This account does not have admin access.";
    }
    return null;
  }
  if (!localAdminConfigured()) return "Admin sign-in is not configured. Set ADMIN_DEV_EMAIL, ADMIN_DEV_PASSWORD and SESSION_SECRET.";
  const okEmail = safeEqual(email.trim().toLowerCase(), process.env.ADMIN_DEV_EMAIL!.trim().toLowerCase());
  const okPass = safeEqual(password, process.env.ADMIN_DEV_PASSWORD!);
  if (!okEmail || !okPass) return "Email or password is incorrect.";
  const payload = Buffer.from(JSON.stringify({ email: process.env.ADMIN_DEV_EMAIL, exp: Date.now() + SESSION_HOURS * 3600_000 })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_HOURS * 3600,
  });
  return null;
}

export async function signOut() {
  if (DATA_MODE === "supabase") {
    await (await sessionClient()).auth.signOut();
    return;
  }
  (await cookies()).delete({ name: COOKIE, path: "/admin" });
}

export async function currentAdmin(): Promise<AdminUser | null> {
  if (DATA_MODE === "supabase") {
    const sb = await sessionClient();
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    const { data: row } = await sb.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
    return row ? { email: data.user.email ?? "" } : null;
  }
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || !localAdminConfigured()) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !safeEqual(sign(payload), sig)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { email: string; exp: number };
    return data.exp > Date.now() ? { email: data.email } : null;
  } catch {
    return null;
  }
}

/** For pages: redirect to the login screen when not signed in. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

/** For server actions: throw instead of redirecting. */
export async function assertAdmin(): Promise<AdminUser> {
  const user = await currentAdmin();
  if (!user) throw new Error("Not signed in.");
  return user;
}
