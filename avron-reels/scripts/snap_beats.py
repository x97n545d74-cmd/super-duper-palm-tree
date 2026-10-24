"""Move each narration beat so it starts on the music grid, then rebuild vo.wav.

Cuts happen at beat starts, so snapping beat starts to the grid puts every cut on the beat.
Each beat's audio (out_dir/vo_beats/<id>.wav) is placed at the next grid line at or after the
previous beat's audio end + min_gap; word timings shift with their beat. The VO is not re-read.

usage: snap_beats.py <project_dir> <out_dir> <grid_origin_s> <grid_step_s> [min_gap_s]
"""
import json, math, sys
import numpy as np
import soundfile as sf

proj, out = sys.argv[1], sys.argv[2]
origin, step = float(sys.argv[3]), float(sys.argv[4])
min_gap = float(sys.argv[5]) if len(sys.argv) > 5 else 0.12
T = json.load(open(f"{proj}/timeline.json"))
cfg = json.load(open(f"{proj}/narration.json"))
SR = T["sampleRate"]
lead = cfg["leadIn"] - origin  # the first beat keeps its small lead-in after the grid line

pieces, t, prev_end = [], 0.0, None
for b in T["beats"]:
    a, _ = sf.read(f"{out}/vo_beats/{b['id']}.wav", dtype="float32")
    dur = len(a) / SR
    if prev_end is None:
        start = origin + lead
    else:
        k = math.ceil((prev_end + min_gap - origin) / step - 1e-9)
        start = origin + k * step
    shift = start - b["start"]
    for w in b["words"]:
        w["s"], w["e"] = round(w["s"] + shift, 3), round(w["e"] + shift, 3)
    b["start"], b["voEnd"] = round(start, 3), round(start + dur, 3)
    pieces.append((start, a))
    prev_end = start + dur
    print(f"{b['id']:>10} start {start:6.2f}  (grid {round((start - origin) / step, 2)})  end {prev_end:6.2f}")

# beat 'end' = next beat start; last beat ends on the next grid line (the end-card cut)
for b, nb in zip(T["beats"], T["beats"][1:]):
    b["end"] = nb["start"]
last = T["beats"][-1]
last["end"] = round(origin + math.ceil((last["voEnd"] + min_gap - origin) / step) * step, 3)
total = last["end"] + cfg["tail"]
y = np.zeros(int(total * SR), np.float32)
for s, a in pieces:
    i = int(round(s * SR))
    y[i:i + len(a)] += a
y *= 0.89 / max(1e-6, float(np.max(np.abs(y))))
sf.write(f"{out}/vo.wav", y, SR, subtype="PCM_24")
T["duration"] = round(total, 3)
T["grid"] = {"origin": origin, "step": step}
json.dump(T, open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
print("end card at", last["end"], "total", T["duration"])
