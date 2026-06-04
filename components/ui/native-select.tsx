import { cn } from "@/lib/utils";

export const nativeSelectClassName = cn(
  "flex h-9 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm shadow-sm",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function NativeSelect({ className, ...props }: NativeSelectProps) {
  return <select className={cn(nativeSelectClassName, className)} {...props} />;
}
