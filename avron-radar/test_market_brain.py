"""Checks market data handling and the filing analyst with samples, no network.
Run: cd avron-radar && python3 -m unittest"""
import datetime
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import brain   # noqa: E402
import market  # noqa: E402
import radar   # noqa: E402

BHAV = """SYMBOL, SERIES, DATE1, PREV_CLOSE, OPEN_PRICE, HIGH_PRICE, LOW_PRICE, LAST_PRICE, CLOSE_PRICE, AVG_PRICE, TTL_TRD_QNTY, TURNOVER_LACS, NO_OF_TRADES, DELIV_QTY, DELIV_PER
ABC, EQ, 16-Nov-2026, 100.00, 101.00, 106.00, 99.50, 105.00, 105.00, 103.00, 250000, 257.50, 4100, 150000, 60.00
ABC, GB, 16-Nov-2026, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00, 10, 0.10, 1, -, -
SMEX, SM, 16-Nov-2026, 50.00, 50.00, 52.00, 49.00, 51.00, 51.00, 50.50, 4000, 2.02, 12, -, -
"""
NSE_FEED = b"""<rss version="2.0"><channel>
<item><title>ABC Limited</title><link>https://nsearchives.nseindia.com/corporate/ABC_1.pdf</link>
<description>ABC Limited has informed the Exchange regarding receipt of an order|SUBJECT: Bagging/Receiving of orders/contracts</description>
<pubDate>16-Nov-2026 09:14:05</pubDate></item>
<item><title>ABC Limited</title><link>https://nsearchives.nseindia.com/corporate/ABC_2.pdf</link>
<description>Copy of Newspaper Publication|SUBJECT: Copy of Newspaper Publication</description>
<pubDate>16-Nov-2026 09:20:00</pubDate></item>
</channel></rss>"""


def days(n, sym="ABC", start=100.0, step=1.004, split_at=None):
    out, close, d = [], start, datetime.date(2025, 1, 1)
    for i in range(n):
        prev, close = close, close * step
        if i == split_at:
            prev, close = prev / 2, close / 2          # a 1:1 bonus: NSE restates the previous close
        out.append(((d + datetime.timedelta(days=i)).isoformat(),
                    {sym: {"prev": prev, "close": close, "high": close * 1.01, "low": close * 0.99,
                           "volume": 1000.0, "turnover": 500.0, "deliv": 40.0}}))
    return out


class Market(unittest.TestCase):
    def test_parse_bhav_keeps_shares_only_and_handles_missing_delivery(self):
        rows = market.parse_bhav(BHAV)
        self.assertEqual(set(rows), {"ABC", "SMEX"})
        self.assertEqual((rows["ABC"]["close"], rows["ABC"]["deliv"], rows["ABC"]["turnover"]), (105.0, 60.0, 257.5))
        self.assertIsNone(rows["SMEX"]["deliv"])

    def test_day_file_round_trip(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = pathlib.Path(tmp) / "d.csv.gz"
            rows = market.parse_bhav(BHAV)
            market.save_day(p, rows)
            self.assertEqual(market.load_day(p), rows)

    def test_bonus_issue_is_adjusted_so_it_is_not_a_crash(self):
        bars = market.build_series(days(60, split_at=30))["ABC"]
        moves = [b["close"] / a["close"] - 1 for a, b in zip(bars, bars[1:])]
        self.assertLess(max(abs(m) for m in moves), 0.01)       # no fake -50% day
        self.assertAlmostEqual(bars[-1]["close"], bars[-1]["raw_close"])

    def test_signals_for_a_steady_uptrend(self):
        sig = market.compute_signals(days(260), {"ABC": {"name": "ABC Limited", "industry": "Capital Goods", "index": "smallcap250"}})
        self.assertEqual(sig["stocks_screened"], 1)
        self.assertEqual(sig["screens"]["trend_template"]["stocks"][0]["symbol"], "ABC")
        self.assertEqual(sig["screens"]["trend_template"]["stocks"][0]["industry"], "Capital Goods")
        self.assertEqual(sig["breadth"]["pct_above_200dma"], 100.0)
        json.dumps(sig)                                           # must be saveable

    def test_illiquid_stocks_are_not_screened(self):
        d = days(260)
        for _, rows in d:
            rows["ABC"]["turnover"] = 5.0
        self.assertEqual(market.compute_signals(d, {})["stocks_screened"], 0)

    def test_deals_universe_and_names(self):
        deals = market.parse_deals("Date,Symbol,Security Name,Client Name,Buy/Sell,Quantity Traded,Trade Price / Wght. Avg. Price,Remarks\n"
                                   "16-NOV-2026,ABC,ABC Limited,BIG FUND,BUY,\"1,20,000\",105.5,-\n", "bulk")
        self.assertEqual((deals[0]["quantity"], deals[0]["price"], deals[0]["side"]), (120000.0, 105.5, "BUY"))
        self.assertEqual(market.parse_deals("Date,Symbol,Security Name,Client Name,Buy/Sell,Quantity Traded,Trade Price / Wght. Avg. Price\nNO RECORDS,,,,,,\n", "block"), [])
        uni = market.parse_universe("SYMBOL,NAME OF COMPANY, SERIES\nABC,ABC Limited,EQ\n",
                                    {"smallcap250": "Company Name,Industry,Symbol,Series,ISIN Code\nABC Ltd.,Capital Goods,ABC,EQ,X\n"})
        self.assertEqual(uni["ABC"], {"name": "ABC Limited", "industry": "Capital Goods", "index": "smallcap250"})
        self.assertEqual(market.name_index(uni)[market.norm_name("ABC Ltd")], "ABC")


class Brain(unittest.TestCase):
    def setUp(self):
        self.items = radar.parse_rss(NSE_FEED, "nse", "NSE announcements")
        for i in self.items:
            i["collected_at"] = i["published_at"]

    def test_nse_feed_time_subject_and_distinct_ids(self):
        a, b = self.items
        self.assertEqual(a["published_at"], "2026-11-16T03:44:05Z")       # 09:14 India time
        self.assertEqual(a["subject"], "Bagging/Receiving of orders/contracts")
        self.assertNotEqual(a["id"], b["id"])

    def test_picks_the_order_and_skips_the_newspaper_copy(self):
        uni = {"ABC": {"name": "ABC Limited", "industry": "", "index": "smallcap250"}}
        now = datetime.datetime(2026, 11, 16, 6, 0, tzinfo=datetime.timezone.utc)
        picked = brain.pick_filings(self.items, set(), uni, market.name_index(uni), 5, now)
        self.assertEqual([(i["url"][-9:], sym) for i, sym in picked], [("ABC_1.pdf", "ABC")])
        self.assertEqual(brain.pick_filings(self.items, {picked[0][0]["id"]}, uni, {}, 5, now), [])
        late = now + datetime.timedelta(days=2)
        self.assertEqual(brain.pick_filings(self.items, set(), uni, {}, 5, late), [])

    def test_one_read_per_event_prefers_the_document_over_its_xbrl_copy(self):
        now = datetime.datetime(2026, 11, 16, 6, 0, tzinfo=datetime.timezone.utc)
        order = self.items[0]
        xbrl = dict(order, id="x", url="https://nsearchives.nseindia.com/corporate/xbrl/ABC_1.xml",
                    subject="Bagging/Receiving of orders/contracts (SEBI LODR)-XBRL")
        picked = brain.pick_filings([xbrl, order], set(), {}, {}, 5, now)
        self.assertEqual([i["url"][-9:] for i, _ in picked], ["ABC_1.pdf"])
        done = {brain.event_key("ABC Limited", order["subject"])}
        self.assertEqual(brain.pick_filings([xbrl, order], set(), {}, {}, 5, now, done_events=done), [])
        self.assertNotEqual(brain.event_key("ABC Limited", "Acquisition"), brain.event_key("ABC Limited", order["subject"]))

    def test_indicator_periods_are_not_flagged_as_unsourced_numbers(self):
        a = {"headline": "ABC: x", "read": "", "price_context": "Below its 200-day average and near its 52-week low.",
             "facts": [], "document_read": True}
        self.assertEqual(brain.check_read(a, {"title": "", "text": ""}, None)["unsupported_numbers"], [])

    def test_parse_read_cleans_and_rejects(self):
        self.assertIsNone(brain.parse_read("SKIP"))
        a = brain.parse_read('Here: {"headline":"ABC: order of Rs 120 crore","category":"weird","materiality":"9",'
                             '"tone":"great","facts":["Order value Rs 120 crore"],"numbers":{"order_value_cr":120,"x":"n/a"},"document_read":true}')
        self.assertEqual((a["category"], a["materiality"], a["tone"]), ("other", 5, "neutral"))
        self.assertEqual(a["numbers"], {"order_value_cr": 120})

    def test_read_filings_respects_budget_and_saves(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            for i in self.items:      # make them "today" so the 24-hour window keeps them
                i["published_at"] = radar.iso(radar.now_utc())
            reply = json.dumps({"headline": "ABC: order", "category": "order", "facts": ["f"], "read": "r",
                                "materiality": 4, "tone": "positive", "document_read": True})
            asked = []
            n = brain.read_filings(tmp, self.items, {"filings_per_run": 4, "daily_filing_reads": 40},
                                   ask=lambda p: (asked.append(p), reply)[1], log=lambda *_: None)
            self.assertEqual((n, len(asked)), (1, 1))
            self.assertIn("ABC_1.pdf", asked[0])
            self.assertEqual(brain.load_analyses(tmp)[0]["headline"], "ABC: order")
            again = brain.read_filings(tmp, self.items, {}, ask=lambda p: reply, log=lambda *_: None)
            self.assertEqual(again, 0)                                 # already read
            none = brain.read_filings(tmp, self.items, {"daily_filing_reads": 1}, ask=lambda p: reply, log=lambda *_: None)
            self.assertEqual(none, 0)                                  # budget used up

    def test_triage_reorders_drops_noise_and_survives_a_bad_reply(self):
        c = [({"title": "A"}, "A", None), ({"title": "B"}, "B", None), ({"title": "C"}, "C", None)]
        best = brain.triage(c, lambda p: '[{"n":1,"score":1},{"n":2,"score":5},{"n":3,"score":3}]')
        self.assertEqual([x[1] for x in best], ["B", "C"])                    # A scored 1: not worth a read
        self.assertEqual(brain.triage(c, lambda p: "sorry, no"), c)
        self.assertEqual(brain.triage(c, lambda p: (_ for _ in ()).throw(OSError("net"))), c)

    def test_company_memory_is_newest_first_and_matched_by_symbol_or_name(self):
        an = [{"symbol": "ABC", "company": "ABC Limited", "published_at": "2026-11-01", "headline": "old", "numbers": {}},
              {"symbol": "", "company": "ABC Ltd", "published_at": "2026-11-10", "headline": "new", "numbers": {"order_value_cr": 5}},
              {"symbol": "XYZ", "company": "XYZ Limited", "published_at": "2026-11-12", "headline": "other"}]
        h = brain.company_history(an, "ABC", "ABC Limited")
        self.assertEqual([x["headline"] for x in h], ["new", "old"])
        self.assertIn("earlier reads", brain.filing_prompt(self.items[0], "ABC", None, [], h))
        self.assertNotIn("earlier reads", brain.filing_prompt(self.items[0], "ABC", None, [], []))

    def test_check_read_flags_numbers_with_no_source(self):
        item = {"title": "ABC Limited", "text": "order", "published_at": "2026-11-16T03:44:05Z"}
        good = {"headline": "ABC: order of Rs 120 crore", "read": "Stock is 4.2% below its high.", "price_context": "",
                "facts": ["Order value Rs 120 crore over 18 months"], "document_read": True}
        self.assertEqual(brain.check_read(dict(good), item, {"from_high": -4.2})["confidence"], "high")
        bad = dict(good, read="That is 35% of last year's revenue of Rs 340 crore.")
        out = brain.check_read(bad, item, None)
        self.assertEqual((out["unsupported_numbers"], out["confidence"]), (["35", "340"], "low"))
        self.assertEqual(brain.check_read(dict(good, document_read=False), item, None)["confidence"], "low")

    def test_fact_check_lowers_confidence_on_a_contradiction(self):
        a = {"url": "u", "facts": ["Order Rs 120 crore", "18 months"], "confidence": "high"}
        brain.verify_read(a, lambda p: '[{"n":1,"verdict":"supported","note":""},{"n":2,"verdict":"contradicted","note":"says 24 months"}]')
        self.assertEqual((a["verified"]["supported"], a["verified"]["checked"], a["confidence"]), (1, 2, "low"))
        b = {"url": "u", "facts": ["x"], "confidence": "high"}
        brain.verify_read(b, lambda p: "garbage")
        self.assertEqual((b["confidence"], "verified" in b), ("high", False))  # no check is not a failed check

    def test_read_filings_runs_triage_and_fact_check(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            for i in self.items:
                i["published_at"] = radar.iso(radar.now_utc())
            more = dict(self.items[0], id="second", url="https://nsearchives.nseindia.com/corporate/ABC_9.pdf",
                        text="ABC Limited has informed the Exchange regarding acquisition|SUBJECT: Acquisition")
            reply = json.dumps({"headline": "ABC: acquisition", "category": "acquisition", "facts": ["f 1"], "read": "r",
                                "materiality": 5, "tone": "mixed", "document_read": True})
            seen = {"triage": 0, "verify": 0, "read": []}
            def tri(p):
                seen["triage"] += 1
                return '[{"n":1,"score":2},{"n":2,"score":5}]' if "ABC_9" not in p and p.index("acquisition") > p.index("order") else '[{"n":1,"score":5},{"n":2,"score":2}]'
            n = brain.read_filings(tmp, self.items + [more], {"filings_per_run": 1},
                                   ask=lambda p: (seen["read"].append(p), reply)[1], log=lambda *_: None, ask_triage=tri,
                                   ask_verify=lambda p: (seen.__setitem__("verify", seen["verify"] + 1), '[{"n":1,"verdict":"supported","note":""}]')[1])
            self.assertEqual((n, seen["triage"], seen["verify"], len(seen["read"])), (1, 1, 1, 1))
            self.assertIn("ABC_9.pdf", seen["read"][0])                       # triage put the acquisition first
            saved = brain.load_analyses(tmp)[0]
            self.assertEqual((saved["confidence"], saved["verified"]["supported"]), ("high", 1))

    def test_brief_check_and_self_correction(self):
        data = {"market": {"screens": {"x": {"stocks": [{"symbol": "ABC"}]}}}}
        good = "## Market regime\nx\n## What changed in businesses\nx\n## Setups on the screens\nABC broke out\n## Tomorrow's checklist\nx"
        self.assertEqual(brain.check_brief(good, data, {"ABC", "XYZ"}), [])
        bad = good.replace("ABC broke out", "XYZ is a strong buy with a target price")
        probs = brain.check_brief(bad, data, {"ABC", "XYZ"})
        self.assertEqual(len(probs), 3)
        self.assertIn("stock not in the data: XYZ", probs)

    def test_chatter_spike_and_name_resolution(self):
        idx = {market.norm_name("ABC Limited"): "ABC"}
        self.assertEqual(brain.resolve_symbols(["ABC Ltd", "abc", "Unknown Co"], idx), ["ABC"])
        now = datetime.datetime(2026, 11, 17, 12, tzinfo=datetime.timezone.utc)
        post = lambda when: {"platform": "reddit", "published_at": when, "tags": {"companies": ["ABC Ltd"]}}
        items = [post("2026-11-17T0%d:00:00Z" % h) for h in range(4)] + [post("2026-11-13T00:00:00Z")]
        (row,) = brain.buzz(items, idx, now)
        self.assertEqual((row["symbol"], row["mentions_24h"], row["platforms"]), ("ABC", 4, ["reddit"]))
        self.assertEqual(brain.buzz(items[:2], idx, now), [])                 # two mentions is not a spike

    def test_claude_call_retries_when_busy_and_counts_tokens(self):
        import io, urllib.error
        old = brain.urllib.request.urlopen
        class Resp:
            def __init__(self, body): self.body = body
            def __enter__(self): return self
            def __exit__(self, *a): return False
            def read(self): return json.dumps(self.body).encode()
        calls = []
        def fake(req, timeout=0):
            calls.append(json.loads(req.data))
            if len(calls) == 1:
                raise urllib.error.HTTPError("u", 529, "busy", {}, io.BytesIO(b""))
            return Resp({"stop_reason": "end_turn", "content": [{"type": "text", "text": "hi"}],
                         "usage": {"input_tokens": 9, "output_tokens": 2, "cache_read_input_tokens": 100}})
        brain.urllib.request.urlopen = fake
        try:
            del brain.USAGE[:]
            body = {"model": "m", "messages": []}
            self.assertEqual(brain._post(body, {}, sleep=lambda s: None)["stop_reason"], "end_turn")
            self.assertEqual(brain.call_claude("q", "k", "sys", model="m", purpose="t"), "hi")
            self.assertEqual(calls[-1]["system"][0]["cache_control"], {"type": "ephemeral"})
            self.assertEqual(brain.USAGE[-1], {"model": "m", "purpose": "t", "in": 9, "out": 2, "cache_read": 100, "cache_write": 0})
        finally:
            brain.urllib.request.urlopen = old
            del brain.USAGE[:]

    def test_brief_schedule(self):
        ist = brain.IST
        evening = datetime.datetime(2026, 11, 16, 19, 30, tzinfo=ist)
        morning = datetime.datetime(2026, 11, 17, 7, 30, tzinfo=ist)
        self.assertEqual(brain.brief_due({}, {"date": "2026-11-16"}, evening), "2026-11-16-close")
        self.assertEqual(brain.brief_due({"briefs": ["2026-11-16-close"]}, {"date": "2026-11-16"}, evening), "")
        self.assertEqual(brain.brief_due({}, {"date": "2026-11-16"}, morning), "2026-11-17-morning")
        self.assertEqual(brain.brief_due({}, None, evening), "")

    def test_deal_rows_for_the_feed(self):
        d = {"kind": "bulk", "date": "16-NOV-2026", "symbol": "ABC", "name": "ABC Limited", "client": "BIG FUND",
             "side": "BUY", "quantity": 120000.0, "price": 105.5}
        (row,) = radar.deal_items([d], "2026-11-16T14:00:00Z")
        self.assertEqual(row["title"], "ABC: BIG FUND buy 120,000 shares at Rs 105.5")
        self.assertEqual(row["platform"], "deals")


if __name__ == "__main__":
    unittest.main()
