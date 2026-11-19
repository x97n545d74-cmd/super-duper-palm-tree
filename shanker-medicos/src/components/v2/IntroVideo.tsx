"use client";

import { useEffect, useRef, useState } from "react";

type Labels = { skip: string; label: string; words: string[]; coords: string };

// The clip's cuts: space (0s), Batala from above (1.4s), the street (3.4s), the shop (4.9s).
const BEATS = [0.15, 1.4, 3.4, 4.9];
const ZOOM_AT = 6.1;

/**
 * Entry sequence (night cinematic). The store's earth-to-shop clip plays
 * full screen behind a black layer; giant words are cut out of that layer
 * so the video plays inside the letters (Punjab → Batala → Dera Road →
 * Shanker), each word on the clip's own cut. The last word zooms through
 * until the whole storefront shows, then the overlay lifts and the hero
 * (the same storefront) is underneath. Once per visit, homepage only,
 * never with reduced motion or for crawlers (see the layout's script).
 */
export function IntroVideo({ labels }: { labels: Labels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [beat, setBeat] = useState(-1);
  const [zoom, setZoom] = useState(false);
  const [progress, setProgress] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "on") return;
    try {
      sessionStorage.setItem("sm_intro", "1");
    } catch {}
    root.style.overflow = "hidden";
    const v = video.current;
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setZoom(true);
      wrap.current?.classList.add("leaving");
      window.dispatchEvent(new Event("intro:morph"));
      setTimeout(() => {
        root.style.overflow = "";
        root.dataset.intro = "off";
        window.dispatchEvent(new Event("intro:done"));
      }, 720);
    };
    const onTime = () => {
      if (!v) return;
      const t = v.currentTime;
      setProgress(v.duration ? t / v.duration : 0);
      let b = -1;
      BEATS.forEach((s, i) => t >= s && (b = i));
      setBeat(b);
      if (t >= ZOOM_AT) setZoom(true);
      if (t >= ZOOM_AT + 1.2) finish();
    };
    const safety = setTimeout(finish, 11000);
    if (v) {
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("ended", finish);
      v.play().catch(finish);
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && finish();
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(safety);
      v?.removeEventListener("timeupdate", onTime);
      v?.removeEventListener("ended", finish);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const skip = () => {
    video.current?.pause();
    video.current?.dispatchEvent(new Event("ended"));
  };
  const sizes = ["text-[30vw]", "text-[30vw]", "text-[21vw]", "text-[25vw]"];

  return (
    <div ref={wrap} className="intro" role="dialog" aria-label={labels.label}>
      <video ref={video} className="intro-video" src="/media/batala-store.mp4" poster="/media/batala-store-start.jpg" muted playsInline preload="auto" aria-hidden="true" />
      <div className={`ko ${zoom ? "open" : ""}`} aria-hidden="true">
        {labels.words.map((w, i) => {
          const last = i === labels.words.length - 1;
          const state = last && zoom ? "zoom" : i === beat ? "on" : i < beat ? "off" : "";
          return (
            <span key={i} lang={/[ऀ-੿]/.test(w) ? (/[਀-੿]/.test(w) ? "pa" : "hi") : "en"} className={`w ${sizes[i] || "text-[24vw]"} ${state}`}>
              {w}
            </span>
          );
        })}
      </div>
      <div className="vign" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-5 pb-5 sm:px-10 sm:pb-8">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-white/60">
          <span className="text-[#19c37d]">●</span> {labels.coords}
        </p>
        <button type="button" onClick={skip} className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white backdrop-blur hover:border-white">
          {labels.skip}
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
        <div className="h-full bg-[#19c37d]" style={{ width: `${progress * 100}%`, transition: "width .25s linear" }} />
      </div>
    </div>
  );
}
