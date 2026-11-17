#!/usr/bin/env python3
"""TEMP: saves a few raw files so their format can be read. Usage: probe.py <out dir>"""
import pathlib, re, sys, urllib.request
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", "Accept": "*/*"}
A = "https://nsearchives.nseindia.com/"
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
        return r.read()
for name, url in [("fo_participant_oi.csv", A + "content/nsccl/fao_participant_oi_17112026.csv"),
                  ("fo_ban.csv", A + "content/fo/fo_secban.csv"),
                  ("nsdl_fpi.html", "https://www.fpi.nsdl.co.in/web/Reports/Latest.aspx"),
                  ("short_sell.csv", A + "archives/equities/shortSelling/shortselling_17112026.csv"),
                  ("offer_docs.rss.xml", A + "content/RSS/Offer_Documents.xml"),
                  ("sast31.rss.xml", A + "content/RSS/Sast_Regulation31.xml"),
                  ("buyback.rss.xml", A + "content/RSS/Daily_Buyback.xml"),
                  ("annual.rss.xml", A + "content/RSS/Annual_Reports.xml"),
                  ("sebi_orders.html", "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=2&ssid=9&smid=0"),
                  ("pib_all.rss.xml", "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"),
                  ("pib_cabinet.html", "https://www.pib.gov.in/allRel.aspx")]:
    try:
        b = get(url); (OUT / name).write_bytes(b[:300000]); print("saved", name, len(b))
    except Exception as e:
        print(name, "FAILED", str(e)[:120])
# shareholding files of large companies, to see institutional categories and named holders
try:
    rss = get(A + "content/RSS/Shareholding_Pattern.xml").decode("utf-8", "replace")
    links = re.findall(r"<link>\s*(https://nsearchives[^<\s]+\.xml)\s*</link>", rss)
    best = sorted(((len(get(l)), l) for l in links[:12]), reverse=True)[:2]
    for n, (size, l) in enumerate(best):
        (OUT / ("shp_big_%d.xml" % n)).write_bytes(get(l)[:900000]); print("saved shp", l, size)
except Exception as e:
    print("shp FAILED", str(e)[:120])
