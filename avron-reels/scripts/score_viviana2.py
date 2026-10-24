"""Original score + sound design for Viviana Power Tech PART 2, built to the narration timeline.

C-minor investigation palette: clock-tick pulse, synth/cello ostinato, string pads, a 50 Hz grid hum
when the lines energise, paper and stamp foley for the exchange filings, impacts on the price moves,
and the AVRON three-note bell logo. Deterministic. Writes stems to <out_dir>/stems.

usage: score_viviana2.py <project_dir> <out_dir>
"""
import json, os, re, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
proj, out = sys.argv[1], sys.argv[2]
os.makedirs(f"{out}/stems", exist_ok=True)
tl = json.load(open(f"{proj}/timeline.json"))
DUR = tl["duration"]
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(41)
BT = {b["id"]: b for b in tl["beats"]}


def w(bid, text, nth=0):
    norm = lambda s: re.sub(r"[^\w$₹.%]", "", s).lower()
    return [x for x in BT[bid]["words"] if norm(x["w"]) == norm(text)][nth]["s"]


S = lambda bid: BT[bid]["start"]
C = {
    "one": w("p0_hook", "one"), "gov": w("p0_hook", "government."), "orders": S("p1_orders"), "r768": w("p1_orders", "₹768"),
    "owner": S("p1_owner"), "work": S("p2_work"), "cyc": w("p2_work", "cyclone"), "why": S("p3_why"), "sixty": w("p3_why", "60%"),
    "pay": S("p3_pay"), "insp": w("p3_pay", "जाँच"), "p267": S("p3_267"), "d267": w("p3_267", "267"), "bets": S("p4_factory"),
    "bess": S("p4_bess"), "loan": w("p4_bess", "loan"), "rp": S("p5_rp1"), "r36": w("p5_rp1", "₹36"), "rp2": S("p5_rp2"),
    "lakh": w("p5_rp2", "₹1"), "rp3": S("p5_rp3"), "r50": w("p5_rp3", "₹50"), "target": S("p6_target"), "q1": w("p6_target", "₹72"),
    "close": S("p7_close"), "end": S("p8_avron"),
}


# ------------------------------------------------------------------ DSP
def sos(kind, f, order=2): return butter(order, f, kind, fs=SR, output="sos")
def lp(x, f): return sosfilt(sos("low", f), x)
def hp(x, f): return sosfilt(sos("high", f), x)
def bp(x, lo, hi): return sosfilt(sos("band", [lo, hi]), x)


def env(n, a, d):
    e = np.ones(n)
    na, nd = int(a * SR), int(d * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nd: e[-nd:] *= np.linspace(1, 0, nd)
    return e


def win(a, b, fi=0.5, fo=0.5):
    return np.clip((t - a) / max(fi, 1e-3), 0, 1) * np.clip((b - t) / max(fo, 1e-3), 0, 1)


def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR)
    if i >= buf.shape[-1]: return
    s = sig[..., :buf.shape[-1] - i] if i >= 0 else sig[..., -i:]
    i = max(i, 0)
    buf[..., i:i + s.shape[-1]] += g * s


def st2(x): return np.array([x, x])


def ir(seconds, damp, pre=0.012):
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    o = []
    for _ in range(2):
        x = rng.standard_normal(n) * np.exp(-tt * 6.9 / seconds)
        x = lp(x, damp) + 0.3 * lp(x, damp * 0.4)
        x = np.concatenate([np.zeros(int(pre * SR)), x])
        o.append(x / np.sqrt(np.sum(x ** 2)))
    return np.array(o)


HALL, ROOM = ir(3.2, 5200), ir(0.6, 3800, 0.004)


def verb(st, kernel, wet):
    st = np.atleast_2d(st)
    if st.shape[0] == 1: st = np.vstack([st, st])
    o = np.zeros_like(st)
    for ch in range(2):
        o[ch] = st[ch] + wet * fftconvolve(st[ch], kernel[ch])[:st.shape[1]]
    return o


def saw(f, tt, phase=0.0): return 2 * ((tt * f + phase) % 1.0) - 1
NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)
M = {"C1": 24, "G1": 31, "C2": 36, "Eb2": 39, "F2": 41, "G2": 43, "Ab2": 44, "Bb2": 46, "C3": 48, "D3": 50, "Eb3": 51,
     "F3": 53, "G3": 55, "Ab3": 56, "Bb3": 58, "C4": 60, "D4": 62, "Eb4": 63, "G4": 67, "C5": 72, "D5": 74, "A5": 81, "D6": 86}


def pad(notes, t0, t1, vol, cutoff=2400, attack=1.2, release=1.2, trem=0.0):
    n = int((t1 - t0 + release) * SR)
    tt = np.arange(n) / SR
    L, R = np.zeros(n), np.zeros(n)
    for nn in notes:
        f = NOTE(M[nn])
        for k in range(6):
            v = saw(f * (1 + (k - 2.5) * 0.0021), tt * (1 + 0.003 * np.sin(2 * np.pi * (4.4 + 0.3 * k) * tt + k)), rng.random())
            L += v * (1 - k / 5); R += v * k / 5
    e = env(n, attack, release)
    if trem: e = e * (1 - trem * 0.5 * (1 + np.sin(2 * np.pi * 11 * tt)))
    return np.array([lp(L, cutoff), lp(R, cutoff)]) * e * vol / (len(notes) * 6)


def ostinato(root, t0, t1, vol, step, cutoff=1500, pattern=(0, 12, 7, 12, 3, 12, 7, 15)):
    st = np.zeros((2, int((t1 - t0 + 0.5) * SR)))
    ln = int(step * SR * 0.9)
    tt = np.arange(ln) / SR
    k, tc = 0, 0.0
    while tc < t1 - t0:
        f = NOTE(M[root] + pattern[k % len(pattern)])
        v = (saw(f, tt) + 0.5 * saw(f * 1.004, tt)) * (1 - np.exp(-tt / 0.006)) * np.exp(-tt / 0.16)
        v = lp(v, cutoff)
        place(st, np.array([v * (0.8 + 0.2 * (k % 2)), v * (1.0 - 0.2 * (k % 2))]), tc, 1.0 if k % 4 == 0 else 0.7)
        tc += step; k += 1
    return st * vol


def tick(f=2400, d=0.06):
    n = int(d * SR); tt = np.arange(n) / SR
    return np.sin(2 * np.pi * f * tt + 3 * np.sin(2 * np.pi * f * 1.41 * tt)) * np.exp(-tt / 0.01)


def boom(len_s=3.0, f0=32):
    n = int(len_s * SR); tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(f0 + 60 * np.exp(-tt / 0.08)) / SR) * np.exp(-tt / 0.85)
    return sub + 0.3 * lp(rng.standard_normal(n), 2400) * np.exp(-tt / 0.05)


def stamp():
    n = int(0.5 * SR); tt = np.arange(n) / SR
    thud = np.sin(2 * np.pi * np.cumsum(90 + 80 * np.exp(-tt / 0.02)) / SR) * np.exp(-tt / 0.07)
    clack = bp(rng.standard_normal(n), 900, 5000) * np.exp(-tt / 0.012)
    return thud + 0.6 * clack


def paper(d=0.6):
    n = int(d * SR); tt = np.arange(n) / SR
    return bp(rng.standard_normal(n), 1400, 7500) * np.sin(np.pi * tt / d) ** 2 * (1 + 0.8 * (rng.random(n) > 0.995))


def whoosh(d=0.5, up=True):
    n = int(d * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n); o = np.zeros(n)
    for i in range(0, n, 1024):
        k = i / n if up else 1 - i / n
        o[i:i + 1024] = bp(x[i:i + 1024], 300 + 2500 * k, 900 + 7000 * k)
    return o * np.sin(np.pi * tt / d) ** 1.5


def riser(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = rng.standard_normal(n); o = np.zeros(n)
    for i in range(0, n, 1024):
        o[i:i + 1024] = lp(x[i:i + 1024], min(300 * (25 ** (i / n)), 20000))
    return (0.7 * o + 0.25 * np.sin(2 * np.pi * np.cumsum(150 * 4 ** (tt / dur)) / SR)) * (tt / dur) ** 2.4


def bell(f, dur=4.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / (dur * d))
            for r, a, d in [(1, 1, .5), (2.01, .45, .3), (2.76, .3, .22), (5.4, .12, .1), (0.5, .25, .6)])
    return s * (1 - np.exp(-tt / 0.002))


def glide_down(d=0.6, f0=900, f1=90):
    n = int(d * SR); tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / d)
    return lp(saw(1, np.cumsum(f) / SR), 2500) * np.sin(np.pi * tt / d) ** 0.7


# ------------------------------------------------------------------ MUSIC
mus = np.zeros((2, N))
drone = (np.sin(2 * np.pi * NOTE(M["C1"]) * t) + 0.5 * np.sin(2 * np.pi * NOTE(M["G1"]) * t)) * 0.33
mus += st2(drone * win(0, C["end"] + 0.4, 0.2, 0.4))
# hook: order cards tick in, stamp on "one government"
place(mus, ostinato("C3", 0.0, C["orders"], 0.3, 0.16, 1500, (0, 12, 7, 12)), 0.0)
place(mus, pad(["C3", "Eb3", "G3"], 0, C["work"], 0.45, 1600, attack=0.8), 0.0)
# work: storm, darker colour
place(mus, pad(["Ab2", "C3", "Eb3"], C["work"], C["why"], 0.5, 1100, attack=0.6), C["work"])
# why: steady pulse into 267
place(mus, ostinato("C3", C["why"], C["bets"], 0.26, 0.25, 1400), C["why"])
place(mus, pad(["C3", "Eb3", "Bb3"], C["why"], C["bets"], 0.4, 1900), C["why"])
# bets: lift
place(mus, pad(["Eb2", "Bb2", "Eb3", "G3"], C["bets"], C["rp"], 0.5, 3000, attack=0.8), C["bets"])
place(mus, ostinato("Eb3", C["bets"], C["rp"] - 0.1, 0.22, 0.2, 2400, (0, 7, 12, 7, 15, 12, 7, 12)), C["bets"])
# related party: tension, tremolo, hollow pulses
place(mus, pad(["G3", "Ab3", "C4"], C["rp"], C["target"], 0.4, 2600, attack=0.4, trem=0.9), C["rp"])
for k, tc in enumerate(np.arange(C["rp"], C["target"], 0.6)):
    place(mus, st2(boom(0.9, 40) * 0.5), tc, 0.12 if k % 2 == 0 else 0.07)
# target + close: build to the end
place(mus, ostinato("C3", C["target"], C["end"] - 0.05, 0.3, 0.2, 1500), C["target"])
place(mus, pad(["C3", "G3", "Eb4"], C["target"], C["end"], 0.42, 2200, attack=1.5), C["target"])
for tc in np.arange(0.0, C["orders"], 0.5):
    place(mus, st2(tick(2600 if int(tc * 2) % 2 == 0 else 2000)), tc, 0.05)
music = verb(mus, HALL, 0.28)

# ------------------------------------------------------------------ IMPACTS / RISERS / LOGO
imp = np.zeros((2, N))
for at, g, L in [(0.0, 0.7, 3.0), (C["r768"], 0.45, 2.5), (C["work"], 0.5, 3.0), (C["d267"], 0.55, 2.5), (C["bets"], 0.35, 2.0),
                 (C["rp"], 0.55, 3.0), (C["r36"], 0.45, 2.0), (C["target"], 0.4, 2.0), (C["q1"], 0.45, 2.0), (C["close"], 0.3, 2.0)]:
    place(imp, st2(boom(L)), at, g)
place(imp, st2(stamp()), C["one"], 0.9)
place(imp, st2(stamp()), C["r50"], 0.85)
impacts = verb(imp, HALL, 0.32)
ris = np.zeros((2, N))
for at, d, g in [(C["work"], 1.0, 0.18), (C["rp"], 1.2, 0.2), (C["end"], 1.6, 0.22)]:
    place(ris, st2(riser(d)), at - d, g)
for at in (C["orders"], C["work"], C["why"], C["pay"], C["bets"], C["bess"], C["rp2"], C["target"], C["close"]):
    place(ris, st2(whoosh(0.45)), at - 0.3, 0.12)
risers = verb(ris, HALL, 0.25)
logo = np.zeros((2, N))
for i, (nn, dt) in enumerate([("D5", 0.0), ("A5", 0.22), ("D6", 0.44)]):
    bl = bell(NOTE(M[nn]), 4.0)
    place(logo, np.array([bl * (1 - 0.2 * i), bl * (0.8 + 0.2 * i)]), C["end"] + 0.15 + dt, 0.22)
place(logo, st2(boom(3.0) * 0.5), C["end"] + 0.15, 0.5)
logo = verb(logo, HALL, 0.6)

# ------------------------------------------------------------------ FOLEY + AMBIENCE
fol = np.zeros((2, N))
for k in range(6):
    place(fol, st2(paper(0.35)), 0.6 + k * 0.32, 0.22)
for at in (C["bets"] + 0.2, C["rp"] + 0.1):
    place(fol, st2(paper()), at, 0.3)
for tc in np.arange(C["d267"] - 0.6, C["d267"] + 0.2, 0.06):
    place(fol, st2(tick(3200, 0.02)), tc, 0.05)
foley = verb(fol, ROOM, 0.4)
# storm bed under the coastal-feeder scene: wind + rain + 50 Hz hum
rain_n = bp(rng.standard_normal(N), 900, 9000) * 0.5 + hp(rng.standard_normal(N), 4000) * 0.3
wind = lp(rng.standard_normal(N), 400) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.23 * t))
hum_t = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t)
storm = (rain_n * 0.05 + wind * 0.12 + hum_t * 0.03) * win(C["work"] - 0.1, C["why"] + 0.2, 0.4, 0.5)
amb = np.array([storm, np.roll(storm, 997)])


# ------------------------------------------------------------------ write stems
def write(name, st, peak=0.95):
    st = np.atleast_2d(st)
    m = np.max(np.abs(st))
    if m > peak: st = st * peak / m
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s24le", f"{out}/stems/{name}.wav"], input=st.T.astype(np.float32).tobytes(), check=True)
    print(f"{name:12s} peak {m:.2f}")


for name, st in [("music", music), ("impacts", impacts), ("risers", risers), ("sonic_logo", logo), ("foley", foley), ("amb_exterior", amb)]:
    write(name, st)
print(json.dumps({k: round(v, 2) for k, v in C.items()}, ensure_ascii=False))
