# AVRON on YouTube: what to upload (research, 25 Oct 2026)

**Method.** I ran 26 Agent Reach YouTube searches (20 results each) across AVRON's topic areas: 474 unique Hindi/Hinglish finance and business videos, with views, likes, length and channel. Raw data: `results.jsonl`, queries: `queries.txt`.

**Limits.**
- YouTube blocked the detail lookups from this server with a bot check, so there are **no upload dates or subscriber counts**.
  - That means views per day can't be measured, and a 3-year-old video counts the same as a new one.
  - Search ranking also favours bigger channels.
- Treat the numbers as **what the market rewards over time**, not this week's trend.
- Shorts data is thin: YouTube search mostly returns long videos.
- With a free YouTube Data API key I can redo this with dates, subscriber counts and an outlier score (views ÷ subscribers).

## 1. Format: long-form wins, and it isn't close

Median views by length (all 474 videos):

| Length | Videos | Median views |
|---|---|---|
| 3–8 min | 113 | 10K |
| 8–15 min | 130 | 68K |
| **15–30 min** | 130 | **161K** |
| 30 min+ (mostly podcasts) | 69 | 122K |

**Recommendation.**
- **One 15–20 min deep-dive a week** as the main product.
- **Reels repurposed as YouTube Shorts**: 3–4 a week, cut from the deep-dive and from the Instagram reels we already make.

## 2. What to make: topics ranked

Median views by topic cluster:

| Topic | Median | What worked | Fit for AVRON |
|---|---|---|---|
| Company stories ("how X makes money", downfalls, the real story) | 237K | Barbeque Nation downfall 2.6M, Blinkit strategy 2.7M (Think School), Shark Tank reality 2.4M | **Core.** This is "the story behind the stock". |
| Stock stories ("why is X falling despite Y") | 52K overall; the best are huge | D-Mart "stock plummeting despite the crowds" 3.0M, Oracle's AI-deal fall 2.0M | **Core.** Our exact format. |
| IPO explained from the filing | 68K | "What the 528-page DRHP reveals about Jio IPO" 1.2M (Think School) | **Strong.** Facts from the DRHP only, never "should you apply". |
| Macro with a hook number | 67K | "Why Rupee Hit 90" 1.6M, "Rupee is dying" 1.1M | Good, if it's tied to a concrete number. |
| Tech-business economics | 26K overall; peaks high | AI bubble 1.5M, Zepto/Blinkit 1.0M, smartphone sales crash 567K (a 4-min news clip) | Good. Our smartphone research fits here. |
| Daily market news | 77K, dominated by CNBC Awaaz, Zee Business, Moneycontrol | Their own videos sit at 6K–39K medians | **Skip.** Too crowded, low yield for a new channel. |
| Commodity prices, sector stock lists | 12–17K | | **Skip.** |

## 3. Titles: what the data says

Long-form videos (over 8 min), median views with vs without the pattern:

- **Words like "reality", "truth", "dark":** 388K vs 85K. Use them only when the video delivers a real finding, as in "The real story behind…". No clickbait. AVRON's edge is that the claim holds up.
- **A specific number** (₹, %, crore): 183K vs 90K. "₹903 to ₹680", "32% costlier", "Rupee at 90".
- **"Business model" / "how it earns"** in the title: 64K vs 95K. Say the finding, not the format.
- **Company name plus a tension** ("despite the crowds", "despite record sales") is the pattern behind the D-Mart and Oracle hits.
- Titles in English or Hinglish, with optional Devanagari, both work. Think School succeeds with Devanagari titles.

## 4. First five videos (all from research we have or can verify quickly)

| # | Working title | Length | Status |
|---|---|---|---|
| 1 | India's Smartphone Crash: Why ₹10,000 Phones Got 32% Costlier | 12–15 min | Research done and verified. Extends the reel. |
| 2 | Viviana Power Tech: ₹903 to ₹680, The Full Story in the Filings | 15 min | Research done (Parts 1 and 2). |
| 3 | What the Jio DRHP Actually Says About the ₹11 Lakh Crore Valuation | 15–20 min | Needs the DRHP read and verified. Facts only. |
| 4 | Rupee at 90: Who Actually Pays for It | 12–15 min | Needs current RBI and market data. |
| 5 | AI Data Centres Are Making Your Next Phone Costlier | 10–12 min | Builds on the memory-chip research. |

Each one gets the same AVRON rules: primary sources, arithmetic shown on screen, REPORTED FACT vs AVRON INTERPRETATION labels, no buy/sell/hold, and a source card at the end.

## 5. Weekly rhythm

- **Mon:** pick and verify the topic. Approve the script.
- **Wed:** voiceover (you, or ElevenLabs).
- **Fri:** 15-min deep-dive goes live.
- **Through the week:** 3–4 Shorts cut from it. The Instagram reels double as Shorts (both are 9:16 and under 60 s).
- **Thumbnail:** one number plus one face or object, three words maximum.

## 6. Who to study (appeared most in these searches)

- **Think School:** case studies and DRHP explainers, median 1.2M.
- **CA Rahul Malodia:** business reality pieces, median 566K.
- **Pushkar Raj Thakur:** market explainers, median 231K.
- **Live Hindi Facts:** company downfall stories, median 217K.
- **Hidden Ops India:** the D-Mart story, 3.0M.

Study their structure and pacing, not their scripts.

## 7. Company-story shortlist (25 Oct 2026)

Each candidate has a news hook from this month. YouTube coverage was checked with Agent Reach: 15 search results per company, with total views and the number of videos over 100K. Facts are from news and aggregators and still need checking against filings.

| Rank | Story | Hook | YouTube today | Why it's a good bet |
|---|---|---|---|---|
| 1 | **Swiggy vs Eternal: the quick-commerce war after Q2** | Swiggy fell ~16% on 23 Oct despite strong revenue | Only results recaps, top video 21K | Quick-commerce stories draw ~1M, and nobody has told this quarter's story yet |
| 2 | **eMudhra: how one security problem took a third off its value** | ~35% fall in a week after a certificate-authority issue (22 Oct) | One 106K video, the rest small | Fresh, under-covered, and an unusual business (digital trust certificates) |
| 3 | **Why Indian IT fell 19% in 2026** | Nifty IT down ~19% this year, AI worries | 0.8M total, mostly "should you buy" takes | Big audience; AVRON's edge is facts with no calls |
| 4 | **What the Jio DRHP actually says** | Jio IPO in the news | 1.7M total, Think School 1.2M | Proven demand; only while the IPO is current |
| 5 | **Ola Electric: the full story in the filings** | Long-running decline | 8.1M across 15 videos | Huge appetite but crowded; needs a new angle |

Skip: Suzlon (its turnaround is already well covered, top 365K) and "IPOs below issue price" (low demand, about 0.1M).
