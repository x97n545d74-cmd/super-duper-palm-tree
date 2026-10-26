import sys, os
OUT = sys.argv[1]
BASE = """
    #root { position: absolute; inset: 0; font-family: Inter, sans-serif; color: #f2eee6; }
    #root .abs { position: absolute; }
    #root .mask { display: block; overflow: hidden; padding-bottom: 0.08em; }
    #root .mask > span { display: block; }
    #root .disp { font-weight: 900; font-size: 132px; letter-spacing: -0.03em; line-height: 0.95; }
    #root .body { font-weight: 700; font-size: 46px; letter-spacing: -0.01em; line-height: 1.15; }
    #root .tag { font-weight: 400; font-size: 28px; color: rgba(242,238,230,0.6); }
    #root .gold { color: #e3b04b; }
    #root .red { color: #e5484d; }
    #root .green { color: #3dbe7a; }
    #root .rule { height: 2px; background: rgba(242,238,230,0.18); }
    #root .stamp { display: inline-block; font-weight: 900; font-size: 40px; letter-spacing: 0.04em; padding: 6px 18px;
                   border: 6px solid #e5484d; color: #e5484d; border-radius: 4px; transform: rotate(-4deg); }
    #root .stamp.ok { border-color: #3dbe7a; color: #3dbe7a; }
"""
def scene(sid, css, html, js):
    return f"""<template>
  <style>{BASE}{css}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1080" data-height="1920">
{html}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    const rise = (sel, at, d = 0.5) => tl.fromTo(sel, {{ yPercent: 105 }}, {{ yPercent: 0, duration: d, ease: "power4.out" }}, at);
    const stamp = (sel, at) => tl.fromTo(sel, {{ opacity: 0, scale: 1.15 }}, {{ opacity: 1, scale: 1, duration: 0.12, ease: "expo.out" }}, at);
    const show = (sel, at, d = 0.3) => tl.fromTo(sel, {{ opacity: 0 }}, {{ opacity: 1, duration: d, ease: "power2.out" }}, at);
{js}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""
S = {}
# ---------- S1 hook 0-3
S["s1"] = ("""
    #s1-phone { left: 210px; top: 560px; width: 600px; height: 760px; border: 18px solid #2b2822; border-radius: 72px; background: #0e0d0a; }
    #s1-screen { position: absolute; inset: 40px 40px 40px 40px; }
    #s1-btn { position: absolute; left: 0; right: 0; top: 420px; height: 120px; border-radius: 24px; background: #e3b04b; color: #16140f;
              font-weight: 900; font-size: 48px; display: flex; align-items: center; justify-content: center; }
    #s1-stamp { position: absolute; left: 60px; top: 560px; font-size: 52px; }
""", """
    <div class="abs" style="left:72px; top:230px; width:900px;">
      <div class="disp" id="s1-h1">Gold SIP</div>
      <div class="disp gold" id="s1-h2">band?</div>
    </div>
    <div class="abs" style="left:72px; top:486px; width:828px;"><div class="mask"><span class="body" id="s1-tease" style="font-size:40px;">Aur 2013 mein bhi yahi hua tha</span></div></div>
    <div class="abs" id="s1-phone">
      <div id="s1-screen">
        <div class="tag" style="font-size:30px;">Mutual fund app</div>
        <div class="body" style="margin-top:18px;">Gold ETF<br>Fund of Funds</div>
        <div class="rule" style="margin-top:36px;"></div>
        <div class="tag" style="margin-top:28px; font-size:30px;">SIP amount</div>
        <div class="body" style="margin-top:8px;">₹2,000 / month</div>
        <div id="s1-btn">Start SIP</div>
        <div id="s1-stamp" class="stamp">PAUSED</div>
      </div>
    </div>
""", """
    tl.fromTo("#s1-btn", { backgroundColor: "#e3b04b", color: "#16140f" }, { backgroundColor: "#3a362e", color: "#7d776b", duration: 0.25, ease: "power2.out" }, 1.0);
    stamp("#s1-stamp", 1.15);
    tl.fromTo("#s1-phone", { scale: 1 }, { scale: 0.94, duration: 0.6, ease: "power3.inOut" }, 2.35);
""")
# ---------- S2 context 3-10
S["s2"] = ("""
    #s2-num { font-weight: 900; font-size: 360px; letter-spacing: -0.05em; line-height: 0.85; }
    .s2-row { position: absolute; left: 72px; width: 828px; height: 112px; display: flex; align-items: center; justify-content: space-between; }
""", """
    <div class="abs" style="left:72px; top:220px;">
      <div class="mask"><span id="s2-num" class="gold">17</span></div>
    </div>
    <div class="abs" style="left:520px; top:300px; width:400px;">
      <div class="mask"><span class="body" id="s2-l1">fund houses</span></div>
      <div class="mask"><span class="body" id="s2-l2">16 Oct se</span></div>
    </div>
    <div class="abs rule" style="left:72px; top:700px; width:828px;" id="s2-r0"></div>
    <div class="s2-row" style="top:720px;"><div class="mask"><span class="body" id="s2-a">Naya SIP</span></div><div class="stamp" id="s2-sa">BAND</div></div>
    <div class="abs rule" style="left:72px; top:842px; width:828px;" id="s2-r1"></div>
    <div class="s2-row" style="top:862px;"><div class="mask"><span class="body" id="s2-b">Lump sum</span></div><div class="stamp" id="s2-sb">BAND</div></div>
    <div class="abs rule" style="left:72px; top:984px; width:828px;" id="s2-r2"></div>
    <div class="s2-row" style="top:1004px;"><div class="mask"><span class="body" id="s2-c">Switch-in</span></div><div class="stamp" id="s2-sc">BAND</div></div>
    <div class="abs rule" style="left:72px; top:1126px; width:828px;" id="s2-r3"></div>
    <div class="abs tag" style="left:72px; top:1150px;" id="s2-src">Source: AMC notices, 15–16 Oct 2026</div>
    <div class="abs" style="left:72px; top:1210px; width:828px;">
      <div class="mask"><span class="body" id="s2-why" style="font-size:40px;">Notice mein wajah nahi · Reports: SEBI se charcha ke baad</span></div>
    </div>
""", """
    rise("#s2-num", 0.1, 0.6);
    rise("#s2-l1", 0.4); rise("#s2-l2", 0.55);
    tl.fromTo("#s2-r0, #s2-r1, #s2-r2, #s2-r3", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }, 1.6);
    rise("#s2-a", 2.0); stamp("#s2-sa", 2.3);
    rise("#s2-b", 2.45); stamp("#s2-sb", 2.75);
    rise("#s2-c", 2.9); stamp("#s2-sc", 3.2);
    show("#s2-src", 3.4);
    rise("#s2-why", 4.6);
""")
# ---------- S3 why 10-22
S["s3"] = ("""
    #s3-bar { left: 72px; top: 230px; width: 400px; height: 170px; }
    #s3-bar .top { position:absolute; left:40px; right:40px; top:0; height:60px; background:#f0c766; clip-path: polygon(8% 0, 92% 0, 100% 100%, 0 100%); }
    #s3-bar .front { position:absolute; left:0; right:0; top:60px; height:110px; background:#d19d38; display:flex; align-items:center; justify-content:center;
                     font-weight:900; font-size:40px; color:#8a6420; letter-spacing:0.08em; }
    #s3-bar .shadow { position:absolute; left:20px; right:20px; top:150px; height:40px; border-radius:50%; background:rgba(0,0,0,0.45); filter: blur(14px); z-index:-1; }
    #s3-line { left: 760px; top: 470px; width: 0; height: 300px; border-left: 4px dashed rgba(242,238,230,0.45); }
    .s3-note { position: absolute; top: 0; width: 210px; height: 96px; border-radius: 8px; background: #6f8a6a; color: #e8efe2;
               font-weight: 900; font-size: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; }
    .s3-note i { display:block; width:44px; height:56px; border-radius:50%; border:4px solid #e8efe2; }
    #s3-rate { font-weight: 900; font-size: 190px; letter-spacing: -0.04em; line-height: 0.9; }
    .s3-row { position: absolute; left: 72px; width: 828px; display: flex; align-items: baseline; justify-content: space-between; }
""", """
    <div class="abs" id="s3-bar"><div class="shadow"></div><div class="top"></div><div class="front">999.9</div></div>
    <div class="abs" style="left:510px; top:240px; width:400px;">
      <div class="mask"><span class="body" id="s3-t1">Gold bahar</span></div>
      <div class="mask"><span class="body" id="s3-t2">se aata hai</span></div>
    </div>
    <div class="abs tag" style="left:72px; top:470px;" id="s3-in">INDIA</div>
    <div class="abs tag" style="left:790px; top:470px;" id="s3-out">BAHAR</div>
    <div class="abs" id="s3-line"></div>
    <div class="abs" style="left:0; top:540px; width:1080px; height:110px;" data-layout-allow-overflow>
      <div class="s3-note" id="s3-n1">$<i></i></div>
      <div class="s3-note" id="s3-n2">$<i></i></div>
      <div class="s3-note" id="s3-n3">$<i></i></div>
    </div>
    <div class="abs" style="left:72px; top:680px; width:700px;">
      <div class="mask"><span class="body" id="s3-t3">Payment dollar mein</span></div>
    </div>
    <div class="abs" style="left:72px; top:790px;">
      <div class="mask"><span id="s3-rate" class="red">₹95.22</span></div>
    </div>
    <div class="abs" style="left:72px; top:980px; width:828px;">
      <div class="mask"><span class="body" id="s3-t4">per dollar · 26 Oct</span></div>
      <div class="tag" id="s3-src1" style="margin-top:6px;">Source: PTI, provisional close</div>
    </div>
    <div class="abs rule" style="left:72px; top:1110px; width:828px;" id="s3-r1"></div>
    <div class="s3-row" style="top:1128px;"><div class="mask"><span class="body" id="s3-d">Import duty 6% → <b class="gold">15%</b></span></div><div class="tag" id="s3-dt">13 May 2026</div></div>
    <div class="s3-row" style="top:1208px;"><div class="mask"><span class="body" id="s3-m">Gold imports <b class="red">−27%</b></span></div><div class="tag" id="s3-mt">Apr–Sep 2026</div></div>
    <div class="abs tag" style="left:72px; top:1284px;" id="s3-src2">Source: customs notifications, commerce ministry</div>
""", """
    tl.fromTo("#s3-bar", { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power4.out" }, 0.1);
    rise("#s3-t1", 0.4); rise("#s3-t2", 0.55);
    show("#s3-in, #s3-out", 1.8);
    tl.fromTo("#s3-line", { scaleY: 0, transformOrigin: "50% 0" }, { scaleY: 1, duration: 0.5, ease: "power3.inOut" }, 1.8);
    ["#s3-n1", "#s3-n2", "#s3-n3"].forEach((n, i) => {
      tl.fromTo(n, { x: 72 + i * 230, opacity: 0 }, { x: 72 + i * 230, opacity: 1, duration: 0.2 }, 2.3 + i * 0.1);
      tl.to(n, { x: 1180 + i * 60, duration: 1.4, ease: "power3.in" }, 3.4 + i * 0.15);
    });
    rise("#s3-t3", 2.6);
    rise("#s3-rate", 5.2, 0.6); rise("#s3-t4", 5.5); show("#s3-src1", 5.8);
    tl.fromTo("#s3-r1", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 7.6);
    rise("#s3-d", 7.9); show("#s3-dt", 8.1);
    rise("#s3-m", 9.4); show("#s3-mt", 9.6); show("#s3-src2", 9.9);
""")
# ---------- S4 what's open 22-30
S["s4"] = ("""
    .s4-row { position: absolute; left: 72px; width: 828px; height: 150px; display: flex; align-items: center; justify-content: space-between; }
""", """
    <div class="abs" style="left:72px; top:220px; width:900px;">
      <div class="mask"><span class="disp" id="s4-h1" style="font-size:112px;">Aapke SIP</span></div>
      <div class="mask"><span class="disp gold" id="s4-h2" style="font-size:112px;">par asar</span></div>
    </div>
    <div class="abs rule" style="left:72px; top:520px; width:828px;" id="s4-r0"></div>
    <div class="s4-row" style="top:530px;"><div class="mask"><span class="body" id="s4-a">Purana SIP</span></div><div class="stamp ok" id="s4-sa">CHALU</div></div>
    <div class="abs rule" style="left:72px; top:680px; width:828px;" id="s4-r1"></div>
    <div class="s4-row" style="top:690px;"><div class="mask"><span class="body" id="s4-b">Redemption</span></div><div class="stamp ok" id="s4-sb">CHALU</div></div>
    <div class="abs rule" style="left:72px; top:840px; width:828px;" id="s4-r2"></div>
    <div class="s4-row" style="top:850px;"><div class="mask"><span class="body" id="s4-c">Gold ETF<br><span class="tag">exchange par</span></span></div><div class="stamp ok" id="s4-sc" style="font-size:32px;">NAYI ROK NAHI</div></div>
    <div class="abs rule" style="left:72px; top:1000px; width:828px;" id="s4-r3"></div>
    <div class="s4-row" style="top:1010px;"><div class="mask"><span class="body gold" id="s4-d">Naya paisa</span></div><div class="stamp" id="s4-sd">BAND</div></div>
    <div class="abs rule" style="left:72px; top:1160px; width:828px;" id="s4-r4"></div>
    <div class="abs tag" style="left:72px; top:1190px; width:828px;" id="s4-src">Scheme ke hisaab se alag · apne AMC ka notice dekho</div>
""", """
    rise("#s4-h1", 0.1); rise("#s4-h2", 0.25);
    tl.fromTo("#s4-r0, #s4-r1, #s4-r2, #s4-r3, #s4-r4", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }, 1.0);
    rise("#s4-a", 1.6); stamp("#s4-sa", 1.9);
    rise("#s4-b", 2.6); stamp("#s4-sb", 2.9);
    rise("#s4-c", 3.6); stamp("#s4-sc", 3.9);
    rise("#s4-d", 5.4); stamp("#s4-sd", 5.7);
    show("#s4-src", 6.0);
""")
# ---------- S5 2013 30-37
S["s5"] = ("""
    #s5-year { font-weight: 900; font-size: 300px; letter-spacing: -0.05em; line-height: 0.85; }
    .s5-row { position: absolute; left: 72px; width: 828px; height: 110px; display: flex; align-items: center; justify-content: space-between; }
""", """
    <div class="abs" style="left:72px; top:220px;"><div class="mask"><span id="s5-year">2013</span></div></div>
    <div class="abs" style="left:72px; top:490px; width:828px;"><div class="mask"><span class="body" id="s5-sub">Rupya gira, tab bhi yahi hua</span></div></div>
    <div class="abs rule" style="left:72px; top:590px; width:828px;" id="s5-r0"></div>
    <div class="s5-row" style="top:600px;"><div class="mask"><span class="body" id="s5-a">Gold duty</span></div><div class="mask"><span class="body gold" id="s5-av">10%</span></div></div>
    <div class="abs rule" style="left:72px; top:710px; width:828px;" id="s5-r1"></div>
    <div class="s5-row" style="top:720px;"><div class="mask"><span class="body" id="s5-b">Import rule</span></div><div class="mask"><span class="body gold" id="s5-bv">80:20</span></div></div>
    <div class="abs rule" style="left:72px; top:830px; width:828px;" id="s5-r2"></div>
    <div class="s5-row" style="top:840px;"><div class="mask"><span class="body" id="s5-c">Ek gold fund</span></div><div class="stamp" id="s5-cv">BAND</div></div>
    <div class="abs rule" style="left:72px; top:950px; width:828px;" id="s5-r3"></div>
    <div class="abs" style="left:72px; top:980px; width:828px;"><div class="mask"><span class="body" id="s5-d">Rupya sambhla, phir fund khula</span></div></div>
    <div class="abs" style="left:72px; top:1090px; width:828px;">
      <div class="mask"><span class="disp" id="s5-e" style="font-size:72px;">2026: <span class="red">koi end date nahi</span></span></div>
    </div>
    <div class="abs tag" style="left:72px; top:1200px;" id="s5-src">Source: Govt reply (2014), Business Standard (Jun 2013), AMC notices</div>
""", """
    rise("#s5-year", 0.1, 0.6); rise("#s5-sub", 0.5);
    tl.fromTo("#s5-r0, #s5-r1, #s5-r2, #s5-r3", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }, 0.8);
    rise("#s5-a", 1.1); rise("#s5-av", 1.3);
    rise("#s5-b", 1.8); rise("#s5-bv", 2.0);
    rise("#s5-c", 2.5); stamp("#s5-cv", 2.8);
    rise("#s5-d", 3.6);
    rise("#s5-e", 5.0); show("#s5-src", 5.2);
""")
# ---------- S6 save card 37-44
S["s6"] = ("""
    #s6-flood { position: absolute; inset: 0; background: #e3b04b; }
    #s6-card { position: absolute; left: 72px; top: 200px; width: 936px; height: 1120px; padding: 64px 56px; color: #16140f; }
    #s6-card .rule { background: rgba(22,20,15,0.25); }
    .s6-row { display: flex; gap: 28px; align-items: flex-start; padding: 30px 0; }
    .s6-n { font-weight: 900; font-size: 64px; line-height: 1; width: 56px; }
    .s6-t { font-weight: 700; font-size: 44px; line-height: 1.15; }
    .s6-t b { font-weight: 900; }
""", """
    <div id="s6-flood" data-layout-ignore></div>
    <div id="s6-card">
      <div class="mask"><span class="disp" id="s6-h" style="font-size:88px; color:#16140f;">Aapke gold SIP<br>ka kya hoga</span></div>
      <div class="rule" style="margin-top:40px;"></div>
      <div class="s6-row" id="s6-1"><div class="s6-n">1</div><div class="s6-t">Purana SIP<br><b>chalu rahega</b></div></div>
      <div class="rule"></div>
      <div class="s6-row" id="s6-2"><div class="s6-n">2</div><div class="s6-t">Naya SIP, lump sum<br><b>band, notice tak</b></div></div>
      <div class="rule"></div>
      <div class="s6-row" id="s6-3"><div class="s6-n">3</div><div class="s6-t">Gold ETF, exchange par<br><b>koi nayi rok nahi</b></div></div>
      <div class="rule"></div>
      <div id="s6-cta" style="margin-top:36px; font-weight:900; font-size:48px;">Save karo · gold SIP wale dost ko bhejo</div>
      <div id="s6-fine" style="margin-top:28px; font-size:28px; line-height:1.35;">Apne AMC ka notice check karo · Education only, not advice · AVRON is not SEBI-registered</div>
    </div>
""", """
    tl.fromTo("#s6-flood", { clipPath: "inset(840px 420px 840px 420px round 120px)" },
      { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.35, ease: "power3.in" }, 0.0);
    tl.to("#s6-flood", { clipPath: "inset(200px 72px 600px 72px round 28px)", duration: 0.55, ease: "power3.out" }, 0.55);
    rise("#s6-h", 1.0, 0.6);
    show("#s6-1", 1.6); show("#s6-2", 2.0); show("#s6-3", 2.4);
    show("#s6-cta", 3.2); show("#s6-fine", 3.4);
""")
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'scene_cues.py')).read())
os.makedirs(OUT, exist_ok=True)
for sid, (css, html, js) in S.items():
    open(os.path.join(OUT, f"{sid}.html"), "w").write(scene(sid, css, html, js))
print("wrote", list(S))
