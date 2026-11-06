# BRAND_CHECK: Wirecard (2026-11)

Design gate from the `avron-brand` skill, written before the storyboard. Full timing in `PREPRO.md` (Phase 4).

- **Series:** Receipt. **Cover title:** `Banned from betting against it` · hero `€1.9B` · chip `RECEIPT`.
- **Reel goal:** saves. HOOK 0:00 · VALUE 0:12 · SOLUTION (the three checks) 0:52 · CTA "Save the three checks" 0:55.
- **Language:** English VO and on-screen text (user's choice for this reel).
- **Look:** brand v2 bright & clean, graphics only (user's choice). No faces, no photos of real people, no stock footage.

## Shell crumbs and date
`Data as of 25 Jun 2020` on every shot.

| Time | Crumb |
|---|---|
| 0:00 | Receipt / Germany / Wirecard |
| 0:22 | Receipt / Germany / BaFin |
| 0:38 | Receipt / Germany / Who got investigated |
| 0:41 | Receipt / Wirecard / Audit |
| 0:52 | Receipt / Checks |

## Hook frame (move 2)
Crop-in at scale 2.5 on `€1.9B`, pull out at ~0:01.5 to the trust-account card. Headline `Germany banned bets against it` (5 words). Lands under 2 s.

## Signature moves
| Move | Time | Note |
|---|---|---|
| 1 Shell bar | whole reel | crumbs above |
| 2 Crop-in pull-out | 0:00–0:03 | `€1.9B` |
| 3 Cursor | 0:24 (toggle `Allowed → Blocked` on "bans"), 0:56 (save icon) | 30 s apart |
| 4 Panel morph | 0:05 (`€1.9B → €0`), 0:14 (`Commerzbank → Wirecard`), 0:32 (receipt → case card) | |
| 5 Receipt | 0:26 BaFin act 18 Feb 2019 (C4, exact sentence from the user), 0:43 BDO/BPI statements (C7, exact wording from the user) | other lines are neutral bars |
| 6 Toast | 0:49 `Case against the FT reporters dropped · Sep 2020` (C9) | |
| 7 End card (saves) | 0:55 checklist, `Saved to AVRON Watchlist`, disclaimer | |

Card moves (8): none used.

## Transitions (every cut)
0:01 pull-out (camera) · 0:05 morph · 0:10 push · 0:12 bottom sheet · 0:14 morph · 0:16 zoom-through · 0:22 push · 0:26 receipt opens from the row (launch from source) · 0:32 morph · 0:41 bottom sheet · 0:46 push · 0:52 pull-out to end card. No fades, wipes or flashes.

## Translations from the prompt
- "Talking head angles" → none (user chose graphics only).
- "Stock B-roll search strings" (Wall Street drone shots etc.) → none; every beat is an AVRON UI card. Documents the prompt wanted screenshotted are redrawn as receipts; the FT article becomes a data line, not a screenshot.
- "SFX & music stems" → AVRON kit names only. No synthesised or per-reel SFX.

## Sound cue sheet (kit v1, not generated yet)
| Time | Sound | Gap |
|---|---|---|
| 0:00.2 | hook sting (sonic_logo notes 1–2) | before VO |
| 0:02.8 | whoosh_soft | after "stock" |
| 0:06.6 | error_down | on "gone" |
| 0:07.5 | ui_tap | before "Wirecard" |
| 0:10.5–0:11.5 | counter_tick → number_land (1/3) | under count, land after "euros" |
| 0:12.2 | panel_open | |
| 0:14.5 | card_slide | |
| 0:16.2 | ui_tap | |
| 0:20 | whoosh_soft | chart draw |
| 0:22.2 | whoosh_push | |
| 0:24.6 | toggle_switch | "bans" |
| 0:26.2 | panel_open | |
| 0:32.2 | card_slide | |
| 0:40.8 | sub_drop (1/2) | after "investigation" |
| 0:41.2 | whoosh_push | |
| 0:45.5 | error_down | "fake" |
| 0:47.5 | number_land (2/3) | after "insolvent" |
| 0:49.5 | success_up | |
| 0:56 | ui_tap | "Save" |
| 0:57.5 | sonic_logo (1/1) | after VO |

Density: never more than 2 sounds in a second; 2 number_land, 1 sub_drop, 0 risers, 1 sonic logo. Within caps.

**Until the kit exists, this reel ships VO + music only.**

## Open before build
- brand_lint.py runs once code exists (`src/projects/wirecard`).
- Exact receipt sentences (C4, C7) from the user.
