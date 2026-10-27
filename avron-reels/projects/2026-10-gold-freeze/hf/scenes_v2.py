# v2 layer: photos (free licence, see ../research/image_sources.json) and techniques from the prompt library.
#   Motion Graphic Two: circle opens out of the button into the next scene; 3D carousel of real photos with floor
#     reflection and a whip between cards; a 3-word ticker; motion blur comes from the subframe render.
#   Motion Graphic Ten: an iris (hexagonal aperture) opens onto the 2013 photo.
# Exec'd from scene_cues.py after S, CUES and JS exist. Patches S in place.

def patch(k, css_add="", html_from=None, html_to=None, html_prepend="", html_append="", js_add=""):
    css, html, js = S[k]
    if html_from is not None:
        assert html_from in html, (k, html_from[:60])
        html = html.replace(html_from, html_to)
    S[k] = (css + css_add, html_prepend + html + html_append, js + js_add)

BG = '<img id="{id}" class="abs bgimg" src="assets/img/{src}" style="left:0; top:0; width:1080px; height:1920px; object-fit:cover;" data-layout-ignore>'
c = CUES

# ---------- s1: jewellery photo under the hook, slow push; the circle drop out of the Start SIP button
c["s1"].update({"drop": 5.12})
patch("s1",
      css_add="""
    #s1-drop { position: absolute; left: 450px; top: 1038px; width: 120px; height: 120px; border-radius: 50%; background: #16140f; }
""",
      html_prepend="\n    " + BG.format(id="s1-bg", src="jewellery_bg.jpg") + "\n",
      html_append='\n    <div id="s1-drop" data-layout-ignore></div>\n',
      js_add=f"""
    tl.fromTo("#s1-bg", {{ scale: 1.0 }}, {{ scale: 1.06, duration: 5.68, ease: "none" }}, 0);
    tl.fromTo("#s1-drop", {{ scale: 0 }}, {{ scale: 34, duration: 0.5, ease: "power3.in" }}, {c['s1']['drop']});
""")

# ---------- s3: the recipe as a 3D carousel of real photos: gold -> paid in dollars (port) -> rupee under pressure
c["s3"].update({"whip1": 2.45, "whip2": 6.55})
s3_old_top = S["s3"][1]
start = s3_old_top.index('<div class="abs" id="s3-bar">')
end = s3_old_top.index('<div class="abs" style="left:72px; top:790px;">')
S["s3"] = (S["s3"][0], s3_old_top[:start] + """<div class="abs" id="s3-stage" style="left:0; top:170px; width:1080px; height:600px;" data-layout-allow-overflow data-layout-ignore>
      <div id="s3-ring">
        <div class="s3-card" id="s3-c0" style="transform: rotateY(0deg) translateZ(560px);"><img src="assets/img/card_goldbar.jpg"><b>Gold</b></div>
        <div class="s3-card" id="s3-c1" style="transform: rotateY(120deg) translateZ(560px);"><img src="assets/img/card_port.jpg"><b>Import · $ mein payment</b></div>
        <div class="s3-card" id="s3-c2" style="transform: rotateY(240deg) translateZ(560px);"><img src="assets/img/card_rupee.jpg"><b>Rupya dabav mein</b></div>
      </div>
    </div>
    <div class="abs" style="left:72px; top:700px; width:828px; height:62px;" data-layout-allow-overlap data-layout-allow-occlusion>
      <div class="mask abs" style="left:0; top:0;"><span class="body" id="s3-t1">Gold bahar se aata hai</span></div>
      <div class="mask abs" style="left:0; top:0;"><span class="body" id="s3-t3">Payment dollar mein</span></div>
      <div class="mask abs" style="left:0; top:0;"><span class="body" id="s3-t5">Jitna gold, utne dollar bahar</span></div>
    </div>
    """ + s3_old_top[end:], S["s3"][2])
patch("s3", css_add="""
    #s3-stage { perspective: 1700px; }
    #s3-ring { position: absolute; left: 180px; top: 40px; width: 720px; height: 480px; transform-style: preserve-3d; }
    .s3-card { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 20px; overflow: hidden;
               -webkit-box-reflect: below 10px linear-gradient(transparent 55%, rgba(0,0,0,0.22)); }
    .s3-card img { width: 720px; height: 480px; object-fit: cover; display: block; }
    .s3-card b { position: absolute; left: 24px; top: 20px; padding: 8px 16px; background: rgba(22,20,15,0.82); color: #f2eee6;
                 font-weight: 700; font-size: 34px; border-radius: 8px; }
""")
JS["s3"] = f"""
    tl.fromTo("#s3-ring", {{ rotationY: 0, z: -560 }}, {{ rotationY: 0, z: -560, duration: 0.01 }}, 0);
    tl.fromTo("#s3-stage", {{ yPercent: 8, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.5, ease: "power4.out" }}, {c['s3']['bar']});
    rise("#s3-t1", {c['s3']['t1']});
    tl.to("#s3-ring", {{ rotationY: -120, duration: 0.55, ease: "power3.inOut" }}, {c['s3']['whip1']});
    tl.to("#s3-t1", {{ yPercent: -105, duration: 0.3, ease: "power2.in" }}, {c['s3']['whip1']});
    rise("#s3-t3", {c['s3']['whip1']} + 0.3);
    tl.to("#s3-t3", {{ yPercent: -105, duration: 0.3, ease: "power2.in" }}, {c['s3']['fly']} - 0.3);
    rise("#s3-t5", {c['s3']['fly']});
    tl.to("#s3-ring", {{ rotationY: -240, duration: 0.55, ease: "power3.inOut" }}, {c['s3']['whip2']});
    rise("#s3-rate", {c['s3']['rate']}, 0.6); rise("#s3-t4", {c['s3']['t4']}); show("#s3-src1", {c['s3']['t4']} + 0.3);
    tl.fromTo("#s3-r1", {{ scaleX: 0, transformOrigin: "0 50%" }}, {{ scaleX: 1, duration: 0.5, ease: "power3.inOut" }}, {c['s3']['rule']});
    rise("#s3-d", {c['s3']['duty']}); show("#s3-dt", {c['s3']['duty']} + 0.2);
    rise("#s3-m", {c['s3']['imp']}); show("#s3-mt", {c['s3']['imp']} + 0.2); show("#s3-src2", {c['s3']['src2']});
"""
S["s3"] = (S["s3"][0], S["s3"][1], JS["s3"])

# ---------- s4: the 3-word ticker under the ledger once "rok sirf naye paise par" lands
c["s4"].update({"ticker": 5.6})
tick = " · ".join(["Purana SIP chalu", "Naya paisa band", "Gold ETF khula"] * 3)
patch("s4",
      css_add="""
    #s4-tick { position: absolute; left: 0; top: 1252px; width: 1080px; height: 66px; overflow: hidden; background: #e3b04b; }
    #s4-tick span { position: absolute; left: 0; top: 10px; white-space: nowrap; font-weight: 900; font-size: 40px; color: #16140f; letter-spacing: 0.01em; }
""",
      html_append=f'\n    <div id="s4-tick" data-layout-allow-overflow><span id="s4-tickt">{tick}</span></div>\n',
      js_add=f"""
    tl.fromTo("#s4-tick", {{ yPercent: 100, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.3, ease: "power3.out" }}, {c['s4']['ticker']});
    tl.fromTo("#s4-tickt", {{ x: 40 }}, {{ x: -1500, duration: 3.74, ease: "none" }}, {c['s4']['ticker']});
""")

# ---------- s5: an iris opens onto the RBI headquarters photo behind "2013"
c["s5"].update({"iris": 0.0})
patch("s5",
      css_add="""
    #s5-photo { position: absolute; inset: 0; clip-path: circle(0px at 540px 760px); }
    #s5-credit { position: absolute; left: 72px; top: 1292px; }
""",
      html_prepend='\n    <div id="s5-photo" data-layout-ignore>' + BG.format(id="s5-bg", src="rbi_bg.jpg") + "</div>\n",
      html_append='\n    <div class="tag" id="s5-credit" style="font-size:28px;">Photo: RBI HQ Mumbai · DesiBoy101 · CC BY 4.0</div>\n',
      js_add=f"""
    const iris = {{ r: 0, a: 0 }};
    const hex = () => {{
      const pts = [];
      for (let i = 0; i < 6; i++) {{ const t = (iris.a + i * 60) * Math.PI / 180; pts.push(`${{540 + iris.r * Math.cos(t)}}px ${{760 + iris.r * Math.sin(t)}}px`); }}
      document.querySelector("#s5-photo").style.clipPath = `polygon(${{pts.join(",")}})`;
    }};
    tl.fromTo(iris, {{ r: 0, a: 0 }}, {{ r: 1500, a: 60, duration: 0.7, ease: "power3.out", onUpdate: hex }}, {c['s5']['iris']});
    tl.fromTo("#s5-bg", {{ scale: 1.08 }}, {{ scale: 1.0, duration: 10, ease: "none" }}, 0);
    show("#s5-credit", {c['s5']['src']});
""")

# ---------- s6: photo credits on the card
patch("s6",
      html_from="Apne AMC ka notice check karo · Education only, not advice · AVRON is not SEBI-registered",
      html_to="Apne AMC ka notice check karo · Education only, not advice · AVRON is not SEBI-registered<br>Photos: rawpixel (CC0) · DesiBoy101 / Wikimedia Commons (CC BY 4.0)")
