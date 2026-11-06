# Module 7: Cinematic production bible

Project REPLAY. Written 2026-11-06. Niche-agnostic. Assumes: faceless at launch, premium documentary and advertising quality, built from Remotion motion graphics, licensed or free stock, self-shot footage, ElevenLabs VO, 1080x1920 at 30 fps. No copyrighted film clips, no celebrity likenesses.

This document says how a reel is made. Module 11 says how a reel is judged. The Replay Scorecard (another module) says what a reel is for.

---

## 1. Creative stance

### What premium looks like on a phone at 11:30 PM

The viewer is lying down, one thumb free, brightness at 40 percent, sound probably on (Meta says over 75 percent of Reels views on Instagram are sound on). The screen is 6 inches tall and the reel is competing with a swipe that costs nothing. Premium, in that setting, is not more. It is less, placed exactly.

Premium on a phone means:

- One idea per frame. The eye lands on one thing and knows why.
- Type you can read at arm's length without squinting, inside the area the UI does not cover.
- Motion that obeys physics but never shows off. Nothing bounces. Nothing shakes.
- Sound that is mixed for a phone speaker and still feels designed when headphones are in.
- A cut rate that breathes. Fast when the story is fast, slow when the reveal needs a second of air.
- Facts with a source on screen. The viewer does not have to trust us; they can check.
- A reason to watch it twice that was built into the edit, not bolted onto the caption.

Premium is what a viewer notices as "this was made by someone who cares", even if they could not say why. Low effort is what they notice instantly: default fonts, stock glow, a bounce on every title, a fade on every cut, music that does not know where the words are.

### The ten rules of the house

| # | Rule | Why |
|---|------|-----|
| 1 | One primary motion at a time. Secondary motion is support, never a second subject. | Attention is a single beam. Two subjects halve both. |
| 2 | Every cut has a reason you can say in one line: emotion, story, rhythm, eye-trace, in that order. | Murch's priority list, see section 5. |
| 3 | No fade as a crutch. A dissolve or fade must mean time passing or a mood shift. Otherwise cut. | Fades hide weak edits and slow the reel. |
| 4 | Type inside the safe zone, at or above the house minimum size, at or above 4.5:1 contrast. | The reel is useless if the words are hidden or unreadable. |
| 5 | No bouncy easing, no camera shake, no particle rain, no glow. Named curves only. | These are the fingerprints of templated content. |
| 6 | Silence is a tool. Plan at least one 0.5 to 1.0 s gap per reel. | The ear hears the gap as "something matters now". |
| 7 | Every number has its source on screen, in the same frame. | Trust is the product. |
| 8 | Avoid crushed blacks and large smooth dark gradients. Lift shadows to 8 to 12 percent and add fine grain where gradients are unavoidable. | Instagram's encode bands and blocks dark gradients first. |
| 9 | Build the loop and the hidden detail before the hook. The replay is the point. | A reel that loops cleanly earns the second view that the ranker rewards. |
| 10 | Nothing ships without the cut gate (Module 11) and a phone check at 40 percent brightness with the phone speaker. | The reel is seen on a phone, not on the monitor it was made on. |

---

## 2. Visual direction

### 2.1 Composition: the 9:16 framing system

The canvas is 1080 x 1920. Three layers of margin govern where things go.

| Zone | Pixels (1080x1920) | Source | What goes there |
|------|--------------------|--------|-----------------|
| Ad-safe (strict) | Top 14% = 269 px, bottom 35% = 672 px, each side 6% = 65 px clear of text, logos and key elements | Meta Instagram Reels ad spec | Use this when a reel might ever be boosted or used as an ad |
| Organic UI-safe (house) | Top 250 px, bottom 450 px, right 130 px clear of essential text and numbers | House rule, derived from third-party measurements of the Reels UI (220 to 250 top, 340 to 450 bottom, about 120 right) | Default for every organic reel |
| Title-safe (house) | x 90 to 990, y 300 to 1420 | House rule, inside organic UI-safe with extra breathing room | Headlines, hero numbers, source chips |
| Caption band (house) | y 1250 to 1420, centred, max width 900 px | House rule | Burned-in captions, above the Instagram caption overlay |
| Centre stage | 1080 x 1220 block from y 350 to 1570 | House rule | Where the eye rests by default; the main subject lives here |

Framing systems used, in order of preference:

1. Centre stage. Subject on the vertical centre line, eye-level between y 700 and 900. Best for a single hero number, a product panel, a face in self-shot footage.
2. Thirds. Vertical thirds at x 360 and 720, horizontal thirds at y 640 and 1280. Place a subject on the upper-left or upper-right intersection and let the text fill the opposite third.
3. Stacked thirds. Top third headline, middle third visual, bottom third caption and source. Good for explanatory beats.
4. Bleed. Full-bleed footage with the subject in the centre third and text later. Use when the footage is the point.

Headroom in self-shot or stock footage: for a medium shot, the eyes sit on the upper horizontal third (y about 640). For a close-up, eyes at y about 560 to 600 with the top of the head allowed to crop. Never leave more than 200 px of empty space above a head unless the empty space is the point.

### 2.2 Camera perspective

Each reel picks one camera language and keeps it. Mixing languages is the fastest way to look assembled rather than directed.

| Language | Use | Rule |
|----------|-----|------|
| Eye-level observer | Documentary beats, interviews, product in use | Lens at subject eye height, no tilt |
| Slight low (5 to 10 degrees) | Give an object or building weight | Never on people in a way that reads as flattery |
| Top-down | Flat lays, maps, data tables | Keep the camera exactly perpendicular; a 2 degree error looks like a mistake |
| Front-on graphics camera | All motion-graphics scenes | The graphics camera has no lens distortion and moves only on push, dolly, and rack focus |

### 2.3 Lens aesthetics (simulated)

Remotion scenes have no lens. We simulate one by controlling three things: field of view (how much parallax a push creates), depth of field (how much blur the background gets), and edge behaviour (vignette, anamorphic squeeze of highlights).

| Simulated focal length | Look | When |
|------------------------|------|------|
| 35 mm equivalent | Wide, context, slight parallax, background in focus | Establishing a scene, maps, environments |
| 50 mm | Neutral, what the eye sees | Default for product panels and documentary footage |
| 85 mm | Compressed, shallow depth, background soft | Hero numbers, a single object, a reveal |
| 135 mm | Very compressed, background a wash | Rarely, for one intimate beat per reel |

Depth of field rule: background blur radius scales with the simulated focal length and the subject's distance from the background layer. At "85 mm", background blur of 12 to 20 px on a 1080-wide canvas reads as shallow focus without smearing. At "35 mm", 0 to 4 px.

Anamorphic look: horizontal oval bokeh, a faint blue horizontal flare on specular highlights, and a 2.39:1 letterbox feel compressed into 9:16 by using horizontal bands. Earn it. Use it only on reels whose subject is cinematic by nature (a landscape, a vehicle, a stadium). Never on UI or data. If used, the flare is one element, it is 4 to 8 percent opacity, and it appears for one beat.

### 2.4 Depth: three layers minimum

Every graphics scene is built on at least three planes.

| Plane | Content | Parallax factor on a push | Blur |
|-------|---------|---------------------------|------|
| Background | Colour field, soft texture, far footage | 0.2 | 0 to 8 px depending on simulated focal length |
| Midground | The subject: panel, number, object, footage | 1.0 | 0 |
| Foreground | A rule, a chip, an edge of an object, a shadow | 1.4 to 1.8 | 2 to 6 px |

The foreground plane is what makes a scene feel photographed rather than drawn. It can be as small as a 2 px rule that moves slightly faster than the panel behind it.

### 2.5 Lighting moods

Lighting in graphics is the direction and softness of the shadows and the brightness falloff of the background. Pick one mood per reel.

| Mood | Background | Shadows | Highlight | Use |
|------|------------|---------|-----------|-----|
| Daylight studio | Light grey to off-white, slight top-to-bottom falloff of 6 to 10 percent | Soft, 20 to 40 px blur, 8 to 12 percent opacity | None | Explainers, product, clean data |
| Overcast | Mid-grey, flat | Very soft, almost none | Slight rim on the subject | Serious or sad stories |
| Lamp | Warm dark field, one soft pool of light | Directional, 40 to 60 px | Warm rim | Night, nostalgia, intimacy |
| Edge | Near-black field, subject lit from one side | Hard, 10 to 20 px | Cool rim, 1 to 2 px | Mystery, tension, reveal |

Lamp and Edge are the dangerous ones for compression. Follow the grading rules below.

### 2.6 Colour grading

Two facts drive everything:

- Instagram re-encodes every upload to H.264 at a bitrate it chooses, with 4:2:0 chroma subsampling, in 8-bit. Smooth dark gradients band and block first because 8-bit quantisation has the fewest steps in the shadows, and encoders starve dark areas of bits. Fine grain is expensive to keep, so the encoder strips it, which removes the dither that was hiding the banding.
- 4:2:0 stores one colour sample for every four pixels. Thin saturated text, especially red on a contrasting ground, fringes and blurs at the edges.

House rules that follow:

| Rule | Value |
|------|-------|
| Black point in graphics | Never below 8 percent luminance (about RGB 20) in large areas. 5 percent allowed only in small details. |
| Dark gradients | Keep the span short. A gradient from 8 to 18 percent across the full frame is fine; 2 to 30 percent will band. Add 1.5 to 2.5 percent monochrome grain over any gradient wider than 20 percent luminance. |
| Saturated text | No pure red or pure blue text below 56 px. Use desaturated or darker tints with luminance contrast doing the work. |
| White point | 95 percent (about RGB 242) for large fields; 100 percent only on small highlights. Pure white fields look blown on OLED at night. |
| Contrast of text | WCAG minimum 4.5:1 for all text; 3:1 allowed for text at or above 72 px bold. House target 7:1 for captions. |
| Skin | Keep skin luminance between 45 and 70 percent and hue inside the 20 to 40 degree band; never push warmth into orange. |

Three named grade recipes. Describe them in LUT terms so a colourist or a Remotion colour function can rebuild them.

**Recipe A: Clean Daylight**
- Lift: +0.02 (shadows sit at 8 to 10 percent)
- Gamma: neutral, slight S-curve with 4 percent contrast in the midtones
- Gain: 0.96 (whites capped at 95 percent)
- Saturation: 0.95 overall; skin protected at 1.0
- Hue shifts: none
- Grain: 1.5 percent, monochrome, 1 px
- Use: explainers, product, data, most reels

**Recipe B: Warm Lamp**
- Lift: +0.03 with a 2 percent warm bias (R up, B down) in shadows
- Gamma: 0.92 (slightly darker midtones), midtone warmth +4 degrees of hue toward amber
- Gain: 0.94, highlights desaturated 10 percent so warm lights do not go orange
- Saturation: 0.9
- Grain: 2.5 percent, monochrome, 1.2 px; mandatory because this recipe lives on gradients
- Halation: 3 to 5 percent bloom only on highlights above 85 percent luminance, 12 px radius
- Use: nostalgia, night, memory, human stories

**Recipe C: Cold Edge**
- Lift: +0.025 with a 3 percent cool bias in shadows
- Gamma: 0.88, contrast +8 percent in the midtones
- Gain: 0.95, highlights with 1 to 2 px cool rim on subjects
- Saturation: 0.85 overall; one accent colour allowed at 1.0
- Grain: 2 percent, monochrome
- Use: mystery, fraud, risk, tension, reveal

Stock and self-shot footage matching: match the footage to the recipe, not the recipe to the footage. Steps: neutralise white balance on a grey or white reference in the clip, set skin to the band above, match black and white points to the recipe, then apply the recipe. Two clips in the same reel must agree on black point within 2 percent and skin hue within 5 degrees, or the viewer feels the seam.

### 2.7 Texture: grain and halation

Grain is a dither and a signature, not a filter. Halation is a memory of film, used once.

| Element | How much | When |
|---------|----------|------|
| Grain | 1.5 to 2.5 percent, monochrome, 1 to 1.2 px, animated per frame | Always on Recipe B and C; optional on A; mandatory over any wide gradient |
| Halation | 3 to 5 percent bloom on highlights above 85 percent luminance | Recipe B only, or one beat in C |
| Vignette | 4 to 8 percent at the corners, soft | Lamp and Edge moods only |
| Chromatic aberration | 0 | Never; it reads as an effect |
| Lens dirt, light leaks, dust | 0 | Never |

### 2.8 Scene transitions: taxonomy and rules

A transition is a decision about what the viewer carries across the cut. The default is the cut. Everything else must earn its place.

| Transition | Definition | Duration | Use it when | Never when |
|------------|------------|----------|-------------|------------|
| Cut | Instant change | 0 frames | Default. Any time the next shot has a clear subject and the sound carries | The next shot has no clear subject |
| Match cut | Cut where shape, position, motion, colour or sound lines up across the cut | 0 frames, with 2 to 4 frames of motion overlap | A shape in shot A is the shape in shot B; a number becomes a chart; a circle becomes a coin | The match is approximate; a near-miss is worse than a plain cut |
| Masked wipe | Shot B revealed through a moving mask (a panel edge, a rule, an object) | 8 to 14 frames | A UI element or object naturally moves across frame; chapter changes | Nothing in the frame could plausibly be the mask |
| Push | Shot A slides out as B slides in, same direction, with motion blur | 10 to 14 frames, cubic-bezier(0.7, 0, 0.2, 1) | Sequential steps, lists, left-to-right time | Emotional beats; a push is administrative |
| Zoom-through | Camera pushes into a detail of A until it fills the frame and becomes B | 14 to 24 frames | Going from the big picture to a detail, or from a map to a place | The detail is not legible before the push starts |
| Sound-led cut | The audio of B starts 4 to 12 frames before the picture of B (J-cut), or A's audio runs 4 to 12 frames into B (L-cut) | Audio offset only | Nearly every dialogue or VO cut; any time the cut should feel invisible | Hard-impact reveals, where the picture and the sound land together |
| Dissolve | A and B overlap in opacity | 12 to 24 frames | Time passing, a memory, a mood shift | Hiding an edit that does not work |
| Fade to colour | A goes to a colour field, then B | 8 to 12 frames each side | Once per reel at most: a chapter break or the reveal gap | Anywhere else |

Rules:

- Two consecutive transitions of the same non-cut type is a pattern. Three is a template. Break it.
- Smith and Henderson found a quarter of cuts between two views of the same scene go unnoticed, rising to a third when the cut lands on a sudden onset of motion. Use this: cut on motion when you want invisibility, cut on stillness when you want the cut to be felt.
- Motion blur on pushes is mandatory. A push without blur looks like a slideshow.

### 2.9 Subject movement

- A subject moves for a reason the viewer can infer: it is being pointed at, it is being replaced, it is responding to something.
- Movement follows arcs, not straight lines, unless it is a UI element on a rail.
- Every move has anticipation (a 2 to 4 frame dip against the direction of travel at 2 to 4 percent of the distance) and settle (a damped landing, never an overshoot larger than 1 percent).
- Objects at rest are not fully at rest: a 0.3 to 0.6 percent drift over 3 seconds keeps a held frame alive without being noticed as motion.

### 2.10 Visual continuity rules

Continuity editing works because it uses the viewer's natural attention cues: gaze, motion, off-screen sound. These rules apply to graphics exactly as they apply to footage.

| Rule | Footage | Graphics |
|------|---------|----------|
| 180 rule | Keep the camera on one side of the axis between two subjects so screen direction holds | If a chart compares A and B, A stays on the left for the whole reel. If a timeline runs left to right, it never runs right to left later |
| Eyeline / readline | Cut from a look to the thing looked at | Cut from a pointer, a cursor, or a headline's reading end to the thing it refers to. A headline that ends at the right edge is followed by a subject entering from the right |
| Direction of travel | A subject exiting right enters the next shot from the left | A number counting up moves up; "fall" always animates down; growth always moves rightward or upward |
| Scale continuity | A wide to a close-up of the same subject keeps the subject in the same screen position | A panel that zooms into a detail keeps that detail at the same screen position before and after |
| Light continuity | Key light from the same side across a scene | Shadows fall the same way across every panel in a reel |

---

## 3. Motion graphics

### 3.1 Kinetic typography system

Phone reality first. A 1080-wide reel is shown on a phone about 390 CSS pixels wide, so 1 reel pixel is about 0.36 CSS pixels. Material's 16 sp body minimum and Apple's 17 pt body size translate to roughly 44 to 47 reel pixels. WCAG large text (18 pt, or 14 pt bold) is about 24 CSS px, which is 66 reel px.

| Role | Size (px, 1080x1920) | Weight | Max width | Notes |
|------|----------------------|--------|-----------|-------|
| Hero numeral | 180 to 280 | Semibold to bold, tight tracking | 900 | One per beat |
| Headline | 80 to 120 | Semibold | 900, max 2 lines | One per beat |
| Sub-headline | 56 to 72 | Medium | 900 | Supports the headline, never competes |
| Body / caption | 52 to 64 | Medium | 900, max 2 lines | Burned-in captions use 56 |
| Label, chip, source | 40 to 48 | Medium, mono allowed | 500 | 40 is the house floor. Nothing smaller ships. |
| Axis tick, footnote | 36 | Regular | 300 | Only inside data views, never carrying a fact |

Hold time formula for on-screen text (house rule, derived from the Netflix adult limit of 20 characters per second and the BBC's commonly cited 160 to 180 words per minute, with a margin because on-screen text is also a composition the viewer has to find):

- Hold (seconds) = 0.6 + 0.35 x words, minimum 1.0 s, for headlines and body.
- Hold = 0.4 + 0.3 x words, minimum 0.8 s, for a label or chip the VO is already saying.
- Never exceed 15 characters per second of new text on screen.

Examples: a 3-word headline holds 1.65 s; a 6-word headline holds 2.7 s; a 10-word body line holds 4.1 s (so rewrite it to 6 words).

Reveal styles, in order of how often they should be used:

| Reveal | Description | Duration | Easing |
|--------|-------------|----------|--------|
| Masked rise | Text rises 20 to 30 px into a clip mask | 14 to 18 frames | cubic-bezier(0.2, 0, 0, 1) |
| Per-character blur-to-sharp | Characters resolve from 8 px blur and 0 opacity, staggered 1 frame each | 12 frames plus stagger | cubic-bezier(0.2, 0, 0, 1) |
| Word-by-word on the VO | Each word appears as it is spoken, no motion, instant | 0 frames per word | none |
| Count-up | Numeral counts from a start value, slows into the final value | 20 to 36 frames | cubic-bezier(0.1, 0, 0.1, 1) |
| Replace in place | Old word cuts out, new word cuts in at the same baseline | 0 frames, 2 frame gap | none |
| Shrink into title | A headline shrinks and travels to become the title of the next panel | 16 to 22 frames | cubic-bezier(0.7, 0, 0.2, 1) |

Banned: typewriter with cursor, bounce in, elastic, rotate in, 3D flip, glow pulse, letter-by-letter from random positions.

Easing library (named, no bounce, no elastic). All values are CSS cubic-bezier.

| Name | Value | Use |
|------|-------|-----|
| house-standard | cubic-bezier(0.2, 0, 0, 1) | Default for anything that enters or moves and settles (Material 3 standard easing) |
| house-exit | cubic-bezier(0.3, 0, 1, 1) | Anything leaving the frame (Material 3 accelerate) |
| house-snap | cubic-bezier(0.7, 0, 0.2, 1) | Pushes, shrink-into-title, anything on a beat |
| house-settle | cubic-bezier(0.1, 0, 0.1, 1) | Count-ups, slow camera pushes, long holds that must not look stopped |
| house-legacy | cubic-bezier(0.4, 0, 0.2, 1) | Material 1 standard; allowed when matching an older scene |

Durations: 225 ms (7 frames) for a small element entering; 300 ms (9 frames) for a standard move; 375 to 500 ms (11 to 15 frames) for a full-frame change. Material warns UI transitions over 400 ms feel slow; a reel allows up to 500 ms for full-frame moves because the viewer is watching, not operating.

### 3.2 Editorial graphics

| Element | Spec |
|---------|------|
| Lower third | Left-aligned at x 90, baseline y 1380, name at 56 px, role at 40 px, 1 px rule above, enters by masked rise over 12 frames, holds 3 s minimum |
| Source chip | 40 to 44 px mono or medium, pill with 1 px border, placed under the number it supports, within 120 px of it, same frame. Format: "Source: RBI, Oct 2026". Enters 2 frames after the number |
| Label | 44 px, sits on a 1 px leader line to the thing it names, leader draws over 8 frames |
| Date stamp | 40 px, top-left of the title-safe box, only when the date is part of the story |
| Estimate marker | Dashed border and the word "est." on any number that is not a reported figure |
| Disclaimer | 36 to 40 px, bottom of the title-safe box, on screen for the full duration of any beat that mentions a security |

### 3.3 Tracking elements

Elements attached to footage (a label on a building, a chip on a product) must track. Rules:

- Track with a 2D point tracker and smooth the path with a 5 frame window. A jittery label is worse than no label.
- The leader line stays attached to the tracked point; the text box stays level.
- If the track fails for more than 6 frames, cut the label; never let it float.

### 3.4 2D versus 3D

3D earns its place only when the subject is three-dimensional and the third dimension carries information: a product that must be seen from two sides, a building, a map with elevation, a chart whose third axis is the point. Otherwise 2D with depth layers (section 2.4) looks more expensive than mediocre 3D.

If 3D is used: one object, one material, one key light plus a fill, soft shadows, no reflections of a studio that does not exist, and 2.5D isometric card stacks are banned.

### 3.5 Parallax recipe

1. Separate the scene into at least three planes (section 2.4).
2. Decide the camera move: push of 4 to 8 percent scale over 2 to 4 s, or a lateral dolly of 40 to 80 px.
3. Apply the move to the midground at factor 1.0, the background at 0.2 to 0.35, the foreground at 1.4 to 1.8.
4. Use house-settle easing so the move never visibly stops.
5. Add 1 to 2 px of motion blur on the foreground plane only.
6. Check the edges: any plane that reveals its boundary during the move needs 10 percent overscan.

### 3.6 Match cut recipes

| Type | Recipe | Example |
|------|--------|---------|
| Shape | Find a dominant shape in the last 6 frames of A. Build the first frame of B so the same shape is at the same position within 8 px and the same size within 4 percent. Cut. Let B's shape animate away from that position over 10 frames | A coin becomes a pie chart; a phone screen becomes a window |
| Motion | A moves in a direction at a speed. B's subject continues that vector on frame 1 of B and decelerates with house-standard | A truck exits right; a bar chart's bar grows right |
| Colour | A's dominant colour fills 60 percent of the frame on its last frame; B's first frame uses the same colour as its background, which then recedes | A red warning becomes a red field becomes a red line on a chart |
| Sound | A sound in A (a click, a ring, a beat) resolves in B as a different source of the same sound | A metronome tick in A becomes a stock ticker tick in B |

The test for every match cut: freeze the last frame of A and the first frame of B side by side. If a stranger cannot say what matches, it is not a match cut.

### 3.7 Speed ramps

Use a ramp when the footage has a moment that deserves a longer look, or when the edit needs to compress dead time.

- Ramp down into a reveal: 100 percent to 25 percent over 12 frames, hold at 25 percent for 12 to 24 frames, cut.
- Ramp up out of a hold: 25 percent to 100 percent over 8 frames, then cut on the first full-speed frame.
- Never ramp through a frame that has a person's face in motion; it looks like a glitch.
- Optical flow interpolation only when the source is 60 fps or higher; otherwise frame blend at the slow section and accept softness.
- One ramp per reel is a device. Three is a style, and that style is dated.

### 3.8 Camera simulations in post

| Move | Recipe | Easing | Duration |
|------|--------|--------|----------|
| Push | Scale 100 to 106 percent on the midground, with parallax factors on the other planes | house-settle | 2 to 4 s |
| Dolly | Lateral translate 40 to 80 px with parallax | house-settle | 2 to 4 s |
| Rack focus | Background blur from 0 to 14 px while foreground blur goes 10 to 0 px, cross over 10 frames | house-standard | 14 to 18 frames |
| Tilt | Vertical translate 60 to 120 px with parallax | house-settle | 2 to 3 s |
| Whip | 30 to 60 px travel in 4 frames with 8 px directional blur, used as a transition | house-snap | 4 to 6 frames |

No handheld simulation. No shake. A reel that needs energy gets it from the cut, not from a wobble.

### 3.9 Animated maps

- Projection: equirectangular for world, a plain Mercator-like local projection for a country or city. No globe spins.
- Style: land at 12 to 16 percent luminance over a background at 8 to 10 percent (Recipe C) or land at 88 percent over 95 percent (Recipe A). Borders as 1 px lines at 20 percent contrast. No terrain, no satellite texture.
- Labels at 44 px; at most 4 labels on screen at once.
- Points appear as a 12 px dot with a 1 px ring that expands to 48 px and fades over 20 frames, once. No pulsing.
- Routes draw as a 3 px line over 20 to 40 frames with house-standard; the camera follows the drawing head with a lag of 6 frames.
- A map camera move is a push or a dolly, never a flight.

### 3.10 Data visualisation rules

- One number per frame. If two numbers must be compared, they appear in sequence and then together, never together first.
- The source chip is on screen in the same frame as the number, at or above 40 px.
- Bars and lines draw in the direction the data runs: time left to right, growth upward.
- No chart junk: no 3D bars, no gradients on bars, no drop shadows on lines, no gridlines heavier than 1 px at 15 percent contrast, no legend when direct labels fit.
- Axes start at zero for bars. For lines, the y-axis may be cropped only if the crop is labelled and the first frame shows the full range.
- Estimates use dashed strokes and the word "est.".
- The y-axis label, unit and time range appear before the data draws, not after.
- Colour: one accent for the subject series, grey for everything else. Green and red only for direction, never as decoration.
- The chart's final state holds for at least the headline hold time (section 3.1) before anything else moves.

---

## 4. Sound design

Meta's own figure is that over 75 percent of Reels views on Instagram are sound on, and Instagram says muted reels are among those it makes less visible. Sound is therefore half the reel, not a layer added at the end. Smith's follow-up work on edit blindness also found audio plays a large role in making cuts invisible; without the audio track, cuts were far more noticeable.

### 4.1 Ambient beds

- Every scene has a bed, even graphics scenes: room tone, a faint city, an office hum, at minus 38 to minus 32 LUFS short-term. The viewer does not hear it; they hear its absence when it stops.
- Beds change on scene changes with a 12 to 20 frame crossfade, never a hard cut, unless the hard cut is the point.
- Bed content must live above 200 Hz to exist on a phone speaker. A sub rumble is invisible on phones and only eats headroom.

### 4.2 UI foley

Graphics get foley the way footage gets footsteps. One sound per primary motion, nothing for secondary motion.

| Motion | Sound | Level (peak, relative to VO) | Length |
|--------|-------|------------------------------|--------|
| Panel enters | Soft paper or card slide | minus 14 dB | 120 to 200 ms |
| Number counts | Fine tick train, slowing with the easing | minus 18 dB | Matches the count |
| Number lands | Soft wooden tap | minus 10 dB | 80 to 120 ms |
| Chip appears | Short click | minus 18 dB | 40 to 60 ms |
| Line draws | Thin airy sweep | minus 20 dB | Matches the draw |
| Push transition | Low whoosh with a top-end transient | minus 12 dB | 200 to 300 ms |
| Masked wipe | Fabric or paper slide | minus 14 dB | Matches the wipe |

Rules: a foley kit is made once from a real source (an ElevenLabs SFX generation, a recorded object, or a licensed library) and reused on every reel so the page has a sound. No synthesised bleeps. Foley is placed on the first frame of the motion, not the frame it was noticed on.

### 4.3 Cinematic impacts: density caps

Impacts are the sugar of short-form sound. The cap is low.

- Maximum 3 impacts per 30 s, maximum 5 per reel of any length.
- No two impacts within 4 s of each other.
- An impact must have energy between 150 and 600 Hz or it does not exist on a phone speaker. A sub-only boom is a silent frame on most phones.
- Peak at minus 3 dB relative to VO, never above the VO.
- Every impact is attached to a visual event that lands on the same frame.

### 4.4 Music and music transitions

- One cue per reel, or two with one transition. A reel with three cues is a playlist.
- Music transitions happen on a bar line. The outgoing cue ducks by 6 dB over one beat, the incoming cue enters on the downbeat at full level, with a 4 to 8 frame crossfade.
- Music tempo is chosen to the cut rate: at 120 BPM a beat is 0.5 s and a bar is 2 s, which fits a 2 to 4 s shot rhythm. Cut on beats, change scenes on bars.
- Music never starts with the VO's first word. Either the music starts 0.5 to 1.0 s before the VO (sets a mood), or the VO starts dry and the music enters under the second sentence (focuses on the words).

### 4.5 Audio callbacks

An audio motif is a 2 to 4 note phrase or a specific sound that returns with changed meaning. Design:

1. Plant it in the first 5 s under a neutral image.
2. Return it at the turn, under the fact that changes the story.
3. Return it at the end, under the reframe, possibly in a different register or slowed.

The second hearing works because the first was unremarkable. Do not make the motif a sonic logo; the sonic logo is a separate thing and lives on the end card only.

### 4.6 Silence

The gap before a reveal is the most powerful tool in the kit and the cheapest.

- Duration: 0.5 to 1.0 s. Under 0.4 s reads as an edit error; over 1.2 s reads as a dropout and the thumb moves.
- What stops: music and bed. What stays: nothing, or a single room tone at minus 40 LUFS so the file is not digital silence (some players treat true silence as a fault).
- The frame during the gap: either a hold on the frame before the reveal with the subject's drift continuing (section 2.9), or a cut to a near-empty frame.
- Exit: the reveal lands with its sound on the same frame the gap ends. Music re-enters 2 to 6 frames later, never on the same frame as the reveal, so the reveal sound is heard alone.
- One planned gap per reel. A second is allowed at the ending reframe.

### 4.7 VO layering

- VO is the lead. Everything else sits under it.
- VO is processed once, the same way on every reel: high-pass at 80 Hz, gentle de-ess, 2 to 3 dB of compression at a 3:1 ratio, a 1 dB presence lift at 3 kHz if the voice needs it, and nothing else.
- Short-term loudness of VO: minus 16 to minus 18 LUFS, so that the integrated mix lands at minus 14.
- Breaths are kept at minus 12 dB relative to the words, not cut. Cut breaths sound like a machine.
- VO pauses are planned on the timeline before the music is placed; the music is then cut to the pauses, not the other way around.

### 4.8 Sound bridges: J-cuts and L-cuts

- J-cut: the next scene's audio (VO, bed, or a diegetic sound) starts 4 to 12 frames before its picture. Use it for almost every scene change where the story continues; the ear leads the eye and the cut feels inevitable.
- L-cut: the previous scene's audio runs 4 to 12 frames into the new picture. Use it when the new picture is a reaction or an illustration of what was just said.
- Hard cut (no bridge): reserved for reveals and shocks, where the picture and the sound must land together.
- Rule of thumb: in a 60 s reel with 18 scene changes, 12 to 14 are J-cuts or L-cuts, 2 to 4 are hard cuts, and 1 or 2 are bridges across silence.

### 4.9 Mix spec

| Parameter | Target | Note |
|-----------|--------|------|
| Integrated loudness | minus 14 LUFS, tolerance plus or minus 1 LU | Common streaming normalisation level; Instagram publishes no official target, so this is a practitioner standard, not a platform spec |
| True peak | minus 1.0 dBTP | AES streaming recommendation; protects against clipping after the platform's re-encode |
| Loudness range (LRA) | 6 to 11 LU | Below 6 is flat; above 11 means the quiet parts vanish on a phone |
| VO short-term | minus 16 to minus 18 LUFS | Measured over the VO sections |
| Music under VO | 14 to 18 dB below VO short-term | Sidechain duck of 6 to 9 dB with a 150 ms attack and 600 ms release, plus static placement |
| Music without VO | 6 to 8 dB below the VO level | Never louder than the VO was |
| SFX peaks | 3 to 20 dB below VO as in 4.2 and 4.3 | Nothing above VO |
| Bed | minus 32 to minus 38 LUFS short-term | Felt, not heard |
| Phone-speaker check | Listen on a phone speaker; then solo a 150 to 600 Hz band and check every VO word, impact and foley hit is still present | Measured phone speakers roll off below roughly 200 to 250 Hz (an HTC One measured within plus or minus 3.5 dB only from 230 Hz up; an iPhone 7 Plus within plus or minus 3 dB from 550 Hz up at 45 degrees). What lives below that does not exist for most viewers |
| Mono check | Sum to mono; nothing may disappear | Phones with one speaker play mono |
| Format | 48 kHz, 24-bit WAV stems; AAC 256 kbps stereo in the delivery MP4 | |

---

## 5. Editing psychology

Each row gives the effect, the research that supports it, and the house rule that follows. The research is on film and television, not on Reels. Treat the rules as informed defaults, to be checked against the page's own retention data once it exists.

| Effect | What the research says | House rule |
|--------|------------------------|------------|
| Attention | Lang and colleagues found that camera changes within a scene (edits) raise physiological arousal, self-reported arousal and memory as the edit rate rises, and that related cuts add little cognitive load. A secondary summary of the related pacing work reports cognitive overload appearing at around ten or more unrelated scene changes in a 30 s message. Smith and Henderson found a quarter of continuity cuts go unnoticed, a third when the cut lands on motion onset. | Cut often within a scene (related cuts) to keep arousal up. Change scene (unrelated cuts) no more than 8 times per 30 s. Cut on motion when the cut should be invisible, on stillness when it should be felt. |
| Anticipation | Murch ranks emotion first (he gives it 51 percent of the weight), then story, rhythm, eye-trace, screen plane and 3D space. A cut that sets up an expectation and then delays its payoff is an emotional cut, not a rhythmic one. | Every reveal has a setup shot 2 to 6 s earlier that shows the question, and a 0.5 to 1.0 s silence before the answer. |
| Emotional intensity | The Kuleshov effect, re-tested by Barratt and colleagues in 2016, exists in some form: the shot next to a neutral face changes how its emotion is read. Context assigns feeling. | The shot after a number decides what the number means. Put the human consequence immediately after the figure, never before it. |
| Comprehension | Lang's limited capacity model: viewers have finite resources for encoding; production features that demand resources reduce memory for the central message. Netflix caps subtitles at 20 characters per second for adults. | One primary motion, one number, one new idea per 2 to 3 s. Text on screen at or under 15 characters per second. |
| Memory | Lang and colleagues: edit rate within a scene increased memory. Arousing content increased encoding up to the point of overload. | Keep the central fact in the most arousing section of the reel (the turn), not at the end where resources are spent. Repeat the central fact once, in a different form (said, then shown). |
| Retention | Cutting and colleagues measured average shot length falling from 8 to 10 s in the 1960s to 3 to 4 s by 2005, and found post-1980 films' shot-length variation followed a 1/f pattern that matches fluctuations in human attention. The pattern of variation matters separately from the average. Fast everywhere is not the finding; varied is. | Plan the cut rhythm as waves: runs of short shots (1 to 2 s) followed by a long shot (4 to 6 s). Never 20 shots of the same length. |
| Replayability | Instagram states the most important predictions in its Reels ranking are whether a viewer will reshare the reel and whether they will watch it all the way through. A loop that is invisible produces a second watch-through; a hidden detail produces a reshare with "did you see". | Build the loop (section 6.1) and one hidden detail (section 6.2) into every reel before the hook is written. |

### Editing styles mapped to emotional experiences

| Style | Emotion | Shot length | Cut on what | Music and sound posture | Replay device |
|-------|---------|-------------|-------------|-------------------------|---------------|
| Slow build | Awe, scale | Open at 4 to 6 s, shorten to 2 s at the peak, one 6 to 8 s shot at the top | Cut on the completion of a move; never mid-motion | Music enters late, builds in one direction, one impact at the peak, bed wide | The last frame matches the first at a different scale (ending reframes opening) |
| Rhythm and withhold | Comedy, delight | 1 to 2 s for the pattern, then one shot held 3 to 4 s that breaks it | Cut on the beat for the pattern, cut late (hold 12 to 18 frames past the expected cut) for the break | Music on a tight grid, foley on the beat, silence on the break, the punchline sound dry | A detail planted in the pattern pays off in the break; viewers replay to see it |
| Withheld information | Mystery, suspicion | 2 to 4 s, with the subject often off-centre or partly masked | Cut on a look or a pointer toward something not yet shown (readline) | Cold Edge recipe, bed at the top of its range, sparse music, one gap before the reveal | The reveal re-labels an earlier frame; a second watch reads that frame differently (double-layer) |
| Warm drift | Nostalgia, affection | 3 to 5 s, slow pushes, few hard cuts | Dissolves allowed (this is the one style where they mean something); cut on breath in the VO | Warm Lamp recipe, music with a long reverb tail, halation on highlights, L-cuts everywhere | An audio motif returns with changed meaning at the end |
| Hard cut and silence | Shock, alarm | 1 to 2 s runs, then a hard cut to a 3 to 4 s hold | Hard cut without a bridge, on stillness, into silence | Music out on the cut, 0.8 to 1.0 s of silence, a single impact in the 150 to 600 Hz band, VO dry | The frame after the silence is the seamless-loop frame; the reel restarts into the same shock |
| Procedural | Clarity, competence | Even 2 to 3 s, pushes between steps | Cut on the completion of each step, with a J-cut into the next step's VO | Daylight recipe, UI foley on every primary motion, music steady and low | The last step's panel is the first step's panel one state later (visual callback) |

---

## 6. Replay craft in production terms

### 6.1 The seamless loop

Instagram replays a reel automatically. A loop that is invisible produces a second watch-through, which is one of the two predictions Instagram says it weighs most.

Three loop types, from strongest to weakest:

**Frame-matched loop.** The last frame of the reel is the first frame of the reel.

1. Decide the loop frame first. It is a frame with a clear subject, no text in motion, and a sound that can both end and begin.
2. Build the opening so the first 6 to 10 frames are a continuation of a motion that the closing 6 to 10 frames start. Example: a panel slides in at the open; at the close, it slides out to exactly the position it was in on frame 1.
3. Match position within 2 px, scale within 1 percent, colour within 2 percent luminance.
4. Audio: the bed and music must be the same cue at the same bar position on the last frame and the first frame. Render the music so that the reel's duration is a whole number of bars at the cue's tempo (at 120 BPM, a multiple of 2 s). Crossfade the bed across the loop point: the last 12 frames of the bed are mixed with the first 12 frames.
5. Test by rendering the reel twice back to back and watching the join at 40 percent brightness.

**Sentence bridge.** The VO's last sentence runs into its first sentence. "...and that is why the price fell. [loop] The price fell 40 percent in a week, and nobody..." The last sentence must be written to be completed by the first. Place a 4 to 8 frame gap of bed only at the join so the VO does not clip.

**Soft loop.** The last frame and the first frame share composition, colour and mood but not the exact image. Weaker; used only when the story cannot be closed.

Loop killers: an end card with a logo and a CTA that holds for 3 s; a fade to black; music that ends on a cadence; a VO sign-off. If the brief needs an end card for the goal (follow, save), build it as a frame inside the loop: the CTA appears over the loop frame and the loop frame continues under it.

### 6.2 Planting a hidden detail legibly

A hidden detail is something a first-time viewer can miss but a second-time viewer can find. "Hidden" means not pointed at. It never means too small to see.

| Parameter | Value |
|-----------|-------|
| Size | At least 48 px tall (text) or 80 px (an object) at 1080 wide. Below that, it is not hidden, it is invisible |
| Contrast | 3:1 against its background, no more than 4.5:1. It must be findable, not shouted |
| Position | Inside the title-safe box, away from the primary subject by at least 200 px, never in the bottom 450 px where the UI covers it |
| Timing: the 3-frame rule | The detail is fully resolved for at least 3 frames before any primary motion starts in that shot and stays for at least 24 frames (0.8 s) total. Three frames is the minimum for a change to register as a thing rather than a flicker, and 0.8 s is enough to be found on the second view |
| Sound | No sound on the plant. A sound on the plant makes it the primary motion |
| Payoff | The detail must be re-read by the reveal. A detail that is just an Easter egg is decoration; a detail that changes meaning is a reason to rewatch |

Test: show the reel once to someone who has not seen it and ask what they noticed. Then tell them the detail and show it again. If they cannot find it on the second view within one pass, enlarge it. If they found it on the first view unprompted, it was not hidden.

### 6.3 Double-layer storytelling staging

A reel reads one way the first time and another way the second time. Staging:

1. Write the surface story and the under story as two one-line sentences.
2. Mark every shot with S (surface only), U (under story visible if you know it) or B (both).
3. The first third is all S and U; the reveal is the first B; the last third is B.
4. U shots carry their under-story element at hidden-detail spec (6.2). The element is in the same position on every U shot so the second viewing can track it.
5. The VO never says the under story until the reveal. The pictures say it from the start.

### 6.4 Visual callback staging

A callback is an element that returns changed. Staging rules:

- The first appearance is plain: no sound, no emphasis, held 1.5 to 2 s, in a fixed position.
- The return is in the same position within 20 px, the same size within 10 percent, with one thing different (colour, number, state, orientation).
- The return gets the sound the first appearance did not.
- One callback per reel. Two if the second is the ending reframe.

### 6.5 Ending reframes opening

The last shot is the first shot with the meaning changed. Production:

1. Build the first shot with one element that can carry a second meaning (a number, a label, a state).
2. Build the last shot from the same composition file. Change only the element and the grade (Daylight to Cold Edge, or Lamp to Daylight).
3. If the loop is frame-matched, the last shot's final 10 frames transition the changed element back to its first-shot state, so the loop lands on frame 1 with the viewer now knowing what it means.
4. VO on the last shot: at most 8 words. The picture carries it.

### 6.6 Audio motif design

- Length: 2 to 4 notes or one distinctive sound, 0.6 to 1.2 s.
- Register: mid, 300 to 2,000 Hz, so it survives a phone speaker.
- Plant: under a neutral image in the first 5 s at minus 20 dB relative to VO.
- Turn: at the fact that changes the story, at minus 12 dB, same pitch.
- End: at the reframe, transposed down or slowed to 70 percent, at minus 10 dB, alone in the mix for its duration.
- The motif is never the sonic logo. The sonic logo lives on the end card only and is the same on every reel.

---

## 7. Reusable templates

### 7.1 Shot list template

| Shot | Scene | Duration (s) | Framing system | Camera language | Simulated lens | Plane count | Subject | Primary motion | Grade recipe | Mood | Asset ID | Source / licence | Notes |
|------|-------|--------------|----------------|-----------------|----------------|-------------|---------|----------------|--------------|------|----------|------------------|-------|
| 01 | | | | | | | | | | | | | |

### 7.2 Timeline template

| Timestamp (s) | Visual | VO (exact words) | On-screen text (exact) | SFX / foley | Music (cue, bar) | Transition in | Purpose (hook, setup, plant, turn, reveal, callback, reframe, loop) | Scorecard dimension served |
|---------------|--------|------------------|------------------------|-------------|------------------|---------------|-----------------------------------------------------------------------|----------------------------|
| 0.0 | | | | | | | | |

Every reel has one row per cut. The purpose column must contain at least one each of plant, turn, reveal and loop before the storyboard is approved.

### 7.3 Asset checklist

| Asset | Required | Spec | Licence logged | Checked by |
|-------|----------|------|----------------|------------|
| VO final WAV | Yes | 48 kHz 24-bit, processed per 4.7, named per 7.4 | n/a | |
| Music cue(s) | Yes | Licence allows social video and paid promotion; cue ID and licence URL in LICENSES.md | Yes | |
| Foley kit | Yes | One kit per page, reused | Yes | |
| Impact and motif | Yes | Max 5 impacts, 1 motif | Yes | |
| Stock footage | If used | Source URL, licence, download date; no news-agency footage, no celebrity likeness, no film clips | Yes | |
| Self-shot footage | If used | Log format, lens, frame rate, white-balance reference | n/a | |
| Stock images | If used | Pexels, Unsplash, Pixabay, Wikimedia Commons (credit per licence), government sources; logged | Yes | |
| Fonts | Yes | Licence covers video; one family plus one mono at most | Yes | |
| Logos | Only when reporting on that company | Source and context logged | Yes | |
| Data | Yes | Primary source URL, access date, the exact figure, unit, period; estimates flagged | n/a | |
| Map data | If used | Source and licence (for example Natural Earth, public domain) | Yes | |
| Cover frame | Yes | Per 7.6 | n/a | |
| Captions file | Yes | SRT per 7.5 plus burned-in | n/a | |

### 7.4 Export settings and file naming

| Setting | Value |
|---------|-------|
| Resolution | 1080 x 1920 (9:16), square pixels, progressive |
| Frame rate | 30.000 fps constant (not variable) |
| Container | MP4 |
| Video codec | H.264 High profile, level 4.2, 4:2:0, 8-bit |
| Video bitrate | 12 to 16 Mbps VBR 2-pass, max 20 Mbps (above typical third-party advice of 8 to 12 Mbps, because our graphics have flat fields and fine type; Meta's spec sets no bitrate but caps file size at 4 GB) |
| Keyframe interval | 2 s (60 frames) |
| Colour | Rec.709, gamma 2.4 tagged, full range off (video range 16 to 235) |
| Audio | AAC-LC, 256 kbps, 48 kHz, stereo |
| Loudness | minus 14 LUFS integrated, minus 1 dBTP |
| Duration | Per the brief; the organic Reels limit is 3 minutes since January 2025 |
| Master | Also keep a ProRes 422 HQ or DNxHR HQ master at the same resolution for re-exports |
| First frame | The first frame must be a readable cover candidate (see 7.6); no black frame at 0.0 |
| Last frame | Must match the loop spec (6.1); no black tail |

File naming: `PAGE_YYYY-MM-DD_slug_v##_1080x1920_30p.mp4`. Stems: `PAGE_YYYY-MM-DD_slug_v##_VO.wav`, `_MUS.wav`, `_SFX.wav`, `_BED.wav`. Cover: `PAGE_YYYY-MM-DD_slug_cover_1080x1920.png`. Captions: `PAGE_YYYY-MM-DD_slug_v##.srt`.

### 7.5 Caption and subtitle style spec

| Parameter | Value |
|-----------|-------|
| Font | The house text family, medium weight, 56 px |
| Case | Sentence case. No all-caps captions. |
| Colour | Off-white (95 percent) on a 60 percent black rounded box with 24 px padding, or on a 1 px shadow when the background is already dark; contrast at or above 7:1 |
| Position | Centred, baseline inside the caption band y 1250 to 1420 |
| Width | Max 900 px, max 2 lines, max 32 characters per line |
| Timing | Appear on the first frame of the first spoken word, leave 4 frames after the last; min 1.0 s on screen, max 15 characters per second |
| Chunking | Break at phrase boundaries, never mid-clause; numbers are never split from their unit |
| Emphasis | One word per caption may take the accent colour; never underline, never italic |
| Numbers | Digits, with the unit, matching the on-screen graphic exactly |
| Hindi on screen | Roman script, as the page's rule says, unless the niche brief changes it |
| Burned-in plus SRT | Always both; the SRT uses the same chunking |

### 7.6 Cover frame spec

The grid shows covers at 3:4 (1080 x 1440 crop of the 9:16 frame); the Reels tab shows 9:16. Design for both.

| Parameter | Value |
|-----------|-------|
| Source | A frame from the reel, or a composed still using the same assets and grade. Never a frame that is not in the reel. |
| Safe area | All text and the subject inside the centre 1080 x 1080 (y 420 to 1500) so the 3:4 grid crop and any square view keep it |
| Text | One line, max 5 words, 96 to 120 px, title-safe; no second line |
| Subject | One subject, centre stage, same grade recipe as the reel |
| Consistency | Same type size, same text position (baseline y 1180), same grade family across the page so the grid reads as one hand |
| What not to do | No play button, no arrows, no "watch till the end", no faces of real people without licence, no borders (Instagram says bordered reels are made less visible) |
| File | PNG, 1080 x 1920, sRGB; also the frame number in the reel it came from |

---

## 8. Facts versus interpretations ledger

| Claim in this document | Status | Source |
|------------------------|--------|--------|
| Over 75 percent of Reels views on Instagram are sound on | Fact (Meta, Nov 2024) | https://developers.facebook.com/blog/post/2024/11/07/unlock-the-power-of-reel-ads/ |
| Meta Reels ad spec: 9:16, MP4 or MOV, H.264, AAC 128 kbps or higher, fixed frame rate, progressive, max 4 GB, 0 s to 15 min, safe zone top 14 percent, bottom 35 percent, sides 6 percent, recommended 1440 x 2560 | Fact (Meta ads guide) | https://www.facebook.com/business/ads-guide/update/video/instagram-reels |
| Organic Reels UI clearances of about 220 to 250 px top, 340 to 450 px bottom, about 120 px right at 1080 x 1920 | Third-party measurements; the house values 250 / 450 / 130 are an interpretation | https://www.hopperhq.com/blog/instagram-reel-size/ , https://frameo.ai/blog/reel-size/ , https://adcreate.com/blog/instagram-reel-dimensions-size-guide-2026 |
| Instagram ranking: the most important predictions are reshare and watch-all-the-way-through; low-resolution, watermarked, muted, bordered and mostly-text reels are made less visible | Fact (Instagram) | https://about.instagram.com/blog/announcements/instagram-ranking-explained |
| Reels can be up to 3 minutes since January 2025 | Fact (reported announcement by Adam Mosseri) | https://www.socialmediatoday.com/news/instagram-officially-expands-reels-length-to-3-minutes/737766/ |
| Profile grid is 4:5; Reel covers show at 3:4 (1080 x 1440) in the grid and 9:16 in the Reels tab; keep key content in the centre 1080 x 1080 | Third-party (Hopper HQ help article); rollout varies by account | https://help.hopperhq.com/en/articles/10907941-instagram-s-vertical-grid |
| Minus 14 LUFS integrated is the common streaming normalisation level; Instagram publishes no official target | Practitioner standard, not a platform spec | https://productionadvice.co.uk/td1008/ , https://openclip.app/learn/audio-normalization |
| Minus 1 dBTP true peak for streaming | AES TD1008 recommendation (reported secondhand) | https://productionadvice.co.uk/td1008/ |
| Phone speakers roll off below roughly 200 to 250 Hz: HTC One within plus or minus 3.5 dB from 230 Hz; iPhone 7 Plus within plus or minus 3 dB from 550 Hz at 45 degrees | Single-device measurements; the 150 to 600 Hz check band is an interpretation | https://www.soundandvision.com/node/111446 , https://rimgo.cleberg.net/a/DRbu5 |
| Murch's six criteria in order: emotion, story, rhythm, eye-trace, two-dimensional plane, three-dimensional space; emotion over 50 percent | Fact (the book gives 51, 23, 10, 7, 5, 4 percent; verified here only via secondary sources that confirm "over 50 percent" for emotion) | https://www.studiobinder.com/blog/walter-murch-rule-of-six/ , https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch |
| Average shot length fell from 8 to 10 s (1960s) to 3 to 4 s (2005); post-1980 films' shot-length variation follows a 1/f pattern; variation is independent of the mean | Fact (Cutting, DeLong, Nothelfer 2010, as reported) | https://www.sciencedaily.com/releases/2010/02/100223121435.htm , https://cinemetrics.uchicago.edu/article/7026830d-73a7-4b27-b8fe-41ebe823589b |
| A quarter of continuity edits go undetected, a third when the cut lands on a sudden onset of motion | Fact (Smith and Henderson 2008) | https://bop.unibe.ch/JEMR/article/view/2264 |
| Audio plays a large role in edit blindness; cuts were much more noticeable without it | Fact as summarised (Smith and Martin-Portugues Santacreu 2017) | https://ualresearchonline.arts.ac.uk/id/eprint/21208/ |
| Within-scene edit rate raises arousal, self-reported arousal and memory without large added load | Fact (Lang, Zhou, Schwartz, Bolls, Potter 2000) | https://scholars.cityu.edu.hk/en/publications/the-effects-of-edits-on-arousal-attention-and-memory-for-televisi/ |
| Cognitive overload appears at about ten or more unrelated scene changes in a 30 s message | Secondary summary of Lang's pacing work; not verified in the primary paper | https://www.uky.edu/~ngrant/CJT780/readings/Day%2010/Niederdeppe2005.pdf |
| The Kuleshov effect exists in some form; the 1992 Prince and Hensley null result was a low-power single-trial design | Fact (Barratt, Rédei, Innes-Ker, van de Weijer 2016, Perception 45(8)) | https://pubmed.ncbi.nlm.nih.gov/27056181/ , https://en.wikipedia.org/wiki/Kuleshov_effect |
| Netflix: adult subtitles up to 20 characters per second, 42 characters per line, max 2 lines | Fact (Netflix Timed Text Style Guide) | https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-Timed-Text-Style-Guide |
| BBC subtitle guidelines recommend about 160 to 180 words per minute | Secondary sources; the BBC page itself could not be fetched | https://subtitle-toolset.pages.dev/guides/subtitle-reading-speed/ |
| WCAG: 4.5:1 for normal text, 3:1 for large text (18 pt, or 14 pt bold) | Fact (W3C) | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| Material 3 easing tokens: standard (0.2, 0, 0, 1), accelerate (0.3, 0, 1, 1), decelerate (0, 0, 0, 1); Material 1: standard (0.4, 0, 0.2, 1), mobile durations about 300 ms, 225 ms enter, 195 ms exit, 375 ms full-screen, over 400 ms feels slow | Material 1 values are fact from the archived page; Material 3 values are from a third-party summary (the official page returned no content) | https://m1.material.io/motion/duration-easing.html , https://www.skills.lc/shelbeely/Shelbeely-Agent-skills/shelbeely-shelbeely-agent-skills-skills-material-design-3-motion-skill-md |
| Material body text 16 sp; Apple body 17 pt | Secondary sources; the official pages give no single number | https://uxdesign.cc/guide-for-designing-better-mobile-apps-typography-5796495ef86f |
| Disney's 12 principles (Thomas and Johnston, The Illusion of Life, 1981) applied to UI | Fact (IxDF) | https://www.ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design |
| 8-bit H.264 bands in dark gradients; low bitrate strips grain that would mask it | Practitioner consensus (forums), not a measured study | https://forum.videohelp.com/showthread.php?p=2235530 , https://community.adobe.com/t5/premiere-pro/banding-with-h264-and-tried-everything-to-remove-it/m-p/9428523 |
| 4:2:0 keeps one chroma sample per four pixels; saturated text edges fringe | Fact (technical explanation) | https://www.rtings.com/tv/learn/chroma-subsampling , https://transloadit.com/glossary/chroma-subsampling/ |
| J-cut, L-cut and sound bridge definitions | Fact (standard editing terms) | https://filmdaft.com/the-l-cut-and-j-cut-how-film-editors-use-audio-to-control-time/ |
| Type size table, hold-time formula, safe-zone house values, grade recipes, foley levels, impact caps, the 3-frame rule, loop tolerances, bitrate 12 to 16 Mbps | Interpretation: house rules derived from the facts above and production experience. To be revised against the page's own data | This document |
| Reel pixel to CSS pixel ratio of about 0.36 (1080 shown on a 390 CSS px wide phone) | Interpretation: common phone CSS width; varies by device | This document |

Research done on 2026-11-06 with web search; pages that could not be fetched are marked. Nothing in this document is a statistic about this page, which has no data yet.
