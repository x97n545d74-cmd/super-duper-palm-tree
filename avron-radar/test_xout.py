"""Checks the radar's X items: exact facts, length, no links, no repeats. No network."""
import datetime
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import xout  # noqa: E402

SIG = {"date": "2026-11-17", "stocks_screened": 1677,
       "indices": {"Nifty 50": {"close": 25387.4, "change_pct": 0.38}},
       "breadth": {"advancers": 827, "decliners": 833, "pct_above_200dma": 45.7},
       "snapshots": {"SUPREMEENG": {"name": "Supreme Engineering Limited"}, "XYZ": {"name": "Xyz Industries Ltd"},
                     "ALKEM": {"name": "Alkem Laboratories Limited"}}}
EVENING = datetime.datetime(2026, 11, 17, 19, 30, tzinfo=xout.IST)
FLOWS = {"date": "2026-11-17", "fii_index_futures_long_pct": 33.4, "fpi": {"date": "2026-11-17", "equity_net_cr": 5107.61}}
INV = {"Ashish Kacholia": ["Ashish Rameshchandra Kacholia", "Kacholia"], "Dolly Khanna": ["Dolly Rajiv Khanna"],
       "Morgan Stanley": ["Morgan Stanley"]}


class Close(unittest.TestCase):
    def test_close_card_text(self):
        r = xout.close_card(SIG, FLOWS, EVENING)
        self.assertEqual(r["headline"], "MARKET CLOSE, 17 NOV: NIFTY 50 UP 0.38% AT 25,387.40; 827 OF 1,677 ACTIVELY TRADED STOCKS ROSE, 833 FELL")
        self.assertIn("Foreign investors bought a net Rs 5,107.61 crore of shares.", r["detail"])
        self.assertIn("33.4% of their index futures positions are long.", r["detail"])
        self.assertLessEqual(len(r["post_text"]), 280)
        self.assertEqual((r["id"], r["lane"]), ("20261117-RC01", "radar"))

    def test_waits_for_both_files_and_names_an_older_flow_day(self):
        self.assertIsNone(xout.close_card(SIG, dict(FLOWS, date="2026-11-14"), EVENING))
        self.assertIsNone(xout.close_card(None, FLOWS, EVENING))
        r = xout.close_card(SIG, dict(FLOWS, fpi={"date": "2026-11-14", "equity_net_cr": -812.5}), EVENING)
        self.assertIn("sold a net Rs 812.50 crore of shares on 14 Nov.", r["detail"])

    def test_a_late_card_is_never_posted(self):
        at = lambda *a: datetime.datetime(*a, tzinfo=xout.IST)
        self.assertIsNotNone(xout.close_card(SIG, FLOWS, at(2026, 11, 18, 8, 30)))        # next morning, before the open
        self.assertIsNone(xout.close_card(SIG, FLOWS, at(2026, 11, 18, 12, 30)))          # next day, market open
        fri = dict(SIG, date="2026-11-20")
        self.assertIsNotNone(xout.close_card(fri, dict(FLOWS, date="2026-11-20"), at(2026, 11, 23, 8, 0)))   # Monday morning after a Friday
        self.assertIsNone(xout.close_card(fri, dict(FLOWS, date="2026-11-20"), at(2026, 11, 25, 8, 0)))

    def test_indian_grouping(self):
        self.assertEqual((xout.indian(1234567), xout.indian(500000), xout.indian(999), xout.indian(25387.4, 2)), ("12,34,567", "5,00,000", "999", "25,387.40"))


class Investors(unittest.TestCase):
    holds = {"SUPREMEENG": {"as_on": "2026-09-30", "previous_as_on": "2026-06-30", "holder_moves": [
        {"name": "ASHISH KACHOLIA", "move": "raised", "pct": 6.17, "was": 4.9},
        {"name": "PRIYA KACHOLIA", "move": "new above 1%", "pct": 1.2},              # a surname alone is not enough
        {"name": "Dolly Rajiv Khanna", "move": "no longer above 1%", "was": 1.4}]}}

    def test_holder_moves(self):
        rows = xout.investor_moves(self.holds, [], SIG, INV, ["Ashish Kacholia", "Dolly Khanna"], "", limit=5)
        self.assertEqual([r["headline"] for r in rows], [
            "ASHISH KACHOLIA: RAISES HOLDING IN SUPREME ENGINEERING TO 6.17% FROM 4.90%",
            "DOLLY RAJIV KHANNA: NO LONGER AMONG HOLDERS ABOVE 1% OF SUPREME ENGINEERING"])
        self.assertEqual(rows[0]["detail"], "Shareholding as on 2026-09-30, against 2026-06-30.")

    def test_deals_skip_trading_unlisted_names_and_stocks_the_desk_covered(self):
        deals = [{"symbol": "XYZ", "name": "Xyz Ind", "client": "ASHISH RAMESHCHANDRA KACHOLIA", "side": "BUY", "quantity": 500000.0,
                  "price": 210.0, "pct_of_day_volume": 6.2, "date": "17-NOV-2026", "kind": "bulk"},
                 {"symbol": "ALKEM", "client": "DOLLY RAJIV KHANNA", "side": "SELL", "quantity": 1000.0, "price": 5050.0, "date": "17-NOV-2026"},
                 {"symbol": "XYZ", "client": "MORGAN STANLEY ASIA", "side": "BUY", "quantity": 9.0, "price": 1.0},
                 {"symbol": "XYZ", "client": "MORGAN STANLEY ASIA", "side": "SELL", "quantity": 9.0, "price": 1.0}]
        rows = xout.investor_moves({}, deals, SIG, INV, ["Ashish Kacholia", "Dolly Khanna", "Morgan Stanley"], "WHO BOUGHT | ALKEM LABS ...")
        self.assertEqual([r["headline"] for r in rows], ["ASHISH RAMESHCHANDRA KACHOLIA: BUYS 5,00,000 SHARES OF XYZ INDUSTRIES AT RS 210.00 IN A BULK DEAL"])
        self.assertEqual(rows[0]["detail"], "That was 6.2% of the stock's traded volume on 17-Nov-2026.")

    def test_only_listed_investors_are_posted(self):
        self.assertEqual(xout.investor_moves(self.holds, [], SIG, INV, ["Dolly Khanna"], "")[0]["company"], "SUPREME ENGINEERING")
        self.assertEqual(xout.investor_moves(self.holds, [], SIG, INV, [], ""), [])


class Queue(unittest.TestCase):
    def test_append_once_and_refuse_bad_text(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = pathlib.Path(tmp) / "radar.jsonl"
            good = xout.close_card(SIG, FLOWS, EVENING)
            bad = dict(good, id="x2", post_text="see https://example.com")
            self.assertEqual(xout.queue(path, [good, bad, None]), 1)
            self.assertEqual(xout.queue(path, [good]), 0)
            self.assertEqual(json.loads(path.read_text().splitlines()[0])["id"], "20261117-RC01")


if __name__ == "__main__":
    unittest.main()
