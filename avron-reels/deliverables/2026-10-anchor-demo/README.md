# AVRON anchor demo (2026-10-27)

A ~52 s 9:16 demo that tests the user's AI anchor as a recurring narrator. Motion graphics carry the story; she stays secondary.

- **Story and audio:** the retail-inflation thali reel. Same verified facts (`../2026-10-thali/SOURCE_VERIFICATION.md`) and the user's Tia Mirza VO mix (`public/thali/mix.wav`), so there's no new script or recording.
- **Prompts applied:** Motion Graphic One (finance blueprint: gold metrics, red rises, green falls) and Two (minimal, one idea per shot, push cuts with motion blur, no glow, shake or particles).
- **Look:** dark editorial base, graph-paper pages and a gold "sun" disc taken from the user's collage reference, Playfair Display headlines, Inter numbers, film grain. Grid floors and neon are not used.
- **Anchor:** 8 cutouts from the user's character sheets (`public/anchor/*.png`, background removed with rembg isnet). The stills have no lip-sync, so she never gets a talking close-up. She appears as a side cutout, a small "AVRON DESK" window, a circle on a split seam, or a full-length presenter moment on the CTA.
- **Code:** `src/projects/anchor/Reel.tsx`, composition `AnchorDemo`.
- **Labels:** "AI ANCHOR" chip on every frame, and "Anchor is an AI-generated character" on the end card.

## Scene plan
| # | Time (s) | Narration | Graphic (main) | Anchor | Change at |
|---|---|---|---|---|---|
| 1a | 0–3.8 | Ek mahine mein mehengai 4.83% | Serif headline, 4.83% counter | Full-length cutout over a gold disc | 3.8 (5.54%) |
| 1b | 3.8–6.9 | se seedha 5.54% pe | 5.54% in red, Aug→Sep line climbing over the 4% RBI target | Small desk window | 6.9 |
| 2 | 6.9–9.8 | Sabse bada jhatka thali pe | Full-screen thali photo, gold ring draws round the plate | Cutaway (off) | 9.8 |
| 3 | 9.8–13.3 | MoSPI ka CPI… tokri ka daam | Paper page: India map draws, price points appear, 1,407 / 1,465 counters | Profile cutout, looking at the map | 13.3 |
| 4 | 13.3–18.4 | Khaane ki mehengai 5.97% se 7.74% | Two bars grow, the +1.77 pt gap is measured | Thinking pose beside the chart | 18.4 |
| 5a | 18.4–21.8 | Pyaaz saal bhar mein 108% | Onion hero card, +108.09% counter | Off | 21.8 |
| 5b | 21.8–24.1 | Aloo aur tamatar thode saste | Card shrinks; potato −11.50%, tomato −8.62% slide in | Desk window (pen pose) | 24.1 |
| 6 | 24.1–28.7 | Gaon 6.08%, shehar 4.88% | Split screen village / city with food figures | Circle on the seam | 28.7 |
| 7 | 28.7–33.8 | RBI ne repo rate 5.25 se 5.50% | Paper page: step chart, +25 bps, stance | Seated with tablet | 33.8 |
| 8 | 33.8–39.2 | FY27 ka anuman 5.2%… guarantee nahi | Q2–Q4 dashed projection bars, 4% line, red stamp on "Anuman" | Off (full data) | 37.2 stamp, 39.2 |
| 9a | 39.2–42.0 | Asli return = return − mehengai | Formula builds word by word on paper | Seated, hand on chin | 42.0 |
| 9b | 42.0–46.6 | 7% ki FD pe asli kamai sirf 1.46% | FD bar, inflation eats 5.54 of 7, 1.46% stays; "Illustration · pre-tax" tag | Desk window (arms crossed) | 46.6 |
| 10 | 46.6–49.6 | Aapki thali mein sabse mehenga kya hua? Comment karo | Question + comment pill | Full-length presenter moment | 49.6 |
| 11 | 49.6–52.3 | (logo) | AVRON, disclaimer, AI-character note, sources, photo credits | Off | end |

## Open
- The character's origin isn't confirmed yet (must be an original character, not a real person's likeness).
- Upgrade path: 2–3 short lip-synced clips (hook, middle, CTA) from HeyGen / Hedra / Higgsfield can replace the stills in scenes 1b, 9b and 10.
- Not published.
