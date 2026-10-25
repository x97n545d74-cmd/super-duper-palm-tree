import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { clamp01, useTime } from "../../../engine/anim";
import { C, Grain, mono, SerifFont } from "../look";
import { OrigamiCard } from "./Origami";
import { C1Section, C2Section, OpenSection } from "./part1";
import { C3Section, C4Section, C5Section, C6Section, C7Section, CloseSection } from "./part2";
import { sec } from "./timeline";
import { BackdropPlan, World } from "./World";

/** "₹9.7 Crore a Day" · Swiggy vs Eternal · 1920×1080 · the full film. */
const CARDS = [
  { s: "c1", num: "01", title: "Do raaste", doodle: "roads" },
  { s: "c2", num: "02", title: "Scoreboard", doodle: "board" },
  { s: "c3", num: "03", title: "Khaana", doodle: "plate" },
  { s: "c4", num: "04", title: "Rulebook", doodle: "book" },
  { s: "c5", num: "05", title: "Friday, 23 October", doodle: "calendar" },
  { s: "c6", num: "06", title: "Blinkit bhi perfect nahi", doodle: "crown" },
  { s: "c7", num: "07", title: "Aage kya dekhein", doodle: "scope" },
] as const;

/** Background per chapter: the user picks from A photo / B map / C paper / D type (see BG_OPTIONS.jpg). */
export const PLAN: BackdropPlan = { c1: "paper", c2: "map", c3: "photo", c4: "photo", c5: "paper", c6: "photo", c7: "paper" }; // user pick, 2026-10-25

export const SwiggyFilm: React.FC<{ plan?: BackdropPlan }> = ({ plan = PLAN }) => {
  const t = useTime();
  const inSec = (s: Parameters<typeof sec>[0]) => t >= sec(s)[0] - 0.5 && t < sec(s)[1] + 0.5;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <SerifFont />
      <World t={t} plan={plan} />
      {inSec("open") && <OpenSection t={t} />}
      {inSec("c1") && <C1Section t={t} />}
      {inSec("c2") && <C2Section t={t} />}
      {inSec("c3") && <C3Section t={t} />}
      {inSec("c4") && <C4Section t={t} />}
      {inSec("c5") && <C5Section t={t} />}
      {inSec("c6") && <C6Section t={t} />}
      {inSec("c7") && <C7Section t={t} />}
      {t >= sec("close")[0] - 0.5 && <CloseSection t={t} />}
      {CARDS.map((c) => <OrigamiCard key={c.s} t={t} a={sec(c.s)[0]} num={c.num} title={c.title} doodle={c.doodle} />)}
      <ProgressRail t={t} />
      <Grain />
      {/* narration (user's ElevenLabs recording, re-timed) + original score, mixed to -14 LUFS by scripts/mix_stems.py */}
      <Audio src={staticFile("swiggy/film_mix.wav")} />
    </AbsoluteFill>
  );
};

/** Top-right chapter rail: "03 / 07" and a hairline that fills across the chapter. */
const ProgressRail: React.FC<{ t: number }> = ({ t }) => {
  const i = CARDS.findIndex((c) => t >= sec(c.s)[0] + 3 && t < sec(c.s)[1]);
  if (i < 0) return null;
  const [a, z] = sec(CARDS[i].s);
  const o = clamp01((t - a - 3) / 0.6) * clamp01((z - t) / 0.4);
  return (
    <div style={{ position: "absolute", right: 140, top: 82, width: 220, opacity: o, fontFamily: mono, fontSize: 22, color: C.inkDim, letterSpacing: "0.12em", textAlign: "right" }}>
      {CARDS[i].num} / 07
      <div style={{ height: 2, background: "rgba(245,241,234,0.18)", marginTop: 12 }}>
        <div style={{ height: 2, width: `${clamp01((t - a - 3) / (z - a - 3)) * 100}%`, background: C.ink }} />
      </div>
    </div>
  );
};
