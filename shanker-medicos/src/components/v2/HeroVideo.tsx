"use client";

import { useRef, useState } from "react";

/**
 * The hero's media frame. The entry video lands here (data-intro-target);
 * afterwards it rests on the storefront frame, and a tap replays the clip.
 */
export function HeroVideo({ alt, replay }: { alt: string; replay: string }) {
  const [playing, setPlaying] = useState(false);
  const v = useRef<HTMLVideoElement>(null);
  return (
    <div data-intro-target className="relative aspect-video overflow-hidden rounded-panel border border-line bg-forest shadow-float">
      {playing ? (
        <video
          ref={v}
          className="h-full w-full object-cover"
          src="/media/batala-store.mp4"
          poster="/media/batala-store-start.jpg"
          autoPlay
          muted
          playsInline
          aria-label={alt}
          onEnded={() => setPlaying(false)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/media/batala-store-poster.jpg" alt={alt} width={1280} height={720} className="h-full w-full object-cover" fetchPriority="high" />
      )}
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute bottom-3 left-3 inline-flex h-10 items-center gap-2 rounded-[12px] bg-white/90 px-3.5 text-sm font-semibold text-forest shadow-lift backdrop-blur transition hover:bg-white"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l10.5-6.5z" />
          </svg>
          {replay}
        </button>
      )}
      <span className="absolute right-3 top-3 rounded-[10px] bg-white/90 px-2.5 py-1 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-forest backdrop-blur">31.81°N · 75.20°E</span>
    </div>
  );
}
