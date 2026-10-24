"""Synthesise narration beat-by-beat with Kokoro (Apache-2.0, local), assemble with designed
pauses (no slicing inside a line), align words with faster-whisper, and write:
  <project>/timeline.json  (same schema as build_vo.py: beats[].words[] = display tokens)
  <out_dir>/vo.wav, <out_dir>/vo_beats/*.wav
  <project>/subtitles.srt, <project>/subtitles.vtt

usage: tts_kokoro.py <project_dir> <out_dir> <kokoro.onnx> <voices.bin>
Model files: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
"""
import difflib, json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel

proj, out, model_path, voices_path = sys.argv[1:5]
cfg = json.load(open(f"{proj}/narration.json"))
SR = 48000
os.makedirs(f"{out}/vo_beats", exist_ok=True)
tts = Kokoro(model_path, voices_path)
asr = WhisperModel("medium", device="cpu", compute_type="int8")


def resample(a, sr):
    p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", "-",
                        "-f", "f32le", "-ar", str(SR), "-ac", "1", "-"], input=a.astype(np.float32).tobytes(),
                       capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.float32)


def trim(a, thr=0.012):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    pad = int(0.04 * SR)
    return a[max(0, idx[0] - pad):idx[-1] + pad]


norm = lambda s: re.sub(r"[^\w.]", "", s.replace("़", "")).strip(".").lower()

pieces = [np.zeros(int(cfg["leadIn"] * SR), np.float32)]
t = cfg["leadIn"]
beats_out = []
for b in cfg["beats"]:
    text = " ".join(tok[0] for tok in b["tokens"])
    a, sr = tts.create(text, voice=cfg["voice"], speed=b.get("speed", 0.9), lang=cfg["lang"])
    a = trim(resample(a, sr))
    sf.write(f"{out}/vo_beats/{b['id']}.wav", a, SR)
    dur = len(a) / SR

    # --- align display tokens using ASR word timestamps as anchors
    pcm16 = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-f", "f32le",
                            "-ar", "16000", "-"], input=a.tobytes(), capture_output=True, check=True).stdout
    segs, _ = asr.transcribe(np.frombuffer(pcm16, np.float32), language="hi", word_timestamps=True, beam_size=5)
    aw = [w for s in segs for w in s.words]
    ref = [norm(tok[2] if len(tok) > 2 else tok[0]) for tok in b["tokens"]]
    hyp = [norm(w.word) for w in aw]
    starts = [None] * len(ref)
    ends = [None] * len(ref)
    for blk in difflib.SequenceMatcher(None, ref, hyp, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            starts[blk.a + k], ends[blk.a + k] = aw[blk.b + k].start, aw[blk.b + k].end
    # fuzzy pass for near-misses (ASR spelling variants)
    for i, r in enumerate(ref):
        if starts[i] is None:
            lo = max([j for j in range(i) if starts[j] is not None] or [-1])
            cands = [(difflib.SequenceMatcher(None, r, h).ratio(), j) for j, h in enumerate(hyp)
                     if (lo < 0 or aw[j].start >= (ends[lo] or 0) - 0.01)]
            if cands:
                sc, j = max(cands)
                if sc >= 0.6:
                    starts[i], ends[i] = aw[j].start, aw[j].end
    # monotonic clean-up + interpolate gaps by character length
    lastS = 0.0
    for i in range(len(ref)):
        if starts[i] is not None and starts[i] < lastS:
            starts[i] = ends[i] = None
        elif starts[i] is not None:
            lastS = starts[i]
    known = [i for i in range(len(ref)) if starts[i] is not None]
    bounds = [(-1, 0.0)] + [(i, starts[i]) for i in known] + [(len(ref), dur)]
    for (i0, t0), (i1, t1) in zip(bounds, bounds[1:]):
        gap = list(range(i0 + 1, i1))
        if not gap:
            continue
        a0 = ends[i0] if i0 >= 0 and ends[i0] else t0
        lens = np.array([max(1, len(b["tokens"][g][0])) for g in gap], float)
        cum = np.concatenate([[0], np.cumsum(lens)]) / lens.sum()
        for g, c0, c1 in zip(gap, cum[:-1], cum[1:]):
            starts[g] = a0 + (t1 - a0) * c0
            ends[g] = a0 + (t1 - a0) * c1
    words = []
    for i, tok in enumerate(b["tokens"]):
        e = ends[i] if ends[i] and ends[i] > starts[i] else starts[i] + 0.2
        words.append({"w": tok[1], "s": round(t + starts[i], 3), "e": round(t + min(e, dur), 3),
                      "tone": tok[3] if len(tok) > 3 else None})
    matched = sum(1 for i in known)
    beats_out.append({"id": b["id"], "start": round(t, 3), "voEnd": round(t + dur, 3),
                      "end": round(t + dur + b["pauseAfter"], 3), "words": words, "asrMatched": f"{matched}/{len(ref)}",
                      "asrHeard": " ".join(w.word for w in aw).strip()})
    print(f'{b["id"]:>12} {t:6.2f}s +{dur:5.2f}s  matched {matched}/{len(ref)}  | {beats_out[-1]["asrHeard"]}')
    pieces += [a, np.zeros(int(b["pauseAfter"] * SR), np.float32)]
    t += dur + b["pauseAfter"]

pieces.append(np.zeros(int(cfg["tail"] * SR), np.float32))
y = np.concatenate(pieces)
y *= 0.89 / max(1e-6, np.max(np.abs(y)))
sf.write(f"{out}/vo.wav", y, SR, subtype="PCM_24")
total = round(len(y) / SR, 3)
json.dump({"sampleRate": SR, "duration": total, "voice": f"kokoro:{cfg['voice']}", "beats": beats_out},
          open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)


# --- subtitles: one cue per beat phrase (split on sentence punctuation)
def ts(x, sep=","):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)):03d}"


cues = []
for b in beats_out:
    cur = []
    for w in b["words"]:
        cur.append(w)
        if re.search(r"[।.?…—,]\"?$", w["w"]) and len(" ".join(x["w"] for x in cur)) > 12:
            cues.append(cur); cur = []
    if cur:
        cues.append(cur)
with open(f"{proj}/subtitles.srt", "w") as fs, open(f"{proj}/subtitles.vtt", "w") as fv:
    fv.write("WEBVTT\n\n")
    for n, c in enumerate(cues, 1):
        txt = " ".join(x["w"] for x in c)
        fs.write(f"{n}\n{ts(c[0]['s'])} --> {ts(c[-1]['e'] + 0.15)}\n{txt}\n\n")
        fv.write(f"{ts(c[0]['s'], '.')} --> {ts(c[-1]['e'] + 0.15, '.')}\n{txt}\n\n")
print("total", total, "s; cues", len(cues))
