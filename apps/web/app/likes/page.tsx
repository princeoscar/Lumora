import Link from "next/link";
import { Heart, Sparkles, Users } from "lucide-react";

import { LikesCandidateCard } from "@/components/likes/likes-candidate-card";
import { MainNav } from "@/components/navigation/main-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getPendingLikes } from "@/lib/db/discovery";

export default async function LikesPage() {
  const user = await requireCurrentUserWithProfile();
  const likes = await getPendingLikes(user.id);

  return (
    <>
      <MainNav />

      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Heart className="size-4 fill-primary text-primary" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Likes you
                </p>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                People interested in you
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                These people have already liked your profile. Like them back to
                make a connection, or pass and keep discovering.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-xl">
                <Link href="/matches">View matches</Link>
              </Button>

              <Button asChild className="rounded-xl">
                <Link href="/discover">Discover people</Link>
              </Button>
            </div>
          </div>

          {/* Incoming likes summary */}
          <Card className="mb-8 overflow-hidden rounded-2xl border-primary/15 bg-gradient-to-r from-primary/10 via-card to-card shadow-sm">
            <CardContent className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <Heart className="size-6 fill-primary text-primary" />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Incoming likes
                  </p>

                  <p className="mt-1 text-2xl font-semibold tracking-tight">
                    {likes.length}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {likes.length === 1 ? "person" : "people"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                <span>Every connection starts somewhere.</span>
              </div>
            </CardContent>
          </Card>

          {/* Likes collection */}
          {likes.length === 0 ? (
            <Card className="rounded-3xl border-dashed shadow-sm">
              <CardContent className="flex flex-col items-center px-6 py-16 text-center sm:py-20">
                <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
                  <Users className="size-9 text-primary" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Your next connection
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                  No new likes yet
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
                  When someone likes your profile, you&apos;ll find them here.
                  Keep your profile updated and continue discovering people.
                </p>

                <Button asChild className="mt-7 rounded-xl">
                  <Link href="/discover">
                    <Heart className="mr-2 size-4" />
                    Continue discovering
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <section
              className={`grid gap-6 ${
                likes.length === 1
                  ? "mx-auto max-w-md grid-cols-1"
                  : likes.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {likes.map((candidate) => (
                <LikesCandidateCard
                  key={candidate.userId}
                  candidate={candidate}
                />
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
