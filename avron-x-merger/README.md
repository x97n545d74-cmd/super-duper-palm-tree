# Avron X merger

Handoff between two Claude sessions:

- **Writer** (`writer.py`, kept running by GitHub Actions, about every 5 minutes from 7 AM to midnight IST): asks Claude for new NSE filings every round, market-moving Indian and global news every 20 minutes, and one business story three times a day. It appends them to `queue.jsonl`. The workflow is `.github/workflows/avron-x-merger.yml` on the repo's default branch and needs the repo secret `ANTHROPIC_API_KEY`.
- **Poster** (Claude Code session, owned by Sahil): reads `queue.jsonl` and `radar.jsonl`, posts to X through the API, records what it posted in `posted.jsonl`.
- **Radar** (Avron Radar, `avron-radar/` on the default branch, runs every 30 minutes on GitHub Actions): appends to `radar.jsonl` a daily market-close card and followed investors' moves (shareholding changes and bulk or block deals), built by code from NSE and NSDL files. It also reads `queue.jsonl` and `posted.jsonl` to know what the desk has already covered. Sahil chose on 18 Nov 2026 that these post automatically like the rest.

Branch: `avron-x-merger`. Both sides work on this branch only.

## Files

| File | Who writes it | What it holds |
|---|---|---|
| `queue.jsonl` | Writer only | One headline per line, oldest first. Append-only. |
| `posted.jsonl` | Poster only | One line per item posted to X. |
| `radar.jsonl` | Radar only | Same fields as `queue.jsonl`, `lane` is `radar`. At most one close card and three investor items a day. |

Each side writes only its own file, so the two never conflict. Always `git pull --rebase` before pushing.

## queue.jsonl fields

One JSON object per line:

| Field | Meaning |
|---|---|
| `id` | Unique id. Skip any id already in `posted.jsonl`. |
| `created_ist` | When the writer added it, India time. |
| `lane` | `radar` for an item from `radar.jsonl`, `nse` for an exchange filing read from NSE, `filing` for an exchange filing found through the business press, `news` for Indian or global news that can move the market, `story` for a business story, `targets` for a list of brokerage target prices, `deals` for big investors' buying and selling. |
| `company` | Company name, or empty for a general story. |
| `headline` | UPPER CASE, in the form `COMPANY: FACT`. |
| `detail` | One plain sentence with the next most useful fact. May be empty. |
| `post_text` | Ready to post: headline, a line break, then detail. 280 characters or fewer. No source, no link, no hashtags. |
| `thread` | On `story`, `targets` and `deals` items: the whole story as a list of numbered posts (1/7, 2/7 ...). **Post all of them**: the first as a new post, each of the others as a reply to the one before it. Posting only the first leaves the story unfinished. |
| `story_text` | Only on `story` items: the same story as one piece of text, for accounts that can publish long posts. |
| `verify_link` | The filing or article the facts came from. **For Sahil's verification only. Never post it.** |
| `document_read` | `true` if the writer read the filing document, `false` if it used the feed summary only. |

## What the poster should do

1. `git pull` this branch.
2. Read `queue.jsonl` and `radar.jsonl`. Keep the items whose `id` is not in `posted.jsonl`.
3. Post `post_text` exactly as written. If the item has a `thread`, post every entry in order as one thread instead (the first entry equals `post_text`). Do not add the `verify_link`.
4. Append `{"id": "...", "posted_ist": "...", "tweet_id": "..."}` to `posted.jsonl`, commit and push.

## Writing rules the writer follows

- Only facts stated in the filing or article. Numbers, names and units exactly as written.
- No opinion, no advice, no hype words, no hashtags, no links in `post_text`.
- Routine filings are dropped: newspaper copies, NAV declarations, investor meets and presentations, trading-window notices, record dates, interest payment confirmations.
- Nothing new means nothing is appended.
