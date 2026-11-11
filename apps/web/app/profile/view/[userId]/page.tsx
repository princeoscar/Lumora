import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Heart,
  Ruler,
  Sparkles,
} from "lucide-react";

import { MainNav } from "@/components/navigation/main-nav";
import { PublicProfileActions } from "@/components/profile/public-profile-actions";
import { ReportUserForm } from "@/components/profile/report-user-form";
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
  const viewer = await requireCurrentUserWithProfile();

  const { userId } = await params;
  const { from } = (await searchParams) ?? {};

  const profile = await getPublicProfileByUserId(userId, viewer.id);

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

      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                Get to know someone
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {profile.displayName}
                <span className="ml-2 font-normal text-muted-foreground">
                  {age}
                </span>
              </h1>

              <p className="mt-2 text-sm text-muted-foreground">
                A closer look at this profile.
              </p>
            </div>

            <Button asChild variant="outline" className="rounded-xl">
              <Link href={backLink.href}>
                <ArrowLeft className="mr-2 size-4" />
                {backLink.label}
              </Link>
            </Button>
          </div>

          {/* Main profile layout */}
          <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            {/* Photo gallery */}
            <Card className="overflow-hidden rounded-3xl border-border/70 bg-card shadow-sm">
              <CardContent className="p-2.5">
                {profile.media.length === 0 ? (
                  <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl bg-muted/50 p-8 text-center">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                      <Heart className="size-6 text-primary" />
                    </div>

                    <p className="font-medium">No photos available</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This profile has no public photos yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {profile.media.map((media, index) => (
                      <div
                        key={media.id}
                        className={`group relative overflow-hidden rounded-2xl bg-muted ${
                          index === 0
                            ? "col-span-2 aspect-[4/5] sm:aspect-[5/4]"
                            : "aspect-square"
                        }`}
                      >
                        <Image
                          src={media.url}
                          alt={`${profile.displayName}'s profile photo ${index + 1}`}
                          fill
                          sizes={
                            index === 0
                              ? "(max-width: 640px) 100vw, 60vw"
                              : "(max-width: 640px) 50vw, 30vw"
                          }
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />

                        {index === 0 && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile information */}
            <div className="space-y-5">
              <Card className="overflow-hidden rounded-3xl border-border/70 shadow-sm">
                <CardContent className="space-y-6 p-6 sm:p-7">
                  {/* Introduction */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        About
                      </p>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                      {profile.displayName}, {age}
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile.gender}
                    </p>
                  </div>

                  {/* Biography */}
                  {profile.bio && (
                    <div className="border-t border-border/70 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        A little about me
                      </p>

                      <p className="mt-3 text-sm leading-7 text-foreground/85">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Career information */}
                  {(profile.occupation || profile.company) && (
                    <div className="border-t border-border/70 pt-5">
                      <div className="mb-4 flex items-center gap-2">
                        <BriefcaseBusiness className="size-4 text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                          Career
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {profile.occupation && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Occupation
                            </p>
                            <p className="mt-1 font-medium">
                              {profile.occupation}
                            </p>
                          </div>
                        )}

                        {profile.company && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Company
                            </p>
                            <p className="mt-1 font-medium">
                              {profile.company}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Height */}
                  {profile.height !== null && (
                    <div className="flex items-center gap-3 border-t border-border/70 pt-5">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                        <Ruler className="size-4 text-primary" />
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="mt-1 font-medium">{profile.height} cm</p>
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests.length > 0 && (
                    <div className="border-t border-border/70 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                        Things I enjoy
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.interests.map((interest) => (
                          <span
                            key={interest.id}
                            className="rounded-full border border-primary/15 bg-primary/5 px-3.5 py-2 text-sm font-medium text-foreground/85 transition-colors hover:bg-primary/10"
                          >
                            {interest.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile prompts */}
              {profile.prompts.length > 0 && (
                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardContent className="space-y-6 p-6 sm:p-7">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Get to know me
                      </p>

                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Beyond the basics
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        A few more things worth knowing about me.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {profile.prompts.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-muted/40 p-4 sm:p-5"
                        >
                          <p className="text-sm font-semibold">{item.prompt}</p>

                          <p className="mt-3 text-sm leading-7 text-muted-foreground">
                            {item.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Like / Pass actions */}
              <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                <p className="mb-4 text-sm font-medium">
                  Interested in getting to know {profile.displayName}?
                </p>

                <PublicProfileActions
                  targetUserId={profile.userId}
                  from={from}
                  showDiscoveryActions={from !== "matches"}
                />
              </div>

              {/* Reporting */}
              <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                <ReportUserForm targetUserId={profile.userId} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
