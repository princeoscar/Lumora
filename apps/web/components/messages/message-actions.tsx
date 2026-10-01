"use client";

import { Pencil, Trash2, X, Check } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteMessage, editMessage } from "@/actions/message-mutation-actions";
import { Button } from "@/components/ui/button";

type MessageActionsProps = {
  messageId: string;
  content: string;
};

export function MessageActions({ messageId, content }: MessageActionsProps) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCancelEdit() {
    setEditedContent(content);
    setError(null);
    setIsEditing(false);
  }

  function handleEdit() {
    const trimmedContent = editedContent.trim();

    if (!trimmedContent) {
      setError("Message cannot be empty.");
      return;
    }

    if (trimmedContent === content.trim()) {
      setIsEditing(false);
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await editMessage({
        messageId,
        content: trimmedContent,
      });

      if (!result.success) {
        setError(result.error ?? "We couldn't edit your message.");
        return;
      }

      setEditedContent(trimmedContent);
      setIsEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Delete this message? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await deleteMessage({
        messageId,
      });

      if (!result.success) {
        setError(result.error ?? "We couldn't delete your message.");
        return;
      }

      router.refresh();
    });
  }

  if (isEditing) {
    return (
      <div className="mt-2 w-full">
        <textarea
          value={editedContent}
          onChange={(event) => setEditedContent(event.target.value)}
          maxLength={2000}
          rows={3}
          disabled={isPending}
          autoFocus
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />

        {error && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="mt-2 flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            disabled={isPending}
            className="h-8 px-2"
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleEdit}
            disabled={isPending || !editedContent.trim()}
            className="h-8 px-2"
          >
            <Check className="mr-1 h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-1 flex items-center justify-end gap-1">
      {error && (
        <p className="mr-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        aria-label="Edit message"
        title="Edit message"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="Delete message"
        title="Delete message"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary-foreground/60 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
