"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { club, catalogue } from "@/lib/data";
import { memberSchema, fieldErrors } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDictionary } from "@/i18n";
import { emit } from "@/lib/automation";

export type JoinState =
  | { ok: true; code: string; isNew: boolean }
  | { ok: false; message: string; errors?: Record<string, string> }
  | null;

const str = (fd: FormData, k: string) => (fd.get(k) ?? "").toString();

/** Shanker Club sign-up: validate, rate-limit, store with consent, notify automation. */
export async function joinClubAction(_: JoinState, fd: FormData): Promise<JoinState> {
  const locale = ["en", "hi", "pa"].includes(str(fd, "locale")) ? str(fd, "locale") : "en";
  const t = getDictionary(locale).mkt.club;
  // Bots fill every field; people never see this one.
  if (str(fd, "website")) return { ok: false, message: t.error };
  const rl = rateLimit(`join:${clientIp(await headers())}`, 6, 10 * 60_000);
  if (!rl.ok) return { ok: false, message: t.rate };

  const settings = await catalogue.getSettings();
  if (!settings.club_enabled) return { ok: false, message: t.error };

  const parsed = memberSchema.safeParse({
    name: str(fd, "name"),
    phone: str(fd, "phone"),
    email: str(fd, "email"),
    locale,
    consent_marketing: str(fd, "consent") === "on",
    source: str(fd, "source"),
    utm_source: str(fd, "utm_source"),
    utm_medium: str(fd, "utm_medium"),
    utm_campaign: str(fd, "utm_campaign"),
  });
  if (!parsed.success) return { ok: false, message: t.error, errors: fieldErrors(parsed.error) };

  // Record exactly what the person agreed to, in their language, with a timestamp.
  const consent_text = `${t.consent} [${locale}, ${new Date().toISOString()}]`;
  try {
    const res = await club.join({ ...parsed.data, consent_text });
    const m = parsed.data;
    after(() =>
      emit(res.isNew ? "member.joined" : "member.rejoined", {
        code: res.code,
        name: m.name,
        phone: `+91${m.phone}`,
        email: m.email,
        locale: m.locale,
        source: m.source,
        utm_source: m.utm_source,
        utm_medium: m.utm_medium,
        utm_campaign: m.utm_campaign,
        club_extra_percent: settings.club_extra_percent,
      }),
    );
    return { ok: true, code: res.code, isNew: res.isNew };
  } catch (e) {
    console.error("[club]", e);
    return { ok: false, message: t.error };
  }
}
