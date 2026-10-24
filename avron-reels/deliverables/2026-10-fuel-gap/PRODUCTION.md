# The ₹34 Gap: production notes

**Final file:** `AVRON_fuel-gap_final_1080x1920.mp4`. Specs: 60.48 s · 1080×1920 · 30 fps · H.264 High · yuv420p · BT.709 · AAC 48 kHz stereo · 2.32 Mbps · −14.2 LUFS integrated / −1.4 dBTP. Narration: ElevenLabs v4, voice "Tia Mirza – Crisp and Commanding" (supplied by AVRON). Alternate male-voice cut: `AVRON_fuel-gap_alt_male-voice_v2.mp4`.
**Preview:** `AVRON_fuel-gap_preview_540x960.mp4`. **Cover suggestion:** `cover_frame.jpg` (the "SAME ₹95.20" frame).

## Storyboard (timings shown are for the male-voice v2 cut; v3 follows the same beats re-timed to the supplied narration)

| Time | Beat | Visual | Motion / VFX | Sound |
|---|---|---|---|---|
| 0.0–4.0 | Hook: price | Backlit pump display: ₹95.20 on CSS-3D digit drums, over a ray-traced oil surface | Drums spin and settle with motion blur; camera descends toward the oil | Sub impact, low drone |
| 4.0–9.3 | Hook: loss | "The company selling it may be losing" → **−₹34** slams in | Price card lifts away; scale-slam with chromatic split, shake and impact flash; oil shifts toward red; ripple ring | Riser into impact; bass pulse enters |
| 9.3–15.0 | Brent | **$113.17**, "▲ 4% on the day", "after attacks in Saudi Arabia" | Push-through transition; low orbit over the oil; counter roll; the number collapses into a dot as a match cut | Whoosh, counter ticks |
| 15.0–18.8 | Freight | Gulf→India lane (labelled illustrative), **×8**, freight share bars (~3% → 25%+) | Light-trail route draw, flow particles, overshoot pop, bar growth; diagonal wipe out | Low knock on "8" |
| 18.8–24.2 | May hikes | Step chart: 87.67 → 90.67 → 91.58 → 92.49 → 95.20, "+₹7.53 · +8.6% in 10 days" | Chart tilted in 3D with continuous orbit; each step drawn on its cue | Four mechanical clunks; hats enter |
| 24.2–29.0 | Freeze | Axis stretches to 23 Oct, dashed line at ₹95.20, **SAME** | Pull-back (x-domain animation); white flash on "same" | Music drops out on "same" (deliberate silence), then returns |
| 29.0–35.6 | Estimates | ICRA ~₹9 (Sep) vs Jefferies ₹34 (22 Oct), "different dates & methods" | Glass bars with reflections; the bars hand off to the pillars as a match cut | Tick, knock, quarter-note pulse |
| 35.6–41.0 | Who pays | 3D pillars: COMPANY · GOVERNMENT · YOU, each lit on its word; then "Right now: the companies" | PBR pillars, emissive caps, floor bounce light, camera dolly; the company pillar compresses under load | Three panned knocks |
| 41.0–43.7 | Payoff | "What comes next depends on **crude.**" | The oil returns; specular sweep across the type | Swell into the resolve |
| 43.7–49.1 | CTA | AVRON logotype, "The story behind the numbers.", FOLLOW AVRON, source card, disclaimer | Letter-by-letter 3D reveal, light sweep, slow push-in | Riser, final impact, shimmer |

Captions are word-synchronised from ASR timestamps. The active word lights up, numbers are coloured by meaning (amber for prices, red for losses), and captions are hidden on the end card, which typesets the CTA itself.

## Fact control
- Every figure on screen carries a source tag. Estimates (Jefferies, ICRA) use the red **estimate** style. "The gap lands on the oil companies" is tagged **AVRON INTERPRETATION**.
- The chart plots only verified points. The 25 May → 23 Oct segment is **dashed**, because both endpoints are verified but the days in between were not checked individually.
- I left out two claims I couldn't verify well enough: BPCL's Q2 FY27 figures and a reported March 2026 excise cut. See `research/sources.json`.

## QC (automated, on the final file): 11/11 passed
Checks: dimensions, fps, codec and pixel format, AAC, duration vs timeline, no black segments, no frozen segments over 1.2 s, no near-static seconds, loudness −14 ±1 LUFS, true peak ≤ −1 dBTP, and an ASR read-back of the narration against the script (0.992 similarity on v3). Contact sheets: `sheet_transitions.jpg`, `sheet_timeline.jpg`.
I visually reviewed frames from both sheets plus the impact moments. Fixes made after v1: the loss figure no longer rolls through "₹33"; the pillar labels no longer bleed into the estimates bars; the flash is reduced; drift was added to the chart and the end card; and Brent rolls from $0 instead of $80.

## Known limitations / manual steps
1. **Music:** Abracadabrax needed a fresh sign-in and couldn't be used from this session. The score is original and synthesised in code. If you want a generated track, sign in to Abracadabrax and re-run the mix with that track as `music.wav`.
2. **Voice (resolved in v3):** AVRON supplied an ElevenLabs v4 read (Tia Mirza). Earlier note: your ElevenLabs workspace had 706 credits, not enough for the Eleven v4 model (898 needed). The narration uses **Turbo v2.5** with the voice "Kamran – Narration" (429.5 credits). After topping up, regenerate the same text on v4 for more expressive delivery and re-run `build_vo.py` → `score.py` → `mix.sh` → render.
3. **Playback:** this environment has no audio output. I checked audio with loudness metering and an ASR read-back, not by ear. Please listen once before posting, especially to how "AVRON" is pronounced.
4. **Publishing:** nothing has been posted or scheduled. Use the caption variants in `script_and_captions.md`.
