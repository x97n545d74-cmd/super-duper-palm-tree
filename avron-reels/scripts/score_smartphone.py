"""Original score + sound design for the India smartphone slowdown reel, built to the timeline.

D-minor tech palette: a low drone under the opening clip, one sub-bass hit on "shipments have fallen
sharply", a minimal 96 BPM pulse under the narration that drops to near silence on the 65% line and
returns for the ending, plus risers and soft impacts on the stat popups. Deterministic.
Writes stems to <out_dir>/stems (music, impacts, risers, sonic_logo, clip).

usage: score_smartphone.py <project_dir> <out_dir>
"""
import json, os, re, subprocess, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
proj, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/stems", exist_ok=True)
tl = json.load(open(f"{proj}/timeline.json"))
OW = json.load(open(f"{proj}/opening_words.json"))
DUR = tl["duration"]
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
BT = {b["id"]: b for b in tl["beats"]}


def w(bid, text, nth=0):
    norm = lambda s: re.sub(r"[^\w$₹.%,]", "", s).lower()
    return [x for x in BT[bid]["words"] if norm(x["w"]) == norm(text)][nth]["s"]


INTRO = float(os.environ.get("INTRO", "2.5"))  # logo-reveal pre-roll before the opening clip
CLIP_LEN = 20.37
ow = lambda text: INTRO + next(x["s"] for x in OW if x["w"].lower().strip(".,") == text)
C = {
    "intro": INTRO, "turn": ow("but"), "ship": ow("shipments"), "clipEnd": INTRO + CLIP_LEN, "vo": BT["b1_budget"]["start"],
    "r10k": w("b1_budget", "₹10,000"), "p32": w("b1_budget", "32%"), "p65": w("b1_budget", "65%"),
    "mem": BT["b2_memory"]["start"], "chips": w("b2_memory", "chips"), "cycle": BT["b3_cycle"]["start"],
    "four": w("b3_cycle", "4"), "survey": BT["b4_survey"]["start"], "one": w("b4_survey", "1"),
    "split": BT["b5_split"]["start"], "p8": w("b5_split", "8%"), "end": BT["b5_split"]["end"],
}
json.dump(C, open(f"{proj}/cues.json", "w"), indent=1)


def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output="sos")
def lp(x, f): return sosfilt(sos("low", f), x)
def hp(x, f): return sosfilt(sos("high", f), x)
def bp(x, lo, hi): return sosfilt(sos("band", [lo, hi]), x)


def win(a, b, fi=0.5, fo=0.5):
    return np.clip((t - a) / max(fi, 1e-3), 0, 1) * np.clip((b - t) / max(fo, 1e-3), 0, 1)


def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(sig))
    buf[i:j] += g * sig[: j - i]


def saw(f, tt): return 2 * ((tt * f) % 1.0) - 1


def tone(f, d, a=0.005, rel=0.2, kind="sine"):
    tt = np.arange(int(d * SR)) / SR
    x = np.sin(2 * np.pi * f * tt) if kind == "sine" else saw(f, tt)
    e = np.minimum(1, tt / a) * np.exp(-tt / rel)
    return x * e


D2, A2, F2, C3, D3, F3, A3, C4, D4 = 73.42, 110.0, 87.31, 130.81, 146.83, 174.61, 220.0, 261.63, 293.66

# ------------------------------------------------------------------ music
music = np.zeros(N)
# drone: detuned low D saws, slow filter swell, under the opening clip and fading into the pulse section
drone = sum(saw(f, t) for f in (D2 / 2, D2 / 2 * 1.004, D2, D2 * 0.997))
drone = lp(drone, 180) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t - 1.2) ** 2)
music += 0.09 * drone * win(0.0, C["vo"] + 1.2, 1.8, 1.4)
music += 0.055 * lp(sum(saw(f, t) for f in (A2, A2 * 1.003)), 300) * win(C["turn"], C["clipEnd"] + 0.4, 2.0, 0.5)

# pulse: 96 BPM, soft kick on beats, filtered 16th plucks, from the hard cut to the end card
bpm = 96.0
spb = 60.0 / bpm
pulse = np.zeros(N)
plucks = np.zeros(N)
prog = [D3, D3, F3, C3]  # bar roots
arp = [0, 7, 12, 7, 3, 7, 12, 15]  # semitone offsets, minor colour
k = 0
tb = C["clipEnd"]
while tb < DUR:
    beat = int(round((tb - C["clipEnd"]) / spb))
    place(pulse, tone(52, 0.35, a=0.002, rel=0.09), tb, 0.55)
    place(pulse, tone(110, 0.05, a=0.001, rel=0.01), tb, 0.22)
    root = prog[(beat // 4) % 4]
    for s in range(4):
        f = root * 2 ** (arp[(beat * 4 + s) % 8] / 12)
        place(plucks, tone(f, 0.25, a=0.003, rel=0.07, kind="saw"), tb + s * spb / 4, 0.18)
    tb += spb
plucks = lp(plucks, 1800)
pad = lp(sum(saw(f, t) for f in (D3, F3, A3, D3 * 1.005, A3 * 0.996)), 900)
sect = win(C["clipEnd"], DUR, 0.05, 1.6)
# near silence on the 65% line, back with the memory beat, a lift for the ending
quiet = 1 - 0.92 * win(C["p65"] - 0.35, C["mem"] + 0.15, 0.25, 0.35)
lift = 1 + 0.35 * win(C["split"], C["end"] + 0.6, 1.0, 0.8)
music += (0.55 * pulse + 0.5 * plucks) * sect * quiet * lift * win(0, C["end"] + 0.2, 0.01, 0.6)
music += 0.05 * pad * sect * quiet * lift
# end card: open D-minor-add9 pad resolving under the sources
endpad = lp(sum(saw(f, t) for f in (D3, A3, C4 * 1.0, D4 * 1.003, F3 * 0.998)), 1400)
music += 0.09 * endpad * win(C["end"] - 0.2, DUR, 0.8, 1.6)

# ------------------------------------------------------------------ impacts
impacts = np.zeros(N)
def boom(d=2.2, f0=60, f1=32, drive=2.2):
    tt = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-tt / 0.18)) / SR
    x = np.tanh(drive * np.sin(ph)) * np.exp(-tt / 0.7)
    n = hp(rng.standard_normal(len(tt)), 1500) * np.exp(-tt / 0.03) * 0.3
    return x + n
def tick(f=1800):
    tt = np.arange(int(0.12 * SR)) / SR
    return np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.018) + 0.6 * tone(70, 0.12, a=0.001, rel=0.05)[: len(tt)]
place(impacts, boom(), C["ship"], 1.0)
place(impacts, boom(1.0, 70, 40, 1.4), C["clipEnd"], 0.55)
for key, g in (("r10k", 0.35), ("p32", 0.45), ("chips", 0.4), ("four", 0.35), ("one", 0.4), ("p8", 0.5)):
    place(impacts, tick(), C[key], g)
place(impacts, boom(1.6, 55, 35, 1.6), C["p65"], 0.5)  # lone sub under the near-silent 65% line
place(impacts, boom(2.4, 58, 30, 1.8), C["end"], 0.6)

# ------------------------------------------------------------------ risers / whooshes
risers = np.zeros(N)
def riser(d):
    tt = np.arange(int(d * SR)) / SR
    n = rng.standard_normal(len(tt))
    lo = bp(n, 300, 6000)
    return lo * (tt / d) ** 2.2
def whoosh(d=0.5):
    tt = np.arange(int(d * SR)) / SR
    return bp(rng.standard_normal(len(tt)), 500, 5000) * np.sin(np.pi * tt / d) ** 2
place(risers, riser(C["ship"] - C["turn"] + 0.02), C["turn"], 0.22)
place(risers, riser(1.0), C["clipEnd"] - 1.0, 0.18)
for key in ("mem", "cycle", "survey", "split"):
    place(risers, whoosh(), C[key] - 0.25, 0.22)

# ------------------------------------------------------------------ sonic logo (end card)
logo = np.zeros(N)
for i, f in enumerate((D4, A3 * 2, D4 * 2)):
    place(logo, tone(f, 1.6, a=0.004, rel=0.5), C["end"] + 0.35 + i * 0.16, 0.22)
    place(logo, tone(f * 2.01, 1.0, a=0.004, rel=0.2), C["end"] + 0.35 + i * 0.16, 0.066)

# ------------------------------------------------------------------ clip audio (Palki, 1.5x), placed at 0
clip = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{out}/opening_audio.wav", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                      capture_output=True, check=True).stdout
clip = np.frombuffer(clip, np.float32).astype(float)
clipbuf = np.zeros(N)
place(clipbuf, clip * np.clip((CLIP_LEN - np.arange(len(clip)) / SR) / 0.08, 0, 1), INTRO)

# ------------------------------------------------------------------ logo reveal (0 .. INTRO)
# wireframe shimmer, one soft whoosh per shard, a low hit when the mark assembles, typing clicks, a swish into the clip
place(risers, riser(0.6) * 0.6, 0.0, 0.5)
for i in range(9):
    place(risers, whoosh(0.28), 0.42 + i * 0.09, 0.16)
place(impacts, boom(1.4, 64, 38, 1.3), 1.42, 0.45)
place(logo, tone(D4, 1.2, a=0.004, rel=0.45), 1.5, 0.12)
for i in range(5):
    place(impacts, tick(2600 + 200 * i), 1.78 + i * 0.09, 0.12)
place(risers, whoosh(0.45), INTRO - 0.3, 0.3)

for name, x in (("music", music), ("impacts", impacts), ("risers", risers), ("sonic_logo", logo), ("clip", clipbuf)):
    x = x / max(1e-9, np.max(np.abs(x))) * 0.89
    sf.write(f"{out}/stems/{name}.wav", np.stack([x, x], 1), SR, subtype="PCM_24")
print("cues", {k: round(v, 2) for k, v in C.items()})
