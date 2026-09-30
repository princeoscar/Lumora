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
      deletedAt: null,
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
