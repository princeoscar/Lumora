import type { ReportReason } from "@/lib/generated/prisma";

import { prisma } from "@/lib/prisma";

type SubmitUserReportInput = {
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  messageId?: string;
};

type SubmitUserReportResult =
  | { success: true }
  | {
      success: false;
      reason:
        | "CANNOT_REPORT_SELF"
        | "TARGET_NOT_FOUND"
        | "INVALID_MESSAGE_EVIDENCE"
        | "RATE_LIMITED";
    };

export async function submitUserReport(
  input: SubmitUserReportInput,
): Promise<SubmitUserReportResult> {
  const { reporterId, reportedUserId, reason, details, messageId } = input;

  if (reporterId === reportedUserId) {
    return {
      success: false,
      reason: "CANNOT_REPORT_SELF",
    };
  }

  return prisma.$transaction(async (tx) => {
    // Serialize report submissions from this reporter.
    // The lock is released automatically when the transaction ends.
    await tx.$queryRaw`
  SELECT pg_advisory_xact_lock(
    hashtextextended(${reporterId}, 0)
  )
`;

    const windowStart = new Date(Date.now() - 10 * 60 * 1000);

    const recentReportCount = await tx.userReport.count({
      where: {
        reporterId,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (recentReportCount >= 5) {
      return {
        success: false,
        reason: "RATE_LIMITED",
      };
    }

    const reportedUser = await tx.user.findFirst({
      where: {
        id: reportedUserId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!reportedUser) {
      return {
        success: false,
        reason: "TARGET_NOT_FOUND",
      };
    }

    if (messageId) {
      const message = await tx.message.findUnique({
        where: {
          id: messageId,
        },
        select: {
          id: true,
          senderId: true,
          match: {
            select: {
              userId: true,
              matchedUserId: true,
            },
          },
        },
      });

      if (!message) {
        return {
          success: false,
          reason: "INVALID_MESSAGE_EVIDENCE",
        };
      }

      const belongsToReportedConversation =
        (message.match.userId === reporterId &&
          message.match.matchedUserId === reportedUserId) ||
        (message.match.userId === reportedUserId &&
          message.match.matchedUserId === reporterId);

      const wasSentByReportedUser = message.senderId === reportedUserId;

      if (!belongsToReportedConversation || !wasSentByReportedUser) {
        return {
          success: false,
          reason: "INVALID_MESSAGE_EVIDENCE",
        };
      }
    }

    await tx.userReport.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        details: details?.trim() || null,
        messageId: messageId ?? null,
      },
    });

    return {
      success: true,
    };
  });
}

export async function getOpenReportsForModeration() {
  return prisma.userReport.findMany({
    where: {
      status: {
        in: ["PENDING", "IN_REVIEW"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      reporter: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      reportedUser: {
        select: {
          username: true,
          profile: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      message: {
        select: {
          content: true,
          deletedAt: true,
          createdAt: true,
          sender: {
            select: {
              username: true,
              profile: {
                select: {
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
