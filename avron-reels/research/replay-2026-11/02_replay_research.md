# Module 2: The science and art of rewatchability, plus the Replay Scorecard

Project Replay, research module 2. Written 2026-11-06. Scope: why people watch things again, what Instagram can and cannot tell us about it, how to design for each kind of rewatch, a 100-point scorecard, and a test protocol for a real account.

Sourcing note: academic claims below are from peer-reviewed papers or their press releases. Instagram claims are from Meta's help pages, developer docs, or Adam Mosseri's statements as quoted by Social Media Today. Everything else is marked as a vendor claim, a creator anecdote, or our own hypothesis. Agent Reach's Reddit channel was down during this research (upstream 403), so Reddit evidence comes from web search only and is thin. No statistic here is invented; where I could only find vendor numbers, I say so.

---

## A. What the research says about watching things again

### A1. Deliberate re-consumption is not habit (Russell and Levy, 2012)

Russell and Levy interviewed people in the US and New Zealand about rereading books, rewatching films and revisiting places. Their point: earlier research treated repeat consumption as habitual, addictive or ritual. Chosen repetition is different. People go back on purpose, and they get something new each time. The abstract says consumers "gain richer and deeper insights into the reconsumption object itself but also an enhanced awareness of their own growth in understanding and appreciation."

They describe five kinds of re-consumption. The names are theirs; the one-line glosses are mine, from the paper's text.

| Type | What the person is doing | Reel equivalent |
|---|---|---|
| Regressive | Returning to a former state; replicating a past feeling | "I just want that feeling again" rewatch |
| Progressive | Re-consuming with a forward-looking goal, to grow or prove something | Rewatching to learn the trick, the framework, the numbers |
| Reconstructive | Filling in a memory that was incomplete; memory stores "gestalt moments", not the whole | Rewatching to catch what you half-saw |
| Relational | Re-consuming to connect with other people | Rewatching with, or for, someone; sending it |
| Reflective | Turning inward, reviewing earlier interpretations | "Now that I know the ending, what does the start mean?" |

Two mechanisms matter for us. **Hyperresponsiveness**: on a repeat, senses are heightened and the person notices details they missed, and appreciates "the way the story is told" rather than the story. **Experiential control**: the person decides when to stop, and the known shape of the experience lets them regulate emotion. A reel that rewards a second pass is giving the viewer both.

### A2. Familiarity feels good (mere exposure, processing fluency)

Zajonc's mere exposure effect (1968) and Bornstein's 1989 meta-analysis of 20 years of studies: repeated exposure raises liking, with a moderate overall effect (r = .26), stronger for complex stimuli than simple ones. Reber, Schwarz and Winkielman (2004) explain why: ease of processing is itself pleasant ("fluency is hedonically marked"). The second viewing is easier than the first, and that ease reads as pleasure. Implication: a dense reel is more rewatchable than a simple one, because density leaves something to process on the second pass.

### A3. Repetition in music (Margulis, On Repeat, 2014)

Margulis's work is the strongest body of evidence that repetition is a feature, not a flaw. Findings reported from her studies: listeners who heard rondos with exact repetition reported a stronger urge to tap or sing along than those who heard varied versions; doctored excerpts with added repetition were rated as more persuasive, even by trained listeners; repetition alone can make a sequence of sounds feel musical. Her framing: "A phrase that might have sounded arbitrary the first time sounds purposefully shaped and communicative the second." Repetition produces an "expanded present", a feeling of orientation rather than explicit prediction.

Jakubowski et al. (2016/2017) on earworms: tunes people report as stuck in their heads tend to be faster, follow more common global melodic contours, and carry some unusual intervals; chart success also predicts earworm status. The pattern is "familiar shape, one surprise", which is also a good description of a rewatchable reel.

### A4. Knowing the ending does not kill the story (Leavitt and Christenfeld, 2011)

Three experiments, 819 participants, 12 short stories including twist and mystery tales. People rated spoiled stories higher than unspoiled ones, including the ironic-twist and mystery stories. The authors suggest processing fluency: a story you can follow is more pleasant than one you are decoding. Caveat: a 2017 replication reported the opposite direction, so treat the effect as contested. What is not contested is the practical point: knowing the twist does not make a well-built story worthless, which is the whole premise of "rewatch because the ending changes the beginning."

### A5. The second viewing of twist films

The Sixth Sense, Fight Club and Memento are the standard examples of a film that becomes a different film once the ending is known. A scholarly book on the subject (Spoiler Alert, meiner) calls these "mind-tricking narratives": the first viewing hides a rule, the second shows it operating everywhere. The Sixth Sense is the clean case, with dozens of planted clues invisible first time and obvious second time. Memento is the warning case: one viewer's account found the twist "ruined" the rewatch, because reverse chronology was the whole pleasure. Rule: the twist must add a second layer, not remove the first one.

### A6. Hidden-detail culture is replay demand you can see

"Things you missed" is a content genre: WatchMojo's "Top 25 Things You Missed in Inside Out 2", Business Insider's "90 Easter eggs you may have missed in all 17 of Pixar's movies". Pixar's recurring eggs (the Luxo ball, the Pizza Planet truck, hints at the next film) exist because audiences rewatch to hunt them. This is the Reconstructive type at industrial scale. The genre proves the demand; it does not tell us its size on Instagram.

### A7. Comfort rewatching and belonging

Derrick, Gabriel and Hugenberg (2009), four studies: loneliness predicts turning to favoured TV programmes, and thinking about a favoured programme buffered mood and self-esteem after a relationship threat ("social surrogacy"). The popular "comfort rewatch" claims about cortisol could not be traced to a primary source and are not used here.

For a finance page, comfort is weak as a reason to rewatch one reel, but it matters across reels: a familiar sonic logo, layout and motif lower processing cost and raise liking of the page, which is the Follow potential dimension.

---

## B. What Instagram actually counts

### B1. The metric history (facts)

- Reels plays became **Initial plays + Replays** in Insights for reels published from February 2023 (Minter, Sked Social). Initial plays: first play in a session, 1 ms or more, excluding replays. Replays: later plays in the same session. Plays = initial plays + replays.
- August 2024: Mosseri announced **Views** as the primary metric across reels, stories, photos and carousels (PetaPixel, 8 Aug 2024).
- Meta's developer docs: `plays` and `clips_replays_count` were deprecated in Graph API v22 and removed for all versions on **21 April 2025**; `views` replaced them. `impressions` was deprecated for media created after 2 July 2024.
- Instagram's own help page defines: **Views** = "the number of times your reel starts to play or replay"; **Watch time** = "the total time your reel was played, including replays"; **Average watch time** = watch time divided by the number of **initial** views; **Viewers** = unique accounts that saw the reel on screen at least once.
- Meta developer docs define `ig_reels_video_view_total_time` as "the total amount of time the reel was played, including any time spent replaying the reel" and `reach` as "unique Instagram users that have seen the reel at least once."
- August 2025: Instagram added a per-reel **Retention** chart and replaced View Rate with **Skip rate** = "the percentage of views from people who decided to skip your reel during those first 3 seconds" (Social Media Today, 24 Aug 2025). Instagram's own line: "With Retention, you'll always see a downward slope, but the flatter the line, the more engaged your audience is."

One conflict to flag: a Brandwatch note says the API `views` excludes replays, while the Instagram help page says views include replays. The app-side definition is the one a creator reads, and it includes replays. Confirm in the app before building any ratio on it.

### B2. How reels are ranked (Mosseri, 22 January 2025)

Quoted by Social Media Today: "The top three signals that matter most for ranking are watch time, likes and sends." And: "So when looking at your insights, pay close attention to average watch time, likes per reach, and sends per reach." And: "Likes are slightly more important for connected content, and sends are slightly more important for unconnected content." Secondary coverage adds that both relative watch time (share of the video) and absolute seconds count; I could not verify that against his own post, so it is a probable rather than a fact.

In an earlier Q&A (2024) he reportedly said "sends per reach correlate more, in my experience, with overall reach than anything else." The ordering between watch time and sends is unsettled. What is settled: a replay adds watch time, and watch time is a top-three signal. That is the entire commercial case for rewatchability.

### B3. What "average watch time > length" means

Because watch time includes replays and the denominator is initial views only, average watch time can exceed the reel's length. Supermetrics' field notes say this plainly: "this includes replays in a single instance, so the value may exceed the total duration of the video." If a 30-second reel shows 36 seconds average watch time, the average session contained 1.2 plays' worth of watching. This is the cleanest replay signal Instagram gives you, and it is still an average, not a count of people.

### B4. Loop-reel culture, and the forced version

Instagram has no loop toggle; reels autoplay in a loop, so a "seamless loop" is built in the edit by making the last frame flow into the first. Tutorials are everywhere (the most-viewed YouTube tutorial found via Agent Reach has 180K views). The only quantified claim found is a vendor one: Wreltik cites an Emplifi analysis saying seamless loops on sub-7-second reels drove 18.7% more replays and 16.1% higher engagement. I could not find the Emplifi study itself.

"Wait for it" and "watch till the end" are a different thing: a verbal promise instead of a built loop. Two findings:

1. Instagram's Recommendation Guidelines list "content that includes engagement bait" and "content that includes clickbait" under content users say they dislike. Instagram's reported clarification: "if content explicitly asks for engagement through shares, comments, tags, or other actions, then we won't recommend it", while "earnestly engaging with your audience" is fine. There is no official text naming "wait for it" specifically. The policy targets explicit asks for interaction; a suspense line is a grey area, not a stated violation.
2. The practical penalty is the skip rate, not a rule. One creator on r/socialmedia reported that openings like "wait for it" lost about 71% of viewers within two seconds, while a specific hook kept 72% through second five. Single anecdote, no controls, but it matches the mechanism: a viewer who is told to wait has been given no reason to.

Rule for AVRON: never say "wait for it". Build the reason to wait into the first two seconds (a number, a contradiction, a half-shown document) and let the ending pay it off.

### B5. What Insights cannot tell you

Instagram shows per reel: views, reach (unique accounts), watch time, average watch time, retention curve, skip rate, likes, comments, shares/sends, saves, follows, and (in some surfaces and in older reels) initial plays and replays. It does **not** show how many distinct people watched twice, how many loops a given account played, or whether a replay was deliberate.

Three confounds in any replay number:

- **Autoplay loops.** A reel that ends while the viewer is reading comments or typing keeps looping and keeps counting. Short reels suffer most: a 7-second reel in front of a viewer who spends 20 seconds on the screen has "replayed" twice without anyone choosing to.
- **Abandoned screens.** A phone left face-up loops until the screen sleeps. Nobody has measured how much this adds.
- **Session definitions.** Replays are counted "in the same reel session". Coming back an hour later to show a friend is a new initial view, so the Relational rewatch type is invisible.

How to infer replay anyway, by triangulation:

| Signal | What to compute | What it suggests |
|---|---|---|
| Average watch time vs length | AWT / length | Above 1.0: sessions average more than one play. Compare with your own reels of similar length only. |
| Retention curve shape | Look at the right-hand end | A curve that ends high (say above 40% at the last second) with a rise or plateau in the opening seconds on a reel whose skip rate is low is consistent with people reaching the end and seeing the start again. A bump at the start is not reported by Instagram as a replay; you are reading it off the shape. |
| Views per reach | views / reach | Above ~1.3 on a reel longer than 15 seconds is hard to explain by idle autoplay alone. Below 1.1 means almost nobody looped. |
| Saves per reach | saves / reach | A save is a stated intent to come back. It is the only replay-type signal that is a deliberate act. |
| Comments content | Read them | "Watched it three times", "go back to 0:04", "the chart at the start" are direct evidence of the Reconstructive and Reflective types. |

None of these proves a human chose to rewatch. Together they make it the most likely explanation.

---

## C. The six viewing types

| # | Type | Definition | Psychological driver | Design for it |
|---|---|---|---|---|
| 1 | Watched once | Viewer stopped before the end or scrolled on at the end | Nothing held; information gap closed early, or never opened | This is the default outcome. Score it as the baseline. A low skip rate and a flat retention curve are the only goals here. |
| 2 | Watched to end | Reached the last frame, did not loop | Narrative momentum; curiosity opened and closed once (Loewenstein's information gap, resolved) | Open a question in the first 2 s, keep a reason-to-stay every 5 to 8 s, close it at the end. Required for everything below. |
| 3 | Rewatched to understand | Went back because something went by too fast or was too dense | Progressive re-consumption; processing was incomplete; fluency sought | Dangerous. Density must be deliberate, legible on first pass, and richer on second. If the first pass is confusing rather than dense, the viewer leaves. Rule: every number must be readable in one pass; the relationships between numbers are what reward the second. |
| 4 | Rewatched for enjoyment | Went back because it felt good | Regressive type; mere exposure; fluency; music repetition (Margulis) | Beauty, rhythm, a satisfying sound and motion match. The reel must have a "shape" the ear and eye want to feel again. The sonic logo and 120 BPM snaps are this. |
| 5 | Rewatched for hidden details | Went back to find something they half-saw | Reconstructive type; hyperresponsiveness; hidden-detail culture | Put one true, checkable detail in the background of an early frame (a date, a line in a document, a second chart) that the end makes relevant. It must be real and sourced. |
| 6 | Rewatched because the ending changes the beginning | Went back because the end reframed the open | Reflective type; the "mind-tricking narrative"; spoiler research (knowing the ending can raise enjoyment) | The opening shot must have two honest readings. The second reading must be visible on rewatch without any new information. Nothing in the first reading may be a lie. |

Types 3 to 6 are the goal. Type 3 is the one a scorecard has to guard against, because incomprehensibility produces the same replay numbers as reward, and the retention curve looks worse.

---

## D. Techniques, with how they work, the risk, and a rule

Patterns only. Nothing here copies a specific creator's reel.

### D1. Seamless narrative loops

Three versions, strongest last.

- **Frame loop.** Last frame is the first frame. The eye does not register the cut. Works best under 10 seconds; on a 45-second finance reel nobody notices. Rule: use only if a viewer can plausibly loop twice in under 30 seconds of attention.
- **Sentence loop.** Last VO line is the first VO line. The ear closes the circle. Risk: feels like a slogan. Rule: the repeated line must mean something different the second time (Margulis: the second hearing sounds "purposefully shaped").
- **Reframe loop.** The ending gives the opening a second meaning, so the viewer wants the opening again. Example shape: open on "BaFin protected Wirecard from short sellers"; end on "16 months later the short sellers were right"; the opening now reads as a regulator protecting a fraud. Rule: the reframe must be fully supported by what was on screen in the first 5 seconds, or it is a cheat.

### D2. Hidden information

A background clue: a prop, a date on a document, a figure in a table, a facial expression (anchor reels), a line of small text. Works by hyperresponsiveness: a second pass notices what the first missed. Risk one: fabricated clues. For AVRON every hidden detail must be a sourced fact in the claim registry. Risk two: illegibility; a clue below 24 px mono on a phone is not a clue, it is noise. Rule: one hidden detail per reel, legible, true, and connected to the payoff. Do not hide the main point; hide a second confirmation of it.

### D3. Double-layer storytelling

The VO tells story A; the visuals tell story B that only becomes story A's explanation at the end. Example shape: VO narrates the regulator's actions; a quiet second chart in the corner tracks the missing cash. Works because the viewer processes one layer per pass. Risk: split attention makes the first pass incomprehensible (type 3 failure). Rule: layer B must be ignorable on the first pass. If a first-time viewer has to read it to follow the VO, it is not a second layer, it is clutter.

### D4. Delayed revelation

Withhold one fact until late, but show its consequences early. The information gap (Loewenstein) stays open; closing it late is the reward. Risk: the "wait for it" trap, where the delay is announced rather than earned. Rule: never announce the delay. Show the effect in the first 3 seconds, give the cause at the end, and make the effect bigger than the viewer expected.

### D5. Visual callbacks

A shape, colour, number or UI element from the opening returns at the end, transformed. The Swiss-pro match cut (headline becomes page title, ring becomes grid module) is a callback. Works because recognition is fluent and fluency is pleasant. Risk: callback without meaning. Rule: the returning element must carry the reel's conclusion (the same chart, now with the hidden line revealed).

### D6. Transitions as storytelling

A push, morph or zoom-through that is itself a claim: zooming into a number to find a document; a chart line that becomes a timeline. Works because the motion carries information, so the second viewing has something to read in what was first felt as flow. Risk: flashy transitions that say nothing (banned by brand v2 anyway). Rule: each transition must answer "what does this move mean", or it is a cut.

### D7. Emotional replay

Beauty, humour, awe, shock, nostalgia. These drive the Regressive type: the viewer wants the feeling back. Of the five, finance reels can use awe (scale of a number), shock (a true, verified contradiction) and beauty (the product-UI look). Humour works if it is dry and factual. Nostalgia works for the page, not the reel (recurring motif, recurring voice). Risk: shock without a source is a trust failure that costs follows. Rule: every shock must survive the claim registry; every beauty beat must be on the brand grid.

### D8. Audio replay

- **Sound motifs**: the three-note sonic logo at open and close; the end sting resolves what the open sting asked (D major, kit_v1).
- **Dialogue callbacks**: the first VO phrase returns, re-weighted (D1 sentence loop).
- **Audio transitions**: a sound that starts under the end of one scene and resolves in the next. On a loop, the end-of-reel sound should lead into the opening sound.
- **Layered design**: music, VO, UI SFX each legible alone; the second viewing hears the layer it ignored first.
- **Rhythm change**: a tempo or density change at the turn (the reveal). Earworm research says common contour plus one surprise is what sticks.
- **Music sync**: cuts on the 120 BPM grid; the snap is the physical pleasure Margulis describes (the urge to tap along).
- **Unexpected silence**: one beat of nothing before the number that matters. Silence is the cheapest way to make a moment rewatchable, because the viewer's attention lands on it fully.

Risk: audio that only works with sound on. Rule: every audio replay device has a visual twin (the silence is also a held frame; the motif is also the wordmark).

---

## E. The Replay Scorecard (100 points)

### E1. Dimensions, weights and why

| # | Dimension | Weight | Why this weight |
|---|---|---|---|
| 1 | Opening attraction | 10 | Skip rate decides whether anything else is seen. But a great open with nothing behind it is a one-watch reel, so it does not dominate. |
| 2 | Curiosity | 10 | The information gap that keeps the viewer to the end (type 2). Prerequisite for all rewatching. |
| 3 | Narrative momentum | 10 | Flat retention curve. Without it the ending is never reached. |
| 4 | Emotional investment | 8 | Needed for the Regressive and Relational rewatch, and for sends. Finance reels run cooler than entertainment, so slightly lower. |
| 5 | Visual richness | 8 | Density that rewards a second pass (mere exposure is stronger for complex stimuli). Capped because too much becomes type 3 confusion. |
| 6 | Reveal quality | 14 | The payoff that makes the ending worth reaching and the opening worth re-reading. Hard floor. |
| 7 | Replay motivation | 16 | The explicit reason to watch again (types 3 to 6). This is the project's purpose, so it is the heaviest. Hard floor. |
| 8 | Loop quality | 8 | Mechanical seam between end and start. Valuable, but a seam without a reason is a gimmick, so it is weighted below motivation. |
| 9 | Shareability | 8 | Sends are a top-three ranking signal and the Relational rewatch. |
| 10 | Follow potential | 8 | The page goal. Recurring motifs and a clear "this page does this" promise. |
| | Total | 100 | |

### E2. Rubrics (0 to 10 each, multiplied by weight/10)

**1. Opening attraction.** 0: generic title card or "wait for it". 3: a topic stated. 5: a specific number or contradiction in the first 2 s, legible muted. 8: the number plus a visual that is already doing something. 10: the first frame has two honest readings (feeds D1 reframe) and is beautiful on the brand grid.

**2. Curiosity.** 0: everything is told up front. 3: a question is asked. 5: a question is asked and the stakes are shown. 8: the gap is specific (what is the missing €1.9 bn) and widens at least once mid-reel. 10: the gap is specific, widens, and the viewer can guess wrong (a false hypothesis the end corrects).

**3. Narrative momentum.** 0: list of facts. 3: chronology. 5: cause and effect every 8 s. 8: a reason-to-stay every 5 s, each raising the stakes. 10: same, plus one rhythm change at the turn.

**4. Emotional investment.** 0: none. 3: a named person or company. 5: a person with something to lose. 8: the viewer is implicated (their money, their regulator, their market). 10: the viewer is implicated and the emotion turns once (confidence to doubt).

**5. Visual richness.** 0: text on a background. 3: one chart. 5: UI with one secondary layer that is ignorable on first pass. 8: two layers, both legible at phone size, both sourced. 10: two layers plus one hidden detail (D2) that is true and connected to the reveal. Score 0 if the first pass is illegible; richness that confuses is not richness.

**6. Reveal quality.** 0: no reveal, or the reveal is the thesis repeated. 3: a fact the viewer did not know. 5: a fact that answers the opening question. 8: a fact that answers it and is bigger than expected. 10: a fact that answers it, is bigger than expected, and reframes the opening (D1 reframe). Any reveal that fails the claim registry scores 0.

**7. Replay motivation.** 0: nothing to gain from a second pass. 2: "it was pretty" only. 4: one of types 3 to 6 is served. 6: two types served. 8: three types served, including type 6 (ending changes beginning). 10: types 4, 5 and 6 served, and a first-time viewer can state in one sentence why they want to go back. Deduct 3 if the main reason is "I did not catch it" (type 3 without legibility).

**8. Loop quality.** 0: hard cut to an end card. 3: end card matches opening colour. 5: last frame and first frame share composition. 8: last sound leads into first sound and the last line echoes the first. 10: seamless frame, sound and sentence, and the loop makes sense (the second opening reads differently). Deduct 5 if the reel is over 40 s and the loop is the only replay device.

**9. Shareability.** 0: no one would send it. 3: interesting to the niche. 5: a one-line takeaway someone could caption a send with. 8: the takeaway implicates a specific group ("every Indian retail investor who trusts a regulator"). 10: the takeaway plus a reason to send it to one specific person.

**10. Follow potential.** 0: no page identity. 3: brand look present. 5: brand look, sonic logo, end card by goal. 8: the reel states what the page does in one line. 10: the reel is visibly one of a series (Layer / Receipt / Screener) and promises the next one.

### E3. Thresholds

- **Approve at 70 or above**, and
- **Hard floor: Replay motivation at least 6 of 10 and Reveal quality at least 6 of 10.** A reel at 80 with Replay motivation at 4 fails. The project exists to make rewatchable reels; a high score built from a great hook and clean visuals is a good one-watch reel, which is not the brief.
- **Automatic fail**: any fact in the reveal or a hidden detail that is not in the claim registry with a primary source; any "wait for it" or "watch till the end" in VO or on screen; any first pass that a cold reader cannot follow (test: one person, one watch, muted, retell the story).

Two readers score independently and average. A gap of more than 15 points means the concept is unclear and goes back.

### E4. Worked example: two hypothetical concepts

**Concept P (pass): "The 18 February 2019 trade."** 45 s, brand v2. Opens on a single order ticket: SELL WDI, 18 Feb 2019, with a red "BLOCKED" stamp. VO: "On this day Germany's regulator did something it had never done." Second layer: a small line chart in the corner, labelled "cash the auditors could not find", flat at zero, ignorable. Momentum: ban, criminal complaint against the reporters, share price rises, the auditor's letter; every 6 s a new document. Turn at 30 s: the small chart jumps to €1.9 bn with a one-beat silence. Reveal: the people the regulator stopped were the only ones who were right. Last frame: the same order ticket, stamp now reads FILLED, dated June 2020. Last line: "On this day the regulator did something it had never done." The hidden detail: the ticket's price field in the first frame shows the real 18 Feb 2019 close; the last ticket shows the real June 2020 close.

| Dimension | Score | Weighted | Note |
|---|---|---|---|
| Opening attraction | 8 | 8.0 | Specific document, two readings |
| Curiosity | 8 | 8.0 | "What had it never done, and why" |
| Narrative momentum | 8 | 8.0 | Document every 6 s, rhythm change at the turn |
| Emotional investment | 7 | 5.6 | Retail investor implicated via "the regulator you trust" |
| Visual richness | 8 | 6.4 | Two layers, one hidden price detail; needs legibility check |
| Reveal quality | 9 | 12.6 | Answers, exceeds, reframes |
| Replay motivation | 8 | 12.8 | Types 4, 5, 6 served; type 3 risk low |
| Loop quality | 8 | 6.4 | Same ticket, same line, different meaning |
| Shareability | 7 | 5.6 | "The regulator banned the people who were right" |
| Follow potential | 6 | 4.8 | Series mark needed on the end card |
| **Total** | | **78.2** | Pass. Floors met (8, 9). |

**Concept F (fail): "5 red flags before Wirecard collapsed."** 40 s. Opens on a title card "5 RED FLAGS". VO lists five flags with a chart each. Ends on "Flag 5: the auditors" and an end card "Follow for more". Clean brand v2 execution.

| Dimension | Score | Weighted | Note |
|---|---|---|---|
| Opening attraction | 4 | 4.0 | Topic stated, no contradiction |
| Curiosity | 4 | 4.0 | Count-down structure, gap closes each flag |
| Narrative momentum | 6 | 6.0 | List, but evenly paced |
| Emotional investment | 4 | 3.2 | Company named, nobody at stake |
| Visual richness | 6 | 4.8 | One chart per flag, legible |
| Reveal quality | 3 | 4.2 | Fifth item is not a reveal |
| Replay motivation | 2 | 3.2 | Nothing gained on pass two |
| Loop quality | 3 | 2.4 | End card colour match only |
| Shareability | 5 | 4.0 | Save-able checklist |
| Follow potential | 5 | 4.0 | Brand look, CTA |
| **Total** | | **39.8** | Fail. Floors missed (2, 3). |

Concept F is a competent save-bait reel. It would be approved on a saves goal under the old method and it is exactly what Project Replay is not for.

---

## F. Testing replayability on a real account

### F1. Export per reel

AVRON is not connected to any analytics tool yet, so this is a manual export from Instagram Insights (or Meta Business Suite on desktop) at fixed intervals: 24 h, 72 h, 7 d, 28 d.

| Field | Source | Note |
|---|---|---|
| Views | Insights | Includes replays |
| Reach (viewers) | Insights | Unique accounts |
| Initial plays, Replays | Insights, where still shown | Older reels only after April 2025; record if present |
| Watch time (total) | Insights | Includes replays |
| Average watch time | Insights | Watch time / initial views |
| Length | Our render | Seconds, exact |
| Skip rate | Insights | Share leaving in first 3 s |
| Retention curve | Insights | Screenshot it; read values at 25%, 50%, 75%, 100% of length |
| Sends (shares), saves, likes, comments, follows | Insights | Per reel |
| Concept metadata | Our scorecard | Pre-publication scorecard total and the ten sub-scores; which techniques (D1 to D8) were used |

### F2. Derived metrics

- **Views per reach** = views / reach. Loop intensity including idle loops.
- **Watch ratio** = average watch time / length. Above 1.0 means more than one play per session on average.
- **Second-watch index (SWI)** = (watch ratio minus retention at 100% of length), floored at 0. Reasoning: retention at the last second is the share of sessions that got to the end once; watch ratio above that fraction has to come from playing again. The index is a rough measure of "how much watching happened after the first full play." Treat it as ordinal, not a count.
- **End-retention** = retention value at the last second. Needed for SWI and is itself the type-2 (watched to end) rate.
- **Sends per reach, saves per reach, follows per reach.** Mosseri's own advice is to read likes per reach and sends per reach.

### F3. A/B tests

Instagram offers one real test tool: **Trial Reels** (launched December 2024), which publish a reel to non-followers only, keep it off the grid, and let you share it to everyone later. Meta's reported figures (via Social Media Today): 40% of creators post more often after trying it; 80% of those saw more non-follower reach. Those are Meta's numbers as reported second-hand.

Protocol:

1. Pick one variable per test: hook (first 3 s) or ending (last 5 s, the loop). Never both.
2. Render variant A and B from the same timeline with only that segment changed.
3. Post both as Trial Reels, a few hours apart, same day-part, same caption, same cover.
4. Wait 72 h (sources disagree on the window, 24 to 72 h; use 72).
5. Compare skip rate for hook tests; compare watch ratio, SWI and end-retention for ending tests. Sends per reach is the tie-breaker.
6. Share the winner to everyone. Archive the loser. Log both in the ledger with the scorecard sub-scores that predicted the outcome.

Limits of this: Trial Reels go to different non-follower audiences, so the two variants are not seen by the same people. This is an observational comparison, not a controlled experiment. Repeat the same hypothesis across at least three reel pairs before believing it.

### F4. Sample sizes, and why early numbers mislead

- Reach under 1,000 gives ratios that swing with a handful of accounts. Do not read ratios below 1,000 reach.
- The first 24 h are mostly followers, where likes matter more; non-follower distribution comes later, where sends matter more. A reel that looks weak at 24 h and strong at 7 d is normal.
- Trial reels can take longer to pick up views than a regular reel (vendor sources), so 72 h is a floor.
- Rule of thumb for a decision: at least 3 reel pairs per hypothesis, each with at least 1,000 reach per variant, and the direction consistent in all three. Anything less is a note, not a finding.

### F5. What to do with the retention curve

1. Screenshot every curve at 7 d. Overlay against the storyboard timestamps.
2. Mark each dip of more than 5 points within 2 s. Each one is a sentence or a frame to fix in the next reel of that series.
3. Compare the curve's final value to the watch ratio (SWI above).
4. Look for the signature of a reframe loop: end-retention high, watch ratio above 1.0, comments that mention the opening. If the ending is reframing the beginning, people will say so.
5. A curve that is flat but ends at 20% is a reel that lost people steadily; a curve that drops 50% in 3 s then flattens is a hook problem with a good body. These need different fixes, and only the curve tells them apart.

### F6. What cannot be proven

- How many distinct people watched twice. Not exposed anywhere.
- Whether a replay was deliberate or idle autoplay.
- Which of the six viewing types a given replay was. Only comments and DMs give that, and they are a biased sample.
- Whether rewatching raised distribution on a given reel. Ranking is a black box; watch time is a stated top signal, but no per-reel attribution exists.
- Any benchmark for "good" watch ratio, skip rate or views per reach. Instagram publishes none; every number in vendor blogs is a rule of thumb from someone else's account. Compare AVRON reels against AVRON reels.

---

## G. Facts vs hypotheses ledger

### Facts (primary or near-primary source)

| Fact | Source |
|---|---|
| Deliberate re-consumption yields "richer and deeper insights" and awareness of one's own growth; five categories: regressive, progressive, reconstructive, relational, reflective | Russell and Levy, JCR 2012, full text |
| Mere exposure effect, overall r = .26; stronger for complex stimuli | Bornstein 1989, Psychological Bulletin (abstract and reviews) |
| Processing fluency is experienced as pleasant and underlies many aesthetic effects | Reber, Schwarz, Winkielman 2004, PSPR |
| Exact repetition in music increased the urge to move; added repetition raised rated persuasiveness | Margulis, On Repeat (OUP 2014), as reported by U. Arkansas |
| Earworm tunes are faster, with common contours and some unusual intervals | Jakubowski et al., PACA 2016/2017 |
| Spoiled stories were rated higher, including twist and mystery stories (819 participants, 12 stories); a 2017 replication found the opposite | Leavitt and Christenfeld 2011; OnFiction 2017 |
| Favoured TV programmes buffer loneliness and belonging threats (four studies) | Derrick, Gabriel, Hugenberg, JESP 2009 |
| Instagram: Views = starts plus replays; Watch time includes replays; Average watch time = watch time / initial views; Viewers = unique accounts | help.instagram.com/202865988324236 |
| `plays` and `clips_replays_count` deprecated, removed 21 April 2025; `views` replaces them; `ig_reels_video_view_total_time` includes replay time | Meta developer docs |
| Retention chart and Skip rate (first 3 s) added August 2025 | Instagram via Social Media Today, 24 Aug 2025 |
| Top ranking signals: watch time, likes, sends; likes matter more for connected reach, sends for unconnected | Mosseri, 22 Jan 2025, via Social Media Today |
| Recommendation Guidelines list engagement bait and clickbait as content users dislike; explicit asks for engagement are not recommended | help.instagram.com/313829416281232; Social Media Today |
| Reels must be 3 minutes or less and original to be recommended; watermarks and majority-text frames hurt | creators.instagram.com recommendations page |
| Trial Reels launched December 2024, non-follower distribution, off-grid | 9to5Mac, Social Media Today |

### Hypotheses and vendor claims (not proven)

| Claim | Status |
|---|---|
| Seamless loops on sub-7 s reels: +18.7% replays, +16.1% engagement | Vendor (Wreltik citing Emplifi); original not found |
| "Wait for it" openings lose ~71% in 2 s | One Reddit creator anecdote |
| Relative and absolute watch time both count | Secondary coverage of Mosseri; not verified in his own post |
| Reels with 70%+ watch ratio get pushed to Explore | Vendor blog; unverified |
| Skip rate under 30% is good | Vendor rule of thumb |
| Mere exposure plateaus after ~10 exposures and may decline | Secondary summaries of Bornstein |
| "Comfort rewatching lowers cortisol" | Unsourced; not used |
| Second-watch index as defined in F2 measures deliberate rewatching | Our hypothesis; confounded by idle loops |
| A reframe loop produces a high end-retention plus watch ratio above 1.0 | Our hypothesis; test with F3 |
| Dense finance reels rewatch better than simple ones | Our inference from Bornstein's complexity moderator; untested on Instagram |

### Sources

Academic
- Russell, C. A. and Levy, S. J. (2012). The Temporal and Focal Dynamics of Volitional Reconsumption. Journal of Consumer Research 39(2), 341–359. https://doi.org/10.1086/662996 (text: https://www.gwern.net/doc/culture/2012-russell.pdf)
- Bornstein, R. F. (1989). Exposure and Affect: Overview and Meta-Analysis of Research, 1968–1987. Psychological Bulletin 106(2), 265–289. https://doi.org/10.1037/0033-2909.106.2.265
- Reber, R., Schwarz, N. and Winkielman, P. (2004). Processing Fluency and Aesthetic Pleasure. PSPR 8(4), 364–382. https://pages.ucsd.edu/~pwinkielman/reber-schwarz-winkielman-beauty-PSPR-2004.pdf
- Margulis, E. H. (2014). On Repeat: How Music Plays the Mind. OUP. Findings via https://news.uark.edu/articles/22615/repetition-in-music-pulls-us-in-and-pulls-us-together
- Jakubowski, K. et al. (2017). Dissecting an Earworm. Psychology of Aesthetics, Creativity, and the Arts 11(2), 122–135. https://research.gold.ac.uk/19405
- Leavitt, J. D. and Christenfeld, N. J. S. (2011). Story Spoilers Don't Spoil Stories. Psychological Science 22(9), 1152–1154. https://www.psychologicalscience.org/journals/psychological-science/0956797611417007/ ; replication note https://www.onfiction.ca/2017/04/research-bulletin-spoiler-alert-not-all.html
- Derrick, J. L., Gabriel, S. and Hugenberg, K. (2009). Social Surrogacy. JESP 45(2), 352–362. https://www.buffalo.edu/news/releases/2009/04/10063.html
- Loewenstein, G. (1994). The Psychology of Curiosity. Psychological Bulletin 116(1), 75–98. Summary: https://thedecisionlab.com/insights/society/the-science-behind-curiosity
- Spoiler Alert (mind-tricking narratives; Sixth Sense, Fight Club, Memento): https://meiner-elibrary.de/book/2444/spoiler-alert

Instagram and Meta
- Reel insights definitions: https://help.instagram.com/202865988324236/
- Recommendation Guidelines: https://help.instagram.com/313829416281232
- Creator recommendations eligibility: https://creators.instagram.com/blog/instagram-recommendations-eligibility-tips-creators
- Media insights API: https://developers.facebook.com/docs/instagram-platform/reference/instagram-media/insights/
- Mosseri ranking signals (22 Jan 2025): https://www.socialmediatoday.com/news/instagram-shares-algorithm-insights-2025/738034/
- Retention chart and skip rate (24 Aug 2025): https://www.socialmediatoday.com/news/instagram-adds-retention-insights-reels/758464/
- Views metric announcement (Aug 2024): https://petapixel.com/2024/08/08/reels-stories-carousels-likes-followers-instagram-will-now-focus-on-views-in-metrics-for-photos
- Trial Reels: https://9to5mac.com/2024/12/10/instagrams-new-trial-reels-feature-lets-creators-test-content-with-non-followers ; https://www.socialmediatoday.com/news/instagram-launches-trial-reels-for-audience-sampling/735136/
- Engagement bait clarification: https://www.socialmediatoday.com/news/instagram-clarifies-advice-on-single-word-ctas-and-longer-reels/718151/

Vendor and community (treated as claims)
- Supermetrics field notes (AWT may exceed length): https://docs.supermetrics.com/docs/instagram-insights-fields
- Sked Social (initial plays, replays, 2023): https://skedsocial.com/en-au/blog/icymi-social-media-news-november-2023
- Minter (initial plays and replays from Feb 2023): https://minter.io/help/minterio-updates/new-reels-plays-update
- Agorapulse deprecation note: https://support.agorapulse.com/en/articles/10749883-instagram-metrics-deprecation-apr-2025
- Wreltik on loop psychology, citing Emplifi: https://wreltik.com/en/learn/reels/psychology-of-looping-video
- Metricool on retention and skip rate: https://metricool.com/instagram-reel-analytics/
- Reddit creator anecdote on "wait for it" hooks (r/socialmedia snapshot): https://reddit.sentinel-team.org/posts/1pq0bm7/snapshots/2025-12-20T05%3A31%3A08.299738Z
- Seamless loop tutorial, most viewed found (Creation Effects, After Effects): https://www.youtube.com/watch?v=uI5mbXnuzq4
- Hidden-detail genre examples: https://www.watchmojo.com/articles/top-25-things-you-missed-in-inside-out-2 ; https://www.businessinsider.in/90-easter-eggs-you-may-have-missed-in-all-17-of-pixars-movies/articleshow/56879954.cms
