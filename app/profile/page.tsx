import { redirect } from "next/navigation";
import { APP_ROUTES } from "@/lib/app-nav";

export default function ProfilePage() {
  redirect(APP_ROUTES.settings);
}
