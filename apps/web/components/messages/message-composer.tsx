"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";

import { sendMessage } from "@/actions/message-actions";
import { useMatchRealtime } from "@/components/messages/match-realtime-provider";
import { Button } from "@/components/ui/button";

type MessageComposerProps = {
  matchId: string;
};

export function MessageComposer({ matchId }: MessageComposerProps) {
  const router = useRouter();
  const { setTyping } = useMatchRealtime();

  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setTyping(false);
    };
  }, [setTyping]);

  function handleContentChange(value: string) {
    setContent(value);

    const trimmedValue = value.trim();

    if (!trimmedValue) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setTyping(false);
      return;
    }

    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      typingTimeoutRef.current = null;
    }, 1200);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Write a message before sending.");
      return;
    }

    setError(null);
    setTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    startTransition(async () => {
      const result = await sendMessage({
        matchId,
        content: trimmedContent,
      });

      if (!result.success) {
        setError(result.error ?? "We couldn't send your message.");
        return;
      }

      setContent("");
      router.refresh();
    });
  }

  return (
    <div className="border-t bg-background px-4 py-4 sm:px-6">
      {error && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(event) => handleContentChange(event.target.value)}
          placeholder="Write a message..."
          maxLength={2000}
          rows={1}
          disabled={isPending}
          className="min-h-12 flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />

        <Button
          type="submit"
          disabled={isPending || !content.trim()}
          className="min-h-12 shrink-0 rounded-xl px-5"
        >
          {isPending ? "Sending..." : "Send"}
        </Button>
      </form>

      <p className="mt-2 text-right text-xs text-muted-foreground">
        {content.length}/2000
      </p>
    </div>
  );
}
