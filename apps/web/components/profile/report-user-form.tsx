"use client";

import { useState, useTransition, type FormEvent } from "react";

import { submitUserReportAction } from "@/actions/report-actions";
import { Button } from "@/components/ui/button";

const reportReasons = [
  { value: "HARASSMENT", label: "Harassment or bullying" },
  { value: "HATE_OR_ABUSE", label: "Hate speech or abusive behaviour" },
  { value: "FAKE_PROFILE", label: "Fake profile or impersonation" },
  { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
  { value: "SPAM", label: "Spam" },
  { value: "INAPPROPRIATE_CONTENT", label: "Inappropriate content" },
  {
    value: "UNWANTED_SEXUAL_CONTENT",
    label: "Unwanted sexual content",
  },
  {
    value: "THREATS_OR_VIOLENCE",
    label: "Threats or violence",
  },
  { value: "UNDERAGE_USER", label: "Underage user" },
  { value: "OTHER", label: "Something else" },
] as const;

type ReportReasonValue = (typeof reportReasons)[number]["value"];

type ReportUserFormProps = {
  targetUserId: string;
};

export function ReportUserForm({ targetUserId }: ReportUserFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState<ReportReasonValue | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!reason) {
      setError("Please choose a reason for your report.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await submitUserReportAction({
          targetUserId,
          reason,
          details,
        });

        if (!result.success) {
          setError(
            result.error ?? "We couldn't submit your report. Please try again.",
          );
          return;
        }

        setIsOpen(false);
        setReason("");
        setDetails("");
        setSuccess("Thank you. Your report has been submitted for review.");
      } catch {
        setError("We couldn't submit your report. Please try again.");
      }
    });
  }

  function handleCancel() {
    setIsOpen(false);
    setReason("");
    setDetails("");
    setError(null);
  }

  return (
    <section className="space-y-3">
      {success && (
        <p
          role="status"
          className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground"
        >
          {success}
        </p>
      )}

      {!isOpen ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setIsOpen(true);
          }}
        >
          Report profile
        </Button>
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
          <div>
            <h3 className="font-semibold">Report this profile</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Choose the reason that best describes your concern. Reports are
              sent to Lumora for moderation review.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="report-reason" className="text-sm font-medium">
                Reason for reporting
              </label>

              <select
                id="report-reason"
                required
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReasonValue | "")
                }
                disabled={isPending}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>
                  Choose a reason
                </option>

                {reportReasons.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="report-details" className="text-sm font-medium">
                Additional details (optional)
              </label>

              <textarea
                id="report-details"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                maxLength={2000}
                rows={4}
                disabled={isPending}
                placeholder="Describe what happened. Avoid including unnecessary personal information."
                className="w-full resize-y rounded-lg border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />

              <p className="text-right text-xs text-muted-foreground">
                {details.length}/2000 characters
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending || !reason}>
                {isPending ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
