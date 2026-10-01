"use client";

import { useMatchRealtime } from "@/components/messages/match-realtime-provider";

export function MatchOnlineStatus() {
  const { isOtherUserOnline } = useMatchRealtime();

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          isOtherUserOnline ? "bg-emerald-500" : "bg-muted-foreground/40"
        }`}
      />
      {isOtherUserOnline ? "Online" : "Offline"}
    </span>
  );
}
