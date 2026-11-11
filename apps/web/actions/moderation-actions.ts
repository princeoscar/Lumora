"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { requireModerator } from "@/lib/auth/staff-access";
import { moderateUserReport, type ModerationAction } from "@/lib/db/moderation";

const moderationSchema = z.object({
  reportId: z.string().trim().min(1, "A report is required."),
  action: z.enum(["MARK_IN_REVIEW", "RESOLVE", "DISMISS", "SUSPEND", "BAN"]),
  note: z
    .string()
    .trim()
    .max(2000, "The note cannot exceed 2000 characters.")
    .optional(),
});

export async function moderateUserReportAction(input: unknown) {
  const moderator = await requireModerator();

  const parsed = moderationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "This moderation request is invalid.",
    };
  }

  try {
    const result = await moderateUserReport({
      reportId: parsed.data.reportId,
      moderatorId: moderator.id,
      action: parsed.data.action as ModerationAction,
      note: parsed.data.note,
    });

    if (!result.success) {
      const messages = {
        REPORT_NOT_FOUND: "This report could not be found.",
        REPORT_ALREADY_HANDLED: "This report has already been handled.",
        TARGET_NOT_FOUND: "The reported account could not be found.",
        STAFF_ACCOUNT_PROTECTED:
          "Moderator and administrator accounts cannot be suspended or banned through this action.",
        REVIEW_NOTE_REQUIRED:
          "Please provide a reason before suspending or banning an account.",
      };

      return {
        success: false,
        error: messages[result.reason],
      };
    }

    revalidatePath("/moderation/reports");

    return { success: true };
  } catch (error) {
    console.error("Moderation action failed:", error);

    return {
      success: false,
      error: "The moderation action failed. Please try again.",
    };
  }
}
