"""Automated QC for a rendered reel.

usage: qc.py <video.mp4> <project_dir> <out_dir>
Checks: container/stream specs, duration vs timeline, black frames, frozen
segments, loudness/true peak, per-second motion energy, ASR read-back of the
narration vs the script, and contact sheets at every beat boundary.
Results -> <out_dir>/qc_report.json (+ sheets). Diagnostics, not a substitute for review.
"""
import difflib, json, re, subprocess, sys
import numpy as np

video, proj, out = sys.argv[1], sys.argv[2], sys.argv[3]
subprocess.run(["mkdir", "-p", out], check=True)
tl = json.load(open(f"{proj}/timeline.json"))
R = {"file": video, "checks": {}}


def run(args):
    p = subprocess.run(args, capture_output=True, text=True)
    return p.stderr + p.stdout


def check(name, ok, detail):
    R["checks"][name] = {"pass": bool(ok), "detail": detail}


# 1. specs
pr = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", video],
                               capture_output=True, text=True, check=True).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), None)
fps = eval(v["r_frame_rate"])
dur = float(pr["format"]["duration"])
R["specs"] = {"width": v["width"], "height": v["height"], "fps": fps, "vcodec": v["codec_name"], "profile": v.get("profile"),
              "pix_fmt": v["pix_fmt"], "color_space": v.get("color_space"), "duration": dur,
              "bitrate_mbps": round(int(pr["format"]["bit_rate"]) / 1e6, 2),
              "acodec": a and a["codec_name"], "sample_rate": a and a["sample_rate"], "channels": a and a["channels"]}
check("dimensions_1080x1920", (v["width"], v["height"]) == (1080, 1920), f'{v["width"]}x{v["height"]}')
check("fps_30", abs(fps - 30) < 0.01, fps)
check("h264_yuv420p", v["codec_name"] == "h264" and v["pix_fmt"] == "yuv420p", f'{v["codec_name"]} {v["pix_fmt"]}')
check("aac_audio", a is not None and a["codec_name"] == "aac", a and a["codec_name"])
check("duration_matches_timeline", abs(dur - tl["duration"]) < 0.15, f"{dur:.2f}s vs {tl['duration']}s")

# 2. black frames / frozen segments
bd = run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "blackdetect=d=0.15:pix_th=0.06", "-an", "-f", "null", "-"])
blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", bd)
check("no_black_segments", not blacks, blacks)
fd = run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "freezedetect=n=0.0015:d=1.2", "-an", "-f", "null", "-"])
freezes = re.findall(r"freeze_start: ([\d.]+)", fd)
check("no_frozen_segments_over_1.2s", not freezes, freezes)

# 3. loudness
lo = run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"])
I = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", lo)[-1])
TP = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lo)[-1])
R["loudness"] = {"integrated_lufs": I, "true_peak_dbfs": TP}
check("loudness_-14_LUFS_pm1", abs(I + 14) <= 1.0, I)
check("true_peak_below_-1dB", TP <= -1.0, TP)

# 4. motion energy per second (mean abs luma diff between frames 1/6 s apart, 270x480)
W, H = 270, 480
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps=6,scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                     capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
diffs = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
per_sec = [round(float(diffs[i:i + 6].mean()), 2) for i in range(0, len(diffs), 6)]
R["motion_per_second"] = per_sec
low = [i for i, m in enumerate(per_sec) if m < 0.35]
check("no_near_static_seconds", not low, {"seconds_below_0.35": low})

# 5. ASR read-back vs script
try:
    from faster_whisper import WhisperModel
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"],
                         capture_output=True, check=True).stdout
    segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(np.frombuffer(pcm, np.float32), beam_size=5)
    heard = " ".join(s.text for s in segs)
    ref = " ".join(w["w"] for b in tl["beats"] for w in b["words"])
    norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower()).split()
    ratio = difflib.SequenceMatcher(None, norm(ref), norm(heard)).ratio()
    R["asr"] = {"similarity": round(ratio, 3), "heard": heard.strip()}
    check("narration_intelligible_in_mix", ratio > 0.9, round(ratio, 3))
except Exception as e:  # noqa
    R["asr"] = {"error": str(e)}

# 6. contact sheets at beat boundaries (-0.25s, +0.35s) and every 2s
times = sorted({round(x, 2) for b in tl["beats"][1:] for x in (b["start"] - 0.25, b["start"] + 0.35)})
for name, ts in (("transitions", times), ("timeline", [round(x, 2) for x in np.arange(0.5, dur, 2.0)])):
    files = []
    for i, s in enumerate(ts):
        f = f"{out}/{name}_{i:02d}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-i", video, "-frames:v", "1", "-vf", "scale=270:-1", f], check=True)
        files.append(f)
    subprocess.run(["montage", "-label", "%t", *files, "-tile", "10x", "-geometry", "+3+3", "-background", "#222", "-fill", "white",
                    f"{out}/sheet_{name}.jpg"], check=True)
    subprocess.run(["rm", *files])
R["sheets"] = [f"{out}/sheet_transitions.jpg", f"{out}/sheet_timeline.jpg"]

R["summary"] = {"passed": sum(c["pass"] for c in R["checks"].values()), "total": len(R["checks"])}
json.dump(R, open(f"{out}/qc_report.json", "w"), indent=1)
for k, c in R["checks"].items():
    print(("PASS " if c["pass"] else "FAIL ") + k, "→", c["detail"])
print("specs", R["specs"])
print("ASR similarity", R.get("asr", {}).get("similarity"))
