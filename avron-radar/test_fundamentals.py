"""Checks the results reader, promoter holdings and the calendar with samples, no network."""
import datetime
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import fundamentals as F  # noqa: E402
import market             # noqa: E402

REPLY = json.dumps({
    "period_end": "2026-09-30", "period_type": "quarter", "basis": "consolidated", "unit": "lakh",
    "current": {"revenue": 12000, "other_income": 100, "finance_cost": 200, "depreciation": 300, "pbt": 1600, "tax": 400, "pat": 1200, "eps_basic": 6.0},
    "year_ago": {"revenue": 9000, "other_income": 80, "finance_cost": 220, "depreciation": 280, "pbt": 1000, "tax": 250, "pat": 750, "eps_basic": 3.75},
    "previous": {"revenue": 11000, "pat": 1000},
    "paid_up_capital": 2000, "face_value": 10,
    "balance_sheet": {"as_at": "2026-09-30", "total_assets": 60000, "equity": 30000, "borrowings": 12000, "receivables": 9000,
                      "inventories": 5000, "cash": 2000, "current_assets": 24000, "current_liabilities": 12000},
    "cfo": None, "audit": "clean", "document_read": True})


def filing(company="ABC Limited", period="September 30, 2026", subject="Outcome of Board Meeting", url="https://nsearchives.nseindia.com/corporate/ABC_r.pdf"):
    return {"platform": "nse", "source": "NSE announcements", "title": company, "url": url, "subject": subject,
            "published_at": "2026-11-17T10:00:00Z",
            "text": "%s has submitted to the Exchange, the financial results for the period ended %s. |SUBJECT: %s" % (company, period, subject)}


class Results(unittest.TestCase):
    def test_units_are_converted_to_crore_and_eps_is_left_alone(self):
        r = F.parse_results("ok " + REPLY)
        self.assertEqual((r["current"]["revenue"], r["current"]["pat"], r["current"]["eps_basic"]), (120.0, 12.0, 6.0))
        self.assertEqual(r["balance_sheet"]["equity"], 300.0)
        self.assertIsNone(F.parse_results("SKIP"))
        self.assertIsNone(F.parse_results(REPLY.replace('"lakh"', '"dozens"')))     # unknown unit: refuse, don't guess

    def test_ratios_are_computed_in_code(self):
        m = F.derive(F.parse_results(REPLY), close=480.0)
        self.assertEqual((m["revenue_yoy_pct"], m["pat_yoy_pct"], m["revenue_qoq_pct"]), (33.3, 60.0, 9.1))
        self.assertEqual(m["net_margin_pct"], 10.0)
        self.assertEqual(m["ebitda_cr"], 20.0)                    # 16 + 2 + 3 - 1
        self.assertEqual(m["interest_coverage"], 9.0)
        self.assertEqual(m["consistency"], "ok")                  # 12 cr / 2 cr shares = Rs 6 = EPS
        self.assertEqual(m["market_cap_cr"], 960.0)               # 2 crore shares x Rs 480
        self.assertEqual((m["pe_annualised"], m["peg"]), (20.0, 0.33))
        self.assertEqual((m["debt_to_equity"], m["current_ratio"], m["roe_annualised_pct"]), (0.4, 2.0, 16.0))
        self.assertEqual(m["book_value_per_share"], 150.0)
        self.assertAlmostEqual(m["graham_number"], (22.5 * 24 * 150) ** 0.5, places=1)
        self.assertEqual(m["receivable_days"], 68.0)
        self.assertTrue(m["growth_20"])
        self.assertEqual(m["flags"], [])

    def test_a_misread_figure_is_caught_and_valuation_is_withheld(self):
        misread = json.loads(REPLY)
        misread["current"]["eps_basic"] = 0.6                            # profit and shares imply Rs 6
        m = F.derive(F.parse_results(json.dumps(misread)), close=480.0)
        self.assertEqual(m["consistency"], "mismatch")
        self.assertNotIn("market_cap_cr", m)
        self.assertIn("misread", m["flags"][0])

    def test_a_misread_face_value_is_flagged_with_the_value_that_would_fit(self):
        fv1 = json.loads(REPLY)
        fv1["face_value"] = 1                                           # the table says Rs 10
        m = F.derive(F.parse_results(json.dumps(fv1)), close=480.0)
        self.assertEqual((m["consistency"], m["would_fit_face_value"]), ("mismatch", 10.0))
        self.assertNotIn("market_cap_cr", m)                            # nothing is guessed
        self.assertIn("face value of Rs 10", m["flags"][0])

    def test_a_wrong_unit_changes_rupee_amounts_but_not_the_ratios(self):
        right = F.derive(F.parse_results(REPLY), close=480.0)
        wrong = F.derive(F.parse_results(REPLY.replace('"lakh"', '"crore"')), close=480.0)
        for k in ("revenue_yoy_pct", "pat_yoy_pct", "net_margin_pct", "pe_annualised", "peg", "price_to_book", "graham_number", "consistency"):
            self.assertEqual(right[k], wrong[k])
        self.assertEqual(wrong["revenue_cr"], right["revenue_cr"] * 100)  # the known blind spot

    def test_red_flags(self):
        bad = json.loads(REPLY)
        bad["audit"] = "qualified"
        bad["current"].update(other_income=900, finance_cost=2500)
        bad["balance_sheet"].update(borrowings=70000, receivables=30000)
        flags = " ".join(F.derive(F.parse_results(json.dumps(bad)))["flags"])
        for word in ("qualified", "other income", "150 days", "twice equity", "interest cover"):
            self.assertIn(word, flags)

    def test_no_growth_figure_from_a_loss_base(self):
        loss = json.loads(REPLY)
        loss["year_ago"]["pat"] = -50
        m = F.derive(F.parse_results(json.dumps(loss)))
        self.assertIsNone(m["pat_yoy_pct"])
        self.assertFalse(m["growth_20"])

    def test_picks_followed_companies_once_per_period(self):
        uni = {"ABC": {"name": "ABC Limited", "index": "smallcap250"}, "SME": {"name": "Tiny SME Limited", "index": ""}}
        names = market.name_index(uni)
        items = [filing(), filing(url="https://nsearchives.nseindia.com/corporate/ABC_dup.pdf"),
                 filing("Tiny SME Limited"), filing(subject="Copy of Newspaper Publication"),
                 filing(url="https://nsearchives.nseindia.com/corporate/xbrl/a.xml")]
        picks = F.pick_results(items, set(), uni, names, {"smallcap250"}, set(), 10)
        self.assertEqual([(s, i["url"][-9:]) for i, s, _ in picks], [("ABC", "ABC_r.pdf")])
        self.assertEqual(F.pick_results(items, {picks[0][2]}, uni, names, {"smallcap250"}, set(), 10), [])
        watched = F.pick_results(items, set(), uni, names, set(), {"SME"}, 10)
        self.assertEqual([s for _, s, _ in watched], ["SME"])
        both = F.pick_results(items, set(), uni, names, {"smallcap250"}, set(), 10, others=5)
        self.assertEqual([s for _, s, _ in both], ["ABC", "SME"])          # followed first, then the rest
        self.assertEqual([s for _, s, _ in F.pick_results(items, set(), uni, names, {"smallcap250"}, set(), 1, others=5)], ["ABC"])

    def test_extract_saves_respects_budget_and_remembers_skips(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            (tmp / "market").mkdir()
            (tmp / "market" / "universe.json").write_text(json.dumps({"ABC": {"name": "ABC Limited", "index": "smallcap250"},
                                                                       "XYZ": {"name": "XYZ Limited", "index": "nifty500"}}))
            items = [filing(), filing("XYZ Limited", url="https://nsearchives.nseindia.com/corporate/XYZ_r.pdf")]
            asked = []
            ask = lambda p: (asked.append(p), "SKIP" if "XYZ" in p else REPLY)[1]
            self.assertEqual(F.extract(tmp, items, {}, ask=ask, log=lambda *_: None), 1)
            self.assertEqual(len(asked), 2)
            self.assertEqual(F.extract(tmp, items, {}, ask=ask, log=lambda *_: None), 0)
            self.assertEqual(len(asked), 2)                       # neither is asked again
            view = F.latest_by_symbol(F.load_fundamentals(tmp), {"ABC": {"close": 480.0}})
            self.assertEqual(view["ABC"]["metrics"]["pe_annualised"], 20.0)
            self.assertEqual(F.extract(tmp, [filing("XYZ Limited", period="June 30, 2026")], {"daily_results": 2}, ask=ask, log=lambda *_: None), 0)


class HoldingsAndCalendar(unittest.TestCase):
    def test_promoter_holding_change(self):
        row = lambda as_on, pct: {"source": "NSE shareholding patterns", "title": "ABC Limited", "url": "u",
                                  "text": "AS ON DATE : %s | PR_AND_PRGRP: %s | PUBLIC_VAL: 1 | EMPTR: 0" % (as_on, pct)}
        names = {market.norm_name("ABC Limited"): "ABC"}
        known = set()
        rows = F.holding_rows([row("30-Jun-2026", "55.10"), row("30-Sep-2026", "52.60"), row("30-Sep-2026", "52.60")], names, known)
        self.assertEqual(len(rows), 2)
        self.assertEqual(F.holding_view(rows)["ABC"], {"as_on": "2026-09-30", "promoter_pct": 52.6,
                                                        "previous_as_on": "2026-06-30", "change_pts": -2.5})
        self.assertEqual(F.holding_rows([row("30-Sep-2026", "52.60")], names, known), [])

    def test_calendar_reads_meetings_and_ex_dates(self):
        items = [
            {"source": "NSE board meetings", "title": "Vinsys IT Services India Limited",
             "text": "Vinsys IT Services India Limited has informed the Exchange about Board Meeting to be held on 20-Nov-2026 to consider and approve Fund raising/Increase in authorised capital/Other business. |Meeting Date: 20-Nov-2026"},
            {"source": "NSE board meetings", "title": "Vinsys IT Services India Limited", "text": "To consider Fund Raising and other business matters |Meeting Date: 20-Nov-2026"},
            {"source": "NSE corporate actions", "title": "Zee Entertainment Enterprises Limited - Ex-Date: 25-Nov-2026",
             "text": "SERIES:EQ |PURPOSE:BUY BACK |FACE VALUE:1 |RECORD DATE:25-Nov-2026"},
            {"source": "NSE corporate actions", "title": "Old Co Limited - Ex-Date: 01-Nov-2026", "text": "PURPOSE:DIVIDEND"},
        ]
        cal = F.calendar(items, {}, today=datetime.date(2026, 11, 17))
        self.assertEqual([(c["date"], c["kind"], c["company"]) for c in cal],
                         [("2026-11-20", "board meeting", "Vinsys IT Services India Limited"),
                          ("2026-11-25", "ex-date", "Zee Entertainment Enterprises Limited")])
        self.assertEqual(cal[0]["what"], "Fund raising/Increase in authorised capital/Other business")
        self.assertEqual(cal[1]["what"], "BUY BACK")


if __name__ == "__main__":
    unittest.main()
