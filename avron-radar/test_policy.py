"""Checks the policy notes and the election watch. No network."""
import datetime
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import market   # noqa: E402
import policy   # noqa: E402

NOW = datetime.datetime(2026, 11, 17, 12, tzinfo=datetime.timezone.utc)


def item(id, platform, title, text="", tags=None, source="PIB", when="2026-11-16T10:00:00Z"):
    return {"id": id, "platform": platform, "source": source, "title": title, "text": text, "published_at": when,
            "url": "https://example.gov/" + id, **({"tags": tags} if tags else {})}


ITEMS = [
    item("a", "regulator", "Cabinet approves Rs 12,000 crore scheme for electronics components"),
    item("b", "news", "Punjab party promises free power up to 300 units if elected", source="Mint", tags={"relevance": 4, "kind": "fact"}),
    item("c", "news", "Stock tip of the day", source="x", tags={"relevance": 4, "kind": "tip"}),
    item("d", "news", "Cabinet to consider shipbuilding policy", source="ET", tags={"relevance": 1, "kind": "fact"}),
    item("e", "nse", "Some Company Limited", "outcome of board meeting"),
    item("f", "news", "Sensex ends higher on bank rally", source="ET", tags={"relevance": 4, "kind": "fact"}),
]
REPLY = json.dumps([
    {"n": 1, "policy": "Electronics Components Scheme", "what": "The Union Cabinet approved a scheme for electronics components.",
     "level": "centre", "sectors": ["electronics and semiconductors"], "money_cr": 12000, "stage": "approved", "timeline": "",
     "who_benefits": "component makers", "companies_named": ["Dixon Technologies"]},
    {"n": 2, "policy": "Free power promise", "what": "A party in Punjab promised 300 free units of power.", "level": "Punjab",
     "sectors": ["power and renewables"], "money_cr": None, "stage": "promised", "companies_named": []},
    {"n": 9, "policy": "ghost", "what": "not in the batch"}])


class Policy(unittest.TestCase):
    def test_candidates_are_government_items_only(self):
        self.assertEqual([i["id"] for i in policy.candidates(ITEMS, set(), 10)], ["a", "b"])
        self.assertEqual([i["id"] for i in policy.candidates(ITEMS, {"a"}, 10)], ["b"])

    def test_notes_are_filed_once_and_a_bad_row_is_dropped(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp = pathlib.Path(tmp)
            asked = []
            n = policy.file_notes(tmp, ITEMS, {}, ask=lambda p: (asked.append(p), REPLY)[1], log=lambda *_: None)
            notes = policy.load_notes(tmp)
            self.assertEqual((n, len(notes), notes[0]["money_cr"], notes[0]["official"], notes[1]["stage"]), (2, 2, 12000.0, True, "promised"))
            self.assertIn("1. [PIB, 2026-11-16] Cabinet approves", asked[0])
            self.assertEqual(policy.file_notes(tmp, ITEMS, {}, ask=lambda p: (asked.append(p), REPLY)[1], log=lambda *_: None), 0)
            self.assertEqual(len(asked), 1)                                  # nothing left to read

    def test_view_links_companies_on_evidence_and_builds_the_election_watch(self):
        notes = policy.parse_notes(REPLY, policy.candidates(ITEMS, set(), 10))
        names = {market.norm_name("Dixon Technologies (India) Limited"): "DIXON", market.norm_name("Dixon Technologies"): "DIXON"}
        filings = [{"text": "Company has applied under the Electronics Components Scheme of MeitY", "symbols": ["KAYNES"]},
                   {"text": "Unrelated order win", "symbols": ["OTHER"]}]
        v = policy.policy_view(notes, filings, names, [{"where": "Punjab", "expected": "early 2027"}, {"where": "Goa"}], now=NOW)
        el = v["sectors"][0]
        self.assertEqual((el["sector"], el["money_approved_cr"], el["companies_named"], el["companies_filing_about_it"]),
                         ("electronics and semiconductors", 12000, ["DIXON"], ["KAYNES"]))
        self.assertIsNone(v["sectors"][1]["money_approved_cr"])              # a promise is not approved money
        punjab, goa = v["elections"]
        self.assertEqual((punjab["expected"], len(punjab["promises"]), punjab["promises"][0]["policy"]), ("early 2027", 1, "Free power promise"))
        self.assertEqual((goa["promises"], goa["other_news"]), ([], []))


if __name__ == "__main__":
    unittest.main()
