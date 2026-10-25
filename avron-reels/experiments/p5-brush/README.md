# p5.brush check

A minimal sketch that proves `p5` (2.x) and `p5.brush` load from `node_modules` and draw.

```
node experiments/p5-brush/verify.cjs
```

It bundles `sketch.js` with esbuild, opens it in headless Chromium, saves `out/check.png` and exits non-zero if the page throws or no stroke pixels appear.

When importing p5.brush as a module, import `./p5-global.js` (or set `globalThis.p5`) before `p5.brush`. p5.brush only registers its end-of-frame flush when a global `p5` exists, so without it most strokes never reach the canvas and nothing errors.
