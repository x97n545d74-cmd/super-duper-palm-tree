// Silver film style demos. Stills for checking: node scripts/silver_demos.mjs stills <dir>
// Videos: node scripts/silver_demos.mjs video <dir>   (SilverDemoA..E, 13 s each)
// Six signature scenes: node scripts/silver_demos.mjs scenes-stills <dir> | scenes <dir>
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [mode = "stills", out = "out/silver-demos"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
if (mode.startsWith("scenes")) {
  const composition = await selectComposition({ serveUrl, id: "SilverScenes", chromiumOptions });
  if (mode === "scenes-stills") {
    for (const s of [2.0, 4.5, 6.2, 10.0, 13.5, 17.5, 22.5, 26.5, 28.8, 31.5, 36.5, 39.0, 41.5, 45.0, 49.5]) {
      await renderStill({ serveUrl, composition, chromiumOptions, frame: Math.round(s * 30), output: `${out}/s_${String(s).padStart(4, "0")}.jpg`, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
    }
  } else {
    await renderMedia({ serveUrl, composition, chromiumOptions, outputLocation: `${out}/AVRON_Silver_Scenes.mp4`, codec: "h264", crf: 18, pixelFormat: "yuv420p",
      imageFormat: "jpeg", jpegQuality: 92, concurrency: 4, muted: true });
  }
  fs.rmSync(serveUrl, { recursive: true, force: true });
  process.exit(0);
}
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
