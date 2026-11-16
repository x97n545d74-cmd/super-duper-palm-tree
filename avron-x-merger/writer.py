#!/usr/bin/env python3
"""Avron X merger writer.

Run by GitHub Actions every 5 minutes. Asks Claude to fetch NSE's official
announcements feed and the filing documents, write one headline per new
filing, and appends the result to queue.jsonl. Standard library only.

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
MAX_ITEMS = int(os.environ.get("AVRON_MAX_ITEMS", "6"))
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


def build_prompt(now, since, known_links):
    known = "\n".join(known_links) if known_links else "(none)"
    return "\n".join([
        "You are the editor of a real-time market news desk.",
        "The current time in India is: " + now.strftime(FMT),
        "",
        "Use your web fetch tool to fetch this official NSE feed now: " + FEED,
        "Each item has a title (the company name), a link to the filed document, a pubDate in India time "
        "such as 16-Nov-2026 09:14:05, and a description that ends with |SUBJECT: category. Items are newest first.",
        "",
        "Step 1. Keep only items whose pubDate is later than " + since.strftime(FMT) + ".",
        "Step 2. Drop items with an empty link, and items whose description or subject mentions any of these "
        "(ignore upper and lower case): " + ROUTINE + ". Also drop items whose subject is exactly Updates.",
        "Step 3. Drop items whose link is in this already-handled list:",
        known,
        "Step 4. If the same company has both a document and an XBRL (.xml) version of the same disclosure, keep one.",
        "Step 5. If more than %d items remain, keep the %d most newsworthy: order wins, acquisitions, capacity or "
        "capex decisions, results with figures, fund raising, regulatory actions and senior management changes first." % (MAX_ITEMS, MAX_ITEMS),
        "Step 6. For each item kept, fetch its link and read the document. If it cannot be fetched or read, "
        "use the feed description alone.",
        "",
        "Writing rules: use ONLY facts stated in the feed or the documents. Keep every number, name and unit exactly "
        "as written. Never guess, round or convert a figure, and never mix up lakh, crore, million and billion. "
        "Neutral tone: no opinion, no advice, no hype, no hashtags. Do not name the source and put no link in the text.",
        "",
        "Reply with ONLY a JSON array and nothing else. One object per item with exactly these keys:",
        '"company": the company name as in the feed',
        '"headline": UPPER CASE, at most 200 characters, in the form COMPANY: FACT',
        '"detail": one plain sentence in normal case, at most 160 characters, with the next most useful fact, or an empty string',
        '"link": the item link exactly as in the feed',
        '"document_read": true if you read the document, false if you used the feed description only',
        "",
        "If no items remain, reply with exactly: []",
        'If the feed itself cannot be fetched, reply with exactly: {"error":"FEED_ERROR"}',
    ])


def call_claude(prompt, api_key):
    messages = [{"role": "user", "content": prompt}]
    body = {
        "model": MODEL,
        "max_tokens": 6000,
        "tools": [{
            "type": "web_fetch_20260318",
            "name": "web_fetch",
            "max_uses": MAX_ITEMS + 2,
            "allowed_domains": ["nsearchives.nseindia.com"],
            "use_cache": False,
            "max_content_tokens": 12000,
        }],
        "messages": messages,
    }
    for _ in range(4):
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
        with urllib.request.urlopen(req, timeout=240) as resp:
            res = json.loads(resp.read().decode("utf-8"))
        if res.get("stop_reason") != "pause_turn":
            return res
        # Claude paused mid-turn: hand its work back so it can finish.
        messages.append({"role": "assistant", "content": res.get("content", [])})
    return res


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


def main():
    now = datetime.datetime.now(IST)
    if now.hour < START_HOUR and os.environ.get("AVRON_FORCE") != "1":
        print("Outside working hours (%s IST). Nothing to do." % now.strftime("%H:%M"))
        return 0
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        print("ANTHROPIC_API_KEY is not set. Add it under Settings > Secrets and variables > Actions.")
        return 1
    known_links = [r.get("verify_link") for r in read_queue() if r.get("verify_link")][-80:]
    since = now - datetime.timedelta(minutes=LOOKBACK_MINUTES)
    try:
        res = call_claude(build_prompt(now, since, known_links), api_key)
    except urllib.error.HTTPError as e:
        print("Claude API error %s: %s" % (e.code, e.read().decode("utf-8", "replace")[:500]))
        return 1
    except Exception as e:  # network trouble: try again on the next run
        print("Could not reach the Claude API: %s" % e)
        return 1
    usage = res.get("usage") or {}
    print("Tokens in/out: %s / %s" % (usage.get("input_tokens"), usage.get("output_tokens")))
    text = reply_text(res)
    if "FEED_ERROR" in text:
        print("Claude could not fetch the NSE feed this time.")
        return 0
    items = parse_items(text)
    if items is None:
        print("Reply was not a JSON array; nothing saved. Reply began: %r" % text[:200])
        return 0
    rows = make_rows(items, known_links, now)
    if rows:
        with QUEUE.open("a", encoding="utf-8") as f:
            for row in rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print("Appended %d item(s)." % len(rows))
    for row in rows:
        print(" -", row["headline"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
