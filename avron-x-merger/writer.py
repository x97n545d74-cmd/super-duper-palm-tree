#!/usr/bin/env python3
"""Avron X merger writer.

Run by GitHub Actions about every 5 minutes. Three lanes:
  nse    every round: Claude fetches NSE's official announcements feed, picks
         the new filings worth posting, reads each one and writes a headline.
  news   every 20 minutes: Claude searches the web for Indian and global
         news that can move the Indian market.
  story  three times a day: Claude writes one startup or business story as a 7-post thread.
  targets twice a day: brokerage and analyst target prices, in beginner-friendly words.
  deals  twice a day: which big investors bought or sold which stocks.
Results are appended to queue.jsonl. Standard library only.

Claude does the fetching through Anthropic's web fetch tool; this script
never contacts NSE and never contacts X.
"""
import datetime
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

HERE = pathlib.Path(__file__).resolve().parent
QUEUE = HERE / "queue.jsonl"
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
FEED = "https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml"
NSE_PREFIX = "https://nsearchives.nseindia.com/"
MODEL = os.environ.get("AVRON_MODEL", "claude-haiku-5-5")
LOOKBACK_MINUTES = int(os.environ.get("AVRON_LOOKBACK_MINUTES", "30"))
MAX_ITEMS = int(os.environ.get("AVRON_MAX_ITEMS", "4"))
FETCH_TOOL = os.environ.get("AVRON_FETCH_TOOL", "web_fetch_20250910")   # plain fetch: fewer round trips, lower cost
FETCH_BETA = os.environ.get("AVRON_FETCH_BETA", "web-fetch-2025-09-10")
SEARCH_TOOL = os.environ.get("AVRON_SEARCH_TOOL", "web_search_20250305")
NEWS_EVERY_MINUTES = int(os.environ.get("AVRON_NEWS_EVERY_MINUTES", "20"))   # how often the market-news lane runs
NEWS_SEARCHES = int(os.environ.get("AVRON_NEWS_SEARCHES", "5"))
NEWS_MAX_ITEMS = 3
OUTLETS = ("Economic Times, Times of India, Business Today, Moneycontrol, Mint, Business Standard, CNBC-TV18, "
           "Financial Express, Hindu BusinessLine, NDTV Profit, Reuters, Bloomberg, PTI and the regulators' own sites")
STORY_POSTS = 7
TARGET_HOURS = (8, 13)   # India time: one brokerage-targets list after each of these hours
TARGET_MAX_CALLS = 20
DEAL_HOURS = (9, 19)     # India time: one "who bought, who sold" list after each of these hours
DEAL_MAX = 15
STORY_HOURS = (9, 13, 19)   # India time: one business story after each of these hours
STATE = pathlib.Path(os.environ.get("AVRON_STATE", "/tmp/avron_x_merger_state.json"))
FEED_TOKENS = 10000     # how much of the feed Claude reads (newest items come first)
DOC_TOKENS = 6000       # how much of each filing Claude reads
START_HOUR = 7          # 7 AM India time; the timer stops at midnight
FMT = "%d-%b-%Y %H:%M:%S"

ROUTINE = (
    "Copy of Newspaper Publication, newspaper advertisement or cutting, Declaration of NAV, "
    "Investor Presentation, Investor Meet, Analysts/Institutional Investor Meet, General Updates, "
    "Monitoring Agency, Asset/Liability, Trading Window, Loss of Share Certificate, Record Date, "
    "redemption or payment of interest, ESOP allotment, postal ballot, notice of meeting"
)


def read_queue():
    rows = []
    if QUEUE.exists():
        for line in QUEUE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                try:
                    rows.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
    return rows


ROUTINE_WORDS = [
    "newspaper", "declaration of nav", "investor presentation", "investor meet", "analysts/institutional",
    "general updates", "monitoring agency", "asset/liability", "trading window", "loss of share certificate",
    "record date", "payment of interest", "redemption", "esop", "esos", "postal ballot", "notice of meeting",
    "duplicate share", "change in registrar", "compliance certificate", "reg. 74", "regulation 74",
]
NEWSWORTHY = ["order", "contract", "award", "acqui", "merger", "amalgamation", "result", "fund", "qip", "preferential",
              "rights issue", "buyback", "buy-back", "dividend", "resign", "appoint", "cessation", "mou", "agreement",
              "joint venture", "capacity", "expansion", "plant", "credit rating", "usfda", "fda", "penalty", "sebi", "raid",
              "fraud", "default", "stake", "allotment", "warrant", "press release", "outcome", "split", "bonus"]


def feed_direct(now):
    """Download NSE's announcements feed ourselves. Returns a list of items, or None when it fails or looks stale."""
    url = FEED + "?t=" + now.strftime("%Y%m%d%H%M")
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-IN,en;q=0.9",
        "Cache-Control": "no-cache",
    })
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            raw = resp.read()
        root = ET.fromstring(raw)
    except Exception as e:
        print("[nse] direct download failed: %s" % e)
        return None
    items = []
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        desc = " ".join((it.findtext("description") or "").split())
        try:
            when = datetime.datetime.strptime((it.findtext("pubDate") or "").strip(), FMT).replace(tzinfo=IST)
        except ValueError:
            continue
        items.append({"company": title, "link": link, "summary": desc[:300], "when": when})
    if not items:
        print("[nse] direct download had no items")
        return None
    newest = max(i["when"] for i in items)
    print("[nse] direct download: %d items, newest %s" % (len(items), newest.strftime(FMT)))
    if (now - newest).total_seconds() > 6 * 3600 and 9 <= now.hour < 18 and now.weekday() < 5:
        print("[nse] direct copy looks stale during market hours")
        return None
    return items


def pick_candidates(items, since, known_links):
    """Python version of the feed filter: new, not routine, not seen, document over its XBRL twin, newsworthy first."""
    out, seen_co = [], {}
    for i in sorted(items, key=lambda x: x["when"], reverse=True):
        text = (i["summary"] + " " + i["company"]).lower()
        if i["when"] <= since or not i["link"] or i["link"] in known_links:
            continue
        if any(w in text for w in ROUTINE_WORDS) or text.rstrip().endswith("subject: updates"):
            continue
        key = (i["company"].lower(), i["summary"][:80].lower())
        if key in seen_co:                                   # the same disclosure twice: keep the document, not the .xml
            if seen_co[key]["link"].lower().endswith(".xml") and not i["link"].lower().endswith(".xml"):
                out[out.index(seen_co[key])] = i
                seen_co[key] = i
            continue
        seen_co[key] = i
        out.append(i)
    out.sort(key=lambda x: (not any(w in x["summary"].lower() for w in NEWSWORTHY), -x["when"].timestamp()))
    return out


def feed_prompt(now, since, known_links):
    """Stage 1: Claude fetches the feed and returns a short list of candidates."""
    known = "\n".join(known_links) if known_links else "(none)"
    return "\n".join([
        "You are the filter desk of a real-time market news service.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Use your web fetch tool to fetch this official NSE feed (pass exactly this url; retry once if the tool reports an error): "
        + FEED + "?t=" + now.strftime("%Y%m%d%H%M"),      # the time on the end makes sure a fresh copy is read, not a saved one
        "The first lastBuildDate or pubDate you see tells you how fresh the copy is. If the newest pubDate is more than "
        "3 hours older than the current time, reply with exactly: {\"error\":\"STALE_FEED\"}",
        "Each item has a title (the company name), a link to the filed document, a pubDate in India time "
        "such as 16-Nov-2026 09:14:05, and a description that ends with |SUBJECT: category. Items are newest first.",
        "",
        "Step 1. Keep only items whose pubDate is later than " + since.strftime(FMT) + ".",
        "Step 2. Drop items with an empty link, and items whose description or subject mentions any of these "
        "(ignore upper and lower case): " + ROUTINE + ". Also drop items whose subject is exactly Updates.",
        "Step 3. Drop items whose link is in this already-handled list:",
        known,
        "Step 4. If the same company has both a document and an XBRL (.xml) version of the same disclosure, keep the document.",
        "Step 5. Keep at most %d, the most newsworthy: order wins, acquisitions, capacity or capex decisions, results "
        "with figures, fund raising with amounts, regulatory actions and senior management changes first. "
        "Leave out anything an investor would not care about." % MAX_ITEMS,
        "",
        "Do not fetch any other page. Reply with ONLY a JSON array and nothing else. One object per item kept:",
        '"company": the company name as in the feed',
        '"link": the item link exactly as in the feed',
        '"summary": the feed description in at most 200 characters',
        "",
        "If no items remain, reply with exactly: []",
        'If the feed cannot be fetched, reply with exactly: {"error":"FEED_ERROR"}',
    ])


def item_prompt(item):
    """Stage 2: Claude reads one filing and writes one headline."""
    return "\n".join([
        "You are the editor of a real-time market news desk.",
        "Company: " + item["company"],
        "Feed summary: " + item["summary"],
        "Filed document: " + item["link"],
        "",
        "Use your web fetch tool to read the filed document (pass only the url; retry once if the tool reports an error), then write one headline.",
        "",
        "Rules: use ONLY facts stated in the document or the feed summary. Keep every number, name and unit exactly "
        "as written. Never guess, round or convert a figure, and never mix up lakh, crore, million and billion. "
        "Neutral tone: no opinion, no advice, no hype, no hashtags. Do not name the source, do not mention a letter, "
        "press release, filing or exchange, and put no link in the text.",
        "The headline must state a concrete fact: who did what, with the amount, number, name or date. "
        "Every figure in the text must carry its unit or currency exactly as the document gives it; leave out any figure whose unit is not stated. "
        "In XBRL files, do not confuse a total after an event (such as share capital after an allotment) with the size of the event itself. "
        "Reply with exactly SKIP for routine matters: shares allotted under an ESOP or ESPS, or a change of company secretary or compliance officer. "
        "If you cannot state a concrete fact (for example the document could not be read and the summary only gives "
        "a category such as allotment of securities or submission of results), reply with exactly: SKIP",
        "",
        "Otherwise reply with ONLY one JSON object and nothing else:",
        '"headline": UPPER CASE, at most 200 characters, in the form COMPANY: FACT',
        '"detail": one plain sentence in normal case, at most 160 characters, giving a second concrete fact, or an empty string if there is none',
        '"document_read": true if you read the document, false if you used the feed summary only',
    ])


def fetch_tool(content_tokens):
    return [{
        "type": FETCH_TOOL,
        "name": "web_fetch",
        "max_uses": 3,   # room to retry: a first attempt sometimes fails
        "allowed_domains": ["nsearchives.nseindia.com"],
        "max_content_tokens": content_tokens,
    }]


def search_tool(max_uses):
    return [{"type": SEARCH_TOOL, "name": "web_search", "max_uses": max_uses}]


def call_claude(prompt, api_key, tools, max_tokens):
    """One Claude call with the given tools. Returns (reply text, input tokens, output tokens)."""
    messages = [{"role": "user", "content": prompt}]
    tin = tout = 0
    res = {}
    for _ in range(3):
        body = {"model": MODEL, "max_tokens": max_tokens, "tools": tools, "messages": messages}
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "content-type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                **({"anthropic-beta": FETCH_BETA} if FETCH_BETA else {}),
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=240) as resp:
            res = json.loads(resp.read().decode("utf-8"))
        usage = res.get("usage") or {}
        tin += usage.get("input_tokens") or 0
        tout += usage.get("output_tokens") or 0
        for b in res.get("content") or []:      # one line per tool result, to make failures easy to diagnose
            if isinstance(b, dict) and b.get("type") == "web_fetch_tool_result":
                c = b.get("content") or {}
                print("  fetch: %s %s size=%d" % (c.get("type"), c.get("error_code") or c.get("url") or "", len(json.dumps(c))))
            if isinstance(b, dict) and b.get("type") == "web_search_tool_result":
                c = b.get("content")
                print("  search: %s" % ("%d results" % len(c) if isinstance(c, list) else json.dumps(c)[:120]))
        if res.get("stop_reason") != "pause_turn":
            break
        # Claude paused mid-turn: hand its work back so it can finish.
        messages = messages + [{"role": "assistant", "content": res.get("content", [])}]
    return reply_text(res), tin, tout


def reply_text(res):
    blocks = res.get("content") or []
    return "".join(b.get("text", "") for b in blocks if isinstance(b, dict) and b.get("type") == "text").strip()


def parse_items(text):
    """Return a list of dicts, or None when the reply is not a usable array."""
    a, z = text.find("["), text.rfind("]")
    if a < 0 or z <= a:
        return None
    try:
        rows = json.loads(text[a:z + 1])
    except json.JSONDecodeError:
        return None
    return rows if isinstance(rows, list) else None


def make_rows(items, known_links, now):
    out, seen = [], set(known_links)
    stamp = now.strftime("%Y%m%d-%H%M")
    for r in items:
        if not isinstance(r, dict):
            continue
        link = str(r.get("link") or "").strip()
        headline = " ".join(str(r.get("headline") or "").split())
        detail = " ".join(str(r.get("detail") or "").split())[:200]
        if len(headline) > 240:      # never cut a headline short; skip it instead
            continue
        if not headline or not link.startswith(NSE_PREFIX) or link in seen:
            continue
        post = headline + ("\n" + detail if detail else "")
        if len(post) > 280:
            post, detail = headline, ""       # drop the detail line rather than cut a fact in half
        if len(post) > 280:
            continue
        seen.add(link)
        out.append({
            "id": "%s-%02d" % (stamp, len(out) + 1),
            "created_ist": now.strftime("%Y-%m-%d %H:%M"),
            "lane": "nse",
            "company": str(r.get("company") or "").strip(),
            "headline": headline,
            "detail": detail,
            "post_text": post,
            "verify_link": link,
            "document_read": r.get("document_read") is True,
        })
    return out


def parse_object(text):
    a, z = text.find("{"), text.rfind("}")
    if a < 0 or z <= a:
        return None
    try:
        obj = json.loads(text[a:z + 1])
    except json.JSONDecodeError:
        return None
    return obj if isinstance(obj, dict) else None


def append_rows(rows):
    if rows:
        with QUEUE.open("a", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")


def covered_headlines(limit=40):
    return [r.get("headline") for r in read_queue() if r.get("headline")][-limit:]


def clean(text, limit):
    return " ".join(str(text or "").split())[:limit]


# ---------------------------------------------------------------- lane 1: NSE filings
def run_nse(now, api_key):
    known_links = [r.get("verify_link") for r in read_queue() if r.get("verify_link")][-25:]
    since = now - datetime.timedelta(minutes=LOOKBACK_MINUTES)
    total_in = total_out = 0
    direct = feed_direct(now)
    if direct is not None:
        candidates = [{"company": c["company"], "link": c["link"], "summary": c["summary"]} for c in pick_candidates(direct, since, known_links)]
        text = ""
    else:                                             # fall back to letting Claude fetch the feed
        text, total_in, total_out = call_claude(feed_prompt(now, since, known_links), api_key, fetch_tool(FEED_TOKENS), 8000)
        candidates = parse_items(text)
    if candidates is None:
        why = ("Claude could not fetch the NSE feed this time." if "FEED_ERROR" in text
               else "The feed copy was stale." if "STALE_FEED" in text else "Feed reply was not a JSON array.")
        print("[nse] %s Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (why, total_in, total_out, text[:300]))
        return
    written = []
    asked = 0
    for c in candidates:
        if asked >= MAX_ITEMS:
            break
        if not isinstance(c, dict):
            continue
        item = {
            "company": str(c.get("company") or "").strip(),
            "link": str(c.get("link") or "").strip(),
            "summary": clean(c.get("summary"), 300),
        }
        if not item["link"].startswith(NSE_PREFIX) or item["link"] in known_links:
            continue
        asked += 1
        try:
            reply, tin, tout = call_claude(item_prompt(item), api_key, fetch_tool(DOC_TOKENS), 5000)
        except Exception as e:  # one bad filing must not lose the others
            print("[nse] Skipped %s: %s" % (item["company"], e))
            continue
        total_in, total_out = total_in + tin, total_out + tout
        obj = parse_object(reply)
        if obj is None or reply.strip().upper().startswith("SKIP"):
            print("[nse] Skipped (no concrete fact): %s" % item["company"])
            continue
        obj["company"], obj["link"] = item["company"], item["link"]
        written.append(obj)
    rows = make_rows(written, known_links, now)
    append_rows(rows)
    print("[nse] Candidates: %d. Appended %d. Tokens in/out: %d / %d" % (len(candidates), len(rows), total_in, total_out))
    for row in rows:
        print(" -", row["headline"])


# ---------------------------------------------------------------- lane 2: market-moving news
def news_window_hours(now):
    """Look back to the last news item we wrote: at least 3 hours, at most 10 (covers the overnight gap)."""
    last = None
    for r in read_queue():
        if r.get("lane") == "news":
            last = r.get("created_ist")
    try:
        gap = (now - datetime.datetime.strptime(last, "%Y-%m-%d %H:%M").replace(tzinfo=IST)).total_seconds() / 3600
    except Exception:
        gap = 3
    return int(min(10, max(3, round(gap + 0.5))))


def news_prompt(now, covered):
    hours = news_window_hours(now)
    done = "\n".join("- " + h for h in covered) if covered else "(nothing yet)"
    return "\n".join([
        "You are the editor of a real-time market news desk for Indian investors.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Search the web for news from the last %d hours that can move the Indian stock market when it next trades. " % hours
        + "A market's closing level is news even if its fall or rise during the day was covered earlier. "
        "Before 9:15 AM India time, look first for: how US markets closed overnight (Dow, S&P 500, Nasdaq), how Asian markets "
        "are trading, the GIFT Nifty indication, crude oil, the dollar and rupee, and the key events due today. "
        "Indian markets being closed is not a reason to return nothing: global events and after-hours Indian news still count.",
        "1. India: RBI and SEBI decisions, government economic policy, macro data (inflation, IIP, GDP, trade, GST), "
        "sharp Nifty or Sensex moves, FII and DII flows, the rupee, large corporate deals, results or regulatory actions.",
        "2. Global: the US Federal Reserve and other major central banks, US inflation, jobs and GDP data, crude oil, "
        "sharp moves in US, European or Asian markets, major geopolitical or trade events, and big global company news "
        "that matters for Indian sectors.",
        "3. Company news from Indian listed companies: results with figures, large orders, acquisitions, fund raising, "
        "management changes and regulatory action, especially anything announced after market hours.",
        "4. Global brokerages' calls on India as a whole: a rating upgrade or downgrade of Indian equities, a new Nifty or "
        "Sensex target, or a changed India GDP, inflation or rupee forecast from houses such as Goldman Sachs, Morgan Stanley, "
        "JPMorgan, Jefferies, CLSA, Nomura, HSBC, UBS, Citi, BofA and Bernstein, and rating agencies such as Moody's, S&P and "
        "Fitch. Use one of your searches for this every time; name the house in the headline.",
        "5. US President Donald Trump's posts on Truth Social and his public statements, when they bear on India, trade and "
        "tariffs, visas, oil, Russia, China, Pakistan, the Middle East, the dollar or the Federal Reserve. Use one of your "
        "searches for this every time. Report such a post only if an established news outlet has reported it; say what he "
        "said in your own words, never invent or guess wording, and start the headline with TRUMP (TRUTH SOCIAL): or TRUMP:. "
        "Skip his posts on US domestic politics that have no market or India angle.",
        "Check several publications, not one site. Look across: " + OUTLETS + ".",
        "",
        "Already covered (do not repeat these or any story about the same event):",
        done,
        "",
        "Pick at most %d stories that are genuinely important. If nothing important and new turned up, reply with exactly: []" % NEWS_MAX_ITEMS,
        "",
        "Writing rules: use ONLY facts you found in your search. Keep numbers and units exactly as reported; never guess a figure. "
        "Write in your own words; never copy a publication's sentences. Neutral tone: no opinion, no advice, no hype, no hashtags. "
        "Do not name the publication and put no link in the text.",
        "Every sentence must state something that happened or an official figure. Never write what markets 'will watch', what "
        "'may' or 'could' happen, what a reader should check or do, or what a report did not say. If you have no second fact, "
        "leave the detail empty.",
        "A price level alone is not news unless it is a closing level, a record, or a move of 1% or more. "
        "Leave out strategists' index forecasts and previews of routine scheduled events. "
        "If a claim is surprising or appears in only one publication, leave it out, unless that publication is a major wire "
        "service or national business daily.",
        "",
        "Reply with ONLY a JSON array and nothing else. One object per story:",
        '"headline": UPPER CASE, at most 200 characters, in the form SUBJECT: FACT',
        '"detail": one plain sentence in normal case, at most 160 characters, giving a second reported fact; or an empty string',
        '"link": the URL of the article you relied on most',
    ])


def run_news(now, api_key):
    covered = covered_headlines()
    known_links = {r.get("verify_link") for r in read_queue()}
    text, tin, tout = call_claude(news_prompt(now, covered), api_key, search_tool(NEWS_SEARCHES), 8000)
    items = parse_items(text)
    if items is None:
        print("[news] Reply was not a JSON array. Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (tin, tout, text[:300]))
        return
    rows, stamp = [], now.strftime("%Y%m%d-%H%M")
    for r in items[:NEWS_MAX_ITEMS]:
        if not isinstance(r, dict):
            continue
        headline, detail, link = clean(r.get("headline"), 400), clean(r.get("detail"), 200), str(r.get("link") or "").strip()
        if len(headline) > 220:      # never cut a headline short; skip it instead
            continue
        if not headline or not link.startswith("http") or link in known_links or headline in covered:
            continue
        post = headline + ("\n" + detail if detail else "")
        if len(post) > 280:
            post, detail = headline, ""
        if len(post) > 280:
            continue
        known_links.add(link)
        rows.append({
            "id": "%s-N%02d" % (stamp, len(rows) + 1), "created_ist": now.strftime("%Y-%m-%d %H:%M"), "lane": "news",
            "company": "", "headline": headline, "detail": detail, "post_text": post, "verify_link": link, "document_read": True,
        })
    append_rows(rows)
    print("[news] Offered %d, appended %d. Tokens in/out: %d / %d" % (len(items), len(rows), tin, tout))
    if not rows:
        print("[news] Reply began: %r" % text[:400])
    for row in rows:
        print(" -", row["headline"])


# ---------------------------------------------------------------- lane 3: business stories
def story_prompt(now, covered):
    done = "\n".join("- " + h for h in covered) if covered else "(nothing yet)"
    return "\n".join([
        "You tell business stories to Indian readers who want to understand how startups and companies are built.",
        "Today's date in India is: " + now.strftime("%d-%b-%Y"),
        "",
        "Search the web and pick ONE interesting story of a startup or company, Indian or global, preferably a startup "
        "or a founder-led business. Confirm the facts in at least two different publications. Look across: " + OUTLETS
        + ", plus YourStory, Inc42 and Entrackr for startups.",
        "Do not pick any of these, which were already told:",
        done,
        "",
        "Tell the WHOLE story as a thread of exactly %d posts, each at most 262 characters, in simple everyday English. "
        "Someone who reads only this thread should understand the business completely:" % STORY_POSTS,
        "Write it so a reader cannot stop after the first post. The formula is hook, body, payoff.",
        "Post 1 (the hook): open with the single most surprising true fact of the story: a number, a rejection, a near-collapse "
        "or a sharp before-and-after contrast. Name the company in this post, but never open with 'X, founded by ...' or 'X is a ...'. "
        "Two short sentences at most, then one line that promises the story, such as 'Here is how it happened.'",
        "Posts 2 to %d (the body): tell it in time order as a chain of cause and effect, not a list of facts. Between them these posts "
        "must cover: who started it, when, where and the problem they saw (name the founders here); what the business does and who pays; "
        "how it makes money; the one thing it did differently from everyone else; the hardest moment or biggest risk and what it did about it. "
        "One idea per post, in short sentences. End each of these posts on a line that makes the reader want the next one: a problem, "
        "a turn, or a question that the next post answers." % (STORY_POSTS - 1),
        "Post %d (the payoff): where it stands today in numbers, tied back to the fact in post 1, and the one lesson for anyone "
        "building a business." % STORY_POSTS,
        "Proof: every post must carry at least one checkable fact (a number, a year, a name or an amount). The hook and every surprising "
        "claim must be confirmed in at least two publications. Never exaggerate, round up or invent a detail to make a line more exciting, "
        "and never ask a question the thread does not answer. If the true facts are not interesting enough, pick a different company.",
        "",
        "Rules: use ONLY facts you found in your search, with numbers, years and units exactly as reported. Write in your own words; "
        "never copy a publication's sentences. No advice to buy or sell anything, no hype words, "
        "no hashtags, no emojis, no links, no numbering, and do not name the publications.",
        "",
        "Reply with ONLY one JSON object and nothing else:",
        '"company": the company name',
        '"founders": the founders\' names, or an empty string',
        '"headline": UPPER CASE title that includes the company name, at most 100 characters',
        '"thread": a list of the %d posts in order' % STORY_POSTS,
        '"link": the URL of the article you relied on most',
    ])


def slot_due(now, lane, hours):
    """True when the latest hour in `hours` has passed and nothing in this lane has been written since it."""
    passed = [h for h in hours if now.hour >= h]
    if not passed:
        return False
    slot, day = passed[-1], now.strftime("%Y-%m-%d")
    for r in read_queue():
        made = str(r.get("created_ist", ""))
        if r.get("lane") == lane and made.startswith(day) and int(made[11:13] or 0) >= slot:
            return False
    return True


def story_due(now):
    return slot_due(now, "story", STORY_HOURS)


def run_story(now, api_key):
    covered = [r.get("headline") for r in read_queue() if r.get("lane") == "story"][-60:]
    text, tin, tout = call_claude(story_prompt(now, covered), api_key, search_tool(4), 10000)
    obj = parse_object(text)
    thread = [clean(t, 400) for t in (obj or {}).get("thread") or [] if clean(t, 400)]
    link = str((obj or {}).get("link") or "").strip()
    headline = clean((obj or {}).get("headline"), 120)
    total = len(thread)
    thread = ["%s (%d/%d)" % (t, i + 1, total) for i, t in enumerate(thread)]     # numbered, so the story reads in order
    if not obj or total < 4 or any(len(t) > 280 for t in thread) or not headline or not link.startswith("http"):
        print("[story] Reply was not usable. Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (tin, tout, text[:300]))
        return
    row = {
        "id": "%s-S01" % now.strftime("%Y%m%d-%H%M"), "created_ist": now.strftime("%Y-%m-%d %H:%M"), "lane": "story",
        "company": clean(obj.get("company"), 80), "headline": headline, "detail": "", "post_text": thread[0],
        "thread": thread, "story_text": "\n\n".join(t.rsplit(" (", 1)[0] for t in thread),
        "founders": clean(obj.get("founders"), 120), "verify_link": link, "document_read": True,
    }
    append_rows([row])
    print("[story] Appended 1 (%d posts). Tokens in/out: %d / %d" % (len(thread), tin, tout))
    print(" -", headline)


# ---------------------------------------------------------------- lane 4: brokerage targets
def targets_prompt(now, covered):
    done = "\n".join("- " + c for c in covered) if covered else "(nothing yet)"
    return "\n".join([
        "You compile what brokerages and analysts are saying about Indian listed stocks, for a news desk.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Search the web for brokerage and analyst calls on Indian stocks reported in the last 24 hours: target prices, "
        "ratings, upgrades, downgrades, new coverage, and short-term calls that come with a stop-loss. "
        "Look across: " + OUTLETS + ".",
        "Skip these calls, which were already published (stock | firm | target):",
        done,
        "",
        "Rules: include a call ONLY if the report names the brokerage or the analyst's firm, the stock and a target price. "
        "Copy every number exactly as reported; never guess, never calculate a figure. If one stock has calls from several "
        "firms, include each. Up to %d calls, the most widely followed stocks first." % TARGET_MAX_CALLS,
        "",
        "Reply with ONLY a JSON array and nothing else. One object per call:",
        '"stock": the company name, short form, as commonly written',
        '"firm": the brokerage, or the analyst and firm for a short-term call',
        '"call": exactly BUY, HOLD or SELL (Overweight, Outperform, Accumulate, Add = BUY; Neutral, Equal-weight, Market perform = HOLD; '
        'Underweight, Underperform, Reduce = SELL)',
        '"price": the stock\'s current or last traded share price as a plain number, taken from the same report; if the report does '
        'not give it, find it in another report from today; null only if you cannot find it',
        '"target": the target price as a plain number, such as 287 or 1300',
        '"old_target": the previous target as a plain number if the report gives it, otherwise null',
        '"stop_loss": the stop-loss as a plain number if the report gives one, otherwise null',
        '"horizon": "long" for a 12-month research target, "short" for an intraday or few-weeks call',
        '"link": the URL of the report',
        "",
        "If you find no qualifying calls, reply with exactly: []",
    ])


def to_number(v):
    try:
        return float(str(v).replace(",", "").replace("Rs", "").replace("₹", "").strip())
    except Exception:
        return None


def rupees(v):
    n = to_number(v)
    if n is None:
        return None
    return "₹{:,.0f}".format(n) if n == int(n) else "₹{:,.2f}".format(n)


def target_groups(calls):
    """Turn the calls into short text blocks: one per stock for long-term calls, one line each for short-term."""
    long_by_stock, short_lines, price = {}, [], {}
    for c in calls:                                   # one current price per stock, the first one reported
        if rupees(c.get("price")) and c["stock"].upper() not in price:
            price[c["stock"].upper()] = rupees(c.get("price"))
    for c in calls:
        tgt = rupees(c["target"])
        now_txt = " (price now %s)" % price[c["stock"].upper()] if c["stock"].upper() in price else ""
        if c["horizon"] == "short":
            line = "%s%s: %s. Target %s." % (c["stock"].upper(), now_txt, c["call"], tgt)
            if c.get("stop_loss") is not None:
                line += " Stop-loss %s." % rupees(c["stop_loss"])
            short_lines.append(line + " By %s." % c["firm"])
            continue
        line = "%s: %s. Expects %s" % (c["firm"], c["call"], tgt)
        old, new = to_number(c.get("old_target")), to_number(c["target"])
        if old is not None and new is not None:
            line += " (no change)" if old == new else " (%s from %s)" % ("raised" if new > old else "cut", rupees(old))
        long_by_stock.setdefault(c["stock"].upper(), []).append(line + ".")
    groups = [name + (" (price now %s)" % price[name] if name in price else "") + "\n" + "\n".join(lines)
              for name, lines in long_by_stock.items()]
    if short_lines:
        groups.append("SHORT-TERM IDEAS (days to weeks)\n" + short_lines[0])     # the heading stays with its first line
        groups.extend(short_lines[1:])
    return groups


TARGET_GUIDE = ("Target = the price they expect in about 1 year.\n"
                "Stop-loss = the price at which they say exit to limit your loss.")
TARGET_CLOSING = "These are the brokerages' views, not ours."


def pack_posts(title, groups, limit=262, guide=TARGET_GUIDE, closing=TARGET_CLOSING):
    """Pack text blocks into posts of at most `limit` characters, keeping each stock's block whole where it fits."""
    posts, cur = [title + "\n\n" + guide], ""
    for g in groups:
        for piece in ([g] if len(g) <= limit else g.split("\n")):     # an oversized block is split by line
            piece = piece[:limit]
            if cur and len(cur) + 2 + len(piece) > limit:
                posts.append(cur)
                cur = piece
            else:
                cur = (cur + "\n\n" + piece) if cur else piece
    if cur and len(cur) + 2 + len(closing) <= limit:
        posts.append(cur + "\n\n" + closing)
    else:
        if cur:
            posts.append(cur)
        posts.append(closing)
    return ["%s (%d/%d)" % (t, i + 1, len(posts)) for i, t in enumerate(posts)]


def price_prompt(now, stocks):
    return "\n".join([
        "Find the latest share price on NSE or BSE for each of these Indian stocks, from reports or quote pages dated "
        + now.strftime("%d-%b-%Y") + " or the last trading day:",
        "\n".join("- " + x for x in stocks),
        "",
        "Reply with ONLY one JSON object and nothing else, mapping each stock name exactly as written above to its price "
        "as a plain number, or to null if you could not find a price you are confident of. Never guess.",
    ])


def run_targets(now, api_key):
    recent = [r for r in read_queue() if r.get("lane") == "targets"][-6:]
    covered = ["%s | %s | %s" % (c.get("stock"), c.get("firm"), c.get("target")) for r in recent for c in r.get("calls") or []][-120:]
    text, tin, tout = call_claude(targets_prompt(now, covered), api_key, search_tool(6), 12000)
    items = parse_items(text)
    if items is None:
        print("[targets] Reply was not a JSON array. Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (tin, tout, text[:300]))
        return
    calls, seen = [], set(covered)
    for r in items[:TARGET_MAX_CALLS]:
        if not isinstance(r, dict):
            continue
        c = {
            "stock": clean(r.get("stock"), 40), "firm": clean(r.get("firm"), 60), "call": clean(r.get("call"), 10).upper(),
            "price": r.get("price"), "target": r.get("target"), "old_target": r.get("old_target"), "stop_loss": r.get("stop_loss"),
            "horizon": "short" if str(r.get("horizon") or "").lower().startswith("short") else "long",
            "link": str(r.get("link") or "").strip(),
        }
        key = "%s | %s | %s" % (c["stock"], c["firm"], c["target"])
        if (not c["stock"] or not c["firm"] or c["call"] not in ("BUY", "HOLD", "SELL") or to_number(c["target"]) is None
                or not c["link"].startswith("http") or key in seen):
            continue
        seen.add(key)
        calls.append(c)
    if len(calls) < 2:
        print("[targets] Offered %d, usable %d: too few for a list. Nothing saved. Tokens in/out: %d / %d" % (len(items), len(calls), tin, tout))
        return
    missing = sorted({c["stock"] for c in calls if to_number(c.get("price")) is None})
    if missing:                                   # a target means little to a beginner without today's price beside it
        try:
            ptext, pin, pout = call_claude(price_prompt(now, missing), api_key, search_tool(4), 4000)
            tin, tout = tin + pin, tout + pout
            found = parse_object(ptext) or {}
            for c in calls:
                if to_number(c.get("price")) is None and to_number(found.get(c["stock"])) is not None:
                    c["price"] = found[c["stock"]]
        except Exception as e:
            print("[targets] price lookup failed: %s" % e)
    calls.sort(key=lambda c: (c["horizon"] == "short", c["stock"].upper()))
    title = "WHAT BROKERAGES EXPECT | " + now.strftime("%d %b").upper()
    thread = pack_posts(title, target_groups(calls))
    if any(len(t) > 280 for t in thread):
        print("[targets] A post came out too long. Nothing saved.")
        return
    row = {
        "id": "%s-T01" % now.strftime("%Y%m%d-%H%M"), "created_ist": now.strftime("%Y-%m-%d %H:%M"), "lane": "targets",
        "company": "", "headline": title, "detail": "", "post_text": thread[0], "thread": thread,
        "story_text": "\n\n".join(t.rsplit(" (", 1)[0] for t in thread), "calls": calls,
        "verify_link": calls[0]["link"], "verify_links": sorted({c["link"] for c in calls}), "document_read": True,
    }
    append_rows([row])
    print("[targets] Offered %d, used %d calls in %d posts. Tokens in/out: %d / %d" % (len(items), len(calls), len(thread), tin, tout))
    for t in thread:
        print("   | " + t.replace("\n", "\n   | "))


# ---------------------------------------------------------------- lane 5: who bought, who sold
def deals_prompt(now, covered):
    done = "\n".join("- " + c for c in covered) if covered else "(nothing yet)"
    return "\n".join([
        "You track what large investors are doing in Indian listed stocks, for a news desk.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Search the web for reports from the last 24 hours of well-known and institutional investors buying or selling "
        "Indian stocks: NSE and BSE bulk deals and block deals, stake purchases and stake sales, and newly disclosed "
        "shareholding changes. Investors of interest: foreign institutions (FIIs/FPIs such as Goldman Sachs, Morgan Stanley, "
        "Societe Generale, BlackRock, Vanguard, GIC, Norges), domestic mutual funds and insurers (SBI MF, HDFC MF, ICICI Prudential, "
        "LIC), promoters and private equity funds, and marquee individual investors (such as Radhakishan Damani, Vijay Kedia, "
        "Ashish Kacholia, Mukul Agrawal, Dolly Khanna, Sunil Singhania, Madhusudan Kela and the Jhunjhunwala family's Rare Enterprises).",
        "Look across: " + OUTLETS + ".",
        "Skip these, which were already published (stock | investor | action):",
        done,
        "",
        "Rules: include an item ONLY if the report names the investor and the stock and says clearly whether they bought or sold. "
        "Copy quantities, prices and values exactly as reported, with their units; never guess or calculate. Up to %d items, "
        "the best-known investors and largest deals first." % DEAL_MAX,
        "",
        "Reply with ONLY a JSON array and nothing else. One object per item:",
        '"stock": the company name, short form',
        '"investor": the investor\'s name as reported',
        '"action": exactly BOUGHT or SOLD',
        '"quantity": the shares or stake as reported, at most 40 characters, such as "12.5 lakh shares" or "1.2% stake"; or null',
        '"price": the deal price per share as a plain number if reported, otherwise null',
        '"value": the deal value as reported, at most 30 characters, such as "Rs 51 crore"; or null',
        '"how": one of "bulk deal", "block deal", "stake purchase", "stake sale", "shareholding change"',
        '"link": the URL of the report',
        "",
        "If you find no qualifying items, reply with exactly: []",
    ])


def deal_groups(deals):
    by_stock = {}
    for d in deals:
        line = "%s %s" % (d["investor"], d["action"])
        if d.get("quantity"):
            line += " " + d["quantity"]
        if rupees(d.get("price")):
            line += " at %s" % rupees(d["price"])
        if d.get("value"):
            line += " (%s)" % d["value"].replace("Rs.", "₹").replace("Rs ", "₹")
        by_stock.setdefault(d["stock"].upper(), []).append(line + ".")
    return [name + "\n" + "\n".join(lines) for name, lines in by_stock.items()]


def run_deals(now, api_key):
    recent = [r for r in read_queue() if r.get("lane") == "deals"][-6:]
    covered = ["%s | %s | %s" % (d.get("stock"), d.get("investor"), d.get("action")) for r in recent for d in r.get("deals") or []][-120:]
    text, tin, tout = call_claude(deals_prompt(now, covered), api_key, search_tool(6), 12000)
    items = parse_items(text)
    if items is None:
        print("[deals] Reply was not a JSON array. Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (tin, tout, text[:300]))
        return
    deals, seen = [], set(covered)
    for r in items[:DEAL_MAX]:
        if not isinstance(r, dict):
            continue
        d = {
            "stock": clean(r.get("stock"), 40), "investor": clean(r.get("investor"), 60), "action": clean(r.get("action"), 10).upper(),
            "quantity": clean(r.get("quantity"), 40) or None, "price": r.get("price"), "value": clean(r.get("value"), 30) or None,
            "how": clean(r.get("how"), 30), "link": str(r.get("link") or "").strip(),
        }
        key = "%s | %s | %s" % (d["stock"], d["investor"], d["action"])
        if not d["stock"] or not d["investor"] or d["action"] not in ("BOUGHT", "SOLD") or not d["link"].startswith("http") or key in seen:
            continue
        seen.add(key)
        deals.append(d)
    if not deals:
        print("[deals] Offered %d, usable 0. Nothing saved. Tokens in/out: %d / %d" % (len(items), tin, tout))
        return
    deals.sort(key=lambda d: d["stock"].upper())
    title = "WHO BOUGHT, WHO SOLD | " + now.strftime("%d %b").upper()
    guide = "Big investors' deals in Indian stocks, as reported.\nBulk and block deals are large trades disclosed by the exchanges."
    thread = pack_posts(title, deal_groups(deals), guide=guide, closing="Reported deals only. Not a suggestion to buy or sell.")
    if any(len(t) > 280 for t in thread):
        print("[deals] A post came out too long. Nothing saved.")
        return
    row = {
        "id": "%s-D01" % now.strftime("%Y%m%d-%H%M"), "created_ist": now.strftime("%Y-%m-%d %H:%M"), "lane": "deals",
        "company": "", "headline": title, "detail": "", "post_text": thread[0], "thread": thread,
        "story_text": "\n\n".join(t.rsplit(" (", 1)[0] for t in thread), "deals": deals,
        "verify_link": deals[0]["link"], "verify_links": sorted({d["link"] for d in deals}), "document_read": True,
    }
    append_rows([row])
    print("[deals] Offered %d, used %d deals in %d posts. Tokens in/out: %d / %d" % (len(items), len(deals), len(thread), tin, tout))
    for t in thread:
        print("   | " + t.replace("\n", "\n   | "))


# ---------------------------------------------------------------- scheduling
def load_state():
    try:
        return json.loads(STATE.read_text())
    except Exception:
        return {}


def main():
    now = datetime.datetime.now(IST)
    only = os.environ.get("AVRON_ONLY", "").strip().lower()       # nse, news or story: run just that lane, now
    if now.hour < START_HOUR and os.environ.get("AVRON_FORCE") != "1" and not only:
        print("Outside working hours (%s IST). Nothing to do." % now.strftime("%H:%M"))
        return 0
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        print("ANTHROPIC_API_KEY is not set. Add it under Settings > Secrets and variables > Actions.")
        return 1
    state = load_state()
    last_news = state.get("last_news", 0)
    plan = []
    if only in ("", "nse"):
        plan.append(("nse", run_nse))
    if only == "news" or (not only and now.timestamp() - last_news >= NEWS_EVERY_MINUTES * 60):
        plan.append(("news", run_news))
    if only == "story" or (not only and story_due(now)):
        plan.append(("story", run_story))
    if only == "targets" or (not only and slot_due(now, "targets", TARGET_HOURS)):
        plan.append(("targets", run_targets))
    if only == "deals" or (not only and slot_due(now, "deals", DEAL_HOURS)):
        plan.append(("deals", run_deals))
    failed = 0
    for name, fn in plan:
        try:
            fn(now, api_key)
            if name == "news":
                state["last_news"] = now.timestamp()
        except urllib.error.HTTPError as e:
            failed += 1
            print("[%s] Claude API error %s: %s" % (name, e.code, e.read().decode("utf-8", "replace")[:400]))
        except Exception as e:  # network trouble: this lane tries again next round
            failed += 1
            print("[%s] failed: %s" % (name, e))
    try:
        STATE.write_text(json.dumps(state))
    except Exception:
        pass
    return 1 if failed == len(plan) and plan else 0


if __name__ == "__main__":
    sys.exit(main())
