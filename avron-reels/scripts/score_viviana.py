"""Original score + sound design for the Viviana Power Tech reel, built to the narration timeline.

C-minor investigation palette: clock-tick pulse, synth/cello ostinato, string pads, a 50 Hz grid hum
when the lines energise, paper and stamp foley for the exchange filings, impacts on the price moves,
and the AVRON three-note bell logo. Deterministic. Writes stems to <out_dir>/stems.

usage: score_viviana.py <project_dir> <out_dir>
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
    "mb": w("b0_q", "multibagger"), "sorry": S("b0_truth"), "fake": w("b0_truth", "fake"), "truth": w("b0_truth", "truth."),
    "hook": S("b1_hook"), "p903": w("b1_hook", "₹903"), "p680": w("b1_hook", "₹680"), "p5": w("b1_hook", "5"),
    "files": S("b1_night"), "board": w("b1_night", "board"), "uturn_word": w("b1_night", "U-turn."),
    "weekend": S("b2_order"), "r467": w("b2_order", "₹467"), "night": S("b2_notice"), "warrants": w("b2_notice", "warrants"),
    "uturn": S("b3_uturn"), "chhod": w("b3_uturn", "छोड़"), "fall": S("b3_fall"), "pct": w("b3_fall", "12% गिरा।"),
    "who": S("b4_who"), "subs": w("b4_who", "substations"), "growth": S("b4_growth"), "r531": w("b4_growth", "₹531"),
    "cash": S("b5_cash"), "cfo": S("b5_cfo"), "days": S("b5_days"), "d267": w("b5_days", "267"), "debt": S("b5_debt"),
    "double": w("b5_debt", "double,"), "order": S("b6_order"), "pehle": w("b6_order", "पहले"), "mgmt": S("b7_mgmt"),
    "watch": S("b8_watch"), "march": w("b8_q", "cash"), "end": S("b9_avron"),
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
# hook: sub drone + clock pulse + dark pad opening
drone = (np.sin(2 * np.pi * NOTE(M["C1"]) * t) + 0.5 * np.sin(2 * np.pi * NOTE(M["G1"]) * t)) * 0.35
mus += st2(drone * (win(C["sorry"], C["cash"] + 0.5, 0.3, 0.6) * 0.8 + win(C["cash"], C["mgmt"], 0.1, 0.8) * 1.2 + win(C["watch"] - 0.5, C["end"] + 0.4, 0.6, 0.3)))
# opener: bright hype pad that swells into "multibagger", then stops dead on "Sorry"
place(mus, pad(["Eb3", "G3", "Bb3", "D4"], 0, C["sorry"], 0.42, cutoff=3200, attack=1.6, release=0.08), 0.0)
place(mus, pad(["C3", "Eb3", "G3"], C["hook"] - 0.3, C["weekend"], 0.5, cutoff=1400, attack=0.6), C["hook"] - 0.3)
place(mus, ostinato("C2", C["p903"], C["p680"] + 0.2, 0.28, 0.155, 900, (0, 0, 12, 0)), C["p903"])
# weekend: ostinato day -> night (filter closes, Ab colour)
place(mus, ostinato("C3", C["weekend"], C["night"], 0.30, 0.25, 1700), C["weekend"])
place(mus, pad(["C3", "Eb3", "G3", "Bb3"], C["weekend"], C["night"], 0.38, 2000), C["weekend"])
place(mus, ostinato("Ab2", C["night"], C["uturn"], 0.28, 0.25, 900, (0, 12, 7, 12, 4, 12, 7, 16)), C["night"])
place(mus, pad(["Ab2", "C3", "Eb3"], C["night"], C["uturn"], 0.45, 1100, attack=0.8), C["night"])
# u-turn: high tremolo tension
place(mus, pad(["G3", "Ab3", "C4"], C["uturn"], C["who"], 0.42, 2600, attack=0.4, trem=0.9), C["uturn"])
place(mus, ostinato("C2", C["uturn"], C["fall"], 0.3, 0.125, 800, (0, 0, 0, 12)), C["uturn"])
# who: lift to Eb major colour, swells into ₹531
place(mus, pad(["Eb2", "Bb2", "Eb3", "G3", "Bb3"], C["who"] - 0.2, C["cash"], 0.55, 3200, attack=1.0), C["who"] - 0.2)
place(mus, ostinato("Eb3", C["subs"], C["cash"] - 0.1, 0.22, 0.2, 2400, (0, 7, 12, 7, 15, 12, 7, 12)), C["subs"])
# cash: hollow low pulse
for k, tc in enumerate(np.arange(C["cash"], C["order"], 0.6)):
    place(mus, st2(boom(0.9, 40) * 0.5), tc, 0.14 if k % 2 == 0 else 0.08)
place(mus, pad(["C3", "Eb3", "Ab3"], C["cash"], C["order"], 0.3, 900), C["cash"])
# order: suspended cluster
place(mus, pad(["C4", "D4", "G4"], C["order"], C["mgmt"], 0.3, 3000, attack=1.2), C["order"])
# mgmt: soft neutral pad
place(mus, pad(["Ab2", "Eb3", "C4"], C["mgmt"], C["watch"], 0.32, 1600), C["mgmt"])
# watch: ostinato returns, building to the end
place(mus, ostinato("C3", C["watch"], C["end"] - 0.05, 0.3, 0.2, 1400), C["watch"])
place(mus, pad(["C3", "G3", "Eb4"], C["watch"], C["end"], 0.42, 2200, attack=2.0), C["watch"])
# clock-tick pulse through the hook and the weekend (the "timestamp" motif)
for tc in np.arange(C["hook"], C["uturn"], 0.5):
    if C["p680"] - 0.1 < tc < C["p680"] + 0.6: continue
    place(mus, st2(tick(2600 if int(tc * 2) % 2 == 0 else 2000)), tc, 0.05)
music = verb(mus, HALL, 0.28)

# ------------------------------------------------------------------ IMPACTS / RISERS / LOGO
imp = np.zeros((2, N))
for at, g, L in [(C["p680"], 0.9, 3.5), (C["weekend"], 0.35, 2.0), (C["pct"], 0.85, 3.0), (C["who"], 0.45, 3.0),
                 (C["r531"], 0.4, 2.5), (C["cash"], 0.7, 3.0), (C["d267"], 0.45, 2.0), (C["double"], 0.5, 2.0), (C["watch"], 0.3, 2.0)]:
    place(imp, st2(boom(L)), at, g)
place(imp, st2(stamp()), C["chhod"], 0.9)
place(imp, st2(stamp()), C["uturn_word"], 0.8)
place(imp, st2(glide_down(0.45, 1400, 60)), C["sorry"] - 0.05, 0.45)  # tape-stop on "Sorry"
place(imp, st2(boom(3.0)), C["truth"], 0.6)
place(imp, st2(boom(3.0)), C["hook"], 0.55)
place(imp, st2(glide_down(0.55)), C["pct"] - 0.55, 0.35)
impacts = verb(imp, HALL, 0.32)

ris = np.zeros((2, N))
for at, d, g in [(C["sorry"], 2.4, 0.22), (C["p680"], 1.2, 0.25), (C["who"], 1.0, 0.18), (C["cash"], 0.8, 0.15), (C["end"], 1.6, 0.22)]:
    place(ris, st2(riser(d)), at - d, g)
for at in (C["files"], C["weekend"], C["uturn"], C["order"], C["mgmt"], C["watch"]):
    place(ris, np.array([whoosh(0.45), whoosh(0.45)[::-1] * 0 + whoosh(0.45)]), at - 0.3, 0.12)
risers = verb(ris, HALL, 0.25)

logo = np.zeros((2, N))
for i, (nn, dt) in enumerate([("D5", 0.0), ("A5", 0.22), ("D6", 0.44)]):
    bl = bell(NOTE(M[nn]), 4.0)
    place(logo, np.array([bl * (1 - 0.2 * i), bl * (0.8 + 0.2 * i)]), C["end"] + 0.15 + dt, 0.22)
place(logo, st2(boom(3.0) * 0.5), C["end"] + 0.15, 0.5)
logo = verb(logo, HALL, 0.6)

# ------------------------------------------------------------------ FOLEY: filings, clock flip, counters, grid hum
fol = np.zeros((2, N))
for at in (C["board"] - 0.3, C["weekend"], C["night"] + 0.1, C["uturn"], C["order"]):
    place(fol, st2(paper()), at, 0.32)
for k in range(5):  # clock flip 13:07 -> 22:48
    place(fol, st2(tick(1500, 0.04)), C["night"] + 0.05 + k * 0.12, 0.25)
for k in range(5):  # five sessions
    place(fol, st2(tick(1100, 0.05)), C["p5"] - 0.1 + k * 0.14, 0.2)
for tc in np.arange(C["days"], C["d267"] + 0.3, 0.07):  # 267 counter
    place(fol, st2(tick(3200, 0.02)), tc, 0.05)
for at in (C["r467"] - 0.1, C["warrants"] - 0.1, C["pehle"] - 0.4):  # highlighter
    place(fol, st2(bp(rng.standard_normal(int(0.5 * SR)), 2000, 6000) * np.sin(np.linspace(0, np.pi, int(0.5 * SR))) * 0.5), at, 0.18)
foley = verb(fol, ROOM, 0.4)
hum_t = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t) + 0.3 * np.sin(2 * np.pi * 150 * t)
crackle = hp(rng.standard_normal(N), 3000) * (rng.random(N) > 0.9993) * 3
grid = (hum_t * 0.05 + crackle * 0.04) * win(C["subs"] - 0.1, C["cash"] - 0.1, 0.4, 0.4)
amb = np.array([grid, np.roll(grid, 300)])


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
