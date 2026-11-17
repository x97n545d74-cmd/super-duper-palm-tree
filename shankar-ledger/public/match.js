// Ledger matching. Plain arithmetic, no AI: the same inputs always give the same answer.
// Runs in the browser and in Node (tests).
//
// A document looks like:
// { party_name, period_from, period_to,
//   opening_balance: {amount, side}, closing_balance: {amount, side},
//   entries: [{date:'YYYY-MM-DD', ref, type, particulars, debit, credit, unclear}] }
// side is 'debit' | 'credit' | 'unknown'.

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Debit minus credit, as written in that document. */
export const signed = (e) => round2((Number(e.debit) || 0) - (Number(e.credit) || 0));

/** Balance as a signed number (debit positive). null when the document does not show it. */
export function signedBalance(b) {
  if (!b || b.side === 'unknown' || b.side == null) return null;
  const amt = round2(b.amount);
  return b.side === 'credit' ? -amt : amt;
}

function dayNumber(d) {
  if (!d) return null;
  const t = Date.parse(`${d}T00:00:00Z`);
  return Number.isNaN(t) ? null : Math.round(t / 864e5);
}

/** Two keys for a bill or voucher number: everything, and the last real number in it. */
export function refKeys(ref) {
  const raw = String(ref || '');
  const full = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^0+/, '');
  const groups = (raw.match(/\d+/g) || []).map((g) => g.replace(/^0+/, ''));
  let tail = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    const looksLikeYear = /^(19|20)\d\d$/.test(g) || (g.length === 2 && i > 0);
    if (g.length >= 2 && !(looksLikeYear && groups.length > 1)) { tail = g; break; }
  }
  if (!tail && groups.length) tail = groups[groups.length - 1];
  return { full, tail };
}

const near = (a, b, tol) => Math.abs(a - b) <= tol + 1e-9;
const EXACT = 0.05;      // paise-level noise from reading
const ROUND_OFF = 1.0;   // bills are often rounded to the rupee
const DATE_OK = 10;      // days: cheque clearing, goods in transit
const DATE_MAX = 45;     // beyond this, same amount is not treated as the same entry

function prepare(doc, mirror) {
  return (doc.entries || [])
    .map((e, index) => {
      const s = signed(e);
      return { ...e, index, amt: mirror ? round2(-s) : s, day: dayNumber(e.date), keys: refKeys(e.ref), used: false };
    })
    .filter((e) => e.amt !== 0);
}

function gap(a, b) {
  if (a.day == null || b.day == null) return null;
  return Math.abs(a.day - b.day);
}

/** Pick groups of 2 or 3 entries from `pool` that add up to `target`. */
function findGroup(target, pool) {
  const n = pool.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const two = round2(pool[i].amt + pool[j].amt);
      if (near(two, target, EXACT)) return [pool[i], pool[j]];
      for (let k = j + 1; k < n; k++) {
        if (near(round2(two + pool[k].amt), target, EXACT)) return [pool[i], pool[j], pool[k]];
      }
    }
  }
  return null;
}

/**
 * Compare our ledger (the party's account in our books) with the party's statement
 * (our account in their books). Their debit should be our credit, and the reverse.
 */
export function reconcile(ours, theirs) {
  const A = prepare(ours, false);
  const B = prepare(theirs, true); // mirrored, so equal entries have equal amt
  const matched = [];
  const mismatches = [];

  const pair = (a, b, how, tol) => {
    a.used = true; b.used = true;
    const g = gap(a, b);
    matched.push({
      ours: a, theirs: b, how,
      roundOff: !near(a.amt, b.amt, EXACT) && tol === ROUND_OFF ? round2(a.amt - b.amt) : 0,
      dateGap: g, dateFar: g != null && g > DATE_OK,
    });
  };

  // 1. Same bill number and same amount (then the same within rupee round-off).
  for (const tol of [EXACT, ROUND_OFF]) {
    for (const key of ['full', 'tail']) {
      for (const a of A) {
        if (a.used || !a.keys[key]) continue;
        const b = B.find((x) => !x.used && x.keys[key] === a.keys[key] && near(a.amt, x.amt, tol)
          && (key === 'full' || (gap(a, x) ?? 0) <= DATE_MAX));
        if (b) pair(a, b, 'ref', tol);
      }
    }
  }

  // 2. Same bill number, different amount: the usual rate difference / short supply case.
  for (const key of ['full', 'tail']) {
    for (const a of A) {
      if (a.used || (a.keys[key] || '').length < 3) continue;
      const b = B.find((x) => !x.used && x.keys[key] === a.keys[key]
        && Math.sign(x.amt) === Math.sign(a.amt) && (gap(a, x) ?? 0) <= DATE_MAX);
      if (b) {
        a.used = true; b.used = true;
        mismatches.push({ ours: a, theirs: b, difference: round2(a.amt - b.amt) });
      }
    }
  }

  // 3. Same amount, closest dates first.
  const candidates = [];
  for (const a of A) {
    if (a.used) continue;
    for (const b of B) {
      if (b.used || !near(a.amt, b.amt, EXACT)) continue;
      const g = gap(a, b);
      if (g != null && g > DATE_MAX) continue;
      candidates.push({ a, b, g: g == null ? 30 : g });
    }
  }
  candidates.sort((x, y) => x.g - y.g);
  for (const c of candidates) if (!c.a.used && !c.b.used) pair(c.a, c.b, 'amount', EXACT);

  // 4. One entry on one side equals two or three on the other (one cheque for several bills).
  const group = (singles, others, singleIsOurs) => {
    for (const s of singles) {
      if (s.used) continue;
      const pool = others
        .filter((o) => !o.used && Math.sign(o.amt) === Math.sign(s.amt)
          && Math.abs(o.amt) < Math.abs(s.amt) && (gap(s, o) ?? 0) <= DATE_MAX)
        .slice(0, 14);
      const found = pool.length >= 2 ? findGroup(s.amt, pool) : null;
      if (!found) continue;
      s.used = true; found.forEach((f) => { f.used = true; });
      matched.push(singleIsOurs
        ? { ours: s, theirsGroup: found, how: 'group', roundOff: 0, dateGap: null, dateFar: false }
        : { theirs: s, oursGroup: found, how: 'group', roundOff: 0, dateGap: null, dateFar: false });
    }
  };
  group(A, B, true);
  group(B, A, false);

  // 5. What is left. Entries dated outside the other paper's period are set apart:
  //    they are not mistakes, the other paper simply does not cover those days.
  const span = (doc) => [dayNumber(doc.period_from), dayNumber(doc.period_to)];
  const [of, ot] = span(ours);
  const [tf, tt] = span(theirs);
  const outside = (e, from, to) => e.day != null && ((from != null && e.day < from) || (to != null && e.day > to));
  const onlyOurs = [], onlyTheirs = [], outOfPeriod = [];
  for (const a of A) {
    if (a.used) continue;
    if (outside(a, tf, tt)) outOfPeriod.push({ entry: a, side: 'ours' }); else onlyOurs.push(a);
  }
  for (const b of B) {
    if (b.used) continue;
    if (outside(b, of, ot)) outOfPeriod.push({ entry: b, side: 'theirs' }); else onlyTheirs.push(b);
  }

  // 6. Balances. In our books a supplier we owe sits in credit; in theirs we sit in debit.
  //    When both agree, the two signed balances add up to zero.
  const sum = (list, f) => round2(list.reduce((t, x) => t + f(x), 0));
  const ourClose = signedBalance(ours.closing_balance);
  const theirClose = signedBalance(theirs.closing_balance);
  const ourOpen = signedBalance(ours.opening_balance);
  const theirOpen = signedBalance(theirs.opening_balance);
  const balanceDiff = ourClose != null && theirClose != null ? round2(ourClose + theirClose) : null;
  const openingDiff = ourOpen != null && theirOpen != null ? round2(ourOpen + theirOpen) : null;

  const itemsDiff = round2(
    sum(onlyOurs, (e) => e.amt) - sum(onlyTheirs, (e) => e.amt)
    + sum(outOfPeriod, (x) => (x.side === 'ours' ? x.entry.amt : -x.entry.amt))
    + sum(mismatches, (m) => m.difference)
    + sum(matched, (m) => m.roundOff || 0),
  );
  const explained = round2(itemsDiff + (openingDiff || 0));
  const unexplained = balanceDiff != null ? round2(balanceDiff - explained) : null;

  const clean = onlyOurs.length === 0 && onlyTheirs.length === 0 && mismatches.length === 0
    && outOfPeriod.length === 0 && (openingDiff == null || Math.abs(openingDiff) < 1);
  const balancesAgree = balanceDiff == null ? null : Math.abs(balanceDiff) < 1;

  return {
    status: clean && balancesAgree !== false ? 'match' : 'diff',
    matched, mismatches, onlyOurs, onlyTheirs, outOfPeriod,
    balances: { ourClose, theirClose, ourOpen, theirOpen, balanceDiff, openingDiff, balancesAgree },
    itemsDiff, explained, unexplained,
    counts: { ours: A.length, theirs: B.length, matched: matched.length },
  };
}

/**
 * Check that a document was read correctly: opening balance plus all entries must
 * give the closing balance printed on the paper. If not, a row was missed or misread.
 */
export function selfCheck(doc) {
  const entries = doc.entries || [];
  const open = signedBalance(doc.opening_balance);
  const close = signedBalance(doc.closing_balance);
  const movement = round2(entries.reduce((t, e) => t + signed(e), 0));
  const unclear = entries.filter((e) => e.unclear).length;
  const out = { ok: true, checked: false, unclear, expected: null, got: null, off: 0 };
  if (close != null) {
    // Many statements print no opening line when it is nil.
    const start = open == null ? 0 : open;
    out.checked = true;
    out.expected = close;
    out.got = round2(start + movement);
    out.off = round2(out.got - close);
    out.ok = Math.abs(out.off) < 1;
  }
  if (entries.length === 0) out.ok = false;
  return out;
}

/** "We have to pay" or "we have to receive", read from either paper. */
export function whoOwes(signedAmount, isOurLedger) {
  if (signedAmount == null) return { kind: 'unknown', amount: null };
  const amount = Math.abs(signedAmount);
  if (amount < 0.005) return { kind: 'nil', amount: 0 };
  // Our ledger: credit balance (negative) means we owe the party.
  // Their statement: debit balance (positive) means we owe the party.
  const weOwe = isOurLedger ? signedAmount < 0 : signedAmount > 0;
  return { kind: weOwe ? 'pay' : 'receive', amount };
}
