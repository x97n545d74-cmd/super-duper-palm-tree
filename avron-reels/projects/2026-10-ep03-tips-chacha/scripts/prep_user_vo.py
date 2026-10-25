"""User's own TTS files -> 48 kHz mono WAVs in <out_dir>, trimmed, each line at the same loudness.
Also prints an ASR read-back of every file so a swapped or misread line is caught before the render.
usage: prep_user_vo.py <src_dir with b1.mp3…> <out_dir>"""
import glob, os, subprocess, sys
import numpy as np, soundfile as sf
src, out = sys.argv[1:3]
SR = 48000
os.makedirs(out, exist_ok=True)
from faster_whisper import WhisperModel
asr = WhisperModel("small", device="cpu", compute_type="int8")
for p in sorted(glob.glob(f"{src}/*.mp3") + glob.glob(f"{src}/*.wav")):
    i = os.path.splitext(os.path.basename(p))[0].lower().split("_")[-1]  # ep02_c1.mp3 -> c1
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", "loudnorm=I=-18:TP=-2:LRA=7", "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.float32).copy()
    idx = np.where(np.abs(a) > 0.02)[0]
    a = a[max(0, idx[0] - int(0.03 * SR)):idx[-1] + int(0.06 * SR)]
    sf.write(f"{out}/{i}.wav", a, SR)
    from scipy.signal import resample_poly
    segs, _ = asr.transcribe(resample_poly(a, 1, 3).astype(np.float32), language="hi")
    print(i, f"{len(a) / SR:.2f}s", "|", " ".join(s.text.strip() for s in segs))
