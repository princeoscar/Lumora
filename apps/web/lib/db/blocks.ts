import { prisma } from "@/lib/prisma";

/**
 * Blocks another user.
 * A user cannot block themselves.
 * Repeated block requests are handled safely.
 */
export async function blockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    return {
      success: false,
      reason: "CANNOT_BLOCK_SELF" as const,
    };
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: blockedId,
    },
    select: {
      id: true,
    },
  });

  if (!targetUser) {
    return {
      success: false,
      reason: "USER_NOT_FOUND" as const,
    };
  }

  await prisma.userBlock.upsert({
    where: {
      blockerId_blockedId: {
        blockerId,
        blockedId,
      },
    },
    update: {},
    create: {
      blockerId,
      blockedId,
    },
  });

  return {
    success: true,
    reason: null,
  };
}

/**
 * Removes a block without failing when it does not exist.
 */
export async function unblockUser(blockerId: string, blockedId: string) {
  if (blockerId === blockedId) {
    return {
      success: false,
      reason: "INVALID_BLOCK" as const,
      deletedCount: 0,
    };
  }

  const result = await prisma.userBlock.deleteMany({
    where: {
      blockerId,
      blockedId,
    },
  });

  return {
    success: true,
    reason: null,
    deletedCount: result.count,
  };
}

/**
 * Returns every user blocked by this user
 * or every user who has blocked this user.
 */
export async function getBlockedUserIds(userId: string) {
  const blocks = await prisma.userBlock.findMany({
    where: {
      OR: [{ blockerId: userId }, { blockedId: userId }],
    },
    select: {
      blockerId: true,
      blockedId: true,
    },
  });

  return [
    ...new Set(
      blocks.map((block) =>
        block.blockerId === userId ? block.blockedId : block.blockerId,
      ),
    ),
  ];
}

/**
 * Checks whether either user has blocked the other.
 */
export async function areUsersBlocked(
  firstUserId: string,
  secondUserId: string,
): Promise<boolean> {
  if (firstUserId === secondUserId) {
    return false;
  }

  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        {
          blockerId: firstUserId,
          blockedId: secondUserId,
        },
        {
          blockerId: secondUserId,
          blockedId: firstUserId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return block !== null;
}

/**
 * Returns the users that the current user has explicitly blocked.
 * Does not include users who blocked the current user.
 */
export async function getUsersBlockedByUser(userId: string) {
  const blocks = await prisma.userBlock.findMany({
    where: {
      blockerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      createdAt: true,
      blocked: {
        select: {
          id: true,
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
  });

  return blocks.map((block) => ({
    blockId: block.id,
    blockedAt: block.createdAt,
    userId: block.blocked.id,
    username: block.blocked.username,
    displayName:
      block.blocked.profile?.displayName ||
      `${block.blocked.profile?.firstName ?? ""} ${
        block.blocked.profile?.lastName ?? ""
      }`.trim() ||
      block.blocked.username ||
      "Lumora member",
  }));
}
