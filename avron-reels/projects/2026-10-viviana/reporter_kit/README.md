# AVRON Reel Muse: reporter insert kit (Viviana reel)

Status: **prepared, not composited.** The original render, `deliverables/2026-10-viviana/AVRON_viviana_903-680_1080x1920.mp4`, is untouched.

## Inspection findings
- **No reporter shot exists.** No AVRON reel contains a reporter or any person.
  - Viviana is all graphics plus a 3D tower.
  - Fuel Gap is all graphics.
  - The Shart briefing room has anonymous silhouettes only.
  - So this is an *insert into empty space*, not a replacement.
- **The Higgsfield connector here can't do it.**
  - It's read-only: it lists models, credits and history, and it can import a Claude Motion MP4. It can't generate media or read a saved reference element.
  - Element `d22a3931-951c-4cfd-b60e-3251440cb698` can't be fetched or used from this session.
  - The workspace isn't selected, the plan shows **0 credits (free)**, and the generation history is empty.

## Shot chosen: Shot 6, "THE ORDER" (44.69–50.80 s)
- **Why this shot.** It's the only shot with a large empty band that no graphic uses: y ≈ 1000–1340 px, full width, below the filing card. A presenter there covers nothing.
- **Why it suits her.** The narration is a direct-address beat: "वो ₹467 crore का order? Company के मुताबिक़ पहले ही बताया जा चुका था।"
- **Why the others don't work.** Every other shot has charts or cards in that space, so she would cover data.

### Placement spec (1080×1920 frame)
| | |
|---|---|
| Framing | Medium shot, waist up, 3/4 turn toward the card (camera-left), eye-line up-left to the highlighted filing line |
| Box | x 600–1080, bottom-anchored. Head top at about y 1010; the frame cuts her at the bottom edge |
| Layer order | Background and grid → **reporter** → filing card (above her, no overlap) → captions and AVRON top bar **in front of her** |
| Light | Key from the card (warm paper, about 4200 K, from upper left). Rim from camera-right at about 3200 K. Overall dim, like the scene's −1 EV vignette |
| Grade | Lift blacks to `#06070A`. Desaturate about 15%. The AVRON grain and vignette sit on top automatically (the `Finish` layer is above every scene) |
| Edge | Feathered matte, 2–3 px, with a soft shadow falling onto the grid floor |
| Timing | In at 44.69 s with the scene's own fade (0.01 s) and drift. Out at 50.80 s on the cut. No new transitions |

## What to generate in Higgsfield (in the app, with your element)
1. **Model:** a talking-avatar or lip-sync model that accepts a character element plus audio.
2. **Audio input:** `order_shot_vo_44.69-50.80.wav`. This is the exact approved narration for the shot, unchanged.
3. **Look reference:** `order_plate_t44.9.jpg`, `order_plate_t47.5.jpg` and `order_plate_t50.5.jpg`. Match the light and grade to these.
4. **Output:** 1080×1920 (or larger), at least 6.2 s, on a plain **green or solid** background, or with alpha. Natural blinks, slight breathing, one restrained hand gesture on "पहले ही".
5. **Send me the MP4.** I'll key it and composite it as a separate composition (`VivianaReporter`). It'll be rendered as `AVRON_viviana_903-680_REPORTER_v1.mp4`.

## QC I will run when the clip arrives
- **Rest of the reel unchanged.** An A/B difference against the original render over 0–44.6 s and 50.9–66.2 s must be zero, and the audio must match bit for bit.
- **Inside the shot.** I'll check edges, flicker, the face across frames, and lip-sync against the waveform peaks.

## Caveat: the voice
The approved narration is still the **Kokoro guide VO**. If you later replace it with your ElevenLabs read, this insert must be re-lip-synced to the new audio.
