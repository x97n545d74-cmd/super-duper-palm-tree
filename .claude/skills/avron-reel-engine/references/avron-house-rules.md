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

## Look and sound: brand v2 (locked 2026-10-28)
- Everything visual and audio follows `avron-reels/brand/BRAND.md` ("finance as product UI") and the `avron-brand` skill gate. That file replaces the old look rules and reference-look list here.
- Short form: one premium finance app as the presenter; warm near-black canvas, one panel style, gold as the only accent (chrome only), green/red for direction only, dashed grey for estimates; Inter Display / Inter / JetBrains Mono; critically damped motion on the brand curves; push / zoom-through / morph / sheet transitions only; seven signature moves (Shell, crop-in hook, cursor, morph, receipt, toast, poll + Saved).
- SFX only from the ElevenLabs kit (`public/sfx/avron_kit_v1/`); no synthesised SFX. Until the kit exists: VO + music only.
- Retired for AVRON: paper collage, comic burst, blue grid, tunnels, orbits, sunburst, warp grid, hexagons, phone-desk notifications, terminals, chat UIs.
- AI anchor (optional): secondary, always tagged "AI ANCHOR", never a talking head; she appears inside a Panel like any other UI element.

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
