"""Footballer-stocks reel: Tia VO with long pauses trimmed (>0.35 s → 0.22 s) and sped up 1.1x, the beat timeline with
caption words remapped, and an original upbeat score mixed under it at -14 LUFS.
Writes public/footy/vo_fit.wav, public/footy/mix.wav and projects/2026-10-footballer-stocks/timeline.json."""
import json, subprocess
import numpy as np, soundfile as sf
P = "projects/2026-10-footballer-stocks"
SR, SPEED = 48000, 1.1
W = json.load(open(f"{P}/vo_words.json"))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/footy/vo.mp3", "-ac", "1", "-ar", str(SR), "/tmp/fvo48.wav"], check=True)
vo, _ = sf.read("/tmp/fvo48.wav", dtype="float32")
# keep speech; squeeze long pauses
keep, t0 = [], max(0.0, W[0]["s"] - 0.05)
for a, b in zip(W, W[1:]):
    if b["s"] - a["e"] > 0.35:
        keep.append((t0, a["e"] + 0.11)); t0 = b["s"] - 0.11
keep.append((t0, W[-1]["e"] + 0.2))
def squeeze(t):
    acc = 0.0
    for s, e in keep:
        if t <= e: return acc + max(0.0, t - s)
        acc += e - s
    return acc
seg = np.concatenate([vo[int(s * SR):int(e * SR)] for s, e in keep])
sf.write("/tmp/fseg.wav", seg, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/fseg.wav", "-af", f"atempo={SPEED}", "-ar", str(SR), "public/footy/vo_fit.wav"], check=True)
LEAD = 0.15
fit, _ = sf.read("public/footy/vo_fit.wav", dtype="float32")
VO_LEN = LEAD + len(fit) / SR
T = lambda t: round(LEAD + squeeze(t) / SPEED, 3)

FIX = {"Pele": "Pelé", "Nabbe": "90", "rupe": "", "fir": "phir", "jio.": "Jio.", "dor": "daur", "naia": "naya", "Mbappe": "Mbappé",
       "Karia": "Career", "rabhi": "abhi"}
def fixw(w):
    x = w["w"]
    if x in ("850", "116"): x = "₹" + x
    if x == "41.": x = "₹41."
    x = FIX.get(x, x)
    return {**w, "w": x, "tone": "gold" if x.startswith("₹") or x in ("HUL.", "TCS.", "Reliance.", "Eternal,", "Swiggy.") else None}
words = [fixw({**w, "s": T(w["s"]), "e": T(w["e"])}) for w in W]
words = [w for w in words if w["w"]]
starts = [("hook", "Agar"), ("old", "Old"), ("messi", "Mid"), ("ronaldo", "Aur"), ("mbappe", "New"), ("yamal", "Aur"), ("cta", "Tumhara")]
idx, beats, pos = 0, [], 0
for k, (bid, first) in enumerate(starts):
    while words[pos]["w"] != first: pos += 1
    s = words[pos]["s"] - (0.0 if k == 0 else 0.12)
    beats.append({"id": bid, "start": 0.0 if k == 0 else round(s, 3)})
    pos += 1
for k, b in enumerate(beats):
    b["end"] = beats[k + 1]["start"] if k + 1 < len(beats) else round(VO_LEN + 0.3, 3)
    b["words"] = [w for w in words if b["start"] <= w["s"] < b["end"]]
DUR = beats[-1]["end"]
json.dump({"duration": DUR, "beats": beats}, open(f"{P}/timeline.json", "w"), indent=1, ensure_ascii=False)

# score: 118 BPM, bright pluck arp over a sub kick, whoosh on each beat, stadium-style riser into the CTA
END = DUR + 2.5
n = int(END * SR); t = np.arange(n) / SR
rng = np.random.default_rng(3)
mus = np.zeros(n); beat = 60 / 118
notes = [220.0, 277.18, 329.63, 440.0, 329.63, 277.18, 246.94, 329.63]
for i in range(int(END / (beat / 2))):
    s0 = i * beat / 2; a = int(s0 * SR); L = int(0.22 * SR)
    if a + L > n: break
    x = np.arange(L) / SR; f = notes[i % 8] * (0.5 if (i // 16) % 2 else 1)
    mus[a:a + L] += 0.10 * np.sign(np.sin(2 * np.pi * f * x)) * np.exp(-x * 14)
for i in range(int(END / beat)):
    a = int(i * beat * SR); L = int(0.3 * SR)
    if a + L > n: break
    x = np.arange(L) / SR
    mus[a:a + L] += 0.45 * np.sin(2 * np.pi * (50 + 70 * np.exp(-x * 35)) * x) * np.exp(-x * 10)
    h = int((i * beat + beat / 2) * SR); HL = int(0.04 * SR)
    if h + HL < n: mus[h:h + HL] += 0.05 * rng.standard_normal(HL) * np.exp(-np.arange(HL) / SR * 90)
mus = np.convolve(mus, np.ones(6) / 6, mode="same")
for b in beats[1:]:
    a = int(max(0, b["start"] - 0.3) * SR); L = int(0.42 * SR)
    if a + L < n:
        w = np.convolve(rng.standard_normal(L), np.ones(10) / 10, mode="same")
        mus[a:a + L] += 0.2 * w * np.sin(np.pi * np.linspace(0, 1, L)) ** 2
cta = beats[-1]["start"]; a = int((cta - 1.2) * SR); L = int(1.2 * SR)
mus[a:a + L] += 0.1 * rng.standard_normal(L) * np.linspace(0, 1, L) ** 2
mus *= np.minimum(1, (END - t) / 1.2)
mus /= np.max(np.abs(mus)) + 1e-9
sf.write("/tmp/fmusic.wav", np.stack([mus, mus], 1) * 0.9, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/footy/vo_fit.wav", "-i", "/tmp/fmusic.wav", "-filter_complex",
    f"[0:a]adelay={int(LEAD * 1000)},pan=stereo|c0=c0|c1=c0,apad=whole_dur={END:.2f},asplit[vo][sc];[1:a]volume=-14dB[m];[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=250[md];[vo][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]",
    "-map", "[out]", "-ar", "48000", "public/footy/mix.wav"], check=True)
print("vo", round(VO_LEN, 2), "reel", round(END, 2))
for b in beats: print(b["id"], b["start"], b["end"], " ".join(w["w"] for w in b["words"]))
