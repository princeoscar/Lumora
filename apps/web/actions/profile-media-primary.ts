"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { prisma } from "@/lib/prisma";

const setPrimaryProfileMediaSchema = z.object({
  mediaId: z.string().trim().min(1),
});

export async function setPrimaryProfileMedia(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = setPrimaryProfileMediaSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "The selected photo information is invalid.",
    };
  }

  const { mediaId } = validation.data;

  try {
    const media = await prisma.userMedia.findFirst({
      where: {
        id: mediaId,
        userId: user.id,
        deletedAt: null,
        mediaType: "IMAGE",
      },
      select: {
        id: true,
        isProfilePhoto: true,
      },
    });

    if (!media) {
      return {
        success: false,
        error: "That photo could not be found.",
      };
    }

    if (media.isProfilePhoto) {
      return {
        success: true,
      };
    }

    await prisma.$transaction([
      prisma.userMedia.updateMany({
        where: {
          userId: user.id,
          deletedAt: null,
          mediaType: "IMAGE",
          isProfilePhoto: true,
        },
        data: {
          isProfilePhoto: false,
        },
      }),
      prisma.userMedia.update({
        where: {
          id: media.id,
        },
        data: {
          isProfilePhoto: true,
        },
      }),
    ]);

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to set primary profile photo:", error);

    return {
      success: false,
      error: "We couldn't update your primary photo. Please try again.",
    };
  }
}
