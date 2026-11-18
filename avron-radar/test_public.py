"""Checks the public feed: only the chosen parts, facts only, nothing private. No network."""
import json
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import public  # noqa: E402

SIG = {"date": "2026-11-17", "stocks_screened": 1677,
       "indices": {"Nifty 50": {"close": 25387.4, "change_pct": 0.38, "pe": 20.68}, "Unwanted": {"close": 1}},
       "breadth": {"advancers": 827, "decliners": 833, "pct_above_200dma": 45.7, "new_52w_highs": 25, "new_52w_lows": 2},
       "sectors": [{"industry": "Realty", "stocks": 17, "avg_today": 2.1, "avg_1m": 6.0, "avg_3m": -5.5, "pct_above_200dma": 35, "in_uptrend": 2}],
       "snapshots": {"ABC": {"close": 1}}, "screens": {"trend_template": {}}, "regime": {"label": "weak"}}
FLOWS = {"date": "2026-11-17", "fii_index_futures_long_pct": 33.4, "index_put_call_ratio": 1.15, "usd_inr": 93.93,
         "ban_list": ["KAYNES"], "fpi": {"date": "2026-11-17", "equity_net_cr": 5107.61, "debt_net_cr": -2666.73}}
DIGEST = [{"title": "Tata Motors to buy Iveco unit", "url": "https://www.livemint.com/x", "outlets": 3, "area": "deal", "kind": "fact", "when": "2026-11-17T09:00:00Z"},
          {"title": "Rumour: big merger soon", "url": "https://x.com/y", "outlets": 1, "area": "deal", "kind": "rumour", "when": "2026-11-17T08:00:00Z"}]
GOV = {"sectors": [{"notes": [{"id": "a", "date": "2026-11-17", "sectors": ["roads and infra"], "policy": "NH-167 four-laning", "what": "Approved.",
                               "level": "centre", "stage": "approved", "money_cr": 3175.08, "official": False, "url": "https://www.business-standard.com/z", "companies_named": []}]}],
       "elections": [{"where": "Punjab", "type": "state", "expected": "expected early 2027", "note": "", "promises": [], "results": [], "other_news": []}]}
ITEMS = [{"platform": "avronx", "source": "Avron X desk: news", "title": "RUPEE: GAINS 24 PAISE", "text": "Inflows help.", "published_at": "2026-11-18T05:54:00Z", "x_url": "https://x.com/i/status/1"},
         {"platform": "avronx", "source": "Avron X desk: news", "title": "QUEUED ONLY", "text": "", "published_at": "2026-11-18T06:00:00Z"},
         {"platform": "reddit", "source": "r/x", "title": "chatter", "text": "", "published_at": "2026-11-18T06:00:00Z"}]


class Feed(unittest.TestCase):
    def setUp(self):
        self.feed = public.build_feed("2026-11-18T07:00:00Z", SIG, FLOWS, DIGEST, GOV, [{"date": "2026-11-20", "kind": "board meeting", "company": "Vinsys", "symbol": "", "what": "Fund raising"}], ITEMS)

    def test_market_facts_only(self):
        m = self.feed["market"]
        self.assertEqual(list(m["indices"]), ["Nifty 50"])
        self.assertEqual((m["flows"]["fpi_equity_net_cr"], m["flows"]["fo_ban_list"], m["sectors"][0]["change_1m_pct"]), (5107.61, ["KAYNES"], 6.0))
        self.assertNotIn("regime", json.dumps(m))

    def test_news_links_to_the_publisher_and_drops_rumours(self):
        self.assertEqual(self.feed["business"], [{"headline": "Tata Motors to buy Iveco unit", "url": "https://www.livemint.com/x", "source": "Mint",
                                                   "outlets": 3, "area": "deal", "time": "2026-11-17T09:00:00Z"}])

    def test_google_news_titles_name_the_publisher(self):
        b = public.business_part([{"title": "IIFL Finance block deal: Fairfax may sell stake - Zee Business", "url": "https://news.google.com/rss/articles/x",
                                   "outlets": 6, "area": "deal", "kind": "fact", "when": "t"}])
        self.assertEqual((b[0]["headline"], b[0]["source"]), ("IIFL Finance block deal: Fairfax may sell stake", "Zee Business"))

    def test_government_calendar_and_x(self):
        self.assertEqual((self.feed["government"]["decisions"][0]["money_cr"], self.feed["government"]["decisions"][0]["source"]), (3175.08, "Business Standard"))
        self.assertEqual(self.feed["government"]["elections"][0]["where"], "Punjab")
        self.assertEqual(self.feed["calendar"][0]["event"], "board meeting")
        self.assertEqual([x["text"] for x in self.feed["x_desk"]], ["RUPEE: GAINS 24 PAISE\nInflows help."])   # posted only, no chatter

    def test_nothing_private_gets_out(self):
        self.assertEqual(public.check_feed(self.feed), [])
        self.assertTrue(public.check_feed(dict(self.feed, scorecard=[])))
        self.assertTrue(public.check_feed(dict(self.feed, business=[{"headline": "XYZ a strong buy"}])))


if __name__ == "__main__":
    unittest.main()
