"""Build timeline.json for a finished VO using the project's own display tokens.

Use when the ASR transcript of the VO is in a different script (e.g. romanised Hinglish) from the
on-screen captions. Beats are located in the VO by their first ASR word(s); each beat's display tokens
(from narration.json) are spread over that beat's ASR words: one-to-one when the counts match,
otherwise by relative position. The VO itself is not re-paced.

usage: timeline_from_vo_tokens.py <project_dir> <raw_vo> <out_dir>
needs  <project_dir>/vo_raw_words.json, narration.json, vo_beats.json {leadIn, tail, voice, beats:{id: [first words], ...},
       skip: {id: [display tokens not spoken]}}
"""
import json, re, subprocess, sys
import numpy as np

proj, raw, out = sys.argv[1:4]
SR = 48000
W = json.load(open(f"{proj}/vo_raw_words.json"))
nar = {b["id"]: b for b in json.load(open(f"{proj}/narration.json"))["beats"]}
cfg = json.load(open(f"{proj}/vo_beats.json"))
lead, tail = cfg["leadIn"], cfg["tail"]
norm = lambda s: re.sub(r"[^\w]", "", s).lower()

ids = list(cfg["beats"].keys())
starts, pos = [], 0
for bid in ids:
    seq = [norm(x) for x in cfg["beats"][bid]]
    for i in range(pos, len(W) - len(seq) + 1):
        if [norm(W[i + k]["w"]) for k in range(len(seq))] == seq:
            starts.append(i); pos = i + 1; break
    else:
        sys.exit(f"beat {bid}: could not find {seq}")
starts.append(len(W))

beats = []
for k, bid in enumerate(ids):
    ws = W[starts[k]:starts[k + 1]]
    skip = set(cfg.get("skip", {}).get(bid, []))
    toks = [t for t in nar[bid]["tokens"] if t[1] and t[1] not in skip]
    nt, nw = len(toks), len(ws)
    words = []
    for i, tok in enumerate(toks):
        j = i if nt == nw else round(i * (nw - 1) / max(1, nt - 1))
        j2 = j if nt == nw else min(nw - 1, round((i + 1) * (nw - 1) / max(1, nt - 1)) - (0 if i == nt - 1 else 1))
        s = ws[j]["s"]; e = max(ws[max(j, j2)]["e"], s + 0.12)
        words.append({"w": tok[1], "s": round(s + lead, 3), "e": round(e + lead, 3), "tone": tok[3] if len(tok) > 3 else None})
    for i in range(1, len(words)):  # keep monotonic
        if words[i]["s"] <= words[i - 1]["s"]:
            words[i]["s"] = round(words[i - 1]["s"] + 0.05, 3)
    beats.append({"id": bid, "start": round(ws[0]["s"] + lead, 3), "voEnd": round(ws[-1]["e"] + lead, 3), "words": words})
for k in range(len(beats)):
    beats[k]["end"] = beats[k + 1]["start"] if k + 1 < len(beats) else beats[k]["voEnd"]

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32)
y = np.concatenate([np.zeros(int(lead * SR), np.float32), x, np.zeros(int(tail * SR), np.float32)])
y = y * (0.89 / max(1e-6, np.max(np.abs(y))))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le", f"{out}/vo.wav"],
               input=y.astype(np.float32).tobytes(), check=True)
dur = round(len(y) / SR, 3)
json.dump({"sampleRate": SR, "duration": dur, "voice": cfg.get("voice", "human/ElevenLabs"), "beats": beats},
          open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
for b in beats:
    print(f'{b["id"]:>11} {b["start"]:6.2f}-{b["end"]:6.2f}  {" ".join(w["w"] for w in b["words"])}')
print("duration", dur)
