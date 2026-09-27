import Link from "next/link";

import { DiscoveryPreferencesForm } from "@/components/forms/discovery-preferences-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDiscoveryPreferencesByUserId } from "@/lib/db/discovery-preferences";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";

export default async function DiscoveryPreferencesPage() {
  const user = await requireCurrentUserWithProfile();

  const preferences = await getDiscoveryPreferencesByUserId(user.id);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Discovery
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Your preferences
            </h1>

            <p className="mt-2 text-muted-foreground">
              Choose who you would like Lumora to show you as you discover new
              people.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/profile">Back to profile</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Discovery preferences</CardTitle>
            <CardDescription>
              These settings will be used later when Lumora builds your
              discovery recommendations.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <DiscoveryPreferencesForm
              initialMinAge={preferences?.minAge}
              initialMaxAge={preferences?.maxAge}
              initialInterestedInGenders={
                preferences?.interestedInGenders ?? []
              }
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
