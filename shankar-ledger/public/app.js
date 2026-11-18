import { LANGS, t } from './i18n.js';
import { reconcile, selfCheck, whoOwes } from './match.js';
import { demoOurs, demoTheirs } from './demo.js';
import { pdfToParts, photoToBlobs, readViaClaude } from './claude-reader.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

// Demo build (demo/index.html sets window.LEDGER_DEMO): sample papers are preloaded and
// "check" runs on them without the server or an API key.
const DEMO = Boolean(window.LEDGER_DEMO);
// Claude build (published as a Claude artifact): papers are read in the page on the
// viewer's own Claude account, with no server and no API key.
const VIA_CLAUDE = Boolean(window.LEDGER_VIA_CLAUDE);
const DEMO_FILES = {
  ours: [{ name: 'sample-our-ledger-tally.pdf', thumb: 'sample-our-ledger.png', sample: true }],
  theirs: [{ name: 'sample-party-statement.pdf', thumb: 'sample-party-statement.png', sample: true }],
};
const demoFiles = () => ({ ours: [...DEMO_FILES.ours], theirs: [...DEMO_FILES.theirs] });

const state = {
  lang: LANGS.some((l) => l.code === store.get('lang')) ? store.get('lang') : 'hi',
  files: DEMO ? demoFiles() : { ours: [], theirs: [] },
  docs: { ours: null, theirs: null },   // { key, doc } so an unchanged side is not read twice
  busy: false,
  result: null,                          // { ours, theirs, rec, checks, sample }
  error: null,                           // { key, vars }
};
const T = (key, vars) => t(state.lang, key, vars);
const sideName = (side) => T(side === 'ours' ? 'oursTitle' : 'theirsTitle');

const inr = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);
function fmtDate(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : iso;
}

/** Tiny element builder. Text is always set as text, never as HTML. */
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
}

/* ---------- language ---------- */
function applyLang() {
  document.documentElement.lang = state.lang;
  for (const el of $$('[data-t]')) el.textContent = T(el.dataset.t);
  const box = $('#langs');
  box.replaceChildren(...LANGS.map((l) => h('button', {
    type: 'button', 'aria-pressed': String(l.code === state.lang), lang: l.code,
    onclick: () => { state.lang = l.code; store.set('lang', l.code); stopSpeaking(); applyLang(); },
  }, l.label)));
  renderFiles('ours'); renderFiles('theirs');
  renderError();
  if (state.result) renderResult();
  updateGo();
}

/* ---------- voice ---------- */
let voices = [];
const synth = window.speechSynthesis;
if (synth) {
  const load = () => { voices = synth.getVoices(); };
  load();
  synth.addEventListener?.('voiceschanged', load);
}
const voiceFor = (code) => voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith(code));
let speaking = false;
function stopSpeaking() { if (synth) synth.cancel(); speaking = false; syncListenBtn(); }

/** makeText(lang) returns the words to say. Punjabi falls back to Hindi when the device has no Punjabi voice. */
function speak(makeText) {
  if (!synth) { setError('noVoice'); return; }
  if (speaking) { stopSpeaking(); return; }
  let lang = state.lang;
  if (lang === 'pa' && !voiceFor('pa')) lang = 'hi';
  const u = new SpeechSynthesisUtterance(makeText(lang));
  u.lang = LANGS.find((l) => l.code === lang).speech;
  const v = voiceFor(lang);
  if (v) u.voice = v;
  u.rate = 0.9;
  u.onend = u.onerror = () => { speaking = false; syncListenBtn(); };
  speaking = true; syncListenBtn();
  synth.cancel();
  synth.speak(u);
}
function syncListenBtn() {
  const b = $('#listenBtn span');
  if (b) b.textContent = T(speaking ? 'stop' : 'listen');
}

/* ---------- files ---------- */
const MAX_SIDE_BYTES = 14 * 1024 * 1024; // base64 characters per side

function readAs(file, how) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    how === 'text' ? r.readAsText(file) : r.readAsDataURL(file);
  });
}

/** Phone photos are 8 to 12 MB. Shrink them: 2200 px on the long side keeps the digits sharp. */
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image'));
      i.src = url;
    });
    const scale = Math.min(1, 2200 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.86);
    return { mime: 'image/jpeg', data: dataUrl.split(',')[1], thumb: dataUrl };
  } finally {
    URL.revokeObjectURL(url);
  }
}

let sheetLib;
function loadSheetLib() {
  sheetLib ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/xlsx.full.min.js'; // SheetJS 0.18.5, Apache-2.0, served from this app
    s.onload = () => resolve(window.XLSX);
    s.onerror = () => { sheetLib = undefined; reject(new Error('excel')); };
    document.head.append(s);
  });
  return sheetLib;
}

async function toUpload(file) {
  const name = file.name || 'photo.jpg';
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (VIA_CLAUDE && (file.type === 'application/pdf' || ext === 'pdf')) {
    return { name, badge: 'PDF', ...await pdfToParts(file) };
  }
  if (file.type === 'application/pdf' || ext === 'pdf') {
    const dataUrl = await readAs(file, 'dataurl');
    return { kind: 'file', name, mime: 'application/pdf', data: dataUrl.split(',')[1], badge: 'PDF' };
  }
  if (ext === 'xlsx' || ext === 'xls') {
    const XLSX = await loadSheetLib();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
    const text = wb.SheetNames.map((n) => `# Sheet: ${n}\n${XLSX.utils.sheet_to_csv(wb.Sheets[n], { blankrows: false, dateNF: 'dd-mm-yyyy' })}`).join('\n\n');
    return { kind: 'text', name, text, badge: 'XLS' };
  }
  if (ext === 'csv' || ext === 'txt' || file.type.startsWith('text/')) {
    return { kind: 'text', name, text: await readAs(file, 'text'), badge: ext.toUpperCase() || 'TXT' };
  }
  if (VIA_CLAUDE) return { kind: 'images', name, ...await photoToBlobs(file) };
  const img = await shrinkImage(file);
  return { kind: 'file', name, ...img };
}

async function addFiles(side, fileList) {
  if (DEMO) { setError('demoPick'); return; }
  setError(null);
  for (const file of fileList) {
    try {
      const up = await toUpload(file);
      const size = (list) => list.reduce((n, f) => n + (f.data || f.text || '').length
        + (f.blobs || []).reduce((m, b) => m + b.size * 1.37, 0), 0);
      if (size(state.files[side]) + size([up]) > MAX_SIDE_BYTES) { setError('e_too_big'); break; }
      state.files[side].push(up);
    } catch (err) {
      setError(err?.message === 'excel' ? 'e_excel' : 'e_bad_file', { side: sideName(side) });
    }
  }
  renderFiles(side);
  updateGo();
}

function renderFiles(side) {
  const box = $(`.box[data-side="${side}"]`);
  const list = state.files[side];
  box.classList.toggle('filled', list.length > 0);
  $('[data-files]', box).replaceChildren(...list.map((f, i) => h('li', {},
    f.thumb ? h('img', { src: f.thumb, alt: '' }) : h('span', { class: 'ext' }, f.badge || 'FILE'),
    h('span', { class: 'name' }, f.name),
    f.sample ? h('a', { href: f.thumb, target: '_blank', rel: 'noopener', class: 'view' }, T('view')) : h('button', {
      type: 'button', 'aria-label': `${T('remove')} ${f.name}`,
      onclick: () => { state.files[side].splice(i, 1); renderFiles(side); updateGo(); },
    }, T('remove')),
  )));
}

function updateGo() {
  const ready = state.files.ours.length > 0 && state.files.theirs.length > 0;
  $('#goBtn').disabled = !ready || state.busy;
  $('#needBoth').hidden = ready || state.busy;
  $('#wait').hidden = !state.busy;
}

function setStatus(side, kind) {
  const el = $(`.box[data-side="${side}"] [data-status]`);
  el.hidden = !kind;
  el.className = `status${kind === 'done' ? ' done' : ''}`;
  if (kind === 'reading') el.replaceChildren(h('span', { class: 'spinner' }), T(side === 'ours' ? 'readingOurs' : 'readingTheirs'));
  else if (kind === 'done') el.replaceChildren(T('readDone'));
  else el.replaceChildren();
}

function setError(key, vars) { state.error = key ? { key, vars } : null; renderError(); }
function renderError() {
  const el = $('#error');
  el.hidden = !state.error;
  el.textContent = state.error ? T(state.error.key, state.error.vars) : '';
}

/* ---------- reading with the server ---------- */
function askPin() {
  return new Promise((resolve) => {
    const dlg = $('#pinDialog');
    const input = $('#pinInput');
    input.value = '';
    const finish = (val) => { dlg.close(); $('#pinForm').onsubmit = null; $('#pinCancel').onclick = null; resolve(val); };
    $('#pinForm').onsubmit = (e) => { e.preventDefault(); finish(input.value.trim()); };
    $('#pinCancel').onclick = () => finish(null);
    dlg.showModal();
    input.focus();
  });
}

class ReadError extends Error { constructor(code) { super(code); this.code = code; } }

async function readSide(side) {
  const files = state.files[side].map(({ kind, name, mime, data, text }) => ({ kind, name, mime, data, text }));
  const sig = (f) => (f.blobs ? f.blobs.map((b) => b.size).join(',') : (f.data || f.text || ''));
  const key = JSON.stringify(state.files[side].map((f) => [f.name, sig(f).length, sig(f).slice(0, 64)]));
  if (state.docs[side]?.key === key) return state.docs[side].doc;

  setStatus(side, 'reading');
  if (VIA_CLAUDE) {
    try {
      const doc = await readViaClaude(side, state.files[side]);
      state.docs[side] = { key, doc };
      setStatus(side, 'done');
      return doc;
    } catch (err) {
      setStatus(side, null);
      throw new ReadError(err?.code || 'service');
    }
  }
  for (;;) {
    let reply;
    try {
      const res = await fetch('/api/extract', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ side, files, pin: store.get('pin') || '' }),
      });
      reply = JSON.parse(await res.text());
    } catch {
      setStatus(side, null);
      throw new ReadError('network');
    }
    if (reply.ok) {
      state.docs[side] = { key, doc: reply.doc };
      setStatus(side, 'done');
      return reply.doc;
    }
    if (reply.error === 'pin') {
      if (store.get('pin')) setError('e_pin');
      const pin = await pinGate();
      if (pin == null) { setStatus(side, null); throw new ReadError('cancelled'); }
      setError(null);
      continue;
    }
    setStatus(side, null);
    throw new ReadError(reply.error || 'service');
  }
}

// Both sides may hit the PIN check at once; show one dialog, not two.
let pinPromise = null;
function pinGate() {
  pinPromise ??= askPin().then((pin) => { if (pin != null) store.set('pin', pin); pinPromise = null; return pin; });
  return pinPromise;
}

async function run() {
  if (state.busy) return;
  state.busy = true; setError(null); stopSpeaking(); updateGo();
  if (DEMO) {
    setStatus('ours', 'reading'); setStatus('theirs', 'reading');
    await new Promise((r) => setTimeout(r, 1400));
    setStatus('ours', 'done'); setStatus('theirs', 'done');
    state.busy = false; updateGo();
    showResult(demoOurs, demoTheirs, true);
    return;
  }
  try {
    const [ours, theirs] = await Promise.all(['ours', 'theirs'].map(async (side) => {
      try { return await readSide(side); } catch (err) { err.side = side; throw err; }
    }));
    showResult(ours, theirs, false);
  } catch (err) {
    if (err.code !== 'cancelled') {
      const key = `e_${err.code || 'service'}`;
      setError(t('en', key) === key ? 'e_service' : key, { side: sideName(err.side || 'ours') });
    }
  } finally {
    state.busy = false; updateGo();
  }
}

/* ---------- result ---------- */
function showResult(ours, theirs, sample) {
  window.__ledgerDocs = { ours, theirs }; // read back by the local test bench
  state.result = { ours, theirs, sample, rec: reconcile(ours, theirs), checks: { ours: selfCheck(ours), theirs: selfCheck(theirs) } };
  $('#setup').hidden = true;
  $('#result').hidden = false;
  renderResult();
  window.scrollTo({ top: 0 });
}

function owesText(signedAmount, isOurs, spoken = false, lang = state.lang) {
  const w = whoOwes(signedAmount, isOurs);
  const key = (spoken ? 'sp_' : '') + w.kind;
  return t(lang, key, { x: spoken ? Math.round(w.amount || 0) : inr(w.amount || 0) });
}

function entryLine(e) {
  const bits = [fmtDate(e.date), T(`t_${e.type || 'other'}`), e.ref].filter(Boolean);
  return bits.join(' · ');
}

function entryRow(e, sideLabel) {
  return h('li', {},
    h('div', { class: 'what' },
      h('div', { class: 'l1' }, entryLine(e), (e.unclear || e.balanceBreak) ? h('span', { class: 'chip' }, T('unclearTag')) : null,
        sideLabel ? h('span', { class: 'chip sidechip' }, sideLabel) : null),
      e.particulars ? h('div', { class: 'l2' }, e.particulars) : null),
    h('div', { class: 'amt' }, `₹${inr(Math.abs(e.amt))}`));
}

function section(title, count, sub, rows, calm = false) {
  if (!rows.length) return null;
  return h('section', { class: `sec${calm ? ' calm' : ''}` },
    h('h3', {}, h('span', {}, title), h('span', { class: 'count' }, String(count))),
    sub ? h('p', { class: 'secsub' }, sub) : null,
    h('ul', { class: 'rows' }, rows));
}

function renderResult() {
  const { ours, theirs, rec, checks, sample } = state.result;
  const b = rec.balances;
  const ok = rec.status === 'match';
  const readBad = !checks.ours.ok || !checks.theirs.ok;
  const out = [];

  if (sample) out.push(h('div', { class: 'tag' }, T('sampleTag')));

  out.push(h('div', { class: `verdict ${ok ? 'match' : 'diff'}`, role: 'status' },
    h('div', { class: 'icon', 'aria-hidden': 'true' }, ok ? '✓' : '!'),
    h('div', {},
      h('h2', {}, T(ok ? 'resMatch' : 'resDiff')),
      !ok && b.balanceDiff != null && Math.abs(b.balanceDiff) >= 1
        ? h('p', {}, T('diffAmount', { x: inr(Math.abs(b.balanceDiff)) })) : null)));

  const partyName = ours.party_name || '';
  if (partyName) out.push(h('p', { class: 'partyname' }, `${T('party')}: `, h('b', {}, partyName),
    ours.period_from && ours.period_to ? h('span', { class: 'period' }, ` · ${fmtDate(ours.period_from)} → ${fmtDate(ours.period_to)}`) : null));

  out.push(h('div', { class: 'bals' },
    h('div', { class: 'bal' }, h('div', { class: 'k' }, T('ourBook')), h('div', { class: 'v' }, owesText(b.ourClose, true))),
    h('div', { class: 'bal' }, h('div', { class: 'k' }, T('theirBook')), h('div', { class: 'v' }, owesText(b.theirClose, false)))));

  if (rec.agreedUpTo && !ok) out.push(h('div', { class: 'note good' }, T('agreed', { d: fmtDate(rec.agreedUpTo) })));

  for (const side of ['ours', 'theirs']) {
    const c = checks[side];
    if (!c.ok) out.push(h('div', { class: 'note bad' }, T('readWarn', { side: sideName(side), x: inr(Math.abs(c.off)) })));
    else if (!c.checked) out.push(h('div', { class: 'note' }, T('readNoCheck', { side: sideName(side) })));
    if (c.unclear || c.breaks) out.push(h('div', { class: 'note' }, T('unclear', { side: sideName(side), n: c.unclear + c.breaks })));
  }
  if (b.openingDiff != null && Math.abs(b.openingDiff) >= 1) out.push(h('div', { class: 'note' }, T('openingDiff', { x: inr(Math.abs(b.openingDiff)) })));
  if (rec.unexplained != null && Math.abs(rec.unexplained) >= 1) out.push(h('div', { class: 'note bad' }, T('unexplained', { x: inr(Math.abs(rec.unexplained)) })));

  out.push(h('div', { class: 'actions' },
    h('button', { class: 'btn', id: 'listenBtn', type: 'button', onclick: () => speak(spokenSummary) },
      svg('M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z'), h('span', {}, T(speaking ? 'stop' : 'listen'))),
    h('a', { class: 'btn wa', target: '_blank', rel: 'noopener', href: `https://wa.me/?text=${encodeURIComponent(shareText())}` }, T('whatsapp')),
    DEMO || VIA_CLAUDE ? null : h('button', { class: 'btn ghost', type: 'button', onclick: () => window.print() }, T('print')),
    h('button', { class: 'btn ghost', type: 'button', onclick: reset }, T('again'))));

  const pairRow = (m) => h('li', {},
    h('div', { class: 'what' },
      h('div', { class: 'l1' }, entryLine(m.ours), (m.ours.unclear || m.theirs.unclear) ? h('span', { class: 'chip' }, T('unclearTag')) : null),
      m.ours.particulars ? h('div', { class: 'l2' }, m.ours.particulars) : null),
    h('div', { class: 'amt' },
      h('small', {}, `${T('oursAmt')} ₹${inr(Math.abs(m.ours.amt))}`),
      h('small', {}, `${T('theirsAmt')} ₹${inr(Math.abs(m.theirs.amt))}`),
      h('span', { class: 'gap' }, T('gapOf', { x: inr(Math.abs(m.difference)) }))));
  const billDiffs = rec.mismatches.filter((m) => m.kind !== 'payment');
  const payDiffs = rec.mismatches.filter((m) => m.kind === 'payment');
  out.push(section(T('secMismatch'), billDiffs.length, T('secMismatchSub'), billDiffs.map(pairRow)));
  out.push(section(T('secPayDiff'), payDiffs.length, T('secPayDiffSub'), payDiffs.map(pairRow)));
  out.push(section(T('secPartial'), rec.partial.length, T('secPartialSub'), rec.partial.map((p) => h('li', {},
    h('div', { class: 'what' },
      h('div', { class: 'l1' }, entryLine(p.bill), h('span', { class: 'chip sidechip' }, T(p.side === 'ours' ? 'inOurs' : 'inTheirs'))),
      p.bill.particulars ? h('div', { class: 'l2' }, p.bill.particulars) : null),
    h('div', { class: 'amt' },
      h('small', {}, `${T('billAmt')} ₹${inr(Math.abs(p.bill.amt))}`),
      h('small', {}, `${T('paidAmt')} ₹${inr(Math.abs(p.payment.amt))}`),
      h('span', { class: 'gap' }, T('leftAmt', { x: inr(Math.abs(p.rest)) })))))));

  out.push(section(T('secOnlyOurs'), rec.onlyOurs.length, null, rec.onlyOurs.map((e) => entryRow(e))));
  out.push(section(T('secOnlyTheirs'), rec.onlyTheirs.length, null, rec.onlyTheirs.map((e) => entryRow(e))));
  out.push(section(T('secOut'), rec.outOfPeriod.length, T('secOutSub'),
    rec.outOfPeriod.map((x) => entryRow(x.entry, T(x.side === 'ours' ? 'inOurs' : 'inTheirs'))), true));

  const quiet = (title, sub, rows) => (rows.length ? h('details', { class: 'sec calm' },
    h('summary', {}, title), sub ? h('p', { class: 'secsub' }, sub) : null, h('ul', { class: 'rows' }, rows)) : null);
  out.push(quiet(T('secCancelled', { n: rec.cancelled.length, d: fmtDate(rec.agreedUpTo) }), T('secCancelledSub'),
    rec.cancelled.map(({ kind, item }) => {
      const e = item.ours || item.bill || item;
      const label = { mismatch: T(item.kind === 'payment' ? 'secPayDiff' : 'secMismatch'), partial: T('secPartial'), onlyOurs: T('inOurs'), onlyTheirs: T('inTheirs') }[kind];
      return h('li', {},
        h('div', { class: 'what' }, h('div', { class: 'l1' }, entryLine(e)), h('div', { class: 'l2' }, label)),
        h('div', { class: 'amt' }, `₹${inr(Math.abs(item.difference ?? item.rest ?? item.amt))}`));
    })));
  out.push(quiet(T('secSettled', { n: rec.settled.length }), T('secSettledSub'), rec.settled.map((x) => h('li', {},
    h('div', { class: 'what' }, h('div', { class: 'l1' }, entryLine(x.bill)), h('div', { class: 'l2' }, T(x.side === 'ours' ? 'inOurs' : 'inTheirs'))),
    h('div', { class: 'amt' }, `₹${inr(Math.abs(x.bill.amt))}`)))));

  if (rec.matched.length) {
    out.push(h('details', { class: 'sec calm' },
      h('summary', {}, T('secMatched', { n: rec.matched.length })),
      h('ul', { class: 'rows' }, rec.matched.map((m) => {
        const e = m.ours || m.theirs;
        const notes = [];
        if (m.roundOff) notes.push(T('noteRound', { x: inr(Math.abs(m.roundOff)) }));
        if (m.dateFar) notes.push(T('noteDate', { n: m.dateGap }));
        if (m.how === 'group') notes.push(T('noteGroup', { n: (m.theirsGroup || m.oursGroup).length }));
        if (m.how === 'payBill') notes.push(T('notePayBill', { r: m.bill.ref || '', x: inr(Math.abs(m.bill.amt)) }));
        return h('li', {},
          h('div', { class: 'what' },
            h('div', { class: 'l1' }, entryLine(e), (e.unclear || e.balanceBreak) ? h('span', { class: 'chip' }, T('unclearTag')) : null),
            notes.length ? h('div', { class: 'l2' }, notes.join(' · ')) : null),
          h('div', { class: 'amt' }, `₹${inr(Math.abs(e.amt))}`));
      }))));
  }

  $('#result').replaceChildren(...out.filter(Boolean));

  function spokenSummary(lang) {
    const say = (k, v) => t(lang, k, v);
    const parts = [say(ok ? 'sp_match' : 'sp_diff')];
    if (rec.agreedUpTo && !ok) parts.push(say('sp_agreed', { d: fmtDate(rec.agreedUpTo) }));
    parts.push(`${say('ourBook')}, ${owesText(b.ourClose, true, true, lang)}.`);
    parts.push(`${say('theirBook')}, ${owesText(b.theirClose, false, true, lang)}.`);
    if (rec.mismatches.length + rec.partial.length) parts.push(say('sp_nMismatch', { n: rec.mismatches.length + rec.partial.length }));
    if (rec.onlyOurs.length) parts.push(say('sp_nOurs', { n: rec.onlyOurs.length }));
    if (rec.onlyTheirs.length) parts.push(say('sp_nTheirs', { n: rec.onlyTheirs.length }));
    if (readBad) parts.push(say('sp_warn'));
    return parts.join(' ');
  }

  function shareText() {
    const lines = [`*${T('shop')}: ${T('title')}*`];
    if (partyName) lines.push(`${T('party')}: ${partyName}`);
    lines.push(`${T(ok ? 'resMatch' : 'resDiff')}${!ok && b.balanceDiff != null ? ` (${T('diffAmount', { x: inr(Math.abs(b.balanceDiff)) })})` : ''}`);
    if (rec.agreedUpTo && !ok) lines.push(T('agreed', { d: fmtDate(rec.agreedUpTo) }));
    lines.push(`${T('ourBook')}: ${owesText(b.ourClose, true)}`, `${T('theirBook')}: ${owesText(b.theirClose, false)}`);
    const list = (title, items, fmt) => {
      if (!items.length) return;
      lines.push('', `*${title}*`);
      items.slice(0, 40).forEach((x) => lines.push(`• ${fmt(x)}`));
    };
    list(T('secMismatch'), rec.mismatches, (m) => `${entryLine(m.ours)}: ${T('oursAmt')} ₹${inr(Math.abs(m.ours.amt))}, ${T('theirsAmt')} ₹${inr(Math.abs(m.theirs.amt))}`);
    list(T('secPartial'), rec.partial, (p) => `${entryLine(p.bill)}: ${T('billAmt')} ₹${inr(Math.abs(p.bill.amt))}, ${T('paidAmt')} ₹${inr(Math.abs(p.payment.amt))}`);
    list(T('secOnlyOurs'), rec.onlyOurs, (e) => `${entryLine(e)}: ₹${inr(Math.abs(e.amt))}`);
    list(T('secOnlyTheirs'), rec.onlyTheirs, (e) => `${entryLine(e)}: ₹${inr(Math.abs(e.amt))}`);
    return lines.join('\n');
  }
}

function svg(d) {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d); s.append(p);
  return s;
}

function reset() {
  stopSpeaking();
  state.result = null;
  state.files = DEMO ? demoFiles() : { ours: [], theirs: [] };
  state.docs = { ours: null, theirs: null };
  setStatus('ours', null); setStatus('theirs', null);
  $('#result').hidden = true; $('#result').replaceChildren();
  $('#setup').hidden = false;
  setError(null); renderFiles('ours'); renderFiles('theirs'); updateGo();
  window.scrollTo({ top: 0 });
}

/* ---------- wiring ---------- */
for (const box of $$('.box')) {
  const side = box.dataset.side;
  for (const input of $$('input[type=file]', box)) {
    input.addEventListener('change', async () => { const list = [...input.files]; input.value = ''; await addFiles(side, list); });
  }
  for (const label of $$('.pickbtn', box)) {
    label.tabIndex = 0;
    label.setAttribute('role', 'button');
    label.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('input', label).click(); } });
  }
  // Drag and drop on the computer.
  box.addEventListener('dragover', (e) => e.preventDefault());
  box.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer?.files?.length) addFiles(side, [...e.dataTransfer.files]); });
}
$('#goBtn').addEventListener('click', run);
$('#sampleBtn').addEventListener('click', () => showResult(demoOurs, demoTheirs, true));
$('#helpBtn').addEventListener('click', () => speak((lang) => t(lang, 'helpSpeech')));
if (DEMO) {
  document.documentElement.classList.add('demo');
  $('#sampleBtn').hidden = true;
}
applyLang();
