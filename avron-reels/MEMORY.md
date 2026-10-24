# AVRON: project memory

This file records long-lived facts and decisions for this repo. Read it at the start of every session. Last updated 2026-10-24.

## Who and what
- AVRON makes cinematic finance and explainer reels: 1080×1920, 30 fps, H.264/AAC, −14 LUFS.
- The pipeline runs research → verification → script → storyboard → assets → animation → sound → render → QC → MP4.
- The full pipeline is in `README.md`. The Remotion engine is in `src/engine/`, projects in `src/projects/`, scripts in `scripts/`.
- The working branch is `avron/fuel-gap-reel` on `x97n545d74-cmd/super-duper-palm-tree`. There is no PR.

## Standing rules from the user
- Never invent facts, sources, quotes or footage. Mark which statements are estimates. Make no buy/sell/hold calls and give no price targets.
- Never publish, schedule or boost content without explicit approval.
- Do not generate an AI likeness of real people. Only use assets that are licensed or owned by the user.
- Pick a topic or idea first, then wait for approval before producing anything.

## Voice preferences
- The user dislikes "cranky" or robotic TTS and wants a correct Indian accent: "paisaa", not "paise".
- The best result so far was the user's own ElevenLabs file (Tia Mirza, v4). The user may supply VO again: hand over the script and ask for it.

## Delivered
- **Fuel Gap** (₹30/litre gap): v3 final with the Tia Mirza VO, in `deliverables/2026-10-fuel-gap/`.
- **शर्त (The Fine Print)**: a 68 s Hinglish oil/fiscal/2029 reel, in `deliverables/2026-10-oil-2029/`. The user called the story weak ("shit story g"), so make future stories more intriguing.

## Research done, not produced
- **MosChip:** `projects/2026-10-moschip/PROJECT_REPORT.md`. It fails the revenue-guidance screen because the company gives no guidance.
- **Viviana Power Tech:** `projects/2026-10-viviana/PROJECT_REPORT.md`. The story is "Profit बढ़ा, cash कहाँ गया?". Open items:
  - Q1 figures conflict (company ₹71.86 cr / PAT ₹6.93 cr; Screener ₹72.39 cr / ₹6.02 cr).
  - The NCD size is unconfirmed.
  - The divestment terms are unconfirmed.
- The stock screen the user wants: market cap under ₹10,000 cr, an emerging segment, and revenue guidance above 20%.
- The user wants Finance with Sharan-style content with fresh scripts.

## Parked
- **ComfyUI.** The user said "leave comfyui". The workflows are in `comfy/` (Flux schnell plus Wan 2.2 I2V), and the README was never written.

## Saved prompts, waiting on inputs (`ideas/`)
1. `2026-10-ultracode-x-post`: a Claude Code terminal → ultracode effort → Claude-icon film-set animation. Needs the user's two reference videos.
2. `2026-10-portfolio-reel`: a ~30 s showreel. Needs the portfolio.
3. `2026-10-aisa-15s`: AIsa 15 s motion graphics. Needs to know what AIsa is, plus brand assets and format.
4. `2026-10-product-launch-20s`: 10 bars at 120 BPM in HTML `seek(t)`, rendered with Playwright subframes. Ask for the inputs, then show a beat-grid storyboard before writing any code.

## Agent tools the user asked to install (2026-10-24)
- The tools are claude-mem (local memory, cloud sync off), Agent Reach 1.6, SkillSpector, and the `no-ai-slop` skill.
- They don't survive a container reset. Reinstall with `bash tools/install_agent_tools.sh`.
