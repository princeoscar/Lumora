import Image from "next/image";
import Link from "next/link";

import { MainNav } from "@/components/navigation/main-nav";
import { Button } from "@/components/ui/button";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { getUserMatches } from "@/lib/db/matches";

export default async function MatchesPage() {
  const user = await requireCurrentUserWithProfile();
  const matches = await getUserMatches(user.id);

  return (
    <>
      <MainNav />
      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Matches
              </p>

              <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                Your connections
              </h1>

              <p className="mt-2 max-w-2xl text-muted-foreground">
                People who have liked you back will appear here.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/discover">Discover</Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/profile">Profile</Link>
              </Button>
            </div>
          </div>

          {matches.length === 0 ? (
            <section className="rounded-2xl border border-dashed p-10 text-center">
              <h2 className="text-xl font-semibold">No matches yet</h2>

              <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
                Keep discovering people and liking profiles you are interested
                in. When they like you back, your match will appear here.
              </p>

              <div className="mt-6">
                <Button asChild>
                  <Link href="/discover">Continue discovering</Link>
                </Button>
              </div>
            </section>
          ) : (
            <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matches.map((match) => {
                const primaryPhoto =
                  match.user.photos.find((photo) => photo.isProfilePhoto) ??
                  match.user.photos[0] ??
                  null;

                return (
                  <article
                    key={match.matchId}
                    className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                  >
                    <div className="relative aspect-[4/5] bg-muted">
                      {primaryPhoto ? (
                        <Image
                          src={primaryPhoto.url}
                          alt={`${match.user.displayName}'s profile photo`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            No profile photo
                          </p>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
                        Matched
                      </div>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                          {match.user.displayName}, {match.user.age}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {match.user.gender}
                        </p>
                      </div>

                      {match.user.bio && (
                        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                          {match.user.bio}
                        </p>
                      )}

                      {(match.user.occupation || match.user.company) && (
                        <div className="space-y-1 text-sm">
                          {match.user.occupation && (
                            <p>
                              <span className="font-medium">Occupation:</span>{" "}
                              {match.user.occupation}
                            </p>
                          )}

                          {match.user.company && (
                            <p>
                              <span className="font-medium">Company:</span>{" "}
                              {match.user.company}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Matched on{" "}
                        {match.createdAt.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
