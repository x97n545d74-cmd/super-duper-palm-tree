import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, ease, lerp } from "../../../engine/anim";
import { C, mono, sans } from "../look";
import { Headline } from "./kit";

/*
 * Paper explainers: short animated scenes in the same paper-craft world as the chapter cards.
 * One original character (a delivery rider, no brand on him, only the brand colour on his box) and a store
 * picker carry the ideas the narration explains. Flat cut-paper shapes, soft paper shadows, smooth easing,
 * no camera shake. Every scene is labelled as an illustration; any number on screen comes from FACTS.md.
 */
export const INK = "#2B241C";
const PAPER = "#EFE6D6", PAPER_DARK = "#D9CDB8", GROUND = "#CDBFA6", SKIN = "#B47A55", SHIRT = "#3E5C76", PANTS = "#2F3A45", HELMET = "#F4EFE6";
const SCOOT = "#5F7F8C", SHADE = "drop-shadow(0 8px 0 rgba(60,40,20,0.13))";

const P = (t: number, a: number, d: number) => ease.inOutCubic(clamp01((t - a) / d));
const O = (t: number, a: number, d = 0.5) => ease.outCubic(clamp01((t - a) / d));

/** Paper desk, kicker and headline in ink, and the "illustration" tag. */
export const PaperStage: React.FC<{ t: number; a: number; kicker: string; title: string; note?: string; children: React.ReactNode }> = ({ t, a, kicker, title, note, children }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(90% 80% at 35% 30%, #F6EFE3 0%, ${PAPER} 45%, #CDBFA6 100%)` }} />
    <AbsoluteFill style={{ opacity: 0.25, backgroundImage: "repeating-linear-gradient(17deg, rgba(120,100,70,0.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(-23deg, rgba(120,100,70,0.05) 0 1px, transparent 1px 5px)" }} />
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{children}</svg>
    <div style={{ position: "absolute", left: 140, top: 86, fontFamily: sans, fontSize: 24, letterSpacing: "0.32em", color: "#8A7860" }}>{kicker}</div>
    <Headline t={t} at={a + 0.2} lines={[title]} size={72} color={INK} rule={INK} />
    <div style={{ position: "absolute", right: 140, bottom: 64, fontFamily: mono, fontSize: 20, color: "#8A7860", textAlign: "right" }}>{note ? `${note} · ` : ""}Illustration</div>
  </AbsoluteFill>
);

/** Handwritten-feel caption in ink, rising in. */
export const Caption: React.FC<{ t: number; at: number; x: number; y: number; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; until?: number }> = ({
  t, at, x, y, text, size = 40, color = INK, anchor = "start", until = 1e9,
}) => {
  const p = O(t, at, 0.6) * (1 - O(t, until, 0.4));
  return <text x={x} y={y + (1 - p) * 14} opacity={p} textAnchor={anchor} fontFamily="Playfair Display" fontStyle="italic" fontWeight={600} fontSize={size} fill={color}>{text}</text>;
};

/* ------------------------------------------------------------------ characters */

const Wheel: React.FC<{ x: number; y: number; spin: number }> = ({ x, y, spin }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={30} fill={INK} />
    <circle r={15} fill="#9A8F84" />
    <g transform={`rotate(${spin})`}>{[0, 60, 120].map((r) => <line key={r} x1={-14} y1={0} x2={14} y2={0} stroke={INK} strokeWidth={3} transform={`rotate(${r})`} />)}</g>
    <circle r={4} fill={INK} />
  </g>
);

/** The rider on his scooter, facing right, ground contact at (0,0). `ride` = distance travelled (spins the wheels). */
export const Rider: React.FC<{ x: number; y: number; s?: number; ride: number; box?: string; lid?: number; tilt?: number; moving?: boolean; t: number }> = ({
  x, y, s = 1, ride, box = C.swiggy, lid = 0, tilt = 0, moving = true, t,
}) => {
  const spin = (ride / 30) * (180 / Math.PI);
  const bob = moving ? Math.sin(t * 9) * 1.6 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt})`} style={{ filter: SHADE }}>
      <ellipse cx={0} cy={4} rx={125} ry={9} fill="rgba(60,40,20,0.16)" />
      <Wheel x={-78} y={-30} spin={spin} />
      <Wheel x={82} y={-30} spin={spin} />
      {/* scooter */}
      <path d="M 52 -36 A 32 32 0 0 1 114 -36" fill="none" stroke={SCOOT} strokeWidth={10} strokeLinecap="round" />
      <path d="M -118 -38 Q -122 -96 -62 -100 L -8 -100 Q 4 -72 -18 -54 L -58 -38 Z" fill={SCOOT} />
      <rect x={-62} y={-54} width={118} height={14} rx={6} fill={SCOOT} />
      <path d="M 44 -40 L 62 -40 L 98 -150 L 78 -156 Z" fill={SCOOT} />
      <line x1={86} y1={-152} x2={62} y2={-170} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <rect x={-98} y={-114} width={88} height={16} rx={8} fill={INK} />
      {/* delivery box on the rear rack: brand colour only, no logo */}
      <g transform={`translate(${-150} ${-196})`}>
        <rect width={84} height={80} rx={6} fill={box} stroke={INK} strokeWidth={3} />
        <g transform={`rotate(${-lid * 70} 0 0)`}><rect x={-2} y={-8} width={88} height={12} rx={4} fill={box} stroke={INK} strokeWidth={3} /></g>
        <line x1={10} y1={40} x2={74} y2={40} stroke="rgba(43,36,28,0.35)" strokeWidth={3} />
      </g>
      {/* rider */}
      <g transform={`translate(0 ${bob})`}>
        <path d="M -40 -116 L 12 -104 L 26 -50" fill="none" stroke={PANTS} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={16} y={-56} width={30} height={12} rx={5} fill={INK} />
        <path d="M -42 -118 L -20 -192" stroke={SHIRT} strokeWidth={38} strokeLinecap="round" />
        <path d="M -14 -182 L 26 -160 L 62 -166" fill="none" stroke={SHIRT} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={64} cy={-166} r={8} fill={SKIN} />
        <circle cx={-12} cy={-226} r={23} fill={SKIN} />
        <path d="M -38 -226 A 27 27 0 0 1 14 -232 L 16 -222 L -38 -220 Z" fill={HELMET} stroke={INK} strokeWidth={3} />
        <path d="M 2 -236 L 18 -224" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
};

/** A standing person, facing right (flip with `face=-1`). `reach` raises the front arm forward (0..1). */
export const Person: React.FC<{ x: number; y: number; s?: number; shirt?: string; apron?: string; helmet?: boolean; reach?: number; face?: 1 | -1; walk?: number }> = ({
  x, y, s = 1, shirt = SHIRT, apron, helmet, reach = 0, face = 1, walk = 0,
}) => {
  const step = Math.sin(walk) * 10;
  const hx = lerp(30, 84, reach), hy = lerp(-96, -150, reach);
  return (
    <g transform={`translate(${x} ${y}) scale(${face * s} ${s})`} style={{ filter: SHADE }}>
      <ellipse cx={0} cy={4} rx={44} ry={7} fill="rgba(60,40,20,0.16)" />
      <line x1={-9} y1={-92} x2={-11 - step} y2={-4} stroke={PANTS} strokeWidth={17} strokeLinecap="round" />
      <line x1={9} y1={-92} x2={11 + step} y2={-4} stroke={PANTS} strokeWidth={17} strokeLinecap="round" />
      <rect x={-29} y={-178} width={58} height={94} rx={22} fill={shirt} />
      {apron && <rect x={-22} y={-150} width={44} height={68} rx={6} fill={apron} />}
      <line x1={-26} y1={-166} x2={-32} y2={-100} stroke={shirt} strokeWidth={14} strokeLinecap="round" />
      <path d={`M 24 -166 Q ${lerp(34, 60, reach)} ${lerp(-130, -160, reach)} ${hx} ${hy}`} fill="none" stroke={shirt} strokeWidth={14} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={8} fill={SKIN} />
      <circle cx={0} cy={-204} r={24} fill={SKIN} />
      {helmet
        ? <path d="M -27 -204 A 28 28 0 0 1 27 -208 L 28 -198 L -27 -196 Z" fill={HELMET} stroke={INK} strokeWidth={3} />
        : <path d="M -24 -210 A 25 25 0 0 1 24 -212 Q 10 -222 -24 -210 Z" fill={INK} />}
      <circle cx={10} cy={-206} r={3} fill={INK} />
    </g>
  );
};

/** Brown paper bag. */
export const Bag: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#B98B5E" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} style={{ filter: SHADE }}>
    <path d="M -22 0 L -26 -50 L 26 -50 L 22 0 Z" fill={color} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -10 -50 Q -10 -66 0 -66 Q 10 -66 10 -50" fill="none" stroke={INK} strokeWidth={3} />
  </g>
);

/** Paper dark store: shutter, shelves inside, sign. Bottom-left at (x, y). */
export const Store: React.FC<{ x: number; y: number; w?: number; h?: number; open?: number; sign?: string; accent?: string; grow?: number }> = ({
  x, y, w = 420, h = 320, open = 1, sign = "DARK STORE", accent = C.swiggy, grow = 1,
}) => {
  const door = { x: w * 0.18, w: w * 0.64, top: h * 0.32, h: h * 0.68 };
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${grow}) translate(0 ${-h})`} style={{ filter: SHADE }}>
      <rect width={w} height={h} fill={PAPER_DARK} stroke={INK} strokeWidth={3} />
      <rect width={w} height={h * 0.2} fill="#4B4036" />
      <rect x={w * 0.12} y={h * 0.04} width={w * 0.76} height={h * 0.12} rx={6} fill={PAPER} />
      <text x={w / 2} y={h * 0.135} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={h * 0.075} letterSpacing="0.2em" fill={INK}>{sign}</text>
      <rect x={door.x} y={door.top} width={door.w} height={door.h} fill="#2E2822" />
      {[0.25, 0.5, 0.75].map((r, i) => (
        <g key={i}>
          <line x1={door.x + 8} x2={door.x + door.w - 8} y1={door.top + door.h * r} y2={door.top + door.h * r} stroke="#6D6156" strokeWidth={4} />
          {Array.from({ length: 6 }, (_, j) => (
            <rect key={j} x={door.x + 16 + j * (door.w - 32) / 6} y={door.top + door.h * r - 22} width={(door.w - 32) / 6 - 8} height={20} rx={3}
              fill={[accent, "#7BA05B", "#E8D9B5", "#C25B4A", "#5F7F8C", "#D9A441"][(i * 2 + j) % 6]} />
          ))}
        </g>
      ))}
      {/* roller shutter */}
      <rect x={door.x} y={door.top} width={door.w} height={door.h * (1 - open)} fill="#9C9286" />
      {Array.from({ length: 10 }, (_, k) => {
        const yy = door.top + (door.h * (1 - open) * k) / 10;
        return open < 1 ? <line key={k} x1={door.x} x2={door.x + door.w} y1={yy} y2={yy} stroke="#7E756B" strokeWidth={2} /> : null;
      })}
    </g>
  );
};

const House: React.FC<{ x: number; y: number; w: number; h: number; fill?: string }> = ({ x, y, w, h, fill = "#E3D7C3" }) => (
  <g transform={`translate(${x} ${y - h})`}>
    <rect width={w} height={h} fill={fill} />
    {Array.from({ length: Math.floor(h / 70) }, (_, r) => Array.from({ length: Math.floor(w / 60) }, (_, c) => (
      <rect key={`${r}-${c}`} x={18 + c * 60} y={24 + r * 70} width={26} height={32} fill="rgba(43,36,28,0.13)" />
    )))}
  </g>
);

const Street: React.FC = () => (
  <g>
    <House x={120} y={820} w={260} h={300} />
    <House x={400} y={820} w={200} h={380} fill="#DDD0BA" />
    <House x={1460} y={820} w={240} h={330} />
    <House x={1720} y={820} w={260} h={250} fill="#DDD0BA" />
    <rect x={-2000} y={820} width={6000} height={300} fill={GROUND} />
    {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-2000 + i * 150} y={930} width={80} height={8} rx={4} fill="rgba(255,255,255,0.55)" />)}
  </g>
);

/** A countdown dial (10 minutes) drawn as a paper clock. */
const Dial: React.FC<{ x: number; y: number; frac: number; o: number }> = ({ x, y, frac, o }) => {
  const secs = Math.max(0, Math.round(600 * (1 - frac)));
  const a = frac * 2 * Math.PI;
  return (
    <g transform={`translate(${x} ${y})`} opacity={o} style={{ filter: SHADE }}>
      <circle r={86} fill={PAPER} stroke={INK} strokeWidth={4} />
      <path d={`M 0 0 L 0 -74 A 74 74 0 ${frac > 0.5 ? 1 : 0} 1 ${74 * Math.sin(a)} ${-74 * Math.cos(a)} Z`} fill="rgba(252,128,25,0.28)" />
      <line x1={0} y1={0} x2={60 * Math.sin(a)} y2={-60 * Math.cos(a)} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <text y={128} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={36} fill={INK}>
        {`${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`}
      </text>
    </g>
  );
};

/* ------------------------------------------------------------------ scenes */

/** c1_02 · the dark store: a run to the door, then more stores, then more orders per store. */
export const DarkStoreScene: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const s = t - a;
  const arrive = P(s, 1.0, 3.2), leave = P(s, 8.0, 3.0);
  const rx = s < 8 ? lerp(-300, 820, arrive) : lerp(820, 2300, leave);
  const pass = P(s, 5.6, 1.2);
  const zoom = P(s, 12.0, 2.2);
  const k = lerp(1, 0.5, zoom);
  const extra = [-760, -220, 1960, 2400];
  const bags = Math.floor(clamp01((s - 18.5) / 4.5) * 12);
  const perOrder = lerp(1, 0.28, P(s, 19.0, 4.5));
  return (
    <g>
      <g transform={`translate(960 820) scale(${k}) translate(-960 -820)`}>
        <Street />
        <Store x={980} y={820} open={P(s, 0.6, 1.2)} />
        {extra.map((ex, i) => <Store key={ex} x={ex} y={820} grow={P(s, 13.6 + i * 0.35, 0.8)} accent={i % 2 ? C.blinkit : C.swiggy} />)}
        {/* the picker hands over the order */}
        <Person x={1190} y={820} apron={C.swiggy} shirt="#6A5A4A" face={-1} reach={P(s, 5.0, 0.6) * (1 - P(s, 7.0, 0.6))} />
        {s > 5.4 && s < 7.0 && (
          <Bag x={lerp(1105, 712, pass)} y={lerp(670, 600, pass) - Math.sin(pass * Math.PI) * 60} s={0.9} />
        )}
        <Rider t={t} x={rx} y={820} ride={rx} lid={P(s, 5.2, 0.4) * (1 - P(s, 7.0, 0.4))} moving={s < 4.2 || s > 8} />
        {Array.from({ length: bags }, (_, i) => <Bag key={i} x={1060 + (i % 6) * 52} y={820 - Math.floor(i / 6) * 56} s={0.85} />)}
      </g>
      <Dial x={1700} y={330} frac={clamp01((s - 1) / 10.5)} o={O(s, 1.0) * (1 - O(s, 11.8))} />
      <Caption t={s} at={1.6} until={11.6} x={140} y={330} text="Ek chhota godown, mohalle ke paas" />
      <Caption t={s} at={4.6} until={11.6} x={140} y={390} text="Grahak andar nahi jaata · sirf rider" color="#8A5A2B" />
      <Caption t={s} at={14.2} until={18.3} x={140} y={330} text="Zyada dark stores → jaldi delivery" />
      <Caption t={s} at={18.8} x={140} y={330} text="Zyada orders → har order sasta" />
      {s > 18.8 && (
        <g opacity={O(s, 18.8)}>
          <text x={140} y={420} fontFamily="JetBrains Mono" fontSize={26} fill="#8A7860">STORE KA FIXED KHARCHA · PER ORDER</text>
          <rect x={140} y={440} width={640} height={30} rx={15} fill="rgba(43,36,28,0.12)" />
          <rect x={140} y={440} width={640 * perOrder} height={30} rx={15} fill={C.swiggy} />
          <text x={140} y={520} fontFamily="JetBrains Mono" fontSize={26} fill="#8A7860">ORDERS AAJ · {String(bags * 25 + 50).padStart(3, " ")}</text>
        </g>
      )}
    </g>
  );
};

/** c2_07 · same fixed costs, more sales: the store that sells more spreads them thinner. */
export const FixedCostScene: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const s = t - a;
  const side = (x: number, accent: string, name: string, lakh: number, n: number, at: number) => {
    const shown = Math.floor(clamp01((s - at) / 3) * n);
    const slice = 560 / n;
    return (
      <g>
        <Store x={x} y={820} w={380} h={300} accent={accent} sign={name} />
        {/* the same fixed block above both stores */}
        <g opacity={O(s, 1.2)}>
          {["Kiraya", "Bijli", "Staff"].map((l, i) => (
            <g key={l}>
              <rect x={x - 90 + i * 187} y={300} width={180} height={64} rx={8} fill={["#8C7A66", "#A28E77", "#6F6152"][i]} style={{ filter: SHADE }} />
              <text x={x - 90 + i * 187 + 90} y={342} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={28} fill={PAPER}>{l}</text>
            </g>
          ))}
        </g>
        {/* split across today's orders */}
        {Array.from({ length: shown }, (_, i) => (
          <g key={i}>
            <rect x={x - 90 + i * slice} y={400} width={slice - 6} height={22} rx={6} fill={accent} opacity={0.85} />
            <Bag x={x - 60 + i * slice + slice / 2 - 20} y={910} s={0.8} />
          </g>
        ))}
        <text x={x + 190} y={975} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={30} fill={INK} opacity={O(s, at + 3)}>₹{lakh} lakh / din</text>
      </g>
    );
  };
  return (
    <g>
      {side(300, C.swiggy, "INSTAMART", 5.8, 6, 2.6)}
      {side(1240, C.blinkit, "BLINKIT", 8.3, 8, 2.6)}
      <Caption t={s} at={6.2} x={960} y={470} anchor="middle" text="Kharcha wahi · zyada orders mein batt gaya" size={36} />
    </g>
  );
};

/** c3_06 · Swiggy's seesaw: food's profit cannot lift Instamart's loss. */
export const SeesawScene: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const s = t - a;
  const dropL = P(s, 1.0, 0.9), dropR = P(s, 3.0, 0.9);
  const tip = 11 * P(s, 3.6, 1.6);
  const push = P(s, 9.0, 1.0) * (1 - P(s, 14.5, 1.0));
  const L = (895 / 341) ** 0.5;
  return (
    <g>
      <rect x={-10} y={900} width={1940} height={200} fill={GROUND} />
      <path d="M 960 760 L 900 900 L 1020 900 Z" fill="#6F6152" style={{ filter: SHADE }} />
      <g transform={`rotate(${tip} 960 760)`}>
        <rect x={400} y={740} width={1120} height={22} rx={10} fill="#A28E77" stroke={INK} strokeWidth={3} style={{ filter: SHADE }} />
        {/* food: a covered plate */}
        <g transform={`translate(560 ${lerp(-400, 740, dropL)})`} opacity={clamp01(dropL * 3)}>
          <ellipse cx={0} cy={-6} rx={110} ry={16} fill={PAPER} stroke={INK} strokeWidth={3} />
          <path d="M -86 -12 A 86 80 0 0 1 86 -12 Z" fill="#C9CDD1" stroke={INK} strokeWidth={3} />
          <circle cx={0} cy={-96} r={10} fill={INK} />
          <text x={0} y={-130} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={C.gain} stroke={INK} strokeWidth={0.6}>+₹341 Cr</text>
          <text x={0} y={-178} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={24} fill={INK}>KHAANA</text>
        </g>
        {/* Instamart: a heavier bag */}
        <g transform={`translate(1360 ${lerp(-500, 740, dropR)})`} opacity={clamp01(dropR * 3)}>
          <Bag x={0} y={0} s={2.2 * L / 1.6} color={C.swiggy} />
          <text x={0} y={-230} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={C.loss} stroke={INK} strokeWidth={0.6}>−₹895 Cr</text>
          <text x={0} y={-278} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={24} fill={INK}>INSTAMART</text>
        </g>
      </g>
      {/* the rider tries to push the food side down; the plank does not move */}
      <g opacity={O(s, 8.6)}>
        <Person x={lerp(260, 420, O(s, 8.6, 1.0))} y={900} helmet reach={0.4 + 0.5 * push} />
      </g>
      <Caption t={s} at={6.0} x={960} y={340} anchor="middle" text="Aadha nuksaan bhi nahi bharta" />
      <g opacity={O(s, 7.2)}>
        <text x={960} y={420} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={30} fill={INK}>341 − 895 = <tspan fill={C.loss} fontWeight={700}>−554</tspan> ₹ crore · adjusted EBITDA, Q2 FY27</text>
      </g>
    </g>
  );
};

/** c4_01 · who owns the goods: marketplace vs inventory, and the rule that locks the second. */
export const OwnershipScene: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const s = t - a;
  const shelf = (x: number) => (
    <g style={{ filter: SHADE }}>
      <rect x={x} y={420} width={520} height={420} fill={PAPER_DARK} stroke={INK} strokeWidth={3} />
      {[540, 660, 780].map((y) => <line key={y} x1={x + 10} x2={x + 510} y1={y} y2={y} stroke="#6D6156" strokeWidth={5} />)}
    </g>
  );
  const sellers = ["#7BA05B", "#C25B4A", "#5F7F8C"];
  const lock = P(s, 9.5, 0.6);
  return (
    <g>
      <rect x={-10} y={880} width={1940} height={220} fill={GROUND} />
      <line x1={960} y1={300} x2={960} y2={1000} stroke={INK} strokeWidth={3} strokeDasharray="14 14" opacity={0.5} />
      <text x={510} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} letterSpacing="0.12em" fill={INK}>MARKETPLACE</text>
      <text x={1430} y={360} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} letterSpacing="0.12em" fill={INK}>INVENTORY</text>
      {/* left: three sellers stock the shelf with their own goods */}
      {shelf(250)}
      {sellers.map((c, i) => {
        const come = P(s, 1.0 + i * 1.3, 1.1);
        return (
          <g key={c}>
            {Array.from({ length: 4 }, (_, j) => <rect key={j} x={270 + j * 60 + (i % 2) * 240} y={[490, 610, 730][i] + (1 - come) * -30} width={48} height={48} rx={4} fill={c} opacity={come} stroke={INK} strokeWidth={2} />)}
            <Person x={lerp(-80, 140 + i * 40, come) - (s > 5.5 ? (s - 5.5) * 200 : 0)} y={880} shirt={c} s={0.85} walk={s * 9} reach={come * (1 - come) * 4} />
          </g>
        );
      })}
      {/* the app only takes a cut */}
      <g opacity={O(s, 5.8)} transform="translate(800 720)">
        <rect x={-40} y={-80} width={80} height={140} rx={14} fill={INK} />
        <rect x={-32} y={-68} width={64} height={110} rx={6} fill={PAPER} />
        <circle cx={0} cy={lerp(-200, -20, P(s, 6.4, 0.9))} r={22} fill="#D9A441" stroke={INK} strokeWidth={3} opacity={P(s, 6.4, 0.2)} />
        <text x={0} y={110} textAnchor="middle" fontFamily="JetBrains Mono" fontSize={24} fill={INK}>APP · COMMISSION</text>
      </g>
      {/* right: the app's own goods, then the padlock */}
      {shelf(1170)}
      {[490, 610, 730].map((y, r) => Array.from({ length: 8 }, (_, j) => (
        <rect key={`${r}-${j}`} x={1190 + j * 60} y={y} width={48} height={48} rx={4} fill={C.blinkit} stroke={INK} strokeWidth={2} opacity={O(s, 7.6 + r * 0.25 + j * 0.05, 0.3)} />
      )))}
      <g opacity={lock} transform={`translate(1430 640) scale(${lerp(1.6, 1, lock)})`}>
        <rect x={-560} y={-400} width={1120} height={0} />
        <path d="M -60 -40 L -60 -100 A 60 60 0 0 1 60 -100 L 60 -40" fill="none" stroke={INK} strokeWidth={18} />
        <rect x={-90} y={-50} width={180} height={150} rx={18} fill="#C25B4A" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={15} r={14} fill={INK} />
      </g>
      <g opacity={O(s, 10.4)}>
        <rect x={1110} y={860} width={640} height={92} rx={10} fill={PAPER} stroke={INK} strokeWidth={3} transform="rotate(-3 1430 906)" />
        <text x={1430} y={918} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={30} fill="#C25B4A" transform="rotate(-3 1430 906)">Videshi hissa zyada · allowed nahi</text>
      </g>
      <Caption t={s} at={12.5} x={140} y={1000} size={36} text="Videshi hissedari zyada ho toh sirf marketplace" />
    </g>
  );
};

/** c6_01 · a 0.9% margin is a thin plank: one gust of price war and the rider is back over the loss. */
export const TightropeScene: React.FC<{ t: number; a: number }> = ({ t, a }) => {
  const s = t - a;
  const go = P(s, 1.0, 4.0);
  const rx = lerp(260, 900, go);
  const gust = P(s, 5.5, 1.2) * (1 - P(s, 10.5, 1.0));
  const sag = 26 + 40 * gust;
  const plankY = (x: number) => {
    const u = clamp01((x - 520) / 880);
    return 640 + sag * 4 * u * (1 - u);
  };
  return (
    <g>
      {/* two cliffs and the gap between */}
      <path d="M -10 640 L 520 640 L 560 1090 L -10 1090 Z" fill="#A28E77" style={{ filter: SHADE }} />
      <path d="M 1400 640 L 1930 640 L 1930 1090 L 1360 1090 Z" fill="#A28E77" style={{ filter: SHADE }} />
      <rect x={548} y={820} width={824} height={270} fill="rgba(194,91,74,0.18)" />
      <text x={960} y={900} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} letterSpacing="0.3em" fill="#C25B4A">NUKSAAN</text>
      <text x={1660} y={720} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={36} letterSpacing="0.2em" fill={INK}>PROFIT</text>
      {/* the plank */}
      <path d={`M 520 640 Q 960 ${640 + sag * 2} 1400 640`} fill="none" stroke="#6F6152" strokeWidth={10} />
      <text x={960} y={640 + sag + 60} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={34} fill={INK}>0.9% margin</text>
      {/* price-war gusts from the right */}
      <g opacity={gust}>
        {[0, 1, 2].map((i) => {
          const off = ((s * 380 + i * 260) % 780);
          return <path key={i} d={`M ${1820 - off} ${420 + i * 70} q -90 -30 -180 0 t -180 0`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.55} />;
        })}
        <text x={1560} y={380} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill="#C25B4A">PRICE WAR</text>
      </g>
      <Rider t={t} x={rx} y={plankY(rx) - 2} s={0.8} ride={rx} box={C.blinkit} tilt={-3 * gust} moving={s > 1 && s < 5} />
      <Caption t={s} at={6.6} x={140} y={330} text="Ek price war, aur profit wapas nuksaan" />
    </g>
  );
};
