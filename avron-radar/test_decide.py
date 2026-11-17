"""Checks the evidence scorecard. No network."""
import datetime
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import decide  # noqa: E402

NOW = datetime.datetime(2026, 11, 17, 12, tzinfo=datetime.timezone.utc)
SIG = {
    "snapshots": {
        "GOOD": {"name": "Good Ltd", "industry": "Capital Goods", "close": 500.0, "change": 4.0, "vol_ratio": 3.1, "deliv": 62.0,
                 "rsi": 68.0, "momentum_rank": 92, "sma200": 400.0},
        "HYPE": {"name": "Hype Ltd", "industry": "", "close": 90.0, "change": 12.0, "vol_ratio": 9.0, "deliv": 12.0,
                 "rsi": 86.0, "momentum_rank": 60, "sma200": 70.0},
        "WEAK": {"name": "Weak Ltd", "industry": "", "close": 50.0, "change": -6.0, "vol_ratio": 4.0, "deliv": 30.0,
                 "rsi": 28.0, "momentum_rank": 10, "sma200": 80.0},
    },
    "screens": {
        "trend_template": {"stocks": [], "all": ["GOOD"]},
        "breakout_52w": {"stocks": [{"symbol": "GOOD"}, {"symbol": "HYPE"}]},      # older saved signals have no "all"
        "overbought": {"stocks": [], "all": ["HYPE"]},
        "death_cross": {"stocks": [], "all": ["WEAK"]},
        "volume_shock": {"stocks": [], "all": ["WEAK", "HYPE"]},
    },
    "deals": [{"symbol": "GOOD", "side": "BUY", "quantity": 500000.0, "pct_of_day_volume": 5.0},
              {"symbol": "GOOD", "side": "SELL", "quantity": 100000.0, "pct_of_day_volume": 1.0},
              {"symbol": "WEAK", "side": "SELL", "quantity": 90000.0, "pct_of_day_volume": 12.0},
              {"symbol": "HYPE", "side": "BUY", "quantity": 300.0, "pct_of_day_volume": 0.1}],
}
FUND = {
    "GOOD": {"metrics": {"growth_20": True, "revenue_yoy_pct": 33.3, "pat_yoy_pct": 60.0, "roe_annualised_pct": 18.0,
                         "debt_to_equity": 0.2, "peg": 0.4, "flags": [], "market_cap_cr": 4200}},
    "HYPE": {"metrics": {"growth_20": False, "revenue_yoy_pct": -5.0, "pat_yoy_pct": None, "flags":
                         ["auditor's opinion or conclusion is qualified", "operating cash flow is under half of profit"],
                         "market_cap_cr": 300}},
}


class Scorecard(unittest.TestCase):
    def setUp(self):
        reads = [{"symbol": "GOOD", "read_at": "2026-11-16T10:00:00Z", "materiality": 4, "tone": "positive", "confidence": "high", "headline": "GOOD: order"},
                 {"symbol": "GOOD", "read_at": "2026-11-16T10:00:00Z", "materiality": 5, "tone": "positive", "confidence": "low", "headline": "unreliable"},
                 {"symbol": "WEAK", "read_at": "2026-10-01T10:00:00Z", "materiality": 5, "tone": "negative", "confidence": "high", "headline": "old"}]
        self.cards = decide.scorecard(SIG, FUND, {"GOOD": {"change_pts": 1.2, "promoter_pct": 56.0}, "WEAK": {"change_pts": -3.0, "promoter_pct": 30.0}},
                                      reads, [{"symbol": "HYPE", "mentions_24h": 9, "daily_average_before": 0.5}],
                                      [{"symbol": "GOOD", "kind": "board meeting", "date": "2026-11-20", "what": "Fund raising"}],
                                      now=NOW, my_screen={"max_market_cap_cr": 10000, "min_revenue_growth_pct": 20})

    def test_agreement_across_price_business_filings_and_flows(self):
        g = self.cards["GOOD"]
        self.assertEqual(g["groups"], {"price": 5, "business": 5, "filings": 2, "flows": 2})   # trend 2 + high 2 + momentum 1
        self.assertEqual((g["score"], g["kinds_in_favour"], g["conflict"], g["mine"]), (14, 4, False, True))
        self.assertTrue(any("net buying of 400,000 shares (4% of the day's volume)" in x for x in g["for"]))
        self.assertNotIn("flows", self.cards["HYPE"]["groups"])                                  # a 0.1% deal is noise
        self.assertFalse(any("unreliable" in x for x in g["for"]))                               # low-confidence read ignored
        self.assertIn("board meeting on 2026-11-20: Fund raising", g["notes"])

    def test_breakout_with_bad_books_is_a_conflict_not_a_candidate(self):
        h = self.cards["HYPE"]
        self.assertTrue(h["conflict"])
        self.assertEqual(h["groups"]["business"], -4)                     # qualified audit -3, weak cash -1
        self.assertFalse(h["mine"])
        self.assertTrue(any("talked about 9 times" in n for n in h["notes"]))

    def test_weak_stock_and_old_filing(self):
        w = self.cards["WEAK"]
        self.assertEqual(w["groups"], {"price": -3, "flows": -3})         # death cross, heavy selling; a large sale (-2), promoter selling
        self.assertEqual(w["score"], -6)                                  # the six-week-old filing does not count

    def test_shortlists(self):
        s = decide.shortlists(self.cards)
        self.assertEqual([c["symbol"] for c in s["strongest"]], ["GOOD"])
        self.assertEqual([c["symbol"] for c in s["weakest"]], ["WEAK", "HYPE"][:len(s["weakest"])])
        self.assertEqual([c["symbol"] for c in s["conflicts"]], ["HYPE"])
        self.assertEqual([c["symbol"] for c in s["mine"]], ["GOOD"])

    def test_a_screen_that_has_lagged_earns_no_points(self):
        sig = dict(SIG, screen_record={"screens": {"trend_template": {"edge_20d": -0.8}, "breakout_52w": {"edge_20d": 0.9},
                                                    "overbought": {"edge_20d": 2.9}, "death_cross": {"edge_20d": 0.0}}})
        cards = decide.scorecard(sig, FUND, now=NOW)
        g, h = cards["GOOD"], cards["HYPE"]
        self.assertEqual(g["groups"]["price"], 3)                              # breakout 2 + momentum 1; trend template 0
        self.assertTrue(any("lagged the market by 0.8%" in n for n in g["notes"]))
        self.assertEqual(h["groups"]["price"], 2)                              # "stretched" no longer costs a point
        self.assertTrue(any("beaten the market by 2.9%" in n for n in h["notes"]))
        self.assertEqual(cards["WEAK"]["groups"]["price"], -3)                 # a flat record leaves the weight alone
        self.assertNotIn("_w", g)

    def test_price_only_list_holds_strong_charts_with_no_results_on_file(self):
        lists = decide.shortlists(decide.scorecard(dict(SIG, deals=[]), {}, now=NOW))
        self.assertEqual([c["symbol"] for c in lists["price_only"]], ["GOOD"])     # strong chart, one kind of evidence
        self.assertEqual(lists["strongest"], [])
        with_flows = decide.shortlists(decide.scorecard(SIG, {}, now=NOW))
        self.assertEqual(([c["symbol"] for c in with_flows["strongest"]], with_flows["price_only"]), (["GOOD"], []))

    def test_alerts_for_my_stocks(self):
        sig = dict(SIG)
        sig["snapshots"] = dict(SIG["snapshots"], GOOD=dict(SIG["snapshots"]["GOOD"], change=9.0, atr_pct=3.0))
        items = [{"id": "f1", "platform": "nse", "symbols": ["GOOD"], "published_at": "2026-11-17T08:00:00Z", "subject": "Acquisition", "text": ""},
                 {"id": "f0", "platform": "nse", "symbols": ["GOOD"], "published_at": "2026-11-10T08:00:00Z", "subject": "Old filing", "text": ""},
                 {"id": "p1", "platform": "reddit", "symbols": ["GOOD"], "published_at": "2026-11-17T09:00:00Z", "title": "t",
                  "tags": {"relevance": 4, "kind": "rumour", "summary": "Claims a big order is coming."}},
                 {"id": "p2", "platform": "reddit", "symbols": ["GOOD"], "published_at": "2026-11-17T09:00:00Z", "title": "meme", "tags": {"relevance": 1}}]
        a, quiet, missing = decide.my_stock_alerts(["good", "WEAK", "NOPE"], sig, items, [], {}, [{"symbol": "GOOD", "kind": "board meeting", "date": "2026-11-20", "what": "Fund raising"}], [], now=NOW)
        text = " | ".join(a["lines"])
        for part in ("moved +9.0%", "on screens: trend template, breakout 52w", "filing: Acquisition", "reddit (rumour): Claims a big order",
                     "deal: ", "coming up: board meeting on 2026-11-20"):
            self.assertIn(part, text)
        self.assertNotIn("Old filing", text)
        self.assertNotIn("meme", text)
        self.assertEqual(quiet["symbol"], "WEAK")
        self.assertTrue(any("death cross" in l for l in quiet["lines"]))
        self.assertIn("check the symbol", missing["lines"][0])

    def test_theme_tracker(self):
        mk = lambda when, platform, title, syms=(): {"platform": platform, "published_at": when, "title": title, "text": "", "symbols": list(syms), "url": "u"}
        items = [mk("2026-11-17T0%d:00:00Z" % h, "news", "New data centre capacity in Navi Mumbai", ["ANANTRAJ"]) for h in range(4)]
        items += [mk("2026-11-12T00:00:00Z", "nse", "Hyperscale campus order", ["ANANTRAJ", "NETWEB"]),
                  mk("2026-11-17T00:00:00Z", "news", "Monsoon update"), mk("2026-11-01T00:00:00Z", "news", "data centre, too old"),
                  mk("2026-11-17T00:00:00Z", "deals", "data centre deal row")]
        dc, chips = decide.theme_tracker(items, {"semiconductors": ["semiconductor", "chip fab"], "data centres": ["data centre", "hyperscale"]}, now=NOW)
        self.assertEqual((dc["theme"], dc["mentions_24h"], dc["mentions_7d"], dc["filings_7d"], dc["rising"]), ("data centres", 4, 5, 1, True))
        self.assertEqual(dc["companies"], ["ANANTRAJ", "NETWEB"])
        self.assertEqual((chips["theme"], chips["mentions_7d"], chips["latest"]), ("semiconductors", 0, []))

    def test_my_screen_needs_known_figures(self):
        self.assertFalse(decide.passes({"max_market_cap_cr": 10000}, {}))                 # unknown size is not a pass
        self.assertFalse(decide.passes({"no_flags": True}, {"flags": ["x"]}))
        self.assertTrue(decide.passes({}, {}))


if __name__ == "__main__":
    unittest.main()
