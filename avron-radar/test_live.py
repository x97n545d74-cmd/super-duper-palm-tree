"""Checks the live news lane. No network."""
import datetime
import json
import pathlib
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import live  # noqa: E402

NOW = datetime.datetime(2026, 11, 18, 9, 0, tzinfo=datetime.timezone.utc)


def news(title, url, when="2026-11-18T08:30:00Z", source="Mint companies"):
    return {"kind": "news", "title": title, "url": url, "published_at": when, "source": source, "text": ""}


ROWS = [
    news("Tata Motors to acquire Iveco commercial vehicle unit for 3.8 billion euros", "https://www.livemint.com/a"),
    news("Tata Motors acquires Iveco commercial vehicle business in 3.8 billion euro deal", "https://economictimes.indiatimes.com/b"),
    news("Stocks to buy today: 5 picks with target price for Wednesday", "https://www.livemint.com/c"),
    news("Stock Market LIVE Updates: Sensex falls 400 points", "https://www.cnbctv18.com/d"),
    news("India vs Australia cricket: highlights", "https://www.livemint.com/e"),
    news("RBI keeps repo rate unchanged at 5.50%, cuts CRR", "https://news.google.com/rss/articles/x", source="Google News"),
    news("Short", "https://www.livemint.com/f"),
    news("Old: Infosys wins big contract from European bank", "https://www.livemint.com/g", when="2026-11-16T08:00:00Z"),
    {"kind": "nse", "title": "ABC Limited", "subject": "Bagging/Receiving of orders/contracts", "url": "https://nsearchives.nseindia.com/a.pdf",
     "published_at": "2026-11-18T08:40:00Z", "text": "ABC Limited has received an order of Rs 120 crore |SUBJECT: Bagging/Receiving of orders/contracts"},
    {"kind": "nse", "title": "XYZ Limited", "subject": "Copy of Newspaper Publication", "url": "https://nsearchives.nseindia.com/b.pdf",
     "published_at": "2026-11-18T08:41:00Z", "text": "Copy of Newspaper Publication |SUBJECT: Copy of Newspaper Publication"},
    {"kind": "x", "title": "RUPEE: GAINS 24 PAISE", "url": "https://example.com/src", "x_url": "https://x.com/i/status/1", "published_at": "2026-11-18T05:54:00Z"},
]


class Live(unittest.TestCase):
    def test_merge_filters_and_counts_one_story_once(self):
        items, added = live.merge([], ROWS, NOW)
        heads = [e["headline"] for e in items]
        self.assertEqual(added, 4)
        self.assertEqual(heads, ["ABC Limited: Bagging/Receiving of orders/contracts",
                                 "Tata Motors to acquire Iveco commercial vehicle unit for 3.8 billion euros",
                                 "RBI keeps repo rate unchanged at 5.50%, cuts CRR", "RUPEE: GAINS 24 PAISE"])
        tata = items[1]
        self.assertEqual((tata["outlets"], tata["sources"]), (2, ["Mint", "Economic Times"]))
        self.assertEqual(items[0]["detail"], "ABC Limited has received an order of Rs 120 crore")
        self.assertEqual((items[3]["kind"], items[3]["url"], items[3]["source"]), ("x", "https://x.com/i/status/1", "AVRON on X"))

    def test_a_second_round_adds_only_what_is_new_and_old_items_fall_off(self):
        items, _ = live.merge([], ROWS, NOW)
        again, added = live.merge(items, ROWS + [news("Adani Ports to buy a stake in an Australian terminal operator", "https://www.business-standard.com/h")], NOW)
        self.assertEqual((added, len(again)), (1, 5))
        later, _ = live.merge(again, [], NOW + datetime.timedelta(hours=30))
        self.assertEqual(later, [])

    def test_round_writes_a_safe_feed_and_keeps_the_http_cache(self):
        with tempfile.TemporaryDirectory() as tmp:
            def read(cfg, cache):
                cache["https://x"] = {"etag": "abc"}
                return ROWS, 40, 42
            f = live.round_once(tmp, cfg={}, read=read, now=NOW)
            self.assertEqual((f["sources_ok"], f["sources_total"], f["every_minutes"], len(f["items"])), (40, 42, 3, 4))
            self.assertEqual(json.loads((pathlib.Path(tmp) / "http_cache.json").read_text()), {"https://x": {"etag": "abc"}})
            night = live.round_once(tmp, cfg={}, read=lambda c, k: ([], 1, 1), now=datetime.datetime(2026, 11, 18, 20, 0, tzinfo=datetime.timezone.utc))
            self.assertEqual((night["every_minutes"], len(night["items"])), (15, 4))         # 01:30 IST; nothing lost

    def test_sources_cover_news_nse_announcements_and_x(self):
        cfg = {"feeds": [{"name": "ET Markets", "platform": "news", "url": "u1"}, {"name": "NSE announcements", "platform": "nse", "url": "u2"},
                         {"name": "NSE board meetings", "platform": "nse", "url": "u3"}, {"name": "ValuePickr forum", "platform": "forum", "url": "u4"}],
               "x_merger": {"queue_url": "q", "posted_url": "p"}}
        self.assertEqual([s[:2] for s in live.sources(cfg)], [("ET Markets", "news"), ("NSE announcements", "nse"), ("AVRON on X", "x")])


if __name__ == "__main__":
    unittest.main()
