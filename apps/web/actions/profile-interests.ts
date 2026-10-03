"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCurrentUserWithProfile } from "@/lib/auth/require-current-user-with-profile";
import { prisma } from "@/lib/prisma";

const updateProfileInterestsSchema = z.object({
  interestIds: z
    .array(z.string().trim().min(1))
    .max(10, "You can choose up to 10 interests."),
});

export async function updateProfileInterests(input: unknown) {
  const user = await requireCurrentUserWithProfile();

  const validation = updateProfileInterestsSchema.safeParse(input);

  if (!validation.success) {
    return {
      success: false,
      error:
        validation.error.issues[0]?.message ??
        "Your interests selection is invalid.",
    };
  }

  const { interestIds } = validation.data;
  const uniqueInterestIds = [...new Set(interestIds)];

  if (uniqueInterestIds.length !== interestIds.length) {
    return {
      success: false,
      error: "Each interest can only be selected once.",
    };
  }

  try {
    const existingInterests = await prisma.interest.findMany({
      where: {
        id: {
          in: uniqueInterestIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingInterests.length !== uniqueInterestIds.length) {
      return {
        success: false,
        error: "One or more selected interests are invalid.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.userInterest.deleteMany({
        where: {
          userId: user.id,
        },
      });

      if (uniqueInterestIds.length > 0) {
        await tx.userInterest.createMany({
          data: uniqueInterestIds.map((interestId) => ({
            userId: user.id,
            interestId,
          })),
        });
      }
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ Failed to update profile interests:", error);

    return {
      success: false,
      error: "We couldn't update your interests. Please try again.",
    };
  }
}