import { redirect } from "next/navigation";
import { currentAdmin, localAdminConfigured } from "@/lib/auth";
import { DATA_MODE, PUBLISH_ONLY } from "@/lib/env";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  const notConfigured = DATA_MODE === "local" && !localAdminConfigured();
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest p-14 text-ivory lg:flex lg:flex-col lg:justify-between">
        <Logo tone="light" />
        <div>
          <p className="font-display text-4xl font-medium tracking-tight">Catalogue admin</p>
          <p className="mt-3 max-w-sm text-ivory/65">Add products, update details and keep the store&rsquo;s contact information correct.</p>
        </div>
        <p aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-10 font-display text-[12rem] font-semibold leading-none tracking-[-0.06em] text-ivory/[0.06]">
          Shanker
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-10 text-h2 lg:mt-0">Sign in</h1>
          <p className="mt-2 text-sm text-ink-2">For Shanker Medicos staff only.</p>
          {PUBLISH_ONLY ? (
            <p className="mt-8 rounded-control bg-mint p-4 text-sm text-forest">
              Admin is switched off on this website (publish-only mode). The catalogue, offer and shop details are updated in the code. To turn admin on, connect Supabase (see docs/DEPLOYMENT.md).
            </p>
          ) : notConfigured ? (
            <p className="mt-8 rounded-control bg-[#FFF4E5] p-4 text-sm text-warn">
              Admin sign-in is not set up yet. Add ADMIN_DEV_EMAIL, ADMIN_DEV_PASSWORD and SESSION_SECRET to the environment (development mode), or connect Supabase (see docs/DEPLOYMENT.md).
            </p>
          ) : (
            <LoginForm />
          )}
          {DATA_MODE === "local" && !PUBLISH_ONLY && <p className="mt-8 text-xs text-ink-2">Development mode: data is stored in a local file, not Supabase.</p>}
        </div>
      </div>
    </div>
  );
}
