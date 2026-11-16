# Avron X merger

Handoff between two Claude sessions:

- **Writer** (Claude chat, hourly scheduled task): reads NSE filings and market news, writes headlines, appends them to `queue.jsonl`.
- **Poster** (Claude Code session, owned by Sahil): reads `queue.jsonl`, posts to X through the API, records what it posted in `posted.jsonl`.

Branch: `avron-x-merger`. Both sides work on this branch only.

## Files

| File | Who writes it | What it holds |
|---|---|---|
| `queue.jsonl` | Writer only | One headline per line, oldest first. Append-only. |
| `posted.jsonl` | Poster only | One line per item posted to X. |

Each side writes only its own file, so the two never conflict. Always `git pull --rebase` before pushing.

## queue.jsonl fields

One JSON object per line:

| Field | Meaning |
|---|---|
| `id` | Unique id. Skip any id already in `posted.jsonl`. |
| `created_ist` | When the writer added it, India time. |
| `lane` | `nse` for an exchange filing, `news` for a market or business story. |
| `company` | Company name, or empty for a general story. |
| `headline` | UPPER CASE, in the form `COMPANY: FACT`. |
| `detail` | One plain sentence with the next most useful fact. May be empty. |
| `post_text` | Ready to post: headline, a line break, then detail. 280 characters or fewer. No source, no link, no hashtags. |
| `verify_link` | The filing or article the facts came from. **For Sahil's verification only. Never post it.** |
| `document_read` | `true` if the writer read the filing document, `false` if it used the feed summary only. |

## What the poster should do

1. `git pull` this branch.
2. Read `queue.jsonl`. Keep the items whose `id` is not in `posted.jsonl`.
3. Post `post_text` exactly as written. Do not add the `verify_link`.
4. Append `{"id": "...", "posted_ist": "...", "tweet_id": "..."}` to `posted.jsonl`, commit and push.

## Writing rules the writer follows

- Only facts stated in the filing or article. Numbers, names and units exactly as written.
- No opinion, no advice, no hype words, no hashtags, no links in `post_text`.
- Routine filings are dropped: newspaper copies, NAV declarations, investor meets and presentations, trading-window notices, record dates, interest payment confirmations.
- Nothing new means nothing is appended.
