import Link from "next/link";

import { ProfileForm } from "@/components/forms/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getProfileWithMediaByUserId } from "@/lib/db/profile";

export default async function ProfileEditPage() {
  const user = await requireCurrentUserWithProfile();
  const profile = await getProfileWithMediaByUserId(user.id);

  if (!profile) {
    return null;
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Edit profile
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Update your profile
            </h1>

            <p className="mt-2 text-muted-foreground">
              Keep your Lumora profile information up to date.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/profile">Cancel</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile information</CardTitle>
          </CardHeader>

          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
