"""Market data for the radar: NSE's official end-of-day file for every stock
(price, volume, delivery), the index lists, and the bulk and block deals.
Turns a year of prices into the technical screens in analyst.py.

Files kept in <data>/market/:
  days/YYYY-MM-DD.csv.gz   one compact file per trading day
  universe.json            symbol -> company name, industry, index membership
  signals.json             the latest screens, breadth and index valuations
"""
import csv
import datetime
import gzip
import io
import json
import re
import time
import urllib.error

import analyst

ARCHIVE = "https://nsearchives.nseindia.com/"
SERIES = {"EQ", "BE", "BZ", "SM", "ST"}       # main board and SME shares
HISTORY_DAYS = 400       # calendar days to keep and backfill (about 270 trading days)
SIGNALS_VERSION = 8      # raise when the screens or their columns change, so saved signals are recomputed
MIN_TURNOVER_LAKH = 100  # screens ignore stocks that traded under Rs 1 crore on the day
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
SME_LIST = "emerge/corporates/content/SME_EQUITY_L.csv"
INDEX_LISTS = {
    "nifty500": "content/indices/ind_nifty500list.csv",
    "smallcap250": "content/indices/ind_niftysmallcap250list.csv",
    "microcap250": "content/indices/ind_niftymicrocap250_list.csv",
}
INDEX_WATCH = ("Nifty 50", "Nifty 500", "Nifty Midcap 150", "Nifty Smallcap 250", "Nifty Microcap 250",
               "Nifty Bank", "Nifty IT", "India VIX")


def num(s):
    try:
        return float(str(s).replace(",", "").strip())
    except ValueError:
        return None


def parse_bhav(text):
    """NSE's sec_bhavdata_full file -> {symbol: row}. Keeps one row per symbol (the main series)."""
    rows = {}
    for r in csv.DictReader(io.StringIO(text), skipinitialspace=True):
        r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
        if r.get("SERIES") not in SERIES:
            continue
        close, prev = num(r.get("CLOSE_PRICE")), num(r.get("PREV_CLOSE"))
        high, low, vol = num(r.get("HIGH_PRICE")), num(r.get("LOW_PRICE")), num(r.get("TTL_TRD_QNTY"))
        if not close or not prev or high is None or low is None or vol is None:
            continue
        rows[r["SYMBOL"]] = {"prev": prev, "close": close, "high": high, "low": low, "volume": vol,
                             "turnover": num(r.get("TURNOVER_LACS")) or 0, "deliv": num(r.get("DELIV_PER"))}
    return rows


COLS = ("prev", "close", "high", "low", "volume", "turnover", "deliv")


def save_day(path, rows):
    with gzip.open(path, "wt", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh)
        for sym in sorted(rows):
            w.writerow([sym] + ["" if rows[sym][c] is None else ("%g" % rows[sym][c]) for c in COLS])


def load_day(path):
    rows = {}
    with gzip.open(path, "rt", encoding="utf-8", newline="") as fh:
        for rec in csv.reader(fh):
            rows[rec[0]] = {c: (float(v) if v != "" else None) for c, v in zip(COLS, rec[1:])}
    return rows


def build_series(days):
    """days: list of (date, {symbol: row}) oldest first -> {symbol: [bars]} with prices adjusted for
    splits and bonuses. NSE restates the previous close on the ex-date, so when a day's 'prev' differs
    from the day before's close, everything earlier is scaled by that ratio."""
    series = {}
    for date, rows in days:
        for sym, r in rows.items():
            bars = series.setdefault(sym, [])
            if bars:
                last = bars[-1]["raw_close"]
                f = r["prev"] / last if last else 1
                jump = r["close"] / last if last else 1
                if abs(f - 1) <= 0.02 and (jump < 0.65 or jump > 1.6):
                    # A move this size in one day is beyond the exchange's price bands: it is a demerger or
                    # similar that was not restated, not a crash. Treat it as a corporate action.
                    f = jump
                if abs(f - 1) > 0.02:                      # a corporate action, not rounding
                    for b in bars:
                        for k in ("close", "high", "low"):
                            b[k] *= f
                        b["volume"] /= f
            bars.append({"date": date, "close": r["close"], "high": r["high"], "low": r["low"],
                         "volume": r["volume"], "deliv": r["deliv"], "raw_close": r["close"],
                         "turnover": r["turnover"]})
    return series


def compute_signals(days, universe):
    """The screens, breadth and movers for the latest day in `days`."""
    if not days:
        return None
    date = days[-1][0]
    series = build_series(days)
    snaps = {}
    for sym, bars in series.items():
        if bars[-1]["date"] != date:
            continue                                        # did not trade on the latest day
        s = analyst.snapshot(bars)
        if s:
            s["turnover_lakh"] = bars[-1]["turnover"]
            snaps[sym] = s
    ranks = analyst.momentum_ranks(snaps)
    liquid = {sym: s for sym, s in snaps.items() if s["turnover_lakh"] >= MIN_TURNOVER_LAKH}

    def row(sym):
        s, u = snaps[sym], universe.get(sym, {})
        r = lambda x, n=1: None if x is None else round(x, n)
        return {"symbol": sym, "name": u.get("name", ""), "industry": u.get("industry", ""),
                "index": u.get("index", ""), "close": r(s["close"], 2), "change": r(s["change"]),
                "vol_ratio": r(s["vol_ratio"]), "deliv": r(s["deliv"]), "rsi": r(s["rsi"]),
                "from_high": r(s["from_high"]), "ret_3m": r(s["ret_3m"]), "atr_pct": r(s["atr_pct"]),
                "momentum_rank": ranks.get(sym), "turnover_cr": r(s["turnover_lakh"] / 100),
                "sma50": r(s["sma50"], 2), "sma200": r(s["sma200"], 2), "prior_high20": r(s["prior_high20"], 2)}

    screens = {}
    for sym, s in liquid.items():
        for name in analyst.run_screens(s):
            screens.setdefault(name, []).append(sym)
    out_screens = {}
    for name, (meaning, _) in analyst.SCREENS.items():
        syms = sorted(screens.get(name, []), key=lambda x: -(ranks.get(x) or 0))
        out_screens[name] = {"meaning": meaning, "count": len(syms), "stocks": [row(x) for x in syms[:60]], "all": syms}
    with200 = [s for s in liquid.values() if s["sma200"]]
    changes = [s["change"] for s in liquid.values() if s["change"] is not None]
    movers = sorted(liquid, key=lambda x: liquid[x]["change"] or 0)
    out = {
        "date": date,
        "days_of_history": len(days),
        "stocks_screened": len(liquid),
        "breadth": {
            "advancers": sum(1 for c in changes if c > 0),
            "decliners": sum(1 for c in changes if c < 0),
            "pct_above_200dma": round(100 * sum(1 for s in with200 if s["close"] > s["sma200"]) / len(with200), 1) if with200 else None,
            "new_52w_highs": sum(1 for s in liquid.values() if s["prior_high250"] and s["close"] > s["prior_high250"]),
            "new_52w_lows": sum(1 for s in liquid.values() if s["days"] >= 250 and s["close"] <= s["low52"] * 1.001),
        },
        "top_gainers": [row(x) for x in movers[::-1][:15]],
        "top_losers": [row(x) for x in movers[:15]],
        "screens": out_screens,
        "screen_record": None,
        "sectors": sector_table(snaps, universe, set(screens.get("trend_template", []))),
        "volumes": {sym: series[sym][-1]["volume"] for sym in snaps},
        "snapshots": {sym: row(sym) for sym in snaps},     # every stock, for looking one up
    }
    out["screen_record"] = screen_record(series, [d for d, _ in days])
    out["regime"] = regime(out["breadth"], out["screen_record"])
    return out


def sector_table(snaps, universe, on_trend):
    """Per industry (index companies only, where NSE gives the industry): how many stocks, the share above
    their 200-day average, the average 1-month and 3-month move, today's average move, and how many are in
    a steady uptrend. Sorted by the 1-month move, strongest first."""
    groups = {}
    for sym, s in snaps.items():
        ind = (universe.get(sym) or {}).get("industry")
        if ind:
            groups.setdefault(ind, []).append((sym, s))
    avg = lambda xs: round(sum(xs) / len(xs), 1) if xs else None
    rows = []
    for ind, members in groups.items():
        if len(members) < 4:
            continue
        with200 = [s for _, s in members if s["sma200"]]
        rows.append({
            "industry": ind, "stocks": len(members),
            "pct_above_200dma": round(100 * sum(1 for s in with200 if s["close"] > s["sma200"]) / len(with200)) if with200 else None,
            "avg_1m": avg([s["ret_1m"] for _, s in members if s["ret_1m"] is not None]),
            "avg_3m": avg([s["ret_3m"] for _, s in members if s["ret_3m"] is not None]),
            "avg_today": avg([s["change"] for _, s in members if s["change"] is not None]),
            "in_uptrend": sum(1 for sym, _ in members if sym in on_trend),
        })
    return sorted(rows, key=lambda r: -(r["avg_1m"] if r["avg_1m"] is not None else -999))


def regime(breadth, record):
    """A plain label for the market the screens are working in, with the reasons."""
    above = (breadth or {}).get("pct_above_200dma")
    base = ((record or {}).get("screens") or {}).get("all") or {}
    b20, rose = base.get("avg_20d"), base.get("rose_20d_pct")
    why = []
    if above is not None:
        why.append("%s%% of stocks are above their 200-day average" % above)
    if b20 is not None:
        why.append("the average liquid stock moved %+.1f%% over 20 trading days and %s%% of them rose" % (b20, rose))
    if above is None or b20 is None:
        label = "unknown"
    elif above >= 60 and b20 > 0:
        label = "strong"
    elif above < 45 or b20 < -2:
        label = "weak"
    else:
        label = "mixed"
    meaning = {"strong": "Breakouts and uptrends have the wind behind them.",
               "mixed": "Be selective: only setups with volume, delivery and a business reason.",
               "weak": "Most stocks are falling. Breakouts fail more often than not; protecting capital comes first.",
               "unknown": "Not enough history yet."}[label]
    return {"label": label, "why": why, "meaning": meaning}


def screen_record(series, dates, lookback=60, step=3, horizons=(5, 20)):
    """How each screen has actually done lately: for sample days in the past `lookback` trading days,
    the average return 5 and 20 trading days after a stock appeared on the screen, the share that rose,
    and the same for every liquid stock on those days (the baseline). A check on the screens, not a promise."""
    last = len(dates) - 1
    sample = [t for t in range(last - min(horizons), max(last - lookback, 60), -step)]
    index = {sym: {b["date"]: i for i, b in enumerate(bars)} for sym, bars in series.items()}
    got = {}      # screen -> horizon -> list of returns; "all" is the baseline

    def add(name, h, r):
        got.setdefault(name, {}).setdefault(h, []).append(r)

    for t in sample:
        date = dates[t]
        for sym, bars in series.items():
            i = index[sym].get(date)
            if i is None or i < 60 or bars[i]["turnover"] < MIN_TURNOVER_LAKH:
                continue
            fwd = {h: (bars[i + h]["close"] / bars[i]["close"] - 1) * 100 for h in horizons if i + h < len(bars)}
            if not fwd:
                continue
            snap = analyst.snapshot(bars[max(0, i - 259):i + 1])
            hits = analyst.run_screens(snap) if snap else []
            for h, r in fwd.items():
                add("all", h, r)
                for name in hits:
                    add(name, h, r)
    out = {"sample_days": len(sample), "from": dates[sample[-1]] if sample else "", "to": dates[sample[0]] if sample else "", "screens": {}}
    base = got.get("all", {})
    for name, by_h in got.items():
        row = {}
        for h in horizons:
            rs = by_h.get(h) or []
            if len(rs) >= 5:
                row["n_%dd" % h] = len(rs)
                row["avg_%dd" % h] = round(sum(rs) / len(rs), 2)
                row["rose_%dd_pct" % h] = round(100 * sum(1 for r in rs if r > 0) / len(rs))
                if name != "all" and base.get(h):
                    row["edge_%dd" % h] = round(row["avg_%dd" % h] - sum(base[h]) / len(base[h]), 2)
        if row:
            out["screens"][name] = row
    return out


def parse_universe(equity_list_text, index_texts):
    """EQUITY_L.csv plus the index constituent lists -> {symbol: {name, industry, index}}."""
    uni = {}
    for r in csv.DictReader(io.StringIO(equity_list_text), skipinitialspace=True):
        r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
        if r.get("SYMBOL"):
            uni[r["SYMBOL"]] = {"name": r.get("NAME OF COMPANY", ""), "industry": "", "index": ""}
    for index, text in index_texts.items():       # later lists win, so list the narrowest last
        for r in csv.DictReader(io.StringIO(text), skipinitialspace=True):
            r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
            u = uni.setdefault(r.get("Symbol", ""), {"name": r.get("Company Name", ""), "industry": "", "index": ""})
            u["industry"] = r.get("Industry", "") or u["industry"]
            u["index"] = index
    uni.pop("", None)
    return uni


def parse_deals(text, kind):
    """bulk.csv / block.csv -> list of deals."""
    out = []
    for r in csv.DictReader(io.StringIO(text), skipinitialspace=True):
        r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
        if not r.get("Symbol") or not r.get("Client Name"):
            continue
        out.append({"kind": kind, "date": r.get("Date", ""), "symbol": r["Symbol"],
                    "name": r.get("Security Name", ""), "client": r["Client Name"],
                    "side": r.get("Buy/Sell", ""), "quantity": num(r.get("Quantity Traded")),
                    "price": num(r.get("Trade Price / Wght. Avg. Price"))})
    return out


def parse_indices(text):
    out = {}
    for r in csv.DictReader(io.StringIO(text), skipinitialspace=True):
        r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
        name = r.get("Index Name", "")
        if name in INDEX_WATCH:
            out[name] = {"close": num(r.get("Closing Index Value")), "change_pct": num(r.get("Change(%)")),
                         "pe": num(r.get("P/E")), "pb": num(r.get("P/B")), "div_yield": num(r.get("Div Yield"))}
    return out


def norm_name(s):
    s = re.sub(r"[^a-z0-9 ]", " ", (s or "").lower())
    s = re.sub(r"\b(limited|ltd|the|india|company|co|corporation|corp)\b", " ", s)
    return " ".join(s.split())


def name_index(universe):
    """Company name -> symbol, for matching a filing's company to its price data."""
    return {norm_name(u["name"]): sym for sym, u in universe.items() if u.get("name")}


def deal_summary(deals):
    """Bulk and block deals added up per stock: who bought, who sold, the net, and the net as a share of
    the day's volume. Biggest net share first."""
    by = {}
    for d in deals or []:
        if not d.get("quantity"):
            continue
        row = by.setdefault(d["symbol"], {"symbol": d["symbol"], "name": d.get("name", ""), "bought": 0, "sold": 0,
                                          "net_pct_of_day_volume": 0.0, "buyers": [], "sellers": []})
        buy = "BUY" in (d.get("side") or "").upper()
        row["bought" if buy else "sold"] += d["quantity"]
        row["net_pct_of_day_volume"] += (1 if buy else -1) * (d.get("pct_of_day_volume") or 0)
        names = row["buyers" if buy else "sellers"]
        if d.get("client") and d["client"] not in names:
            names.append(d["client"])
    for row in by.values():
        both = set(row["buyers"]) & set(row["sellers"])
        row["same_party_both_sides"] = sorted(both)[:3]          # in and out the same day: trading, not a position
        row["net"] = row["bought"] - row["sold"]
        row["net_pct_of_day_volume"] = round(row["net_pct_of_day_volume"], 1)
        row["buyers"], row["sellers"] = row["buyers"][:4], row["sellers"][:4]
    return sorted(by.values(), key=lambda r: -abs(r["net_pct_of_day_volume"]))


def name_index_from_snapshots(signals):
    """Company name -> symbol from the saved signals (no extra file read)."""
    return {norm_name(r.get("name", "")): sym for sym, r in (signals or {}).get("snapshots", {}).items() if r.get("name")}


# ---------- network ----------

def update(data_dir, http_get, today=None, log=print):
    """Fetch what is missing, recompute signals. Returns the list of today's deals."""
    mdir = data_dir / "market"
    ddir = mdir / "days"
    ddir.mkdir(parents=True, exist_ok=True)
    state_path = mdir / "state.json"
    try:
        state = json.loads(state_path.read_text())
    except (OSError, ValueError):
        state = {}
    closed = set(state.get("closed", []))          # dates NSE has no file for (weekends, holidays)
    now = datetime.datetime.now(IST)
    today = today or now.date()
    fetched = 0
    for back in range(HISTORY_DAYS, -1, -1):
        d = today - datetime.timedelta(days=back)
        key = d.isoformat()
        path = ddir / (key + ".csv.gz")
        if path.exists() or key in closed or d.weekday() >= 5:
            continue
        if back == 0 and now.hour < 18:
            continue                                # today's file appears after about 6:30 pm
        try:
            text = http_get(ARCHIVE + "products/content/sec_bhavdata_full_%s.csv" % d.strftime("%d%m%Y"))
            rows = parse_bhav(text)
            if len(rows) < 500:
                raise ValueError("only %d rows" % len(rows))
            save_day(path, rows)
            fetched += 1
        except urllib.error.HTTPError as e:
            if e.code == 404 and back >= 2:
                closed.add(key)                     # a holiday; do not ask again
            elif e.code != 404:
                log("market: %s failed: HTTP %d" % (key, e.code))
        except Exception as e:
            log("market: %s failed: %s" % (key, str(e)[:120]))
        time.sleep(0.3)
    cutoff = (today - datetime.timedelta(days=HISTORY_DAYS + 5)).isoformat()
    for p in ddir.glob("*.csv.gz"):
        if p.name[:10] < cutoff:
            p.unlink()
    state["closed"] = sorted(k for k in closed if k >= cutoff)

    files = sorted(ddir.glob("*.csv.gz"))
    latest = files[-1].name[:10] if files else ""
    deals = []
    if (fetched or state.get("signals_for") != latest or state.get("signals_version") != SIGNALS_VERSION
            or not (mdir / "universe.json").exists()):
        try:
            lists = {name: http_get(ARCHIVE + path) for name, path in INDEX_LISTS.items()}
            listed = http_get(ARCHIVE + "content/equities/EQUITY_L.csv")
            try:      # NSE Emerge (SME) companies are listed separately; without them their filings have no symbol
                sme = http_get(ARCHIVE + SME_LIST)
                listed += "\n" + "\n".join(sme.splitlines()[1:])
                log("market: SME list added (%d rows)" % (len(sme.splitlines()) - 1))
            except Exception as e:
                log("market: SME list not available: %s" % str(e)[:100])
            universe = parse_universe(listed, lists)
            (mdir / "universe.json").write_text(json.dumps(universe), encoding="utf-8")
        except Exception as e:
            log("market: universe lists failed: %s" % str(e)[:120])
            universe = load_universe(data_dir)
        signals = compute_signals([(f.name[:10], load_day(f)) for f in files], universe)
        if signals:
            try:
                d = datetime.date.fromisoformat(latest)
                signals["indices"] = parse_indices(
                    http_get(ARCHIVE + "content/indices/ind_close_all_%s.csv" % d.strftime("%d%m%Y")))
            except Exception as e:
                log("market: index file failed: %s" % str(e)[:120])
            if signals.get("indices"):      # one line a day, so index valuations build a history of their own
                hist = mdir / "index_history.jsonl"
                have = hist.read_text(encoding="utf-8") if hist.exists() else ""
                if ('"date": "%s"' % latest) not in have:
                    with open(hist, "a", encoding="utf-8") as fh:
                        fh.write(json.dumps({"date": latest, "indices": signals["indices"], "breadth": signals["breadth"]}) + "\n")
            for kind in ("bulk", "block"):
                try:
                    deals += parse_deals(http_get(ARCHIVE + "content/equities/%s.csv" % kind), kind)
                except Exception as e:
                    log("market: %s deals failed: %s" % (kind, str(e)[:120]))
            vols = signals.pop("volumes", {})
            for d in deals:      # how big the deal was against the day's trading in that stock
                if d.get("quantity") and vols.get(d["symbol"]):
                    d["pct_of_day_volume"] = round(100 * d["quantity"] / vols[d["symbol"]], 1)
            signals["deals"] = deals
            signals["deal_summary"] = deal_summary(deals)
            (mdir / "signals.json").write_text(json.dumps(signals), encoding="utf-8")
            state["signals_for"] = latest
            state["signals_version"] = SIGNALS_VERSION
            log("market: %d new days, signals for %s on %d days of history, %d stocks screened"
                % (fetched, latest, len(files), signals["stocks_screened"]))
    state_path.write_text(json.dumps(state), encoding="utf-8")
    return deals


def load_signals(data_dir):
    try:
        return json.loads((data_dir / "market" / "signals.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def load_universe(data_dir):
    try:
        return json.loads((data_dir / "market" / "universe.json").read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}
