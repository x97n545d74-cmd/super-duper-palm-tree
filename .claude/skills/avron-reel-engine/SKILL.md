---
name: avron-reel-engine
description: AVRON's autonomous viral reel engine. Turns a finance reel brief into a researched, fact-checked, 60-second Hinglish Instagram Reel pre-production pack (10 scored hooks, an improvement loop, a timestamped production table, motion and SFX direction, a verification report, a clean VO script and an editor's checklist), built for Indian investors and AVRON's house look. Use it whenever the user pastes a reel brief, topic, stock/sector idea or draft script for AVRON, says "master loop", "viral reel engine", "make this reel go viral", "improve my hook/script", "60 second reel", or asks to run the AVRON prompt on a new story, even if they don't name the skill. Also use it when the user says they are away or asleep and wants the reel work finished without questions.
---

# AVRON reel engine

The user's full master prompt is in `references/master-prompt.md`. This file is the working version: the same ten phases, wired into AVRON's repo, rules and tools. Read `references/avron-house-rules.md` once per run; it lists the rules that override anything in a brief.

The point of the engine is a better *story*, checked *facts* and a reel that can be built from the pack with no further questions. Polished sentences come last.

## 0. Set up (before Phase 1)

1. Read `avron-reels/MEMORY.md`, `avron-reels/references/motion/README.md` and `avron-reels/insta-reel-avron-page/README.md`. MEMORY may be newer than the house-rules file.
2. **Prompt library and references: bring them in by default.** CLAUDE.md asks you to ask first, but the user answered on 2026-10-27: "always bring it in". Ask only if the brief names a different look. Note in the pack which prompts and reference looks you used.
3. **Autonomous mode.** If the user says they're away, asleep, or "don't ask me", make every call yourself with the confirmed defaults below and list each assumption at the end of the pack under "Calls I made for you". Never stop to ask in that mode. Defaults: 60 s; Tia Mirza VO; AVRON page (not @marketkibatt); no AI anchor unless the brief asks; prompt library + motion references in.
4. **No brief?** If the input still holds the `[PASTE THE COMPLETE AVRON REEL BRIEF HERE]` placeholder, there's nothing to engineer. In normal mode ask for the brief. In autonomous mode, don't invent a topic and don't start production (MEMORY: topic first, then approval). Instead finish whatever setup the request implies (save the prompt, prepare the folder) and say a brief is needed.
5. Make the project folder `avron-reels/projects/<YYYY-MM>-<slug>/` and write everything there. Save the pasted brief verbatim as `BRIEF.md`.

## Phase 1: Deconstruct the brief

Write the extraction (core message, audience, emotional trigger, central conflict, main insight, strongest evidence, most surprising reveal, payoff, CTA, required companies/dates/stats, visual and audio constraints) as a compact table. Then answer the hard questions plainly: what's predictable, generic, overcomplicated; where viewers would leave; what deserves screen time; which claims need checking; what angle competitors would miss.

Fix the story before the sentences. If the brief's own structure is weak, say so and change it; the user asked to be challenged, not agreed with.

## Phase 2: Research and verification

Build a claim registry before the script: `research/claims.md` with one row per claim (ID, claim, source URL, source type, date checked, status `VERIFIED` / `QUALIFIED` / `UNVERIFIED` / `WRONG`, the exact wording allowed on screen).

- Source order: company filings and investor decks → NSE/BSE announcements → government and regulators (RBI, SEBI, MoSPI, PIB, USFDA, CDSCO, patent offices) → reputable financial press.
- Use the built-in web tools first and Agent Reach when they fail. Read-only.
- `WRONG` claims are corrected or cut, never softened. `UNVERIFIED` claims are cut or said as a clearly labelled possibility. A company only appears as a "beneficiary" if a filing or the company's own statement links it to the theme; otherwise call it AVRON's reading.
- Check every time word in the brief ("upcoming", "abhi", "is saal", "paanch saal se") against today's date. Briefs are often written weeks before the run: the data-centre/pharma brief called the 20 March 2026 semaglutide expiry "upcoming" in October.
- A theme can have structural growth and still fall in a crash. Never turn a thesis into a return promise.
- If there are no research tools at all, mark every number `UNVERIFIED` and say so at the top of the report. Don't fill gaps from memory.

## Phase 3–4: Ten hooks, scored

Write ten hooks, one per angle (psychological callout, contrarian, unexpected reality, FOMO, surprising question, counterintuitive comparison, verified data point, hidden value chain, contradiction, provocative but defensible). Each gets: spoken Hinglish line, first-frame text (3–7 words, Roman script, no full stop), opening visual (from the motion references where it fits), the curiosity gap, and how the reel pays it off.

Score each out of 100 (attention 20, curiosity 20, specificity 15, Indian-investor relevance 15, spoken delivery 10, payoff link 10, credibility 10) in one table. Cut the generic, confusing, exaggerated and disconnected. Take the top three, name each one's biggest weakness, rewrite it, re-score, pick the winner. A hook built on an `UNVERIFIED` claim can't win. The loudest hook isn't automatically the best one.

## Phase 5: Improvement loop (up to 8 rounds)

Each round runs every audit from the master prompt (hook, narrative, retention, language, visual, audio, credibility) and then rewrites the *whole* script. Score it on the ten editorial criteria (hook, retention architecture, clarity, credibility, visual originality, VO quality, pacing, brand fit, payoff, CTA; 10 each).

- Keep the best version as the benchmark; a change survives only if it beats it.
- Stop early when the Phase 10 criteria all hold, or when a round doesn't improve anything.
- Log only one line per round in `LOOP_LOG.md` (round, total score, what changed, kept or reverted). Don't paste every draft into the pack.
- These scores are editorial judgements. Never present them as predicted views or retention, and never say a hook was "tested".

## Phase 6–7: Retention architecture and the production table

Something meaningful happens every 3–5 s: a new fact, a reveal, a question answered, a contrast, a change in scale, a new piece of evidence. Change the picture because the story moved, not to hit a timer. Every open loop must close later in the reel. The CTA grows out of the payoff (a question the viewer can actually answer from what they just saw).

The production table has seven columns: timecode, VO word for word, on-screen typography, visual composition and animation, transition out, music/SFX, narrative purpose. Specify the exact opening frame. No logo opener. Dark mode, white Inter type, red/green only for data direction, one accent. For each shot, name the reference look and, when one exists, the component that already implements it (see the motion README table). New looks are allowed when nothing fits; say so.

House bans apply on top of the brief: no shake, particles, glows, grid floors, flashes, bouncy easing, neon, fake tickers or full stops on screen.

## Phase 8: VO quality control

Run the clean VO through `scripts/vo_fit.py` (Tia's measured pace, numbers expanded to spoken length):

```bash
python3 .claude/skills/avron-reel-engine/scripts/vo_fit.py avron-reels/projects/<id>/VO.md --target 60
```

Leave ~2 s for the end card, so aim for ≤ 58 s of speech (~140 words). If it's over, cut secondary details, not pace. Then check: the hook lands in the first sentence; no on-screen text needs more reading time than it gets (~3 words per second of hold, minimum 1 s); company names are spelled the way they're said; figures are big enough for a phone; music sits under the VO (mix around −16 dB under Hinglish numbers); the last word cuts clean.

## Phase 9: Adversarial critique

Write three short critiques: the impatient viewer (where they swipe away), the sceptical investor (what feels unsupported or salesy), the elite editor (which shots, words and effects waste time). Merge the strongest points and do one final rewrite. Re-run `vo_fit.py` on the result.

## Phase 10: Stop

Stop when the hook is clear and relevant and its promise is kept, the narrative holds, every important claim is verified or labelled, nothing is filler, the VO fits, every visual change has a reason, and the CTA fits. Keep the strongest version rather than rewriting for the sake of a round count.

## The no-ai-slop pass (required)

Before the pack is shown to anyone, run the `no-ai-slop` skill (edit mode) over every user-facing string: hooks, VO, on-screen text, caption, CTA. In Hinglish VO, cut the patterns that skill names (binary "X nahi, Y hai" contrasts used as drama, throat-clearing openers like "Suniye ek baat", "What if I told you", faux-insight setups like "Yeh koi nahi batata", stacked fragments). Keep real spoken rhythm and the presenter's confidence. Record what changed in one short list.

## Output: the pack

Write `ENGINE_REPORT.md` in the project folder with exactly these ten sections, in this order, using `references/report-template.md`:

1. Winning Creative Angle
2. Winning Hook
3. Final 60-Second Script (the seven-column table)
4. Full Motion-Graphics Direction
5. Audio and SFX Timeline
6. Retention Map
7. Factual Verification Report
8. Final Quality Score (ten criteria + the weakest remaining area)
9. Final Production-Ready Script
10. Final Editor's Checklist

Section 9 is the recording script. Give it twice: Roman-script Hinglish (as said on screen) and the ElevenLabs version (Devanagari Hindi + Latin English, numbers spelled out, one block, plus a two-half fallback). Also save the Roman version alone as `VO.md` for `vo_fit.py`.

Also write in the project folder: `BRIEF.md`, `research/claims.md`, `HOOKS.md` (all ten with scores, the three rewrites, the winner), `LOOP_LOG.md`, and `caption.md` (Instagram caption in Roman Hinglish, sources line, disclaimer, 5–8 hashtags, no-ai-slop'd). End `ENGINE_REPORT.md` with "Calls I made for you" in autonomous mode.

In chat, reply in a few lines of Hinglish: the winning hook, the estimated VO length, anything `WRONG` or `UNVERIFIED` that changed the story, and the path to the pack. Don't paste the pack.

## After the pack (only when asked, or when the user has said "complete the work")

- **Build:** the Remotion engine is the production path (`avron-reels/README.md`: `src/projects/<id>/`, `scripts/render.mjs`, `scripts/qc.py`). A storyboard or silent animatic can be built and rendered without VO. The final cut waits for the user's VO (the user records Tia in ElevenLabs from Section 9) or an explicit instruction to generate it.
- **HyperFrames (HeyGen):** its `compose` and `render_video` tools only work from hosted chat clients; from Claude Code they're refused with a pointer to the local HyperFrames skills. Use it only if the user wants a hosted HeyGen project, and say that the local Remotion path is the default.
- Never publish, schedule or boost anything. Update `MEMORY.md` with the reel's status when a durable decision is made.
