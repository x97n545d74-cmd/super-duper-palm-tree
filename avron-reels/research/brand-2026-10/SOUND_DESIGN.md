# AVRON sound design: "finance as product UI"

Research brief for the new locked brand look (reels that feel like premium SaaS product demos). Written 2026-10-28. Read-only research; nothing was generated or spent.

How to read this: **[confirmed]** means I read it on the cited page or in the cited source code. **[secondary]** means a blog, tutorial or forum, so treat the numbers as starting points. **[unconfirmed]** means I could not verify it and you should check before relying on it. **[AVRON call]** is my recommendation, not a quoted rule.

---

## 1. ElevenLabs Sound Effects: what is confirmed

### 1a. The API

| Item | Value | Status / source |
|---|---|---|
| Endpoint | `POST https://api.elevenlabs.io/v1/sound-generation` | [confirmed] API reference |
| Auth header | `xi-api-key: <key>` | [confirmed] API reference |
| `text` | string, required. The prompt | [confirmed] |
| `model_id` | default `eleven_text_to_sound_v2`; allowed `eleven_text_to_sound_v2`, `eleven_text_to_sound_v3` | [confirmed] API reference. Note: the Models overview page lists only `eleven_text_to_sound_v2`, so v3 is in the API enum but not yet documented elsewhere. Test both. |
| `duration_seconds` | double, nullable. **0.5 to 30 s**. Null = model guesses length from the prompt | [confirmed] API reference. (The capability overview says 0.1–30 s; the API reference and the official skill both say 0.5–30. Use 0.5 as the floor.) |
| `prompt_influence` | double 0–1, **default 0.3**. Higher = follows the prompt more closely, less variation | [confirmed] API reference + Playground guide ("By default, this is set to 30%") |
| `loop` | boolean, default false. Seamless loop | [confirmed] API reference. The official ElevenLabs skill says loop is "v2 model only" [confirmed in skill, not in API ref] |
| `output_format` (query param) | default `mp3_44100_128`. Examples in the API ref: `mp3_22050_32`, `mp3_44100_128`, `opus_48000_128`, `pcm_16000`, `ulaw_8000`, `wav_44100`. The official skill lists the full set, including `pcm_48000` and `wav_48000` | [confirmed]. Higher MP3 bitrates and 44.1 kHz PCM/WAV need a paid tier (API ref; MCP docstring says 192 kbps MP3 needs Creator+, PCM 44.1 kHz needs Pro+) |
| `enable_logging` (query) | default true; false = zero-retention, enterprise only | [confirmed] |
| Prompt length | max 450 characters | [confirmed] Playground FAQ (website; the API ref does not state a limit) |
| Output | MP3 for everything; WAV 48 kHz for non-looping effects | [confirmed] capability overview "Key facts" |
| SDK call | Python `client.text_to_sound_effects.convert(...)`; JS `client.textToSoundEffects.convert({...})`; CLI `elevenlabs text-to-sound-effects convert --text "..." --output x.mp3` | [confirmed] quickstart + skill |
| Generations per request | API returns 1 clip per call; the website Playground makes 4 per click | [confirmed] Playground guide ("Four sound effects will be created each time"); 1-per-API-call is from an older help article seen only in a search snippet [secondary] |

**Cost [conflicting, check your plan page].** The capability overview says "40 credits per second when duration is specified". The help-centre article now says only that cost depends on settings and points to the pricing pages. The ElevenAPI pricing page shows Sound Effects at **$0.12 per minute** and says API usage "is billed in US dollars, not credits", while its FAQ says Sound Effects are "billed per generation". Older/newer help-article versions quoted in search snippets (200 credits/generation auto-length; or 100 credits/generation and 11 credits/s) could not be confirmed on a live page. Practical budget: a 16-sound kit at ~4 takes each, average 1.5 s, is ~100 s of audio, so roughly 4,000 credits at the 40/s rate, or about $0.20 at $0.12/min. Either way it is cheap; budget for iteration, not for the kit.

**[AVRON call] Format:** our pipeline runs at 48 kHz (`scripts/mix.sh` resamples to 48000). Request `wav_48000` or `pcm_48000` for one-shots if the plan allows it; otherwise `mp3_44100_128` and resample. Never use the 22 kHz formats: they cut the top octave where clicks live.

### 1b. The official prompting advice (what ElevenLabs actually says)

From the capability overview and help centre [confirmed]:

- **Simple effects:** "clear, concise descriptions", e.g. "Glass shattering on concrete", "Heavy wooden door creaking open".
- **Add a little detail:** "high-quality, professionally recorded footsteps on grass, sound effects foley". "It can require some experimentation to find a good balance between being descriptive and keeping it brief."
- **Sequences:** describe events in order ("Footsteps on gravel, then a metallic door opens"). **But:** "for the best results, we would recommend generating individual sound effects and then combining them in an audio editor." → For AVRON, generate every kit element as a single one-shot and layer in the mix.
- **Use audio terminology:** Impact, Whoosh, Ambience, One-shot, Loop, Stem, Braam, Glitch, Drone.
- **Musical elements** are allowed (key, BPM): "Vintage brass stabs in F minor", "90s hip-hop drum loop, 90 BPM". Useful for the sonic logo (we can name a key).
- **Official skill tips:** be specific ("Heavy rain on a tin roof" > "Rain"), specify style, mention mood. The skill's own example for a UI sound uses `duration_seconds=1.0, prompt_influence=0.8`.
- **Prompt influence:** high = literal, low = creative variations.

### 1c. The ElevenLabs MCP server

There are two, and they differ:

**(i) Local server `github.com/elevenlabs/elevenlabs-mcp` (PyPI `elevenlabs-mcp`)** — the README now says it is **deprecated** in favour of the hosted server.

- Install (Claude Desktop): get an API key, install `uv`, then in Claude → Settings → Developer → Edit Config add to `claude_desktop_config.json`:
  ```json
  { "mcpServers": { "ElevenLabs": { "command": "uvx", "args": ["elevenlabs-mcp"],
      "env": { "ELEVENLABS_API_KEY": "<insert-your-api-key-here>" } } } }
  ```
  Other clients: `pip install elevenlabs-mcp`, then `python -m elevenlabs_mcp --api-key=... --print` to print the config. Windows needs Developer Mode in Claude Desktop.
- Env vars: **`ELEVENLABS_API_KEY`** (required); `ELEVENLABS_MCP_BASE_PATH` (base path for file operations, default `~/Desktop`); `ELEVENLABS_MCP_OUTPUT_MODE` = `files` (default) | `resources` | `both`; `ELEVENLABS_API_RESIDENCY` (default `us`, enterprise).
- **Sound effects tool — read from `elevenlabs_mcp/server.py` at commit `c6dc168`:**
  ```python
  text_to_sound_effects(
      text: str,
      duration_seconds: float = 2.0,      # tool enforces 0.5–5 s
      output_directory: str | None = None,
      output_format: str = "mp3_44100_128",
      loop: bool = False,
  )
  ```
  Docstring: "Duration must be between 0.5 and 5 seconds." and "COST WARNING ... Only use when explicitly requested by the user." Allowed `output_format` values in the tool: mp3_22050_32, mp3_44100_32/64/96/128/192, pcm_8000/16000/22050/24000/44100, ulaw_8000, alaw_8000, opus_48000_32/64/96/128/192 (no WAV, no pcm_48000).
  **Limits that matter for us:** the MCP tool **does not expose `prompt_influence` or `model_id`** (it always uses the API defaults: 0.3 and v2), and it **caps duration at 5 s**. So `room_tone` (loop) and any >5 s bed cannot come from this tool; and every prompt_influence value in the kit below needs the API/SDK/CLI, not the local MCP. Output files are named from the prompt (`make_output_file("sfx", text, "mp3")`).
  Other tools in the same server (names only): text_to_speech, speech_to_text, search_voices, list_models, get_voice, voice_clone, isolate_audio, check_subscription, create_agent, add_knowledge_base_to_agent, list_agents, get_agent, get_conversation, simulate_conversation, list_conversations, speech_to_speech, text_to_voice, create_voice_from_preview, make_outbound_call, search_voice_library, list_phone_numbers, play_audio, compose_music, create_composition_plan, video_to_music, upload_music_for_inpainting.

**(ii) Hosted server `https://api.elevenlabs.io/v1/mcp`** (India residency: `https://api.in.residency.elevenlabs.io/v1/mcp`). OAuth, no API key in the client. Claude Desktop: Settings → Connectors → search "ElevenLabs" → Connect. The docs page lists approved permissions as "ElevenAgents read/write and Text to Speech" and **does not publish tool names**. **[unconfirmed]** whether the hosted connector exposes a sound-effects tool at all, and with which params. Check the connector's tool list in Claude before planning around it. If it lacks SFX, use the CLI or SDK (or the official skill, `npx skills add elevenlabs/skills --skill sound-effects`; run SkillSpector on it first, per CLAUDE.md).

**[AVRON call]** Generate the kit with the SDK/CLI (full parameter control, 48 kHz WAV), not the MCP. Use the MCP only for quick one-off auditions under 5 s.

---

## 2. What the tutorials teach (motion graphics / UI / product video)

SECTION_2_PLACEHOLDER

---

## 3. Mixing SFX under a Hinglish VO on phone speakers

### Levels

Sources give fader/peak ranges, not LUFS offsets [secondary]:

| Source | Dialogue | SFX | Music |
|---|---|---|---|
| PremiumBeat | −12 to −15 dB | −10 to −20 dB, occasional spikes to −8 | −18 to −22 dB; no peaks above −6 |
| Epidemic Sound blog | ~−18 to −9 dB | −10 to −20 dB | −18 to −22 alone; ~−30 to −35 under dialogue |

These ranges overlap with dialogue, which tells you SFX are short transients that may *peak* near the voice but must not *sit* at the voice's level. Translated to AVRON's −14 LUFS mix [AVRON call]:

- **VO** is the reference: aim for the VO stem alone to measure about −16 LUFS short-term before the master loudnorm.
- **Tiny UI sounds** (tap, tick, toggle): peak **8–12 dB below VO peaks**. You should feel them, not hear them as events.
- **Movement sounds** (whoosh, slide, panel): **6–10 dB below VO**; can come up to −4 dB *in a VO gap*.
- **Hero hits** (number_land, sub_drop, sonic_logo): allowed to reach VO level (0 to −3 dB) **only when the VO is silent** (a breath gap, the hook pause, or the end card).
- **Room tone / bed:** 25–30 dB below VO. It is glue, not content.
- Rule from small-speaker guidance: never spike so hard the viewer turns the phone down (cursa).

### EQ and masking

- Speech intelligibility band: **2.5–5 kHz** for male and female voices (ProSoundWeb). Cut the competing element 2–4 dB there and lift the voice a similar amount (ProSoundWeb) [secondary, from a pro engineer's column].
- Small-speaker guide (cursa) [secondary]: voice articulation 2–5 kHz; effects definition 1–3 kHz; UI clicks have energy 2–8 kHz; air 6–10 kHz. Voice chain: HPF 70–120 Hz, cut 200–400 Hz mud, tame 3–5 kHz, 2:1–4:1 compression.
- Violet Recording UI guide [secondary]: HPF UI cues below ~120 Hz; tame harsh peaks around 2–5 kHz.
- **[AVRON call] The conflict and how to solve it:** UI clicks naturally live in 2–8 kHz, right on top of consonants. So: (1) put clicks *between* words (snap them to VO gaps from the faster-whisper word timings we already have); (2) give click layers a gentle 2–4 dB dip at 3 kHz while VO is active (dynamic EQ or a static notch on the SFX bus); (3) keep the click's body at 1–2 kHz and its "air" at 6–8 kHz, so it reads around the voice instead of on it.

### Ducking

- Music ducking under speech: −6 to −12 dB typical, attack/release 200–500 ms [secondary, search summary]; ProSoundWeb: lower music/effects while the voice is dominant and bring them up in pauses.
- Ducking plus EQ carving are used together (IRPR).
- Our `scripts/mix.sh` already sidechains music to VO (ratio 8, 15 ms attack, 400 ms release) and leaves SFX unducked at 0.8 gain. **[AVRON call]** Keep SFX unducked (they are timed to gaps), but add a *light* VO-keyed duck on the SFX bus (ratio 2–3, 3–4 dB max) so a click that lands on a word gets out of the way automatically.

### Phone speakers

- Phone speakers struggle below ~200 Hz and nearly all are gone by 100 Hz; a built-in filter often removes content below 200 Hz (LANDR) [secondary]. Cursa: "often roll off heavily below ~150–200 Hz".
- So a `sub_drop` is **inaudible on a phone** unless it has harmonics. LANDR: use distortion/saturation (it adds harmonics; EQ cannot), target 250–700 Hz for growl/knock, keep <200 Hz mono, HPF reverb/delay returns at 200–400 Hz.
- Cursa: for a low thump, duplicate, high-pass the copy at 120–200 Hz, saturate it, optionally lift 1–2.5 kHz.
- Short cues cut through better: 50–300 ms; reveal tails under 300–500 ms "so it doesn't smear the next line" (cursa).
- **[AVRON call]** Every low sound in the kit gets a saturated 150–600 Hz "phone layer". Check every mix on an actual phone speaker at 50% volume before export (add to `scripts/qc.py` checklist).

---

## 4. Sonic branding: how a small palette is built

**Netflix "ta-dum"** (Twenty Thousand Hertz episode page) [confirmed on page]: two knocks (Lon Bender's wedding ring on a cabinet), a slowed anvil for weight, muted hits for punch, and a reversed-guitar "blossom". Brief: "it had to be really short" (target ~3 s; later "only four seconds long"), tension then release, "more cinematic than electronic and computerish", work across every genre, evoke Netflix without saying the name. Marketplace adds: short because streaming viewers want instant play; "people would tune it out" if long.

**Microsoft** (Microsoft News feature on Matthew Bennett's sound philosophy) [confirmed]: priority order "do no harm – no annoying audio!", then function, then beauty. Sounds are "paramusical" (rhythm/melody/harmony without becoming music). "We design sound with silence in mind." Avoid novelty sounds, skeuomorphic replicas, and sampled instruments. **Cut the set from ~40 sounds (Windows 7) to ~8 (Windows 10)**; seven error sounds became two (gentle vs urgent). Urgency is coded by direction and interval (error uses a minor 9th). One shared melodic contour ("up, down, and a small leap") informs the whole set. The calendar alert took 400+ versions.

**Mastercard** (NFCW; Mastercard press pages returned 403 so this is partly from search summaries) [secondary]: a sonic identity is "a suite of sounds based around a melody": a long core melody, a short sonic logo, and a ~1 s point-of-sale **acceptance sound**, plus ringtones and hold music, all variations of one melody. Adapted per genre/culture while staying recognisable. (Durations and trust stats come from Mastercard's own PR; not independently checked.)

**Material Design (Google)** [secondary; m2.material.io is JS-rendered and did not load, content via search summary]: UI sounds are "earcons"; **hero sounds** mark important moments, are infrequent and must be applied consistently; notifications are shorter than hero sounds and built to survive repetition; silence is a design choice.

**Violet Recording UI guide** [secondary]: keep every cue in "a common tonal family" (same synth source, reverb, tone); "reuse the same synth patch and just change pitch and envelope"; match perceived loudness across the family; confirm = two rising notes; taps 30–150 ms; most cues under 300 ms.

**Intercom** (blog/podcast listing) [secondary]: even a single notification "chirp" polarises users; they offered a small set of variants (blip, bop, clack, hiss, shake, tick).

**Lessons for AVRON** [AVRON call]:
1. **One root, one key.** Build every tonal sound (tap, success, error, logo) from one timbre and one key. Pick **D major / B minor** (warm, not shrill on phones) and keep `success_up` = rising 5th, `error_down` = falling minor 2nd/tritone, `sonic_logo` = 3 notes "up, down, small leap" style contour.
2. **Small set, reused every reel.** 12–16 sounds, frozen as files in `public/sfx/avron_kit_v1/`. Never regenerate per reel; regenerate only to make v2 of the whole kit.
3. **Hierarchy:** brand (sonic_logo) > hero (number_land, sub_drop, riser) > feedback (success, error) > primary UI (tap, tick, slide). Frequent sounds quieter and shorter than rare ones.
4. **Silence is part of the kit.** Leave the hook line clean; earn the first hit.
5. **Sonic logo ≤ 2 s** for a 60 s reel (Netflix is ~3–4 s for a long-form service; reels need less), always on the end card, and a 0.5 s "sting" variant for the hook.

---

## 5. AVRON sound kit v1 (spec)

Generate each as its own one-shot (ElevenLabs' advice). Take 4 generations per sound, pick the best, trim to the first transient (Violet), normalise all tonal sounds to matched perceived loudness, then store. Levels are **relative to VO peaks** in the final mix (see §3). `pi` = prompt_influence. Durations are what to request; trim after.

Prompt pattern used [built from the official guide]: *what it is (audio term)* + *material/source* + *character* + *length/envelope* + "high-quality, professionally recorded ... sound effect" + exclusions ("no music, no voice, no reverb tail") where relevant. All prompts are under the 450-character limit.

| # | Name | Purpose | Request dur. | ElevenLabs prompt | pi | Mix vs VO |
|---|---|---|---|---|---|---|
| 1 | `ui_tap` | Cursor click / button press on a UI panel | 0.5 s (trim to ~80 ms) | "Single soft UI click one-shot, premium software interface button press, tight dry plastic-and-glass tick with a tiny rounded low body, very short and clean, high-quality professionally recorded sound effect, no reverb, no music" | 0.7 | −10 to −12 dB; between words |
| 2 | `ui_hover` | Cursor entering a card / highlight glow | 0.5 s (~120 ms) | "Very subtle airy UI hover sound one-shot, soft breathy filtered noise blip, gentle and quiet, modern app interface, short and dry, high-quality sound effect, no music" | 0.6 | −14 dB (barely there) |
| 3 | `toggle_switch` | Switch / tab change / filter chip | 0.5 s (~150 ms) | "Crisp mechanical toggle switch one-shot, small precise click-clack of a premium aluminium switch, two quick tight clicks, dry and close, high-quality foley sound effect, no music" | 0.7 | −10 dB |
| 4 | `panel_open` | Dashboard panel or modal expanding in | 0.8 s | "Smooth UI panel opening sound, soft upward airy swish with a gentle glassy shimmer at the end, sleek modern software interface, short and clean, high-quality sound effect, no music, no voice" | 0.5 | −8 dB |
| 5 | `panel_close` | Panel collapsing / screen dismiss | 0.6 s | "Smooth UI panel closing sound, soft downward airy swish ending in a muted tight click, sleek modern software interface, short and dry, high-quality sound effect, no music" | 0.5 | −9 dB |
| 6 | `card_slide` | A card sliding sideways into place | 0.7 s | "Short UI card slide whoosh, a smooth sheet of frosted glass sliding quickly across a surface and stopping with a soft tap, close and dry, modern interface sound, high-quality sound effect, no music" | 0.5 | −8 dB |
| 7 | `counter_tick` | Digits rolling on a data counter (loop under the roll) | 2.0 s, `loop: true` | "Rapid soft digital counter ticking, fast even mechanical number-roller clicks like a premium odometer, light and dry, steady rhythm, loopable texture, high-quality sound effect, no music, no beeps" | 0.6 | −14 dB; fade out 2 frames before `number_land` |
| 8 | `number_land` | The final number locks in (hero moment) | 1.0 s | "Satisfying UI confirmation impact one-shot, a tight punchy soft thump with a bright glassy click on top and a short warm tonal ring, premium fintech app, clean and short, high-quality sound effect, no music" | 0.6 | −3 to 0 dB, VO gap only |
| 9 | `whoosh_push` | Camera push / screen-to-screen transition | 0.8 s | "Fast clean whoosh transition, smooth airy swoosh that builds quickly and stops, modern tech product video, slight low weight underneath, no rumble tail, high-quality sound effect, no music" | 0.4 | −6 to −8 dB |
| 10 | `whoosh_soft` | Small element moves (chart line, label fly-in) | 0.5 s | "Very short soft whoosh one-shot, light breathy air swipe, subtle and fast, minimal UI motion sound, high-quality sound effect, no music" | 0.5 | −12 dB |
| 11 | `riser_2s` | Tension build into a reveal or hook payoff | 2.0 s | "Clean modern riser, 2 seconds, filtered airy noise and a soft synthetic tone rising steadily in pitch and intensity, ends abruptly at the peak, sleek tech product reveal, high-quality sound effect, no drums, no melody" | 0.5 | −10 dB rising to −4 dB; must end on the hit frame |
| 12 | `sub_drop` | Big reveal / chart crash / key stat | 1.5 s | "Deep cinematic sub drop impact, short low boom with a punchy transient and a fast downward pitch sweep, tight controlled tail, modern trailer hit, high-quality sound effect, no music" | 0.5 | −3 dB, VO gap only; add saturated 150–600 Hz phone layer |
| 13 | `success_up` | Positive result (gain, green number, tick mark) | 0.8 s | "Short positive UI success chime, two soft rising bell-like synth notes a fifth apart in D major, warm rounded mallet tone, quick and elegant, fintech app confirmation, high-quality sound effect, no reverb tail" | 0.7 | −8 dB |
| 14 | `error_down` | Negative result (loss, red number, warning) | 0.8 s | "Short negative UI alert, two soft descending synth notes a semitone apart, muted and low, gentle but serious, fintech app warning, not harsh, no buzzer, high-quality sound effect, no reverb tail" | 0.7 | −8 dB |
| 15 | `glitch_cut` | Data corruption / "this number is wrong" / myth-bust beat | 0.6 s | "Short digital glitch transition, quick stuttering data-corruption crackle and bit-crushed blips, tight and controlled, modern UI malfunction sound, high-quality sound effect, no music" | 0.5 | −10 dB |
| 16 | `sonic_logo` | AVRON signature on end card (and a 0.5 s hook sting cut from its first two notes) | 2.0 s | "Premium fintech sonic logo, three clean notes in D major: up, down, then a small leap up, warm rounded mallet-and-glass synth tone over a soft low thump, confident and calm, ends with a short shimmer, not a jingle, high-quality sound effect" | 0.8 | 0 dB on end card (no VO); sting −4 dB |
| 17 | `room_tone` | Quiet "studio/product" air bed so silences don't sound dead | 20 s, `loop: true` | "Very quiet clean room tone of a modern minimal studio, soft constant air and faint electronic hum, no events, no voices, no music, seamless ambience loop" | 0.4 | −25 to −30 dB, continuous |

Notes:
- Items 1–16 fit the local MCP tool's 0.5–5 s range, but not its prompt_influence (it uses 0.3). Item 17 needs the API/CLI (20 s + loop).
- `counter_tick` and `room_tone` use `loop: true`; per the official skill this works on the v2 model only.
- Optional extras if a reel needs them: `notif_pop` (phone notification for "alert" beats), `typing_burst` (search-bar typing), `cash_register` (avoid, it is a cliché; prefer `number_land`).

### How to use the kit in a 60 s reel [AVRON call, based on §2 and §3]

- **Density:** at most ~1 SFX event per VO phrase; never more than ~2–3 discrete events in any one second (counter_tick counts as one). Busy UI montages: let `counter_tick` or one `whoosh_push` carry the whole move rather than a click per element.
- **Timing:** sync the *peak* of each sound to the keyframe (SFX Engine, Pixflow). Movement sounds (whoosh, slide, panel) start before the motion so their peak lands where the motion ends; impacts land on the frame. Riser ends exactly on the hit frame, ideally into a beat of silence.
- **Hierarchy per reel:** 1 `sonic_logo`, ≤2 `sub_drop`, ≤3 `number_land`, ≤1 `riser_2s` per 20 s.
- **Layering:** primary + at most one secondary layer, secondary well under the primary (SFX Engine: "pull their audio levels way down"; "Less is almost always more").
- **File home:** `public/sfx/avron_kit_v1/<name>.wav`, 48 kHz, with a `KIT.json` recording prompt, model, pi, seed take, and date for each file.

---

## Sources (pages actually read)

ElevenLabs
- https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert (also the `.md` version)
- https://elevenlabs.io/docs/capabilities/sound-effects and https://elevenlabs.io/docs/overview/capabilities/sound-effects.md
- https://elevenlabs.io/docs/eleven-creative/playground/sound-effects.md
- https://elevenlabs.io/docs/eleven-api/guides/cookbooks/sound-effects.md
- https://elevenlabs.io/docs/help-center/product/core-capabilities/sound-effects/how-do-i-prompt-for-sound-effects.md
- https://elevenlabs.io/docs/help-center/product/core-capabilities/sound-effects/how-much-does-it-cost-to-generate-sound-effects.md
- https://elevenlabs.io/docs/overview/models
- https://elevenlabs.io/pricing/api
- https://elevenlabs.io/docs/agents-platform/operate/hosted-mcp
- https://github.com/elevenlabs/elevenlabs-mcp (README) and https://raw.githubusercontent.com/elevenlabs/elevenlabs-mcp/main/elevenlabs_mcp/server.py (commit c6dc1688)
- https://raw.githubusercontent.com/elevenlabs/skills/main/sound-effects/SKILL.md

Tutorials and sound-design guides
SECTION_2_SOURCES
- https://sfxengine.com/blog/after-effects-sound-effects-tutorial
- https://krotos.studio/guide/4-whoosh-sound-effects-tips
- https://pixflow.net/blog/enhancing-motion-graphics-with-cinematic-transition-sounds/
- https://sozai.app/transcript/three-sound-effects-tell-any-story/index.md (third-party transcript of Tim Runia, "The ONLY 3 Sound Effects You Need to Tell Any Story"; video URL not shown on the page)
- https://violetrecording.com/how-to-design-ui-sounds/

Mixing
- https://www.prosoundweb.com/in-the-studio-balancing-dialog-in-post-production/
- https://sounddesign.irpr.agency/compare/ducking-vs-eq-separation/
- https://cursa.app/en/page/sound-design-that-reads-on-small-speakers
- https://blog.landr.com/make-bass-audible-phone-speakers
- https://www.premiumbeat.com/blog/how-to-set-audio-levels-for-video/
- https://www.epidemicsound.com/blog/audio-mixing-for-video

Sonic branding
- https://www.20k.org/episodes/netflix
- http://www.marketplace.org/story/2022/01/03/the-strategy-behind-sonic-logos-like-netflixs-startup-chime
- https://news.microsoft.com/en-au/features/how-microsoft-is-cutting-through-the-noise-to-create-a-more-useful-beautiful-sound-world/
- https://www.nfcw.com/2019/02/12/361610/mastercard-unveils-sonic-brand/

Tried but blocked (not used as sources): mastercard.com press pages (403), thedrum.com (403), cnbc.com (403), medium.com Google Design (403), m2.material.io sound pages (rendered empty), windowscentral.com (no body). Material Design and the music-ducking −6 to −12 dB / 200–500 ms figures come only from search-result summaries and are marked [secondary].
