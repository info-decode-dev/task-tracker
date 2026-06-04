export const AUTH_ROUTES = {
  login: "/auth/login",
  signUp: "/auth/sign-up",
  signUpSuccess: "/auth/sign-up-success",
  confirm: "/auth/confirm",
  error: "/auth/error",
  home: "/",
  profile: "/profile",
} as const;

export const PUBLIC_AUTH_PREFIXES = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/error",
  "/auth/confirm",
] as const;

export function isPublicAuthPath(pathname: string) {
  return PUBLIC_AUTH_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isGuestOnlyPath(pathname: string) {
  return pathname === AUTH_ROUTES.login || pathname === AUTH_ROUTES.signUp;
}

export function sanitizeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return AUTH_ROUTES.home;
  }
  if (isGuestOnlyPath(next) || next.startsWith("/auth/confirm")) {
    return AUTH_ROUTES.home;
  }
  return next;
}
