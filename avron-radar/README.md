# Avron Radar

A read-only research agent for Indian listed companies. Every 30 minutes it collects filings, prices, news and chatter, has Claude read what matters, and rebuilds one dashboard.

## What it does each run

1. **Collects** new posts from every source in `config.json` (lanes run side by side; a source that fails six runs in a row is rested for six hours).
2. **Updates market data**: NSE's end-of-day file for every stock, adjusted for splits and bonuses, about a year of history. Runs the technical screens, market breadth, index valuations, and bulk and block deals.
3. **Labels** news and chatter with Claude: relevance, kind (fact, opinion, rumour, tip, promo), companies named, one-line summary.
4. **Reads filings** like an analyst: a triage step ranks the day's NSE announcements, then Claude reads the best ones with the stock's price data and its own earlier reads on that company. Each read is checked: every figure must trace to the filing or the price data, and important reads get an independent fact check.
5. **Writes a brief** twice a day (about 7 am and after the close), checks it, and corrects it once if the check finds problems.
6. **Builds** `dashboard.html` and `radar.db`.

## Sources

| Kind | Sources | Needs |
|---|---|---|
| Exchange | NSE announcements, results, insider trading, takeover disclosures, board meetings, corporate actions, shareholding; daily prices; bulk and block deals; index lists | nothing |
| Regulators | RBI press releases and notifications, PIB | nothing |
| News | Zerodha Pulse, ET, Moneycontrol, Mint, Business Standard, BusinessLine, CNBC-TV18, Google News searches | nothing |
| Forum and social | ValuePickr, Reddit, YouTube channels, public Telegram channels, Bluesky | Reddit reads one subreddit per run unless `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are set |
| X | switched off (`"disabled_lanes": ["x"]`); the official API charges per post read | to switch on: remove `"x"` and add `X_BEARER_TOKEN` |

Not collected: Instagram, Facebook, LinkedIn (login walls), BSE and Yahoo Finance (they refuse GitHub's servers). The agent never logs in and never gets round a block.

## Files

| File | What it holds |
|---|---|
| `radar.py` | sources, storage, labelling, dashboard and database build, the run log |
| `market.py` | NSE price files, adjustment for corporate actions, screens, deals |
| `analyst.py` | indicators, the nine screens, and the fundamental formulas (Graham, Lynch, Greenblatt, Piotroski, Altman, Beneish, DCF, position sizing) |
| `brain.py` | triage, filing reads, company memory, checks, fact check, briefs |
| `ANALYST.md` | how the analyst thinks: edit this to change its judgement |
| `config.json` | sources, watchlist, daily limits |
| `REPORT.md` | the audit and upgrade report |

## Where the output goes

- Branch `avron-radar-data`: every post (`items-DATE.jsonl`), label (`tags-DATE.jsonl`), filing read (`analyses-MONTH.jsonl`), brief, price day and run log. Append-only daily files.
- Branch `avron-radar-dashboard`: only the latest `dashboard.html` and `radar.db`, with no history. Download `dashboard.html` and open it in a browser.

`radar.db` tables: `items`, `analyses`, `prices`, and `search` (full text: `SELECT * FROM search WHERE search MATCH 'qip'`).

## Run it

```
python3 avron-radar/radar.py run        # everything
python3 avron-radar/radar.py collect    # or one step: collect, market, tag, analyse, build
cd avron-radar && python3 -m unittest   # 50 tests, no network
```

Starting the workflow by hand from a branch other than the default writes to `avron-radar-data-test` and `avron-radar-dashboard-test`, so live data is untouched.

## Spending controls (`config.json`)

- `filings_per_run` (4) and `daily_filing_reads` (40) cap the analyst.
- Labelling is capped at 90 posts per run.
- Every run logs its Claude tokens per model; the dashboard's System tab shows them. Add `"price_per_million_tokens": {"model-id": {"in": 0, "out": 0}}` with your own prices to log cost in dollars.

## Ground rules

- Filings and prices come from NSE's official files. News, forum and social posts are unverified.
- The analyst gives no buy, sell or hold instructions and no price targets. It describes evidence, setups and what would break them.
- This is a private research file. Don't republish the collected posts.
