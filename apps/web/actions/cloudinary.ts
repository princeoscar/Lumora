"use server";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { cloudinary, cloudinaryConfig } from "@/lib/cloudinary";

export async function getProfileUploadSignature() {
  const user = await requireCurrentUserWithProfile();

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `lumora/profiles/${user.id}`;

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
