"use client";

import { useEffect, useState } from "react";
import type { WorkspaceNiche } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Pin } from "lucide-react";

const ROTATE_MS = 5000;

type NicheBannerProps = {
  niches: WorkspaceNiche[];
  chromeHidden?: boolean;
};

export function NicheBanner({ niches, chromeHidden = false }: NicheBannerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [niches.length]);

  useEffect(() => {
    if (niches.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % niches.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [niches.length]);

  if (niches.length === 0) return null;

  const active = niches[index] ?? niches[0];

  return (
    <div
      className={cn(
        "fixed left-0 right-0 top-14 z-40 border-b border-amber-200/60 bg-amber-50/90 backdrop-blur-sm dark:border-amber-900/40 dark:bg-amber-950/40",
        "transition-transform duration-300 ease-in-out motion-reduce:transition-none",
        chromeHidden && "-translate-y-[calc(100%+3.5rem)] pointer-events-none",
      )}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
        <Pin
          className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-center text-sm font-medium tracking-tight text-amber-950 dark:text-amber-100">
          <span key={active.id} className="inline-block transition-opacity duration-500">
            {active.message}
          </span>
        </p>
        {niches.length > 1 ? (
          <span className="shrink-0 text-[10px] tabular-nums text-amber-700/80 dark:text-amber-300/80">
            {index + 1}/{niches.length}
          </span>
        ) : (
          <span className="w-7 shrink-0" aria-hidden />
        )}
      </div>
    </div>
  );
}
