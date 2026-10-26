// Silver film style demos. Stills for checking: node scripts/silver_demos.mjs stills <dir>
// Videos: node scripts/silver_demos.mjs video <dir>   (SilverDemoA..E, 13 s each)
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [mode = "stills", out = "out/silver-demos"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const ids = ["A", "B", "C", "D", "E"];
for (const k of ids) {
  const composition = await selectComposition({ serveUrl, id: "SilverDemo" + k, chromiumOptions });
  if (mode === "stills") {
    for (const s of [0.6, 4.2, 8.4, 12.4]) {
      await renderStill({ serveUrl, composition, chromiumOptions, frame: Math.round(s * 30), output: `${out}/${k}_${s}.jpg`, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
    }
  } else {
    await renderMedia({ serveUrl, composition, chromiumOptions, outputLocation: `${out}/AVRON_Silver_Demo_${k}.mp4`, codec: "h264", crf: 18, pixelFormat: "yuv420p",
      imageFormat: "jpeg", jpegQuality: 92, concurrency: 4, muted: true });
  }
  console.log("done", k);
}
fs.rmSync(serveUrl, { recursive: true, force: true });
