import { prisma } from "@/lib/prisma";

export async function getAllInterests() {
  return prisma.interest.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}

export async function getUserInterestIds(userId: string) {
  const userInterests = await prisma.userInterest.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      interestId: true,
    },
  });

  return userInterests.map((userInterest) => userInterest.interestId);
}
