const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => document.fonts.ready);
  for (const t of process.argv.slice(2).map(Number)) { await p.evaluate(t => window.seek(t), t); await p.screenshot({ path: `out/s_${String(t).padStart(5,'0')}.jpg`, type: 'jpeg', quality: 80 }); }
  console.log(errs.length ? errs.join('\n') : 'no errors'); await b.close();
})();
