import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="app-bottom-offset min-h-0 flex-1">{children}</div>
      <BottomNav />
    </div>
  );
}
