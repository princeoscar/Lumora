"use server";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { createVerificationEvidence } from "@/lib/db/verification-evidence";
import { cloudinary, cloudinaryConfig } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

type VerificationEvidenceType = "SELFIE" | "IDENTITY_DOCUMENT";

const VALID_EVIDENCE_TYPES: VerificationEvidenceType[] = [
  "SELFIE",
  "IDENTITY_DOCUMENT",
];

function getMimeType(format?: string) {
  if (!format) {
    return undefined;
  }

  if (format === "jpg" || format === "jpeg") {
    return "image/jpeg";
  }

  if (format === "png") {
    return "image/png";
  }

  if (format === "webp") {
    return "image/webp";
  }

  if (format === "heic") {
    return "image/heic";
  }

  if (format === "heif") {
    return "image/heif";
  }

  return `image/${format}`;
}

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

export async function saveVerificationEvidence(
  verificationId: string,
  type: VerificationEvidenceType,
  publicId: string,
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

  const expectedFolder = `lumora/verifications/${verification.id}/`;

  if (!publicId.startsWith(expectedFolder)) {
    return {
      success: false,
      error: "Invalid verification evidence location.",
    };
  }

  try {
    const resource = await cloudinary.api.resource(publicId, {
      resource_type: "image",
      type: "upload",
    });

    if (resource.public_id !== publicId) {
      return {
        success: false,
        error: "Cloudinary resource could not be verified.",
      };
    }

    if (resource.resource_type !== "image" || resource.type !== "upload") {
      return {
        success: false,
        error: "Invalid Cloudinary resource.",
      };
    }

    const evidence = await createVerificationEvidence(
      user.id,
      verification.id,
      type,
      resource.public_id,
      resource.resource_type,
      getMimeType(resource.format),
      resource.bytes,
    );

    return {
      success: true,
      evidenceId: evidence.id,
    };
  } catch {
    return {
      success: false,
      error: "Unable to verify the uploaded evidence.",
    };
  }
}
