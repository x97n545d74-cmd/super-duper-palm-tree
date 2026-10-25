#!/usr/bin/env bash
export PATH="$HOME/.local/bin:$PATH"
while IFS='|' read -r slug q; do
  agent-reach web search "$q" --limit 6 > "raw/web_${slug}.json" 2>&1
  echo "$slug $(python3 -c "import json;d=json.load(open('raw/web_${slug}.json'));print(d.get('ok'),[i['url'] for i in d.get('items',[])][:6])" 2>/dev/null)"
  sleep 11
done <<'Q'
sebi_fno|SEBI study individual traders equity F&O losses FY25 91% net loss
sebi_fno24|SEBI study September 2024 93% individual F&O traders losses 1.8 lakh crore
sebi_intraday|SEBI study intraday traders 70% losses equity cash segment
sebi_ipo|SEBI study IPO investors sold shares within a week of listing
nse_investors|NSE market pulse unique registered investors crore 2026 tier cities share
muhurat2026|NSE muhurat trading 2026 date time circular Diwali
finfluencer|SEBI finfluencer rules unregistered advice 2024 circular
pumpdump|SEBI order telegram channel pump and dump stock tips
sme_ipo|SEBI SME IPO concerns retail investors 2025
dividend_tax|dividend taxable income India TDS 10% shareholders
split_bonus|stock split vs bonus issue market cap unchanged NSE investor education
demat_count|CDSL NSDL demat accounts total crore 2026
Q
echo DONE
