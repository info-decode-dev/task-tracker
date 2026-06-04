"use client";

import { useEffect, useState } from "react";

const SCROLL_END_MS = 180;

/** Hides fixed chrome while scrolling; shows again after scroll stops. */
export function useScrollChrome() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    let endTimer: ReturnType<typeof setTimeout>;

    const onScroll = () => {
      setHidden(true);
      clearTimeout(endTimer);
      endTimer = setTimeout(() => setHidden(false), SCROLL_END_MS);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(endTimer);
    };
  }, []);

  return hidden;
}
