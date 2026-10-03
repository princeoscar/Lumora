import { prisma } from "@/lib/prisma";

export async function getUserPrompts(userId: string) {
  return prisma.userPrompt.findMany({
    where: {
      userId,
    },
    orderBy: {
      displayOrder: "asc",
    },
    select: {
      id: true,
      prompt: true,
      response: true,
      displayOrder: true,
    },
  });
}
