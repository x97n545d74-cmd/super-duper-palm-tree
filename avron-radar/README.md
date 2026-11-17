# Avron Radar

A read-only agent that watches the public side of social platforms for Indian-market chatter and files every post into one searchable database.

## What it reads

| Platform | How | Needs |
|---|---|---|
| Reddit | subreddit feeds | nothing; add `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` if Reddit blocks the runner |
| YouTube | each channel's public feed of new videos | nothing |
| Telegram | public channels via `t.me/s/<channel>` | nothing |
| News | Google News searches | nothing |
| Bluesky | public search | nothing |
| X | the official X API, every 6 hours | `X_BEARER_TOKEN`, or `X_API_KEY` and `X_API_SECRET` |

Instagram, Facebook and LinkedIn are not collected. They show nothing useful without a login, and this agent never logs in or gets round a block.

## What it produces

- `data/items-YYYY-MM.jsonl`: every post once, with a 600-character excerpt and a link to the original.
- `radar.db`: the same posts as a SQLite table called `items`.
- `dashboard.html`: open it in a browser to search and filter by platform, kind, relevance and watchlist. The Sources tab shows which sources worked on the last run.

With `ANTHROPIC_API_KEY` set, Claude labels each post with a relevance score (0 to 5), a kind (fact, opinion, rumour, tip, question, promo), the companies named, and a one-line summary.

## Run it

```
python3 avron-radar/radar.py run        # collect, label, build
python3 avron-radar/radar.py collect    # only fetch
python3 -m unittest avron-radar/test_radar.py
```

On GitHub, `.github/workflows/avron-radar.yml` runs it every 30 minutes and saves the results to the `avron-radar-data` branch. Scheduled workflows only run from the repository's default branch, so it starts once this folder and the workflow are merged there.

## Change what it watches

Edit `config.json`: subreddits, YouTube handles, Telegram channels, search queries and the watchlist words that get a gold chip in the dashboard.

## Ground rules

- Posts are unverified chatter. Check a primary source before any of it goes into a reel.
- This is a private research file. Don't republish the collected posts.
- X reads are metered by X. Raise `x_every_hours` or empty `x_queries` to spend less.
