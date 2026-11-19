import { useId } from "react";
import type { PackStyle } from "@/lib/types";

// Representative pack illustrations, used when no product photo has been
// uploaded. They are deliberately unbranded (no logos, no product text) so
// they can never be mistaken for a real packshot.

const ACCENTS = ["#123F2B", "#087A4B", "#2F6B5B", "#8B5A2B", "#36566E", "#6B4E71", "#4F6B2F"];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductArt({ style, seed, className = "" }: { style: PackStyle; seed: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const accent = ACCENTS[hash(seed) % ACCENTS.length];
  const g = (n: string) => `${n}-${uid}`;
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={g("bg")} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAF3EC" />
        </radialGradient>
        <linearGradient id={g("amber")} x1="0" x2="1">
          <stop offset="0" stopColor="#5C3410" />
          <stop offset=".28" stopColor="#A8641F" />
          <stop offset=".5" stopColor="#C98436" />
          <stop offset=".78" stopColor="#8A4F17" />
          <stop offset="1" stopColor="#4A2A0C" />
        </linearGradient>
        <linearGradient id={g("white")} x1="0" x2="1">
          <stop offset="0" stopColor="#DCE3DE" />
          <stop offset=".3" stopColor="#FFFFFF" />
          <stop offset=".7" stopColor="#F6F8F6" />
          <stop offset="1" stopColor="#CBD4CE" />
        </linearGradient>
        <linearGradient id={g("acc")} x1="0" x2="1">
          <stop offset="0" stopColor={accent} stopOpacity=".85" />
          <stop offset=".45" stopColor={accent} />
          <stop offset="1" stopColor={accent} stopOpacity=".8" />
        </linearGradient>
        <linearGradient id={g("shine")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${g("bg")})`} />
      <ellipse cx="200" cy="338" rx={style === "strip" ? 120 : 92} ry="12" fill="#123F2B" opacity=".12" />
      {renderShape(style, g, accent)}
    </svg>
  );
}

function Label({ x, y, w, h, accent }: { x: number; y: number; w: number; h: number; accent: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="4" fill="#FAFBF8" />
      <rect x={x} y={y} width={w} height={h * 0.22} fill={accent} />
      <rect x={x + w * 0.14} y={y + h * 0.36} width={w * 0.56} height={h * 0.09} rx="2" fill={accent} opacity=".85" />
      <rect x={x + w * 0.14} y={y + h * 0.53} width={w * 0.72} height={h * 0.05} rx="2" fill="#6D7971" opacity=".5" />
      <rect x={x + w * 0.14} y={y + h * 0.64} width={w * 0.48} height={h * 0.05} rx="2" fill="#6D7971" opacity=".5" />
    </g>
  );
}

function renderShape(style: PackStyle, g: (n: string) => string, accent: string) {
  const u = (n: string) => `url(#${g(n)})`;
  switch (style) {
    case "bottle":
      return (
        <g>
          <rect x="148" y="78" width="104" height="46" rx="8" fill="#123F2B" />
          <rect x="148" y="78" width="104" height="46" rx="8" fill={u("shine")} opacity=".3" />
          <path d="M156 124h88v18c22 8 34 24 34 48v128c0 12-10 20-22 20H144c-12 0-22-8-22-20V190c0-24 12-40 34-48z" fill={u("amber")} />
          <Label x={130} y={196} w={140} h={104} accent={accent} />
          <rect x="138" y="150" width="12" height="176" rx="6" fill="#fff" opacity=".18" />
        </g>
      );
    case "pump":
      return (
        <g>
          <path d="M186 64h56v14h-30v20h-26z" fill="#1C2721" />
          <rect x="178" y="96" width="44" height="34" rx="6" fill="#1C2721" />
          <path d="M150 130h100c14 0 24 10 24 24v170c0 12-10 20-22 20H148c-12 0-22-8-22-20V154c0-14 10-24 24-24z" fill={u("white")} />
          <Label x={142} y={180} w={116} h={120} accent={accent} />
        </g>
      );
    case "jar":
      return (
        <g>
          <rect x="120" y="120" width="160" height="46" rx="10" fill={accent} />
          <rect x="120" y="120" width="160" height="46" rx="10" fill={u("shine")} opacity=".35" />
          <path d="M124 166h152v150c0 14-10 24-24 24H148c-14 0-24-10-24-24z" fill={u("white")} />
          <Label x={136} y={200} w={128} h={96} accent={accent} />
        </g>
      );
    case "tube":
      return (
        <g transform="rotate(-14 200 210)">
          <rect x="182" y="64" width="36" height="34" rx="5" fill="#1C2721" />
          <path d="M168 98h64l26 214H142z" fill={u("white")} />
          <rect x="138" y="306" width="124" height="20" rx="2" fill="#CBD4CE" />
          <path d="M156 160h88l12 98H144z" fill={accent} />
          <rect x="170" y="186" width="56" height="8" rx="3" fill="#fff" opacity=".9" />
          <rect x="166" y="204" width="68" height="5" rx="2" fill="#fff" opacity=".55" />
        </g>
      );
    case "box":
      return (
        <g>
          <path d="M250 112l34-18v214l-34 22z" fill={accent} opacity=".75" />
          <path d="M126 112l34-18h124l-34 18z" fill="#F6F8F6" />
          <rect x="126" y="112" width="124" height="218" rx="3" fill={u("white")} />
          <rect x="126" y="112" width="124" height="56" fill={accent} />
          <rect x="142" y="190" width="70" height="10" rx="3" fill={accent} opacity=".85" />
          <rect x="142" y="210" width="92" height="6" rx="3" fill="#6D7971" opacity=".45" />
          <rect x="142" y="224" width="60" height="6" rx="3" fill="#6D7971" opacity=".45" />
          <circle cx="226" cy="296" r="12" fill={accent} opacity=".2" />
        </g>
      );
    case "strip":
      return (
        <g transform="rotate(-8 200 210)">
          <rect x="78" y="130" width="244" height="150" rx="10" fill="#DDE4E0" />
          <rect x="78" y="130" width="244" height="150" rx="10" fill={u("shine")} opacity=".6" />
          <rect x="78" y="130" width="244" height="26" rx="6" fill={accent} />
          {[0, 1, 2, 3, 4].map((c) =>
            [0, 1].map((r) => (
              <g key={`${c}${r}`}>
                <ellipse cx={110 + c * 45} cy={196 + r * 50} rx="17" ry="17" fill="#FFFFFF" stroke="#C3CCC6" strokeWidth="2" />
                <ellipse cx={106 + c * 45} cy={191 + r * 50} rx="6" ry="4" fill="#fff" />
              </g>
            )),
          )}
        </g>
      );
    case "device":
      return (
        <g>
          <rect x="104" y="96" width="192" height="236" rx="34" fill={u("white")} />
          <rect x="104" y="96" width="192" height="236" rx="34" fill="none" stroke="#C3CCC6" strokeWidth="2" />
          <rect x="132" y="128" width="136" height="96" rx="12" fill="#1C2721" />
          <rect x="146" y="146" width="62" height="30" rx="4" fill={accent} opacity=".9" />
          <rect x="146" y="186" width="96" height="8" rx="3" fill="#EAF3EC" opacity=".5" />
          <circle cx="200" cy="278" r="26" fill={accent} />
          <circle cx="200" cy="278" r="26" fill={u("shine")} opacity=".4" />
        </g>
      );
    case "sachet":
      return (
        <g transform="rotate(6 200 210)">
          <path d="M132 96 l6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 6-8 6 8 V326 H132z" fill={u("white")} />
          <rect x="132" y="150" width="136" height="70" fill={accent} />
          <rect x="150" y="174" width="70" height="10" rx="3" fill="#fff" />
          <rect x="150" y="192" width="96" height="6" rx="3" fill="#fff" opacity=".6" />
        </g>
      );
    case "pack":
    default:
      return (
        <g>
          <path d="M120 104h160l10 222c0 8-6 14-14 14H124c-8 0-14-6-14-14z" fill={u("white")} />
          <rect x="120" y="96" width="160" height="22" rx="4" fill="#CBD4CE" />
          <path d="M116 190h168l4 86H112z" fill={accent} />
          <rect x="140" y="214" width="84" height="10" rx="3" fill="#fff" />
          <rect x="140" y="232" width="110" height="6" rx="3" fill="#fff" opacity=".6" />
        </g>
      );
  }
}
