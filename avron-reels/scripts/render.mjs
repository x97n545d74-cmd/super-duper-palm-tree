// Final render: node scripts/render.mjs <compId> <output.mp4>
// H.264 High / yuv420p / BT.709, AAC 320k, CRF 16. Progress logged to stdout.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [comp = "FuelGap", output = "out/reel.mp4"] = process.argv.slice(2);
const chromiumOptions = { gl: "swangle" };
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: comp, chromiumOptions });
const t0 = Date.now();
let last = -1;
await renderMedia({
  serveUrl, composition, outputLocation: output, chromiumOptions,
  codec: "h264", crf: 16, pixelFormat: "yuv420p", colorSpace: "bt709", x264Preset: "slow",
  audioCodec: "aac", audioBitrate: "320k", imageFormat: "jpeg", jpegQuality: 95, concurrency: 4,
  onProgress: ({ progress, renderedFrames, encodedFrames }) => {
    const pct = Math.floor(progress * 100);
    if (pct !== last) {
      last = pct;
      console.log(`${pct}% rendered=${renderedFrames} encoded=${encodedFrames} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  },
});
console.log("DONE", output, ((Date.now() - t0) / 1000).toFixed(0) + "s");
// remove the temporary bundle (it holds a copy of public/, hundreds of MB)
fs.rmSync(serveUrl, { recursive: true, force: true });
