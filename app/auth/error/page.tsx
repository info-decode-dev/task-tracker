import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { AUTH_ROUTES } from "@/lib/auth/routes";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const message =
    params.error ??
    "Something went wrong during authentication. Please try again.";

  return (
    <AuthShell
      title="Authentication failed"
      description="We couldn't complete your sign-in request."
    >
      <div className="space-y-5">
        <AuthMessage>{message}</AuthMessage>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="h-11 flex-1">
            <Link href={AUTH_ROUTES.login}>Back to sign in</Link>
          </Button>
          <Button asChild variant="outline" className="h-11 flex-1">
            <Link href={AUTH_ROUTES.signUp}>Create account</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
