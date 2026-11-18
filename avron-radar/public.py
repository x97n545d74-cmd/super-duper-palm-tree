"""The public part of the radar, for the AVRON website: one JSON feed with only what the user chose
to show visitors (18 Nov 2026): the market today, business news, government and the calendar, and
what the X desk has posted.

Left out on purpose: anything about a single stock that reads as a view on it (the scorecard, the
analyst's reads and briefs, screens), the user's own lists, followed investors, social chatter, and
article text (headlines link to the source instead).
"""
import json
import re
import urllib.parse

VERSION = 1
DISCLAIMER = ("For information only. Not investment advice and not a recommendation to buy or sell any security. "
              "Market data is from NSE and NSDL daily files; news headlines link to their publishers.")


def _r(x, n=2):
    return None if x is None else round(x, n)


def outlet(url):
    host = urllib.parse.urlparse(url or "").netloc.lower()
    host = re.sub(r"^(www|m|feeds)\.", "", host)
    return {"news.google.com": "Google News", "economictimes.indiatimes.com": "Economic Times", "livemint.com": "Mint",
            "business-standard.com": "Business Standard", "thehindubusinessline.com": "BusinessLine",
            "moneycontrol.com": "Moneycontrol", "cnbctv18.com": "CNBC-TV18", "bbc.co.uk": "BBC", "bbc.com": "BBC",
            "cnbc.com": "CNBC", "inc42.com": "Inc42", "yourstory.com": "YourStory", "pib.gov.in": "PIB",
            "rbi.org.in": "RBI"}.get(host, host)


def market_part(signals, flows_summary):
    if not signals:
        return None
    ix = signals.get("indices") or {}
    pick = lambda n: {k: _r(v) for k, v in (ix.get(n) or {}).items() if k in ("close", "change_pct", "pe", "pb", "div_yield")} or None
    f = flows_summary or {}
    fpi = f.get("fpi") or {}
    part = {
        "date": signals.get("date"),
        "indices": {n: pick(n) for n in ("Nifty 50", "Nifty 500", "Nifty Midcap 150", "Nifty Smallcap 250",
                                         "Nifty Microcap 250", "Nifty Bank", "Nifty IT", "India VIX") if pick(n)},
        "breadth": {k: (signals.get("breadth") or {}).get(k) for k in ("advancers", "decliners", "pct_above_200dma",
                                                                         "new_52w_highs", "new_52w_lows")},
        "stocks_counted": signals.get("stocks_screened"),
        "sectors": [{"industry": s["industry"], "stocks": s["stocks"], "change_today_pct": s["avg_today"],
                     "change_1m_pct": s["avg_1m"], "change_3m_pct": s["avg_3m"], "pct_above_200dma": s["pct_above_200dma"]}
                    for s in signals.get("sectors") or []],
    }
    if f:
        part["flows"] = {"date": f.get("date"), "fpi_date": fpi.get("date"),
                         "fpi_equity_net_cr": fpi.get("equity_net_cr"), "fpi_debt_net_cr": fpi.get("debt_net_cr"),
                         "fii_index_futures_long_pct": f.get("fii_index_futures_long_pct"),
                         "index_put_call_ratio": f.get("index_put_call_ratio"), "usd_inr": f.get("usd_inr"),
                         "fo_ban_list": f.get("ban_list") or []}
    return part


def business_part(digest, limit=30):
    out = []
    for s in digest[:limit]:
        if s.get("kind") in ("rumour", "opinion"):
            continue                       # a public page shows reported facts
        title, source = s["title"], outlet(s.get("url"))
        m = re.match(r"^(.*\S)\s+[-|]\s+([^-|]{2,40})$", title)
        if source == "Google News" and m:          # Google News titles end with " - Publisher"
            title, source = m.group(1), m.group(2).strip()
        out.append({"headline": title, "url": s.get("url", ""), "source": source,
                    "outlets": s.get("outlets", 1), "area": s.get("area", "other"), "time": s.get("when", "")})
    return out


def government_part(view):
    notes = []
    seen = set()
    for g in (view or {}).get("sectors") or []:
        for n in g["notes"]:
            if n["id"] in seen:
                continue
            seen.add(n["id"])
            notes.append({"date": n["date"], "sectors": n["sectors"], "title": n["policy"], "what": n["what"],
                          "level": n["level"], "stage": n["stage"], "money_cr": n["money_cr"],
                          "source": "official" if n["official"] else outlet(n.get("url")), "url": n.get("url", ""),
                          "companies_named": n["companies_named"]})
    notes.sort(key=lambda n: n["date"], reverse=True)
    elections = [{"where": e["where"], "type": e["type"], "expected": e["expected"], "note": e.get("note", ""),
                  "promises": [{"date": n["date"], "title": n["policy"], "what": n["what"], "url": n.get("url", "")} for n in e["promises"]],
                  "results": [{"date": n["date"], "title": n["policy"], "what": n["what"], "url": n.get("url", "")} for n in e["results"]]}
                 for e in (view or {}).get("elections") or []]
    return {"decisions": notes[:40], "elections": elections}


def calendar_part(cal, limit=60):
    return [{"date": c["date"], "event": c["kind"], "company": c["company"], "symbol": c.get("symbol", ""), "what": c["what"]}
            for c in (cal or [])[:limit]]


def x_part(items, limit=30):
    out = []
    for i in items:
        if i["platform"] == "avronx" and i.get("x_url"):
            first = (i.get("text") or "").split("\n")[0].strip()
            out.append({"text": i["title"] + ("\n" + first if first and first != i["title"] else ""),
                        "time": i.get("published_at") or i.get("collected_at", ""), "url": i["x_url"],
                        "kind": i["source"].split(": ", 1)[-1]})
    out.sort(key=lambda x: x["time"], reverse=True)
    return out[:limit]


def build_feed(built_at, signals, flows_summary, digest, gov_view, cal, items):
    return {"version": VERSION, "built_at": built_at, "disclaimer": DISCLAIMER,
            "market": market_part(signals, flows_summary), "business": business_part(digest),
            "government": government_part(gov_view), "calendar": calendar_part(cal), "x_desk": x_part(items)}


PRIVATE_KEYS = ("scorecard", "analyses", "briefs", "brief", "investors", "holdings", "my_stocks", "cards",
                "shortlists", "snapshots", "screens", "answers", "themes", "chatter")


def check_feed(feed):
    """Problems that must never reach a public page: a private section, a stock view, advice wording."""
    text = json.dumps(feed, ensure_ascii=False)
    problems = [k for k in PRIVATE_KEYS if '"%s"' % k in text]
    for m in re.finditer(r"\b(strong buy|buy now|sell now|target price|price target|book profits?|accumulate)\b", text, re.I):
        problems.append("advice wording: " + m.group(0))
    return problems
