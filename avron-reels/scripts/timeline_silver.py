"""Time the silver film to the user's recorded narration.

The narration is one ElevenLabs file spoken from ELEVENLABS_VO_SCRIPT.md, whose 42 lines are the beats in
<project>/narration.json. faster-whisper word timestamps (<project>/vo/vo_raw_words.json, Hindi mode) are matched
to the beat text to find where each line starts; each start is then snapped to the end of the silence before it.

Film layout: an opening pad (the coin drops in silence), then each chapter keeps its own recording untouched,
with a chapter card (CARD s) and a breath inserted before every chapter after the hook, a breath before the close,
and the end card after the last line. Named cues (the moment a key word is spoken) let shots land on the words.

Writes src/projects/silver/film/beats.json and <project>/vo/vo.wav (48 kHz, the narration placed on the film clock).
usage: timeline_silver.py <project_dir> <film_dir>
"""
import difflib, json, re, subprocess, sys
import numpy as np
import soundfile as sf

proj, film = sys.argv[1], sys.argv[2]
SR = 48000
OPEN_PAD, CARD, BREATH, CLOSE_BREATH, END_CARD = 2.6, 3.0, 0.5, 1.0, 6.0
SECTIONS = ["hook", "shak", "gupta", "jan", "etf", "pile", "solar", "close"]
KW = {
    "hook_0": {"half": ["आधे"]}, "hook_1": {"tomato": ["टमाटर"]}, "hook_2": {"six": ["छठा"]},
    "shak_0": {"asli": ["असली"]}, "shak_1": {"warsh": ["warsh", "वॉर्श", "वार्ष", "वार्श"], "dollar": ["dollar", "डॉलर"]},
    "shak_2": {"gold": ["सोना"], "silver": ["चांदी"]}, "shak_3": {"coins": ["coins", "कॉइन्स", "कॉइंस", "कोइन्स"]},
    "gupta_0": {"dhanteras": ["धनतेरस"], "coin": ["सिक्का"], "app": ["app", "ऐप", "एप"]},
    "gupta_1": {"telegram": ["telegram", "टेलीग्राम"], "mcx": ["mcx", "एमसीएक्स"]},
    "gupta_2": {"margin": ["margin", "मार्जिन"], "udhaar": ["उधार"]},
    "gupta_3": {"seventy": ["सत्तर"], "slept": ["सो"]}, "gupta_4": {"ten": ["दस"], "three": ["तीन"], "two": ["दो"]},
    "gupta_5": {"call": ["call", "कॉल"]},
    "jan_0": {"record": ["record", "रिकॉर्ड"], "dollar": ["dollar", "डॉलर"]}, "jan_1": {"twice": ["दो"]},
    "jan_2": {"drop": ["31", "इकतीस"], "friday": ["friday", "फ्राइडे"]}, "jan_4": {"thursday": ["thursday", "थर्सडे"]},
    "etf_1": {"crore": ["करोड़"], "premium": ["12", "बारह"]}, "etf_2": {"below": ["नीचे"]},
    "pile_2": {"fd": ["fd", "एफडी"]}, "pile_4": {"n91": ["इक्यानवे"], "n30": ["तीस"]}, "pile_5": {"recycling": ["recycling", "रीसाइक्लिंग"]},
    "solar_1": {"solar": ["solar", "सोलर"]}, "solar_3": {"thirty": ["30", "तीस"], "ten": ["10", "दस"]},
    "solar_4": {"seventeen": ["17", "सत्रह"]}, "solar_5": {"surplus": ["surplus", "सरप्लस"]},
    "close_0": {"price": ["दाम"]}, "close_1": {"gupta": ["गुप्ता"]}, "close_2": {"questions": ["सवाल"]}, "close_3": {"second": ["दूसरा"]},
}


def norm(s):
    s = s.replace("़", "").replace("ँ", "ं").lower()
    return re.sub(r"[^\w]", "", s)


beats = json.load(open(f"{proj}/narration.json"))["beats"]
words = json.load(open(f"{proj}/vo/vo_raw_words.json"))["words"]
raw = f"{proj}/vo/vo_raw.mp3"
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", raw, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
y = np.frombuffer(pcm, np.float32).copy()
D = len(y) / SR

# silences (start, end) in the raw file
log = subprocess.run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "silencedetect=noise=-40dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
ss = [float(m) for m in re.findall(r"silence_start: ([\d.]+)", log)]
se = [float(m) for m in re.findall(r"silence_end: ([\d.]+)", log)]
SIL = list(zip(ss, se))

# align reference tokens to recognised words
ref, owner = [], []
for i, bt in enumerate(beats):
    for tok in bt["text"].split():
        n = norm(tok)
        if n:
            ref.append(n); owner.append(i)
hyp = [norm(w["w"]) for w in words]
sm = difflib.SequenceMatcher(None, ref, hyp, autojunk=False)
r2h = {}
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        r2h[blk.a + k] = blk.b + k

starts = []
for i in range(len(beats)):
    idx = [k for k in range(len(ref)) if owner[k] == i]
    hit = next(((k, r2h[k]) for k in idx if k in r2h), None)
    if hit is None:
        starts.append(None); continue
    k, h = hit
    t = words[h]["a"]
    # tokens of this line said before the first matched one: back off by a rough per-token time
    t -= 0.32 * (k - idx[0])
    starts.append(t)
# fill any gaps by interpolation on character counts
for i, s in enumerate(starts):
    if s is None:
        prev = next(j for j in range(i - 1, -1, -1) if starts[j] is not None)
        nxt = next((j for j in range(i + 1, len(starts)) if starts[j] is not None), None)
        b = starts[nxt] if nxt is not None else D
        starts[i] = starts[prev] + (b - starts[prev]) * (i - prev) / ((nxt or len(starts)) - prev)
        print("interpolated", beats[i]["id"])
starts[0] = min(starts[0], words[0]["a"])

# snap each start to the end of the silence just before it
def snap(t):
    cands = [e for s, e in SIL if e <= t + 0.35 and e >= t - 1.6]
    return max(cands) - 0.06 if cands else t - 0.05
starts = [max(0.0, snap(t)) for t in starts]
speech_end = max(w["b"] for w in words)
ends = []
for i in range(len(beats)):
    nxt = starts[i + 1] if i + 1 < len(beats) else speech_end + 0.4
    # end of the speech before the next line = start of the silence that precedes it
    inside = [s for s, e in SIL if starts[i] < s < nxt]
    ends.append(max(inside) if inside and nxt - max(inside) < 2.5 else nxt)

# film clock: offsets per section
first = {s: next(i for i, bt in enumerate(beats) if bt["section"] == s) for s in SECTIONS}
off, cards, o = {}, {}, OPEN_PAD
for s in SECTIONS:
    if s == "close":
        o += CLOSE_BREATH
    elif s != "hook":
        cards[s] = starts[first[s]] + o + BREATH * 0.5
        o += CARD + BREATH
    off[s] = o

out = []
for i, bt in enumerate(beats):
    s = bt["section"]
    a, z = starts[i] + off[s], ends[i] + off[s]
    cues = {}
    for name, alts in KW.get(bt["id"], {}).items():
        an = [norm(x) for x in alts]
        for w in words:
            if starts[i] - 0.2 <= w["a"] <= ends[i] + 0.2:
                n = norm(w["w"])
                if n and any(n == x or (len(x) > 2 and difflib.SequenceMatcher(None, n, x).ratio() > 0.78) for x in an):
                    cues[name] = round(w["a"] + off[s], 3)
                    break
        if name not in cues:
            print("cue not found", bt["id"], name)
    out.append({**bt, "start": round(a, 3), "end": round(z, 3), "cues": cues, "src": {"a": round(starts[i], 3), "b": round(ends[i], 3)}})

dur = out[-1]["end"] + END_CARD
# narration on the film clock: each section's recording is moved by its offset, untouched inside
vo = np.zeros(int(dur * SR) + SR, np.float32)
for k, s in enumerate(SECTIONS):
    i0 = first[s]
    a = starts[i0]
    z = starts[first[SECTIONS[k + 1]]] if k + 1 < len(SECTIONS) else D
    seg = y[int(a * SR): int(z * SR)].copy()
    f = int(0.01 * SR)
    seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    p = int((a + off[s]) * SR)
    vo[p: p + len(seg)] += seg
sf.write(f"{proj}/vo/vo.wav", vo[: int(dur * SR)], SR, subtype="PCM_24")
json.dump({"duration": round(dur, 3), "cards": {k: round(v, 3) for k, v in cards.items()}, "offsets": off, "beats": out},
          open(f"{film}/beats.json", "w"), ensure_ascii=False, indent=1)
print(f"{len(out)} beats · film {dur:.1f} s · raw {D:.1f} s")
for o_ in out:
    print(f'{o_["id"]:9s} {o_["start"]:7.2f} {o_["end"]:7.2f}  {o_["text"][:40]}')
