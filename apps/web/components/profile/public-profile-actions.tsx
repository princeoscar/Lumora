"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { blockUserAction } from "@/actions/block-actions";
import { saveDiscoveryAction } from "@/actions/discovery-actions";
import { Button } from "@/components/ui/button";

type PublicProfileActionsProps = {
  targetUserId: string;
  from?: string;
  showDiscoveryActions?: boolean;
};

export function PublicProfileActions({
  targetUserId,
  from,
  showDiscoveryActions = true,
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

  function handleBlock() {
    const confirmed = window.confirm(
      "Are you sure you want to block this person? You will no longer see each other's profiles or conversations, and messaging will be restricted.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await blockUserAction({ targetUserId });

      if (!result.success) {
        setError(
          result.error ?? "We couldn't block this person. Please try again.",
        );
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
      {showDiscoveryActions && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAction("PASS")}
            disabled={isPending}
          >
            {isPending ? "Please wait..." : "Pass"}
          </Button>

          <Button
            type="button"
            onClick={() => handleAction("LIKE")}
            disabled={isPending}
          >
            {isPending ? "Please wait..." : likeLabel}
          </Button>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleBlock}
        disabled={isPending}
      >
        {isPending ? "Please wait..." : "Block this person"}
      </Button>
    </div>
  );
}
