# Swiggy vs Eternal, Q2 FY27 (Jul–Sep 2026): fact registry

Every number in the script traces to a row here.
- **RF** = REPORTED FACT
- **AC** = AVRON calculation (arithmetic shown)
- **AI** = AVRON INTERPRETATION

Primary sources are in `sources/`:
- NSE filings, downloaded 25 Oct 2026
- Swiggy press release
- Screener exports supplied by the user

| ID | Claim | Label | Source |
|---|---|---|---|
| S1 | Swiggy revenue from operations ₹7,571 cr in Q2 FY27, vs ₹5,561 cr in Q2 FY26 | RF | Swiggy financial results, NSE 22 Oct 2026 |
| S2 | Revenue growth: 7,571 ÷ 5,561 = 1.361, so **+36.1%** | AC | from S1 |
| S3 | Swiggy net loss ₹922 cr (Q1 FY27 ₹791 cr, Q2 FY26 ₹1,092 cr) | RF | Swiggy financial results |
| S4 | Loss grew QoQ: 922 ÷ 791 = 1.166, so **+16.6%** | AC | from S3 |
| S5 | Instamart GOV ₹9,230 cr, NOV ₹6,594 cr (NOV +31.4% YoY, +13.4% QoQ) | RF | Swiggy press release, 22 Oct 2026 |
| S6 | Instamart adjusted EBITDA loss ₹895 cr, margin −9.7% of GOV (−9.8% in Q1) | RF | Swiggy press release |
| S7 | Instamart contribution margin −1.0% of GOV, up 157 bps YoY, down 82 bps QoQ | RF | Swiggy press release |
| S8 | Instamart added 69 dark stores (equal to the previous three quarters combined); 1,240 stores | RF | Swiggy press release |
| S9 | Swiggy food delivery GOV ₹10,054 cr (+17.7% YoY); adjusted EBITDA ₹341 cr (3.4% of GOV), its highest ever | RF | Swiggy press release |
| S10 | Swiggy obtained approvals to qualify as an Indian-owned and controlled company; transition underway | RF | Swiggy press release |
| S11 | Shares fell as much as ~16–17% intraday on 23 Oct 2026, a record single-day drop | RF (press) | CNBC-TV18 via TradingView; Bloomberg, 23 Oct 2026 |
| S12 | IPO price ₹390 (Nov 2024); price in user's Screener export ₹176 | RF | Businessworld; Screener export |
| S13 | Fall from IPO: 176 ÷ 390 = 0.451, so **−54.9%** | AC | from S12 |
| S14 | Swiggy net losses FY20–FY26: 3,920 + 1,617 + 3,629 + 4,179 + 2,350 + 3,117 + 4,154 = **₹22,966 cr**; plus H1 FY27 (791 + 922) = **₹24,679 cr** | AC | Screener export (annual and quarterly) |
| E1 | Eternal revenue ₹24,138 cr (Q2 FY26 ₹13,590 cr); growth 24,138 ÷ 13,590 = **+77.6%** | RF / AC | Screener export; Eternal results, NSE 21 Oct 2026 |
| E2 | Eternal net profit ₹125 cr (₹65 cr a year ago) | RF | Eternal results; Screener |
| E3 | Tax ₹198 cr on profit before tax ₹323 cr: 198 ÷ 323 = **61.3%** | AC | Screener export |
| E4 | Blinkit NOV ₹20,940 cr, +79.3% YoY, +22.2% QoQ | RF | Eternal shareholders' letter, 21 Oct 2026 |
| E5 | Blinkit adjusted EBITDA **+₹184 cr** (0.9% of NOV), vs ₹156 cr loss a year ago; sixth straight quarter of margin improvement | RF | Eternal shareholders' letter |
| E6 | Blinkit added 308 net new stores, total 2,751; targets 3,500+ by Mar 2027 and ~5,000 by Mar 2028 | RF | Eternal shareholders' letter |
| E7 | Cities with ~96% of Blinkit NOV are contribution positive; ~70% are adjusted EBITDA positive; mature cities above 5% adjusted EBITDA margin | RF | Eternal shareholders' letter |
| E8 | Zomato food delivery NOV ₹11,445 cr (+21.5% YoY); adjusted EBITDA margin 5.5% of NOV | RF | Eternal shareholders' letter |
| E9 | Consolidated adjusted EBITDA ₹666 cr (+197% YoY) | RF | Eternal shareholders' letter |
| E10 | Zomato board approved buying Blinkit (formerly Grofers) for ~₹4,447 cr in an all-stock deal, 2022 | RF (press) | IIFL, Inc42 |
| E11 | Eternal capped foreign shareholding at 49.5% (May 2025) to qualify as an Indian-owned and controlled company, so Blinkit could own inventory; the switch began September 2025 | RF (press) | MediaNama, July 2025 |
| M1 | Market caps in the user's Screener export: Eternal ₹3,06,302 cr, Swiggy ₹48,582 cr; ratio 306,302 ÷ 48,582 = **6.3x** | RF / AC | Screener export |
| C1 | Quick-commerce NOV: Blinkit vs Instamart, 20,940 ÷ 6,594 = **3.2x** | AC | E4, S5 |
| C2 | Stores 2,751 vs 1,240 = **2.2x** | AC | E6, S8 |
| C3 | NOV per store per day (Jul–Sep = 92 days, end-of-quarter store count): Blinkit 20,940 cr ÷ 2,751 ÷ 92 = **₹8.3 lakh**; Instamart 6,594 cr ÷ 1,240 ÷ 92 = **₹5.8 lakh** | AC | E4, E6, S5, S8. Uses end-of-quarter stores, so newly opened stores pull both figures down |
| C4 | Per ₹100 of NOV: Blinkit earns 184 ÷ 20,940 = **+₹0.88**; Instamart loses 895 ÷ 6,594 = **−₹13.57** | AC | E5, S5, S6. Both companies define NOV slightly differently |
| C5 | Instamart loss per day: 895 cr ÷ 92 = **₹9.7 cr a day**; Blinkit profit per day 184 ÷ 92 = **₹2.0 cr** | AC | S6, E5 |
| C6 | Swiggy food profit vs Instamart loss: 341 − 895 = **−₹554 cr** | AC | S9, S6 |
| X1 | GOV and NOV are different measures (GOV is before discounts and some fees), so Swiggy food (GOV) and Zomato food (NOV) margins are not like for like | Note | Both companies' definitions |
| E12 | Zomato food delivery NOV more than doubled, ₹18,160 cr (FY22) to ₹37,993 cr (FY26), ~20% CAGR; part of FY26's slowdown came from ordering occasions moving to quick commerce | RF | Eternal shareholders' letter, Q4 |
| E13 | Blinkit guidance: 60% NOV CAGR over 3 years; "two quarters in… tracking ahead… too early to revise"; growth moderated to ~79% because of a larger base | RF | Eternal shareholders' letter, Q10 |
| E14 | Eternal: cash balance and profits from food and quick commerce "let us fund this pace of growth comfortably" | RF (company statement) | Eternal shareholders' letter |
| S15 | Swiggy food MTUs 19.8 million (+15.2% YoY) | RF | Swiggy press release |
| S16 | Toing (Swiggy's standalone affordable-meals app) is in 50+ cities; two of three new Toing users were new to food delivery; Swiggy says Toing can lift combined food growth to 25–30% | RF (company claim) | Swiggy press release |
| S17 | Swiggy cash from financing activities FY26: ₹9,397 cr; cash from operations FY26: −₹2,898 cr | RF | Screener export (cash flow) |
| S18 | Swiggy cash & bank ₹4,043 cr + investments ₹6,034 cr at 31 Mar 2026 = ₹10,077 cr | RF / AC | Screener export (balance sheet) |
| X2 | Definitions: GOV is the total value of orders including taxes and fees before discounts; NOV is order value after discounts. Each company defines them slightly differently | Note | Swiggy / Eternal definitions |
| A1 | Quick commerce is now a game of store productivity and the inventory model; Blinkit is about a year ahead on inventory | AI | from C3, E11, S10 |

Not used (could not verify from a primary source): Swiggy's "losses have peaked" quote (only in press reports of the shareholder letter, whose NSE PDF is corrupted at the source); Instamart's launch date; analysts' estimates and targets (and no targets on AVRON anyway).
