#!/usr/bin/env python3
"""AVRON x ComfyUI batch runner (stdlib only — runs on your GPU machine).

Stage 1  keyframes : Flux.1-schnell text-to-image for every shot   -> out/keyframes/<id>.png
Stage 2  motion    : Wan 2.2 image-to-video from each keyframe     -> out/clips/<id>.mp4 (+ frames)

usage:
  python comfy_batch.py keyframes  --server http://127.0.0.1:8188 [--only V01,V04]
  python comfy_batch.py videos     --server http://127.0.0.1:8188 [--only V01] [--interp30]
  python comfy_batch.py all        --server http://127.0.0.1:8188
Review the keyframes before running `videos` — re-run a single shot with a new --seed-offset if needed.
Requires: a running ComfyUI with the models from README.md; ffmpeg on PATH for clip assembly.
"""
import argparse, json, os, shutil, subprocess, sys, time, urllib.parse, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")


def load(p):
    with open(os.path.join(HERE, p)) as f:
        return json.load(f)


def fill(template, values):
    """Deep-copy a workflow and substitute "{{KEY}}" placeholders (typed: ints stay ints)."""
    def sub(v):
        if isinstance(v, str) and v.startswith("{{") and v.endswith("}}"):
            return values[v[2:-2]]
        if isinstance(v, str):
            for k, x in values.items():
                v = v.replace("{{" + k + "}}", str(x))
            return v
        if isinstance(v, list):
            return [sub(i) for i in v]
        if isinstance(v, dict):
            return {k: sub(i) for k, i in v.items()}
        return v
    return sub(template)


class Comfy:
    def __init__(self, server):
        self.server = server.rstrip("/")
        self.client_id = str(uuid.uuid4())

    def _req(self, path, data=None, headers=None):
        req = urllib.request.Request(self.server + path, data=data, headers=headers or {})
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()

    def queue(self, workflow):
        body = json.dumps({"prompt": workflow, "client_id": self.client_id}).encode()
        try:
            res = json.loads(self._req("/prompt", body, {"Content-Type": "application/json"}))
        except urllib.error.HTTPError as e:  # validation errors come back as 400 with details
            sys.exit(f"ComfyUI rejected the workflow:\n{e.read().decode()[:3000]}")
        return res["prompt_id"]

    def wait(self, pid, poll=3):
        t0 = time.time()
        while True:
            hist = json.loads(self._req(f"/history/{pid}"))
            if pid in hist:
                st = hist[pid].get("status", {})
                if st.get("status_str") == "error":
                    sys.exit(f"Generation failed: {json.dumps(st)[:2000]}")
                return hist[pid]["outputs"], time.time() - t0
            time.sleep(poll)

    def download(self, img, dest):
        q = urllib.parse.urlencode({"filename": img["filename"], "subfolder": img.get("subfolder", ""), "type": img.get("type", "output")})
        with open(dest, "wb") as f:
            f.write(self._req(f"/view?{q}"))

    def upload(self, path):
        boundary = uuid.uuid4().hex
        name = os.path.basename(path)
        with open(path, "rb") as f:
            payload = f.read()
        body = (f"--{boundary}\r\nContent-Disposition: form-data; name=\"image\"; filename=\"{name}\"\r\n"
                f"Content-Type: image/png\r\n\r\n").encode() + payload + \
               f"\r\n--{boundary}\r\nContent-Disposition: form-data; name=\"overwrite\"\r\n\r\ntrue\r\n--{boundary}--\r\n".encode()
        res = json.loads(self._req("/upload/image", body, {"Content-Type": f"multipart/form-data; boundary={boundary}"}))
        return res["name"] if not res.get("subfolder") else f'{res["subfolder"]}/{res["name"]}'


def images_of(outputs):
    for node in outputs.values():
        for img in node.get("images", []):
            yield img


def run_keyframes(c, shots, only, seed_offset):
    wf = load("workflows/flux_schnell_t2i_api.json")
    os.makedirs(f"{OUT}/keyframes", exist_ok=True)
    for s in shots["shots"]:
        if only and s["id"].split("_")[0] not in only:
            continue
        prompt = f'{s["image"]}, {shots["style"]}'
        w = fill(wf, {"PROMPT": prompt, "W": shots["keyframe"]["width"], "H": shots["keyframe"]["height"],
                      "SEED": s["seed"] + seed_offset, "PREFIX": f'avron/{s["id"]}_key'})
        pid = c.queue(w)
        outputs, dt = c.wait(pid)
        img = next(images_of(outputs))
        dest = f'{OUT}/keyframes/{s["id"]}.png'
        c.download(img, dest)
        print(f"[keyframe] {s['id']}  {dt:5.1f}s  -> {dest}")


def run_videos(c, shots, only, seed_offset, interp30):
    wf = load("workflows/wan22_i2v_api.json")
    v = shots["video"]
    os.makedirs(f"{OUT}/clips", exist_ok=True)
    for s in shots["shots"]:
        if only and s["id"].split("_")[0] not in only:
            continue
        key = f'{OUT}/keyframes/{s["id"]}.png'
        if not os.path.exists(key):
            print(f"[skip] {s['id']}: no keyframe yet (run `keyframes` first)")
            continue
        start_name = c.upload(key)
        w = fill(wf, {"PROMPT": f'{s["motion"]}. {s["image"]}', "NEGATIVE": shots["negative"], "START_IMAGE": start_name,
                      "W": v["width"], "H": v["height"], "FRAMES": v["frames"], "SEED": s["seed"] + seed_offset,
                      "PREFIX": f'avron/{s["id"]}_f'})
        pid = c.queue(w)
        outputs, dt = c.wait(pid, poll=5)
        fdir = f'{OUT}/clips/{s["id"]}_frames'
        shutil.rmtree(fdir, ignore_errors=True)
        os.makedirs(fdir)
        frames = sorted(images_of(outputs), key=lambda i: i["filename"])
        for n, img in enumerate(frames):
            c.download(img, f"{fdir}/{n:04d}.png")
        mp4 = f'{OUT}/clips/{s["id"]}.mp4'
        vf = "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1," if interp30 else ""
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(v["fps"]), "-i", f"{fdir}/%04d.png",
                        "-vf", f"{vf}format=yuv420p", "-c:v", "libx264", "-crf", "14", "-preset", "slow", mp4], check=True)
        print(f"[video]    {s['id']}  {dt:5.1f}s  {len(frames)} frames -> {mp4}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("stage", choices=["keyframes", "videos", "all"])
    ap.add_argument("--server", default="http://127.0.0.1:8188")
    ap.add_argument("--shots", default="shots/viviana_shots.json")
    ap.add_argument("--only", default="", help="comma list of shot prefixes, e.g. V01,V04")
    ap.add_argument("--seed-offset", type=int, default=0, help="change to get a different take")
    ap.add_argument("--interp30", action="store_true", help="motion-interpolate 16 -> 30 fps (ffmpeg)")
    a = ap.parse_args()
    shots = load(a.shots)
    only = {x.strip() for x in a.only.split(",") if x.strip()}
    c = Comfy(a.server)
    if a.stage in ("keyframes", "all"):
        run_keyframes(c, shots, only, a.seed_offset)
    if a.stage in ("videos", "all"):
        run_videos(c, shots, only, a.seed_offset, a.interp30)


if __name__ == "__main__":
    main()
