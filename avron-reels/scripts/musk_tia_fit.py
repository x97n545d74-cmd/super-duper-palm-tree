"""Fit the user's Tia VO to the existing Musk reel timeline (56.85 s): each sentence group is trimmed of long pauses,
then time-stretched (atempo) to the exact length of its beat, so visuals and the anchor clip stay where they are.
Writes public/musk/tia_fit.wav, rebuilds public/musk/anchor.mov (same video, Tia audio) and timeline.json captions."""
import json, subprocess
import numpy as np, soundfile as sf
P = "projects/2026-10-musk-spacex-kids"
ORIG = json.loads(subprocess.check_output(["git", "show", "HEAD:avron-reels/projects/2026-10-musk-spacex-kids/timeline.json"]))
W = json.load(open(f"{P}/tia_words.json"))
SR = 48000
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/musk/tia_vo.mp3", "-ac", "1", "-ar", str(SR), "/tmp/tia48.wav"], check=True)
tia, _ = sf.read("/tmp/tia48.wav", dtype="float32")
# Tia sentence groups, aligned to the reel's beats (first word of each beat)
TSTART = {"b1_hook": 0.0, "b2_kids": 6.5, "b3_price": 9.6, "b4_total": 18.4, "b5_networth": 28.75, "b6_cash": 36.1,
          "b7_trump": 41.0, "b8_why": 49.75, "b9_ai": 53.0, "b10_salary": 58.78, "b11_cta": 66.4}
ids = list(TSTART)
FIX = {"Yani,": "Yaani,", "Gift.": "gift.", "Lagbhag": "lagbhag", "aspas": "aas-paas", "nahin": "nahi", "pass": "paas", "shaaya": "shayad",
       "thru": "through", "nae": "naye", "Pr": "Par", "sawal": "sawaal", "kyon": "kyun", "kya": "keh", "zyadatar": "zyada-tar", "To": "Toh",
       "kamae": "kamai", "jawab,": "jawab:", "lakta": "lagta", "zamane": "zamaane", "me": "mein"}
NUM = [("nine hundred four billion dollar", "$904 billion"), ("one hundred forty seven dollar", "$147"), ("seventy two million", "72 million"),
       ("ten point six billion dollar.", "$10.6 billion"), ("ek lakh crore rupaye.", "₹1 lakh crore")]
norm = lambda s: s.lower().rstrip(".,?")

def fix_words(ws):
    out, i = [], 0
    while i < len(ws):
        for phrase, rep in NUM:
            n = len(phrase.split())
            if norm(" ".join(x["w"] for x in ws[i:i + n])) == norm(phrase):
                out.append({"w": rep, "s": ws[i]["s"], "e": ws[i + n - 1]["e"], "tone": "gold"}); i += n; break
        else:
            w = dict(ws[i]); w["w"] = FIX.get(w["w"], w["w"]); out.append(w); i += 1
    return out

out_audio, beats = [], []
for k, bid in enumerate(ids):
    ob = next(b for b in ORIG["beats"] if b["id"] == bid)
    a = TSTART[bid]; b = TSTART[ids[k + 1]] if k + 1 < len(ids) else 73.25
    ws = [w for w in W if a <= w["s"] < b]
    # keep speech, squeeze pauses longer than 0.3 s down to 0.2 s
    keep, t0 = [], max(a, ws[0]["s"] - 0.05)
    for w1, w2 in zip(ws, ws[1:]):
        if w2["s"] - w1["e"] > 0.3:
            keep.append((t0, w1["e"] + 0.1)); t0 = w2["s"] - 0.1
    keep.append((t0, min(b, ws[-1]["e"] + 0.12)))
    seg = np.concatenate([tia[int(s * SR):int(e * SR)] for s, e in keep])
    # map original word times into the squeezed segment
    def squeeze(t):
        acc = 0.0
        for s, e in keep:
            if t <= e: return acc + max(0.0, t - s)
            acc += e - s
        return acc
    target = ob["end"] - ob["start"] - 0.08
    factor = (len(seg) / SR) / target
    sf.write("/tmp/seg.wav", seg, SR)
    chain = []
    f = factor
    while f > 2.0: chain.append("atempo=2.0"); f /= 2.0
    chain.append(f"atempo={max(0.5, f):.5f}")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/seg.wav", "-af", ",".join(chain), "-ar", str(SR), "/tmp/seg_fit.wav"], check=True)
    fit, _ = sf.read("/tmp/seg_fit.wav", dtype="float32")
    n = int((ob["end"] - ob["start"]) * SR)
    fit = np.pad(fit, (int(0.04 * SR), 0))[:n]
    fit = np.pad(fit, (0, n - len(fit)))
    out_audio.append(fit)
    mw = [{**w, "s": round(ob["start"] + 0.04 + squeeze(w["s"]) / factor, 3), "e": round(ob["start"] + 0.04 + squeeze(w["e"]) / factor, 3)} for w in ws]
    beats.append({"id": bid, "start": ob["start"], "end": ob["end"], "words": fix_words(mw)})
    print(f"{bid}: tia {len(seg) / SR:.2f}s -> {target:.2f}s  x{factor:.2f}")
audio = np.concatenate(out_audio)
sf.write("public/musk/tia_fit.wav", audio, SR)
json.dump({"duration": ORIG["duration"], "beats": beats}, open(f"{P}/timeline.json", "w"), indent=1, ensure_ascii=False)
# same anchor video (from git), Tia audio
subprocess.run(["git", "show", "HEAD:avron-reels/public/musk/anchor.mov"], stdout=open("/tmp/anchor_orig.mov", "wb"), check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "/tmp/anchor_orig.mov", "-i", "public/musk/tia_fit.wav", "-map", "0:v", "-map", "1:a",
                "-c:v", "copy", "-c:a", "pcm_s16le", "-shortest", "public/musk/anchor.mov"], check=True)
print("total", round(len(audio) / SR, 2))
