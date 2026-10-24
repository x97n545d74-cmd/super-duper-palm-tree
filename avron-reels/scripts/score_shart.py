"""Original score + sound design for "शर्त (The Fine Print)", built to the narration timeline.

Synthesised orchestral palette (string ensemble, cello ostinato, brass swell, taiko,
heartbeat, metallic ticks, bell sonic logo) through generated convolution reverbs, plus
separate ambience/foley stems. Deterministic. Writes stems to <out_dir>/stems and the cue
sheet into <project>/timeline.json["cues"].

usage: score_shart.py <project_dir> <out_dir>
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
rng = np.random.default_rng(29)
B = {b["id"]: b for b in tl["beats"]}


def w(bid, text, nth=0):
    norm = lambda s: re.sub(r"[^\w$₹.]", "", s).lower()
    hits = [x for x in B[bid]["words"] if norm(x["w"]) == norm(text)]
    return hits[nth]["s"]


# ------------------------------------------------------------------ cue sheet (shared with visuals)
C = {
    "open": 0.0, "date": B["b1_date"]["start"], "crude122": w("b1_date", "$122."),
    "choice": B["b2_choice"]["start"], "mehenga": w("b2_choice", "महंगा"), "khud": w("b2_choice", "खुद"),
    "excise": B["b3_excise"]["start"], "ten": w("b3_excise", "₹10"), "vahi": w("b3_excise", "वही।"),
    "market": B["b4_market"]["start"], "brent": w("b4_market", "$113"), "rbi": w("b4_market", "RBI"),
    "pehli": w("b4_market", "पहली"),
    "omc": B["b5_omc"]["start"], "loss34": w("b5_omc", "₹34"),
    "promise": B["b6_promise"]["start"], "fd": w("b6_promise", "4.3"), "debt": w("b6_promise", "50"),
    "clause": B["b7_clause"]["start"], "shart": w("b7_clause", "शर्त"), "bina": w("b7_clause", "\"बिना"),
    "extshock": w("b7_clause", "shock"),
    "shock": B["b8_shock"]["start"], "gos": w("b8_shock", "\"Global"),
    "y2029s": B["b9_2029"]["start"], "y2029": w("b9_2029", "2029"),
    "bill": B["b10_bill"]["start"], "company": w("b10_bill", "Company,"), "sarkar": w("b10_bill", "सरकार…"),
    "aap": w("b10_bill", "आप।"),
    "cta": B["b11_cta"]["start"], "end": DUR,
}
tl["cues"] = {k: round(v, 3) for k, v in C.items()}
json.dump(tl, open(f"{proj}/timeline.json", "w"), indent=1, ensure_ascii=False)


# ------------------------------------------------------------------ DSP
def sos(kind, f, order=2):
    return butter(order, f, kind, fs=SR, output="sos")


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


def ir(seconds, damp, pre=0.012):
    """Stereo synthetic hall/room impulse response (decorrelated decaying noise)."""
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    out = []
    for ch in range(2):
        x = rng.standard_normal(n) * np.exp(-tt * 6.9 / seconds)
        x = lp(x, damp) + 0.3 * lp(x, damp * 0.4)
        x = np.concatenate([np.zeros(int(pre * SR)), x])
        out.append(x / np.sqrt(np.sum(x ** 2)))
    return np.array(out)


HALL = ir(3.4, 5000)
ROOM = ir(0.7, 3500, 0.004)
EXT = ir(1.6, 6000, 0.03)


def verb(st, kernel, wet):
    st = np.atleast_2d(st)
    if st.shape[0] == 1: st = np.vstack([st, st])
    out = np.zeros_like(st)
    for ch in range(2):
        out[ch] = st[ch] + wet * fftconvolve(st[ch], kernel[ch])[:st.shape[1]]
    return out


def saw(f, tt, phase=0.0):
    return 2 * ((tt * f + phase) % 1.0) - 1


NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)
M = {"D2": 38, "F2": 41, "G2": 43, "A2": 45, "Bb2": 46, "C3": 48, "D3": 50, "E3": 52, "F3": 53, "G3": 55, "A3": 57,
     "Bb3": 58, "C#4": 61, "D4": 62, "F4": 65, "A4": 69, "Bb1": 34, "D1": 26, "A1": 33, "G1": 31, "F#5": 78, "D5": 74,
     "A5": 81, "D6": 86}


def strings(notes, t0, t1, vol, cutoff=2600, attack=1.4, release=1.2):
    """Ensemble pad: 6 detuned saws per note with vibrato, bow attack, dark filter."""
    n = int((t1 - t0 + release) * SR)
    tt = np.arange(n) / SR
    L, R = np.zeros(n), np.zeros(n)
    for nn in notes:
        f = NOTE(M[nn])
        for k in range(6):
            det = 1 + (k - 2.5) * 0.0019
            vib = 1 + 0.0035 * np.sin(2 * np.pi * (4.6 + 0.3 * k) * tt + k)
            v = saw(f * det, tt * vib, rng.random())
            pan = (k / 5.0)
            L += v * (1 - pan); R += v * pan
    e = env(n, attack, release)
    st = np.array([lp(L, cutoff), lp(R, cutoff)]) * e * vol / (len(notes) * 6)
    return st


def cello_ostinato(root, t0, t1, vol, eighth):
    pattern = [0, 0, 7, 0, 3, 0, 7, 12]
    n = int((t1 - t0 + 0.5) * SR)
    st = np.zeros((2, n))
    k, tc = 0, 0.0
    ln = int(eighth * SR * 0.95)
    tt = np.arange(ln) / SR
    while tc < t1 - t0:
        f = NOTE(M[root] + pattern[k % 8])
        v = (saw(f, tt) + 0.6 * saw(f * 1.003, tt)) * (1 - np.exp(-tt / 0.012)) * np.exp(-tt / 0.22)
        v += 0.05 * hp(rng.standard_normal(ln), 2500) * np.exp(-tt / 0.03)  # bow scratch
        v = lp(v, 1500)
        place(st, np.array([v * 0.9, v * 1.0]), tc, 1.0 if k % 2 == 0 else 0.75)
        tc += eighth; k += 1
    return st * vol


def brass(notes, t0, dur, vol):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for nn in notes:
        f = NOTE(M[nn])
        s += saw(f, tt) + saw(f * 1.004, tt) + 0.5 * saw(f * 0.998, tt)
    cres = (tt / dur) ** 1.8
    out = np.zeros(n)
    blk = 2048
    for i in range(0, n, blk):  # brightening filter = brass "blat"
        fc = 250 + 3200 * cres[min(i, n - 1)]
        out[i:i + blk] = lp(s[i:i + blk], fc)
    out *= cres * np.exp(-np.maximum(tt - dur * 0.92, 0) / 0.08)
    return np.array([out, out]) * vol / (len(notes) * 2.5)


def taiko(f0=70, decay=0.5):
    n = int(1.6 * SR)
    tt = np.arange(n) / SR
    body = np.sin(2 * np.pi * np.cumsum(f0 + 45 * np.exp(-tt / 0.05)) / SR) * np.exp(-tt / decay)
    skin = lp(rng.standard_normal(n), 1200) * np.exp(-tt / 0.03)
    return body + 0.4 * skin


def heartbeat():
    n = int(0.7 * SR)
    tt = np.arange(n) / SR
    def thump(t0, a):
        x = np.sin(2 * np.pi * np.cumsum(48 + 30 * np.exp(-np.maximum(tt - t0, 0) / 0.03)) / SR)
        return a * x * np.exp(-np.maximum(tt - t0, 0) / 0.09) * (tt >= t0)
    return lp(thump(0, 1.0) + thump(0.21, 0.7), 180)


def tick(f=2600):
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * 1.41 * tt) * 3
    return np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt / 0.012)


def bell(f, dur=4.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt / (dur * d))
            for r, a, d in [(1, 1, .5), (2.01, .45, .3), (2.76, .3, .22), (5.4, .12, .1), (0.5, .25, .6)])
    return s * (1 - np.exp(-tt / 0.002))


def boom(len_s=3.0):
    n = int(len_s * SR)
    tt = np.arange(n) / SR
    sub = np.sin(2 * np.pi * np.cumsum(30 + 55 * np.exp(-tt / 0.09)) / SR) * np.exp(-tt / 0.9)
    crack = lp(rng.standard_normal(n), 2200) * np.exp(-tt / 0.05)
    return sub + 0.35 * crack


def riser(dur):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    for i in range(0, n, 1024):
        fc = 300 * (25 ** (i / n))
        out[i:i + 1024] = lp(noise[i:i + 1024], min(fc, 20000))
    tone = np.sin(2 * np.pi * np.cumsum(140 * 4 ** (tt / dur)) / SR)
    return (0.7 * out + 0.25 * tone) * (tt / dur) ** 2.4


def reverse_swell(dur):
    return boom(dur)[::-1] * np.linspace(0, 1, int(dur * SR)) ** 2


# ------------------------------------------------------------------ MUSIC
mus = np.zeros((2, N))
EIGHTH = 60 / 72 / 2
# drone bed throughout (D), fades for the clause silence
drone = (0.6 * np.sin(2 * np.pi * NOTE(M["D1"]) * t) + 0.3 * np.sin(2 * np.pi * NOTE(M["D2"]) * t + 1))
drone *= (0.8 + 0.2 * np.sin(2 * np.pi * 0.09 * t))
drone *= win(0.0, C["clause"] + 0.2, 1.5, 0.6) + 0.7 * win(C["shock"] - 0.3, C["cta"] + 0.5, 0.8, 1.5)
mus += np.array([drone, drone]) * 0.10

# heartbeat (72 bpm) from the choice through the market section, returns softly at the bill
hb = heartbeat()
tc = C["choice"]
while tc < C["promise"]:
    place(mus, np.array([hb, hb]), tc, 0.55)
    tc += 60 / 72
tc = C["bill"]
while tc < C["cta"]:
    place(mus, np.array([hb, hb]), tc, 0.35)
    tc += 60 / 72

# metallic ticks (clock/meter) through excise + market; stop for the reduction
tc, k = C["choice"] + 0.2, 0
while tc < C["promise"] - 0.2:
    place(mus, np.array([tick(2600 + 90 * (k % 3)) * 0.8, tick(2600 + 90 * (k % 3))]), tc, 0.10 if k % 2 else 0.16)
    tc += EIGHTH; k += 1

# strings: section harmony
for notes, a, b, vol, cut in [
    (["D3", "F3", "A3"], C["choice"] - 0.5, C["excise"], 0.40, 1600),
    (["Bb2", "D3", "F3"], C["excise"] - 0.3, C["market"], 0.45, 1900),
    (["G2", "Bb2", "D3", "G3"], C["market"] - 0.2, C["omc"], 0.55, 2400),
    (["A2", "C#4", "E3", "A3"], C["omc"] - 0.2, C["promise"], 0.65, 2800),
    (["D3", "A3"], C["promise"] - 0.1, C["clause"] - 0.2, 0.35, 1400),       # reduction: lone documentary pad
    (["D4", "A4"], C["clause"] + 0.4, C["shock"] - 0.3, 0.09, 6000),         # thin high tone in the silence
    (["Bb2", "D3", "F3", "Bb3"], C["y2029s"] - 0.4, C["bill"] + 0.3, 0.55, 2600),  # tonal shift
    (["D3", "F3", "A3", "D4"], C["bill"] - 0.2, C["end"] - 0.6, 0.38, 2000),
]:
    place(mus, strings(notes, a, b, vol, cut, attack=0.9 if vol > 0.3 else 1.6), a)

# cello ostinato: market -> peak at ₹34
place(mus, cello_ostinato("D2", C["market"], C["omc"], 0.32, EIGHTH), C["market"])
place(mus, cello_ostinato("A1", C["omc"], C["promise"] - 0.3, 0.40, EIGHTH / 2 * 2), C["omc"])
# taiko/tom escalation (quarters, then eighths), cut at the reduction
tc, k = C["market"], 0
while tc < C["promise"] - 0.4:
    dens = 2 if tc < C["omc"] else 1
    if k % dens == 0:
        place(mus, np.array([taiko(68 + 6 * (k % 2)), taiko(68 + 6 * (k % 2))]), tc, 0.22 + 0.12 * (tc > C["omc"]))
    tc += EIGHTH; k += 1
# Global Oil Shock: tremolo strings + swell
trem = strings(["D3", "Eb3"] if False else ["D3", "F3", "Bb3"], C["shock"], C["y2029s"], 0.45, 3000, attack=0.3)
trem *= (0.6 + 0.4 * np.sin(2 * np.pi * 11 * np.arange(trem.shape[1]) / SR))
place(mus, trem, C["shock"] - 0.1)
# brass swell into 2029 (B-flat major colour)
bdur = C["y2029"] - C["y2029s"] + 0.6
place(mus, brass(["Bb2", "F3", "D4"], 0, bdur, 0.75), C["y2029"] - bdur + 0.05)

music = verb(mus, HALL, 0.55)

# ------------------------------------------------------------------ IMPACTS / RISERS / LOGO
imp = np.zeros((2, N))
place(imp, np.array([boom(3.5)] * 2), C["date"] + 0.02, 0.85)
place(imp, np.array([boom()] * 2), C["loss34"], 0.75)
place(imp, np.array([reverse_swell(1.3)] * 2), C["gos"] - 1.3, 0.35)
place(imp, np.array([boom(3.0)] * 2), C["gos"], 0.6)
place(imp, np.array([boom(4.0)] * 2), C["y2029"], 0.95)
impacts = verb(imp, HALL, 0.35)

ris = np.zeros((2, N))
for at, d, g in [(C["loss34"], 1.4, 0.28), (C["clause"] - 0.05, 0.9, 0.12), (C["cta"] + 0.05, 1.5, 0.2)]:
    r = riser(d)
    place(ris, np.array([r, r[::-1] * 0 + r]), at - d, g)
risers = verb(ris, HALL, 0.3)

logo = np.zeros((2, N))
for i, (nn, dt) in enumerate([("D5", 0.0), ("A5", 0.22), ("D6", 0.44)]):
    bl = bell(NOTE(M[nn]), 4.5)
    place(logo, np.array([bl * (1 - 0.2 * i), bl * (0.8 + 0.2 * i)]), C["cta"] + 0.15 + dt, 0.22)
place(logo, np.array([boom(3.5) * 0.5] * 2), C["cta"] + 0.15, 0.5)
logo = verb(logo, HALL, 0.6)

# ------------------------------------------------------------------ AMBIENCE + FOLEY
# exterior: rain + distant thunder (opening, and under the 2029 reveal on the night exterior)
rain = bp(rng.standard_normal(N), 900, 9000) * 0.5 + hp(rng.standard_normal(N), 4000) * 0.3
drops = np.zeros(N)
for d in rng.uniform(0, DUR, int(DUR * 35)):
    i = int(d * SR)
    if i + 600 < N:
        drops[i:i + 600] += rng.uniform(0.2, 1) * np.exp(-np.arange(600) / 60) * np.sin(np.arange(600) * rng.uniform(0.3, 0.9))
rain = rain + hp(drops, 1500) * 0.6
ext_mask = win(0.0, C["excise"] + 0.3, 0.05, 0.8) + 0.8 * win(C["y2029s"] - 0.5, C["bill"] + 0.5, 1.0, 1.0)
thunder = np.zeros(N)
for at, g in [(0.05, 1.0), (C["y2029s"] + 0.3, 0.6)]:
    n = int(5 * SR)
    tt = np.arange(n) / SR
    th = lp(rng.standard_normal(n), 180) * (np.exp(-tt / 1.8) * (1 - np.exp(-tt / 0.15))) * (1 + 0.6 * np.sin(2 * np.pi * 1.3 * tt))
    place(thunder, th * 3, at, g)
amb_ext = verb(np.array([rain * ext_mask * 0.05, np.roll(rain, 997) * ext_mask * 0.05]), EXT, 0.4) + np.array([thunder, thunder]) * 0.16

# interior room tone (briefing room) + clause silence bed
room = lp(rng.standard_normal(N), 350) * 0.5 + 0.02 * np.sin(2 * np.pi * 120 * t)
room_mask = win(C["excise"] - 0.2, C["shock"] + 0.3, 0.8, 0.8)
amb_room = np.array([room, np.roll(room, 2400)]) * room_mask * 0.03

# foley: paper slide at excise + at the clause, footsteps entering the room, pen tap at ₹10
fol = np.zeros((2, N))
def paper(d=0.7):
    n = int(d * SR); tt = np.arange(n) / SR
    crinkle = 1 + 0.8 * (rng.random(n) > 0.995)
    return bp(rng.standard_normal(n), 1500, 7000) * np.sin(np.pi * tt / d) ** 2 * crinkle
def step():
    n = int(0.25 * SR); tt = np.arange(n) / SR
    return lp(rng.standard_normal(n), 900) * np.exp(-tt / 0.03) + 0.4 * np.sin(2 * np.pi * 95 * tt) * np.exp(-tt / 0.05)
for k in range(3):
    place(fol, np.array([step() * 0.7, step()]), C["excise"] - 0.9 + k * 0.42, 0.25)
place(fol, np.array([paper(), paper()]), C["excise"] + 0.6, 0.30)
place(fol, np.array([tick(1800), tick(1800)]), C["ten"], 0.25)
place(fol, np.array([paper(1.1), paper(1.1)]), C["clause"] + 0.1, 0.28)
foley = verb(fol, ROOM, 0.5)

# market alerts: two-tone terminal pings on Brent, RBI, ₹34
alr = np.zeros((2, N))
def ping(f1, f2):
    n = int(0.32 * SR); tt = np.arange(n) / SR
    a = np.sin(2 * np.pi * f1 * tt) * (tt < 0.12) + np.sin(2 * np.pi * f2 * tt) * (tt >= 0.13)
    return a * np.exp(-((tt % 0.13) / 0.09)) * 0.8
for at in (C["brent"], C["rbi"], C["loss34"] - 0.15):
    place(alr, np.array([ping(1320, 990), ping(1320, 990)]), at - 0.05, 0.10)
alerts = verb(alr, ROOM, 0.3)


# ------------------------------------------------------------------ write stems
def write(name, st, peak=0.95):
    st = np.atleast_2d(st)
    m = np.max(np.abs(st))
    if m > peak: st = st * peak / m
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                    "-c:a", "pcm_s24le", f"{out}/stems/{name}.wav"], input=st.T.astype(np.float32).tobytes(), check=True)
    print(f"{name:12s} peak {m:.2f}")


for name, st in [("music", music), ("impacts", impacts), ("risers", risers), ("sonic_logo", logo),
                 ("amb_exterior", amb_ext), ("amb_room", amb_room), ("foley", foley), ("alerts", alerts)]:
    write(name, st)
print(json.dumps(tl["cues"], ensure_ascii=False))
