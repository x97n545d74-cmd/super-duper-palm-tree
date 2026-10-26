#!/usr/bin/env bash
export PATH="$HOME/.local/bin:$PATH"
run(){ ch=$1; slug=$2; shift 2; agent-reach $ch search "$@" > raw/trend/${ch}_${slug}.json 2>&1
  python3 - "$ch" "$slug" <<'PY'
import json,sys
ch,slug=sys.argv[1:3]; d=json.load(open(f'raw/trend/{ch}_{slug}.json'))
print(f'== {ch}/{slug}', d.get('ok'), (d.get('error') or {}).get('code'), len(d.get('items',[])))
for i in d.get('items',[])[:12]:
    r=i.get('raw') or {}
    print('  -', (i.get('title') or '')[:105], '|', i.get('published_at') or '', '|', r.get('view_count',''))
PY
}
run web gainers "top gainers NSE this week October 2026 stocks" --limit 10; sleep 11
run web infocus "stocks in focus today October 24 2026 India" --limit 10; sleep 11
run web q2 "Q2 results October 2026 shares surge plunge India" --limit 10; sleep 11
run web ipo "IPO listing October 2026 India shares debut" --limit 10; sleep 11
run web retail "most traded stocks retail investors India October 2026" --limit 10; sleep 11
run reddit isb "IndianStreetBets October 2026" --backend public-web --limit 15; sleep 11
run reddit ism "IndianStockMarket Q2 results 2026" --backend public-web --limit 15; sleep 11
run youtube ytq2 "Q2 results 2026 share news hindi" --limit 20; sleep 12
run youtube ytnews "share market news today stock hindi october 2026" --limit 20; sleep 12
run youtube ytipo "IPO review hindi 2026" --limit 20
echo DONE
