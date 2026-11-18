#!/usr/bin/env python3
"""The live news lane for the AVRON website. Every few minutes it reads the business and market news
feeds, NSE's announcements and the X desk's posts, and writes live.json: the newest headlines first,
one entry per story, each linking to its source. No model is involved, so it is fast and costs nothing.

  python3 avron-radar/live.py <state dir>     one round; reads and writes <state dir>/live.json

Only headlines and links are published (not article text). Tips, broker calls, live blogs and
off-topic items (sport, film, horoscopes) are filtered out; routine exchange paperwork is skipped.
"""
import concurrent.futures
import datetime
import hashlib
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import brain    # noqa: E402
import decide   # noqa: E402
import public   # noqa: E402
import radar    # noqa: E402

HERE = pathlib.Path(__file__).resolve().parent
VERSION = 1
KEEP_HOURS = 24
MAX_ITEMS = 200
SAME_STORY_HOURS = 12
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
NSE_FEED = "NSE announcements"

JUNK = re.compile(r"\b(horoscope|rashifal|astrolog\w*|cricket|ipl|world cup|football|bollywood|box office|celebrit\w*|"
                  r"web ?stor(y|ies)|in pics|photos?|gallery|video|watch|recipe|weather|quiz|wordle|crossword|"
                  r"live (updates?|blog)|market live|stock market live|live:|liveblog)\b", re.I)
TIPS = re.compile(r"\b(buy call|sell call|buy rating|sell rating|buy now|buy on dips?|accumulate rating|rating: (buy|sell)|"
                  r"target price|price target|stocks? to (buy|watch|sell)|shares? to (buy|sell)|top picks?|multibaggers?|"
                  r"should you (buy|sell)|buy or sell|technical picks?|trading ideas?|stock recommendations?|stocks? that could|"
                  r"brokerages? (recommend|suggest)|picks? for (today|tomorrow|the week))\b", re.I)


def now_utc():
    return datetime.datetime.now(datetime.timezone.utc)


def iso(dt):
    return dt.astimezone(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch(url, cache, timeout=20):
    """Conditional GET: returns the body, or None when the server says nothing changed (304)."""
    h = {"User-Agent": radar.BROWSER_UA, "Accept": "*/*"}
    c = cache.get(url) or {}
    if c.get("etag"):
        h["If-None-Match"] = c["etag"]
    if c.get("modified"):
        h["If-Modified-Since"] = c["modified"]
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=timeout) as r:
            cache[url] = {"etag": r.headers.get("ETag"), "modified": r.headers.get("Last-Modified")}
            return r.read()
    except urllib.error.HTTPError as e:
        if e.code == 304:
            return None
        raise


def sources(cfg):
    """(name, kind, url) for every source the live lane reads."""
    out = [(f["name"], "nse" if f["platform"] == "nse" else "news", f["url"]) for f in cfg.get("feeds") or []
           if f["platform"] == "news" or f["name"] == NSE_FEED]
    m = cfg.get("x_merger") or {}
    if m.get("queue_url") and m.get("posted_url"):
        out.append(("AVRON on X", "x", m["queue_url"]))
    return out


def read_all(cfg, cache):
    """Fetch every source side by side. Returns (raw rows, sources ok, sources total)."""
    srcs = sources(cfg)
    m = cfg.get("x_merger") or {}

    def one(src):
        name, kind, url = src
        if kind == "x":
            q = fetch(url, cache)
            p = fetch(m["posted_url"], cache)
            if q is None and p is None:
                return name, []
            items, posted = radar.parse_merger((q or b"").decode("utf-8", "replace"), (p or b"").decode("utf-8", "replace"))
            for i in items:
                i["x_url"] = "https://x.com/i/status/" + posted[i["queue_id"]] if posted.get(i["queue_id"]) else ""
            return name, [dict(i, kind="x") for i in items if i["x_url"]]
        body = fetch(url, cache)
        if body is None:
            return name, []
        return name, [dict(i, kind=kind) for i in radar.parse_rss(body.lstrip(), "nse" if kind == "nse" else "news", name)]

    rows, ok = [], 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for fut in concurrent.futures.as_completed([pool.submit(one, s) for s in srcs]):
            try:
                _, found = fut.result()
                rows += found
                ok += 1
            except Exception:
                pass
    return rows, ok, len(srcs)


def headline_and_source(row):
    title, source = (row.get("title") or "").strip(), public.outlet(row.get("url"))
    m = re.match(r"^(.*\S)\s+[-|]\s+([^-|]{2,40})$", title)
    if source == "Google News" and m:
        title, source = m.group(1), m.group(2).strip()
    if row.get("kind") == "x":
        source = "AVRON on X"
    elif row.get("kind") == "nse":
        source = "NSE filing"
    return title, source


def keep(row):
    """Is this row fit for a public live feed?"""
    if row.get("kind") == "x":
        return True
    if row.get("kind") == "nse":
        return brain.filing_score(row, None) >= 3            # orders, results, deals, fund raising, auditor news...
    title = row.get("title") or ""
    return len(title) >= 25 and not JUNK.search(title) and not TIPS.search(title)


def entry(row, seen_at):
    title, source = headline_and_source(row)
    if row["kind"] == "nse":
        subject = row.get("subject") or ""
        title = "%s: %s" % (row.get("title", "").strip(), subject) if subject else title
        text = re.sub(r"\|\s*SUBJECT:.*$", "", row.get("text") or "", flags=re.S).strip()
    else:
        text = ""
    return {"id": hashlib.sha1((row["kind"] + "|" + (row.get("url") or title)).encode()).hexdigest()[:14],
            "time": row.get("published_at") or seen_at, "seen": seen_at, "kind": {"nse": "filing"}.get(row["kind"], row["kind"]),
            "headline": title[:240], "detail": text[:220], "source": source, "outlets": 1,
            "url": row.get("x_url") or row.get("url") or ""}


def merge(old, rows, now=None):
    """Old entries plus new rows: one entry per story (the same news story from several outlets is
    counted, not repeated), newest first, the past day only."""
    now = now or now_utc()
    seen_at = iso(now)
    cutoff = iso(now - datetime.timedelta(hours=KEEP_HOURS))
    near = iso(now - datetime.timedelta(hours=SAME_STORY_HOURS))
    items = [e for e in old if e["time"] >= cutoff]
    ids = {e["id"] for e in items}
    words = {e["id"]: decide._words(e["headline"]) for e in items if e["kind"] == "news"}
    added = 0
    for r in sorted(rows, key=lambda r: r.get("published_at") or "", reverse=True):
        if not keep(r) or (r.get("published_at") and r["published_at"] < cutoff):
            continue
        e = entry(r, seen_at)
        if e["id"] in ids or not e["url"].startswith("http"):
            continue
        if e["kind"] == "news":
            w = decide._words(e["headline"])
            twin = next((x for x in items if x["kind"] == "news" and x["time"] >= near and len(w & words[x["id"]]) >= 3
                         and len(w & words[x["id"]]) / max(1, min(len(w), len(words[x["id"]]))) >= 0.5), None)
            if twin:
                if e["source"] not in twin.setdefault("sources", [twin["source"]]):
                    twin["sources"].append(e["source"])
                    twin["outlets"] = len(twin["sources"])
                ids.add(e["id"])
                continue
            words[e["id"]] = w
        items.append(e)
        ids.add(e["id"])
        added += 1
    items.sort(key=lambda e: e["time"], reverse=True)
    return items[:MAX_ITEMS], added


def round_once(state_dir, cfg=None, read=None, now=None):
    state_dir = pathlib.Path(state_dir)
    state_dir.mkdir(parents=True, exist_ok=True)
    cfg = cfg or json.loads((HERE / "config.json").read_text(encoding="utf-8"))
    cache_path = state_dir / "http_cache.json"
    try:
        cache = json.loads(cache_path.read_text())
    except (OSError, ValueError):
        cache = {}
    try:
        old = json.loads((state_dir / "live.json").read_text()).get("items") or []
    except (OSError, ValueError):
        old = []
    rows, ok, total = (read or read_all)(cfg, cache)
    items, added = merge(old, rows, now)
    now = now or now_utc()
    hour = now.astimezone(IST).hour
    feed = {"version": VERSION, "updated_at": iso(now), "every_minutes": 3 if hour >= 6 else 15,
            "sources_ok": ok, "sources_total": total, "disclaimer": public.DISCLAIMER,
            "items": [{k: v for k, v in e.items() if k != "sources"} | ({"sources": e["sources"]} if e.get("sources") else {})
                      for e in items]}
    if public.check_feed(feed):
        raise SystemExit("live feed refused: " + "; ".join(public.check_feed(feed)))
    (state_dir / "live.json").write_text(json.dumps(feed, ensure_ascii=False), encoding="utf-8")
    cache_path.write_text(json.dumps(cache), encoding="utf-8")
    print("live: %d new, %d on the feed, %d of %d sources read" % (added, len(items), ok, total))
    return feed


if __name__ == "__main__":
    round_once(sys.argv[1] if len(sys.argv) > 1 else os.environ.get("LIVE_STATE", "live-state"))
