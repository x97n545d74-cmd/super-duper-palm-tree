# Insta Reel: AVRON page (prompt library)

Saved reel prompts for the AVRON Instagram page. The user adds more over time.

**Rule (user, 2026-10-26):** every time we start a new reel, ask the user first whether to bring this folder's prompts into the new project, and which one. Don't apply one without asking.

| # | Name | What it is | Reference render / needs |
|---|---|---|---|
| 1 | [Motion Graphic One](motion-graphic-one/PROMPT.md) | AVRON Pro master prompt + reel blueprint: 6-step 40 s finance reel (hook, context, data, split, central bank, real-return + CTA), gold/red/green colour code, dark synth BGM, glitch/whoosh/beat-drop SFX | `deliverables/2026-10-thali/AVRON_thali_blueprint_10s_silent.mp4` (first 10 s, graphics only, composition `ThaliBlueprint10`) |
| 2 | [Motion Graphic Two](motion-graphic-two/PROMPT.md) | 20 s product launch film, 10 bars at 120 BPM: hook on the beat, circle match cut, scan-line wall, 3D carousel whip, phone + flip panel, big stats on push cuts, ticker, logo reveal. Also AVRON's default motion direction (minimal, one accent, no glow/shake). | Needs: product, 3–5 UI moments, accent colour, owned clips, royalty-free song |
| 3 | [Motion Graphic Three](motion-graphic-three/PROMPT.md) | "Ultracode × Opus 5.5" X-post animation: Claude Code terminal → ultracode effort → explosion into a film set with Claude-icon characters. | Needs: the user's two reference videos; check Anthropic brand terms |
| 4 | [Motion Graphic Four](motion-graphic-four/PROMPT.md) | ~30 s portfolio showreel by a pro motion designer: research current motion/sound trends, critique the plan, every frame matters, go crazy. | Needs: the portfolio and rights to it |
| 5 | [Motion Graphic Five](motion-graphic-five/PROMPT.md) | Dynamic 15 s motion graphics for AIsa. Go all out. | Needs: what AIsa is, brand assets, format |
| 6 | [Motion Graphic Six](motion-graphic-six/PROMPT.md) | 30 s pitch video for @chaindotwtf. | Needs: what it is, audience, assets, sourced traction |
| 7 | [Motion Graphic Seven](motion-graphic-seven/PROMPT.md) | Launch video for MotionSites AI hitting 1M monthly visitors 8 months after launch. | Needs: source for the 1M number, product info, assets |
| 8 | [Viral Reel Engine](viral-reel-engine/PROMPT.md) | AVRON Autonomous Viral Reel Engine, the master loop: deconstruct the brief, verify facts, 10 scored hooks, up to 8 improvement rounds, adversarial critique, then a 10-part 60 s pack (angle, hook, timed production table, motion and SFX direction, retention map, verification report, scores, clean VO, editor's checklist). Runs as the `avron-reel-engine` skill (`.claude/skills/avron-reel-engine/`). | Needs: a brief. Works with any of 1–7 for the look |
| 9 | [Script method](script-method/PROMPT.md) | **The user's script-building method (2026-10-28), used on every AVRON script:** audience research (10 problems, frustrations, desired outcomes, repeated questions, mistakes, objections; emotional reasons; audience phrases), then HOOK → VALUE → SOLUTION → CTA, with the CTA matched to ONE reel goal (followers, comments, saves, shares, leads). Wired into the `avron-reel-engine` skill as Phase 0.5. | Needs: a topic and the reel goal |

## Brand v2 note (2026-10-28)
For AVRON reels these prompts supply story structure and timing only. Their looks are translated into brand v2 (`../brand/BRAND.md`). #3, #5, #6 and #7 (Claude/AI products and client pitches) are not brought into AVRON reels by default; keep them for client work.

## Adding a prompt
New folder `<name>/PROMPT.md` with the prompt verbatim, plus a row in the table above.
