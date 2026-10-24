"""Build timeline.json from a finished human/ElevenLabs VO without re-pacing it.

Inputs (in <project_dir>):
  vo_raw_words.json   faster-whisper word timestamps of the raw VO
  vo_map.json         {leadIn, tail, beats:[{id, first:[word, word...]}], display:{asr->display}, merge_next:[...],
                       drop:[...], tones:{display->tone}}
Writes <out_dir>/vo.wav (48 kHz, lead-in + tail silence) and <project_dir>/timeline.json.

usage: timeline_from_vo.py <project_dir> <raw_vo> <out_dir>
"""
import json, re, subprocess, sys
import numpy as np

proj, raw, out = sys.argv[1:4]
SR = 48000
W = json.load(open(f"{proj}/vo_raw_words.json"))
cfg = json.load(open(f"{proj}/vo_map.json"))
lead, tail = cfg["leadIn"], cfg["tail"]
norm = lambda s: re.sub(r"[^\w]", "", s).lower()

# locate each beat by its first word(s), in order
starts, pos = [], 0
for b in cfg["beats"]:
    seq = [norm(x) for x in b["first"]]
    for i in range(pos, len(W) - len(seq) + 1):
        if [norm(W[i + k]["w"]) for k in range(len(seq))] == seq:
            starts.append(i); pos = i + 1; break
    else:
        sys.exit(f"beat {b['id']}: could not find {b['first']}")
starts.append(len(W))

disp, merge_next, drop, tones = cfg["display"], set(cfg["merge_next"]), set(cfg["drop"]), cfg["tones"]
beats = []
for k, b in enumerate(cfg["beats"]):
    ws = W[starts[k]:starts[k + 1]]
    toks, carry = [], None
    for w in ws:
        raw_w = w["w"]
        if raw_w in drop:  # spoken-only word (e.g. "रुपै" after crore): extend the previous token instead
            if toks: toks[-1]["e"] = w["e"] + lead
            continue
        if raw_w in merge_next:  # e.g. "Rs." + "903" -> "₹903"
            carry = w; continue
        d = disp.get(raw_w, raw_w)
        s = w["s"]
        if carry is not None:
            pair = carry["w"] + " " + raw_w
            if pair in disp:  # only merge known pairs; otherwise the held word stands on its own
                d, s = disp[pair], carry["s"]
            else:
                cd = disp.get(carry["w"], carry["w"])
                toks.append({"w": cd, "s": round(carry["s"] + lead, 3), "e": round(carry["e"] + lead, 3), "tone": tones.get(cd)})
            carry = None
        toks.append({"w": d, "s": round(s + lead, 3), "e": round(w["e"] + lead, 3), "tone": tones.get(d)})
    # sentence-final punctuation in Hindi lines -> danda (display only)
    beats.append({"id": b["id"], "start": toks[0]["s"], "voEnd": round(ws[-1]["e"] + lead, 3), "words": toks})
for k in range(len(beats)):
    beats[k]["end"] = beats[k + 1]["start"] if k + 1 < len(beats) else beats[k]["voEnd"]

pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.float32)
y = np.concatenate([np.zeros(int(lead * SR), np.float32), x, np.zeros(int(tail * SR), np.float32)])
y = y * (0.89 / max(1e-6, np.max(np.abs(y))))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s24le",
                f"{out}/vo.wav"], input=y.astype(np.float32).tobytes(), check=True)
dur = round(len(y) / SR, 3)
json.dump({"sampleRate": SR, "duration": dur, "voice": "elevenlabs:Tia Mirza – Crisp and Commanding (v4)", "beats": beats},
          open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
for b in beats:
    print(f'{b["id"]:>11} {b["start"]:6.2f}-{b["end"]:6.2f}  {" ".join(w["w"] for w in b["words"])}')
print("duration", dur)
