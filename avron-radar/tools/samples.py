#!/usr/bin/env python3
"""TEMP: saves a few raw NSE feed and XBRL files so their format can be read. Usage: samples.py <out dir>"""
import pathlib
import re
import sys
import urllib.request

OUT = pathlib.Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", "Accept": "*/*"}
BASE = "https://nsearchives.nseindia.com/content/RSS/"


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


for feed, n in (("Financial_Results", 3), ("Insider_Trading", 2), ("Sast_Regulation29", 1), ("Shareholding_Pattern", 1)):
    try:
        raw = get(BASE + feed + ".xml")
        (OUT / (feed + ".rss.xml")).write_bytes(raw[:60000])
        links = re.findall(r"<link>\s*(https://nsearchives[^<\s]+)\s*</link>", raw.decode("utf-8", "replace"))
        for k, link in enumerate(links[:n]):
            body = get(link)
            name = "%s_%d_%s" % (feed, k, link.rsplit("/", 1)[1][-60:])
            (OUT / name).write_bytes(body[:400000])
            print("saved", name, len(body))
    except Exception as e:
        print(feed, "FAILED", str(e)[:150])
