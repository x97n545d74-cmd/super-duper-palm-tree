"""Build projects/2026-10-thali/narration.json (Kokoro guide VO).
Token = display (Roman, on screen) | spoken (Devanagari, for TTS) | tone.
A token without '|' is spoken as written; numbers are spelled out in Hindi."""
import json, re

D = {  # roman -> devanagari for plain words
    "ek": "एक", "mahine": "महीने", "mein": "में", "mehengai": "महंगाई", "se": "से", "seedha": "सीधा", "pe": "पर",
    "pahunch": "पहुँच", "gayi.": "गई।", "aur": "और", "sabse": "सबसे", "bada": "बड़ा", "jhatka": "झटका", "aapki": "आपकी",
    "thali": "थाली", "hai.": "है।", "har": "हर", "shehri": "शहरी", "bazaar": "बाज़ार", "gaon": "गाँव", "daam": "दाम",
    "ikattha": "इकट्ठा", "karta": "करता", "usi": "उसी", "banta": "बनता", "hai": "है", "khaane": "खाने", "ki": "की",
    "thi,": "थी,", "pyaaz": "प्याज़", "saal": "साल", "mehenga": "महंगा", "hua.": "हुआ।", "aloo": "आलू", "tamatar": "टमाटर",
    "saste": "सस्ते", "hue.": "हुए।", "hai,": "है,", "shehar": "शहर", "ko": "को", "zyada": "ज़्यादा", "laga.": "लगा।",
    "ne": "ने", "badhakar": "बढ़ाकर", "kar": "कर", "diya.": "दिया।", "ke": "के", "liye": "लिए", "anuman": "अनुमान",
    "nahi.": "नहीं।", "ka": "का", "aapke": "आपके", "ghar": "घर", "tokri": "टोकरी", "naapta": "नापता", "aa": "आ", "bhar": "भर", "mehenga.": "महंगा।", "thode": "थोड़े", "saste.": "सस्ते।", "matlab": "मतलब", "mehengai.": "महंगाई।", "hua": "हुआ", "comment": "कमेंट", "asli": "असली", "yaani": "यानी", "aapka": "आपका", "maan": "मान", "lo": "लो", "mila,": "मिला,",
    "toh": "तो", "kamai": "कमाई", "sirf": "सिर्फ़", "kya": "क्या", "hua?": "हुआ?", "karo.": "करो।",
}

BEATS = [  # word | display{spoken|tone} ; spoken may contain spaces
    ("b1_hook", 1.3, 0.1, "Ek mahine mein mehengai 4.83%{चार पॉइंट आठ तीन|gold} se seedha 5.54%{पाँच पॉइंट पाँच चार परसेंट|red} pe pahunch gayi."),
    ("b1_thali", 1.25, 0.25, "Aur sabse bada jhatka aapki thali{|gold} pe hai."),
    ("b2_cpi", 1.3, 0.2, "MoSPI{मॉस्पी} ka CPI{सी पी आई|gold} aapke ghar ki tokri ka daam naapta hai."),
    ("b3_food", 1.3, 0.1, "Khaane ki mehengai 5.97%{पाँच पॉइंट नौ सात} se 7.74%{सात पॉइंट सात चार परसेंट|red} pe aa gayi."),
    ("b4_veg", 1.3, 0.25, "Pyaaz saal bhar mein 108%{एक सौ आठ परसेंट|red} mehenga. Aloo{आलू} aur tamatar thode saste."),
    ("b5_split", 1.3, 0.25, "Gaon mein mehengai 6.08%{छह पॉइंट शून्य आठ|red} shehar mein 4.88%.{चार पॉइंट आठ आठ।|gold}"),
    ("b6_rbi", 1.3, 0.1, "RBI{आर बी आई} ne repo{रेपो} rate{रेट} 5.25{सवा पाँच} se badhakar 5.50%{साढ़े पाँच परसेंट|red} kar diya."),
    ("b6_proj", 1.3, 0.25, "FY27{एफ़ वाई सत्ताईस} ka anuman 5.2%{पाँच पॉइंट दो परसेंट|gold} hai. Anuman hai, guarantee{गारंटी} nahi."),
    ("b7_real", 1.28, 0.2, "Asli return{रिटर्न} matlab return{रिटर्न} minus{माइनस} mehengai. 7%{सात परसेंट} ki FD{एफ़ डी} pe asli kamai sirf 1.46%.{एक पॉइंट चार छह परसेंट।|gold}"),
    ("b8_cta", 1.2, 0.0, "Aapki thali{|gold} mein sabse mehenga kya hua? Comment{कमेंट} karo."),
]

beats = []
for bid, speed, pause, line in BEATS:
    toks = []
    for disp, spoken, tone in re.findall(r"([^\s{]+)(?:\{([^|}]*)(?:\|(\w+))?\})?", line):
        speak = spoken or D.get(disp.lower())
        if not speak:
            raise SystemExit(f"no Devanagari for {disp!r} in {bid}")
        tok = [speak, disp, speak]
        if tone:
            tok.append(tone)
        toks.append(tok)
    beats.append({"id": bid, "speed": speed, "pauseAfter": pause, "tokens": toks})

json.dump({"voice": "hf_alpha", "lang": "hi", "leadIn": 0.25, "tail": 2.6,
           "_note": "GUIDE VO (Kokoro). Swap for the user's Tia Mirza read; keep beat ids.", "beats": beats},
          open("projects/2026-10-thali/narration.json", "w"), ensure_ascii=False, indent=1)
print(sum(len(b["tokens"]) for b in beats), "tokens")
