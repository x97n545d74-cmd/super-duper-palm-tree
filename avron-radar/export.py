"""The scraped data, on its own, for another system to read: what the radar collected from its sources
and nothing it worked out or was told. Built on every round as scraped.json.

In:  posts and news (headline, link, source, time, a short excerpt), exchange filings, the X desk's
     items, NSE's end-of-day market summary, bulk and block deals, foreign-investor flows and positions.
Out: everything the radar or Claude produced (labels, analyst reads, briefs, scorecards, screens,
     results copied by Claude, policy notes), the user's own lists and settings, and run logs.
"""
import datetime

VERSION = 1
KIND = {"nse": "filing", "news": "news", "regulator": "regulator", "forum": "forum", "reddit": "social",
        "telegram": "social", "bluesky": "social", "x": "social", "youtube": "video", "avronx": "x_desk", "deals": "deal"}
ITEM_FIELDS = ("id", "time", "kind", "source", "headline", "excerpt", "url", "author", "subject", "symbols")


def items_part(items, now, hours=48, limit=3000):
    since = (now - datetime.timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M:%SZ")
    out = []
    for i in items:
        when = i.get("published_at") or i.get("collected_at", "")
        if when < since or i["platform"] == "deals":
            continue
        row = {"id": i["id"], "time": when, "kind": KIND.get(i["platform"], i["platform"]), "source": i["source"],
               "headline": i.get("title", ""), "excerpt": (i.get("text") or "")[:300], "url": i.get("url", ""),
               "author": i.get("author", ""), "subject": i.get("subject", ""), "symbols": i.get("symbols") or []}
        out.append({k: row[k] for k in ITEM_FIELDS if row[k] not in ("", [], None)})
    out.sort(key=lambda r: r["time"], reverse=True)
    return out[:limit]


def market_part(signals):
    if not signals:
        return None
    return {"date": signals.get("date"), "indices": signals.get("indices") or {},
            "breadth": {k: v for k, v in (signals.get("breadth") or {}).items()},
            "deals": [{k: d.get(k) for k in ("date", "symbol", "name", "client", "side", "quantity", "price", "kind",
                                             "pct_of_day_volume")} for d in signals.get("deals") or []]}


def flows_part(history, days=10):
    return sorted(history or [], key=lambda r: r["date"])[-days:]


def build(items, signals, flow_history, now=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    return {"version": VERSION, "built_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "about": "Data collected by Avron Radar from public sources. Headlines and excerpts belong to their publishers.",
            "items": items_part(items, now), "market": market_part(signals), "flows": flows_part(flow_history)}


NOT_SCRAPED = ("tags", "relevance", "summary", "analyses", "brief", "scorecard", "screens", "snapshots", "fundamentals",
               "my_stocks", "my_screen", "investors", "watch", "answers", "runs", "tokens", "policy", "x_post")


def check(feed):
    """Names of anything in the export that is not scraped data."""
    found = set()

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k in NOT_SCRAPED:
                    found.add(k)
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(feed)
    return sorted(found)
