#!/usr/bin/env python3
"""Generate the Red Bull reel's clips with the Runway API (Gen-4).

The API key is never read here: the session's network proxy adds the
Authorization header for api.dev.runwayml.com (saved as a network secret).

  python3 scripts/runway_gen.py --estimate          # cost only, no calls
  python3 scripts/runway_gen.py --only V1 V4        # some shots
  python3 scripts/runway_gen.py                      # everything, 2 takes each

Image shots start from the user's photos. Text shots get a Gen-4 still first,
then that still is animated. Outputs go to projects/2026-11-redbull/clips/.
"""
import argparse, base64, json, pathlib, sys, time, urllib.request

API = "https://api.dev.runwayml.com/v1"
VERSION = "2024-11-06"
ROOT = pathlib.Path(__file__).resolve().parents[1] / "projects/2026-11-redbull"
IMG = ROOT / "graphics/img"
OUT = ROOT / "clips"
# Credit prices (Runway API, $0.01 per credit). Check against the live pricing page before a big run.
CR_VIDEO_PER_S = 5      # gen4_turbo
CR_IMAGE = 8            # gen4_image at 1080p

TAIL = " Photorealistic, cinematic, natural motion, 35mm film grain, no on-screen text, no logos."
SHOTS = {
  "V1": ("img", "boardroom.jpg", 10, "Night boardroom high above a city. The wall TV switches on and plays a bright generic commercial, its light flickering across the glossy floor and chair backs. City lights twinkle, faint rain streaks run down the windows. Slow dolly-in toward the screen. No people."),
  "V2": ("img", "production_room.jpg", 10, "Busy live-sports broadcast prep room. The crew member in the cap walks across frame carrying a cable, an operator types at the desk, a flight case lid is shut, monitors flicker with blurred action footage. Handheld documentary camera slowly pushing forward."),
  "V3": ("img", "neon_chart.jpg", 5, "The glowing white neon arrow chart flickers on like a real neon sign, tubes buzz and stabilise, soft bloom on the black wall, a few sparks at the base of the tallest arrow. Locked-off camera, slow push in."),
  "V4": ("img", "cliff_jump.jpg", 10, "The rope jumper swings out over the misty canyon, rope uncoiling behind him, wind moving his jacket, mist drifting through the valley, camera slowly tracking with him. Realistic body physics."),
  "T1": ("txt", None, 5, "Extreme close-up of a TV broadcast control panel at night, a hand presses a red ON AIR button, it lights up, reflections in the glossy surface, shallow depth of field."),
  "T2": ("txt", None, 10, "A giant stadium filling with people at dusk, floodlights snapping on one by one, wide aerial drone shot slowly orbiting."),
  "T3": ("txt", None, 5, "Generic open-wheel race car with plain matte black bodywork and no sponsor decals launching off the start line at night, tyre smoke, sparks under the floor, low camera at track level, motion blur."),
  "T4": ("txt", None, 5, "Camera operator in the foreground filming a mountain biker jumping a canyon gap at sunset, rider small in the distance, telephoto."),
  "T5": ("txt", None, 5, "A huge translucent helium research balloon being filled at dawn on a desert launch pad, crew in silhouette, the balloon slowly rising and towering over them."),
  "T6": ("txt", None, 10, "View from the stratosphere at 39 km: thin blue atmosphere line curving over the Earth, black sky, sun flaring on the horizon, a small pressurised capsule hanging in the foreground with its door closed, nobody visible, very slow pull back."),
  "T7": ("txt", None, 5, "Dark room full of people watching a live stream on phones and laptops, faces lit only by the screens, all leaning in at the same moment, shot from behind, shallow depth of field, no readable screens."),
  "T8": ("txt", None, 5, "A stack of gold coins slowly toppling on a dark marble desk, coins rolling, slow motion, single hard light, macro."),
  "T9a": ("txt", None, 5, "Wingsuit flyer skimming a jagged alpine ridge, helmet camera point of view, extreme speed."),
  "T9b": ("txt", None, 5, "Cliff diver mid-dive above turquoise water, rocky coastline, slow motion."),
  "T9c": ("txt", None, 5, "Skateboarder launching off a mega ramp at sunset, low angle."),
  "T10": ("txt", None, 10, "A wall of broadcast monitors in a dark media control room switching on one by one, each showing blurred action sports, an operator silhouette in the foreground, slow truck left."),
  "T11": ("txt", None, 5, "Chequered flag waving in slow motion against stadium lights at night, cloth texture visible."),
}

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
        headers={"Content-Type": "application/json", "X-Runway-Version": VERSION, "Authorization": "Bearer proxy-injects-this"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r: return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Runway {e.code} on {path}: {e.read().decode()[:400]}")

def wait(task_id):
    while True:
        t = call("GET", f"/tasks/{task_id}")
        if t["status"] == "SUCCEEDED": return t["output"]
        if t["status"] in ("FAILED", "CANCELLED"): sys.exit(f"task {task_id} {t['status']}: {t.get('failure')}")
        time.sleep(6)

def fetch(url, dest):
    with urllib.request.urlopen(url, timeout=300) as r: dest.write_bytes(r.read())

def estimate(names, takes):
    cr = sum(SHOTS[n][2] * CR_VIDEO_PER_S * takes + (CR_IMAGE * takes if SHOTS[n][0] == "txt" else 0) for n in names)
    return cr, cr / 100

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--only", nargs="*"); ap.add_argument("--takes", type=int, default=2); ap.add_argument("--estimate", action="store_true")
    a = ap.parse_args(); names = a.only or list(SHOTS)
    cr, usd = estimate(names, a.takes); print(f"{len(names)} shots × {a.takes} takes ≈ {cr} credits ≈ ${usd:.2f} (estimate)")
    if a.estimate: return
    OUT.mkdir(parents=True, exist_ok=True)
    for n in names:
        kind, img, dur, prompt = SHOTS[n]
        for k in range(1, a.takes + 1):
            dest = OUT / f"{n}_take{k}.mp4"
            if dest.exists(): print("skip", dest.name); continue
            if kind == "img":
                uri = "data:image/jpeg;base64," + base64.b64encode((IMG / img).read_bytes()).decode()
            else:
                still = OUT / f"{n}_still{k}.png"
                if not still.exists():
                    out = wait(call("POST", "/text_to_image", {"model": "gen4_image", "promptText": prompt + TAIL, "ratio": "1080:1920"})["id"])
                    fetch(out[0], still)
                uri = "data:image/png;base64," + base64.b64encode(still.read_bytes()).decode()
            task = call("POST", "/image_to_video", {"model": "gen4_turbo", "promptImage": uri, "promptText": prompt + TAIL, "ratio": "720:1280", "duration": dur, "seed": 1000 + k})
            fetch(wait(task["id"])[0], dest); print("saved", dest.name)

if __name__ == "__main__":
    main()
