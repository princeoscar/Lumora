"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { deleteProfileMedia } from "@/actions/profile-media-delete";
import { reorderProfileMedia } from "@/actions/profile-media-order";
import { setPrimaryProfileMedia } from "@/actions/profile-media-primary";
import type { ProfileMedia } from "@/types/profile";
import { Button } from "@/components/ui/button";

type ProfileMediaManagerProps = {
  media: ProfileMedia[];
};

export function ProfileMediaManager({ media }: ProfileMediaManagerProps) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
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

  async function handleSetPrimary(mediaId: string) {
    setSettingPrimaryId(mediaId);
    setError(null);

    try {
      const result = await setPrimaryProfileMedia({ mediaId });

      if (!result.success) {
        setError(
          result.error ??
            "We couldn't update your primary photo. Please try again.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError("We couldn't update your primary photo. Please try again.");
    } finally {
      setSettingPrimaryId(null);
    }
  }

  async function handleReorder(mediaId: string, direction: "UP" | "DOWN") {
    setReorderingId(mediaId);
    setError(null);

    try {
      const result = await reorderProfileMedia({
        mediaId,
        direction,
      });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't reorder your photos. Please try again.",
        );
        return;
      }

      router.refresh();
    } catch {
      setError("We couldn't reorder your photos. Please try again.");
    } finally {
      setReorderingId(null);
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
        {media.map((item, index) => {
          const isDeleting = deletingId === item.id;
          const isSettingPrimary = settingPrimaryId === item.id;
          const isReordering = reorderingId === item.id;

          const isBusy =
            deletingId !== null ||
            settingPrimaryId !== null ||
            reorderingId !== null;

          const canMoveUp = index > 0;
          const canMoveDown = index < media.length - 1;

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

              <div className="grid gap-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">
                    {item.isProfilePhoto ? "Primary photo" : "Profile photo"}
                  </p>

                  {item.isProfilePhoto && (
                    <span className="text-xs text-primary">Primary</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || !canMoveUp}
                    onClick={() => handleReorder(item.id, "UP")}
                    aria-label="Move photo up"
                  >
                    <ArrowUp />
                    {isReordering ? "Moving..." : "Up"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isBusy || !canMoveDown}
                    onClick={() => handleReorder(item.id, "DOWN")}
                    aria-label="Move photo down"
                  >
                    <ArrowDown />
                    {isReordering ? "Moving..." : "Down"}
                  </Button>

                  {!item.isProfilePhoto && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleSetPrimary(item.id)}
                    >
                      {isSettingPrimary ? "Setting..." : "Set as primary"}
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => handleDelete(item.id)}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
