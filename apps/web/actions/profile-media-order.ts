"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { prisma } from "@/lib/prisma";

const reorderProfileMediaSchema = z.object({
  mediaId: z.string().trim().min(1),
  direction: z.enum(["UP", "DOWN"]),
});

export async function reorderProfileMedia(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = reorderProfileMediaSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error: "The photo ordering information is invalid.",
    };
  }

  const { mediaId, direction } = validation.data;

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
        displayOrder: true,
      },
    });

    if (!media) {
      return {
        success: false,
        error: "That photo could not be found.",
      };
    }

    const neighbour = await prisma.userMedia.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
        mediaType: "IMAGE",
        displayOrder:
          direction === "UP" ? media.displayOrder - 1 : media.displayOrder + 1,
      },
      select: {
        id: true,
        displayOrder: true,
      },
    });

    if (!neighbour) {
      return {
        success: true,
      };
    }

    await prisma.$transaction([
      prisma.userMedia.update({
        where: {
          id: media.id,
        },
        data: {
          displayOrder: neighbour.displayOrder,
        },
      }),
      prisma.userMedia.update({
        where: {
          id: neighbour.id,
        },
        data: {
          displayOrder: media.displayOrder,
        },
      }),
    ]);

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to reorder profile media:", error);

    return {
      success: false,
      error: "We couldn't reorder your photos. Please try again.",
    };
  }
}
