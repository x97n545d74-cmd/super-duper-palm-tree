# Red Bull Media Flywheel: design spec

A one-reel look override (the user asked for "the most advanced version"). It keeps the user's palette and applies AVRON's pro motion rules. brand_lint will flag the palette. That's expected, and brand v2 stays the default for the next reel.

## Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--matte` | `#0A0A0C` | Canvas, end fade |
| `--panel` | `#141418` | Cards, stat tiles |
| `--panel-2` | `#1C1C22` | Inner panels, track bed, quiet circle |
| `--line` | `#2A2A32` | 1.5 px card borders, gridlines |
| `--yellow` | `#FACC15` | **Data callouts and key metrics only**: one hero word per beat, Red Bull's numbers, the flywheel, the Follow button |
| `--crimson` | `#EF4444` | Contrast and "the old way": Coca-Cola's bar, the hook strike, the LIVE dot, paid-ad column |
| `--white` | `#FFFFFF` | Headlines, values |
| `--dim` | `#9A9AA6` | Labels, sub-lines |
| `--dim-2` | `#5C5C68` | Axis text, sources |

Rules: yellow never appears on more than one element per beat, except inside a chart. Crimson never carries good news. Dashed shapes and the chip "est." always mean estimate.

## Type
- Headlines: Inter (Display optical size) Black 900, ALL CAPS, tracking −0.045em, leading 0.92, 86–210 px.
- Body and values: Inter 600–800, sentence case, 34–56 px.
- Labels and sources: JetBrains Mono 500/700, ALL CAPS, tracking 0.12em, 20–28 px. Nothing under 20 px on a 1080 canvas.
- Numbers use tabular figures (`tnum`) so counters don't jitter.

## Motion rules (what replaces the cue sheet's cheap effects)
| Cue sheet says | Used instead | Why |
|---|---|---|
| Glitch text reveal | Three-slice masked reveal: each line is cut into three horizontal strips that slide in 4 frames apart | Same "broken signal" energy without RGB split or flicker |
| Vinyl scratch | Keep it in the audio. No visual stutter | Sound carries the stop |
| Whip pan | Push cut: 0.42 s, `cubic-bezier(.7,0,.2,1)`, horizontal motion blur that peaks mid-move | Reads as camera motion and stays sharp at both ends |
| Fast flash cut | Hard cut on the beat plus a 0.25 s scale settle from 1.06 to 1.0. No white frames | Flashes hurt on phones and look cheap |
| Morph | The neon-chart photo shrinks and blurs into the can while the can outline draws | One continuous object |
| Match cut on motion | The jumper's rope line becomes the yellow racing line | Shape match, not just a direction match |

- Easing: `cubic-bezier(.7,0,.2,1)` for snaps. `cubic-bezier(.16,1,.3,1)` for counters and slow camera moves. No bounce, no overshoot.
- Camera: every photo has one slow push (0.4–1.2% a second) and a small pan. Only S3 gets the quick 1.15× push.
- Texture: 7% animated film grain plus a soft vignette on every frame. No glows, particles or light leaks.
- Photos: a blurred full-bleed copy (blur 46 px, brightness 0.32) sits behind a sharp window. That's how 1206 px wide photos fill a 1080×1920 frame without looking upscaled.

## Canvas
- 1080×1920, 30 fps. Safe area: 72 px sides, 190 px top, 300 px bottom (IG UI). Sources sit at 70–96 px from the bottom and get covered by the caption bar in the app. That's acceptable because they're also in the post caption.
