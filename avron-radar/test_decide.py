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
    "deals": [{"symbol": "GOOD", "side": "BUY", "quantity": 500000.0}, {"symbol": "GOOD", "side": "SELL", "quantity": 100000.0},
              {"symbol": "WEAK", "side": "SELL", "quantity": 90000.0}],
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
        self.assertTrue(any("net buying of 400,000" in x for x in g["for"]))
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
        self.assertEqual(w["groups"], {"price": -3, "flows": -2})         # death cross, heavy selling; deals and promoter selling
        self.assertEqual(w["score"], -5)                                  # the six-week-old filing does not count

    def test_shortlists(self):
        s = decide.shortlists(self.cards)
        self.assertEqual([c["symbol"] for c in s["strongest"]], ["GOOD"])
        self.assertEqual([c["symbol"] for c in s["weakest"]], ["WEAK", "HYPE"][:len(s["weakest"])])
        self.assertEqual([c["symbol"] for c in s["conflicts"]], ["HYPE"])
        self.assertEqual([c["symbol"] for c in s["mine"]], ["GOOD"])

    def test_my_screen_needs_known_figures(self):
        self.assertFalse(decide.passes({"max_market_cap_cr": 10000}, {}))                 # unknown size is not a pass
        self.assertFalse(decide.passes({"no_flags": True}, {"flags": ["x"]}))
        self.assertTrue(decide.passes({}, {}))


if __name__ == "__main__":
    unittest.main()
