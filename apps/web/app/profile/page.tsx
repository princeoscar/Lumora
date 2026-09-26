import Link from "next/link";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getProfileWithMediaByUserId } from "@/lib/db/profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const user = await requireCurrentUserWithProfile();
  const profile = await getProfileWithMediaByUserId(user.id);

  if (!profile) {
    return null;
  }

  const today = new Date();

  let age = today.getFullYear() - profile.dateOfBirth.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > profile.dateOfBirth.getMonth() ||
    (today.getMonth() === profile.dateOfBirth.getMonth() &&
      today.getDate() >= profile.dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Your profile
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {profile.displayName ||
                `${profile.firstName} ${profile.lastName ?? ""}`.trim()}
            </h1>

            <p className="mt-2 text-muted-foreground">
              This is how your profile information is currently stored in
              Lumora.
            </p>
          </div>

          <Button asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>About you</CardTitle>
              <CardDescription>
                Your personal profile information.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">First name</p>
                <p className="mt-1 font-medium">{profile.firstName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last name</p>
                <p className="mt-1 font-medium">
                  {profile.lastName || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="mt-1 font-medium">{age}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="mt-1 font-medium">{profile.gender}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Occupation</p>
                <p className="mt-1 font-medium">
                  {profile.occupation || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="mt-1 font-medium">
                  {profile.company || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Profile visibility
                </p>
                <p className="mt-1 font-medium">{profile.profileVisibility}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Profile photos</p>
                <p className="mt-1 font-medium">{profile.media.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bio</CardTitle>
              <CardDescription>
                A short introduction that represents you.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="leading-7 text-muted-foreground">
                {profile.bio || "You have not added a bio yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Your Lumora account information.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="mt-1 font-medium">{user.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
