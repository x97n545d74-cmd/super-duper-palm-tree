# Red Bull Media Flywheel: realistic video plan (v4)

The user's verdict on the CG version: 2/10. "Don't move the footage, create videos out of those. Make it realistic."

So every shot is now **real video**. Each one comes from one of three sources: an image-to-video model starting from your photos, text-to-video for the rest, or your phone for the can. Graphics are kept to a few precise overlays composited onto real footage. No more CG cans and no more void backgrounds.

**Specs for every clip:** 9:16, 1080×1920 (or the model's max, upscaled), 24 fps native, 5 s or 10 s, no on-screen text, no logos except the real can you film yourself, and no real person's likeness (no Felix Baumgartner).

**Best models (Nov 2026), in order:** Kling 2.x Master or Veo 3 for physics and realism, Runway Gen-4 for image-to-video from your photos, Higgsfield for camera-move presets. Generate 3–4 takes per shot and keep the best.

---

## A. The hero can: film it yourself (the most realistic option there is)
No AI can is as convincing as a real one. Ten minutes with a phone:
- **Setup:** a real Red Bull 250 ml can, straight from the fridge so it's covered in condensation. Black card behind it, a dark room, and one torch or phone light from the side (45°, slightly behind) so the rim and the droplets catch light.
- **Shoot in slow-mo** (iPhone: Slo-mo 240 fps, 1080p; Android: Super Slow-mo), phone on a stack of books, vertical.
  1. **C1 POP** (fills 0:00–0:05): close-up on the tab. Open it hard. The gas spray and the hiss happen for real. Do 5 takes.
  2. **C2 DROP:** drop the can onto a wet black table from 20 cm. The splash and droplets go everywhere.
  3. **C3 POUR:** pour into a clear glass with the light behind it. The bubbles are the 15¢ beat (0:35).
  4. **C4 ROLL:** lay the can on its side and roll it slowly past the lens (the flywheel beat, 0:50).
  5. **C5 CRUSH:** crush the empty can in one hand, close up (the CTA, 2:40).
- Record the **sound** too: pop, hiss, pour, crush. That's real foley, and it beats synthesised SFX.

## B. Your four photos, turned into video (image-to-video, photo = first frame)
| Clip | Start frame | Prompt (paste as is) | Used at |
|---|---|---|---|
| **V1** | `boardroom.jpg` | `Night boardroom high above a city. The wall TV switches on and plays a bright generic commercial, its light flickering across the glossy floor and chair backs. City lights twinkle, faint rain streaks run down the windows. Slow dolly-in toward the screen. Photorealistic, cinematic, 35mm film grain, no people, no text, no logos.` | 0:05–0:14 |
| **V2** | `production_room.jpg` | `Busy live-sports broadcast prep room. The crew member in the cap walks across frame carrying a cable, another operator types at the desk, a flight case lid is slammed shut, monitors flicker with blurred action footage. Handheld documentary camera pushing forward slowly. Photorealistic, natural motion, no text, no logos.` | 0:25–0:35 |
| **V3** | `neon_chart.jpg` | `The glowing white neon arrow chart flickers on like a real neon sign, the tubes buzz and stabilise, slight glow bloom on the black wall, a few sparks at the base of the tallest arrow. Locked-off camera, slow push in. Photorealistic neon tubes, no text.` | 0:35–0:38 |
| **V4** | `cliff_jump.jpg` | `The rope jumper swings out over the misty canyon, rope uncoiling behind him, wind moving his jacket, mist drifting through the valley below, camera slowly tracking with him. Real-time speed, realistic body physics, photorealistic, 4K documentary.` | 1:55–2:04 |

For V4, a second take at **double length (10 s)**. We slow it to 25% with optical flow for the slow-mo beat.

## C. Text-to-video for the rest
| Clip | Prompt | Used at |
|---|---|---|
| **T1** | `Extreme close-up of a TV broadcast control panel at night, a hand presses a red "ON AIR" button, the button lights up, reflections in the glossy surface. Shallow depth of field, photorealistic, no readable text.` | 0:10 |
| **T2** | `Time-lapse of a giant stadium filling with people at dusk, floodlights snapping on one by one, wide aerial drone shot slowly orbiting. Photorealistic, no logos.` | 0:50–1:00 |
| **T3** | `Generic open-wheel racing car with plain matte black bodywork and no sponsor logos, launching off the start line at night, tyre smoke, sparks under the floor, low camera at track level, motion blur. Photorealistic.` | 1:00–1:08 |
| **T4** | `Camera crew filming a mountain biker jumping a canyon gap at sunset, the camera operator in the foreground, the rider small in the distance. Telephoto, photorealistic.` | 1:08–1:15 |
| **T5** | `A huge translucent helium research balloon being filled at dawn on a desert launch pad, crew in silhouette, the balloon slowly rising and towering over them. Photorealistic documentary, no logos.` | 1:15–1:20 |
| **T6** | `View from the stratosphere at 39 km: the thin blue line of the atmosphere curving over the Earth, black sky, the sun flaring on the horizon, a small pressurised capsule hanging in the foreground with its door closed, nobody visible. Very slow pull back. Photorealistic.` | 1:20–1:35 |
| **T7** | `Dark room full of people watching a live stream on phones and laptops, faces lit only by the screens, all leaning in at the same moment. Shot from behind, shallow depth of field, photorealistic, no readable screens.` | 1:28 |
| **T8** | `A stack of gold coins slowly toppling on a dark marble desk, coins rolling, slow motion, single hard light. Photorealistic macro.` | 1:38 |
| **T9** | `Wingsuit flyer skimming an alpine ridge, helmet camera point of view, extreme speed.` · `Cliff diver mid-dive above turquoise water, slow motion.` · `Skateboarder launching off a mega ramp at sunset.` | 2:04–2:15 |
| **T10** | `A wall of broadcast monitors in a dark media control room switching on one by one, each showing blurred action sports, an operator's silhouette in the foreground. Slow truck left. Photorealistic.` | 2:15–2:40 |
| **T11** | `Chequered flag waving in slow motion against stadium lights at night, cloth texture visible. Photorealistic.` | 2:46 |

## D. How it's assembled (my part)
- **Cut to the VO and a licensed track:** cuts land on the beat, with speed ramps on V4, T3 and T9, and real optical-flow slow-mo.
- **Graphics on real footage only, and only where a number is spoken:**
  - $5.1B appears on the boardroom TV in V1 (tracked to the screen);
  - 15¢ and $3.50 sit next to your real can (C3);
  - the altitude and the 8M+ counter go over T6 and T7;
  - the three playbook steps go on the monitors in T10 (tracked).
  Thin type, matched to the plate's grain and light.
- **One grade across every clip:** deep blacks, warm highlights, yellow and red accents.
- **Your real foley** from section A, plus ElevenLabs for anything missing.
