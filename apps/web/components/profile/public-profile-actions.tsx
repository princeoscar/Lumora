"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveDiscoveryAction } from "@/actions/discovery-actions";
import { Button } from "@/components/ui/button";

type PublicProfileActionsProps = {
  targetUserId: string;
  from?: string;
};

export function PublicProfileActions({
  targetUserId,
  from,
}: PublicProfileActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const likeLabel = from === "likes" ? "Like back" : "Like";

  function handleAction(action: "LIKE" | "PASS") {
    setError(null);

    startTransition(async () => {
      const result = await saveDiscoveryAction({
        targetUserId,
        action,
      });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't save your choice. Please try again.",
        );
        return;
      }

      if (from === "likes") {
        router.push("/likes");
        router.refresh();
        return;
      }

      router.push("/discover");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

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
          {isPending ? "Saving..." : likeLabel}
        </Button>
      </div>
    </div>
  );
}
