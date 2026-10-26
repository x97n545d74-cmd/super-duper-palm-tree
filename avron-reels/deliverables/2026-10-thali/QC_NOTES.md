# QC notes: final (user's Tia Mirza VO), 2026-10-26

`qc_report.json`: 9/11 PASS (1080x1920, 30 fps, H.264 yuv420p, AAC, duration 52.33 s matches the timeline, no black or frozen frames, −14.2 LUFS, true peak −1.4 dBTP).

Two flags, both reviewed:
- **narration_intelligible_in_mix 0.832.** The mix transcript contains every line of the VO, in order (see `asr.heard`). The gap is formatting: Whisper writes the numbers as words on the mix ("चार दशम्लव आठ तीन") and as digits on the clean VO ("4.83%"). On a character comparison made with the same model and settings, the mix scores 0.902 against the clean VO. The music was dropped to −16 dB and the SFX to −10 dB before this pass.
- **no_near_static_seconds** (2, 5, 17, 20, 23, 25, 36, 38, 51). These are the deliberate holds of the minimal house look: a number lands, then the shot rests on a slow push. No frame is frozen.
