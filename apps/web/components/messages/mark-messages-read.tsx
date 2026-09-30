"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { markMessagesAsRead } from "@/actions/message-read-actions";

type MarkMessagesReadProps = {
  matchId: string;
};

export function MarkMessagesRead({ matchId }: MarkMessagesReadProps) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function markAsRead() {
      const result = await markMessagesAsRead(matchId);

      if (!cancelled && result.success && result.updatedCount > 0) {
        router.refresh();
      }
    }

    void markAsRead();

    return () => {
      cancelled = true;
    };
  }, [matchId, router]);

  return null;
}
