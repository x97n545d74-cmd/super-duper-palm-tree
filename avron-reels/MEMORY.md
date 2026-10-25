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

- **Ep 01 "₹50 ka share sasta hai?"** (2026-10-25): the first episode of the boy + girl finance-comedy series, from the user's own brief. Guide-VO draft in `deliverables/2026-10-ep01-sasta-share/`, with the full package in `PRODUCTION.md`. Not published.
  - The characters are the user's reference sheet (`projects/2026-10-ep01-sasta-share/work/ref.png`), cut out by `scripts/cutout.py`. Only the eyes, brows and mouth are rebuilt so they can animate; the rest is the original drawing. The Remotion composition is `Ep01` (`src/projects/ep01/`), and `Character.tsx` is the reusable puppet for future episodes.
  - Voices cast: girl = Tia Mirza Composed (`tyOTyLYwi6G1V4rsb6uy`), boy = Samar Fun & Playful (`KWuQEGxZQtpWhRutt6g6`). Not generated: ElevenLabs still has **276 credits** (2026-10-25) and needs about 1,960. The swap steps are in `PRODUCTION.md`.
  - The guide VO runs 44.4 s; the brief asked for 30–35 s. Suggested trims are listed but not applied (the user's call).

- **Ep 01 v2 "₹50 ka share, chhota hai par…"** (2026-10-25, replaces v1): the user found v1 unclear and asked for one idea only, told with the 7 C of communication (clear, concise, concrete, correct, coherent, complete, courteous). That means no 7 C list inside the reel. It also needed double-meaning humour that stays IG-safe, moving graphics, and the characters walking around.
  - Lesson: share price ≠ company size; market cap = price × shares. The pizza example (8 slices or 2, same pizza). A ₹50 × 100 cr vs ₹500 × 2 cr pair, both doubling. Punchline: "Toh mera size bhi check karegi?" "Kar liya. Ek slice bhi nahi".
  - `deliverables/2026-10-ep01-v2/` holds the 34.3 s guide-VO cut. Composition `Ep01v2` (`src/projects/ep01/Reel2.tsx`). **The user records the VO themselves**; the line sheet is `VO_LINES.md`.
  - **This boy + girl series posts on a SEPARATE account, not AVRON (user, 2026-10-25).** Use no AVRON logo, name or end card. The girl's notebook uses `girl_body_plain.png` (lettering painted out by `projects/2026-10-ep01-v2/scripts/debrand.py`). Ask for the new account's name/handle before adding any branding.
  - **Final with the user's own VO rendered 2026-10-25:** `EP01_market-cap_FINAL_no-branding_1080x1920.mp4`, 48.1 s, −14 LUFS. The user's mp3s are in `projects/2026-10-ep01-v2/vo_user/`; `scripts/prep_user_vo.py` converts them and runs an ASR check. Not published.
  - Swap: put files in `public/ep01v2/vo/<id>.wav`, then run `projects/2026-10-ep01-v2/scripts/build_timeline.py` → `sfx.py` → `scripts/mix_stems.py` → render.

- **Series Ep 02–11 planned (2026-10-25), waiting for the user's approval and TTS:** `deliverables/series-2026-10/SERIES_PLAN.md` (research, top-10 order, scripts, visuals), `TTS_LINES.md` (105 lines) and `cast_lineup.jpg`.
  - The user's answers (quiz): Hinglish with one light English line; end every reel with a share CTA; real company names/logos allowed with "maan lo" numbers; add **Tips wale Chacha** (`src/projects/series/Chacha.tsx`, drawn in SVG; deliberately not bald/round-specs, so he never reads as a real person); 30–50 s with slow audio; meme references OK.
  - I keep made-up numbers on made-up businesses and use real names only for real, checkable facts. This was told to the user.
  - **Ep 02 Muhurat built (guide VO):** `deliverables/series-2026-10/ep02/EP02_muhurat_GUIDE-VO_1080x1920.mp4`, 46.3 s. Composition `Ep02` (`src/projects/series/Ep02.tsx`) on the shared kit `src/projects/series/kit.tsx` (Cast, Shot push cuts, Captions, Texture grain+halftone, TickerLine, ShareCTA). User TTS files named `ep02_<id>`; swap = `prep_user_vo.py` → `build_timeline.py` → `sfx.py` → `mix_stems.py` → render (about 10 min with motion blur).
  - User asked (2026-10-25) for famous company names. Rule: real names only with their real, dated numbers. User asked for Shinchan/Doraemon/Nobita and offered images. Declined (copyright); offered original guest characters or dialogue mentions.
  - Posting order: 02 Muhurat (before Sun 8 Nov 2026), 03 Chacha pump&dump, 04 IPO, 05 F&O 93%, 06 profit up/share down, 07 split/bonus, 08 dividend, 09 upper circuit, 10 P/E, 11 demat.

## YouTube (starting 2026-10-25)
- Strategy is in `research/youtube-2026-10/YT_STRATEGY.md`, from 474 videos found via Agent Reach searches.
- Main product: a weekly 15–20 min company/stock deep-dive. 15–30 min videos had a median of 161K views vs 10K for 3–8 min.
- Repurpose reels as Shorts.
- Skip daily market news and commodity updates.
- **Long-form look (user asked 2026-10-25 for "more effort" and "10–15 s animation with a character"):** chapters must match the opening's energy. Use the Swiggy film kit (`src/projects/swiggy/film/kit.tsx`: masked-wipe shots, word-by-word headlines, odometer numbers, framed photo inserts, focus pull on the beat) and paper-craft explainer scenes (`film/Paper.tsx`: an original unbranded delivery rider and store picker, labelled "Illustration") under the lines that explain a mechanism. Change the background photo often, with real pans.
- **Swiggy film backgrounds are chosen per chapter by the user** (2026-10-25: "not the whole film, give options, I will select"). Options: A photographs, B live India map (`film/MapWorld.tsx`), C paper city, D type wall (`film/Backdrops.tsx`). Set the choice in `PLAN` in `film/Film.tsx`. The open and close always stay on photographs. User picked (2026-10-25): 1 C, 2 B, 3 A, 4 A, 5 C, 6 A, 7 C.
- **Instamart vs Swiggy:** name Instamart whenever a number is Instamart's. Use the Instamart mark on quick-commerce cards and keep the Swiggy logo for company-level facts.
- YouTube blocks yt-dlp detail lookups from the cloud IP. For dates and subscriber counts, get a YouTube Data API key.

## Video tools from GitHub (installed 2026-10-25, to use on future reels)
The user asked to install these 5 for later reels. `avron-reels/tools/install_video_tools.sh` reinstalls them after a container reset (the SessionStart hook runs it in the background). Clones live in `~/github-tools/`.
- **HyperFrames** (heygen-com/hyperframes, Apache-2.0): HTML-to-video engine. Plugin `hyperframes@hyperframes`; skills hyperframes, hyperframes-cli, media-use, slideshow, remotion-to-hyperframes.
- **onetake** (feitangyuan/onetake, **PolyForm Noncommercial**): launch-style kinetic motion clips, one HTML composition with motion blur. Skill in `~/.claude/skills/onetake`. Check the licence before using it on monetised/sponsored reels.
- **gbro-collage-broll** (pyang5166, MIT): 5 s halftone paper-collage B-roll, three approval gates. Needs `GEMINI_API_KEY` (paid) and an image tool. Skill in `~/.claude/skills/gbro-collage-broll`.
- **Claude Animation Base** (JohnHeibel, MIT): p5.js hand-drawn character animation kit (Clawd). Not a skill: work in `~/github-tools/ClaudeAnimationBase`, read `ANIMATION_GUIDE.md`, render with `node render.mjs --clip --soft-gl` (no GPU, slow on watercolour fills).
- **Lemo-Opuscar** (lemomo-ai, MIT): film-directing plugin `lemo-opuscar@lemolab`; downloads its library to `~/lemo-opuscar` on first use.
- SkillSpector (pattern mode) flagged all except the animation kit; manual review found no malicious code (API keys only go to their own vendor, flags were doc comments and credential docs).
- onetake needs Python Playwright pinned to the Node Playwright version (1.63.0) to find the container's Chromium.

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
