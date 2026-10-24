"""Original sound for the Tequila Sunrise explainer, timed to the cues in index.html. Writes audio.wav (-14 LUFS).

Bed: soft 96 BPM kick + electric-piano chords. SFX: glass ting when the outline finishes, an ice clink per cube,
pours whose pitch rises as the glass fills (the air column shortens), a quieter fill into the jigger,
a whoosh for the orange wheel, a plop for the cherry, a chime on the finished drink.
"""
import subprocess
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 30.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)
out = np.zeros(N)


def place(sig, t0, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N: out[i:j] += g * sig[: j - i]


def tone(f, d, rel=0.4, a=0.004, harm=(1.0,)):
    tt = np.arange(int(d * SR)) / SR
    x = sum(h * np.sin(2 * np.pi * f * (k + 1) * tt) for k, h in enumerate(harm))
    return x * np.minimum(1, tt / a) * np.exp(-tt / rel)


def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)


# ---- bed: 96 BPM, Fmaj7 Em7 Dm7 Cmaj7, two bars each, quiet
spb = 60 / 96
chords = [[174.6, 220.0, 261.6, 329.6], [164.8, 196.0, 246.9, 293.7], [146.8, 174.6, 220.0, 261.6], [130.8, 164.8, 196.0, 246.9]]
bed = np.zeros(N)
b = 0
while b * spb < DUR:
    tb = b * spb
    i = int(tb * SR)
    k = tone(55, 0.3, rel=0.08, a=0.002)
    bed[i:i + len(k)] += 0.35 * k[: max(0, min(len(k), N - i))]
    if b % 4 == 0:
        for f in chords[(b // 8) % 4]:
            c = tone(f, 4 * spb, rel=1.2, a=0.02, harm=(1.0, 0.25, 0.08))
            j = min(N, i + len(c)); bed[i:j] += 0.07 * c[: j - i]
    if b % 2 == 1:  # soft shaker on the off-beat
        s = bp(rng.standard_normal(int(0.06 * SR)), 5000, 11000) * np.exp(-np.arange(int(0.06 * SR)) / SR / 0.015)
        j = min(N, i + int(spb / 2 * SR)); s = s[: max(0, min(len(s), N - j))]; bed[j:j + len(s)] += 0.05 * s
    b += 1
fade = np.clip(t / 1.5, 0, 1) * np.clip((DUR - t) / 1.0, 0, 1)
out += lp(bed, 6000) * fade

# ---- glass ting when the outline completes
place(tone(2093, 1.6, rel=0.5, harm=(1.0, 0.3, 0.12)), 1.65, 0.12)

# ---- ice clinks (cube lands: drop start + 0.42 s)
for i in range(6):
    f = 2400 + 260 * i
    place(tone(f, 0.35, rel=0.06, a=0.001, harm=(1.0, 0.5)), 2.9 + i * 0.28 + 0.4, 0.22)
    place(tone(f * 1.53, 0.2, rel=0.03, a=0.001), 2.9 + i * 0.28 + 0.4, 0.09)


# ---- pours: band-passed noise whose centre rises with the fill level, with a gurgle
def pour(t0, d, ml0, ml1, g, bright=1.0):
    n = int(d * SR); tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    sig = np.zeros(n)
    seg = int(0.05 * SR)
    for s in range(0, n, seg):  # piecewise band-pass so the pitch can glide
        ml = ml0 + (ml1 - ml0) * (s / n)
        fc = (380 + ml * 6.5) * bright
        sig[s:s + seg] = bp(noise[max(0, s - seg):s + seg], fc * 0.7, fc * 1.5)[-len(sig[s:s + seg]):]
    gurgle = 0.75 + 0.25 * np.sin(2 * np.pi * 11 * tt + 3 * np.sin(2 * np.pi * 1.3 * tt))
    env = np.minimum(1, tt / 0.08) * np.minimum(1, (d - tt) / 0.2)
    place(sig * gurgle * env, t0, g)


pour(7.9, 1.7, 0, 45, 0.5)
pour(12.9, 2.1, 45, 135, 0.55)
pour(18.1, 1.1, 135, 150, 0.35)
# filling the jigger (smaller vessel, higher, quieter)
for a, d in ((6.3, 1.0), (11.3, 1.0), (16.8, 0.7)):
    pour(a, d, 0, 40, 0.18, bright=2.2)

# ---- garnish + finish
w = bp(rng.standard_normal(int(0.5 * SR)), 600, 5000) * np.sin(np.pi * np.arange(int(0.5 * SR)) / (0.5 * SR)) ** 2
place(w, 21.3, 0.25)
tt = np.arange(int(0.25 * SR)) / SR
place(np.sin(2 * np.pi * np.cumsum(420 * np.exp(-tt / 0.05) + 140) / SR) * np.exp(-tt / 0.07), 22.95, 0.35)
for i, f in enumerate((1046.5, 1318.5, 1568.0)):
    place(tone(f, 1.8, rel=0.6, harm=(1.0, 0.2)), 24.35 + i * 0.12, 0.12)

out /= max(1e-9, np.max(np.abs(out))) / 0.8
sf.write("audio_pre.wav", np.stack([out, out], 1), SR, subtype="PCM_24")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio_pre.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "audio.wav"], check=True)
print("audio.wav written")
