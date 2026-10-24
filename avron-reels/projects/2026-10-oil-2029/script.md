# शर्त (The Fine Print): final narration (as rendered)

Voice: Kokoro-82M `hm_omega` (Apache-2.0, local synthesis). Total runtime 67.9 s.
Generated from `narration.json` + `timeline.json`. Subtitles: `subtitles.srt` / `subtitles.vtt`.

| # | Timecode | Subtitle (Hinglish) | Spoken (TTS input) | Pause after | Emphasis |
|---|---|---|---|---|---|
| 1 | 0:00.70–0:06.18 | 27 मार्च 2026. एक महीने में crude — $70 से $122. | सत्ताईस मार्च, दो हज़ार छब्बीस। एक महीने में क्रूड — सत्तर से एक सौ बाईस | 0.45 s | 27, 2026., $70, $122. |
| 2 | 0:06.63–0:12.35 | सरकार के सामने दो रास्ते — Petrol-diesel महंगा करो… या नुकसान खुद उठाओ। | सरकार के सामने दो रास्ते — पेट्रोल-डीज़ल महंगा करो… या नुकसान खुद उठाओ। | 0.40 s | दो, महंगा, खुद |
| 3 | 0:12.75–0:17.36 | सरकार ने excise duty ₹10 घटाई — pump पर दाम वही। | सरकार ने एक्साइज़ ड्यूटी दस रुपये घटाई — पंप पर दाम वही। | 0.45 s | ₹10, वही। |
| 4 | 0:17.81–0:27.08 | लेकिन crude रुका नहीं। 22 October — Brent $113 पार। RBI ने rate बढ़ाया — February 2023 के बाद पहली बार। | लेकिन क्रूड रुका नहीं। बाईस अक्टूबर — ब्रेंट एक सौ तेरह पार। आर-बी-आई ने रेट बढ़ाया — फ़रवरी दो हज़ार तेईस के बाद पहली बार। | 0.40 s | $113, पहली, बार। |
| 5 | 0:27.48–0:33.96 | Brokerage estimate — oil companies को अब भी हर litre diesel पर ₹34 का घाटा। | ब्रोकरेज एस्टिमेट — ऑयल कंपनियों को अब भी हर लीटर डीज़ल पर चौंतीस रुपये का घाटा। | 0.50 s | ₹34, घाटा। |
| 6 | 0:34.46–0:43.09 | सरकार का वादा था — fiscal deficit 4.3 percent… और 2031 तक debt करीब 50 percent of GDP. | सरकार का वादा था — फ़िस्कल डेफ़िसिट चार पॉइंट तीन परसेंट… और दो हज़ार इकतीस तक डेट करीब पचास परसेंट ऑफ़ जी-डी-पी। | 0.45 s | वादा, 4.3, 2031, 50 |
| 7 | 0:43.54–0:48.62 | पर उस वादे में एक शर्त लिखी है — "बिना किसी बड़े external shock के।" | पर उस वादे में एक शर्त लिखी है — बिना किसी बड़े एक्सटर्नल शॉक के। | 0.80 s | शर्त, external, shock |
| 8 | 0:49.42–0:53.26 | March में सरकार ने खुद इसे कहा — "Global Oil Shock." | मार्च में सरकार ने खुद इसे कहा — ग्लोबल ऑयल शॉक। | 0.60 s | "Global, Oil, Shock." |
| 9 | 0:53.86–0:58.15 | और अगला Lok Sabha चुनाव… 2029 में due है। | और अगला लोक सभा चुनाव… ट्वेंटी ट्वेंटी-नाइन में ड्यू है। | 0.80 s | 2029 |
| 10 | 0:58.95–1:01.87 | Bill भरा जाएगा। Company, सरकार… या आप। | बिल भरा जाएगा। कंपनी, सरकार… या आप। | 0.55 s | आप। |
| 11 | 1:02.42–1:04.94 | AVRON. Numbers के पीछे की कहानी। | एवरॉन। नंबर्स के पीछे की कहानी। | 0.00 s |  |

## Delivery intent
- 1–2: urgent, close. 3: analytical. 4–5: building urgency without hysteria. 6: cooler, documentary.
- 7–9: slower (0.90–0.95 speed); the silences carry it. 10–11: calm conviction.

## Pronunciation decisions
- **2029** is spoken as "ट्वेंटी ट्वेंटी-नाइन": the ASR heard "उनतीस" as 2019, which is unacceptable on the reveal line.
- **4.3** is spoken as "चार पॉइंट तीन", the natural Hinglish news reading.
- **ख़ुद → खुद**: the synthetic voice softened the nuqta.
- **RBI** is spelled out (आर-बी-आई); **GDP** likewise (जी-डी-पी).

## To replace with a human or ElevenLabs voice
Record each numbered line as its own file named `public/shart/vo_beats/<id>.wav`, or one take, and run
`scripts/tts_kokoro.py` → `score_shart.py` → `mix_stems.py` → render. The timeline, captions and cues all re-derive from the audio.
