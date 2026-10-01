"use client";

import { useMatchRealtime } from "@/components/messages/match-realtime-provider";

type MatchLastSeenProps = {
  lastActiveAt: string | null;
};

function formatLastSeen(lastActiveAt: string | null) {
  if (!lastActiveAt) {
    return "Last seen recently";
  }

  const lastActive = new Date(lastActiveAt);

  if (Number.isNaN(lastActive.getTime())) {
    return "Last seen recently";
  }

  const now = Date.now();
  const differenceInSeconds = Math.max(
    0,
    Math.floor((now - lastActive.getTime()) / 1000),
  );

  if (differenceInSeconds < 60) {
    return "Last seen just now";
  }

  const differenceInMinutes = Math.floor(differenceInSeconds / 60);

  if (differenceInMinutes < 60) {
    return `Last seen ${differenceInMinutes} ${
      differenceInMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `Last seen ${differenceInHours} ${
      differenceInHours === 1 ? "hour" : "hours"
    } ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays < 7) {
    return `Last seen ${differenceInDays} ${
      differenceInDays === 1 ? "day" : "days"
    } ago`;
  }

  return `Last seen on ${lastActive.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;
}

export function MatchLastSeen({ lastActiveAt }: MatchLastSeenProps) {
  const { isOtherUserOnline } = useMatchRealtime();

  if (isOtherUserOnline) {
    return null;
  }

  return (
    <p className="text-xs text-muted-foreground">
      {formatLastSeen(lastActiveAt)}
    </p>
  );
}
