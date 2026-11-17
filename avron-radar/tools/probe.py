#!/usr/bin/env python3
"""Checks which data sources answer from this machine. Prints one line each."""
import sys
import urllib.request

BROWSER = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
BSE = {"Referer": "https://www.bseindia.com/", "Origin": "https://www.bseindia.com"}
D1, D2 = "16112026", "20261116"
URLS = [
    ("nse_ann", "https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml", {}),
    ("nse_results", "https://nsearchives.nseindia.com/content/RSS/Financial_Results.xml", {}),
    ("nse_insider", "https://nsearchives.nseindia.com/content/RSS/Insider_Trading.xml", {}),
    ("nse_board", "https://nsearchives.nseindia.com/content/RSS/Board_Meetings.xml", {}),
    ("nse_corpact", "https://nsearchives.nseindia.com/content/RSS/Corporate_action.xml", {}),
    ("nse_sast", "https://nsearchives.nseindia.com/content/RSS/Sast_Regulation29.xml", {}),
    ("nse_shp", "https://nsearchives.nseindia.com/content/RSS/Shareholding_Pattern.xml", {}),
    ("nse_bhav_full", "https://nsearchives.nseindia.com/products/content/sec_bhavdata_full_%s.csv" % D1, {}),
    ("nse_bhav_udiff", "https://nsearchives.nseindia.com/content/cm/BhavCopy_NSE_CM_0_0_0_%s_F_0000.csv.zip" % D2, {}),
    ("nse_bulk", "https://nsearchives.nseindia.com/content/equities/bulk.csv", {}),
    ("nse_block", "https://nsearchives.nseindia.com/content/equities/block.csv", {}),
    ("nse_equity_list", "https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv", {}),
    ("nse_n500", "https://nsearchives.nseindia.com/content/indices/ind_nifty500list.csv", {}),
    ("nse_small250", "https://nsearchives.nseindia.com/content/indices/ind_niftysmallcap250list.csv", {}),
    ("nse_micro250", "https://nsearchives.nseindia.com/content/indices/ind_niftymicrocap250_list.csv", {}),
    ("nse_indices", "https://nsearchives.nseindia.com/content/indices/ind_close_all_%s.csv" % D1, {}),
    ("nse_mcap", "https://nsearchives.nseindia.com/content/equities/MCAP31032026.xlsx", {}),
    ("bse_ann", "https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?pageno=1&strCat=-1&strPrevDate=20261117&strScrip=&strSearch=P&strToDate=20261117&strType=C&subcategory=-1", BSE),
    ("bse_bulk", "https://api.bseindia.com/BseIndiaAPI/api/BulknBlockDeals/w?flag=1", BSE),
    ("sebi", "https://www.sebi.gov.in/sebirss.xml", {}),
    ("rbi_press", "https://www.rbi.org.in/pressreleases_rss.xml", {}),
    ("rbi_notif", "https://www.rbi.org.in/notifications_rss.xml", {}),
    ("pib", "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", {}),
    ("pulse", "https://pulse.zerodha.com/feed.php", {}),
    ("valuepickr", "https://forum.valuepickr.com/latest.rss", {}),
    ("et_markets", "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", {}),
    ("et_stocks", "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms", {}),
    ("mc_business", "https://www.moneycontrol.com/rss/business.xml", {}),
    ("mc_markets", "https://www.moneycontrol.com/rss/marketreports.xml", {}),
    ("mint_markets", "https://www.livemint.com/rss/markets", {}),
    ("mint_companies", "https://www.livemint.com/rss/companies", {}),
    ("bs_markets", "https://www.business-standard.com/rss/markets-106.rss", {}),
    ("hbl_markets", "https://www.thehindubusinessline.com/markets/feeder/default.rss", {}),
    ("ndtvprofit", "https://www.ndtvprofit.com/feed", {}),
    ("cnbctv18", "https://www.cnbctv18.com/commonfeeds/v1/cne/rss/market.xml", {}),
    ("yahoo", "https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS?range=5d&interval=1d", {}),
    ("yahoo_nifty", "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=5d&interval=1d", {}),
]
for h in ("CNBC-TV18", "ETNOW", "ZeeBusiness", "NDTVProfitIndia", "SOICfinance", "marketfeed", "ShankarNath",
          "FinologyLegal", "Groww", "ParimalAde", "VivekSinghalOfficial", "StockEdgeOfficial", "moneypurse",
          "AssetYogi", "InvestWithNeeraj", "BloombergQuint", "thinkschool", "Thewealthmagnet", "PRSundar64",
          "KunalSaraogi", "POWEROFSTOCKS", "sunilminglani", "JainamShare", "TradeBrains", "elearnmarkets"):
    URLS.append(("yt @" + h, "https://www.youtube.com/@" + h, {}))
for c in ("ZeeBusiness", "CNBC_Awaaz", "ETMarkets", "NDTVProfit", "stockedgeofficial", "TradeBrainsOfficial",
          "business_standard", "livemint", "economictimes", "Stockmarketnewsindia", "nse_india", "equitymaster",
          "tickertapeIN", "finshots", "zerodhaonline"):
    URLS.append(("tg " + c, "https://t.me/s/" + c, {}))

for name, url, extra in URLS:
    h = {"User-Agent": BROWSER, "Accept": "*/*", "Accept-Language": "en-IN,en;q=0.8"}
    h.update(extra)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=25) as r:
            body = r.read()
        text = body[:4000].decode("utf-8", "replace")
        note = ""
        if name.startswith("yt "):
            note = "channel" if b'"channelId":"UC' in body or b"/channel/UC" in body else "NO CHANNEL ID"
        elif name.startswith("tg "):
            note = "%d posts" % body.count(b"tgme_widget_message_wrap")
        else:
            note = " ".join(text[:170].split())
        print("%-18s OK   %8d  %s" % (name, len(body), note))
    except Exception as e:
        print("%-18s FAIL %s" % (name, str(e)[:90]))
    sys.stdout.flush()
