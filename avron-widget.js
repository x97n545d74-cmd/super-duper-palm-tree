/* AVRON Radar widget. Copy this file into the website (for Vercel: the project's public/ folder), put
   <div data-avron-radar></div> where it should appear, and load it with <script src="/avron-widget.js" defer></script>.
   GitHub serves files as plain text, so browsers will not run this script straight from GitHub; the data
   feed, on the other hand, can be read from GitHub by any site.
   Options on the div: data-sections="live,market,business,government,calendar,x" (any order, any subset),
   data-feed="URL of avron-feed.json", data-live-feed="URL of live.json" (defaults: the radar's public files on GitHub).
   The live section refreshes itself every 2 minutes; the rest every 15 minutes.
   Colours follow the host page: override --avr-fg, --avr-muted, --avr-line, --avr-panel, --avr-up, --avr-down, --avr-accent. */
(function () {
  var DEFAULT_FEED = "https://raw.githubusercontent.com/x97n545d74-cmd/super-duper-palm-tree/avron-radar-public/avron-feed.json";
  var DEFAULT_LIVE = "https://raw.githubusercontent.com/x97n545d74-cmd/super-duper-palm-tree/avron-radar-live/live.json";
  var LIVE_EVERY = 120000, FEED_EVERY = 900000;
  var CSS = [
    ".avr{--avr-fg:#15171c;--avr-muted:#5d6472;--avr-line:#e3e5ea;--avr-panel:#f6f7f9;--avr-up:#0a7a43;--avr-down:#b4231a;--avr-accent:#1f4fd1;",
    "color:var(--avr-fg);font:15px/1.5 inherit;display:flex;flex-direction:column;gap:20px}",
    "@media (prefers-color-scheme:dark){.avr{--avr-fg:#eceef2;--avr-muted:#9aa1ad;--avr-line:#2b3038;--avr-panel:#171a20;--avr-up:#3ccf86;--avr-down:#ff6b5e;--avr-accent:#7aa2ff}}",
    ".avr h3{margin:0 0 8px;font-size:1.05em}",
    ".avr .avr-sub{color:var(--avr-muted);font-size:.85em;margin:0 0 10px}",
    ".avr .avr-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}",
    ".avr .avr-tile{background:var(--avr-panel);border:1px solid var(--avr-line);border-radius:10px;padding:10px 12px;min-width:0}",
    ".avr .avr-tile b{display:block;font-size:1.25em;font-variant-numeric:tabular-nums}",
    ".avr .avr-tile span{color:var(--avr-muted);font-size:.8em}",
    ".avr .avr-up{color:var(--avr-up)}.avr .avr-down{color:var(--avr-down)}",
    ".avr ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}",
    ".avr li{padding:9px 0;border-bottom:1px solid var(--avr-line);min-width:0}",
    ".avr li a{color:inherit;text-decoration:none;font-weight:600}.avr li a:hover{text-decoration:underline}",
    ".avr .avr-meta{color:var(--avr-muted);font-size:.8em;display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}",
    ".avr .avr-chip{border:1px solid var(--avr-line);border-radius:999px;padding:0 7px}",
    ".avr .avr-wrap{overflow-x:auto}.avr table{width:100%;border-collapse:collapse;font-size:.85em;font-variant-numeric:tabular-nums}",
    ".avr th,.avr td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--avr-line);white-space:nowrap}",
    ".avr th{color:var(--avr-muted);font-weight:600}.avr td.avr-n,.avr th.avr-n{text-align:right}",
    ".avr .avr-pre{white-space:pre-line}",
    ".avr .avr-note{color:var(--avr-muted);font-size:.75em}",
    ".avr .avr-live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--avr-up);margin-right:6px;vertical-align:middle}",
    ".avr .avr-live-dot.avr-off{background:var(--avr-muted)}",
    ".avr .avr-new{border-left:3px solid var(--avr-accent);padding-left:8px}"
  ].join("");

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function num(x, d) { return x == null ? "–" : Number(x).toLocaleString("en-IN", {maximumFractionDigits: d == null ? 1 : d, minimumFractionDigits: d || 0}); }
  function signed(x, d, unit) { return x == null ? "–" : (x > 0 ? "+" : "") + num(x, d) + (unit || ""); }
  function tone(e, x) { if (x > 0) e.classList.add("avr-up"); else if (x < 0) e.classList.add("avr-down"); return e; }
  function safe(u) { return /^https:\/\//i.test(u || "") ? u : null; }
  function link(text, url) { var u = safe(url); if (!u) return el("span", null, text); var a = el("a", null, text); a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; return a; }
  function when(s) { var d = new Date(s); return isNaN(d) ? (s || "") : d.toLocaleString("en-IN", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"}); }
  function day(s) { var d = new Date(s + "T00:00:00"); return isNaN(d) ? s : d.toLocaleDateString("en-IN", {weekday: "short", day: "numeric", month: "short"}); }
  function tile(value, label, colorBy) { var t = el("div", "avr-tile"), b = el("b", null, value); if (colorBy != null) tone(b, colorBy); t.appendChild(b); t.appendChild(el("span", null, label)); return t; }
  function meta(parts) { var m = el("div", "avr-meta"); parts.forEach(function (p) { if (p) m.appendChild(typeof p === "string" ? el("span", null, p) : p); }); return m; }

  function ago(s) { var m = Math.round((Date.now() - new Date(s)) / 60000); return isNaN(m) ? "" : m < 1 ? "just now" : m < 60 ? m + " min ago" : m < 1440 ? Math.round(m / 60) + " h ago" : when(s); }
  var LABEL = {filing: "NSE filing", news: null, x: null};

  function live(f, L, host) {
    if (!L || !(L.items || []).length) return null;
    var s = el("section"), h = el("h3"), age = (Date.now() - new Date(L.updated_at)) / 60000;
    var dot = el("span", "avr-live-dot" + (age > 30 ? " avr-off" : "")); h.appendChild(dot); h.appendChild(document.createTextNode("Live news"));
    s.appendChild(h);
    s.appendChild(el("p", "avr-sub", age > 30 ? "Live updates are paused. Last update " + ago(L.updated_at) + "." : "Updated " + ago(L.updated_at) + ". Refreshes on its own."));
    var ul = el("ul"), seen = host.__avrSeen || {}, first = !host.__avrSeen;
    (L.items || []).slice(0, Number(host.getAttribute("data-live-count")) || 25).forEach(function (n) {
      var li = el("li", !first && !seen[n.id] ? "avr-new" : null);
      li.appendChild(link(n.headline, n.url));
      if (n.detail) li.appendChild(el("div", null, n.detail));
      li.appendChild(meta([ago(n.time), n.source, LABEL[n.kind] && n.source !== LABEL[n.kind] ? el("span", "avr-chip", LABEL[n.kind]) : null,
                           n.outlets > 1 ? el("span", "avr-chip", n.outlets + " outlets") : null]));
      ul.appendChild(li);
    });
    host.__avrSeen = {}; (L.items || []).forEach(function (n) { host.__avrSeen[n.id] = 1; });
    s.appendChild(ul); return s;
  }

  function market(f) {
    var m = f.market; if (!m) return null;
    var s = el("section"); s.appendChild(el("h3", null, "Market today"));
    s.appendChild(el("p", "avr-sub", "Prices for " + day(m.date) + ", from NSE's end-of-day files."));
    var g = el("div", "avr-tiles"), ix = m.indices || {}, b = m.breadth || {}, fl = m.flows || {};
    ["Nifty 50", "Nifty Smallcap 250", "Nifty Bank"].forEach(function (n) { if (ix[n]) g.appendChild(tile(num(ix[n].close, 1), n + " · " + signed(ix[n].change_pct, 2, "%"), ix[n].change_pct)); });
    if (ix["India VIX"]) g.appendChild(tile(num(ix["India VIX"].close, 2), "India VIX"));
    if (b.advancers != null) g.appendChild(tile(num(b.advancers, 0) + " / " + num(b.decliners, 0), "stocks up / down"));
    if (b.pct_above_200dma != null) g.appendChild(tile(num(b.pct_above_200dma, 1) + "%", "of stocks above their 200-day average"));
    if (fl.fpi_equity_net_cr != null) g.appendChild(tile(signed(fl.fpi_equity_net_cr, 0), "Rs crore, foreign investors' net share buying" + (fl.fpi_date && fl.fpi_date !== m.date ? " (" + day(fl.fpi_date) + ")" : ""), fl.fpi_equity_net_cr));
    if (fl.fii_index_futures_long_pct != null) g.appendChild(tile(num(fl.fii_index_futures_long_pct, 1) + "%", "of foreign investors' index futures held long"));
    if (fl.usd_inr != null) g.appendChild(tile(num(fl.usd_inr, 2), "rupees per US dollar"));
    s.appendChild(g);
    var sec = (m.sectors || []).filter(function (x) { return x.change_1m_pct != null; });
    if (sec.length) {
      var w = el("div", "avr-wrap"), t = el("table"), h = t.insertRow();
      ["Industry", "Today", "1 month", "Above 200-day"].forEach(function (x, i) { var th = el("th", i ? "avr-n" : null, x); h.appendChild(th); });
      sec.slice(0, 5).concat(sec.length > 8 ? sec.slice(-3) : []).forEach(function (r) {
        var tr = t.insertRow(); tr.appendChild(el("td", null, r.industry));
        tr.appendChild(tone(el("td", "avr-n", signed(r.change_today_pct, 1, "%")), r.change_today_pct));
        tr.appendChild(tone(el("td", "avr-n", signed(r.change_1m_pct, 1, "%")), r.change_1m_pct));
        tr.appendChild(el("td", "avr-n", r.pct_above_200dma == null ? "–" : r.pct_above_200dma + "%"));
      });
      w.appendChild(t); s.appendChild(el("p", "avr-sub", "Strongest and weakest industries over a month.")); s.appendChild(w);
    }
    return s;
  }

  function business(f) {
    var B = f.business || []; if (!B.length) return null;
    var s = el("section"), ul = el("ul"); s.appendChild(el("h3", null, "Business news"));
    B.slice(0, 15).forEach(function (n) {
      var li = el("li"); li.appendChild(link(n.headline, n.url));
      li.appendChild(meta([n.source, n.outlets > 1 ? el("span", "avr-chip", n.outlets + " outlets") : null, n.area !== "other" ? n.area : null, when(n.time)]));
      ul.appendChild(li);
    });
    s.appendChild(ul); return s;
  }

  function government(f) {
    var G = f.government || {}, D = G.decisions || [], E = G.elections || []; if (!D.length && !E.length) return null;
    var s = el("section"); s.appendChild(el("h3", null, "Government"));
    if (D.length) {
      var ul = el("ul");
      D.slice(0, 10).forEach(function (n) {
        var li = el("li"); li.appendChild(link(n.title, n.url)); li.appendChild(el("div", null, n.what));
        li.appendChild(meta([el("span", "avr-chip", n.stage), n.money_cr ? "Rs " + num(n.money_cr, 0) + " crore" : null, (n.sectors || []).join(", "), n.level, n.source, n.date]));
        ul.appendChild(li);
      });
      s.appendChild(ul);
    }
    if (E.length) {
      s.appendChild(el("p", "avr-sub", "Elections ahead"));
      var ue = el("ul");
      E.forEach(function (e) { var li = el("li"); li.appendChild(el("b", null, e.where)); li.appendChild(meta([e.type, e.expected, e.promises.length ? e.promises.length + " promise(s) on record" : null])); ue.appendChild(li); });
      s.appendChild(ue);
    }
    return s;
  }

  function calendar(f) {
    var C = f.calendar || []; if (!C.length) return null;
    var s = el("section"), w = el("div", "avr-wrap"), t = el("table"), h = t.insertRow();
    s.appendChild(el("h3", null, "Coming up"));
    ["Date", "Company", "Event", "What"].forEach(function (x) { h.appendChild(el("th", null, x)); });
    C.slice(0, 20).forEach(function (c) { var tr = t.insertRow(); [day(c.date), c.symbol || c.company, c.event, c.what].forEach(function (x) { tr.appendChild(el("td", null, x)); }); });
    w.appendChild(t); s.appendChild(w); return s;
  }

  function xdesk(f) {
    var X = f.x_desk || []; if (!X.length) return null;
    var s = el("section"), ul = el("ul"); s.appendChild(el("h3", null, "From our X feed"));
    X.slice(0, 10).forEach(function (x) { var li = el("li"); li.appendChild(el("div", "avr-pre", x.text)); li.appendChild(meta([when(x.time), link("View on X", x.url)])); ul.appendChild(li); });
    s.appendChild(ul); return s;
  }

  var PARTS = {live: live, market: market, business: business, government: government, calendar: calendar, x: xdesk};

  function render(host, f, L) {
    var root = el("div", "avr"), wanted = (host.getAttribute("data-sections") || "live,market,business,government,calendar,x").split(",");
    wanted.forEach(function (k) { var fn = PARTS[k.trim()]; var part = fn && (k.trim() === "live" ? fn(f, L, host) : f && fn(f)); if (part) root.appendChild(part); });
    if (!root.firstChild) { host.textContent = "Market data is unavailable right now."; return; }
    var src = f || L;
    root.appendChild(el("p", "avr-note", (f ? "Market data updated " + when(f.built_at) + ". " : "") + src.disclaimer));
    host.replaceChildren(root);
  }

  function getJSON(url) {
    return fetch(url, {cache: "no-cache"}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (j.version !== 1) throw new Error("feed version"); return j; }).catch(function () { return null; });
  }

  function start() {
    if (!document.getElementById("avr-style")) { var st = document.createElement("style"); st.id = "avr-style"; st.textContent = CSS; document.head.appendChild(st); }
    document.querySelectorAll("[data-avron-radar]").forEach(function (host) {
      if (host.__avrStarted) return;
      host.__avrStarted = true;
      var feedUrl = host.getAttribute("data-feed") || DEFAULT_FEED, liveUrl = host.getAttribute("data-live-feed") || DEFAULT_LIVE;
      var wantsLive = (host.getAttribute("data-sections") || "live").indexOf("live") !== -1, F = null, L = null;
      if (!host.firstChild) host.textContent = "Loading market data…";
      function draw() { if (F || L) render(host, F, L); else host.textContent = "Market data is unavailable right now."; }
      Promise.all([getJSON(feedUrl), wantsLive ? getJSON(liveUrl) : null]).then(function (r) { F = r[0]; L = r[1]; draw(); });
      if (wantsLive) setInterval(function () { if (!document.hidden) getJSON(liveUrl).then(function (j) { if (j) { L = j; draw(); } }); }, LIVE_EVERY);
      setInterval(function () { if (!document.hidden) getJSON(feedUrl).then(function (j) { if (j) { F = j; draw(); } }); }, FEED_EVERY);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
