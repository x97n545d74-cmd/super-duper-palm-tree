// Made-up sample data (no real party). Used by the "sample" button and by the tests.
const E = (date, ref, type, particulars, debit, credit) => ({ date, ref, type, particulars, debit, credit, unclear: false });

// The party's account in Shankar Medicos' books (Tally style: purchases in credit).
export const demoOurs = {
  party_name: 'Demo Pharma Distributors',
  period_from: '2026-04-01', period_to: '2026-06-30',
  opening_balance: { amount: 18450, side: 'credit' },
  closing_balance: { amount: 39932, side: 'credit' },
  entries: [
    E('2026-04-04', 'DPD/26-27/0112', 'invoice', 'Purchase', 0, 24680),
    E('2026-04-10', 'CHQ 004512', 'payment', 'HDFC Bank', 18450, 0),
    E('2026-04-18', 'DPD/26-27/0187', 'invoice', 'Purchase', 0, 31250),
    E('2026-04-25', 'DN-07', 'debit_note', 'Expiry return', 4260, 0),
    E('2026-05-02', 'NEFT', 'payment', 'HDFC Bank', 24680, 0),
    E('2026-05-09', 'DPD/26-27/0301', 'invoice', 'Purchase', 0, 15840),
    E('2026-05-21', 'DPD/26-27/0366', 'invoice', 'Purchase', 0, 42118),
    E('2026-06-03', 'UPI', 'payment', 'HDFC Bank', 30000, 0),
    E('2026-06-14', 'DPD/26-27/0455', 'invoice', 'Purchase', 0, 9984),
    E('2026-06-27', 'CHQ 004561', 'payment', 'HDFC Bank', 25000, 0),
  ],
};

// Shankar Medicos' account in the party's books (sales in debit).
export const demoTheirs = {
  party_name: 'Shankar Medicos',
  period_from: '2026-04-01', period_to: '2026-06-30',
  opening_balance: { amount: 18450, side: 'debit' },
  closing_balance: { amount: 77272, side: 'debit' },
  entries: [
    E('2026-04-04', '112', 'invoice', 'Sales', 24680, 0),
    E('2026-04-12', '004512', 'payment', 'Cheque received', 0, 18450),
    E('2026-04-18', '187', 'invoice', 'Sales', 31250, 0),
    E('2026-05-03', 'NEFT', 'payment', 'Bank receipt', 0, 24680),
    E('2026-05-09', '301', 'invoice', 'Sales', 16420, 0),
    E('2026-05-21', '366', 'invoice', 'Sales', 42118, 0),
    E('2026-06-03', 'UPI', 'payment', 'Bank receipt', 0, 30000),
    E('2026-06-08', '431', 'invoice', 'Sales', 7000, 0),
    E('2026-06-14', '455', 'invoice', 'Sales', 9984, 0),
    E('2026-06-20', 'INT', 'other', 'Interest on late payment', 500, 0),
  ],
};
