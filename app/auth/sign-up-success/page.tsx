import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/auth/routes";

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check your email"
      description="We sent you a confirmation link to finish setting up your account."
      footer={
        <Link
          href={AUTH_ROUTES.login}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/40 p-4">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Open the email and tap the confirmation link. Once verified,
            you&apos;ll be signed in automatically.
          </p>
        </div>

        <Button asChild className="h-11 w-full">
          <Link href={AUTH_ROUTES.login}>Go to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  );
}
