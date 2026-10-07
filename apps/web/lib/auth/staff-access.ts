import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { canAccessApp } from "@/lib/auth/user-access";

export async function requireModerator() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessApp(user)) {
    redirect("/account-disabled");
  }

  if (user.role !== "MODERATOR" && user.role !== "ADMIN") {
    throw new Error("Forbidden.");
  }

  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessApp(user)) {
    redirect("/account-disabled");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Forbidden.");
  }

  return user;
}
