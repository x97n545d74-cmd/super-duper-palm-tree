import "server-only";
import { createHmac } from "node:crypto";

// Outbound automation. When AUTOMATION_WEBHOOK_URL is set, events are POSTed
// there as JSON (n8n, Zapier, Make, a CRM...). The body is signed with
// AUTOMATION_WEBHOOK_SECRET: header X-Shanker-Signature: sha256=<hex HMAC>.
// Failures are logged and never block the visitor.

export async function emit(event: string, data: Record<string, unknown>) {
  const url = process.env.AUTOMATION_WEBHOOK_URL || "";
  if (!/^(https:\/\/|http:\/\/(localhost|127\.0\.0\.1)[:/])/.test(url)) return; // https only (localhost allowed for tests)
  const body = JSON.stringify({ event, sent_at: new Date().toISOString(), data });
  const headers: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "shanker-medicos-website" };
  const secret = process.env.AUTOMATION_WEBHOOK_SECRET || "";
  if (secret) headers["X-Shanker-Signature"] = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  try {
    const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(5000) });
    if (!res.ok) console.error(`[automation] ${event} -> HTTP ${res.status}`);
  } catch (e) {
    console.error(`[automation] ${event} failed:`, (e as Error).message);
  }
}
