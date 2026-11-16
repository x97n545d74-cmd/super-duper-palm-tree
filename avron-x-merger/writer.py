#!/usr/bin/env python3
"""Avron X merger writer.

Run by GitHub Actions every 5 minutes. Stage 1 asks Claude to fetch NSE's
official announcements feed and pick the new filings worth posting. Stage 2
asks Claude, one filing at a time, to read the document and write a headline.
Results are appended to queue.jsonl. Small separate calls keep the cost low.
Standard library only.

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

HERE = pathlib.Path(__file__).resolve().parent
QUEUE = HERE / "queue.jsonl"
IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))
FEED = "https://nsearchives.nseindia.com/content/RSS/Online_announcements.xml"
NSE_PREFIX = "https://nsearchives.nseindia.com/"
MODEL = os.environ.get("AVRON_MODEL", "claude-haiku-5-5")
LOOKBACK_MINUTES = int(os.environ.get("AVRON_LOOKBACK_MINUTES", "30"))
MAX_ITEMS = int(os.environ.get("AVRON_MAX_ITEMS", "4"))
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


def feed_prompt(now, since, known_links):
    """Stage 1: Claude fetches the feed and returns a short list of candidates."""
    known = "\n".join(known_links) if known_links else "(none)"
    return "\n".join([
        "You are the filter desk of a real-time market news service.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Use your web fetch tool to fetch this official NSE feed (pass only the url; retry once if the tool reports an error): " + FEED,
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
        "If you cannot state a concrete fact (for example the document could not be read and the summary only gives "
        "a category such as allotment of securities), reply with exactly: SKIP",
        "",
        "Otherwise reply with ONLY one JSON object and nothing else:",
        '"headline": UPPER CASE, at most 200 characters, in the form COMPANY: FACT',
        '"detail": one plain sentence in normal case, at most 160 characters, giving a second concrete fact, or an empty string if there is none',
        '"document_read": true if you read the document, false if you used the feed summary only',
    ])


def call_claude(prompt, api_key, content_tokens, max_tokens):
    """One Claude call with a single web fetch allowed. Returns (reply text, input tokens, output tokens)."""
    messages = [{"role": "user", "content": prompt}]
    tin = tout = 0
    res = {}
    for _ in range(3):
        body = {
            "model": MODEL,
            "max_tokens": max_tokens,
            "tools": [{
                "type": "web_fetch_20260318",
                "name": "web_fetch",
                "max_uses": 3,   # room to retry: a first attempt sometimes fails
                "allowed_domains": ["nsearchives.nseindia.com"],
                "use_cache": False,
                "max_content_tokens": content_tokens,
            }],
            "messages": messages,
        }
        req = urllib.request.Request(
            "https://api.anthropic.com/v1/messages",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "content-type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=180) as resp:
            res = json.loads(resp.read().decode("utf-8"))
        usage = res.get("usage") or {}
        tin += usage.get("input_tokens") or 0
        tout += usage.get("output_tokens") or 0
        for b in res.get("content") or []:      # one line per fetch, to make failures easy to diagnose
            if isinstance(b, dict) and b.get("type") == "web_fetch_tool_result":
                c = b.get("content") or {}
                print("  fetch: %s %s size=%d" % (c.get("type"), c.get("error_code") or c.get("url") or "", len(json.dumps(c))))
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
        headline = " ".join(str(r.get("headline") or "").split())[:240]
        detail = " ".join(str(r.get("detail") or "").split())[:200]
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


def main():
    now = datetime.datetime.now(IST)
    if now.hour < START_HOUR and os.environ.get("AVRON_FORCE") != "1":
        print("Outside working hours (%s IST). Nothing to do." % now.strftime("%H:%M"))
        return 0
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        print("ANTHROPIC_API_KEY is not set. Add it under Settings > Secrets and variables > Actions.")
        return 1
    known_links = [r.get("verify_link") for r in read_queue() if r.get("verify_link")][-60:]
    since = now - datetime.timedelta(minutes=LOOKBACK_MINUTES)
    total_in = total_out = 0
    try:
        text, tin, tout = call_claude(feed_prompt(now, since, known_links), api_key, FEED_TOKENS, 3000)
    except urllib.error.HTTPError as e:
        print("Claude API error %s: %s" % (e.code, e.read().decode("utf-8", "replace")[:500]))
        return 1
    except Exception as e:  # network trouble: try again on the next run
        print("Could not reach the Claude API: %s" % e)
        return 1
    total_in, total_out = total_in + tin, total_out + tout
    candidates = parse_items(text)
    if candidates is None:
        why = "Claude could not fetch the NSE feed this time." if "FEED_ERROR" in text else "Feed reply was not a JSON array."
        print("%s Nothing saved. Tokens in/out: %d / %d. Reply began: %r" % (why, total_in, total_out, text[:300]))
        return 0
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
            "summary": " ".join(str(c.get("summary") or "").split())[:300],
        }
        if not item["link"].startswith(NSE_PREFIX) or item["link"] in known_links:
            continue
        asked += 1
        try:
            reply, tin, tout = call_claude(item_prompt(item), api_key, DOC_TOKENS, 2500)
        except Exception as e:  # one bad filing must not lose the others
            print("Skipped %s: %s" % (item["company"], e))
            continue
        total_in, total_out = total_in + tin, total_out + tout
        obj = parse_object(reply)
        if obj is None or reply.strip().upper().startswith("SKIP"):
            print("Skipped (no concrete fact): %s" % item["company"])
            continue
        obj["company"], obj["link"] = item["company"], item["link"]
        written.append(obj)
    rows = make_rows(written, known_links, now)
    if rows:
        with QUEUE.open("a", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print("Candidates: %d. Appended %d item(s). Tokens in/out: %d / %d" % (len(candidates), len(rows), total_in, total_out))
    for row in rows:
        print(" -", row["headline"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
