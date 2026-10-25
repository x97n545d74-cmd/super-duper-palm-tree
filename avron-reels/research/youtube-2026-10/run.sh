#!/usr/bin/env bash
export PATH="$HOME/.local/bin:$PATH"
: > results.jsonl
while IFS='|' read -r q cluster; do
  r=$(agent-reach youtube search "$q" --limit 20 2>&1)
  code=$(echo "$r" | python3 -c "import sys,json; d=json.load(sys.stdin); print('OK' if d.get('ok') else d['error']['code'])" 2>/dev/null || echo PARSE_FAIL)
  echo "$(date +%T) $code  $q"
  if [ "$code" = OK ]; then echo "$r" | python3 -c "
import sys,json; d=json.load(sys.stdin)
for it in d['items']:
    r=it.get('raw') or {}
    print(json.dumps({'q':'''$q''','cluster':'$cluster','title':it.get('title'),'url':it.get('url'),'channel':it.get('author'),'channel_id':r.get('channel_id'),'views':r.get('view_count'),'likes':r.get('like_count'),'dur':r.get('duration'),'tags':r.get('tags')},ensure_ascii=False))" >> results.jsonl
  fi
  case "$code" in PLATFORM_BLOCKED|RATE_LIMITED|NEED_LOGIN|BUSY) echo "STOPPING on $code"; break;; esac
  sleep 12
done < queries.txt
echo FINISHED; wc -l results.jsonl
