"""Checks the parsers and the collect/tag/build flow with samples, no network.
Run: python3 -m unittest avron-radar/test_radar.py   (or: cd avron-radar && python3 -m unittest)
"""
import json
import os
import pathlib
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import radar  # noqa: E402

REDDIT = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
 <entry><author><name>/u/someone</name></author>
  <content type="html">&lt;div&gt;&lt;p&gt;ABC Ltd got an order win of Rs 120 crore&lt;/p&gt;&lt;/div&gt;</content>
  <id>t3_abc123</id><link href="https://www.reddit.com/r/IndianStockMarket/comments/abc123/x/"/>
  <updated>2026-11-17T09:00:00+00:00</updated><published>2026-11-17T09:00:00+00:00</published>
  <title>ABC order</title></entry>
</feed>"""

YOUTUBE = """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">
 <entry><id>yt:video:VID12345678</id><title>Smallcap results explained</title>
  <link rel="alternate" href="https://www.youtube.com/watch?v=VID12345678"/>
  <author><name>Some Channel</name></author><published>2026-11-17T05:30:00+00:00</published>
  <media:group><media:description>What the quarter means</media:description></media:group></entry>
</feed>"""

NEWS = """<rss version="2.0"><channel>
 <item><title>SEBI bars firm - Mint</title><link>https://news.google.com/rss/articles/xyz</link>
  <guid isPermaLink="false">xyz</guid><pubDate>Tue, 17 Nov 2026 06:10:00 GMT</pubDate>
  <description>&lt;a href="x"&gt;SEBI bars firm&lt;/a&gt;</description><source url="https://www.livemint.com">Mint</source></item>
</channel></rss>"""

TELEGRAM = """<section>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message" data-post="chan/101">
 <div class="tgme_widget_message_text js-message_text" dir="auto">QIP of Rs 500 crore opens<br/>Floor price set</div>
 <a class="tgme_widget_message_date" href="https://t.me/chan/101"><time datetime="2026-11-17T07:00:00+00:00" class="time">07:00</time></a></div></div>
<div class="tgme_widget_message_wrap js-widget_message_wrap"><div class="tgme_widget_message" data-post="chan/102">
 <a class="tgme_widget_message_photo_wrap"></a></div></div>
</section>"""

BLUESKY = {"posts": [{"uri": "at://did:plc:1/app.bsky.feed.post/3kabc", "author": {"handle": "a.bsky.social"},
                      "record": {"text": "nifty smallcap up", "createdAt": "2026-11-17T08:00:00.000Z"}}]}
XPAY = {"data": [{"id": "99", "author_id": "7", "text": "QIP news", "created_at": "2026-11-17T08:05:00.000Z"}],
        "includes": {"users": [{"id": "7", "username": "trader"}]}}
REDDIT_JSON = {"data": {"children": [{"data": {"name": "t3_q", "permalink": "/r/x/comments/q/t/", "title": "T",
                                                "selftext": "body", "author": "u1", "created_utc": 1794900000}}]}}


class Parsers(unittest.TestCase):
    def test_reddit(self):
        (i,) = radar.parse_atom(REDDIT, "reddit", "r/IndianStockMarket")
        self.assertEqual(i["text"], "ABC Ltd got an order win of Rs 120 crore")
        self.assertEqual(i["published_at"], "2026-11-17T09:00:00Z")
        self.assertTrue(i["url"].startswith("https://www.reddit.com/r/"))

    def test_youtube(self):
        (i,) = radar.parse_atom(YOUTUBE, "youtube", "@x")
        self.assertEqual(i["url"], "https://www.youtube.com/watch?v=VID12345678")
        self.assertEqual(i["text"], "What the quarter means")

    def test_news(self):
        (i,) = radar.parse_rss(NEWS, "news", "search: sebi")
        self.assertEqual((i["author"], i["text"]), ("Mint", "SEBI bars firm"))
        self.assertEqual(i["published_at"], "2026-11-17T06:10:00Z")

    def test_telegram_skips_posts_without_text(self):
        (i,) = radar.parse_telegram(TELEGRAM, "chan")
        self.assertEqual(i["url"], "https://t.me/chan/101")
        self.assertEqual(i["title"], "QIP of Rs 500 crore opens")
        self.assertIn("Floor price set", i["text"])

    def test_bluesky_x_reddit_json(self):
        self.assertEqual(radar.parse_bluesky(BLUESKY, "q")[0]["url"], "https://bsky.app/profile/a.bsky.social/post/3kabc")
        self.assertEqual(radar.parse_x(XPAY, "q")[0]["url"], "https://x.com/trader/status/99")
        self.assertEqual(radar.parse_reddit_json(REDDIT_JSON, "x")[0]["url"], "https://www.reddit.com/r/x/comments/q/t/")

    def test_channel_id(self):
        cid = "UC" + "a" * 22
        self.assertEqual(radar.youtube_channel_id('"channelId":"%s"' % cid), cid)
        self.assertEqual(radar.youtube_channel_id("nothing"), "")

    def test_watch_hits_whole_words(self):
        item = {"title": "QIP opens", "text": "equipment maker"}
        self.assertEqual(radar.watch_hits(item, ["QIP", "equip"]), ["QIP"])

    def test_parse_tags_cleans_bad_values(self):
        out = radar.parse_tags('noise [{"id":"a","relevance":9,"kind":"weird","companies":"x","summary":"s"}] end')
        self.assertEqual(out["a"]["relevance"], 5)
        self.assertEqual(out["a"]["kind"], "other")
        self.assertEqual(out["a"]["companies"], [])

    def test_parse_tags_keeps_complete_objects_from_a_cut_off_reply(self):
        out = radar.parse_tags('[{"id":"a","relevance":3,"kind":"fact"},{"id":"b","relevance":2,"summ')
        self.assertEqual(list(out), ["a"])

    def test_reddit_reads_two_subreddits_per_run_in_turn(self):
        cfg, state = {"subreddits": ["a", "b", "c"]}, {}
        first = [s for s, _ in radar.lane_reddit(cfg, state)]
        second = [s for s, _ in radar.lane_reddit(cfg, state)]
        self.assertEqual((first, second), (["r/a", "r/b"], ["r/c", "r/a"]))


class Flow(unittest.TestCase):
    def test_collect_dedupes_survives_a_dead_source_then_tags_and_builds(self):
        with tempfile.TemporaryDirectory() as tmp:
            old = (radar.DATA, radar.HERE, radar.LANES, radar.PAUSE)
            tmp = pathlib.Path(tmp)
            (tmp / "dashboard.template.html").write_text(
                (old[1] / "dashboard.template.html").read_text(encoding="utf-8"), encoding="utf-8")
            radar.DATA, radar.HERE, radar.PAUSE = tmp / "data", tmp, 0
            # published "now" so the age cut-off keeps them
            fresh = REDDIT.replace("2026-11-17T09:00:00+00:00", radar.iso(radar.now_utc()))

            def lane(cfg, state):
                yield "good", lambda: radar.parse_atom(fresh, "reddit", "r/t")
                yield "dead", lambda: (_ for _ in ()).throw(ValueError("boom"))
            radar.LANES = [("reddit", lane)]
            try:
                cfg = {"watchlist": ["order win"]}
                self.assertEqual(len(radar.collect(cfg)), 1)
                self.assertEqual(len(radar.collect(cfg)), 0)       # second round: nothing new
                health = json.loads((tmp / "data" / "health.json").read_text())
                self.assertEqual([h["ok"] for h in health], [True, False])
                (row,) = radar.load_items().values()
                self.assertEqual(row["watch"], ["order win"])
                reply = json.dumps([{"id": row["id"], "relevance": 4, "kind": "fact", "companies": ["ABC Ltd"],
                                     "topic": "order win", "summary": "ABC Ltd says it won an order."}])
                self.assertEqual(radar.tag(ask=lambda prompt: reply), 1)
                radar.build()
                db = sqlite3.connect(tmp / "radar.db")
                self.assertEqual(db.execute("SELECT kind, companies, watch FROM items").fetchall(),
                                 [("fact", "ABC Ltd", "order win")])
                db.close()
                self.assertTrue(list((tmp / "data").glob("items-????-??-??.jsonl")))   # one small file per day
                self.assertTrue(list((tmp / "data").glob("tags-????-??-??.jsonl")))
                page = (tmp / "dashboard.html").read_text(encoding="utf-8")
                self.assertIn("ABC Ltd says it won an order.", page)
                self.assertNotIn("/*DATA*/null", page)
            finally:
                radar.DATA, radar.HERE, radar.LANES, radar.PAUSE = old


if __name__ == "__main__":
    unittest.main()
