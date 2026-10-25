"""Synthesised sound for Ep 01 (no third-party samples): comedy SFX on the timeline cues and a light
pizzicato/marimba bed at 104 BPM. Writes <asset_dir>/stems/{music,impacts,foley,risers,sonic_logo}.wav.
usage: sfx.py <project_dir> <asset_dir>"""
import json, os, sys
import numpy as np, soundfile as sf

proj, asset = sys.argv[1:3]
tl = json.load(open(f"{proj}/timeline.json"))
SR = 48000
N = int(tl["total"] * SR)
C = tl["cues"]
L = {l["id"]: l for l in tl["lines"]}
rng = np.random.default_rng(7)
os.makedirs(f"{asset}/stems", exist_ok=True)


def word(i, w):
    for c in L[i]["chunks"]:
        for x in c["words"]:
            if x["w"].lower().startswith(w.lower()):
                return x["t0"]
    return L[i]["start"]


def put(buf, t, a, g=1.0):
    s = int(t * SR); e = min(N, s + len(a))
    if s < N: buf[s:e] += a[:e - s] * g


def env(n, att=0.004, rel=None):
    t = np.arange(n) / SR
    e = np.minimum(1, t / att)
    if rel: e *= np.exp(-t / rel)
    return e


def lp(x, a):  # one-pole low-pass
    y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x):
        s += a * (v - s); y[i] = s
    return y


def scratch(dur=0.42):
    n = int(dur * SR); t = np.arange(n) / SR
    # vinyl scrub: band-limited noise whose playback rate swings back and forth
    rate = 1 + 0.9 * np.sin(2 * np.pi * 5.5 * t) * np.exp(-t * 3)
    ph = np.cumsum(rate) / SR
    tone = np.sin(2 * np.pi * 900 * ph) * 0.4 + rng.standard_normal(n) * 0.6
    tone = lp(tone, 0.25) * (np.abs(np.sin(2 * np.pi * 5.5 * t)) ** 0.5)
    return tone * env(n, 0.003) * np.exp(-t * 2.5)


def whoosh(dur=0.45, up=True):
    n = int(dur * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n)
    cut = np.linspace(0.02, 0.35, n) if up else np.linspace(0.35, 0.02, n)
    y = np.zeros(n); s = 0.0
    for i in range(n):
        s += cut[i] * (x[i] - s); y[i] = s
    shape = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    return y * shape * 0.8


def tick(f=1800, dur=0.06):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 70) * 0.5


def pluck(f, dur=0.5, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    y = sum((bright ** (k - 1)) * np.sin(2 * np.pi * f * k * t) / k for k in range(1, 5))
    return y * env(n, 0.002, 0.11 + 0.08 / (f / 220))


def sad_trombone():
    out = []
    for f, d in [(392, 0.22), (370, 0.22), (349, 0.22), (330, 0.6)]:
        n = int(d * SR); t = np.arange(n) / SR
        vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if d > 0.5 else 0)
        ph = np.cumsum(f * vib) / SR
        saw = 2 * (ph % 1) - 1
        out.append(lp(saw, 0.08) * env(n, 0.02) * np.minimum(1, (d - t) / 0.05))
    return np.concatenate(out) * 0.5


music = np.zeros(N); imp = np.zeros(N); fol = np.zeros(N); ris = np.zeros(N); logo = np.zeros(N)

# bed: I–vi–IV–V marimba plucks, soft kick + shaker; drops out on the two freezes, ends into the logo
bpm = 104; beat = 60 / bpm
chords = [[261.6, 329.6, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6], [196.0, 246.9, 293.7]]
bass = [130.8, 110.0, 87.3, 98.0]
hush = []
end = T_END = tl["total"]
b = 0
while b * beat < end:
    t = b * beat
    if not any(a <= t < z for a, z in hush):
        bar = (b // 4) % 4
        ch = chords[bar]
        if b % 2 == 0: put(music, t, pluck(bass[bar], 0.4, 0.3), 0.55)
        put(music, t + (beat / 2 if b % 2 else 0), pluck(ch[(b * 2) % 3] * 2, 0.35, 0.45), 0.32)
        if b % 4 == 3: put(music, t + beat / 2, pluck(ch[2] * 2, 0.3, 0.45), 0.22)
        k = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 45, int(0.14 * SR))) / SR) * env(int(0.14 * SR), 0.002, 0.05)
        if b % 2 == 0: put(music, t, k, 0.45)
        for h in (0, 0.5):
            sh = rng.standard_normal(int(0.04 * SR)) * env(int(0.04 * SR), 0.001, 0.008)
            put(music, t + h * beat, np.diff(sh, prepend=0), 0.10)
    b += 1

# cues
for k in ("title", "steps", "rain", "sebi", "exit"):
    put(ris, C[k] - 0.28, whoosh(0.45), 0.7)
for i in range(3):
    put(fol, 0.6 + i * 0.55, tick(1400 + i * 200, 0.05), 0.8)          # group messages land
put(imp, word("g1", "ruko"), tick(260, 0.25) * 1.5, 0.8)               # RUKO
put(imp, word("g1", "pump"), tick(320, 0.2) * 1.4, 0.8)
put(imp, word("g1", "dump"), tick(200, 0.3) * 1.6, 0.9)
for w, f in (("pehle", 1500), ("phir", 1800)):
    put(fol, word("g2", w), tick(f), 0.9)
put(ris, word("g3", "sab"), whoosh(1.4), 0.5)                            # price rockets
for i in range(14):
    put(fol, word("g3", "sab") + 0.1 + i * 0.09, tick(2600, 0.02), 0.4)  # the crowd piles in
put(imp, word("g3", "aur") + 0.3, sad_trombone(), 0.45)                  # the crash
for i in range(16):
    put(fol, word("b2", "tiptip") - 0.4 + i * 0.17, tick(3200, 0.02), 0.5)  # tip-tip rain
put(imp, word("g4", "order"), tick(180, 0.3) * 1.8, 1)                   # stamp
for i in range(23):
    put(fol, word("g6", "check") + i * 0.048, tick(3400, 0.015), 0.35)   # typing
put(fol, word("g6", "sebi"), tick(2200), 1)
put(fol, word("g7", "chhod"), tick(900, 0.08), 1)                        # EXIT tap
put(ris, word("g7", "bhejo") + 1.3, whoosh(0.6), 0.6)
for i, f in enumerate([523.3, 659.3, 784.0, 1046.5]):
    put(logo, word("g7", "bhejo") + i * 0.09, pluck(f, 1.0, 0.35), 0.35)

for name, a in [("music", music), ("impacts", imp), ("foley", fol), ("risers", ris), ("sonic_logo", logo)]:
    a = a / (np.abs(a).max() + 1e-9) * 0.7
    sf.write(f"{asset}/stems/{name}.wav", a.astype(np.float32), SR)
print("stems written")
