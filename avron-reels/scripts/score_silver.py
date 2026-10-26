"""Original score and sound design for the silver film. Deterministic synthesis, no samples, no licences.

Follows the user's five-phase brief (2026-10-26):
  1 hook + teen shak   dark drone, silence under the coin drop, a sub pulse and a soft tick from "55% crash"
  2 Gupta ji / Rohan   warm plucked strings over a tanpura-like drone for Gupta ji, a synthwave bass and fast
                        hats for Rohan, then a glitch and a hard mute on the margin call
  3 30 Jan + ETF        driving dark pulse with a string riser into the crash, a sub drop on "31 percent"
  4 bhandaar + solar    clean marimba and plucks over an airy pad
  5 close               calm piano and pad, sinking under the two questions, a three-note AVRON sting
Sound design: coin rings, phone buzzes, the glitch, riser and sub drops, stamp thuds, soft clicks on numbers,
a paper swish on every chapter card and the slice of the red line in the hook.

Writes <out>/stems/music.wav, impacts.wav and foley.wav (48 kHz) for mix_stems.py.
usage: score_silver.py <beats.json> <out_dir>
"""
import json, os, sys
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
D = json.load(open(sys.argv[1]))
out = sys.argv[2]
os.makedirs(f"{out}/stems", exist_ok=True)
DUR = D["duration"]
N = int(DUR * SR) + SR
B = {b["id"]: b for b in D["beats"]}
CARDS = D["cards"]
rng = np.random.default_rng(7)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
st = lambda i: B[i]["start"]
en = lambda i: B[i]["end"]
cue = lambda i, k, f: B[i]["cues"].get(k, st(i) + (en(i) - st(i)) * f)

music, impacts, foley = (np.zeros(N, np.float32) for _ in range(3))


def add(dst, y, at, gain=1.0):
    s = int(at * SR)
    if s >= len(dst) or s + len(y) <= 0:
        return
    a = max(0, -s)
    y = y[a:]
    s = max(0, s)
    e = min(len(dst), s + len(y))
    dst[s:e] += gain * y[: e - s]


def lp(y, f, o=2):
    return sosfilt(butter(o, f, "low", fs=SR, output="sos"), y)


def bp(y, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "band", fs=SR, output="sos"), y)


def fade(y, fi, fo):
    y = y.copy()
    a, b = int(fi * SR), int(fo * SR)
    if a: y[:a] *= np.linspace(0, 1, a) ** 1.5
    if b: y[-b:] *= np.linspace(1, 0, b) ** 1.5
    return y


# ------------------------------------------------------------------ instruments
def pad(chord, dur, bright=1800, t0=0.0):
    n = int(dur * SR); t = np.arange(n) / SR + t0
    y = np.zeros(n)
    for k, m in enumerate(chord):
        f = hz(m); lfo = 0.75 + 0.25 * np.sin(2 * np.pi * (0.04 + 0.011 * k) * t + k)
        for h, amp in ((1, 1.0), (2, 0.3), (3, 0.1)):
            for det in (-0.1, 0.1):
                y += amp * lfo * np.sin(2 * np.pi * f * h * (1 + det / 100 * h) * t + k * 1.3 + h)
    return lp(y / (len(chord) * 2.6), bright).astype(np.float32)


def drone(m, dur, t0=0.0):
    n = int(dur * SR); t = np.arange(n) / SR + t0
    f = hz(m)
    y = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.003 * t) + 0.25 * np.sin(2 * np.pi * f * 3 * t + 1)
    y *= 0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * t)
    return lp(y / 1.8, 900).astype(np.float32)


def sub_pulse():
    n = int(0.5 * SR); t = np.arange(n) / SR
    f = 46 + 20 * np.exp(-t * 25)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)).astype(np.float32)


def tick():
    n = int(0.03 * SR)
    return (bp(rng.standard_normal(n), 3000, 9000) * np.exp(-np.arange(n) / SR * 160)).astype(np.float32)


def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 55 + 70 * np.exp(-t * 35)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10)).astype(np.float32)


def hat(open_=False):
    n = int((0.12 if open_ else 0.04) * SR)
    y = bp(rng.standard_normal(n), 7000, 14000) * np.exp(-np.arange(n) / SR * (25 if open_ else 90))
    return y.astype(np.float32)


def saw_bass(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    y = sum(np.sin(2 * np.pi * f * k * t) / k for k in range(1, 12))
    e = np.exp(-t * 3.5); e[: int(0.005 * SR)] *= np.linspace(0, 1, int(0.005 * SR))
    return lp(y * e, 1400).astype(np.float32)


def guitar(m, dur=2.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    y = np.zeros(n)
    for k in range(1, 9):
        y += (0.9 ** k) / k ** 0.6 * np.sin(2 * np.pi * f * k * (1 + 0.0004 * k * k) * t) * np.exp(-t * (1.6 + 0.9 * k))
    y[: int(0.003 * SR)] *= np.linspace(0, 1, int(0.003 * SR))
    return lp(y, 3500).astype(np.float32)


def marimba(m, dur=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    y = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.25 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 14) + 0.08 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 30)
    y[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return y.astype(np.float32)


def piano(m, dur=3.5):
    n = int(dur * SR); t = np.arange(n) / SR; f = hz(m)
    y = np.zeros(n)
    for k, a in enumerate((1.0, 0.45, 0.22, 0.12, 0.06, 0.03), 1):
        fk = f * k * np.sqrt(1 + 0.00025 * k * k)
        y += a * (np.sin(2 * np.pi * fk * t) + 0.6 * np.sin(2 * np.pi * fk * 1.0015 * t)) * np.exp(-t * (0.9 + 0.5 * k))
    y[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return lp(y / 2.2, 4200).astype(np.float32)


def strings_riser(dur, m0=50):
    n = int(dur * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for k, m in enumerate((m0, m0 + 7, m0 + 12, m0 + 15)):
        f = hz(m) * (1 + 0.06 * (t / dur) ** 2)
        ph = 2 * np.pi * np.cumsum(f) / SR
        y += sum(np.sin(h * ph + k) / h for h in range(1, 7))
    y *= (t / dur) ** 2.2
    return lp(y / 8, 2200 + 3000 * 0).astype(np.float32)


def noise_riser(dur, lo=400, hi=8000):
    n = int(dur * SR)
    y = bp(rng.standard_normal(n), lo, hi) * np.linspace(0, 1, n) ** 3
    return (y / np.max(np.abs(y))).astype(np.float32)


def sub_drop(dur=2.4):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 90 * np.exp(-t * 1.4) + 28
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3)).astype(np.float32)


def coin_ring():
    n = int(2.2 * SR); t = np.arange(n) / SR
    y = sum(a * np.sin(2 * np.pi * f * t + i) * np.exp(-t * d) for i, (f, a, d) in enumerate(((2210, 1.0, 2.2), (3890, 0.7, 3.0), (5730, 0.45, 4.2), (7650, 0.3, 5.5), (1180, 0.25, 4.0))))
    y += 0.4 * bp(rng.standard_normal(n), 3000, 9000) * np.exp(-t * 60)
    return (y / 2.2).astype(np.float32)


def buzz():
    n = int(0.42 * SR); t = np.arange(n) / SR
    gate = ((t < 0.16) | ((t > 0.24) & (t < 0.40))).astype(float)
    y = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.5 + np.sin(2 * np.pi * 344 * t)
    return (lp(y * gate, 1600) * 0.6).astype(np.float32)


def click():
    n = int(0.025 * SR)
    return (bp(rng.standard_normal(n), 1500, 6000) * np.exp(-np.arange(n) / SR * 200)).astype(np.float32)


def thud():
    n = int(0.4 * SR); t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 14) + 0.5 * lp(rng.standard_normal(n), 900) * np.exp(-t * 40)
    return (y / 1.5).astype(np.float32)


def swish(dur=0.6, lo=800, hi=7000):
    n = int(dur * SR)
    y = bp(rng.standard_normal(n), lo, hi) * np.sin(np.linspace(0, np.pi, n)) ** 2
    return (y / np.max(np.abs(y))).astype(np.float32)


def glitch(src_at, dur=0.9):
    """Stutter the music already written just before src_at, bit-crushed, then cut."""
    s = int(src_at * SR); g = int(0.07 * SR)
    grain = music[max(0, s - g): s].copy()
    reps = int(dur / 0.07)
    y = np.concatenate([grain * (1 - i / reps) for i in range(reps)])
    y = np.round(y * 24) / 24
    return y.astype(np.float32)


# ------------------------------------------------------------------ timeline
end_hook = CARDS["gupta"]
half = cue("hook_0", "half", 0.6)
# phase 1: drone from just after the coin lands, the pulse and tick from "55% crash"
add(music, fade(drone(26, end_hook - 1.8) * 0.9 + pad([38, 45, 50, 53], end_hook - 1.8, 900) * 0.6, 3.0, 2.0), 1.8, 0.30)
t = half
while t < end_hook - 1.5:
    add(music, sub_pulse(), t, 0.42)
    add(music, tick(), t + 0.5, 0.05)
    t += 1.0

# phase 2a: Gupta ji, warm strings over a drone (D major), until Rohan
g0, g1 = st("gupta_0") - 0.6, st("gupta_1") - 0.3
add(music, fade(drone(38, g1 - g0 + 1) * 0.5 + pad([50, 57, 62, 66], g1 - g0 + 1, 1500) * 0.7, 1.0, 1.0), g0, 0.24)
notes = [62, 66, 69, 74, 69, 66, 64, 69]
t, k = g0 + 0.4, 0
while t < g1 - 0.2:
    add(music, guitar(notes[k % len(notes)] - 12), t, 0.16); t += 0.42; k += 1
# phase 2b: Rohan, synthwave at 112 BPM, A minor; lighter under the margin maths
r0, call = g1, cue("gupta_5", "call", 0.15)
bt = 60 / 112
t, k = r0, 0
bass = [45, 45, 48, 43]
while t < call:
    light = t > st("gupta_2")
    bar = int(k / 8)
    if k % 2 == 0: add(music, saw_bass(bass[bar % 4] - 12, bt * 0.9), t, 0.22 if not light else 0.14)
    add(music, hat(), t, 0.05 if not light else 0.03); add(music, hat(), t + bt / 2, 0.035 if not light else 0.02)
    if k % 4 == 0 and not light: add(music, kick(), t, 0.25)
    t += bt; k += 1
add(music, fade(pad([57, 60, 64, 67], call - r0, 2400) * 0.5, 0.5, 0.2), r0, 0.16)
# the margin call: glitch, then silence, then a low drone creeps back
add(impacts, glitch(call), call, 0.9)
cut_at = call
music[int(cut_at * SR): int((cut_at + 1.3) * SR)] = 0
add(music, fade(drone(26, CARDS["jan"] - cut_at - 1.3), 2.0, 1.0), cut_at + 1.3, 0.25)

# phase 3: 30 January and the ETF trap, 120 BPM; riser into "31 percent", sub drop on it
j0, drop = CARDS["jan"], cue("jan_2", "drop", 0.6)
bt = 0.5
t, k = j0 + 0.5, 0
while t < drop - 0.1:
    add(music, kick(), t, 0.30)
    for s in range(4): add(music, saw_bass(38 if (k // 8) % 2 == 0 else 41, 0.12), t + s * bt / 4, 0.10)
    add(music, hat(), t + bt / 2, 0.04)
    t += bt; k += 1
rise = min(6.0, drop - j0 - 1)
add(music, strings_riser(rise, 50), drop - rise, 0.22)
add(impacts, noise_riser(min(3.0, rise), 300, 9000), drop - min(3.0, rise), 0.20)
add(impacts, sub_drop(), drop, 0.9)
music[int(drop * SR): int((drop + 0.6) * SR)] *= np.linspace(0, 1, int(0.6 * SR))
# after the crash: half-time pulse, tense pad, through the ETF chapter
p_end = CARDS["pile"]
add(music, fade(pad([38, 44, 50, 53], p_end - drop, 1300) * 0.8 + drone(26, p_end - drop) * 0.6, 1.2, 1.8), drop + 0.4, 0.26)
t = drop + 2.0
while t < p_end - 1.5:
    add(music, kick(), t, 0.16); add(music, tick(), t + 0.5, 0.04)
    t += 1.0
below = cue("etf_2", "below", 0.4)
add(impacts, noise_riser(1.2, 600, 7000), below - 1.2, 0.12)
add(impacts, sub_drop(1.6), below, 0.55)

# phase 4: kami aur bhandaar + solar, clean marimba and plucks (C major / A minor), 100 BPM
a4, z4 = p_end, st("close_0") - 0.4
add(music, fade(pad([48, 55, 60, 64, 67], z4 - a4, 2600) * 0.7, 2.0, 2.0), a4, 0.18)
bt = 0.6
seq = [72, 76, 79, 76, 74, 79, 77, 74, 69, 72, 76, 72, 71, 74, 79, 74]
t, k = a4 + 1.0, 0
while t < z4 - 1.0:
    add(music, marimba(seq[k % len(seq)]), t, 0.10)
    if k % 4 == 2: add(music, marimba(seq[(k + 5) % len(seq)] - 12, 1.4), t, 0.06)
    t += bt; k += 1

# phase 5: close, calm piano and pad (F major), sinking under the two questions; AVRON sting on the end card
a5 = st("close_0") - 0.4
q = st("close_3")
chords = [[53, 57, 60, 65], [50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64]]
t, k = a5 + 0.5, 0
while t < DUR - 4.5:
    level = 0.15 if t < q - 0.5 or t > en("close_3") else 0.06
    for i, m in enumerate(chords[k % 4]): add(music, piano(m), t + i * 0.06, level)
    add(music, piano(chords[k % 4][-1] + 12, 2.5), t + 1.6, level * 0.7)
    t += 3.2; k += 1
add(music, fade(pad([41, 48, 53, 57, 60], DUR - a5, 1600) * 0.7, 2.0, 3.0), a5, 0.16)
endc = st("close_4")
for i, m in enumerate([65, 72, 77]): add(impacts, piano(m, 3.0), endc + 0.4 + i * 0.22, 0.22)

# ------------------------------------------------------------------ sound design
COIN = coin_ring()
for at in (0.95, cue("gupta_0", "coin", 0.5) + 0.45, st("close_2") + 1.1):
    add(foley, COIN, at, 0.5)
# the red line slicing the coin in the hook (its time map: cut at design 2.2 → film time)
slice_at = max(st("hook_0") + 1.5, half - 1.4) + 0.35
add(foley, swish(0.5, 2500, 11000), slice_at, 0.3)
add(foley, thud(), slice_at + 0.45, 0.25)
BZ = buzz()
for at in (cue("gupta_1", "telegram", 0.45), cue("gupta_1", "telegram", 0.45) + 0.6, st("jan_0") + 1.2, st("jan_0") + 2.4, call + 0.5):
    add(foley, BZ, at, 0.28)
CL = click()
num = [("hook_2", "six", 0.75), ("shak_2", "gold", 0.2), ("shak_2", "silver", 0.4), ("gupta_3", "seventy", 0.7), ("gupta_4", "two", 0.75),
       ("jan_0", "record", 0.45), ("jan_0", "dollar", 0.75), ("etf_1", "crore", 0.35), ("pile_2", "fd", 0.6), ("pile_4", "n91", 0.35),
       ("pile_4", "n30", 0.65), ("solar_3", "thirty", 0.4), ("solar_3", "ten", 0.8), ("solar_4", "seventeen", 0.6)]
for i, k, f in num:
    add(foley, CL, cue(i, k, f), 0.35)
TH = thud()
tw = cue("jan_1", "twice", 0.45)
for at in (tw - 0.2, tw + 0.5, cue("jan_4", "thursday", 0.85) - 1.6, cue("solar_5", "surplus", 0.6) + 1.2):
    add(foley, TH, at, 0.45)
for s, at in CARDS.items():
    add(impacts, swish(0.7, 700, 6000), at - 0.1, 0.16)

for name, y in (("music", music), ("impacts", impacts), ("foley", foley)):
    peak = float(np.max(np.abs(y))) or 1.0
    sf.write(f"{out}/stems/{name}.wav", (y[: int(DUR * SR)] / max(1.0, peak / 0.9)).astype(np.float32), SR)
    print(name, round(peak, 3))
