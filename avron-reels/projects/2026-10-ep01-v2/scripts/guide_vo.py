"""Guide VO: one Kokoro take per line (Hindi voices), 48 kHz mono WAVs + durations.
usage: guide_vo.py <project_dir> <out_dir>   (models in ~/models/kokoro)"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

proj, out = sys.argv[1:3]
cfg = json.load(open(f"{proj}/lines.json"))
m = os.path.expanduser("~/models/kokoro")
tts = Kokoro(f"{m}/kokoro-v1.0.onnx", f"{m}/voices-v1.0.bin")
os.makedirs(out, exist_ok=True)
SR = 48000
durs = {}
for ln in cfg["lines"]:
    v = cfg["voices"][ln["who"]]
    a, sr = tts.create(ln["tts"], voice=v["kokoro"], speed=v["speed"], lang="hi")
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                        "-af", "atempo=1.15", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"], input=a.astype(np.float32).tobytes(),
                       capture_output=True, check=True)
    a = np.frombuffer(p.stdout, np.float32)
    idx = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, idx[0] - 960):idx[-1] + 1920]
    a = a / (np.abs(a).max() + 1e-9) * 0.8
    sf.write(f"{out}/{ln['id']}.wav", a, SR)
    durs[ln["id"]] = round(len(a) / SR, 3)
    print(ln["id"], durs[ln["id"]])
json.dump(durs, open(f"{out}/durations.json", "w"), indent=1)
print("total speech", round(sum(durs.values()), 2))
