import React from "react";
import { AbsoluteFill } from "remotion";
import { useTime } from "../../../engine/anim";
import { Grain, SerifFont } from "../look";
import { OrigamiCard } from "./Origami";
import { C1Section, C2Section, OpenSection } from "./part1";
import { C3Section, C4Section, C5Section, C6Section, C7Section, CloseSection } from "./part2";
import { sec } from "./timeline";
import { World } from "./World";

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

export const SwiggyFilm: React.FC = () => {
  const t = useTime();
  const inSec = (s: Parameters<typeof sec>[0]) => t >= sec(s)[0] - 0.5 && t < sec(s)[1] + 0.5;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <SerifFont />
      <World t={t} />
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
      <Grain />
    </AbsoluteFill>
  );
};
