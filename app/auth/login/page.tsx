import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to manage your tasks and sections."
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
