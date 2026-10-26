# Scene animation cues, local seconds inside each scene, set from the Tia VO word times (timeline.json).
# Exec'd by gen_scenes.py; replaces each scene's JS. CUES is also written to ../cues.json for the score.
import json as _json
CUES = {
 "s1": {"grey": 2.2, "paused": 3.14, "tease": 3.6, "push": 4.4},
 "s2": {"date": 0.05, "num": 0.5, "fh": 1.7, "rules": 4.2, "a": 5.3, "b": 6.15, "c": 6.95, "src": 7.35, "why": 7.6},
 "s3": {"bar": 0.0, "t1": 0.9, "line": 2.1, "notes": 2.3, "t3": 2.6, "fly": 5.3, "rate": 8.95, "t4": 9.4, "rule": 10.7,
        "duty": 11.85, "imp": 15.4, "src2": 15.9},
 "s4": {"h": 0.0, "src": 0.6, "rules": 0.8, "a": 1.35, "sa": 2.9, "b": 3.45, "sb": 3.85, "c": 4.75, "sc": 6.65, "d": 7.7, "sd": 8.05},
 "s5": {"year": 0.0, "sub": 0.55, "src": 0.9, "rules": 1.4, "a": 1.9, "av": 2.42, "b": 2.95, "bv": 3.2, "c": 4.0, "cv": 5.5, "d": 6.2, "e": 8.0},
 "s6": {"flood": 0.0, "shrink": 0.55, "h": 0.95, "r1": 1.5, "r2": 2.0, "r3": 2.5, "cta": 3.0, "fine": 3.3},
}
c = CUES
JS = {
"s1": f"""
    rise("#s1-tease", {c['s1']['tease']});
    tl.fromTo("#s1-btn", {{ backgroundColor: "#e3b04b", color: "#16140f" }}, {{ backgroundColor: "#3a362e", color: "#b3ac9f", duration: 0.25, ease: "power2.out" }}, {c['s1']['grey']});
    stamp("#s1-stamp", {c['s1']['paused']});
    tl.fromTo("#s1-phone", {{ scale: 1 }}, {{ scale: 0.94, duration: 0.8, ease: "power3.inOut" }}, {c['s1']['push']});
""",
"s2": f"""
    rise("#s2-l2", {c['s2']['date']});
    rise("#s2-num", {c['s2']['num']}, 0.6); rise("#s2-l1", {c['s2']['fh']});
    tl.fromTo("#s2-r0, #s2-r1, #s2-r2, #s2-r3", {{ scaleX: 0, transformOrigin: "0 50%" }}, {{ scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }}, {c['s2']['rules']});
    rise("#s2-a", {c['s2']['a']} - 0.25); stamp("#s2-sa", {c['s2']['a']});
    rise("#s2-b", {c['s2']['b']} - 0.25); stamp("#s2-sb", {c['s2']['b']});
    rise("#s2-c", {c['s2']['c']} - 0.25); stamp("#s2-sc", {c['s2']['c']});
    show("#s2-src", {c['s2']['src']});
    rise("#s2-why", {c['s2']['why']});
""",
"s3": f"""
    tl.fromTo("#s3-bar", {{ yPercent: 40, opacity: 0 }}, {{ yPercent: 0, opacity: 1, duration: 0.5, ease: "power4.out" }}, {c['s3']['bar']});
    rise("#s3-t1", {c['s3']['t1']}); rise("#s3-t2", {c['s3']['t1']} + 0.15);
    show("#s3-in, #s3-out", {c['s3']['line']});
    tl.fromTo("#s3-line", {{ scaleY: 0, transformOrigin: "50% 0" }}, {{ scaleY: 1, duration: 0.5, ease: "power3.inOut" }}, {c['s3']['line']});
    ["#s3-n1", "#s3-n2", "#s3-n3"].forEach((n, i) => {{
      tl.fromTo(n, {{ x: 72 + i * 230, opacity: 0 }}, {{ x: 72 + i * 230, opacity: 1, duration: 0.2 }}, {c['s3']['notes']} + i * 0.1);
      tl.to(n, {{ x: 1180 + i * 60, duration: 1.4, ease: "power3.in" }}, {c['s3']['fly']} + i * 0.15);
    }});
    rise("#s3-t3", {c['s3']['t3']});
    rise("#s3-rate", {c['s3']['rate']}, 0.6); rise("#s3-t4", {c['s3']['t4']}); show("#s3-src1", {c['s3']['t4']} + 0.3);
    tl.fromTo("#s3-r1", {{ scaleX: 0, transformOrigin: "0 50%" }}, {{ scaleX: 1, duration: 0.5, ease: "power3.inOut" }}, {c['s3']['rule']});
    rise("#s3-d", {c['s3']['duty']}); show("#s3-dt", {c['s3']['duty']} + 0.2);
    rise("#s3-m", {c['s3']['imp']}); show("#s3-mt", {c['s3']['imp']} + 0.2); show("#s3-src2", {c['s3']['src2']});
""",
"s4": f"""
    rise("#s4-h1", {c['s4']['h']}); rise("#s4-h2", {c['s4']['h']} + 0.15);
    show("#s4-src", {c['s4']['src']});
    tl.fromTo("#s4-r0, #s4-r1, #s4-r2, #s4-r3, #s4-r4", {{ scaleX: 0, transformOrigin: "0 50%" }}, {{ scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }}, {c['s4']['rules']});
    rise("#s4-a", {c['s4']['a']}); stamp("#s4-sa", {c['s4']['sa']});
    rise("#s4-b", {c['s4']['b']}); stamp("#s4-sb", {c['s4']['sb']});
    rise("#s4-c", {c['s4']['c']}); stamp("#s4-sc", {c['s4']['sc']});
    rise("#s4-d", {c['s4']['d']}); stamp("#s4-sd", {c['s4']['sd']});
""",
"s5": f"""
    rise("#s5-year", {c['s5']['year']}, 0.6); rise("#s5-sub", {c['s5']['sub']}); show("#s5-src", {c['s5']['src']});
    tl.fromTo("#s5-r0, #s5-r1, #s5-r2, #s5-r3", {{ scaleX: 0, transformOrigin: "0 50%" }}, {{ scaleX: 1, duration: 0.5, ease: "power3.inOut", stagger: 0.06 }}, {c['s5']['rules']});
    rise("#s5-a", {c['s5']['a']}); rise("#s5-av", {c['s5']['av']});
    rise("#s5-b", {c['s5']['b']}); rise("#s5-bv", {c['s5']['bv']});
    rise("#s5-c", {c['s5']['c']}); stamp("#s5-cv", {c['s5']['cv']});
    rise("#s5-d", {c['s5']['d']});
    rise("#s5-e", {c['s5']['e']});
""",
"s6": f"""
    tl.fromTo("#s6-flood", {{ clipPath: "inset(840px 420px 840px 420px round 120px)" }},
      {{ clipPath: "inset(0px 0px 0px 0px round 0px)", duration: 0.35, ease: "power3.in" }}, {c['s6']['flood']});
    tl.to("#s6-flood", {{ clipPath: "inset(200px 72px 600px 72px round 28px)", duration: 0.55, ease: "power3.out" }}, {c['s6']['shrink']});
    rise("#s6-h", {c['s6']['h']}, 0.6);
    show("#s6-1", {c['s6']['r1']}); show("#s6-2", {c['s6']['r2']}); show("#s6-3", {c['s6']['r3']});
    show("#s6-cta", {c['s6']['cta']}); show("#s6-fine", {c['s6']['fine']});
""",
}
S = {k: (v[0], v[1], JS[k]) for k, v in S.items()}
_tl = _json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "timeline.json")))
_starts = {f"s{i+1}": b["start"] if i else 0.0 for i, b in enumerate(_tl["beats"])}
_json.dump({"sceneStart": _starts, "abs": {k: {n: round(_starts[k] + t, 3) for n, t in v.items()} for k, v in CUES.items()}},
           open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cues.json"), "w"), indent=1)
