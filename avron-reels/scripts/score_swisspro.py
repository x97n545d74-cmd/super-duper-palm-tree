"""Original score for the SwissPro style test (120 BPM, D major), built from the same cue file as the picture.

  python3 scripts/score_swisspro.py   ->  public/swisspro/score.wav (48 kHz stereo, -14 LUFS)

Swiss idea (lemo-opuscar swiss-motion: "picture and music can share one data file"): every grid module that lands plays
one note, the 62% landing and the ~6 GW reveal get chords, the knife cut drops the drums for a bar.
Musical elements only (no UI sound effects): AVRON SFX come from the ElevenLabs kit once it exists.
"""
import json
import pathlib
import subprocess

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = pathlib.Path(__file__).resolve().parent.parent
C = json.loads((ROOT / "src/projects/style-light/swisspro_cues.json").read_text())
SR = 48000
DUR = C["duration"]
BEAT = 60 / C["bpm"]
N = int(SR * DUR)
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(1928)


def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def place(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i + len(sig) <= 0:
        return
    if i < 0:  # starts before the film: keep the tail
        sig, i = sig[-i:], 0
    s = sig[: N - i] * g
    L[i:i + len(s)] += s * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(s)] += s * np.sqrt(0.5 * (1 + pan))


def hz(m):  # midi -> Hz
    return 440 * 2 ** ((m - 69) / 12)


def pluck(m, d=0.6, bright=1.0):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * bright * np.sin(4 * np.pi * f * t) + 0.12 * bright * np.sin(6 * np.pi * f * t)
    return x * env(n, 0.003, d * 0.35)


def marimba(m, d=0.7):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) * env(n, 0.002, 0.25) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * env(n, 0.001, 0.04)
    return x


def glass(m, d=0.5):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = hz(m)
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2.76 * f * t)) * env(n, 0.002, 0.12)


def kick(g=1.0):
    n = int(SR * 0.35)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 30)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12)
    # a saturated copy so the thump survives a phone speaker
    return (x + 0.35 * np.tanh(3 * sosfilt(sos("high", 150), x))) * g


def hat(g=1.0):
    n = int(SR * 0.05)
    return sosfilt(sos("high", 8000), rng.standard_normal(n)) * env(n, 0.0005, 0.012) * g


def bass(m, d):
    n = int(SR * d)
    t = np.arange(n) / SR
    f = hz(m)
    x = np.tanh(1.6 * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)))
    return sosfilt(sos("low", 900), x) * env(n, 0.006, d * 0.6)


def pad(notes, d, cutoff=1800):
    n = int(SR * d)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * hz(m) * t + rng.uniform(0, 6)) + 0.5 * np.sin(2 * np.pi * hz(m) * 1.003 * t) for m in notes)
    a = np.minimum(1, t / 0.9) * np.minimum(1, (d - t) / 0.9)
    return sosfilt(sos("low", cutoff), x) * a / len(notes)


# ---- harmony: D major, two-bar loop Dmaj9 -> Bm9 -> Gmaj9 -> A6
CHORDS = [(62, [62, 66, 69, 73, 76]), (59, [59, 62, 66, 69, 73]), (55, [55, 59, 62, 66, 69]), (57, [57, 61, 64, 66, 69])]
BAR = 4 * BEAT

# pad bed for the whole film (drops under the knife cut)
for b in range(int(DUR / BAR) + 1):
    root, notes = CHORDS[b % 4]
    place(pad(notes, BAR + 0.6), b * BAR - 0.3, 0.16)

# groove from the shrink to the knife, and again from the grid to the end
def groove(a, b, half=False):
    t = a
    i = 0
    while t < b - 1e-6:
        if not half or i % 2 == 0:  # four on the floor, or half time under the grid
            place(kick(), t, 0.55)
        place(hat(), t + BEAT / 2, 0.12, 0.3)
        bar = int(t / BAR) % 4
        if i % 2 == 0:
            place(bass(CHORDS[bar][0] - 12, BEAT * 0.9), t, 0.32)
        t += BEAT
        i += 1

groove(C["shrink"], C["match"])
groove(C["solid"][0], C["collapse"], half=True)

# soft 16th arpeggio under the dashboard
arp = [74, 78, 81, 85]
t = C["shrink"]
j = 0
while t < C["match"]:
    root = CHORDS[int(t / BAR) % 4][1]
    place(pluck(root[j % 5] + 12, 0.3, 0.6), t, 0.05, -0.4 + 0.8 * (j % 2))
    t += BEAT / 2
    j += 1

# ---- cues
place(glass(86, 0.8), C["headline_chars"], 0.12)
place(kick(1.2), C["boom"], 0.6)                 # "boom" lands
place(pad([50, 57, 62, 66], 2.2, 900), C["boom"], 0.35)
for i, at in enumerate(C["rows"]):               # rows: rising notes
    place(marimba(74 + [0, 4, 7][i]), at, 0.28)
place(glass(90, 0.4), C["tab"], 0.1)
place(marimba(81, 0.5), C["click"], 0.3)          # the click
steps = 12                                        # count-up: rising ticks
for s in range(steps):
    place(glass(74 + s, 0.18), C["count"] + s * C["count_dur"] / steps, 0.07 + 0.01 * s)
place(kick(1.3), C["land62"], 0.7)                # 62% lands: chord hit
for m in [62, 66, 69, 74, 78]:
    place(marimba(m, 1.2), C["land62"], 0.16)
# knife cut: drums already stopped at match; a filtered noise sweep marks the cut
n = int(SR * 0.6)
sweep = sosfilt(sos("band", [600, 5000]), rng.standard_normal(n)) * np.linspace(0, 1, n) ** 2 * env(n, 0.5, 0.5)
place(sweep, C["match"] - 0.5, 0.05)
# the grid plays itself: one note per solid module (D major scale up), glass notes for the estimate modules
scale = [62, 64, 66, 67, 69, 71, 73, 74]
for i, at in enumerate(C["solid"]):
    place(marimba(scale[i]), at, 0.3, -0.5 + i / 7)
for i in range(22):
    place(glass(74 + scale[i % 8] - 62 + 12 * (i // 8), 0.3), C["est_start"] + i * C["est_step"], 0.06, -0.6 + 1.2 * (i % 6) / 5)
place(kick(1.2), C["num6"] + 0.3, 0.55)
for m in [55, 62, 66, 71, 74]:
    place(marimba(m, 1.4), C["num6"] + 0.3, 0.14)
# collapse: descending notes per row, then the final chord on AVRON
for r in range(5):
    place(marimba(74 - r * 3, 0.4), C["collapse"] + r * 0.07, 0.2)
place(kick(1.3), C["avron"], 0.65)
place(pad([50, 57, 62, 66, 69, 73], DUR - C["avron"] + 0.2, 2400), C["avron"], 0.5)
for m in [62, 69, 74, 78, 81]:
    place(marimba(m, 2.0), C["avron"], 0.14)

# ---- master: gentle glue compression, fade out, -14 LUFS
x = np.stack([L, R], 1)
x = np.tanh(1.2 * x / (np.max(np.abs(x)) + 1e-9)) * 0.8
fade = np.ones(N)
fade[-int(SR * 0.8):] = np.linspace(1, 0, int(SR * 0.8))
x *= fade[:, None]
out = ROOT / "public/swisspro"
out.mkdir(parents=True, exist_ok=True)
raw = out / "score_raw.wav"
import soundfile as sf  # noqa: E402

sf.write(raw, x, SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", "-c:a", "pcm_s24le", str(out / "score.wav")], check=True)
raw.unlink()
print("wrote", (out / "score.wav").relative_to(ROOT))
