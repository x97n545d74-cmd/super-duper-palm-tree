# AI prompts and extra visuals

**Rules for every prompt:** no logos, no team liveries, no readable brand names, and no real person's likeness (no Felix Baumgartner, no named drivers). Generated plates are labelled "AI visual" in a corner chip when they're used as B-roll. Grade every plate toward the palette: crushed blacks near #0A0A0C, one warm yellow practical light, red only as a small accent.

Common tail (paste after every image prompt):
`cinematic still, 9:16 vertical, shot on ARRI Alexa 35, 35mm anamorphic, deep matte blacks, low-key lighting, single warm yellow practical light, subtle red accent, fine film grain, high dynamic range, no text, no logos, no watermark`

- Midjourney: add `--ar 9:16 --style raw --v 7 --s 150`
- Flux (1.1 Pro / Dev): 1080×1920, guidance 3.0–3.5, 30–40 steps. Drop the MJ flags.
- Runway (Gen-4 / Gen-4 Turbo, image to video): 5 s or 10 s, 9:16, motion prompt below. Camera language only; keep subject motion small.

---

## A. Image-to-video prompts for your 4 photos (Runway / Kling / Luma)
Upload the cropped photos from `graphics/img/`. Outpaint them to 9:16 first (Runway Expand, or Photoshop Generative Expand: "extend ceiling and carpet, same lighting"), because they're 16:9 crops.

| Photo | Used at | Runway motion prompt |
|---|---|---|
| `boardroom.jpg` | 0:05–0:14 | `Slow dolly-in toward the dark wall-mounted screen, city lights twinkling softly outside the windows, ceiling LED line glows steadily, reflections drift on the glossy floor, no people, still and tense, locked horizon` |
| `production_room.jpg` | 0:25–0:35 | `Smooth handheld-stabilised push forward between the flight cases, crew in the background keep working with small natural movements, cables on the carpet stay still, slight parallax between the cases and the back wall, documentary feel` |
| `neon_chart.jpg` | 0:35–0:38 | `The white arrow bars rise one after another from left to right, the trend arrow draws across the top, steady soft light, black background stays black, no camera movement` (Alternative: skip AI and use the morph in `reel.html`.) |
| `cliff_jump.jpg` | 1:55–2:04 | `Slow-motion: the jumper swings outward on the rope over the valley, rope uncoils, mist drifts through the canyon, camera slowly tracks right with the jumper, shallow depth of field, 120 fps feel` |

If the person's face changes shape or the body warps in the cliff clip, use the still with the code push from `reel.html` instead. That's already in the master.

## B. Background plates for every transition

**T1 · Black open (0:00).** No plate. Matte only.

**T2 · Whip into the paradox (0:05)**
`Empty corporate boardroom at night high above a glittering city skyline, long black table, leather chairs, one dark TV screen on the wall, thin cool LED ceiling line, rain on the glass` + tail
Runway: `Fast lateral whip pan from left to right that settles into a slow push on the black screen`

**T3 · Old-way contrast plate (0:05–0:14, bottom half, optional behind the ad card)**
`Close-up of a glowing television in a dark living room, screen blurred and out of focus with bright saturated colours of a generic commercial, sofa silhouette in the foreground` + tail

**T4 · Production house (0:25)**
`Backstage of a live sports broadcast, rows of black flight cases with chrome corners, coiled camera cables, a gimbal camera on a cart, monitors showing blurred mountain footage, crew silhouettes, industrial concrete space` + tail

**T5 · Can macro for the margin beat (0:35–0:50)**
`Macro product shot of a plain unbranded slim aluminium drink can, brushed silver with one matte yellow band, condensation droplets, standing on black glass, single hard rim light from the left, dark seamless background` + tail
Runway: `Slow 30-degree orbit around the can, droplets sliding down, rim light sweeping across the metal`

**T6 · Flywheel backdrop (0:50–1:15, at 20% opacity behind the diagram)**
`Abstract top-down view of a dark stadium at night, empty pitch, ring of floodlights forming a circle, long exposure, minimal` + tail

**T7 · Edge of space (1:15–1:35)**
`View from the stratosphere at 39 km altitude, thin blue atmosphere line curving over the Earth, black sky with faint stars, a small pressurised capsule hanging under a giant translucent helium balloon, sun flaring from the side, documentary realism` + tail
Runway: `Very slow zoom out from the capsule to reveal the curvature of the Earth, balloon fabric rippling slightly, no fast motion`
(Keep the capsule generic: no logo, no person in the doorway.)

**T8 · Live audience (1:28, optional behind the LIVE card)**
`Hundreds of glowing phone and laptop screens in the dark showing the same blurred live stream, faces lit only by the screens, shot from behind, no readable UI` + tail

**T9 · ROI flash plates (1:35–1:55).** No plate. Matte only keeps the numbers readable.

**T10 · Extreme-sports B-roll mix (1:55–2:15)**
- `Mountain biker mid-air over a canyon gap at sunset, dust trail, tiny figure against a huge landscape, telephoto compression` + tail
- `Wingsuit flyer skimming a jagged alpine ridge, motion blur on the rocks, helmet camera perspective` + tail
- `Cliff diver frozen mid-dive above turquoise water, rocky coastline, spray below` + tail
Runway (each): `Fast tracking shot following the athlete, motion blur, the camera matches the athlete's direction of travel so cuts match on motion`

**T11 · Formula-style car (2:04–2:15 and 2:40–2:50)**
`Generic open-wheel race car, matte black livery with no logos and no sponsor decals, tearing past at night under stadium lights, sparks from the underfloor, low angle at track level, motion-blurred barriers` + tail
Runway: `Car blasts past the camera left to right, camera whip-pans to follow, sparks trailing`

**T12 · Finish and fade to matte (2:40–2:50)**
`Chequered flag waving in slow motion against a black sky, stadium lights flaring behind, flag fills the frame` + tail
Runway: `Slow-motion flag wave, then the light fades to complete black`

**T13 · Playbook backdrop (2:15–2:40, at 15% opacity)**
`Dark modern media control room, a wall of small screens showing blurred action sports, empty operator chair, single yellow desk lamp` + tail

## C. Real footage to look for (free or licensed)
Paste these into Google or the sites themselves. Tell me where each clip comes from before it goes in, so it can be logged in `assets/LICENSES.md`.
- `site:pexels.com cliff diving slow motion vertical`
- `site:pexels.com race car night track`
- `site:pexels.com mountain bike jump drone`
- `site:pixabay.com stratosphere balloon earth curvature`
- `site:pexels.com tv commercial living room dark`
- Red Bull Content Pool (`redbullcontentpool.com`): official Stratos and Red Bull Racing media. Editorial use only and it needs a free account. Read the terms before using anything; most clips can't be used in content that monetises or markets something else.
- NASA image library (`images.nasa.gov`): Earth-curvature stills, public domain, but NASA's logo can't be used.
