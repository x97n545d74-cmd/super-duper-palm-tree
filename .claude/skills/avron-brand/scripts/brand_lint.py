"""AVRON brand v2 gate: fails a reel that drifts from brand/BRAND.md.

  python3 .claude/skills/avron-brand/scripts/brand_lint.py avron-reels/src/projects/<id> [--audio avron-reels/scripts/score_<id>.py]

Checks the reel's code (every .ts/.tsx under the project folder) and, optionally, its audio script.
Exit 1 on any FAIL. WARN lines need a written reason in the project's BRAND_CHECK.md.
"""
import argparse
import pathlib
import re
import sys

FAIL = [
    # retired looks and other projects' kits
    (r"from\s+[\"']\.\./(musk|anchor|footy|dcpharma|thali|fuel-gap|shart|viviana2?|smartphone|silver|swiggy)/", "imports another reel's kit; build from src/engine/ui"),
    (r"\b(BlueGrid|GreenTunnel|Tunnel|Sunburst|Burst|Collage|GraphPaper|Comic|Orbits|Notif|Desk)\b", "retired reference look (BRAND.md §6)"),
    # motion
    (r"outBack|easeOutBack|backOut", "bouncy easing is banned"),
    (r"\bspring\(\s*\{(?![^}]*config)", "spring() without a config uses Remotion's bouncy default; use motion.springs"),
    (r"Easing\.bezier\(|cubic-bezier\(", "hand-written curve; use curve.* from src/brand/ui.ts"),
    (r"\b(shake|wiggle)\w*\s*[(=]", "camera shake is banned"),
    # look
    (r"textShadow\s*:\s*`?[\"']?0 0 \d", "glow (text-shadow halo) is banned"),
    (r"boxShadow\s*:[^,\n]*0 0 \d+px[^,\n]*(rgba\((?!0,\s*0,\s*0)|#[0-9a-fA-F])", "coloured glow box-shadow is banned"),
    (r"#D97757|#DA7756|#CC785C", "Claude orange"),
    (r"(?i)terminal|claude code|prompt ?box|chat ?bubble", "terminals and chat/prompt UIs are banned on AVRON"),
    (r"backgroundClip\s*:\s*[\"']text", "gradient text is banned"),
]
WARN = [
    (r"#[0-9a-fA-F]{6}\b", "raw hex colour: use ui.* tokens (allowed only with a reason)"),
    (r"opacity\s*:\s*[^,}]*\b(flash|strobe)", "possible flash frame"),
    (r"fontFamily\s*:\s*[\"'](?!.*(Inter|JetBrains))", "font outside Inter / Inter Display / JetBrains Mono"),
]
REQUIRED = [
    ("engine/ui", "uses the UI kit (src/engine/ui)"),
    ("<Shell", "signature move 1: Shell bar"),
    ("<Cursor", "signature move 3: AVRON cursor"),
    ("<Receipt", "signature move 5: at least one receipt"),
    ("<Poll", "signature move 7: poll end card"),
    ("<Saved", "signature move 7: Saved to AVRON Watchlist"),
    ("<Source", "source chips under numbers"),
    ("<Disclaimer", "disclaimer line on the end card"),
]
AUDIO_FAIL = [
    # SFX generators only; a synthesised music bed is still allowed until a music decision is made
    (r"def (whoosh|click|dtick|riser|impact|rustle|buzz|swoosh|swish|glitch|pop|thump|boom|sfx)\w*\(", "synthesised SFX: AVRON uses the ElevenLabs kit only (public/sfx/avron_kit_v1)"),
]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--audio", default=None)
    a = ap.parse_args()
    root = pathlib.Path(a.project)
    files = [f for f in root.rglob("*") if f.suffix in (".ts", ".tsx")]
    if not files:
        sys.exit(f"no .ts/.tsx files under {root}")
    fails, warns = [], []
    corpus = ""
    for f in files:
        src = f.read_text()
        corpus += src
        for i, line in enumerate(src.splitlines(), 1):
            if line.strip().startswith(("//", "*", "/*")):
                continue
            for pat, why in FAIL:
                if re.search(pat, line):
                    fails.append(f"{f}:{i}  {why}  | {line.strip()[:100]}")
            for pat, why in WARN:
                if re.search(pat, line):
                    warns.append(f"{f}:{i}  {why}")
    for needle, why in REQUIRED:
        if needle not in corpus:
            fails.append(f"missing: {why}")
    if a.audio:
        for i, line in enumerate(pathlib.Path(a.audio).read_text().splitlines(), 1):
            for pat, why in AUDIO_FAIL:
                if re.search(pat, line):
                    fails.append(f"{a.audio}:{i}  {why}")
                    break
        if "avron_kit_v1" not in pathlib.Path(a.audio).read_text():
            warns.append(f"{a.audio}: does not reference public/sfx/avron_kit_v1 (OK only if the reel ships VO + music, no SFX)")
    for w in warns:
        print("WARN", w)
    for x in fails:
        print("FAIL", x)
    print(f"\n{len(fails)} fail, {len(warns)} warn")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
