import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthShell
      showWedvueBadge
      title="Create your account"
      description="Start tracking tasks in organized sections."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
