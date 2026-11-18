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

    def test_reddit_reads_one_subreddit_per_run_in_turn(self):
        cfg, state = {"subreddits": ["a", "b", "c"]}, {}
        seen = [[s for s, _ in radar.lane_reddit(cfg, state)] for _ in range(4)]
        self.assertEqual(seen, [["r/a"], ["r/b"], ["r/c"], ["r/a"]])

    def test_a_source_that_keeps_failing_is_rested_then_tried_again(self):
        old = radar.PAUSE
        radar.PAUSE = 0
        try:
            calls, state = [], {}
            def boom():
                calls.append(1)
                raise ValueError("down")
            for n in range(radar.FAILS_BEFORE_PAUSE + 2):
                (entry, _), = radar.run_lane("news", [("dead", boom)], state, "t", now=1000.0 + n)
            self.assertEqual(len(calls), radar.FAILS_BEFORE_PAUSE)          # the last two runs did not hit it
            self.assertTrue(entry["paused"])
            later = 1000.0 + radar.PAUSE_HOURS * 3600 + 60
            (entry, found), = radar.run_lane("news", [("dead", lambda: ["x"])], state, "t", now=later)
            self.assertEqual((entry["ok"], found, state["fails"], state["paused_until"]), (True, ["x"], {}, {}))
        finally:
            radar.PAUSE = old

    def test_http_retries_a_server_error_once_but_not_a_refusal(self):
        import urllib.error
        old = (radar.urllib.request.urlopen, radar.RETRY_WAIT)
        radar.RETRY_WAIT = 0
        class Resp:
            def __enter__(self): return self
            def __exit__(self, *a): return False
            def read(self): return b"ok"
        try:
            codes = [503]
            def flaky(req, timeout=0):
                if codes:
                    raise urllib.error.HTTPError(req.full_url, codes.pop(), "x", {}, None)
                return Resp()
            radar.urllib.request.urlopen = flaky
            self.assertEqual(radar.http_get_bytes("https://example.invalid/"), b"ok")
            codes = [403, 403]
            with self.assertRaises(urllib.error.HTTPError):
                radar.http_get_bytes("https://example.invalid/")
            self.assertEqual(len(codes), 1)                                   # asked once only
        finally:
            radar.urllib.request.urlopen, radar.RETRY_WAIT = old

    def test_token_totals_per_model(self):
        t = radar.token_totals([{"model": "a", "in": 10, "out": 2, "cache_read": 5, "cache_write": 0},
                                {"model": "a", "in": 1, "out": 1, "cache_read": 0, "cache_write": 0},
                                {"model": "b", "in": 7, "out": 3, "cache_read": 0, "cache_write": 0}])
        self.assertEqual(t["a"], {"calls": 2, "in": 11, "out": 3, "cache_read": 5, "cache_write": 0})
        self.assertEqual(t["b"]["calls"], 1)


class XDesk(unittest.TestCase):
    def test_merger_files_become_feed_rows_with_posting_status(self):
        q = "\n".join([
            json.dumps({"id": "20261118-1144-N01", "created_ist": "2026-11-18 11:44", "lane": "news", "company": "Ashoka Buildcon",
                        "headline": "ASHOKA BUILDCON: LOWEST BIDDER FOR RS 1,465 CRORE NHAI PROJECT", "detail": "18-month execution.",
                        "post_text": "x", "verify_link": "https://example.com/a", "document_read": True}),
            json.dumps({"id": "20261118-0900-S01", "created_ist": "2026-11-18 09:00", "lane": "story", "company": "",
                        "headline": "STORY", "thread": ["one (1/2)", "two (2/2)"], "story_text": "one\n\ntwo", "verify_link": "https://example.com/b"}),
            "not json", json.dumps({"id": "no-headline"})])
        p = json.dumps({"id": "20261118-1144-N01", "posted_ist": "2026-11-18 11:51", "tweet_id": "2122938319998800187"})
        items, posted = radar.parse_merger(q, p)
        self.assertEqual(len(items), 2)
        a = items[0]
        self.assertEqual((a["platform"], a["source"], a["company"], a["url"], a["published_at"]),
                         ("avronx", "Avron X desk: news", "Ashoka Buildcon", "https://example.com/a", "2026-11-18T06:14:00Z"))
        self.assertEqual(items[1]["text"], "one\n\ntwo")
        self.assertEqual(posted, {"20261118-1144-N01": "2122938319998800187"})


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
