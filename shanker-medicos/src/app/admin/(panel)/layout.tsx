import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { DATA_MODE } from "@/lib/env";
import { Logo } from "@/components/brand/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { logoutAction } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-line bg-white lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Link href="/admin" aria-label="Admin home">
            <Logo />
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <button className="text-sm text-ink-2 underline">Sign out</button>
          </form>
        </div>
        <AdminNav />
        <div className="hidden px-6 pb-6 pt-10 text-xs text-ink-2 lg:block">
          <p className="truncate">{user.email}</p>
          <form action={logoutAction} className="mt-2">
            <button className="link-u font-medium text-forest">Sign out</button>
          </form>
          <Link href="/en" target="_blank" className="link-u mt-4 inline-block font-medium text-forest">
            View website ↗
          </Link>
          {DATA_MODE === "local" && <p className="mt-6 rounded-md bg-[#FFF4E5] p-2 text-warn">Development mode (local data file)</p>}
        </div>
      </aside>
      <main className="min-w-0 px-5 py-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
