# AVRON Reels: cinematic reel production engine

This engine turns a researched, fact-checked story into a 1080×1920 / 30 fps H.264 Instagram Reel. Each frame is rendered as code: Remotion handles composition, Three.js handles real-time 3D, and FFmpeg does the encoding and audio work. The output is deterministic, so the same inputs always produce the same video.

## Pipeline

```
RESEARCH ──► projects/<id>/research/sources.json   claim registry (IDs, URLs, status, qualifiers)
SCRIPT   ──► projects/<id>/script.md               narration, on-screen text, captions, labels
VOICE    ──► public/<id>/vo_raw.mp3                ElevenLabs (or any TTS / human VO)
ALIGN    ──► scripts/align.py                      faster-whisper word timestamps -> words.json
PACE     ──► scripts/build_vo.py + pacing.json     beat cuts at quietest points + designed pauses -> vo.wav, timeline.json
SCORE    ──► scripts/score.py                      original procedural music + SFX on cue times; writes cues into timeline.json
MIX      ──► scripts/mix.sh                        VO-keyed sidechain ducking, two-pass loudnorm (-14 LUFS, -1.5 dBTP) -> mix.wav
SCENES   ──► src/projects/<id>/                    scenes read absolute time + shared cue sheet
REVIEW   ──► scripts/stills.mjs                    render review stills at any timestamps
RENDER   ──► scripts/render.mjs                    H.264 High / yuv420p / BT.709 / AAC 320k
QC       ──► scripts/qc.py                         specs, black/frozen frames, loudness, motion, ASR read-back, contact sheets
```

`timeline.json` is the single source of truth for timing. Captions, scene animations and sound effects all read the same cue times, so they stay in sync.

## Folder structure

```
src/brand/tokens.ts            colours, type, Reels safe zones
src/engine/anim.ts             easing, progress, deterministic random
src/engine/components/         Odometer (CSS-3D digit drums), Kinetic (WordReveal, Label, Counter,
                               SourceTag, SweepText), Captions (word-synced), DataRoom (3D grid + depth motes),
                               Finish (grain, vignette, progress hairline, impact flash)
src/engine/three/              OilSurface (ray-traced liquid shader), Pillars (PBR 3D pillars + label projection)
src/projects/fuel-gap/         config (timeline → captions), Reel (layers, camera keys, shake), scenes/*
projects/2026-10-fuel-gap/     research, script, pacing, words, timeline
public/                        audio stems + brand textures
```

## Re-render this reel

```bash
npm install
npx remotion browser ensure
pip install faster-whisper scipy numpy

# audio (only if VO or pacing changed)
python3 scripts/build_vo.py projects/2026-10-fuel-gap public/fuel-gap/vo_raw.mp3 public/fuel-gap/vo.wav
python3 scripts/score.py projects/2026-10-fuel-gap public/fuel-gap
scripts/mix.sh public/fuel-gap

# preview / render / QC
npx remotion studio src/index.ts                      # interactive preview
node scripts/stills.mjs FuelGap out/stills 2.5 7.2    # spot frames
node scripts/render.mjs FuelGap out/AVRON_fuel-gap.mp4
python3 scripts/qc.py out/AVRON_fuel-gap.mp4 projects/2026-10-fuel-gap out/qc
```

This machine has no GPU, so WebGL runs through SwiftShader (`gl: "swangle"`). On a machine with a GPU, use `angle` for a faster render.

## Starting a new reel

1. Copy `projects/2026-10-fuel-gap/` to a new folder. Fill in `research/sources.json` first: no claim goes into the script without a claim ID.
2. Write `script.md`, generate the voice-over, then run `align.py` and set the beat starts in `pacing.json`.
3. Copy `src/projects/fuel-gap/` and keep the engine components. Write new scenes as pure functions of `t`, the absolute number of seconds.
4. Register the composition in `src/Root.tsx`.

## Editorial rules (built into the components)

- Every on-screen figure carries a `SourceTag`. Estimates use the red `estimate` style, and AVRON's own inferences are tagged `AVRON INTERPRETATION`.
- Charts only plot verified data points. Where the values between two verified dates haven't been checked, that segment is drawn dashed.
- No buy/sell/hold calls, price targets or return claims. The end card carries the disclaimer.

## Licences

- Remotion: free for individuals and companies with three or fewer employees. Larger companies need a company licence (remotion.dev/license).
- Three.js, d3, React: MIT.
- Fonts: Inter and JetBrains Mono, both under the SIL OFL.
- Music and SFX: original, synthesised in `scripts/score.py`.
- Voice-over: ElevenLabs, voice "Kamran – Narration", used under the account holder's ElevenLabs plan terms.
