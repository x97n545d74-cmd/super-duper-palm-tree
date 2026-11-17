"""Who is positioned how, from official daily files:

  NSE   participant-wise open interest: what foreign investors (FII), domestic institutions (DII),
        proprietary desks and clients hold in index and stock futures and options
  NSE   the list of stocks banned from new F&O positions
  NSDL  what foreign portfolio investors bought and sold in the cash market
  ECB   the rupee against the dollar (via frankfurter.app)

One line per trading day is kept in <data>/market/flows.jsonl, so every figure has a history.
"""
import csv
import datetime
import html
import io
import json
import re

ARCHIVE = "https://nsearchives.nseindia.com/"
NSDL = "https://www.fpi.nsdl.co.in/web/Reports/Latest.aspx"


def _num(s):
    s = str(s).replace(",", "").strip()
    neg = s.startswith("(") and s.endswith(")")
    try:
        v = float(s.strip("()"))
    except ValueError:
        return None
    return -v if neg else v


def parse_participants(text):
    """NSE's participant-wise open interest file -> {FII: {...}, DII: {...}, Pro: {...}, Client: {...}}."""
    lines = [l for l in text.splitlines() if l.strip()]
    start = next((n for n, l in enumerate(lines) if l.lower().startswith("client type")), None)
    if start is None:
        return None
    out = {}
    for r in csv.DictReader(io.StringIO("\n".join(lines[start:]))):
        r = {(k or "").strip(): (v or "").strip() for k, v in r.items()}
        who = r.get("Client Type", "")
        if who in ("FII", "DII", "Pro", "Client"):
            g = lambda k: _num(r.get(k, "")) or 0
            fl, fs = g("Future Index Long"), g("Future Index Short")
            out[who] = {
                "index_futures_long": fl, "index_futures_short": fs, "index_futures_net": fl - fs,
                "index_futures_long_pct": round(100 * fl / (fl + fs), 1) if fl + fs else None,
                "stock_futures_net": g("Future Stock Long") - g("Future Stock Short"),
                "index_calls_net": g("Option Index Call Long") - g("Option Index Call Short"),
                "index_puts_net": g("Option Index Put Long") - g("Option Index Put Short"),
            }
        elif who == "TOTAL":
            calls, puts = _num(r.get("Option Index Call Long", "")), _num(r.get("Option Index Put Long", ""))
            if calls and puts:
                out["index_put_call_ratio"] = round(puts / calls, 2)
    return out if "FII" in out else None


def parse_ban(text):
    return sorted(set(m.group(1) for m in re.finditer(r"^\s*\d+\s*,\s*([A-Z0-9&-]+)\s*$", text, re.M)))


def parse_fpi(page):
    """NSDL's daily FPI page -> {date, equity_net_cr, debt_net_cr, total_net_cr}. Amounts in rupees crore."""
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", page, re.S):
        cells = [html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)]
        if any(cells):
            rows.append(cells)
    date, section, out, debt = "", "", {}, 0.0
    for cells in rows:
        m = re.match(r"(\d{1,2}-[A-Za-z]{3}-\d{4})$", cells[0])
        if m and not date:
            try:
                date = datetime.datetime.strptime(m.group(1), "%d-%b-%Y").date().isoformat()
            except ValueError:
                pass
            cells = cells[1:]
        if len(cells) >= 5 and not cells[0].startswith(("Stock Exchange", "Primary", "Sub-total", "Total")):
            section = cells[0]                                   # "Equity", "Debt-General Limit", ...
        if cells and cells[0] == "Sub-total" and len(cells) >= 4:
            net = _num(cells[3])
            if net is None:
                continue
            if section == "Equity":
                out["equity_net_cr"] = net
            elif section.startswith("Debt"):
                debt += net
        if cells and cells[0] == "Total" and len(cells) >= 4 and _num(cells[3]) is not None:
            out["total_net_cr"] = _num(cells[3])
    if not date or "equity_net_cr" not in out:
        return None
    out.update(date=date, debt_net_cr=round(debt, 2))
    return out


def load_history(data_dir):
    path = data_dir / "market" / "flows.jsonl"
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return rows


def summary(history):
    """The latest day against the day before and the past weeks, in plain figures."""
    rows = sorted(history, key=lambda r: r["date"])
    if not rows:
        return None
    last, prev = rows[-1], (rows[-2] if len(rows) > 1 else None)
    fii, pfii = (last.get("participants") or {}).get("FII") or {}, ((prev or {}).get("participants") or {}).get("FII") or {}
    out = {"date": last["date"], "ban_list": last.get("ban_list", []), "usd_inr": last.get("usd_inr"),
           "index_put_call_ratio": (last.get("participants") or {}).get("index_put_call_ratio"),
           "participants": {k: v for k, v in (last.get("participants") or {}).items() if isinstance(v, dict)},
           "fpi": last.get("fpi"), "days_on_file": len(rows)}
    if fii:
        out["fii_index_futures_net"] = fii["index_futures_net"]
        out["fii_index_futures_long_pct"] = fii["index_futures_long_pct"]
        if pfii:
            out["fii_index_futures_net_change"] = fii["index_futures_net"] - pfii["index_futures_net"]
    eq = [(r["fpi"]["date"], r["fpi"]["equity_net_cr"]) for r in rows if r.get("fpi")]
    eq = sorted(dict(eq).items())                              # one figure per NSDL reporting date
    if eq:
        out["fpi_equity_net_cr"] = eq[-1][1]
        out["fpi_equity_net_5d_cr"] = round(sum(v for _, v in eq[-5:]), 2) if len(eq) >= 2 else None
        out["fpi_days"] = len(eq)
    words = []
    if fii.get("index_futures_long_pct") is not None:
        p = fii["index_futures_long_pct"]
        words.append("Foreign investors hold %s%% of their index futures long (%s)" % (
            p, "heavily short" if p < 30 else "net short" if p < 45 else "balanced" if p <= 55 else "net long"))
    if out.get("fpi_equity_net_cr") is not None:
        v = out["fpi_equity_net_cr"]
        words.append("they %s Rs %s crore of shares in the cash market on the latest reported day" % (
            "bought a net" if v >= 0 else "sold a net", "{:,.0f}".format(abs(v))))
    if out.get("index_put_call_ratio"):
        words.append("index put-call ratio %s" % out["index_put_call_ratio"])
    out["in_words"] = "; ".join(words)
    return out


def update(data_dir, http_get, date, log=print):
    """Fetch the day's files once the market file for `date` (YYYY-MM-DD) is in. Returns True if a row was added."""
    history = load_history(data_dir)
    if not date or any(r["date"] == date for r in history):
        return False
    d = datetime.date.fromisoformat(date)
    row = {"date": date}
    try:
        row["participants"] = parse_participants(http_get(ARCHIVE + "content/nsccl/fao_participant_oi_%s.csv" % d.strftime("%d%m%Y")))
    except Exception as e:
        log("flows: participant file failed: %s" % str(e)[:100])
    try:
        row["ban_list"] = parse_ban(http_get(ARCHIVE + "content/fo/fo_secban.csv"))
    except Exception as e:
        log("flows: ban list failed: %s" % str(e)[:100])
    try:
        row["fpi"] = parse_fpi(http_get(NSDL))
    except Exception as e:
        log("flows: NSDL page failed: %s" % str(e)[:100])
    try:
        row["usd_inr"] = json.loads(http_get("https://api.frankfurter.app/latest?from=USD&to=INR"))["rates"]["INR"]
    except Exception as e:
        log("flows: rupee rate failed: %s" % str(e)[:100])
    if not row.get("participants") and not row.get("fpi"):
        return False                                           # nothing usable yet: try again next round
    (data_dir / "market").mkdir(parents=True, exist_ok=True)
    with open(data_dir / "market" / "flows.jsonl", "a", encoding="utf-8") as fh:
        fh.write(json.dumps(row) + "\n")
    log("flows: saved %s (%s)" % (date, summary(history + [row])["in_words"]))
    return True
