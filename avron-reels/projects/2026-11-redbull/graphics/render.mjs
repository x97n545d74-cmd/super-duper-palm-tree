// Render reel.html to frames or MP4 through its seek(t) hook.
//   node render.mjs stills 2,8,20,...   -> stills/t_<sec>.jpg (checks)
//   node render.mjs mp4 out.mp4 [from] [to] [fps]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [mode = 'stills', arg = '', a = '0', b = '180', fpsArg = '30'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(here, 'reel.html') + '?render=1');
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every(i => i.complete));

const shot = async t => { await page.evaluate(x => window.seek(x), t); return page.screenshot({ type: 'jpeg', quality: 92 }); };

if (mode === 'stills') {
  fs.mkdirSync(path.join(here, 'stills'), { recursive: true });
  for (const t of arg.split(',').map(Number)) fs.writeFileSync(path.join(here, 'stills', `t_${String(t).padStart(6, '0')}.jpg`), await shot(t));
} else {
  const fps = +fpsArg, from = +a, to = +b, n = Math.round((to - from) * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-maxrate', '16M', '-bufsize', '32M', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-movflags', '+faststart', arg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await shot(from + i / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) console.log(`${(from + i / fps).toFixed(1)}s  ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  console.log('DONE', arg, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
await browser.close();
