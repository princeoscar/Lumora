"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteProfileMedia } from "@/actions/profile-media-delete";
import type { ProfileMedia } from "@/types/profile";
import { Button } from "@/components/ui/button";

type ProfileMediaManagerProps = {
  media: ProfileMedia[];
};

export function ProfileMediaManager({ media }: ProfileMediaManagerProps) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(mediaId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?",
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(mediaId);
    setError(null);

    try {
      const result = await deleteProfileMedia({ mediaId });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't delete the photo. Please try again.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError("We couldn't delete the photo. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {media.map((item) => {
          const isDeleting = deletingId === item.id;

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-lg border bg-card"
            >
              <div className="relative aspect-square">
                <Image
                  src={item.url}
                  alt="Profile photo"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  {item.isProfilePhoto ? (
                    <p className="truncate text-sm font-medium">
                      Profile photo
                    </p>
                  ) : (
                    <p className="truncate text-sm text-muted-foreground">
                      Profile photo
                    </p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting || deletingId !== null}
                  onClick={() => handleDelete(item.id)}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
