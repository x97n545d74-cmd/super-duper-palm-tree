# Red Bull Media Flywheel: director's post-production script v3

This script replaces the v2 edit (`FRAMES.md` / `graphics/reel.html`) from 00:00 to 03:00. It follows the user's 4-pillar visual bible. The VO, the facts and the colour tokens stay the same (`SCRIPT.md`, `research/FACTS.md`, `DESIGN.md`).

Timecode is `MM:SS:FF` at 30 fps. "f" = frames.

---

## 0. Ground rules for the whole edit

### 0.1 The beat grid (frame-accurate cuts)
- The music is cut or composed at **120 BPM**: 1 beat = 15 f, 1 bar = 60 f = 2 s. 3:00 = 90 bars.
- **Every scene cut lands on a whole second**, which puts it on a beat. Every graphic pop and state change lands on a beat (multiples of 15 f) or an off-beat (+7 or +8 f).
- The VO isn't recorded yet, so the word cues below are targets. After the record, align the words (`scripts/fix_timeline.py`), then slide each VO-driven event to the nearest beat. Move the cut, never the word. Allowed drift: ±4 f. A word that lands more than 4 f away from a beat gets its own SFX transient, and the graphic syncs to that instead.
- Sound design hits come from the ElevenLabs kit (`brand/sound/kit_v1.json`) plus a few one-off designed hits listed per shot. No synthesised SFX.

### 0.2 Layer stack (top to bottom, identical in every shot)
| # | Layer | Setting |
|---|---|---|
| 1 | Organic texture | 35 mm grain scan (Kodak 5219 look, about 400 ISO), at 100% in overlay, re-seeded every frame. Dust and scratch overlay, screen 8%, a new clip every 4 s. Optical scanlines: 2 px period, multiply 4%, drifting down 1 px/f |
| 2 | Lens pass | Barrel distortion 3% (AE Optics Compensation or Nuke LensDistortion, applied to the whole comp so graphics bend with the plate). Radial chromatic aberration: 0 px at the centre, 1.5 px at the corners. Halation: threshold 0.92 luma, red-orange bloom with an 18 px radius at 25% |
| 3 | Grade | Plates and graphics share one grade. Black level 0.02 (no crushed 0.0), lift matched per plate. The noise floor of the CG and graphics is matched to the plate before layer 1 adds grain |
| 4 | HUD and type | Built with shape layers and trim paths. Glow is two passes: 8 px at 40% plus 40 px at 12%, yellow #FACC15 or crimson #EF4444. Every HUD layer gets a light wrap (12 px) from the plate behind it |
| 5 | Foreground matte | Rotoscoped or CG-alpha foreground objects sit **above** the type. This is what puts the graphics *inside* the scene |
| 6 | Plates on depth planes | Each plate is split into FG / MG / BG by a depth map plus roto, then re-projected on cards in a 3D camera for parallax. Lens blur is driven by the depth map, with the focus distance animated per shot |

### 0.3 Camera rules
- **No static frames.** Every shot has a base push of 1.00 → 1.02 across its full length, plus a micro drift: Perlin wiggle, 2 px amplitude, 0.4 Hz, position only. This is drift, not shake.
- **Velocity snap curve** (used for every "snap" move): 0% speed, then ease-in with an exponent of 4 up to 100% velocity over 6 f, hold, then decay 100 → 0% over 10 f. In the AE graph editor: in-influence 90%, out-influence 33%.
- **Slow-mo** happens only on moving plates (Runway clips or stock), re-timed with optical flow (Twixtor Pro, or Topaz Apollo for the 4× passes). Stills can't be re-timed; they get camera moves only.

### 0.4 Named transitions (so the shot list stays short)
| Name | What happens | Length |
|---|---|---|
| **WHIP-R / WHIP-L / WHIP-U** | The camera pans with the velocity snap curve. Directional blur peaks at 64 px on the middle frame. The outgoing and incoming shots are cut on the frame of peak blur | 8 f |
| **Z-PUNCH** | The 3D camera dollies through a plane in the shot (a screen, an opening) from z −800 to +400. Radial blur 0 → 40 → 0. The incoming shot starts at 1.15 scale and settles to 1.00 over 10 f | 6 f in, 10 f settle |
| **FLOW-MORPH** | Optical-flow blend (AE Pixel Motion, or Twixtor between two frames) of one shape into another, with both shapes pre-aligned in position and scale | 8–12 f |
| **MATCH** | A hard cut where a shape or direction of motion carries across the cut | 0 f |
| **SMASH** | A hard cut into a hard audio change (silence or a drop) | 0 f |
| **IMPACT** | 1–3 frames laid over a cut or a hit: `INV` (luma inverted, 60% mix), `MONO` (high-contrast monochrome, yellow only), `CRIM` (red channel only) | 1–3 f |

**Impact-frame budget:** 9 uses across the whole edit, never two inside the same second, and never more than 3 flashes in any 1 s window. That's the WCAG 2.3.1 limit for flashing content. Impact frames are *luma-limited*: the peak is 85% white, not 100%.

### 0.5 HUD rules
- **The HUD kit:** 1 px line-work, corner brackets, crosshair reticles, timecode and frame counters (JetBrains Mono, 20 px), vector grids, trim-path data bars, leader lines to tracked pin-points.
- **Every number in the HUD is one of three things:** a frame counter or timecode, a figure from `FACTS.md` (with "est." where it's an estimate), or a scale tick. No decorative fake data: no random coordinates, no made-up speed readouts.
- **Pin-points** come from a 3D camera solve (AE 3D Camera Tracker or Mocha Pro for video plates; on stills, from the 2.5D projection camera). Type sits on a real plane (a floor, a wall, a window, or a null in the air) and moves in perspective with it.

### 0.6 What has to exist before compositing (asset build)
| ID | Asset | How |
|---|---|---|
| P1 | Boardroom, 3 depth planes | Your photo upscaled 2× (Topaz Gigapixel or Magnific). Depth map from Depth Anything V2. Roto the 7 front chairs. Clean-plate the area behind the chairs (generative fill) |
| P2 | Production-room clip | Runway Gen-4 from your photo (`PROMPTS.md` A2), 10 s. Roto the man in the cap and the open flight-case lid (AE Roto Brush 3). If Runway warps him, use the still on 3 depth planes instead |
| P3 | Neon chart rebuilt in 3D | Trace the 7 arrows and the trend line from your photo into vector paths (they're simple shapes), then extrude them 40 px in Cinema 4D / Element 3D. Your photo stays as the reference for the first 15 f |
| P4 | CG can | Unbranded 250 ml slim can (Blender or C4D): brushed aluminium, a yellow band, condensation, on black glass with an HDRI. Render passes: beauty, alpha, depth, reflection. The yellow-type reflection comes from a yellow emissive card in the render |
| P5 | Stadium plate | AI plate T6, or licensed drone stock of a stadium at night from overhead |
| P6 | Capsule at the edge of space | CG capsule (generic, no logo, no person) in Blender, with an Earth-limb HDRI, 4K. Or AI plate T7 plus Runway |
| P7 | Cliff-jump clip | Runway from your photo (`PROMPTS.md` A4), 10 s. Roto the rock face (FG) and the jumper plus rope (MG) |
| P8 | Sports B-roll | 4 clips: open-wheel car with no livery, MTB jump, wingsuit, cliff diver. Licensed stock or AI plates T10/T11. Every clip must move left to right |
| P9 | Control room | AI plate T13 with a wall of at least 3 screens. Track the screen corners |
| P10 | Chequered flag | Slow-motion stock or AI plate T12, shot at 60 fps or higher |
| P11 | Texture pack | 35 mm grain scans, dust and scratch overlays, a 2 px scanline tile |

Your four photos are 1206 px wide. At full frame on a 1080×1920 canvas they need the 2× upscale and the depth split above. Without them they look soft. That is the main reason the v2 edit felt flat.

---

## PHASE 1 · HOOK AND PARADOX (00:00:00–00:35:00)

### SH01 · 00:00:00 → 00:00:15 · Pre-roll
- **VO:** none. **Audio:** room tone, a sub swell rising from −30 dB.
- **Frame:** black #0A0A0C (with grain, so it isn't digital black). A thin horizontal anamorphic streak (warm white, 2 px tall, 70% of the frame wide) sits at y 960 and drifts 30 px to the right. It's the reflection of an off-screen light on the can that's about to appear.
- **Camera:** none (no plate yet). The streak carries the motion.
- **Out (00:00:15, beat 2):** MATCH. The streak lines up with the can's top highlight in SH02.

### SH02 · 00:00:15 → 00:05:00 · The can and the claim
- **VO:** "What if I told you Red Bull doesn't give a damn about selling energy drinks?"
- **Plate:** P4 CG can.
- **Frame:** a vertical 85 mm macro. The can stands centre-frame, 38% of the frame width, with its rim at y 600 and its base out of frame bottom. Black glass below, a reflection fading over 300 px.
- **Depth:** FG = the can (CG alpha). Behind the can = the type. BG = a black void with a faint vector floor grid at 6% opacity, receding to a vanishing point at y 700.
- **Camera:** dolly-in 1.00 → 1.02 over the whole shot, plus a 4°/s orbit around the can (the highlight travels across the metal).
- **Layers by second:**
  - **00:00:15:** "RED BULL" (Inter Black, 230 px, white) is set *behind* the can on a z-plane 600 mm back. The can hides the middle of the "D B". It rises with the snap curve: 0 → 100% in 6 f from 40 px below, motion blur on.
  - **00:01:00:** "ISN'T A" fills in under it the same way, 4 f later per line.
  - **00:01:15:** "BEVERAGE / COMPANY" in yellow #FACC15, 200 px. The yellow type is the brightest thing in the scene. It spills onto the left edge of the can (CG emissive card plus a 12 px light wrap) and leaves a soft yellow smear on the black glass reflection.
  - **00:02:15, on "doesn't" (beat 5):** **IMPACT INV 2 f.** The vinyl-stop SFX plays and the music cuts dead. A crimson trim path strikes through "BEVERAGE" in 4 f, left to right, with the two-pass glow. The red spill flares on the can's metal for 6 f, then decays.
  - **00:02:15 → 00:04:00:** silence. Only the slow orbit continues. A HUD reticle (1 px crosshair with corner brackets) settles on the can over 8 f. Its frame counter reads the live timecode `00:02:15 → …`, top-right, 20 px.
  - **00:04:00 → 00:04:22:** speed ramp. The orbit velocity goes from 4°/s to 180°/s with the snap curve. The can's highlight streaks horizontally. Directional blur is driven by the angular velocity.
- **Optics:** halation on the rim highlight and on the yellow type. The anamorphic streak returns at 00:04:10 as the highlight passes the lens.
- **Out (00:05:00):** **WHIP-R**, motivated by the spinning highlight. The brightest frame of the streak is the cut frame. A whoosh plus a low sub from the kit.

### SH03 · 00:05:00 → 00:14:00 · Boardroom: buying 30 seconds
- **VO:** "Coca-Cola spent about five billion dollars on advertising last year, buying thirty seconds at a time."
- **Plate:** P1 boardroom, 3 planes, re-projected in a 2.5D camera.
- **Frame:** the wide boardroom, recropped to vertical. The wall screen sits at the upper-right third (centre about x 760, y 620). The table runs diagonally from the bottom left. The skyline fills the left half behind the glass. The FG chairs fill the bottom 30%.
- **Depth:** FG = the 7 chairs (roto). MG = the table, the wall and the screen. BG = the skyline through the glass (lens blur, 6 px).
- **Camera:** the whip lands with a 10 f settle. Then a dolly-in from 1.00 to 1.06 over 9 s with a 0.5° tilt down. The skyline moves at 30% of the camera speed and the chairs at 140%: real parallax.
- **Layers by second:**
  - **00:05:08:** a **30-second ad plays inside the wall screen**, corner-pinned to the 4 tracked screen corners. It's a generic TV-ad UI: a yellow "AD" tag, a "0:30" countdown and a crimson progress bar. The screen's light spills onto the glossy floor (a flipped, blurred copy at 18% opacity with a gradient falloff) and onto the backs of the nearest chairs (a 3 px rim light on the chair roto).
  - **00:06:00 (beat 12):** a crosshair locks onto the screen. Brackets snap in from the frame edges with a 6 f trim path, and a leader line runs to the label `AD SLOT · 30 S`.
  - **00:07:15, on "five billion":** the readout **"$5.1B"** (Inter Black, 160 px, crimson) is pinned in 3D on the window glass plane, behind the FG chairs. Two chair backs cut across the bottom of the numerals. Its glow lights the glass edge and mixes with the city lights. Underneath it: `COCA-COLA · ADVERTISING 2024 · REPORTED` (mono, 22 px).
  - **00:10:00:** "BUY 30 SECONDS AT A TIME" is set along the table's perspective plane, as if printed on the tabletop. It recedes toward the screen. The type picks up the table's specular reflection.
  - **00:12:00 → 00:13:20:** the screen countdown hits 0:20. The progress bar crosses 33%. The frame counter keeps running.
- **Optics:** halation on the brightest skyline lights. Faint anamorphic flares (horizontal, cool-neutral) on the 3 brightest windows, with intensity tied to their luma.
- **Out (00:14:00):** **Z-PUNCH into the wall screen.** The camera flies through the screen plane in 6 f. The screen's pixel grid (a 2 px LCD subpixel texture) fills the frame and becomes the vector floor grid of SH04. A riser, then a sub hit on 00:14:00.

### SH04 · 00:14:00 → 00:25:00 · Inside the screen: the money chart
- **VO:** "Red Bull still runs ads too. But most of its money goes somewhere else, and it built a twelve-billion-dollar business doing it."
- **Plate:** full CG (Element 3D or C4D). A black void with a vector grid floor (1 px lines, 40 px cells, #2A2A32), seen from 25° above.
- **Frame:** two 3D bars (extruded slabs) rise from the grid floor in the left two-thirds of the frame. The headline zone is at the top 20%. The sales counter sits in the bottom 25%.
- **Camera:** the Z-PUNCH settles (1.15 → 1.00 in 10 f). Then a slow crane pull-out from 1.02 to 1.00 with a 40 px/s lateral track to the right, so the slabs show their sides in parallax.
- **Layers by second:**
  - **00:14:15:** "RENT ATTENTION / OR OWN IT" (yellow on "own it") is set in 3D on a vertical plane behind the slabs. The tallest slab will cut across it.
  - **00:16:00 (beat 32):** the Coca-Cola slab (crimson, matte) grows to the $5.1B mark over 1 bar with the snap curve: 0% speed into a hard stop. It thuds into place. An emissive edge strip on top of the slab spills crimson light onto the floor grid. A trim-path data bar on the floor traces from $0 to the $5.1B tick.
  - **00:18:00:** the Red Bull slab (yellow) grows solid to $3B. Then a **wireframe** extension (dashed 2 px edges, no fill) runs from $3B to $4B. That dashed part is the estimate range. Its label, pinned on top: `$3–4B · EST. · 25–33% OF SALES`.
  - **00:20:00:** the labels "BUYS AIRTIME" (on the crimson slab) and "OWNS THE EVENT" (on the yellow slab) are pinned to the slab tops with 1 px leader lines.
  - **00:21:00, on "twelve-billion":** in the bottom 25%, an odometer counter (each digit on its own 3D drum, rolling with motion blur) runs "€0.0B → €11.2B" over 1 bar. The sub-line reads "≈ $12B · 12.67B CANS · 2024".
  - **00:23:00 → 00:24:29:** the camera keeps drifting. The grid scrolls toward the lens at 20 px/s.
- **Optics:** the slab edges get 1.5 px of chromatic aberration where they meet the frame edges. Halation on the yellow emissive strip.
- **Out (00:25:00):** **SMASH into dead air**, with **IMPACT MONO 1 f.** Music, room tone and the grid's sound all cut on the same frame.

### SH05 · 00:25:00 → 00:35:00 · The production house
- **VO:** "Red Bull is an extreme sports production house that pays for itself by selling aluminum cans."
- **Audio:** dead air until 00:34:00. Only the room tone of the production space: cable hum and a distant case latch.
- **Plate:** P2 production-room clip (Runway, moving), or the 3-plane still as a fallback.
- **Frame:** eye level at 1.4 m. The open black flight case fills the left 45% (FG), the crew desks run across the middle third (MG), and the white back wall fills the top 40% (BG). The man in the cap stands on the right third.
- **Depth:** FG = the case and its lid (roto). MG = the man and the desks (roto the man). BG = the white wall and the ceiling ducts.
- **Camera:**
  - 00:25:00 → 00:27:15: a slow push 1.00 → 1.02, heavy and quiet.
  - **00:27:15, on "production house":** a **3D zoom ramp** from 1.02 to 1.18 with the snap curve. It's 10 f, ending in a 12 f decay, and the parallax between the case and the wall exaggerates it. A designed SFX: a single low air-pressure thump, no music.
  - 00:28:00 → 00:35:00: a slow lateral track left at 15 px/s.
- **Layers by second:**
  - **00:25:10:** "AN EXTREME SPORTS PRODUCTION HOUSE" is **projection-mapped onto the white back wall**: perspective matched to the wall's vanishing point, the luma added to the wall, the wall's texture visible through the letters. When the man in the cap moves, his silhouette blocks the projection: his roto subtracts from the type, and his shadow (a soft 30% offset copy) falls across the letters. "PRODUCTION" is yellow. The rest is white at 90%.
  - **00:29:00 → 00:31:00:** 3 tracked pin-points snap on, one per beat, at 00:29:00, 00:29:15 and 00:30:00:
    - the flight-case corner → `FLIGHT CASES`
    - the desk row → `LIVE OPS DESK`
    - the floor cable run → `CABLE RUNS`
    Each pin is a 6 px crosshair, a 1 px leader line drawn with a trim path, and a mono label in a thin-line box. They move with the 3D solve and slide in parallax with their depth plane.
  - **00:32:00:** "THAT SELLS CANS TO PAY THE BUDGET" lands on the carpet plane at the bottom of the frame, receding into perspective. The cables cross over the letters (cable roto).
- **Optics:** halation on the overhead fluorescents. Chromatic aberration is most visible here, on the white wall edges.
- **Out (00:35:00):** **WHIP-U** with **IMPACT CRIM 1 f** on the beat drop. The camera whips up past the ceiling ducts into black. The tech-house kick starts on 00:35:00 exactly.

---

## PHASE 2 · UNIT ECONOMICS AND THE FLYWHEEL (00:35:00–01:15:00)

### SH06 · 00:35:00 → 00:38:15 · Your neon chart, rebuilt in 3D
- **VO:** "Let's talk numbers."
- **Plate:** P3, the 3D extrusion of your neon chart.
- **Frame:** the chart fills the middle 60% of the frame, the axis bottom-left, the trend arrow aiming at the top-right corner.
- **Camera:** the whip lands. Then an orbit 12° to the right over 3.5 s so the extruded arrows show their depth.
- **Layers by second:**
  - **00:35:00:** for the first 15 f, the original photo sits under the 3D build at 100%. It cross-dissolves to the extrusion over 8 f so the viewer reads it as the same chart.
  - **00:35:15 → 00:37:15:** the 7 arrows rise from the axis one by one: 7 arrows over 2 s, one every 8 or 9 f, on the hi-hats. Each one draws its outline with a trim path, fills, then gets the two-pass white glow. The trend line draws last.
- **Optics:** heavy halation (this is the brightest shot of the film). Anamorphic flares flicker on the arrowheads as each one arrives.
- **Out (00:38:15):** **FLOW-MORPH, 12 f.** The arrows collapse inward and fold into the silhouette of the can. The arrow shafts become the can's vertical highlight stripes.

### SH07 · 00:38:15 → 00:50:00 · The can: 15 cents in, $3.50 out
- **VO:** "Red Bull doesn't publish its cost per can. Industry estimates put the drink, the can and the packaging at around fifteen cents. You pay about three fifty at a store in the US. That's a massive margin."
- **Plate:** P4 CG can, on black glass.
- **Frame:** the can stands at the vertical centre, a little left of centre (x 470). The cost tag floats in the FG on the left and the price tag floats in the BG on the right, so the composition reads left to right and front to back.
- **Depth:** FG = the cost tag panel (close to the lens, defocused when not active). MG = the can. BG = the price tag panel plus the big "23×".
- **Camera:** a continuous 6°/s orbit and a push from 1.00 to 1.02. Focus pulls: **rack focus to the cost tag at 00:40:15, to the price tag at 00:44:00, and back to the can at 00:47:00.** Each rack is 12 f, driven by the depth map through the lens blur (Frischluft Lenscare or Nuke ZDefocus). The bokeh is oval (anamorphic), 1.33 squeeze.
- **Layers by second:**
  - **00:39:00:** HUD measurement callout. A 1 px dimension line runs the height of the can, with end ticks and a label `250 ML`, on a trim path. A crosshair sits on the can's centre.
  - **00:40:15, on "fifteen cents":** **cost tag** (a thin-line panel, 1 px yellow border): `COST TO MAKE*`. Odometer counter $0.00 → **$0.15** (yellow, 140 px) over 15 f. A coin tick on the stop, frame-accurate. Underneath: `INDUSTRY ESTIMATE`. The yellow panel glow lights the left side of the can.
  - **00:44:00, on "three fifty":** **price tag** panel: `SHELF PRICE`, counter $0.00 → **$3.50** (white, 140 px). A coin tick plus a register "cha". The underline is a trim-path data bar.
  - **00:46:00:** "≈ 23×" (Inter Black, 420 px, yellow, ghosted at 40%) sits *behind* the can on the BG plane, and the can cuts through the middle of it. The chip "EST." sits next to it.
  - **00:48:00:** the footnote line in the bottom safe area: `*RED BULL DOESN'T PUBLISH UNIT COSTS · SHELF PRICE INCLUDES RETAIL AND DISTRIBUTION MARGIN`.
- **Optics:** condensation droplets catch the yellow light (small specular highlights in the CG render). Halation on the rim.
- **Out (00:50:00):** **Z-PUNCH into the can's opening.** The camera tilts up and over in 8 f, looks straight down into the dark opening and flies in. The black opening becomes the dark hub of the flywheel in SH08. A riser lands on 00:50:00.

### SH08 · 00:50:00 → 01:15:00 · The flywheel on the stadium floor
- **VO:** "Instead of pocketing it, Red Bull spends an estimated quarter to a third of its revenue on marketing. They don't sponsor Formula One cars. They own Red Bull Racing. They don't buy stadium ads. They own the teams: Leipzig, Salzburg, New York. Every event makes footage, the footage earns attention for free, attention sells cans, and the cans pay for the next event."
- **Audio:** a rising arpeggio, one note per node, plus a sub pulse on every lap of the light.
- **Plate:** P5 stadium from above, at night. A ring of floodlights forms the flywheel's circle.
- **Frame:** a top-down view tilted 60°. The pitch centre sits at frame centre (y 1010). The 4 nodes are pinned to 4 floodlight positions on the ring: top (12 o'clock), right (3), bottom (6), left (9).
- **Camera:** the Z-PUNCH settles. Then a slow rotation of 2°/s around the pitch centre plus a crane down from 1.02 to 1.00. From 01:04:00 the crane rises again (1.00 → 1.10), building speed to the out.
- **Layers by second:**
  - **00:50:15:** headline "OWN THE CULTURE" ("culture" in yellow), laid flat on the pitch in 3D like a painted pitch marking, foreshortened in perspective. The floodlight shadows fall across it.
  - **00:52:00 / 00:54:00 / 00:56:00 / 00:58:00 (every bar):** nodes 01 CAN MARGINS → 02 EVENT OWNERSHIP → 03 FREE MEDIA ATTENTION → 04 CAN SALES. Each node is a thin-line HUD panel standing upright on its floodlight, billboarded to the camera. When a node boots, its floodlight blooms (halation burst, 12 f decay). Then the arc to the next node draws with a trim path plus the yellow glow, painted on the pitch plane so it curves in perspective.
  - **01:00:00:** a light pulse (a yellow hot core with a 40 px glow) starts running the ring, 1 lap every 4 s. Every time it passes a node, that floodlight flares and a note plays. The pulse throws real light onto the grass (a moving additive spot, 200 px falloff).
  - **01:01:00 / 01:02:15 / 01:04:00:** tracked labels pin to the pitch edge: `RED BULL RACING · OWNED SINCE 2004` · `RB LEIPZIG · SALZBURG · NY RED BULLS` · `~25–33% OF SALES TO MARKETING · EST.`
  - **01:05:00, on "Every event makes footage":** an aggressive time remap on the pulse. Its period goes from 4 s to 2 s at 01:08:00, 1 s at 01:11:00 and 0.5 s at 01:13:00. The arpeggio doubles with it. The ring smears into a continuous yellow loop with motion blur, and the camera crane accelerates.
  - **01:00:00 → 01:15:00:** in the hub: `2024 SALES · €11.2B` on two lines.
- **Optics:** anamorphic flares on all 4 floodlights, and the flare intensity follows the pulse. Chromatic aberration grows as the wheel spins up (1.5 px → 3 px at the edges by 01:14:00), then snaps back.
- **Out (01:15:00):** **speed ramp to zero, then MATCH.** From 01:14:10 the wheel spin decays from 100 to 0% over 20 f. The music filters down to nothing. The ring, now still, is the same size and position as the balloon envelope at the top of SH09. Hard cut on 01:15:00 to wind and a stretched drone.

---

## PHASE 3 · STRATOS (01:15:00–02:15:00)

### SH09 · 01:15:00 → 01:35:00 · The edge of space
- **VO:** "On October fourteenth, 2012, Felix Baumgartner stepped out of a capsule about a hundred and twenty-eight thousand feet up, at the edge of space, and jumped. YouTube said the live stream peaked above eight million concurrent streams. Its record at the time."
- **Plate:** P6 CG capsule (generic, closed door, no person, no logo) above the Earth's limb.
- **Frame:** it starts tight. The capsule fills 60% of the frame, the balloon rigging runs out of the top, and the Earth's limb is a thin blue-white curve low in the frame. By the end of the shot, the capsule is small (12% of the frame height) in the upper-right third, the curvature of the Earth spans the bottom third, and black space with faint stars fills the rest.
- **Depth:** FG = the HUD live panel (slightly defocused). MG = the capsule. BG = the Earth's limb, then the stars (the stars parallax at 5%).
- **Camera:** **the buttery shot of the film.** A zoom out from 1.40 to 1.00 over 20 s on an exponential ease, plus a 0.2°/s roll for weightlessness. No snaps at all in this shot.
- **Layers by second:**
  - **01:15:15:** a reticle locks onto the capsule. The brackets close in over 20 f, slower than anywhere else, matching the mood.
  - **01:16:00:** HUD readout, top-left, mono: `14 OCT 2012 · ROSWELL, NEW MEXICO`.
  - **01:18:00 → 01:26:00:** a **thin altitude ruler** runs along the left edge, anchored in 3D to the Earth's limb. Its ticks scroll and compress as the camera pulls back. Markers fade in on the beats: `EVEREST 29,032 FT` · `AIRLINER ~35,000 FT` · `ARMSTRONG LINE ~62,000 FT` · then `≈128,100 FT · 39 KM` in yellow, joined to the capsule by a dashed yellow line.
  - **01:27:00, on "eight million":** the LIVE panel. A crimson dot pulses at 1 Hz (opacity only, no flash) next to `LIVE · YOUTUBE`. An odometer counter runs 0 → **8,000,000+** over 3 bars (6 s) on an ease-out, so the final digits crawl. Under it: `PEAK CONCURRENT STREAMS · YOUTUBE'S FIGURE`.
  - **01:33:00:** the source line fades in, bottom safe area: `PRIOR RECORD ≈ 500,000 · ALTITUDE AS REPORTED AT EXIT`.
- **Optics:** the sun sits just out of frame top-left. One long anamorphic flare crosses the frame (warm white, low saturation) and grows slowly as the camera pulls back. There's halation on the limb, and very faint chromatic aberration on the limb only.
- **Ethics:** no face, no figure in the doorway, no AI likeness. The VO names him; the picture shows the machine.
- **Out (01:35:00):** **SMASH plus IMPACT INV 2 f.** Wind cuts, and a cinematic boom on the frame.

### SH10 · 01:35:00 → 01:55:00 · ROI scorecard in a void
- **VO:** "Red Bull paid no broadcast rights fee to anyone, because it owned the event, the footage and the media network. The project wasn't free. Outside estimates put it at thirty to fifty million dollars. Analysts valued the exposure in the hundreds of millions."
- **Plate:** full CG. A black void with a glossy floor and a faint vector grid (3% opacity). The numbers are self-lit 3D type.
- **Frame:** each number stands on the floor, centred, filling 80% of the frame width, with a reflection below it. The label sits above in mono. The context line sits below.
- **Camera:** on each card, a fast push from 1.00 to 1.05 in the first 12 f (snap curve), then a slow-mo drift (1.05 → 1.06 over the rest of the card) with a 3° yaw so the type's depth shows.
- **Cards (hard cuts on the beat):**
  - **01:35:00:** `BROADCAST RIGHTS FEE` / **$0** (yellow, 3D, emissive) / "It owned the event, the footage and the network". The $0 lights the floor yellow.
  - **01:38:15:** hard cut plus **IMPACT MONO 1 f.** `PROJECT COST · OUTSIDE ESTIMATES` / **$30–50M** (white) / "Five years of balloons, suits and testing".
  - **01:42:00:** hard cut plus **IMPACT CRIM 1 f.** `EXPOSURE VALUE · ANALYST ESTIMATES` / **$100s OF M** (yellow) / "Red Bull has never published a number".
- **01:45:00 → 01:55:00, the scorecard:** two thin-line HUD panels stand on the floor in a V, angled 20° toward each other, and the camera dollies back from the apex of the V (1.10 → 1.00 over 10 s).
  - Left panel: `PAID ADS` (crimson): Pay per spot · Ends in 30 s · Pay again · Every airing.
  - Right panel: `STRATOS` (yellow border): $0 fee · Owned · Free · $30–50M est.
  - The rows check in on every beat from 01:46:00, alternating left and right. Each row has a 1 px trim-path underline, and the right panel's rows get a small yellow tick. The light from the yellow panel spills onto the floor between the panels.
  - Footer: `COST AND EXPOSURE VALUE ARE THIRD-PARTY ESTIMATES · NO OFFICIAL FIGURES EXIST`.
- **Out (01:55:00):** **WHIP-L** with an optical-flow speed ramp, on a heavy bass hit. The camera whips left through the right panel. The panel's yellow edge becomes the blurred rope in SH11.

### SH11 · 01:55:00 → 02:04:00 · The jump (slow-motion)
- **VO:** "There was no product pitch during the broadcast. It didn't need one. For hours, the logo sat on the capsule, the suit and the stream, next to the edge of human capability."
- **Plate:** P7 cliff-jump clip (Runway, from your photo).
- **Frame:** a vertical recrop. The rock face fills the left 35% (FG). The jumper sits on the right third at y 900. The rope arcs from the rock to the jumper. The valley and ridgelines fill the background.
- **Depth:** FG = the rock (roto, sharp). MG = the jumper plus rope (roto). BG = the valley (lens blur 10 px from the depth map, plus atmospheric haze).
- **Time remap:**
  - 01:55:00 → 01:55:12: 100% speed (the jumper leaves the edge).
  - 01:55:12 → 01:55:24: ramp to 20%, optical flow. The SFX drops an octave with it.
  - 01:55:24 → 02:02:00: **hold at 20%: buttery slow-mo** for the swing out.
  - 02:02:00 → 02:03:15: ramp back to 100%, then 150% into the cut.
- **Camera:** a slow track right that follows the jumper at 20% of their screen speed, plus a 1.02 push. The 3D solve carries all the pins.
- **Layers by second:**
  - **01:56:00:** "NO PRODUCT" is set in the **air between the jumper and the valley** on a 3D null (in the solve), and "PITCH" (yellow) on the line under it. The jumper's body and the rope pass *in front* of the letters (roto). The yellow word throws a faint spill onto the nearest edge of the rock (an additive gradient on the rock roto, 15%).
  - **01:58:00:** a reticle tracks the jumper's helmet, 1 px brackets plus the label `SUBJECT`. The frame counter runs top-right in the remapped clip time, so it visibly slows down. That's the slow-mo made legible.
  - **02:00:00:** "For hours the logo sat on the capsule, the suit and the stream." (Inter 600, 50 px) is pinned to the rock face plane in perspective, lower left, picking up the rock's light and texture.
- **Optics:** halation on the brightest sky. Lens breathing during the slow-mo: a scale ramp of 0.5% in sync with the focus.
- **Out (02:04:00):** **FLOW-MORPH, 8 f.** The rope's curve morphs into the yellow racing line of the circuit minimap in SH12, while the plate behind it cuts on motion (left to right) into the car.

### SH12 · 02:04:00 → 02:15:00 · Owned speed: the B-roll burst
- **VO:** (continues) "That's the feeling you buy with every can."
- **Plates:** P8. Every clip moves left to right.
- **Cut list (match cuts on motion, each on a beat):**
  - **02:04:00:** the car, low at track level, enters frame left. Ramp 100% → 400% → 100% across 1 bar.
  - **02:06:00:** MTB in the air over a canyon. Starts at 25%, speed-ramps to 100% on landing.
  - **02:07:15:** wingsuit along the ridge, 100% with directional blur on the rocks. **IMPACT MONO 1 f** on the cut.
  - **02:09:00:** cliff diver frozen mid-dive at 10%, then snaps to 100% on the 02:10:00 beat.
  - **02:11:00:** the car again, closer, sparks from the underfloor. 400% → 100%. **IMPACT CRIM 1 f** on the cut.
  - **02:13:00:** the car whips past the lens, and its dark sidepod wipes the frame.
- **HUD:** a thin-line circuit minimap (the generic track from v2) pinned top-right at 280×280. A dot runs the line and the sector chips S1/S2/S3 turn yellow, one sector per clip. A lap % counter (frame counter style) runs alongside. A crosshair snaps onto the subject of each clip for its first 8 f, then releases.
- **Layer:** "AI VISUAL" or the stock credit chip, bottom-left at 18 px, on every plate that needs it.
- **Out (02:15:00):** **MATCH wipe.** The sidepod fills 100% of the frame on 02:14:28, and the next shot is revealed behind it as it clears. A pass-by SFX.

---

## PHASE 4 · PLAYBOOK AND CTA (02:15:00–03:00:00)

### SH13 · 02:15:00 → 02:40:00 · The control room: three steps
- **VO:** "This is the content-first business model. Step one: build a media engine people actually want to watch. Step two: fund it with a high-margin physical product. Step three: turn customers from buyers into believers."
- **Plate:** P9 control room, with a wall of screens and a desk in the FG.
- **Frame:** at desk height. The desk edge runs across the bottom 15% (FG). The screen wall fills the middle 55%. 3 hero screens sit left, centre and right. The headline zone is the dark ceiling at the top.
- **Depth:** FG = the desk edge plus the operator chair silhouette (roto). MG = the screen wall. BG = the dark ceiling.
- **Camera:** a lateral truck left that stops on each hero screen in turn. Each move uses the snap curve: a fast 6 f move, then a slow 1.00 → 1.02 drift for the rest of that step.
- **Layers by second:**
  - **02:15:15:** "CONTENT FIRST" ("first" in yellow) is set on the ceiling plane, foreshortened.
  - **02:17:00, step 1 (screen L):** the screen boots. A scanline wipe runs top to bottom over 8 f, a thin-line frame draws on with a trim path, and the counter "01" rolls in. Then **"Build a media engine / Content people choose to watch"**. The panel is corner-pinned to the tracked screen. The screen glow spills onto the desk surface and the chair's rim.
  - **02:23:15, step 2 (screen C):** the truck snaps left. **"02 Fund it with margin / A cheap-to-make product pays the bills"**. The data bar under it fills to the "23×" mark from SH07, labelled `EST.`
  - **02:30:00, step 3 (screen R, yellow frame):** **"03 Buyers → believers / The can becomes a piece of the lifestyle"**. All 3 screens now glow, and the desk carries 3 overlapping pools of light.
  - **02:36:00 → 02:40:00:** the camera pulls back from 1.02 to 0.96 to show all 3 screens at once. The operator chair silhouette slides across the FG in parallax.
- **Optics:** halation on the screens, and very faint scanlines *inside* the screens (8 px period, separate from the global 2 px layer).
- **Out (02:40:00):** **Z-PUNCH into screen 3.** The music starts its final build.

### SH14 · 02:40:00 → 02:46:00 · The flag (slow-motion)
- **VO:** "Don't build ads for your product. Build a media brand your audience loves,"
- **Plate:** P10 chequered flag in slow motion, at 25% with optical flow.
- **Frame:** the flag fills 80% of the frame, waving from top-left to bottom-right, with stadium lights flaring behind it.
- **Camera:** a slow push from 1.00 to 1.03 and a 1° counter-roll against the wave.
- **Layers by second:**
  - **02:40:10:** "DON'T BUILD ADS." (crimson) is set *behind* the flag, on a plane 2 m back. The cloth hides and reveals the letters as it waves (flag roto, or a luma key on the white squares).
  - **02:43:00:** "BUILD A MEDIA BRAND." (yellow) on the same plane. The stadium lights behind it and the yellow type both bloom through the gaps in the cloth.
- **Optics:** heavy anamorphic flares from the stadium lights, and halation on the white squares.
- **Out (02:46:00):** the flag's dark square fills the frame (it's a natural wipe). Then **MATCH** into the matte of SH15.

### SH15 · 02:46:00 → 03:00:00 · End card
- **VO:** "and let the product be the entry ticket. Follow for the money behind the world's biggest brands."
- **Plate:** matte #0A0A0C with a vector grid floor in perspective (4% opacity, vanishing point at y 700), slowly scrolling toward the lens.
- **Frame:** "FOLLOW FOR" at y 640 (mono), "THE MONEY BEHIND THE BIGGEST BRANDS" at y 700 (86 px, 2 lines), the Follow pill at y 1040 (480×136), the sources at y 1600.
- **Camera:** a 1.00 → 1.02 push across the full shot, plus the 2 px micro drift. The type is pinned 300 mm above the grid floor, so it parallaxes against the scrolling grid.
- **Layers by second:**
  - **02:46:15:** the headline rises line by line with the snap curve, motion blur on.
  - **02:48:00:** the Follow pill draws on: a trim-path outline (1 px yellow) over 12 f, then a fill. Its glow lights the grid floor under it.
  - **02:52:00:** the cursor enters from the bottom right on an ease-out.
  - **02:55:00, on a designed tap hit:** **IMPACT MONO 1 f** (budget item 9). The pill presses to 0.95 and flips to "Following" with a yellow outline. A short crimson-to-yellow ring pulse spreads 80 px out across the floor.
  - **02:56:00:** sources line: `RED BULL COMPANY FIGURES 2024 · COCA-COLA 10-K · YOUTUBE VIA TUBEFILTER (2012) · ESTIMATES LABELLED`.
  - **02:56:00 → 02:59:29:** the music climaxes. The grid scroll speeds up from 20 to 120 px/s.
- **Out (03:00:00):** **a hard cut to black on the last frame**, and the music cuts on the same frame. No fade.

---

## Appendix A · Impact-frame log (9 uses, 11 frames)
| # | TC | Type | Length | Reason |
|---|---|---|---|---|
| 1 | 00:02:15 | INV | 2 f | "doesn't" + vinyl stop |
| 2 | 00:25:00 | MONO | 1 f | Smash into dead air |
| 3 | 00:35:00 | CRIM | 1 f | Beat drop |
| 4 | 01:35:00 | INV | 2 f | Out of Stratos into $0 |
| 5 | 01:38:15 | MONO | 1 f | $30–50M card |
| 6 | 01:42:00 | CRIM | 1 f | Exposure card |
| 7 | 02:07:15 | MONO | 1 f | B-roll burst |
| 8 | 02:11:00 | CRIM | 1 f | B-roll burst |
| 9 | 02:55:00 | MONO | 1 f | Follow tap |

## Appendix B · Sound-hit sheet (lock the music to this)
00:00:00 sub swell in · 00:00:15 shimmer on the reveal · 00:02:15 vinyl stop and music out · 00:04:00 orbit whoosh rising · 00:05:00 whip + sub · 00:06:00 lock-on tick · 00:07:15 low hit on "$5.1B" · 00:14:00 riser → sub (Z-punch) · 00:16:00 / 00:18:00 slab thuds · 00:21:00 odometer roll · 00:25:00 all audio out · 00:27:15 air-pressure thump · 00:35:00 the drop · 00:35:15–00:37:15 hi-hat arrows · 00:40:15 coin tick · 00:44:00 coin + register · 00:50:00 riser hit · 00:52:00–00:58:00 one arpeggio note per node · 01:05:00–01:14:00 arpeggio doubling · 01:15:00 cut to wind + drone · 01:27:00 soft data ticks under the counter · 01:35:00 / 01:38:15 / 01:42:00 cinematic booms · 01:55:00 bass hit + whip · 01:55:12 pitch-down · 02:04:00 / 02:11:00 car pass-bys · 02:15:00 pass-by wipe · 02:17:00 / 02:23:15 / 02:30:00 screen boots · 02:40:00 final build begins · 02:55:00 tap · 03:00:00 hard stop.

## Appendix C · Brand note
This look overrides AVRON brand v2 **for this reel only**, because the user asked for it in writing (2026-11-06). It brings back glow, chromatic aberration, scanlines and flash frames, and brand v2 bans all four. `brand_lint.py` will fail on it. That's expected, so don't "fix" it. The next reel goes back to brand v2 unless the user asks again.
