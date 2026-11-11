"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart, X, BriefcaseBusiness, Ruler, ArrowUpRight } from "lucide-react";

import { saveDiscoveryAction } from "@/actions/discovery-actions";
import { Button } from "@/components/ui/button";
import type { DiscoveryCandidate } from "@/types/discovery";

type LikesCandidateCardProps = {
  candidate: DiscoveryCandidate;
};

export function LikesCandidateCard({ candidate }: LikesCandidateCardProps) {
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
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
      {/* Profile photography */}
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={`${candidate.displayName}'s profile photo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-primary/20">
            <p className="text-sm text-muted-foreground">No profile photo</p>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />

        {/* Incoming like badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
          <Heart className="size-3.5 fill-pink-400 text-pink-400" />
          Liked you
        </div>

        {/* Profile identity */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
            {candidate.gender}
          </p>

          <h2 className="text-3xl font-semibold tracking-tight">
            {candidate.displayName}
            <span className="ml-2 font-normal text-white/80">
              {candidate.age}
            </span>
          </h2>
        </div>
      </div>

      {/* Profile information */}
      <div className="flex flex-1 flex-col space-y-5 p-5">
        {candidate.bio && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              About
            </p>

            <p className="line-clamp-4 text-sm leading-7 text-muted-foreground">
              {candidate.bio}
            </p>
          </div>
        )}

        {(candidate.occupation ||
          candidate.company ||
          candidate.height !== null) && (
          <div className="space-y-3 border-t border-border/70 pt-4">
            {candidate.occupation && (
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-primary" />

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Occupation</p>

                  <p className="text-sm font-medium">{candidate.occupation}</p>

                  {candidate.company && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {candidate.company}
                    </p>
                  )}
                </div>
              </div>
            )}

            {!candidate.occupation && candidate.company && (
              <div className="flex items-start gap-3">
                <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{candidate.company}</p>
                </div>
              </div>
            )}

            {candidate.height !== null && (
              <div className="flex items-center gap-3">
                <Ruler className="size-4 shrink-0 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="text-sm font-medium">{candidate.height} cm</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {/* Full profile */}
        <Button
          asChild
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl border-border/80"
        >
          <Link href={`/profile/view/${candidate.userId}?from=likes`}>
            View full profile
            <ArrowUpRight className="ml-2 size-4" />
          </Link>
        </Button>

        {/* Like back / Pass */}
        <div className="mt-auto grid grid-cols-2 gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-xl border-border/80 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            onClick={() => handleAction("PASS")}
            disabled={isPending}
          >
            <X className="mr-2 size-4" />
            {isPending ? "Saving..." : "Pass"}
          </Button>

          <Button
            type="button"
            className="h-12 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/15 transition-all hover:shadow-lg hover:shadow-primary/20"
            onClick={() => handleAction("LIKE")}
            disabled={isPending}
          >
            <Heart className="mr-2 size-4" />
            {isPending ? "Saving..." : "Like back"}
          </Button>
        </div>
      </div>
    </article>
  );
}
