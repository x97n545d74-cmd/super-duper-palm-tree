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

  // 4b. Settled inside one book: a bill and a payment for the same amount within a day, both
  //     on the same paper and neither found on the other. Cash bills are booked this way in the
  //     shop's books, and suppliers usually leave cash bills off the party statement. Such a pair
  //     nets to zero, so it does not change the balance.
  const settled = [];
  const settle = (list, side) => {
    for (const p of list) {
      if (p.used || p.type !== 'payment') continue;
      const bill = list
        .filter((x) => !x.used && x !== p && x.type !== 'payment' && near(x.amt, -p.amt, EXACT)
          && (gap(x, p) ?? 99) <= 1)
        .sort((x, y) => gap(x, p) - gap(y, p))[0];
      if (!bill) continue;
      bill.used = true; p.used = true;
      settled.push({ side, bill, payment: p });
    }
  };
  settle(A, 'ours');
  settle(B, 'theirs');

  // 4c. Payments a few days apart on both papers with different amounts: usually the same cash
  //     or bank payment written differently (for example, net of returns on one paper).
  const payPairs = [];
  for (const a of A) {
    if (a.used || a.type !== 'payment') continue;
    for (const b of B) {
      if (b.used || b.type !== 'payment' || Math.sign(b.amt) !== Math.sign(a.amt)) continue;
      const g = gap(a, b);
      if (g != null && g <= 5) payPairs.push({ a, b, g });
    }
  }
  payPairs.sort((x, y) => x.g - y.g);
  for (const { a, b } of payPairs) {
    if (a.used || b.used) continue;
    a.used = true; b.used = true;
    mismatches.push({ ours: a, theirs: b, difference: round2(a.amt - b.amt), kind: 'payment' });
  }
  // A payment in our books can cover a cash bill plus the amount the party received:
  // when the difference equals an open bill of the same day, the pair is explained.
  for (let i = mismatches.length - 1; i >= 0; i--) {
    const m = mismatches[i];
    if (m.kind !== 'payment') continue;
    const bill = A.find((x) => !x.used && x.type !== 'payment' && near(x.amt, -m.difference, EXACT)
      && (gap(x, m.ours) ?? 99) <= 1);
    if (!bill) continue;
    bill.used = true;
    mismatches.splice(i, 1);
    matched.push({ ours: m.ours, theirs: m.theirs, bill, how: 'payBill', roundOff: 0, dateGap: gap(m.ours, m.theirs), dateFar: false });
  }

  // 4d. A cash bill and a payment of the same day in one book that do not add up: the rest
  //     stays open in that book. One row per bill, with what is left.
  const partial = [];
  const partly = (list, side) => {
    for (const bill of list) {
      if (bill.used || bill.type === 'payment') continue;
      const p = list
        .filter((x) => !x.used && x.type === 'payment' && Math.sign(x.amt) !== Math.sign(bill.amt)
          && (gap(x, bill) ?? 99) <= 1)
        .sort((x, y) => Math.abs(x.amt + bill.amt) - Math.abs(y.amt + bill.amt))[0];
      if (!p) continue;
      bill.used = true; p.used = true;
      partial.push({ side, bill, payment: p, rest: round2(bill.amt + p.amt) });
    }
  };
  partly(A, 'ours');
  partly(B, 'theirs');
  mismatches.sort((x, y) => (x.ours.day ?? 0) - (y.ours.day ?? 0));

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

  // 5b. Last day both papers agreed. Walk both running balances day by day; where they add up
  //     to zero, everything up to that day is square, so differences dated up to then cancel
  //     each other out. They are set apart and the screen leads with what came after.
  const startBal = (doc) => {
    const b = doc.opening_balance;
    if (!b || !(Number(b.amount) > 0)) return 0;
    return signedBalance(b);
  };
  let agreedUpTo = null;
  let cancelled = [];
  const o0 = startBal(ours), t0 = startBal(theirs);
  if (o0 != null && t0 != null) {
    const moves = new Map();
    const add = (day, v) => moves.set(day, round2((moves.get(day) || 0) + v));
    for (const e of (ours.entries || [])) { const d = dayNumber(e.date); if (d != null) add(d, signed(e)); }
    for (const e of (theirs.entries || [])) { const d = dayNumber(e.date); if (d != null) add(d, signed(e)); }
    const lastDay = (doc) => Math.max(...(doc.entries || []).map((e) => dayNumber(e.date) ?? -Infinity));
    const end = Math.min(lastDay(ours), lastDay(theirs), ot ?? Infinity, tt ?? Infinity);
    let cum = round2(o0 + t0);
    let best = null;
    for (const day of [...moves.keys()].sort((x, y) => x - y)) {
      if (day > end) break;
      cum = round2(cum + moves.get(day));
      if (Math.abs(cum) < 1) best = day;
    }
    if (best != null) {
      const dayOf = (x) => Math.max(...[x.ours?.day, x.theirs?.day, x.bill?.day, x.payment?.day, x.day].filter((v) => v != null));
      const before = (x) => dayOf(x) <= best;
      const pick = [
        ...mismatches.filter(before).map((m) => ({ kind: 'mismatch', item: m, effect: m.difference })),
        ...partial.filter(before).map((p) => ({ kind: 'partial', item: p, effect: p.side === 'ours' ? p.rest : -p.rest })),
        ...onlyOurs.filter(before).map((e) => ({ kind: 'onlyOurs', item: e, effect: e.amt })),
        ...onlyTheirs.filter(before).map((e) => ({ kind: 'onlyTheirs', item: e, effect: -e.amt })),
      ];
      const net = round2(pick.reduce((t, x) => t + x.effect, 0));
      if (Math.abs(net) < 1) {
        agreedUpTo = new Date(best * 864e5).toISOString().slice(0, 10);
        cancelled = pick;
        const gone = new Set(pick.map((x) => x.item));
        for (const list of [mismatches, partial, onlyOurs, onlyTheirs]) {
          for (let i = list.length - 1; i >= 0; i--) if (gone.has(list[i])) list.splice(i, 1);
        }
      }
    }
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
    + sum(partial, (p) => (p.side === 'ours' ? p.rest : -p.rest))
    + sum(cancelled, (x) => x.effect)
    + sum(matched, (m) => m.roundOff || 0),
  );
  const explained = round2(itemsDiff + (openingDiff || 0));
  const unexplained = balanceDiff != null ? round2(balanceDiff - explained) : null;

  const clean = onlyOurs.length === 0 && onlyTheirs.length === 0 && mismatches.length === 0 && partial.length === 0
    && outOfPeriod.length === 0 && (openingDiff == null || Math.abs(openingDiff) < 1);
  const balancesAgree = balanceDiff == null ? null : Math.abs(balanceDiff) < 1;

  return {
    status: clean && balancesAgree !== false ? 'match' : 'diff',
    matched, mismatches, onlyOurs, onlyTheirs, outOfPeriod, settled, partial, cancelled, agreedUpTo,
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

  // Row by row: previous balance + debit - credit must equal the balance printed on the row.
  // A row where that fails was probably misread (or a row above it is missing): it is marked.
  out.breaks = 0;
  let prev = open == null ? 0 : open;
  let seen = false;
  for (const e of entries) {
    const b = signedBalance(e.balance);
    if (b == null || !(Number(e.balance?.amount) >= 0)) { prev = round2(prev + signed(e)); continue; }
    const want = round2(prev + signed(e));
    if (seen || open != null) {
      if (Math.abs(want - b) >= 1) { out.breaks++; e.balanceBreak = true; }
    }
    seen = true;
    prev = b;
  }
  return out;
}

/**
 * Is the paper itself right? Checks that do not depend on the other party's paper:
 * - its own arithmetic: opening + printed debit total - printed credit total = printed closing
 * - its rows add up to the totals printed on it (a row missing from our reading, or from the paper)
 * - every row's printed running balance follows from the row above
 * - no entry written twice, no entry dated outside the paper's own period
 * Each check is 'ok', 'bad' or 'na' (the paper does not print what the check needs).
 */
export function paperCheck(doc) {
  const entries = doc.entries || [];
  const sc = selfCheck(doc);
  const open = signedBalance(doc.opening_balance);
  const close = signedBalance(doc.closing_balance);
  let pDr = round2(doc.printed_total_debit), pCr = round2(doc.printed_total_credit);
  // Some software prints column totals that already include the opening balance
  // (totals give the closing directly). Take the opening out so both styles check the same way.
  if (open && close != null && (pDr > 0 || pCr > 0)
    && Math.abs(round2(open + pDr - pCr) - close) >= 1 && Math.abs(round2(pDr - pCr) - close) < 1) {
    if (open > 0) pDr = round2(pDr - open); else pCr = round2(pCr + open);
  }
  const sumDr = round2(entries.reduce((t, e) => t + (Number(e.debit) || 0), 0));
  const sumCr = round2(entries.reduce((t, e) => t + (Number(e.credit) || 0), 0));
  const hasTotals = pDr > 0 || pCr > 0;
  const checks = {};

  checks.arithmetic = !hasTotals || close == null ? { state: 'na' }
    : (() => {
      const want = round2((open ?? 0) + pDr - pCr);
      const off = round2(want - close);
      return { state: Math.abs(off) < 1 ? 'ok' : 'bad', off, want, close };
    })();
  checks.totals = !hasTotals ? { state: 'na' }
    : { state: Math.abs(sumDr - pDr) < 1 && Math.abs(sumCr - pCr) < 1 ? 'ok' : 'bad', sumDr, sumCr, pDr, pCr, offDr: round2(sumDr - pDr), offCr: round2(sumCr - pCr) };
  checks.closing = !sc.checked ? { state: 'na' } : { state: sc.ok ? 'ok' : 'bad', off: sc.off };
  const withBal = entries.filter((e) => e.balance && e.balance.side && e.balance.side !== 'unknown').length;
  checks.running = withBal < Math.max(3, entries.length / 2) ? { state: 'na' }
    : { state: sc.breaks ? 'bad' : 'ok', breaks: sc.breaks, rows: entries.filter((e) => e.balanceBreak) };

  // Same bill or voucher number with the same amount twice on one paper.
  const seen = new Map();
  const dups = [];
  for (const e of entries) {
    const k = refKeys(e.ref).full;
    if (!k || k.length < 3) continue;
    const key = `${k}|${signed(e)}`;
    if (seen.has(key)) { dups.push(e); e.duplicate = true; } else seen.set(key, e);
  }
  checks.duplicates = { state: dups.length ? 'bad' : 'ok', rows: dups };

  const from = dayNumber(doc.period_from), to = dayNumber(doc.period_to);
  const outside = entries.filter((e) => {
    const d = dayNumber(e.date);
    return d != null && ((from != null && d < from - 1) || (to != null && d > to + 1));
  });
  checks.dates = from == null && to == null ? { state: 'na' } : { state: outside.length ? 'bad' : 'ok', rows: outside };

  // The paper itself is in doubt only when its own printed figures disagree with each other.
  const paperWrong = checks.arithmetic.state === 'bad' || checks.duplicates.state === 'bad' || checks.dates.state === 'bad';
  const readDoubt = checks.arithmetic.state !== 'bad' && (checks.totals.state === 'bad' || checks.closing.state === 'bad' || checks.running.state === 'bad');
  return { checks, rows: entries.length, sumDr, sumCr, paperWrong, readDoubt, allOk: !paperWrong && !readDoubt };
}

/** Which paper is short of an entry or has it different, and the next step for the shop. */
export function whereAndWhat(kind, x, periodEnd) {
  const recent = (e) => {
    const d = dayNumber(e?.date), end = dayNumber(periodEnd);
    return d != null && end != null && end - d <= 10;
  };
  switch (kind) {
    case 'onlyTheirs': // The party wrote it, our books do not have it.
      if (x.type === 'payment') return { where: 'ours', act: 'actPayTheirs' };
      if (x.type === 'return' || x.type === 'credit_note') return { where: 'ours', act: 'actReturnTheirs' };
      if (x.type === 'debit_note' || x.type === 'other') return { where: 'ours', act: 'actChargeTheirs' };
      return { where: 'ours', act: recent(x) ? 'actBillTheirsRecent' : 'actBillTheirs' };
    case 'onlyOurs': // Our books have it, the party's statement does not.
      if (x.type === 'payment') return { where: 'theirs', act: recent(x) ? 'actPayOursRecent' : 'actPayOurs' };
      if (x.type === 'return' || x.type === 'debit_note' || x.type === 'credit_note') return { where: 'theirs', act: 'actReturnOurs' };
      if (x.duplicate) return { where: 'ours', act: 'actDupOurs' };
      return { where: 'theirs', act: 'actBillOurs' };
    case 'billDiff': return { where: 'both', act: 'actBillDiff' };
    case 'payDiff': return { where: 'both', act: 'actPayDiff' };
    case 'partial': return { where: x.side, act: 'actPartial' };
    default: return { where: 'both', act: '' };
  }
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
