import { cn } from "@/lib/utils";

export function AuthMessage({
  variant = "error",
  children,
  className,
}: {
  variant?: "error" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
        variant === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-muted-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
