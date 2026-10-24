"""Word-level alignment of narration with faster-whisper -> JSON for captions/scene timing."""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel

audio, out = sys.argv[1], sys.argv[2]
model = WhisperModel("small.en", device="cpu", compute_type="int8")
pcm = subprocess.run(["ffmpeg","-v","error","-i",audio,"-f","f32le","-ac","1","-ar","16000","-"],capture_output=True,check=True).stdout
segments, _ = model.transcribe(np.frombuffer(pcm, np.float32), word_timestamps=True, beam_size=5,
                               initial_prompt="ICRA, Jefferies, Brent, AVRON, paise, rupees, Delhi.")
words = []
for seg in segments:
    for w in seg.words:
        words.append({"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)})
json.dump(words, open(out, "w"), indent=1)
print(len(words), "words")
print(" ".join(f"{x['w']}@{x['s']}" for x in words))
