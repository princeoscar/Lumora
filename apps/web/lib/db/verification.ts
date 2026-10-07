import { prisma } from "@/lib/prisma";
import type { VerificationType } from "@/lib/generated/prisma";

export async function getCurrentVerification(userId: string) {
  return prisma.verification.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getVerificationHistory(userId: string) {
  return prisma.verification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function submitVerification(
  userId: string,
  type: VerificationType,
) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      verificationStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.verificationStatus === "VERIFIED") {
    throw new Error("User is already verified.");
  }

  const existingPendingVerification = await prisma.verification.findFirst({
    where: {
      userId,
      type,
      status: "PENDING",
    },
  });

  if (existingPendingVerification) {
    return existingPendingVerification;
  }

  return prisma.$transaction(async (tx) => {
    const verification = await tx.verification.create({
      data: {
        userId,
        type,
        status: "PENDING",
      },
    });

    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        verificationStatus: "PENDING",
      },
    });

    return verification;
  });
}
