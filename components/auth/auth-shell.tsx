import Link from "next/link";
import { CheckSquare2 } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/auth/routes";

type AuthShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative flex min-h-svh flex-col justify-center px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--muted)/0.6),transparent_55%)]"
      />

      <div className="relative mx-auto w-full max-w-[420px]">
        <Link
          href={AUTH_ROUTES.login}
          className="mb-8 inline-flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CheckSquare2 className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="text-base font-semibold tracking-tight">
            Task Tracker
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
  );
}
