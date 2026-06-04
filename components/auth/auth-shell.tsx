import Link from "next/link";
import { BadgeCheck, CheckSquare2 } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/auth/routes";

type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showWedvueBadge?: boolean;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  showWedvueBadge = false,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--muted)/0.6),transparent_55%)]"
      />

      <div className="relative flex flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[420px]">
        <Link
          href={AUTH_ROUTES.login}
          className="mb-8 inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CheckSquare2 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="flex items-center gap-2 text-base font-semibold tracking-tight">
            <span>Task Tracker</span>
            {showWedvueBadge ? (
              <>
                <span
                  className="font-normal text-muted-foreground"
                  aria-hidden
                >
                  |
                </span>
                <span className="flex items-center gap-1">
                  Wedvue
                  <BadgeCheck
                    className="h-4 w-4 shrink-0 fill-[#1D9BF0] text-[#1D9BF0] stroke-white"
                    strokeWidth={2.5}
                    aria-label="Verified"
                  />
                </span>
              </>
            ) : null}
          </span>
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <header className="mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </header>

          {children}
        </div>

        {footer ? (
          <footer className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </footer>
        ) : null}
      </div>
      </div>

      {showWedvueBadge ? (
        <footer className="relative border-t border-border/50 px-4 py-5 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            The official task tracker for{" "}
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              Wedvue
              <BadgeCheck
                className="h-3.5 w-3.5 shrink-0 fill-[#1D9BF0] text-[#1D9BF0] stroke-white"
                strokeWidth={2.5}
                aria-hidden
              />
            </span>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
