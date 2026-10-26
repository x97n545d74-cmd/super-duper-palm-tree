"""Burned-in captions from ../timeline.json (Roman Hinglish display words), max 5 words per group,
broken at punctuation. Writes compositions/cap.html."""
import json, re, html
tl = json.load(open("../timeline.json"))
words = [w for b in tl["beats"] for w in b["words"]]
groups, cur = [], []
for w in words:
    cur.append(w)
    if re.search(r"[.?,:!]$", w["w"]) or len(cur) >= 5:
        groups.append(cur); cur = []
if cur: groups.append(cur)
COL = {"gold": "#e3b04b", "red": "#e5484d", "green": "#3dbe7a"}
items = []
for i, g in enumerate(groups):
    s = g[0]["s"]; e = groups[i + 1][0]["s"] if i + 1 < len(groups) else g[-1]["e"] + 0.6
    e = min(e, g[-1]["e"] + 0.6)
    spans = " ".join(f'<span style="color:{COL[w["tone"]]}">{html.escape(w["w"].rstrip(".,:"))}</span>' if w.get("tone")
                     else html.escape(w["w"].rstrip(".,:")) for w in g)
    items.append(f'    <div id="cap-{i}" class="clip cap" data-start="{s:.3f}" data-duration="{max(0.3, e - s):.3f}" data-track-index="0">{spans}</div>')
open("compositions/cap.html", "w").write(f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; font-family: Inter, sans-serif; }}
    #root .cap {{ position: absolute; left: 72px; width: 828px; top: 1352px; font-weight: 700; font-size: 44px; line-height: 1.2;
                 color: #f2eee6; letter-spacing: -0.01em; }}
  </style>
  <div id="root" data-composition-id="cap" data-width="1080" data-height="1920" data-layout-allow-caption-zone>
{chr(10).join(items)}
  </div>
  <script>
    window.__timelines["cap"] = gsap.timeline({{ paused: true }});
  </script>
</template>
""")
print(len(groups), "caption groups")
