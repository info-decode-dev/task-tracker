import { redirect } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";

export default function LoginRedirectPage() {
  redirect(AUTH_ROUTES.login);
}
