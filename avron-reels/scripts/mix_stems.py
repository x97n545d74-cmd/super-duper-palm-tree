"""Mix narration + stems: VO-keyed ducking on music/ambience, per-stem gains, two-pass loudnorm.

usage: mix_stems.py <asset_dir> [gains.json]
Expects <asset_dir>/vo.wav and <asset_dir>/stems/*.wav; writes <asset_dir>/mix.wav.

KEY_ONLY=1 writes <asset_dir>/bed.wav instead: the VO still drives the ducking but is left out, and the
bed gets the same gain the full mix (with VO) would get, so a voice added later at -14 LUFS sits right.
"""
import json, os, re, subprocess, sys

D = sys.argv[1]
G = {"music": -7.0, "impacts": -3.0, "risers": -9.0, "sonic_logo": -5.0, "amb_exterior": 3.0,
     "amb_room": 4.0, "foley": -1.0, "alerts": -3.0}
if len(sys.argv) > 2:
    G.update(json.load(open(sys.argv[2])))
DUCKED = {"music", "amb_exterior"}
stems = [s for s in G if os.path.exists(f"{D}/stems/{s}.wav")]
KEY_ONLY = os.environ.get("KEY_ONLY") == "1"

inputs = ["-i", f"{D}/vo.wav"] + sum([["-i", f"{D}/stems/{s}.wav"] for s in stems], [])


def graph(include_vo):
    f = ["[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,highpass=f=70,"
         "acompressor=threshold=0.2:ratio=1.8:attack=15:release=250:makeup=1.15,"
         f"asplit={1 + sum(s in DUCKED for s in stems)}[vo]" + "".join(f"[k{i}]" for i, s in enumerate(stems) if s in DUCKED)]
    labels = ["[vo]"] if include_vo else []
    if not include_vo:
        f.append("[vo]anullsink")
    for i, s in enumerate(stems, 1):
        chain = f"[{i}:a]aresample=48000,volume={G[s]}dB"
        if s in DUCKED:
            f.append(f"{chain}[p{i}]")
            f.append(f"[p{i}][k{i - 1}]sidechaincompress=threshold=0.02:ratio=9:attack=12:release=500:makeup=1[s{i}]")
        else:
            f.append(f"{chain}[s{i}]")
        labels.append(f"[s{i}]")
    f.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest[pre]")
    return ";".join(f)


def run(g, extra, out):
    return subprocess.run(["ffmpeg", "-hide_banner", "-y", *inputs, "-filter_complex", g + extra, *out], capture_output=True, text=True)


full = graph(True)
p = run(full, ";[pre]loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json[o]", ["-map", "[o]", "-f", "null", "-"])
m = json.loads(p.stderr[p.stderr.rfind("{"):p.stderr.rfind("}") + 1])
if KEY_ONLY:
    gain = -14.0 - float(m["input_i"])
    target = f"{D}/bed.wav"
    q = run(graph(False), f";[pre]volume={gain:.2f}dB,alimiter=limit=0.84:level=false,aresample=48000[o]",
            ["-map", "[o]", "-c:a", "pcm_s24le", target])
else:
    target = f"{D}/mix.wav"
    q = run(full, f";[pre]loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
                  f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
                  "aresample=48000[o]", ["-map", "[o]", "-c:a", "pcm_s24le", target])
if q.returncode:
    print(q.stderr[-2000:]); sys.exit(1)
chk = subprocess.run(["ffmpeg", "-hide_banner", "-i", target, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print(os.path.basename(target), "integrated", re.findall(r"I:\s+(-?[\d.]+) LUFS", chk)[-1], "LUFS; true peak", re.findall(r"Peak:\s+(-?[\d.]+) dBFS", chk)[-1], "dBFS")
