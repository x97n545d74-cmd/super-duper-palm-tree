// Reading papers inside the published Claude page, on the viewer's own Claude account.
// No server and no API key: the page asks Claude through window.claude.use("sample").
// PDFs with real text are sent as text (exact, cheap); scans and photos as images.
import { SCHEMA, SYSTEM } from './prompt.js';
import { selfCheck } from './match.js';

export class ReadError extends Error { constructor(code) { super(code); this.code = code; } }

/* ---------- PDF ---------- */
let pdfLib;
function loadPdfLib() {
  pdfLib ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'vendor/pdf.min.js'; // PDF.js 3.11.174, Apache-2.0
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    s.onerror = () => { pdfLib = undefined; reject(new Error('pdf')); };
    document.head.append(s);
  });
  return pdfLib;
}

/**
 * Text of one page, laid out in fixed-width columns so the debit and credit columns stay
 * apart (a number's column is what tells debit from credit).
 */
function pageText(items) {
  const CHAR = 4.6; // points per character column
  const rows = [];
  for (const it of items) {
    const str = (it.str || '').trim();
    if (!str) continue;
    const x = it.transform[4], y = it.transform[5];
    let row = rows.find((r) => Math.abs(r.y - y) < 3);
    if (!row) { row = { y, parts: [] }; rows.push(row); }
    row.parts.push({ x, str });
  }
  rows.sort((a, b) => b.y - a.y);
  return rows.map((r) => {
    r.parts.sort((a, b) => a.x - b.x);
    let line = '';
    for (const p of r.parts) {
      const col = Math.round(p.x / CHAR);
      line += line.length < col ? ' '.repeat(col - line.length) : (line ? ' ' : '');
      line += p.str;
    }
    return line.replace(/\s+$/, '');
  }).join('\n');
}

/** A PDF becomes either laid-out text (a PDF made by software) or page images (a scan). */
export async function pdfToParts(file) {
  const lib = await loadPdfLib();
  const pdf = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  if (pdf.numPages > 40) throw new ReadError('too_long');
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    pages.push({ page, text: pageText((await page.getTextContent()).items) });
  }
  // Some PDFs store text in a scrambled font encoding: it is there but not readable. Only
  // trust the text when it holds real dates and amounts; otherwise send the pages as images.
  const all = pages.map((p) => p.text).join('\n');
  const dates = (all.match(/\b\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{2,4}\b/g) || []).length;
  const amounts = (all.match(/\d[\d,]*\.\d{2}\b/g) || []).length;
  if (dates >= 3 * pdf.numPages && amounts >= 3 * pdf.numPages) {
    return { kind: 'text', text: pages.map((p, i) => `--- page ${i + 1} ---\n${p.text}`).join('\n\n') };
  }
  const blobs = [];
  for (const { page } of pages) {
    const vp = page.getViewport({ scale: 1 });
    const scale = 2200 / Math.max(vp.width, vp.height);
    const view = page.getViewport({ scale });
    const c = document.createElement('canvas');
    c.width = Math.round(view.width); c.height = Math.round(view.height);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: view }).promise;
    blobs.push(...await halves(c));
  }
  return { kind: 'images', blobs };
}

/* ---------- images ---------- */
const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));

/**
 * Claude downsizes each image to about 1.2 megapixels. A whole page at that size makes small
 * digits hard to read, so a tall page is sent as a top and a bottom half that overlap a little.
 */
export async function halves(canvas) {
  if (canvas.height < canvas.width * 1.15) return [await toBlob(canvas)];
  const overlap = Math.round(canvas.height * 0.06);
  const half = Math.ceil(canvas.height / 2);
  const out = [];
  for (const top of [0, half - overlap]) {
    const h = Math.min(half + overlap, canvas.height - top);
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = h;
    c.getContext('2d').drawImage(canvas, 0, top, canvas.width, h, 0, 0, canvas.width, h);
    out.push(await toBlob(c));
  }
  return out;
}

export async function photoToBlobs(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('image'));
      i.src = url;
    });
    const scale = Math.min(1, 2600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const thumb = (() => {
      const t = document.createElement('canvas');
      const k = 88 / Math.max(c.width, c.height);
      t.width = Math.round(c.width * k); t.height = Math.round(c.height * k);
      t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
      return t.toDataURL('image/jpeg', 0.7);
    })();
    return { blobs: await halves(c), thumb };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* ---------- asking Claude ---------- */
let samplePromise;
const getSample = () => (samplePromise ??= window.claude?.use ? window.claude.use('sample') : Promise.resolve(null));

const CODE_MAP = {
  not_granted: 'claude_off', sampling_disabled: 'claude_off', not_declared: 'claude_off',
  capability_disabled: 'claude_off', capability_removed: 'claude_off', images_unavailable: 'claude_off',
  session_expired: 'signin', rate_limited: 'busy', refused: 'refused', image_rejected: 'bad_file',
  prompt_too_large: 'too_long', cancelled: 'cancelled',
};

function instructions(side, nImages, chunk) {
  const what = side === 'ours'
    ? "This is from Shankar Medicos' own books: the account of one party as kept in Tally or Busy."
    : "This is the statement the other party sent: Shankar Medicos' account as kept in that party's books.";
  const imgNote = nImages
    ? `\nThe ${nImages} attached image(s) are pages in order. A tall page is cut into a top and a bottom half that overlap slightly: a row that appears at the bottom of one half and the top of the next is ONE row, copy it once.`
    : '';
  const chunkNote = chunk ? `\nThis is part ${chunk.n} of ${chunk.of} of the same account. Copy only the rows in this part. Give the opening balance only if it is printed in this part and the closing balance only if it is printed in this part; otherwise amount 0 and side "unknown".` : '';
  return `${SYSTEM}\n\n${what}${imgNote}${chunkNote}\n\nReply with only one JSON object that follows this JSON Schema, and no other text:\n${JSON.stringify(SCHEMA)}`;
}

function clean(doc) {
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.entries)) throw new ReadError('service');
  const num = (n) => (Number.isFinite(Number(n)) ? Math.abs(Number(n)) : 0);
  const bal = (b) => ({ amount: num(b?.amount), side: ['debit', 'credit'].includes(b?.side) ? b.side : 'unknown' });
  const types = ['invoice', 'payment', 'credit_note', 'debit_note', 'return', 'other'];
  return {
    is_ledger: doc.is_ledger !== false,
    party_name: String(doc.party_name || ''),
    period_from: String(doc.period_from || ''),
    period_to: String(doc.period_to || ''),
    opening_balance: bal(doc.opening_balance),
    closing_balance: bal(doc.closing_balance),
    notes: String(doc.notes || ''),
    entries: doc.entries.map((e) => ({
      date: String(e?.date || ''), ref: String(e?.ref || ''),
      type: types.includes(e?.type) ? e.type : 'other',
      particulars: String(e?.particulars || ''),
      debit: num(e?.debit), credit: num(e?.credit), balance: bal(e?.balance), unclear: Boolean(e?.unclear),
    })),
  };
}

async function askOnce(sample, side, texts, blobs, tier, chunk) {
  const body = texts.length ? `\n\nThe paper as text (columns kept in place with spaces):\n\n${texts.join('\n\n')}` : '';
  try {
    const raw = await sample.json(instructions(side, blobs.length, chunk) + body, {
      modelTier: tier, ...(blobs.length ? { images: blobs } : {}),
    });
    return clean(raw);
  } catch (e) {
    if (e instanceof ReadError) throw e;
    throw new ReadError(CODE_MAP[e?.code] || 'service');
  }
}

/** One side's papers, read into the same shape the server returns. */
export async function readViaClaude(side, files) {
  const sample = await getSample();
  if (!sample) throw new ReadError('claude_off');
  const texts = [];
  const blobs = [];
  for (const f of files) {
    if (f.kind === 'text') texts.push(`File "${f.name}":\n${f.text}`);
    if (f.kind === 'images') blobs.push(...f.blobs);
  }
  if (new TextEncoder().encode(texts.join('')).length > 200_000) throw new ReadError('too_long');

  const limits = await sample.limits().catch(() => null);
  if (blobs.length && !limits?.images) throw new ReadError('claude_off');
  // Keep both halves of a page in the same call: an even number of images per call.
  const max = limits?.images?.maxCount || 1;
  const per = max >= 2 ? max - (max % 2) : 1;

  const read = async (tier) => {
    if (blobs.length <= per) return askOnce(sample, side, texts, blobs, tier, null);
    // More images than one call takes: read in parts, then join them in order.
    const parts = [];
    const of = Math.ceil(blobs.length / per);
    for (let i = 0; i < of; i++) {
      parts.push(await askOnce(sample, side, i === 0 ? texts : [], blobs.slice(i * per, (i + 1) * per), tier, { n: i + 1, of }));
    }
    const known = (b) => b.side !== 'unknown';
    return {
      ...parts[0],
      // The period is printed in the header of the first page; later parts can only guess it.
      period_from: parts.find((p) => p.period_from)?.period_from || '',
      period_to: parts.find((p) => p.period_to)?.period_to || '',
      opening_balance: parts.find((p) => known(p.opening_balance))?.opening_balance || parts[0].opening_balance,
      closing_balance: [...parts].reverse().find((p) => known(p.closing_balance))?.closing_balance || parts[0].closing_balance,
      is_ledger: parts.some((p) => p.is_ledger),
      entries: parts.flatMap((p) => p.entries),
      notes: parts.map((p) => p.notes).filter(Boolean).join(' '),
    };
  };

  let doc = await read('default');
  const check = selfCheck(doc);
  if (!check.ok || check.unclear > 0 || check.breaks > 0) {
    // One more careful reading on the most capable model when the totals do not add up.
    try {
      const again = await read('complex');
      const c2 = selfCheck(again);
      const better = c2.ok && (!check.ok || c2.breaks < check.breaks || (c2.breaks === check.breaks && c2.unclear < check.unclear));
      if (better || (!check.ok && !c2.ok && Math.abs(c2.off) < Math.abs(check.off))) doc = again;
    } catch (e) {
      if (e.code === 'claude_off' || e.code === 'cancelled') throw e;
    }
  }
  if (!doc.is_ledger) throw new ReadError('not_ledger');
  return doc;
}
