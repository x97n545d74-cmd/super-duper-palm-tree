# AVRON: project memory

This file records long-lived facts and decisions for this repo. Read it at the start of every session. Last updated 2026-10-24.

Tool workflow: Agent Reach for research (read-only), the no-ai-slop skill on every script, and `scripts/fix_timeline.py` after alignment.

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

## Motion and on-screen text (user feedback 2026-10-24: "itna ganda graphic")
- **Default motion direction for every reel:** the direction saved in `ideas/2026-10-product-launch-20s/PROMPT.md`.
  - High-end minimal, one idea per shot, lots of empty space, one accent colour.
  - Inter with tight tracking, masked type reveals, match moves, one camera language.
  - Cuts on the beat, push cuts with real motion blur.
  - **Banned:** camera shake, particles, glows, grid floors, flashes, bouncy easing. No full stops in on-screen text.
- The user's pasted launch/pitch prompts (chain.wtf, MotionSites) are style references in that same spirit.
- **Write Hindi in Roman script** on screen and in captions (e.g. "Sabse zyada maar"), not Devanagari.
- Read the saved prompts in `ideas/` before designing visuals.

## Images from the internet (user approved, 2026-10-25)
- Use stock and free-licence images in reels.
  - **Allowed:** Pexels, Unsplash, Pixabay, Wikimedia Commons (credit per its licence), and government sources (PIB/RBI, check terms).
  - **Never:** news-agency or Google Images photos, or chart graphics from paid reports (use their numbers, draw our own charts).
  - **Logos:** only when reporting on that company.
- Log every image in `projects/<id>/assets/LICENSES.md`: source URL, licence, date, where it's used. Credit on the end card where required.
- Keep photos dark/blurred behind type so the minimal look holds.

## Voice preferences
- The user dislikes "cranky" or robotic TTS and wants a correct Indian accent: "paisaa", not "paise".
- The best result so far was the user's own ElevenLabs file (Tia Mirza, v4). The user may supply VO again: hand over the script and ask for it.

## Delivered
- **Fuel Gap** (₹30/litre gap): v3 final with the Tia Mirza VO, in `deliverables/2026-10-fuel-gap/`.
- **शर्त (The Fine Print)**: a 68 s Hinglish oil/fiscal/2029 reel, in `deliverables/2026-10-oil-2029/`. The user called the story weak ("shit story g"), so make future stories more intriguing.

- **Viviana Power Tech, "₹903 → ₹680"**: a 66 s Hinglish reel, in `deliverables/2026-10-viviana/` (produced 2026-10-24).
  - The final version uses the user's Tia VO and passes QC 11/11. The caption and linking steps are done.
  - The story: the price fell 15 → 23 Oct after the 10 Oct order and warrant notice and the 15 Oct board U-turn. The cash story sits underneath.

- **India smartphone slowdown** (draft, 2026-10-24): a ~53.5 s reel in `deliverables/2026-10-smartphone/`. It opens with the user's IGR / Palki Sharma screen recording at 1.5x; the user chose to use it as briefed.
  - All 6 points were checked against Omdia and Counterpoint primary pages.
  - It uses a Kokoro **guide VO**, because ElevenLabs Sia was out of credits (276 left, 577 needed). Swap steps are in `REPORT.md`.
  - v3: a 2.5 s AVRON logo reveal (wireframe → low-poly shards → app icon → typed name, from the user's prompt) plus kinetic keywords over the clip.
  - The user will record **their own TTS** for the post-clip lines. Slots are in `deliverables/2026-10-smartphone/VO_TIMING.md`.
  - The reel ships with a ducked music bed (`bed.wav`) and no captions until that VO arrives.
  - Not published.
- **ElevenLabs credits:** check the balance before generating a VO. One ~600-character eleven_v4 read costs about 577 credits per take, and the default is 2 takes.

## Research done, not produced
- **MosChip:** `projects/2026-10-moschip/PROJECT_REPORT.md`. It fails the revenue-guidance screen because the company gives no guidance.
- **Viviana Power Tech:** `projects/2026-10-viviana/PROJECT_REPORT.md` (v1). The open items were resolved in `SOURCE_VERIFICATION.md`.
  - Q1: ₹71.86 cr is standalone and ₹72.39 cr is consolidated.
  - The NCD board approval is up to ₹75 cr; ₹20 cr was allotted at 12%.
  - Viviana Life Spaces was sold to a promoter; consideration not disclosed.
- The stock screen the user wants: market cap under ₹10,000 cr, an emerging segment, and revenue guidance above 20%.
- The user wants Finance with Sharan-style content with fresh scripts.

## Parked
- **ComfyUI.** The user said "leave comfyui". The workflows are in `comfy/` (Flux schnell plus Wan 2.2 I2V), and the README was never written.

## Saved prompts, waiting on inputs (`ideas/`)
1. `2026-10-ultracode-x-post`: a Claude Code terminal → ultracode effort → Claude-icon film-set animation. Needs the user's two reference videos.
2. `2026-10-portfolio-reel`: a ~30 s showreel. Needs the portfolio.
3. `2026-10-aisa-15s`: AIsa 15 s motion graphics. Needs to know what AIsa is, plus brand assets and format.
4. `2026-10-product-launch-20s`: 10 bars at 120 BPM in HTML `seek(t)`, rendered with Playwright subframes. Ask for the inputs, then show a beat-grid storyboard before writing any code.
5. `2026-10-chaindotwtf-pitch-30s`: a 30 s pitch video for @chaindotwtf. Needs to know what it is, the audience, assets and any sourced traction.
6. `2026-10-motionsites-launch`: a launch video for MotionSites AI at 1M monthly visitors, 8 months after launch. Needs a source for the number, product info and assets.

## Agent tools the user asked to install (2026-10-24)
- The tools are claude-mem (local memory, cloud sync off), Agent Reach 1.6, SkillSpector, and the `no-ai-slop` skill.
- The user wants them used **every time** without being asked (2026-10-24): no-ai-slop on every script, caption and post, and Agent Reach for research.
- The no-ai-slop and agent-reach skills are saved in `.claude/skills/`, so they load from the repo after a reset.
- The CLIs don't survive a reset. A SessionStart hook in `.claude/settings.json` (approved by the user 2026-10-24) runs `.claude/hooks/ensure_agent_tools.sh` on every new session, and it skips what's already installed.
- For the claude.ai chat app, `tools/claude-ai-upload/no-ai-slop.zip` is ready to upload under Settings → Capabilities → Skills.
