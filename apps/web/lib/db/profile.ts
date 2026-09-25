import { prisma } from "@/lib/prisma";

export async function getProfileWithMediaByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      profile: true,
      media: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!user?.profile) {
    return null;
  }

  return {
    ...user.profile,
    media: user.media,
  };
}
