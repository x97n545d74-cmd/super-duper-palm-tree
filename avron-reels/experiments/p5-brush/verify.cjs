// Bundles sketch.js, opens it in headless Chromium, saves a screenshot and
// fails if the page throws or the canvas has no dark (stroke) pixels.
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const dir = __dirname;
execFileSync('npx', ['esbuild', 'sketch.js', '--bundle', '--format=iife', '--outfile=out/sketch.bundle.js', '--log-level=warning'], { cwd: dir, stdio: 'inherit' });

(async () => {
  // Serve over http: p5's friendly-error code fetches the script and file:// blocks that.
  const server = http.createServer((req, res) => {
    const f = path.join(dir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
    if (!f.startsWith(dir) || !fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', f.endsWith('.js') ? 'text/javascript' : 'text/html');
    fs.createReadStream(f).pipe(res);
  }).listen(0);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 700, height: 410 } });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e)));
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`http://localhost:${server.address().port}/`);
  await p.waitForFunction(() => window.sketchDone, null, { timeout: 30000 });
  await p.screenshot({ path: path.join(dir, 'out/check.png') });
  const dark = await p.evaluate(() => {
    const c = document.querySelector('canvas');
    const t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
    const ctx = t.getContext('2d'); ctx.drawImage(c, 0, 0);
    const d = ctx.getImageData(0, 0, t.width, t.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 450) n++;
    return n;
  });
  await b.close();
  server.close();
  console.log(`stroke pixels: ${dark}`);
  if (errs.length) console.log(errs.join('\n'));
  process.exit(errs.length || dark < 100 ? 1 : 0);
})();
