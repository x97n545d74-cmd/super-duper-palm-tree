"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * AVRON entrances for the whole site: every element marked data-rv (or a
 * .split headline, .toast, .hl, or a [data-rv-group] section) gets the class
 * "in" when it scrolls into view. CSS does the motion (globals.css).
 * Runs again after client-side navigation.
 */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("no-js");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.dataset.motion = "off";
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-rv],[data-rv-group],.split"));
    // Elements already on screen at load reveal straight away (after the entry video, if it plays).
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );
    const start = () => els.forEach((el) => !el.classList.contains("in") && io.observe(el));
    if (root.dataset.intro === "on") {
      const onDone = () => start();
      window.addEventListener("intro:done", onDone, { once: true });
      return () => {
        window.removeEventListener("intro:done", onDone);
        io.disconnect();
      };
    }
    start();
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
