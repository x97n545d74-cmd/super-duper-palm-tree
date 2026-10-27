"""Musk SpaceX-kids reel: cut the two Higgsfield anchor clips into script order.
Writes public/musk/anchor.mp4 (video+audio, continuous) and projects/2026-10-musk-spacex-kids/timeline.json
(beats with output start/end and caption words remapped to output time)."""
import json, subprocess
P = "projects/2026-10-musk-spacex-kids"
W = json.load(open(f"{P}/her_words.json"))
SRC = {"part1": "public/musk/her_part1.mp4", "part2": "public/musk/her_part2.mp4"}
# (beat, source, in, out); the extra "lagbhag" in part2 (7.34-7.64) is cut out of b3
EDL = [
    ("b1_hook", "part1", 0.00, 5.40),
    ("b2_kids", "part2", 0.00, 2.25),
    ("b3_price", "part2", 2.40, 5.85),
    ("b3_price", "part2", 6.00, 7.32),
    ("b3_price", "part2", 7.62, 9.70),
    ("b4_total", "part2", 9.85, 17.40),
    ("b5_networth", "part1", 5.45, 11.35),
    ("b6_cash", "part1", 11.40, 15.05),
    ("b7_trump", "part2", 17.60, 23.95),
    ("b8_why", "part1", 15.10, 17.70),
    ("b9_ai", "part2", 24.00, 29.05),
    ("b10_salary", "part1", 17.70, 23.90),
    ("b11_cta", "part1", 23.95, 29.00),
]
# spelling fixes for on-screen captions (ASR → script)
FIX = {"value": "worth", "pratishtit": "pratishat", "aaspaas": "aas-paas", "pas": "paas", "sawal": "sawaal", "asa": "aisa", "kyu": "kyun",
       "To": "Toh", "kamae": "kamai", "kaha": "kahan", "jawaab": "jawab", "hisa": "hissa", "her": "har", "Yani,": "Yaani,", "shayat": "shayad",
       "share,": "shares", "bachon": "bachchon", "neye": "naye", "Sarkavi": "sarkari", "kahe": "keh", "chalke": "chal ke"}
NUM = [("nine hundred four billion dollar", "$904 billion"), ("one hundred forty seven dollar", "$147"), ("seventy two million", "72 million"),
       ("Seventy two million", "72 million"), ("ten point six billion dollar.", "$10.6 billion"), ("one lakh crore rupaye.", "₹1 lakh crore")]

def fix_words(ws):
    out = []
    i = 0
    while i < len(ws):
        hit = None
        for phrase, rep in NUM:
            n = len(phrase.split())
            if " ".join(x["w"] for x in ws[i:i + n]).lower().rstrip(".,") == phrase.lower().rstrip(".,"):
                hit = (n, rep)
                break
        if hit:
            n, rep = hit
            out.append({"w": rep, "s": ws[i]["s"], "e": ws[i + n - 1]["e"], "tone": "gold"})
            i += n
            continue
        w = dict(ws[i]); w["w"] = FIX.get(w["w"], w["w"]); out.append(w); i += 1
    # merge "zyada" + "tar"; "chuke hai" → "chuke hain"
    m = []
    for w in out:
        if m and m[-1]["w"] == "zyada" and w["w"] == "tar":
            m[-1] = {**m[-1], "w": "zyada-tar", "e": w["e"]}
        elif m and m[-1]["w"] == "chuke" and w["w"] == "hai":
            m.append({**w, "w": "hain"})
        else:
            m.append(w)
    return [{**w, "w": w["w"].replace("lakh", "lakh")} for w in m]

t = 0.0
beats = {}
filters, labels = [], []
inputs = ["-i", SRC["part1"], "-i", SRC["part2"]]
for k, (beat, src, a, b) in enumerate(EDL):
    idx = 0 if src == "part1" else 1
    filters.append(f"[{idx}:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30,scale=720:1280[v{k}];[{idx}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.02,afade=t=out:st={b - a - 0.03:.3f}:d=0.03[a{k}]")
    labels.append(f"[v{k}][a{k}]")
    ws = [w for w in W[src] if w["s"] >= a - 0.05 and w["e"] <= b + 0.05]
    ws = [{**w, "s": round(w["s"] - a + t, 3), "e": round(min(w["e"], b) - a + t, 3)} for w in ws]
    bt = beats.setdefault(beat, {"id": beat, "start": round(t, 3), "words": []})
    bt["words"] += ws
    t += b - a
    bt["end"] = round(t, 3)
filters.append("".join(labels) + f"concat=n={len(EDL)}:v=1:a=1[v][a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-ar", "48000", "public/musk/anchor.mov"], check=True)
for b in beats.values():
    b["words"] = fix_words(b["words"])
json.dump({"duration": round(t, 3), "beats": list(beats.values())}, open(f"{P}/timeline.json", "w"), indent=1, ensure_ascii=False)
print("duration", round(t, 2))
for b in beats.values():
    print(b["id"], b["start"], b["end"], " ".join(w["w"] for w in b["words"]))
