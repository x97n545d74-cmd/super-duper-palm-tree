"""Apply hand-checked word starts to timeline.json. usage: apply_word_overrides.py <project_dir>
<project>/word_overrides.json: {beat_id: [start offsets in s, one per word]}. Ends run to the next start."""
import json, sys

proj = sys.argv[1]
tl = json.load(open(f"{proj}/timeline.json"))
ov = json.load(open(f"{proj}/word_overrides.json"))
for b in tl["beats"]:
    if b["id"] not in ov:
        continue
    offs = ov[b["id"]]
    assert len(offs) == len(b["words"]), (b["id"], len(offs), len(b["words"]))
    for i, w in enumerate(b["words"]):
        w["s"] = round(b["start"] + offs[i], 3)
        w["e"] = round(b["start"] + offs[i + 1], 3) if i + 1 < len(offs) else b["voEnd"]
json.dump(tl, open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
print("overrides:", ", ".join(k for k in ov if not k.startswith("_")))
