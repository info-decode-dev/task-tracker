import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s · Task Tracker",
    default: "Account · Task Tracker",
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-background">{children}</div>
  );
}
