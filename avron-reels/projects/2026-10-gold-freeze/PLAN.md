# Gold FoF freeze reel: production plan

Topic A, picked by the user 2026-10-26. Voice: Tia Mirza – Crisp and Commanding (eleven_v4); the user generates the VO from a paste-ready script.
Prompt library: Motion Graphic One (script framework) + Motion Graphic Two (motion direction). The user asked for the Insta Reel tools to be used well.

**Blocked on:** the [ASK GROK] answer, then a primary-source check of every number (RBI reference rate, AMC addenda/notices, SEBI/AMFI, 2013 RBI/government curbs). No fact goes on screen without a claim ID in `research/sources.json`.

## Fixes for last week's weaknesses (from Supermetrics, see `research/2026-10-26-next-reel/RESEARCH.md`)
| Weakness | Fix in this reel |
|---|---|
| Skip 66–80% | The hook lands in the first 1.5 s as a question aimed at the viewer's own SIP. The first frame is already the hook: no logo, no build-up. |
| Watch 5–11 s on 50–66 s reels | Target 40–45 s (Motion Graphic One says 40 s). A new visual every 2–3 s. An open loop at 3 s ("aur ye pehli baar nahi hua") pays off at the 2013 beat. |
| 12 saves in total | One saveable card: "Aapke gold SIP ka kya hoga: 3 cases" (existing SIP / new SIP / ETF route), with an on-screen cue to save it. |
| Share CTA used once, worked | End on a share line: "Jiska gold SIP chal raha hai, use bhejo". |
| Multi-topic reels did worst | One story only: the gold freeze and why (rupee). No IPOs, no stock tips. |

## Beat structure (Motion Graphic One, adapted) — facts marked [F#] wait for verification
| Time | Step | Content |
|---|---|---|
| 0–3 s | Hook | Question to the viewer about their gold SIP + [F1] the freeze date/scope |
| 3–10 s | Context | Who stopped it and how: [F2] SEBI → AMFI → AMCs, no public circular (if confirmed) |
| 10–20 s | Data | Why: gold is imported in dollars → [F3] rupee level, [F4] import/CAD figure. Contrast colour: red for rupee fall |
| 20–28 s | Split / contrast | What is closed vs still open: FoF fresh money closed; existing SIP, redemptions, [F5] gold ETF on exchange, [F6] SGB status |
| 28–35 s | History | 2013 parallel: [F7] the curbs then. "Anuman hai, guarantee nahi" on any outlook |
| 35–45 s | Save card + CTA | 3-case card (save cue), share line, comment question |

## Motion (Motion Graphic Two direction, 9:16 1080×1920)
- High-end minimal, one idea per shot, one accent (gold), Inter tight tracking, masked type reveals, match cuts, push cuts with real motion blur.
- Banned: shake, particles, glows, grid floors, flashes, bouncy easing. No full stops on screen. Hindi in Roman script.
- Photos (gold, rupee notes, import port) only from free-licence sites, logged in `assets/LICENSES.md`; the user finds them from a shot list.

## Tool map
| Stage | Tool |
|---|---|
| Research | Agent Reach (Reddit/YouTube/X sentiment), WebSearch/WebFetch, Grok via [ASK GROK] |
| Facts | Primary sources: RBI, SEBI, AMFI, AMC notices; nsepython for gold ETF prices/volumes on NSE |
| Script, caption | no-ai-slop pass before the user sees it |
| VO | User's ElevenLabs read (Tia Mirza), paste-ready block |
| Timing | faster-whisper word timestamps → `timeline.json` |
| Music + beat grid | Original score; librosa for tempo/beat grid so cuts land on downbeats (Motion Graphic Two) |
| Animation | HyperFrames (HTML, `seek(t)`) using registry blocks for charts/type; Remotion engine as fallback |
| Render | HyperFrames CLI / Playwright subframes + ffmpeg tmix motion blur, −14 LUFS loudnorm |
| QC | Playwright MCP frame probes (20+ frames), `scripts/qc.py` |
| After posting | Supermetrics IGI: skip rate, avg watch, saves, shares vs last week |
