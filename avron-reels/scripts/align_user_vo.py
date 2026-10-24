"""Cut a user-supplied VO file into beats, optionally speed it up (pitch kept), align caption tokens.

Beats are given as [start, end] seconds in the raw file (from silencedetect + the ASR transcript).
Each beat is written to <out_dir>/vo_beats/<id>.wav; words come from <project>/vo_raw_words.json
(faster-whisper word timestamps on the raw file) and are matched to the narration's reference tokens
(Devanagari, tok[2]); unmatched tokens are spread by character length between anchors.
timeline.json gets beats with start 0 and word times relative to the beat; run snap_beats.py next.

usage: align_user_vo.py <project_dir> <out_dir> <raw_vo> <tempo> <id:start:end> [...]
"""
import difflib, json, os, re, subprocess, sys
import numpy as np
import soundfile as sf

proj, out, raw, tempo = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
spans = [(a.split(":")[0], float(a.split(":")[1]), float(a.split(":")[2])) for a in sys.argv[5:]]
SR = 48000
N = {b["id"]: b for b in json.load(open(f"{proj}/narration.json"))["beats"]}
AW = json.load(open(f"{proj}/vo_raw_words.json"))
os.makedirs(f"{out}/vo_beats", exist_ok=True)
norm = lambda s: re.sub(r"[^\w]", "", s.replace("़", "")).lower()

beats = []
for bid, a, b in spans:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", raw, "-af",
                          f"atempo={tempo},aresample={SR}", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    y = np.frombuffer(pcm, np.float32).copy()
    y[: int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    y[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))
    sf.write(f"{out}/vo_beats/{bid}.wav", y, SR)
    dur = len(y) / SR
    toks = N[bid]["tokens"]
    ref = [norm(t[2] if len(t) > 2 else t[0]) for t in toks]
    aw = [w for w in AW if w["s"] >= a - 0.05 and w["s"] < b]
    hyp = [norm(w["w"]) for w in aw]
    # ASR may write English words in Latin or Devanagari, so each token matches on either spelling
    alt = [norm(t[1]) for t in toks]
    st, en = [None] * len(ref), [None] * len(ref)
    sim = lambda i, j: max(difflib.SequenceMatcher(None, ref[i], hyp[j]).ratio(), difflib.SequenceMatcher(None, alt[i], hyp[j]).ratio())
    j0 = 0
    for i in range(len(ref)):  # greedy monotonic match within a small look-ahead window
        c = [(sim(i, j), j) for j in range(j0, min(len(hyp), j0 + 4))]
        if c and max(c)[0] >= 0.55:
            j = max(c)[1]; st[i], en[i] = (aw[j]["s"] - a) / tempo, (aw[j]["e"] - a) / tempo; j0 = j + 1
    last = -1.0
    for i in range(len(ref)):  # keep anchors monotonic
        if st[i] is not None and st[i] <= last: st[i] = en[i] = None
        elif st[i] is not None: last = st[i]
    known = [i for i in range(len(ref)) if st[i] is not None]
    bounds = [(-1, 0.0)] + [(i, st[i]) for i in known] + [(len(ref), dur)]
    for (i0, t0), (i1, t1) in zip(bounds, bounds[1:]):
        gap = list(range(i0 + 1, i1))
        if not gap: continue
        a0 = en[i0] if i0 >= 0 and en[i0] else t0
        lens = np.array([max(1, len(toks[g][0])) for g in gap], float)
        cum = np.concatenate([[0], np.cumsum(lens)]) / lens.sum()
        for g, c0, c1 in zip(gap, cum[:-1], cum[1:]):
            st[g], en[g] = a0 + (t1 - a0) * c0, a0 + (t1 - a0) * c1
    words = [{"w": t[1], "s": round(st[i], 3), "e": round(max(en[i] or 0, st[i] + 0.12), 3), "tone": t[3] if len(t) > 3 else None}
             for i, t in enumerate(toks)]
    beats.append({"id": bid, "start": 0.0, "voEnd": round(dur, 3), "end": round(dur, 3), "words": words,
                  "asrMatched": f"{len(known)}/{len(ref)}"})
    print(f"{bid:>10} raw {a:6.2f}-{b:6.2f}  -> {dur:5.2f}s  matched {len(known)}/{len(ref)}")

T = json.load(open(f"{proj}/timeline.json"))
T["beats"] = beats
T["voice"] = f"elevenlabs:Tia Mirza – Crisp and Commanding (v4), user-supplied; atempo {tempo}"
json.dump(T, open(f"{proj}/timeline.json", "w"), ensure_ascii=False, indent=1)
