"""Cut one-file-per-character recordings into per-line WAVs at the pauses between lines.
CUTS lists, per character file, the line ids in order and the cut times (s) between them,
taken from the pauses found by ASR + silence detection (see the commit that added this).
usage: split_takes.py <raw_dir> <out_dir>"""
import os, subprocess, sys
import numpy as np, soundfile as sf
raw, out = sys.argv[1:3]
SR = 48000
CUTS = {
    "chacha_1.mp3": (["c1", "c2"], [4.8]),
    "boy_1.mp3": (["b1", "b2", "b3"], [3.6, 7.5]),
    "girl_1.mp3": (["g1", "g2", "g3", "g4", "g5", "g6"], [8.38, 13.2, 17.0, 21.17, 24.7]),
}
os.makedirs(out, exist_ok=True)
for f, (ids, cuts) in CUTS.items():
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{raw}/{f}", "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(pcm, np.float32)
    edges = [0] + [int(c * SR) for c in cuts] + [len(a)]
    for i, lid in enumerate(ids):
        seg = a[edges[i]:edges[i + 1]]
        idx = np.where(np.abs(seg) > 0.02)[0]
        seg = seg[max(0, idx[0] - int(0.03 * SR)):idx[-1] + int(0.06 * SR)]
        fade = int(0.01 * SR)
        seg = seg.copy(); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        sf.write(f"{out}/{lid}.wav", seg, SR)
        print(lid, f"{len(seg) / SR:.2f}s")
