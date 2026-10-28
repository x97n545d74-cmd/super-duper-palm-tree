# AVRON brand v2: finance as product UI

Locked 2026-10-28. This file is the law for every AVRON reel. If a brief, a prompt from the library or a reference video asks for something else, this file wins, unless the user says otherwise in writing for that reel.

**Why it exists.** An analyst reviewed the page in October 2026 and found it read as "made with Claude": every reel had a different look (paper collage, comic burst, sunburst, green tunnel, blue grid), the sound was synthetic, and nothing made a viewer recognise AVRON before seeing the name. The fix is one look, one sound and one set of moves, repeated until people recognise them.

Research behind the numbers: `research/brand-2026-10/UI_MOTION_TASTE.md` (motion) and `research/brand-2026-10/SOUND_DESIGN.md` (sound). Code: `src/brand/ui.ts` (tokens) and `src/engine/ui/` (components). Reference render: `deliverables/2026-10-brand-v2/AVRON_brand-v2_style-demo_1080x1920.mp4` (composition `BrandDemo`).

## 1. The idea in one line

Every AVRON reel is a screen recording of one calm, premium finance app (the "AVRON app") that answers a question with sources. The app is the presenter. No faces, no terminals, no chat bubbles, no AI sparkle.

What this is **not**: a Claude Code terminal, a typing-into-a-prompt shot, a chatbot UI, neon dashboards, fake trading terminals with tickers, or a different "aesthetic" per reel.

## 2. Look (fixed)

| Thing | Rule | Token |
|---|---|---|
| Canvas | Warm near-black with a soft top light falloff and fine grain. No grids, tunnels, sunbursts, paper, photos behind UI | `ui.canvas`, `Canvas` |
| Panels | One panel style: `ui.surface`, 40 px radius, 1.5 px hairline border, two-layer shadow. Depth comes from scale, blur and shadow, never glow | `Panel`, `shape` |
| Accent | **Gold, used only for chrome**: cursor dot, active tab, highlighter, wordmark dot, the one key word in a caption. Never a data colour | `ui.gold` |
| Data colours | Green = up, red = down, dashed grey = estimate or forecast. Nothing else is green or red | `ui.up`, `ui.down`, `ui.estimate` |
| Type | Inter Display for headlines and hero numbers (−0.045em to −0.03em tracking), Inter for UI, JetBrains Mono uppercase for source tags, dates and chips. Tabular figures always. Two families max | `type`, `txt`, `monoTxt` |
| Sizes | Hero 168, H1 112, H2 76, title 56, body 40, label 30 (px on 1080×1920) | `type` |
| Layout | Shell bar at y 236, headline from y 350, panels between y 520 and y 1360, captions on the 1395 band, nothing important below 1560 (IG overlay) | `Shell`, `Caption` |
| Language | Hindi in Roman script on screen. No full stops on screen | (house rule) |

## 3. Motion (fixed)

- **Curves.** Enter `cubic-bezier(0.23, 1, 0.32, 1)`. Camera, cursor and on-screen moves `(0.77, 0, 0.175, 1)`. Exits `(0.2, 0, 1, 0.9)`, shorter than their entrance. Never ease-in on an entrance. Use `curve.*` from `src/brand/ui.ts`; never hand-write another.
- **No bounce.** Springs are critically damped (`motion.springs.settle` / `.snap`). Remotion's default `spring()` is bouncy and is banned. No `outBack`.
- **Durations.** Micro 0.18 s, base 0.42 s, large 0.72 s. Stagger 0.06 s, max 8 items.
- **Entrances** start at scale 0.96, 6 px blur, 24 px low. Never from scale 0.
- **One primary motion and one secondary motion at a time.** 80% of the frame stays still.
- **Holds.** A hero number holds still ≥ 1.2 s after it lands. A headline of n words holds `max(1.5, 0.3n + 1.0)` s.
- **Camera.** One language: push in to focus, pull out to reveal, slow dolly while holding. Motion blur (180°) on camera moves only.
- **Transitions: only these four.** Push (`push`), zoom-through into the element that leads to the next idea (`zoomThrough`), panel morph (`morph`), bottom sheet for a new chapter. No fades between shots, no wipes, flashes, whip smears or glitches.

## 4. Signature moves (use these every reel)

Repetition builds recognition. Every reel uses moves 1, 2, 3, 5 and 7. 4 and 6 when the story allows.

1. **Shell bar.** The same top bar on every shot: gold dot, breadcrumb (`Markets / Data centres / Layers`) and `Data as of <date>`. The breadcrumb changes as the story moves. (`Shell`)
2. **Crop-in pull-out hook.** The reel opens on an extreme crop of the one number that matters (scale ~2.5), then pulls out to show the card it lives in. The hook headline reveals above it. The hook lands in under 2 s.
3. **The AVRON cursor.** One cursor asset (white arrow, gold dot), curved path, arrives early, presses to 0.86 and leaves a thin ring. It clicks on the stressed syllable of the VO word that names the action. At most one cursor journey per 5 s. (`Cursor`)
4. **Panel morph.** A comparison or a "next layer" is one panel changing state, not a cut to a new screen. (`morph`)
5. **The receipt.** AVRON's trust move. A filing or report card opens, the key line appears (quote it word for word if it's a quote; label it as a data line if it's a figure) and a gold highlighter sweeps it. The other lines are neutral bars, never fake text. Every reel has at least one. (`Receipt`)
6. **Insight toast.** AVRON's reading, or a caution ("Strong theme bhi crash mein girta hai"), slides in as a toast. (`Toast`)
7. **End card by reel goal.** Same frame every reel, content set by the one goal (script method, `insta-reel-avron-page/script-method/PROMPT.md`): comments → `Poll` with an easy, meaningful question; saves → a checklist panel worth coming back to; shares → who should receive it; followers → what the next reel in the series answers; leads → one natural next step. Always followed by the `Saved to AVRON Watchlist` toast and the disclaimer line. (`Poll`, `Saved`, `Disclaimer`)

8. **Card moves** (from the user's references, 2026-10-28, `src/engine/ui/cards.tsx`): the **card wheel** for a set of choices (lands one card on top, the others dim); the **card flip** for question → proof (edge-on entrance, sheen, flip; the back carries the number and its source); and **cause → effect** (a gold puck is pressed, a pulse runs down a cable, the target slab swells per pulse, then splits; estimates split into dashed pieces). Use at most two of the three per reel so each stays special.

Plus on every number: a mono source chip under it (`Source`), and `ANUMAAN` with a dashed shape for estimates.

## 5. Sound (fixed)

- **One kit, made once, reused on every reel**: `public/sfx/avron_kit_v1/` (spec and prompts in `brand/sound/kit_v1.json`, generated with ElevenLabs Sound Effects by `scripts/sfx_kit.py`). Never generate per-reel SFX, and never synthesise SFX in Python for AVRON again. A new sound needs a kit v2 decision.
- All tonal sounds share one key (D major / B minor) and one timbre (warm mallet + glass). The sonic logo is three notes (up, down, small leap), ≤ 2 s, on the end card. Its first two notes are the hook sting.
- **Only state changes get a sound.** A click gets `ui_tap`, a panel `panel_open`, a push `whoosh_push`, a landed hero number `number_land`. Never more than 2–3 discrete sounds in one second. Per reel: 1 sonic logo, ≤ 2 `sub_drop`, ≤ 3 `number_land`, ≤ 1 riser per 20 s.
- **Levels vs VO peaks.** Taps −10 to −12 dB, movement −6 to −10 dB, hero hits up to VO level only in VO gaps, room tone −25 to −30 dB. Snap clicks into gaps between words (use the word timings). Every low sound has a saturated 150–600 Hz layer so it survives a phone speaker.
- Music: one house bed family under the kit, ducked under VO (existing `mix_stems.py` rules). Voice stays Tia Mirza (ElevenLabs).
- Until the kit exists, a reel ships with VO + music only, not synthetic SFX.

## 6. Banned (on top of the house bans)

Glow, bloom, lens flares, particles, neon, glitch, RGB split, flash frames, whip-pan smears, camera shake, bouncy easing, grid floors, comic bursts, paper collage, sunbursts, tunnels, spinning 3D logos, logo-animation openers, gradients on text, more than one accent colour, fake tickers, terminals and code editors, chat/prompt UIs, typing-a-question-into-AI shots, Claude/Anthropic marks or the Claude orange (`#D97757` and its neighbours), stock photos behind UI.

The retired reference looks (`references/motion/` 01, 02, 05, 06, 07, 08, 12) stay on file for other clients. They are **not** used on AVRON. The blue grid (03/04) is retired too: blue-glow data scenes are what every SaaS-styled reel already looks like.

## 7. Covers and the profile grid

Every cover uses `BrandCover`: series chip (gold), a two-to-four-word title, one hero number in a panel, the wordmark. All content inside the 3:4 grid crop (y 240–1680). Nine covers in a row should look like one product.

## 8. Recurring series (suggested, user to confirm)

Named series make a page memorable. Suggested: **Layer** (who earns from a theme, layer by layer), **Receipt** (a viral money claim checked against the filing), **Screener** (the user's stock screen: under ₹10,000 cr market cap, emerging segment, guidance above 20%). The series name goes in the cover chip and the first breadcrumb.

## 9. What stays from before

Facts first and the claim registry, no buy/sell/hold, Hinglish VO in Tia's voice, the reel engine's story loop, 1080×1920 at 30 fps and −14 LUFS. Brand v2 changes how AVRON looks and sounds, not what it says or how it checks facts.
