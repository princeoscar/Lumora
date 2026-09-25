import { requireCurrentUser } from "@/lib/auth/require-current-user";

export default async function OnboardingPage() {
  const user = await requireCurrentUser();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Welcome to Lumora</p>

        <h1 className="mt-2 text-3xl font-semibold">
          Let&apos;s build your profile
        </h1>

        <p className="mt-3 text-muted-foreground">
          You&apos;re signed in as {user.email}. We&apos;ll use the next steps
          to create your Lumora profile.
        </p>

        <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <p>
            <span className="font-medium">Account status:</span>{" "}
            {user.accountStatus}
          </p>

          <p className="mt-2">
            <span className="font-medium">Onboarding:</span>{" "}
            {user.onboardingCompleted ? "Completed" : "Not completed"}
          </p>
        </div>
      </div>
    </main>
  );
}
