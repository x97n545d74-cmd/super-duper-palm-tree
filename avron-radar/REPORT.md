# Avron Radar: audit and upgrade report

17 November 2026. Covers the agent in `avron-radar/` and its workflow `.github/workflows/avron-radar.yml`.

## Summary

- The existing design was kept: one Python script on a GitHub Actions timer, standard library only, data in a git branch. Nothing was rebuilt.
- 14 of the 20 ranked improvements are implemented and tested. 6 are not done; they are listed with reasons.
- Every claim below is backed by a unit test (50 pass, none use the network) or by a live run on GitHub against the real sources, and says which.
- One finding needs your decision: **the repository is public**, so everything the agent saves is visible to anyone.

## Phase 1: audit of the system as found

**Architecture.** `radar.py` reads sources lane by lane, dedupes posts into JSON-lines files, has Claude label them, and builds a SQLite file and an HTML dashboard. `market.py` keeps a year of NSE end-of-day prices and runs screens from `analyst.py`. `brain.py` has Claude read filings and write briefs, guided by `ANALYST.md`.

**Strengths**
- No dependencies beyond Python's standard library, so nothing to install or break.
- One failing source never stops the others; each step of a run is isolated.
- Official data where it exists: NSE's own feeds and price files, not scraped copies.
- Text from the internet is treated as untrusted: prompts say so, the dashboard escapes it, and the only tool Claude gets is a web fetch locked to NSE's archive domain.

**Weaknesses found, with evidence from live runs**

| # | Finding | Evidence |
|---|---|---|
| 1 | The repository is public, so "private research" data is published | repository visibility: public |
| 2 | The analyst chose weak filings | first live run: 4 reads scored 2, 2, 2, 1 out of 5 (a hire, an HR resignation) |
| 3 | It re-read events it had already covered | second live run: 2 of 3 reads repeated an order read 10 minutes earlier |
| 4 | Nothing checked the analyst's numbers | no validation existed |
| 5 | No memory: each filing was read as if the company were new | prompt had no history |
| 6 | The brief had no moving averages or breakout levels, so it could not state where a setup fails | the first brief said so itself |
| 7 | No record of what a run did or what it spent | only the last run's source list was kept |
| 8 | Sources were read one after another | pauses alone add up to about 126 seconds per run |
| 9 | A blocked source was retried every 30 minutes forever | Reddit's second subreddit failed on every run |
| 10 | Each run rewrote whole month files and committed the dashboard, which would grow the repository by tens of megabytes a day | storage design |
| 11 | Reply limits were too low for the model's own reasoning | a live brief stopped after 131 words |
| 12 | The fundamental formulas have no data to work on | no fundamentals source yet |
| 13 | Posts were not linked to stocks, so there was no per-company view | tags held free-text names only |
| 14 | A second agent (`avron-x-merger`) reads the same NSE feed with Claude | duplicate spend; left alone, it is live and separate |

## Phases 2 and 3: the 20 improvements, ranked

Impact, complexity and running cost are rated high, medium or low. Status is as of this report.

| Rank | Improvement | Impact | Complexity | Cost | Status |
|---|---|---|---|---|---|
| 1 | Check every figure in a read against its sources; give each read a confidence level | high | low | none | done |
| 2 | Triage step: a fast model ranks candidate filings before the analyst reads | high | low | low | done |
| 3 | One read per event (skip XBRL copies and follow-ups) | high | low | saves | done |
| 4 | Company memory: the analyst sees its earlier reads on the same company | high | low | low | done |
| 5 | Independent fact check of important reads against the document | high | medium | low | done |
| 6 | Brief checks itself (advice wording, missing sections, stocks not in its data) and corrects once | high | low | low | done |
| 7 | Run log: duration, sources, counts, tokens per model | high | low | none | done |
| 8 | Append-only daily files; dashboard on a history-free branch | high | medium | saves | done |
| 9 | Keep the data private | high | low | none | your decision |
| 10 | Fundamentals from NSE's structured results files, to power the formulas | high | high | none | not done |
| 11 | Link posts to NSE symbols; per-stock view; chatter-spike detection | medium | medium | none | done |
| 12 | Give the brief moving averages, breakout levels and ATR | medium | low | none | done |
| 13 | Rest a source after repeated failures; retry server errors | medium | low | none | done |
| 14 | Read lanes in parallel | medium | low | none | done |
| 15 | Cache the analyst's instructions between calls | low | low | saves | done |
| 16 | Full-text search in the database | low | low | none | done |
| 17 | Parse insider-trading and takeover filings into structured rows | medium | medium | none | not done |
| 18 | Score the screens against what prices did afterwards | medium | medium | none | not done |
| 19 | Batch API for labelling (half price, slower) | low | medium | saves | not done |
| 20 | Merge the two agents' NSE reading | low | medium | saves | not done |

## Phase 5: what was implemented

**Intelligence**
- *Triage* (`brain.triage`): up to 30 candidate filings go to the fast model, which scores each 1 to 5; the analyst reads the best. If triage fails, the old ordering is used.
- *Company memory* (`brain.company_history`): the last five reads on the same company are put in the prompt, with the instruction to say what is new and whether a pattern is forming. Memory is derived from the saved reads, so nothing is stored twice.
- *Levels in the brief*: screen rows now carry the 50 and 200-day averages, the prior 20-day high and ATR, and the brief is told to state the level that breaks each setup.
- *Chatter spikes* (`brain.buzz`): stocks mentioned at least three times in a day and more than twice their weekly average.

**Reliability**
- *Number check* (`brain.check_read`): every figure in a read's headline, read and price note must appear in the facts it quoted, the exchange's summary or the price data. Unsourced figures are listed and lower the confidence to medium or low.
- *Fact check* (`brain.verify_read`): reads scoring 4 or 5 are checked by a second model against the same document, fact by fact. A contradiction sets confidence to low.
- *Brief check* (`brain.check_brief`): one correction pass; a brief that still fails is saved with the problems stated at the top.
- *Failure handling*: Claude calls retry when the service is busy; source fetches retry server errors once; a source failing six runs in a row rests for six hours.
- *One read per event* (`brain.event_key`).

**Efficiency and monitoring**
- Lanes run in parallel threads; each lane still reads its own sites one at a time.
- The analyst's instructions are cached between calls.
- `runs-DATE.jsonl` records every run; the dashboard's System tab shows them.
- Model routing: the fast model labels, triages and fact-checks; the stronger model only reads filings and writes briefs.

## Phase 6: test results

**Unit tests:** 50 pass. They cover every parser, the price adjustment for bonuses and splits, all nine screens, the formulas against hand-worked values, triage, memory, both checks, the fact check, failure resting, retries and token accounting.

**Live runs on GitHub (test branches, real sources)**

| Measure | Before | After | Note |
|---|---|---|---|
| Sources read | 16 of 17 | 68 of 68 | |
| Stocks with a year of prices | 0 | 1,677 screened | 287 trading days |
| Full run time | not comparable | 171 s, 200 s, 248 s | includes all Claude calls; the longest had 4 reads, a fact check and a brief |
| Repeat reads of one event | 2 of 3 | 0 of 1 | |
| Tokens served from cache per run | 0 | about 20,000 | stronger model |
| Unsourced-number false alarms | 2 of 3 reads | fixed | "200-day" was read as a figure |
| Faults caught by the brief check | none possible | 1 | a brief cut off after 131 words; after the fix the next brief was complete (720 words, all six sections) |
| Fact checks run | none possible | 1 | a qualified audit review (materiality 4): 6 of 6 quoted facts confirmed against the document |
| Mean materiality of filings read | 1.75 (4 reads) | 2.4 (8 reads) | too few to conclude anything; the last run did surface an auditor's qualification |

Honest limits of this testing:
- Filing selection is not proven better. Twelve reads on one evening is not a sample.
- The fact check has run live once. One pass is not a measure of how often it catches errors.
- The number check is strict: it also lists figures the analyst calculated itself (a percentage, a ratio). The dashboard says so.
- The 720-word brief exceeded its 600-word budget.
- The last brief had no moving-average levels, because the saved screens predated that change. They are now recomputed when the code changes; this is unit-tested but will first show live on the next run.
- Parallel reading was not timed against sequential reading on the same day.
- Labelling is behind: 647 posts were unlabelled after the test runs. At 90 per run it should catch up within a day; the run log will show if it does not.

**Tokens per steady run (measured):** fast model about 23,000 in and 19,000 out; stronger model about 4,500 in, 20,000 from cache and 5,000 out for three reads. I have not put a rupee or dollar figure on this because I don't have current prices; add them to `config.json` and each run logs its cost.

## Evaluated and not built

- **Multi-agent framework.** The pipeline already has four roles (triage, analyst, fact checker, editor) as plain function calls. A framework would add a dependency and cost without changing the output.
- **Vector database, RAG, semantic search.** At a few thousand posts a day, lookups by company and SQLite full-text search answer the questions asked of it. Worth revisiting when you want questions like "which companies sound like this one", not before.
- **Knowledge graph.** The symbol links give the one relation that matters today (post to company). A graph earns its place once fundamentals and insider trades are structured.
- **Autonomous trading or order placement.** Not built. The agent describes evidence; it does not act on it.

## What remains, in order

1. **Decide where the data lives.** Options: keep it public; make the repository private (GitHub then meters the minutes, and your two agents together would use the free allowance in under two days); or keep the code public and send the data to a second, private repository with an access token. I recommend the third.
2. **Fundamentals** from NSE's results files, so Piotroski, Altman, Graham and the rest have numbers. This is the largest gap against the "top analyst" goal.
3. **Structured insider and takeover data.** Those feeds currently give a company name and a link.
4. **Measure the screens**: record what each flagged stock did over the next 5 and 20 days, so the screens are judged on results.
5. **Watch one full trading day**, then tune `filings_per_run`, the triage rules and the labelling cap from the run log.

---

# Ten improvement rounds (17 November 2026, evening)

Each round: run the agent on GitHub against the real sources (test branches, live data untouched), read its output, find the weakest point, fix it, add a test, run again. 80 unit tests pass at the end.

| Round | What the run showed | What changed | Confirmed live |
|---|---|---|---|
| 1 | GitHub's 30-minute timer never fired on this repository: every run so far had been started by hand. No company financials existed, so the investor formulas had nothing to work on. | The workflow now runs a round every 30 minutes for 5.5 hours and starts the next run itself. Added a results reader (Claude copies printed figures; code converts units and computes every ratio), promoter holdings and a two-week events calendar. | Two rounds five minutes apart, both saved. 68 of 68 sources. |
| 2 | No results were copied: the day's filers were small companies outside the indexes. 541 posts were waiting for labels. | Results coverage widened beyond the indexes (20 a day). Labelling takes 120 a run and drops posts older than 48 hours. Added the evidence scorecard. | First results copied (Libas); figures match the analyst's independent read. Backlog 541 to 458. |
| 3 | Nothing said whether the price screens work. | A track record for each screen (what stocks did 5 and 20 days later, against every liquid stock), a sector table, each deal's share of the day's volume, news searches for global cues. | The average liquid stock had fallen about 4% over 20 days; the trend-template screen did worse than that. Sectors: media, realty and healthcare led; utilities, capital goods and IT lagged. |
| 4 | The scorecard gave points to screens the record showed were lagging. A 3,026-share deal counted as "buying". | Price-side points now follow each screen's record. The market gets a strong / mixed / weak label. Deals under 1% of volume are ignored, over 10% count double. A list for strong charts with no results on file. | The brief opens "Weak", names the sectors, says which screens have had an edge, and gives the level that breaks each setup. |
| 5 | Results showed growth but not whether the business earns more per rupee of sales. | Margin a year ago and last quarter, the change in points, profit growth against sales growth; flags for a margin squeeze and for sales up with profit down. | IC Electricals: revenue +36%, profit +125%, margin up 7.1 points, with a flag that operating cash flow is negative. |
| 6 | Nothing was personal to the reader. | `my_stocks`: everything that happened to the reader's own stocks in the past day, first in the brief and dashboard. `my_screen`: the reader's own rules. | The screen (market value under Rs 10,000 crore, revenue and profit up 20%) picked one company from the results on file. `my_stocks` is empty until symbols are added, so alerts are unit-tested only. |
| 7 | A stock showed "82% below its high" after a demerger the exchange file had not restated. The brief's flows section saw only buyers. Small (SME) companies had no symbol, so their results were skipped. | One-day moves beyond the price bands are treated as corporate actions. Deals are netted per stock with buyers, sellers and anyone on both sides. NSE Emerge companies added to the universe. | Universe 2,638 to 3,221 companies. Four SME results copied, figures exact. Flows now shows a promoter trust selling Alkem to four mutual funds. |
| 8 | No look back over a week; index valuations kept no history; the dashboard feed was mostly routine paperwork. | A Saturday weekly review, a daily line of index valuations and breadth, routine filings left out of the feed. | Dashboard 3.2 MB to 3.0 MB with more in it. The weekly review first runs on Saturday; unit-tested only. |
| 9 | The reader's segments (data centres, semiconductors, defence and others) were not tracked. | A theme tracker: mentions in a day and a week, whether rising, the listed companies that come up, the newest items. Ten starting themes. | Renewables 27 mentions in a day with 7 filings; solar names surfaced. "Rising" is not yet meaningful: there is under a week of history. |
| 10 | The reader could not ask the agent anything. | Ask a question from GitHub's Run workflow box; the answer is drawn only from what the radar holds and appears in the Ask tab. | Asked whether Libas's profit can be trusted: a correct, sourced answer including what the data does not cover. One bug found and fixed (an ordinary word matched as a symbol). |

## What the ten rounds did not settle

- **One evening of data.** Everything above was measured on 17 November. The screen record covers about two months of prices but the filings, results and themes cover days.
- **Results season is over.** Six companies' results are on file. The reader is proven on small filers; it has not faced a large-company results PDF or a heavy results day.
- **The unit of a results table can still be misread** (lakh for crore). Growth, margins, P/E, P/B and PEG are unaffected; rupee amounts and market value would be out by 10 or 100 times. Nothing in the code can detect that.
- **The scorecard is a tally, not a tested strategy.** Its business and flows weights are judgement. Only the price side is checked against outcomes.
- **Cost per day is still not in rupees.** A round used about 23,000 tokens in and 27,000 out on the fast model and about 55,000 in and 11,000 out on the stronger one when a brief was written.
- **The repository is still public.**

## Next

1. Merge, then watch one full trading day and the first weekly review.
2. Add your stocks to `my_stocks`.
3. Decide where the data lives (see above).
4. After two weeks: check the scorecard's lists against what the stocks did, and adjust the weights from evidence.
