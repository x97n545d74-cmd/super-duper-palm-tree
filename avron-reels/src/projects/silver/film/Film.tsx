import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { clamp01, ease, lerp, useTime } from "../../../engine/anim";
import { Grain, SerifFont } from "../../swiggy/look";
import { Odometer } from "../../swiggy/film/kit";
import { cut, Person, Phone } from "../Demos";
import { Coin, keys, SceneDominoes, SceneHook, SceneRubberBand, SceneSplit, SceneTime, SceneVault } from "../Scenes";
import {
  BgLedger, BgPaper, BgPhone, BgSlate, Big, Bubble, Card, Foot, hand, Ink, InkText, INK, Kicker, mono, pr, RED, Rule, sans, serif, Shot, Stamp, Tag, BROWN, GOLD,
} from "./kit";
import { CARDS, cue, DURATION, en, st } from "./timeline";

/*
 * "Chandi kam pad rahi hai, phir girti kyun gayi?" · the silver film, 1920×1080, Hinglish.
 * Look (user approved 2026-10-26): ledger (bahi-khata) for data, phone for Rohan, paper for Gupta ji, slate for
 * the hook, the crash and the close. Shots read every time from the timeline, so they land on the user's VO.
 */
type Item = { a: number; z: number; scene?: boolean; render: (t: number) => React.ReactNode };
const items: Item[] = [];
const add = (a: number, render: (t: number) => React.ReactNode, scene = false) => items.push({ a, z: 0, render, scene });
const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ---------------------------------------------------------------- HOOK */
// the coin drops in silence, the cut lands on "kami", "55% crash" on "aadhe se bhi zyada gir"
const half = cue("hook_0", "half", 0.6);
add(0, () => (
  <SceneTime.Provider value={keys([[0, 0], [st("hook_0"), 1.0], [Math.max(st("hook_0") + 1.5, half - 1.4), 2.2], [half, 3.4], [en("hook_0"), 7]])}><SceneHook /></SceneTime.Provider>
), true);

add(st("hook_1"), (t) => {
  const a = st("hook_1"), tom = cue("hook_1", "tomato", 0.65);
  return (<>
    <BgLedger /><Kicker text="School ka ek rule" />
    <InkText t={t} at={a + 0.3} x={200} y={260} size={120}>Cheez kam</InkText>
    <InkText t={t} at={a + 1.0} x={200} y={420} size={120} color={RED}>Daam zyada</InkText>
    <Rule t={t} at={a + 1.8} x={200} y={590} w={760} />
    <Tag t={t} at={tom - 0.2} x={1080} y={300} rot={3} bg="#D2453D" color="#FBF8F1">2023 · Tamatar ₹100/kg</Tag>
  </>);
});

add(st("hook_2"), (t) => {
  const a = st("hook_2"), six = cue("hook_2", "six", 0.75);
  const years = [2021, 2022, 2023, 2024, 2025, 2026];
  return (<>
    <BgLedger /><Kicker text="Silver Institute · World Silver Survey 2026" />
    <InkText t={t} at={a + 0.2} x={200} y={200} size={84}>Har saal · demand {">"} supply</InkText>
    {years.map((y, i) => {
      const at = a + 1.0 + i * Math.max(0.25, (six - a - 1.3) / 6);
      return (
        <div key={y} style={{ position: "absolute", left: 200 + i * 210, top: 420, width: 180 }}>
          <Ink t={t} at={at} dur={0.4}><div style={{ ...hand, fontSize: 56, fontWeight: 700 }}>{y}</div></Ink>
          <div style={{ marginTop: 26, height: 150, border: `3px solid ${RED}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: clamp01((t - at - 0.2) / 0.3), transform: `scale(${lerp(1.3, 1, pr(t, at + 0.2, 0.25, ease.outCubic))})` }}>
            <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: RED }}>kami</span>
          </div>
          {y === 2026 && <div style={{ fontFamily: mono, fontSize: 20, color: BROWN, marginTop: 10, opacity: clamp01((t - at) / 0.4) }}>anuman</div>}
        </div>
      );
    })}
    <InkText t={t} at={six} x={200} y={720} size={76} color={RED}>Lagaataar chhatha saal</InkText>
    <Foot text="Silver Institute / Metals Focus, World Silver Survey 2026 (15 Apr 2026) · 2026 = forecast" />
  </>);
});

add(st("hook_3"), (t) => {
  const a = st("hook_3");
  return (<>
    <BgSlate />
    <Big t={t} at={a + 0.2} x={160} y={330} size={130}>Chandi kam pad rahi hai</Big>
    <Big t={t} at={a + 0.8} x={160} y={480} size={130} color={RED}>Phir girti kyun gayi</Big>
    <div style={{ position: "absolute", left: 160, top: 690, height: 3, width: 720 * pr(t, a + 1.6, 0.8, ease.inOutCubic), background: "#C9CED6" }} />
    <Big t={t} at={a + 2.0} x={160} y={720} size={34} weight={500} color="#8A919C">Kisne gawaaya · kisne nahi</Big>
    <div style={{ position: "absolute", right: 160, bottom: 120, textAlign: "right", opacity: clamp01((t - a - 2.4) / 0.5) }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 56, letterSpacing: "0.32em", color: "#F3F1EC" }}>AVRON</div>
    </div>
  </>);
});

/* ---------------------------------------------------------------- TEEN SHAK */
add(CARDS.shak, (t) => <Card t={t} a={CARDS.shak} n="01" title="Teen shak" sub="Teen bahaane · teeno ki jaanch" />);
const MYTHS: { n: string; myth: string; why: string; a: number; strike: number }[] = [
  { n: "01", myth: "Kami nakli hai", why: "Metals Focus ginta hai · khaan aur factory, ek-ek karke", a: st("shak_0"), strike: cue("shak_0", "asli", 0.85) },
  { n: "02", myth: "Sab Fed ka khel hai", why: "Warsh ki khabar · dollar upar · par chandi ko 3 guna maar", a: st("shak_1"), strike: en("shak_2") - 1.4 },
  { n: "03", myth: "Ab koi chandi nahi chahta", why: "Coins aur bars · 2026 mein +18% (anuman)", a: st("shak_3"), strike: en("shak_3") - 1.0 },
];
add(st("shak_0"), (t) => {
  const g = st("shak_2"), gold = cue("shak_2", "gold", 0.2), silver = cue("shak_2", "silver", 0.4);
  const panel = clamp01((t - g + 0.2) / 0.5) * (1 - clamp01((t - st("shak_3") + 0.3) / 0.4));
  return (<>
    <SerifFont /><BgLedger /><Kicker text="Teen shak" />
    {MYTHS.map((m, i) => {
      const inn = ease.outExpo(clamp01((t - m.a + 0.4) / 0.9));
      const sk = ease.inOutCubic(clamp01((t - m.strike) / 0.55));
      const back = ease.inOutCubic(clamp01((t - m.strike - 0.6) / 0.7));
      const active = t >= m.a - 0.4;
      if (!active) return null;
      return (
        <div key={m.n} style={{ position: "absolute", left: 200 + i * 520, top: 190, width: 480, height: 400, perspective: 1400, opacity: lerp(1, 0.45, back), transform: `translateX(${(1 - inn) * 1400}px)` }}>
          <div style={{ position: "absolute", inset: 0, background: "#FBF8F1", borderRadius: 6, padding: "34px 34px", transformOrigin: "50% 100%", transform: `rotateX(${back * 20}deg)`, ...cut(14) }}>
            <div style={{ fontFamily: mono, fontSize: 22, color: BROWN }}>SHAK {m.n}</div>
            <div style={{ ...hand, fontWeight: 700, fontSize: 58, lineHeight: 1.15, marginTop: 28 }}>
              <span style={{ backgroundImage: `linear-gradient(${RED}, ${RED})`, backgroundRepeat: "no-repeat", backgroundSize: `${sk * 100}% 9px`, backgroundPosition: "0 60%",
                WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone" }}>{m.myth}</span>
            </div>
            <div style={{ fontFamily: sans, fontSize: 26, color: "#5B5247", marginTop: 26, lineHeight: 1.35, opacity: clamp01((t - m.a - 1.2) / 0.5) }}>{m.why}</div>
          </div>
        </div>
      );
    })}
    {/* same day, same news: gold −11%, silver −31% */}
    {panel > 0 && (
      <div style={{ position: "absolute", left: 200, top: 660, width: 1400, opacity: panel }}>
        {[{ k: "Sona", v: 11, at: gold, c: GOLD }, { k: "Chandi", v: 31, at: silver, c: RED }].map((r, i) => (
          <div key={r.k} style={{ display: "flex", alignItems: "center", marginBottom: 26 }}>
            <div style={{ ...hand, fontWeight: 700, fontSize: 52, width: 240 }}>{r.k}</div>
            <div style={{ height: 56, width: r.v * 30 * pr(t, r.at, 0.9), background: r.c, ...cut(6) }} />
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 56, color: r.c, marginLeft: 24, opacity: clamp01((t - r.at - 0.4) / 0.3) }}>−{r.v}%</div>
            {i === 1 && <div style={{ ...hand, fontSize: 38, marginLeft: 40, opacity: clamp01((t - r.at - 1.2) / 0.4) }}>teen guna maar</div>}
          </div>
        ))}
        <div style={{ fontFamily: mono, fontSize: 20, color: BROWN }}>30 JAN 2026 · COMEX SETTLEMENT</div>
      </div>
    )}
    {t > st("shak_0") + 1.5 && t < st("shak_1") && (
      <Ink t={t} at={st("shak_0") + 1.8} style={{ position: "absolute", left: 200, top: 700 }}>
        <div style={{ ...hand, fontSize: 48 }}>Kami · 2025: 4 crore oz+ · 2026: 4.6 crore oz <span style={{ fontSize: 32, color: BROWN }}>(anuman)</span></div>
      </Ink>
    )}
    <Foot text="Silver Institute / Metals Focus · COMEX settlement 30 Jan 2026 · coins & bars forecast, World Silver Survey 2026" />
  </>);
});
add(st("shak_4"), (t) => {
  const a = st("shak_4");
  return (<>
    <BgLedger /><Kicker text="Faisla" />
    <InkText t={t} at={a + 0.2} x={200} y={300} size={110}>Kami asli</InkText>
    <InkText t={t} at={a + 1.0} x={200} y={450} size={110} color={RED}>Crash bhi asli</InkText>
    <Rule t={t} at={a + 1.9} x={200} y={620} w={820} double />
    <InkText t={t} at={en("shak_4") - 2.2} x={200} y={700} size={52} bold={false}>Ab ek parivaar ki Diwali</InkText>
  </>);
});

/* ---------------------------------------------------------------- GUPTA JI AUR ROHAN */
add(CARDS.gupta, (t) => <Card t={t} a={CARDS.gupta} n="02" title="Gupta ji aur Rohan" sub="Ek ke paas chandi · ek ke paas app" />);
add(st("gupta_0"), (t) => {
  const a = st("gupta_0"), dh = cue("gupta_0", "dhanteras", 0.3), coin = cue("gupta_0", "coin", 0.5), app = cue("gupta_0", "app", 0.85);
  const door = ease.inOutCubic(clamp01((t - coin + 0.6) / 1.4));
  return (<>
    <BgPaper /><Kicker text="Illustration · kirdaar kaalpanik" />
    <div style={{ position: "absolute", left: 1130, top: 360 }}><Person kind="gupta" t={t} at={a + 0.2} /></div>
    <div style={{ position: "absolute", left: 640, top: 300, width: 380, height: 600, background: "#7E858C", borderRadius: 10, ...cut(16) }}>
      <div style={{ position: "absolute", left: 90, top: 230, width: 200, height: 160, background: "#5E646B", borderRadius: 8, display: "flex", flexWrap: "wrap", alignContent: "flex-end", padding: 14, gap: 8 }}>
        {Array.from({ length: 9 }).map((_, i) => {
          const k = ease.outCubic(clamp01((t - coin - 0.4 - i * 0.12) / 0.5));
          return <div key={i} style={{ width: 44, height: 44, borderRadius: 44, background: "radial-gradient(circle at 35% 30%, #FAFBFC, #B4BAC2 60%, #80868F)", border: "2px solid #9AA0A8", transform: `translateY(${(1 - k) * -120}px)`, opacity: k }} />;
        })}
      </div>
      <div style={{ position: "absolute", inset: 0, perspective: 1500 }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#8C939A,#767D84)", borderRadius: 10, transformOrigin: "0% 50%", transform: `rotateY(${-door * 105}deg)`, boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.12)" }}>
          <div style={{ position: "absolute", right: 30, top: 280, width: 14, height: 60, borderRadius: 7, background: "#C9CDD2" }} />
        </div>
      </div>
    </div>
    <Tag t={t} at={a + 0.4} x={200} y={250} rot={-2}>Gupta ji · 63 · Indore</Tag>
    <Tag t={t} at={a + 1.6} x={200} y={370} rot={1.5} size={34}>Railway se retire</Tag>
    <Tag t={t} at={dh} x={200} y={470} rot={-1} size={34} bg="#2A2520" color="#FBF8F1">Har Dhanteras · 10 g ka sikka</Tag>
    <Tag t={t} at={app} x={200} y={790} rot={2} size={30}>Daam app pe? Kabhi nahi</Tag>
  </>);
});
add(st("gupta_1"), (t) => {
  const a = st("gupta_1"), tg = cue("gupta_1", "telegram", 0.45), mcx = cue("gupta_1", "mcx", 0.85);
  return (<>
    <BgPhone /><Kicker text="Illustration · kirdaar kaalpanik" dark left={160} />
    <div style={{ position: "absolute", left: 220, top: 420 }}><Person kind="rohan" t={t} at={a + 0.2} /></div>
    <Big t={t} at={a + 0.4} x={560} y={300} size={84}>Rohan · 27 · Pune</Big>
    <Big t={t} at={a + 1.6} x={560} y={410} size={40} weight={500} color="#9AA0AA">Trading videos · 2x speed</Big>
    <Big t={t} at={mcx} x={560} y={480} size={40} weight={600} color="#3FBF7F">MCX · silver futures</Big>
    <Phone x={1300}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: "#F3F1EC" }}>Chandi Squad</div>
      <div style={{ fontFamily: sans, fontSize: 18, color: "#7C828C", marginBottom: 24 }}>Telegram group · 214 members</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Bubble t={t} at={tg} who="Amit" text="silver aaj phir upar" />
        <Bubble t={t} at={tg + 0.6} who="Rohan" text="maine 2 lot aur liye" mine />
        <Bubble t={t} at={tg + 1.2} who="Neha" text="target ₹4 lakh/kg" />
        <Bubble t={t} at={mcx} who="Rohan" text="position: silver futures · MCX" mine />
      </div>
    </Phone>
    <Foot text="Group, names and chat are illustrative" dark left={160} />
  </>);
});
add(st("gupta_2"), (t) => {
  const a = st("gupta_2"), mg = cue("gupta_2", "margin", 0.55), ud = cue("gupta_2", "udhaar", 0.85);
  const W = 1300, own = pr(t, mg, 0.8), loan = pr(t, ud - 0.3, 1.0);
  return (<>
    <BgLedger /><Kicker text="Futures aur margin" />
    <InkText t={t} at={a + 0.3} x={200} y={200} size={84}>Futures · ek vaada</InkText>
    <InkText t={t} at={a + 1.6} x={200} y={320} size={48} bold={false}>Aage, ek tay daam pe khareedna ya bechna</InkText>
    <div style={{ position: "absolute", left: 200, top: 520, display: "flex", height: 150 }}>
      <div style={{ width: W * 0.1 * own, background: "#3C4A66", ...cut(8), display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} />
      <div style={{ width: W * 0.9 * loan, background: "repeating-linear-gradient(135deg, #C9C1AE 0 14px, #BDB49F 14px 28px)", marginLeft: 6, ...cut(8) }} />
    </div>
    <div style={{ position: "absolute", left: 200, top: 690, ...hand, fontSize: 44, fontWeight: 700, opacity: clamp01((t - mg - 0.3) / 0.4) }}>₹1 lakh · apna</div>
    <div style={{ position: "absolute", left: 200, top: 745, fontFamily: sans, fontSize: 28, color: "#5B5247", opacity: clamp01((t - mg - 0.6) / 0.4) }}>Margin · jaise kiraye ka security deposit</div>
    <div style={{ position: "absolute", left: 720, top: 690, ...hand, fontSize: 44, fontWeight: 700, color: "#6B6253", opacity: clamp01((t - ud) / 0.4) }}>₹9 lakh · udhaar</div>
    <InkText t={t} at={ud + 0.8} x={1160} y={690} size={52} color={RED}>= ₹10 lakh ki chandi</InkText>
    <Foot text="Udaaharan · asli margin exchange aur broker tay karte hain" />
  </>);
});
add(st("gupta_3"), (t) => {
  const g = st("gupta_3"), sev = cue("gupta_3", "seventy", 0.7), r = st("gupta_4"), two = cue("gupta_4", "two", 0.75);
  const row = (y: number, name: string, a0: number, from: string, to: string, at: number, col: string, note: string, noteAt: number) => (
    <div style={{ position: "absolute", left: 200, top: y, width: 1500, opacity: t > r && name.startsWith("Gupta") ? 0.55 : 1 }}>
      <Ink t={t} at={a0} style={{ position: "absolute", left: 0 }}><div style={{ ...hand, fontSize: 62 }}>{name}</div></Ink>
      <Ink t={t} at={a0 + 0.6} style={{ position: "absolute", left: 560 }}><div style={{ ...hand, fontSize: 62 }}>{from}</div></Ink>
      <Ink t={t} at={at} dur={0.6} style={{ position: "absolute", left: 940 }}><div style={{ ...hand, fontSize: 62, fontWeight: 700, color: col }}>{to}</div></Ink>
      <Ink t={t} at={noteAt} style={{ position: "absolute", left: 940, top: 86 }}><div style={{ fontFamily: sans, fontSize: 28, color: "#5B5247" }}>{note}</div></Ink>
    </div>
  );
  return (<>
    <BgLedger /><Kicker text="Chandi 30% giri to · udaaharan" />
    <div style={{ position: "absolute", left: 200, top: 210, width: 1500, fontFamily: mono, fontSize: 22, color: BROWN, display: "flex" }}>
      <span style={{ width: 560 }}>NAAM</span><span style={{ width: 380 }}>LAGAYA</span><span>AB</span>
    </div>
    {row(280, "Gupta ji · sikke", g + 0.3, rs(100000), rs(70000), sev, INK, "Gupta ji so gaye", sev + 1.2)}
    {t > r - 0.3 && row(520, "Rohan · margin pe", r + 0.2, rs(100000), "−₹2,00,000", two, RED, "₹10 lakh ki position · ₹3 lakh ka nuksaan", two + 0.6)}
    {t > r && <Rule t={t} at={two + 1.4} x={1140} y={600} w={360} />}
    <Foot text="Udaaharan · agar broker ne beech mein position nahi kaati · kirdaar kaalpanik" />
  </>);
});
// the margin call: split scene, crash lands on "margin call"
add(st("gupta_5") - 0.2, () => {
  const a = st("gupta_5") - 0.2, call = cue("gupta_5", "call", 0.15);
  return <SceneTime.Provider value={keys([[0, 3.6], [Math.max(0.5, call - a - 0.3), 5.6], [en("gupta_5") - a + 0.6, 10]])}><SceneSplit /></SceneTime.Provider>;
}, true);

/* ---------------------------------------------------------------- 30 JANUARY */
add(CARDS.jan, (t) => <Card t={t} a={CARDS.jan} n="03" title="30 January" sub="Chandi ka sabse bura din, 1980 ke baad" />);
add(st("jan_0"), (t) => {
  const a = st("jan_0"), rec = cue("jan_0", "record", 0.45), usd = cue("jan_0", "dollar", 0.75);
  const v = lerp(2.4, 3.598, pr(t, a + 0.5, Math.max(1, rec - a - 0.5), ease.inOutCubic));
  return (<>
    <BgPhone />
    <Big t={t} at={a + 0.3} x={160} y={260} size={84}>Rohan · genius</Big>
    <Big t={t} at={rec} x={160} y={380} size={60} color="#3FBF7F">27 Jan · MCX ₹3.59 lakh/kg</Big>
    <Big t={t} at={usd} x={160} y={470} size={60} color="#3FBF7F">29 Jan · $121 ke upar</Big>
    <Big t={t} at={rec + 0.3} x={160} y={560} size={30} weight={500} color="#7C828C">Record · dono jagah</Big>
    <Phone x={1300}>
      <div style={{ fontFamily: sans, fontSize: 20, color: "#9AA0AA" }}>MCX · SILVER · ₹/KG</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 60, color: "#3FBF7F", fontVariantNumeric: "tabular-nums" }}>₹{(v * 100000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
      <div style={{ fontFamily: sans, fontSize: 22, color: "#3FBF7F", marginBottom: 30 }}>naya high</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Bubble t={t} at={a + 1.2} who="Chandi Squad" text="screenshot: +₹38,000 aaj" />
        <Bubble t={t} at={a + 2.4} who="Chandi Squad" text="screenshot: ₹3.5 lakh cross" />
        <Bubble t={t} at={rec + 0.8} who="Rohan" text="₹4 lakh pakka" mine />
      </div>
    </Phone>
    <Foot text="MCX record ₹3,59,800/kg on 27 Jan 2026 (Business Today) · $121.67 on 29 Jan (APMEX) · chat illustrative" dark left={160} />
  </>);
});
add(st("jan_1"), (t) => {
  const a = st("jan_1"), tw = cue("jan_1", "twice", 0.45);
  return (<>
    <BgLedger /><Kicker text="CME · December 2025" />
    <InkText t={t} at={a + 0.3} x={200} y={220} size={84}>Duniya ka sabse bada silver futures bazaar</InkText>
    <Stamp t={t} at={tw - 0.2} x={240} y={460} text="MARGIN ↑" rot={-7} />
    <Stamp t={t} at={tw + 0.5} x={700} y={500} text="MARGIN ↑" rot={5} />
    <InkText t={t} at={tw + 1.2} x={200} y={700} size={60} color={RED}>Ek hafte mein do baar</InkText>
    <InkText t={t} at={tw + 2.4} x={200} y={800} size={44} bold={false}>Wahi position · zyada deposit</InkText>
    <Foot text="CME margin increases, late Dec 2025 (FinancialContent) · check CME notices" />
  </>);
});
// the crash and the dominoes: the break lands on "31 percent", the chain falls through jan_3
add(st("jan_2") - 0.2, () => {
  const a = st("jan_2") - 0.2, drop = cue("jan_2", "drop", 0.6), b3 = st("jan_3");
  return (
    <SceneTime.Provider value={keys([[0, 0.4], [Math.max(1, drop - a - 0.6), 2.9], [drop - a + 0.4, 3.12], [Math.max(drop - a + 0.6, b3 - a), 3.2], [b3 - a + 2.4, 4.6], [en("jan_3") - a + 0.6, 9]])}>
      <SceneDominoes />
    </SceneTime.Provider>
  );
}, true);
add(st("jan_4"), (t) => {
  const a = st("jan_4"), th = cue("jan_4", "thursday", 0.85);
  return (<>
    <BgLedger /><Kicker text="Archive · redrawn by AVRON" />
    <div style={{ position: "absolute", left: 260, top: 180, width: 1180, height: 760, background: "#EEE6D2", ...cut(14), padding: "40px 60px", transform: `rotate(-1deg) translateY(${(1 - pr(t, a, 0.9, ease.outCubic)) * 80}px)` }}>
      <div style={{ fontFamily: serif, fontWeight: 800, fontSize: 40, letterSpacing: "0.2em", color: "#2A2520", textAlign: "center", borderBottom: "3px double #2A2520", paddingBottom: 14 }}>THE MARKET DAILY</div>
      <div style={{ fontFamily: mono, fontSize: 20, color: BROWN, textAlign: "center", marginTop: 10 }}>1980</div>
      <Ink t={t} at={a + 1.0} dur={1.2}><div style={{ fontFamily: serif, fontWeight: 800, fontSize: 120, color: "#2A2520", textAlign: "center", marginTop: 30 }}>Hunt bhai</div></Ink>
      <Ink t={t} at={a + 2.6} dur={1.2}><div style={{ fontFamily: serif, fontSize: 46, color: "#2A2520", textAlign: "center" }}>udhaar se itni chandi · daam aasmaan pe</div></Ink>
      <Ink t={t} at={th - 0.8} dur={1.0}><div style={{ fontFamily: serif, fontWeight: 800, fontSize: 96, color: RED, textAlign: "center", marginTop: 40 }}>Silver Thursday</div></Ink>
      <Ink t={t} at={th} dur={0.8}><div style={{ fontFamily: mono, fontSize: 30, color: "#2A2520", textAlign: "center", marginTop: 10 }}>27 MARCH 1980</div></Ink>
    </div>
    <Stamp t={t} at={th - 1.6} x={1320} y={260} text="RULES BADLE" rot={10} size={36} />
  </>);
});
add(st("jan_5"), (t) => {
  const a = st("jan_5"), d = en("jan_5") - a;
  return (<>
    <BgLedger /><Kicker text="Tab aur ab" />
    <InkText t={t} at={a + 0.2} x={200} y={260} size={90}>1980 · Hunt bhai</InkText>
    <InkText t={t} at={a + d * 0.3} x={200} y={420} size={90}>2026 · Rohan jaise traders</InkText>
    <Rule t={t} at={a + d * 0.6} x={200} y={580} w={1100} />
    <InkText t={t} at={a + d * 0.65} x={200} y={630} size={90} color={RED}>Dono baar · udhaar</InkText>
  </>);
});

/* ---------------------------------------------------------------- ETF */
add(CARDS.etf, (t) => <Card t={t} a={CARDS.etf} n="04" title="India ka apna trap" sub="Silver ETF · premium aur discount" />);
add(st("etf_0"), (t) => {
  const a = st("etf_0"), d = en("etf_0") - a;
  return (<>
    <BgLedger /><Kicker text="Silver ETF" />
    <div style={{ position: "absolute", left: 220, top: 330, width: 420, height: 260, background: "#3C4A66", ...cut(12), display: "flex", alignItems: "center", justifyContent: "center",
      transform: `translateY(${(1 - pr(t, a + 0.4, 0.8, ease.outCubic)) * -200}px)`, opacity: clamp01((t - a - 0.4) / 0.3) }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: "#F3F1EC" }}>1 ETF unit</div>
    </div>
    <div style={{ position: "absolute", left: 660, top: 455, height: 4, width: 300 * pr(t, a + d * 0.35, 0.7, ease.inOutCubic), background: INK }} />
    <div style={{ position: "absolute", left: 980, top: 360, width: 460, height: 200, borderRadius: 10, background: "linear-gradient(180deg,#F4F6F8,#A9B0B8)", ...cut(14),
      display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - pr(t, a + d * 0.4, 0.8, ease.outCubic)) * -200}px)`, opacity: clamp01((t - a - d * 0.4) / 0.3) }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 48, color: "#5A6069" }}>asli chandi</div>
    </div>
    <InkText t={t} at={a + d * 0.7} x={220} y={700} size={72}>NAV = us chandi ka asli mol</InkText>
  </>);
});
add(st("etf_1") - 0.3, (t) => {
  const a = st("etf_1") - 0.3, cr = cue("etf_1", "crore", 0.35), b2 = st("etf_2"), below = cue("etf_2", "below", 0.4);
  return (<>
    <SceneTime.Provider value={keys([[a, 0.6], [cr + 0.5, 1.2], [b2 - 0.5, 4.3], [below - 0.2, 4.55], [en("etf_3") + 0.6, 8]])}><SceneRubberBand /></SceneTime.Provider>
    <div style={{ position: "absolute", left: 1150, top: 640, background: "#FBF8F1", padding: "18px 28px", ...cut(10), opacity: clamp01((t - cr + 0.3) / 0.4) * (1 - clamp01((t - b2) / 0.5)) }}>
      <div style={{ fontFamily: mono, fontSize: 20, color: BROWN }}>JAN 2026 · SILVER ETF INFLOWS · AMFI</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: "#2A2520" }}><Odometer t={t} at={cr} text="₹9,463 crore" dur={1.2} /></div>
    </div>
    <InkText t={t} at={st("etf_3") + 0.3} x={1400} y={470} size={46} color={RED}>Udhaar nahi · bheed</InkText>
  </>);
});

/* ---------------------------------------------------------------- KAMI AUR BHANDAAR */
add(CARDS.pile, (t) => <Card t={t} a={CARDS.pile} n="05" title="Kami aur bhandaar" sub="Har saal ka hisaab · pehle se jama" />);
add(st("pile_0"), (t) => {
  const a = st("pile_0"), d = en("pile_0") - a;
  return (<>
    <BgPhone />
    <Phone x={1300}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: "#F3F1EC" }}>Chandi Squad</div>
      <div style={{ fontFamily: sans, fontSize: 18, color: "#7C828C", marginBottom: 24 }}>last message · 3 din pehle</div>
      <Bubble t={t} at={a} who="Rohan" text="..." mine />
    </Phone>
    <Big t={t} at={a + d * 0.35} x={160} y={340} size={88}>Forced selling khatam</Big>
    <Big t={t} at={a + d * 0.55} x={160} y={450} size={88} color={RED}>Daam wapas kyun nahi</Big>
    <Big t={t} at={a + d * 0.8} x={160} y={580} size={40} weight={500} color="#9AA0AA">Kami to ab bhi thi</Big>
  </>);
});
add(st("pile_1"), (t) => {
  const a = st("pile_1"), d = en("pile_1") - a;
  return (<>
    <BgLedger /><Kicker text="Do alag hisaab" />
    <InkText t={t} at={a + 0.2} x={200} y={280} size={96}>Kami</InkText>
    <InkText t={t} at={a + 0.9} x={760} y={300} size={60} bold={false}>har saal ka hisaab</InkText>
    <InkText t={t} at={a + d * 0.55} x={200} y={480} size={96} color={RED}>Bhandaar</InkText>
    <InkText t={t} at={a + d * 0.6} x={760} y={500} size={60} bold={false}>pehle se kitna jama hai</InkText>
  </>);
});
add(st("pile_2"), (t) => {
  const a = st("pile_2"), fd = cue("pile_2", "fd", 0.6), d = en("pile_2") - a;
  const line = (y: number, k: string, v: string, at: number, col = INK) => (
    <div key={k} style={{ position: "absolute", left: 200, top: y, width: 1100 }}>
      <Ink t={t} at={at} style={{ position: "absolute", left: 0 }}><div style={{ ...hand, fontSize: 58 }}>{k}</div></Ink>
      <Ink t={t} at={at + 0.4} style={{ position: "absolute", left: 620 }}><div style={{ ...hand, fontSize: 58, fontWeight: 700, color: col }}>{v}</div></Ink>
    </div>
  );
  return (<>
    <BgLedger /><Kicker text="Ghar ka hisaab · udaaharan" />
    {line(200, "Salary", rs(40000), a + d * 0.12)}
    {line(290, "Kharcha", rs(41000), a + d * 0.2)}
    <Rule t={t} at={a + d * 0.28} x={200} y={390} w={1000} color={INK} />
    {line(410, "Har mahine kami", "−₹1,000", a + d * 0.3, RED)}
    {line(560, "Bank mein FD", rs(300000), fd - 0.2)}
    <InkText t={t} at={fd + 1.6} x={200} y={700} size={56} color={RED}>₹3 lakh ÷ ₹1,000 = 300 mahine</InkText>
    <InkText t={t} at={en("pile_2") - 2.2} x={200} y={800} size={46} bold={false}>Gareeb nahi · bas dheere-dheere kam ameer</InkText>
    <Foot text="AVRON hisaab · 300 mahine = 25 saal" />
  </>);
});
const icons: Record<string, React.ReactNode> = {
  vault: <div style={{ width: 120, height: 120, borderRadius: 120, background: "#6E757D", boxShadow: "inset 0 0 0 12px #5C6269" }} />,
  godaam: <div style={{ width: 150, height: 110, background: "#8C7B66", clipPath: "polygon(0 35%, 50% 0, 100% 35%, 100% 100%, 0 100%)" }} />,
  factory: <div style={{ width: 150, height: 110, background: "#7E858C", clipPath: "polygon(0 40%, 25% 20%, 25% 40%, 50% 20%, 50% 40%, 75% 0, 85% 0, 85% 40%, 100% 40%, 100% 100%, 0 100%)" }} />,
  almirah: <div style={{ width: 80, height: 130, background: "#8E949B", borderRadius: 6, boxShadow: "inset -40px 0 0 #7E858C" }} />,
};
add(st("pile_3"), (t) => {
  const a = st("pile_3"), d = en("pile_3") - a;
  const L = [["vault", "Bank vaults"], ["godaam", "Exchange ke godaam"], ["factory", "Factory ka stock"], ["almirah", "Daadi-naani ki almirah"]];
  return (<>
    <BgPaper /><Kicker text="Hazaaron saal se jama" />
    {L.map(([k, label], i) => {
      const at = a + d * (0.35 + i * 0.14);
      const p = pr(t, at, 0.8, ease.outCubic);
      return (
        <div key={k} style={{ position: "absolute", left: 200 + i * 400, top: 360, width: 340, height: 380, background: "#FBF8F1", ...cut(14), transform: `rotate(${i % 2 ? 1.5 : -1.5}deg) translateY(${(1 - p) * -300}px)`, opacity: clamp01(p * 3),
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <div style={{ height: 140, display: "flex", alignItems: "flex-end" }}>{icons[k]}</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 32, color: "#2A2520", textAlign: "center", padding: "0 20px" }}>{label}</div>
        </div>
      );
    })}
    <Foot text="Illustration" />
  </>);
});
add(st("pile_4") - 0.3, () => {
  const a = st("pile_4") - 0.3, n91 = cue("pile_4", "n91", 0.35), n30 = cue("pile_4", "n30", 0.65);
  return <SceneTime.Provider value={keys([[0, 0.6], [Math.max(1.2, n91 - a - 0.4), 3.6], [n91 - a + 0.2, 3.8], [Math.max(n91 - a + 0.6, n30 - a), 5.6], [en("pile_4") - a + 0.6, 10]])}><SceneVault /></SceneTime.Provider>;
}, true);
add(st("pile_5"), (t) => {
  const a = st("pile_5"), d = en("pile_5") - a, rc = cue("pile_5", "recycling", 0.8);
  const things = ["Payal", "Bichhiya", "Puja ki thaali", "Bartan", "Scrap"];
  const melt = pr(t, a + d * 0.55, 1.4, ease.inOutCubic);
  return (<>
    <BgPaper /><Kicker text="Chhupi hui chandi bahar aayi" />
    {things.map((x, i) => {
      const at = a + d * (0.1 + i * 0.08);
      const p = pr(t, at, 0.7, ease.outCubic);
      return (
        <div key={x} style={{ position: "absolute", left: lerp(200 + i * 300, 860, melt), top: lerp(300, 520, melt), background: "linear-gradient(180deg,#F4F6F8,#B9BEC5)", padding: "18px 26px",
          fontFamily: sans, fontWeight: 800, fontSize: 34, color: "#4A5059", ...cut(10), transform: `rotate(${(i - 2) * 2}deg) scale(${lerp(1, 0.4, melt)}) translateY(${(1 - p) * -260}px)`,
          opacity: clamp01(p * 3) * (1 - clamp01((melt - 0.8) * 5)), whiteSpace: "nowrap" }}>{x}</div>
      );
    })}
    <div style={{ position: "absolute", left: 760, top: 470, width: 400, height: 150, borderRadius: 10, background: "linear-gradient(180deg,#FAFBFC,#A9B0B8)", ...cut(16),
      opacity: clamp01((melt - 0.7) * 4), transform: `scale(${lerp(0.7, 1, clamp01((melt - 0.7) * 3.3))})`, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: sans, fontWeight: 800, fontSize: 44, color: "#5A6069" }}>999</div>
    <Tag t={t} at={rc} x={620} y={720} rot={-1} bg="#2A2520" color="#FBF8F1">Recycling · 13 saal ka high · 2025</Tag>
    <Foot text="Recycling at a 13-year high in 2025 · Silver Institute via FXStreet" />
  </>);
});

/* ---------------------------------------------------------------- SOLAR */
add(CARDS.solar, (t) => <Card t={t} a={CARDS.solar} n="06" title="Solar ka twist" sub="Sabse bade kharidaar ne kya seekha" />);
add(st("solar_0"), (t) => (<><BgLedger /><Kicker text="Kharidaar" /><InkText t={t} at={st("solar_0") + 0.1} x={200} y={400} size={110}>Sabse bada kharidaar</InkText></>));
const SolarCell: React.FC<{ t: number; at: number; thin?: number; x: number; y: number; s?: number }> = ({ t, at, thin = 0, x, y, s = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 520 * s, height: 520 * s, background: "linear-gradient(135deg,#1E3550,#132338)", ...cut(16), overflow: "hidden" }}>
    {Array.from({ length: 16 }).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 0, top: (16 + i * 31) * s, height: lerp(5, 2.2, thin) * s, width: `${100 * pr(t, at + i * 0.05, 0.6, ease.inOutCubic)}%`, background: "linear-gradient(90deg,#E9EDF2,#AEB5BE)" }} />
    ))}
    {[0.25, 0.5, 0.75].map((f) => <div key={f} style={{ position: "absolute", top: 0, left: `${f * 100}%`, width: lerp(14, 8, thin) * s, height: `${100 * pr(t, at + 0.8, 0.6, ease.inOutCubic)}%`, background: "linear-gradient(180deg,#F4F6F8,#B9BEC5)" }} />)}
  </div>
);
add(st("solar_1"), (t) => {
  const a = st("solar_1"), d = en("solar_1") - a, so = cue("solar_1", "solar", 0.6);
  return (<>
    <BgPaper /><Kicker text="Industry · aadhi se zyada chandi" />
    <Tag t={t} at={a + d * 0.3} x={200} y={260} rot={-2}>Phone</Tag>
    <Tag t={t} at={a + d * 0.38} x={200} y={380} rot={1.5}>Gaadi</Tag>
    <Tag t={t} at={so} x={200} y={500} rot={-1} bg="#2A2520" color="#FBF8F1">Solar panel</Tag>
    <SolarCell t={t} at={so} x={1100} y={260} />
    <Tag t={t} at={so + 1.5} x={1040} y={820} rot={1} size={30}>Chandi ki patli lakeerein · bijli ikattha karti hain</Tag>
    <Foot text="Industrial use is more than half of silver demand (World Silver Survey) · illustration" />
  </>);
});
add(st("solar_2"), (t) => {
  const a = st("solar_2"), d = en("solar_2") - a;
  const gone = pr(t, a + d * 0.45, 0.9, ease.inCubic);
  return (<>
    <BgPaper /><Kicker text="2023 · Tamatar ₹100/kg" />
    {Array.from({ length: 6 }).map((_, i) => {
      const out = i >= 4 ? gone : 0;
      return <div key={i} style={{ position: "absolute", left: 300 + i * 200, top: 380 + out * 500, width: 150, height: 140, borderRadius: "50% 50% 46% 46%", background: "radial-gradient(circle at 35% 30%, #F26A55, #C9362A 70%)", ...cut(10),
        transform: `rotate(${out * 40}deg)`, opacity: clamp01((t - a - 0.2 - i * 0.1) / 0.3) * (1 - out) }} />;
    })}
    <Tag t={t} at={a + d * 0.55} x={1280} y={260} rot={3} size={36}>Imli</Tag>
    <Tag t={t} at={a + d * 0.6} x={1480} y={300} rot={-2} size={36}>Dahi</Tag>
    <InkText t={t} at={a + d * 0.75} x={300} y={700} size={60}>Daam gire · tamatar utna wapas nahi aaya</InkText>
  </>);
});
add(st("solar_3"), (t) => {
  const th = cue("solar_3", "thirty", 0.4), te = cue("solar_3", "ten", 0.8);
  return (<>
    <BgLedger /><Kicker text="Solar module ki laagat mein chandi" />
    <div style={{ position: "absolute", left: 300, top: 900, width: 1000, height: 3, background: INK }} />
    {[{ k: "Early 2025", v: 10, txt: "10% se kam", at: te, c: "#3C4A66" }, { k: "Early 2026", v: 30, txt: "30% se zyada", at: th, c: RED }].map((r, i) => (
      <div key={r.k}>
        <div style={{ position: "absolute", left: 380 + i * 420, top: 900 - r.v * 18 * pr(t, r.at, 1.0), width: 220, height: r.v * 18 * pr(t, r.at, 1.0), background: r.c, ...cut(10) }} />
        <div style={{ position: "absolute", left: 380 + i * 420, top: 920, width: 220, textAlign: "center", ...hand, fontSize: 40 }}>{r.k}</div>
        <div style={{ position: "absolute", left: 380 + i * 420 + 240, top: 900 - r.v * 18 - 10, ...hand, fontWeight: 700, fontSize: 52, color: r.c, opacity: clamp01((t - r.at - 0.6) / 0.3), whiteSpace: "nowrap" }}>{r.txt}</div>
      </div>
    ))}
    <Foot text="Deutsche Bank estimate, via Reporte Minero (single source) · anuman" />
  </>);
});
add(st("solar_4"), (t) => {
  const a = st("solar_4"), sv = cue("solar_4", "seventeen", 0.6), d = en("solar_4") - a;
  return (<>
    <BgPaper /><Kicker text="Thrifting" />
    <SolarCell t={t} at={a - 1} thin={pr(t, a + d * 0.1, d * 0.4, ease.inOutCubic)} x={200} y={260} />
    <Tag t={t} at={a + d * 0.12} x={820} y={260} rot={-1.5} size={34}>Patli lakeerein</Tag>
    <Tag t={t} at={a + d * 0.2} x={820} y={350} rot={1.2} size={34}>Paste mein taamba</Tag>
    <Tag t={t} at={a + d * 0.28} x={820} y={440} rot={-1} size={34}>Naya design</Tag>
    <div style={{ position: "absolute", left: 820, top: 580, fontFamily: sans, fontWeight: 800, fontSize: 150, letterSpacing: "-0.05em", color: RED, opacity: clamp01((t - sv + 0.1) / 0.2) }}>
      <Odometer t={t} at={sv} text="−17%" dur={1.0} /></div>
    <div style={{ position: "absolute", left: 830, top: 760, fontFamily: sans, fontWeight: 600, fontSize: 36, color: "#2A2520", opacity: clamp01((t - sv - 0.6) / 0.4) }}>Har cell mein chandi · 2026</div>
    <div style={{ position: "absolute", left: 830, top: 820, fontFamily: sans, fontSize: 30, color: "#5B5247", opacity: clamp01((t - sv - 2.0) / 0.4) }}>Solar ki kul chandi demand · 20% se zyada neeche</div>
    <Foot text="Deutsche Bank estimates for 2026, via Reporte Minero and PrimeXBT · anuman" />
  </>);
});
add(st("solar_5"), (t) => {
  const a = st("solar_5"), sp = cue("solar_5", "surplus", 0.6);
  return (<>
    <BgLedger /><Kicker text="Deutsche Bank · anuman" />
    <InkText t={t} at={a + 0.3} x={200} y={260} size={76}>Factory seekha hua nahi bhoolti</InkText>
    <InkText t={t} at={sp - 0.4} x={200} y={440} size={120} color={RED}>2027 · surplus</InkText>
    <Stamp t={t} at={sp + 1.2} x={1100} y={600} text="ANUMAN" rot={-8} />
    <InkText t={t} at={en("solar_5") - 2.0} x={200} y={700} size={48} bold={false}>Ek bank ka anuman · pakki baat nahi</InkText>
  </>);
});

/* ---------------------------------------------------------------- CLOSE */
add(st("close_0"), (t) => {
  const a = st("close_0"), price = cue("close_0", "price", 0.4), d = en("close_0") - a;
  const slow = clamp01((t - a - 1) / 40), fast = pr(t, price, 1.2, ease.inCubic);
  return (<>
    <BgLedger /><Kicker text="Do ghadiyaan" />
    <InkText t={t} at={a + 0.3} x={200} y={250} size={60}>Kami · khaan ki speed</InkText>
    <div style={{ position: "absolute", left: 200, top: 360, width: 1400, height: 3, background: "rgba(31,42,68,0.25)" }} />
    <div style={{ position: "absolute", left: 200 + 1400 * slow * 0.3 - 18, top: 343, width: 36, height: 36, borderRadius: 36, background: INK }} />
    <InkText t={t} at={price - 0.3} x={200} y={480} size={60} color={RED}>Daam · margin call ki speed</InkText>
    <div style={{ position: "absolute", left: 200, top: 590, width: 1400, height: 3, background: "rgba(255,59,48,0.25)" }} />
    {t > price && <div style={{ position: "absolute", left: 200 + 1400 * fast - 18, top: 573, width: 36, height: 36, borderRadius: 36, background: RED }} />}
    <InkText t={t} at={a + d * 0.72} x={200} y={720} size={48} bold={false}>Udhaar lekar saalon ki kahani pe hafton ka daav</InkText>
  </>);
});
add(st("close_1"), (t) => {
  const a = st("close_1"), gu = cue("close_1", "gupta", 0.55);
  const del = pr(t, a + 1.2, 0.7, ease.inCubic);
  return (<>
    <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}><BgPhone />
      <Big t={t} at={a + 0.2} x={90} y={140} size={56}>Holi tak</Big>
      <div style={{ position: "absolute", left: 330, top: 420, width: 260, height: 260, borderRadius: 60, background: "#14301F", border: "2px solid #3FBF7F", transform: `scale(${1 - del})`, opacity: 1 - del,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: sans, fontWeight: 800, fontSize: 40, color: "#3FBF7F" }}>TRADE</div>
      <Big t={t} at={a + 2.0} x={90} y={780} size={40} weight={600} color="#9AA0AA">App delete · group chhoda</Big>
    </div>
    <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden" }}><BgPaper />
      <div style={{ position: "absolute", left: 160, top: 300, width: 300, height: 480, background: "#8C939A", borderRadius: 10, ...cut(16) }}>
        <div style={{ position: "absolute", right: 26, top: 220, width: 12, height: 50, borderRadius: 6, background: "#C9CDD2" }} />
      </div>
      <div style={{ position: "absolute", left: 540, top: 360 }}><Person kind="gupta" t={t} at={gu - 0.4} /></div>
      <Tag t={t} at={gu + 0.4} x={120} y={140} rot={-1.5} size={36}>Locker ek baar bhi nahi khula</Tag>
    </div>
    <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 1080, background: "#000" }} />
  </>);
});
add(st("close_2"), (t) => {
  const a = st("close_2"), q = cue("close_2", "questions", 0.9);
  const drop = ease.outCubic(clamp01((t - a - 0.2) / 1.0));
  return (<>
    <BgSlate />
    <div style={{ position: "absolute", left: 1060, top: 330, width: 640, height: 640, perspective: 1600 }}>
      <div style={{ position: "absolute", left: 20, top: 120, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%, #E2B85C, #B8862F 55%, #7A5418)", transform: "rotateX(58deg)", boxShadow: "0 40px 60px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: 170, top: 180, transform: `translateY(${(1 - drop) * -300}px) rotateX(52deg) rotateZ(-10deg)`, opacity: clamp01(drop * 3) }}><Coin size={300} cutAt={999} t={t} /></div>
    </div>
    <Big t={t} at={a + 0.4} x={160} y={300} size={110}>Dhanteras</Big>
    <Big t={t} at={a + 0.9} x={160} y={430} size={70} color="#C9CED6">Shukravaar · 6 November</Big>
    <Big t={t} at={a + (q - a) * 0.6} x={160} y={600} size={40} weight={500} color="#9AA0AA">Kharidne ya na kharidne ki salaah nahi</Big>
    <Big t={t} at={q - 0.2} x={160} y={680} size={52} weight={700} color={RED}>Bas do sawaal</Big>
  </>);
});
add(st("close_3"), (t) => {
  const a = st("close_3"), sec = cue("close_3", "second", 0.4);
  return (<>
    <BgLedger /><Kicker text="Do sawaal" />
    <InkText t={t} at={a + 0.2} x={200} y={260} size={84}>1 · Jama bhandaar kitna bada hai</InkText>
    <InkText t={t} at={sec - 0.1} x={200} y={420} size={84}>2 · Kharidne wale kiska paisa laga rahe hain</InkText>
    <Rule t={t} at={en("close_3") - 3.5} x={200} y={590} w={1300} color={RED} double />
    <InkText t={t} at={en("close_3") - 3.2} x={200} y={640} size={52} bold={false} color={RED}>Bada bhandaar + udhaar wale kharidaar = sirf kami se daam nahi tikta</InkText>
  </>);
});
add(st("close_4"), (t) => {
  const a = st("close_4");
  return (<>
    <BgSlate />
    <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: clamp01((t - a - 0.2) / 0.6) }}>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 120, letterSpacing: "0.32em", color: "#F3F1EC", marginLeft: "0.32em" }}>AVRON</div>
      <div style={{ fontFamily: sans, fontSize: 28, letterSpacing: "0.3em", color: "#8A919C", marginTop: 14 }}>THE STORY BEHIND THE STOCK</div>
    </div>
    <Big t={t} at={a + 1.0} x={0} y={640} size={48} weight={600}><div style={{ width: 1920, textAlign: "center" }}>Agli kahani kiski · comment mein likho</div></Big>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 90, textAlign: "center", fontFamily: mono, fontSize: 22, color: "#7C828C", lineHeight: 1.7, opacity: clamp01((t - a - 2.0) / 0.6) }}>
      Yeh salaah nahi hai · sirf jaankaari ke liye<br />Gupta ji aur Rohan kaalpanik kirdaar hain · sources description mein
    </div>
  </>);
});

/* ---------------------------------------------------------------- assembly */
items.sort((x, y) => x.a - y.a);
items.forEach((it, i) => { it.z = i + 1 < items.length ? items[i + 1].a : DURATION; });

export const SilverFilm: React.FC = () => {
  const t = useTime();
  const out = 1 - clamp01((t - DURATION + 1.2) / 1.2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <SerifFont />
      <AbsoluteFill style={{ opacity: out }}>
        {items.map((it, i) => {
          if (t < it.a - 0.1 || t > it.z + 0.8) return null;
          if (it.scene) {
            return (
              <Sequence key={i} from={Math.round(it.a * 30)} durationInFrames={Math.round((it.z - it.a + 0.8) * 30)} layout="none">
                <AbsoluteFill>{it.render(t)}</AbsoluteFill>
              </Sequence>
            );
          }
          return <Shot key={i} t={t} a={it.a} z={it.z} k={i}>{it.render(t)}</Shot>;
        })}
      </AbsoluteFill>
      <Grain opacity={0.05} />
      <Audio src={staticFile("silver/mix.wav")} />
    </AbsoluteFill>
  );
};
export const SILVER_DURATION = DURATION;
