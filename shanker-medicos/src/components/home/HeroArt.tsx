import { LogoMarkGroup } from "@/components/brand/Logo";

/**
 * Hero still life, drawn in SVG so it is sharp at every size and weighs a few KB:
 * an amber apothecary bottle (house label), a carton and a tube.
 * Unbranded on purpose: no third-party product is shown as if it were ours.
 */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 520 600" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="h-amber" x1="0" x2="1">
            <stop offset="0" stopColor="#3E2208" />
            <stop offset=".2" stopColor="#7A4413" />
            <stop offset=".46" stopColor="#B8722A" />
            <stop offset=".58" stopColor="#C98A3E" />
            <stop offset=".82" stopColor="#7A4413" />
            <stop offset="1" stopColor="#331C07" />
          </linearGradient>
          <linearGradient id="h-cap" x1="0" x2="1">
            <stop offset="0" stopColor="#0A2418" />
            <stop offset=".45" stopColor="#1E5A3E" />
            <stop offset="1" stopColor="#081C13" />
          </linearGradient>
          <linearGradient id="h-white" x1="0" x2="1">
            <stop offset="0" stopColor="#D5DDD8" />
            <stop offset=".35" stopColor="#FFFFFF" />
            <stop offset=".75" stopColor="#F3F6F4" />
            <stop offset="1" stopColor="#BFC9C3" />
          </linearGradient>
          <linearGradient id="h-label" x1="0" x2="1">
            <stop offset="0" stopColor="#E9ECE6" />
            <stop offset=".4" stopColor="#FAFBF8" />
            <stop offset="1" stopColor="#DCE2DC" />
          </linearGradient>
          <radialGradient id="h-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#2C7A55" stopOpacity=".55" />
            <stop offset="1" stopColor="#123F2B" stopOpacity="0" />
          </radialGradient>
          <filter id="h-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <circle cx="270" cy="300" r="250" fill="url(#h-glow)" />

        {/* carton, back left */}
        <g transform="rotate(-9 150 360)">
          <ellipse cx="150" cy="548" rx="92" ry="14" fill="#000" opacity=".28" filter="url(#h-soft)" />
          <path d="M218 214l26-14v330l-26 16z" fill="#0E3524" />
          <path d="M82 214l26-14h136l-26 14z" fill="#E7ECE8" />
          <rect x="82" y="214" width="136" height="332" rx="3" fill="url(#h-white)" />
          <rect x="82" y="214" width="136" height="70" fill="#087A4B" />
          <rect x="100" y="312" width="78" height="10" rx="3" fill="#123F2B" />
          <rect x="100" y="332" width="96" height="6" rx="3" fill="#6D7971" opacity=".5" />
          <rect x="100" y="346" width="64" height="6" rx="3" fill="#6D7971" opacity=".5" />
          <LogoMarkGroup x={176} y={486} size={28} color="#087A4B" />
        </g>

        {/* tube, front right */}
        <g transform="rotate(16 420 430)">
          <ellipse cx="420" cy="560" rx="70" ry="10" fill="#000" opacity=".25" filter="url(#h-soft)" />
          <rect x="400" y="268" width="40" height="34" rx="5" fill="#0A2418" />
          <path d="M392 302h56l28 236H364z" fill="url(#h-white)" />
          <rect x="360" y="532" width="120" height="20" rx="2" fill="#C5CEC8" />
          <path d="M380 372h80l13 104H367z" fill="#123F2B" />
          <rect x="392" y="400" width="52" height="8" rx="3" fill="#FAFBF8" />
          <rect x="388" y="416" width="64" height="5" rx="2" fill="#FAFBF8" opacity=".55" />
        </g>

        {/* amber bottle, hero */}
        <g>
          <ellipse cx="282" cy="572" rx="130" ry="18" fill="#000" opacity=".35" filter="url(#h-soft)" />
          <rect x="206" y="92" width="152" height="74" rx="12" fill="url(#h-cap)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={214 + i * 10} y="98" width="3" height="62" rx="1.5" fill="#fff" opacity=".07" />
          ))}
          <path d="M218 166h128v22c42 14 64 44 64 88v268c0 18-14 30-32 30H186c-18 0-32-12-32-30V276c0-44 22-74 64-88z" fill="url(#h-amber)" />
          <path d="M170 300c0-40 18-66 52-78" stroke="#fff" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" fill="none" />
          <rect x="166" y="290" width="16" height="230" rx="8" fill="#fff" opacity=".12" />
          {/* label */}
          <rect x="160" y="300" width="244" height="190" rx="6" fill="url(#h-label)" />
          <rect x="160" y="300" width="244" height="40" fill="#123F2B" />
          <LogoMarkGroup x={176} y={306} size={28} color="#FAFBF8" />
          <rect x="214" y="316" width="86" height="8" rx="3" fill="#FAFBF8" opacity=".9" />
          <text x="182" y="392" fontFamily="var(--font-manrope), sans-serif" fontWeight="700" fontSize="34" letterSpacing="-1" fill="#123F2B">
            Daily
          </text>
          <text x="182" y="424" fontFamily="var(--font-manrope), sans-serif" fontWeight="500" fontSize="22" letterSpacing="-.4" fill="#087A4B">
            Essentials
          </text>
          <rect x="182" y="446" width="150" height="5" rx="2" fill="#6D7971" opacity=".45" />
          <rect x="182" y="458" width="110" height="5" rx="2" fill="#6D7971" opacity=".45" />
          <path d="M352 360c22 10 34 34 30 64-12-14-30-26-42-30 10-6 14-20 12-34z" fill="#087A4B" opacity=".9" />
          <path d="M352 360c2 22 2 44-6 62" stroke="#FAFBF8" strokeWidth="1.5" fill="none" opacity=".7" />
        </g>
      </svg>
    </div>
  );
}
