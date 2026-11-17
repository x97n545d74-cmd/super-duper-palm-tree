#!/usr/bin/env python3
"""TEMP: checks which extra data sources answer from this machine."""
import sys
import urllib.request

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36", "Accept": "*/*", "Accept-Language": "en-IN,en;q=0.8"}
A = "https://nsearchives.nseindia.com/"
URLS = [
    ("fo_participant_oi", A + "content/nsccl/fao_participant_oi_17112026.csv"),
    ("fo_participant_vol", A + "content/nsccl/fao_participant_vol_17112026.csv"),
    ("fo_bhav", A + "content/fo/BhavCopy_NSE_FO_0_0_0_20261117_F_0000.csv.zip"),
    ("fo_ban", A + "content/fo/fo_secban.csv"),
    ("fo_mwpl", A + "content/nsccl/mwpl_cli_17112026.xls"),
    ("fii_stats", A + "content/fo/fii_stats_17-Nov-2026.xls"),
    ("fii_dii_cash", A + "content/equities/FIIDII_17112026.csv"),
    ("nsdl_fpi", "https://www.fpi.nsdl.co.in/web/Reports/Latest.aspx"),
    ("nsdl_fpi_daily", "https://www.fpi.nsdl.co.in/web/StaticReports/Fortnightly_Sector_wise_FII_Investment_Data/FIIInvestSector.html"),
    ("pr_zip", A + "archives/equities/bhavcopy/pr/PR171126.zip"),
    ("mto", A + "archives/equities/mto/MTO_17112026.DAT"),
    ("short_sell", A + "archives/equities/shortSelling/shortselling_17112026.csv"),
    ("52wk", A + "content/CM_52_wk_High_low_17112026.csv"),
    ("price_band", A + "content/equities/sec_list.csv"),
    ("mcap_list", A + "content/equities/MCAP_30092026.zip"),
    ("ipo_rss", A + "content/RSS/Offer_Documents.xml"),
    ("annual_rss", A + "content/RSS/Annual_Reports.xml"),
    ("circ_rss", A + "content/RSS/Circulars.xml"),
    ("buyback_rss", A + "content/RSS/Daily_Buyback.xml"),
    ("voting_rss", A + "content/RSS/Voting_Results.xml"),
    ("pledge_rss", A + "content/RSS/Pledge.xml"),
    ("sast31_rss", A + "content/RSS/Sast_Regulation31.xml"),
    ("brsr_rss", A + "content/RSS/Brsr.xml"),
    ("sme_ann_rss", A + "content/RSS/Sme_announcements.xml"),
    ("secretarial_rss", A + "content/RSS/Secretarial_Compliance.xml"),
    ("stooq", "https://stooq.com/q/l/?s=^spx+^ndq+^dji+cl.f+gc.f+usdinr+10usy.b+^nkx+^hsi&f=sd2t2ohlcv&h&e=csv"),
    ("stooq_hist", "https://stooq.com/q/d/l/?s=^spx&i=d"),
    ("fred_dgs10", "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DGS10"),
    ("fred_brent", "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU"),
    ("fred_usdinr", "https://fred.stlouisfed.org/graph/fredgraph.csv?id=DEXINUS"),
    ("fred_sp500", "https://fred.stlouisfed.org/graph/fredgraph.csv?id=SP500"),
    ("fred_vix", "https://fred.stlouisfed.org/graph/fredgraph.csv?id=VIXCLS"),
    ("sebi_orders", "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=2&ssid=9&smid=0"),
    ("sebi_rss", "https://www.sebi.gov.in/sebirss.xml"),
    ("mospi_rss", "https://www.mospi.gov.in/rss.xml"),
    ("amfi_nav", "https://www.amfiindia.com/spages/NAVAll.txt"),
    ("rbi_ref_rate", "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx"),
    ("mcx", "https://www.mcxindia.com/backpage.aspx/GetMarketWatch"),
    ("gift", "https://www.nseix.com/"),
    ("frankfurter", "https://api.frankfurter.app/latest?from=USD&to=INR"),
    ("coingecko", "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"),
]
for name, url in URLS:
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=25) as r:
            body = r.read()
        print("%-18s OK   %8d  %s" % (name, len(body), " ".join(body[:300].decode("utf-8", "replace").split())[:230]))
    except Exception as e:
        print("%-18s FAIL %s" % (name, str(e)[:90]))
    sys.stdout.flush()
