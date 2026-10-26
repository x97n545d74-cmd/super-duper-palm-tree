// Silver film YouTube thumbnails: node scripts/silver_thumbs.mjs [outDir]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const out = process.argv[2] ?? "out/silver-thumbs";
fs.mkdirSync(out, { recursive: true });
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const k of ["A", "B", "C"]) {
  const composition = await selectComposition({ serveUrl, id: "SilverThumb" + k, chromiumOptions });
  await renderStill({ serveUrl, composition, chromiumOptions, frame: 0, output: `${out}/AVRON_Silver_Thumbnail_${k}.jpg`, imageFormat: "jpeg", jpegQuality: 92 });
  console.log("done", k);
}
fs.rmSync(serveUrl, { recursive: true, force: true });
process.exit(0);
