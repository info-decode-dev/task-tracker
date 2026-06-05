"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, type NavItemId } from "@/lib/app-nav";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ChartNoAxesGantt,
  Home,
  List,
  Settings,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS: Record<NavItemId, LucideIcon> = {
  list: List,
  timeline: ChartNoAxesGantt,
  home: Home,
  day: CalendarDays,
  settings: Settings,
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-xl"
      style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-2 sm:max-w-xl sm:px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.id];
          const active = isActive(pathname, item.href);

          if (item.prominent) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
                  "border border-border/60 bg-primary text-primary-foreground shadow-md",
                  "transition-transform hover:scale-105 active:scale-95",
                  active && "ring-2 ring-ring ring-offset-2 ring-offset-background",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl transition-colors",
                "hover:bg-muted/60",
                active
                  ? "text-foreground"
                  : item.enabled
                    ? "text-muted-foreground"
                    : "text-muted-foreground/55",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span
                className={cn(
                  "mt-1 h-1 w-1 rounded-full",
                  active ? "bg-foreground" : "bg-transparent",
                )}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
