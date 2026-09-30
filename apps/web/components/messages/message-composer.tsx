"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { sendMessage } from "@/actions/message-actions";
import { Button } from "@/components/ui/button";

type MessageComposerProps = {
  matchId: string;
};

export function MessageComposer({ matchId }: MessageComposerProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Write a message before sending.");
      return;
    }

    setError(null);

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
          onChange={(event) => setContent(event.target.value)}
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
