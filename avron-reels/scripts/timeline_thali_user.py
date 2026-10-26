"""Re-time the thali reel to the user's own VO file (one continuous read, nothing cut).

faster-whisper word stamps on the raw file are matched to the narration's Devanagari tokens across all beats
at once; unmatched tokens are spread by character length between anchors. Writes <out>/vo.wav (48 kHz,
lead-in + tail pad), <project>/vo_raw_words.json and <project>/timeline.json (same schema as tts_kokoro.py).

usage: timeline_thali_user.py <project_dir> <out_dir> <raw_vo>
"""
import difflib, json, re, subprocess, sys
import numpy as np
import soundfile as sf
from faster_whisper import WhisperModel

proj, out, raw = sys.argv[1:4]
SR = 48000
cfg = json.load(open(f"{proj}/narration.json"))
LEAD, TAIL = cfg["leadIn"], cfg["tail"]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
y = np.frombuffer(pcm, np.float32).copy()
dur = len(y) / SR
y16 = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
asr = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = asr.transcribe(np.frombuffer(y16, np.float32), language="hi", word_timestamps=True, beam_size=5)
aw = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
json.dump(aw, open(f"{proj}/vo_raw_words.json", "w"), ensure_ascii=False, indent=0)

norm = lambda s: re.sub(r"[^\w]", "", s.replace("़", "")).lower()
toks = [(bi, tok) for bi, b in enumerate(cfg["beats"]) for tok in b["tokens"]]
# a token may be several spoken words ("चार पॉइंट आठ तीन"): expand to sub-words for matching
sub = [(ti, part) for ti, (_, tok) in enumerate(toks) for part in tok[2].split()]
ref = [norm(p) for _, p in sub]
hyp = [norm(w["w"]) for w in aw]
s_sub = [None] * len(sub)
e_sub = [None] * len(sub)
for blk in difflib.SequenceMatcher(None, ref, hyp, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        s_sub[blk.a + k], e_sub[blk.a + k] = aw[blk.b + k]["s"], aw[blk.b + k]["e"]
# token times = first/last matched sub-word
S = [None] * len(toks); E = [None] * len(toks)
for j, (ti, _) in enumerate(sub):
    if s_sub[j] is not None:
        S[ti] = s_sub[j] if S[ti] is None else min(S[ti], s_sub[j])
        E[ti] = e_sub[j] if E[ti] is None else max(E[ti], e_sub[j])
# numbers: Whisper writes spoken numbers as digits ("5 .54 %"); match display tokens by their digit string
dig = lambda x: re.sub(r"\D", "", x)
for i, (_, tok) in enumerate(toks):
    d = dig(tok[1])
    if S[i] is not None:
        continue
    if len(d) < 2:  # Latin tokens Whisper writes as-is (RBI, CPI, FD)
        lo = max([E[j] for j in range(i) if E[j] is not None] or [0.0]) - 0.05
        hit = [w for w in aw if w["s"] >= lo and norm(w["w"]) == norm(tok[1]) and len(norm(tok[1])) >= 2]
        if hit:
            S[i], E[i] = hit[0]["s"], hit[0]["e"]
        continue
    lo = max([E[j] for j in range(i) if E[j] is not None] or [0.0]) - 0.05
    hi = min([S[j] for j in range(i + 1, len(toks)) if S[j] is not None] or [dur]) + 0.05
    for a in range(len(aw)):
        if aw[a]["s"] < lo or aw[a]["s"] > hi:
            continue
        for b in range(a, min(a + 4, len(aw))):
            if dig("".join(w["w"] for w in aw[a:b + 1])) == d:
                S[i], E[i] = aw[a]["s"], aw[b]["e"]
                break
        if S[i] is not None:
            break
last = -1.0
for i in range(len(toks)):  # monotonic
    if S[i] is not None and S[i] <= last:
        S[i] = E[i] = None
    elif S[i] is not None:
        last = S[i]
known = [i for i in range(len(toks)) if S[i] is not None]
bounds = [(-1, 0.0)] + [(i, S[i]) for i in known] + [(len(toks), dur)]
for (i0, t0), (i1, t1) in zip(bounds, bounds[1:]):
    gap = list(range(i0 + 1, i1))
    if not gap:
        continue
    a0 = E[i0] if i0 >= 0 and E[i0] else t0
    lens = np.array([max(1, len(toks[g][1][0])) for g in gap], float)
    cum = np.concatenate([[0], np.cumsum(lens)]) / lens.sum()
    for g, c0, c1 in zip(gap, cum[:-1], cum[1:]):
        S[g], E[g] = a0 + (t1 - a0) * c0, a0 + (t1 - a0) * c1
print(f"matched {len(known)}/{len(toks)} tokens")

beats = []
for bi, b in enumerate(cfg["beats"]):
    idx = [i for i, (x, _) in enumerate(toks) if x == bi]
    words = [{"w": toks[i][1][1], "s": round(LEAD + S[i], 3), "e": round(LEAD + max(E[i], S[i] + 0.12), 3),
              "tone": toks[i][1][3] if len(toks[i][1]) > 3 else None} for i in idx]
    beats.append({"id": b["id"], "start": words[0]["s"], "voEnd": words[-1]["e"], "words": words,
                  "asrMatched": f"{sum(1 for i in idx if i in known)}/{len(idx)}"})
for a, b in zip(beats, beats[1:]):
    a["end"] = b["start"]
beats[-1]["end"] = beats[-1]["voEnd"]
beats[0]["start"] = 0.0 if beats[0]["start"] < 0.6 else beats[0]["start"]
full = np.concatenate([np.zeros(int(LEAD * SR), np.float32), y, np.zeros(int(TAIL * SR), np.float32)])
full *= 0.89 / max(1e-6, np.max(np.abs(full)))
sf.write(f"{out}/vo.wav", full, SR, subtype="PCM_24")
json.dump({"sampleRate": SR, "duration": round(len(full) / SR, 3), "voice": "user: Tia Mirza Crisp & Commanding v4", "beats": beats},
          open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)
for b in beats:
    print(f'{b["id"]:>10} {b["start"]:6.2f}-{b["voEnd"]:6.2f} matched {b["asrMatched"]}')
print("heard:", " ".join(w["w"] for w in aw))
