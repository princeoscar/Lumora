import { requireCurrentUser } from "@/lib/auth/require-current-user";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="flex min-h-screen flex-col gap-4 p-10">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Signed in as</p>

        <p className="mt-1 text-lg font-medium">{user.email}</p>

        <div className="mt-4 grid gap-2 text-sm">
          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>

          <p>
            <span className="font-medium">Account status:</span>{" "}
            {user.accountStatus}
          </p>

          <p>
            <span className="font-medium">Onboarding:</span>{" "}
            {user.onboardingCompleted ? "Completed" : "Not completed"}
          </p>
        </div>
      </div>
    </main>
  );
}
