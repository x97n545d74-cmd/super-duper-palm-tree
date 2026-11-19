"""Checks the scraped-data export: scraped fields only. No network."""
import datetime
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import export  # noqa: E402

NOW = datetime.datetime(2026, 11, 18, 12, tzinfo=datetime.timezone.utc)
ITEMS = [
    {"id": "a", "platform": "news", "source": "Mint companies", "title": "Tata Motors to buy Iveco unit", "text": "x" * 500,
     "url": "https://livemint.com/a", "author": "", "published_at": "2026-11-18T09:00:00Z", "collected_at": "2026-11-18T09:01:00Z",
     "tags": {"relevance": 5, "summary": "made by Claude"}, "watch": ["deal"], "symbols": ["TATAMOTORS"]},
    {"id": "b", "platform": "nse", "source": "NSE announcements", "title": "ABC Limited", "text": "order", "subject": "Bagging of orders",
     "url": "https://nsearchives.nseindia.com/a.pdf", "author": "", "published_at": "2026-11-18T08:00:00Z", "collected_at": "2026-11-18T08:01:00Z"},
    {"id": "c", "platform": "reddit", "source": "r/IndianStockMarket", "title": "old", "text": "", "url": "u", "author": "u1",
     "published_at": "2026-11-10T08:00:00Z", "collected_at": "2026-11-10T08:00:00Z"},
    {"id": "d", "platform": "deals", "source": "NSE bulk deals", "title": "row", "text": "", "url": "u", "author": "", "published_at": "", "collected_at": "2026-11-18T10:00:00Z"},
]
SIG = {"date": "2026-11-18", "indices": {"Nifty 50": {"close": 25227.95}}, "breadth": {"advancers": 450}, "screens": {"x": {}},
       "snapshots": {"ABC": {}}, "regime": {"label": "weak"},
       "deals": [{"date": "18-NOV-2026", "symbol": "ABC", "client": "FUND", "side": "BUY", "quantity": 1.0, "price": 2.0, "extra": "drop"}]}


class Export(unittest.TestCase):
    def test_only_scraped_fields(self):
        f = export.build(ITEMS, SIG, [{"date": "2026-11-18", "fpi": {"equity_net_cr": 11265.68}}], NOW)
        self.assertEqual([i["id"] for i in f["items"]], ["a", "b"])                     # old and deal rows left out
        a, b = f["items"]
        self.assertEqual(set(a), {"id", "time", "kind", "source", "headline", "excerpt", "url", "symbols"})
        self.assertEqual((len(a["excerpt"]), b["kind"], b["subject"]), (300, "filing", "Bagging of orders"))
        self.assertEqual(set(f["market"]), {"date", "indices", "breadth", "deals"})
        self.assertNotIn("extra", f["market"]["deals"][0])
        self.assertEqual(f["flows"][0]["fpi"]["equity_net_cr"], 11265.68)
        self.assertEqual(export.check(f), [])

    def test_prices_holdings_calendar_and_index_history(self):
        hold = [{"key": "a|2026-06-30", "company": "ABC Ltd", "symbol": "ABC", "as_on": "2026-06-30", "promoter_pct": 60.0,
                 "url": "u1", "detail": {"promoters": 60.0}},
                {"key": "a|2026-09-30", "company": "ABC Ltd", "symbol": "ABC", "as_on": "2026-09-30", "promoter_pct": 58.5,
                 "url": "u2", "detail": {"promoters": 58.5, "named_public_holders": [{"name": "Fund", "kind": "mutual fund", "pct": 1.2}]},
                 "tries": 1}]
        f = export.build(ITEMS, SIG, [], NOW,
                         prices=("2026-11-18", {"ABC": {"prev": 10.0, "close": 11.0, "high": 11.5, "low": 9.8, "volume": 1000.0,
                                                        "turnover": 1.1, "deliv": 48.2}}),
                         universe={"ABC": {"name": "ABC Limited", "industry": "", "index": ""}}, holdings=hold,
                         calendar=[{"date": "2026-11-20", "kind": "board meeting", "company": "ABC Ltd", "symbol": "ABC",
                                    "what": "results", "score": 3}],
                         index_history=[{"date": "2026-11-18", "indices": {}}, {"date": "2026-11-17", "indices": {}}])
        self.assertEqual(f["version"], 2)
        self.assertEqual(f["prices"]["stocks"][0], {"symbol": "ABC", "name": "ABC Limited", "prev_close": 10.0, "close": 11.0,
                                                    "high": 11.5, "low": 9.8, "volume": 1000.0, "turnover_lakh": 1.1,
                                                    "delivery_pct": 48.2})
        self.assertEqual(len(f["holdings"]), 1)                                       # latest file per company only
        self.assertEqual((f["holdings"][0]["as_on"], f["holdings"][0]["source"]), ("2026-09-30", "u2"))
        self.assertNotIn("tries", f["holdings"][0])
        self.assertNotIn("score", f["calendar"][0])
        self.assertEqual([r["date"] for r in f["index_history"]], ["2026-11-17", "2026-11-18"])
        self.assertEqual(export.check(f), [])
        empty = export.build([], None, [], NOW)
        self.assertEqual((empty["prices"], empty["holdings"], empty["calendar"]), (None, [], []))

    def test_check_catches_anything_that_is_not_scraped(self):
        self.assertEqual(export.check({"items": [{"tags": {}}], "x": {"scorecard": 1}}), ["scorecard", "tags"])


if __name__ == "__main__":
    unittest.main()
