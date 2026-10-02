"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { unmatchUser } from "@/actions/match-actions";
import { Button } from "@/components/ui/button";

type UnmatchButtonProps = {
  matchId: string;
  matchedUserName: string;
};

export function UnmatchButton({
  matchId,
  matchedUserName,
}: UnmatchButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUnmatch() {
    const confirmed = window.confirm(
      `Unmatch with ${matchedUserName}? This will remove the match and delete your conversation.`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await unmatchUser({
        matchId,
      });

      if (!result.success) {
        setError(result.error ?? "We couldn't remove this match.");
        return;
      }

      router.push("/matches");
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleUnmatch}
        disabled={isPending}
        className="border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        {isPending ? "Removing..." : "Unmatch"}
      </Button>

      {error && (
        <p
          className="max-w-48 text-right text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
