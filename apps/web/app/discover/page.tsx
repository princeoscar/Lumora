import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getDiscoveryCandidates } from "@/lib/db/discovery";
import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";

export default async function DiscoverPage() {
  const user = await requireCurrentUserWithProfile();
  const candidates = await getDiscoveryCandidates(user.id);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Discover
            </p>

            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Meet someone new
            </h1>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              These profiles match your current discovery preferences.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/profile/preferences">Edit preferences</Link>
          </Button>
        </div>

        {candidates.length === 0 ? (
          <section className="rounded-2xl border border-dashed p-10 text-center">
            <h2 className="text-xl font-semibold">No profiles to show yet</h2>

            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              We couldn&apos;t find any public profiles matching your current
              preferences. This will change as more people join Lumora.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/profile/preferences">Review preferences</Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/profile">View your profile</Link>
              </Button>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => {
              const primaryPhoto =
                candidate.photos.find((photo) => photo.isProfilePhoto) ??
                candidate.photos[0] ??
                null;

              return (
                <article
                  key={candidate.userId}
                  className="overflow-hidden rounded-2xl border bg-card shadow-sm"
                >
                  <div className="relative aspect-[4/5] bg-muted">
                    {primaryPhoto ? (
                      <Image
                        src={primaryPhoto.url}
                        alt={`${candidate.displayName}'s profile photo`}
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
                  </div>

                  <div className="space-y-4 p-5">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {candidate.displayName}, {candidate.age}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {candidate.gender}
                      </p>
                    </div>

                    {candidate.bio && (
                      <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
                        {candidate.bio}
                      </p>
                    )}

                    {(candidate.occupation || candidate.company) && (
                      <div className="space-y-1 text-sm">
                        {candidate.occupation && (
                          <p>
                            <span className="font-medium">Occupation:</span>{" "}
                            {candidate.occupation}
                          </p>
                        )}

                        {candidate.company && (
                          <p>
                            <span className="font-medium">Company:</span>{" "}
                            {candidate.company}
                          </p>
                        )}
                      </div>
                    )}

                    {candidate.height && (
                      <p className="text-sm">
                        <span className="font-medium">Height:</span>{" "}
                        {candidate.height} cm
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
