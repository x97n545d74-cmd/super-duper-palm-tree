"""Original score for the Musk SpaceX-kids reel: dark synth pad, sub pulse at 96 BPM, soft hats,
a whoosh on every beat change, a riser into "kyun" (b8) and a hit on it. Mixed under the anchor VO at -14 LUFS."""
import json, subprocess
import numpy as np, soundfile as sf
SR = 48000
P = "projects/2026-10-musk-spacex-kids"
T = json.load(open(f"{P}/timeline.json"))
END = T["duration"] + 2.6
n = int(END * SR); t = np.arange(n) / SR
rng = np.random.default_rng(7)
bpm = 96; beat = 60 / bpm

def env(x, a, r):  # attack/release envelope over a segment
    e = np.minimum(1, x / a) * np.exp(-np.maximum(0, x - a) / r)
    return e

mus = np.zeros(n)
# pad: minor chords, detuned saws, slow lowpass via moving average
chords = [[110.0, 130.81, 164.81], [87.31, 110.0, 130.81], [98.0, 116.54, 146.83], [82.41, 98.0, 123.47]]
bar = 4 * beat
for i, ch in enumerate(chords * 20):
    s0 = i * 2 * bar
    if s0 > END: break
    seg = (t >= s0) & (t < s0 + 2 * bar + 0.5)
    x = t[seg] - s0
    tone = sum(((x * f * d) % 1 * 2 - 1) for f in ch for d in (0.995, 1.005)) / 6
    mus[seg] += 0.10 * tone * np.minimum(1, x / 0.8) * np.minimum(1, (2 * bar + 0.5 - x) / 0.5)
k = np.ones(40) / 40
mus = np.convolve(mus, k, mode="same")
# sub pulse on each beat, hats on off-beats
for i in range(int(END / beat)):
    s0 = i * beat
    a = int(s0 * SR); L = int(0.35 * SR)
    if a + L > n: break
    x = np.arange(L) / SR
    mus[a:a + L] += 0.35 * np.sin(2 * np.pi * (55 + 40 * np.exp(-x * 30)) * x) * np.exp(-x * 9)
    h = int((s0 + beat / 2) * SR); HL = int(0.05 * SR)
    if h + HL < n:
        mus[h:h + HL] += 0.04 * rng.standard_normal(HL) * np.exp(-np.arange(HL) / SR * 80)
# whoosh at each beat change
def whoosh(at, dur=0.45, g=0.18):
    a = int(max(0, at - dur * 0.7) * SR); L = int(dur * SR)
    if a + L > n: return
    x = np.linspace(0, 1, L)
    w = rng.standard_normal(L); w = np.convolve(w, np.ones(12) / 12, mode="same")
    mus[a:a + L] += g * w * np.sin(np.pi * x) ** 2
for b in T["beats"][1:]:
    whoosh(b["start"])
# riser into b8 + hit
b8 = next(b for b in T["beats"] if b["id"] == "b8_why")["start"]
a = int((b8 - 1.6) * SR); L = int(1.6 * SR); x = np.linspace(0, 1, L)
mus[a:a + L] += 0.12 * rng.standard_normal(L) * x ** 2
hit = int(b8 * SR); HL = int(0.8 * SR); xh = np.arange(HL) / SR
mus[hit:hit + HL] += 0.6 * np.sin(2 * np.pi * (45 + 60 * np.exp(-xh * 20)) * xh) * np.exp(-xh * 4)
# fade out
mus *= np.minimum(1, (END - t) / 1.5)
mus /= np.max(np.abs(mus)) + 1e-9
sf.write("/tmp/musk_music.wav", np.stack([mus, mus], 1) * 0.9, SR)
# mix: VO + music (ducked under voice), loudnorm -14 LUFS
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/musk/anchor.mov", "-i", "/tmp/musk_music.wav", "-filter_complex",
    "[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur=%.2f,asplit[vo][sc];[1:a]volume=-15dB[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[md];[vo][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[out]" % END,
    "-map", "[out]", "-ar", "48000", "public/musk/mix.wav"], check=True)
print("ok", round(END, 2))
