"""Generate the AVRON sound kit with ElevenLabs Sound Effects (brand v2, 2026-10-28).

The kit is generated ONCE and reused on every reel: that reuse is the sonic identity. Never regenerate per reel.
Spec: brand/sound/kit_v1.json (prompts, durations, prompt_influence). Rules: brand/BRAND.md §Sound.

  python3 scripts/sfx_kit.py --estimate            # list what would be generated and the credit estimate, no calls
  python3 scripts/sfx_kit.py --only ui_tap,sonic_logo
  python3 scripts/sfx_kit.py                       # all sounds, 4 takes each

Needs ELEVENLABS_API_KEY in the environment (the ElevenLabs MCP tool can't set prompt_influence or go past 5 s,
so the kit uses the API). Takes land in public/sfx/avron_kit_v1/takes/<name>_t<n>.mp3; after listening, copy the
chosen take to public/sfx/avron_kit_v1/<name>.wav (48 kHz) and record the choice in brand/sound/KIT_PICKS.md.
"""
import argparse
import json
import os
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPEC = ROOT / "brand/sound/kit_v1.json"
OUT = ROOT / "public/sfx/avron_kit_v1/takes"
URL = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
CREDITS_PER_SECOND = 40  # ElevenLabs capability overview, "40 credits per second when duration is specified"; check the plan page


def generate(sound: dict, take: int, key: str, model: str) -> pathlib.Path:
    body = {"text": sound["prompt"], "model_id": model, "duration_seconds": sound["duration_seconds"], "prompt_influence": sound["prompt_influence"]}
    if sound.get("loop"):
        body["loop"] = True
    req = urllib.request.Request(URL, data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=120) as r:
        audio = r.read()
    path = OUT / f"{sound['name']}_t{take}.mp3"
    path.write_bytes(audio)
    return path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--estimate", action="store_true", help="print the plan and credit estimate, make no calls")
    ap.add_argument("--only", default="", help="comma-separated sound names")
    ap.add_argument("--takes", type=int, default=None)
    a = ap.parse_args()

    spec = json.loads(SPEC.read_text())
    takes = a.takes or spec["takes"]
    sounds = [s for s in spec["sounds"] if not a.only or s["name"] in a.only.split(",")]
    seconds = sum(s["duration_seconds"] for s in sounds) * takes
    print(f"{len(sounds)} sounds × {takes} takes = {seconds:.1f} s of audio ≈ {seconds * CREDITS_PER_SECOND:,.0f} credits (estimate)")
    if a.estimate:
        for s in sounds:
            print(f"  {s['name']:<14} {s['duration_seconds']:>4} s  pi {s['prompt_influence']}  {'loop' if s.get('loop') else ''}")
        return

    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY is not set. Run with --estimate, or set the key (environment secret) and rerun.")
    OUT.mkdir(parents=True, exist_ok=True)
    for s in sounds:
        for n in range(1, takes + 1):
            print("wrote", generate(s, n, key, spec["model_id"]).relative_to(ROOT))


if __name__ == "__main__":
    main()
