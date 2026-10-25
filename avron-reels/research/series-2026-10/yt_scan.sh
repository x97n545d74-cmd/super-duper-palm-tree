#!/usr/bin/env bash
# YouTube scan of Hindi/Hinglish stock-market short topics (read-only). One query every 12 s.
export PATH="$HOME/.local/bin:$PATH"
while IFS='|' read -r slug q; do
  agent-reach youtube search "$q" --limit 20 > "raw/yt_${slug}.json" 2>&1
  echo "$slug $(python3 -c "import json,sys;d=json.load(open('raw/yt_${slug}.json'));print(d.get('ok'),len(d.get('items',[])))" 2>/dev/null)"
  sleep 12
done <<'Q'
ipo|IPO kya hai shorts hindi
fno|F&O trading loss shorts hindi
penny|penny stock shorts hindi
split|stock split bonus share kya hai shorts
dividend|dividend kya hota hai shorts hindi
sip|SIP vs share market shorts hindi
tips|telegram stock tips scam shorts hindi
crash|share market crash kya kare shorts hindi
pe|PE ratio kya hai shorts hindi
muhurat|muhurat trading shorts hindi
beginner|share market beginners shorts hindi
intraday|intraday trading loss shorts hindi
upper|upper circuit lower circuit shorts hindi
comedy|share market comedy shorts hindi
demat|demat account kya hai shorts hindi
mf|mutual fund vs stock shorts hindi
smallcap|small cap stock shorts hindi
gold|gold vs share market shorts hindi
Q
echo DONE
