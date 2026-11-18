// Reads a ledger or statement (PDF pages, photos, or spreadsheet text) into rows.
// Claude only copies what is printed. All matching and arithmetic happens in public/match.js.
import Anthropic from '@anthropic-ai/sdk';

import { selfCheck } from '../public/match.js';

// Cost: the small model reads first. The bigger one is called only when the paper's own
// arithmetic does not close (opening + rows != printed closing) or rows were hard to read.
const MODEL = process.env.LEDGER_MODEL || 'claude-haiku-5-5';
const BACKUP_MODEL = process.env.LEDGER_BACKUP_MODEL ?? 'claude-opus-5-5'; // set empty to never escalate
const EFFORT = process.env.LEDGER_EFFORT || 'medium';
// Server-side refusal fallback exists for these model families only.
const hasFallback = (model) => /^claude-(opus|sonnet|fable|mythos)-/.test(model);

let client;
const getClient = () => (client ??= new Anthropic());

import { SCHEMA, SYSTEM } from '../public/prompt.js';

function toBlock(file) {
  if (file.kind === 'text') {
    return { type: 'text', text: `File "${file.name}" as text:\n${file.text}` };
  }
  if (file.mime === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: file.data } };
  }
  return { type: 'image', source: { type: 'base64', media_type: file.mime, data: file.data } };
}

export class ExtractError extends Error {
  constructor(code, message) { super(message || code); this.code = code; }
}

export function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * @param {'ours'|'theirs'} side
 * @param {Array<{kind:'file'|'text', name:string, mime?:string, data?:string, text?:string}>} files
 */
export async function extractLedger(side, files) {
  const first = await readWith(MODEL, side, files);
  const check = selfCheck(first);
  const doubtful = !check.ok || check.unclear > 0;
  if (!doubtful || !BACKUP_MODEL || BACKUP_MODEL === MODEL) return first;

  let second;
  try { second = await readWith(BACKUP_MODEL, side, files); } catch { return first; }
  const check2 = selfCheck(second);
  second.usage.first_try = first.usage;
  // Keep the reading whose arithmetic closes; if neither does, the one that is less far off.
  if (check2.ok || !check.ok && Math.abs(check2.off) <= Math.abs(check.off)) return second;
  if (check.ok && check2.unclear < check.unclear) return second;
  return first;
}

async function readWith(model, side, files) {
  const what = side === 'ours'
    ? "This is from Shankar Medicos' own books: the account of one party as kept in Tally or Busy."
    : "This is the statement the other party sent: Shankar Medicos' account as kept in that party's books.";

  let message;
  try {
    const stream = getClient().beta.messages.stream({
      model,
      max_tokens: 64000,
      // If the model declines a request, the API retries it on a fallback model in the same call.
      ...(hasFallback(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
      system: SYSTEM,
      output_config: { effort: EFFORT, format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{
        role: 'user',
        content: [...files.map(toBlock), { type: 'text', text: `${what}\nCopy every row.` }],
      }],
    });
    message = await stream.finalMessage();
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      throw new ExtractError('key', 'The Claude API key was rejected.');
    }
    if (err instanceof Anthropic.RateLimitError) throw new ExtractError('busy', 'Rate limited.');
    if (err instanceof Anthropic.BadRequestError) throw new ExtractError('bad_file', err.message);
    if (err instanceof Anthropic.APIError) throw new ExtractError('service', `Claude API error ${err.status}`);
    throw new ExtractError('service', 'Could not reach the Claude API.');
  }

  if (message.stop_reason === 'refusal') throw new ExtractError('refused');
  if (message.stop_reason === 'max_tokens') throw new ExtractError('too_long');

  const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  let doc;
  try { doc = JSON.parse(text); } catch { throw new ExtractError('service', 'Unreadable reply from the reader.'); }
  if (!doc || !Array.isArray(doc.entries)) throw new ExtractError('service', 'Unreadable reply from the reader.');
  if (doc.is_ledger === false) throw new ExtractError('not_ledger');

  const num = (n) => (Number.isFinite(Number(n)) ? Math.abs(Number(n)) : 0);
  doc.entries = doc.entries.map((e) => ({ ...e, debit: num(e.debit), credit: num(e.credit) }));
  doc.usage = { input: message.usage.input_tokens, output: message.usage.output_tokens, model: message.model };
  return doc;
}
