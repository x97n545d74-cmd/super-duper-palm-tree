"use client";

import { useEffect, useRef, useState } from "react";

type Labels = { skip: string; beats: string[]; label: string };

// Beat times match the clip: space (0s), Batala from above (1.4s), the street (3.4s), the shop (4.9s).
const BEATS = [0, 1.4, 3.4, 4.9];

/**
 * Entry video (AVRON motion): the store's earth-to-shop clip plays once per
 * visit inside one panel, with mono captions per beat. When it ends (or on
 * Skip) the panel morphs into the hero's video frame and the page enters.
 * Shown only when <html data-intro="on"> (set before paint by the script in
 * the layout: homepage, first visit this session, motion allowed).
 */
export function IntroVideo({ labels }: { labels: Labels }) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [beat, setBeat] = useState(0);
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
      const f = frame.current;
      const w = wrap.current;
      const target = document.querySelector<HTMLElement>("[data-intro-target]");
      const end = () => {
        root.style.overflow = "";
        root.dataset.intro = "off";
        window.dispatchEvent(new Event("intro:done"));
      };
      if (!f || !w || !target) return end();
      const a = f.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      if (b.bottom < 0 || b.top > window.innerHeight) return end();
      const sx = b.width / a.width;
      const tx = b.left + b.width / 2 - (a.left + a.width / 2);
      const ty = b.top + b.height / 2 - (a.top + a.height / 2);
      w.classList.add("leaving");
      f.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sx})`;
      f.style.borderRadius = `${26 / sx}px`;
      window.dispatchEvent(new Event("intro:morph"));
      setTimeout(end, 760);
    };
    const onTime = () => {
      if (!v) return;
      const t = v.currentTime;
      setProgress(v.duration ? t / v.duration : 0);
      let b = 0;
      BEATS.forEach((s, i) => t >= s && (b = i));
      setBeat(b);
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

  return (
    <div ref={wrap} className="intro" role="dialog" aria-label={labels.label}>
      <div className="fields" aria-hidden="true">
        <i />
      </div>
      <div className="relative z-10 w-[min(94vw,980px)]">
        <div ref={frame} className="frame relative overflow-hidden rounded-panel border border-line bg-forest shadow-float">
          <video ref={video} className="aspect-video w-full object-cover" src="/media/batala-store.mp4" poster="/media/batala-store-start.jpg" muted playsInline preload="auto" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
            <div className="h-full bg-white/80" style={{ width: `${progress * 100}%`, transition: "width .25s linear" }} />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p key={beat} className="split in font-mono text-sm uppercase tracking-[0.12em] text-ink sm:text-base" aria-live="polite">
            <span className="text-emerald">{String(beat + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-ink-2">/</span>
            {Array.from(labels.beats[beat] || "").map((ch, i) => (
              <span key={i} className="c" style={{ ["--ci" as string]: i }}>
                {ch === " " ? " " : ch}
              </span>
            ))}
          </p>
          <button type="button" onClick={skip} className="btn btn-ghost h-10 min-h-0 px-4 text-sm">
            {labels.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
