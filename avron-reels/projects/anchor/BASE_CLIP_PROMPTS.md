# AVRON anchor: base clip library (generate once)

Made in Higgsfield, **Seedance 2.5 → References**. These clips are her "footage bank". Each reel lip-syncs one or more of them to that reel's voiceover (Sync Lipsync 3 or the sync.so API), so they are generated **once**.

## Settings for every clip
| Setting | Value |
|---|---|
| Image reference | Her front photo (`public/anchor2/src/photo3.jpg`, same face every time) |
| Audio reference | None |
| Duration | 30s (or the max offered) |
| Aspect ratio | 9:16 |
| Quality / bitrate | 1080p / High |
| Sound | Off |

## The base prompt (paste at the start of every clip)
```
@image is a professional Indian news anchor presenting a finance news segment to camera.
Same face, same long dark hair, same gold jhumka earrings, black tailored blazer over an ivory top.
Plain mid-grey seamless studio background, soft even key light from the front, gentle rim light.
Static locked-off camera, 9:16, she is framed from the waist up and centred, with clear space above her head.
She speaks continuously and naturally throughout, mouth moving as if talking, natural blinks.
Photorealistic, broadcast quality, no text, no captions, no logos, no music.
```

## Add one of these endings per clip (10 clips)
| # | Ending | Used for |
|---|---|---|
| 1 | `Calm, confident delivery, small head nods, hands resting together at waist level.` | Default talking shot |
| 2 | `Warm, friendly delivery with a slight smile, occasional open-palm gesture with the right hand.` | Intros, hooks |
| 3 | `Serious tone, slight frown on key points, measured hand gestures emphasising numbers.` | Bad news, losses |
| 4 | `Leans slightly toward camera as if sharing something important, then settles back.` | Big reveal lines |
| 5 | `Turns her head slightly to her left as if looking at a screen beside her, then back to camera.` | Before a graphic appears on the left |
| 6 | `Turns her head slightly to her right as if looking at a screen beside her, then back to camera.` | Before a graphic appears on the right |
| 7 | `Glances down at notes in her hands once, then back to camera and continues.` | Reading figures, sources |
| 8 | `Explains with both hands, counting points on her fingers.` | Lists, "three reasons" lines |
| 9 | `Asks a question to the audience with a curious expression and a small head tilt.` | Questions, comment prompts |
| 10 | `Ends with a confident smile and a small nod, as if signing off.` | CTA / outro |

## Check each clip before saving
- Same face as the reference all the way through (eyes, nose, earrings, hair parting)
- Hands look normal (five fingers, no melting)
- No text or logos in the background
- Background stays plain grey and the camera does not move
- Mouth is moving naturally (Sync needs a talking base to re-time the lips)

Name the files `base_01.mp4` … `base_10.mp4` and upload them here.
