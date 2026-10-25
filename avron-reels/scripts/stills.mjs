// Render review stills at given seconds: node scripts/stills.mjs <compId> <outDir> <t1> <t2> ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [comp, outDir, ...times] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions: { gl: "swangle" } });
for (const s of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = path.join(outDir, `t${String(s).padStart(5, "0")}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, chromiumOptions: { gl: "swangle" }, scale: 0.5 });
  console.log("rendered", output);
}
// remove the temporary bundle (it holds a copy of public/, hundreds of MB)
fs.rmSync(serveUrl, { recursive: true, force: true });
