"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const deleteProfileMediaSchema = z.object({
  mediaId: z.string().trim().min(1),
});

export async function deleteProfileMedia(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = deleteProfileMediaSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "The photo information is invalid.",
    };
  }

  const { mediaId } = validation.data;

  try {
    const media = await prisma.userMedia.findFirst({
      where: {
        id: mediaId,
        userId: user.id,
        deletedAt: null,
      },
    });

    if (!media) {
      return {
        success: false,
        error: "That photo could not be found.",
      };
    }

    const expectedFolder = `lumora/profiles/${user.id}/`;

    if (!media.publicId.startsWith(expectedFolder)) {
      return {
        success: false,
        error: "This photo does not belong to your profile.",
      };
    }

    const cloudinaryResult = await cloudinary.uploader.destroy(media.publicId, {
      invalidate: true,
      resource_type: "image",
    });

    if (
      cloudinaryResult.result !== "ok" &&
      cloudinaryResult.result !== "not found"
    ) {
      return {
        success: false,
        error: "We couldn't remove the photo from Cloudinary.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userMedia.update({
        where: {
          id: media.id,
        },
        data: {
          deletedAt: new Date(),
          isProfilePhoto: false,
        },
      });

      if (media.isProfilePhoto) {
        const replacement = await tx.userMedia.findFirst({
          where: {
            userId: user.id,
            deletedAt: null,
            mediaType: "IMAGE",
            id: {
              not: media.id,
            },
          },
          orderBy: {
            displayOrder: "asc",
          },
        });

        if (replacement) {
          await tx.userMedia.update({
            where: {
              id: replacement.id,
            },
            data: {
              isProfilePhoto: true,
            },
          });
        }
      }
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to delete profile media:", error);

    return {
      success: false,
      error: "We couldn't delete your photo. Please try again.",
    };
  }
}
