import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";

export default async function DashboardPage() {
  const user = await requireCurrentUserWithProfile();
  const profile = user.profile;

  return (
    <main className="flex min-h-screen flex-col gap-4 p-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">
          Welcome, {profile?.firstName}
        </h1>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/profile">Profile</Link>
          </Button>

          <UserButton />
        </div>
      </header>

      <div className="rounded-lg border bg-card p-6">
        <p className="text-sm text-muted-foreground">Your Lumora profile</p>

        <div className="mt-4 grid gap-2 text-sm">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>

          <p>
            <span className="font-medium">Name:</span> {profile?.firstName}{" "}
            {profile?.lastName ?? ""}
          </p>

          <p>
            <span className="font-medium">Gender:</span> {profile?.gender}
          </p>

          <p>
            <span className="font-medium">Date of birth:</span>{" "}
            {profile?.dateOfBirth.toISOString().slice(0, 10)}
          </p>

          <p>
            <span className="font-medium">Role:</span> {user.role}
          </p>

          <p>
            <span className="font-medium">Account status:</span>{" "}
            {user.accountStatus}
          </p>
        </div>
      </div>
    </main>
  );
}
