---
name: avron-brand
description: AVRON's locked brand v2, "finance as product UI": one look, one sound kit, seven signature moves, and a brand gate every AVRON reel must pass. Use it whenever you plan, design, storyboard, animate, score, mix, render, review or QC anything for the AVRON page (a reel, a cover, a Short, a style frame, a production table, the SFX), and whenever the reel engine reaches the visual or audio direction. Also use it when the user mentions brand identity, "looks like every other page", "looks low effort", "made with Claude", taste, consistency, the profile grid, sound effects or ElevenLabs SFX for AVRON, even if they don't name the skill. Not for @marketkibatt or client prompts in the library, which have their own looks.
---

# AVRON brand gate

The brand is written in `avron-reels/brand/BRAND.md`. Read it in full before you design anything for AVRON. This skill is the procedure that keeps every reel inside it.

**Why this skill exists.** In October 2026 an analyst reviewed the AVRON page and found that it looked low-effort and "made with Claude". Every reel had a different look, the content looked like every other Claude-made reel page, the SFX were synthetic, and there was no brand identity, which stops a page from growing. The user asked for Claude to be trained so this criticism never comes back. Every rule below answers one part of that review.

## The gate: run it at three points

### 1. Before the storyboard (design gate)

Write `projects/<id>/BRAND_CHECK.md` with:
- **Shell crumbs** for each beat (`Markets / … / …`) and the `Data as of` date.
- **Hook frame:** which number gets the crop-in pull-out, and the headline (≤ 6 words, Roman script).
- **Reel goal and script sections:** the ONE goal (followers / comments / saves / shares / leads) and where HOOK, VALUE, SOLUTION and CTA start (script method, prompt #9).
- **Signature moves:** where moves 1, 2, 3, 5 and 7 happen (timecodes); move 7 is the end card for that goal. Move 5 (the receipt) needs a claim-registry ID and the exact line or figure it shows.
- **Transitions:** list every cut. Only push, zoom-through, panel morph or bottom sheet are allowed.
- **Sound cue sheet:** each SFX by its kit name (`ui_tap`, `panel_open`, `whoosh_push`, `number_land`, `sonic_logo`, …), its timecode, and the VO gap it sits in. Check the density caps in BRAND.md §5.
- **Series** (Layer / Receipt / Screener or one the user named) and the cover title.

If the brief or a library prompt asks for a retired look (collage, comic burst, sunburst, tunnel, blue grid, orbit rings, hexagons, phone-on-desk notifications), a terminal, a chat UI or synthetic SFX, don't do it. Translate the idea into the UI language (the comic "jhatka" becomes a hero number landing with `number_land`; a notification stack becomes stacked `Toast`s inside the app), and note the translation in BRAND_CHECK.md. Only the user can grant an exception, in writing, per reel.

### 2. While building

- Build from `src/engine/ui` and the tokens in `src/brand/ui.ts`. Don't import another reel's kit and don't hand-write colours, curves or springs. If the kit lacks something, **add it to the kit** (generic, documented) rather than to the project, so the next reel gets it too.
- Every number has a `Source` chip; every estimate is dashed grey and labelled `ANUMAAN`.
- SFX come only from `public/sfx/avron_kit_v1/`. If the kit hasn't been generated yet, ship VO + music with no SFX and say so; never fall back to Python-synthesised whooshes or clicks.

### 3. Before showing the user (QC gate)

Run both, and fix every FAIL:

```bash
python3 .claude/skills/avron-brand/scripts/brand_lint.py avron-reels/src/projects/<id> --audio avron-reels/scripts/score_<id>.py
python3 avron-reels/scripts/qc.py ...   # the existing technical QC
```

Then render 6–8 stills across the reel into one contact sheet and look at it next to `deliverables/2026-10-brand-v2/AVRON_brand-v2_style-demo_1080x1920.mp4`. Ask: **could this frame belong to any other page?** If yes, it isn't on brand yet. Also check that the cover sits in the grid next to the last three AVRON covers.

Report the lint result (fails / warns with reasons) in the delivery message, in one line.

## Sound kit

- Spec: `avron-reels/brand/sound/kit_v1.json` (16 sounds, ElevenLabs prompts, prompt_influence, levels vs VO). Research: `avron-reels/research/brand-2026-10/SOUND_DESIGN.md`.
- Generate once with `python3 avron-reels/scripts/sfx_kit.py` (needs `ELEVENLABS_API_KEY`; run `--estimate` first and tell the user the credit cost before spending). The ElevenLabs MCP `text_to_sound_effects` tool caps at 5 s and can't set `prompt_influence`, so use it only to audition one sound.
- After the user picks takes, save each as `public/sfx/avron_kit_v1/<name>.wav` (48 kHz) and log the picks in `avron-reels/brand/sound/KIT_PICKS.md`. That freezes the kit. Never regenerate per reel.
- When writing a new ElevenLabs prompt: say what the sound is in audio terms (one-shot, whoosh, impact, riser), the material, the character, the length, then "high-quality professionally recorded sound effect", and add exclusions (no music, no voice, no reverb tail). Keep it under 450 characters, generate single one-shots and layer them in the mix.

## Taste: how to make it look expensive

Read `avron-reels/research/brand-2026-10/UI_MOTION_TASTE.md` §0–2 once per reel. The short version:
- Restraint is the look. One idea per shot, 80% of the frame still, one primary motion and one secondary motion at a time.
- Show the card that proves the line, not the whole dashboard. Crop in.
- Things launch from their source: a detail panel grows out of the row that was clicked.
- Hold a hero number still for ≥ 1.2 s. Hold text long enough to read it twice.
- Everything critically damped. Bounce is what makes a reel look auto-generated.
- Sound only on state changes, and the hits that matter.

## Keep the brand alive

- When the user gives feedback on the look or sound, update `brand/BRAND.md` (and the tokens or kit) the same day, and log it in `avron-reels/MEMORY.md`. The brand file must always describe the latest decision.
- When you add a component to `src/engine/ui`, add a line to BRAND.md if it becomes a signature move.
- The user may add reference videos. Rebuild what you learn from them inside the brand (timing, staging, a transition idea), never their look. Log useful references in `avron-reels/references/motion/README.md` under "Brand v2 taste references".
