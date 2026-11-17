"""Decision support: pulls every kind of evidence the radar holds on a stock into one
scorecard, so agreement and conflict between price, business and flows are visible at a glance.

The points are a transparent tally of evidence, not a forecast and not advice. The weights are
in WEIGHTS below; the screens' own track record (market.screen_record) says how far to trust the
price side in the current market.
"""
import datetime

WEIGHTS = {
    # price
    "trend_template": 2, "breakout_52w": 2, "breakout_20d": 1, "delivery_spike": 1, "golden_cross": 1,
    "strong_momentum": 1, "death_cross": -2, "below_200dma": -1, "stretched": -1, "heavy_selling": -1,
    # business
    "growth_20": 2, "margin_expanding": 1, "high_roe": 1, "low_debt": 1, "cheap_for_growth": 1, "flag": -1, "qualified_audit": -3,
    # flows
    "deal_buying": 1, "deal_selling": -1, "promoter_up": 1, "promoter_down": -1,
}


SCREEN_OF = {"trend_template": "trend_template", "breakout_52w": "breakout_52w", "breakout_20d": "breakout_20d",
             "delivery_spike": "delivery_spike", "golden_cross": "golden_cross", "death_cross": "death_cross",
             "stretched": "overbought", "heavy_selling": "volume_shock"}


def tuned_weights(record):
    """The price-side weights, adjusted by how each screen has actually done lately (its 20-day edge over
    the average liquid stock). A bullish screen that has lagged the market earns no points; a bearish
    signal that has not been followed by weakness costs none. Returns (weights, notes)."""
    w, notes = dict(WEIGHTS), {}
    screens = (record or {}).get("screens") or {}
    for key, screen in SCREEN_OF.items():
        edge = (screens.get(screen) or {}).get("edge_20d")
        if edge is None:
            continue
        bullish = WEIGHTS[key] > 0
        if (bullish and edge <= -0.5) or (not bullish and edge >= 0.5):
            w[key] = 0
            notes[key] = "%s has %s the market by %.1f%% over 20 days lately, so it earns no points" % (
                screen.replace("_", " "), "lagged" if bullish else "beaten", abs(edge))
    return w, notes


def _add(card, group, key, text, points=None):
    pts = card.get("_w", WEIGHTS)[key] if points is None else points
    if pts == 0:
        note = card.get("_notes", {}).get(key)
        card["notes"].append(text + (" (" + note + ")" if note else ""))
        return
    card["score"] += pts
    card["groups"][group] = card["groups"].get(group, 0) + pts
    card["for" if pts > 0 else "against"].append(text)


def scorecard(signals, fund=None, holds=None, analyses=None, buzz=None, calendar=None, now=None, my_screen=None):
    """Returns {symbol: card}. A card has score, for, against, notes, groups (points per kind of evidence),
    conflict (price and business disagree) and mine (passes the user's own screen)."""
    signals, fund, holds = signals or {}, fund or {}, holds or {}
    now = now or datetime.datetime.now(datetime.timezone.utc)
    week_ago = (now - datetime.timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    snaps = signals.get("snapshots") or {}
    on = {}
    for name, sc in (signals.get("screens") or {}).items():
        for st in sc.get("all") or [x["symbol"] for x in sc["stocks"]]:
            on.setdefault(st, set()).add(name)
    cards = {}
    weights, wnotes = tuned_weights(signals.get("screen_record"))

    def card(sym):
        return cards.setdefault(sym, {"symbol": sym, "score": 0, "for": [], "against": [], "notes": [], "groups": {},
                                      "_w": weights, "_notes": wnotes})

    for sym, hits in on.items():
        s = snaps.get(sym) or {}
        c = card(sym)
        if "trend_template" in hits:
            _add(c, "price", "trend_template", "steady uptrend (trend template)")
        if "breakout_52w" in hits:
            _add(c, "price", "breakout_52w", "new 52-week high on %sx volume" % s.get("vol_ratio"))
        elif "breakout_20d" in hits:
            _add(c, "price", "breakout_20d", "20-day breakout on %sx volume" % s.get("vol_ratio"))
        if "delivery_spike" in hits:
            _add(c, "price", "delivery_spike", "delivery %s%%, well above its average" % s.get("deliv"))
        if "golden_cross" in hits:
            _add(c, "price", "golden_cross", "50-day average crossed above the 200-day")
        if "death_cross" in hits:
            _add(c, "price", "death_cross", "50-day average crossed below the 200-day")
        if "overbought" in hits:
            _add(c, "price", "stretched", "RSI %s: stretched" % s.get("rsi"))
        if "volume_shock" in hits and (s.get("change") or 0) < 0:
            _add(c, "price", "heavy_selling", "fell %s%% on %sx volume" % (s.get("change"), s.get("vol_ratio")))

    for sym, f in fund.items():
        m, c, s = f["metrics"], card(sym), snaps.get(sym) or {}
        if m.get("growth_20"):
            _add(c, "business", "growth_20", "revenue %+.0f%% and profit %+.0f%% on a year ago" % (m["revenue_yoy_pct"], m["pat_yoy_pct"]))
        if m.get("margin_expanding"):
            _add(c, "business", "margin_expanding", "EBITDA margin up %s points on a year ago, with sales growing" % m["margin_change_yoy_pts"])
        if (m.get("roe_annualised_pct") or 0) >= 15:
            _add(c, "business", "high_roe", "ROE %s%% (annualised)" % m["roe_annualised_pct"])
        if m.get("debt_to_equity") is not None and m["debt_to_equity"] < 0.5:
            _add(c, "business", "low_debt", "debt to equity %s" % m["debt_to_equity"])
        if m.get("peg") is not None and m["peg"] < 1:
            _add(c, "business", "cheap_for_growth", "PEG %s" % m["peg"])
        for flag in m.get("flags") or []:
            _add(c, "business", "qualified_audit" if "qualified" in flag else "flag", flag)

    for sym, c in list(cards.items()):
        s = snaps.get(sym) or {}
        if (s.get("momentum_rank") or 0) >= 80 and c["groups"].get("price", 0) > 0:
            _add(c, "price", "strong_momentum", "momentum rank %s of 100" % s["momentum_rank"])
        if s.get("sma200") and s.get("close") and s["close"] < s["sma200"] and "business" in c["groups"]:
            _add(c, "price", "below_200dma", "price is below its 200-day average")

    for a in analyses or []:
        sym = a.get("symbol")
        if not sym or a.get("read_at", "") < week_ago or a.get("materiality", 0) < 3 or a.get("confidence") == "low":
            continue
        pts = a["materiality"] - 2
        if a.get("tone") == "positive":
            _add(card(sym), "filings", None, "filing: " + a["headline"][:110], pts)
        elif a.get("tone") == "negative":
            _add(card(sym), "filings", None, "filing: " + a["headline"][:110], -pts)
        else:
            card(sym)["notes"].append("filing (%s): %s" % (a.get("tone"), a["headline"][:110]))

    net, share = {}, {}
    for d in signals.get("deals") or []:
        if d.get("quantity"):
            sign = 1 if "BUY" in (d.get("side") or "").upper() else -1
            net[d["symbol"]] = net.get(d["symbol"], 0) + sign * d["quantity"]
            share[d["symbol"]] = share.get(d["symbol"], 0) + sign * (d.get("pct_of_day_volume") or 0)
    for sym, qty in net.items():
        pct = abs(share.get(sym, 0))
        if pct < 1:          # under 1% of the day's trading is noise (often the same trader in and out)
            continue
        size = " ({:.0f}% of the day's volume)".format(pct)
        big = 2 if pct >= 10 else None
        if qty > 0:
            _add(card(sym), "flows", "deal_buying", "bulk or block deals: net buying of {:,.0f} shares".format(qty) + size, big)
        elif qty < 0:
            _add(card(sym), "flows", "deal_selling", "bulk or block deals: net selling of {:,.0f} shares".format(-qty) + size, big and -big)
    for sym, h in holds.items():
        if h.get("change_pts") is not None and abs(h["change_pts"]) >= 0.5:
            _add(card(sym), "flows", "promoter_up" if h["change_pts"] > 0 else "promoter_down",
                 "promoter holding %+.2f points to %s%%" % (h["change_pts"], h["promoter_pct"]))

    for b in buzz or []:
        if b["symbol"] in cards:
            cards[b["symbol"]]["notes"].append("talked about %d times in a day (usual %s): verify why" % (b["mentions_24h"], b["daily_average_before"]))
    for ev in calendar or []:
        if ev.get("symbol") in cards:
            cards[ev["symbol"]]["notes"].append("%s on %s: %s" % (ev["kind"], ev["date"], ev["what"]))

    for sym, c in cards.items():
        s, f = snaps.get(sym) or {}, (fund.get(sym) or {}).get("metrics") or {}
        g = c["groups"]
        c["kinds_in_favour"] = sum(1 for v in g.values() if v > 0)
        c["conflict"] = bool(g.get("price", 0) * g.get("business", 0) < 0 or (g.get("price", 0) > 0 and g.get("filings", 0) < 0))
        c.update(name=s.get("name", ""), industry=s.get("industry", ""), close=s.get("close"), change=s.get("change"),
                 market_cap_cr=f.get("market_cap_cr"))
        c["mine"] = bool(my_screen and passes(my_screen, f))
        c.pop("_w", None)
        c.pop("_notes", None)
    return cards


def passes(screen, metrics):
    """The user's own screen, from config.json: every rule given must be met by known figures."""
    cap = metrics.get("market_cap_cr")
    if screen.get("max_market_cap_cr") is not None and not (cap is not None and cap <= screen["max_market_cap_cr"]):
        return False
    for key, rule in (("revenue_yoy_pct", "min_revenue_growth_pct"), ("pat_yoy_pct", "min_profit_growth_pct")):
        if screen.get(rule) is not None and not ((metrics.get(key) or -1e9) >= screen[rule]):
            return False
    if screen.get("no_flags") and metrics.get("flags"):
        return False
    return True


def shortlists(cards, n=25):
    """strongest: most evidence in favour from at least two kinds of evidence.
    weakest: most evidence against. conflicts: price and business disagree. mine: passes the user's screen."""
    rows = list(cards.values())
    strongest = sorted((c for c in rows if c["score"] >= 3 and c["kinds_in_favour"] >= 2), key=lambda c: -c["score"])[:n]
    weakest = sorted((c for c in rows if c["score"] <= -2), key=lambda c: c["score"])[:n]
    conflicts = sorted((c for c in rows if c["conflict"]), key=lambda c: -abs(c["score"]))[:n]
    mine = sorted((c for c in rows if c["mine"]), key=lambda c: -c["score"])[:n]
    chosen = {c["symbol"] for c in strongest}
    price_only = sorted((c for c in rows if c["groups"].get("price", 0) >= 3 and c["symbol"] not in chosen
                         and "business" not in c["groups"]), key=lambda c: -c["groups"]["price"])[:n]
    return {"strongest": strongest, "weakest": weakest, "conflicts": conflicts, "mine": mine, "price_only": price_only}


def my_stock_alerts(symbols, signals, items, analyses, fund, calendar, buzz, now=None, hours=24):
    """What happened in the past day to the stocks the reader follows (config.json "my_stocks").
    Returns [{symbol, name, close, change, lines}] for every followed stock, quiet ones included."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    since = (now - datetime.timedelta(hours=hours)).strftime("%Y-%m-%dT%H:%M:%SZ")
    snaps = (signals or {}).get("snapshots") or {}
    out = []
    for sym in symbols or []:
        sym = sym.strip().upper()
        s = snaps.get(sym)
        lines = []
        if not s:
            out.append({"symbol": sym, "name": "", "close": None, "change": None, "lines": ["not found in NSE's price file: check the symbol"]})
            continue
        chg, atr = s.get("change"), s.get("atr_pct")
        if chg is not None and (abs(chg) >= 5 or (atr and abs(chg) >= 2 * atr)):
            lines.append("moved %+.1f%% on %sx normal volume (its normal daily range is %s%%)" % (chg, s.get("vol_ratio"), atr))
        on = [k.replace("_", " ") for k, v in ((signals or {}).get("screens") or {}).items()
              if sym in (v.get("all") or [x["symbol"] for x in v["stocks"]])]
        if on:
            lines.append("on screens: " + ", ".join(on))
        for a in analyses or []:
            if a.get("symbol") == sym and a.get("read_at", "") >= since:
                lines.append("analyst read (materiality %s, %s): %s" % (a.get("materiality"), a.get("tone"), a["headline"][:140]))
        read_ids = {a["id"] for a in analyses or [] if a.get("symbol") == sym}
        for i in items or []:
            when = i.get("published_at") or i.get("collected_at", "")
            if sym not in (i.get("symbols") or []) or when < since:
                continue
            if i["platform"] == "nse" and i.get("id") not in read_ids:
                lines.append("filing: " + (i.get("subject") or i.get("text", ""))[:120])
            elif i["platform"] not in ("nse", "deals") and (i.get("tags") or {}).get("relevance", 0) >= 3:
                t = i["tags"]
                lines.append("%s (%s): %s" % (i["platform"], t.get("kind"), (t.get("summary") or i["title"])[:140]))
        f = (fund or {}).get(sym)
        if f and f.get("copied_at", "") >= since:
            m = f["metrics"]
            lines.append("results for %s: revenue %s%% and profit %s%% on a year ago%s" % (
                f["period_end"], m.get("revenue_yoy_pct"), m.get("pat_yoy_pct"),
                "; flags: " + "; ".join(m["flags"]) if m.get("flags") else ""))
        for d in (signals or {}).get("deals") or []:
            if d["symbol"] == sym:
                lines.append("deal: %s %s %s shares (%s%% of the day's volume)" % (
                    d.get("client", "?"), (d.get("side") or "").lower(), "{:,.0f}".format(d.get("quantity") or 0), d.get("pct_of_day_volume")))
        for ev in calendar or []:
            if ev.get("symbol") == sym:
                lines.append("coming up: %s on %s (%s)" % (ev["kind"], ev["date"], ev["what"]))
        for b in buzz or []:
            if b["symbol"] == sym:
                lines.append("talked about %d times in a day against a usual %s" % (b["mentions_24h"], b["daily_average_before"]))
        seen, unique = set(), []
        for l in lines:
            if l not in seen:
                seen.add(l)
                unique.append(l)
        out.append({"symbol": sym, "name": s.get("name", ""), "close": s.get("close"), "change": chg,
                    "from_high": s.get("from_high"), "lines": unique[:12]})
    return out


def theme_tracker(items, themes, now=None):
    """For each theme in config.json (a name and its keywords): how much was said in the past day and
    week, whether that is rising, which listed companies come up most, and the newest items.
    Exchange filings count separately from news and chatter."""
    now = now or datetime.datetime.now(datetime.timezone.utc)
    day = (now - datetime.timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")
    week = (now - datetime.timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    out = []
    for name, words in (themes or {}).items():
        words = [w.lower() for w in words]
        hits = []
        for i in items:
            when = i.get("published_at") or i.get("collected_at", "")
            if when < week or i["platform"] == "deals":
                continue
            t = i.get("tags") or {}
            hay = (i.get("title", "") + " " + i.get("text", "") + " " + (t.get("summary") or "")).lower()
            if any(w in hay for w in words):
                hits.append((when, i))
        if not hits:
            out.append({"theme": name, "mentions_24h": 0, "mentions_7d": 0, "filings_7d": 0, "rising": False, "companies": [], "latest": []})
            continue
        hits.sort(key=lambda h: h[0], reverse=True)
        d1 = sum(1 for w, _ in hits if w >= day)
        companies = {}
        for _, i in hits:
            for sym in i.get("symbols") or []:
                companies[sym] = companies.get(sym, 0) + 1
        out.append({
            "theme": name, "mentions_24h": d1, "mentions_7d": len(hits),
            "filings_7d": sum(1 for _, i in hits if i["platform"] == "nse"),
            "rising": bool(d1 >= 3 and d1 > 2 * (len(hits) - d1) / 6),          # today against the daily average before
            "companies": [s for s, _ in sorted(companies.items(), key=lambda kv: -kv[1])[:8]],
            "latest": [{"date": w[:10], "platform": i["platform"], "kind": (i.get("tags") or {}).get("kind"),
                        "text": ((i.get("tags") or {}).get("summary") or i.get("title", ""))[:200], "url": i.get("url", "")}
                       for w, i in hits[:6]],
        })
    return sorted(out, key=lambda r: (-r["mentions_24h"], -r["mentions_7d"]))
