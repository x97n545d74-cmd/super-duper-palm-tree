# Avron Radar

A read-only research agent for Indian listed companies. Every 30 minutes it collects filings, prices, news and chatter, has Claude read what matters, and rebuilds one dashboard.

It keeps itself running: one GitHub run does a round every 30 minutes for about 5.5 hours, then starts the next run. GitHub's own timer proved unreliable on this repository, so it is only a backup.

## What it does each run

1. **Collects** new posts from every source in `config.json` (lanes run side by side; a source that fails six runs in a row is rested for six hours).
2. **Updates market data**: NSE's end-of-day file for every stock, adjusted for splits and bonuses, about a year of history. Runs the technical screens, market breadth, index valuations, and bulk and block deals.
3. **Labels** news and chatter with Claude: relevance, kind (fact, opinion, rumour, tip, promo), companies named, one-line summary.
4. **Copies company financials** from results filings (companies in the Nifty 500, Smallcap 250 and Microcap 250, plus any symbols in `results_watch`). Claude only copies the printed figures; code converts units and computes growth, margins, returns, valuation and red flags. Also keeps promoter holding from NSE's shareholding feed and a two-week calendar of board meetings and ex-dates.
5. **Reads filings** like an analyst: a triage step ranks the day's NSE announcements, then Claude reads the best ones with the stock's price data and its own earlier reads on that company. Each read is checked: every figure must trace to the filing or the price data, and important reads get an independent fact check.
6. **Writes a brief** twice a day (about 7 am and after the close), checks it, and corrects it once if the check finds problems.
7. **Scores the evidence**: one tally per stock across price, financials, filings, large deals and promoter holding, with the price side weighted by how each screen has actually performed lately. Also the market regime, a sector table, alerts for your own stocks and a tracker for the themes you follow.
8. **Tracks who owns and who is positioned**: each company's shareholding by kind of holder (promoters, mutual funds, foreign investors, insurers, small shareholders) and every named holder above 1%, with who entered, added, cut or left since the last file; the investors and funds you follow; daily foreign-investor flows, derivatives positioning, the F&O ban list and the rupee.
9. **Follows the government**: decisions, schemes, budget money, election promises and results filed by sector, with companies linked only on evidence, and an election watch.
10. **Builds** `dashboard.html` and `radar.db`.

On Saturdays it writes a weekly review as well.

## Ask it a question

GitHub > Actions > Avron Radar > Run workflow > type a question (for example "What do we know about Refex Industries?") and run. It answers from what it has collected, with sources, and the answer appears in the dashboard's Ask tab a few minutes later. From a computer: `python3 avron-radar/radar.py ask "your question"`.

## Make it yours (`config.json`)

- `my_stocks`: NSE symbols you follow. They come first in the brief and the dashboard, with everything that happened to them in the past day.
- `my_screen`: your own rules (largest market value, least revenue and profit growth). Stocks that pass are listed first on the Scorecard tab.
- `themes`: names and keywords for the segments you follow.
- `investors`: the investors and funds you follow, each with the spellings to look for in shareholding files and deals.
- `elections`: the elections to watch.
- `results_watch`: symbols whose results should always be copied.

## Sources

| Kind | Sources | Needs |
|---|---|---|
| Exchange | NSE announcements, results, insider trading, takeover disclosures, board meetings, corporate actions, shareholding; daily prices; bulk and block deals; index lists | nothing |
| Regulators | RBI press releases and notifications, PIB | nothing |
| News | Markets: Zerodha Pulse, ET, Moneycontrol, Mint, Business Standard, BusinessLine, CNBC-TV18. Business and economy: the same papers' company, industry, economy and tech sections, Inc42, YourStory, ET Startups, Google News business, CNBC world, BBC business. Google News searches | nothing |
| X desk | the Avron X merger desk's queue and posting record (`x_merger` in config) | nothing |
| Forum and social | ValuePickr, Reddit, YouTube channels, public Telegram channels, Bluesky | Reddit reads one subreddit per run unless `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are set |
| X | switched off (`"disabled_lanes": ["x"]`); the official API charges per post read | to switch on: remove `"x"` and add `X_BEARER_TOKEN` |

Not collected: Instagram, Facebook, LinkedIn (login walls and terms that forbid automated reading), BSE, Yahoo Finance, Stooq and MCX (they refuse GitHub's servers). Domestic-institution cash flows and insider trades have no reachable official source; holdings are quarterly, so "who holds what" is as of each company's last file. The agent never logs in and never gets round a block.

## Files

| File | What it holds |
|---|---|
| `radar.py` | sources, storage, labelling, dashboard and database build, the run log |
| `market.py` | NSE price files, adjustment for corporate actions, screens, deals |
| `analyst.py` | indicators, the nine screens, and the fundamental formulas (Graham, Lynch, Greenblatt, Piotroski, Altman, Beneish, DCF, position sizing) |
| `brain.py` | triage, filing reads, company memory, checks, fact check, briefs |
| `fundamentals.py` | results figures and ratios, promoter holdings, the events calendar |
| `decide.py` | the evidence scorecard, alerts for your stocks, the theme tracker |
| `ask.py` | answers a question from what the radar holds |
| `flows.py` | foreign-investor flows, derivatives positioning, the F&O ban list, the rupee |
| `policy.py` | government policy notes by sector, companies linked on evidence, the election watch |
| `ANALYST.md` | how the analyst thinks: edit this to change its judgement |
| `config.json` | sources, watchlist, daily limits |
| `REPORT.md` | the audit and upgrade report |

## Where the output goes

- Branch `avron-radar-data`: every post (`items-DATE.jsonl`), label (`tags-DATE.jsonl`), filing read (`analyses-MONTH.jsonl`), brief, price day and run log. Append-only daily files.
- Branch `avron-radar-dashboard`: only the latest `dashboard.html` and `radar.db`, with no history. Download `dashboard.html` and open it in a browser.

`radar.db` tables: `items`, `analyses`, `prices`, `fundamentals`, `holdings`, `scorecard`, and `search` (full text: `SELECT * FROM search WHERE search MATCH 'qip'`).

## Run it

```
python3 avron-radar/radar.py run        # everything
python3 avron-radar/radar.py collect    # or one step: collect, market, tag, analyse, build
cd avron-radar && python3 -m unittest   # 114 tests, no network
```

Starting the workflow by hand from a branch other than the default does one round, does not restart itself, and writes to `avron-radar-data-test` and `avron-radar-dashboard-test`, so live data is untouched.

## Spending controls (`config.json`)

- `filings_per_run` (4) and `daily_filing_reads` (40) cap the analyst.
- `results_per_run` (5) and `daily_results` (60) cap the results copier; `daily_results_outside_indexes` (20) caps companies outside the indexes.
- Labelling is capped at 90 posts per run.
- Every run logs its Claude tokens per model; the dashboard's System tab shows them. Add `"price_per_million_tokens": {"model-id": {"in": 0, "out": 0}}` with your own prices to log cost in dollars.

## Ground rules

- Filings and prices come from NSE's official files. News, forum and social posts are unverified.
- The analyst gives no buy, sell or hold instructions and no price targets. It describes evidence, setups and what would break them.
- This is a private research file. Don't republish the collected posts.

## The X desk connection

- **Reads** the Avron X merger desk's `queue.jsonl` and `posted.jsonl` every round: its headlines join the feed, marked posted or queued, and the brief does not repeat what is already public.
- **Writes** `avron-x-merger/radar.jsonl` on the live chain only: one market-close card per trading day (evening, or next morning before the open) and at most three moves a day by the individual investors in `x_post.investors`. Built by code from NSE and NSDL files. The poster session posts them automatically (the user's choice, 18 Nov 2026). Runs started from other branches write to `x_outbox_test.jsonl` on the test data branch and never reach X. Turn it off with `"x_post": {"enabled": false}`.

## The website feed

Every round the live chain publishes three files to the `avron-radar-public` branch:

- `avron-feed.json`: what the user chose to show visitors (market today, business news headlines linking to their publishers, government decisions and the election watch, the events calendar, the X desk's posts). Nothing about single-stock views, the user's lists, investors or chatter; a feed that carries any of them is refused (`public.check_feed`). Any website can read it: https://raw.githubusercontent.com/x97n545d74-cmd/super-duper-palm-tree/avron-radar-public/avron-feed.json
- `avron-widget.js`: renders the feed. Copy it into the website (GitHub serves files as plain text, so browsers will not run it from GitHub), then add `<div data-avron-radar data-sections="market,business,government,calendar,x"></div>` and `<script src="/avron-widget.js" defer></script>`.
- `embed-example.html`: a page showing the two lines in use.

## The live news lane

`.github/workflows/avron-live.yml` runs `live.py` every 3 minutes from 6 AM to midnight India time (every 15 minutes overnight), always on through the same self-restarting chain. Each round reads the news feeds, NSE's announcements and the X desk's posts, with no model and no cost, and publishes `live.json` to the `avron-radar-live` branch:

https://raw.githubusercontent.com/x97n545d74-cmd/super-duper-palm-tree/avron-radar-live/live.json

One entry per story, newest first, the past 24 hours: headline, source, link, how many outlets carried it, and for NSE filings the exchange's one-line description. Tips, broker calls, live blogs, sport, film and horoscopes are filtered out, and routine exchange paperwork is skipped. The main radar chain and the live chain each restart the other if it goes quiet. The widget's `live` section reads this file and refreshes itself every 2 minutes. GitHub caches these files for up to 5 minutes, so a headline reaches the website about 3 to 8 minutes after it appears in a source.

## Models

Everything that reads sources uses Claude Haiku 5.5: labelling posts, triaging and reading filings, fact checks, copying results figures, policy notes (the user's choice, 18 Nov 2026). The brief and answers to questions use Claude Sonnet 5.5. The live news lane uses no model. Change them with the environment variables `RADAR_MODEL`, `RADAR_READ_MODEL` and `RADAR_ANALYST_MODEL`.

## Scraped data for the personal dashboard (private, key-only)

`export.py` builds `scraped.json` every round with the scraped data only: posts and news (headline, link, source, time, a 300-character excerpt), exchange filings, the X desk's items, NSE's end-of-day summary, bulk and block deals, and foreign-investor flows. Nothing the radar or Claude produced (labels, reads, briefs, scores, screens, copied results, policy notes), no personal lists or settings, no run logs. `export.check` refuses a file that carries any of them.

When the repository secret `PRIVATE_DATA_TOKEN` exists, the workflow force-pushes `scraped.json` to the private repository named in `config.json` (`private_data`), branch `main` (runs from other branches use `test`). The dashboard reads it with a separate read-only token:

```
GET https://api.github.com/repos/x97n545d74-cmd/avron-radar-private/contents/scraped.json?ref=main
Authorization: Bearer <read-only token>
Accept: application/vnd.github.raw+json
```
