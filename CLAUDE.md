# Project instructions

At the start of every session, read `avron-reels/MEMORY.md`. It holds this project's rules, the user's preferences, finished and parked work, and saved prompts. Update it when a durable decision changes.

## AVRON brand v2 (locked 2026-10-28)
Every AVRON reel follows `avron-reels/brand/BRAND.md` ("finance as product UI": one look, one sound kit, seven signature moves) and passes the `avron-brand` skill's gate: a `BRAND_CHECK.md` before the storyboard, and `brand_lint.py` plus a contact-sheet check before the user sees anything. No retired looks (collage, comic burst, sunburst, tunnel, blue grid), no terminals or chat UIs, no Python-synthesised SFX. This exists because an analyst found the page looked low-effort and "made with Claude".

## Before every new reel
Ask the user whether to bring the prompt library in `avron-reels/insta-reel-avron-page/` into the new project, and which prompt (for example "Motion Graphic One"). Ask even if they don't bring it up. Don't apply a prompt without their answer. For AVRON, a library prompt only supplies story structure or timing ideas: its look is translated into brand v2. Prompts #3, #5, #6 and #7 (Claude/AI-product and client pitches) are not brought into AVRON reels by default.

## Agent tools: always on
The user wants these used every time, without being asked:
- **no-ai-slop**: run every script, caption, VO line and post text through it before showing the user.
- **Agent Reach**: use it for research (read-only).
- **claude-mem**: keeps memory across sessions.
- **SkillSpector**: scan any new skill before installing it.

The skills live in `.claude/skills/`, so they load from the repo even after a container reset. The CLIs (claude-mem, Agent Reach, SkillSpector) don't survive a reset. A SessionStart hook in `.claude/settings.json` runs `.claude/hooks/ensure_agent_tools.sh` automatically and skips anything already installed. If they're still missing, run that script by hand.
