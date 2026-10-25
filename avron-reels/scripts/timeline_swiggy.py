"""Re-time the Swiggy film to the user's recorded narration.

The narration came as two ElevenLabs files (part1 = open..chapter 5, part2 = chapter 6..close), spoken from
VO_TTS_READY.txt, whose 63 non-empty lines are the film's 63 beats in order. faster-whisper word timestamps
(<project>/vo/partN_words_hi.json, Hindi mode, transliterated) locate where each line starts; each beat then gets its slice of the recording.

The film timeline keeps the structure the shots were built for: an opening pad before the first line, a chapter
card (CARD seconds) plus a breath before every chapter, a pad before the close, and the end card after it.
Writes src/projects/swiggy/film/beats.json (start/end per beat + the source slice) and <project>/vo/vo.wav.

usage: timeline_swiggy.py <project_dir> <film_dir>
"""
import difflib, json, re, subprocess, sys
import numpy as np
import soundfile as sf

proj, film = sys.argv[1], sys.argv[2]
SR = 48000
OPEN_PAD, CARD, BREATH, CLOSE_PAD, END_CARD = 6.0, 3.0, 0.6, 3.5, 8.0
PART2_FIRST = "c6_00"
# Four lines were corrected after the user recorded (Instamart named; the store-pace claim fixed). The main files
# still say the old words, so those beats are matched on the old wording and their audio comes from fix4.mp3.
OLD = {
    "open_04": "One of them is losing about nine point seven crore rupees every day.",
    "c5_03": "Instamart ka contribution margin, yaani har order pe store ke level ka hisaab",
    "c7_03": "Teen. Swiggy ka inventory model kitni jaldi chalu hota hai,",
    "close_01": "Both companies keep that promise. One pays about nine point seven crore",
}
PATCH = {"open_04": (0.0, 9.62), "c5_03": (10.0, 23.95), "c7_03": (24.38, 30.98), "close_01": (31.30, 40.36)}

beats = json.load(open(f"{film}/beats.json"))["beats"]
lines = [l for l in open(f"{proj}/VO_TTS_READY.txt").read().split("\n") if l.strip()]
assert len(lines) == len(beats), (len(lines), len(beats))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def load(part):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{proj}/vo/{part}.mp3", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32).copy()


audio = {p: load(p) for p in ("part1", "part2", "fix4")}
# Hindi-mode ASR writes Hinglish in Devanagari; bring it to Roman so it can be compared with the script
from indic_transliteration import sanscript
roman = lambda w: sanscript.transliterate(w, sanscript.DEVANAGARI, sanscript.ITRANS) if re.search("[\u0900-\u097F]", w) else w
words = {p: [dict(x, w=roman(x["w"])) for x in json.load(open(f"{proj}/vo/{p}_words_hi.json"))] for p in ("part1", "part2")}

# 1 · find each line's first words in the transcript. The speaking rate (characters per second of the part)
#     predicts where the next line should start; only words near that prediction are considered, and a match
#     far from it is penalised, so a weak look-alike later in the file cannot win.
starts = {}
part_of = {}
p = "part1"
for b in beats:
    if b["id"] == PART2_FIRST:
        p = "part2"
    part_of[b["id"]] = p
in_part = {q: [i for i, b in enumerate(beats) if part_of[b["id"]] == q] for q in ("part1", "part2")}
rate = {q: sum(len(lines[i]) for i in in_part[q]) / (words[q][-1]["e"] - words[q][0]["s"]) for q in in_part}
prev = None
prev_guess, guessed = {}, set()
for i, (b, line) in enumerate(zip(beats, lines)):
    p = part_of[b["id"]]
    W = words[p]
    if prev is None or part_of[prev[0]] != p:
        starts[b["id"]] = W[0]["s"]; prev = (b["id"], i); continue
    expect = starts[prev[0]] + len(lines[prev[1]]) / rate[p]
    ref = norm(" ".join(OLD.get(b["id"], line).split()[:5]))
    best, bj = -1.0, None
    for j, w in enumerate(W):
        if w["s"] <= starts[prev[0]] + 1.0 or abs(w["s"] - expect) > 25:
            continue
        hyp = norm(" ".join(x["w"] for x in W[j:j + 7]))[: len(ref) + 4]
        r = difflib.SequenceMatcher(None, ref, hyp).ratio() - 0.006 * abs(w["s"] - expect)
        if r > best:
            best, bj = r, j
    if bj is None or best < 0.45:
        # ASR sometimes drops a stretch of audio; carry the prediction and fix it up from pauses below
        starts[b["id"]] = None
        prev_guess[b["id"]] = expect
        print(f"{b['id']:9s} {p}    ----  expect {expect:7.2f}  (no reliable words, best {best:.2f})")
        prev = (b["id"], i)
        starts[b["id"]] = expect
        guessed.add(b["id"])
        continue
    starts[b["id"]] = W[bj]["s"]
    prev = (b["id"], i)
    print(f"{b['id']:9s} {p} {W[bj]['s']:7.2f}  expect {expect:7.2f}  score {best:.2f}  {line[:44]}")

# guessed lines: re-spread them by characters between the matched lines around them, then snap each to the
# nearest real pause (>= 0.3 s of near-silence) within 4 s
def pauses(y):
    env = np.convolve(np.abs(y), np.ones(480) / 480, mode="same") < 0.01
    out, run = [], 0
    for k in range(0, len(env), 480):
        if env[k]:
            run += 1
        else:
            if run * 0.01 >= 0.3:
                out.append(k / SR - 0.06)  # the moment speech resumes
            run = 0
    return np.array(out)


for q in ("part1", "part2"):
    P = pauses(audio[q])
    idx = in_part[q]
    k = 0
    while k < len(idx):
        if beats[idx[k]]["id"] not in guessed:
            k += 1; continue
        k0 = k
        while k < len(idx) and beats[idx[k]]["id"] in guessed:
            k += 1
        lo, hi = idx[k0 - 1], (idx[k] if k < len(idx) else None)
        t0 = starts[beats[lo]["id"]]
        t1 = starts[beats[hi]["id"]] if hi is not None else words[q][-1]["e"]
        span = list(range(lo, hi if hi is not None else idx[-1] + 1))
        chars = np.cumsum([0] + [len(lines[i]) for i in span])
        for m, i in enumerate(span[1:], 1):
            guess = t0 + (t1 - t0) * chars[m] / chars[-1]
            near = P[np.abs(P - guess) < 4] if len(P) else []
            starts[beats[i]["id"]] = float(near[np.argmin(np.abs(near - guess))]) if len(near) else guess
            print(f"  re-placed {beats[i]['id']} at {starts[beats[i]['id']]:.2f} (guess {guess:.2f})")

# checked by hand against the English-mode transcript (accurate timing, names and English lines); these are the
# line starts the Hindi-mode matching got wrong or late. Each snaps to the nearest pause within 0.7 s.
OVERRIDE = {
    "open_05": 50.29, "c1_00": 52.60, "c1_02": 86.78, "c1_05": 142.46, "c2_02": 174.46, "c2_10": 271.18,
    "c2_11": 286.86, "c3_00": 301.74, "c3_06": 391.00, "c3_07": 407.78, "c5_04": 557.60,
    "c6_01": 2.54, "c7_04": 107.68, "c2_09": 262.66, "c4_01": 423.10, "close_00": 116.60, "close_02": 132.90, "close_03": 144.40,
}
for bid, t0 in OVERRIDE.items():
    P = pauses(audio[part_of[bid]])
    near = P[np.abs(P - t0) < 0.7] if len(P) else []
    starts[bid] = float(near[np.argmin(np.abs(near - t0))]) if len(near) else t0
    print(f"  override {bid} -> {starts[bid]:.2f}")

# every line starts on a pause: snap each start to the nearest pause within 1.2 s (word times are close, not exact)
PZ = {q: pauses(audio[q]) for q in ("part1", "part2")}
for bid in list(starts):
    if starts[bid] <= 0.2:
        continue
    P = PZ[part_of[bid]]
    near = P[np.abs(P - starts[bid]) < 1.2]
    if len(near):
        starts[bid] = float(near[np.argmin(np.abs(near - starts[bid]))])

# 2 · each beat's slice runs to the next line's start (or the end of its part), trimmed of trailing silence
def trim_end(y, a, b):
    seg = y[int(a * SR): int(b * SR)]
    env = np.abs(seg)
    loud = np.where(env > 0.012)[0]
    return a + (loud[-1] / SR + 0.12 if len(loud) else len(seg) / SR)


for i, b in enumerate(beats):
    p = part_of[b["id"]]
    nxt = beats[i + 1]["id"] if i + 1 < len(beats) else None
    end_raw = starts[nxt] if nxt and part_of[nxt] == p else len(audio[p]) / SR
    a = max(0.0, starts[b["id"]] - 0.08)
    b["src"] = {"part": p, "a": round(a, 3), "b": round(min(trim_end(audio[p], a, end_raw), end_raw), 3)}
    if b["id"] in PATCH:
        b["src"] = {"part": "fix4", "a": PATCH[b["id"]][0], "b": PATCH[b["id"]][1], "replaces": b["src"]}

# 3 · lay the beats on the film clock
t = OPEN_PAD
prev_section = beats[0]["section"]
for b in beats:
    if b["section"] != prev_section:
        t += (CLOSE_PAD if b["section"] == "close" else CARD + BREATH)
        prev_section = b["section"]
    dur = b["src"]["b"] - b["src"]["a"]
    b["start"], b["end"] = round(t, 3), round(t + dur, 3)
    t = b["end"] + 0.35  # a breath between lines
duration = round(beats[-1]["end"] + END_CARD, 2)

# 4 · write the narration track on the same clock
vo = np.zeros(int(duration * SR) + SR, np.float32)
for b in beats:
    y = audio[b["src"]["part"]][int(b["src"]["a"] * SR): int(b["src"]["b"] * SR)].copy()
    f = int(0.01 * SR); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    s = int(b["start"] * SR)
    vo[s: s + len(y)] += y
sf.write(f"{proj}/vo/vo.wav", vo[: int(duration * SR)], SR)
json.dump({"duration": duration, "voice": "ElevenLabs v4 · Tia Mirza (Crisp and Commanding), user-generated", "beats": beats},
          open(f"{film}/beats.json", "w"), indent=1, ensure_ascii=False)
print("duration", duration, "s =", round(duration / 60, 2), "min")
