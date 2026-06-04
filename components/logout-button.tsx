"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/lib/auth/routes";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(AUTH_ROUTES.login);
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={logout}>
      Logout
    </Button>
  );
}
