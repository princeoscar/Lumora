import Link from "next/link";

import { LikesCandidateCard } from "@/components/likes/likes-candidate-card";
import { MainNav } from "@/components/navigation/main-nav";
import { Button } from "@/components/ui/button";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getPendingLikes } from "@/lib/db/discovery";

export default async function LikesPage() {
  const user = await requireCurrentUserWithProfile();
  const likes = await getPendingLikes(user.id);

  return (
    <>
      <MainNav />

      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Likes You
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                People interested in you
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                These people have already liked you. Like them back to make a
                match, or pass and keep discovering.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/matches">Matches</Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/discover">Discover</Link>
              </Button>
            </div>
          </div>

          {likes.length === 0 ? (
            <section className="rounded-2xl border border-dashed p-10 text-center">
              <h2 className="text-xl font-semibold">No new likes</h2>

              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                When someone likes your profile, they&apos;ll appear here.
              </p>

              <div className="mt-6">
                <Button asChild>
                  <Link href="/discover">Continue discovering</Link>
                </Button>
              </div>
            </section>
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
