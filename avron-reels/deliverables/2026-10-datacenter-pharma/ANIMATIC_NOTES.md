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
