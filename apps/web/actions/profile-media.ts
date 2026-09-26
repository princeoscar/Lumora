"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { prisma } from "@/lib/prisma";

const profileMediaSchema = z.object({
  publicId: z.string().trim().min(1).max(500),
  secureUrl: z.url(),
  resourceType: z.literal("image"),
});

export async function addProfileMedia(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = profileMediaSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "The uploaded image information is invalid.",
    };
  }

  const { publicId, secureUrl } = validation.data;

  const expectedFolder = `lumora/profiles/${user.id}/`;

  if (!publicId.startsWith(expectedFolder)) {
    return {
      success: false,
      error: "This image does not belong to your profile.",
    };
  }

  try {
    const mediaCount = await prisma.userMedia.count({
      where: {
        userId: user.id,
        deletedAt: null,
      },
    });

    const media = await prisma.userMedia.create({
      data: {
        userId: user.id,
        url: secureUrl,
        publicId,
        mediaType: "IMAGE",
        isProfilePhoto: mediaCount === 0,
        isVerified: false,
        displayOrder: mediaCount,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
      media,
    };
  } catch (error) {
    console.error("❌ Failed to save profile media:", error);

    return {
      success: false,
      error: "We couldn't save this photo to your profile. Please try again.",
    };
  }
}
