import type { LucideIcon } from "lucide-react";
import { Bookmark } from "lucide-react";

export type BookmarkColorId =
  | "rose"
  | "amber"
  | "sky"
  | "emerald"
  | "violet"
  | "fuchsia"
  | "orange"
  | "cyan"
  | "indigo"
  | "lime";

export type BookmarkStyle = {
  id: BookmarkColorId;
  label: string;
  bg: string;
  border: string;
  text: string;
  swatch: string;
  icon: LucideIcon;
};

export const BOOKMARK_STYLES: BookmarkStyle[] = [
  {
    id: "rose",
    label: "Rose",
    bg: "bg-rose-500",
    border: "border-rose-600",
    text: "text-rose-950",
    swatch: "bg-rose-500",
    icon: Bookmark,
  },
  {
    id: "amber",
    label: "Amber",
    bg: "bg-amber-400",
    border: "border-amber-500",
    text: "text-amber-950",
    swatch: "bg-amber-400",
    icon: Bookmark,
  },
  {
    id: "sky",
    label: "Sky",
    bg: "bg-sky-500",
    border: "border-sky-600",
    text: "text-sky-950",
    swatch: "bg-sky-500",
    icon: Bookmark,
  },
  {
    id: "emerald",
    label: "Emerald",
    bg: "bg-emerald-500",
    border: "border-emerald-600",
    text: "text-emerald-950",
    swatch: "bg-emerald-500",
    icon: Bookmark,
  },
  {
    id: "violet",
    label: "Violet",
    bg: "bg-violet-500",
    border: "border-violet-600",
    text: "text-violet-950",
    swatch: "bg-violet-500",
    icon: Bookmark,
  },
  {
    id: "fuchsia",
    label: "Fuchsia",
    bg: "bg-fuchsia-500",
    border: "border-fuchsia-600",
    text: "text-fuchsia-950",
    swatch: "bg-fuchsia-500",
    icon: Bookmark,
  },
  {
    id: "orange",
    label: "Orange",
    bg: "bg-orange-500",
    border: "border-orange-600",
    text: "text-orange-950",
    swatch: "bg-orange-500",
    icon: Bookmark,
  },
  {
    id: "cyan",
    label: "Cyan",
    bg: "bg-cyan-500",
    border: "border-cyan-600",
    text: "text-cyan-950",
    swatch: "bg-cyan-500",
    icon: Bookmark,
  },
  {
    id: "indigo",
    label: "Indigo",
    bg: "bg-indigo-500",
    border: "border-indigo-600",
    text: "text-indigo-950",
    swatch: "bg-indigo-500",
    icon: Bookmark,
  },
  {
    id: "lime",
    label: "Lime",
    bg: "bg-lime-500",
    border: "border-lime-600",
    text: "text-lime-950",
    swatch: "bg-lime-500",
    icon: Bookmark,
  },
];

const styleById = new Map(BOOKMARK_STYLES.map((s) => [s.id, s]));

export function isBookmarkColorId(value: string): value is BookmarkColorId {
  return styleById.has(value as BookmarkColorId);
}

export function getBookmarkStyle(
  colorId: string | null | undefined,
  fallbackIndex = 0,
): BookmarkStyle {
  if (colorId && isBookmarkColorId(colorId)) {
    return styleById.get(colorId)!;
  }
  return BOOKMARK_STYLES[fallbackIndex % BOOKMARK_STYLES.length];
}

export function getAvailableBookmarkColors(
  usedColorIds: string[],
  excludeSectionId?: string,
  sections?: { id: string; color: string }[],
): BookmarkStyle[] {
  const used = new Set(usedColorIds);

  if (excludeSectionId && sections) {
    const current = sections.find((s) => s.id === excludeSectionId)?.color;
    if (current) used.delete(current);
  }

  return BOOKMARK_STYLES.filter((style) => !used.has(style.id));
}

export function getDefaultBookmarkColor(usedColorIds: string[]): BookmarkColorId {
  const available = getAvailableBookmarkColors(usedColorIds);
  if (available.length === 0) {
    throw new Error("All bookmark colors are already in use.");
  }
  return available[0].id;
}
