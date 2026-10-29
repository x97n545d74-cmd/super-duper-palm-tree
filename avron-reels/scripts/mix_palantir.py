"""Mix the Palantir reel: Adam VO + ElevenLabs SFX at shot cuts, loudness -14 LUFS.
Usage: python3 scripts/mix_palantir.py  ->  public/palantir/mix.wav"""
import subprocess

P = "projects/2026-10-palantir"
VO = f"{P}/vo/vo_final.wav"
# (file, start seconds, gain dB); times match the shot table in src/projects/palantir/Reel.tsx
CUES = [("hit", 0.0, -9), ("whoosh", 1.5, -16), ("hit", 3.4, -12), ("whoosh", 5.4, -18), ("whoosh", 7.9, -18),
        ("tick", 9.3, -14), ("whoosh", 11.5, -18), ("ping", 13.3, -14), ("ping", 15.15, -12), ("whoosh", 16.9, -18),
        ("hit", 18.0, -8), ("whoosh", 19.3, -18), ("whoosh", 22.3, -18), ("tick", 24.6, -15), ("riser", 25.55, -12),
        ("hit", 26.6, -9), ("whoosh", 27.7, -18), ("hit", 31.0, -14), ("whoosh", 32.5, -18), ("hit", 35.1, -9)]

inputs = ["-i", VO]
chains, labels = [], ["[0:a]"]
for i, (name, t, g) in enumerate(CUES, start=1):
    inputs += ["-i", f"{P}/sfx/{name}.mp3"]
    ms = int(t * 1000)
    chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={g}dB,adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
graph = ";".join(chains) + f";{''.join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,apad=pad_dur=0.8,loudnorm=I=-14:TP=-1.0:LRA=11[out]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[out]", "-ar", "48000", "public/palantir/mix.wav"], check=True)
print("wrote public/palantir/mix.wav")
