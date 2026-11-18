// Reading instructions and output shape, shared by the server (lib/extract.js) and the
// in-browser reader (public/claude-reader.js).
const balance = {
  type: 'object',
  additionalProperties: false,
  required: ['amount', 'side'],
  properties: {
    amount: { type: 'number', description: 'Rupees, always positive. 0 if not printed.' },
    side: { type: 'string', enum: ['debit', 'credit', 'unknown'], description: 'Dr or Cr as printed. unknown if the paper does not show it.' },
  },
};

export const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['is_ledger', 'party_name', 'period_from', 'period_to', 'opening_balance', 'closing_balance', 'printed_total_debit', 'printed_total_credit', 'entries', 'notes'],
  properties: {
    is_ledger: { type: 'boolean', description: 'false if the files are not an account ledger or statement at all.' },
    party_name: { type: 'string', description: 'Name of the account this ledger is about (the other party). Empty if not printed.' },
    period_from: { type: 'string', description: 'YYYY-MM-DD, or empty.' },
    period_to: { type: 'string', description: 'YYYY-MM-DD, or empty.' },
    opening_balance: balance,
    closing_balance: balance,
    printed_total_debit: { type: 'number', description: 'The debit column total printed at the foot of the paper, for the transactions only (if a total with the opening balance is also printed, give the one without it). 0 if no total is printed.' },
    printed_total_credit: { type: 'number', description: 'The credit column total printed at the foot of the paper, transactions only. 0 if no total is printed.' },
    entries: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['date', 'ref', 'type', 'particulars', 'debit', 'credit', 'balance', 'unclear'],
        properties: {
          date: { type: 'string', description: 'YYYY-MM-DD, or empty if unreadable.' },
          ref: { type: 'string', description: 'Bill, invoice, voucher, cheque or reference number exactly as printed. Empty if none.' },
          type: { type: 'string', enum: ['invoice', 'payment', 'credit_note', 'debit_note', 'return', 'other'] },
          particulars: { type: 'string', description: 'Short text from the particulars or narration column.' },
          debit: { type: 'number', description: 'Debit amount in rupees, 0 if blank.' },
          credit: { type: 'number', description: 'Credit amount in rupees, 0 if blank.' },
          balance: { ...balance, description: 'The running balance printed on this row (Dr or Cr). amount 0 and side unknown if the paper has no balance column or this row shows none.' },
          unclear: { type: 'boolean', description: 'true if any digit of this row was hard to read.' },
        },
      },
    },
    notes: { type: 'string', description: 'One short English sentence if pages are missing, cut off or blurred. Otherwise empty.' },
  },
};

export const SYSTEM = `You copy Indian account ledgers and party statements into rows for a medical store, Shankar Medicos. A program will then match two such papers against each other to the rupee, so exact copying matters more than anything else: a wrong digit shows up as a false difference between the shop and its supplier.

The files are pages of one account. They may be an export from Tally, Busy or Marg, a supplier's statement of account, a photo of a printout, a photo of a handwritten register, or spreadsheet text. Text may be in English, Hindi or Punjabi. If several files are given, they are pages of the same account in order.

How to copy:
- Give one entry for every transaction row, in the order printed. Read every page to the end.
- Keep debit and credit in the columns the paper uses. Do not swap them and do not net them.
- Amounts are rupees with Indian comma grouping (1,24,680.00 is 124680). Give plain numbers.
- Dates are day-month-year on Indian papers. Give YYYY-MM-DD. If a row shows no year, take it from the statement period (the financial year runs April to March).
- Opening balance and closing balance go in their own fields, not in entries. Use the Dr or Cr printed beside them, or the column they sit in. In a Tally ledger the closing balance is printed on the opposite side to balance the totals: a closing balance shown in the debit column of the totals block means the account is in credit, and the reverse. Use "By Closing Balance" / "To Closing Balance" wording or the Dr/Cr suffix when present to get the side right.
- Leave out page totals, grand totals, "carried forward" and "brought forward" lines. They are not transactions. Put the final column totals printed at the end in printed_total_debit and printed_total_credit.
- A running balance column is not debit or credit. Copy it into the row's balance field exactly as printed, and use it to check your reading: the previous balance plus this row's debit minus its credit must give this row's balance.
- ref: take the bill or voucher number column. When it is empty, take the bill number written in the narration or particulars (for a return, "GOODS RTD. IN BILL NO: 26-27/R-252" gives "26-27/R-252"). A narration printed on the line below a row belongs to that row: it is not a row of its own.
- type: invoice for a sale or purchase bill; payment for money paid or received (cheque, NEFT, UPI, cash, bank); credit_note and debit_note for those vouchers (expiry, breakage, rate difference, scheme); return for goods returned; other for interest, journal entries and anything else.
- If a digit is hard to read, give your best reading and set unclear to true. Never invent a row and never drop one.
- If the files are not a ledger or statement, set is_ledger to false and return no entries.`;

