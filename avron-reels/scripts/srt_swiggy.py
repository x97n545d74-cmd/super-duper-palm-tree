"""YouTube subtitles for the Swiggy film from the beat timeline: each spoken line is split at sentence and clause
breaks into captions of at most two lines of ~42 characters, timed across the line by character count.

usage: srt_swiggy.py <beats.json> <out.srt>
"""
import json, re, sys

beats = json.load(open(sys.argv[1]))["beats"]
MAX = 84  # two lines of ~42


def chunks(text):
    parts = re.split(r"(?<=[.?!])\s+", text.strip())
    out = []
    for p in parts:
        while len(p) > MAX:
            cut = max(p.rfind(", ", 0, MAX), p.rfind(" aur ", 0, MAX), p.rfind(" ", 0, MAX))
            out.append(p[: cut + 1].strip()); p = p[cut + 1:].strip()
        if p:
            out.append(p)
    return out


def wrap(s):
    if len(s) <= 42:
        return s
    mid = len(s) // 2
    k = min((i for i, ch in enumerate(s) if ch == " "), key=lambda i: abs(i - mid))
    return s[:k] + "\n" + s[k + 1:]


ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}"
n, lines = 0, []
for b in beats:
    cs = chunks(b["text"])
    total = sum(len(c) for c in cs)
    t = b["start"]
    for c in cs:
        d = (b["end"] - b["start"]) * len(c) / total
        n += 1
        lines.append(f"{n}\n{ts(t)} --> {ts(t + d - 0.05)}\n{wrap(c)}\n")
        t += d
open(sys.argv[2], "w").write("\n".join(lines))
print(n, "captions")
