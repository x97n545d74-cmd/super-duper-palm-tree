# Production report: Viviana Power Tech, "₹903 → ₹680"

## Deliverables (this folder)
| File | What |
|---|---|
| `AVRON_viviana_903-680_1080x1920.mp4` | Reel: 66.2 s, 1080×1920, 30 fps, H.264 High, yuv420p, BT.709, AAC 48 kHz stereo, −14.1 LUFS / −1.4 dBTP |
| `AVRON_viviana_preview_540x960.mp4` | Lightweight preview |
| `cover_frame.jpg` | Suggested cover: ₹680.50, ▼24.7%, the real price line |
| `subtitles.srt` / `.vtt` | Hinglish subtitles timed to the narration |
| `script_v2.md` | Final narration, on-screen text and a source for every line |
| `vo_lines.md` | Line-by-line timing sheet for recording a human or ElevenLabs VO |
| `SOURCE_VERIFICATION.md` | 20 claims checked against filings, the call transcript and exchange data |
| `caption.md` | Instagram caption and optional pinned comment (draft, **not posted**) |
| `audio/` | Lossless FLAC: VO, final mix and 6 stems |
| `qc_report.json`, `sheet_*.jpg` | Automated QC and contact sheets |

## Story
The hook is the price move: ₹903.30 on 15 Oct to ₹680.50 on 23 Oct.

The filings around that move:
- **10 Oct, 13:07:** the order filing.
- **10 Oct, 22:48:** the board-meeting notice on warrants.
- **15 Oct:** the board decides not to proceed.

The reel then turns to the business underneath: revenue up 16×, operating cash flow negative for three years, 267 debtor days, and borrowings doubled. The company's own filing says the ₹467 cr order had already been disclosed. Management's side is shown as two verbatim, attributed quotes. It ends on the next checkable event: Q2 results, due by 14 Nov.

**The reel states no cause for the fall and makes no recommendation.**

## How it was made
| Layer | Tooling |
|---|---|
| Research | Agent Reach (web search, read-only) to find NSE filings. Primary PDFs were downloaded and read in full. Daily closes come from Yahoo Finance's NSE feed, and the holiday calendar was checked |
| Script | Drafted, then edited with the **no-ai-slop** skill: rhetorical questions, colon reveals and the punchline kicker were removed. Cut from 104 s to 66 s. One self-caught factual fix (the filings came *before* the fall, not during it) |
| Narration | **Guide voice:** Kokoro-82M `hm_omega` (Apache-2.0, local), aligned with faster-whisper. Mis-timed words were repaired with `scripts/fix_timeline.py` |
| Picture | Remotion 4 + React Three Fiber. The new engine piece is `engine/three/Tower.tsx`: a procedural 400 kV lattice tower line with insulators, catenary conductors and a dusk-sky shader. The filings appear as paper documents with their real excerpts and timestamps. Charts are built from verified values only |
| Sound | Original, synthesised (`scripts/score_viviana.py`): a C-minor ostinato and pads, a clock-tick motif for the filing timestamps, a 50 Hz grid hum when the lines energise, a stamp thud on "not to proceed", paper foley, and the AVRON three-note bell. VO-keyed ducking, two-pass loudnorm |

## QC passes
1. **Pass 1 (stills).**
   - The hook header was sliding into the top bar.
   - The ₹466.74 cr stamp collided with the filing's own stamp.
   - "−11.9%" sat on the line.
   - "2×" overlapped ₹100.
   - The Watch scene was empty for its first 3 s.
   - X-axis labels collided.
   - All fixed.
2. **Pass 2 (first full render).**
   - Frozen holds at 22.8 s, 45.4 s and 63.9 s, plus 9 near-static seconds. Fixed with one continuous camera push across every scene.
   - The cash panels cross-faded on top of each other. They now hand off strictly in sequence.
3. **Pass 3 (audio).** An ASR diff showed the line "तीन साल से operating cash flow negative" was masked by the low pulses in the cash scene. The pulses were cut by about 8 dB. Re-checked: no line is lost in the mix.

**Final QC: 10/11 pass.** The one flag is the "intelligibility" score of 0.827. The word-level diff shows every remaining difference is transcription spelling of the same words (digits vs words, Roman vs Devanagari). The cause is the synthetic voice's diction, not masking. A human or ElevenLabs read will fix it.

## Limitations (honest)
1. **The voice is a temporary guide track.** You've already rejected Kokoro's pronunciation, and it still slurs some numbers. Record `vo_lines.md` (or generate it with your ElevenLabs Tia Mirza voice) and drop it in as `public/viviana/vo_raw.mp3`. The pipeline re-aligns, re-times the captions and visuals, and re-mixes.
2. **Secondary sources.** NCD ₹20 cr @ 12%, debtor days and operating cash flow come from secondary sources (ScanX, Screener). The primary allotment filing and the annual-report cash-flow statement weren't opened.
3. **Prices.** The price series is from Yahoo Finance's NSE feed, cross-checked on 4 dates against NDTV Profit, Finology and Economic Times. It isn't from an NSE bhavcopy.
4. **Rendering.** It's CPU-only WebGL, so there are no path-traced shadows.
5. **Not posted.** Nothing has been published or scheduled.
