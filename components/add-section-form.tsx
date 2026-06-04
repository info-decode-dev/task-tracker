"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSection } from "@/app/actions/tracker";
import { BookmarkColorPicker } from "@/components/bookmark-color-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getAvailableBookmarkColors,
  getDefaultBookmarkColor,
  type BookmarkColorId,
} from "@/lib/section-bookmarks";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

type AddSectionFormProps = {
  usedColorIds: string[];
  onCreated?: () => void;
  onCancel?: () => void;
  className?: string;
  autoFocus?: boolean;
};

export function AddSectionForm({
  usedColorIds,
  onCreated,
  onCancel,
  className,
  autoFocus = false,
}: AddSectionFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<BookmarkColorId>("rose");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasAvailableColors =
    getAvailableBookmarkColors(usedColorIds).length > 0;

  useEffect(() => {
    try {
      setColor(getDefaultBookmarkColor(usedColorIds));
    } catch {
      /* all colors used */
    }
  }, [usedColorIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await createSection(title, color);
        setTitle("");
        router.refresh();
        onCreated?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create section");
      }
    });
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <BookmarkColorPicker
        usedColorIds={usedColorIds}
        value={color}
        onChange={setColor}
      />

      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={cn(
            "flex items-center gap-1 rounded-2xl border border-border/80 bg-background p-1.5 pl-4 shadow-sm",
            "transition-shadow focus-within:border-foreground/20 focus-within:ring-2 focus-within:ring-ring/20",
          )}
        >
          <Input
            placeholder="Section name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            autoFocus={autoFocus}
            className="h-10 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl"
            disabled={isPending || !title.trim() || !hasAvailableColors}
            aria-label="Create section"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}
