import Link from "next/link";

import { ProfileForm } from "@/components/forms/profile-form";
import { ProfileMediaManager } from "@/components/forms/profile-media-manager";
import { ProfileMediaUpload } from "@/components/forms/profile-media-upload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getProfileWithMediaByUserId } from "@/lib/db/profile";
import { MAX_PROFILE_PHOTOS } from "@/lib/profile/constants";

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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile photos</CardTitle>

            <CardDescription>
              {profile.media.length} of {MAX_PROFILE_PHOTOS} photos added.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            {profile.media.length < MAX_PROFILE_PHOTOS ? (
              <div className="grid gap-2">
                <p className="text-sm font-medium">
                  {MAX_PROFILE_PHOTOS - profile.media.length}{" "}
                  {MAX_PROFILE_PHOTOS - profile.media.length === 1
                    ? "photo"
                    : "photos"}{" "}
                  remaining.
                </p>

                <ProfileMediaUpload />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-sm font-medium">
                  You&apos;ve reached the maximum number of profile photos.
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Delete an existing photo before uploading another one.
                </p>
              </div>
            )}

            <ProfileMediaManager media={profile.media} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
