import { Navbar } from "@/components/navbar";
import type { TeamMember, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppShellPageProps = {
  role: UserRole;
  teamMembers?: TeamMember[];
  children: React.ReactNode;
  className?: string;
};

export function AppShellPage({
  role,
  teamMembers = [],
  children,
  className,
}: AppShellPageProps) {
  return (
    <div className="relative flex min-h-svh flex-col">
      <Navbar role={role} teamMembers={teamMembers} />
      <main
        className={cn(
          "notebook-page mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-[calc(3.5rem+2rem)] sm:px-8 sm:pt-[calc(3.5rem+2.5rem)]",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}
