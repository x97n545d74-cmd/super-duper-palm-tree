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
