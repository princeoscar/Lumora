"use server";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { cloudinary, cloudinaryConfig } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

type VerificationEvidenceType = "SELFIE" | "IDENTITY_DOCUMENT";

const VALID_EVIDENCE_TYPES: VerificationEvidenceType[] = [
  "SELFIE",
  "IDENTITY_DOCUMENT",
];

export async function getVerificationEvidenceUploadSignature(
  verificationId: string,
  type: VerificationEvidenceType,
) {
  const user = await requireCurrentUserWithProfile();

  if (!VALID_EVIDENCE_TYPES.includes(type)) {
    return {
      success: false,
      error: "Invalid verification evidence type.",
    };
  }

  const verification = await prisma.verification.findFirst({
    where: {
      id: verificationId,
      userId: user.id,
      status: "PENDING",
    },
    select: {
      id: true,
    },
  });

  if (!verification) {
    return {
      success: false,
      error: "Verification request not found or is no longer pending.",
    };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `lumora/verifications/${verification.id}`;

  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    cloudinaryConfig.api_secret,
  );

  return {
    success: true,
    cloudName: cloudinaryConfig.cloud_name,
    apiKey: cloudinaryConfig.api_key,
    timestamp,
    folder,
    signature,
  };
}
