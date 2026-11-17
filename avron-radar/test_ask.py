"""Checks the question-answering retrieval. No network."""
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import ask  # noqa: E402

SNAPS = {"REFEX": {"name": "Refex Industries Limited", "close": 224.26}, "IT": {"name": "Some IT Co Limited", "close": 10.0},
         "NEWGEN": {"name": "Newgen Software Technologies Limited", "close": 900.0}}
ITEMS = [
    {"platform": "nse", "source": "NSE announcements", "title": "Refex Industries Limited", "text": "pond ash order from NTPC", "symbols": ["REFEX"],
     "published_at": "2026-11-17T10:00:00Z", "subject": "Bagging/Receiving of orders/contracts"},
    {"platform": "reddit", "source": "r/x", "title": "Refex to the moon", "text": "", "symbols": ["REFEX"], "published_at": "2026-11-16T10:00:00Z",
     "tags": {"kind": "tip", "summary": "Claims Refex will double.", "companies": ["Refex"]}},
    {"platform": "news", "source": "Mint", "title": "Semiconductor plant approved in Gujarat", "text": "cabinet approves semiconductor fab", "published_at": "2026-11-15T10:00:00Z"},
    {"platform": "news", "source": "ET", "title": "Monsoon update", "text": "rain", "published_at": "2026-11-15T10:00:00Z"},
]


class Ask(unittest.TestCase):
    def test_finds_stocks_by_symbol_name_or_distinctive_word(self):
        self.assertEqual(ask.find_symbols("What do we know about REFEX?", SNAPS), ["REFEX"])
        self.assertEqual(ask.find_symbols("anything on refex industries limited", SNAPS), ["REFEX"])
        self.assertEqual(ask.find_symbols("how is newgen doing", SNAPS), ["NEWGEN"])
        self.assertEqual(ask.find_symbols("is it a good time for smallcaps", SNAPS), [])       # "it" is not the symbol IT
        self.assertEqual(ask.find_symbols("what about IT today", SNAPS), ["IT"])
        snaps = dict(SNAPS, CONSUMER={"name": "Consumer Goods Co Limited"}, LIBAS={"name": "Libas Consumer Products Limited"})
        self.assertEqual(ask.find_symbols("What do we know about Libas Consumer Products?", snaps), ["LIBAS"])

    def test_search_needs_real_matches(self):
        hits = ask.search(ITEMS, ask.keywords("which semiconductor plant was approved"))
        self.assertEqual([i["source"] for i in hits], ["Mint"])
        self.assertEqual(ask.search(ITEMS, ask.keywords("tell me the latest news")), [])       # only stop words

    def test_gather_builds_the_stock_file_and_keeps_chatter_apart(self):
        data, syms = ask.gather("What do we know about Refex?", ITEMS, {"snapshots": SNAPS, "date": "2026-11-17", "screens": {}},
                                {}, {"REFEX": {"promoter_pct": 53.0}}, {}, [{"symbol": "REFEX", "headline": "REFEX: order", "published_at": "2026-11-17"}])
        r = data["stocks"]["REFEX"]
        self.assertEqual(syms, ["REFEX"])
        self.assertEqual((len(r["exchange_filings"]), len(r["news_and_chatter"]), r["news_and_chatter"][0]["kind"]), (1, 1, "tip"))
        self.assertEqual(r["analyst_reads"][0]["headline"], "REFEX: order")
        self.assertEqual(r["promoter_holding"], {"promoter_pct": 53.0})

    def test_answer_is_saved_and_advice_wording_gets_one_correction(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            replies = ["This is a strong buy with a target price of 300, based on the order filing dated 17 November.",
                       "The filing dated 17 November shows a pond ash order; the size against revenue is not in the data."]
            seen = []
            row = ask.answer(tmp, "  Should I buy   Refex? ", ITEMS, {"snapshots": SNAPS}, {}, {}, {}, [],
                             ask=lambda p: (seen.append(p), replies[len(seen) - 1])[1], log=lambda *_: None)
            self.assertEqual((len(seen), row["problems"], row["symbols"]), (2, [], ["REFEX"]))
            self.assertEqual(row["question"], "Should I buy Refex?")
            self.assertIn("not an instruction", seen[0])
            self.assertEqual(ask.load_answers(tmp)[0]["answer"], replies[1])
            self.assertIsNone(ask.answer(tmp, "hi", ITEMS, {}, {}, {}, {}, [], ask=lambda p: "x"))


if __name__ == "__main__":
    unittest.main()
