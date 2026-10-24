# Production report: "शर्त (The Fine Print)"

## Deliverables (this folder)
| File | What |
|---|---|
| `AVRON_shart_final_1080x1920.mp4` | Final reel: 1080×1920, 30 fps, H.264 High, yuv420p, BT.709, AAC 48 kHz stereo, −14 LUFS |
| `AVRON_shart_preview_540x960.mp4` | Lightweight preview |
| `cover_frame.jpg` | Suggested cover (the 2029 reveal) |
| `subtitles.srt` / `subtitles.vtt` | Hinglish subtitles timed to the narration |
| `script.md` | Final narration: timecodes, subtitle text, spoken text, pauses, emphasis, pronunciation decisions |
| `SOURCE_VERIFICATION.md` | Claim-by-claim verification with exact passages and links |
| `qc_report.json`, `sheet_*.jpg` | Automated QC and contact sheets |

**Audio stems** (in `public/shart/`): `vo.wav` (narration), `vo_beats/*.wav` (each line), and `stems/`: `music`, `impacts`, `risers`, `sonic_logo`, `amb_exterior`, `amb_room`, `foley`, `alerts`. Also `mix.wav`. All are 48 kHz.

**Editable project:**
- `src/projects/shart/`: scenes and config
- `src/engine/`: reusable system: `three/BriefingRoom`, `three/ShaderPlane` (storm sky), `three/OilSurface`, `three/Pillars`, `components/Weather` (rain, splashes, photo-plate compositing), `components/Captions` (Hinglish), `components/Fonts`, `components/Kinetic`, `components/DataRoom`, `components/Finish`
- `scripts/`: `tts_kokoro.py`, `score_shart.py`, `mix_stems.py`, `render.mjs`, `stills.mjs`, `qc.py`

## How it was made
| Layer | Tooling | Notes |
|---|---|---|
| Research | PIB, indiabudget.gov.in, RBI, Budget speech PDFs (fetched and text-searched) | One misattribution was caught and corrected (see the source report) |
| Narration | **Kokoro-82M** (Apache-2.0), voice `hm_omega`, synthesised locally beat by beat | Lines are joined with designed pauses and never spliced mid-line. The ElevenLabs workspace had 276 credits, which wasn't enough |
| Subtitles | Token-paired script (spoken ↔ display) aligned with faster-whisper `medium` (Hindi) | Display text is the authored Hinglish, not ASR output |
| Score and SFX | Original, synthesised in `score_shart.py`, with convolution reverbs | String ensemble, cello ostinato, taiko build, heartbeat, metallic ticks, a reduction to near-silence at the clause, a B♭ brass swell at 2029, and a three-note bell sonic logo. Exterior and interior acoustics are separate |
| Picture | Remotion 4 + React Three Fiber (WebGL via SwiftShader; no GPU in the environment) | 3D briefing room, storm-sky shader, ray-traced oil surface, PBR pillars, and CSS-3D documents and charts |
| Real imagery | Your two Raisina Hill night photographs | Composited as real plates into a CG sky, rain and wet-ground reflection. Colour grade only; content unaltered |

## Quality passes
1. **Pass 1 (story, timing, continuity, facts).** The two-roads scene was empty for about 3 s, so the branches now draw early. A stem line cut through the subtitles, so the geometry was moved. The briefing room was blown out by spot and specular light, so it was relit as warm tungsten pools on matte wood with a raised cold backlight.
2. **Pass 2 (typography, motion, sound, grade).** A cross-fade in the two-roads → room transition overlapped, so it now fades. Three near-static holds (9–10 s, 25 s, 39 s) got slow camera drift. Narration was masked under the rain and the market strings: the ASR comparison of clean VO against the mix rose from 0.866 to 0.955 after stronger ducking and lower music and ambience.
3. **Narration fix before render.** The ASR heard "उनतीस" as **2019**, so 2029 is spoken as "ट्वेंटी ट्वेंटी-नाइन".

## Limitations and what's not done
1. **No AI likeness of real people.** I didn't animate or synthesise the PM, Home Minister or Finance Minister. That would be a realistic deepfake of sitting leaders in a political thriller. The briefing room uses original anonymous silhouettes. The supplied leader, cabinet and protest photos are **not used**: the cabinet photo carries The Statesman watermark, the other leader photos have unknown rights, and the protest photo shows identifiable private individuals at an unrelated event.
2. **Rights for the two Raisina photos.** You supplied them, and I can't verify their licence. Confirm you hold the rights, or swap in PIB images (`public/shart/*.jpg`; same crop size).
3. **Voice quality.** Kokoro is clear and intelligible, but it's less expressive than a human or ElevenLabs v4 voice. English loanwords have a Hindi-phoneme accent ("एक्साइज़ ड्यूटी"). Recommended: record or generate a human-grade read of `script.md` and re-run the four-command pipeline in the README. Everything re-times automatically.
4. **Music.** It's original and synthesised, not a live orchestra or a commercial library. Abracadabrax needs you to sign in to your claude.ai connectors. Adobe and Canva weren't used (they need authorisation, and nothing here required them).
5. **Runtime is 68 s**, not 60. The narration wasn't sped up beyond natural pace, as you asked.
6. **I can't listen in this environment.** Audio was checked with loudness metering, per-beat level analysis and ASR read-back, not by ear. Please listen once on a phone speaker before posting.
7. **Real-time 3D is limited by the CPU-only renderer.** There are no path-traced shadows. Depth of field and fog are approximated with shader and compositing techniques.
8. **Nothing has been published or scheduled.**

## Final creative test (honest answers)
1. **First three seconds:** lightning over Raisina Hill, a sub boom on "27 मार्च 2026", and the crude price jumping to a red **$122**. Strong.
2. **One production:** yes. There's a single type system, a colour language per act (cold exterior → tungsten room → crimson markets → near-black gold), and match cuts between scenes.
3. **Character identity:** the figures are anonymous by design, so the issue doesn't arise.
4. **Human narration:** measured and clear, but it's a synthetic voice. A human read is recommended.
5. **Music evolves:** yes. Pulse → strings and taiko build → reduction → silence → B♭ swell → bell logo.
6. **Graphics carry real information:** yes. Every number is sourced, estimates are flagged red, and the glide path is labelled "not data".
7. **Every claim verifiable:** yes. See `SOURCE_VERIFICATION.md`.
8. **The 2029 reveal implies no secret plan:** yes. It only lays three documented facts side by side.
9. **Premium brand ending:** a gold light-sweep wordmark on charcoal, sources and a disclaimer.
10. **MP4 rendered and validated:** see `qc_report.json`.
