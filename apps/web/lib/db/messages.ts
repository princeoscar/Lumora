import { prisma } from "@/lib/prisma";

export type ConversationMessage = {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  readAt: Date | null;
};

export async function getMatchMessages(
  matchId: string,
  userId: string,
): Promise<ConversationMessage[]> {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      id: true,
    },
  });

  if (!match) {
    return [];
  }

  return prisma.message.findMany({
    where: {
      matchId: match.id,
    },
    select: {
      id: true,
      matchId: true,
      senderId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      editedAt: true,
      deletedAt: true,
      readAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 100,
  });
}

export type MessageThread = {
  matchId: string;
  matchedAt: Date;
  unreadCount: number;
  user: {
    userId: string;
    displayName: string;
    age: number;
    profilePhoto: {
      id: string;
      url: string;
    } | null;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: Date;
  } | null;
};

function calculateAge(dateOfBirth: Date) {
  const today = new Date();

  let age = today.getFullYear() - dateOfBirth.getFullYear();

  const birthdayHasPassed =
    today.getMonth() > dateOfBirth.getMonth() ||
    (today.getMonth() === dateOfBirth.getMonth() &&
      today.getDate() >= dateOfBirth.getDate());

  if (!birthdayHasPassed) {
    age -= 1;
  }

  return age;
}

function getDisplayName(firstName: string, lastName: string | null) {
  return `${firstName} ${lastName ?? ""}`.trim();
}

export async function getMessageThreads(
  userId: string,
): Promise<MessageThread[]> {
  const matches = await prisma.match.findMany({
    where: {
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      id: true,
      createdAt: true,
      userId: true,
      matchedUserId: true,

      user: {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              dateOfBirth: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              mediaType: "IMAGE",
            },
            orderBy: {
              displayOrder: "asc",
            },
            select: {
              id: true,
              url: true,
              isProfilePhoto: true,
            },
          },
        },
      },

      matchedUser: {
        select: {
          id: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              displayName: true,
              dateOfBirth: true,
            },
          },
          media: {
            where: {
              deletedAt: null,
              mediaType: "IMAGE",
            },
            orderBy: {
              displayOrder: "asc",
            },
            select: {
              id: true,
              url: true,
              isProfilePhoto: true,
            },
          },
        },
      },

      messages: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          content: true,
          senderId: true,
          createdAt: true,
        },
      },

      _count: {
        select: {
          messages: {
            where: {
              deletedAt: null,
              readAt: null,
              senderId: {
                not: userId,
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const result: MessageThread[] = [];

  for (const match of matches) {
    const matchedUser =
      match.userId === userId ? match.matchedUser : match.user;

    if (!matchedUser.profile) {
      continue;
    }

    const profile = matchedUser.profile;

    const profilePhoto =
      matchedUser.media.find((media) => media.isProfilePhoto) ??
      matchedUser.media[0] ??
      null;

    result.push({
      matchId: match.id,
      matchedAt: match.createdAt,
      unreadCount: match._count.messages,
      user: {
        userId: matchedUser.id,
        displayName:
          profile.displayName?.trim() ||
          getDisplayName(profile.firstName, profile.lastName),
        age: calculateAge(profile.dateOfBirth),
        profilePhoto,
      },
      lastMessage: match.messages[0] ?? null,
    });
  }

  return result;
}

export async function markMatchMessagesAsRead(matchId: string, userId: string) {
  const match = await prisma.match.findFirst({
    where: {
      id: matchId,
      OR: [{ userId }, { matchedUserId: userId }],
    },
    select: {
      id: true,
    },
  });

  if (!match) {
    return {
      success: false,
      updatedCount: 0,
    };
  }

  const result = await prisma.message.updateMany({
    where: {
      matchId: match.id,
      senderId: {
        not: userId,
      },
      readAt: null,
      deletedAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  return {
    success: true,
    updatedCount: result.count,
  };
}
