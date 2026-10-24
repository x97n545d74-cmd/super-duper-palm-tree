"""Pull NSE's index snapshot and shape it for the AVRON site's Market page.

Usage: python3 tools/nse_snapshot.py <indices.json> <out.json>
<indices.json> is the site's data/indices.json (the 50-index directory).
The output is the body of the site's db document market/indices.
Source: NSE's public website API (not a licensed feed).
"""
import json, sys, urllib.request, http.cookiejar
from datetime import datetime, timezone

URL = "https://www.nseindia.com/api/allIndices"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"
# NSE renamed some indices since the directory's names were set
ALIASES = {"NIFTY QUALITY 30": "NIFTY100 QUALTY30"}


def fetch():
    jar = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    op.addheaders = [("User-Agent", UA), ("Accept", "application/json"), ("Referer", "https://www.nseindia.com/")]
    try:
        op.open("https://www.nseindia.com/", timeout=20).read()  # sets cookies; may 403, the API often still answers
    except Exception:
        pass
    return json.load(op.open(URL, timeout=30))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def build(directory, raw):
    by_sym = {r["indexSymbol"]: r for r in raw["data"]}
    rows, missing = [], []
    for d in directory["indices"]:
        r = by_sym.get(ALIASES.get(d["name"], d["name"]))
        if not r:
            missing.append(d["name"])
            continue
        rows.append({
            "name": d["name"], "group": d["group"], "nse_name": r["index"],
            "last": num(r["last"]), "change": num(r["variation"]), "pct": num(r["percentChange"]),
            "open": num(r["open"]), "high": num(r["high"]), "low": num(r["low"]), "prev_close": num(r["previousClose"]),
            "year_high": num(r["yearHigh"]), "year_low": num(r["yearLow"]),
            "pct_30d": num(r.get("perChange30d")), "pct_365d": num(r.get("perChange365d")),
            "pe": num(r.get("pe")), "pb": num(r.get("pb")), "dy": num(r.get("dy")),
            "advances": num(r.get("advances")), "declines": num(r.get("declines")),
        })
    return {
        "source": "NSE website (nseindia.com/api/allIndices), unofficial",
        "exchange_time": raw.get("timestamp"),  # IST, as NSE prints it
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "breadth": {k: raw.get(k) for k in ("advances", "declines", "unchanged")},
        "missing": missing,
        "indices": rows,
    }


if __name__ == "__main__":
    directory = json.load(open(sys.argv[1]))
    snap = build(directory, fetch())
    json.dump(snap, open(sys.argv[2], "w"), indent=1)
    print(f"{len(snap['indices'])} indices, NSE time {snap['exchange_time']}, missing {snap['missing']}")
