"use server";

import { z } from "zod";

import { requireCurrentUser } from "@/lib/auth/require-current-user";
import { submitUserReport } from "@/lib/db/reports";

const reportReasons = [
  "HARASSMENT",
  "HATE_OR_ABUSE",
  "FAKE_PROFILE",
  "SCAM_OR_FRAUD",
  "SPAM",
  "INAPPROPRIATE_CONTENT",
  "UNWANTED_SEXUAL_CONTENT",
  "THREATS_OR_VIOLENCE",
  "UNDERAGE_USER",
  "OTHER",
] as const;

const reportSubmissionSchema = z.object({
  targetUserId: z.string().trim().min(1, "A user is required."),
  reason: z.enum(reportReasons),
  details: z
    .string()
    .trim()
    .max(2000, "Details cannot exceed 2000 characters.")
    .nullable()
    .optional(),
  messageId: z.string().trim().min(1).nullable().optional(),
});

export async function submitUserReportAction(input: unknown) {
  const user = await requireCurrentUser();

  const parsed = reportSubmissionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ?? "This report request is invalid.",
    };
  }

  try {
    const result = await submitUserReport({
      reporterId: user.id,
      reportedUserId: parsed.data.targetUserId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? undefined,
      messageId: parsed.data.messageId ?? undefined,
    });

    if (!result.success) {
      switch (result.reason) {
        case "CANNOT_REPORT_SELF":
          return {
            success: false,
            error: "You cannot report your own account.",
          };

        case "TARGET_NOT_FOUND":
          return {
            success: false,
            error: "This user is no longer available to report.",
          };

        case "INVALID_MESSAGE_EVIDENCE":
          return {
            success: false,
            error:
              "The selected message is not from a conversation with this person.",
          };

        case "RATE_LIMITED":
          return {
            success: false,
            error:
              "You've submitted several reports recently. Please wait 10 minutes before submitting another report.",
          };
      }
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to submit user report:", error);

    return {
      success: false,
      error: "We couldn't submit your report. Please try again.",
    };
  }
}
