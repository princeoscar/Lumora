import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MainNav } from "@/components/navigation/main-nav";
import { PublicProfileActions } from "@/components/profile/public-profile-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getPublicProfileByUserId } from "@/lib/db/public-profile";

type PublicProfilePageProps = {
  params: Promise<{ userId: string }>;
  searchParams?: Promise<{ from?: string }>;
};

function calculateAge(dateOfBirth: Date) {
  const today = new Date();

  let age = today.getFullYear() - dateOfBirth.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: PublicProfilePageProps) {
  await requireCurrentUserWithProfile();

  const { userId } = await params;
  const { from } = (await searchParams) ?? {};

  const profile = await getPublicProfileByUserId(userId);

  if (!profile) {
    notFound();
  }

  const age = calculateAge(profile.dateOfBirth);

  const backLink =
    from === "likes"
      ? { href: "/likes", label: "Back to Likes" }
      : from === "matches"
        ? { href: "/matches", label: "Back to Matches" }
        : { href: "/discover", label: "Back to Discover" };

  return (
    <>
      <MainNav />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Profile
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {profile.displayName}, {age}
              </h1>
            </div>

            <Button asChild variant="outline">
              <Link href={backLink.href}>{backLink.label}</Link>
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {profile.media.length === 0 ? (
                  <div className="flex min-h-[500px] items-center justify-center bg-muted p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No profile photos available.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 p-3 sm:grid-cols-2">
                    {profile.media.map((media, index) => (
                      <div
                        key={media.id}
                        className={`relative overflow-hidden rounded-xl bg-muted ${
                          index === 0
                            ? "aspect-[4/5] sm:col-span-2"
                            : "aspect-square"
                        }`}
                      >
                        <Image
                          src={media.url}
                          alt={`${profile.displayName}'s profile photo`}
                          fill
                          sizes={
                            index === 0
                              ? "(max-width: 640px) 100vw, 66vw"
                              : "(max-width: 640px) 50vw, 33vw"
                          }
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      About
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      {profile.displayName}, {age}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.gender}
                    </p>
                  </div>

                  {profile.bio && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Bio
                      </p>

                      <p className="mt-2 leading-7 text-muted-foreground">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {(profile.occupation || profile.company) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {profile.occupation && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Occupation
                          </p>

                          <p className="mt-1 font-medium">
                            {profile.occupation}
                          </p>
                        </div>
                      )}

                      {profile.company && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Company
                          </p>

                          <p className="mt-1 font-medium">{profile.company}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {profile.height && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Height
                      </p>

                      <p className="mt-1 font-medium">{profile.height} cm</p>
                    </div>
                  )}

                  {profile.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Interests
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest.id}
                            className="rounded-full border bg-muted/40 px-3 py-1.5 text-sm font-medium"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {from !== "matches" && (
                <PublicProfileActions
                  targetUserId={profile.userId}
                  from={from}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
