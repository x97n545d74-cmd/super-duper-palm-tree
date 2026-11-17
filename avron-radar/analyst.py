"""The analyst's toolbox: technical indicators, price screens and the
fundamental formulas well-known investors use. Pure maths, no network.

Every function returns None when it lacks the data it needs, so a missing
number is never silently treated as zero.
"""
import math


# ---------- technical indicators (lists are oldest first) ----------

def sma(xs, n):
    return sum(xs[-n:]) / n if len(xs) >= n else None


def ema_series(xs, n):
    if len(xs) < n:
        return []
    k = 2 / (n + 1)
    out = [sum(xs[:n]) / n]
    for x in xs[n:]:
        out.append(x * k + out[-1] * (1 - k))
    return out


def rsi(closes, n=14):
    """Wilder's RSI."""
    if len(closes) <= n:
        return None
    gains = [max(b - a, 0) for a, b in zip(closes, closes[1:])]
    losses = [max(a - b, 0) for a, b in zip(closes, closes[1:])]
    ag, al = sum(gains[:n]) / n, sum(losses[:n]) / n
    for g, l in zip(gains[n:], losses[n:]):
        ag, al = (ag * (n - 1) + g) / n, (al * (n - 1) + l) / n
    if al == 0:
        return 100.0 if ag > 0 else 50.0     # a flat price is neutral, not overbought
    return 100 - 100 / (1 + ag / al)


def macd(closes, fast=12, slow=26, signal=9):
    """Returns (macd line, signal line, histogram) for the latest day."""
    f, s = ema_series(closes, fast), ema_series(closes, slow)
    if not s:
        return None
    line = [a - b for a, b in zip(f[-len(s):], s)]
    sig = ema_series(line, signal)
    if not sig:
        return None
    return line[-1], sig[-1], line[-1] - sig[-1]


def atr(highs, lows, closes, n=14):
    """Wilder's average true range."""
    if len(closes) <= n:
        return None
    trs = [max(h - l, abs(h - pc), abs(l - pc))
           for h, l, pc in zip(highs[1:], lows[1:], closes[:-1])]
    a = sum(trs[:n]) / n
    for t in trs[n:]:
        a = (a * (n - 1) + t) / n
    return a


def bollinger(closes, n=20, width=2):
    """Returns (lower band, middle, upper band)."""
    if len(closes) < n:
        return None
    w = closes[-n:]
    mid = sum(w) / n
    sd = math.sqrt(sum((x - mid) ** 2 for x in w) / n)
    return mid - width * sd, mid, mid + width * sd


def pct(a, b):
    return (a / b - 1) * 100 if a is not None and b else None


def snapshot(bars):
    """bars: list of dicts oldest first with close, high, low, volume and optional deliv (percent).
    Returns the latest indicator values, or None with fewer than 30 days."""
    if len(bars) < 30:
        return None
    c = [b["close"] for b in bars]
    h = [b["high"] for b in bars]
    l = [b["low"] for b in bars]
    v = [b["volume"] for b in bars]
    d = [b["deliv"] for b in bars if b.get("deliv") is not None]
    year = bars[-250:]
    hi52, lo52 = max(b["high"] for b in year), min(b["low"] for b in year)
    vol20 = sum(v[-21:-1]) / 20
    m = macd(c)
    a = atr(h, l, c)
    s = {
        "close": c[-1],
        "change": pct(c[-1], c[-2]),
        "sma20": sma(c, 20), "sma50": sma(c, 50), "sma150": sma(c, 150), "sma200": sma(c, 200),
        "sma200_month_ago": sma(c[:-20], 200),
        "sma50_week_ago": sma(c[:-5], 50), "sma200_week_ago": sma(c[:-5], 200),
        "rsi": rsi(c),
        "macd_hist": m[2] if m else None,
        "atr_pct": a / c[-1] * 100 if a else None,
        "high52": hi52, "low52": lo52,
        "from_high": pct(c[-1], hi52), "from_low": pct(c[-1], lo52),
        "prior_high20": max(h[-21:-1]),
        "prior_high250": max(h[-251:-1]) if len(h) >= 120 else None,
        "vol_ratio": v[-1] / vol20 if vol20 else None,
        "deliv": d[-1] if d else None,
        "deliv_avg20": sum(d[-21:-1]) / 20 if len(d) >= 21 else None,
        "ret_1m": pct(c[-1], c[-22]) if len(c) > 22 else None,
        "ret_3m": pct(c[-1], c[-64]) if len(c) > 64 else None,
        "ret_6m": pct(c[-1], c[-127]) if len(c) > 127 else None,
        "ret_12m_ex_1m": pct(c[-22], c[-250]) if len(c) >= 250 else None,
        "days": len(bars),
    }
    return s


def gt(a, b):
    return a is not None and b is not None and a > b


# Each screen: name -> (what it means in plain words, test on a snapshot)
SCREENS = {
    "trend_template": (
        "Minervini trend template: price above the 50, 150 and 200-day averages, the 200-day rising, "
        "at least 30% above the 52-week low and within 25% of the 52-week high",
        lambda s: gt(s["close"], s["sma50"]) and gt(s["sma50"], s["sma150"]) and gt(s["sma150"], s["sma200"])
        and gt(s["sma200"], s["sma200_month_ago"]) and gt(s["from_low"], 30) and gt(s["from_high"], -25)),
    "breakout_52w": (
        "Closed above the highest high of the past year on at least 1.5 times normal volume",
        lambda s: gt(s["close"], s["prior_high250"]) and gt(s["vol_ratio"], 1.5)),
    "breakout_20d": (
        "Closed above the highest high of the past 20 days on at least twice normal volume",
        lambda s: gt(s["close"], s["prior_high20"]) and gt(s["vol_ratio"], 2)),
    "golden_cross": (
        "The 50-day average crossed above the 200-day average in the past week",
        lambda s: gt(s["sma50"], s["sma200"]) and gt(s["sma200_week_ago"], s["sma50_week_ago"])),
    "death_cross": (
        "The 50-day average crossed below the 200-day average in the past week",
        lambda s: gt(s["sma200"], s["sma50"]) and gt(s["sma50_week_ago"], s["sma200_week_ago"])),
    "volume_shock": (
        "Volume at least three times normal with a price move of 3% or more",
        lambda s: gt(s["vol_ratio"], 3) and s["change"] is not None and abs(s["change"]) >= 3),
    "delivery_spike": (
        "Price up with delivery above 50% and at least 1.5 times its 20-day average (buyers taking shares home)",
        lambda s: gt(s["change"], 0) and gt(s["deliv"], 50) and s["deliv_avg20"]
        and s["deliv"] >= 1.5 * s["deliv_avg20"]),
    "oversold_in_uptrend": (
        "RSI below 30 while the price is still above its 200-day average",
        lambda s: s["rsi"] is not None and s["rsi"] < 30 and gt(s["close"], s["sma200"])),
    "overbought": (
        "RSI above 80",
        lambda s: gt(s["rsi"], 80)),
}


def run_screens(s):
    return [name for name, (_, test) in SCREENS.items() if test(s)]


def momentum_ranks(snapshots):
    """12-month return skipping the latest month, as a percentile 0-100 across all stocks."""
    have = sorted((s["ret_12m_ex_1m"], sym) for sym, s in snapshots.items() if s.get("ret_12m_ex_1m") is not None)
    n = len(have)
    return {sym: round(i / (n - 1) * 100) if n > 1 else 50 for i, (_, sym) in enumerate(have)}


# ---------- fundamental formulas ----------

def _all(*xs):
    return all(x is not None for x in xs)


def cagr(start, end, years):
    if not _all(start, end, years) or start <= 0 or end <= 0 or years <= 0:
        return None
    return ((end / start) ** (1 / years) - 1) * 100


def graham_number(eps, book_value_per_share):
    """Benjamin Graham: the most a defensive investor should pay. sqrt(22.5 x EPS x BVPS)."""
    if not _all(eps, book_value_per_share) or eps <= 0 or book_value_per_share <= 0:
        return None
    return math.sqrt(22.5 * eps * book_value_per_share)


def graham_value(eps, growth_pct, bond_yield_pct):
    """Graham's revised growth formula: EPS x (8.5 + 2g) x 4.4 / Y."""
    if not _all(eps, growth_pct, bond_yield_pct) or bond_yield_pct <= 0:
        return None
    return eps * (8.5 + 2 * growth_pct) * 4.4 / bond_yield_pct


def peg(pe, growth_pct):
    """Peter Lynch: P/E divided by earnings growth. Below 1 is cheap for the growth."""
    if not _all(pe, growth_pct) or growth_pct <= 0 or pe <= 0:
        return None
    return pe / growth_pct


def roe(net_profit, equity):
    return net_profit / equity * 100 if _all(net_profit, equity) and equity > 0 else None


def roce(ebit, total_assets, current_liabilities):
    if not _all(ebit, total_assets, current_liabilities) or total_assets - current_liabilities <= 0:
        return None
    return ebit / (total_assets - current_liabilities) * 100


def dupont(net_profit, revenue, total_assets, equity):
    """ROE split into margin x asset turnover x leverage."""
    if not _all(net_profit, revenue, total_assets, equity) or min(revenue, total_assets, equity) <= 0:
        return None
    return {"net_margin": net_profit / revenue, "asset_turnover": revenue / total_assets,
            "equity_multiplier": total_assets / equity, "roe_pct": net_profit / equity * 100}


def interest_coverage(ebit, interest):
    return ebit / interest if _all(ebit, interest) and interest > 0 else None


def magic_formula(ebit, enterprise_value, net_working_capital, net_fixed_assets):
    """Joel Greenblatt: earnings yield (EBIT/EV) and return on capital. Rank both, buy the best combined."""
    if not _all(ebit, enterprise_value, net_working_capital, net_fixed_assets):
        return None
    capital = net_working_capital + net_fixed_assets
    if enterprise_value <= 0 or capital <= 0:
        return None
    return {"earnings_yield_pct": ebit / enterprise_value * 100, "return_on_capital_pct": ebit / capital * 100}


def piotroski(cur, prev):
    """Joseph Piotroski's F-score, 0 to 9. cur and prev are dicts for this year and last year with:
    net_profit, cfo, total_assets, long_term_debt, current_assets, current_liabilities, shares,
    gross_profit, revenue. Returns (score, list of the tests passed)."""
    keys = ("net_profit", "cfo", "total_assets", "long_term_debt", "current_assets",
            "current_liabilities", "shares", "gross_profit", "revenue")
    if any(cur.get(k) is None or prev.get(k) is None for k in keys):
        return None
    if min(cur["total_assets"], prev["total_assets"], cur["current_liabilities"],
           prev["current_liabilities"], cur["revenue"], prev["revenue"]) <= 0:
        return None
    roa, roa0 = cur["net_profit"] / cur["total_assets"], prev["net_profit"] / prev["total_assets"]
    tests = {
        "profit is positive": cur["net_profit"] > 0,
        "operating cash flow is positive": cur["cfo"] > 0,
        "return on assets improved": roa > roa0,
        "cash flow exceeds profit": cur["cfo"] > cur["net_profit"],
        "long-term debt ratio fell": cur["long_term_debt"] / cur["total_assets"] < prev["long_term_debt"] / prev["total_assets"],
        "current ratio improved": cur["current_assets"] / cur["current_liabilities"] > prev["current_assets"] / prev["current_liabilities"],
        "no new shares issued": cur["shares"] <= prev["shares"],
        "gross margin improved": cur["gross_profit"] / cur["revenue"] > prev["gross_profit"] / prev["revenue"],
        "asset turnover improved": cur["revenue"] / cur["total_assets"] > prev["revenue"] / prev["total_assets"],
    }
    passed = [k for k, ok in tests.items() if ok]
    return len(passed), passed


def altman_z(working_capital, retained_earnings, ebit, market_cap, total_liabilities, revenue, total_assets):
    """Edward Altman's Z-score for listed manufacturers. Above 2.99 safe, below 1.81 distress."""
    xs = (working_capital, retained_earnings, ebit, market_cap, total_liabilities, revenue, total_assets)
    if not _all(*xs) or total_assets <= 0 or total_liabilities <= 0:
        return None
    return (1.2 * working_capital / total_assets + 1.4 * retained_earnings / total_assets
            + 3.3 * ebit / total_assets + 0.6 * market_cap / total_liabilities + revenue / total_assets)


def beneish_m(cur, prev):
    """Messod Beneish's M-score for earnings manipulation. Above -1.78 is a warning sign.
    cur and prev need: receivables, revenue, gross_profit, current_assets, ppe, total_assets,
    depreciation, sga, net_profit, cfo, current_liabilities, long_term_debt."""
    keys = ("receivables", "revenue", "gross_profit", "current_assets", "ppe", "total_assets",
            "depreciation", "sga", "net_profit", "cfo", "current_liabilities", "long_term_debt")
    if any(cur.get(k) is None or prev.get(k) is None for k in keys):
        return None
    try:
        dsri = (cur["receivables"] / cur["revenue"]) / (prev["receivables"] / prev["revenue"])
        gmi = (prev["gross_profit"] / prev["revenue"]) / (cur["gross_profit"] / cur["revenue"])
        aq = lambda y: 1 - (y["current_assets"] + y["ppe"]) / y["total_assets"]
        aqi = aq(cur) / aq(prev)
        sgi = cur["revenue"] / prev["revenue"]
        dep = lambda y: y["depreciation"] / (y["depreciation"] + y["ppe"])
        depi = dep(prev) / dep(cur)
        sgai = (cur["sga"] / cur["revenue"]) / (prev["sga"] / prev["revenue"])
        lev = lambda y: (y["current_liabilities"] + y["long_term_debt"]) / y["total_assets"]
        lvgi = lev(cur) / lev(prev)
        tata = (cur["net_profit"] - cur["cfo"]) / cur["total_assets"]
    except ZeroDivisionError:
        return None
    return (-4.84 + 0.92 * dsri + 0.528 * gmi + 0.404 * aqi + 0.892 * sgi + 0.115 * depi
            - 0.172 * sgai + 4.679 * tata - 0.327 * lvgi)


def dcf_value(fcf, growth_pct, years, terminal_growth_pct, discount_pct):
    """Two-stage discounted cash flow: value today of the business's future free cash flow."""
    if not _all(fcf, growth_pct, years, terminal_growth_pct, discount_pct) or discount_pct <= terminal_growth_pct:
        return None
    g, tg, r = growth_pct / 100, terminal_growth_pct / 100, discount_pct / 100
    value, cash = 0.0, fcf
    for y in range(1, int(years) + 1):
        cash *= 1 + g
        value += cash / (1 + r) ** y
    return value + cash * (1 + tg) / (r - tg) / (1 + r) ** int(years)


def implied_growth(market_value, fcf, years=10, terminal_growth_pct=5, discount_pct=12):
    """Reverse DCF: the yearly growth the current price already assumes."""
    if not _all(market_value, fcf) or fcf <= 0 or market_value <= 0:
        return None
    lo, hi = -50.0, 100.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if dcf_value(fcf, mid, years, terminal_growth_pct, discount_pct) < market_value:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def position_size(capital, risk_pct, entry, stop):
    """Shares to buy so that hitting the stop loses only risk_pct of capital."""
    if not _all(capital, risk_pct, entry, stop) or entry <= stop:
        return None
    return int(capital * risk_pct / 100 / (entry - stop))


def kelly(win_rate, avg_win, avg_loss):
    """Kelly fraction of capital per trade, from a strategy's own record. Most traders use half of it or less."""
    if not _all(win_rate, avg_win, avg_loss) or avg_loss <= 0 or avg_win <= 0:
        return None
    b = avg_win / avg_loss
    return win_rate - (1 - win_rate) / b
