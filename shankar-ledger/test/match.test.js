import test from 'node:test';
import assert from 'node:assert/strict';
import { reconcile, selfCheck, refKeys, whoOwes, signedBalance } from '../public/match.js';
import { demoOurs, demoTheirs } from '../public/demo.js';

const E = (date, ref, debit, credit, type = 'invoice') => ({ date, ref, type, particulars: '', debit, credit });
const doc = (open, close, entries, extra = {}) => ({ opening_balance: open, closing_balance: close, entries, ...extra });
const bal = (amount, side) => ({ amount, side });

test('refKeys strips series and year from bill numbers', () => {
  assert.equal(refKeys('DPD/26-27/0112').tail, '112');
  assert.equal(refKeys('SM/2024-25/00123').tail, '123');
  assert.equal(refKeys('112').tail, '112');
  assert.equal(refKeys('CHQ 004512').tail, '4512');
  assert.equal(refKeys('').tail, '');
  assert.equal(refKeys('2024').tail, '2024');
});

test('identical accounts match fully', () => {
  const ours = doc(bal(0, 'credit'), bal(500, 'credit'), [E('2026-04-01', 'A/1', 0, 1500), E('2026-04-05', '', 1000, 0, 'payment')]);
  const theirs = doc(bal(0, 'debit'), bal(500, 'debit'), [E('2026-04-01', '1', 1500, 0), E('2026-04-07', '', 0, 1000, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.status, 'match');
  assert.equal(r.matched.length, 2);
  assert.equal(r.balances.balanceDiff, 0);
});

test('demo data: every difference is found and explains the balance gap', () => {
  assert.equal(selfCheck(demoOurs).ok, true);
  assert.equal(selfCheck(demoTheirs).ok, true);
  const r = reconcile(demoOurs, demoTheirs);
  assert.equal(r.status, 'diff');
  // Bill 301: we booked 15,840, they billed 16,420.
  assert.equal(r.mismatches.length, 1);
  assert.equal(r.mismatches[0].ours.ref, 'DPD/26-27/0301');
  assert.equal(Math.abs(r.mismatches[0].difference), 580);
  // In our books only: the expiry return and the last cheque.
  assert.deepEqual(r.onlyOurs.map((e) => e.ref).sort(), ['CHQ 004561', 'DN-07']);
  // In their statement only: bill 431 and the interest charge.
  assert.deepEqual(r.onlyTheirs.map((e) => e.ref).sort(), ['431', 'INT']);
  // We say we owe 39,932; they say 77,272.
  assert.equal(r.balances.balanceDiff, 37340);
  assert.equal(r.explained, 37340);
  assert.equal(r.unexplained, 0);
});

test('same amount on different dates pairs with the nearest date', () => {
  const ours = doc(null, null, [E('2026-04-01', '', 5000, 0, 'payment'), E('2026-05-01', '', 5000, 0, 'payment')]);
  const theirs = doc(null, null, [E('2026-05-02', '', 0, 5000, 'payment'), E('2026-04-03', '', 0, 5000, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.matched.length, 2);
  for (const m of r.matched) assert.ok(m.dateGap <= 2);
});

test('same amount more than 45 days apart is not paired', () => {
  const ours = doc(null, null, [E('2026-01-01', '', 5000, 0, 'payment')]);
  const theirs = doc(null, null, [E('2026-06-01', '', 0, 5000, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.matched.length, 0);
  assert.equal(r.onlyOurs.length, 1);
  assert.equal(r.onlyTheirs.length, 1);
});

test('a debit never pairs with a debit on the other side', () => {
  const ours = doc(null, null, [E('2026-04-01', 'X9', 700, 0)]);
  const theirs = doc(null, null, [E('2026-04-01', 'X9', 700, 0)]);
  assert.equal(reconcile(ours, theirs).matched.length, 0);
});

test('rupee round-off is matched and reported', () => {
  const ours = doc(null, null, [E('2026-04-01', 'B/771', 0, 1249.6)]);
  const theirs = doc(null, null, [E('2026-04-01', '771', 1250, 0)]);
  const r = reconcile(ours, theirs);
  assert.equal(r.matched.length, 1);
  assert.equal(Math.abs(r.matched[0].roundOff), 0.4);
});

test('one cheque for two bills is matched as a group', () => {
  const ours = doc(null, null, [E('2026-04-10', 'CHQ 1', 9000, 0, 'payment')]);
  const theirs = doc(null, null, [E('2026-04-11', 'R1', 0, 4000, 'payment'), E('2026-04-11', 'R2', 0, 5000, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.matched.length, 1);
  assert.equal(r.matched[0].how, 'group');
  assert.equal(r.onlyTheirs.length, 0);
});

test('entries outside the other paper\'s dates are set apart, not called missing', () => {
  const ours = doc(null, null, [E('2026-04-02', 'A1', 0, 100), E('2026-07-05', 'A2', 0, 200)], { period_from: '2026-04-01', period_to: '2026-07-31' });
  const theirs = doc(null, null, [E('2026-04-02', 'A1', 100, 0)], { period_from: '2026-04-01', period_to: '2026-06-30' });
  const r = reconcile(ours, theirs);
  assert.equal(r.onlyOurs.length, 0);
  assert.equal(r.outOfPeriod.length, 1);
  assert.equal(r.status, 'diff');
});

test('opening balance difference is carried into the explanation', () => {
  const ours = doc(bal(1000, 'credit'), bal(1500, 'credit'), [E('2026-04-01', 'A1', 0, 500)]);
  const theirs = doc(bal(1200, 'debit'), bal(1700, 'debit'), [E('2026-04-01', 'A1', 500, 0)]);
  const r = reconcile(ours, theirs);
  assert.equal(r.status, 'diff');
  assert.equal(r.balances.openingDiff, 200);
  assert.equal(r.balances.balanceDiff, 200);
  assert.equal(r.unexplained, 0);
});

test('selfCheck catches a missed row', () => {
  const d = doc(bal(0, 'debit'), bal(900, 'debit'), [E('2026-04-01', '1', 500, 0)]);
  const c = selfCheck(d);
  assert.equal(c.ok, false);
  assert.equal(c.off, -400);
});

test('whoOwes reads both papers the same way', () => {
  assert.equal(whoOwes(signedBalance(bal(500, 'credit')), true).kind, 'pay');
  assert.equal(whoOwes(signedBalance(bal(500, 'debit')), false).kind, 'pay');
  assert.equal(whoOwes(signedBalance(bal(500, 'debit')), true).kind, 'receive');
  assert.equal(whoOwes(0, true).kind, 'nil');
});

test('cash bill paid the same day in our books is settled, not missing', () => {
  const ours = doc(bal(0, 'credit'), bal(0, 'credit'), [E('2026-04-10', 'C-22666', 0, 2507), E('2026-04-10', '', 2507, 0, 'payment')]);
  const theirs = doc(bal(0, 'debit'), bal(0, 'debit'), [E('2026-04-02', 'R1', 100, 0), E('2026-04-03', '', 0, 100, 'payment')]);
  theirs.entries[0].ref = 'R1';
  ours.entries.push(E('2026-04-02', 'R1', 0, 100), E('2026-04-03', '', 100, 0, 'payment'));
  const r = reconcile(ours, theirs);
  assert.equal(r.settled.length, 1);
  assert.equal(r.onlyOurs.length, 0);
  assert.equal(r.status, 'match');
});

test('same payment with different amounts is one row with the difference', () => {
  const ours = doc(null, null, [E('2026-04-18', '', 1135, 0, 'payment')]);
  const theirs = doc(null, null, [E('2026-04-18', 'CASH', 0, 622, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.mismatches.length, 1);
  assert.equal(r.mismatches[0].kind, 'payment');
  assert.equal(r.mismatches[0].difference, 513);
});

test('payment that covers a cash bill plus the party\'s receipt is explained', () => {
  const ours = doc(null, null, [E('2026-08-08', 'C-30295', 0, 1660), E('2026-08-08', '', 5375, 0, 'payment')]);
  const theirs = doc(null, null, [E('2026-08-08', 'CASH', 0, 3715, 'payment')]);
  const r = reconcile(ours, theirs);
  assert.equal(r.mismatches.length, 0);
  assert.equal(r.onlyOurs.length, 0);
  assert.equal(r.matched[0].how, 'payBill');
});

test('cash bill partly paid leaves the rest as one row', () => {
  const ours = doc(null, null, [E('2026-04-04', 'C-22267', 0, 8384), E('2026-04-04', '', 7798, 0, 'payment')]);
  const theirs = doc(null, null, []);
  const r = reconcile(ours, theirs);
  assert.equal(r.partial.length, 1);
  assert.equal(r.partial[0].rest, -586);
});

test('the last day both papers agree is found', () => {
  // Early on the papers disagree for two days, then agree again; later a new bill is missing.
  const ours = doc(bal(0, 'credit'), bal(1500, 'credit'), [
    E('2026-04-18', 'R1', 0, 1135), E('2026-04-18', '', 1135, 0, 'payment'),
    E('2026-05-01', 'R2', 0, 1500),
  ]);
  const theirs = doc(bal(0, 'debit'), bal(2200, 'debit'), [
    E('2026-04-18', 'R1', 1135, 0), E('2026-04-18', 'CASH', 0, 622, 'payment'), E('2026-04-20', 'CASH', 0, 513, 'payment'),
    E('2026-05-01', 'R2', 1500, 0), E('2026-05-03', 'R3', 700, 0),
  ]);
  const r = reconcile(ours, theirs);
  assert.equal(r.agreedUpTo, '2026-05-01');
  assert.deepEqual(r.onlyTheirs.map((e) => e.ref), ['R3']);
  assert.equal(r.unexplained, 0);
});

test('selfCheck marks the row whose printed running balance does not follow', () => {
  const B = (amount, side) => ({ amount, side });
  const d = doc(bal(0, 'credit'), bal(1500, 'credit'), [
    { ...E('2026-04-01', 'A', 0, 1000), balance: B(1000, 'credit') },
    { ...E('2026-04-02', 'B', 0, 600), balance: B(1700, 'credit') }, // misread: should be 500
    { ...E('2026-04-03', 'C', 200, 0), balance: B(1500, 'credit') },
  ]);
  const c = selfCheck(d);
  assert.equal(c.breaks, 1);
  assert.equal(d.entries[1].balanceBreak, true);
});
