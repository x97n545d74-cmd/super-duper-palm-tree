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

# 1 · find each line's first word in the transcript (monotonic, fuzzy on the first few words)
starts = {}
cursor = {"part1": 0, "part2": 0}
part_of = {}
p = "part1"
for b, line in zip(beats, lines):
    if b["id"] == PART2_FIRST:
        p = "part2"
    part_of[b["id"]] = p
    W = words[p]
    ref = norm(" ".join(OLD.get(b["id"], line).split()[:5]))
    if cursor[p] == 0 and (b["id"] == "open_00" or b["id"] == PART2_FIRST):
        starts[b["id"]] = W[0]["s"]; cursor[p] = 1; continue
    best, bj = 0.0, None
    for j in range(cursor[p], min(len(W), cursor[p] + 220)):
        hyp = norm(" ".join(w["w"] for w in W[j:j + 7]))[: len(ref) + 4]
        r = difflib.SequenceMatcher(None, ref, hyp).ratio()
        if r > best + 0.02:
            best, bj = r, j
    if bj is None or best < 0.45:
        raise SystemExit(f"could not place {b['id']} (best {best:.2f}): {line[:60]}")
    starts[b["id"]] = W[bj]["s"]
    cursor[p] = bj + 1
    print(f"{b['id']:9s} {p} {W[bj]['s']:7.2f}  match {best:.2f}  {line[:50]}")

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
