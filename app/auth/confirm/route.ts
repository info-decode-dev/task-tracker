import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { AUTH_ROUTES, sanitizeNextPath } from "@/lib/auth/routes";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = sanitizeNextPath(searchParams.get("next"));

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    }
    redirect(
      `${AUTH_ROUTES.error}?error=${encodeURIComponent(error.message)}`,
    );
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      redirect(next);
    }
    redirect(
      `${AUTH_ROUTES.error}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(
    `${AUTH_ROUTES.error}?error=${encodeURIComponent(
      "Invalid confirmation link. Ask your admin to update the Supabase Confirm signup email template.",
    )}`,
  );
}
