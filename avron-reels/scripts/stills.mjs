// Render chosen frames as PNGs: node scripts/stills.mjs <compId> <outDir> <frame> [frame...] (swangle GL, works for 3D scenes)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [comp, out, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const chromiumOptions = { gl: "swangle" };
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions });
for (const f of frames) await renderStill({ serveUrl, composition, frame: Number(f), chromiumOptions, output: `${out}/${comp}_${f}.png` });
console.log("ok");
