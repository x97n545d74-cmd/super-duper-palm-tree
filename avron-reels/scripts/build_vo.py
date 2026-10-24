"""Re-pace narration: cut at beat boundaries (quietest point near the word gap),
insert designed pauses, and emit a timeline with shifted word timings.

usage: build_vo.py <project_dir> <raw_vo> <out_wav>
Project config: <project_dir>/pacing.json  {leadIn, beats:[{id, firstWord, gapAfter}]}
"""
import json, subprocess, sys
import numpy as np

SR = 48000
proj, raw, out = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = json.load(open(f"{proj}/pacing.json"))
words = json.load(open(f"{proj}/words.json"))

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32).copy()

def quietest(t_nominal, search=0.16):
    """Return time of the lowest-energy 15 ms window within +-search of t_nominal."""
    win = int(0.015 * SR)
    a = max(0, int((t_nominal - search) * SR)); b = min(len(x) - win, int((t_nominal + search) * SR))
    energies = [(np.sum(x[i:i + win] ** 2), i) for i in range(a, b, win // 3)]
    return (min(energies)[1] + win // 2) / SR

beats = cfg["beats"]
cuts = [0.0]
for nb in beats[1:]:
    i = nb["firstWord"]
    cuts.append(quietest((words[i - 1]["e"] + words[i]["s"]) / 2))
cuts.append(len(x) / SR)

fade = int(0.008 * SR)
pieces, timeline, t = [np.zeros(int(cfg["leadIn"] * SR), np.float32)], [], cfg["leadIn"]
for k, b in enumerate(beats):
    seg = x[int(cuts[k] * SR):int(cuts[k + 1] * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    offset = t - cuts[k]
    last = beats[k + 1]["firstWord"] if k + 1 < len(beats) else len(words)
    bw = [{"w": w["w"], "s": round(w["s"] + offset, 3), "e": round(w["e"] + offset, 3)}
          for w in words[b["firstWord"]:last]]
    dur = len(seg) / SR
    timeline.append({"id": b["id"], "start": round(t, 3), "voEnd": round(t + dur, 3),
                     "end": round(t + dur + b["gapAfter"], 3), "words": bw})
    pieces += [seg, np.zeros(int(b["gapAfter"] * SR), np.float32)]
    t += dur + b["gapAfter"]

y = np.concatenate(pieces)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                "-c:a", "pcm_s16le", out], input=y.tobytes(), check=True)
json.dump({"sampleRate": SR, "duration": round(len(y) / SR, 3), "beats": timeline},
          open(f"{proj}/timeline.json", "w"), indent=1)
for b in timeline:
    print(f'{b["id"]:>12} {b["start"]:6.2f} -> {b["end"]:6.2f}  "{" ".join(w["w"] for w in b["words"])}"')
print("total", round(len(y) / SR, 2))
