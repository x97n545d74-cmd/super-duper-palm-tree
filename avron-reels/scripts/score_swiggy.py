"""Original score for the Swiggy film, built to the beat timeline. Deterministic, no samples.

It follows the film's day: a low night drone and slow swell for the English cold open, a soft sub hit on the
title, then one harmonic colour per chapter (dawn, morning, noon, dusk, storm, late night, pre-dawn), each a
warm additive pad with a sparse plucked arpeggio and, in the busier chapters, a quiet pulse. Chapter cards get
a paper whoosh and four soft folds; the close resolves to C major and ends on a three-note AVRON sting.
Writes <out>/stems/music.wav, impacts.wav and sonic_logo.wav.

usage: score_swiggy.py <beats.json> <out_dir>
"""
import json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
data = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(f"{out}/stems", exist_ok=True)
DUR = data["duration"]
N = int(DUR * SR)
B = data["beats"]
rng = np.random.default_rng(11)
SECTIONS = ["open", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "close"]
CARD = 3.0


def sec(s):
    first = next(b for b in B if b["section"] == s)["start"]
    i = SECTIONS.index(s)
    a = 0.0 if s == "open" else first - CARD
    z = DUR if i == len(SECTIONS) - 1 else next(b for b in B if b["section"] == SECTIONS[i + 1])["start"] - CARD
    return a, z


hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
# chord (MIDI notes), arpeggio speed (notes per second, 0 = none), pulse BPM (0 = none), pad level
PLAN = {
    "open":  ([38, 45, 50, 53], 0.0, 0, 0.9),     # D minor, low and wide: night
    "c1":    ([41, 48, 53, 57, 60], 1.6, 0, 0.8),  # F major: dawn
    "c2":    ([36, 43, 52, 55, 60], 2.4, 92, 0.75),  # C major add: morning, busy
    "c3":    ([43, 50, 55, 59, 62], 1.6, 0, 0.75),  # G major: noon, food
    "c4":    ([40, 47, 52, 55, 59], 2.0, 84, 0.75),  # E minor: dusk, rulebook
    "c5":    ([38, 45, 50, 53, 57], 0.0, 70, 0.85),  # D minor: storm, no arpeggio
    "c6":    ([45, 52, 57, 60, 64], 1.2, 0, 0.7),   # A minor: late night
    "c7":    ([41, 48, 55, 57, 60], 2.0, 88, 0.75),  # F add9: pre-dawn, looking ahead
    "close": ([36, 43, 48, 52, 55, 60], 1.0, 0, 0.9),  # C major: sunrise, resolve
}

music = np.zeros(N, np.float32)
impacts = np.zeros(N, np.float32)
logo = np.zeros(N, np.float32)


def env_section(n, fade):
    e = np.ones(n, np.float32)
    f = min(int(fade * SR), n // 2)
    e[:f] = np.linspace(0, 1, f) ** 1.5
    e[-f:] = np.linspace(1, 0, f) ** 1.5
    return e


def pad(chord, n, t0):
    t = (np.arange(n) / SR + t0).astype(np.float64)
    y = np.zeros(n)
    for k, m in enumerate(chord):
        f = hz(m)
        lfo = 0.75 + 0.25 * np.sin(2 * np.pi * (0.05 + 0.013 * k) * t + k)
        for h, amp in ((1, 1.0), (2, 0.32), (3, 0.12)):
            for det in (-0.12, 0.12):
                y += amp * lfo * np.sin(2 * np.pi * f * h * (1 + det / 100 * h) * t + k * 1.7 + h)
    y /= len(chord) * 2.6
    return sosfilt(butter(2, 2400, "low", fs=SR, output="sos"), y).astype(np.float32)


def pluck(f, dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * np.exp(-t * 5.5)
    y[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return y.astype(np.float32)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 58 + 40 * np.exp(-t * 30)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)).astype(np.float32)


def noise_swell(dur, lo, hi, curve=2.0):
    n = int(dur * SR)
    y = rng.standard_normal(n)
    y = sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), y)
    e = np.linspace(0, 1, n) ** curve
    e[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
    return (y * e / np.max(np.abs(y))).astype(np.float32)


def add(dst, y, at, gain=1.0):
    s = int(at * SR)
    if s >= len(dst) or s + len(y) <= 0:
        return
    a = max(0, -s)
    y = y[a:]
    s = max(0, s)
    e = min(len(dst), s + len(y))
    dst[s:e] += gain * y[: e - s]


KICK = kick()
for s in SECTIONS:
    a, z = sec(s)
    a0 = max(0.0, a - 1.5)
    z1 = min(DUR, z + 1.5)
    n = int((z1 - a0) * SR)
    chord, arp, bpm, lvl = PLAN[s]
    y = pad(chord, n, a0) * lvl
    if s == "open":  # slow swell into the title
        title = next(b for b in B if b["id"] == "open_05")["start"]
        sw = np.clip((np.arange(n) / SR + a0) / max(1.0, title), 0, 1) ** 1.6
        y *= (0.35 + 0.65 * sw).astype(np.float32)
    y *= env_section(n, 1.5)
    add(music, y * 0.22, a0)
    if arp:
        notes = [hz(m + 12) for m in chord[1:]] + [hz(chord[2] + 24)]
        t, k = a + 1.0, 0
        step = 1.0 / arp
        while t < z - 0.5:
            pat = [0, 2, 1, 3, 2, 4, 1, 3]
            f = notes[pat[k % len(pat)] % len(notes)]
            add(music, pluck(f), t, 0.05 * (0.8 + 0.2 * rng.random()))
            t += step
            k += 1
    if bpm:
        t = a + 2.0
        while t < z - 1.0:
            add(music, KICK, t, 0.10)
            t += 60.0 / bpm

# title hit, chapter cards, AVRON sting
title = next(b for b in B if b["id"] == "open_05")["start"]
add(impacts, noise_swell(1.6, 300, 6000, 3.0), title - 1.6, 0.20)
sub = np.sin(2 * np.pi * 42 * np.arange(int(2.2 * SR)) / SR) * np.exp(-np.arange(int(2.2 * SR)) / SR * 1.8)
add(impacts, sub.astype(np.float32), title, 0.55)
for s in SECTIONS[1:-1]:
    a, _ = sec(s)
    add(impacts, noise_swell(0.7, 900, 7000, 1.4)[::-1].copy(), a - 0.05, 0.14)  # paper whoosh (falls away)
    for i in range(4):  # four flaps folding open
        n = int(0.05 * SR)
        click = sosfilt(butter(2, [1200, 5000], "band", fs=SR, output="sos"), rng.standard_normal(n)) * np.exp(-np.arange(n) / SR * 90)
        add(impacts, click.astype(np.float32), a + 0.3 + i * 0.16 + 0.25, 0.10)
end = next(b for b in B if b["id"] == "close_03")["start"]
for i, m in enumerate([60, 67, 72]):
    add(logo, pluck(hz(m), 2.2), end + 0.25 + i * 0.22, 0.20)
add(logo, pad([48, 55, 60, 64], int(5 * SR), 0) * env_section(int(5 * SR), 1.8) * 0.18, end + 0.9)

for name, y in (("music", music), ("impacts", impacts), ("sonic_logo", logo)):
    peak = float(np.max(np.abs(y))) or 1.0
    sf.write(f"{out}/stems/{name}.wav", (y / max(1.0, peak / 0.9)).astype(np.float32), SR)
    print(name, round(peak, 3))
