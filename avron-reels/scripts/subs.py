"""Write subtitles.srt/.vtt and a VO line sheet from <project>/timeline.json (after fix_timeline.py).

usage: subs.py <project_dir>
"""
import json, re, sys

P = sys.argv[1]
tl = json.load(open(f"{P}/timeline.json"))


def ts(x, sep=","):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)):03d}"


cues = []
for b in tl["beats"]:
    cur = []
    for w in b["words"]:
        if not w["w"] or w.get("mute"):
            continue
        cur.append(w)
        if re.search(r"[।.?…—,]\"?$", w["w"]) and len(" ".join(x["w"] for x in cur)) > 12:
            cues.append(cur); cur = []
    if cur:
        cues.append(cur)
with open(f"{P}/subtitles.srt", "w") as fs, open(f"{P}/subtitles.vtt", "w") as fv:
    fv.write("WEBVTT\n\n")
    for n, c in enumerate(cues, 1):
        txt = " ".join(x["w"] for x in c)
        fs.write(f"{n}\n{ts(c[0]['s'])} --> {ts(c[-1]['e'] + 0.15)}\n{txt}\n\n")
        fv.write(f"{ts(c[0]['s'], '.')} --> {ts(c[-1]['e'] + 0.15, '.')}\n{txt}\n\n")
rows = [f"| {ts(b['start'])[3:8]} | {' '.join(w['w'] for w in b['words'] if w['w'])} |" for b in tl["beats"]]
open(f"{P}/vo_lines.md", "w").write("| Time | Line (Hinglish display) |\n|---|---|\n" + "\n".join(rows) + "\n")
print(len(cues), "cues")
