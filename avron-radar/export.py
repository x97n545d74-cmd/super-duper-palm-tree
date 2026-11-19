"""The scraped data, on its own, for another system to read: what the radar collected from its sources
and nothing it worked out or was told. Built on every round as scraped.json.

In:  posts and news (headline, link, source, time, a short excerpt), exchange filings, the X desk's
     items, NSE's end-of-day market summary, bulk and block deals, foreign-investor flows and positions,
     every stock's end-of-day prices, the latest shareholding file per company, the next two weeks of
     board meetings and ex-dates, and index valuations day by day.
Out: everything the radar or Claude produced (labels, analyst reads, briefs, scorecards, screens,
     results copied by Claude, policy notes), the user's own lists and settings, and run logs.
"""
import datetime

VERSION = 2
KIND = {"nse": "filing", "news": "news", "regulator": "regulator", "forum": "forum", "reddit": "social",
        "telegram": "social", "bluesky": "social", "x": "social", "youtube": "video", "avronx": "x_desk", "deals": "deal"}
ITEM_FIELDS = ("id", "time", "kind", "source", "headline", "excerpt", "url", "author", "subject", "symbols")


def items_part(items, now, hours=48, limit=10000):
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


def prices_part(date, rows, universe):
    """NSE's end-of-day file for every stock, as collected. Turnover is in rupees lakh."""
    if not rows:
        return None
    universe = universe or {}
    stocks = [{"symbol": s, "name": (universe.get(s) or {}).get("name", ""), "prev_close": r.get("prev"),
               "close": r.get("close"), "high": r.get("high"), "low": r.get("low"), "volume": r.get("volume"),
               "turnover_lakh": r.get("turnover"), "delivery_pct": r.get("deliv")} for s, r in sorted(rows.items())]
    return {"date": date, "stocks": stocks}


def holdings_part(rows):
    """The latest shareholding file NSE published for each company: holder categories and named holders above 1%."""
    latest = {}
    for r in rows or []:
        sym = r.get("symbol") or r.get("company")
        if sym and r.get("as_on") and (sym not in latest or r["as_on"] >= latest[sym]["as_on"]):
            latest[sym] = r
    return [{"symbol": r.get("symbol", ""), "company": r.get("company", ""), "as_on": r["as_on"], "source": r.get("url", ""),
             "promoter_pct": r.get("promoter_pct"), "pattern": r.get("detail") or {}}
            for _, r in sorted(latest.items())]


def build(items, signals, flow_history, now=None, prices=None, universe=None, holdings=None, calendar=None,
          index_history=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    date, rows = prices or (None, None)
    return {"version": VERSION, "built_at": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "about": "Data collected by Avron Radar from public sources. Headlines and excerpts belong to their publishers.",
            "items": items_part(items, now), "market": market_part(signals), "flows": flows_part(flow_history),
            "prices": prices_part(date, rows, universe), "holdings": holdings_part(holdings),
            "calendar": [{k: c.get(k) for k in ("date", "kind", "company", "symbol", "what")} for c in calendar or []],
            "index_history": sorted(index_history or [], key=lambda r: r.get("date", ""))[-30:]}


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
