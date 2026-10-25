import React from "react";
import { color, font } from "../../brand/tokens";
import { clamp01, ease, prog } from "../../engine/anim";

/*
 * Scene 3: a night bazaar drawn flat, two near-identical kirana shops side by side.
 * Ink outlines match the characters' line weight. Numbers are illustrative and labelled so.
 */
const INK = "#0B0C0F";
export const MARKET_GREEN = "#3DCB8C";

const Shop: React.FC<{ x: number; awning: string; name: string; big?: boolean }> = ({ x, awning, name, big }) => {
  const w = 430, top = 640, h = 720;
  const stripes = Array.from({ length: 7 });
  return (
    <g transform={`translate(${x} 0)`}>
      {/* building */}
      <rect x={0} y={top} width={w} height={h} rx={10} fill="#1A1F29" stroke={INK} strokeWidth={7} />
      {/* signboard */}
      <rect x={30} y={top + 30} width={w - 60} height={96} rx={8} fill="#E9E2D2" stroke={INK} strokeWidth={6} />
      <text x={w / 2} y={top + 95} textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize={50} letterSpacing="0.06em" fill="#16181D">{name}</text>
      {/* awning */}
      <g>
        {stripes.map((_, i) => (
          <path key={i} d={`M ${(i * w) / 7} ${top + 150} h ${w / 7} v 70 q ${-w / 14} 34 ${-w / 7} 0 z`} fill={i % 2 ? "#E9E2D2" : awning} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        ))}
      </g>
      {/* shelves with goods */}
      <rect x={40} y={top + 250} width={w - 80} height={300} fill="#232A36" stroke={INK} strokeWidth={6} />
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <line x1={40} x2={w - 40} y1={top + 345 + r * 100} y2={top + 345 + r * 100} stroke={INK} strokeWidth={6} />
          {Array.from({ length: big ? 7 : 6 }).map((_, i) => {
            const bx = 58 + i * ((w - 116) / (big ? 7 : 6));
            const hh = 46 + ((i * 37 + r * 13) % 30);
            const c = ["#E9A23B", "#C8323A", "#5B8CFF", "#E9E2D2", MARKET_GREEN, "#C9A45C"][(i + r * 2) % 6];
            return <rect key={i} x={bx} y={top + 345 + r * 100 - hh} width={(w - 116) / (big ? 7 : 6) - 10} height={hh} rx={5} fill={c} stroke={INK} strokeWidth={4} />;
          })}
        </g>
      ))}
      {/* counter */}
      <rect x={-12} y={top + 560} width={w + 24} height={140} rx={8} fill="#2B3340" stroke={INK} strokeWidth={7} />
      <rect x={30} y={top + 585} width={w - 60} height={18} rx={9} fill="#3A4454" />
    </g>
  );
};

const Tag: React.FC<{ x: number; y: number; text: string; p: number; sway: number }> = ({ x, y, text, p, sway }) => (
  <g transform={`translate(${x} ${y - 80 * (1 - p)}) rotate(${sway})`} opacity={p}>
    <line x1={0} y1={-70} x2={0} y2={0} stroke="#E9E2D2" strokeWidth={4} />
    <rect x={-120} y={0} width={240} height={120} rx={16} fill={color.amber} stroke={INK} strokeWidth={7} />
    <circle cx={0} cy={22} r={9} fill={INK} />
    <text x={0} y={98} textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize={64} fill={INK}>{text}</text>
  </g>
);

const Row: React.FC<{ y: number; p: number; label: string; a: string; b: string; hot?: boolean }> = ({ y, p, label, a, b, hot }) => (
  <g opacity={p} transform={`translate(0 ${24 * (1 - p)})`}>
    <text x={540} y={y} textAnchor="middle" fontFamily={font.text} fontWeight={700} fontSize={30} letterSpacing="0.18em" fill={color.inkDim}>{label}</text>
    <text x={295} y={y + 74} textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize={62} fill={hot ? color.amberHot : color.ink}>{a}</text>
    <text x={785} y={y + 74} textAnchor="middle" fontFamily={font.display} fontWeight={800} fontSize={62} fill={color.ink}>{b}</text>
  </g>
);

/** t is seconds into the market scene; `say` gives the absolute times of the cue words. */
export const Market: React.FC<{ t: number; tagA: number; tagB: number; cap: number; labels: number[]; dim: number }> = ({ t, tagA, tagB, cap, labels, dim }) => {
  const LAB = ["PROFIT", "DEBT", "GROWTH", "VALUATION"];
  const sub = ["Kitna kamaati hai", "Kitna karza hai", "Kitni grow kar sakti hai", "Uske liye kitna pay kar raha hai"];
  const labelsOn = labels.map((a) => prog(t, a, 0.4, ease.outExpo));
  const dimAll = clamp01(labelsOn[0] * 1.4) * 0.72;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A0D14" />
          <stop offset="1" stopColor="#151B27" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#mk-sky)" />
      {/* string of bulbs across the lane (flat dots, no bloom) */}
      <path d="M -20 470 Q 540 600 1100 470" fill="none" stroke="#2C3240" strokeWidth={4} />
      {Array.from({ length: 13 }).map((_, i) => {
        const u = i / 12, bx = -20 + u * 1120, by = 470 + 4 * u * (1 - u) * 130;
        return <circle key={i} cx={bx} cy={by + 14} r={11} fill={i % 3 === 0 ? color.amberHot : "#E9E2D2"} opacity={0.85} />;
      })}
      {/* ground */}
      <rect x={0} y={1350} width={1080} height={570} fill="#10141C" />
      <line x1={0} x2={1080} y1={1352} y2={1352} stroke={INK} strokeWidth={6} />
      <g opacity={1 - dim}>
        <Shop x={80} awning="#2F8F83" name="DUKAAN A" />
        <Shop x={570} awning="#9C3A4C" name="DUKAAN B" big />
        <Tag x={295} y={520} text="₹50" p={prog(t, tagA, 0.5, ease.outExpo)} sway={Math.sin(t * 2.2) * 2.2} />
        <Tag x={785} y={520} text="₹500" p={prog(t, tagB, 0.5, ease.outExpo)} sway={Math.sin(t * 2.2 + 1) * 2.2} />
      </g>
      {/* market cap: share price × total shares */}
      <rect x={0} y={1370} width={1080} height={300} fill="#0B0E14" opacity={prog(t, cap, 0.4)} />
      <Row y={1430} p={prog(t, cap, 0.45, ease.outExpo)} label="MARKET CAP  =  PRICE × TOTAL SHARES" a="₹5,000 cr" b="₹1,000 cr" hot />
      <g opacity={prog(t, cap + 0.5, 0.4)}>
        <text x={295} y={1560} textAnchor="middle" fontFamily={font.text} fontWeight={500} fontSize={28} fill={color.inkDim}>₹50 × 100 cr shares</text>
        <text x={785} y={1560} textAnchor="middle" fontFamily={font.text} fontWeight={500} fontSize={28} fill={color.inkDim}>₹500 × 2 cr shares</text>
        <text x={540} y={1620} textAnchor="middle" fontFamily={font.text} fontWeight={500} fontSize={24} letterSpacing="0.12em" fill={color.inkFaint}>ILLUSTRATIVE NUMBERS</text>
      </g>
      {/* the four questions, one per phrase */}
      <rect width={1080} height={1920} fill="#07090D" opacity={dimAll} />
      {LAB.map((l, i) => {
        const p = labelsOn[i];
        const y = 760 + i * 170;
        return (
          <g key={l} opacity={p} transform={`translate(${-40 * (1 - p)} 0)`}>
            <rect x={150} y={y - 70} width={8} height={100} fill={color.amber} />
            <text x={190} y={y} fontFamily={font.display} fontWeight={800} fontSize={86} letterSpacing="0.02em" fill={color.ink}>{l}</text>
            <text x={192} y={y + 46} fontFamily={font.text} fontWeight={500} fontSize={32} fill={color.inkDim}>{sub[i]}</text>
          </g>
        );
      })}
    </svg>
  );
};
