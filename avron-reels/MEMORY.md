# AVRON: project memory

This file records long-lived facts and decisions for this repo. Read it at the start of every session. Last updated 2026-11-17.

Tool workflow: Agent Reach for research (read-only), the no-ai-slop skill on every script, and `scripts/fix_timeline.py` after alignment.

## Brand v2: "finance as product UI" (user decision, 2026-10-28) — overrides older look notes below
- **Why:** an analyst reviewed the AVRON page: "pick a theme, most of the things on page is Claude and it looks low effort", content looks like every other Claude-made reel page, no brand identity will stop growth. Advice: feed in UI/SaaS motion and build taste; use ElevenLabs (via MCP) for SFX, not Claude-made sounds; learn from sound tutorials. The user asked to "train Claude more effectively so these concerns don't come afterwards".
- **User's answers (2026-10-28):** the page is **AVRON**; the theme is **finance as product UI** (every reel is one premium finance app answering a question with sources, one locked look); library prompts #3 Ultracode, #5 AIsa, #6 chain.wtf, #7 MotionSites are **kept but not brought into AVRON reels by default**.
- **The law:** `brand/BRAND.md`. Tokens `src/brand/ui.ts`, components `src/engine/ui/` (Canvas, Shell, Panel, Cursor, Receipt, Counter, LineChart, Bars, Chip, Row, Toast, Poll, Saved, Disclaimer, push/zoomThrough/morph). Gold is the only accent (chrome only); green/red for direction only; dashed grey for estimates.
- **Enforcement:** the `avron-brand` skill (`.claude/skills/avron-brand/`): BRAND_CHECK.md before the storyboard, `scripts/brand_lint.py` (fails retired looks, bouncy easing, glow, terminals, other reels' kits, synthesised SFX, missing signature moves) before showing anything.
- **Style demo:** `deliverables/2026-10-brand-v2/AVRON_brand-v2_style-demo_1080x1920.mp4` (16 s silent, `BrandDemo`; DcPharma facts retold in the new look) and cover template `BrandCover`.
- **Sound:** one ElevenLabs kit made once and reused on every reel: `brand/sound/kit_v1.json` (16 sounds, D major, sonic logo = 3 notes), generator `scripts/sfx_kit.py` (needs `ELEVENLABS_API_KEY`; ~5,600 credits for 4 takes each, estimate). The ElevenLabs connector was **not attached** on 2026-10-28; the MCP SFX tool caps at 5 s and has no prompt_influence, so the API key route is preferred. Until the kit exists, reels ship VO + music only.
- **Retired for AVRON:** reference looks 01–08 and 12 (collage, comic burst, blue grid, tunnel, orbits, sunburst, warp grid, hexagons) and phone-desk notifications; the "user favourites" list below is history, not direction. Kinetic type survives only as masked reveals inside the brand.
- Research: `research/brand-2026-10/UI_MOTION_TASTE.md`, `SOUND_DESIGN.md` (YouTube transcripts were blocked by rate limits; tutorial lists with URLs are in both files for a later pass).
- **Open:** user to confirm series names (Layer / Receipt / Screener), approve the demo look, and provide ElevenLabs access to generate the kit.

## Look decision (user, 2026-10-28, later the same day) — supersedes the dark brand v2 look
- The user rejected the dark CSS card study ("very low effort") and stopped the dark 3D render. Asked for "advance and high quality ui/ux motion graphics and saas graphics with kinetic typography", then chose **bright & clean (Stripe/Apple)**.
- Style test approved for colour and design: `deliverables/2026-10-brand-v2/AVRON_style-test_bright-clean_1080x1920.mp4` (`StyleLight`, kit `src/engine/light/`). The 2.5D isometric card stack (0:09–0:11) was "awful" and is cut and banned.
- Next: finalise the Instagram reel template on this look (update BRAND.md fully + brand_lint), then kinetic-typography references from the user.
- Kinetic type study in the user's typography reference style (heavy Montserrat poster type, stretch/keystone/bend, echo, black/light flips; `TypeStudy`, `src/engine/light/kinetic.tsx`): user verdict "NOT A GOOD ONE, maybe this typography didn't fit in". Don't use poster-style full-screen type as the reel's main language; it clashes with the clean product-UI look. Kit kept but parked.
- **Swiss × bright & clean (2026-10-28, user asked):** "use swiss graphic motion from lemo opuscar and use remotion and then combine it with my liked demo". Built in Remotion: `SwissLight` (`src/projects/style-light/SwissLight.tsx`) → `deliverables/2026-10-brand-v2/AVRON_swiss-x-bright-clean_1080x1920.mp4`. Swiss rules taken (grammar only) from lemo-opuscar `styles/swiss-motion/STYLE.md`: 6-col visible grid, flush-left, giant numeral + caption rows with 1 px rule, one signal (AVRON gradient on the hero element only), clip-reveals, knife-cut exits, snaps on 120 BPM with cubic-bezier(.7,0,.2,1), a grid that means something (1 module = 0.2 GW). Awaiting the user's verdict.
- **SwissPro (2026-10-28, user: "fix everything and make it look like a professional has made this"):** pro pass on SwissLight → `deliverables/2026-10-brand-v2/AVRON_swiss-pro_1080x1920_60fps.mp4` (`SwissPro`, 19 s, 60 fps). Match cuts (headline → page title, ring → grid module 1, modules → rule under the wordmark), overlapping transitions, one slow camera push + parallax, motion blur, anticipation dips + damped land pulses, phone-legible type (≥ 24 px mono / 32 px text), drawn layer icons instead of letter tiles (no logos supplied), grain. Original 120 BPM D-major score from the shared cue file `src/projects/style-light/swisspro_cues.json` (`scripts/score_swisspro.py`; every grid module plays a note). No UI SFX yet (no ElevenLabs key). Awaiting verdict.
- **Typography decision (user, 2026-10-28): "Like the UI style test".** Reel type = clean Inter Display/Inter, per-character masked blur-to-sharp reveals (`Chars` in `src/engine/light/index.tsx`), one gradient hero word per beat, headlines that shrink into the UI title. No poster-style kinetic type.
- Dark 3D kit (`src/engine/three/Studio.tsx`, `CardStudyV2`) is kept but parked; it renders slowly here (~1 h for 20 s on CPU).

## Script method (user, 2026-10-28): "This is how we will start building script"
- Every AVRON script starts with `insta-reel-avron-page/script-method/PROMPT.md` (prompt #9): audience research for the topic (10 problems, frustrations, desired outcomes, repeated questions, mistakes, objections/limiting beliefs; emotional reasons; the audience's own phrases) saved as `projects/<id>/research/audience.md`, from real sources, no invented quotes.
- Then HOOK → VALUE → SOLUTION → CTA. One reel goal per reel (followers / comments / saves / shares / leads), asked up front; the CTA and end card follow it. Solution = education (a check, framework, steps), never buy/sell advice.
- Wired into the `avron-reel-engine` skill as Phase 0.5, and into BRAND.md move 7 (end card by goal).

## Palantir reel (2026-10-29, script draft)
- The user pasted a "Reel Strategist 32s" master prompt, saved as library prompt #10 (`insta-reel-avron-page/reel-strategist-32s/`). Brought in: #10 + #1. Goal: saves.
- **One-reel look override:** the user chose "whatever the prompt says" (black #0A0A0A, Anton, yellow #FFD60A, Adam VO at 1.08x) over brand v2 for this reel. brand_lint will flag it. Don't treat it as a brand change; ask again on the next reel.
- **Language: English** for this reel (user corrected the Hinglish draft: "English mai bnani thi"). Prompt #10 says Hinglish; ask the language on the next reel.
- Fact check: $480M Maven (May 2024) real, raised to ~$1.28B (May 2025). "$2,000/soldier/month" has no source and "86% margin" is wrong (FY2025: gross ~82%, GAAP op 32%, adj. op 50%); both dropped. Script, timeline, caption and claim registry: `projects/2026-10-palantir/SCRIPT.md`. **Rendered 2026-10-29:** `deliverables/2026-10-palantir/AVRON_palantir_reel1_1080x1920.mp4` (38.6 s, −14.3 LUFS; Adam v3 VO generated via the connector, take B, 1.12x; 6 ElevenLabs SFX; graphics only). The ElevenLabs connector's SFX come out 1 s long, so no bed. Open: verify Chandrayaan-3 cost (~₹615 cr) and the day's ₹/$ rate before posting. Not published.

## Avron Radar (2026-11-17, user asked for "an agent that keeps an eye on every social media platform")
- Started from the user asking what Redbox (news squawk + chat + analysts + API) is and wanting the same on a website. There is **no website yet**. The user chose: agent as **code in this repo**, for **personal use**.
- `avron-radar/` (repo root): `radar.py` (stdlib) reads public Reddit RSS, YouTube channel RSS, Telegram `t.me/s`, Google News RSS, Bluesky search and the official X API (every 6 h, metered); dedupes into `data/items-YYYY-MM.jsonl`; Claude labels each post (relevance, kind incl. rumour/tip, companies, summary); builds `radar.db` (SQLite) and `dashboard.html`. Sources and watchlist: `config.json`. Workflow `.github/workflows/avron-radar.yml` runs every 30 min and saves to the `avron-radar-data` branch (only once it is on the default branch).
- **X is switched off (user, 2026-11-17: "Leave x then")**: the X project is Pay Per Use, so reads cost money. `disabled_lanes: ["x"]` in config.json. Do not turn it back on without asking.
- **Upgraded 2026-11-17 (user: "think like a top analyst", then a "MISSION: upgrade the existing agent" brief: audit first, don't rebuild, test everything, final report).** Now 68 sources (NSE filing feeds, RBI, PIB, business papers, ValuePickr, 27 YouTube, 8 Telegram), `market.py` (a year of NSE end-of-day prices, 9 screens, deals), `analyst.py` (indicators + investor formulas), `brain.py` + `ANALYST.md` (triage → filing read → number check → fact check; two briefs a day). Audit and what is left: `avron-radar/REPORT.md`. 50 unit tests (`cd avron-radar && python3 -m unittest`).
- **Ten improvement rounds (2026-11-17, user: "keep it running ten times... analyse where we can enhance"):** each round = live test run → read output → fix → test. Added `fundamentals.py` (results figures copied by the fast model, ratios in code; promoter holdings; calendar), `decide.py` (evidence scorecard whose price weights follow each screen's measured record; my_stocks alerts; theme tracker), `ask.py` (question box on the workflow → Ask tab), market regime, sector table, screen track record, weekly review. Round-by-round table in REPORT.md. The user likes this run → analyse → improve loop; use it again for radar work.
- **Added late 2026-11-17 at the user's request:** named shareholders above 1% and followed investors (`investors` in config; NSE shareholding XBRL), FII/MF/retail breakdown per company, flows and derivatives positioning (`flows.py`: NSE participant OI, NSDL FPI, ban list, rupee), company activity checklist, government policy notes + election watch (`policy.py`). The user asked for LinkedIn: declined (login wall, terms forbid automated reading); the checklist from exchange filings was built instead. The user wants "which share will boom after an election": the agent shows policy themes and evidence-linked companies, never a prediction; keep saying so plainly.
- Sources GitHub's servers cannot reach (tested): BSE, Yahoo Finance, Stooq, MCX, FRED (times out), NSE's cash FII/DII file, NSE insider-trading feed (stale since May).
- **Standing permission (user, 2026-11-17): "merge whenever it is needed".** For Avron Radar work: after tests pass and a live test run on the `-test` branches looks right, open the PR into `avron/fuel-gap-reel` and merge it without asking again, then tell the user what went live. This covers radar PRs only; my reading is that it does not cover reels, the X merger, or anything that publishes or spends on a new paid service.
- **GitHub's cron does not fire on this repo** (zero scheduled radar runs; the X merger's hourly cron fired twice in a day). The radar workflow is a self-restarting chain like the merger's. Never tell the user a schedule "is running" without seeing a scheduled run.
- User settings still empty: `my_stocks` in `avron-radar/config.json` (ask which stocks they follow).
- Test without touching live data: start the workflow by hand on a non-default branch; it writes to `avron-radar-data-test` / `avron-radar-dashboard-test`. Dashboard and radar.db live on `avron-radar-dashboard` (no history).
- **The repo is public**, so the collected data is public. User has not yet decided (options in REPORT.md; recommended: data to a second private repo). BSE and Yahoo block GitHub's servers; don't route around blocks.
- The analyst gives no buy/sell/hold instructions or price targets (same standing rule as the reels). Next biggest gap: fundamentals from NSE's XBRL results files.
- Rules: read-only, no logins, no getting round blocks; Instagram/Facebook/LinkedIn are not collected. Posts are unverified chatter, never a source for a reel fact.
- This cloud container blocks the social sites (only api.x.com is open; a request to open more was rejected), so only the X lane was tested live. The seed YouTube handles and Telegram channel are unverified until the first Actions run.

## Shankar Medicos ledger checker (2026-11-17, separate from AVRON)
- The user's father runs a chemist shop, Shankar Medicos, and has no AI exposure. The user asked for a system where he uploads PDFs, mail attachments or photos to tally his ledger with the other party's statement.
- User's answers: his ledger is in **Tally or Busy**; he uses **both phone and shop PC**; screen in **Hindi, Punjabi and English, with voice**; reading paid by a **Claude API key**.
- Built in `shankar-ledger/` (repo root): Node server (`server.js`, `lib/extract.js`, Claude copies rows only) + one page (`public/`), matching in plain code (`public/match.js`, 12 tests via `npm test`). README has run steps.
- Live read tested 2026-11-17 on the two made-up sample PDFs (through the page too): all rows, balances and differences correct; about 4,100 tokens in and 900 out per one-page paper on claude-opus-5-5. Real papers, photos and handwriting are still untested. The user pasted an API key in chat; it sits only in `shankar-ledger/.env` in that session's container (ignored by git) and they were told to replace it. Never write a key into the repo or this file. Still open: a real ledger pair to try.
- **Cost (user, 2026-11-17: "we need to lower the costing"):** the reader now uses `claude-haiku-5-5` first and `claude-opus-5-5` only when a paper's totals do not close or rows are unclear. Measured on the samples: about ₹0.20 per check against about ₹6 on Opus alone, same correct result. Keep cost low on this project; don't switch the default back up without asking.
- **Demo (user, 2026-11-18: "I want to use demo"):** a no-server demo with the sample papers preloaded, built by `shankar-ledger/tools/build_demo.sh`, published as a private artifact: https://claude.ai/artifact/6Ln9WF4GXsMoj3fSco1HdV (update it by republishing that URL).
- **Claude page (2026-11-18):** the user tried their own file in the demo and hit the demo-only note, so the same artifact link (Version 2) now reads real papers on the viewer's own Claude account (`sample` capability, no API key, no server), built by `tools/build_claude_page.sh`. Tested only with a stand-in for Claude, not yet with a real read in the viewer. This may replace the Render plan if it works on the father's phone.
- **Where it runs (user, 2026-11-17): on the father's Android phone.** So it must be hosted online and added to the home screen (manifest + icons in `public/`). `render.yaml` at the repo root is a Render blueprint (not yet deployed or verified); the user has to do the Render signup and type the two secrets there. The user chose a shop PIN; it is not written in this public repo, ask them for it. Wrong-PIN lock: 8 per address, 40 overall per hour. Not built: hand-fixing a misread row, Gmail inbox pull, history per party.
- **Never commit a real ledger or statement: the repo is public.** `samples/` holds made-up papers only. AVRON brand rules do not apply to this app.

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
- **Prompt library: always bring it in** ("insta reel tools always work"); the user may add reference videos per reel. **Since brand v2 (2026-10-28):** prompts give structure/timing only, their looks are translated into brand v2, and #3/#5/#6/#7 are not brought into AVRON by default.
- **Motion references (superseded for AVRON by brand v2, 2026-10-28): `references/motion/README.md`.** All the user's reference videos/images (paper collage, comic burst, blue grid, green tunnel, orbit squares, red/cream sunburst, teal warp grid, kinetic type, phone notifications, motion board, plus the Musk reel as a structure reference), with which code already implements each look. Use them with the prompt library on every new reel.
- **Voice: ElevenLabs Tia Mirza** is the default for VO.
- **Viral reel engine (2026-10-27):** the user's "AVRON Autonomous Viral Reel Engine" master loop prompt is saved as prompt #8 (`insta-reel-avron-page/viral-reel-engine/PROMPT.md`) and runs as the `avron-reel-engine` skill (`.claude/skills/avron-reel-engine/`): brief → claim registry → 10 scored hooks → up to 8 rounds → adversarial critique → 10-part pack in `projects/<id>/ENGINE_REPORT.md`, plus `scripts/vo_fit.py` (Tia pace 2.45 words/s, measured from past reads; 60 s ≈ 140 words). When the user says they're asleep or "don't ask", it runs on the confirmed defaults and lists its calls at the end. HyperFrames `compose`/`render_video` are refused from Claude Code, so Remotion stays the render path.
- **Reels in progress:** Musk SpaceX-kids (done: `deliverables/2026-10-musk-spacex-kids/`, AI anchor, Tia VO fitted to the timeline, caption + SEO + cover). Footballer-stocks short (no anchor, Indian stocks): `projects/2026-10-footballer-stocks/SCRIPT.md`.

## Two separate Instagram pages (user, 2026-10-26)
- **AVRON**: professional finance content (these reels). Not connected to Metricool yet, so there is no AVRON analytics.
- **@marketkibatt ("Market Ki Baat")**: character-based content, e.g. the ₹50-share pizza reel (25 Oct). This is the page connected to Metricool (brand id 7601365, "Avron" label).
- Don't mix the two brands on screen. The user downloads finished reels and posts them by hand.

## Motion and on-screen text (user feedback 2026-10-24: "itna ganda graphic"; brand v2 in `brand/BRAND.md` now governs the look)
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
- **Data centres + pharma, "Crash ka wait? Layer dekho" (2026-10-27, autonomous run of the reel engine):** the user's brief was fact-checked and reworked. Their slang hook was dropped. "Immune sectors" was wrong (Anant Raj was 40% off its peak by March). Jyoti CNC has no data-centre link, so it's cut. Voltas is off screen. "95% capacity" was replaced by JLL's 2.8% vacancy. The "upcoming March" semaglutide expiry had already happened (20 Mar 2026; ~10 Indian launchers; Novo cut prices up to 48%). The CTA is now "kaunsi layer?". Pack: `projects/2026-10-datacenter-pharma/ENGINE_REPORT.md`. Silent animatic with an original score and a guide subtitle: `deliverables/2026-10-datacenter-pharma/AVRON_dcpharma_animatic_1080x1920.mp4` (composition `DcPharma`, `scripts/score_dcpharma.py`). **Final (2026-10-28):** cut to the user's Tia VO (50.8 s): `deliverables/2026-10-datacenter-pharma/AVRON_dcpharma_FINAL_Tia-VO_1080x1920.mp4`, 53.0 s, −14.1 LUFS, QC 10/13 (3 expected flags: dark frames and the static end card), ASR read-back 0.902. Captions come from `scripts/captions_dcpharma.py`, plus subtitles.srt and the cover. Caption text is in `projects/.../caption.md`. Not published.
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
- **Motion (motion.dev) installed (2026-10-28, user pasted `npm install motion`):** `motion@14.7.1` (MIT) in avron-reels. `motion-v` (Vue) skipped: no Vue here. In Remotion use only its time-based maths via `src/engine/motion.ts` (`mspring(t, a, ...)`, `cubicBezier`, `interpolate`, `mix`, `stagger`); never `<motion.div animate>` / `animate()` in compositions (browser clock → wrong frames).
- **lemo-opuscar plugin (2026-10-28, user asked):** `claude plugin marketplace add lemomo-ai/lemo-opuscar` + `claude plugin install lemo-opuscar@lemolab` (user scope, commit 413a6bd). A library of 61 code-rendered film styles plus a skill that clones the library (to `~/lemo-opuscar`) and follows its AGENTS.md. SkillSpector `--no-llm`: 24/100 MEDIUM, CAUTION (one flag: `npm install` in setup.sh; reviewed by hand, only installs playwright-core, three and numpy-type packages). Note: the skill updates the library from GitHub (fetch + reset to main) on every run, so its instructions can change upstream. Relevant styles for AVRON's bright & clean look: `living-screencast` (product walkthrough), `swiss-motion`, `dataviz`; `dark-keynote` and `glass-product` are dark; `iso-infographic` is isometric (user banned isometric stacks). Reinstalled automatically on every new session by `.claude/hooks/ensure_agent_tools.sh` (added 2026-10-28, user said "yes add it in").
- The tools are claude-mem (local memory, cloud sync off), Agent Reach 1.6, SkillSpector, and the `no-ai-slop` skill.
- The user wants them used **every time** without being asked (2026-10-24): no-ai-slop on every script, caption and post, and Agent Reach for research.
- The no-ai-slop and agent-reach skills are saved in `.claude/skills/`, so they load from the repo after a reset.
- The CLIs don't survive a reset. A SessionStart hook in `.claude/settings.json` (approved by the user 2026-10-24) runs `.claude/hooks/ensure_agent_tools.sh` on every new session, and it skips what's already installed.
- For the claude.ai chat app, `tools/claude-ai-upload/no-ai-slop.zip` is ready to upload under Settings → Capabilities → Skills.
