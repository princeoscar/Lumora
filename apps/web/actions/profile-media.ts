"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { MAX_PROFILE_PHOTOS } from "@/lib/profile/constants";

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

  const { publicId } = validation.data;

  const expectedFolder = `lumora/profiles/${user.id}/`;

  if (!publicId.startsWith(expectedFolder)) {
    return {
      success: false,
      error: "This image does not belong to your profile.",
    };
  }

  try {
    const cloudinaryResource = await cloudinary.api.resource(publicId, {
      resource_type: "image",
      type: "upload",
    });

    if (
      cloudinaryResource.public_id !== publicId ||
      cloudinaryResource.resource_type !== "image" ||
      cloudinaryResource.type !== "upload" ||
      !cloudinaryResource.secure_url
    ) {
      return {
        success: false,
        error: "We couldn't verify this uploaded image.",
      };
    }

    const mediaCount = await prisma.userMedia.count({
      where: {
        userId: user.id,
        deletedAt: null,
        mediaType: "IMAGE",
      },
    });

    if (mediaCount >= MAX_PROFILE_PHOTOS) {
      return {
        success: false,
        error: `You can have up to ${MAX_PROFILE_PHOTOS} profile photos.`,
      };
    }

    const lastMedia = await prisma.userMedia.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
        mediaType: "IMAGE",
      },
      orderBy: {
        displayOrder: "desc",
      },
      select: {
        displayOrder: true,
      },
    });

    const nextDisplayOrder = (lastMedia?.displayOrder ?? -1) + 1;

    const media = await prisma.userMedia.create({
      data: {
        userId: user.id,
        url: cloudinaryResource.secure_url,
        publicId: cloudinaryResource.public_id,
        mediaType: "IMAGE",
        isProfilePhoto: mediaCount === 0,
        isVerified: false,
        displayOrder: nextDisplayOrder,
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
