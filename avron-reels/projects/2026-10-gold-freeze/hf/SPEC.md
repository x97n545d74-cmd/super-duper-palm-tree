# SPEC: Gold SIP band? (AVRON)

GOAL:    The viewer knows in 44 s what the gold FoF freeze does to their own SIP, why the government wants it (dollars and the rupee), that 2013 went the same way, and saves the 3-case card.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps. Instagram Reels.
TIME:    44 s x 30 = 1320 frames. Beats (to be retimed to the Tia VO): 0–3, 3–10, 10–22, 22–30, 30–37, 37–44 s.
LOOK:    The medium is a bank statement and bullion: ledger rules, stamped words, a cast gold bar.
         Ground #16140F with 2% grain (static noise SVG), never a gradient. Ink #F2EEE6.
         One accent: gold #E3B04B, only on the word or object that is the subject of the shot.
         Signal colours, one per frame max: loss red #E5484D (rupee, "BAND"), open green #3DBE7A ("Chalu").
         Display: Inter 900, 132 px, tracking -0.03em, line-height 0.95. Body: Inter 700, 46 px, tracking -0.01em.
         Source tags: Inter 400, 28 px, ink at 60%.
         Ledger rules: 2 px ink at 18%. Stamps: 6 px red border, 4 px radius, rotated -4°.
         No shadows except the gold bar's contact shadow (0 24 px 40 px, 45%).
OBJECTS: a phone (bezel 18 px, radius 72 px) showing a fund page with a "Start SIP" button;
         a gold bar (trapezoid, three-tone metal, stamped "999.9");
         dollar notes (green-grey rectangles with "$" and a portrait oval) crossing a dashed border line;
         a rupee odometer reading 95.22; a ledger page with two columns; a gold coin that floods the frame.
MOTION:  enter = power4.out 0.5 s; move = power3.inOut 0.6 s; exit = power2.in 0.3 s;
         type reveals are masked (line rises 100% out of a mask), never fades;
         stamps land with a 0.12 s scale 1.15 → 1 (expo.out); stagger 0.12 s.
         One hero move per shot; nothing moves while it is read.
SHOTS:   see SCRIPT.md beats 1–6. Frame 0 shows "Gold SIP band?" and the phone already, no fade-in.
         Hand-offs: phone → number (push), bar → notes (match on gold colour), ledger → 2013 page (ledger lines carry over), coin flood → card (shape morph).
SAFE:    all words and heroes inside y 168–1330 px and x 60–900 px (right rail free). Below 1330: decoration only.
BANNED:  dark void with small floating elements (heroes fill ≥40% of width), glow, particles, shake, flashes,
         gradients as decoration, glass cards, three cards in a row, everything centred, fade-and-slide-up on everything,
         full stops in on-screen text, logos of AMCs/SEBI/RBI, bouncy easing.
QA:      one still per beat at its mid-point; frame 0; the card held at 43 s; check every number against research/sources.json.
