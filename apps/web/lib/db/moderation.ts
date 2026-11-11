import { prisma } from "@/lib/prisma";

export type ModerationAction =
  "MARK_IN_REVIEW" | "RESOLVE" | "DISMISS" | "SUSPEND" | "BAN";

type ModerateUserReportInput = {
  reportId: string;
  moderatorId: string;
  action: ModerationAction;
  note?: string;
};

type ModerateUserReportResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "REPORT_NOT_FOUND"
        | "REPORT_ALREADY_HANDLED"
        | "TARGET_NOT_FOUND"
        | "STAFF_ACCOUNT_PROTECTED"
        | "REVIEW_NOTE_REQUIRED";
    };

export async function moderateUserReport(
  input: ModerateUserReportInput,
): Promise<ModerateUserReportResult> {
  const { reportId, moderatorId, action } = input;
  const note = input.note?.trim() || null;

  if ((action === "SUSPEND" || action === "BAN") && !note) {
    return { success: false, reason: "REVIEW_NOTE_REQUIRED" };
  }

  return prisma.$transaction(async (tx) => {
    const report = await tx.userReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        reportedUserId: true,
      },
    });

    if (!report) {
      return { success: false, reason: "REPORT_NOT_FOUND" };
    }

    if (report.status === "RESOLVED" || report.status === "DISMISSED") {
      return { success: false, reason: "REPORT_ALREADY_HANDLED" };
    }

    const now = new Date();

    let newStatus: "IN_REVIEW" | "RESOLVED" | "DISMISSED";

    switch (action) {
      case "MARK_IN_REVIEW":
        newStatus = "IN_REVIEW";
        break;

      case "DISMISS":
        newStatus = "DISMISSED";
        break;

      case "RESOLVE":
      case "SUSPEND":
      case "BAN":
        newStatus = "RESOLVED";
        break;
    }

    if (action === "SUSPEND" || action === "BAN") {
      const target = await tx.user.findUnique({
        where: { id: report.reportedUserId },
        select: { id: true, role: true },
      });

      if (!target) {
        return { success: false, reason: "TARGET_NOT_FOUND" };
      }

      // Moderators cannot suspend or ban administrator or moderator accounts.
      if (target.role !== "USER") {
        return { success: false, reason: "STAFF_ACCOUNT_PROTECTED" };
      }

      await tx.user.update({
        where: { id: target.id },
        data: {
          accountStatus: action === "SUSPEND" ? "SUSPENDED" : "BANNED",
        },
      });
    }

    const updated = await tx.userReport.updateMany({
      where: {
        id: reportId,
        status: { in: ["PENDING", "IN_REVIEW"] },
      },
      data: {
        status: newStatus,
        reviewedById: moderatorId,
        reviewedAt: now,
        reviewNote: note,
      },
    });

    if (updated.count !== 1) {
      throw new Error("The report changed while it was being processed.");
    }

    // Record the moderation action in the audit trail.
    await tx.moderationLog.create({
      data: {
        moderatorId,
        targetUserId: report.reportedUserId,
        reportId: report.id,
        action,
        note,
      },
    });

    return { success: true };
  });
}
