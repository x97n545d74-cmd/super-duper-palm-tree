"""Lay the dialogue on a timeline from per-line VO takes and write everything the reel reads.

usage: build_timeline.py <project_dir> <vo_dir> <asset_dir>
  <project_dir>/timeline.json  line starts/ends, caption chunks with word times, scene cues, total
  <asset_dir>/vo.wav           the assembled dialogue (48 kHz mono)
  <asset_dir>/mouth.json       per-frame mouth openness for each character (lip-sync)
Swapping in the real VO: drop new <id>.wav files in <vo_dir>, rerun this, then sfx.py and the mix.
"""
import json, re, sys
import numpy as np, soundfile as sf

proj, vo_dir, asset = sys.argv[1:4]
cfg = json.load(open(f"{proj}/lines.json"))
L = {ln["id"]: ln for ln in cfg["lines"]}
SR, FPS = 48000, 30

# (line id, gap before it in seconds). Gaps are the comedy: reaction beats live in them.
SEQ = [
    ("b1", 0.35),  # he walks in already talking
    ("g1", 0.20),
    ("g2", 0.45),  # push cut to the MARKET CAP wall
    ("g3", 0.40),  # push cut to the pizza
    ("g4", 0.45),  # push cut to the two companies
    ("g5", 0.20),
    ("g6", 0.30),
    ("b2", 0.50),  # push cut back to the two of them
    ("b3", 0.25),
    ("g7", 0.45),  # she checks his phone first
]
END_HOLD = 3.3  # freeze + trombone, then the end card

takes = {i: sf.read(f"{vo_dir}/{i}.wav")[0].astype(np.float32) for i, _ in SEQ}
t = 0.0
lines = []
for i, gap in SEQ:
    t += gap
    d = len(takes[i]) / SR
    lines.append({"id": i, "who": L[i]["who"], "start": round(t, 3), "end": round(t + d, 3)})
    t += d
total = round(t + END_HOLD, 3)

# dialogue track
vo = np.zeros(int(total * SR) + SR, np.float32)
for ln in lines:
    a = takes[ln["id"]]; s = int(ln["start"] * SR)
    vo[s:s + len(a)] += a
vo = vo[:int(total * SR)]
sf.write(f"{asset}/vo.wav", vo, SR)


# caption chunks: '|' splits a line into chunks; word times spread by syllable weight across the take
def syl(w):
    w = w.lower().replace("₹", "")
    if re.fullmatch(r"\d+", w):
        return {"50": 2, "500": 3}.get(w, 2)
    return max(1, len(re.findall(r"[aeiouy]+", w)))


def speech_span(a):
    env = np.abs(a)
    idx = np.where(env > 0.04)[0]
    return idx[0] / SR, idx[-1] / SR


for ln in lines:
    chunks = [c.strip() for c in L[ln["id"]]["cap"].split("|")]
    s0, s1 = speech_span(takes[ln["id"]])
    words = [w for c in chunks for w in c.split()]
    weights = np.array([syl(w) for w in words], float)
    edges = np.concatenate([[0], np.cumsum(weights)]) / weights.sum()
    t0 = ln["start"] + s0; span = s1 - s0
    k = 0
    ln["chunks"] = []
    for c in chunks:
        ws = []
        for w in c.split():
            ws.append({"w": w, "t0": round(t0 + edges[k] * span, 3), "t1": round(t0 + edges[k + 1] * span, 3)}); k += 1
        ln["chunks"].append({"t0": ws[0]["t0"], "t1": ws[-1]["t1"], "words": ws})

# lip-sync: per-frame RMS of each character's own takes, gated, fast attack / slower release
nF = int(np.ceil(total * FPS))
mouth = {}
for who in ("boy", "girl"):
    track = np.zeros_like(vo)
    for ln in lines:
        if ln["who"] == who and not L[ln["id"]].get("vo"):
            a = takes[ln["id"]]; s = int(ln["start"] * SR)
            track[s:s + len(a)] += a
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(track[f * hop:(f + 1) * hop] ** 2)) if f * hop < len(track) else 0 for f in range(nF)])
    ref = np.percentile(rms[rms > 0.01], 90) if (rms > 0.01).any() else 1
    o = np.clip((rms - 0.012) / (ref - 0.012), 0, 1) ** 0.7
    sm = np.zeros_like(o)
    for f in range(nF):
        p = sm[f - 1] if f else 0
        sm[f] = p + (o[f] - p) * (0.85 if o[f] > p else 0.45)
    # syllable flutter so long vowels don't read as a held-open mouth
    sm = sm * (0.82 + 0.18 * np.cos(np.arange(nF) * 2.1))
    mouth[who] = [round(float(v), 3) for v in sm]
json.dump(mouth, open(f"{asset}/mouth.json", "w"))

T = {x["id"]: x for x in lines}
cues = {
    "wall": T["g2"]["start"] - 0.3,
    "pizza": T["g3"]["start"] - 0.25,
    "companies": T["g4"]["start"] - 0.3,
    "double": T["g6"]["start"] + 0.2,
    "set": T["b2"]["start"] - 0.35,
    "phone": T["g7"]["start"] - 0.35,
    "freeze": T["g7"]["end"] + 0.05,
    "endCard": T["g7"]["end"] + 1.0,
}
cues = {k: round(v, 3) for k, v in cues.items()}
json.dump({"total": total, "fps": FPS, "lines": lines, "cues": cues}, open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
print("total", total, "cues", cues)
