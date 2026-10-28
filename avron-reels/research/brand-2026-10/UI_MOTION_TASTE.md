# AVRON UI motion taste: "finance as product UI"

Research brief for locking one AVRON look: every reel plays like a premium SaaS product demo or launch film. Written 2026-10-28. Research only; nothing in the repo was changed except this file.

**How to read this.** Every rule has a number and a code form for our Remotion engine (`src/engine/anim.ts`: `prog`, `ease`, `windowAlpha`, `sec`). When a number comes from a source, the source is named. When it is my own call or arithmetic, it says **(AVRON call)** or **(derived)**. Section 7 lists every URL I actually read and every fetch that failed.

---

## 0. The short version

1. **One surface, one light, one accent.** A dark neutral canvas, UI cards with a 1px semi-transparent border plus a two-layer shadow, one accent colour that means "the number that matters", and green/red used only for gains and losses.
2. **Motion is critically damped by default.** No bounce unless something was "thrown". Remotion's default `spring()` (damping 10, stiffness 100, mass 1) has a damping ratio of 0.5, which is bouncy. That bouncy default is a big part of why reels look "made with Claude".
3. **One strong ease-out curve for everything that enters**, `cubic-bezier(0.23, 1, 0.32, 1)`, and one ease-in-out for things already on screen that move, `cubic-bezier(0.77, 0, 0.175, 1)`. Never ease-in on an entrance.
4. **Depth comes from scale, blur and shadow, never glow.** Back layers sit at 0.92–0.96 scale with 4–8px blur and lower contrast. The focused card is sharp.
5. **The camera is the cut.** Shots change by pushing in on a component (crop-in), panning across a dashboard, or a match cut on the cursor, not by wipes, flashes or glitch.
6. **One idea per shot. Hold every number long enough to read it twice.**

---

## 1. What separates premium product films from generic ones

### 1.1 Restraint is the look
- **"One shot = one idea."** Apple-style product videos "don't try to show everything"; backgrounds default to black or white; the single strong colour lives on the product, not the surroundings; "a couple typefaces max"; "the edit stays invisible on purpose"; sound effects are "only the hits that matter" (YouMind breakdown of Apple product video).
- Vercel's interface guidelines: "Only animate when it clarifies cause & effect or when it adds deliberate delight." "Anchor motion to where it 'physically' starts."
- Linear's UI redesign moved theming to LCH so equal lightness looks equal, cut theme inputs from 98 hand-set variables to three (base, accent, contrast), and *limited* the blue in its chrome to stay "neutral and timeless". Headings are Inter Display and everything else is Inter. Linear's brand colours are Mercury White `#F4F5F8` and Nordic Gray `#222326`.
- IBM Carbon splits motion into **productive** (fast, subtle: buttons, tables, dropdowns) and **expressive** (vibrant, "for occasional, important moments"). Premium films are mostly productive, with one or two expressive beats.
- Rauno Freiberg (ex-Vercel): high-frequency actions should have less motion or none. Context menus appear instantly. Expanded content should launch from its source.

**AVRON translation.** A generic "SaaS" reel animates everything all the time. A premium one keeps 80% of the frame still and moves one thing with intent. AVRON rule: **at most one primary motion and one secondary motion at any moment** (AVRON call).

### 1.2 UI staging
| Technique | What it is | Source | Code form |
|---|---|---|---|
| **Crop-in on a component** | Don't show the whole dashboard. Push the camera into the one card that proves the line. | Motion Villee (via search summary): "show the action that proves the claim, not the entire interface", crop to the active area, zoom into the workflow. | Wrap the UI in a `<Camera>` div with `transform: translate(x,y) scale(s)`; animate `s` from 1 to 1.6–2.4 with ease-in-out. |
| **Floating panels in 2.5D** | Flat UI tilted in 3D like a physical screen, or individual UI elements split onto separate depth layers with a slow camera drift. | ContentBeta 2.5D roundup (search summary): "individual UI elements appear on separate depth layers. A slow 3D camera drift ties them together." | Parent: `perspective: 2000px`. Panel: `rotateX(8–14deg) rotateY(-10–-18deg)`. Layers at `translateZ(-200 / 0 / +120px)`. Drift is 20–40px over the whole shot, linear. |
| **Depth via scale and blur, not glow** | Background cards smaller, blurred, dimmer; focus card sharp with a layered shadow. | ContentBeta (search summary): soft shadows ground elements; "depth of field … does more for the 'this looks expensive' reaction than any amount of extra parallax." Vercel: "Mimic ambient + direct light with at least two layers"; "Combine borders & shadows; semi-transparent borders improve edge clarity"; "Child radius ≤ parent radius & concentric". Emil Kowalski: blur (example 2px) masks imperfections during transitions. | Back card: `scale(0.94)`, `filter: blur(6px)`, `opacity: 0.55`. Shadow: `0 1px 2px rgba(0,0,0,.4), 0 24px 48px -12px rgba(0,0,0,.5)`. Border: `1px solid rgba(255,255,255,.08)`. |
| **Launch from source** | A detail panel grows out of the row or button that spawned it; it doesn't fade in from nowhere. | Rauno; Apple WWDC18 "Designing Fluid Interfaces" (spatial continuity and symmetric off-screen paths); Emil ("make animations origin-aware", set `transform-origin` to the trigger). | `transform-origin` = trigger's coordinates; scale 0.95→1 with opacity 0→1. |
| **Symmetric exits** | Whatever slid in from the right leaves to the right. | WWDC18. | Exit = reverse of entrance, at about 0.7–0.8× the duration (NN/g: exit shorter than enter). |

### 1.3 Cursor choreography
From the Demotion SaaS motion-graphics guide (an After Effects workflow) and the Motion Villee summary:
- The cursor **starts outside the frame** and travels on a **curved path** (not a straight line) with eased keyframes.
- **Click = cursor scales down then back up.** The button **darkens** on click (not lightens) and also scales down then up. The button label is parented to the button.
- **Time the click to the VO word** that names the action.
- Cursor styles vary: an advids sample of five SaaS tutorials found 3/5 used smooth, humanised tracking and 2/5 used instant snaps or touch pulses (small sample).

**AVRON cursor spec (AVRON call, built from the above):**
- A 44px arrow cursor, white with a 1.5px dark outline and a soft shadow, same asset every reel.
- Path: a quadratic Bézier with its control point offset 15–25% of the travel distance perpendicular to the path. Travel time 0.5–0.8s, ease-in-out `cubic-bezier(0.77,0,0.175,1)`.
- **Arrive 4–6 frames before the click**, settle, then click. Click: cursor scale 1→0.85→1 over 6 frames; target scale 1→0.97→1 (Emil's press value) and brightness −8%; then a 12-frame ring ripple at 20% opacity.
- The click frame lands **on the stressed syllable** of the VO word (use the word timings from alignment).

### 1.4 State changes
State changes are the "story beats" of a product film: a toggle flips, a row turns green, a number recounts, a chart re-draws.
- **Morph in place**, don't swap. Width, height and colour animate on the same card (Carbon: use **standard** easing when "the element is visible throughout the motion, such as expanding tiles or sorting table rows").
- **Numbers roll, they don't fade.** Tabular figures are required: Vercel says "Use `font-variant-numeric: tabular-nums` or a monospace like Geist Mono." The repo already has `Odometer.tsx`.
- **Currency**: "display currency with either 0 or 2 decimal places, never mix both" (Vercel). For INR: `₹1,24,500` or `₹1.25 L`, never mixed formats in one reel (AVRON call).
- **Robinhood Gold** homepage: elements "inflate quickly" then "settle" into "a very subtle floating motion", which is a fast entrance followed by an ambient idle. Robinhood's team rejected glossy metallic finishes because they hurt legibility.

### 1.5 Typography
- Two families maximum: one sans with a Display cut for headlines, plus a mono or tabular face for numbers (Linear: Inter Display + Inter; Vercel: Geist Sans + Geist Mono; Figma Config 2025: Figma Sans Condensed for display, Figma Sans for body).
- Display type is tight: `line-height: 1.05`, `letter-spacing: -0.02em`. Small text is slightly positive (Emil Kowalski's apple-design skill).
- **Animate a wrapper, not the text node**: "Scaling text can change smoothing" (Vercel).
- Figma Config 2025 gave primary type **two motion treatments**: "expressive (slower, more personality) and functional (quicker, more direct)". AVRON can copy this split: hook headline = expressive, in-UI labels = functional.

### 1.6 Colour discipline
- One neutral base, one accent, plus semantic gain/loss colours. Linear derives everything from base + accent + contrast.
- "On non-neutral backgrounds, tint borders/shadows/text toward the same hue" (Vercel).
- Robinhood: soft mid-tone gold rather than glossy metallic, for legibility.
- Apple-style: put the colour on the product, keep the room neutral (YouMind).

### 1.7 Camera language
- **Push-in** (crop-in) to focus, **pull-out** to reveal context, **lateral pan** along a dashboard to move to the next idea, **slow drift** (parallax) while holding. No rotation for its own sake, no shake, no whip-pan blur smears.
- Zoom move in After Effects: keyframe a null's scale from small to filling the screen, ease both keys, then pull the last key's influence for a snappier end (Demotion guide). In code: one ease-in-out curve with an asymmetric tail, e.g. `cubic-bezier(0.65, 0, 0.15, 1)` **(AVRON call)**.
- **Match cuts**: motion from one scene carries into the next; easing stays consistent across scenes; keep transitions subtle (Demotion). A related trick from the Skillshare course, quoted in a search summary: crop the cursor precomp as it leaves frame and end the motion at its fastest point so the next scene continues it.
- Motion blur is real: WWDC18 notes that at 30 fps fast objects strobe and that motion blur "encodes movement within a frame". AVRON renders at 30 fps, so fast camera moves **need** blur (see 2.6).

---

## 2. Hard numbers

### 2.1 Durations (UI-level motion inside the frame)
| Thing | Duration | Source |
|---|---|---|
| Press / click feedback | 100–160 ms (3–5 frames) | Emil Kowalski, animate skill |
| Tooltip / small popover | 125–200 ms | Emil |
| Dropdown / select | 150–250 ms (180 ms example) | Emil |
| Modal / drawer / large panel | 200–500 ms | Emil |
| General UI ceiling | under 300 ms | Emil, "7 practical animation tips" |
| Toggle / checkbox | ~100 ms | NN/g |
| Substantial change (modal) | 200–300 ms; large moves ~400 ms; above 500 ms "feels like a drag" | NN/g |
| Exits | shorter than entrances (e.g. 300 in / 200–250 out) | NN/g |
| Carbon tokens | 70 / 110 / 150 / 240 / 400 / 700 ms | IBM Carbon |
| Stripe Express onboarding slide-up | 800 ms, `cubic-bezier(.2,1,.2,1)`; most animations under 500 ms | Stripe engineering blog |

**Video caveat.** These are interface numbers for people clicking. In a film the viewer isn't driving, so Emil says "Marketing/explanatory: longer is acceptable". **AVRON scale (AVRON call): in-card UI motion = interface numbers (4–10 frames); card and panel entrances 12–18 frames (400–600 ms); camera moves 18–30 frames (0.6–1.0 s); nothing except ambient drift runs longer than 1.2 s.**

### 2.2 Easing curves people actually cite
| Name | Value | Use | Source |
|---|---|---|---|
| Strong ease-out | `cubic-bezier(0.23, 1, 0.32, 1)` | everything that enters | Emil Kowalski |
| Strong ease-in-out | `cubic-bezier(0.77, 0, 0.175, 1)` | things on screen that move, camera | Emil |
| Drawer (iOS-like) | `cubic-bezier(0.32, 0.72, 0, 1)` | sheets, panels sliding up | Emil (via Ionic) |
| Stripe custom | `cubic-bezier(.2, 1, .2, 1)` | 800 ms slide-up | Stripe |
| Carbon productive standard / entrance / exit | `(0.2,0,0.38,0.9)` / `(0,0,0.38,0.9)` / `(0.2,0,1,0.9)` | | IBM Carbon |
| Carbon expressive standard / entrance / exit | `(0.4,0.14,0.3,1)` / `(0,0,0.3,1)` / `(0.4,0.14,1,1)` | | IBM Carbon |

Rules: ease-out for enter/exit, ease-in-out for elements already moving on screen, linear only for constant motion like a drift or a progress fill (Emil, via several mirrors of his skill). Avoid built-in `ease-in`/`ease-out`, which are "usually not strong enough" (Emil; Stripe says the same). Never ease-in on an entrance.

**Remotion form:** `interpolate(f, [a, b], [0, 1], { easing: Easing.bezier(0.23, 1, 0.32, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })`. Our `ease.outExpo` in `anim.ts` is close to the strong ease-out; `ease.outBack` (c1 = 1.4) is an overshoot curve and should be retired from the house look.

### 2.3 Springs
- Apple (WWDC18, read from the session page): springs are described by **damping** (100% = no overshoot) and **response**. **Start at 100% damping.** Use ~80% only when the gesture carried momentum (Music app: tap to open = 100%, swipe to dismiss = 80%). A bounce can be a hint, e.g. the Flashlight button.
- Apple table, as reproduced in Emil's apple-design skill: move/reposition damping 1.0 / response 0.4 s; drawer 0.8 / 0.3 s; default UI 1.0 / 0.3–0.4 s.
- Framer-style: `{ duration: 0.5, bounce: 0.2 }`; bounce 0.1–0.3, "avoided in most UI" (Emil).
- Josh Comeau: most of the springs he uses "aren't bouncy at all". Use springs for movement, not for colour or opacity.

**Converting to Remotion `spring()` (derived, textbook damped-oscillator maths, mass = 1):** damping ratio ζ = damping / (2·√stiffness). Apple's response r maps to stiffness = (2π / r)² and damping = 4π·ζ / r.

| Preset | ζ | response | Remotion config |
|---|---|---|---|
| `AVRON.settle` (default for everything) | 1.0 | 0.40 s | `{ mass: 1, stiffness: 247, damping: 31.4 }` |
| `AVRON.snap` (small chips, cursor) | 1.0 | 0.30 s | `{ mass: 1, stiffness: 439, damping: 41.9 }` |
| `AVRON.thrown` (only when something was flicked or dropped) | 0.8 | 0.30 s | `{ mass: 1, stiffness: 439, damping: 33.5 }` |
| Remotion default (avoid) | 0.5 | ~0.63 s | `{ mass: 1, stiffness: 100, damping: 10 }` |

Or set `overshootClamping: true` (Remotion docs) when a spring must not overshoot. Use `durationRestThreshold: 0.001` on transitions to avoid a visible cut-off at the end (Remotion `springTiming` docs).

### 2.4 Scale, overshoot and blur rules
- Entrances start at **scale 0.9–0.97 with opacity 0**, never `scale(0)` (Emil). Pressed state is 0.97.
- **Overshoot rule (AVRON call, from Apple and Emil):** overshoot is allowed only on (a) the one hero number per reel, max 3% past target, and (b) objects that are "thrown". Text never overshoots.
- **Blur-in:** start entrances at `blur(4–8px)` and resolve to 0 over the same curve. A skills index entry ("cut-the-curve") lists 10px blur for text transitions and 18–20px for full-frame transitions, plus a 10/65/25 timing split for slides. These are secondary numbers (search summary of a skill directory); I'd use them as upper limits.

### 2.5 Stagger
- **30–80 ms between items** (Emil's animate skill, read directly). Under 30 ms reads as simultaneous; above 80 ms feels sluggish (mirrors of the same repo). Flutter's cookbook uses 50 ms. Tailwind animations suggests 50–150 ms.
- **Cap the total.** Ten items × 50 ms = 500 ms before the last one moves, so cap the stagger to about 6 items and bring the rest in as a group.
- **AVRON at 30 fps (AVRON call):** stagger = **2 frames (67 ms)** for list rows and table cells, **3 frames (100 ms)** for cards, **1 frame (33 ms)** per word for kinetic words, max **8 staggered items**.

### 2.6 Motion blur
- After Effects default is 180° shutter, −90° phase, and community advice is that this suits "almost all animations"; raise it for fast moves and drop to ~90° for slow logo or text moves (Adobe community and tutorial summaries; no official UI-specific guidance found).
- Remotion: `<CameraMotionBlur shutterAngle={180} samples={8–10}>` from `@remotion/motion-blur` (API from Remotion's package; samples multiply render time). Apply it **only to camera-move shots and fast panel slides**, not to text holds.

### 2.7 Shot lengths and holds
- Demotion's "30-second rule" structure: hook 3 s, problem 5 s, solution 10 s, features 8 s, CTA 4 s. A Raycast spec teaser says "the hook must land in the first 2 seconds".
- **On-screen text:** hold long enough to **read it twice** (UC Davis and SSW, assuming 200 wpm). UK BCAP legal-super formula: 0.2 s/word (0.25 s/word for two or more lines) **+ 3 s recognition time**. Netflix subtitles: max 20 characters per second for adults, max 42 characters per line.
- **AVRON holds (AVRON call, from the above):**
  - Hero number (e.g. `₹4.2 L Cr`): it lands, then **holds still ≥ 1.2 s** before anything else moves; if VO is still on it, hold until VO finishes plus 0.4 s.
  - Headline of ≤ 6 words: `max(1.5 s, words × 0.3 s + 1.0 s)`.
  - Card body text: chars ÷ 15 cps (slower than Netflix's 20 because the reel competes with VO and motion) + 0.5 s.
  - Shot length: 1.5–3.5 s typical, never > 5 s without a camera move or state change inside it. The hook shot is ≤ 2 s.

---

## 3. YouTube tutorials: the tutors' actual rules

(Filled from transcripts pulled with Agent Reach; see the status note below.)

TUTORIALS_PLACEHOLDER

---

## 4. Fintech brands and Indian creators

### 4.1 What the brands do
| Brand | Motion and visual behaviour (sourced) | Takeaway for AVRON |
|---|---|---|
| **Stripe** | Engineering-led motion: animate only `transform` and `opacity`; custom `cubic-bezier` curves instead of built-ins; most animations under 500 ms; 3D done with `perspective: 600px` and `preserve-3d`; shading fakes a central light; motion "should never get in the way". | Precision, restraint, one custom curve set. |
| **Robinhood** (Gold campaign) | Elements "inflate quickly, then settle into a very subtle floating motion"; soft mid-tone gold, no glossy metallic, for legibility; numbers stay readable even fully inflated; the owned channels avoid photography. | Fast in, then a slow ambient idle. The number is the hero. |
| **CRED** (NeoPOP) | "Isometrics, linear motion and pseudo-morphism"; "only boxes; no curves"; motion turns everyday objects into art. Design languages in order: Topaz, Fabrik, Copper, NeoPOP, Charcoal. | CRED owns the hard-edged, isometric, pop-3D Indian fintech look. **AVRON should not go there.** |
| **Revolut** | 2024 identity rebuilt around 3D assets, motion and photography: "Sell a feeling, not a feature" (LinkedIn post by a third party; unverified). Dark minimal look since about 2020 (non-authoritative site). | Premium-dark is crowded at the top end. AVRON's edge has to be UI and data, not 3D card renders. |
| **Zerodha** (Kite) | Minimal, fast, works on slow connections; look and feel largely unchanged for years while the internals were rebuilt (YourStory). The content machine is Varsity (education). Zero1 reels cover events, podcast clips, education and topical content. Kamath: "the product has to be simple". | Credibility through calm, consistent UI. AVRON can borrow the **trustworthy terminal** feeling. |
| **Groww** | Positioned as simplicity-first for first-time investors ("Ab India Karega Invest") (GrowthX case study). No public motion write-up found. | Friendly-simple is taken by Groww. AVRON is the analyst's tool, not the beginner app. |

I found **no public motion guidelines** for Robinhood (its job posts mention internal "motion principles"), Groww or Revolut. Rows marked "unverified" rely on secondary sources.

### 4.2 What Indian finance creators on Instagram do now
Sources here are thin; I could not open Instagram itself, because Agent Reach's Instagram channel needs a login that I can't do on the user's behalf.
- Finfluencer tropes reported in the press: "memes, high-energy music, and screenshot proof of … profits"; creators who "flash luxury cars, point at green stock charts"; reels promising "₹1 crore before 30" or "best stocks for 2026" (Free Press Journal; a mirrored article). Neha Nagar uses "whiteboard-style visuals and direct camera-talk" (creator list).
- AVRON's own deconstruct of a competitor reel (`projects/2026-10-datacenter-pharma/DECONSTRUCT.md`) logged "red/white kinetic flash type, split screen, server rack 95%, pill, green tickers, glitch/whoosh", and AVRON already bans flashes, glitch and fake tickers.
- Regulation: SEBI has acted against unregistered "finfluencers" (e.g. a refund order against "Baap of Chart"), so trust signals are worth something.

**How AVRON differs (AVRON call):**
| Typical Indian finance reel | AVRON |
|---|---|
| Talking head + green screen + stock chart PNG | No face; the "product" is the presenter |
| Flash cuts, glitch, whoosh on every line | Camera push-ins and match cuts; one sonic logo; SFX only on state changes |
| Fake tickers, red/green everywhere | Green/red only for real, sourced gains/losses; every number carries a source chip |
| Screenshot "proof" | A "Source" row inside the UI card: publisher + date |
| A new look every reel | One locked shell, one cursor, one curve set |

---

## 5. Signature moves AVRON can own (12)

Each one is a component or a preset, so it appears the same way in every reel. Frame counts are at 30 fps. All of these are **AVRON calls** built from the rules above.

1. **The AVRON Shell (recurring frame).** Every reel lives inside the same app window: a 1080×1920 canvas with a 48px safe gutter, a top bar holding a monochrome AVRON mark, a breadcrumb (`Markets / Sectors / Data centres`) and a live-looking clock that shows the **data as-of date**. Background `#0B0D10`; cards `#14171C` with a `rgba(255,255,255,.08)` border, 20px radius (child radius 12px), two-layer shadow. Component: `<AvronShell crumb asOf>`.
2. **Boot-up open (visual logo, first 0.8 s).** The shell draws itself: a 1px border traces the window over 10 frames (linear), the top bar fades and slides down 12px (strong ease-out, 9 frames), and the breadcrumb types in at 1 frame per character. It is identical on every reel.
3. **The Command-K hook.** A search palette drops in (drawer curve, 12 frames, from scale 0.96 and blur 6px), the hook question types at 2 characters per frame, then **Enter**: a 4-frame press, and the palette expands into the first card (launch from source). This is the brand's "question → answer" ritual.
4. **Crop-in focus.** The camera pushes from the full dashboard to one card: scale 1→1.8 over 24 frames with `bezier(0.77,0,0.175,1)`, 180° motion blur, while non-focused cards go to `blur(6px)` and opacity 0.5. Component: `<FocusPush target="#card-id">`.
5. **AVRON cursor.** The same cursor asset, curved path, arrive-settle-click, click on the VO stress syllable (spec in 1.3). At most one cursor journey per 5 s.
6. **Odometer settle.** The hero number rolls on tabular figures over 18–24 frames with strong ease-out, lands with an optional ≤3% overshoot (the only overshoot allowed), then **a 1px accent underline draws left to right** in 8 frames. Then it holds ≥ 1.2 s.
7. **Source chip.** Every number gets a small mono chip below it, `Source: RBI · 24 Oct 2026`, which slides up 8px and fades in 6 frames after the number lands. It works as a trust signature and a compliance habit at once.
8. **State-flip, not cut.** "Before vs after" is shown as one card morphing (toggle flips, row recolours, value recounts) using Carbon's standard curve over 12 frames. There are never two separate screens for a comparison.
9. **Panel stack in 2.5D.** For multi-part explanations, cards stack at `translateZ` −120 / 0 / +80px with `perspective: 2000px` and the stack tilted `rotateX(10deg) rotateY(-14deg)`. The camera drifts 30px linearly over the hold, and each new card slides in from the right with a 3-frame stagger.
10. **Sheet-up chapter transition.** The next chapter arrives as a bottom sheet: `translateY(100%)→0` over 15 frames with the drawer curve, while the previous view scales to 0.94 and dims to 0.5 (an iOS sheet metaphor). It is the only between-chapter transition AVRON uses.
11. **Sonic logo.** A ~1.5 s keyboard-click + soft two-note chime on the boot-up (2–5 s is the usual sonic-logo range; Lenovo's guidance uses 3 s and drops it on videos under 10 s; short-form needs a cut-down). Every UI state change gets the same quiet tick; the Command-K Enter gets one "thock". This follows Apple's "only the hits that matter" and Raycast's spec piece "each shortcut … paired with its own audio cue".
12. **"Export" end card.** The reel ends with the final card shrinking into a share-sheet-style tile (`scale 1→0.6`, 18 frames), a toast `Saved to AVRON Watchlist` slides in (`translateY 24px→0`, 9 frames, strong ease-out), and the CTA sits in the toast. It is the same every reel.

**Banned in the locked look (AVRON call):** glow and bloom, lens flares, glitch, RGB split, flash frames, whip-pan smears, comic bursts, paper textures, sunbursts, spinning 3D logos, `outBack` bounces on text, more than one accent colour, and gradients on text.

---

## 6. Codeable spec: a starter `brand/motion.ts`

```ts
import { Easing } from "remotion";

export const FPS = 30;
export const curve = {
  enter: Easing.bezier(0.23, 1, 0.32, 1),     // Emil Kowalski strong ease-out
  move: Easing.bezier(0.77, 0, 0.175, 1),     // Emil strong ease-in-out (camera, on-screen moves)
  sheet: Easing.bezier(0.32, 0.72, 0, 1),     // iOS-like drawer
  standard: Easing.bezier(0.2, 0, 0.38, 0.9), // Carbon productive standard (state morphs)
  exit: Easing.bezier(0.2, 0, 1, 0.9),        // Carbon productive exit
  linear: Easing.linear,                      // drift, progress, draw-on only
};
export const springs = {
  settle: { mass: 1, stiffness: 247, damping: 31.4 }, // zeta 1.0, response 0.4 s (derived)
  snap:   { mass: 1, stiffness: 439, damping: 41.9 }, // zeta 1.0, response 0.3 s (derived)
  thrown: { mass: 1, stiffness: 439, damping: 33.5 }, // zeta 0.8, response 0.3 s (derived)
};
export const dur = { press: 4, micro: 6, ui: 9, card: 15, panel: 18, camera: 24, hero: 21 }; // frames
export const stagger = { row: 2, card: 3, word: 1, maxItems: 8 };                           // frames
export const enterFrom = { scale: 0.96, blur: 6, y: 16, opacity: 0 };
export const depth = { backScale: 0.94, backBlur: 6, backOpacity: 0.5, perspective: 2000 };
export const hold = {
  heroNumberMin: 1.2,
  headline: (words: number) => Math.max(1.5, words * 0.3 + 1.0),
  body: (chars: number) => chars / 15 + 0.5,
}; // seconds
export const blur = { shutterAngle: 180, samples: 8 }; // camera moves only
```

---

## 7. Sources

### Read directly (WebFetch, or Agent Reach where noted)
- IBM Carbon motion: https://carbondesignsystem.com/elements/motion/overview/
- Emil Kowalski, "7 practical animation tips": https://emilkowal.ski/ui/7-practical-animation-tips
- Emil Kowalski, "Great animations": https://emilkowal.ski/ui/great-animations
- Emil Kowalski skills repo (animate, apple-design, README): https://raw.githubusercontent.com/emilkowalski/skills/main/skills/animate/SKILL.md, https://raw.githubusercontent.com/emilkowalski/skills/main/skills/apple-design/SKILL.md, https://raw.githubusercontent.com/emilkowalski/skills/main/README.md
- Stripe, "Connect: behind the front-end experience": https://stripe.com/blog/connect-front-end-experience
- Apple WWDC18 "Designing Fluid Interfaces": https://developer.apple.com/videos/play/wwdc2018/803/
- NN/g, animation duration: https://www.nngroup.com/articles/animation-duration/
- Rauno Freiberg, "Invisible details of interaction design": https://rauno.me/craft/interaction-design
- Josh Comeau, spring physics: https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
- Vercel Geist intro: https://vercel.com/geist/introduction
- Linear, "How we redesigned the Linear UI": https://linear.app/now/how-we-redesigned-the-linear-ui
- Linear brand: https://linear.app/brand
- Remotion `spring()`: https://www.remotion.dev/docs/spring
- Remotion `springTiming()`: https://www.remotion.dev/docs/transitions/timings/springtiming
- Figma, Config 2025 identity: https://www.figma.com/blog/how-we-shaped-the-visual-identity-for-config-2025/
- Robinhood, making of the Gold campaign: https://robinhood.com/newsroom/the-making-of-robinhoods-gold-campaign
- Demotion, SaaS motion graphics guide: https://trydemotion.com/blog/master-saas-motion-graphics
- Raycast spec teaser case study (Steve Lemuel): https://contra.com/p/llNMeeMX-raycast-kinetic-product-motion
- Apple product video breakdown (YouMind): https://youmind.com/landing/x-viral-articles/apple-product-video-design-secrets
- Motion, Apple-style launch video guide: https://motion.so/learn/apple-style-product-launch-video
- Netflix English timed-text guide: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide
- YouTube tutorials: see section 3

### Seen only as search-result summaries (not opened; treat as secondary)
- Motion Villee, SaaS videos for silent viewers: https://motionvillee.com/saas-videos-for-silent-viewers/ (WebFetch 403; Agent Reach web read returned only a bot-check page)
- Skillshare, SaaS explainer animation course: https://www.skillshare.com/en/classes/saas-explainer-animation-from-ui-design-to-motion-in-after-effects/1147733669 (403)
- advids, SaaS tutorial examples: https://advids.co/blog/saas-animated-tutorial
- ContentBeta, 2.5D explainers: https://www.contentbeta.com/blog/best-2-5d-explainer-videos/ (fetch returned empty)
- UI Skills directory (cut-the-curve numbers): https://www.ui-skills.com/skills/motion
- Stagger mirrors: https://instagit.com/emilkowalski/skills/staggered-animations-delay-intervals/, https://docs.flutter.dev/cookbook/effects/staggered-menu-animation
- CRED design: https://cred.club/design (WebFetch 404); https://analyticsindiamag.com/cred-open-sources-its-ui-design-system-neopop/
- Revolut: https://cy.linkedin.com/in/mihaibloj, https://madegooddesigns.com/revolut-brand-guidelines/
- Zerodha: https://yourstory.com/2020/11/app-kite-zerodha-speed-simplicity-first-time-stock-trader, https://inc42.com/startups/zerodhas-nithin-kamath-on-the-art-of-building-world-class-products, https://jobs.weekday.works/social-media-video-editor-at-zero1-by-zerodha-wkdy3str7p
- Groww: https://community.growthx.club/proof-of-work/fintech/groww/acquisition-project-----groww|6606617a2b8b85250eaafe71
- Finfluencer tropes: https://www.freepressjournal.in/lifestyle/are-young-indians-trusting-finfluencers-over-financial-advisors, https://ishort-pp.web.app/top-indian-reels-creators-2026.html
- On-screen text hold: https://marketingtoolbox.ucdavis.edu/departments/video/best-practices/accessibility/text-on-screen, https://www.ssw.com.au/rules/post-production-do-you-give-enough-time-to-read-texts-in-your-videos, https://marketinglaw.osborneclarke.com/advertising-regulation/bcap-updates-screen-text-guidance/
- Motion blur defaults: https://community.adobe.com/t5/after-effects-discussions/motion-blur-is-not-visible-on-screen-only-in-the-final-video/m-p/9610157
- Sonic logos: https://www.heardis.com/services/sound-logo/, https://www.audiobrain.com/sonic-logos, https://origin-brandworld.lenovo.com/sonic-identity/

### Failed or not found
- Material 3 easing tokens page: returned only a title, so no M3 values are quoted.
- Apple HIG Motion page: returned only a title.
- `stripe.com/blog/accept-a-payment-animations` and `raycast.com/blog/making-a-raycast-launch-video`: 404 (I guessed these URLs; they don't exist).
- GitHub API for `emilkowalski/skills`: not enabled for this session; I read the raw files instead.
- No public launch-film breakdown found for Linear, Arc, Raycast (official), Notion or Stripe Sessions. No public motion spec for Robinhood, Groww or Revolut.
- Instagram (Indian creators): not opened; Agent Reach's Instagram channel needs the user's own login.
