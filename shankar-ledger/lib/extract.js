// Reads a ledger or statement (PDF pages, photos, or spreadsheet text) into rows.
// Claude only copies what is printed. All matching and arithmetic happens in public/match.js.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.LEDGER_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.LEDGER_EFFORT || 'medium';

let client;
const getClient = () => (client ??= new Anthropic());

const balance = {
  type: 'object',
  additionalProperties: false,
  required: ['amount', 'side'],
  properties: {
    amount: { type: 'number', description: 'Rupees, always positive. 0 if not printed.' },
    side: { type: 'string', enum: ['debit', 'credit', 'unknown'], description: 'Dr or Cr as printed. unknown if the paper does not show it.' },
  },
};

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['is_ledger', 'party_name', 'period_from', 'period_to', 'opening_balance', 'closing_balance', 'entries', 'notes'],
  properties: {
    is_ledger: { type: 'boolean', description: 'false if the files are not an account ledger or statement at all.' },
    party_name: { type: 'string', description: 'Name of the account this ledger is about (the other party). Empty if not printed.' },
    period_from: { type: 'string', description: 'YYYY-MM-DD, or empty.' },
    period_to: { type: 'string', description: 'YYYY-MM-DD, or empty.' },
    opening_balance: balance,
    closing_balance: balance,
    entries: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'ref', 'type', 'particulars', 'debit', 'credit', 'unclear'],
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD, or empty if unreadable.' },
          ref: { type: 'string', description: 'Bill, invoice, voucher, cheque or reference number exactly as printed. Empty if none.' },
          type: { type: 'string', enum: ['invoice', 'payment', 'credit_note', 'debit_note', 'return', 'other'] },
          particulars: { type: 'string', description: 'Short text from the particulars or narration column.' },
          debit: { type: 'number', description: 'Debit amount in rupees, 0 if blank.' },
          credit: { type: 'number', description: 'Credit amount in rupees, 0 if blank.' },
          unclear: { type: 'boolean', description: 'true if any digit of this row was hard to read.' },
        },
      },
    },
    notes: { type: 'string', description: 'One short English sentence if pages are missing, cut off or blurred. Otherwise empty.' },
  },
};

const SYSTEM = `You copy Indian account ledgers and party statements into rows for a medical store, Shankar Medicos. A program will then match two such papers against each other to the rupee, so exact copying matters more than anything else: a wrong digit shows up as a false difference between the shop and its supplier.

The files are pages of one account. They may be an export from Tally, Busy or Marg, a supplier's statement of account, a photo of a printout, a photo of a handwritten register, or spreadsheet text. Text may be in English, Hindi or Punjabi. If several files are given, they are pages of the same account in order.

How to copy:
- Give one entry for every transaction row, in the order printed. Read every page to the end.
- Keep debit and credit in the columns the paper uses. Do not swap them and do not net them.
- Amounts are rupees with Indian comma grouping (1,24,680.00 is 124680). Give plain numbers.
- Dates are day-month-year on Indian papers. Give YYYY-MM-DD. If a row shows no year, take it from the statement period (the financial year runs April to March).
- Opening balance and closing balance go in their own fields, not in entries. Use the Dr or Cr printed beside them, or the column they sit in. In a Tally ledger the closing balance is printed on the opposite side to balance the totals: a closing balance shown in the debit column of the totals block means the account is in credit, and the reverse. Use "By Closing Balance" / "To Closing Balance" wording or the Dr/Cr suffix when present to get the side right.
- Leave out page totals, grand totals, "carried forward" and "brought forward" lines. They are not transactions.
- A running balance column is not debit or credit. Ignore it for entries, but use it to check your reading of each row.
- type: invoice for a sale or purchase bill; payment for money paid or received (cheque, NEFT, UPI, cash, bank); credit_note and debit_note for those vouchers (expiry, breakage, rate difference, scheme); return for goods returned; other for interest, journal entries and anything else.
- If a digit is hard to read, give your best reading and set unclear to true. Never invent a row and never drop one.
- If the files are not a ledger or statement, set is_ledger to false and return no entries.`;

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
  const what = side === 'ours'
    ? "This is from Shankar Medicos' own books: the account of one party as kept in Tally or Busy."
    : "This is the statement the other party sent: Shankar Medicos' account as kept in that party's books.";

  let message;
  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      // If the model declines a request, the API retries it on a fallback model in the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
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
