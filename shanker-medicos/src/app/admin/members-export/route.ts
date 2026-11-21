import Papa from "papaparse";
import { currentAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/data";

// CSV export of Shanker Club members (admins only). Cells that start with
// = + - @ are prefixed so spreadsheet apps don't run them as formulas.
const safe = (v: string) => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v);

export async function GET() {
  if (!(await currentAdmin())) return new Response("Not signed in", { status: 401 });
  const rows = (await adminRepo.allMembers()).map((m) => ({
    code: m.code,
    phone: `+91${m.phone}`,
    name: safe(m.name),
    email: safe(m.email),
    language: m.locale,
    joined_at: m.created_at,
    source: safe(m.source),
    utm_source: safe(m.utm_source),
    utm_medium: safe(m.utm_medium),
    utm_campaign: safe(m.utm_campaign),
    consent: m.consent_marketing ? "yes" : "no",
    consent_text: safe(m.consent_text),
  }));
  const csv = "﻿" + Papa.unparse(rows);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shanker-club-members-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
