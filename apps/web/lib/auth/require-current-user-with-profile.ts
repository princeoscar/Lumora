import { redirect } from "next/navigation";

import { getCurrentUserWithProfile } from "@/lib/auth/get-current-user-with-profile";
import { canAccessApp } from "@/lib/auth/user-access";

export async function requireCurrentUserWithProfile() {
  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect("/sign-in");
  }

  if (!canAccessApp(user)) {
    redirect("/account-disabled");
  }

  if (!user.onboardingCompleted || !user.profile) {
    redirect("/onboarding");
  }

  return user;
}
