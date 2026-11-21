"use client";

import { useEffect, useRef } from "react";

/**
 * The store's own "earth to shop" clip. Loads only when scrolled into view,
 * plays once (muted, inline) and rests on the storefront frame.
 * With reduced motion it never plays: the storefront poster is shown.
 */
export function StoreVideo({ caption }: { caption: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          v.poster = "/media/batala-store-start.jpg";
          v.play().catch(() => (v.poster = "/media/batala-store-poster.jpg"));
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="overflow-hidden rounded-panel bg-forest shadow-float">
      <video
        ref={ref}
        className="aspect-video w-full object-cover"
        src="/media/batala-store.mp4"
        poster="/media/batala-store-poster.jpg"
        muted
        playsInline
        preload="none"
        aria-label={caption}
        onEnded={(e) => (e.currentTarget.poster = "/media/batala-store-poster.jpg")}
      />
      <figcaption className="flex items-center justify-between px-5 py-3.5 text-xs text-ivory/70">
        <span>{caption}</span>
        <span className="font-mono tracking-wider text-ivory/70">31.81°N · 75.20°E</span>
      </figcaption>
    </figure>
  );
}
