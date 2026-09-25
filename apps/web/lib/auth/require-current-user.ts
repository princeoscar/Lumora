import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { canAccessApp } from "@/lib/auth/user-access";

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessApp(user)) {
    redirect("/account-disabled");
  }

  return user;
}
