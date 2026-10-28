# AVRON motion references (from the user, 2026-10-27)

> **Retired for AVRON on 2026-10-28.** AVRON now uses one locked look, brand v2 "finance as product UI" (`../../brand/BRAND.md`). The looks below stay on file for other projects and clients, and `brand_lint.py` fails an AVRON reel that uses them. Learn timing and staging from new references; never import their look.

## Brand v2 taste references
Add UI/SaaS motion references here (what to learn from each: timing, staging, a transition idea).

Step 1 batch from the user (2026-10-28). Silent 540p copies in `brand-v2/`. Built in `src/engine/ui/cards.tsx`, shown in `CardStudy` (`deliverables/2026-10-brand-v2/AVRON_card-study_1080x1920.mp4`).

| File | What the user likes | What AVRON takes (and drops) | Component |
|---|---|---|---|
| `brand-v2/r1_3d_money_button.mp4` | "the basic animation and motion effects" | Soft chunky 3D objects, a pulse running down a cable from a pressed button, the object swelling with each pulse, then splitting. Becomes the **cause → effect** move. Drops the purple and the grid floor (banned) | `Puck`, `Cable`, `swell`, `Card3D` slab |
| `brand-v2/r2_card_wheel.mp4` | "the card idea and movement of it" | Tall rounded cards on a huge arc, densely overlapping, turning like a wheel; mixed card faces (type card, number card, light card). Becomes the **card wheel** for choices (companies, layers) | `CardWheel`, `wheelAngle` |
| `brand-v2/r3_card_flip.mp4` | "the card flip" | Card arrives edge-on (a thin line), turns to face camera with real perspective and a sheen sweep, then flips to its back. Becomes **question on the front, proof on the back** | `Card3D`, `flipAngle` |

## Archive (pre-brand-v2)

The user's saved motion-graphic references. **Use these for every new reel**, together with the prompt library in `../../insta-reel-avron-page/` (always bring it in, the user's standing rule). Videos are compressed 540p copies, silent except #11. Rebuild each look in code; never copy another creator's frames.

| File | Look | Where we've used it (code to reuse) |
|---|---|---|
| `01_pisa_paper_collage.mp4` | Paper cut-out collage on graph paper: gold sun rising from a grass strip, a hand pushing an object, barbed-wire coil, leaning tower | V2 pump that leans (`src/projects/anchor/ReelV2.tsx` `Collage`, `Pump`); Musk reel share-stack lift (`src/projects/musk/Reel.tsx` `B6`) |
| `02_comic_burst_yellow.mp4` / `still_comic_burst.jpg` | Yellow halftone, orange spikes, white cloud pop (user likes it as the "jhatka" hit) | −₹34 (`anchor/ReelV2.tsx` `S2b`), ₹1 lakh crore (`musk/Reel.tsx` `B4`), new-gen background (`footy/Reel.tsx` `Comic`) |
| `03_blue_grid_glow.mp4`, `04_blue_grid_glow_b.mp4` | Black top, blue gradient glow rising from the bottom, flat square grid | Musk reel data scenes (`musk/Reel.tsx` `BlueGrid`) |
| `05_green_tunnel.mp4` / `still_green_tunnel.jpg` | Green perspective tunnel, lime lines, floor and ceiling, moving toward camera (reads as a football pitch) | `anchor/ReelV2.tsx` `Tunnel`, `musk/Reel.tsx` `GreenTunnel`, `footy/Reel.tsx` `Tunnel` (mid gen) |
| `06_orbit_squares_navy.mp4` | Navy gradient, thin orbit rings with white squares travelling on them | Ring gauge (`musk/Reel.tsx` `B5`), freight ×8 (`anchor/ReelV2.tsx` `Orbits`) |
| `07_red_cream_sunburst.mp4` / `still_red_cream_sunburst.jpg` | Retro red/cream rotating sunburst (vintage poster) | Footballer reel hook + old gen (`footy/Reel.tsx` `Sunburst`) |
| `08_teal_warp_grid.mp4` | Teal grid on black that warps like a cloth | Not used yet |
| `09_kinetic_type_yellow.mp4` | Yellow kinetic type: words on a pendulum line ("HEY HEY → stop scrolling"), stacked repeating word, logo end | "KYUN?" (`musk/Reel.tsx` `B8`) |
| `10_phone_notifications_desk.mp4` | Real phone on a wooden desk, glass notification bubbles stacking | X post + Trump Accounts (`musk/Reel.tsx` `Desk`, `Notif`) |
| `11_structure_ref_musk_spacex_reel.mp4` | **Structure reference (not a look):** split screen news-top / presenter-bottom, captions on the seam, number ladder over a photo, ring gauge, "why?" turn, debate question at the end, cut every 2–3 s | Musk reel structure |
| `12_motion_board_orbits_hexagons.png` / `still_motion_board.jpg` | Motion-design board: orbit rings, sun burst, nested hexagons on a honeycomb, bead ring around a number | Hexagons (`anchor/ReelV2.tsx` `S8`, `footy/Reel.tsx` `StockHex`), bead ring (`musk/Reel.tsx` `B11`, `footy/Reel.tsx` `Cta`) |

User favourites (2026-10-27): the kinetic type (09), phone notifications (10), blue grid (03/04) and the Pisa collage (01); later the red/cream sunburst (07).
