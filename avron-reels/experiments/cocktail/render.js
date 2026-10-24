// Frame-by-frame render: 3 sub-frames per output frame (t - 1/240, t, t + 1/240) for real motion blur.
// usage: node render.js <out_dir> [fps=30]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const out = process.argv[2] || 'frames'; const fps = Number(process.argv[3] || 30);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve('index.html')); await p.evaluate(() => document.fonts.ready);
  const dur = await p.evaluate(() => window.DURATION); const n = Math.round(dur * fps); let k = 0;
  for (let i = 0; i < n; i++) {
    for (const d of [-1 / 240, 0, 1 / 240]) {
      const t = Math.max(0, Math.min(dur - 1e-4, i / fps + d));
      await p.evaluate(t => window.seek(t), t);
      await p.screenshot({ path: `${out}/s_${String(k++).padStart(6, '0')}.jpg`, type: 'jpeg', quality: 92 });
    }
    if (i % 90 === 0) console.log(`frame ${i}/${n}`);
  }
  await b.close(); console.log('DONE', k, 'subframes');
})();
