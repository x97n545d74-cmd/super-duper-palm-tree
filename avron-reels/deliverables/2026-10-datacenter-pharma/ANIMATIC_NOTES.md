# Data centre + pharma reel: animatic notes

**File:** `AVRON_dcpharma_animatic_1080x1920.mp4`, 60.0 s, 1080×1920, 30 fps, H.264 High / yuv420p / BT.709, AAC 320k, −14 LUFS.
**What it is:** graphics plus an original score and SFX, with no voice. The planned VO line is burned in at the bottom as a small guide subtitle so you can judge the timing. Not published.
**Spec:** `projects/2026-10-datacenter-pharma/ENGINE_REPORT.md`, Sections 3 (timecodes, on-screen text, visuals, transitions), 4 (palette, type, dashed charts) and 5 (audio).

## What was built
| Path | What |
|---|---|
| `src/projects/dcpharma/Reel.tsx` | Composition `DcPharma` (60 s, 30 fps, 1080×1920), registered in `src/Root.tsx`. All scenes are pure functions of absolute time `t`. |
| `src/projects/dcpharma/Building.tsx` | 26.1–38.1 s: the paper-collage data centre (ZAMEEN → SERVER → COOLING) with the camera tilting through it |
| `src/projects/dcpharma/kit.tsx` | Palette, type helpers, source tag, and adapted copies of BlueGrid, Desk, Notif, the comic burst and the graph paper |
| `src/projects/dcpharma/timeline.json` | Beat start/end times and the planned VO lines (from the Section 3 table). Both the scenes and the score read it. |
| `scripts/score_dcpharma.py` | Original score + SFX following Section 5. It writes `public/dcpharma/stems/*.wav` and `public/dcpharma/mix.wav`. |
| `public/dcpharma/mix.wav` | The animatic mix: music + SFX only, normalised to −14 LUFS. The stems (`public/dcpharma/stems/`, about 85 MB) are not committed because `score_dcpharma.py` regenerates them identically. |
| `qc/` | `qc_report.json` plus transition and timeline contact sheets |

The guide subtitle is controlled by one constant: `SHOW_VO_GUIDE` at the top of `Reel.tsx`. Set it to `false` to remove it.

## Components reused (copied and adapted, originals untouched)
- `musk/Reel.tsx` **B8**: pendulum type for the hook (0–3.8) and stacked repeating type for "RACE" (50.7–55.3)
- `musk/Reel.tsx` **BlueGrid** (Nifty −16%), **Desk** and **Notif** (38.1–50.7: the lock screen, the notification stack, the Novo price tag)
- `anchor/ReelV2.tsx` **S2b** comic burst (19.8–21.9, the reel's only burst) and the **Collage** graph paper + grass strip (26.1–38.1)
- `footy/Reel.tsx` **Cta** bead ring (55.3–58.7)
- New pieces: the rack-fill icon, the pill capsule, the collage cross-section (slab, hall, rack with 62% bar, chiller with turning fans), and the struck-through price tag

## Calls I made
1. **Timing is the planned timing from the Section 3 table.** There is no VO yet, so every cut sits on the table's timecodes.
2. **Pendulum hook:** the words hang on strings from the top of the frame and settle onto the white line at 62% height. They use a critically damped swing (no overshoot), so the type is set by frame 12 with no bounce. "KA WAIT?" is 170 px (CRASH is 200 px) because 200 px would not fit the width.
3. **Dashed lines:** Nifty (26,373 → 22,180) and Anant Raj (₹744 peak → March level) are dashed between the two verified points. The pharma-vs-Nifty sketch is dashed too and labelled "direction, 1 saal", with no y-axis values.
4. **Vacancy rack:** 36 slots fill in three steps of 12 (each synced to a digital tick) with one slot left empty. 1/36 ≈ 2.8%, so the picture matches the number.
5. **Source tags:** the table gives source tags for some rows only, and Section 4 asks for one on every number. I took the rest from Section 7's own source column, adding no new sources: "Natco NSE filing, 20 Mar 2026", "Business Standard, ThePrint · NSE filings · Business Today", "Outlook Business", "Anant Raj: company guidance · Lodha release + deck" (Section 7 asks for "company guidance" on the MW figures), "Netweb Q1 FY27 results", and "Blue Star deck + release, Aug 2026". No new numbers were added anywhere.
6. **Palette:** the collage drops its gold sun (Section 4 allows no gold). The comic burst keeps its yellow and orange, because the table names that look. The CTA bead ring uses white, grey, red and green instead of the footy reel's gold, magenta, teal and navy.
7. **Notifications:** Lupin, Torrent, Dr Reddy's and "Sun …" show as title-only bubbles, because the table gives them no body text. After the six bubbles, three stacked edges plus the "~10 COMPANIES" counter stand for the rest, with pings continuing every 0.5 s up to 46.8 s.
8. **Novo price tag:** it reads "NOVO / DAAM" and the red strike runs through "DAAM", because no old or new price is given. The counter runs to −48%.
9. **Lock screen:** it shows "20 MAR" and a lock icon only, with no clock time and no weekday, to avoid adding facts.
10. **Phone buzz** is sound only. A shaking phone would read as camera shake, which is banned.
11. **The AVRON corner badge** used on older reels is left off because the spec doesn't ask for it. The brand appears on the end card.
12. **Slow push** (2% per second) is applied per shot. Source tags and the subtitle stay in screen space so the push never drifts them into the caption band.
13. **Audio:** the animatic mix keeps music 16 dB under the (absent) VO reference and the SFX at their Section 5 offsets. The whole mix is then normalised to −14 LUFS with a look-ahead limiter, which keeps the dropout (19.8–20.3) and the tail (58.7–60.0) digitally silent. The hard stop at 58.7 has a 5 ms declick and no reverb tail.

## QC (`scripts/qc.py`, results in `qc/qc_report.json`)
- PASS: 1080×1920, 30 fps, H.264 + yuv420p, AAC, duration 60.01 s vs 60.0 s, loudness −14.1 LUFS, true peak −2.0 dBFS
- FLAG, expected: `no_black_segments`. The palette background is near-black #0A0A0B, so the detector flags the opening frames of mostly-black shots (the split screen 9.2–9.5 before its line drawings appear, Pharma 16.6–16.9, the Anant Raj open 21.9–22.4, the lesson open 50.7–50.9). It also flags the end card, 58.7–60.0, which is black with small type by design (Section 3: "End card, static"). Every flagged span was checked on the contact sheets: none is an empty frame.
- FLAG, expected: `no_frozen_segments_over_1.2s` at 58.7 and `no_near_static_seconds` at 59: the static end card the spec asks for.
- SKIPPED: the ASR read-back. There is no VO, and faster-whisper isn't installed in this container. Run it once the Tia VO is mixed in.

Summary for the final render: 7 of 10 checks pass; the 3 flags are the expected ones above.

## Swapping in the Tia VO later
1. Record the VO from ENGINE_REPORT Section 9 (Tia Mirza, Crisp and Commanding, eleven_v4) and save it as `public/dcpharma/vo_raw.mp3`.
2. Align: `pip install faster-whisper`, then `python3 scripts/align.py public/dcpharma/vo_raw.mp3 projects/2026-10-datacenter-pharma/words.json`. For Hinglish, the thali route (`scripts/timeline_thali_user.py`, with Whisper digit matching for spoken numbers) gives better word times.
3. Write the real beat `start`/`end` times (and per-beat `words` arrays) into `src/projects/dcpharma/timeline.json`. Set `voEnd` to the end of "karo". Then run `python3 scripts/fix_timeline.py src/projects/dcpharma` to repair any bunched or out-of-order word timings.
4. Re-time: the scenes and the score both read `timeline.json`, so re-run `python3 scripts/score_dcpharma.py`. Copy or convert the VO to `public/dcpharma/vo.wav` and mix with VO-keyed ducking: `python3 scripts/mix_stems.py public/dcpharma`. Its default stem gains apply; pass a gains JSON to keep music about 16 dB under the voice. A few in-scene cues are offsets from the beat start (for example the counters and the rack-fill steps). Check them in stills and nudge them to the spoken word if needed.
5. Set `SHOW_VO_GUIDE = false` (or switch to word-synced captions from `engine/components/Captions`), then render stills, render, and run `python3 scripts/qc.py <mp4> src/projects/dcpharma <out> public/dcpharma/vo.wav` for the ASR check.

---

# Final cut (2026-10-28): the user's Tia VO

**File:** `AVRON_dcpharma_FINAL_Tia-VO_1080x1920.mp4`, 53.01 s, 1080×1920, 30 fps, H.264 High / yuv420p / BT.709, AAC 48 kHz stereo, −14.1 LUFS integrated, −1.5 dBTP. Also in this folder: `cover_1080x1920.jpg` (hook frame at 1.4 s, both words set), `subtitles.srt` (43 captions, Roman Hinglish) and `qc_final/` (report and contact sheets). Not published.

## What changed
- **Timing.** `src/projects/dcpharma/timeline.json` holds the real beat times from the VO (the planned ones are in `timeline_planned.json`). The reel is now 53.0 s: VO 0–50.75 s, end card 50.8–53.0 s.
- **Scenes.** No absolute times are left in `Reel.tsx` or `Building.tsx`. Each in-scene cue is an offset from its beat's `S(id)`/`E(id)`, keyed to the spoken word:
  - Hook: CRASH at 0 s and KA WAIT? at 0.6 s, both set by ~0.9 s, out over the last 0.3 s of the beat.
  - Nifty: −16% counts up on "solah pratishat".
  - Vacancy: 2.8% and the empty-slot pulse land on "2.8".
  - Pharma: DOUBLE DIGIT lands on "ek saal mein", so it holds ~1.6 s.
  - Burst: hit at beat + 0.45 s on "stock", collapse 0.3 s.
  - Anant Raj: −40% is reached just before "chaalis".
  - Race: Natco and Zydus arrive on their spoken names, and "~10 COMPANIES" lands on "das companies".
  - Lesson: RACE SHURU and DAAM NEECHE land on their words.
  - CTA: the COMMENT KARO pill lands on "comment".
  - Building: the zameen cards are in by +0.4 s, Netweb's 62% fades on the cut to cooling, and the cooling text holds until 0.6 s before the zoom-out.
  - `BURST_HIT` and `raceArrivals` are exported from `Reel.tsx` and mirrored in the score.
- **Captions.** The planned-VO guide (`SHOW_VO_GUIDE`) is removed. `scripts/captions_dcpharma.py` maps each Roman chunk from `VO.md` (2–5 words) onto the whisper word indices and writes `captions.json` plus `subtitles.srt`. Captions switch on real word boundaries and use the same slot and style as the old guide (40 px, 70% white, dark pill, bottom of the safe area). Full stops are removed but decimal points stay. "Pharma mein" was missing from `vo_words.json`. Its time (34.10–34.72) comes from a word-timestamp pass on the 33.3–35.3 s clip, checked against the energy envelope. "20" was moved to start at 34.85.
- **Score.** In `scripts/score_dcpharma.py`, every cue is a beat start plus a word offset:
  - The beat drops in on "Nifty" (2.9 s).
  - The dropout runs 16.15–16.6 s, with the low hit on "stock".
  - The beat comes back on Anant Raj (17.8 s). The hats drop at the desk (33.95 s).
  - The low-pass filter-down is scaled to the lesson + CTA.
  - Hard stop at 50.75 s (end of "karo"), with a 5 ms declick and silence under the end card.
  - The phone buzz sits in the pause before "Pharma mein", at −20 instead of −12, so it doesn't mask those words.
- **Mix.** `public/dcpharma/vo.wav` is the user's MP3 at 48 kHz/24-bit, untouched. The mix command is `python3 scripts/mix_stems.py public/dcpharma projects/2026-10-datacenter-pharma/mix_gains.json`, with gains music −15, impacts −8, risers −10, foley −8 and alerts −6. VO-keyed ducking, then a two-pass loudnorm to −14 LUFS / −1.5 dBTP. Measured: the ducked bed sits 16–17 dB under the VO in every section except the desk, where the notification pings and the Novo low hit sit about 10 dB under.

## QC (`qc_final/qc_report.json`)
- PASS (10 of 13):
  - 1080×1920, 30 fps, H.264 + yuv420p, AAC.
  - Duration 53.01 s vs 53.0 s.
  - −14.1 LUFS, true peak −1.5 dBFS.
  - **ASR read-back 0.902** (whisper medium on the mix vs the clean VO; it hears every line in order, "Pharma mein" included).
- FLAG, expected (the same three flags as the animatic):
  - `no_black_segments`: near-black opening frames of the themes, pharma, Anant Raj and lesson shots, and the CTA collapse. Every span was checked on the contact sheet and none is empty. Also the end card, 50.8–53.0 s.
  - `no_frozen_segments_over_1.2s` at 50.8 s and `no_near_static_seconds` at 51–52 s: the static end card the spec asks for.

## Calls I made
1. KA WAIT? swings in at 0.6 s, ahead of the spoken "wait" (1.18 s), so both words are set by ~0.9 s. CRASH stays on frame 0 so the first frame isn't empty.
2. Some holds are below 3 words/s because the beats are short:
   - Zameen (1.9 s): both cards are on screen for ~1.6 s.
   - Layers (2.4 s): the four lines hold ~1.7 s, and the GW line isn't spoken.
   - I sped up the reveals instead of cutting on-screen facts. Freeze-frame readers still get everything.
3. The race source tag is shortened to "Business Standard, ThePrint · NSE · Business Today" so it fits on one line under the NATCO +12% pill. That pill moved down 18 px off the stacked notification edges.
4. Caption style is the old guide subtitle's, not the engine's karaoke captions. The brief asked for the same position and style.
5. The cover is taken from the final frame at 1.4 s, so it includes the caption "wait kar rahe the na?".
6. The animatic files (`AVRON_dcpharma_animatic_1080x1920.mp4`, `qc/`) are kept for reference.
