"use client";

import { useMatchRealtime } from "@/components/messages/match-realtime-provider";

export function TypingIndicator() {
  const { isOtherUserTyping } = useMatchRealtime();

  if (!isOtherUserTyping) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="px-4 pb-2 text-xs text-muted-foreground sm:px-6"
    >
      <span className="inline-flex items-center gap-1">
        Typing
        <span className="flex gap-0.5" aria-hidden="true">
          <span className="animate-bounce [animation-delay:-0.3s]">.</span>
          <span className="animate-bounce [animation-delay:-0.15s]">.</span>
          <span className="animate-bounce">.</span>
        </span>
      </span>
    </div>
  );
}
