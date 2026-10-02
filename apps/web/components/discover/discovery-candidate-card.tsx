"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveDiscoveryAction } from "@/actions/discovery-actions";
import { Button } from "@/components/ui/button";
import type { DiscoveryCandidate } from "@/types/discovery";

type DiscoveryCandidateCardProps = {
  candidate: DiscoveryCandidate;
};

export function DiscoveryCandidateCard({
  candidate,
}: DiscoveryCandidateCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const primaryPhoto =
    candidate.photos.find((photo) => photo.isProfilePhoto) ??
    candidate.photos[0] ??
    null;

  function handleAction(action: "LIKE" | "PASS") {
    setError(null);

    startTransition(async () => {
      const result = await saveDiscoveryAction({
        targetUserId: candidate.userId,
        action,
      });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't save your choice. Please try again.",
        );
        return;
      }

      router.refresh();
    });
  }

  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm">
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
            <p className="text-sm text-muted-foreground">No profile photo</p>
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
            <span className="font-medium">Height:</span> {candidate.height} cm
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <Button
          asChild
          type="button"
          variant="outline"
          className="w-full"
        >
          <Link href={`/profile/view/${candidate.userId}`}>
            View profile
          </Link>
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction("PASS")}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Pass"}
          </Button>

          <Button
            type="button"
            onClick={() => handleAction("LIKE")}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Like"}
          </Button>
        </div>
      </div>
    </article>
  );
}
