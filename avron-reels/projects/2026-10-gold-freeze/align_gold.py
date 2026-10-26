"""Align the user's VO (audio/vo_fast.wav) to narration.json tokens.
faster-whisper words (re-run on any gap > 3 s that the first pass skipped) are matched to tokens by
DP alignment, scoring each token on both its Devanagari (tts) and Roman (display) spelling.
Writes timeline.json: beats with start/end and Roman display words for captions."""
import difflib, json, re, subprocess, numpy as np, soundfile as sf
from faster_whisper import WhisperModel

cfg = json.load(open("narration.json"))
pcm = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "audio/vo_fast.wav", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                                   capture_output=True, check=True).stdout, np.float32)
dur = len(pcm) / 16000
m = WhisperModel("medium", device="cpu", compute_type="int8")


def asr(a, off):
    segs, _ = m.transcribe(a, language="hi", word_timestamps=True, beam_size=5, condition_on_previous_text=False)
    return [(w.start + off, w.end + off, w.word.strip()) for s in segs for w in s.words]


W = asr(pcm, 0)
fixed = []
for i, w in enumerate(W):  # a word stretched over a skipped span: re-run that span
    nxt = W[i + 1][0] if i + 1 < len(W) else dur
    if w[1] - w[0] > 3 or nxt - w[1] > 3:
        a, b = w[0], nxt
        fixed.append((w[0], min(w[0] + 0.4, w[1]), w[2]))
        fixed += [x for x in asr(pcm[int((a + 0.4) * 16000):int(b * 16000)], a + 0.4)]
    else:
        fixed.append(w)
W = sorted(fixed)
norm = lambda s: re.sub(r"[^\w]", "", s.replace("़", "")).lower()
toks = [(b["id"], t) for b in cfg["beats"] for t in b["tokens"]]
R = [(norm(t[0].split()[0]), norm(t[1].split()[0]), norm(t[2]) if len(t) > 2 else "") for _, t in toks]
H = [norm(w[2]) for w in W]
sim = lambda r, h: max(difflib.SequenceMatcher(None, x, h).ratio() for x in r if x) if h else 0
n, k = len(R), len(H)
D = np.zeros((n + 1, k + 1)); P = np.zeros((n + 1, k + 1), int)
D[1:, 0] = -0.4 * np.arange(1, n + 1); D[0, 1:] = -0.4 * np.arange(1, k + 1)
for i in range(1, n + 1):
    for j in range(1, k + 1):
        s = sim(R[i - 1], H[j - 1])
        opts = (D[i - 1, j - 1] + (s if s >= 0.5 else -0.6), D[i - 1, j] - 0.4, D[i, j - 1] - 0.4)
        P[i, j] = int(np.argmax(opts)); D[i, j] = max(opts)
S = [None] * n; E = [None] * n; i, j = n, k
while i > 0 and j > 0:
    if P[i, j] == 0:
        if sim(R[i - 1], H[j - 1]) >= 0.5: S[i - 1], E[i - 1] = W[j - 1][0], W[j - 1][1]
        i, j = i - 1, j - 1
    elif P[i, j] == 1: i -= 1
    else: j -= 1
known = [i for i in range(n) if S[i] is not None]
bounds = [(-1, 0.0)] + [(i, S[i]) for i in known] + [(n, dur)]
for (i0, t0), (i1, t1) in zip(bounds, bounds[1:]):
    gap = list(range(i0 + 1, i1))
    if not gap: continue
    a0 = E[i0] if i0 >= 0 else t0
    L = np.array([max(1, len(toks[g][1][0])) for g in gap], float); cum = np.concatenate([[0], np.cumsum(L)]) / L.sum()
    for g, c0, c1 in zip(gap, cum[:-1], cum[1:]): S[g] = a0 + (t1 - a0) * c0; E[g] = a0 + (t1 - a0) * c1
beats = []
for b in cfg["beats"]:
    idx = [i for i, (bid, _) in enumerate(toks) if bid == b["id"]]
    words = [{"w": toks[i][1][1], "s": round(S[i], 3), "e": round(max(E[i], S[i] + 0.12), 3),
              "tone": toks[i][1][3] if len(toks[i][1]) > 3 else None} for i in idx]
    beats.append({"id": b["id"], "start": words[0]["s"], "voEnd": words[-1]["e"], "words": words})
for a, b in zip(beats, beats[1:]): a["end"] = round(b["start"] - 0.05, 3)
beats[-1]["end"] = round(dur, 3)
print("matched", len(known), "/", n, "asr words", k)
for b in beats: print(b["id"], b["start"], b["voEnd"], b["end"])
json.dump({"duration": round(dur, 3), "voice": "Tia Mirza – Crisp and Commanding (user ElevenLabs), pauses capped 0.2 s, atempo 1.15",
           "beats": beats}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
