"use client";

import {
  getAvailableBookmarkColors,
  type BookmarkColorId,
  type BookmarkStyle,
} from "@/lib/section-bookmarks";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type BookmarkColorPickerProps = {
  usedColorIds: string[];
  value: BookmarkColorId;
  onChange: (colorId: BookmarkColorId) => void;
  excludeSectionId?: string;
  sections?: { id: string; color: string }[];
};

export function BookmarkColorPicker({
  usedColorIds,
  value,
  onChange,
  excludeSectionId,
  sections,
}: BookmarkColorPickerProps) {
  const available = getAvailableBookmarkColors(
    usedColorIds,
    excludeSectionId,
    sections,
  );

  if (available.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        All colors are in use. Delete a section or change another section&apos;s
        color to free one.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Bookmark color</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Bookmark color">
        {available.map((style) => (
          <ColorOption
            key={style.id}
            style={style}
            selected={value === style.id}
            onSelect={() => onChange(style.id)}
          />
        ))}
      </div>
    </div>
  );
}

function ColorOption({
  style,
  selected,
  onSelect,
}: {
  style: BookmarkStyle;
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = style.icon;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={style.label}
      title={style.label}
      onClick={onSelect}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
        style.swatch,
        style.border,
        selected
          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
          : "opacity-90 hover:scale-105 hover:opacity-100",
      )}
    >
      <Icon className={cn("h-4 w-4", style.text)} aria-hidden />
      {selected ? (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="h-2.5 w-2.5" strokeWidth={3} />
        </span>
      ) : null}
    </button>
  );
}
