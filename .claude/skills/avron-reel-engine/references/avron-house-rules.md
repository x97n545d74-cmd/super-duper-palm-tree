# AVRON house rules that bind this engine

Condensed from `avron-reels/MEMORY.md` (2026-10-27). If MEMORY.md says something newer, MEMORY.md wins. Re-read it at the start of every run.

## Facts and compliance
- Never invent facts, sources, quotes, price moves or footage. Mark estimates as estimates and AVRON's own reading as `AVRON INTERPRETATION`.
- No buy/sell/hold calls, no price targets, no "guaranteed" or "multibagger" language. The end card carries "Opinion only · not investment advice" (or the Hinglish "anuman hai, guarantee nahi").
- Check every number in a brief against a primary source (company filing, NSE/BSE, RBI, MoSPI, SEBI, PIB, CDSCO/USFDA, patent office). Briefs have been wrong before: the thali blueprint said RBI "held" the repo rate when RBI had raised it 5.25% → 5.50% on 7 Oct 2026.
- When WebFetch fails on RBI/MoSPI/BSE pages, Agent Reach (`.claude/skills/agent-reach`) can read them. Research is read-only.

## Language
- Energetic, confident Money-Hinglish. Short, speakable sentences.
- **On-screen text and captions: Hindi in Roman script** ("Sabse zyada maar"), never Devanagari.
- **VO script for recording:** the user TTSes it in ElevenLabs. Give it as one block, Devanagari Hindi + Latin English, numbers spelled out, plus a two-half fallback when it's long. Say "paisaa", not "paise".
- Default voice: ElevenLabs "Tia Mirza – Crisp and Commanding" (`OUBnvvuqEKdDWtapoJFn`, eleven_v4). Never generate a long take without `estimate_only` and stating the credit cost (~577 credits per 600 characters per take).
- Every script, caption, VO line and post text goes through the `no-ai-slop` skill (edit mode) before the user sees it.

## Look (default motion direction)
- High-end minimal: one idea per shot, lots of empty space, one accent colour (red/green only for down/up data), Inter with tight tracking, masked type reveals, match moves, one camera language, cuts on the beat, push cuts with real motion blur.
- **Banned:** camera shake, particles, glows, grid floors, flashes, bouncy easing, full stops in on-screen text, logo animation as the opener, generic AI backgrounds, neon, meaningless tickers.
- Bring in the prompt library (`avron-reels/insta-reel-avron-page/`) and the motion references (`avron-reels/references/motion/README.md`) on every reel. The user confirmed "always bring it in" on 2026-10-27. Pick looks from the references table and name the existing component that implements each (e.g. `musk/Reel.tsx BlueGrid`, `anchor/ReelV2.tsx Collage`, `footy/Reel.tsx Sunburst`, kinetic type `musk/Reel.tsx B8`).
- User favourites: kinetic type (09), phone notifications (10), blue grid (03/04), Pisa paper collage (01), red/cream sunburst (07). The comic burst (02) is the "jhatka" hit: once per reel at most.
- AI anchor (optional): she is secondary, motion graphics lead, always tagged "AI ANCHOR", never a talking-head shot. Speaking shots only with lip-synced clips the user supplies.

## Images
- Allowed: Pexels, Unsplash, Pixabay, Wikimedia Commons, government sources. Never news-agency or Google Images photos, or paid-report chart graphics (use the numbers, draw our own chart). Logos only when reporting on that company.
- The cloud IP is rate-limited on photo sites, so give the user a shot list with paste-ready queries (`site:pexels.com …`); they upload, we log each in `projects/<id>/assets/LICENSES.md`.

## Brands and publishing
- AVRON (finance) and @marketkibatt (character content) are separate pages. Don't mix them on screen.
- Never publish, schedule or boost. The user downloads and posts by hand.
- Topic first, approval before full production. A brief the user pastes into this engine counts as approval for the pre-production pack (script, direction, verification). Rendering a final MP4 with VO still waits for the user's VO or an explicit go.

## Format
- 1080×1920, 30 fps, H.264/AAC, −14 LUFS. Reels safe zones from `src/brand/tokens.ts`.
- Tia's measured pace is ~2.45 spoken words per second including pauses, so 60 s ≈ 140–147 words with numbers spelled out. `scripts/vo_fit.py` in this skill does the count.
