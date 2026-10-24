# Source verification: Viviana Power Tech reel ("₹903 → ₹680")
Checked 24 Oct 2026. **P** = primary (exchange filing, company document, regulator). **S** = secondary.

| # | Claim on screen or in VO | Value used | Source | Status |
|---|---|---|---|---|
| 1 | 15 Oct close | ₹903.30 | NSE daily close via Yahoo Finance chart API, `research/yahoo_viviana_3mo.json` (S, exchange data) | ✅ Also matches Finology (16 Oct: 796.10, −107.20) |
| 2 | 23 Oct close | ₹680.50 | Same; NDTV Profit and MarketsMojo agree | ✅ |
| 3 | Fall 15 → 23 Oct | −24.7% | AVRON calc.: 680.50 / 903.30 − 1 | ✅ |
| 4 | "पाँच trading days" | 16, 19, 21, 22, 23 Oct | NSE holiday: 20 Oct (Dussehra); Moneycontrol and Mint, 20 Oct 2026 | ✅ |
| 5 | 16 Oct: "12% गिरा" | 903.30 → 796.10 = −11.87% | Closes | ✅ On screen: −11.9% |
| 6 | 10 Oct (Saturday), 13:07: ₹467 cr order | Rs 466,73,61,738 incl. taxes, MGVCL, turnkey | `research/filings/VIVIANA_10102026133007_…MGVCL…txt` (P, NSE). Digital signature 13:07:57 | ✅ |
| 7 | Same filing: "already disclosed" | "already been considered and disclosed in the Company's Investor Presentation and intimation regarding its L1 position" | Same filing (P) | ✅ Verbatim on screen |
| 8 | 10 Oct, 22:48: board meeting notice on warrants | Meeting on Thu 15 Oct "to consider and approve the issuance of fully convertible warrants/equity shares on a preferential basis to one or more persons/investors/promoters" | `research/filings/VIVIANA_10102026225202_BM_INTIMATION_10102026.txt` (P). Signed 22:48:50 | ✅ |
| 9 | 15 Oct: plan dropped | "unanimously decided not to proceed with the proposed issuance of fully convertible warrants on a preferential basis". Meeting 4:30–6:00 pm; signed 18:17 | `research/filings/bm1510.txt` (P, NSE outcome) | ✅ |
| 10 | Vadodara; EPC up to 400 kV; Gujarat discom clients | — | Company letterhead and Q1 FY27 call (P); order filings from MGVCL, PGVCL, DGVCL and GETCO (P) | ✅ |
| 11 | Revenue ₹33 cr (FY22) → ₹531 cr (FY26); "16×" | 33, 36, 66, 219, 531 | Screener consolidated (S). FY26 cross-check: Q1 filing consolidated FY26 total income 53,625.74 lakh − other income 501.18 = ₹531.2 cr (P) | ✅ 531/33 = 16.1× |
| 12 | Operating cash flow negative for three years | −3, −14, −4 (FY24–FY26) | Screener consolidated cash flow (S) | ✅ Primary annual report not re-checked |
| 13 | Net profit 7 / 21 / 53 | FY24–FY26 | Screener (S) | ✅ |
| 14 | Debtor days 267 (and 153 → 207 → 267) | FY26 | Screener ratios (S) | ✅ A computed ratio, labelled as such |
| 15 | Borrowings ₹51 → ₹100 cr ("double") | FY25 → FY26 | Screener (S) | ✅ 1.96× |
| 16 | NCD ₹20 cr @ 12% (May 2026) | Allotment 22 May 2026 | ScanX (S); board approvals of up to ₹25 cr (3 Mar) and up to ₹75 cr (28 Apr) via MarketScreener (S); ISIN INE0MEG07011 is 12% Mar-2028 | ⚠️ Secondary. Primary allotment filing not opened |
| 17 | "no delayed payments from our clients, not a single client." | Richi Choksi, Whole-time Director | Q1 FY27 call transcript, 6 Aug 2026 (P), `research/q1fy27_transcript.txt` | ✅ Verbatim |
| 18 | "more than INR40 plus crores are received in the month of July" | Dipesh Patel, CFO | Same (P) | ✅ Verbatim |
| 19 | Q2 results "14 November तक" | 30 Sep + 45 days | SEBI LODR Reg. 33(3)(a) (P, regulation) | ✅ Legal deadline. The actual date isn't announced yet |
| 20 | Quarterly revenue 31.68 / 58.94 / 117.87 / 322.75 / 72.39; Mar-26 = 61% of FY26 | ₹ cr | Screener consolidated (S). Q1 FY27 consolidated 72.39 matches the filing: total income 7,330.95 − other income 91.90 (P) | ✅ |

## Reconciled since report v1
- **Q1 FY27 figures.** ₹71.86 cr revenue / ₹6.93 cr PAT is **standalone**. ₹72.39 cr / ≈ ₹6.0 cr is **consolidated**. Both appear in the 4 Aug filing.
- **Divestment.**
  - Viviana Life Spaces (90%) went to Mrs. Priyanka Richi Choksi, a **promoter**. The filing says it was a related-party transaction "at arm's length based on a valuation report", with consideration "to be determined".
  - Aarsh Transformers (75%) went to Mrs. Renu Sakrani, who is not in the promoter group.
  - Completion was reported on 17 Aug 2026.
  - **Not in the reel. Suggested for the pinned comment.**

## Deliberately not claimed
- **Why the stock fell.** The company didn't say. The reel puts the dates side by side and states no cause.
- **Any buy/sell view or price target.**
