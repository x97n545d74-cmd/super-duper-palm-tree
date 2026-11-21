import Link from "next/link";
import { adminRepo } from "@/lib/data";
import { deleteMemberAction } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const metadata = { title: "Club members" };

const fmtDate = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function MembersPage({ searchParams }: PageProps<"/admin/members">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const page = Math.max(1, parseInt(typeof sp.page === "string" ? sp.page : "1", 10) || 1);
  const res = await adminRepo.listMembers({ q, page, perPage: 50 });
  const back = `/admin/members?${new URLSearchParams({ ...(q ? { q } : {}), ...(page > 1 ? { page: String(page) } : {}) })}`;
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-h1">Club members</h1>
          <p className="mt-2 max-w-2xl text-ink-2">
            {res.total} people joined Shanker Club and agreed to receive offers. To check a code at the counter, search for it. Delete a member when they ask you to remove their details.
          </p>
        </div>
        {/* A plain link on purpose: client-side navigation to a file download confuses the router. */}
        <a href="/admin/members-export" download className="btn btn-primary">
          Download CSV
        </a>
      </div>

      <form className="mt-8 flex flex-wrap gap-3" method="get">
        <label htmlFor="q" className="sr-only">
          Search members
        </label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by code, mobile, name or email" className="field max-w-md flex-1" />
        <button className="btn btn-ghost">Search</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-card border border-line bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wider text-ink-2">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Name / email</th>
              <th className="px-4 py-3">Came from</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {res.items.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-3 font-mono font-semibold text-forest">{m.code}</td>
                <td className="px-4 py-3">
                  <a className="link-u" href={`https://wa.me/91${m.phone}`} target="_blank" rel="noopener noreferrer">
                    +91 {m.phone}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <span className="block">{m.name || "—"}</span>
                  <span className="block text-ink-2">{m.email}</span>
                </td>
                <td className="px-4 py-3 text-ink-2">
                  {[m.utm_source, m.utm_medium, m.utm_campaign].filter(Boolean).join(" / ") || "—"}
                  <span className="block text-xs">
                    {m.source} · {m.locale.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-2">{fmtDate(m.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteMemberAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="back" value={back} />
                    <ConfirmButton message={`Delete ${m.code} (+91 ${m.phone}) permanently?`} className="text-sm text-danger underline">
                      Delete
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {res.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-2">
                  No members {q ? "match this search" : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {res.pageCount > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? <Link className="btn btn-ghost" href={`/admin/members?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}>← Previous</Link> : <span />}
          <span className="text-ink-2">
            Page {res.page} of {res.pageCount}
          </span>
          {page < res.pageCount ? <Link className="btn btn-ghost" href={`/admin/members?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}>Next →</Link> : <span />}
        </div>
      )}
    </div>
  );
}
