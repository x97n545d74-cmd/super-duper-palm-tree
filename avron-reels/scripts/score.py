"""AVRON procedural score + sound design.

Generates an original (licence-free) music bed and an SFX stem synchronised to
the narration timeline, and writes the shared cue sheet back into timeline.json
so the Remotion scenes animate on exactly the same timestamps.

usage: score.py <project_dir> <out_dir>
"""
import json, re, sys
import numpy as np
from scipy.signal import butter, sosfilt, sosfilt_zi

SR = 48000
proj, out_dir = sys.argv[1], sys.argv[2]
tl = json.load(open(f"{proj}/timeline.json"))
DUR = tl["duration"]
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)  # deterministic


# ---------------------------------------------------------------- timeline helpers
def beat(bid):
    return next(b for b in tl["beats"] if b["id"] == bid)


NUMWORDS = {"4": "four", "8": "eight", "9": "nine", "7": "seven", "34": "thirtyfour"}


def word(bid, text, nth=0):
    """Start time of a word in a beat; accepts digits or spelled-out numbers (ASR varies)."""
    norm = lambda s: re.sub(r"[^\w$]", "", s).lower()
    want = {norm(text), NUMWORDS.get(norm(text), norm(text))}
    hits = [w for w in beat(bid)["words"] if norm(w["w"]) in want]
    return hits[nth]["s"]


may_4 = word("may_hikes", "4")
cues = {
    "open": 0.12,
    "loss34": word("hook_loss", "34"),
    "brentStart": beat("brent")["start"],
    "brent113": word("brent", "$113"),
    "freightStart": beat("freight")["start"],
    "freight8": word("freight", "8"),
    "mayStart": beat("may_hikes")["start"],
    "steps": [round(may_4 - 0.25 + k * 0.42, 3) for k in range(4)],
    "diesel750": word("may_hikes", "7"),
    "frozenStart": beat("frozen")["start"],
    "same": word("frozen", "same"),
    "gapLands": word("frozen", "gap"),
    "estimatesStart": beat("estimates")["start"],
    "icra": word("estimates", "ICRA"),
    "jeff34": word("estimates", "34"),
    "whoStart": beat("who_pays")["start"],
    "company": word("who_pays", "company,"),
    "government": word("who_pays", "government"),
    "you": word("who_pays", "you,"),
    "payoffStart": beat("payoff")["start"],
    "companies": word("payoff", "companies."),
    "crude": word("payoff", "crude."),
    "cta": beat("cta")["start"],
}
tl["cues"] = cues
json.dump(tl, open(f"{proj}/timeline.json", "w"), indent=1)


# ---------------------------------------------------------------- DSP helpers
def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def sweep_lp(x, fc_curve, block=1024):
    """Time-varying low-pass: cutoff follows fc_curve (Hz per sample)."""
    y = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        sos = butter(2, float(np.clip(fc_curve[min(i, len(x) - 1)], 40, SR / 2.2)), "low", fs=SR, output="sos")
        if zi is None:
            zi = sosfilt_zi(sos) * 0
        y[i:i + block], zi = sosfilt(sos, x[i:i + block], zi=zi)
    return y


def saw(f, tt):
    return 2 * ((tt * f) % 1.0) - 1


def window(a, b, fade=0.4):
    """0..1 gain envelope active between a and b with linear fades."""
    g = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
    return g


def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    j0 = max(0, -i)
    sig = sig[j0:len(buf) - i]
    buf[max(i, 0):max(i, 0) + len(sig)] += gain * sig


def env_exp(n, tau):
    return np.exp(-np.arange(n) / SR / tau)


NOTE = {"D1": 36.71, "A1": 55.0, "Bb1": 58.27, "G1": 49.0, "F2": 87.31, "D2": 73.42, "A2": 110.0,
        "Bb2": 116.54, "G2": 98.0, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "A3": 220.0,
        "Bb3": 233.08, "G3": 196.0, "C#3": 138.59, "C#4": 277.18, "E4": 329.63, "D4": 293.66, "F4": 349.23}

# ---------------------------------------------------------------- music
BPM = 90
EIGHTH = 60 / BPM / 2
c = cues

sections = [  # (start, bass root, pad chord)
    (0.0, "D2", ["D3", "F3", "A3"]),
    (c["mayStart"], "Bb1", ["Bb2", "D3", "F3"]),
    (c["frozenStart"], "D2", ["D3", "F3", "A3"]),
    (c["estimatesStart"], "G1", ["G2", "Bb2", "D3"]),
    (c["whoStart"], "A1", ["A2", "C#3", "E3"]),
    (c["payoffStart"], "D2", ["D3", "F3", "A3"]),
    (c["cta"], "D2", ["D3", "A3", "E4"]),
]
bounds = [s[0] for s in sections] + [DUR + 1]


def section_gain(k, xf=0.5):
    a, b = bounds[k], bounds[k + 1]
    return np.clip((t - a + xf / 2) / xf, 0, 1) * np.clip((b - t + xf / 2) / xf, 0, 1)


# Drone: D sub with slow breathing
drone = (0.55 * np.sin(2 * np.pi * NOTE["D1"] * t) + 0.25 * np.sin(2 * np.pi * NOTE["D2"] * t + 0.3))
drone *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.11 * t)
drone *= np.clip(t / 0.3, 0, 1) * np.clip((DUR - t) / 2.5, 0, 1)

# Pad: detuned saws per chord, dark low-pass, slow swell
pad = np.zeros(N)
for k, (_, _, chord) in enumerate(sections):
    g = section_gain(k)
    if not g.any():
        continue
    s = np.zeros(N)
    for n in chord:
        for det in (-0.12, 0.0, 0.13):
            s += saw(NOTE[n] * (1 + det / 100 * 3), t + rng.random())
    pad += g * s
pad_fc = 380 + 900 * np.clip((t - c["estimatesStart"]) / (c["payoffStart"] - c["estimatesStart"]), 0, 1)
pad_fc[t > c["payoffStart"]] = 700
pad = sweep_lp(pad, pad_fc) * 0.045
pad *= np.clip(t / 2.0, 0, 1) * np.clip((DUR - t) / 3.0, 0, 1)

# Bass pulse: 8ths on the section root, side-chain style envelope; drops out at "same"
bass = np.zeros(N)
note_len = int(EIGHTH * SR)
pulse_env = (1 - np.exp(-np.arange(note_len) / SR / 0.012)) * env_exp(note_len, 0.17)
k_sec = 0
tt0 = c["loss34"] - 4 * EIGHTH
step = 0
while tt0 < c["cta"] + 1.0:
    k_sec = max(i for i, s in enumerate(sections) if s[0] <= tt0)
    f = NOTE[sections[k_sec][1]] * (2 if step % 8 == 6 else 1)
    seg_t = np.arange(note_len) / SR
    sig = (saw(f, seg_t) + 0.5 * saw(f * 1.005, seg_t)) * pulse_env * (1.0 if step % 2 == 0 else 0.7)
    place(bass, sig, tt0)
    tt0 += EIGHTH
    step += 1
bass_fc = np.interp(t, [0, c["mayStart"], c["frozenStart"], c["estimatesStart"], c["payoffStart"], DUR],
                    [260, 420, 300, 520, 900, 300])
bass = sweep_lp(bass, bass_fc) * 0.16
bass_gate = (window(c["loss34"] - 0.6, c["same"] - 0.05, 0.6)
             + window(c["gapLands"] + 0.2, c["cta"] + 0.8, 1.2))
bass *= np.clip(bass_gate, 0, 1)

# Hats: filtered noise 16ths during evidence and consequence
hats = np.zeros(N)
six = EIGHTH / 2
hat_len = int(0.05 * SR)
hat = hp(rng.standard_normal(hat_len), 7000) * env_exp(hat_len, 0.012)
tt0, i = c["mayStart"], 0
while tt0 < c["payoffStart"] + 1.5:
    if not (c["same"] - 0.1 < tt0 < c["estimatesStart"]):
        place(hats, hat, tt0, 0.55 if i % 4 == 2 else 0.22)
    tt0 += six
    i += 1
hats *= 0.09

# Soft low pulse on quarters to drive the consequence section
kick = np.zeros(N)
klen = int(0.35 * SR)
kt = np.arange(klen) / SR
ksig = np.sin(2 * np.pi * (45 + 60 * np.exp(-kt / 0.03)) * kt) * env_exp(klen, 0.12)
tt0 = c["estimatesStart"]
while tt0 < c["payoffStart"] + 0.2:
    place(kick, ksig, tt0)
    tt0 += EIGHTH * 2
kick *= 0.22

# Shimmer for the brand close
shimmer = (np.sin(2 * np.pi * NOTE["D4"] * 2 * t) + 0.6 * np.sin(2 * np.pi * NOTE["A3"] * 4 * t))
shimmer *= (0.5 + 0.5 * np.sin(2 * np.pi * 3.0 * t)) * window(c["cta"] - 0.2, DUR, 1.5) * 0.012

mono_music = drone * 0.22 + pad + bass + kick
music_L = mono_music + hats * 0.8 + shimmer
music_R = mono_music + hats * 1.0 + np.roll(shimmer, int(0.011 * SR))

# ---------------------------------------------------------------- SFX
sfxL, sfxR = np.zeros(N), np.zeros(N)


def put(sig, t0, gain=1.0, pan=0.0):
    place(sfxL, sig * (1 - max(pan, 0)), t0, gain)
    place(sfxR, sig * (1 + min(pan, 0)), t0, gain)


def impact(dur=1.8):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(32 + 70 * np.exp(-tt / 0.08)) / SR) * env_exp(n, 0.55)
    crack = lp(rng.standard_normal(n), 2500) * env_exp(n, 0.04)
    return body * 0.9 + crack * 0.35


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    fc = 300 * (20 ** (tt / dur))
    sig = sweep_lp(noise, fc) * 0.6 + 0.25 * np.sin(2 * np.pi * np.cumsum(180 * (4 ** (tt / dur))) / SR)
    return sig * (tt / dur) ** 2.2


def whoosh(dur=0.7):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    fc = 400 + 5000 * np.sin(np.pi * tt / dur) ** 2
    return sweep_lp(rng.standard_normal(n), fc) * np.hanning(n) * 0.5


def tick(freq=3200):
    n = int(0.03 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * tt) * env_exp(n, 0.004) + hp(rng.standard_normal(n), 4000) * env_exp(n, 0.002) * 0.4)


def clunk():
    n = int(0.3 * SR)
    tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 170 * tt) * env_exp(n, 0.07) * 0.8
            + lp(rng.standard_normal(n), 1800) * env_exp(n, 0.025) * 0.6
            + np.pad(tick(2400), (0, n - int(0.03 * SR))) * 0.5)


def knock(f=120):
    n = int(0.45 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt) * env_exp(n, 0.11) + lp(rng.standard_normal(n), 900) * env_exp(n, 0.02) * 0.3


put(impact(2.2), c["open"], 0.9)
r = riser(1.3)
put(r, c["loss34"] - len(r) / SR, 0.30)
put(impact(), c["loss34"], 0.8)
for bid, pan in (("brentStart", -0.3), ("mayStart", 0.3), ("estimatesStart", -0.3), ("whoStart", 0.3)):
    w = whoosh()
    put(w, c[bid] - 0.35, 0.35, pan)
for k in range(10):  # counter ticks while $113.17 rolls up
    put(tick(2800 + 90 * k), c["brent113"] - 0.5 + k * 0.06, 0.12)
put(knock(70), c["freight8"], 0.7)
for k, ts in enumerate(c["steps"]):
    put(clunk(), ts, 0.45, -0.2 + 0.13 * k)
put(impact(2.6), c["same"], 0.75)
put(tick(2000), c["icra"], 0.25)
put(knock(90), c["jeff34"], 0.75)
for key, f, pan in (("company", 140, -0.35), ("government", 120, 0.0), ("you", 100, 0.35)):
    put(knock(f), c[key], 0.45, pan)
r2 = riser(1.6)
put(r2, c["cta"] - len(r2) / SR + 0.05, 0.22)
put(impact(3.0), c["cta"] + 0.05, 0.7)


# ---------------------------------------------------------------- write stems
def write(name, L, R):
    st = np.stack([L, R], 1).astype(np.float32)
    peak = np.max(np.abs(st))
    if peak > 0.98:
        st *= 0.98 / peak
    import subprocess
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s24le", f"{out_dir}/{name}.wav"], input=st.tobytes(), check=True)
    print(name, "peak", round(float(peak), 3))


write("music", music_L, music_R)
write("sfx", sfxL, sfxR)
print(json.dumps(cues, indent=1))
