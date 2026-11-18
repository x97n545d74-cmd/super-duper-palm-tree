"""Radar items for the Avron X desk. The poster session posts them automatically (user's choice,
18 Nov 2026), so every line here is built by code from official files, with no model writing words:

  close card      once per trading day, after NSE's price file and the flows are in
  investor moves  followed investors entering, adding to, cutting or dropping below 1% in a company's
                  shareholding file, and their bulk or block deals; at most a few a day

Rows use the X desk's queue format and go to avron-x-merger/radar.jsonl, which only the radar writes.
"""
import datetime
import hashlib
import json
import re

import fundamentals
import market

IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
LANE = "radar"


def indian(n, d=0):
    """12345678 -> 1,23,45,678 (Indian grouping)."""
    neg, n = n < 0, abs(n)
    whole, frac = ("%.*f" % (d, n)).split(".") if d else ("%.0f" % n, "")
    head, tail = whole[:-3], whole[-3:]
    head = re.sub(r"(\d)(?=(\d\d)+$)", r"\1,", head) if head else ""
    out = (head + "," + tail) if head else tail
    return ("-" if neg else "") + out + ("." + frac if frac else "")


def short_name(name):
    name = re.sub(r"\s+(limited|ltd\.?)$", "", (name or "").strip(), flags=re.I)
    return name.upper()


def day(d):
    return datetime.date.fromisoformat(d).strftime("%-d %b").upper()


def row(rid, headline, detail, company="", link=""):
    headline, detail = headline.strip(), detail.strip()
    post = headline + ("\n" + detail if detail else "")
    if len(post) > 280:
        post = headline[:280]
    return {"id": rid, "created_ist": datetime.datetime.now(IST).strftime("%Y-%m-%d %H:%M"), "lane": LANE,
            "company": company, "headline": headline, "detail": detail, "post_text": post,
            "verify_link": link, "document_read": True, "source": "avron-radar"}


def close_card(signals, flows_summary, now=None):
    """The day's close in one post, or None until both the price file and the flows for that day are in.
    Only on that trading day's evening or the next morning before the open, so a late card is never posted."""
    if not signals or not flows_summary or flows_summary.get("date") != signals.get("date"):
        return None
    now = now or datetime.datetime.now(IST)
    d0 = datetime.date.fromisoformat(signals["date"])
    if not (now.date() == d0 or (now.date() - d0).days in (1, 2, 3) and now.hour < 9 and all(
            (d0 + datetime.timedelta(days=k)).weekday() >= 5 for k in range(1, (now.date() - d0).days))):
        return None
    ix = (signals.get("indices") or {}).get("Nifty 50") or {}
    b = signals.get("breadth") or {}
    if ix.get("close") is None or b.get("advancers") is None:
        return None
    d = signals["date"]
    chg = ix.get("change_pct") or 0
    headline = "MARKET CLOSE, %s: NIFTY 50 %s %.2f%% AT %s; %s OF %s ACTIVELY TRADED STOCKS ROSE, %s FELL" % (
        day(d), "UP" if chg >= 0 else "DOWN", abs(chg), indian(ix["close"], 2),
        indian(b["advancers"]), indian(signals.get("stocks_screened") or 0), indian(b["decliners"]))
    parts = []
    fpi = flows_summary.get("fpi") or {}
    if fpi.get("equity_net_cr") is not None:
        v = fpi["equity_net_cr"]
        parts.append("Foreign investors %s a net Rs %s crore of shares%s." % (
            "bought" if v >= 0 else "sold", indian(abs(v), 2), "" if fpi.get("date") == d else " on " + day(fpi["date"]).title()))
    if flows_summary.get("fii_index_futures_long_pct") is not None:
        parts.append("%s%% of their index futures positions are long." % flows_summary["fii_index_futures_long_pct"])
    if b.get("pct_above_200dma") is not None:
        parts.append("%s%% of stocks are above their 200-day average." % b["pct_above_200dma"])
    detail = ""
    for p in parts:                        # as many facts as fit in one post
        if len(headline) + 1 + len((detail + " " + p).strip()) <= 280:
            detail = (detail + " " + p).strip()
    return row(d.replace("-", "") + "-RC01", headline, detail)


def _full_match(name, aliases):
    """Only a match on a full name (two or more words) counts for a public post; a bare surname can be a relative."""
    n = fundamentals.norm_person(name)
    return any(len(a.split()) >= 2 and a in n for a in (fundamentals.norm_person(x) for x in aliases))


def investor_moves(holds, deals, signals, investors, post_names, desk_recent, limit=3):
    """Rows for followed investors. holds: fundamentals.holding_view(); deals: the day's bulk/block deals;
    investors: config name -> aliases; post_names: which of them may be posted; desk_recent: text the X desk
    posted in the past 36 hours (a stock it already covered is skipped)."""
    who = {n: [n] + list(investors.get(n) or []) for n in post_names if n in investors}
    names = {sym: r.get("name", "") for sym, r in ((signals or {}).get("snapshots") or {}).items()}
    desk = (desk_recent or "").upper()
    out = []
    for sym, h in sorted((holds or {}).items()):
        company = short_name(names.get(sym) or sym)
        for m in h.get("holder_moves") or []:
            if not any(_full_match(m["name"], al) for al in who.values()):
                continue
            nm = m["name"].upper()
            if m["move"] == "raised":
                hl, dt = "%s: RAISES HOLDING IN %s TO %.2f%% FROM %.2f%%" % (nm, company, m["pct"], m["was"]), \
                    "Shareholding as on %s, against %s." % (h["as_on"], h["previous_as_on"])
            elif m["move"] == "cut":
                hl, dt = "%s: CUTS HOLDING IN %s TO %.2f%% FROM %.2f%%" % (nm, company, m["pct"], m["was"]), \
                    "Shareholding as on %s, against %s." % (h["as_on"], h["previous_as_on"])
            elif m["move"] == "new above 1%":
                hl, dt = "%s: NOW HOLDS %.2f%% OF %s" % (nm, m["pct"], company), \
                    "Shareholding as on %s. Not among holders above 1%% as on %s." % (h["as_on"], h["previous_as_on"])
            else:
                hl, dt = "%s: NO LONGER AMONG HOLDERS ABOVE 1%% OF %s" % (nm, company), \
                    "Held %.2f%% as on %s. Shareholding as on %s." % (m["was"], h["previous_as_on"], h["as_on"])
            key = "|".join(["H", sym, nm, h["as_on"], m["move"]])
            out.append(row((h["as_on"].replace("-", "") + "-RH-" + hashlib.sha1(key.encode()).hexdigest()[:8]), hl, dt, company))
    both = {}
    for d in deals or []:
        both.setdefault((d["symbol"], d.get("client")), set()).add((d.get("side") or "").upper())
    for d in deals or []:
        client = d.get("client") or ""
        if not d.get("quantity") or not any(_full_match(client, al) for al in who.values()):
            continue
        if len(both.get((d["symbol"], client), ())) > 1:
            continue                                         # in and out the same day: trading, not a position
        company = short_name(names.get(d["symbol"]) or d.get("name") or d["symbol"])
        if d["symbol"] in desk or company.split()[0] in desk:
            continue                                         # the X desk already posted about this stock
        buy = "BUY" in (d.get("side") or "").upper()
        hl = "%s: %s %s SHARES OF %s AT RS %s IN A %s DEAL" % (
            client.upper(), "BUYS" if buy else "SELLS", indian(d["quantity"]), company,
            indian(d["price"], 2) if d.get("price") else "?", (d.get("kind") or "bulk").upper())
        dt = ("That was %s%% of the stock's traded volume on %s." % (d["pct_of_day_volume"], d.get("date", "").title())
              if d.get("pct_of_day_volume") is not None else "")
        key = "|".join(["D", d["symbol"], client, str(d.get("quantity")), str(d.get("price")), d.get("date", "")])
        out.append(row(datetime.datetime.now(IST).strftime("%Y%m%d") + "-RD-" + hashlib.sha1(key.encode()).hexdigest()[:8],
                       hl, dt, company))
    return out[:limit]


def read_ids(path):
    ids = set()
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                try:
                    ids.add(json.loads(line)["id"])
                except (ValueError, KeyError):
                    pass
    except OSError:
        pass
    return ids


def todays(path, prefix):
    today = datetime.datetime.now(IST).strftime("%Y%m%d")
    return sum(1 for i in read_ids(path) if i.startswith(today) and prefix in i)


def queue(path, rows):
    """Append rows not already in the file. Returns how many were written."""
    have = read_ids(path)
    new = [r for r in rows if r and r["id"] not in have and len(r["post_text"]) <= 280
           and "http" not in r["post_text"] and "#" not in r["post_text"]]
    if new:
        with open(path, "a", encoding="utf-8") as fh:
            for r in new:
                fh.write(json.dumps(r, ensure_ascii=False) + "\n")
    return len(new)
