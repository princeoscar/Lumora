import { prisma } from "@/lib/prisma";

type VerificationReviewDecision = "APPROVE" | "REJECT";

export async function reviewVerification(
  verificationId: string,
  decision: VerificationReviewDecision,
  rejectionReason?: string,
) {
  const verification = await prisma.verification.findUnique({
    where: {
      id: verificationId,
    },
    select: {
      id: true,
      userId: true,
      status: true,
    },
  });

  if (!verification) {
    throw new Error("Verification not found.");
  }

  if (verification.status !== "PENDING") {
    throw new Error("Verification is no longer pending.");
  }

  if (decision === "REJECT" && !rejectionReason?.trim()) {
    throw new Error("A rejection reason is required.");
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updatedVerification = await tx.verification.update({
      where: {
        id: verification.id,
      },
      data: {
        status: decision === "APPROVE" ? "VERIFIED" : "REJECTED",
        reviewedAt: now,
        rejectionReason:
          decision === "APPROVE" ? null : rejectionReason!.trim(),
      },
    });

    await tx.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        verificationStatus: decision === "APPROVE" ? "VERIFIED" : "UNVERIFIED",
      },
    });

    return updatedVerification;
  });
}
