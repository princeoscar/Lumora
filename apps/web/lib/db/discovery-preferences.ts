import { prisma } from "@/lib/prisma";

export async function getDiscoveryPreferencesByUserId(userId: string) {
  return prisma.discoveryPreference.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
      userId: true,
      minAge: true,
      maxAge: true,
      interestedInGenders: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
