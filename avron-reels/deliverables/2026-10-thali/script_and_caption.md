# AVRON: Retail inflation thali (Hinglish reel, ~48 s)

Built from the user's "AVRON Pro Reel Master Blueprint" (6-step framework). Facts in `SOURCE_VERIFICATION.md`.
Passed through no-ai-slop. Changes vs the blueprint are listed at the bottom.

## Shot list (timings from the guide VO)
| # | Time | Step | On screen | VO (Roman) |
|---|---|---|---|---|
| 1 | 0.0–5.8 | Hook | 4.83% rolls to **5.54%** (gold → red), RBI 4% target tick | Ek mahine mein mehengai 4.83% se seedha 5.54% pe pahunch gayi |
| 2 | 5.8–8.7 | Hook | Original thali illustration, "Sabse bada jhatka **thali pe**" | Aur sabse bada jhatka aapki thali pe hai |
| 3 | 8.7–12.3 | Context | **CPI**, "Aapke ghar ki tokri ka daam", 1,407 shehri bazaar · 1,465 gaon · har hafte daam | MoSPI ka CPI aapke ghar ki tokri ka daam naapta hai |
| 4 | 12.3–16.8 | Data | Bars Aug 5.97% vs Sep **7.74%**, +1.77 percentage points | Khaane ki mehengai 5.97% se 7.74% pe aa gayi |
| 5 | 16.8–21.6 | Data | Flip cards: Pyaaz **+108.09%** red, Aloo −11.50% green, Tamatar −8.62% green | Pyaaz saal bhar mein 108% mehenga. Aloo aur tamatar thode saste |
| 6 | 21.6–25.8 | Split | Gaon **6.08%** vs Shehar 4.88% (food 8.06% vs 7.18%) | Gaon mein mehengai 6.08%, shehar mein 4.88% |
| 7 | 25.8–30.5 | RBI | Repo step chart 5.25% → **5.50%**, +25 bps, calibrated tightening | RBI ne repo rate 5.25 se badhakar 5.50% kar diya |
| 8 | 30.5–35.4 | RBI | FY27 **5.2%**, dashed Q2–Q4 bars, red box "Anuman hai, guarantee nahi" | FY27 ka anuman 5.2% hai. Anuman hai, guarantee nahi |
| 9 | 35.4–42.5 | Formula | Asli return = Return − Mehengai; 7% − 5.54% = **1.46%** (tagged illustrative, pre-tax) | Asli return matlab return minus mehengai. 7% ki FD pe asli kamai sirf 1.46% |
| 10 | 42.5–45.8 | CTA | "Aapki thali mein sabse mehenga kya hua?" + Comment karo pill. Beat drop | Aapki thali mein sabse mehenga kya hua? Comment karo |
| 11 | 45.8–48.2 | End | AVRON, disclaimer, sources | (bell logo) |

Sound: dark synth pulse at 112 BPM with a ticking-clock undertone, glitch pops on the hook numbers, whooshes on each card/shot, riser into the CTA, then the beat drop (kick + full pad) on "Aapki thali". Original, synthesised (`scripts/score_thali.py`). Mixed −14 LUFS.

## Instagram caption (final, 2026-10-26)
Angle check via Agent Reach (YouTube): other channels lead with "5.54%, 23-month high" and onion +108%. None of the titles found mention the repo hike or the wallet math, so this caption leads with the thali and the real return. "23-month high" is left out: it is not in the MoSPI release.

```
Pyaaz saal bhar mein 108% mehenga. Aapki thali ka kya haal hai? 🧅

September 2026 mein retail mehengai 5.54% pahunchi, August mein 4.83% thi. Khaane ki mehengai 5.97% se 7.74% ho gayi. Aloo (−11.5%) aur tamatar (−8.6%) thode saste hue, par pyaaz sabse aage raha.

Gaon mein mehengai 6.08% rahi, shehar mein 4.88%.

7 October ko RBI ne repo rate 5.25% se badhakar 5.50% kar diya. FY27 ke liye RBI ka CPI anuman 5.2% hai. Anuman hai, guarantee nahi.

Asli return = Return − Mehengai. 7% ki FD aur 5.54% mehengai, toh tax se pehle asli kamai sirf 1.46%.

Aapki thali mein sabse mehenga kya hua? Comment mein likho 👇

Source: MoSPI CPI release, 12 Oct 2026 (September data provisional). RBI MPC resolution, 7 Oct 2026. AVRON is not SEBI-registered. Education only, not financial advice.

#mehengai #inflation #CPI #RBI #reporate #personalfinance #indianeconomy #moneyhinglish
```

## What changed vs the blueprint
- **Fact fix:** RBI raised the repo rate (5.25% → 5.50%) on 7 Oct; the blueprint said it held it.
- Cut binary-contrast and kicker lines ("Yeh sirf ek number nahi hai…", "Ek hi desh ke do alag anubhav"); the numbers carry it.
- Context bridge now says what CPI measures, and the screen shows MoSPI's 1,407 markets + 1,465 villages.
- Real-return step got a worked example so the formula lands on a rupee-level number; tagged illustrative and pre-tax.
- Caption: dropped LaTeX (`$\text{…}$` shows as raw text on Instagram), added the repo hike and the onion number.
- Visual direction kept to the house look: no glow, no spinning icons, no MoSPI/RBI logos (we draw our own charts). Blueprint colour code kept: gold metrics, red rises, green falls.
- Runtime is ~48 s, not 40 s: spelled-out Hindi numbers are long. A faster human read (your Tia VO) will likely land around 40–42 s.
