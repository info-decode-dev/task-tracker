"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, User } from "lucide-react";

function getInitials(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

export function ProfileMenu({ role }: { role?: "admin" | "member" }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const logout = async () => {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign(AUTH_ROUTES.login);
  };

  const initials = email ? getInitials(email) : null;

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-9 w-9 rounded-full border-border/80 bg-muted/50 shadow-sm",
          open && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        )}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open profile menu"
      >
        {initials ? (
          <span className="text-xs font-semibold tracking-tight">{initials}</span>
        ) : (
          <User className="h-4 w-4" aria-hidden />
        )}
      </Button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[12rem] overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-lg"
        >
          <div className="border-b border-border/60 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-medium">
              {email ?? "Your account"}
            </p>
            {role ? (
              <p className="text-[11px] capitalize text-muted-foreground">
                {role}
              </p>
            ) : null}
          </div>
          <Link
            href={AUTH_ROUTES.profile}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
