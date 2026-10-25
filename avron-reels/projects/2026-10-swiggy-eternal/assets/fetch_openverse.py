"""Search Openverse for commercially reusable, modifiable images and download candidates with licence metadata.
usage: fetch_openverse.py <slug> "<query>" [n]"""
import json, os, sys, time, urllib.parse, urllib.request
slug, q = sys.argv[1], sys.argv[2]; n = int(sys.argv[3]) if len(sys.argv) > 3 else 6
UA = {"User-Agent": "AVRONResearch/1.0 (educational finance video; licence-checked)"}
url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode({"q": q, "license_type": "commercial,modification", "page_size": 20, "mature": "false"})
d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40))
os.makedirs("candidates", exist_ok=True); got = 0
meta = json.load(open("candidates/meta.json")) if os.path.exists("candidates/meta.json") else {}
for r in d["results"]:
    if got >= n: break
    if (r.get("width") or 0) < 1000: continue
    fn = f"candidates/{slug}_{got}.jpg"
    try:
        req = urllib.request.Request(r["url"], headers=UA)
        open(fn, "wb").write(urllib.request.urlopen(req, timeout=40).read())
    except Exception as e:
        continue
    meta[fn] = {k: r.get(k) for k in ("title", "creator", "creator_url", "license", "license_version", "license_url", "foreign_landing_url", "url", "width", "height", "source")}
    meta[fn]["query"] = q; got += 1; time.sleep(0.4)
json.dump(meta, open("candidates/meta.json", "w"), indent=1)
print(f"{slug}: {got} of {d['result_count']} results")
