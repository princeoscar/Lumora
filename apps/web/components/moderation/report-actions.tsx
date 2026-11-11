"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { moderateUserReportAction } from "@/actions/moderation-actions";
import type { ModerationAction } from "@/lib/db/moderation";

type ReportActionsProps = {
  reportId: string;
};

export function ReportActions({ reportId }: ReportActionsProps) {
  const router = useRouter();

  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAction(action: ModerationAction) {
    const trimmedNote = note.trim();

    if ((action === "SUSPEND" || action === "BAN") && !trimmedNote) {
      setMessage("Please provide a reason before taking this action.");
      return;
    }

    if (action === "SUSPEND") {
      if (!window.confirm("Are you sure you want to suspend this account?")) {
        return;
      }
    }

    if (action === "BAN") {
      if (!window.confirm("Are you sure you want to ban this account?")) {
        return;
      }
    }

    setMessage("");

    startTransition(async () => {
      const result = await moderateUserReportAction({
        reportId,
        action,
        note: trimmedNote,
      });

      if (!result.success) {
        setMessage(result.error ?? "The moderation action failed.");
        return;
      }

      setMessage("Moderation action completed successfully.");
      setNote("");
      router.refresh();
    });
  }

  const buttonClass =
    "rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="space-y-4 border-t pt-5">
      <div>
        <h3 className="text-sm font-semibold">Moderation actions</h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Record your decision and take appropriate action.
        </p>
      </div>

      <div>
        <label
          htmlFor={`moderation-note-${reportId}`}
          className="mb-2 block text-sm font-medium"
        >
          Review note
        </label>

        <textarea
          id={`moderation-note-${reportId}`}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Add investigation notes or explain your decision..."
          disabled={isPending}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-muted-foreground">
          {note.length}/2000
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("MARK_IN_REVIEW")}
          className={buttonClass}
        >
          Mark In Review
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("RESOLVE")}
          className={buttonClass}
        >
          Resolve
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("DISMISS")}
          className={buttonClass}
        >
          Dismiss
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("SUSPEND")}
          className={`${buttonClass} border-orange-500/40 text-orange-600`}
        >
          Suspend Account
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleAction("BAN")}
          className={`${buttonClass} border-destructive/40 text-destructive`}
        >
          Ban Account
        </button>
      </div>

      {isPending && (
        <p className="text-sm text-muted-foreground">
          Processing moderation action...
        </p>
      )}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {message}
        </p>
      )}
    </div>
  );
}
