// Shankar Medicos ledger checker: serves the page and reads uploaded papers with Claude.
// Nothing uploaded is written to disk or logged.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { extractLedger, hasCredentials, ExtractError } from './lib/extract.js';

const here = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env loader, so `node server.js` works on the shop PC without extra tools.
const envFile = path.join(here, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && m[2] && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const PORT = Number(process.env.PORT) || 8080;
const PIN = process.env.APP_PIN || '';
const PUBLIC = path.join(here, 'public');
const MAX_BODY = 32 * 1024 * 1024;
const MAX_FILES = 30;
const PER_HOUR = Number(process.env.READS_PER_HOUR) || 40;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const hits = new Map(); // ip -> timestamps of recent reads
function allowed(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= PER_HOUR) { hits.set(ip, recent); return false; }
  recent.push(now); hits.set(ip, recent);
  return true;
}

// A 4-digit PIN is easy to guess, so wrong tries are counted: 8 per address and
// 40 overall per hour, then PIN checks are refused until the hour passes.
const wrong = { byIp: new Map(), all: [] };
function pinLocked(ip) {
  const now = Date.now();
  wrong.all = wrong.all.filter((t) => now - t < 3600e3);
  const mine = (wrong.byIp.get(ip) || []).filter((t) => now - t < 3600e3);
  wrong.byIp.set(ip, mine);
  return mine.length >= 8 || wrong.all.length >= 40;
}
function pinWrong(ip) {
  const now = Date.now();
  wrong.all.push(now);
  wrong.byIp.set(ip, [...(wrong.byIp.get(ip) || []), now]);
}
function clientIp(req) {
  // Hosts put the caller's address last in X-Forwarded-For; without a proxy, use the socket.
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',').map((x) => x.trim()).filter(Boolean);
  return fwd.length ? fwd[fwd.length - 1] : (req.socket.remoteAddress || '');
}

function pinOk(given) {
  if (!PIN) return true;
  const a = crypto.createHash('sha256').update(String(given || '')).digest();
  const b = crypto.createHash('sha256').update(PIN).digest();
  return crypto.timingSafeEqual(a, b);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new ExtractError('too_big')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function cleanFiles(files) {
  if (!Array.isArray(files) || files.length === 0 || files.length > MAX_FILES) throw new ExtractError('bad_file');
  return files.map((f) => {
    const name = String(f.name || 'file').slice(0, 120);
    if (f.kind === 'text') {
      const text = String(f.text || '');
      if (!text.trim()) throw new ExtractError('bad_file');
      return { kind: 'text', name, text };
    }
    const mime = String(f.mime || '');
    if (mime !== 'application/pdf' && !IMAGE_TYPES.has(mime)) throw new ExtractError('bad_file');
    const data = String(f.data || '');
    if (!data || !/^[A-Za-z0-9+/=]+$/.test(data)) throw new ExtractError('bad_file');
    return { kind: 'file', name, mime, data };
  });
}

async function handleExtract(req, res) {
  const ip = clientIp(req);
  // The reply is sent as 200 with spaces every few seconds while Claude reads, so
  // phone networks and hosting proxies do not drop a slow request. The JSON follows.
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' });
  const beat = setInterval(() => res.write(' '), 8000);
  const done = (obj) => { clearInterval(beat); res.end(JSON.stringify(obj)); };
  try {
    const body = JSON.parse((await readBody(req)).toString('utf8'));
    if (PIN && pinLocked(ip)) return done({ ok: false, error: 'locked' });
    if (!pinOk(body.pin)) { if (body.pin) pinWrong(ip); return done({ ok: false, error: 'pin' }); }
    if (!hasCredentials()) return done({ ok: false, error: 'no_key' });
    if (!allowed(ip)) return done({ ok: false, error: 'busy' });
    const side = body.side === 'theirs' ? 'theirs' : 'ours';
    const doc = await extractLedger(side, cleanFiles(body.files));
    done({ ok: true, doc });
  } catch (err) {
    const code = err instanceof ExtractError ? err.code : err instanceof SyntaxError ? 'bad_file' : 'service';
    if (!(err instanceof ExtractError)) console.error('extract failed:', err?.name || 'error');
    else if (err.code === 'service' || err.code === 'bad_file') console.error('extract failed:', err.code, err.message);
    done({ ok: false, error: code });
  }
}

function serveStatic(req, res) {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel === '/') rel = '/index.html';
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/extract') return void handleExtract(req, res);
  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return void res.end(JSON.stringify({ reader: hasCredentials(), pin: Boolean(PIN) }));
  }
  if (req.method === 'GET' || req.method === 'HEAD') return void serveStatic(req, res);
  res.writeHead(405).end();
});

server.listen(PORT, () => {
  console.log(`Shankar Medicos ledger checker: http://localhost:${PORT}`);
  if (!hasCredentials()) console.log('No ANTHROPIC_API_KEY set: only the built-in sample will work.');
  if (!PIN) console.log('No APP_PIN set: anyone who can open this address can use the reader.');
});
