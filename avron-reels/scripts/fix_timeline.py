"""Repair word timings in a timeline.json after ASR alignment.

ASR occasionally assigns a run of words to the same instant or out of order (it mishears a
proper noun and re-syncs late). Within each beat, keep only trustworthy anchors (strictly
increasing starts, not bunched into a cluster), then re-time the rest by character length
between anchors. Beat start/end are untouched.

usage: fix_timeline.py <project_dir>
"""
import json, sys

proj = sys.argv[1]
path = f"{proj}/timeline.json"
tl = json.load(open(path))
fixed = 0
for b in tl["beats"]:
    W = b["words"]
    n = len(W)
    anchor = [True] * n
    last = b["start"] - 1e-3
    for i, w in enumerate(W):
        if w["s"] <= last:
            anchor[i] = False
        else:
            last = w["s"]
    # clusters: 3+ consecutive words starting within 0.25 s are not credible at speaking pace
    i = 0
    while i < n:
        j = i
        while j + 1 < n and W[j + 1]["s"] - W[i]["s"] < 0.25:
            j += 1
        if j - i >= 2:  # ASR re-syncs at the end of a bunched run: trust only the last word
            for k in range(i, j):
                anchor[k] = False
        i = j + 1
    pts = [(-1, b["start"])] + [(i, W[i]["s"]) for i in range(n) if anchor[i]] + [(n, b["voEnd"])]
    for (i0, t0), (i1, t1) in zip(pts, pts[1:]):
        gap = list(range(i0 + 1, i1))
        if not gap:
            continue
        a0 = W[i0]["s"] + 0.12 if i0 >= 0 else t0
        a0 = min(a0, t1 - 0.05 * len(gap))
        lens = [max(1, len(W[g]["w"])) for g in gap]
        tot, acc = float(sum(lens)), 0.0
        for g, L in zip(gap, lens):
            s = a0 + (t1 - a0) * acc / tot
            acc += L
            e = a0 + (t1 - a0) * acc / tot
            if abs(W[g]["s"] - s) > 0.02:
                fixed += 1
            W[g]["s"], W[g]["e"] = round(s, 3), round(e, 3)
    for i in range(n - 1):
        W[i]["e"] = round(min(W[i]["e"], W[i + 1]["s"] + 0.25), 3)
json.dump(tl, open(path, "w"), indent=1, ensure_ascii=False)
print(f"re-timed {fixed} words")
