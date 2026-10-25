import React from "react";
import { faceAt, Key } from "../ep01/Character";
import { clamp01, rand } from "../../engine/anim";

/*
 * "Tips wale Chacha": the third lead. Drawn in SVG to match the reference sheet's style (thick black
 * ink, flat fills, big round chibi head, stick limbs): a full grey puff of hair, square specs, a big
 * moustache, a gold chain over a maroon jacket, and a phone full of forwarded tips held up high.
 * (Deliberately not bald / round-specs / plain kurta, so he never reads as a caricature of a real person.)
 * Coordinates are the same 2x sheet scale as the boy and girl, so the same `k` puts them side by side.
 */
const W = 1000, H = 1860;
const INK = "#121014", SKIN = "#FECDA4", SKIN_SH = "#F3B98C", HAIR = "#B9BAC2", KURTA = "#F1EEE6", JACKET = "#8E2F3C", JACKET_SH = "#6A1F2A", GOLD = "#E2B24A";
const SW = 11;

const blinkAt = (t: number) => {
  let s = 1.3, n = 0;
  while (s < t - 0.2) s += 2.9 + rand(41 + ++n * 3.7) * 1.6;
  const d = Math.abs(t - s);
  return d < 0.065 ? 1 - d / 0.065 : 0;
};

export const Chacha: React.FC<{ t: number; frame: number; keys: Key[]; x: number; y: number; k: number; mouth?: number[]; walk?: number; phone?: string[] }> = ({ t, frame, keys, x, y, k, mouth, walk = 0, phone }) => {
  const f = faceAt(keys, t);
  const open = f.mouth === "talk" ? (mouth?.[Math.min(frame, (mouth?.length ?? 1) - 1)] ?? 0) : 0;
  const sway = 0.5 * Math.sin((t / 3.4) * Math.PI * 2 + 0.9);
  const breath = 1 + 0.006 * Math.sin((t / 2.6) * Math.PI * 2);
  const step = Math.sin(t * Math.PI * 2 * 2.1);
  const hop = -Math.abs(step) * 24 * walk, rock = step * 3 * walk;
  const eyeS = Math.max(0.08, f.eye * (1 - blinkAt(t)));
  // phone arm waves a little while he talks
  const wave = f.mouth === "talk" ? Math.sin(t * 7) * 4 : 0;
  const cx = 500, cy = 430, R = 300;
  const ex = 92, ey = 450;
  const mx = cx + f.lookX * 0.6, my = 560;
  const mw = 70 * (0.7 + 0.3 * open), md = 95 * open;
  const browY = (raise: number) => ey - 95 - raise * 1.2;
  const lines = phone ?? ["🚀 KAL 5X PAKKA", "BUY @ ₹3", "Forward karo!!"];
  return (
    <div style={{
      position: "absolute", left: x - (W * k) / 2, top: y - H * k, width: W * k, height: H * k,
      transformOrigin: "50% 100%", transform: `translate(${f.dx}px, ${f.dy - 6 * open * k + hop}px) rotate(${sway + f.lean + rock}deg) scaleY(${breath})`,
    }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, transform: `scale(${k})`, transformOrigin: "0 0", overflow: "visible" }}>
        {/* legs: white pyjama, brown chappals */}
        <path d={`M 420 1330 L 400 1760 M 580 1330 L 600 1760`} stroke={INK} strokeWidth={SW * 5.2} strokeLinecap="round" />
        <path d={`M 420 1330 L 400 1760 M 580 1330 L 600 1760`} stroke={KURTA} strokeWidth={SW * 3.4} strokeLinecap="round" />
        <ellipse cx={385} cy={1790} rx={95} ry={34} fill={JACKET_SH} stroke={INK} strokeWidth={SW} />
        <ellipse cx={615} cy={1790} rx={95} ry={34} fill={JACKET_SH} stroke={INK} strokeWidth={SW} />
        {/* kurta */}
        <path d="M 330 790 Q 300 1080 290 1390 L 710 1390 Q 700 1080 670 790 Z" fill={KURTA} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        {/* Nehru jacket */}
        <path d="M 335 800 Q 312 1020 318 1250 L 470 1265 L 488 840 Z" fill={JACKET} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        <path d="M 665 800 Q 688 1020 682 1250 L 530 1265 L 512 840 Z" fill={JACKET} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
        {[930, 1030, 1130].map((yy) => <circle key={yy} cx={502} cy={yy} r={13} fill={INK} />)}
        <path d="M 440 800 Q 500 930 560 800" fill="none" stroke={INK} strokeWidth={16} />
        <path d="M 440 800 Q 500 930 560 800" fill="none" stroke={GOLD} strokeWidth={9} />
        <circle cx={500} cy={872} r={20} fill={GOLD} stroke={INK} strokeWidth={6} />
        <rect x={360} y={1000} width={70} height={14} rx={7} fill={JACKET_SH} />
        {/* left arm on hip */}
        <path d="M 340 840 Q 230 960 300 1090" fill="none" stroke={INK} strokeWidth={SW * 6.4} strokeLinecap="round" />
        <path d="M 340 840 Q 230 960 300 1090" fill="none" stroke={KURTA} strokeWidth={SW * 4.6} strokeLinecap="round" />
        {/* right arm up with the phone */}
        <g transform={`rotate(${wave} 660 840)`}>
          <path d="M 660 840 Q 800 760 815 560" fill="none" stroke={INK} strokeWidth={SW * 6.4} strokeLinecap="round" />
          <path d="M 660 840 Q 800 760 815 560" fill="none" stroke={KURTA} strokeWidth={SW * 4.6} strokeLinecap="round" />
          <g transform="translate(815 470) rotate(8)">
            <rect x={-95} y={-170} width={190} height={330} rx={26} fill="#1C1F26" stroke={INK} strokeWidth={SW} />
            <rect x={-78} y={-148} width={156} height={280} rx={14} fill="#E8F1EA" />
            {lines.map((l, i) => (
              <g key={i} transform={`translate(0 ${-112 + i * 88})`}>
                <rect x={-70} y={-26} width={140} height={62} rx={12} fill={i === 2 ? "#CDEBD3" : "#FFFFFF"} stroke="#9FB8A6" strokeWidth={3} />
                <text x={0} y={14} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={l.length > 12 ? 19 : 24} fill="#16301F">{l}</text>
              </g>
            ))}
            <circle cx={-48} cy={70} r={30} fill={SKIN} stroke={INK} strokeWidth={8} />
          </g>
        </g>
        {/* neck */}
        <rect x={462} y={700} width={76} height={110} fill={SKIN} stroke={INK} strokeWidth={SW} />
        {/* head */}
        <g transform={`rotate(${f.lean * 0.4} ${cx} ${cy + R})`}>
          <ellipse cx={cx - R + 4} cy={cy + 40} rx={44} ry={62} fill={SKIN} stroke={INK} strokeWidth={SW} />
          <ellipse cx={cx + R - 4} cy={cy + 40} rx={44} ry={62} fill={SKIN} stroke={INK} strokeWidth={SW} />
          <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.96} fill={SKIN} stroke={INK} strokeWidth={SW} />
          <path d={`M ${cx - 300} ${cy + 10} Q ${cx - 330} ${cy - 250} ${cx - 120} ${cy - 330} Q ${cx + 40} ${cy - 390} ${cx + 190} ${cy - 320}
            Q ${cx + 330} ${cy - 250} ${cx + 300} ${cy + 10} Q ${cx + 250} ${cy - 150} ${cx + 120} ${cy - 190} Q ${cx - 20} ${cy - 120} ${cx - 160} ${cy - 175} Q ${cx - 260} ${cy - 140} ${cx - 300} ${cy + 10} Z`}
            fill={HAIR} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          {[[-150, -250], [-20, -300], [120, -270], [230, -200]].map(([dx, dy], i) => (
            <path key={i} d={`M ${cx + dx - 40} ${cy + dy + 20} q 40 -40 80 0`} fill="none" stroke="#8F909A" strokeWidth={7} strokeLinecap="round" />
          ))}
          <ellipse cx={cx - 175} cy={cy + 130} rx={42} ry={22} fill={SKIN_SH} opacity={0.6} />
          <ellipse cx={cx + 175} cy={cy + 130} rx={42} ry={22} fill={SKIN_SH} opacity={0.6} />
          {/* brows */}
          {[-1, 1].map((s) => {
            const raise = s < 0 ? f.browL : f.browR;
            const rot = s * -f.tilt * 9;
            return <path key={s} d={`M ${cx + s * ex - 44} ${browY(raise)} q 44 -22 88 0`} transform={`rotate(${rot} ${cx + s * ex} ${browY(raise)})`}
              fill="none" stroke={HAIR} strokeWidth={22} strokeLinecap="round" />;
          })}
          {/* eyes */}
          {[-1, 1].map((s) => (
            <ellipse key={s} cx={cx + s * ex + f.lookX} cy={ey + f.lookY} rx={24} ry={30 * eyeS} fill={INK} />
          ))}
          {/* round specs */}
          {[-1, 1].map((s) => <rect key={s} x={cx + s * ex - 72} y={ey - 56} width={144} height={112} rx={22} fill="rgba(255,255,255,0.12)" stroke={INK} strokeWidth={10} />)}
          <path d={`M ${cx - ex + 72} ${ey - 10} L ${cx + ex - 72} ${ey - 10}`} fill="none" stroke={INK} strokeWidth={10} />
          {/* mouth */}
          {open > 0.07 ? (
            <path d={`M ${mx - mw} ${my} Q ${mx} ${my + 8} ${mx + mw} ${my} C ${mx + mw} ${my + md} ${mx - mw} ${my + md} ${mx - mw} ${my} Z`} fill="#9C3A4C" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          ) : (
            <path d={`M ${mx - 46} ${my + 6} Q ${mx} ${my + 6 + (f.mouth === "frown" ? -26 : 22) * clamp01(f.mouthAmt)} ${mx + 46} ${my + 6}`} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
          )}
          {/* moustache sits over the top lip */}
          <path d={`M ${mx} ${my - 22} q -70 -44 -185 0 q -10 30 20 34 q 70 6 165 -34 z M ${mx} ${my - 22} q 70 -44 185 0 q 10 30 -20 34 q -70 6 -165 -34 z`}
            fill="#4A4A50" stroke={INK} strokeWidth={8} strokeLinejoin="round" transform={`translate(0 ${-open * 10})`} />
        </g>
      </svg>
    </div>
  );
};
