"""Write a VO timing sheet for a voice-over recorded outside the pipeline (e.g. the user's own TTS).

Each line gets its start time on the reel, the slot length until the next cut, and the guide read's length,
so a new read can be checked against the cuts before it is dropped in.

usage: vo_sheet.py <project_dir> <out.md>
"""
import json, sys

proj, out = sys.argv[1], sys.argv[2]
T = json.load(open(f"{proj}/timeline.json"))
N = {b["id"]: b for b in json.load(open(f"{proj}/narration.json"))["beats"]}
rows = []
for b in T["beats"]:
    text = " ".join(tok[1] for tok in N[b["id"]]["tokens"])
    rows.append(f"| {b['id']} | {b['start']:.2f} s | {b['end'] - b['start']:.2f} s | {b['voEnd'] - b['start']:.2f} s | {text} |")
md = f"""# VO timing sheet

Record one file per line (or one file with clear pauses). Each line starts on a cut. Keep each read shorter than its slot;
the slot ends at the next cut. The guide read's length is a good target.

| Line | Starts at | Slot | Guide read | Text |
|---|---|---|---|---|
{chr(10).join(rows)}

The reel ends at {T['duration']:.2f} s; the end card starts at {T['beats'][-1]['end']:.2f} s (no VO on the end card).
"""
open(out, "w").write(md)
print(md)
