# Wirecard: "The stock you weren't allowed to bet against"

60 s vertical reel for AVRON. Pre-production pack from the user's 4-phase "Retention Director" prompt (library #11), 2026-11-06.

- **User's calls for this reel:** no other library prompt; **brand v2, graphics only** (no talking head, no stock B-roll); **English** VO; reel goal **saves**.
- **Status:** topic and script drafted. Nothing is built or rendered until the user approves the topic and script.
- Brand gate: `BRAND_CHECK.md` in this folder. Claim registry and sources at the end of this file.

---

## PHASE 1: Outlier topic

**Topic: Germany's regulator protected Wirecard from its critics for 16 months while €1.9 billion of its cash didn't exist.**

Niche fit: fraud autopsy + institutional power. The famous part (Wirecard collapsed) is known. The part most viewers have never heard is what the regulator did in 2019:

- 30 Jan 2019: the Financial Times reported suspected forged contracts in Wirecard's Singapore business. The shares fell.
- 18 Feb 2019: BaFin banned new short positions in Wirecard for two months. It was the first ban on short-selling a single stock in German history (C4).
- 2019: BaFin filed a criminal complaint over suspected market manipulation. The two FT reporters, Dan McCrum and Stefania Palma, were among the people investigated (C5).
- 18–25 Jun 2020: EY couldn't verify €1.9 billion of trust-account cash. BDO and BPI said the confirmation documents were spurious. Wirecard filed for insolvency, the first DAX member to do so in the index's 32-year history (C6–C8).
- Sep 2020: prosecutors dropped the case against the reporters (C9).

**1. The core paradox.** People read a regulator stepping in as a sign the system is protecting investors. Here the protection pointed the wrong way: the watchdog shielded the share price from the people who were right and opened a criminal process that reached the journalists. The fraud wasn't hidden from the market. The market was stopped from pricing it.

**2. Why it pulls high-value viewers.** It's an investing-risk story, not a crime story: auditor confirmations, short-selling rules and regulator behaviour are things an active investor can check. Finance and investing is a high-CPM category (stated as a category trait, no CPM figure claimed). For AVRON's Indian audience it also connects to a live, unresolved argument, whether short sellers are market police or market predators, without naming any Indian company on screen. The end card gives a three-point check people can reuse, which serves the saves goal.

---

## PHASE 2: Triple-hook matrix

| | Hook (VO, ≤ 3.5 s) | On-screen | Trigger | Why it stops the scroll | Weakness |
|---|---|---|---|---|---|
| **A: Threat** | "Your shares can be protected by law right up until they're worth zero." | `Protected → €0` | Loss aversion | Speaks to the viewer's own holdings in the first word | Generic: could open a reel about any crash. No proof in the frame |
| **B: Secret** | "In 2019, two reporters found a fraud. The regulator investigated the reporters." | `Investigated: the reporters` | Asymmetric information, injustice | Moral outrage drives comments | Gives away the twist in second 2, so the middle has less to pay off. Viewers who know Wirecard swipe |
| **C: Paradox** | "In 2019, Germany banned new bets against one stock. Sixteen months later, one point nine billion euros was gone." | Crop on `€1.9B`, headline `Germany banned bets against it` | Violates "regulators protect investors" | Sentence 1 sounds like protection, sentence 2 breaks it, so the brain needs the gap closed. The number is on screen from frame 1. The company isn't named until 0:07, so viewers who "know Wirecard" don't swipe early | Needs a slightly faster read (≈ 3 words/s) to land the first sentence in ~3.3 s |

**Attention reasoning (qualitative, no invented retention stats).** A viewer decides in the first 1–2 s whether the reel has a question worth staying for. A works on fear but doesn't create a specific question. B answers its own question too early. C opens two loops at once ("which stock?" and "how did protection end in €1.9 billion gone?") and closes neither until 0:07 and 0:47, so each section carries a reason to stay.

**Winner: Hook C.** B's injustice beat moves to 0:32 as the escalation peak, where it does more work.

---

## PHASE 3: The 60 s script (132 words written, 137 spoken)

Read at Tia's measured pace (2.45 words/s, `scripts/vo_fit.py`) ≈ 56 s of speech plus ~2 s of designed holds = ~58 s. The hook line is read slightly faster (~3 words/s). Edited with no-ai-slop: cut a "Not against Wirecard." negative fragment and a fake-profound kicker ("The watchdog had guarded the wrong side"), replaced with the concrete fact that the reporters' case was dropped.

| Section | Time | VO |
|---|---|---|
| Hook | 0:00–0:03 | In 2019, Germany banned new bets against one stock. |
| Open loop | 0:03–0:12 | Sixteen months later, one point nine billion euros was gone. The stock was Wirecard, a payments giant worth about twenty-three billion euros. |
| Escalation: setup | 0:12–0:16 | It had just replaced Commerzbank in the DAX, Germany's top index. |
| Evidence 1 | 0:16–0:32 | January 2019. The Financial Times reports suspected forged contracts in Singapore. The stock tumbles. Within three weeks, regulator BaFin bans new bets against Wirecard, the first single-stock ban in German history. |
| Evidence 2 | 0:32–0:41 | BaFin then files a criminal complaint, and the two reporters end up under investigation. |
| Climax | 0:41–0:52 | June 2020. Two Philippine banks call the cash confirmations fake. Wirecard becomes the first DAX company to go insolvent. The case against the reporters is dropped. |
| Comment split + save | 0:52–1:00 | So when a regulator protects a stock, is that safety, or a warning? Save the three checks on screen. |

**Goal note.** The prompt asks for a comment-splitting question; the user's reel goal is saves. The close does both: the question splits viewers into two camps ("safety" vs "warning"), and the end card is the saves checklist (brand move 7). No "like and follow".

### Clean VO (paste-ready for ElevenLabs, numbers spelled out)

```
In twenty nineteen, Germany banned new bets against one stock. Sixteen months later, one point nine billion euros was gone. The stock was Wirecard, a payments giant worth about twenty-three billion euros. It had just replaced Commerzbank in the DAX, Germany's top index.

January twenty nineteen. The Financial Times reports suspected forged contracts in Singapore. The stock tumbles. Within three weeks, regulator BaFin bans new bets against Wirecard, the first single-stock ban in German history. BaFin then files a criminal complaint, and the two reporters end up under investigation.

June twenty twenty. Two Philippine banks call the cash confirmations fake. Wirecard becomes the first DAX company to go insolvent. The case against the reporters is dropped.

So when a regulator protects a stock, is that safety, or a warning? Save the three checks on screen.
```

Pronunciation: Wirecard = "WIRE-card"; BaFin = "BAH-fin"; DAX = "dax"; Commerzbank = "ko-MERTS-bank".

---

## PHASE 4: Second-by-second production blueprint

Look: brand v2 bright & clean ("finance as product UI"). The AVRON app is the presenter. **No talking head and no stock B-roll** (user's choice), so the prompt's "talking head" and "stock search string" items are replaced by the exact documents and data you need to capture. We redraw every chart and document as AVRON UI; no publisher screenshots go on screen.

SFX names are from the AVRON kit (`brand/sound/kit_v1.json`). **The kit hasn't been generated yet**, so as things stand the reel ships with VO + music only (brand rule: no synthesised SFX). The SFX column is the cue sheet for when the kit exists.

| Time | Spoken audio (VO) | Kinetic text overlay | Visual framing & camera | Asset needed from you | Audio design |
|---|---|---|---|---|---|
| 0:00–0:01 | "In 2019, Germany banned…" | Headline reveals per character, blur to sharp: `Germany banned bets against it` (gradient on *banned*) | **Move 2, crop-in:** extreme crop (scale 2.5) on the hero number `€1.9B`, its label still blurred. Shell bar: `Receipt / Germany / Wirecard` · `Data as of 25 Jun 2020` | None | Music bed starts on frame 1 (house bed, −16 dB under VO). Hook sting (first two notes of `sonic_logo`) at 0:00.2 |
| 0:01–0:03 | "…new bets against one stock." | Chip under the number: `TRUST-ACCOUNT CASH` | Pull out (0.72 s, camera curve) to the full card: company name masked as `████████ AG`, row 2 is a toggle `New short positions` | None | `whoosh_soft` on the pull-out, in the gap after "stock" |
| 0:03–0:05 | "Sixteen months later," | Mono chip slides in: `18 FEB 2019 → 25 JUN 2020` | Hold. 80% of frame still; only the date chip moves | None | Bed only |
| 0:05–0:07 | "one point nine billion euros was gone." | `€1.9B` morphs to `€0` + red status pill `NOT FOUND` | **Move 4, panel morph:** number flips state, card stays put | None | `error_down` on "gone" (word gap) |
| 0:07–0:10 | "The stock was Wirecard," | Mask lifts: `Wirecard AG` · source chip `WDI · XETRA` | Name un-redacts with a masked wipe inside the card | Wirecard wordmark (logo allowed: reporting on the company). PNG/SVG from Wikimedia Commons or a 2018 annual report; tell us where it's from for LICENSES.md | `ui_tap` (soft) on "Wirecard" |
| 0:10–0:12 | "…a payments giant worth about twenty-three billion euros." | Hero number counts up `€23B` · tag `≈ SEP 2018` · `Source: AWP via allnews.ch` | Push (transition) to a market-cap tile; number lands and **holds ≥ 1.2 s** | Nothing to capture; figure from C2 | `counter_tick` under the count, `number_land` (1 of ≤ 3) on landing |
| 0:12–0:14 | "It had just replaced Commerzbank…" | Row labels `DAX 30` | Bottom sheet rises: a DAX member list, row `Commerzbank` | Deutsche Börse press release, 5 Sep 2018 (save as PDF/screenshot for our records) | `panel_open` |
| 0:14–0:16 | "…in the DAX, Germany's top index." | Row morphs `Commerzbank → Wirecard` · chip `EFFECTIVE 24 SEP 2018` · `Source: Deutsche Börse` | **Move 4:** the row changes state in place | Same release | `card_slide` |
| 0:16–0:19 | "January 2019. The Financial Times reports suspected forged contracts in Singapore." | Data line (not a screenshot): `FT · 30 JAN 2019 · Suspected forged contracts, Singapore unit` | Zoom-through into a news row in the app's "Events" tab; row expands into a detail card | FT article URL and date (30 Jan 2019) for the source chip. **Don't send a screenshot of the FT page**; we set the line in our own type | `ui_tap` |
| 0:19–0:22 | "The stock tumbles." | Red label on chart `30 JAN 2019` | Line chart of WDI daily close, Sep 2018 → Feb 2019; draws left to right, the drop on 30 Jan dips in red | **Daily close CSV for WDI (Xetra), 1 Sep 2018 – 31 Aug 2020** (e.g. investing.com or a broker export). We draw our own chart | `whoosh_soft` as the line draws |
| 0:22–0:24 | "Within three weeks, regulator BaFin…" | Breadcrumb changes: `Receipt / Germany / BaFin` | Push to a BaFin rules card; toggle `New short positions: Allowed` | None | `whoosh_push` on the push |
| 0:24–0:26 | "…bans new bets against Wirecard," | Toggle flips `Allowed → Blocked` | **Move 3, cursor:** curved path, arrives early, press 0.86 on the stressed "bans", ring | None | `toggle_switch` on "bans" |
| 0:26–0:30 | "the first single-stock ban in German history." | **Move 5, receipt:** document card `BaFin · General administrative act · 18 FEB 2019`; key line set word for word; gold highlighter sweeps it; other lines are neutral bars | Receipt opens out of the toggle row (launch from source) | **BaFin's 18 Feb 2019 general administrative act (English version on bafin.de).** Copy the exact sentence on the ban and its expiry (18 Apr 2019) so we quote it word for word | `panel_open` on the receipt, nothing on the highlighter |
| 0:30–0:32 | (pause, 1.5 s hold) | Chip `FIRST SINGLE-STOCK BAN IN GERMANY` · `Source: Bloomberg, 18 Feb 2019` | Hold on the receipt; slow dolly in | Bloomberg/AP article URL for the chip (link only) | Bed swells 1 dB in the gap |
| 0:32–0:35 | "BaFin then files a criminal complaint," | Status row `Criminal complaint · Munich prosecutors · 2019` | Panel morph: receipt card becomes a case card | None (sources in registry) | `card_slide` |
| 0:35–0:38 | "and the two reporters…" | Two name rows mask in: `Dan McCrum` `Stefania Palma` (text only, no photos) | Rows stagger in (0.06 s) | None. **No photos of the reporters** (real people; no likeness) | `ui_hover` (very low) |
| 0:38–0:41 | "…end up under investigation." | Pill on both rows `UNDER INVESTIGATION` (grey, not red) | Hold 1.5 s. Breadcrumb `Receipt / Germany / Who got investigated` | None | `sub_drop` (1 of ≤ 2) in the gap after "investigation" |
| 0:41–0:43 | "June 2020." | Date chip `18 JUN 2020` | Bottom sheet: new chapter. Breadcrumb `Receipt / Wirecard / Audit` | None | `whoosh_push` |
| 0:43–0:46 | "Two Philippine banks call the cash confirmations fake." | **Move 5 again, receipt:** two bank-statement rows `BDO Unibank · Not a client` `BPI · Not a client`; gold highlight on "spurious documents" | Receipt card; two rows flip from `Confirmed` (grey) to red `Spurious` | BDO and BPI public statements (June 2020): URL + exact wording of the "spurious/falsified" line | `error_down` on "fake" |
| 0:46–0:49 | "Wirecard becomes the first DAX company to go insolvent." | Hero `−97%` (one week) · source chip · then status `INSOLVENT · 25 JUN 2020` | Push back to the chart: line falls off a cliff in red; hero number holds 1.2 s | Same price CSV; Wirecard ad hoc of 25 Jun 2020 (insolvency) for our records | `number_land` (2 of ≤ 3) |
| 0:49–0:52 | "The case against the reporters is dropped." | **Move 6, insight toast:** `Case against the FT reporters dropped · Sep 2020` | Toast slides in over the chart; reporters' pills (from 0:41) would read `CLOSED` if shown | None | `success_up` (soft) |
| 0:52–0:55 | "So when a regulator protects a stock, is that safety, or a warning?" | Two-option split on screen: `Safety` / `Warning` (equal weight, no answer given) | Pull out to the end-card frame | None | Bed drops to room tone under the question |
| 0:55–0:58 | "Save the three checks on screen." | **Move 7, saves end card:** checklist panel `Before your next buy` 1 `Did a bank confirm the cash, or only the company?` 2 `Do critics get documents back, or lawyers?` 3 `Is the regulator acting on the company, or on its critics?` | Checklist rows tick in (stagger 0.06 s). **Move 3:** cursor taps the save icon on "Save" | None | `ui_tap` on "Save", `sonic_logo` (3 notes) at 0:57.5 |
| 0:58–1:00 | (silence) | Toast `Saved to AVRON Watchlist` + disclaimer line `Education, not investment advice` | Hold; loop-friendly last frame | None | Sonic logo tail, bed out |

Signature moves used: 1 (shell, every shot), 2 (0:00), 3 (0:24, 0:56), 4 (0:05, 0:14, 0:32), 5 (0:26, 0:43), 6 (0:49), 7 (0:55). Transitions: push, zoom-through, panel morph and bottom sheet only.

### What you need to send (one list)

1. **WDI daily close CSV**, 1 Sep 2018 – 31 Aug 2020 (Xetra).
2. **BaFin general administrative act, 18 Feb 2019**: the exact ban sentence (receipt at 0:26).
3. **BDO and BPI statements, June 2020**: exact wording (receipt at 0:43).
4. **Wirecard wordmark** with its source, for LICENSES.md.
5. **VO**: generate it from the paste-ready block above in ElevenLabs (Tia Mirza is the default; English this time) or tell us to generate it via the connector. One continuous read.
6. Optional: approve generating the AVRON SFX kit (`scripts/sfx_kit.py --estimate` first, ~5,600 credits estimated last time). Without it, the reel ships VO + music only.

---

## Claim registry

| ID | Claim (as on screen / in VO) | Status | Source |
|---|---|---|---|
| C1 | Wirecard entered the DAX replacing Commerzbank, effective 24 Sep 2018 (announced 5 Sep 2018) | Verified, primary | [Deutsche Börse release](https://www.deutsche-boerse.com/dbg-en/media/press-releases/Wirecard-AG-to-be-included-in-DAX-new-composition-for-TecDAX-MDAX-and-SDAX-1406616) |
| C2 | Worth "about €23 billion" at that point | Verified, approximate (reports range €22.5–24 bn) | [allnews.ch (AWP)](https://allnews.ch/node/7414), [City AM](https://www.cityam.com/?p=7637), [Xpert.Digital](https://xpert.digital/?p=4861) |
| C3 | FT reported suspected forged contracts in Singapore, Jan 2019; shares fell | Verified (date 30 Jan 2019 to confirm against the FT article the user sends) | [Business Day](https://www.businesslive.co.za/bd/companies/2019-02-18-germany-bans-wirecard-shorting-as-prosecutors-probe-journalist/), [Bloomberg](https://www.bloomberg.com/news/articles/2019-02-18/bafin-bans-new-wirecard-net-short-positions-and-increases) |
| C4 | BaFin banned new short positions, 18 Feb 2019 to 18 Apr 2019; first single-stock short ban in Germany | Verified | [Bloomberg](https://www.bloomberg.com/news/articles/2019-02-18/bafin-bans-new-wirecard-net-short-positions-and-increases), [AP / Washington Times](https://m.washingtontimes.com/news/2019/feb/18/german-market-watchdog-bans-short-selling-of-wirec/), [BNN Bloomberg](https://www.bnnbloomberg.ca/wirecard-regulator-pursued-critics-after-a-probe-found-nothing-1.1569067) |
| C5 | BaFin filed a criminal complaint (about a dozen people); the two FT reporters were among those investigated | Verified. Exact filing month (often given as April 2019) **not verified**, so VO and screen say "2019" only | [Dan McCrum (Wikipedia)](https://en.wikipedia.org/wiki/Dan_McCrum), [Fox Business](https://www.foxbusiness.com/markets/german-market-watchdog-alleges-wirecard-shares-manipulated), [GlobalCapital](https://www.globalcapital.com/article/b1mjc9sdbqyjj1/reckoning-begins-for-bafin-after-it-pursued-wirecard-foes-not-fraudsters) |
| C6 | 18 Jun 2020: EY couldn't verify €1.9 bn in trust accounts at two Philippine banks | Verified | [Accountancy Age](https://accountancyage.com/2020/06/22/eys-wirecard-audit-exposes-potential-fraud/), [OCCRP](https://occrp.org/en/news/wirecard-files-for-insolvency-following-criminal-investigation) |
| C7 | BDO and BPI said Wirecard wasn't a client and the documents were spurious/falsified | Verified | [Inquirer](https://business.inquirer.net/?p=300457) |
| C8 | 25 Jun 2020 insolvency; first DAX member to file in the index's 32-year history; shares ~−97% vs a week earlier | Verified | [Free Malaysia Today (Reuters)](https://www.freemalaysiatoday.com/category/business/2020/06/25/wirecard-files-for-insolvency-becomes-first-german-blue-chip-firm-to-fail), [Al Jazeera](https://www.aljazeera.com/economy/2020/6/25/in-swift-spectacular-implosion-wirecard-officially-goes-bust), [RTÉ](https://www.rte.ie/news/business/2020/0625/1149518-wirecard-files-for-insolvency) |
| C9 | Case against the reporters dropped, Sep 2020 | Verified | [AP via Audacy](https://www.audacy.com/1010wins/articles/ap-news/german-prosecutors-drop-probe-of-journalists-over-wirecard), [Wikipedia](https://en.wikipedia.org/wiki/Dan_McCrum) |
| C10 | "Sixteen months" between the ban (Feb 2019) and the missing cash (Jun 2020) | Derived from C4 + C6 | — |

**Dropped (not verified well enough to say):** EY not asking OCBC for bank statements for three years (FT report, unnamed sources; [Irish Times](https://www.irishtimes.com/business/financial-services/ey-failed-to-ask-for-wirecard-bank-statements-for-three-years-1.4289546)); that the money "never entered the Philippines" (central bank governor quote, kept out for word count); any CPM or retention figures.

**Legal care.** Criminal proceedings against former Wirecard executives have run for years (check their status before posting). The reel names no executive and calls no one guilty. The only people named are the two reporters: investigated, then the probe was dropped.
