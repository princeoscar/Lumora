import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/forms/onboarding-form";
import { requireCurrentUser } from "@/lib/auth/require-current-user";

export default async function OnboardingPage() {
  const user = await requireCurrentUser();

  if (user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Welcome to Lumora</p>

        <h1 className="mt-2 text-3xl font-semibold">
          Let&apos;s build your profile
        </h1>

        <p className="mt-3 text-muted-foreground">
          Tell us a little about yourself to get started.
        </p>

        <OnboardingForm />
      </div>
    </main>
  );
}
