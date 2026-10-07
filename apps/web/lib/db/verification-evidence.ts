import { prisma } from "@/lib/prisma";
import type { VerificationEvidenceType } from "@/lib/generated/prisma";

export async function createVerificationEvidence(
  userId: string,
  verificationId: string,
  type: VerificationEvidenceType,
  publicId: string,
  resourceType = "image",
  mimeType?: string,
  fileSize?: number,
) {
  const verification = await prisma.verification.findFirst({
    where: {
      id: verificationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!verification) {
    throw new Error("Verification not found.");
  }

  return prisma.verificationEvidence.create({
    data: {
      verificationId,
      type,
      publicId,
      resourceType,
      mimeType,
      fileSize,
    },
  });
}

export async function getVerificationEvidence(
  userId: string,
  verificationId: string,
) {
  const verification = await prisma.verification.findFirst({
    where: {
      id: verificationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!verification) {
    throw new Error("Verification not found.");
  }

  return prisma.verificationEvidence.findMany({
    where: {
      verificationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
