"""Checks the analyst toolbox against hand-worked numbers. Run: python3 -m unittest avron-radar/test_analyst.py"""
import pathlib
import sys
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import analyst as A  # noqa: E402


def bars(closes, volume=1000, deliv=40):
    return [{"close": c, "high": c * 1.01, "low": c * 0.99, "volume": volume, "deliv": deliv} for c in closes]


class Technicals(unittest.TestCase):
    def test_sma_and_rsi_limits(self):
        self.assertEqual(A.sma([1, 2, 3, 4], 2), 3.5)
        self.assertIsNone(A.sma([1], 2))
        self.assertEqual(A.rsi(list(range(1, 40))), 100.0)          # only gains
        self.assertAlmostEqual(A.rsi(list(range(40, 1, -1))), 0.0)  # only losses
        self.assertAlmostEqual(A.rsi([10, 11] * 20), 50.0, delta=4)

    def test_rsi_matches_wilder_textbook_example(self):
        closes = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03,
                  45.61, 46.28, 46.28, 46.00, 46.03, 46.41, 46.22, 45.64]
        self.assertAlmostEqual(A.rsi(closes), 57.92, delta=0.1)

    def test_atr_and_bollinger_on_flat_prices(self):
        self.assertAlmostEqual(A.atr([11] * 30, [9] * 30, [10] * 30), 2.0)
        self.assertEqual(A.bollinger([5.0] * 20), (5.0, 5.0, 5.0))

    def test_macd_positive_in_a_rising_market(self):
        self.assertGreater(A.macd([100 * 1.01 ** i for i in range(60)])[0], 0)

    def test_steady_uptrend_passes_trend_template_only(self):
        s = A.snapshot(bars([100 * 1.004 ** i for i in range(260)]))
        hits = A.run_screens(s)
        self.assertIn("trend_template", hits)
        self.assertNotIn("death_cross", hits)
        self.assertNotIn("volume_shock", hits)

    def test_breakout_with_volume_and_delivery(self):
        b = bars([100.0] * 259 + [106.0])
        b[-1]["volume"], b[-1]["deliv"] = 5000, 70
        hits = A.run_screens(A.snapshot(b))
        for name in ("breakout_52w", "breakout_20d", "volume_shock", "delivery_spike"):
            self.assertIn(name, hits)

    def test_short_history_gives_no_snapshot_and_missing_data_fails_screens(self):
        self.assertIsNone(A.snapshot(bars([1.0] * 10)))
        self.assertEqual(A.run_screens(A.snapshot(bars([100.0] * 40))), [])   # no 200-day average yet

    def test_momentum_ranks(self):
        r = A.momentum_ranks({"A": {"ret_12m_ex_1m": 5}, "B": {"ret_12m_ex_1m": 50}, "C": {"ret_12m_ex_1m": None}})
        self.assertEqual(r, {"A": 0, "B": 100})


class Formulas(unittest.TestCase):
    def test_graham_lynch_cagr(self):
        self.assertAlmostEqual(A.graham_number(10, 100), 150.0)
        self.assertIsNone(A.graham_number(-1, 100))
        self.assertAlmostEqual(A.graham_value(10, 10, 4.4), 285.0)
        self.assertEqual(A.peg(20, 25), 0.8)
        self.assertAlmostEqual(A.cagr(100, 200, 3), 25.99, delta=0.01)

    def test_returns_and_dupont(self):
        self.assertEqual(A.roe(20, 100), 20.0)
        self.assertEqual(A.roce(30, 200, 50), 20.0)
        d = A.dupont(10, 100, 200, 50)
        self.assertAlmostEqual(d["net_margin"] * d["asset_turnover"] * d["equity_multiplier"] * 100, d["roe_pct"])
        self.assertEqual(A.magic_formula(20, 200, 30, 70), {"earnings_yield_pct": 10.0, "return_on_capital_pct": 20.0})

    def test_piotroski_perfect_and_missing(self):
        prev = dict(net_profit=8, cfo=9, total_assets=100, long_term_debt=30, current_assets=40,
                    current_liabilities=30, shares=10, gross_profit=30, revenue=100)
        cur = dict(net_profit=12, cfo=15, total_assets=105, long_term_debt=25, current_assets=50,
                   current_liabilities=30, shares=10, gross_profit=40, revenue=120)
        self.assertEqual(A.piotroski(cur, prev)[0], 9)
        self.assertEqual(A.piotroski(prev, cur)[0], 4)   # profit, cash flow, cash > profit, no dilution
        self.assertIsNone(A.piotroski({**cur, "cfo": None}, prev))

    def test_altman(self):
        self.assertAlmostEqual(A.altman_z(20, 30, 15, 120, 60, 150, 100), 1.2 * .2 + 1.4 * .3 + 3.3 * .15 + 0.6 * 2 + 1.5)

    def test_beneish_no_change_year_is_the_base_score(self):
        y = dict(receivables=10, revenue=100, gross_profit=40, current_assets=50, ppe=30, total_assets=100,
                 depreciation=5, sga=10, net_profit=10, cfo=10, current_liabilities=20, long_term_debt=20)
        base = -4.84 + 0.92 + 0.528 + 0.404 + 0.892 + 0.115 - 0.172 - 0.327
        self.assertAlmostEqual(A.beneish_m(y, y), base)
        self.assertLess(A.beneish_m(y, y), -1.78)

    def test_dcf_round_trip_and_sizing(self):
        v = A.dcf_value(100, 15, 10, 5, 12)
        self.assertAlmostEqual(A.implied_growth(v, 100), 15.0, delta=0.01)
        self.assertIsNone(A.dcf_value(100, 15, 10, 12, 12))
        self.assertEqual(A.position_size(100000, 1, 100, 95), 200)
        self.assertAlmostEqual(A.kelly(0.5, 2, 1), 0.25)


if __name__ == "__main__":
    unittest.main()
