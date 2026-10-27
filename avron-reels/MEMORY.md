# AVRON: project memory

This file records long-lived facts and decisions for this repo. Read it at the start of every session. Last updated 2026-10-27.

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
- **Prompt library reminder (2026-10-26):** every time we start a new reel, ask the user whether to bring the prompts in `insta-reel-avron-page/` into the new project, and which one. Current list: 1. Motion Graphic One (AVRON Pro blueprint), 2. Two (product launch 20s, also the default motion direction), 3. Three (Ultracode × Opus 5.5), 4. Four (portfolio reel), 5. Five (AIsa 15s), 6. Six (chain.wtf pitch), 7. Seven (MotionSites launch). The thali V2 reel used all of them (`deliverables/2026-10-thali/AVRON_thali_V2_all-prompts_1080x1920.mp4`). The user will add more; keep the table in `insta-reel-avron-page/README.md` up to date.

## Defaults the user confirmed (2026-10-27)
- **Prompt library: always bring it in** ("insta reel tools always work"); the user may add reference videos per reel.
- **Motion references: `references/motion/README.md`.** All the user's reference videos/images (paper collage, comic burst, blue grid, green tunnel, orbit squares, red/cream sunburst, teal warp grid, kinetic type, phone notifications, motion board, plus the Musk reel as a structure reference), with which code already implements each look. Use them with the prompt library on every new reel.
- **Voice: ElevenLabs Tia Mirza** is the default for VO.
- **Viral reel engine (2026-10-27):** the user's "AVRON Autonomous Viral Reel Engine" master loop prompt is saved as prompt #8 (`insta-reel-avron-page/viral-reel-engine/PROMPT.md`) and runs as the `avron-reel-engine` skill (`.claude/skills/avron-reel-engine/`): brief → claim registry → 10 scored hooks → up to 8 rounds → adversarial critique → 10-part pack in `projects/<id>/ENGINE_REPORT.md`, plus `scripts/vo_fit.py` (Tia pace 2.45 words/s, measured from past reads; 60 s ≈ 140 words). When the user says they're asleep or "don't ask", it runs on the confirmed defaults and lists its calls at the end. HyperFrames `compose`/`render_video` are refused from Claude Code, so Remotion stays the render path.
- **Reels in progress:** Musk SpaceX-kids (done: `deliverables/2026-10-musk-spacex-kids/`, AI anchor, Tia VO fitted to the timeline, caption + SEO + cover). Footballer-stocks short (no anchor, Indian stocks): `projects/2026-10-footballer-stocks/SCRIPT.md`.

## Two separate Instagram pages (user, 2026-10-26)
- **AVRON**: professional finance content (these reels). Not connected to Metricool yet, so there is no AVRON analytics.
- **@marketkibatt ("Market Ki Baat")**: character-based content, e.g. the ₹50-share pizza reel (25 Oct). This is the page connected to Metricool (brand id 7601365, "Avron" label).
- Don't mix the two brands on screen. The user downloads finished reels and posts them by hand.

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
- **Photo workflow (user, 2026-10-26):** Flickr/Wikimedia/Openverse rate-limit this cloud IP, and Pexels/Unsplash need a key. So for each reel, give the user a shot list of photos with ready-to-paste search queries aimed at free-licence sites (e.g. `site:pexels.com onion pile`, Google Images with Tools → Usage rights → Creative Commons). The user finds and uploads them. Before using one, ask where it's from so it can be logged in LICENSES.md.

## Voice preferences
- The user dislikes "cranky" or robotic TTS and wants a correct Indian accent: "paisaa", not "paise".
- The best result so far was the user's own ElevenLabs file (Tia Mirza, v4). The user may supply VO again: hand over the script and ask for it.
- The user has ElevenLabs premium. On 2026-10-26 they reconnected the ElevenLabs connector and confirmed the premium account in their own dashboard. Before a long generation, still run `estimate_only` and say the cost. The default voice is "Tia Mirza – Crisp and Commanding" (`OUBnvvuqEKdDWtapoJFn`, eleven_v4). The user may also record VO themselves from a paste-ready script.

## Delivered
- **Swiggy vs Eternal, 13:28 YouTube film (2026-10-25):** user's ElevenLabs VO (Tia Mirza Crisp and Commanding, v4) plus a 4-line fix file, re-timed with `scripts/timeline_swiggy.py`, original score (`score_swiggy.py`), -14 LUFS. Final at `out/AVRON_Swiggy_vs_Eternal_FINAL.mp4` (637 MB) and a 417 MB upload copy. SRT and upload kit are in the project folder. Not published.
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
- **Retail inflation thali** (2026-10-26): a 52 s Hinglish reel from the user's "AVRON Pro Reel Master Blueprint" (6-step framework: hook, context, data, split, central bank, real-return formula + CTA). Final with the user's Tia VO in `deliverables/2026-10-thali/` (QC 9/11, the 2 flags reviewed in `QC_NOTES.md`). Caption, sources and paste-ready VO are in the same folder. Not published.
  - The blueprint said RBI held the repo rate; RBI **raised** it 5.25% → 5.50% on 7 Oct 2026. Always check blueprint facts against MoSPI/RBI primary documents (Agent Reach reads both when WebFetch fails).
  - Pipeline: `scripts/narration_thali.py` → `scripts/timeline_thali_user.py` (user VO, one continuous read, Whisper digit matching for spoken numbers) → `fix_timeline.py` → `score_thali.py` → `mix_stems.py` (music −16 dB keeps Hinglish numbers clear) → `src/projects/thali/`.
  - The user prefers to TTS the VO themselves: give the script in one block (Devanagari + Latin English, numbers spelled out).
- **ElevenLabs credits:** check the balance before generating a VO. One ~600-character eleven_v4 read costs about 577 credits per take, and the default is 2 takes.

- **AVRON anchor v2 (2026-10-27):** new face made by the user in Higgsfield (long dark hair, gold jhumkas, black blazer, ivory top, grey studio). **User stated in writing (option A): "fully AI, no real person's photo was ever used as input, including the blue saree photo; generated from a text prompt."** Cutouts in `public/anchor2/` (front, profile, three4 clean; gesture and reading edges need fixing). Her 3 Higgsfield clips (`public/anchor2/src/clipA-C.mp4`) speak Higgsfield's own lines, not our VO, so they're usable only as non-speaking moments; speaking shots need Sync Lipsync 3 with our WAV. Plan: 1–2 lip-synced clips per reel plus one reusable CTA clip.
- **AI anchor demo** (2026-10-27): the user supplied an AI anchor character (black pantsuit, long wavy hair; sheets in `public/anchor/`, 8 cutouts). Direction from the user: she is the recurring narrator but **secondary**; motion graphics are the visual focus, with a visual change every 4–5 s, small framing/split screens/cutaways, a premium financial-documentary look, no talking-head shots, no generic AI effects or neon, 9:16. Demo = thali story re-cut with her: `deliverables/2026-10-anchor-demo/`, code `src/projects/anchor/Reel.tsx` (`AnchorDemo`). No lip-sync (stills only); upgrade path is short lip-synced clips from HeyGen/Hedra/Higgsfield. Always tag "AI ANCHOR". **Lip-sync route chosen by the user (2026-10-27): they make talking clips in HeyGen/Hedra from `deliverables/2026-10-anchor-demo-v2/lipsync_kit/` and upload them; we key and composite.** V2 (Fuel Gap in the reference look: collage, grid tunnels, orbits, hexagons, one comic burst) is in `deliverables/2026-10-anchor-demo-v2/`, composition `AnchorDemoV2`. Her origin (original vs. real person's likeness) is not yet confirmed.

## YouTube (starting 2026-10-25)
- Strategy is in `research/youtube-2026-10/YT_STRATEGY.md`, from 474 videos found via Agent Reach searches.
- Main product: a weekly 15–20 min company/stock deep-dive. 15–30 min videos had a median of 161K views vs 10K for 3–8 min.
- Repurpose reels as Shorts.
- Skip daily market news and commodity updates.
- **Long-form look (user asked 2026-10-25 for "more effort" and "10–15 s animation with a character"):** chapters must match the opening's energy. Use the Swiggy film kit (`src/projects/swiggy/film/kit.tsx`: masked-wipe shots, word-by-word headlines, odometer numbers, framed photo inserts, focus pull on the beat) and paper-craft explainer scenes (`film/Paper.tsx`: an original unbranded delivery rider and store picker, labelled "Illustration") under the lines that explain a mechanism. Change the background photo often, with real pans.
- **Swiggy film backgrounds are chosen per chapter by the user** (2026-10-25: "not the whole film, give options, I will select"). Options: A photographs, B live India map (`film/MapWorld.tsx`), C paper city, D type wall (`film/Backdrops.tsx`). Set the choice in `PLAN` in `film/Film.tsx`. The open and close always stay on photographs. User picked (2026-10-25): 1 C, 2 B, 3 A, 4 A, 5 C, 6 A, 7 C.
- **Instamart vs Swiggy:** name Instamart whenever a number is Instamart's. Use the Instamart mark on quick-commerce cards and keep the Swiggy logo for company-level facts.
- YouTube blocks yt-dlp detail lookups from the cloud IP. For dates and subscriber counts, get a YouTube Data API key.
- **Silver crash film** (Hinglish YouTube, ~12 min, started 2026-10-26): script in `projects/2026-10-silver-crash/SCRIPT.md`, adapted from Why X's "Silver Is Running Out... So Why Is It Crashing?" with our own characters (Gupta ji, Rohan) and analogies.
  - Look approved 2026-10-26: Bahi-Khata ledger (D) as the main look, Phone-First (E) for Rohan, Paper Craft (B) for Gupta ji. Per-chapter map is in SCRIPT.md. Demos: `src/projects/silver/Demos.tsx`, rendered with `scripts/silver_demos.mjs`.
  - Delivered 2026-10-26: `out/AVRON_Silver_Film_master.mp4` (10:19, 1080p30, 160 MB, −14 LUFS) from the user's Tia Mirza Crisp & Commanding v4 VO (one file, 9:49). Pipeline: `scripts/timeline_silver.py` (faster-whisper words → beats.json), `src/projects/silver/film/`, `scripts/score_silver.py` (original 5-phase score + SFX, user brief), `scripts/mix_stems.py` (music −11 dB, ducked). YouTube post kit (title, description, tags, settings): `projects/2026-10-silver-crash/YOUTUBE_POST.md`; thumbnails A/B/C via `scripts/silver_thumbs.mjs` (A recommended). Not published.
  - Open: at film ~3:40 the transcription heard "3,69,000" for ₹3,59,000; user to listen and resend that line if wrong.
  - The user writes their own VO in ElevenLabs from a paste-ready script (Devanagari Hindi + Latin English, numbers spelled out), one block with a two-half fallback.

## Research done, not produced
- **MosChip:** `projects/2026-10-moschip/PROJECT_REPORT.md`. It fails the revenue-guidance screen because the company gives no guidance.
- **Viviana Power Tech:** `projects/2026-10-viviana/PROJECT_REPORT.md` (v1). The open items were resolved in `SOURCE_VERIFICATION.md`.
  - Q1: ₹71.86 cr is standalone and ₹72.39 cr is consolidated.
  - The NCD board approval is up to ₹75 cr; ₹20 cr was allotted at 12%.
  - Viviana Life Spaces was sold to a promoter; consideration not disclosed.
- The stock screen the user wants: market cap under ₹10,000 cr, an emerging segment, and revenue guidance above 20%.
- The user wants Finance with Sharan-style content with fresh scripts.

## Parked
- **ComfyUI.** The user said "leave comfyui", then on 2026-10-27 asked to install it. ComfyUI 0.43 is installed in `/home/user/ComfyUI` (its own venv, CPU PyTorch). It does not survive a container reset, and this container has no GPU. No models are downloaded. The workflows are in `comfy/` (Flux schnell plus Wan 2.2 I2V), and the README was never written.

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
