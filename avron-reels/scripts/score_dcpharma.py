"""Original score + SFX for the AVRON data centre + pharma reel (ENGINE_REPORT.md Section 5). Deterministic.

Every cue is a beat start from src/projects/dcpharma/timeline.json (real times from the user's Tia VO) plus an offset
keyed to the spoken word. Final-cut times in brackets:
  hook          ticking synth, 120 BPM 8th-note ticks, low-pass opening 400 Hz -> 2 kHz, under a low drone
  nifty + 1.05  beat drops in on the word "Nifty" [2.9]: kick, sub bass, lo-fi hats (driving lo-fi techno, 120 BPM)
  burst         full dropout to burst + 0.45 [16.15-16.6], low impact hit on "stock", pad only until anantraj [17.8], beat back in
  patent        hats drop, kick stays (desk scene) [33.95]
  lesson        full beat, then a low-pass filter-down over the lesson + CTA [44.62]
  voEnd         hard stop on the end of "karo" [50.75], no reverb tail; silence under the end card to 53.0
  SFX           whooshes on ask / themes / layers / cooling, digital ticks x3 on the rack fill, paper rustle on zameen,
                digital click on server, phone buzz on patent, notification pings on the race arrivals, low hit on novo
The burst hit and the race arrivals mirror BURST_HIT / raceArrivals in src/projects/dcpharma/Reel.tsx.
Writes <out>/stems/{music,impacts,risers,foley,alerts}.wav (for scripts/mix_stems.py once vo.wav exists)
and <out>/mix.wav: the animatic mix with no VO, music + SFX normalised to -14 LUFS, true peak under -1.5 dBTP.

usage: python3 scripts/score_dcpharma.py [timeline.json] [out_dir]
"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
from scipy.signal import butter, sosfilt

SR = 48000
TLP = sys.argv[1] if len(sys.argv) > 1 else "src/projects/dcpharma/timeline.json"
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/dcpharma"
os.makedirs(f"{OUT}/stems", exist_ok=True)
tl = json.load(open(TLP))
DUR = tl["duration"]
STOP = tl["voEnd"]  # hard stop on the end of "karo"
S = {b["id"]: b["start"] for b in tl["beats"]}
N = int(round(DUR * SR))
t = np.arange(N) / SR
rng = np.random.default_rng(2610)
BPM = 120
BEAT = 60 / BPM
E8 = BEAT / 2

BURST_HIT = 0.45  # = BURST_HIT in Reel.tsx
RACE = [1.0, 1.65, 2.05, 2.45, 2.85, 3.25, 3.65, 4.05]  # first six = raceArrivals in Reel.tsx, then two more pings
C = {
    "beat_in": S["nifty"] + 1.05, "drop_a": S["burst"], "hit": S["burst"] + BURST_HIT, "beat_back": S["anantraj"], "desk": S["patent"],
    "lesson": S["lesson"], "stop": STOP,
    "whoosh": [S["ask"], S["themes"], S["layers"], S["cooling"]],
    "ticks": [S["vacancy"] + 0.55, S["vacancy"] + 1.25, S["vacancy"] + 1.95],
    "rustle": S["zameen"], "click": S["server"], "buzz": S["patent"],
    "pings": [S["race"] + d for d in RACE if S["race"] + d < S["novo"] - 0.3], "low_hit": S["novo"],
}


# ------------------------------------------------------------------ DSP helpers
def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output="sos")
def lp(x, f): return sosfilt(sos("low", f), x)
def hp(x, f): return sosfilt(sos("high", f), x)
def bp(x, lo, hi): return sosfilt(sos("band", [lo, hi]), x)
def saw(f, tt, ph=0.0): return 2 * ((tt * f + ph) % 1.0) - 1
NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)
db = lambda d: 10 ** (d / 20)


def place(buf, sig, t0, g=1.0):
    i = int(round(t0 * SR))
    if i >= buf.shape[-1]: return
    s = sig[..., :buf.shape[-1] - i] if i >= 0 else sig[..., -i:]
    i = max(i, 0)
    buf[..., i:i + s.shape[-1]] += g * s


def st(x, pan=0.0):  # mono -> stereo with a constant-power pan (-1..1)
    a = (pan + 1) * np.pi / 4
    return np.array([x * np.cos(a), x * np.sin(a)]) * np.sqrt(2)


def tvlp(x, f_of_t, block=512):
    """Time-varying one-pole-ish low-pass: 2nd-order Butterworth per block (cutoff from f_of_t(block time))."""
    o = np.zeros_like(x); zi = None
    for i in range(0, len(x), block):
        f = float(np.clip(f_of_t(i / SR), 60, SR / 2 - 1000))
        s = sos("low", f)
        if zi is None: zi = np.zeros((s.shape[0], 2))
        o[i:i + block], zi = sosfilt(s, x[i:i + block], zi=zi)
    return o


# ------------------------------------------------------------------ instruments
def tick_note(f, d=0.11):
    n = int(d * SR); tt = np.arange(n) / SR
    v = saw(f, tt) * 0.6 + np.sin(2 * np.pi * f * 2 * tt) * 0.4
    return v * (1 - np.exp(-tt / 0.002)) * np.exp(-tt / 0.035)


def kick():
    n = int(0.42 * SR); tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(48 + 95 * np.exp(-tt / 0.03)) / SR) * np.exp(-tt / 0.16)
    click = hp(rng.standard_normal(n), 2500) * np.exp(-tt / 0.004) * 0.25
    return body + click


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR); tt = np.arange(n) / SR
    x = hp(rng.standard_normal(n), 7000)
    x = np.round(x * 12) / 12  # lo-fi: coarse quantise
    return x * np.exp(-tt / (0.05 if open_ else 0.014))


def bass_note(f, d):
    n = int(d * SR); tt = np.arange(n) / SR
    v = np.sin(2 * np.pi * f * tt) + 0.35 * lp(saw(f, tt), 400)
    return v * np.minimum(1, tt / 0.004) * np.minimum(1, (d - tt) / 0.02) * np.exp(-tt / 0.35)


def pad(notes, d, cutoff=1400, att=0.8, rel=0.8):
    n = int(d * SR); tt = np.arange(n) / SR
    L, R = np.zeros(n), np.zeros(n)
    for nn in notes:
        f = NOTE(nn)
        for k in range(4):
            v = saw(f * (1 + (k - 1.5) * 0.003), tt, rng.random())
            L += v * (1 - k / 3); R += v * k / 3
    e = np.minimum(1, tt / att) * np.minimum(1, np.maximum(0, d - tt) / rel)
    return np.array([lp(L, cutoff), lp(R, cutoff)]) * e / (len(notes) * 4)


# ------------------------------------------------------------------ MUSIC
mus = np.zeros((2, N))
# A minor: i - VI - III - VII  (Am, F, C, G), two bars each
PROG = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [55, 59, 62])]
BAR = 4 * BEAT

# 0-5 s: ticking synth, 8ths, low-pass opening 400 Hz -> 2 kHz, plus a low drone
tk = np.zeros(N)
for k, tc in enumerate(np.arange(0, C["beat_in"] - 1e-6, E8)):
    place(tk, tick_note(NOTE(69 if k % 2 == 0 else 76) * (0.5 if k % 8 == 6 else 1)), tc, 1.0 if k % 2 == 0 else 0.7)
tk = tvlp(tk, lambda s: 400 * (2000 / 400) ** min(1, s / C["beat_in"]))
mus += st(tk * 0.55)
drone = (np.sin(2 * np.pi * NOTE(33) * t) + 0.4 * np.sin(2 * np.pi * NOTE(45) * t)) * np.clip(t / 4.0, 0, 1) * (t < C["beat_in"] + 0.5)
mus += st(drone * 0.18 * np.clip((C["beat_in"] + 0.5 - t) / 0.5, 0, 1))


def section(a, b, kick_on=True, hats_on=True, bass_on=True, pad_on=True, ticks_on=False):
    out = np.zeros((2, N))
    # pad, chord changes every 2 bars, aligned to the beat_in downbeat grid
    if pad_on:
        k0 = int(np.floor((a - C["beat_in"]) / (2 * BAR)))
        tc = C["beat_in"] + k0 * 2 * BAR
        while tc < b:
            root, ch = PROG[(k0) % 4]
            s0, s1 = max(tc, a), min(tc + 2 * BAR, b)
            if s1 > s0:
                place(out, pad(ch, s1 - s0 + 0.3, 1500, att=0.25 if s0 > tc else 0.6, rel=0.3), s0, 0.5)
            tc += 2 * BAR; k0 += 1
    grid = np.arange(C["beat_in"], b, E8)
    for i, tc in enumerate(grid):
        if tc < a - 1e-6: continue
        q = int(round((tc - C["beat_in"]) / E8))
        if kick_on and q % 2 == 0:
            place(out, st(kick()), tc, 0.9)
        if hats_on and q % 2 == 1:
            place(out, st(hat(q % 8 == 7), 0.25), tc, 0.22)
        if bass_on:
            bar_i = int((tc - C["beat_in"]) // (2 * BAR)) % 4
            root = PROG[bar_i][0] - 12
            f = NOTE(root + (12 if q % 4 == 3 else 0))
            place(out, st(bass_note(f, E8 * 0.95)), tc, 0.45 if q % 2 == 0 else 0.3)
        if ticks_on:
            place(out, st(lp(tick_note(NOTE(76 if q % 2 else 69)), 2500), 0.3 * (1 if q % 2 else -1)), tc, 0.12)
    return out


mus += section(C["beat_in"], C["drop_a"], ticks_on=True)                   # nifty "Nifty" -> burst: beat in
mus += section(C["hit"], C["beat_back"], kick_on=False, hats_on=False, bass_on=False)  # burst hit -> anantraj: pad only
mus += section(C["beat_back"], C["desk"])                                   # anantraj -> patent: beat back in
mus += section(C["desk"], C["lesson"], hats_on=False)                       # patent -> lesson: hats drop, kick stays
lesson = section(C["lesson"], C["stop"] + 0.5, ticks_on=True)               # lesson -> stop: full beat, then filter-down
span = C["stop"] - C["lesson"]  # filter-down over the first ~half of lesson + CTA (planned: 0.6 s in, 4 s long, of 8 s)
fd0, fd1 = C["lesson"] + 0.075 * span, C["lesson"] + 0.575 * span
fcut = lambda s: 16000 if s < fd0 else (16000 * (350 / 16000) ** min(1, (s - fd0) / (fd1 - fd0)) if s < fd1 else 350 + (s - fd1) * 120)
lesson = np.array([tvlp(lesson[0], fcut), tvlp(lesson[1], fcut)])
mus += lesson
# dropout burst -> burst hit: full silence in the music bus
mus[:, int(C["drop_a"] * SR):int(C["hit"] * SR)] = 0
music = mus

# ------------------------------------------------------------------ SFX
def whoosh(d=0.3):
    n = int(d * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n); o = np.zeros(n)
    for i in range(0, n, 512):
        k = i / n
        o[i:i + 512] = bp(x[i:i + 512], 300 + 1800 * k, 1200 + 6000 * k)
    return o * np.sin(np.pi * tt / d) ** 1.6


def dtick():  # dry glitch-style digital tick
    n = int(0.07 * SR); tt = np.arange(n) / SR
    sq = np.sign(np.sin(2 * np.pi * 1800 * tt)) * (np.floor(tt * 4000) % 3 != 0)
    return hp(sq * np.exp(-tt / 0.012) + 0.4 * bp(rng.standard_normal(n), 3000, 9000) * np.exp(-tt / 0.006), 600)


def impact(f0=36, L=2.2):
    n = int(L * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(f0 + 70 * np.exp(-tt / 0.06)) / SR) * np.exp(-tt / 0.7)
    return sub + 0.35 * lp(rng.standard_normal(n), 1800) * np.exp(-tt / 0.05)


def rustle(d=0.55):
    n = int(d * SR); tt = np.arange(n) / SR
    crack = (rng.random(n) > 0.993) * rng.standard_normal(n) * 3
    return bp(rng.standard_normal(n) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * tt))) + crack, 1500, 8000) * np.sin(np.pi * tt / d) ** 0.8


def click():
    n = int(0.05 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt / 0.004) + 0.5 * hp(rng.standard_normal(n), 4000) * np.exp(-tt / 0.002))


def buzz():
    n = int(0.75 * SR); tt = np.arange(n) / SR
    gate = ((tt < 0.3) | ((tt > 0.42) & (tt < 0.72))).astype(float)
    gate = uniform_filter1d(gate, 240)
    v = np.sign(np.sin(2 * np.pi * 165 * tt)) * 0.5 + np.sin(2 * np.pi * 165 * tt)
    return lp(v, 900) * gate * (1 + 0.3 * np.sin(2 * np.pi * 31 * tt))


def ping():
    n = int(0.6 * SR); tt = np.arange(n) / SR
    v = sum(a * np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) for f, a, d in [(1568, 1, 0.18), (2349, 0.5, 0.12), (3136, 0.2, 0.06)])
    return v * (1 - np.exp(-tt / 0.002))


risers, impacts, foley, alerts = (np.zeros((2, N)) for _ in range(4))
for i, at in enumerate(C["whoosh"]):
    place(risers, st(whoosh(0.3), -0.3 if i % 2 else 0.3), at - 0.2, db(-10))
for at in C["ticks"]:
    place(foley, st(dtick()), at, db(-14))
place(impacts, st(impact(34, 2.0)), C["hit"], db(-8))
place(foley, st(rustle()), C["rustle"] - 0.05, db(-14))
place(foley, st(click(), 0.2), C["click"] + 0.2, db(-14))
place(foley, st(buzz()), C["buzz"] - 0.15, db(-20))  # starts in the pause before "Pharma mein"; -20 keeps it ~12 dB under the VO
for k, at in enumerate(C["pings"]):
    place(alerts, st(ping(), 0.25 if k % 2 else -0.25), at, db(-18))
place(impacts, st(impact(44, 1.4)), C["low_hit"], db(-10))

# ------------------------------------------------------------------ hard stop at voEnd (5 ms declick), silence to the end
i0 = int(C["stop"] * SR); fade = int(0.005 * SR)
for buf in (music, risers, impacts, foley, alerts):
    buf[:, i0:i0 + fade] *= np.linspace(1, 0, fade)
    buf[:, i0 + fade:] = 0


# ------------------------------------------------------------------ write stems + the no-VO animatic mix
def write(path, x, fmt="pcm_s24le"):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", fmt, path],
                   input=np.ascontiguousarray(x.T).astype(np.float32).tobytes(), check=True)


def lufs(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)[-1])


def limit(x, ceil):  # look-ahead peak limiter (never exceeds ceil; keeps silences silent)
    w = int(0.004 * SR)
    pk = maximum_filter1d(np.max(np.abs(x), axis=0), size=2 * w + 1)
    g = np.minimum(1.0, ceil / np.maximum(pk, 1e-9))
    g = uniform_filter1d(minimum_filter1d(g, size=2 * w + 1), size=w)
    return x * g


music_g = music / (np.max(np.abs(music)) + 1e-9) * db(-6)  # music bus at -6 dBFS peak, SFX keep their Section 5 offsets
stems = {"music": music_g, "impacts": impacts, "risers": risers, "foley": foley, "alerts": alerts}
for k, v in stems.items():
    write(f"{OUT}/stems/{k}.wav", v)
# relative balance for the animatic: music -16 dB under the (absent) VO reference, SFX at their listed levels
mix = db(-16 + 6) * music_g * 1.0 + risers + impacts + foley + alerts
tmp = f"{OUT}/stems/_premix.wav"
for _ in range(5):
    write(tmp, mix, "pcm_f32le")
    I, TP = lufs(tmp)
    mix = limit(mix * db(-14.0 - I), db(-2.6))
write(f"{OUT}/mix.wav", mix, "pcm_s16le")
os.remove(tmp)
I, TP = lufs(f"{OUT}/mix.wav")
print(f"mix.wav integrated {I} LUFS, true peak {TP} dBFS, duration {DUR}s, hard stop {C['stop']}s")
print(json.dumps({k: (round(v, 2) if isinstance(v, float) else [round(x, 2) for x in v]) for k, v in C.items()}))
