import { prisma } from "@/lib/prisma";

export async function getModerationAuditLogs() {
  return prisma.moderationLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      moderator: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
      targetUser: {
        select: {
          id: true,
          email: true,
          username: true,
        },
      },
      report: {
        select: {
          id: true,
          reason: true,
          status: true,
        },
      },
    },
  });
}
